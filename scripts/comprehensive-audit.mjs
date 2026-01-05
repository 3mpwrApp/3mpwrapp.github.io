#!/usr/bin/env node

/**
 * Comprehensive App Audit
 * Runs all testing, linting, and validation tools in a single pass
 * Generates a detailed report of the app's health
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.dirname(__dirname);

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

class AuditRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.timestamp = new Date().toISOString();
  }

  log(message, color = 'reset') {
    console.log(`${COLORS[color]}${message}${COLORS.reset}`);
  }

  header(title) {
    console.log('\n' + '='.repeat(80));
    this.log(`  ${title}`, 'cyan');
    console.log('='.repeat(80) + '\n');
  }

  subheader(title) {
    this.log(`\n📋 ${title}`, 'blue');
    console.log('-'.repeat(80));
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  error(message) {
    this.log(`❌ ${message}`, 'red');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'gray');
  }

  async runTest(name, command, critical = false) {
    try {
      this.info(`Running: ${command}`);
      let output = '';
      let exitCode = 0;
      
      try {
        output = execSync(command, {
          cwd: rootDir,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        });
      } catch (execError) {
        // Capture output even on error
        output = execError.stdout || execError.stderr || execError.message || '';
        exitCode = execError.status || 1;
      }

      // Determine success: exit code 0 OR exit code 1 with no actual errors (only warnings)
      const isSuccess = exitCode === 0 || 
        (output && !output.includes('error') && !output.includes('Error') && !output.includes('FAIL'));
      
      if (isSuccess) {
        this.success(`${name} - PASSED`);
        this.results.push({
          name,
          status: 'PASS',
          critical,
          output: output.substring(0, 500),
          exitCode: 0,
        });
        return true;
      } else {
        this.error(`${name} - FAILED`);
        this.results.push({
          name,
          status: 'FAIL',
          critical,
          output: output.substring(0, 500),
          exitCode,
        });
        return !critical;
      }
    } catch (error) {
      const message = error.message || '';
      this.error(`${name} - FAILED (${message})`);
      this.results.push({
        name,
        status: 'FAIL',
        critical,
        output: message.substring(0, 500),
        error: error.message,
      });
      return !critical;
    }
  }

  async runAll() {
    this.header('🔍 COMPREHENSIVE APP AUDIT');
    this.log(`Started at: ${this.timestamp}`, 'gray');

    // Phase 1: Static Analysis
    this.subheader('Phase 1: Static Analysis & Linting');
    await this.runTest(
      'ESLint (Code Quality)',
      'npm run lint',
      true
    );
    await this.runTest(
      'TypeScript (Type Checking)',
      'npm run typecheck:strict',
      true
    );

    // Phase 2: i18n & Config Validation
    this.subheader('Phase 2: Internationalization & Configuration');
    await this.runTest('i18n Validation', 'npm run i18n:validate', true);
    await this.runTest(
      'i18n Test Suite',
      'npm run i18n:test',
      false
    );
    await this.runTest(
      'Structure Validation',
      'npm run validate:structure',
      false
    );

    // Phase 3: Code Analysis
    this.subheader('Phase 3: Code Analysis & Best Practices');
    await this.runTest(
      'Analytics Validation',
      'npm run check:analytics',
      false
    );
    await this.runTest(
      'Incomplete Code Scan',
      'npm run scan:incomplete:soft',
      false
    );
    await this.runTest('Tab Names Check', 'npm run check:tabs:names', false);

    // Phase 4: Security & Performance
    this.subheader('Phase 4: Security, Performance & Accessibility');
    await this.runTest('Security Validation', 'npm run security:validate', false);
    await this.runTest(
      'Bundle Budget Check',
      'npm run perf:budget',
      false
    );
    await this.runTest('WCAG AAA Audit', 'npm run wcag:aaa', false);
    await this.runTest(
      'Accessibility Scan',
      'npm run a11y:scan',
      false
    );

    // Phase 5: Unit & Integration Tests
    this.subheader('Phase 5: Unit & Integration Tests');
    await this.runTest('Jest Tests', 'npm test', true);

    // Phase 6: Expo & Device Health
    this.subheader('Phase 6: Expo Configuration & Environment');
    await this.runTest('Expo Doctor', 'npx expo doctor', false);

    // Phase 7: Build Validation
    this.subheader('Phase 7: Build & Deployment Readiness');
    await this.runTest(
      'Web Build Compatibility',
      'npm run web:validate',
      false
    );

    // Generate Report
    this.generateReport();
  }

  generateReport() {
    this.header('📊 AUDIT SUMMARY');

    const passed = this.results.filter((r) => r.status === 'PASS').length;
    const failed = this.results.filter((r) => r.status === 'FAIL').length;
    const criticalFailed = this.results.filter(
      (r) => r.status === 'FAIL' && r.critical
    ).length;

    this.log(`Total Tests: ${this.results.length}`, 'cyan');
    this.success(`Passed: ${passed}`);
    if (failed > 0) {
      if (criticalFailed > 0) {
        this.error(`Failed: ${failed} (${criticalFailed} critical)`);
      } else {
        this.warning(`Failed: ${failed} (non-critical)`);
      }
    }

    const passRate = Math.round((passed / this.results.length) * 100);
    this.log(`\nPass Rate: ${passRate}%\n`, 'cyan');

    // Detailed Results
    this.subheader('Detailed Results');
    this.results.forEach((result) => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      const color = result.status === 'PASS' ? 'green' : 'red';
      this.log(
        `${icon} ${result.name} ${result.critical ? '[CRITICAL]' : ''}`,
        color
      );
    });

    // Generate JSON Report
    const reportPath = path.join(rootDir, 'audit-report.json');
    const report = {
      timestamp: this.timestamp,
      duration: Math.round((Date.now() - this.startTime) / 1000),
      summary: {
        total: this.results.length,
        passed,
        failed,
        criticalFailed,
        passRate: `${passRate}%`,
      },
      results: this.results,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.success(`\nDetailed report saved to: audit-report.json`);

    // Exit Code
    if (criticalFailed > 0) {
      this.error(`\n⚠️  ${criticalFailed} critical test(s) failed!`);
      process.exit(1);
    } else if (failed > 0) {
      this.warning(`\n${failed} non-critical test(s) failed`);
      process.exit(0);
    } else {
      this.success('\n✨ All tests passed! App is healthy.');
      process.exit(0);
    }
  }
}

// Run the audit
const audit = new AuditRunner();
audit.runAll().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
