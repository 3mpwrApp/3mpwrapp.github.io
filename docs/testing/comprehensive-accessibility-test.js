/**
 * Comprehensive WCAG 2.2 AAA Accessibility Testing Suite
 * Tests all pages using axe-core with AAA standards
 */

const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const path = require('path');

// Your website URLs - add your production/staging URL
const BASE_URL = 'https://3mpwrapp.github.io';
const LOCAL_URL = 'http://127.0.0.1:4000';

// All pages to test
const PAGES = [
  '/',
  '/about',
  '/accessibility',
  '/accessibility-settings',
  '/contact',
  '/crisis-resources',
  '/faq',
  '/feedback',
  '/privacy',
  '/terms',
  '/resources',
  '/delete-data',
  '/events',
  '/app-waitlist',
  '/newsletter',
  '/search',
  '/roadmap',
  '/security',
  '/status'
];

// WCAG 2.2 AAA specific rules to enable
const WCAG_22_AAA_RULES = [
  // Level A
  'area-alt', 'aria-allowed-attr', 'aria-command-name', 'aria-hidden-body',
  'aria-hidden-focus', 'aria-input-field-name', 'aria-meter-name', 'aria-progressbar-name',
  'aria-required-attr', 'aria-required-children', 'aria-required-parent', 'aria-roledescription',
  'aria-roles', 'aria-toggle-field-name', 'aria-tooltip-name', 'aria-valid-attr-value',
  'aria-valid-attr', 'audio-caption', 'blink', 'button-name', 'bypass', 'color-contrast',
  'definition-list', 'dlitem', 'document-title', 'duplicate-id-active', 'duplicate-id-aria',
  'form-field-multiple-labels', 'frame-title', 'html-has-lang', 'html-lang-valid',
  'html-xml-lang-mismatch', 'image-alt', 'input-button-name', 'input-image-alt',
  'label', 'link-name', 'list', 'listitem', 'marquee', 'meta-refresh', 'meta-viewport',
  'object-alt', 'role-img-alt', 'scrollable-region-focusable', 'select-name',
  'server-side-image-map', 'svg-img-alt', 'td-headers-attr', 'th-has-data-cells',
  'valid-lang', 'video-caption',
  
  // Level AA
  'autocomplete-valid', 'avoid-inline-spacing', 'color-contrast-enhanced',
  'focus-order-semantics', 'frame-tested', 'hidden-content', 'identical-links-same-purpose',
  'label-content-name-mismatch', 'label-title-only', 'landmark-banner-is-top-level',
  'landmark-complementary-is-top-level', 'landmark-contentinfo-is-top-level',
  'landmark-main-is-top-level', 'landmark-no-duplicate-banner', 'landmark-no-duplicate-contentinfo',
  'landmark-no-duplicate-main', 'landmark-one-main', 'landmark-unique', 'link-in-text-block',
  'meta-viewport-large', 'nested-interactive', 'no-autoplay-audio', 'page-has-heading-one',
  'region', 'scope-attr-valid', 'skip-link', 'tabindex', 'target-size',
  
  // Level AAA
  'color-contrast-enhanced', 'focus-order-semantics', 'identical-links-same-purpose',
  'label-content-name-mismatch', 'link-in-text-block', 'meta-viewport-large',
  'p-as-heading', 'table-duplicate-name', 'td-has-header', 'target-size'
];

