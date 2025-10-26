/**
 * Contrast Ratio Testing Script
 * Verifies all color combinations meet WCAG AAA standards (7:1)
 */

const puppeteer = require('puppeteer');

// WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
const WCAG_AAA_NORMAL = 7.0;
const WCAG_AAA_LARGE = 4.5;

// Helper function to calculate relative luminance
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1.r, color1.g, color1.b);
  const lum2 = getLuminance(color2.r, color2.g, color2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Parse RGB color
function parseRgb(rgbString) {
  const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3])
  };
}

async function testContrast(url, theme) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log(`\n🎨 Testing contrast: ${url} (${theme} mode)`);
  
  await page.goto(url, { waitUntil: 'networkidle0' });
  
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
  
  // Test text elements
  const results = await page.evaluate((WCAG_AAA_NORMAL) => {
    const testResults = [];
    
    // Elements to test
    const selectors = [
      'body',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'li', 'span', 'a',
      'button', '.btn',
      'input', 'textarea', 'select',
      '.alert', '.success', '.warning', '.error', '.info'
    ];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach((el, index) => {
        if (index > 5) return; // Limit to 5 per selector
        
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Skip if transparent
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
          return;
        }
        
        testResults.push({
          selector: `${selector}:nth-of-type(${index + 1})`,
          color,
          backgroundColor,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight
        });
      });
    });
    
    return testResults;
  }, WCAG_AAA_NORMAL);
  
  // Calculate contrast ratios
  const violations = [];
  const passes = [];
  
  results.forEach(result => {
    const fgColor = parseRgb(result.color);
    const bgColor = parseRgb(result.backgroundColor);
    
    if (!fgColor || !bgColor) return;
    
    const ratio = getContrastRatio(fgColor, bgColor);
    const fontSize = parseFloat(result.fontSize);
    const fontWeight = parseInt(result.fontWeight) || 400;
    
    // Determine if large text (18pt+ or 14pt+ bold)
    const isLargeText = fontSize >= 24 || (fontSize >= 18.5 && fontWeight >= 700);
    const requiredRatio = isLargeText ? WCAG_AAA_LARGE : WCAG_AAA_NORMAL;
    
    const testResult = {
      ...result,
      ratio: ratio.toFixed(2),
      required: requiredRatio,
      isLargeText,
      pass: ratio >= requiredRatio
    };
    
    if (testResult.pass) {
      passes.push(testResult);
    } else {
      violations.push(testResult);
    }
  });
  
  // Report results
  console.log(`  ✅ Passed: ${passes.length} elements`);
  console.log(`  ❌ Failed: ${violations.length} elements`);
  
  if (violations.length > 0) {
    console.log(`\n  ⚠️  Contrast violations:`);
    violations.forEach((v, i) => {
      console.log(`\n  ${i + 1}. ${v.selector}`);
      console.log(`     Foreground: ${v.color}`);
      console.log(`     Background: ${v.backgroundColor}`);
      console.log(`     Contrast: ${v.ratio}:1 (Required: ${v.required}:1)`);
      console.log(`     Font Size: ${v.fontSize} | Weight: ${v.fontWeight}`);
      console.log(`     ${v.isLargeText ? '(Large text)' : '(Normal text)'}`);
    });
  }
  
  await browser.close();
  
  return { url, theme, violations, passes };
}

async function runContrastTests() {
  console.log('🚀 Starting Contrast Testing...\n');
  console.log('═'.repeat(60));
  
  const pages = [
    'http://localhost:4000/',
    'http://localhost:4000/features/',
    'http://localhost:4000/contact/'
  ];
  
  const themes = ['light', 'dark', 'high-contrast'];
  const allResults = [];
  
  for (const url of pages) {
    for (const theme of themes) {
      const result = await testContrast(url, theme);
      allResults.push(result);
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 CONTRAST TEST SUMMARY');
  console.log('═'.repeat(60));
  
  const totalViolations = allResults.reduce((sum, r) => sum + r.violations.length, 0);
  const totalPasses = allResults.reduce((sum, r) => sum + r.passes.length, 0);
  
  console.log(`\n✅ Total Passed: ${totalPasses}`);
  console.log(`❌ Total Violations: ${totalViolations}`);
  
  if (totalViolations === 0) {
    console.log(`\n✅ All contrast tests PASSED!`);
    process.exit(0);
  } else {
    console.log(`\n❌ Contrast tests FAILED: ${totalViolations} violations`);
    process.exit(1);
  }
}

runContrastTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
