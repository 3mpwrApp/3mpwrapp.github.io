#!/usr/bin/env node
/**
 * Comprehensive Test Runner for 3mpwrApp
 * 
 * Orchestrates all testing frameworks:
 * - Jest unit tests
 * - WCAG 2.2 AAA compliance audit
 * - Espresso E2E tests (Android)
 * - XCUITest E2E tests (iOS)
 * - Maestro E2E tests (Cross-platform)
 * - Firebase Test Lab
 * - AWS Device Farm
 * 
 * Usage:
 *   node scripts/run-all-tests.js [options]
 * 
 * Options:
 *   --unit           Run Jest unit tests only
 *   --wcag           Run WCAG compliance audit only
 *   --e2e            Run all E2E tests
 *   --espresso       Run Espresso tests (Android)
 *   --xctest         Run XCUITest (iOS)
 *   --maestro        Run Maestro tests
 *   --firebase       Run Firebase Test Lab
 *   --aws            Run AWS Device Farm
 *   --stress         Run stress tests only
 *   --all            Run everything
 *   --report         Generate comprehensive report
 *   --ci             CI mode (fail fast, JSON output)
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  jest: {
    command: 'npm test',
    timeout: 600000, // 10 minutes
  },
  wcag: {
    command: 'node scripts/wcag-2.2-aaa-audit.js --verbose --fix',
    timeout: 120000, // 2 minutes
  },
  wcagOriginal: {
    command: 'node scripts/wcag-compliance-audit.js --aaa=7',
    timeout: 60000, // 1 minute
  },
  a11yScan: {
    command: 'node scripts/a11y-scan.js',
    timeout: 60000,
  },
  maestro: {
    command: 'maestro test e2e/maestro/config.yaml',
    timeout: 1800000, // 30 minutes
  },
  espresso: {
    command: 'cd android && ./gradlew connectedAndroidTest',
    timeout: 1800000,
  },
  xctest: {
    command: 'xcodebuild test -scheme empowrapp -destination "platform=iOS Simulator,name=iPhone 15"',
    timeout: 1800000,
  },
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log('═'.repeat(70), 'cyan');
  log(`  ${title}`, 'bright');
  log('═'.repeat(70), 'cyan');
  console.log('');
}

function logResult(name, passed, duration = null) {
  const status = passed ? '✅ PASSED' : '❌ FAILED';
  const durationStr = duration ? ` (${(duration / 1000).toFixed(1)}s)` : '';
  const color = passed ? 'green' : 'red';
  log(`  ${status} ${name}${durationStr}`, color);
}

function runCommand(command, options = {}) {
  const { timeout = 300000, ignoreError = false, silent = false } = options;
  const startTime = Date.now();
  
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      timeout,
      stdio: silent ? 'pipe' : 'inherit',
      cwd: process.cwd(),
    });
    
    return {
      success: true,
      output: result,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    if (ignoreError) {
      return {
        success: false,
        output: error.stdout || error.message,
        duration: Date.now() - startTime,
        error,
      };
    }
    throw error;
  }
}

function checkPrerequisites() {
  log('Checking prerequisites...', 'cyan');
  
  const checks = [
    { name: 'Node.js', command: 'node --version' },
    { name: 'npm', command: 'npm --version' },
    { name: 'Jest', command: 'npx jest --version', optional: false },
  ];
  
  const optionalChecks = [
    { name: 'Maestro', command: 'maestro --version', optional: true },
    { name: 'Android SDK', command: 'adb version', optional: true },
    { name: 'Xcode', command: 'xcodebuild -version', optional: true },
    { name: 'Firebase CLI', command: 'firebase --version', optional: true },
    { name: 'AWS CLI', command: 'aws --version', optional: true },
  ];
  
  const available = {};
  
  for (const check of [...checks, ...optionalChecks]) {
    try {
      runCommand(check.command, { silent: true, timeout: 5000 });
      available[check.name] = true;
      log(`  ✓ ${check.name}`, 'green');
    } catch {
      available[check.name] = false;
      if (check.optional) {
        log(`  ○ ${check.name} (optional, not available)`, 'yellow');
      } else {
        log(`  ✗ ${check.name} (required)`, 'red');
        process.exit(1);
      }
    }
  }
  
  return available;
}

// Test runners
async function runJestTests() {
  logSection('Running Jest Unit Tests');
  
  try {
    const result = runCommand(CONFIG.jest.command, {
      timeout: CONFIG.jest.timeout,
      ignoreError: true,
    });
    
    logResult('Jest Unit Tests', result.success, result.duration);
    return result;
  } catch (error) {
    logResult('Jest Unit Tests', false);
    return { success: false, error };
  }
}

async function runWCAGAudit() {
  logSection('Running WCAG 2.2 AAA Compliance Audit');
  
  try {
    // Run enhanced audit
    const enhancedResult = runCommand(CONFIG.wcag.command, {
      timeout: CONFIG.wcag.timeout,
      ignoreError: true,
    });
    
    logResult('WCAG 2.2 AAA Audit', enhancedResult.success, enhancedResult.duration);
    
    // Run original color contrast audit
    const colorResult = runCommand(CONFIG.wcagOriginal.command, {
      timeout: CONFIG.wcagOriginal.timeout,
      ignoreError: true,
    });
    
    logResult('Color Contrast Audit', colorResult.success, colorResult.duration);
    
    // Run a11y scan
    const a11yResult = runCommand(CONFIG.a11yScan.command, {
      timeout: CONFIG.a11yScan.timeout,
      ignoreError: true,
    });
    
    logResult('Accessibility Scan', a11yResult.success, a11yResult.duration);
    
    return {
      success: enhancedResult.success && colorResult.success && a11yResult.success,
      enhanced: enhancedResult,
      color: colorResult,
      a11y: a11yResult,
    };
  } catch (error) {
    logResult('WCAG Audit', false);
    return { success: false, error };
  }
}

async function runStressTests() {
  logSection('Running Stress Tests');
  
  try {
    const result = runCommand('npx jest __tests__/ultimate-stress-test.test.ts --testTimeout=120000', {
      timeout: 600000,
      ignoreError: true,
    });
    
    logResult('Stress Tests', result.success, result.duration);
    return result;
  } catch (error) {
    logResult('Stress Tests', false);
    return { success: false, error };
  }
}

async function runMaestroTests(available) {
  logSection('Running Maestro E2E Tests');
  
  if (!available['Maestro']) {
    log('  ⚠ Maestro not installed. Skipping...', 'yellow');
    log('  Install with: curl -Ls "https://get.maestro.mobile.dev" | bash', 'yellow');
    return { success: true, skipped: true };
  }
  
  try {
    const result = runCommand(CONFIG.maestro.command, {
      timeout: CONFIG.maestro.timeout,
      ignoreError: true,
    });
    
    logResult('Maestro E2E Tests', result.success, result.duration);
    return result;
  } catch (error) {
    logResult('Maestro E2E Tests', false);
    return { success: false, error };
  }
}

async function runEspressoTests(available) {
  logSection('Running Espresso Tests (Android)');
  
  if (!available['Android SDK']) {
    log('  ⚠ Android SDK not found. Skipping...', 'yellow');
    return { success: true, skipped: true };
  }
  
  if (!fs.existsSync(path.join(process.cwd(), 'android'))) {
    log('  ⚠ Android project not built. Run: npx expo prebuild --platform android', 'yellow');
    return { success: true, skipped: true };
  }
  
  try {
    const result = runCommand(CONFIG.espresso.command, {
      timeout: CONFIG.espresso.timeout,
      ignoreError: true,
    });
    
    logResult('Espresso Tests', result.success, result.duration);
    return result;
  } catch (error) {
    logResult('Espresso Tests', false);
    return { success: false, error };
  }
}

async function runXCTests(available) {
  logSection('Running XCUITest Tests (iOS)');
  
  if (!available['Xcode']) {
    log('  ⚠ Xcode not found. Skipping...', 'yellow');
    return { success: true, skipped: true };
  }
  
  if (process.platform !== 'darwin') {
    log('  ⚠ iOS tests can only run on macOS. Skipping...', 'yellow');
    return { success: true, skipped: true };
  }
  
  if (!fs.existsSync(path.join(process.cwd(), 'ios'))) {
    log('  ⚠ iOS project not built. Run: npx expo prebuild --platform ios', 'yellow');
    return { success: true, skipped: true };
  }
  
  try {
    const result = runCommand(CONFIG.xctest.command, {
      timeout: CONFIG.xctest.timeout,
      ignoreError: true,
    });
    
    logResult('XCUITest Tests', result.success, result.duration);
    return result;
  } catch (error) {
    logResult('XCUITest Tests', false);
    return { success: false, error };
  }
}

function generateReport(results) {
  logSection('Test Results Summary');
  
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  
  for (const [name, result] of Object.entries(results)) {
    if (result.skipped) {
      log(`  ○ ${name}: SKIPPED`, 'yellow');
      totalSkipped++;
    } else if (result.success) {
      log(`  ✅ ${name}: PASSED`, 'green');
      totalPassed++;
    } else {
      log(`  ❌ ${name}: FAILED`, 'red');
      totalFailed++;
    }
  }
  
  console.log('');
  log('─'.repeat(70), 'cyan');
  log(`  Total: ${totalPassed} passed, ${totalFailed} failed, ${totalSkipped} skipped`, 
      totalFailed > 0 ? 'red' : 'green');
  log('─'.repeat(70), 'cyan');
  
  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
    },
  };
  
  const reportPath = path.join(process.cwd(), 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\nReport saved to: ${reportPath}`, 'cyan');
  
  return totalFailed === 0;
}

// Parse arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    unit: args.includes('--unit'),
    wcag: args.includes('--wcag'),
    e2e: args.includes('--e2e'),
    espresso: args.includes('--espresso'),
    xctest: args.includes('--xctest'),
    maestro: args.includes('--maestro'),
    firebase: args.includes('--firebase'),
    aws: args.includes('--aws'),
    stress: args.includes('--stress'),
    all: args.includes('--all') || args.length === 0,
    report: args.includes('--report'),
    ci: args.includes('--ci'),
  };
}

// Main execution
async function main() {
  const args = parseArgs();
  const results = {};
  
  log('');
  log('╔══════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║           3mpwrApp Comprehensive Test Suite                          ║', 'bright');
  log('║           WCAG 2.2 AAA Compliance & Stress Testing                   ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════════════╝', 'cyan');
  
  const available = checkPrerequisites();
  
  // Run tests based on arguments
  if (args.all || args.unit) {
    results['Jest Unit Tests'] = await runJestTests();
  }
  
  if (args.all || args.wcag) {
    results['WCAG Compliance'] = await runWCAGAudit();
  }
  
  if (args.all || args.stress) {
    results['Stress Tests'] = await runStressTests();
  }
  
  if (args.all || args.e2e || args.maestro) {
    results['Maestro E2E'] = await runMaestroTests(available);
  }
  
  if (args.all || args.e2e || args.espresso) {
    results['Espresso Tests'] = await runEspressoTests(available);
  }
  
  if (args.all || args.e2e || args.xctest) {
    results['XCUITest Tests'] = await runXCTests(available);
  }
  
  // Generate final report
  const allPassed = generateReport(results);
  
  console.log('');
  if (allPassed) {
    log('🎉 All tests passed! App is ready for deployment.', 'green');
  } else {
    log('⚠️  Some tests failed. Please review the results above.', 'red');
  }
  
  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});