async function testPage(browser, url, pageInfo) {
  console.log(`\n🔍 Testing: ${pageInfo}`);
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to be fully loaded
    await page.waitForTimeout(2000);
    
    // Run axe with WCAG 2.2 AAA standards
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    
    console.log(`  ✓ Violations: ${accessibilityScanResults.violations.length}`);
    console.log(`  ⚠ Incomplete: ${accessibilityScanResults.incomplete.length}`);
    console.log(`  ✓ Passes: ${accessibilityScanResults.passes.length}`);
    
    await context.close();
    
    return {
      url,
      pageInfo,
      timestamp: new Date().toISOString(),
      violations: accessibilityScanResults.violations,
      incomplete: accessibilityScanResults.incomplete,
      passes: accessibilityScanResults.passes,
      inapplicable: accessibilityScanResults.inapplicable
    };
    
  } catch (error) {
    console.error(`  ❌ Error testing ${pageInfo}: ${error.message}`);
    await context.close();
    return {
      url,
      pageInfo,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function generateHTMLReport(results, outputPath) {
  const totalViolations = results.reduce((sum, r) => sum + (r.violations?.length || 0), 0);
  const totalIncomplete = results.reduce((sum, r) => sum + (r.incomplete?.length || 0), 0);
  const totalPasses = results.reduce((sum, r) => sum + (r.passes?.length || 0), 0);
  const pagesWithIssues = results.filter(r => (r.violations?.length || 0) > 0).length;
  const cleanPages = results.filter(r => !r.error && (r.violations?.length || 0) === 0).length;
  
  // Group violations by impact
  const criticalIssues = [];
  const seriousIssues = [];
  const moderateIssues = [];
  const minorIssues = [];
  
  results.forEach(result => {
    if (result.violations) {
      result.violations.forEach(violation => {
        const issue = {
          page: result.pageInfo,
          url: result.url,
          ...violation
        };
        
        switch (violation.impact) {
          case 'critical': criticalIssues.push(issue); break;
          case 'serious': seriousIssues.push(issue); break;
          case 'moderate': moderateIssues.push(issue); break;
          case 'minor': minorIssues.push(issue); break;
        }
      });
    }
  });
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WCAG 2.2 AAA Accessibility Audit Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            margin-bottom: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 { font-size: 2.5em; margin-bottom: 10px; }
        h2 { color: #667eea; margin: 30px 0 15px; font-size: 1.8em; }
        h3 { color: #764ba2; margin: 20px 0 10px; font-size: 1.3em; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid;
        }
        .stat-card.success { border-left-color: #10b981; }
        .stat-card.warning { border-left-color: #f59e0b; }
        .stat-card.error { border-left-color: #ef4444; }
        .stat-card.info { border-left-color: #3b82f6; }
        .stat-number { font-size: 3em; font-weight: bold; color: #667eea; }
        .stat-label { color: #666; font-size: 1.1em; margin-top: 5px; }
        .issue-card {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid;
        }
        .issue-card.critical { border-left-color: #dc2626; }
        .issue-card.serious { border-left-color: #ea580c; }
        .issue-card.moderate { border-left-color: #f59e0b; }
        .issue-card.minor { border-left-color: #84cc16; }
        .impact-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
            text-transform: uppercase;
            color: white;
        }
        .impact-critical { background: #dc2626; }
        .impact-serious { background: #ea580c; }
        .impact-moderate { background: #f59e0b; }
        .impact-minor { background: #84cc16; }
        .wcag-tag {
            display: inline-block;
            padding: 3px 8px;
            margin: 2px;
            background: #e0e7ff;
            color: #4338ca;
            border-radius: 4px;
            font-size: 0.85em;
        }
        .page-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        .page-link:hover { text-decoration: underline; }
        .help-text {
            margin: 10px 0;
            padding: 15px;
            background: #f0f9ff;
            border-left: 3px solid #3b82f6;
            border-radius: 4px;
        }
        .help-url {
            display: block;
            margin-top: 8px;
            color: #3b82f6;
            font-size: 0.9em;
        }
        .element-list {
            background: #f9fafb;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        .summary-section {
            background: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .progress-bar {
            height: 30px;
            background: #e5e7eb;
            border-radius: 15px;
            overflow: hidden;
            margin: 15px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            transition: width 0.3s ease;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #f3f4f6;
            font-weight: 600;
            color: #374151;
        }
        .status-pass { color: #10b981; font-weight: bold; }
        .status-fail { color: #ef4444; font-weight: bold; }
        .timestamp {
            color: #6b7280;
            font-size: 0.9em;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔍 WCAG 2.2 AAA Accessibility Audit</h1>
            <p>Comprehensive accessibility testing report for 3mpowrApp website</p>
            <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
        </header>

        <div class="stats">
            <div class="stat-card info">
                <div class="stat-number">${results.length}</div>
                <div class="stat-label">Pages Tested</div>
            </div>
            <div class="stat-card ${totalViolations === 0 ? 'success' : 'error'}">
                <div class="stat-number">${totalViolations}</div>
                <div class="stat-label">Total Violations</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-number">${totalIncomplete}</div>
                <div class="stat-label">Incomplete Tests</div>
            </div>
            <div class="stat-card success">
                <div class="stat-number">${totalPasses}</div>
                <div class="stat-label">Tests Passed</div>
            </div>
        </div>

        <div class="summary-section">
            <h2>📊 Compliance Summary</h2>
            <p><strong>Clean Pages:</strong> ${cleanPages} / ${results.length} (${((cleanPages/results.length)*100).toFixed(1)}%)</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(cleanPages/results.length)*100}%">
                    ${((cleanPages/results.length)*100).toFixed(1)}% Compliant
                </div>
            </div>
            
            <h3>Issues by Severity</h3>
            <table>
                <tr>
                    <th>Severity Level</th>
                    <th>Count</th>
                    <th>Status</th>
                </tr>
                <tr>
                    <td><span class="impact-badge impact-critical">Critical</span></td>
                    <td>${criticalIssues.length}</td>
                    <td class="${criticalIssues.length === 0 ? 'status-pass' : 'status-fail'}">
                        ${criticalIssues.length === 0 ? '✓ Pass' : '✗ Needs Attention'}
                    </td>
                </tr>
                <tr>
                    <td><span class="impact-badge impact-serious">Serious</span></td>
                    <td>${seriousIssues.length}</td>
                    <td class="${seriousIssues.length === 0 ? 'status-pass' : 'status-fail'}">
                        ${seriousIssues.length === 0 ? '✓ Pass' : '✗ Needs Attention'}
                    </td>
                </tr>
                <tr>
                    <td><span class="impact-badge impact-moderate">Moderate</span></td>
                    <td>${moderateIssues.length}</td>
                    <td class="${moderateIssues.length === 0 ? 'status-pass' : 'status-fail'}">
                        ${moderateIssues.length === 0 ? '✓ Pass' : '✗ Review Recommended'}
                    </td>
                </tr>
                <tr>
                    <td><span class="impact-badge impact-minor">Minor</span></td>
                    <td>${minorIssues.length}</td>
                    <td class="${minorIssues.length === 0 ? 'status-pass' : 'status-fail'}">
                        ${minorIssues.length === 0 ? '✓ Pass' : '⚠ Optional Fix'}
                    </td>
                </tr>
            </table>
        </div>

        ${criticalIssues.length > 0 ? `
        <div class="summary-section">
            <h2>🚨 Critical Issues (Immediate Action Required)</h2>
            ${criticalIssues.map(issue => `
                <div class="issue-card critical">
                    <h3>${issue.description}</h3>
                    <p><strong>Page:</strong> <a href="${issue.url}" class="page-link">${issue.page}</a></p>
                    <p><strong>Rule:</strong> <code>${issue.id}</code></p>
                    <div class="help-text">
                        <strong>How to Fix:</strong> ${issue.help}
                        <a href="${issue.helpUrl}" class="help-url" target="_blank">Learn more →</a>
                    </div>
                    <p><strong>Affected Elements:</strong> ${issue.nodes.length}</p>
                    <div class="element-list">
                        ${issue.nodes.slice(0, 3).map(node => 
                            `<div>${node.html}</div><div style="color: #ef4444; margin: 5px 0;">${node.failureSummary}</div>`
                        ).join('')}
                        ${issue.nodes.length > 3 ? `<div>... and ${issue.nodes.length - 3} more</div>` : ''}
                    </div>
                    <div>
                        ${issue.tags.map(tag => `<span class="wcag-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        ` : '<div class="summary-section"><h2>✅ No Critical Issues Found!</h2></div>'}

        ${seriousIssues.length > 0 ? `
        <div class="summary-section">
            <h2>⚠️ Serious Issues (High Priority)</h2>
            ${seriousIssues.map(issue => `
                <div class="issue-card serious">
                    <h3>${issue.description}</h3>
                    <p><strong>Page:</strong> <a href="${issue.url}" class="page-link">${issue.page}</a></p>
                    <p><strong>Rule:</strong> <code>${issue.id}</code></p>
                    <div class="help-text">
                        <strong>How to Fix:</strong> ${issue.help}
                        <a href="${issue.helpUrl}" class="help-url" target="_blank">Learn more →</a>
                    </div>
                    <p><strong>Affected Elements:</strong> ${issue.nodes.length}</p>
                    <div class="element-list">
                        ${issue.nodes.slice(0, 2).map(node => 
                            `<div>${node.html}</div><div style="color: #ea580c; margin: 5px 0;">${node.failureSummary}</div>`
                        ).join('')}
                        ${issue.nodes.length > 2 ? `<div>... and ${issue.nodes.length - 2} more</div>` : ''}
                    </div>
                    <div>
                        ${issue.tags.map(tag => `<span class="wcag-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        ` : '<div class="summary-section"><h2>✅ No Serious Issues Found!</h2></div>'}

        ${moderateIssues.length > 0 ? `
        <div class="summary-section">
            <h2>📋 Moderate Issues (Should Fix)</h2>
            ${moderateIssues.slice(0, 10).map(issue => `
                <div class="issue-card moderate">
                    <h3>${issue.description}</h3>
                    <p><strong>Page:</strong> <a href="${issue.url}" class="page-link">${issue.page}</a></p>
                    <p><strong>Rule:</strong> <code>${issue.id}</code></p>
                    <div class="help-text">
                        ${issue.help}
                        <a href="${issue.helpUrl}" class="help-url" target="_blank">Learn more →</a>
                    </div>
                    <div>
                        ${issue.tags.map(tag => `<span class="wcag-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `).join('')}
            ${moderateIssues.length > 10 ? `<p><em>Showing 10 of ${moderateIssues.length} moderate issues</em></p>` : ''}
        </div>
        ` : ''}

        <div class="summary-section">
            <h2>📄 Page-by-Page Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Page</th>
                        <th>Critical</th>
                        <th>Serious</th>
                        <th>Moderate</th>
                        <th>Minor</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(result => {
                        const critical = result.violations?.filter(v => v.impact === 'critical').length || 0;
                        const serious = result.violations?.filter(v => v.impact === 'serious').length || 0;
                        const moderate = result.violations?.filter(v => v.impact === 'moderate').length || 0;
                        const minor = result.violations?.filter(v => v.impact === 'minor').length || 0;
                        const total = critical + serious + moderate + minor;
                        
                        return `
                        <tr>
                            <td><a href="${result.url}" class="page-link">${result.pageInfo}</a></td>
                            <td>${critical > 0 ? `<span style="color: #dc2626;">${critical}</span>` : '0'}</td>
                            <td>${serious > 0 ? `<span style="color: #ea580c;">${serious}</span>` : '0'}</td>
                            <td>${moderate > 0 ? `<span style="color: #f59e0b;">${moderate}</span>` : '0'}</td>
                            <td>${minor > 0 ? `<span style="color: #84cc16;">${minor}</span>` : '0'}</td>
                            <td class="${total === 0 ? 'status-pass' : 'status-fail'}">
                                ${total === 0 ? '✓ Pass' : `✗ ${total} issues`}
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <div class="summary-section">
            <h2>🎯 Recommendations</h2>
            <ul style="line-height: 2;">
                ${criticalIssues.length > 0 ? '<li><strong>Priority 1:</strong> Fix all critical issues immediately - these prevent users from accessing content</li>' : ''}
                ${seriousIssues.length > 0 ? '<li><strong>Priority 2:</strong> Address serious issues - these significantly impact user experience</li>' : ''}
                ${moderateIssues.length > 0 ? '<li><strong>Priority 3:</strong> Review and fix moderate issues for better accessibility</li>' : ''}
                ${totalViolations === 0 ? '<li>✅ <strong>Excellent!</strong> Your website passes all automated WCAG 2.2 AAA tests!</li>' : ''}
                <li>Run manual testing for keyboard navigation, screen reader compatibility, and cognitive accessibility</li>
                <li>Test with real users who have disabilities</li>
                <li>Review color contrast ratios in different lighting conditions</li>
                <li>Validate forms work correctly with assistive technologies</li>
            </ul>
        </div>

        <footer class="summary-section">
            <p><strong>Testing Tools:</strong> axe-core with WCAG 2.2 Level AAA standards</p>
            <p><strong>Standards:</strong> WCAG 2.0, WCAG 2.1, WCAG 2.2 (Level A, AA, AAA)</p>
            <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
        </footer>
    </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, html);
  console.log(`\n✅ HTML report saved to: ${outputPath}`);
}

async function runTests() {
  console.log('🚀 Starting Comprehensive WCAG 2.2 AAA Accessibility Testing...\n');
  console.log(`Testing ${PAGES.length} pages with axe-core\n`);
  
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  // Test with production URL
  console.log('Testing production site...');
  for (const page of PAGES) {
    const url = `${BASE_URL}${page}`;
    const result = await testPage(browser, url, page);
    results.push(result);
  }
  
  await browser.close();
  
  // Generate reports
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const jsonPath = path.join(__dirname, `accessibility-audit-${timestamp}.json`);
  const htmlPath = path.join(__dirname, `accessibility-audit-${timestamp}.html`);
  
  // Save JSON report
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ JSON report saved to: ${jsonPath}`);
  
  // Generate HTML report
  await generateHTMLReport(results, htmlPath);
  
  // Print summary
  const totalViolations = results.reduce((sum, r) => sum + (r.violations?.length || 0), 0);
  const totalIncomplete = results.reduce((sum, r) => sum + (r.incomplete?.length || 0), 0);
  const cleanPages = results.filter(r => !r.error && (r.violations?.length || 0) === 0).length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TESTING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Pages Tested: ${results.length}`);
  console.log(`Total Violations: ${totalViolations}`);
  console.log(`Incomplete Tests: ${totalIncomplete}`);
  console.log(`Clean Pages: ${cleanPages}/${results.length} (${((cleanPages/results.length)*100).toFixed(1)}%)`);
  console.log('='.repeat(60));
  
  if (totalViolations === 0) {
    console.log('\n🎉 CONGRATULATIONS! All pages pass WCAG 2.2 AAA automated tests!');
  } else {
    console.log(`\n⚠️  Found ${totalViolations} accessibility issues that need attention.`);
  }
  
  console.log(`\n📄 Open ${htmlPath} in your browser to view the detailed report.`);
}

runTests().catch(console.error);
