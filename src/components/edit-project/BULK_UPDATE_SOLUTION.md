# Bulk Update Solution - Race Condition Fixed

## Problem (Before)

Individual PUT requests for each test case caused race conditions with the database trigger:

```
Request 1 PUT /testcases/id1  [====] ❌ FAIL
Request 2 PUT /testcases/id2    [====] ❌ FAIL  } Race condition
Request 3 PUT /testcases/id3      [====] ❌ FAIL } with trigger

Error: tuple to be updated was already modified by an operation 
triggered by the current command (Code: 27000)
```

### Failed Solutions Tried:

1. ❌ **Sequential requests** - Still overlapped due to async nature
2. ❌ **Sequential with 200ms delay** - Worked but slow (1+ second overhead)

## Solution (Current)

**Single bulk update request** that updates all changed test cases at once.

### Architecture

#### Frontend: `useEditProject` hook
```typescript
// Collect all dirty test cases
const dirtyTestCases = state.testCases.filter(tc => tc.isDirty);

// Single bulk request
const response = await fetch(`/api/projects/${projectId}/testcases`, {
  method: 'PUT',
  body: JSON.stringify([
    { id: 'tc1', title: '...', steps: '...', ... },
    { id: 'tc2', title: '...', steps: '...', ... },
    // ... all changed test cases
  ])
});
```

#### Backend: `/api/projects/[projectId]/testcases` (PUT)
```typescript
// Validate array of test cases (0-20 max)
const bulkUpdateSchema = z.array(
  z.object({
    id: z.string().uuid(),
    title: z.string().optional(),
    // ... other fields
  })
).min(0).max(20);

// Use PostgreSQL function for ATOMIC bulk update
const updatedTestCases = await testCaseService.bulkUpdateTestCases(
  projectId,
  userId,
  validatedData
);

// All succeed or all fail (atomicity)
{ successCount, failCount: 0, results }
```

#### Database: PostgreSQL Function
```sql
-- Atomic transaction handles all updates at once
CREATE FUNCTION bulk_update_test_cases(
  p_project_id uuid,
  p_user_id uuid,
  p_test_cases test_case_update_input[]
)
-- Updates happen in single transaction
-- No race condition with triggers
-- True atomicity at database level
```

## Advantages

| Aspect | Individual Requests | Bulk Update (PostgreSQL Function) |
|--------|-------------------|-------------|
| **Requests** | N requests | 1 request |
| **Speed** | ~2s for 5 items | ~300-500ms for 5 items |
| **Race Condition** | ❌ Yes | ✅ No |
| **Complexity** | High (delays) | Low (simple) |
| **Atomicity** | ❌ No | ✅ True DB-level atomicity |
| **Network** | N round-trips | 1 round-trip |
| **Error Handling** | Complex | All-or-nothing |
| **Trigger Safety** | ❌ Conflicts | ✅ Single transaction |

## Edge Cases Handled

✅ **0 changes**: Empty array `[]` → No updates, immediate success
✅ **1 change**: Array with 1 item → Single UPDATE in transaction
✅ **All changed**: Array with all items → All UPDATE in single transaction
✅ **Any failure**: Transaction rolls back, all fail together (atomicity)
✅ **Validation**: Max 20 test cases per project enforced
✅ **Authorization**: Verifies project ownership at database level
✅ **Deleted items**: Skips soft-deleted test cases automatically

## Response Format

### Success (200) - All Updates Succeeded
```json
{
  "success": true,
  "successCount": 5,
  "failCount": 0,
  "results": [
    { "id": "tc1", "success": true, "data": {...} },
    { "id": "tc2", "success": true, "data": {...} }
  ]
}
```

### Failure (500) - Transaction Rolled Back
```json
{
  "success": false,
  "successCount": 0,
  "failCount": 5,
  "error": "Failed to bulk update test cases: <detailed error>"
}
```

**Note**: With true atomicity, there's no partial success. Either all updates succeed (200) or the entire transaction rolls back and all fail (500).

## Performance Comparison

### Before (Sequential with delay)
```
Request 1 [200ms] → delay 200ms
Request 2 [200ms] → delay 200ms
Request 3 [200ms] → delay 200ms
Request 4 [200ms] → delay 200ms
Request 5 [200ms]
Total: ~2000ms
```

### After (Bulk update)
```
Bulk Request [500ms]
Total: ~500ms
```

**4x faster!** ⚡

## Migration Notes

- Old endpoint still exists: `PUT /api/projects/[projectId]/testcases/[id]`
- New endpoint: `PUT /api/projects/[projectId]/testcases` (no [id])
- Edit feature uses new bulk endpoint
- Other features can migrate gradually

