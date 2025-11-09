/**
 * Master Accessibility Testing Suite
 * Runs all accessibility tests and generates a comprehensive report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   🔍 COMPREHENSIVE WCAG 2.2 AAA TESTING SUITE           ║');
console.log('║   Testing entire website for beyond-AAA compliance        ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const reportDir = path.join(__dirname, `accessibility-reports-${timestamp}`);

// Create reports directory
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

console.log(`📁 Report directory: ${reportDir}\n`);

// Test 1: Axe-core WCAG 2.2 AAA Testing
console.log('═'.repeat(60));
console.log('🔧 TEST 1: Axe-core with WCAG 2.2 AAA Standards');
console.log('═'.repeat(60));
try {
  execSync('node comprehensive-accessibility-test.js', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✅ Axe-core tests completed\n');
  
  // Move reports to directory
  const files = fs.readdirSync(__dirname);
  files.forEach(file => {
    if (file.startsWith('accessibility-audit-') && (file.endsWith('.json') || file.endsWith('.html'))) {
      fs.renameSync(
        path.join(__dirname, file),
        path.join(reportDir, file)
      );
    }
  });
} catch (error) {
  console.error('❌ Axe-core tests failed:', error.message);
}

// Test 2: Pa11y HTML_CodeSniffer Testing
console.log('\n' + '═'.repeat(60));
console.log('🔧 TEST 2: Pa11y with HTML_CodeSniffer');
console.log('═'.repeat(60));
try {
  execSync('node pa11y-test.js', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✅ Pa11y tests completed\n');
  
  // Move reports
  const files = fs.readdirSync(__dirname);
  files.forEach(file => {
    if (file.startsWith('pa11y-audit-') && (file.endsWith('.json') || file.endsWith('.html'))) {
      fs.renameSync(
        path.join(__dirname, file),
        path.join(reportDir, file)
      );
    }
  });
} catch (error) {
  console.error('❌ Pa11y tests failed:', error.message);
}

// Test 3: HTML Validation
console.log('\n' + '═'.repeat(60));
console.log('🔧 TEST 3: W3C HTML Validation');
console.log('═'.repeat(60));
console.log('Running HTML validation on key pages...\n');

const pagesToValidate = [
  'https://3mpwrapp.github.io/',
  'https://3mpwrapp.github.io/about',
  'https://3mpwrapp.github.io/accessibility',
  'https://3mpwrapp.github.io/contact',
  'https://3mpwrapp.github.io/privacy'
];

const validationResults = [];

for (const url of pagesToValidate) {
  try {
    console.log(`Validating: ${url}`);
    const output = execSync(`html-validator --url="${url}" --format=json`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    });
    
    const result = JSON.parse(output);
    validationResults.push({
      url,
      messages: result.messages || [],
      timestamp: new Date().toISOString()
    });
    
    const errors = result.messages?.filter(m => m.type === 'error').length || 0;
    const warnings = result.messages?.filter(m => m.type === 'info').length || 0;
    console.log(`  ❌ Errors: ${errors}, ⚠️  Warnings: ${warnings}`);
    
  } catch (error) {
    console.error(`  ❌ Validation failed: ${error.message}`);
    validationResults.push({
      url,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Save HTML validation results
fs.writeFileSync(
  path.join(reportDir, 'html-validation-results.json'),
  JSON.stringify(validationResults, null, 2)
);

console.log('\n✅ HTML validation completed\n');

// Generate Master Summary Report
console.log('═'.repeat(60));
console.log('📊 Generating Master Summary Report');
console.log('═'.repeat(60));

const summaryHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Accessibility Audit Summary</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            font-size: 2.5em;
            color: #667eea;
            margin-bottom: 10px;
            text-align: center;
        }
        .subtitle {
            text-align: center;
            color: #666;
            font-size: 1.2em;
            margin-bottom: 40px;
        }
        .report-section {
            background: #f9fafb;
            padding: 25px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 5px solid #667eea;
        }
        .report-section h2 {
            color: #667eea;
            margin-bottom: 15px;
        }
        .report-links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .report-link {
            display: block;
            padding: 20px;
            background: white;
            border-radius: 8px;
            text-decoration: none;
            color: #667eea;
            font-weight: 500;
            border: 2px solid #e5e7eb;
            transition: all 0.3s ease;
        }
        .report-link:hover {
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        .icon {
            font-size: 2em;
            margin-bottom: 10px;
        }
        .timestamp {
            text-align: center;
            color: #666;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .stat-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 2px solid #e5e7eb;
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Complete Accessibility Audit</h1>
        <p class="subtitle">WCAG 2.2 AAA Compliance Testing Suite</p>
        
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-number">3</div>
                <div class="stat-label">Testing Tools</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">19+</div>
                <div class="stat-label">Pages Tested</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">100+</div>
                <div class="stat-label">WCAG Criteria</div>
            </div>
        </div>

        <div class="report-section">
            <h2>🔧 Test 1: Axe-core WCAG 2.2 AAA</h2>
            <p>Automated accessibility testing using Deque's axe-core engine with WCAG 2.2 Level AAA standards.</p>
            <div class="report-links">
                ${fs.readdirSync(reportDir)
                  .filter(f => f.startsWith('accessibility-audit-'))
                  .map(f => `
                    <a href="${f}" class="report-link">
                        <div class="icon">📊</div>
                        <div>${f.endsWith('.html') ? 'HTML Report' : 'JSON Data'}</div>
                    </a>
                  `).join('')}
            </div>
        </div>

        <div class="report-section">
            <h2>🔧 Test 2: Pa11y HTML_CodeSniffer</h2>
            <p>Secondary validation using Pa11y with HTML_CodeSniffer for comprehensive WCAG 2.2 AAA testing.</p>
            <div class="report-links">
                ${fs.readdirSync(reportDir)
                  .filter(f => f.startsWith('pa11y-audit-'))
                  .map(f => `
                    <a href="${f}" class="report-link">
                        <div class="icon">📋</div>
                        <div>${f.endsWith('.html') ? 'HTML Report' : 'JSON Data'}</div>
                    </a>
                  `).join('')}
            </div>
        </div>

        <div class="report-section">
            <h2>🔧 Test 3: W3C HTML Validation</h2>
            <p>HTML markup validation to ensure proper structure and semantic correctness.</p>
            <div class="report-links">
                <a href="html-validation-results.json" class="report-link">
                    <div class="icon">✅</div>
                    <div>Validation Results</div>
                </a>
            </div>
        </div>

        <div class="report-section">
            <h2>📚 Next Steps</h2>
            <ul style="line-height: 2; margin-left: 20px;">
                <li>Review all HTML reports for detailed findings</li>
                <li>Prioritize fixes based on severity (Critical → Serious → Moderate → Minor)</li>
                <li>Address any HTML validation errors</li>
                <li>Perform manual keyboard navigation testing</li>
                <li>Test with actual screen readers (NVDA, JAWS, VoiceOver)</li>
                <li>Validate color contrast in various lighting conditions</li>
                <li>Test with real users who have disabilities</li>
                <li>Document all accessibility features and improvements</li>
            </ul>
        </div>

        <div class="timestamp">
            <strong>Report Generated:</strong> ${new Date().toLocaleString()}<br>
            <strong>Report Directory:</strong> ${path.basename(reportDir)}
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(reportDir, 'index.html'), summaryHtml);

console.log('\n' + '═'.repeat(60));
console.log('✅ ALL TESTS COMPLETED!');
console.log('═'.repeat(60));
console.log(`\n📁 All reports saved to: ${reportDir}`);
console.log(`\n🌐 Open this file to view the summary:`);
console.log(`   ${path.join(reportDir, 'index.html')}`);
console.log('\n' + '═'.repeat(60));
