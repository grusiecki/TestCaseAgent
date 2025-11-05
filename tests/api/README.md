# API Tests

This directory is reserved for direct API testing using Playwright's API testing capabilities.

## Purpose

Test backend API endpoints directly without browser interaction:
- Faster than E2E tests
- Test edge cases and error handling
- Verify API contracts
- Load testing

## Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Projects API', () => {
  test('GET /api/projects returns project list', async ({ request }) => {
    const response = await request.get('/api/projects', {
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('projects');
  });
  
  test('POST /api/projects creates new project', async ({ request }) => {
    const response = await request.post('/api/projects', {
      data: {
        name: 'Test Project',
        documentation: 'Test documentation',
      },
    });
    
    expect(response.status()).toBe(201);
  });
});
```

## Running API Tests

```bash
# Run all API tests
npm run test:e2e -- tests/api/

# Run specific API test file
npm run test:e2e -- tests/api/projects.api.test.ts
```

## Guidelines

1. **Authentication**: Use test tokens or mock auth
2. **Data cleanup**: Delete test data after tests
3. **Error cases**: Test validation and error responses
4. **Rate limiting**: Test rate limit behavior
5. **Response format**: Verify JSON structure

## Fixtures

Use shared fixtures from `tests/fixtures/test-data.ts` for consistent test data.

