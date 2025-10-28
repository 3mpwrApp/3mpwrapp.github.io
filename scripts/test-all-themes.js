/**
 * Comprehensive Theme Testing Script
 * Tests all pages in all 4 theme combinations:
 * 1. Light mode (default)
 * 2. Dark mode
 * 3. Light + High Contrast
 * 4. Dark + High Contrast
 */

const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');

const BASE_URL = process.env.TEST_URL || 'https://3mpwrapp.pages.dev';

// All pages to test
const PAGES = [
  '/',
  '/about',
  '/features',
  '/user-guide',
  '/blog',
  '/contact',
  '/privacy',
  '/terms',
  '/accessibility',
  '/faq',
  '/roadmap',
  '/beta',
  '/crisis-resources',
  '/accessibility-settings',
  '/app-waitlist'
];

// Theme combinations to test
const THEME_MODES = [
  { name: 'Light Mode', theme: null, contrast: null },
  { name: 'Dark Mode', theme: 'dark', contrast: null },
  { name: 'Light + High Contrast', theme: null, contrast: 'high' },
  { name: 'Dark + High Contrast', theme: 'dark', contrast: 'high' }
];

async function testPageInMode(page, url, mode) {
  console.log(`  Testing: ${url} in ${mode.name}...`);
  
  try {
    await page.goto(`${BASE_URL}${url}?no-modal=1`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Set theme attributes
    await page.evaluate((mode) => {
      if (mode.theme) {
        document.body.setAttribute('data-theme', mode.theme);
      } else {
        document.body.removeAttribute('data-theme');
      }
      
      if (mode.contrast) {
        document.body.setAttribute('data-contrast', mode.contrast);
      } else {
        document.body.removeAttribute('data-contrast');
      }
    }, mode);

    // Wait for styles to apply
    await page.waitForTimeout(500);

    // Run axe accessibility tests
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const violations = results.violations.length;
    const status = violations === 0 ? '✅' : '❌';
    
    console.log(`    ${status} ${violations} violation(s)`);
    
    if (violations > 0) {
      console.log(`    Issues:`);
      results.violations.forEach(v => {
        console.log(`      - ${v.id}: ${v.nodes.length} element(s)`);
      });
    }

    return {
      url,
      mode: mode.name,
      violations,
      issues: results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        count: v.nodes.length,
        description: v.description,
        nodes: v.nodes.map(n => ({
          html: n.html,
          target: n.target,
          failureSummary: n.failureSummary
        }))
      }))
    };
  } catch (error) {
    console.log(`    ❌ ERROR: ${error.message}`);
    return {
      url,
      mode: mode.name,
      violations: -1,
      error: error.message
    };
  }
}

