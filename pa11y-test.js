/**
 * Pa11y WCAG 2.2 AAA Testing Suite
 * Comprehensive accessibility testing with HTML_CodeSniffer
 */

const pa11y = require('pa11y');
const fs = require('fs');
const path = require('path');

const PAGES = [
  { url: 'https://3mpwrapp.github.io/', name: 'Home' },
  { url: 'https://3mpwrapp.github.io/about', name: 'About' },
  { url: 'https://3mpwrapp.github.io/accessibility', name: 'Accessibility' },
  { url: 'https://3mpwrapp.github.io/accessibility-settings', name: 'Accessibility Settings' },
  { url: 'https://3mpwrapp.github.io/contact', name: 'Contact' },
  { url: 'https://3mpwrapp.github.io/crisis-resources', name: 'Crisis Resources' },
  { url: 'https://3mpwrapp.github.io/faq', name: 'FAQ' },
  { url: 'https://3mpwrapp.github.io/feedback', name: 'Feedback' },
  { url: 'https://3mpwrapp.github.io/privacy', name: 'Privacy' },
  { url: 'https://3mpwrapp.github.io/terms', name: 'Terms' },
  { url: 'https://3mpwrapp.github.io/resources', name: 'Resources' },
  { url: 'https://3mpwrapp.github.io/delete-data', name: 'Delete Data' },
  { url: 'https://3mpwrapp.github.io/events', name: 'Events' },
  { url: 'https://3mpwrapp.github.io/app-waitlist', name: 'App Waitlist' },
  { url: 'https://3mpwrapp.github.io/newsletter', name: 'Newsletter' },
  { url: 'https://3mpwrapp.github.io/search', name: 'Search' },
  { url: 'https://3mpwrapp.github.io/roadmap', name: 'Roadmap' },
  { url: 'https://3mpwrapp.github.io/security', name: 'Security' },
  { url: 'https://3mpwrapp.github.io/status', name: 'Status' }
];

