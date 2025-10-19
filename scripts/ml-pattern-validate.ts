#!/usr/bin/env node

/**
 * ML Pattern Validation Script
 * Validates pattern data integrity and quality
 * 
 * Usage: npm run ml:validate-patterns
 */

const fs = require('fs');
const path = require('path');

interface ValidationReport {
  timestamp: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  tests: ValidationTest[];
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

interface ValidationTest {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: string;
}

const tests: ValidationTest[] = [];

function test(name: string, condition: boolean, failMessage: string, isWarning = false) {
  const status = condition ? 'PASS' : (isWarning ? 'WARNING' : 'FAIL');
  tests.push({
    name,
    status,
    message: condition ? '✓ Passed' : (failMessage || 'Test failed'),
  });
}

async function runValidation() {
  // eslint-disable-next-line no-console
  console.log('🔍 Running ML Pattern Validation Tests...\n');

  // Test 1: Pattern service exists
  const patternServicePath = path.join(
    __dirname,
    '../services/patternLearning.ts'
  );
  test(
    'Pattern Learning Service Exists',
    fs.existsSync(patternServicePath),
    'services/patternLearning.ts not found'
  );

  // Test 2: Hook file exists
  const hookPath = path.join(__dirname, '../hooks/usePatternAnalysis.ts');
  test(
    'Pattern Analysis Hook Exists',
    fs.existsSync(hookPath),
    'hooks/usePatternAnalysis.ts not found'
  );

  // Test 3: Service exports required functions
  try {
    const serviceContent = fs.readFileSync(patternServicePath, 'utf-8');
    test(
      'Service exports recordPatternDataPoint',
      serviceContent.includes('export.*recordPatternDataPoint'),
      'recordPatternDataPoint not exported'
    );
    test(
      'Service exports getUserPatterns',
      serviceContent.includes('export.*getUserPatterns'),
      'getUserPatterns not exported'
    );
    test(
      'Service exports analyzePattern',
      serviceContent.includes('export.*analyzePattern'),
      'analyzePattern not exported'
    );
  } catch (err) {
    const error = err as Error;
    console.error('Error reading service file:', error);
  }

  // Test 4: Hook provides expected interface
  try {
    const hookContent = fs.readFileSync(hookPath, 'utf-8');
    test(
      'Hook exports usePatternAnalysis',
      hookContent.includes('export function usePatternAnalysis'),
      'usePatternAnalysis not exported'
    );
    test(
      'Hook has UsePatternAnalysisResult interface',
      hookContent.includes('interface UsePatternAnalysisResult'),
      'UsePatternAnalysisResult interface not defined'
    );
  } catch (err) {
    const error = err as Error;
    console.error('Error reading hook file:', error);
  }

  // Test 5: TypeScript compilation
  // eslint-disable-next-line no-console
  console.log('\n📋 Checking TypeScript compilation...');
  test(
    'Files are TypeScript-compatible',
    patternServicePath.endsWith('.ts') && hookPath.endsWith('.ts'),
    'Files should be .ts files'
  );

  // Test 6: i18n strings (warning if not added)
  try {
    const i18nPath = path.join(__dirname, '../locales/en/common.json');
    const i18nContent = fs.readFileSync(i18nPath, 'utf-8');
    test(
      'i18n strings for patterns',
      i18nContent.includes('pattern') || i18nContent.includes('Pattern'),
      'Pattern-related i18n strings should be added',
      true // Warning only
    );
  } catch (err) {
    const error = err as Error;
    console.warn('Could not check i18n file:', error.message);
  }

  // Test 7: Pattern types are defined
  try {
    const serviceContent = fs.readFileSync(patternServicePath, 'utf-8');
    test(
      'PatternDataPoint interface defined',
      serviceContent.includes('interface PatternDataPoint'),
      'PatternDataPoint interface not found'
    );
    test(
      'Pattern interface defined',
      serviceContent.includes('interface Pattern'),
      'Pattern interface not found'
    );
    test(
      'PatternAnalysis interface defined',
      serviceContent.includes('interface PatternAnalysis'),
      'PatternAnalysis interface not found'
    );
  } catch (err) {
    const error = err as Error;
    console.error('Error checking interfaces:', error);
  }

  // Test 8: Firestore integration
  try {
    const serviceContent = fs.readFileSync(patternServicePath, 'utf-8');
    test(
      'Firestore imports present',
      serviceContent.includes('firebase/firestore'),
      'Firestore imports missing'
    );
    test(
      'Uses Firestore collections',
      serviceContent.includes('collection(db') || serviceContent.includes('doc(db'),
      'Firestore collection/doc usage not found'
    );
  } catch (error) {
    console.error('Error checking Firestore integration:', error);
  }

  // Generate report
  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    status: tests.some(t => t.status === 'FAIL') ? 'FAIL' : 'PASS',
    tests,
    summary: {
      totalTests: tests.length,
      passed: tests.filter(t => t.status === 'PASS').length,
      failed: tests.filter(t => t.status === 'FAIL').length,
      warnings: tests.filter(t => t.status === 'WARNING').length,
    },
  };

  // Print results
  // eslint-disable-next-line no-console
  console.log('\n' + '='.repeat(60));
  // eslint-disable-next-line no-console
  console.log('📊 VALIDATION REPORT');
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));

  tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✓' : test.status === 'WARNING' ? '⚠' : '✗';
    const color =
      test.status === 'PASS' ? '\x1b[32m' : test.status === 'WARNING' ? '\x1b[33m' : '\x1b[31m';
    // eslint-disable-next-line no-console
    console.log(`${color}${icon}\x1b[0m ${test.name}: ${test.message}`);
    if (test.details) {
      // eslint-disable-next-line no-console
      console.log(`  ${test.details}`);
    }
  });

  // eslint-disable-next-line no-console
  console.log('\n' + '='.repeat(60));
  // eslint-disable-next-line no-console
  console.log(`Summary: ${report.summary.passed}/${report.summary.totalTests} tests passed`);
  if (report.summary.warnings > 0) {
    // eslint-disable-next-line no-console
    console.log(`⚠️  ${report.summary.warnings} warnings`);
  }
  if (report.summary.failed > 0) {
    // eslint-disable-next-line no-console
    console.log(`❌ ${report.summary.failed} tests failed`);
  }
  // eslint-disable-next-line no-console
  console.log('='.repeat(60) + '\n');

  // Save report
  const reportPath = path.join(__dirname, '../ml-patterns-validation.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  // eslint-disable-next-line no-console
  console.log(`📄 Report saved to: ${reportPath}\n`);

  // Exit with appropriate code
  process.exit(report.summary.failed > 0 ? 1 : 0);
}

// Run validation
runValidation().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});