async function main() {
  console.log('🎨 Comprehensive Theme Testing');
  console.log('================================\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Pages: ${PAGES.length}`);
  console.log(`Modes: ${THEME_MODES.length}`);
  console.log(`Total tests: ${PAGES.length * THEME_MODES.length}\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const allResults = [];
  let totalViolations = 0;
  let failedTests = 0;

  for (const mode of THEME_MODES) {
    console.log(`\n📋 Testing ${mode.name}`);
    console.log('─'.repeat(50));
    
    for (const url of PAGES) {
      const result = await testPageInMode(page, url, mode);
      allResults.push(result);
      
      if (result.violations > 0) {
        totalViolations += result.violations;
        failedTests++;
      }
    }
  }

  await browser.close();

  // Generate summary
  console.log('\n\n📊 SUMMARY');
  console.log('═'.repeat(70));
  
  const summary = {
    totalTests: PAGES.length * THEME_MODES.length,
    passedTests: allResults.filter(r => r.violations === 0).length,
    failedTests,
    totalViolations,
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    results: allResults
  };

  // Summary by mode
  console.log('\nResults by Mode:');
  for (const mode of THEME_MODES) {
    const modeResults = allResults.filter(r => r.mode === mode.name);
    const passed = modeResults.filter(r => r.violations === 0).length;
    const failed = modeResults.filter(r => r.violations > 0).length;
    const violations = modeResults.reduce((sum, r) => sum + (r.violations > 0 ? r.violations : 0), 0);
    
    const status = failed === 0 ? '✅' : '❌';
    console.log(`  ${status} ${mode.name}: ${passed}/${modeResults.length} passed (${violations} violations)`);
  }

  // Summary by page
  console.log('\nResults by Page:');
  for (const url of PAGES) {
    const pageResults = allResults.filter(r => r.url === url);
    const passed = pageResults.filter(r => r.violations === 0).length;
    const failed = pageResults.filter(r => r.violations > 0).length;
    
    const status = failed === 0 ? '✅' : '❌';
    console.log(`  ${status} ${url}: ${passed}/${pageResults.length} modes passed`);
  }

  // Overall status
  console.log('\n' + '═'.repeat(70));
  if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED! Website is fully accessible in all modes.');
  } else {
    console.log(`⚠️  ${failedTests} test(s) failed with ${totalViolations} total violation(s)`);
  }

  // Save detailed results
  const reportPath = 'theme-test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);

  // Generate markdown report
  const mdReport = generateMarkdownReport(summary);
  fs.writeFileSync('THEME-TEST-REPORT.md', mdReport);
  console.log(`📄 Markdown report saved to: THEME-TEST-REPORT.md`);

  process.exit(failedTests > 0 ? 1 : 0);
}

function generateMarkdownReport(summary) {
  let md = `# Theme Accessibility Test Report\n\n`;
  md += `**Date**: ${new Date(summary.timestamp).toLocaleString()}\n`;
  md += `**Base URL**: ${summary.baseUrl}\n`;
  md += `**Total Tests**: ${summary.totalTests}\n`;
  md += `**Passed**: ${summary.passedTests}\n`;
  md += `**Failed**: ${summary.failedTests}\n`;
  md += `**Total Violations**: ${summary.totalViolations}\n\n`;

  if (summary.failedTests === 0) {
    md += `## 🎉 SUCCESS\n\nAll ${summary.totalTests} tests passed! The website is fully accessible in all theme modes.\n\n`;
  } else {
    md += `## ⚠️ Issues Found\n\n`;
    md += `${summary.failedTests} test(s) failed with ${summary.totalViolations} total violation(s).\n\n`;
  }

  // Results by mode
  md += `## Results by Mode\n\n`;
  md += `| Mode | Passed | Failed | Violations |\n`;
  md += `|------|--------|--------|------------|\n`;
  
  for (const mode of THEME_MODES) {
    const modeResults = summary.results.filter(r => r.mode === mode.name);
    const passed = modeResults.filter(r => r.violations === 0).length;
    const failed = modeResults.filter(r => r.violations > 0).length;
    const violations = modeResults.reduce((sum, r) => sum + (r.violations > 0 ? r.violations : 0), 0);
    const status = failed === 0 ? '✅' : '❌';
    
    md += `| ${status} ${mode.name} | ${passed} | ${failed} | ${violations} |\n`;
  }

  // Results by page
  md += `\n## Results by Page\n\n`;
  md += `| Page | Light | Dark | Light+HC | Dark+HC |\n`;
  md += `|------|-------|------|----------|----------|\n`;
  
  for (const url of PAGES) {
    const pageResults = summary.results.filter(r => r.url === url);
    const statuses = THEME_MODES.map(mode => {
      const result = pageResults.find(r => r.mode === mode.name);
      return result && result.violations === 0 ? '✅' : '❌';
    });
    
    md += `| ${url} | ${statuses.join(' | ')} |\n`;
  }

  // Detailed violations
  const failedResults = summary.results.filter(r => r.violations > 0);
  if (failedResults.length > 0) {
    md += `\n## Detailed Violations\n\n`;
    
    for (const result of failedResults) {
      md += `### ${result.url} - ${result.mode}\n\n`;
      
      for (const issue of result.issues) {
        md += `#### ${issue.id} (${issue.impact})\n`;
        md += `- **Description**: ${issue.description}\n`;
        md += `- **Affected elements**: ${issue.count}\n\n`;
        
        issue.nodes.forEach((node, idx) => {
          md += `**Element ${idx + 1}**:\n`;
          md += `\`\`\`html\n${node.html}\n\`\`\`\n`;
          md += `- Target: \`${JSON.stringify(node.target)}\`\n`;
          md += `- Issue: ${node.failureSummary}\n\n`;
        });
      }
    }
  }

  return md;
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
