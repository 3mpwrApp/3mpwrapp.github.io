# E2E Testing with Playwright

End-to-end tests for the 3mpowr App website, covering user flows, accessibility, responsiveness, and performance.

## Setup

**Install dependencies:**
```bash
npm install
```

**Install browsers:**
```bash
npx playwright install
```

## Running Tests

**Run all tests:**
```bash
npx playwright test
```

**Run specific test file:**
```bash
npx playwright test e2e-tests/main.spec.js
```

**Run specific test:**
```bash
npx playwright test -g "should load homepage"
```

**Run with UI mode (interactive):**
```bash
npx playwright test --ui
```

**Run in headed mode (see browser):**
```bash
npx playwright test --headed
```

**Run with different browser:**
```bash
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project=chromium
```

**Debug test:**
```bash
npx playwright test --debug
```

**Generate trace for debugging:**
```bash
npx playwright test --trace on
```

## Configuration

**playwright.config.ts** settings:
- Timeout: 30 seconds per test
- Retries: 2 for CI (0 locally)
- Parallel: 4 workers
- Output: `test-results/`
- Trace: Saved on first retry

## Test Organization

### Test Suites

1. **Homepage & Basic Navigation** – Page loads, navigation present
2. **Key Pages** – All major pages load without errors
3. **User Flows** – Feature discovery, blog navigation, contact page
4. **Accessibility** – Keyboard navigation, focus indicators, theme toggle
5. **Responsive Design** – Mobile, tablet, desktop viewports
6. **Forms** – Newsletter signup, contact form
7. **Search** – Search functionality, XSS protection
8. **Mobile Navigation** – Mobile menu, mobile layout
9. **Performance** – Load times, console errors, image efficiency
10. **Cross-Browser** – HTML5 features, CSS compatibility

## Writing New Tests

**Basic test structure:**
```javascript
test('should do something', async ({ page }) => {
  await page.goto('https://example.com');
  const button = page.locator('button');
  await button.click();
  expect(button).toBeTruthy();
});
```

**Test with setup:**
```javascript
test.describe('Feature Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.com');
  });

  test('should do X', async ({ page }) => {
    const element = page.locator('button');
    expect(element).toBeTruthy();
  });
});
```

**Using fixtures:**
```javascript
test('should handle forms', async ({ page }) => {
  const input = page.locator('input[type="email"]');
  await input.fill('test@example.com');
  expect(input).toHaveValue('test@example.com');
});
```

## Common Assertions

```javascript
expect(element).toBeTruthy();
expect(element).toBeVisible();
expect(element).toBeEnabled();
expect(input).toHaveValue('expected');
expect(page.url()).toContain('/path');
expect(await page.title()).toBe('Page Title');
expect(await locator.count()).toBeGreaterThan(0);
```

## Locator Strategies

```javascript
// CSS selectors
page.locator('button.primary');
page.locator('input[type="email"]');

// Text content
page.locator('text=Click me');

// ARIA labels
page.locator('[aria-label="Close"]');

// Roles
page.locator('[role="button"]');

// Combining
page.locator('button, [role="button"]');

// Has text
page.locator('a:has-text("Features")');
```

## Common Patterns

**Wait for element:**
```javascript
await page.locator('button').waitFor();
await page.waitForSelector('button');
```

**Wait for navigation:**
```javascript
await Promise.all([
  page.waitForNavigation(),
  page.locator('a').click()
]);
```

**Screenshot:**
```javascript
await page.screenshot({ path: 'screenshot.png' });
await element.screenshot({ path: 'element.png' });
```

**Get page metrics:**
```javascript
const metrics = await page.evaluate(() => ({
  url: window.location.href,
  title: document.title,
  readyState: document.readyState,
}));
```

## CI/CD Integration

Tests run automatically on:
- Push to main branch
- Pull requests
- Manual trigger
- Scheduled (optional)

See `.github/workflows/e2e-tests.yml` for CI configuration.

## Troubleshooting

**Test timeout:**
```javascript
test('my test', async ({ page }) => {
  // Increase timeout for this test
}, { timeout: 60 * 1000 });
```

**Element not found:**
```javascript
// Use waitFor with increased timeout
await page.locator('button').waitFor({ timeout: 5000 });
```

**Navigation issues:**
```javascript
// Wait for page to be fully loaded
await page.goto(url, { waitUntil: 'networkidle' });
```

**Debugging:**
```bash
# Run with debug mode
npx playwright test --debug

# View test report
npx playwright show-report
```

## Best Practices

1. **Use data attributes:** `data-testid="button"` (more stable than CSS selectors)
2. **Test user behavior:** Navigate as users would, not just testing implementation
3. **Keep tests focused:** One test = one feature
4. **Use fixtures:** Avoid repetitive setup code
5. **Mock external services:** Don't rely on third-party APIs in tests
6. **Test critical paths:** Focus on important user flows first
7. **Keep tests fast:** Use parallel execution, avoid unnecessary waits

## Resources

- **Playwright Docs:** https://playwright.dev/
- **Locators Guide:** https://playwright.dev/docs/locators
- **Best Practices:** https://playwright.dev/docs/best-practices
- **Debugging:** https://playwright.dev/docs/debug
- **CI/CD:** https://playwright.dev/docs/ci

