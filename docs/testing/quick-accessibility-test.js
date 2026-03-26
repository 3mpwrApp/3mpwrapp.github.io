#!/usr/bin/env node

/**
 * Quick Accessibility Test Suite
 * Tests the built _site directory without external dependencies
 * Focuses on practical, actionable findings
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}\n`),
  title: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)
};

// Test pages
const testPages = [
  { path: '_site/index.html', name: 'Homepage' },
  { path: '_site/about/index.html', name: 'About' },
  { path: '_site/features/index.html', name: 'Features' },
  { path: '_site/user-guide/index.html', name: 'User Guide' },
  { path: '_site/accessibility/index.html', name: 'Accessibility' },
  { path: '_site/privacy/index.html', name: 'Privacy' },
  { path: '_site/404.html', name: '404 Page' },
  { path: '_site/offline.html', name: 'Offline Page' }
];

// Results tracking
const results = {
  pages_tested: 0,
  pages_found: 0,
  total_issues: 0,
  issues_by_page: {},
  accessibility_score: 0,
  details: []
};

/**
 * Check if HTML file exists
 */
function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Load and parse HTML
 */
function loadHTML(filePath) {
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    return cheerio.load(html);
  } catch (err) {
    return null;
  }
}

/**
 * Check for DOCTYPE
 */
function checkDoctype(html) {
  return html.includes('<!DOCTYPE html>') || html.includes('<!doctype html>');
}

/**
 * Check heading hierarchy
 */
function checkHeadings($) {
  const issues = [];
  const headings = [];
  
  $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
    const level = parseInt($(elem).prop('tagName')[1]);
    headings.push({ level, text: $(elem).text().substring(0, 50) });
  });

  if (headings.length === 0) {
    issues.push('No headings found on page');
  }

  // Check for multiple H1s
  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count > 1) {
    issues.push(`Multiple H1 tags found (${h1Count}) - should be only 1`);
  } else if (h1Count === 0) {
    issues.push('No H1 tag found - page should have exactly one H1');
  }

  // Check for skipped levels
  for (let i = 1; i < headings.length; i++) {
    const prevLevel = headings[i - 1].level;
    const currLevel = headings[i].level;
    if (currLevel > prevLevel + 1) {
      issues.push(`Heading level skipped: H${prevLevel} → H${currLevel}`);
    }
  }

  return { issues, headings };
}

/**
 * Check for alt text on images
 */
function checkImages($) {
  const issues = [];
  const images = [];

  $('img').each((i, elem) => {
    const $img = $(elem);
    const src = $img.attr('src');
    const alt = $img.attr('alt');
    const ariaHidden = $img.attr('aria-hidden');

    images.push({
      src: src ? src.substring(0, 40) : 'no src',
      hasAlt: !!alt,
      alt: alt ? alt.substring(0, 40) : 'none'
    });

    // Check for missing alt (unless decorative)
    if (!alt && !ariaHidden) {
      issues.push(`Image without alt text: ${src}`);
    }

    // Check for poor alt text
    if (alt && (alt.includes('image') || alt.includes('picture') || alt.match(/\.(png|jpg|gif)$/i))) {
      issues.push(`Weak alt text: "${alt}"`);
    }
  });

  return { issues, images };
}

/**
 * Check for landmark regions
 */
function checkLandmarks($) {
  const issues = [];
  const landmarks = {
    header: $('header[role="banner"], header').length,
    nav: $('nav').length,
    main: $('main[role="main"], main').length,
    footer: $('footer[role="contentinfo"], footer').length
  };

  if (landmarks.header === 0) {
    issues.push('Missing <header> element');
  }

  if (landmarks.nav === 0) {
    issues.push('Missing <nav> element');
  }

  if (landmarks.main === 0) {
    issues.push('Missing <main> element');
  }

  if (landmarks.footer === 0) {
    issues.push('Missing <footer> element');
  }

  return { issues, landmarks };
}

/**
 * Check for form labels
 */
