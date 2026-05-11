#!/usr/bin/env node
/**
 * CanLII Scraper Launcher - Ready for 8 PM ET
 * 
 * This script runs the v5.0-enhanced scraper with optimal settings:
 * - Starts with Ontario (re-scrape for full text)
 * - Resumable if API quota is hit
 * - All safety features enabled
 * 
 * Usage:
 *   node scripts/launch-scraper-8pm.js
 *   
 * Or for specific tribunals:
 *   node scripts/launch-scraper-8pm.js --tribunals=onwsiat,onca,onhrt
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🕗 CanLII Scraper - 8 PM ET Launch');
console.log('='.repeat(70));
console.log('\n📅 Date:', new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' }));
console.log('🌍 Timezone: Eastern Time (ET)');
console.log('\n');

// Get command-line arguments
const args = process.argv.slice(2);

// Default: Start with Ontario to validate the fix
const defaultTribunals = 'onwsiat,onca,onhrt';
const tribunalsArg = args.find(arg => arg.startsWith('--tribunals='));
const tribunals = tribunalsArg ? tribunalsArg.split('=')[1] : defaultTribunals;

console.log('📋 Target Tribunals:', tribunals);
console.log('🔧 Mode: v5.0-Enhanced (Full Text + Quality Validation)');
console.log('\n');

// Set environment variable if not already set
if (!process.env.CANLII_API_KEY) {
  console.log('⚠️  CANLII_API_KEY not found in environment');
  console.log('💡 Set it first with: $env:CANLII_API_KEY = "your_key_here"');
  console.log('\n');
  process.exit(1);
}

console.log('✅ API Key: Configured\n');
console.log('🚀 Starting enhanced scraper...\n');
console.log('─'.repeat(70));
console.log('\n');

// Launch the enhanced scraper
const scriptPath = path.join(__dirname, 'scrape-canlii-tribunals-v5-enhanced.js');
const scraperProcess = spawn('node', [scriptPath, '--tribunals', tribunals], {
  stdio: 'inherit',
  env: process.env
});

scraperProcess.on('exit', (code) => {
  if (code === 0) {
    console.log('\n' + '='.repeat(70));
    console.log('✅ Scraping completed successfully!');
    console.log('='.repeat(70));
    console.log('\n📊 Next Steps:');
    console.log('  1. Check session summary in docs/scrape-session-*.json');
    console.log('  2. Run pattern analysis: node scripts/analyze-patterns.js');
    console.log('  3. Generate templates for Thunder Bay pilot');
    console.log('\n');
  } else {
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  Scraping stopped (exit code:', code + ')');
    console.log('='.repeat(70));
    console.log('\n💾 Progress has been saved.');
    console.log('🔄 Resume later with the same command.\n');
  }
});
