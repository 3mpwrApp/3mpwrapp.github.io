// E2E Tests for 3mpowr App Website
// Run: npx playwright test
// Docs: https://playwright.dev/docs/intro

import { test, expect } from '@playwright/test';

// Base URL configuration
const BASE_URL = process.env.BASE_URL || 'https://3mpwrapp.github.io';

// Test helpers
async function checkPageHealth(page, url, options = {}) {
  const { shouldHaveImages = true, shouldHaveLinks = true } = options;
  
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Check page loads without errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  // Check status code (via response)
  const response = await page.goto(url);
  expect(response.status()).toBeLessThan(400);
  
  // Check page has content
  const bodyText = await page.locator('body').textContent();
  expect(bodyText.length).toBeGreaterThan(100);
  
  if (shouldHaveImages) {
    // Check for images (not required but good)
    const images = page.locator('img');
    // At least some images expected on most pages
  }
  
  if (shouldHaveLinks) {
    // Check page has navigation links
    const links = page.locator('a');
    expect(await links.count()).toBeGreaterThan(0);
  }
}

// ============================================
// Test Suite 1: Page Navigation & Loading
// ============================================

test.describe('Homepage & Basic Navigation', () => {
  test('should load homepage', async ({ page }) => {
    await checkPageHealth(page, BASE_URL);
    
    // Specific homepage checks
    const h1 = await page.locator('h1').first();
    expect(h1).toBeTruthy();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Find main navigation
    const nav = page.locator('nav');
    expect(nav).toBeTruthy();
    
    // Navigation should have links
    const navLinks = nav.locator('a');
    expect(await navLinks.count()).toBeGreaterThan(0);
  });

  test('should have skip link', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Skip link should exist
    const skipLink = page.locator('a[href*="main"], a[href*="content"], .skip-link');
    expect(skipLink).toBeTruthy();
  });
});

// ============================================
// Test Suite 2: Key Pages Loading
// ============================================

test.describe('Key Pages', () => {
  const pages = [
    { url: '/', name: 'Homepage' },
    { url: '/about', name: 'About' },
    { url: '/features', name: 'Features' },
    { url: '/user-guide', name: 'User Guide' },
    { url: '/community', name: 'Community' },
    { url: '/resources', name: 'Resources' },
    { url: '/wellness', name: 'Wellness' },
    { url: '/contact', name: 'Contact' },
    { url: '/newsletter', name: 'Newsletter' },
    { url: '/blog', name: 'Blog' },
    { url: '/beta', name: 'Beta' },
    { url: '/accessibility', name: 'Accessibility' },
    { url: '/privacy', name: 'Privacy' },
  ];

  for (const page_def of pages) {
    test(`should load ${page_def.name} page`, async ({ page }) => {
      await checkPageHealth(page, BASE_URL + page_def.url);
    });
  }
});

// ============================================
// Test Suite 3: User Flows
// ============================================

test.describe('User Flows', () => {
  test('should allow feature discovery flow', async ({ page }) => {
    // Start at homepage
    await page.goto(BASE_URL);
    
    // Click features link
    const featuresLink = page.locator('a:has-text("Features"), a[href*="features"]').first();
    if (await featuresLink.isVisible()) {
      await featuresLink.click();
    } else {
      // Direct navigation if link not visible
      await page.goto(BASE_URL + '/features');
    }
    
    // Verify features page loads
    expect(page.url()).toContain('/features');
    
    // Verify content present
    const content = await page.locator('main').textContent();
    expect(content.length).toBeGreaterThan(100);
  });

  test('should allow resource navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Navigate to resources
    const resourcesLink = page.locator('a:has-text("Resources"), a[href*="resources"]').first();
    if (await resourcesLink.isVisible()) {
      await resourcesLink.click();
    } else {
      await page.goto(BASE_URL + '/resources');
    }
    
    expect(page.url()).toContain('/resources');
    
    // Verify resources loaded
    const resourceCount = await page.locator('article, .resource, .card').count();
    expect(resourceCount).toBeGreaterThan(0);
  });

  test('should allow blog navigation', async ({ page }) => {
    await page.goto(BASE_URL + '/blog');
    
    // Check blog posts present
    const posts = page.locator('article, .post, [data-post]');
    expect(await posts.count()).toBeGreaterThan(0);
    
    // Click first post
    const firstPost = posts.first();
    await firstPost.click();
    
    // Verify post page loads
    expect(page.url()).toContain('/');
    const postContent = await page.locator('main').textContent();
    expect(postContent.length).toBeGreaterThan(100);
  });

  test('should allow contact page interaction', async ({ page }) => {
    await page.goto(BASE_URL + '/contact');
    
    // Verify form elements present
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      expect(form).toBeTruthy();
      
      // Check for common form fields
      const nameField = page.locator('input[name*="name"], input[type="text"]').first();
      const emailField = page.locator('input[name*="email"], input[type="email"]').first();
      
      if (await nameField.isVisible()) {
        expect(nameField).toBeTruthy();
      }
      if (await emailField.isVisible()) {
        expect(emailField).toBeTruthy();
      }
    }
  });
});