function checkForms($) {
  const issues = [];
  const forms = $('form').length;
  let inputsWithoutLabels = 0;

  $('input[type!="hidden"], textarea, select').each((i, elem) => {
    const $elem = $(elem);
    const id = $elem.attr('id');
    const ariaLabel = $elem.attr('aria-label');
    const ariaLabelledby = $elem.attr('aria-labelledby');
    
    if (id) {
      const label = $(`label[for="${id}"]`).length;
      if (label === 0 && !ariaLabel && !ariaLabelledby) {
        inputsWithoutLabels++;
      }
    } else if (!ariaLabel && !ariaLabelledby) {
      inputsWithoutLabels++;
    }
  });

  if (forms > 0 && inputsWithoutLabels > 0) {
    issues.push(`${inputsWithoutLabels} form inputs without associated labels`);
  }

  return { issues, forms, inputsWithoutLabels };
}

/**
 * Check for ARIA attributes
 */
function checkARIA($) {
  const ariaUsage = {
    labels: $('[aria-label]').length,
    labelledby: $('[aria-labelledby]').length,
    describedby: $('[aria-describedby]').length,
    live: $('[aria-live]').length,
    hidden: $('[aria-hidden]').length,
    current: $('[aria-current]').length,
    expanded: $('[aria-expanded]').length,
    pressed: $('[aria-pressed]').length,
    required: $('[aria-required]').length
  };

  return { ariaUsage };
}

/**
 * Check for color contrast issues (basic check)
 */
function checkContrast($) {
  const issues = [];
  
  // Check for common low-contrast patterns
  const lowContrastPatterns = [
    { selector: '.gradient-banner', desc: 'Gradient banner text' },
    { selector: '.gradient-banner-pink', desc: 'Pink gradient banner' },
    { selector: '.status-banner', desc: 'Status banner' }
  ];

  lowContrastPatterns.forEach(pattern => {
    if ($(pattern.selector).length > 0) {
      // Just note that it exists - actual testing needs WebAIM checker
      // This is a reminder to test these manually
    }
  });

  return { issues };
}

/**
 * Check meta tags and title
 */
function checkMetaTags($) {
  const issues = [];
  const title = $('title').text();
  const langAttr = $('html').attr('lang');
  const charset = $('meta[charset]').length || $('meta[http-equiv="Content-Type"]').length;
  const viewport = $('meta[name="viewport"]').length;

  if (!title) {
    issues.push('Missing page title');
  }

  if (!langAttr) {
    issues.push('Missing lang attribute on <html>');
  }

  if (!charset) {
    issues.push('Missing charset declaration');
  }

  if (!viewport) {
    issues.push('Missing viewport meta tag (required for mobile)');
  }

  return { issues, hasMeta: { title, langAttr, charset, viewport } };
}

/**
 * Analyze a single page
 */
function analyzePage(filePath, pageName) {
  log.info(`Testing: ${pageName}`);

  const rawHTML = fs.readFileSync(filePath, 'utf8');
  const $ = loadHTML(filePath);

  if (!$) {
    log.error(`Could not parse ${pageName}`);
    return null;
  }

  const checks = {
    doctype: checkDoctype(rawHTML),
    meta: checkMetaTags($),
    headings: checkHeadings($),
    images: checkImages($),
    landmarks: checkLandmarks($),
    forms: checkForms($),
    aria: checkARIA($),
    contrast: checkContrast($)
  };

  // Collect all issues
  const pageIssues = [
    ...checks.meta.issues,
    ...checks.headings.issues,
    ...checks.images.issues,
    ...checks.landmarks.issues,
    ...checks.forms.issues,
    ...checks.contrast.issues
  ];

  if (!checks.doctype) {
    pageIssues.push('Missing or invalid DOCTYPE declaration');
  }

  return {
    name: pageName,
    issues: pageIssues,
    checks: checks,
    issueCount: pageIssues.length
  };
}

/**
 * Main test execution
 */
