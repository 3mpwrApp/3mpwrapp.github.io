/**
 * Enhanced axe-core AAA Testing
 * Tests against WCAG 2.2 Level AAA standards
 */

const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = process.env.SITE_URL || 'https://3mpwrapp.github.io';
  const q = '?no-modal=1';
  const mode = (process.env.AXE_MODE || 'quick').toLowerCase();
  
  const quick = [
    `${baseUrl}/${q}`,
    `${baseUrl}/about${q}`,
    `${baseUrl}/features${q}`,
    `${baseUrl}/user-guide${q}`,
    `${baseUrl}/contact${q}`,
    `${baseUrl}/accessibility${q}`,
  ];
  
  const full = [
    `${baseUrl}/${q}`,
    `${baseUrl}/about${q}`,
    `${baseUrl}/features${q}`,
    `${baseUrl}/user-guide${q}`,
    `${baseUrl}/community${q}`,
    `${baseUrl}/resources${q}`,
    `${baseUrl}/wellness${q}`,
    `${baseUrl}/contact${q}`,
    `${baseUrl}/newsletter${q}`,
    `${baseUrl}/blog${q}`,
    `${baseUrl}/beta${q}`,
    `${baseUrl}/search${q}`,
    `${baseUrl}/site-map${q}`,
    `${baseUrl}/accessibility${q}`,
    `${baseUrl}/privacy${q}`,
    `${baseUrl}/campaigns${q}`,
    `${baseUrl}/events${q}`,
  ];
  
  const urls = mode === 'full' ? full : quick;
  const report = [];
  let totalViolations = 0;
  
  console.log(`🔍 Running axe-core AAA tests (${mode} mode)`);
  console.log(`Testing ${urls.length} URLs\n`);

  async function gotoWithRetry(p, url, attempts = 3) {
    let lastErr;
    for (let i = 1; i <= attempts; i++) {
      try {
        await p.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await p.waitForTimeout(500);
        return;
      } catch (e) {
        lastErr = e;
        console.warn(`  Retry ${i}/${attempts}: ${e.message}`);
        await p.waitForTimeout(1000 * i);
      }
    }
    throw lastErr;
  }

  for (const url of urls) {
    try {
      await gotoWithRetry(page, url, 3);
      
      // Run axe with AAA rules
      const results = await new AxeBuilder({ page })
        .withTags([
          'wcag2a',
          'wcag2aa', 
          'wcag2aaa',
          'wcag21a',
          'wcag21aa',
          'wcag21aaa',
          'wcag22a',
          'wcag22aa',
          'wcag22aaa'
        ])
        .options({
          runOnly: {
            type: 'tag',
            values: ['wcag2aaa', 'wcag21aaa', 'wcag22aaa', 'best-practice']
          },
          resultTypes: ['violations', 'incomplete']
        })
        .analyze();

      const violations = results.violations.length;
      const incomplete = results.incomplete?.length || 0;
      
      console.log(`${url}`);
      console.log(`  Violations: ${violations}`);
      console.log(`  Incomplete: ${incomplete}`);
      
      if (violations > 0) {
        console.log('  Top issues:');
        results.violations.slice(0, 3).forEach(v => {
          console.log(`    - ${v.id}: ${v.description} (${v.nodes.length} nodes)`);
        });
      }
      console.log('');
      
      report.push({ 
        url, 
        violations: results.violations,
        incomplete: results.incomplete || [],
        passes: results.passes || []
      });
      
      totalViolations += violations;
      
    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error.message);
      report.push({
        url,
        error: error.message,
        violations: [],
        incomplete: []
      });
    }
  }

  await browser.close();

  // Save full JSON report
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(reportsDir, 'axe-aaa-report.json'),
    JSON.stringify(report, null, 2)
  );

  // Generate summary markdown
  let summary = '## axe-core AAA Test Results\n\n';
  summary += `**Total URLs tested:** ${urls.length}\n`;
  summary += `**Total violations:** ${totalViolations}\n\n`;
  
  if (totalViolations > 0) {
    summary += '### Violations by Impact\n\n';
    const byImpact = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    report.forEach(r => {
      r.violations.forEach(v => {
        byImpact[v.impact] = (byImpact[v.impact] || 0) + v.nodes.length;
      });
    });
    
    Object.entries(byImpact).forEach(([impact, count]) => {
      if (count > 0) {
        summary += `- **${impact}**: ${count}\n`;
      }
    });
    
    summary += '\n### Most Common Issues\n\n';
    const issueCount = {};
    report.forEach(r => {
      r.violations.forEach(v => {
        issueCount[v.id] = (issueCount[v.id] || 0) + v.nodes.length;
      });
    });
    
    Object.entries(issueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([id, count]) => {
        summary += `- **${id}**: ${count} occurrences\n`;
      });
  } else {
    summary += '✅ **No violations found!**\n';
  }
  
  fs.writeFileSync(
    path.join(reportsDir, 'axe-aaa-summary.md'),
    summary
  );

  // GitHub Actions step summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '\n' + summary);
  }

  // Print console summary
  console.log('='.repeat(60));
  console.log('📊 AXE-CORE AAA TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`URLs tested: ${urls.length}`);
  console.log(`Total violations: ${totalViolations}`);
  console.log('='.repeat(60));

  if (totalViolations > 0) {
    console.log('\n❌ AXE-CORE AAA TEST FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ ALL AXE-CORE AAA TESTS PASSED!');
    process.exit(0);
  }
})();