async function testPage(page) {
  console.log(`\n🔍 Testing: ${page.name} (${page.url})`);
  
  try {
    const results = await pa11y(page.url, {
      standard: 'WCAG2AAA',
      timeout: 30000,
      wait: 2000,
      chromeLaunchConfig: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      },
      includeNotices: true,
      includeWarnings: true
    });
    
    const errors = results.issues.filter(i => i.type === 'error');
    const warnings = results.issues.filter(i => i.type === 'warning');
    const notices = results.issues.filter(i => i.type === 'notice');
    
    console.log(`  ❌ Errors: ${errors.length}`);
    console.log(`  ⚠️  Warnings: ${warnings.length}`);
    console.log(`  ℹ️  Notices: ${notices.length}`);
    
    return {
      page: page.name,
      url: page.url,
      timestamp: new Date().toISOString(),
      documentTitle: results.documentTitle,
      pageUrl: results.pageUrl,
      issues: results.issues
    };
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return {
      page: page.name,
      url: page.url,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

function generateHTMLReport(results, outputPath) {
  const totalErrors = results.reduce((sum, r) => sum + (r.issues?.filter(i => i.type === 'error').length || 0), 0);
  const totalWarnings = results.reduce((sum, r) => sum + (r.issues?.filter(i => i.type === 'warning').length || 0), 0);
  const totalNotices = results.reduce((sum, r) => sum + (r.issues?.filter(i => i.type === 'notice').length || 0), 0);
  const cleanPages = results.filter(r => !r.error && (!r.issues || r.issues.filter(i => i.type === 'error').length === 0)).length;
  
  // Group issues by WCAG code
  const issuesByCode = {};
  results.forEach(result => {
    if (result.issues) {
      result.issues.forEach(issue => {
        const code = issue.code;
        if (!issuesByCode[code]) {
          issuesByCode[code] = {
            code,
            message: issue.message,
            type: issue.type,
            pages: []
          };
        }
        issuesByCode[code].pages.push({
          page: result.page,
          url: result.url,
          selector: issue.selector,
          context: issue.context
        });
      });
    }
  });
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pa11y WCAG 2.2 AAA Accessibility Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 40px 20px;
            margin-bottom: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 { font-size: 2.5em; margin-bottom: 10px; }
        h2 { color: #6366f1; margin: 30px 0 15px; font-size: 1.8em; }
        h3 { color: #8b5cf6; margin: 20px 0 10px; font-size: 1.3em; }
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
        .stat-number { font-size: 3em; font-weight: bold; color: #6366f1; }
        .stat-label { color: #666; font-size: 1.1em; margin-top: 5px; }
        .issue-card {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid;
        }
        .issue-card.error { border-left-color: #ef4444; }
        .issue-card.warning { border-left-color: #f59e0b; }
        .issue-card.notice { border-left-color: #3b82f6; }
        .type-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
            text-transform: uppercase;
            color: white;
        }
        .type-error { background: #ef4444; }
        .type-warning { background: #f59e0b; }
        .type-notice { background: #3b82f6; }
        .code-badge {
            display: inline-block;
            padding: 3px 8px;
            margin: 2px;
            background: #e0e7ff;
            color: #4338ca;
            border-radius: 4px;
            font-size: 0.85em;
            font-family: 'Courier New', monospace;
        }
        .page-link {
            color: #6366f1;
            text-decoration: none;
            font-weight: 500;
        }
        .page-link:hover { text-decoration: underline; }
        .summary-section {
            background: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .context-box {
            background: #f9fafb;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
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
        }
        .status-pass { color: #10b981; font-weight: bold; }
        .status-fail { color: #ef4444; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔍 Pa11y WCAG 2.2 AAA Report</h1>
            <p>HTML_CodeSniffer accessibility testing for 3mpowrApp</p>
            <p style="margin-top: 10px; opacity: 0.9;">Generated: ${new Date().toLocaleString()}</p>
        </header>

        <div class="stats">
            <div class="stat-card info">
                <div class="stat-number">${results.length}</div>
                <div class="stat-label">Pages Tested</div>
            </div>
            <div class="stat-card ${totalErrors === 0 ? 'success' : 'error'}">
                <div class="stat-number">${totalErrors}</div>
                <div class="stat-label">Errors</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-number">${totalWarnings}</div>
                <div class="stat-label">Warnings</div>
            </div>
            <div class="stat-card info">
                <div class="stat-number">${totalNotices}</div>
                <div class="stat-label">Notices</div>
            </div>
        </div>

        <div class="summary-section">
            <h2>📊 Compliance Summary</h2>
            <p><strong>Error-Free Pages:</strong> ${cleanPages} / ${results.length} (${((cleanPages/results.length)*100).toFixed(1)}%)</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(cleanPages/results.length)*100}%">
                    ${((cleanPages/results.length)*100).toFixed(1)}% Compliant
                </div>
            </div>
        </div>

        ${Object.keys(issuesByCode).length > 0 ? `
        <div class="summary-section">
            <h2>🔍 Issues by WCAG Code</h2>
            ${Object.values(issuesByCode)
              .sort((a, b) => b.pages.length - a.pages.length)
              .map(issue => `
                <div class="issue-card ${issue.type}">
                    <h3>
                        <span class="type-badge type-${issue.type}">${issue.type}</span>
                        <span class="code-badge">${issue.code}</span>
                    </h3>
                    <p><strong>Message:</strong> ${issue.message}</p>
                    <p><strong>Affected Pages:</strong> ${issue.pages.length}</p>
                    <details style="margin-top: 10px;">
                        <summary style="cursor: pointer; color: #6366f1; font-weight: 500;">
                            View affected pages and elements
                        </summary>
                        <div style="margin-top: 10px;">
                            ${issue.pages.slice(0, 5).map(page => `
                                <div style="margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 4px;">
                                    <p><strong>Page:</strong> <a href="${page.url}" class="page-link">${page.page}</a></p>
                                    <p><strong>Selector:</strong> <code>${page.selector}</code></p>
                                    ${page.context ? `<div class="context-box">${page.context.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>` : ''}
                                </div>
                            `).join('')}
                            ${issue.pages.length > 5 ? `<p><em>... and ${issue.pages.length - 5} more occurrences</em></p>` : ''}
                        </div>
                    </details>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="summary-section">
            <h2>📄 Page-by-Page Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Page</th>
                        <th>Errors</th>
                        <th>Warnings</th>
                        <th>Notices</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(result => {
                        const errors = result.issues?.filter(i => i.type === 'error').length || 0;
                        const warnings = result.issues?.filter(i => i.type === 'warning').length || 0;
                        const notices = result.issues?.filter(i => i.type === 'notice').length || 0;
                        
                        return `
                        <tr>
                            <td><a href="${result.url}" class="page-link">${result.page}</a></td>
                            <td>${errors > 0 ? `<span style="color: #ef4444;">${errors}</span>` : '0'}</td>
                            <td>${warnings > 0 ? `<span style="color: #f59e0b;">${warnings}</span>` : '0'}</td>
                            <td>${notices > 0 ? `<span style="color: #3b82f6;">${notices}</span>` : '0'}</td>
                            <td class="${errors === 0 ? 'status-pass' : 'status-fail'}">
                                ${errors === 0 ? '✓ Pass' : `✗ ${errors} errors`}
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <div class="summary-section">
            <h2>🎯 Testing Information</h2>
            <ul style="line-height: 2;">
                <li><strong>Tool:</strong> Pa11y with HTML_CodeSniffer</li>
                <li><strong>Standard:</strong> WCAG 2.2 Level AAA</li>
                <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Pages Tested:</strong> ${results.length}</li>
                ${totalErrors === 0 ? '<li>✅ <strong>All pages pass error-free!</strong></li>' : ''}
            </ul>
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, html);
  console.log(`\n✅ HTML report saved: ${outputPath}`);
}

async function runTests() {
  console.log('🚀 Starting Pa11y WCAG 2.2 AAA Testing...\n');
  console.log(`Testing ${PAGES.length} pages\n`);
  
  const results = [];
  
  for (const page of PAGES) {
    const result = await testPage(page);
    results.push(result);
  }
  
  // Generate reports
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const jsonPath = path.join(__dirname, `pa11y-audit-${timestamp}.json`);
  const htmlPath = path.join(__dirname, `pa11y-audit-${timestamp}.html`);
  
  // Save JSON
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ JSON report saved: ${jsonPath}`);
  
  // Generate HTML
  generateHTMLReport(results, htmlPath);
  
  // Print summary
  const totalErrors = results.reduce((sum, r) => sum + (r.issues?.filter(i => i.type === 'error').length || 0), 0);
  const totalWarnings = results.reduce((sum, r) => sum + (r.issues?.filter(i => i.type === 'warning').length || 0), 0);
  const totalNotices = results.reduce((sum, r) => sum + (r.issues?.filter(i => i.type === 'notice').length || 0), 0);
  const cleanPages = results.filter(r => !r.error && (!r.issues || r.issues.filter(i => i.type === 'error').length === 0)).length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 PA11Y TESTING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Pages Tested: ${results.length}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Warnings: ${totalWarnings}`);
  console.log(`Notices: ${totalNotices}`);
  console.log(`Error-Free Pages: ${cleanPages}/${results.length} (${((cleanPages/results.length)*100).toFixed(1)}%)`);
  console.log('='.repeat(60));
  
  if (totalErrors === 0) {
    console.log('\n🎉 All pages pass Pa11y WCAG 2.2 AAA tests!');
  } else {
    console.log(`\n⚠️  Found ${totalErrors} errors requiring attention.`);
  }
  
  console.log(`\n📄 View report: ${htmlPath}`);
}

runTests().catch(console.error);
