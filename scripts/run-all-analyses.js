#!/usr/bin/env node
/**
 * 🚀 RUN ALL ANALYSES - Master Script
 * 
 * Executes all analysis scripts in correct order:
 * 1. Statistical Rigor (chi-square, CIs, effect sizes)
 * 2. Sensitivity Analysis (missing data scenarios)
 * 3. Comparative Analysis (framework for HRTO/WCAT comparison)
 * 4. Comprehensive Audit (final checklist)
 */

const { execSync } = require('child_process');
const path = require('path');

const SCRIPTS_DIR = __dirname;

console.log('🚀 RUNNING ALL ONWSIAT ANALYSES');
console.log('═══════════════════════════════════════════════════════════════════\n');

const scripts = [
  {
    name: 'Statistical Rigor Analysis',
    file: 'analyze-onwsiat-statistical-rigor.js',
    description: 'Chi-square tests, confidence intervals, effect sizes'
  },
  {
    name: 'Sensitivity Analysis',
    file: 'analyze-onwsiat-sensitivity-analysis.js',
    description: 'Impact of missing 1,545 decisions on conclusions'
  },
  {
    name: 'Comparative Analysis Plan',
    file: 'analyze-onwsiat-comparative-analysis.js',
    description: 'Framework for comparing WSIB to other tribunals'
  },
  {
    name: 'Comprehensive Audit',
    file: 'analyze-onwsiat-comprehensive-audit.js',
    description: 'Final checklist covering all research gaps'
  }
];

scripts.forEach((script, idx) => {
  console.log(`\n${'═'.repeat(71)}`);
  console.log(`ANALYSIS ${idx + 1}/${scripts.length}: ${script.name}`);
  console.log(`${script.description}`);
  console.log('═'.repeat(71));
  
  try {
    const scriptPath = path.join(SCRIPTS_DIR, script.file);
    execSync(`node "${scriptPath}"`, { 
      stdio: 'inherit',
      cwd: SCRIPTS_DIR
    });
    console.log(`\n✅ ${script.name} complete!`);
  } catch (error) {
    console.error(`\n❌ ERROR in ${script.name}:`);
    console.error(error.message);
    process.exit(1);
  }
});

console.log('\n' + '═'.repeat(71));
console.log('✅ ALL ANALYSES COMPLETE!');
console.log('═'.repeat(71));
console.log('\n📄 Reports generated in:');
console.log('   • data/tribunal-decisions/statistical-analysis/');
console.log('   • data/tribunal-decisions/sensitivity-analysis/');
console.log('   • data/tribunal-decisions/comparative-analysis/');
console.log('   • data/tribunal-decisions/audit/');
console.log('\n🎯 NEXT STEPS:');
console.log('   1. Review all generated JSON reports');
console.log('   2. Update blog posts with confidence intervals');
console.log('   3. Add statistical test results to methodology sections');
console.log('   4. Run comparative data collection (WCAT BC, HRTO)');
console.log('   5. Legal review before media outreach\n');
