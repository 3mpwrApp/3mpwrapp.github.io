#!/usr/bin/env node

/**
 * 5-DAY EXTRACTION SCHEDULE RUNNER
 * 
 * Automatically runs the complete extraction schedule:
 * Day 1: ONSBT (500 cases, ~2.08 hours)
 * Day 2: ONWSIB (200 cases, ~0.83 hours)
 * Day 3: ONHRT (200 cases, ~0.83 hours)
 * Day 4: ONLRB (150 cases, ~0.63 hours)
 * Day 5: ONCA (100 cases, ~0.42 hours)
 * 
 * Usage:
 *   node scripts/extraction/run-extraction-schedule.js [day]
 *   
 * Examples:
 *   node scripts/extraction/run-extraction-schedule.js 1   (Run day 1 only)
 *   node scripts/extraction/run-extraction-schedule.js     (Show schedule)
 */

const { spawn } = require('child_process');
const path = require('path');

const SCHEDULE = [
  { day: 1, tribunal: 'onsbt', cases: 500, hours: 2.08, priority: 'CRITICAL' },
  { day: 2, tribunal: 'onwsib', cases: 200, hours: 0.83, priority: 'CRITICAL' },
  { day: 3, tribunal: 'onhrt', cases: 200, hours: 0.83, priority: 'HIGH' },
  { day: 4, tribunal: 'onlrb', cases: 150, hours: 0.63, priority: 'MEDIUM' },
  { day: 5, tribunal: 'onca', cases: 100, hours: 0.42, priority: 'MEDIUM' }
];

const dayArg = parseInt(process.argv[2]);

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║  📅 5-DAY EXTRACTION SCHEDULE                                     ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

if (!dayArg) {
  // Display schedule
  console.log('EXTRACTION SCHEDULE:\n');
  
  SCHEDULE.forEach(({ day, tribunal, cases, hours, priority }) => {
    console.log(`Day ${day}: ${tribunal.toUpperCase().padEnd(8)} (${priority.padEnd(8)}) - ${cases} cases (~${hours} hours)`);
  });
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('Total: 1,150 cases over 5 days\n');
  console.log('To run a specific day:');
  console.log('   node scripts/extraction/run-extraction-schedule.js 1\n');
  console.log('To check progress:');
  console.log('   node scripts/extraction/monitor-extraction-progress.js\n');
  process.exit(0);
}

if (dayArg < 1 || dayArg > 5) {
  console.error('❌ Error: Day must be between 1 and 5');
  process.exit(1);
}

const schedule = SCHEDULE.find(s => s.day === dayArg);
if (!schedule) {
  console.error(`❌ Error: Day ${dayArg} not found in schedule`);
  process.exit(1);
}

console.log(`🚀 Starting Day ${dayArg}: ${schedule.tribunal.toUpperCase()}\n`);
console.log(`   Tribunal: ${schedule.tribunal.toUpperCase()}`);
console.log(`   Priority: ${schedule.priority}`);
console.log(`   Target: ${schedule.cases} cases`);
console.log(`   Estimated: ~${schedule.hours} hours`);
console.log(`   API Calls: ${schedule.cases}\n`);

console.log('═══════════════════════════════════════════════════════════════════\n');

// Check if CANLII_API_KEY is set
if (!process.env.CANLII_API_KEY) {
  console.error('❌ Error: CANLII_API_KEY environment variable not set');
  console.error('   Set it with: $env:CANLII_API_KEY="your-key-here"\n');
  process.exit(1);
}

// Run extraction
const scriptPath = path.join(__dirname, 'extract-full-text-batch.js');
const child = spawn('node', [scriptPath, schedule.tribunal, '0'], {
  stdio: 'inherit',
  env: process.env
});

child.on('close', (code) => {
  console.log(`\n═══════════════════════════════════════════════════════════════════`);
  
  if (code === 0) {
    console.log(`✅ Day ${dayArg} extraction complete!\n`);
    
    if (dayArg < 5) {
      console.log(`Next step: Run Day ${dayArg + 1}`);
      console.log(`   node scripts/extraction/run-extraction-schedule.js ${dayArg + 1}\n`);
    } else {
      console.log('🎉 ALL EXTRACTIONS COMPLETE!\n');
      console.log('Next phase: Train TF-IDF ML classifier');
      console.log('   node scripts/ml/train-tfidf-classifier.js\n');
    }
  } else {
    console.log(`❌ Day ${dayArg} extraction failed with code ${code}\n`);
    console.log('Check for quota exceeded or other errors above.');
    console.log('Resume with: node scripts/extraction/extract-full-text-batch.js ${schedule.tribunal} [start_index]\n');
  }
  
  console.log('═══════════════════════════════════════════════════════════════════\n');
  process.exit(code);
});
