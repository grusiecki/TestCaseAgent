# E2E Testing Checklist

## ✅ Before Writing E2E Tests

- [ ] Create test user in Supabase with known credentials
- [ ] Configure `.env.test` with test credentials
- [ ] Ensure Chromium is installed: `npm run playwright:install`

## ✅ Writing E2E Tests

### Test Isolation (CRITICAL!)

Every `test.describe` block MUST have a `beforeEach` that clears browser state:

```typescript
import { clearBrowserState } from './helpers/test-helpers';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page, context }) => {
    // ALWAYS clear state before each test
    await clearBrowserState(page, context);
  });
  
  test('my test', async ({ page }) => {
    // Your test code
  });
});
```

**Why?** Without clearing state:
- Cookies persist between tests
- Sessions remain active
- Tests interfere with each other
- Authentication tests fail

### Page Object Model

Always use Page Object Model pattern:

```typescript
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test('user workflow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  
  await loginPage.navigate();
  await loginPage.login('email', 'password');
  await dashboardPage.verifyDashboardLoaded();
});
```

### Test Structure (AAA Pattern)

```typescript
test('should do something', async ({ page }) => {
  // Arrange - setup test data
  const testData = { email: 'test@example.com', password: 'password' };
  
  // Act - perform actions
  await loginPage.login(testData.email, testData.password);
  
  // Assert - verify results
  await loginPage.verifySuccessfulLogin();
  await expect(page).toHaveURL(/\/dashboard/);
});
```

## ✅ Running Tests

```bash
# Development
npm run test:e2e          # Headless mode
npm run test:e2e:headed   # See browser
npm run test:e2e:ui       # Interactive UI
npm run test:e2e:debug    # Debug mode

# CI/CD
npm run test:e2e          # Runs with retries and single worker
```

## ✅ Common Issues

### Issue: Tests fail with "already logged in"
**Solution**: Add `clearBrowserState()` in `beforeEach`

### Issue: Test works alone but fails in suite
**Solution**: Clear browser state before each test

### Issue: Network errors or timeouts
**Solution**: 
- Check if dev server is running
- Increase timeout in test
- Verify `.env.test` configuration

### Issue: Elements not found
**Solution**:
- Wait for network idle: `await page.waitForLoadState('networkidle')`
- Use proper locators in Page Objects
- Check if element selector changed

## ✅ Best Practices

1. **One assertion per test** (when possible)
2. **Clear, descriptive test names**
3. **Use test fixtures** for reusable data
4. **Avoid hard-coded waits** (`page.waitForTimeout()`)
5. **Use semantic locators** (role, label, text)
6. **Take screenshots on failure** (configured by default)
7. **Clean up test data** after tests (if creating records)

## ✅ Code Review Checklist

- [ ] All tests use `clearBrowserState()` in `beforeEach`
- [ ] Page Object Model used consistently
- [ ] Tests are independent (can run in any order)
- [ ] No hard-coded credentials (use fixtures)
- [ ] Proper error messages in assertions
- [ ] Tests follow AAA pattern
- [ ] Network calls are properly awaited
- [ ] Screenshots/videos on failure enabled

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- Project README: `/tests/README.md`

