/**
 * Test data fixtures for E2E and integration tests
 */

export const TEST_USERS = {
  valid: {
    email: process.env.TEST_USER_EMAIL || '',
    password: process.env.TEST_USER_PASSWORD || '',
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'WrongPassword',
  },
  newUser: {
    email: 'newuser@example.com',
    password: 'NewPassword123!',
  },
} as const;

export const TEST_DOCUMENTATION = {
  short: `
User Story: As a user, I want to login to the system.
Acceptance Criteria:
- User can enter email and password
- System validates credentials
- User is redirected to dashboard on success
`,
  medium: `
User Story: As a QA engineer, I want to create test cases from documentation.

Background:
The system should allow users to input documentation and generate test cases automatically.

Acceptance Criteria:
1. User can paste documentation between 100-5000 characters
2. System generates 1-20 test case titles
3. User can edit, add, or remove titles before generating details
4. System generates full test cases with preconditions, steps, and expected results
5. User can export test cases to CSV format compatible with TestRail

Technical Requirements:
- Input validation for character count
- AI integration for generation
- Local storage for autosave
- Rate limiting on API calls
`.repeat(3), // ~900 characters
  long: `
Epic: Test Case Management System

User Story 1: User Authentication
As a QA engineer, I want to securely login to the system so that I can access my test cases.

Acceptance Criteria:
- User can login with email and password
- System validates credentials against Supabase Auth
- Invalid credentials show error message
- Successful login redirects to dashboard
- Session persists for configured duration
- User can logout

User Story 2: Project Creation
As a QA engineer, I want to create a new project from documentation.

Acceptance Criteria:
- User can input documentation (100-5000 chars)
- Character counter shows remaining characters
- Submit button disabled until minimum reached
- System validates input before submission
- Error messages shown for invalid input

User Story 3: Test Case Title Generation
As a QA engineer, I want to generate test case titles from my documentation.

Acceptance Criteria:
- System generates 1-20 titles via AI
- Titles displayed in editable list
- User can remove individual titles
- User can add custom titles (max 20 total)
- Minimum 1 title required to proceed
- Loading state shown during generation
- Error handling for API failures

User Story 4: Test Case Detail Generation
As a QA engineer, I want to expand titles into full test cases.

Acceptance Criteria:
- System generates details for each title
- Details include: Preconditions, Steps, Expected Result
- User can navigate between test cases
- Edits are auto-saved to localStorage
- Generation progress tracked per test case
- User can manually edit any field
- Previous/Next navigation available

User Story 5: CSV Export
As a QA engineer, I want to export my test cases to TestRail format.

Acceptance Criteria:
- Export button available when all cases complete
- CSV format matches TestRail "Test Case (Text)"
- Headers: Title, Steps, Expected Result, Preconditions
- UTF-8 encoding
- Single-row format
- File downloads to user's device

User Story 6: Dashboard
As a QA engineer, I want to view all my projects.

Acceptance Criteria:
- Dashboard shows list of user's projects
- Projects show: name, date, test case count, rating
- Pagination for large project lists
- User can delete projects (soft delete)
- User can navigate to project details
- User can re-export projects
- Statistics displayed (total projects, test cases)
`.repeat(5), // ~4500+ characters
  withSpecialChars: `
User Story: As a tester, I want to validate "special" characters & symbols.

Acceptance Criteria:
- Input accepts: @#$%^&*()
- System handles: <>?":{}|
- Unicode support: 日本語, émojis 🎉
- Quotes: 'single' and "double"
- Line breaks and\ttabs
`,
  edgeCases: {
    minLength: 'A'.repeat(100), // Exactly 100 characters
    maxLength: 'B'.repeat(5000), // Exactly 5000 characters
    justBelowMin: 'C'.repeat(99), // Just below minimum
    justAboveMax: 'D'.repeat(5001), // Just above maximum
  },
} as const;

export const TEST_PROJECTS = {
  simple: {
    name: 'Simple Test Project',
    documentation: TEST_DOCUMENTATION.short,
    expectedTitleCount: 3,
  },
  complex: {
    name: 'Complex Test Project',
    documentation: TEST_DOCUMENTATION.medium,
    expectedTitleCount: 10,
  },
  maxTitles: {
    name: 'Max Titles Project',
    documentation: TEST_DOCUMENTATION.long,
    expectedTitleCount: 20,
  },
} as const;

export const MOCK_TITLES = [
  'Verify user can login with valid credentials',
  'Verify error message for invalid credentials',
  'Verify password reset functionality',
  'Verify session timeout after inactivity',
  'Verify logout functionality',
] as const;

export const MOCK_TEST_CASE = {
  title: 'Verify user can login with valid credentials',
  preconditions: 'User has valid account credentials',
  steps: '1. Navigate to login page\n2. Enter valid email\n3. Enter valid password\n4. Click login button',
  expectedResult: 'User is successfully logged in and redirected to dashboard',
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    resetPassword: '/api/auth/reset-password',
  },
  projects: {
    list: '/api/projects',
    create: '/api/projects',
    get: (id: string) => `/api/projects/${id}`,
    update: (id: string) => `/api/projects/${id}`,
    delete: (id: string) => `/api/projects/${id}`,
  },
  testCases: {
    list: (projectId: string) => `/api/projects/${projectId}/test-cases`,
    create: (projectId: string) => `/api/projects/${projectId}/test-cases`,
    update: (projectId: string, id: string) => `/api/projects/${projectId}/test-cases/${id}`,
  },
  ai: {
    generateTitles: '/api/ai/generate-titles',
    generateDetails: '/api/ai/generate-details',
  },
} as const;

