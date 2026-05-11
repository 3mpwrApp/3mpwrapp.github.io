#!/usr/bin/env node
/**
 * Quick Collection Script - Tonight's Run
 * 
 * Collects Ontario 2024-2026 using direct enumeration
 * Estimated: 1,500 cases, ~30 minutes, well within quota
 */

const { execSync } = require('child_process');

console.log('═══════════════════════════════════════════════════════');
console.log('  CanLII Direct Collection - Ontario Recent Cases');
console.log('═══════════════════════════════════════════════════════\n');

console.log('📌 Target: 2024-2026 Ontario WSIAT decisions');
console.log('⏱️  Estimated time: 30-40 minutes');
console.log('📊 Estimated cases: 1,200-1,500\n');

console.log('Starting in 5 seconds...\n');

setTimeout(() => {
  try {
    execSync(
      'node scripts/scrape-direct.js --database=onwsiat --years=2024,2025,2026',
      { stdio: 'inherit' }
    );
    
    console.log('\n✅ Collection complete!');
    console.log('\nNext steps:');
    console.log('1. Review: data/tribunal-decisions/onwsiat-direct-*.json');
    console.log('2. Run pattern analysis: node scripts/analyze-patterns.mjs');
    console.log('3. Generate templates: node scripts/generate-templates.mjs\n');
    
  } catch (error) {
    console.error('\n❌ Collection failed:', error.message);
    process.exit(1);
  }
}, 5000);
