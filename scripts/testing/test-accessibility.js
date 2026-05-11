/**
 * Automated Accessibility Testing Script
 * Tests all pages for WCAG AAA compliance
 */

const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Pages to test
const pages = [
  'http://localhost:4000/',
  'http://localhost:4000/features/',
  'http://localhost:4000/contact/',
  'http://localhost:4000/user-guide/',
  'http://localhost:4000/about/',
  'http://localhost:4000/blog/',
  'http://localhost:4000/privacy/',
  'http://localhost:4000/terms/'
];

// Themes to test
const themes = ['light', 'dark', 'high-contrast'];

async function testPage(browser, url, theme) {
  const page = await browser.newPage();
  
  // Set viewport for consistent testing
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log(`\n🧪 Testing: ${url} (${theme} mode)`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Set theme
    if (theme === 'dark') {
      await page.evaluate(() => {
        document.body.setAttribute('data-theme', 'dark');
      });
    } else if (theme === 'high-contrast') {
      await page.evaluate(() => {
        document.body.setAttribute('data-contrast', 'high');
      });
    }
    
    // Run axe tests
    const results = await new AxePuppeteer(page)
      .withTags(['wcag2aaa', 'wcag21aaa', 'best-practice'])
      .analyze();
    
    // Filter results
    const violations = results.violations;
    const passes = results.passes;
    
    console.log(`  ✅ Passed: ${passes.length} checks`);
    console.log(`  ❌ Violations: ${violations.length}`);
    
    // Report violations
    if (violations.length > 0) {
      console.log(`\n  ⚠️  Issues found:`);
      violations.forEach((violation, index) => {
        console.log(`\n  ${index + 1}. ${violation.id}`);
        console.log(`     Impact: ${violation.impact}`);
        console.log(`     Description: ${violation.description}`);
        console.log(`     Affected elements: ${violation.nodes.length}`);
        
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`       ${nodeIndex + 1}. ${node.html.substring(0, 80)}...`);
          console.log(`          Fix: ${node.failureSummary}`);
        });
      });
    }
    
    await page.close();
    return { url, theme, violations, passes };
    
  } catch (error) {
    console.error(`  ❌ Error testing ${url}:`, error.message);
    await page.close();
    return { url, theme, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Accessibility Tests...\n');
  console.log('═'.repeat(60));
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  
  // Test each page in each theme
  for (const url of pages) {
    for (const theme of themes) {
      const result = await testPage(browser, url, theme);
      results.push(result);
    }
  }
  
  await browser.close();
  
  // Generate summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(60));
  
  const totalViolations = results.reduce((sum, r) => sum + (r.violations?.length || 0), 0);
  const totalPasses = results.reduce((sum, r) => sum + (r.passes?.length || 0), 0);
  const totalErrors = results.filter(r => r.error).length;
  
  console.log(`\n✅ Total Passed Checks: ${totalPasses}`);
  console.log(`❌ Total Violations: ${totalViolations}`);
  console.log(`⚠️  Total Errors: ${totalErrors}`);
  
  // Group violations by impact
  const violationsByImpact = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0
  };
  
  results.forEach(result => {
    if (result.violations) {
      result.violations.forEach(v => {
        violationsByImpact[v.impact] = (violationsByImpact[v.impact] || 0) + 1;
      });
    }
  });
  
  console.log(`\n📊 Violations by Impact:`);
  console.log(`   🔴 Critical: ${violationsByImpact.critical}`);
  console.log(`   🟠 Serious: ${violationsByImpact.serious}`);
  console.log(`   🟡 Moderate: ${violationsByImpact.moderate}`);
  console.log(`   🟢 Minor: ${violationsByImpact.minor}`);
  
  // Save detailed report
  const reportDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, `accessibility-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`\n📝 Detailed report saved to: ${reportPath}`);
  
  // Exit with appropriate code
  if (totalViolations > 0 || totalErrors > 0) {
    console.log(`\n❌ Tests FAILED: ${totalViolations} violations, ${totalErrors} errors`);
    process.exit(1);
  } else {
    console.log(`\n✅ All tests PASSED!`);
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