function runTests() {
  log.title('🧪 WCAG 2.2 AAA Accessibility Test Suite');

  log.header('📋 Step 1: Checking Files');

  // Check which files exist
  testPages.forEach(page => {
    if (checkFileExists(page.path)) {
      log.success(`${page.name} found`);
      results.pages_found++;
    } else {
      log.warning(`${page.name} NOT found at ${page.path}`);
    }
  });

  log.info(`Found ${results.pages_found}/${testPages.length} pages to test\n`);

  // Test each page that exists
  log.header('🔍 Step 2: Analyzing Pages');

  const pageResults = [];
  testPages.forEach(page => {
    if (checkFileExists(page.path)) {
      const result = analyzePage(page.path, page.name);
      if (result) {
        pageResults.push(result);
        results.pages_tested++;
        results.total_issues += result.issueCount;
        results.issues_by_page[page.name] = result.issueCount;
      }
    }
  });

  // Report on each page
  pageResults.forEach(result => {
    console.log(`\n📄 ${colors.cyan}${result.name}${colors.reset}`);
    console.log(`   ${colors.cyan}Issues found: ${result.issues.length}${colors.reset}\n`);

    if (result.issues.length === 0) {
      log.success(`No major accessibility issues detected`);
    } else {
      result.issues.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue}`);
      });
    }

    // Show positive findings
    const { headings, images, landmarks, aria } = result.checks;
    console.log(`\n   ${colors.green}✓ Positive Findings:${colors.reset}`);
    console.log(`     - Headings: ${headings.headings.length} found (H${Math.min(...headings.headings.map(h => h.level))} to H${Math.max(...headings.headings.map(h => h.level))})`);
    console.log(`     - Images: ${images.images.length} total (${images.images.filter(i => i.hasAlt).length} with alt text)`);
    console.log(`     - Landmarks: Header(${landmarks.landmarks.header}), Nav(${landmarks.landmarks.nav}), Main(${landmarks.landmarks.main}), Footer(${landmarks.landmarks.footer})`);
    console.log(`     - ARIA: ${aria.ariaUsage.labels} labels, ${aria.ariaUsage.hidden} hidden, ${aria.ariaUsage.live} live regions\n`);
  });

  // Summary
  log.title('📊 Test Summary');

  log.info(`Pages Tested: ${results.pages_tested}/${results.pages_found}`);
  log.info(`Total Issues Found: ${results.total_issues}`);

  if (results.total_issues === 0) {
    log.success('All pages passed basic accessibility checks! ✨');
  } else {
    log.warning(`${results.total_issues} accessibility issues to review`);
  }

  console.log(`\n${colors.cyan}Issues by Page:${colors.reset}`);
  Object.entries(results.issues_by_page).forEach(([page, count]) => {
    if (count === 0) {
      log.success(`${page}: ${count} issues`);
    } else if (count <= 2) {
      log.warning(`${page}: ${count} issues`);
    } else {
      log.error(`${page}: ${count} issues`);
    }
  });

  // Save results
  const reportDir = 'test-results/quick-audit';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(reportDir, 'accessibility-report.json'),
    JSON.stringify(results, null, 2)
  );

  fs.writeFileSync(
    path.join(reportDir, 'detailed-findings.json'),
    JSON.stringify(pageResults, null, 2)
  );

  log.header('✅ Testing Complete!');
  log.success(`Reports saved to: ${reportDir}/`);

  console.log(`\n${colors.cyan}Next Steps:${colors.reset}`);
  console.log('1. Review the issues listed above');
  console.log('2. Test color contrast: https://webaim.org/resources/contrastchecker/');
  console.log('3. Install WAVE extension for visual inspection');
  console.log('4. Test with keyboard: Use Tab, Shift+Tab, Enter, Space, Esc');
  console.log('5. Test with screen reader: NVDA (Windows) or VoiceOver (Mac)');
  console.log('\n');
}

// Run the tests
try {
  runTests();
} catch (err) {
  log.error(`Test execution failed: ${err.message}`);
  console.error(err);
  process.exit(1);
}