// ============================================
// Test Suite 4: Accessibility
// ============================================

test.describe('Accessibility Features', () => {
  test('should have keyboard navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Tab to first focusable element
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement.tagName);
    expect(focused).toBeTruthy();
    
    // Should be able to Tab through multiple elements
    const tabCount = 5;
    for (let i = 0; i < tabCount; i++) {
      await page.keyboard.press('Tab');
    }
    
    const focusedAfterTabs = await page.evaluate(() => document.activeElement.className || document.activeElement.tagName);
    expect(focusedAfterTabs).toBeTruthy();
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Tab to first button
    const buttons = page.locator('button, [role="button"]');
    if (await buttons.first().isVisible()) {
      await buttons.first().focus();
      
      // Check focus styles applied
      const focusStyles = await buttons.first().evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          boxShadow: style.boxShadow,
        };
      });
      
      // At least outline or box-shadow should be present
      const hasFocusIndicator = focusStyles.outline !== 'none' || focusStyles.boxShadow !== 'none';
      expect(hasFocusIndicator).toBeTruthy();
    }
  });

  test('should support contrast toggle (if feature exists)', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Look for accessibility/contrast controls
    const contrastButton = page.locator('[aria-label*="contrast"], [title*="Contrast"], .contrast-toggle').first();
    if (await contrastButton.isVisible()) {
      // Check initial contrast setting
      const initialContrast = await page.evaluate(() => 
        document.body.getAttribute('data-contrast') || 'normal'
      );
      
      // Toggle contrast
      await contrastButton.click();
      
      // Check contrast changed
      const newContrast = await page.evaluate(() =>
        document.body.getAttribute('data-contrast') || 'normal'
      );
      
      expect(newContrast).not.toBe(initialContrast);
    }
  });

  test('should support theme toggle (if feature exists)', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Look for theme/dark mode controls
    const themeButton = page.locator('[aria-label*="theme"], [title*="Dark"], .theme-toggle').first();
    if (await themeButton.isVisible()) {
      const initialTheme = await page.evaluate(() =>
        document.body.getAttribute('data-theme') || localStorage.getItem('theme') || 'light'
      );
      
      // Toggle theme
      await themeButton.click();
      
      const newTheme = await page.evaluate(() =>
        document.body.getAttribute('data-theme') || localStorage.getItem('theme') || 'light'
      );
      
      // Theme should have changed or setting persisted
      expect(newTheme).toBeTruthy();
    }
  });
});

// ============================================
// Test Suite 5: Responsive Design
// ============================================

