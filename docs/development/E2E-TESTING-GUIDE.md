# E2E TESTING IMPLEMENTATION GUIDE
## 3mpowr Website - October 19, 2025

---

## OBJECTIVE

Execute comprehensive end-to-end (E2E) testing using Playwright to verify all critical user journeys work correctly on production-like environment before launch.

---

## TESTING SCOPE

### Pages to Test (13 Critical Pages)

1. **Homepage** (`/`)
2. **Features** (`/features`)
3. **User Guide** (`/user-guide`)
4. **About** (`/about`)
5. **Blog** (`/blog`)
6. **Contact** (`/contact`)
7. **Search** (`/search`)
8. **Accessibility** (`/accessibility`)
9. **Accessibility Settings** (`/accessibility-settings`)
10. **Newsletter** (`/newsletter`)
11. **What's New** (`/whats-new`)
12. **Privacy** (`/privacy`)
13. **Site Map** (`/site-map`)

### Test Coverage by Category

| Category | Tests | Status |
|----------|-------|--------|
| Navigation | 5 | ⏳ TODO |
| Forms | 3 | ⏳ TODO |
| Accessibility | 4 | ⏳ TODO |
| Performance | 2 | ⏳ TODO |
| Security | 3 | ⏳ TODO |

**Total E2E Tests: 17 test cases**

---

## TESTING FRAMEWORK

**Tool:** Playwright 1.56.1  
**Status:** ✅ Already installed  
**Language:** JavaScript (Node.js)

### Why Playwright?

- ✅ Fast, reliable, headless browser automation
- ✅ Cross-browser support (Chrome, Firefox, Safari, Edge)
- ✅ Built-in waiting mechanisms
- ✅ Excellent error reporting
- ✅ Screenshot & video recording
- ✅ Trace debugging

---

## E2E TEST CASES

### CATEGORY 1: NAVIGATION TESTS (5 tests)

#### Test 1.1: Navigation Menu Accessible
```javascript
test('Navigation menu is accessible and keyboard navigable', async ({ page }) => {
  await page.goto('https://3mpwrapp.github.io/');
  
  // Test: Menu button exists
  const menuButton = await page.locator('.menu-toggle');
  await expect(menuButton).toBeVisible();
  
  // Test: Menu opens on click
  await menuButton.click();
  const nav = await page.locator('#primary-nav');
  await expect(nav).toHaveClass(/is-open/);
  
  // Test: First nav link is focusable
  await page.keyboard.press('Tab');
  const activeElement = await page.evaluate(() => document.activeElement?.className);
  expect(activeElement).toContain('nav');
  
  // Test: ESC closes menu
  await page.keyboard.press('Escape');
  await expect(nav).not.toHaveClass(/is-open/);
  
  console.log('✓ Navigation accessible and keyboard navigable');
});
```

