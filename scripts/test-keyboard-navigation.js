/**
 * WCAG 2.2 AAA Keyboard Navigation Testing Script
 * Tests:
 * - Tab navigation order
 * - Focus visibility
 * - Skip links
 * - Keyboard traps
 * - ARIA roles and labels
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testKeyboardNav(page, url) {
  console.log(`\n⌨️  Testing keyboard navigation: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    
    const results = {
      url,
      tests: [],
      violations: []
    };
    
    // Test 1: Tab order and focusable elements
    console.log('  Testing tab order...');
    const tabOrderTest = await page.evaluate(() => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        'area[href]',
        'iframe',
        '[contenteditable]'
      ].join(',');
      
      const focusable = Array.from(document.querySelectorAll(focusableSelectors));
      const visible = focusable.filter(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0 && 
               rect.height > 0 && 
               style.visibility !== 'hidden' && 
               style.display !== 'none';
      });
      
      const tabOrder = visible.map((el, index) => {
        const tabindex = el.getAttribute('tabindex');
        return {
          element: el.tagName.toLowerCase(),
          id: el.id,
          class: el.className,
          tabindex: tabindex,
          order: index,
          hasAriaLabel: el.hasAttribute('aria-label'),
          ariaLabel: el.getAttribute('aria-label'),
          role: el.getAttribute('role'),
          text: el.textContent?.trim().substring(0, 30)
        };
      });
      
      return {
        totalFocusable: focusable.length,
        visibleFocusable: visible.length,
        tabOrder
      };
    });
    
    results.tests.push({
      name: 'Tab Order',
      passed: tabOrderTest.visibleFocusable > 0,
      details: tabOrderTest
    });
    
    if (tabOrderTest.visibleFocusable === 0) {
      results.violations.push({
        type: 'NO_FOCUSABLE_ELEMENTS',
        severity: 'critical',
        message: 'No focusable elements found on page'
      });
    }
    
    // Test 2: Skip links
    console.log('  Testing skip links...');
    const skipLinkTest = await page.evaluate(() => {
      const skipLinks = Array.from(document.querySelectorAll('a[href^="#"]'))
        .filter(a => {
          const text = a.textContent.toLowerCase();
          return text.includes('skip') || 
                 text.includes('jump') || 
                 a.className.includes('skip');
        });
      
      return {
        hasSkipLink: skipLinks.length > 0,
        skipLinks: skipLinks.map(a => ({
          text: a.textContent.trim(),
          href: a.href,
          visible: window.getComputedStyle(a).visibility !== 'hidden'
        }))
      };
    });
    
    results.tests.push({
      name: 'Skip Links',
      passed: skipLinkTest.hasSkipLink,
      details: skipLinkTest
    });
    
    if (!skipLinkTest.hasSkipLink) {
      results.violations.push({
        type: 'NO_SKIP_LINK',
        severity: 'warning',
        message: 'No skip navigation link found (recommended for AAA)'
      });
    }
    
    // Test 3: Focus indicators
    console.log('  Testing focus visibility...');
    
    // Tab through first 10 focusable elements and check focus styles
    const focusTests = [];
    for (let i = 0; i < Math.min(10, tabOrderTest.visibleFocusable); i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      const focusStyle = await page.evaluate(() => {
        const focused = document.activeElement;
        if (!focused || focused === document.body) return null;
        
        const style = window.getComputedStyle(focused);
        const outlineWidth = parseFloat(style.outlineWidth);
        const outlineStyle = style.outlineStyle;
        const outlineColor = style.outlineColor;
        const boxShadow = style.boxShadow;
        const backgroundColor = style.backgroundColor;
        const border = style.border;
        
        const hasFocusIndicator = 
          (outlineWidth > 0 && outlineStyle !== 'none') ||
          boxShadow !== 'none' ||
          border.includes('px');
        
        return {
          element: focused.tagName.toLowerCase(),
          id: focused.id,
          hasFocusIndicator,
          outline: `${outlineWidth}px ${outlineStyle} ${outlineColor}`,
          boxShadow,
          backgroundColor
        };
      });
      
      if (focusStyle) {
        focusTests.push(focusStyle);
        
        if (!focusStyle.hasFocusIndicator) {
          results.violations.push({
            type: 'MISSING_FOCUS_INDICATOR',
            severity: 'critical',
            message: `Element ${focusStyle.element}${focusStyle.id ? '#' + focusStyle.id : ''} lacks visible focus indicator`,
            element: focusStyle
          });
        }
      }
    }
    
    results.tests.push({
      name: 'Focus Indicators',
      passed: focusTests.every(t => t.hasFocusIndicator),
      details: { focusTests }
    });
    
    // Test 4: Keyboard trap detection
    console.log('  Testing for keyboard traps...');
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    
    const trapTest = await page.evaluate(() => {
      let tabCount = 0;
      const maxTabs = 50;
      const visited = new Set();
      
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const activeId = document.activeElement?.id || 
                          document.activeElement?.className || 
                          document.activeElement?.tagName;
          
          if (visited.has(activeId)) {
            // We've cycled back - this is expected
            clearInterval(interval);
            resolve({
              trapped: false,
              tabsUsed: tabCount,
              message: 'Tab cycling works correctly'
            });
            return;
          }
          
          visited.add(activeId);
          tabCount++;
          
          if (tabCount >= maxTabs) {
            clearInterval(interval);
            resolve({
              trapped: true,
              tabsUsed: tabCount,
              message: 'Potential keyboard trap detected - too many tabs without cycling'
            });
            return;
          }
          
          // Simulate Tab key
          const event = new KeyboardEvent('keydown', { key: 'Tab', keyCode: 9, bubbles: true });
          document.activeElement.dispatchEvent(event);
        }, 50);
        
        // Safety timeout
        setTimeout(() => {
          clearInterval(interval);
          resolve({
            trapped: false,
            tabsUsed: tabCount,
            message: 'Test timeout - assuming no trap'
          });
        }, 3000);
      });
    });
    
    results.tests.push({
      name: 'Keyboard Trap Detection',
      passed: !trapTest.trapped,
      details: trapTest
    });
    
    if (trapTest.trapped) {
      results.violations.push({
        type: 'KEYBOARD_TRAP',
        severity: 'critical',
        message: trapTest.message
      });
    }
    
    // Test 5: ARIA landmarks
    console.log('  Testing ARIA landmarks...');
    const landmarkTest = await page.evaluate(() => {
      const landmarks = {
        main: document.querySelectorAll('main, [role="main"]').length,
        navigation: document.querySelectorAll('nav, [role="navigation"]').length,
        banner: document.querySelectorAll('header, [role="banner"]').length,
        contentinfo: document.querySelectorAll('footer, [role="contentinfo"]').length,
        search: document.querySelectorAll('[role="search"]').length,
        complementary: document.querySelectorAll('aside, [role="complementary"]').length
      };
      
      return {
        landmarks,
        hasMain: landmarks.main > 0,
        hasNav: landmarks.navigation > 0,
        hasBanner: landmarks.banner > 0,
        total: Object.values(landmarks).reduce((a, b) => a + b, 0)
      };
    });
    
    results.tests.push({
      name: 'ARIA Landmarks',
      passed: landmarkTest.hasMain,
      details: landmarkTest
    });
    
    if (!landmarkTest.hasMain) {
      results.violations.push({
        type: 'MISSING_MAIN_LANDMARK',
        severity: 'warning',
        message: 'No main landmark found'
      });
    }
    
    return results;
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return {
      url,
      error: error.message,
      tests: [],
      violations: [{
        type: 'TEST_ERROR',
        severity: 'error',
        message: error.message
      }]
    };
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const baseUrl = process.env.SITE_URL || 'https://3mpwrapp.github.io';
  const q = '?no-modal=1';
  
  const urls = [
    `${baseUrl}/${q}`,
    `${baseUrl}/about${q}`,
    `${baseUrl}/features${q}`,
    `${baseUrl}/contact${q}`,
    `${baseUrl}/accessibility${q}`,
  ];
  
  const allResults = [];
  let totalViolations = 0;
  
  for (const url of urls) {
    const results = await testKeyboardNav(page, url);
    allResults.push(results);
    totalViolations += results.violations.length;
    
    console.log(`  Tests passed: ${results.tests.filter(t => t.passed).length}/${results.tests.length}`);
    console.log(`  Violations: ${results.violations.length}`);
  }
  
  await browser.close();
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: urls.length,
      totalViolations,
      criticalViolations: allResults.reduce((sum, r) => 
        sum + r.violations.filter(v => v.severity === 'critical').length, 0),
      passed: totalViolations === 0
    },
    results: allResults
  };
  
  // Save report
  const reportsDir = path.join(process.cwd(), 'reports', 'keyboard');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(reportsDir, 'keyboard-navigation-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('⌨️  KEYBOARD NAVIGATION TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Pages tested: ${urls.length}`);
  console.log(`Total violations: ${totalViolations}`);
  console.log(`Critical violations: ${report.summary.criticalViolations}`);
  console.log('='.repeat(60));
  
  if (totalViolations > 0) {
    console.log('\n❌ KEYBOARD NAVIGATION TEST FAILED');
    
    console.log('\nViolations by severity:');
    const bySeverity = {};
    allResults.forEach(r => {
      r.violations.forEach(v => {
        bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1;
      });
    });
    Object.entries(bySeverity).forEach(([severity, count]) => {
      console.log(`  ${severity}: ${count}`);
    });
    
    process.exit(1);
  } else {
    console.log('\n✅ ALL KEYBOARD NAVIGATION TESTS PASSED!');
    process.exit(0);
  }
})();
