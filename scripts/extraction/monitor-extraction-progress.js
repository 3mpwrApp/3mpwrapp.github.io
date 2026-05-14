#!/usr/bin/env node

/**
 * EXTRACTION PROGRESS MONITOR
 * 
 * Monitors extraction progress across all Ontario tribunals
 * Shows real-time status, remaining cases, estimated completion time
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data', 'tribunal-decisions');
const tribunals = ['onsbt', 'onwsib', 'onhrt', 'onlrb', 'onca'];

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║  📊 EXTRACTION PROGRESS MONITOR                                   ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

let totalTarget = 0;
let totalCompleted = 0;
let totalFailed = 0;

tribunals.forEach(tribunal => {
  const queueFile = path.join(dataDir, 'extraction-queues', `${tribunal}-extraction-queue.json`);
  const progressFile = path.join(dataDir, `.extraction-progress-${tribunal}.json`);
  
  if (!fs.existsSync(queueFile)) {
    console.log(`⏭️  ${tribunal.toUpperCase()}: Queue not found`);
    return;
  }
  
  const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
  const target = queue.length;
  totalTarget += target;
  
  let completed = 0;
  let failed = 0;
  let lastIndex = -1;
  
  if (fs.existsSync(progressFile)) {
    const progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    completed = progress.completed ? progress.completed.length : 0;
    failed = progress.failed ? progress.failed.length : 0;
    lastIndex = progress.lastIndex || 0;
  }
  
  totalCompleted += completed;
  totalFailed += failed;
  
  const remaining = target - completed - failed;
  const pct = ((completed / target) * 100).toFixed(1);
  const status = completed === target ? '✅' : remaining > 0 ? '🔄' : '⏸️';
  
  console.log(`${status} ${tribunal.toUpperCase().padEnd(8)} | Target: ${target.toString().padStart(3)} | Completed: ${completed.toString().padStart(3)} (${pct}%) | Failed: ${failed.toString().padStart(2)} | Remaining: ${remaining.toString().padStart(3)}`);
});

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('📊 OVERALL PROGRESS\n');

const totalProcessed = totalCompleted + totalFailed;
const overallPct = totalTarget > 0 ? ((totalCompleted / totalTarget) * 100).toFixed(1) : 0;
const successRate = totalProcessed > 0 ? ((totalCompleted / totalProcessed) * 100).toFixed(1) : 0;

console.log(`Total Target: ${totalTarget.toLocaleString()} cases`);
console.log(`✅ Completed: ${totalCompleted.toLocaleString()} (${overallPct}%)`);
console.log(`❌ Failed: ${totalFailed.toLocaleString()}`);
console.log(`⏳ Remaining: ${(totalTarget - totalCompleted - totalFailed).toLocaleString()}`);
console.log(`📈 Success Rate: ${successRate}%`);

// Estimate completion time
const remaining = totalTarget - totalCompleted - totalFailed;
if (remaining > 0) {
  const daysRemaining = Math.ceil(remaining / 500); // 500 cases per day max
  const hoursPerDay = (remaining / 500) * 2.08; // 2.08 hours per 500 cases
  
  console.log(`\n⏱️  Estimated Completion:`);
  console.log(`   ${daysRemaining} days (${hoursPerDay.toFixed(1)} hours @ 500 cases/day)`);
}

console.log('\n═══════════════════════════════════════════════════════════════════\n');

// Next action recommendations
if (remaining > 0) {
  console.log('🚀 NEXT STEPS:\n');
  
  tribunals.forEach(tribunal => {
    const progressFile = path.join(dataDir, `.extraction-progress-${tribunal}.json`);
    const queueFile = path.join(dataDir, 'extraction-queues', `${tribunal}-extraction-queue.json`);
    
    if (!fs.existsSync(queueFile)) return;
    
    const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
    let completed = 0;
    let lastIndex = -1;
    
    if (fs.existsSync(progressFile)) {
      const progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
      completed = progress.completed ? progress.completed.length : 0;
      lastIndex = progress.lastIndex || 0;
    }
    
    if (completed < queue.length) {
      const startIndex = lastIndex >= 0 ? lastIndex + 1 : 0;
      console.log(`   node scripts/extraction/extract-full-text-batch.js ${tribunal} ${startIndex}`);
    }
  });
  
  console.log();
}
