# Testing Documentation

This directory contains all test files and configurations for the Tester Agent application.

## Structure

```
tests/
├── setup.ts                 # Vitest global setup file
├── fixtures/                # Test data fixtures
│   └── test-data.ts        # Reusable test data
├── utils/                   # Testing utilities
│   └── test-helpers.ts     # Helper functions for tests
├── e2e/                     # End-to-End tests
│   ├── pages/              # Page Object Models
│   │   ├── BasePage.ts    # Base page with common methods
│   │   ├── LoginPage.ts   # Login page interactions
│   │   └── DashboardPage.ts # Dashboard page interactions
│   ├── auth.e2e.test.ts   # Authentication tests
│   └── dashboard.e2e.test.ts # Dashboard tests
└── api/                     # API integration tests (if needed)
```

## Test Types

### Unit Tests
Located in `src/**/__tests__/` alongside component/service files.

**Purpose**: Test individual functions, components, and services in isolation.

**Run with**:
```bash
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:ui           # Visual UI mode
npm run test:coverage     # With coverage report
```

**Example**:
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Integration Tests
Located in `src/**/__tests__/*.integration.test.ts`.

**Purpose**: Test interaction between multiple components/services.

**Example**: Testing API endpoints with database interactions.

### E2E Tests
Located in `tests/e2e/`.

**Purpose**: Test complete user flows in a browser environment.

**Run with**:
```bash
npm run test:e2e          # Headless mode
npm run test:e2e:headed   # Headed mode (see browser)
npm run test:e2e:debug    # Debug mode
npm run test:e2e:ui       # Playwright UI mode
```

**Example**:
```typescript
import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { clearBrowserState } from './helpers/test-helpers';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page, context }) => {
    // IMPORTANT: Clear cookies and storage before each test
    await clearBrowserState(page, context);
  });

  test('user can login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('user@example.com', 'password');
    await loginPage.verifySuccessfulLogin();
  });
});
```

**⚠️ IMPORTANT: Test Isolation**

Each E2E test MUST start with a clean browser state. Always use `clearBrowserState()` in `beforeEach`:
- Clears cookies (session data)
- Clears localStorage and sessionStorage
- Clears permissions
- Ensures tests don't interfere with each other

Without this, authenticated tests will fail because the browser keeps the session from previous tests.

## Configuration Files

### vitest.config.ts
Main configuration for Vitest (unit and integration tests).

**Key settings**:
- Environment: `jsdom` for DOM testing
- Coverage: V8 provider with 80% threshold
- Global mocks in `tests/setup.ts`

### playwright.config.ts
Configuration for Playwright (E2E tests).

**Key settings**:
- Browser: Chromium only (as per guidelines)
- Base URL: `http://localhost:4321`
- Screenshots: On failure
- Traces: On first retry

## Writing Tests

### Unit Test Guidelines

1. **Use descriptive test names**:
```typescript
it('should display error message when email is invalid', () => {
  // test implementation
});
```

2. **Follow Arrange-Act-Assert pattern**:
```typescript
it('calculates total correctly', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(30);
});
```

3. **Mock external dependencies**:
```typescript
import { vi } from 'vitest';

vi.mock('@/lib/services/api.service', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: [] })),
}));
```

4. **Clean up after tests**:
```typescript
afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});
```

### E2E Test Guidelines

1. **Use Page Object Model**:
```typescript
// Good - using POM
const loginPage = new LoginPage(page);
await loginPage.login(email, password);

// Bad - direct interaction
await page.fill('input[type="email"]', email);
await page.click('button[type="submit"]');
```

2. **Wait for elements properly**:
```typescript
// Good
await page.waitForSelector('.result', { state: 'visible' });

// Bad
await page.waitForTimeout(5000);
```

3. **Use test data from fixtures**:
```typescript
import { TEST_USERS } from '../fixtures/test-data';

const { email, password } = TEST_USERS.valid;
```

4. **Handle async operations**:
```typescript
await Promise.all([
  page.waitForResponse('**/api/projects'),
  page.click('button:has-text("Load Projects")'),
]);
```

## Test Data

### Fixtures
Reusable test data in `tests/fixtures/test-data.ts`:

- `TEST_USERS`: User credentials
- `TEST_DOCUMENTATION`: Documentation samples
- `TEST_PROJECTS`: Project test cases
- `MOCK_TITLES`: Test case titles
- `API_ENDPOINTS`: API route definitions

### Environment Variables
Create `.env.test` from `.env.test.example`:

```bash
cp .env.test.example .env.test
# Edit .env.test with your test credentials
```

## CI/CD Integration

Tests run automatically on:
- Push to `main`, `master`, or `develop` branches
- Pull requests
- Manual workflow dispatch

### GitHub Actions Workflows

**`.github/workflows/test.yml`**:
- Unit tests (Node 18 & 20)
- E2E tests
- Type checking
- Build verification
- Coverage reports

**`.github/workflows/deploy-staging.yml`**:
- Run full test suite
- Deploy to staging on success

### Required Secrets

Set these in GitHub repository settings:
- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_ANON_KEY`
- `TEST_OPENROUTER_API_KEY`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`
- `DIGITALOCEAN_ACCESS_TOKEN`

## Coverage Reports

After running tests with coverage:

```bash
npm run test:coverage
```

View reports:
- Terminal: Shows summary
- HTML: Open `coverage/index.html` in browser
- LCOV: `coverage/lcov.info` for CI tools

## Debugging Tests

### Vitest
```bash
# Run specific test file
npm run test -- src/components/MyComponent.test.tsx

# Run tests matching pattern
npm run test -- -t "should render"

# Watch mode for specific file
npm run test:watch -- MyComponent
```

### Playwright
```bash
# Debug mode with inspector
npm run test:e2e:debug

# Run specific test file
npm run test:e2e -- tests/e2e/auth.e2e.test.ts

# Generate code with codegen
npm run playwright:codegen http://localhost:4321
```

## Best Practices

1. **Test behavior, not implementation**
   - Focus on what the user sees and does
   - Avoid testing internal state

2. **Keep tests independent**
   - Each test should work in isolation
   - Don't rely on test execution order

3. **Use meaningful assertions**
   - Be specific about what you're testing
   - Provide helpful error messages

4. **Maintain test data**
   - Keep fixtures up-to-date
   - Use realistic test data

5. **Write tests first (TDD)**
   - Define expected behavior
   - Implement to make tests pass
   - Refactor with confidence

## Common Issues

### Tests timing out
- Increase timeout in test or config
- Check for unclosed promises
- Verify API responses

### Flaky E2E tests
- Add proper waits for elements
- Use `waitForLoadState('networkidle')`
- Avoid `waitForTimeout()`

### Mock not working
- Check mock is before imports
- Use `vi.mock()` at top level
- Clear mocks in `afterEach()`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Project Test Plan](.ai/test-plan.md)

