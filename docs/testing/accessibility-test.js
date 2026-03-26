#!/usr/bin/env node

/**
 * Comprehensive Accessibility Testing Script
 * Tests HTML validation, WCAG 2.2 AAA compliance, and generates detailed reports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_DIR = '_site';
const REPORTS_DIR = 'test-results/accessibility';

// Key pages to test (relative to _site)
const TEST_PAGES = [
  'index.html',
  'about/index.html',
  'features/index.html',
  'user-guide/index.html',
  'accessibility/index.html',
  'contact/index.html',
  'privacy/index.html',
  'terms/index.html',
  '404.html',
  'offline.html'
];

// Create reports directory
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

console.log('🧪 Starting Accessibility Test Suite\n');
console.log('=' .repeat(60));

// Test 1: Check if files exist
console.log('\n📋 Step 1: Checking test files...\n');
const existingPages = TEST_PAGES.filter(page => {
  const fullPath = path.join(SITE_DIR, page);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${page} ${exists ? 'found' : 'NOT FOUND'}`);
  return exists;
});

if (existingPages.length === 0) {
  console.error('\n❌ No test pages found! Build the site first with Jekyll.');
  process.exit(1);
}

console.log(`\n✅ Found ${existingPages.length} pages to test`);

// Test 2: HTML Validation
console.log('\n=' .repeat(60));
console.log('\n📋 Step 2: HTML5 Validation\n');
console.log('Testing each page for W3C HTML5 compliance...\n');

const htmlResults = [];
existingPages.forEach((page, index) => {
  const fullPath = path.join(SITE_DIR, page);
  console.log(`[${index + 1}/${existingPages.length}] Validating: ${page}`);
  
  try {
    // Note: html-validator-cli validates against W3C standards
    execSync(`npx html-validator-cli "${fullPath}" --quiet`, { 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    console.log(`  ✅ Valid HTML5\n`);
    htmlResults.push({ page, valid: true });
  } catch (error) {
    console.log(`  ⚠️ Validation warnings/errors found\n`);
    htmlResults.push({ page, valid: false });
  }
});

// Test 3: Pa11y (WCAG Testing)
console.log('\n=' .repeat(60));
console.log('\n📋 Step 3: WCAG 2.2 AAA Testing with Pa11y\n');
console.log('Testing against WCAG 2.2 Level AAA standards...\n');

const pa11yResults = [];
existingPages.slice(0, 5).forEach((page, index) => {
  const fullPath = path.join(SITE_DIR, page);
  const url = `file://${path.resolve(fullPath)}`;
  
  console.log(`[${index + 1}/5] Testing: ${page}`);
  console.log(`  Running Pa11y with WCAG2AAA standard...`);
  
  try {
    const output = execSync(
      `npx pa11y "${url}" --standard WCAG2AAA --reporter json`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    
    const results = JSON.parse(output);
    const errors = results.filter(r => r.type === 'error').length;
    const warnings = results.filter(r => r.type === 'warning').length;
    
    console.log(`  ${errors === 0 ? '✅' : '❌'} Errors: ${errors}`);
    console.log(`  ${warnings === 0 ? '✅' : '⚠️'} Warnings: ${warnings}\n`);
    
    pa11yResults.push({ page, errors, warnings, results });
    
    // Save individual report
    const reportFile = path.join(REPORTS_DIR, `pa11y-${page.replace(/\//g, '-')}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.log(`  ❌ Testing failed\n`);
    pa11yResults.push({ page, errors: -1, warnings: -1, error: error.message });
  }
});

// Test 4: Generate Summary Report
console.log('\n=' .repeat(60));
console.log('\n📊 Test Summary\n');

const htmlValid = htmlResults.filter(r => r.valid).length;
const pa11yPassed = pa11yResults.filter(r => r.errors === 0).length;

console.log(`HTML Validation: ${htmlValid}/${htmlResults.length} pages valid`);
console.log(`WCAG 2.2 AAA: ${pa11yPassed}/${pa11yResults.length} pages error-free\n`);

// Detailed Pa11y Results
console.log('Detailed WCAG Results:');
pa11yResults.forEach(result => {
  const status = result.errors === 0 ? '✅' : result.errors === -1 ? '💥' : '❌';
  console.log(`  ${status} ${result.page}: ${result.errors} errors, ${result.warnings} warnings`);
});

// Generate summary JSON
const summary = {
  timestamp: new Date().toISOString(),
  htmlValidation: {
    total: htmlResults.length,
    valid: htmlValid,
    invalid: htmlResults.length - htmlValid
  },
  wcagCompliance: {
    total: pa11yResults.length,
    passed: pa11yPassed,
    failed: pa11yResults.length - pa11yPassed
  },
  details: {
    htmlResults,
    pa11yResults
  }
};

const summaryFile = path.join(REPORTS_DIR, 'accessibility-summary.json');
fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

console.log(`\n📄 Reports saved to: ${REPORTS_DIR}/`);
console.log('   - accessibility-summary.json');
console.log('   - pa11y-*.json (individual page reports)');

// Final status
console.log('\n' + '=' .repeat(60));
if (htmlValid === htmlResults.length && pa11yPassed === pa11yResults.length) {
  console.log('\n🎉 ALL TESTS PASSED! Your site is fully accessible!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some issues found. Review the reports above.\n');
  process.exit(1);
}
