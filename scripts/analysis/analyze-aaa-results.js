/**
 * Analyze all AAA test results and generate unified summary
 */

const fs = require('fs');
const path = require('path');

function loadJsonReport(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.warn(`Could not load ${filePath}:`, error.message);
  }
  return null;
}

(async () => {
  const reportsDir = path.join(process.cwd(), 'reports');
  
  // Load all reports
  const pa11yReport = loadJsonReport(path.join(reportsDir, 'pa11y', 'pa11y-aaa-report.json'));
  const contrastReport = loadJsonReport(path.join(reportsDir, 'contrast', 'contrast-aaa-report.json'));
  const keyboardReport = loadJsonReport(path.join(reportsDir, 'keyboard', 'keyboard-navigation-report.json'));
  const axeReport = loadJsonReport(path.join(reportsDir, 'axe-aaa-report.json'));
  
  let totalViolations = 0;
  const summary = {
    timestamp: new Date().toISOString(),
    reports: {
      pa11y: { loaded: !!pa11yReport, violations: 0 },
      contrast: { loaded: !!contrastReport, violations: 0 },
      keyboard: { loaded: !!keyboardReport, violations: 0 },
      axe: { loaded: !!axeReport, violations: 0 }
    },
    passed: false
  };
  
  // Analyze pa11y
  if (pa11yReport) {
    if (Array.isArray(pa11yReport)) {
      pa11yReport.forEach(page => {
        if (page.issues) {
          summary.reports.pa11y.violations += page.issues.length;
        }
      });
    } else if (pa11yReport.total) {
      summary.reports.pa11y.violations = pa11yReport.total;
    }
    totalViolations += summary.reports.pa11y.violations;
  }
  
  // Analyze contrast
  if (contrastReport) {
    summary.reports.contrast.violations = contrastReport.summary?.totalViolations || 0;
    totalViolations += summary.reports.contrast.violations;
  }
  
  // Analyze keyboard
  if (keyboardReport) {
    summary.reports.keyboard.violations = keyboardReport.summary?.totalViolations || 0;
    totalViolations += summary.reports.keyboard.violations;
  }
  
  // Analyze axe
  if (axeReport && Array.isArray(axeReport)) {
    axeReport.forEach(page => {
      if (page.violations) {
        summary.reports.axe.violations += page.violations.length;
      }
    });
    totalViolations += summary.reports.axe.violations;
  }
  
  summary.totalViolations = totalViolations;
  summary.passed = totalViolations === 0;
  
  // Generate markdown summary
  let md = '## 📊 Comprehensive AAA Test Analysis\n\n';
  md += `**Timestamp:** ${new Date().toISOString()}\n\n`;
  md += '### Test Suite Results\n\n';
  md += '| Suite | Status | Violations |\n';
  md += '|-------|--------|------------|\n';
  
  Object.entries(summary.reports).forEach(([name, data]) => {
    const status = data.loaded ? (data.violations === 0 ? '✅' : '❌') : '⚠️ Not Run';
    md += `| ${name} | ${status} | ${data.violations} |\n`;
  });
  
  md += `\n**Total Violations:** ${totalViolations}\n`;
  md += `**Overall Status:** ${summary.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
  
  if (totalViolations > 0) {
    md += '### Violation Breakdown\n\n';
    
    // Contrast details
    if (contrastReport && contrastReport.violations && contrastReport.violations.length > 0) {
      md += '#### Contrast Ratio Violations\n\n';
      const contrastCount = contrastReport.violations.reduce((sum, v) => sum + v.violations.length, 0);
      md += `Found ${contrastCount} contrast violations across ${contrastReport.violations.length} page/theme combinations.\n\n`;
    }
    
    // Keyboard details
    if (keyboardReport && keyboardReport.summary?.criticalViolations > 0) {
      md += '#### Keyboard Navigation Issues\n\n';
      md += `Found ${keyboardReport.summary.criticalViolations} critical keyboard navigation issues.\n\n`;
    }
    
    // axe details
    if (axeReport && Array.isArray(axeReport)) {
      const axeViolations = axeReport.filter(p => p.violations && p.violations.length > 0);
      if (axeViolations.length > 0) {
        md += '#### axe-core AAA Violations\n\n';
        md += `Found violations on ${axeViolations.length} pages.\n\n`;
      }
    }
    
    md += '### Recommendations\n\n';
    md += '1. Review detailed reports in the artifacts\n';
    md += '2. Run tests locally: `npm run a11y:test`\n';
    md += '3. Fix critical violations first (keyboard traps, missing focus indicators)\n';
    md += '4. Address contrast ratios (must meet 7:1 for normal text)\n';
    md += '5. Re-run tests after fixes\n\n';
  } else {
    md += '### 🎉 Congratulations!\n\n';
    md += 'All WCAG 2.2 Level AAA tests passed. Your website meets the highest accessibility standards.\n\n';
  }
  
  // Save summary
  fs.writeFileSync(path.join(reportsDir, 'summary.md'), md);
  
  // Save JSON summary
  fs.writeFileSync(
    path.join(reportsDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  // Create flag file if violations found
  if (totalViolations > 0) {
    fs.writeFileSync(path.join(reportsDir, 'has-violations.flag'), '1');
  } else {
    // Remove flag if exists
    const flagPath = path.join(reportsDir, 'has-violations.flag');
    if (fs.existsSync(flagPath)) {
      fs.unlinkSync(flagPath);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 AAA TEST ANALYSIS COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total violations: ${totalViolations}`);
  console.log(`Status: ${summary.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('='.repeat(60));
  console.log('\nDetailed summary saved to reports/summary.md');
})();
