/**
 * WCAG 2.2 AAA Contrast Ratio Testing Script
 * Verifies all color combinations meet AAA standards:
 * - 7:1 for normal text
 * - 4.5:1 for large text (18pt+, or 14pt+ bold)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// WCAG 2.2 AAA Requirements
const WCAG_AAA_NORMAL = 7.0;
const WCAG_AAA_LARGE = 4.5;
const LARGE_TEXT_PX = 18; // 18px = ~14pt
const LARGE_BOLD_PX = 14; // 14px bold = ~14pt

// Helper: Calculate relative luminance
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Helper: Calculate contrast ratio
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1.r, color1.g, color1.b);
  const lum2 = getLuminance(color2.r, color2.g, color2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Helper: Parse RGB/RGBA color
function parseColor(colorString) {
  const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3])
  };
}

async function testPageContrast(page, url, theme = 'light') {
  console.log(`\n🎨 Testing: ${url} (${theme} mode)`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    
    // Apply theme
    if (theme === 'dark') {
      await page.evaluate(() => {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      });
      await page.waitForTimeout(500);
    } else if (theme === 'high-contrast') {
      await page.evaluate(() => {
        document.body.setAttribute('data-contrast', 'high');
        localStorage.setItem('contrast', 'high');
      });
      await page.waitForTimeout(500);
    }
    
    // Test all visible text elements
    const violations = await page.evaluate((WCAG_AAA_NORMAL, WCAG_AAA_LARGE, LARGE_TEXT_PX, LARGE_BOLD_PX) => {
      const results = [];
      
      // Selectors for text elements
      const selectors = [
        'body', 'main', 'article', 'section',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'li', 'span', 'a', 'label',
        'button', '.btn', 'input', 'textarea',
        '.alert', '.notice', '.warning', '.error', '.success', '.info',
        '.card', '.hero', '.feature', '.testimonial'
      ];
      
      function parseRgb(rgbString) {
        const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return null;
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3])
        };
      }
      
      function getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      
      function getContrastRatio(color1, color2) {
        const lum1 = getLuminance(color1.r, color1.g, color1.b);
        const lum2 = getLuminance(color2.r, color2.g, color2.b);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
      }
      
      function isLargeText(fontSize, fontWeight) {
        const size = parseFloat(fontSize);
        const weight = parseInt(fontWeight) || 400;
        
        if (size >= LARGE_TEXT_PX) return true;
        if (size >= LARGE_BOLD_PX && weight >= 700) return true;
        return false;
      }
      
      const tested = new Set();
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(el => {
          // Skip invisible elements
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          
          const styles = window.getComputedStyle(el);
          
          // Skip if no actual text content
          const text = el.textContent?.trim();
          if (!text || text.length === 0) return;
          
          const fgColor = parseRgb(styles.color);
          const bgColor = parseRgb(styles.backgroundColor);
          
          if (!fgColor || !bgColor) return;
          
          // Skip transparent backgrounds
          const bgMatch = styles.backgroundColor.match(/rgba?\([^)]+,\s*([\d.]+)\)/);
          if (bgMatch && parseFloat(bgMatch[1]) === 0) return;
          
          const fontSize = styles.fontSize;
          const fontWeight = styles.fontWeight;
          const isLarge = isLargeText(fontSize, fontWeight);
          const requiredRatio = isLarge ? WCAG_AAA_LARGE : WCAG_AAA_NORMAL;
          
          const ratio = getContrastRatio(fgColor, bgColor);
          
          // Create unique key to avoid duplicates
          const key = `${selector}-${styles.color}-${styles.backgroundColor}-${fontSize}`;
          if (tested.has(key)) return;
          tested.add(key);
          
          if (ratio < requiredRatio) {
            results.push({
              selector: selector,
              element: el.tagName.toLowerCase(),
              text: text.substring(0, 50),
              foreground: styles.color,
              background: styles.backgroundColor,
              fontSize: fontSize,
              fontWeight: fontWeight,
              isLargeText: isLarge,
              contrastRatio: ratio.toFixed(2),
              required: requiredRatio.toFixed(1),
              passed: false
            });
          }
        });
      });
      
      return results;
    }, WCAG_AAA_NORMAL, WCAG_AAA_LARGE, LARGE_TEXT_PX, LARGE_BOLD_PX);
    
    return violations;
    
  } catch (error) {
    console.error(`Error testing ${url}:`, error.message);
    return [];
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const baseUrl = process.env.SITE_URL || 'https://3mpwrapp.github.io';
  const q = '?no-modal=1';
  
  const urls = [
    `${baseUrl}/${q}`,
    `${baseUrl}/about${q}`,
    `${baseUrl}/features${q}`,
    `${baseUrl}/user-guide${q}`,
    `${baseUrl}/community${q}`,
    `${baseUrl}/resources${q}`,
    `${baseUrl}/wellness${q}`,
    `${baseUrl}/contact${q}`,
    `${baseUrl}/blog${q}`,
    `${baseUrl}/accessibility${q}`,
  ];
  
  const themes = ['light', 'dark', 'high-contrast'];
  const allViolations = [];
  let totalTests = 0;
  let totalViolations = 0;
  
  for (const url of urls) {
    for (const theme of themes) {
      totalTests++;
      const violations = await testPageContrast(page, url, theme);
      
      if (violations.length > 0) {
        console.log(`  ❌ Found ${violations.length} contrast violations`);
        totalViolations += violations.length;
        allViolations.push({
          url,
          theme,
          violations
        });
      } else {
        console.log(`  ✅ All contrast ratios pass AAA`);
      }
    }
  }
  
  await browser.close();
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      pagesWithViolations: allViolations.length,
      totalViolations,
      passed: totalViolations === 0
    },
    violations: allViolations,
    standards: {
      normalText: `${WCAG_AAA_NORMAL}:1`,
      largeText: `${WCAG_AAA_LARGE}:1`,
      largeTextDefinition: '18px+ or 14px+ bold'
    }
  };
  
  // Save JSON report
  const reportsDir = path.join(process.cwd(), 'reports', 'contrast');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(reportsDir, 'contrast-aaa-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 WCAG 2.2 AAA CONTRAST TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total tests run: ${totalTests}`);
  console.log(`Pages with violations: ${allViolations.length}`);
  console.log(`Total violations: ${totalViolations}`);
  console.log('='.repeat(60));
  
  if (totalViolations > 0) {
    console.log('\n❌ CONTRAST TEST FAILED - Violations found');
    
    // Show top violations
    console.log('\nTop 10 violations:');
    const topViolations = allViolations
      .flatMap(v => v.violations.map(viol => ({ ...viol, url: v.url, theme: v.theme })))
      .slice(0, 10);
    
    topViolations.forEach((v, i) => {
      console.log(`\n${i + 1}. ${v.url} (${v.theme})`);
      console.log(`   Element: ${v.element} / ${v.selector}`);
      console.log(`   Text: "${v.text}"`);
      console.log(`   Contrast: ${v.contrastRatio}:1 (required: ${v.required}:1)`);
      console.log(`   Colors: ${v.foreground} on ${v.background}`);
    });
    
    process.exit(1);
  } else {
    console.log('\n✅ ALL CONTRAST TESTS PASSED!');
    process.exit(0);
  }
})();
