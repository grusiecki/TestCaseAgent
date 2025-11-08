# Test Suite Documentation: validateProject()

## Overview

This test suite provides comprehensive unit testing for the `validateProject()` function, which validates `ProjectDTO` objects according to business rules and type constraints.

## Test Statistics

- **Total Tests**: 74
- **Test Categories**: 11
- **Coverage**: All validation paths and edge cases

## Test Categories

### 1. Valid Project Data (12 tests)
Tests that verify the function accepts valid project data:
- Valid complete project objects
- Null rating values (optional field)
- Zero and negative ratings
- Zero and large test case counts
- Empty and very long project names
- Special characters and Unicode in names
- Various ISO date formats
- Floating point ratings

**Key Business Rules Tested:**
- `rating` can be `null` (project not yet rated)
- `testCaseCount` can be `0` (new project)
- Project names support internationalization (Unicode)
- Various date formats are accepted (ISO 8601 compliance)

### 2. Invalid Project Structure (7 tests)
Tests that verify proper rejection of non-object inputs:
- `null` and `undefined` inputs
- Primitive types (string, number, boolean)
- Arrays (treated as objects in JavaScript)
- Empty objects

**Key Business Rules Tested:**
- Only objects can be valid projects
- Early validation prevents processing invalid data

### 3. Invalid ID Field (6 tests)
Tests for the `id` field validation:
- Missing, null, or undefined values
- Wrong types (number, object, array)
- Empty strings (accepted as valid)

**Key Business Rules Tested:**
- `id` must be a string (UUID or similar)
- Empty string IDs are technically valid (edge case)

### 4. Invalid Name Field (6 tests)
Tests for the `name` field validation:
- Missing, null, or undefined values
- Wrong types (number, object, array, boolean)

**Key Business Rules Tested:**
- `name` is required and must be a string
- No length restrictions enforced at validation level

### 5. Invalid created_at Field (8 tests)
Tests for the `created_at` field validation:
- Missing or null values
- Wrong types (number, object, Date object)
- Invalid date strings
- Empty strings
- Malformed ISO strings

**Key Business Rules Tested:**
- `created_at` must be a valid ISO 8601 date string
- Date objects are not accepted (must be serialized)
- Validation uses `Date.parse()` for compatibility

### 6. Invalid Rating Field (8 tests)
Tests for the `rating` field validation:
- Wrong types (string, object, array, boolean)
- `undefined` values (not allowed, use `null` instead)
- Special numeric values (NaN, Infinity, -Infinity)

**Key Business Rules Tested:**
- `rating` must be `number | null`
- `undefined` is not valid (explicit `null` required)
- NaN and Infinity are technically valid (typeof check)

### 7. Invalid testCaseCount Field (10 tests)
Tests for the `testCaseCount` field validation:
- Missing, null, or undefined values
- Wrong types (string, object, array, boolean)
- Negative values (accepted)
- Floating point values (accepted)
- Special numeric values (NaN, Infinity)

**Key Business Rules Tested:**
- `testCaseCount` is required and must be a number
- No range validation (negative values accepted)
- Floating point values accepted (no integer constraint)

### 8. Edge Cases and Type Coercion (6 tests)
Tests for unusual but valid scenarios:
- Objects with extra fields (ignored)
- Validation order (fails on first error)
- Objects with Symbol properties
- Frozen and sealed objects
- Objects with null prototype

**Key Business Rules Tested:**
- Extra fields are ignored (forward compatibility)
- Validation fails fast (first error thrown)
- Works with immutable objects

### 9. Type Guard Behavior (2 tests)
Tests for TypeScript type narrowing:
- Type guard narrows `unknown` to `ProjectDTO`
- Safe type assertion after validation

**Key Business Rules Tested:**
- Function acts as proper TypeScript type guard
- Enables type-safe code after validation

### 10. ValidationError Properties (3 tests)
Tests for error handling:
- Error has correct `name` property
- Error is instance of `Error`
- Error messages are preserved

**Key Business Rules Tested:**
- Custom error type for validation failures
- Error messages are descriptive and specific
- Proper error inheritance chain

### 11. Real-world Scenarios (5 tests)
Tests for practical use cases:
- Valid API response data
- New project with no rating
- Large project with many test cases
- Malformed API response
- Incomplete API response

**Key Business Rules Tested:**
- Handles typical API response structures
- Validates real-world data patterns
- Catches common API errors

## Edge Cases Covered

### Boundary Values
- Empty strings for `id` and `name`
- Zero values for `rating` and `testCaseCount`
- Negative values for numeric fields
- Very large numbers (999999)
- Special numeric values (NaN, Infinity, -Infinity)

### Type System Edge Cases
- `null` vs `undefined` distinction
- Arrays as objects
- Date objects vs date strings
- Frozen/sealed objects
- Objects with null prototype
- Symbol properties

### Data Format Edge Cases
- Various ISO 8601 date formats
- Unicode and special characters in strings
- Very long strings (1000+ characters)
- Floating point numbers

## Business Rules Summary

1. **Required Fields**: `id`, `name`, `created_at`, `rating`, `testCaseCount`
2. **Optional Values**: `rating` can be `null`
3. **Type Constraints**:
   - `id`: string
   - `name`: string
   - `created_at`: valid ISO 8601 date string
   - `rating`: number | null
   - `testCaseCount`: number
4. **No Range Validation**: Negative numbers and extreme values are accepted
5. **No Length Validation**: Strings can be any length (including empty)
6. **Fail-Fast**: Validation stops at first error
7. **Extra Fields**: Ignored (forward compatibility)

## Running the Tests

```bash
# Run all validation tests
npm run test -- src/components/dashboard/utils/__tests__/validation.test.ts

# Run with coverage
npm run test -- --coverage src/components/dashboard/utils/__tests__/validation.test.ts

# Run in watch mode
npm run test -- --watch src/components/dashboard/utils/__tests__/validation.test.ts

# Run specific test suite
npm run test -- -t "Invalid rating field"
```

## Test Maintenance

When modifying the `validateProject()` function:

1. **Adding New Fields**: Add tests for valid/invalid values
2. **Changing Validation Logic**: Update corresponding test expectations
3. **Adding Business Rules**: Add new test cases to document the rules
4. **Deprecating Fields**: Keep tests but mark as deprecated in comments

## Notes

- Tests use inline snapshots for better readability
- Helper function `createValidProject()` provides baseline valid data
- Each test is independent and can run in isolation
- Tests follow Arrange-Act-Assert pattern
- Descriptive test names document expected behavior