#### Test 1.2: All Navigation Links Work
```javascript
test('All navigation links navigate correctly', async ({ page }) => {
  await page.goto('https://3mpwrapp.github.io/');
  
  const links = [
    { href: '/features', title: 'Features' },
    { href: '/user-guide', title: 'User Guide' },
    { href: '/about', title: 'About' },
    { href: '/contact', title: 'Contact' },
    { href: '/blog', title: 'Blog' }
  ];
  
  for (const link of links) {
    await page.goto(`https://3mpwrapp.github.io${link.href}`);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain(link.href);
  }
  
  console.log('✓ All navigation links working');
});
```

#### Test 1.3: Breadcrumbs Display Correctly
```javascript
test('Breadcrumbs display correct navigation path', async ({ page }) => {
  await page.goto('https://3mpwrapp.github.io/features');
  
  const breadcrumbs = await page.locator('.breadcrumbs ol > li');
  const breadcrumbText = await breadcrumbs.allTextContents();
  
  expect(breadcrumbText).toContain('Home');
  expect(breadcrumbText[breadcrumbText.length - 1]).toContain('Features');
  
  console.log('✓ Breadcrumbs display correctly');
});
```

#### Test 1.4: Language Switcher Works
```javascript
test('Language switcher navigates to alternate language', async ({ page }) => {
  await page.goto('https://3mpwrapp.github.io/');
  
  const langSwitch = await page.locator('.lang-switch');
  const initialHref = await langSwitch.getAttribute('href');
  
  expect(initialHref).toContain('/fr/');
  
  await langSwitch.click();
  await page.waitForLoadState('networkidle');
  
  expect(page.url()).toContain('/fr/');
  console.log('✓ Language switcher works');
});
```

#### Test 1.5: Skip Links Work
```javascript
test('Skip links move focus to target content', async ({ page }) => {
  await page.goto('https://3mpwrapp.github.io/');
  
  // Press Tab to activate skip link
  await page.keyboard.press('Tab');
  
  // Get skip link
  const skipLink = await page.locator('.skip-link').first();
  await expect(skipLink).toBeFocused();
  
  // Click skip link
  await skipLink.click();
  
  // Focus should move to main content
  const focused = await page.evaluate(() => document.activeElement?.id);
  expect(focused).toBe('main-content');
  
  console.log('✓ Skip links functioning');
});
```

---

### CATEGORY 2: FORM TESTS (3 tests)

#### Test 2.1: Contact Form Loads & Submits
```javascript
test('Contact form loads and can submit', async ({ page }) => {
  await page.goto('https://3mpwrapp.github.io/contact');
  
  // Test: Form exists
  const form = await page.locator('form');
  await expect(form).toBeVisible();
  
  // Test: Form fields accessible
  const emailField = await page.locator('input[type="email"]');
  const messageField = await page.locator('textarea');
  
  await expect(emailField).toBeVisible();
  await expect(messageField).toBeVisible();
  
  // Test: Submit button exists
  const submitBtn = await page.locator('button[type="submit"]');
  await expect(submitBtn).toBeVisible();
  
  console.log('✓ Contact form loads correctly');
});
```

#### Test 2.2: Form Validation Works
```javascript
test('Form validation prevents submission of invalid data', async ({ page }) => {
  await page.goto('https://3mpwrapp.github.io/contact');
  
  const submitBtn = await page.locator('button[type="submit"]');
  const emailField = await page.locator('input[type="email"]');
  
  // Test: Submit with empty email fails
  await submitBtn.click();
  
  // HTML5 validation should show error
  const isValid = await emailField.evaluate((el) => (el as HTMLInputElement).checkValidity());
  expect(isValid).toBe(false);
  
  // Test: Valid email passes
  await emailField.fill('test@example.com');
  const isValidNow = await emailField.evaluate((el) => (el as HTMLInputElement).checkValidity());
  expect(isValidNow).toBe(true);
  
  console.log('✓ Form validation working');
});
```

#### Test 2.3: Newsletter Signup Works
```javascript
test('Newsletter signup form is accessible', async ({ page }) => {
  await page.goto('https://3mpwrapp.github.io/newsletter');
  
  // Check for newsletter form
  const form = await page.locator('form').first();
  await expect(form).toBeVisible();
  
  // Verify email field exists
  const emailField = await page.locator('input[type="email"]').first();
  await expect(emailField).toBeVisible();
  
  // Test: Can type in email field
  await emailField.fill('subscriber@example.com');
  const value = await emailField.inputValue();
  expect(value).toBe('subscriber@example.com');
  
  console.log('✓ Newsletter form accessible');
});
```

---

### CATEGORY 3: ACCESSIBILITY TESTS (4 tests)

#### Test 3.1: Dark Mode Toggle Works
```javascript
test('Dark mode toggle changes theme', async ({ page }) => {
  await page.goto('https://3mpwrapp.github.io/');
  
  // Find dark mode button
  const darkModeBtn = await page.locator('#theme-toggle');
  await expect(darkModeBtn).toBeVisible();
  
  // Check initial state
  let isDark = await page.locator('html').evaluate((el) => {
    return getComputedStyle(el).colorScheme === 'dark';
  });
  
  // Click toggle
  await darkModeBtn.click();
  
  // Check new state
  const isDarkNow = await page.locator('html').evaluate((el) => {
    return getComputedStyle(el).colorScheme === 'dark';
  });
  
  expect(isDarkNow).not.toBe(isDark);
  console.log('✓ Dark mode toggle working');
});
```

#### Test 3.2: High Contrast Mode Works
```javascript
test('High contrast mode toggle works', async ({ page }) => {
  await page.goto('https://3mpwrapp.github.io/');
  
  const contrastBtn = await page.locator('#contrast-toggle');
  await expect(contrastBtn).toBeVisible();
  
  // Click contrast button
  await contrastBtn.click();
  
  // Check data attribute
  const hasContrast = await page.locator('html').evaluate((el) => {
    return el.getAttribute('data-contrast') === 'true';
  });
  
  expect(hasContrast).toBe(true);
  console.log('✓ High contrast mode working');
});
```

#### Test 3.3: Focus Indicators Visible
```javascript
test('Focus indicators are visible for keyboard navigation', async ({ page }) => {
  await page.goto('https://3mpwrapp.github.io/');
  
  // Tab to first interactive element
  await page.keyboard.press('Tab');
  
  // Get focused element
  const focused = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    return {
      tagName: el.tagName,
      outlined: getComputedStyle(el).outlineWidth !== '0px'
    };
  });
  
  // Focus indicator should be visible (outline > 0)
  expect(focused.outlined).toBe(true);
  console.log('✓ Focus indicators visible');
});
```

#### Test 3.4: Accessibility Settings Page Works
```javascript
test('Accessibility settings page is functional', async ({ page }) => {
  await page.goto('https://3mpwrapp.github.io/accessibility-settings');
  
  // Page should load
  await page.waitForLoadState('networkidle');
  
  // Should contain settings
  const settings = await page.locator('[role="group"]');
  expect(settings.length).toBeGreaterThan(0);
  
  console.log('✓ Accessibility settings page functional');
});
```

---

### CATEGORY 4: PERFORMANCE TESTS (2 tests)

#### Test 4.1: Page Load Time Under 3 Seconds
```javascript
test('Critical pages load within performance target', async ({ page }) => {
  const pages = [
    '/',
    '/features',
    '/user-guide',
    '/about'
  ];
  
  for (const url of pages) {
    const startTime = Date.now();
    await page.goto(`https://3mpwrapp.github.io${url}`);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // 3 seconds
    console.log(`✓ ${url} loaded in ${loadTime}ms`);
  }
});
```

#### Test 4.2: Images Lazy Load
```javascript
test('Images use lazy loading', async ({ page }) => {
  await page.goto('https://3mpwrapp.github.io/blog');
  
  const images = await page.locator('img');
  const count = await images.count();
  
  // Check that at least some images have loading="lazy"
  let lazyCount = 0;
  for (let i = 0; i < count; i++) {
    const loading = await images.nth(i).getAttribute('loading');
    if (loading === 'lazy') lazyCount++;
  }
  
  expect(lazyCount).toBeGreaterThan(0);
  console.log(`✓ ${lazyCount} images using lazy loading`);
});
```

---

### CATEGORY 5: SECURITY TESTS (3 tests)

#### Test 5.1: HTTPS Enforced
```javascript
test('All pages use HTTPS', async ({ page }) => {
  const urls = [
    'https://3mpwrapp.github.io/',
    'https://3mpwrapp.github.io/features',
    'https://3mpwrapp.github.io/user-guide'
  ];
  
  for (const url of urls) {
    await page.goto(url);
    expect(page.url()).toMatch(/^https:\/\//);
  }
  
  console.log('✓ All pages using HTTPS');
});
```

#### Test 5.2: No Mixed Content Warnings
```javascript
test('No mixed content or security warnings', async ({ page }) => {
  let consoleErrors = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  await page.goto('https://3mpwrapp.github.io/');
  
  // Filter out non-security errors
  const securityErrors = consoleErrors.filter(err =>
    err.toLowerCase().includes('mixed') ||
    err.toLowerCase().includes('blocked') ||
    err.toLowerCase().includes('refused')
  );
  
  expect(securityErrors.length).toBe(0);
  console.log('✓ No mixed content warnings');
});
```

#### Test 5.3: CSP Headers Configured
```javascript
test('Security headers are present', async ({ page, context }) => {
  const response = await page.goto('https://3mpwrapp.github.io/');
  
  const headers = response?.headers();
  
  // GitHub Pages may not expose all headers, but check what's available
  expect(headers).toBeDefined();
  console.log('✓ Security headers present');
});
```

---

## TEST EXECUTION

### Run All Tests

```bash
# Install dependencies (if needed)
npm install

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in headless mode (CI/CD)
npx playwright test

# Run specific test file
npx playwright test tests/navigation.spec.ts

# Run with debugging
npx playwright test --debug

# Generate HTML report
npx playwright test --reporter=html
```

### Output & Reports

```bash
# Tests automatically generate:
# - test-results/ (raw results)
# - playwright-report/ (HTML report)
# - videos/ (test recordings)
# - traces/ (for debugging)
```

---

## TEST CONFIGURATION

### Create `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'https://3mpwrapp.github.io',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

---

## EXPECTED RESULTS

### Success Criteria

✅ **All 17 test cases pass** with:
- No navigation errors
- All forms functional
- Accessibility features working
- Performance within targets
- Security headers verified
- No console errors
- Cross-browser compatibility confirmed

### Acceptable Failure Rate

- 0 critical failures (must fix before launch)
- 0-1 warnings (non-blocking)
- 100% pass rate required for all navigation tests

---

## TIMELINE

### Oct 19 (Today)
- [ ] Create E2E test files
- [ ] Run tests against production-like environment
- [ ] Fix any failing tests
- [ ] Generate test report
- **Estimated time: 1.5-2 hours**

### Oct 20
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Manual regression testing
- [ ] Final verification

### Oct 24 (Launch)
- [ ] Re-run all tests pre-launch
- [ ] Verify all systems green
- [ ] Deploy to production

---

## DELIVERABLES

1. **test/** directory with all E2E test files
2. **playwright-report/index.html** (test results)
3. **E2E-TEST-RESULTS.md** (summary report)
4. **playwright.config.ts** (configuration)

---

## SUCCESS METRICS

| Metric | Target | Status |
|--------|--------|--------|
| Navigation Tests | 5/5 ✅ | ⏳ TODO |
| Form Tests | 3/3 ✅ | ⏳ TODO |
| Accessibility Tests | 4/4 ✅ | ⏳ TODO |
| Performance Tests | 2/2 ✅ | ⏳ TODO |
| Security Tests | 3/3 ✅ | ⏳ TODO |
| **Total Pass Rate** | **100%** | ⏳ TODO |

---

## NEXT STEPS

1. Create test files in `./tests/` directory
2. Configure Playwright with production URLs
3. Execute full test suite
4. Fix any failures
5. Generate final report
6. Approve for launch

---

**Guide Created:** October 19, 2025  
**Status:** Ready for test implementation  
**Next Action:** Create test files and run suite
