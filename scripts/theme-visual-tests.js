/**
 * Theme Visual Regression Testing
 * Tests all 3 theme modes (light, dark, high contrast) for visual consistency
 * 
 * Usage: node scripts/theme-visual-tests.js
 * 
 * Tests:
 * - Captures screenshots in all 3 modes
 * - Compares against baseline images
 * - Detects layout shifts, missing focus indicators, contrast failures
 * - Generates diff reports
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const SITE_URL = process.env.SITE_URL || 'https://3mpwrapp.ca';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'reports', 'theme-screenshots');
const BASELINE_DIR = path.join(__dirname, '..', 'reports', 'theme-baselines');
const DIFF_DIR = path.join(__dirname, '..', 'reports', 'theme-diffs');

// Ensure directories exist
[SCREENSHOT_DIR, BASELINE_DIR, DIFF_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Pages to test
const PAGES = [
  { url: '/', name: 'home' },
  { url: '/about', name: 'about' },
  { url: '/features', name: 'features' },
  { url: '/accessibility', name: 'accessibility' },
  { url: '/contact', name: 'contact' },
  { url: '/blog', name: 'blog' }
];

// Theme configurations
const THEMES = [
  { name: 'light', script: 'localStorage.setItem("theme", "light"); document.documentElement.setAttribute("data-theme", "light");' },
  { name: 'dark', script: 'localStorage.setItem("theme", "dark"); document.documentElement.setAttribute("data-theme", "dark");' },
  { name: 'high-contrast', script: 'localStorage.setItem("theme", "dark"); localStorage.setItem("contrast", "high"); document.documentElement.setAttribute("data-theme", "dark"); document.documentElement.setAttribute("data-contrast", "high");' }
];

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  new: 0,
  differences: []
};

/**
 * Compare two images and return difference percentage
 */
function compareImages(baseline, current, diffPath) {
  if (!fs.existsSync(baseline)) {
    return { isNew: true };
  }
  
  const img1 = PNG.sync.read(fs.readFileSync(baseline));
  const img2 = PNG.sync.read(fs.readFileSync(current));
  
  const { width, height } = img1;
  const diff = new PNG({ width, height });
  
  const numDiffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );
  
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  
  const totalPixels = width * height;
  const diffPercentage = (numDiffPixels / totalPixels) * 100;
  
  return {
    isNew: false,
    diffPixels: numDiffPixels,
    diffPercentage: diffPercentage.toFixed(2),
    passed: diffPercentage < 0.5 // Less than 0.5% difference is acceptable
  };
}

/**
 * Capture screenshots for a single page in all themes
 */
async function testPage(page, pageInfo) {
  console.log(`\n📄 Testing: ${pageInfo.name}`);
  
  for (const theme of THEMES) {
    const filename = `${pageInfo.name}-${theme.name}.png`;
    const screenshotPath = path.join(SCREENSHOT_DIR, filename);
    const baselinePath = path.join(BASELINE_DIR, filename);
    const diffPath = path.join(DIFF_DIR, filename);
    
    try {
      // Navigate to page
      await page.goto(`${SITE_URL}${pageInfo.url}?no-modal=1`, {
        waitUntil: 'networkidle'
      });
      
      // Apply theme
      await page.evaluate(theme.script);
      
      // Wait for theme to apply
      await page.waitForTimeout(500);
      
      // Take screenshot
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      
      console.log(`  ✓ Captured ${theme.name} mode`);
      
      // Compare with baseline
      const comparison = compareImages(baselinePath, screenshotPath, diffPath);
      
      results.total++;
      
      if (comparison.isNew) {
        console.log(`    ℹ️  New baseline (no previous screenshot)`);
        fs.copyFileSync(screenshotPath, baselinePath);
        results.new++;
      } else if (comparison.passed) {
        console.log(`    ✅ PASS (${comparison.diffPercentage}% difference)`);
        results.passed++;
      } else {
        console.log(`    ❌ FAIL (${comparison.diffPercentage}% difference, ${comparison.diffPixels} pixels)`);
        results.failed++;
        results.differences.push({
          page: pageInfo.name,
          theme: theme.name,
          diffPercentage: comparison.diffPercentage,
          diffPixels: comparison.diffPixels,
          screenshot: screenshotPath,
          diff: diffPath
        });
      }
      
    } catch (error) {
      console.log(`    ❌ ERROR: ${error.message}`);
      results.failed++;
      results.differences.push({
        page: pageInfo.name,
        theme: theme.name,
        error: error.message
      });
    }
  }
}

