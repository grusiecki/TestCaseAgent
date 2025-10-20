# REST API Plan

## 1. Resources
- **Users**: Represents application users. Linked to authentication (Supabase Auth) and required for Row-Level Security (RLS).
- **Projects**: Corresponds to the Projects table. Each project belongs to one user and stores attributes such as name, creation date, and final rating. It also implements soft delete via a `deleted_at` column.
- **TestCases**: Represents the Test Cases table. Each test case is linked to a project, contains attributes such as title, preconditions, steps, expected result, and an `order_index` for navigation. It also implements soft delete via a `deleted_at` column.

## 2. Endpoints

### Projects

- **GET /projects**
  - Description: Retrieve a paginated list of projects for the current user.
  - Query Parameters: `page`, `limit`, `sort` (e.g. by creation date or rating)
  - Success Response: `{ "projects": [{ "id": "uuid", "name": "Project Name", "created_at": "timestamp", "rating": number, "testCaseCount": number }], "page": number, "limit": number, "total": number }`
  - Error Codes: 401 Unauthorized, 500 Internal Server Error

- **POST /projects**
  - Description: Create a new project.
  - Request Body (JSON):
    ```json
    {
      "name": "Project Name",
      "initialTitles": ["Title 1", "Title 2", ...] // optional initial input of test case titles
    }
    ```
  - Success Response: `{ "id": "uuid", "name": "Project Name", "created_at": "timestamp" }`
  - Error Codes: 400 Bad Request (e.g., if number of initial titles exceeds allowed limit of 20), 401 Unauthorized

- **GET /projects/:id**
  - Description: Retrieve details of a specific project, including its test cases.
  - Success Response: 
    ```json
    {
      "id": "uuid",
      "name": "Project Name",
      "created_at": "timestamp",
      "rating": number,
      "testCases": [{ "id": "uuid", "title": "Test Case Title", "order_index": number }]
    }
    ```
  - Error Codes: 401 Unauthorized, 404 Not Found

- **PUT /projects/:id**
  - Description: Update project details.
  - Request Body (JSON): Possible update fields such as `name` or changes in project meta data.
  - Success Response: Updated project object.
  - Error Codes: 400 Bad Request, 401 Unauthorized, 404 Not Found

- **DELETE /projects/:id**
  - Description: Soft delete a project (set `deleted_at` instead of hard delete).
  - Success Response: `{ "message": "Project deleted successfully" }`
  - Error Codes: 401 Unauthorized, 404 Not Found

### TestCases

- **GET /projects/:projectId/testcases**
  - Description: Retrieve all test cases for a given project, with support for pagination, filtering, and sorting by `order_index`.
  - Query Parameters: `page`, `limit`, `sort`
  - Success Response: 
    ```json
    {
      "testCases": [
        { "id": "uuid", "title": "Test Case Title", "order_index": number, "preconditions": "...", "steps": "...", "expected_result": "..." }
      ],
      "page": number,
      "limit": number,
      "total": number
    }
    ```
  - Error Codes: 401 Unauthorized, 404 Not Found

- **POST /projects/:projectId/testcases**
  - Description: Create a new test case under a project.
  - Request Body (JSON): 
    ```json
    {
      "title": "Test Case Title",
      "preconditions": "Preconditions text",
      "steps": "Steps text",
      "expected_result": "Expected result text",
      "order_index": number
    }
    ```
  - Business Rule: Enforce a maximum of 20 test cases per session/project as per application logic.
  - Success Response: Created test case object.
  - Error Codes: 400 Bad Request (e.g., if exceeding limit), 401 Unauthorized, 404 Not Found

- **GET /projects/:projectId/testcases/:id**
  - Description: Get detailed information on a single test case.
  - Success Response: 
    ```json
    {
      "id": "uuid",
      "title": "Test Case Title",
      "preconditions": "...",
      "steps": "...",
      "expected_result": "...",
      "order_index": number
    }
    ```
  - Error Codes: 401 Unauthorized, 404 Not Found

- **PUT /projects/:projectId/testcases/:id**
  - Description: Update a test case.
  - Request Body (JSON): Any updateable fields of the test case.
  - Success Response: Updated test case object.
  - Error Codes: 400 Bad Request, 401 Unauthorized, 404 Not Found

- **DELETE /projects/:projectId/testcases/:id**
  - Description: Soft delete a test case (set `deleted_at`).
  - Success Response: `{ "message": "Test case deleted successfully" }`
  - Error Codes: 401 Unauthorized, 404 Not Found

### AI Generation Endpoints

- **POST /ai/generate-titles**
  - Description: Generate test case titles based on provided documentation input.
  - Request Body (JSON):
    ```json
    {
      "documentation": "Full text (100-5000 chars)",
      "projectName": "Optional project name"
    }
    ```
  - Business Logic: Ensure the generated titles count is between 1 and 20. If count is 0, return an appropriate message with an option to retry.
  - Success Response: 
    ```json
    { "titles": [ "Title 1", "Title 2", ... ] }
    ```
  - Error Codes: 400 Bad Request (if validations fail), 401 Unauthorized, 422 Unprocessable Entity

- **POST /ai/generate-details**
  - Description: Generate detailed information (preconditions, steps, expected result) for a given test case title and context.
  - Request Body (JSON):
    ```json
    {
      "title": "Test Case Title",
      "context": "Full documentation or contextual information"
    }
    ```
  - Success Response: 
    ```json
    {
      "preconditions": "...",
      "steps": "...",
      "expected_result": "..."
    }
    ```
  - Error Codes: 400 Bad Request, 401 Unauthorized, 422 Unprocessable Entity

### CSV Export Endpoint

- **GET /projects/:id/export**
  - Description: Export all test cases for a given project in CSV format compatible with TestRail.
  - Response: CSV file download containing columns: Title, Steps, Expected Result, Preconditions.
  - Error Codes: 401 Unauthorized, 404 Not Found

## 3. Authentication and Authorization

- Use JWT tokens provided by Supabase Auth. Endpoints require the token in the `Authorization: Bearer <token>` header.
- Apply Row-Level Security (RLS) so that users only access their own data.
- Endpoints will return 401 Unauthorized if the token is invalid or missing.

## 4. Validation and Business Logic

- **Payload Validations**:
  - Documentation input must be between 100 and 5000 characters.
  - Title count for test cases must be between 1 and 20 per session, enforced in `/ai/generate-titles` and during test case creation.
  - Text fields (titles, preconditions, steps, expected result) may have length constraints which should be validated at the API layer.

- **Business Logic**:
  - Enforce soft delete by setting `deleted_at` rather than actually deleting records.
  - Use the `order_index` in test cases for navigation in the UI.
  - If AI returns 0 titles, the API will provide an appropriate message with an option to retry and manual add.
  - The CSV export endpoint formats data to match TestRail requirements.

- **Performance and Security Requirements**:
  - Indexes on key columns (e.g. `user_id` in Projects, `project_id` in TestCases) to optimize query performance.
  - Rate limiting and request throttling may be applied as needed to prevent abuse, especially for AI generation endpoints which could be resource heavy.
  - Timeout settings for AI calls (e.g. 2 minutes per call) to ensure responsiveness and proper error handling.

## Assumptions
- The API layer will serve as a thin layer interfacing with Supabase for database operations, while handling additional business logic at the application level.
- AI generation calls are managed via back-end services interfacing with Openrouter.ai, and their results are validated using JSON Schema.
- Local storage autosave is handled client-side, so the API only deals with final persisted data.


