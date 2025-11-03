// DTO and Command Model definitions for the API.
// These types are based on the database models defined in src/db/database.types.ts
// and the API plan specifications from the API plan document.

// ----------------------
// Project Related Types
// ----------------------

// Represents a summary of a Project.
// Maps to the "projects" table in the database.
// Transforms "final_score" to "rating" and adds a computed "testCaseCount".
export interface ProjectDTO {
  id: string; // corresponds to projects.Row.id
  name: string; // corresponds to projects.Row.name
  created_at: string; // corresponds to projects.Row.created_at
  rating: number | null; // mapped from projects.Row.final_score
  testCaseCount: number; // computed count of test cases associated with the project
}

// Wrapper for the paginated list of projects.
export interface ProjectsListResponse {
  projects: ProjectDTO[];
  page: number;
  limit: number;
  total: number;
}

// Detailed view of a Project including its test cases.
export interface ProjectDetailsDTO extends Pick<ProjectDTO, "id" | "name" | "created_at" | "rating"> {
  testCases: TestCaseDTO[];
}

// Command model for creating a new project.
// Based on the POST /projects endpoint.
export interface CreateProjectCommand {
  name: string;
  initialTitles?: string[]; // optional initial input for test case titles (legacy)
  testCases?: {
    title: string;
    preconditions: string;
    steps: string;
    expected_result: string;
    order_index: number;
  }[]; // complete test cases with details
}

// Command model for updating project details.
// Based on the PUT /projects/:id endpoint.
export interface UpdateProjectCommand {
  name?: string;
  // Additional updateable project metadata fields can be added here.
}

// ----------------------
// Test Case Related Types
// ----------------------

// Represents a Test Case.
// Maps to the "test_cases" table in the database.
export interface TestCaseDTO {
  id: string; // corresponds to test_cases.Row.id
  title: string; // corresponds to test_cases.Row.title
  order_index: number; // corresponds to test_cases.Row.order_index
  preconditions: string | null; // corresponds to test_cases.Row.preconditions
  steps: string; // corresponds to test_cases.Row.steps
  expected_result: string; // corresponds to test_cases.Row.expected_result
}

// Command model for creating a new test case.
// Based on the POST /projects/:projectId/testcases endpoint.
export interface CreateTestCaseCommand {
  title: string;
  preconditions?: string | null;
  steps: string;
  expected_result: string;
  order_index: number;
}

// Command model for updating an existing test case.
// Based on the PUT /projects/:projectId/testcases/:id endpoint.
export interface UpdateTestCaseCommand {
  title?: string;
  preconditions?: string | null;
  steps?: string;
  expected_result?: string;
  order_index?: number;
}

// ----------------------
// AI Generation Related Types
// ----------------------

// Command model for generating test case titles.
// Based on the POST /ai/generate-titles endpoint.
export interface GenerateTitlesCommand {
  documentation: string;
  projectName?: string;
}

// DTO for the response of generated test case titles.
export interface TitlesDTO {
  titles: string[];
}

// Command model for generating test case details.
// Based on the POST /ai/generate-details endpoint.
export interface GenerateDetailsCommand {
  title: string;
  context: string;
  projectName: string;
  documentation: string;
  testCaseIndex: number;
  totalTestCases: number;
}

// DTO for the response containing test case details.
export interface TestCaseDetailsDTO {
  preconditions: string;
  steps: string;
  expected_result: string;
}