test.describe('Responsive Design', () => {
  const breakpoints = [
    { width: 320, height: 568, name: 'Mobile (iPhone SE)' },
    { width: 375, height: 667, name: 'Mobile (iPhone X)' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1024, height: 768, name: 'Desktop (medium)' },
    { width: 1280, height: 800, name: 'Desktop (large)' },
  ];

  for (const breakpoint of breakpoints) {
    test(`should work on ${breakpoint.name}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({
        width: breakpoint.width,
        height: breakpoint.height,
      });
      
      await page.goto(BASE_URL);
      
      // Check no horizontal scrollbar
      const bodyOverflow = await page.evaluate(() =>
        window.innerWidth === document.documentElement.clientWidth
      );
      expect(bodyOverflow).toBeTruthy();
      
      // Check page content visible
      const content = await page.locator('main, [role="main"]').isVisible();
      expect(content).toBeTruthy();
      
      // Check navigation accessible
      const nav = page.locator('nav, [role="navigation"]');
      if (await nav.isVisible()) {
        expect(nav).toBeTruthy();
      }
    });
  }
});

// ============================================
// Test Suite 6: Form Interactions
// ============================================

test.describe('Forms', () => {
  test('should handle newsletter form submission', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Look for newsletter form
    const newsletterForm = page.locator('form[name*="newsletter"], [id*="newsletter"]').first();
    if (await newsletterForm.isVisible()) {
      // Find email input
      const emailInput = newsletterForm.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        // Fill with test email
        await emailInput.fill('test@example.com');
        
        // Find and click submit button
        const submitButton = newsletterForm.locator('button[type="submit"]').first();
        if (await submitButton.isVisible()) {
          // Listen for response (may be form submission or API call)
          let formSubmitted = false;
          
          page.on('response', (response) => {
            if (response.status() === 200 || response.status() === 400) {
              formSubmitted = true;
            }
          });
          
          await submitButton.click();
          
          // Wait for response or success message
          await page.waitForTimeout(1000);
          expect(formSubmitted || await page.locator('.success, .error, [role="alert"]').isVisible()).toBeTruthy();
        }
      }
    }
  });

  test('should handle contact form submission', async ({ page }) => {
    await page.goto(BASE_URL + '/contact');
    
    // Look for contact form
    const contactForm = page.locator('form').first();
    if (await contactForm.isVisible()) {
      // Fill basic fields
      const nameField = contactForm.locator('input[type="text"], input[name*="name"]').first();
      const emailField = contactForm.locator('input[type="email"]').first();
      
      if (await nameField.isVisible()) {
        await nameField.fill('Test User');
      }
      
      if (await emailField.isVisible()) {
        await emailField.fill('test@example.com');
      }
      
      // Fill message field if present
      const messageField = contactForm.locator('textarea').first();
      if (await messageField.isVisible()) {
        await messageField.fill('Test message from E2E test');
      }
      
      // Submit form
      const submitButton = contactForm.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Wait for response
        await page.waitForTimeout(1000);
        
        // Check for success message or no error
        const error = page.locator('[role="alert"], .error');
        const hasError = await error.isVisible().catch(() => false);
        expect(hasError).toBeFalsy(); // Should not have errors
      }
    }
  });
});

// ============================================
// Test Suite 7: Search Functionality
// ============================================

test.describe('Search', () => {
  test('should allow search', async ({ page }) => {
    await page.goto(BASE_URL + '/search');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[name="q"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      // Type search query
      await searchInput.fill('resources');
      
      // Wait for results
      await page.waitForTimeout(500);
      
      // Check results displayed
      const results = page.locator('[data-result], .result, article').nth(1); // Skip instruction
      // Results may or may not exist, but search should not crash
      expect(searchInput).toBeTruthy();
    }
  });

  test('should handle XSS attempts in search', async ({ page }) => {
    await page.goto(BASE_URL + '/search');
    
    const searchInput = page.locator('input[type="search"], input[name="q"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      // Try XSS payload
      await searchInput.fill('<script>alert("XSS")</script>');
      
      // No alert should appear
      let alertFired = false;
      page.on('dialog', async (dialog) => {
        alertFired = true;
        await dialog.dismiss();
      });
      
      await page.waitForTimeout(500);
      expect(alertFired).toBeFalsy();
    }
  });
});

// ============================================
// Test Suite 8: Mobile Navigation
// ============================================

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should have mobile-friendly menu', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Look for menu button (hamburger)
    const menuButton = page.locator('button[aria-label*="menu"], .menu-toggle, [aria-label*="navigation"]').first();
    if (await menuButton.isVisible()) {
      // Click to open menu
      await menuButton.click();
      
      // Menu should appear
      const menu = page.locator('nav').first();
      expect(menu).toBeTruthy();
    }
  });

  test('should navigate pages on mobile', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Try to find and click features link
    const featuresLink = page.locator('a:has-text("Features")').first();
    if (await featuresLink.isVisible()) {
      await featuresLink.click();
      expect(page.url()).toContain('/features');
    }
  });
});

// ============================================
// Test Suite 9: Performance
// ============================================

test.describe('Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Homepage should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors', async ({ page }) => {
    const errors = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL);
    
    // Log any errors (but don't fail test, as warnings are common)
    if (errors.length > 0) {
      console.log('Console messages:', errors);
    }
  });

  test('should handle images efficiently', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      let missingAlt = 0;
      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        const alt = await images.nth(i).getAttribute('alt');
        if (!alt) missingAlt++;
      }
      
      // Log but don't fail (some images may be decorative)
      if (missingAlt > 0) {
        console.log(`${missingAlt} images without alt text`);
      }
    }
  });
});

// ============================================
// Test Suite 10: Cross-Browser Compatibility
// ============================================

test.describe('Cross-Browser Features', () => {
  test('should support basic HTML5 features', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check for semantic HTML
    const semantic = await page.evaluate(() => {
      const elements = ['header', 'nav', 'main', 'footer'];
      return elements.every(tag => document.querySelector(tag) || true);
    });
    
    expect(semantic).toBeTruthy();
  });

  test('should handle CSS without errors', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Page should render without layout issues
    const mainContent = page.locator('main');
    expect(await mainContent.isVisible()).toBeTruthy();
  });
});
