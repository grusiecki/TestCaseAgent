# Edit Project Feature

This folder contains the implementation of the "Edit Project" feature, which allows users to edit existing test cases in a project.

## Architecture

The edit project feature follows the same architecture as the generate-details feature:

### Components

- **EditProjectView.tsx**: Main view component that orchestrates the editing flow
  - Displays loading state while fetching test cases
  - Shows error fallback if loading fails
  - Renders navigation and test case editing interface

### Hooks

- **useEditProject.ts**: Main hook that manages the editing state
  - Fetches test cases via GET `/api/projects/:projectId`
  - Manages local state with autosave to localStorage
  - Tracks dirty state for each modified test case
  - Updates test cases via PUT `/api/projects/:projectId/testcases/:id`
  - Redirects to export view after saving

### Re-used Components

The following components from `generate-details` are re-used:

- **TestCaseList**: Displays test cases and handles navigation
- **TestCaseItem**: Individual test case editor with preconditions, steps, expected result
- **NavigationButtons**: Previous/Next/Finish navigation
- **ProgressIndicator**: Shows current progress (X of Y test cases)
- **ErrorFallback**: Error display with retry button
- **useTestCaseNavigation**: Navigation logic hook
- **useAutosave**: Autosave to localStorage hook

## Flow

1. User clicks "Edit" button on a project card in dashboard
2. Navigate to `/projects/:projectId/edit`
3. Load test cases from database via GET request
4. Display test cases with same navigation UI as generate-details
5. User edits test cases (changes are auto-saved to localStorage)
6. When user clicks "Finish & Export":
   - Send PUT requests only for modified (dirty) test cases
   - Clear autosave data
   - Navigate to `/projects/:projectId/export`

## Differences from Generate Details

- **No AI generation**: Test cases are loaded from database, not generated
- **Selective updates**: Only modified test cases are sent to the server
- **Dirty tracking**: Each test case has `isDirty` flag to track changes
- **Separate autosave key**: Uses `editProjectTestCases_${projectId}` to avoid conflicts

## API Integration

- **GET** `/api/projects/:projectId` - Fetch project with test cases
- **PUT** `/api/projects/:projectId/testcases` - Atomic bulk update via PostgreSQL function

### Bulk Update with Database-Level Atomicity

The edit feature uses a PostgreSQL function for TRUE atomic bulk updates:

**Request:**
```json
PUT /api/projects/:projectId/testcases
[
  { "id": "uuid1", "title": "...", "steps": "...", ... },
  { "id": "uuid2", "title": "...", "steps": "...", ... }
]
```

**Backend Flow:**
1. Endpoint validates input (max 20 test cases)
2. Calls `bulk_update_test_cases()` PostgreSQL function
3. Function executes ALL updates in single transaction
4. Verifies project ownership at database level
5. Returns updated test cases or rolls back on error

**Response:**
```json
{
  "success": true,
  "successCount": 5,
  "failCount": 0,
  "results": [...]
}
```

**Benefits:**
- ✅ TRUE atomicity: All succeed or all fail (transaction)
- ✅ No race conditions with database triggers
- ✅ 4x faster than individual requests (~300-500ms)
- ✅ Single network round-trip
- ✅ Authorization enforced at DB level
- ✅ Works with any number of changes (0-20)

**Implementation Details:**
- Database: `supabase/migrations/20251113200000_add_bulk_update_test_cases_function.sql`
- Service: `TestCaseService.bulkUpdateTestCases()`
- Documentation: See `IMPLEMENTATION_COMPLETE.md` and `BULK_UPDATE_SOLUTION.md`