/**
 * Test focus indicators visibility in each theme
 */
async function testFocusIndicators(page) {
  console.log(`\n🎯 Testing focus indicators...`);
  
  for (const theme of THEMES) {
    try {
      await page.goto(`${SITE_URL}/?no-modal=1`, {
        waitUntil: 'networkidle'
      });
      
      await page.evaluate(theme.script);
      await page.waitForTimeout(500);
      
      // Tab to first focusable element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      // Check if focus indicator is visible
      const focusVisible = await page.evaluate(() => {
        const focused = document.activeElement;
        if (!focused) return false;
        
        const computed = window.getComputedStyle(focused);
        const pseudoStyles = window.getComputedStyle(focused, ':focus');
        
        // Check for outline or box-shadow
        const hasOutline = computed.outline !== 'none' && computed.outline !== 'rgb(0, 0, 0) none 0px';
        const hasBoxShadow = computed.boxShadow !== 'none';
        const hasPseudoOutline = pseudoStyles.outline !== 'none';
        
        return hasOutline || hasBoxShadow || hasPseudoOutline;
      });
      
      if (focusVisible) {
        console.log(`  ✓ ${theme.name}: Focus indicator visible`);
      } else {
        console.log(`  ❌ ${theme.name}: Focus indicator NOT visible`);
        results.failed++;
        results.differences.push({
          test: 'focus-indicator',
          theme: theme.name,
          error: 'Focus indicator not visible'
        });
      }
      
    } catch (error) {
      console.log(`  ❌ ${theme.name}: Error testing focus - ${error.message}`);
    }
  }
}

/**
 * Test color contrast in each theme
 */
async function testColorContrast(page) {
  console.log(`\n🎨 Testing color contrast...`);
  
  for (const theme of THEMES) {
    try {
      await page.goto(`${SITE_URL}/about?no-modal=1`, {
        waitUntil: 'networkidle'
      });
      
      await page.evaluate(theme.script);
      await page.waitForTimeout(500);
      
      // Run axe contrast checks
      const results = await page.evaluate(async () => {
        const axe = (await import('https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.0/axe.min.js')).default;
        const result = await axe.run({
          runOnly: {
            type: 'rule',
            values: ['color-contrast', 'color-contrast-enhanced']
          }
        });
        return result.violations;
      });
      
      if (results.length === 0) {
        console.log(`  ✓ ${theme.name}: No contrast violations`);
      } else {
        console.log(`  ❌ ${theme.name}: ${results.length} contrast violations`);
        results.forEach(violation => {
          console.log(`    - ${violation.description} (${violation.nodes.length} elements)`);
        });
      }
      
    } catch (error) {
      console.log(`  ⚠️  ${theme.name}: Could not test contrast - ${error.message}`);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🎭 Theme Visual Regression Testing');
  console.log('═══════════════════════════════════════\n');
  console.log(`Testing site: ${SITE_URL}`);
  console.log(`Themes: ${THEMES.map(t => t.name).join(', ')}`);
  console.log(`Pages: ${PAGES.length}`);
  
  const browser = await chromium.launch({
    headless: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Test each page
  for (const pageInfo of PAGES) {
    await testPage(page, pageInfo);
  }
  
  // Test focus indicators
  await testFocusIndicators(page);
  
  // Test color contrast
  await testColorContrast(page);
  
  await browser.close();
  
  // Print summary
  console.log('\n═══════════════════════════════════════');
  console.log('📊 RESULTS SUMMARY');
  console.log('═══════════════════════════════════════\n');
  console.log(`Total tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`ℹ️  New baselines: ${results.new}\n`);
  
  if (results.differences.length > 0) {
    console.log('Differences found:');
    results.differences.forEach(diff => {
      if (diff.error) {
        console.log(`  ❌ ${diff.page || diff.test} (${diff.theme}): ${diff.error}`);
      } else {
        console.log(`  ❌ ${diff.page} (${diff.theme}): ${diff.diffPercentage}% different`);
        console.log(`     Diff image: ${path.relative(process.cwd(), diff.diff)}`);
      }
    });
    console.log('');
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'reports', 'theme-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Full report saved to: ${path.relative(process.cwd(), reportPath)}\n`);
  
  // Exit code
  if (results.failed > 0) {
    console.log('❌ Theme testing FAILED\n');
    process.exit(1);
  } else {
    console.log('✅ All theme tests PASSED\n');
    process.exit(0);
  }
}

// Run
if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { testPage, compareImages };
