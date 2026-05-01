/**
 * Consolidate classified batch and prepare next one
 * 
 * WORKFLOW:
 * 1. Load latest CLASSIFIED batch
 * 2. Merge into master classification file
 * 3. Update progress tracking
 * 4. Prepare next batch
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_DIR = 'data/comprehensive-extraction/ai-batches';
const PROGRESS_FILE = 'data/comprehensive-extraction/ai-progress.json';
const MASTER_FILE = 'data/comprehensive-extraction/wsiat-classified.json';

function findLatestClassifiedBatch() {
  const batchDir = path.join(__dirname, '..', BATCH_DIR);
  const files = fs.readdirSync(batchDir)
    .filter(f => f.includes('-MERGED.json'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/batch-(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/batch-(\d+)/)?.[1] || '0');
      return numA - numB;
    });
  
  if (files.length === 0) {
    console.log('❌ No MERGED batches found. Did you classify a batch yet?');
    console.log('   Run: node scripts/prepare-ai-batch.mjs to create a batch first\n');
    process.exit(1);
  }
  
  return path.join(batchDir, files[files.length - 1]);
}

function loadOrInitMaster() {
  const masterPath = path.join(__dirname, '..', MASTER_FILE);
  if (fs.existsSync(masterPath)) {
    return JSON.parse(fs.readFileSync(masterPath, 'utf8'));
  }
  return {
    totalDecisions: 0,
    classifiedDecisions: 0,
    decisions: [],
    batches: [],
    outcomes: {
      allowed: 0,
      denied: 0,
      partial: 0,
      remitted: 0,
      other: 0,
      unclear: 0
    },
    confidenceLevels: {
      high: 0,
      medium: 0,
      low: 0
    },
    startedAt: new Date().toISOString(),
    lastUpdated: null,
  };
}

function loadProgress() {
  const progressPath = path.join(__dirname, '..', PROGRESS_FILE);
  if (fs.existsSync(progressPath)) {
    return JSON.parse(fs.readFileSync(progressPath, 'utf8'));
  }
  return {
    totalDecisions: 0,
    classified: 0,
    lastBatchNumber: 0,
    batches: [],
    startedAt: new Date().toISOString(),
  };
}

function consolidate() {
  console.log('🔄 Consolidating classified batch...\n');
  
  // Find latest classified batch
  const batchFile = findLatestClassifiedBatch();
  const batch = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
  
  console.log(`📦 Found: ${path.basename(batchFile)}`);
  console.log(`   Batch ${batch.batchNumber}: ${batch.decisions.length} decisions`);
  console.log(`   Classified at: ${batch.classifiedAt}`);
  console.log(`   Classified by: ${batch.classifiedBy || 'Unknown'}\n`);
  
  // Load master and progress
  const master = loadOrInitMaster();
  const progress = loadProgress();
  
  // Check if already merged
  if (progress.batches.find(b => b.batchNumber === batch.batchNumber)) {
    console.log(`⚠️  Batch ${batch.batchNumber} already merged!\n`);
    console.log(`Current progress: ${progress.classified} / ${progress.totalDecisions} decisions\n`);
    return;
  }
  
  // Merge decisions
  console.log('💾 Merging decisions into master file...');
  batch.decisions.forEach(d => {
    master.decisions.push(d);
    master.outcomes[d.outcome]++;
    master.confidenceLevels[d.confidence]++;
  });
  
  master.classifiedDecisions = master.decisions.length;
  master.lastUpdated = new Date().toISOString();
  
  // Update progress
  progress.classified += batch.decisions.length;
  progress.lastBatchNumber = batch.batchNumber;
  progress.batches.push({
    batchNumber: batch.batchNumber,
    decisionsClassified: batch.decisions.length,
    mergedAt: new Date().toISOString(),
    summary: batch.classificationSummary || null,
  });
  
  // Save master and progress
  const masterPath = path.join(__dirname, '..', MASTER_FILE);
  const progressPath = path.join(__dirname, '..', PROGRESS_FILE);
  
  fs.writeFileSync(masterPath, JSON.stringify(master, null, 2));
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
  
  // Rename batch file to MERGED
  const mergedFile = batchFile.replace('-CLASSIFIED.json', '-MERGED.json');
  fs.renameSync(batchFile, mergedFile);
  
  console.log(`✅ Batch ${batch.batchNumber} merged successfully!\n`);
  console.log('═'.repeat(70));
  console.log('📊 CURRENT PROGRESS\n');
  console.log(`Total decisions: ${progress.totalDecisions.toLocaleString()}`);
  console.log(`Classified: ${progress.classified.toLocaleString()} (${((progress.classified / progress.totalDecisions) * 100).toFixed(1)}%)`);
  console.log(`Remaining: ${(progress.totalDecisions - progress.classified).toLocaleString()}`);
  console.log(`Batches completed: ${progress.batches.length}\n`);
  
  console.log('📈 OUTCOME DISTRIBUTION\n');
  Object.entries(master.outcomes).forEach(([outcome, count]) => {
    const pct = ((count / master.classifiedDecisions) * 100).toFixed(1);
    console.log(`  ${outcome.padEnd(10)}: ${count.toString().padStart(4)} (${pct}%)`);
  });
  console.log('');
  
  console.log('🎯 CONFIDENCE DISTRIBUTION\n');
  Object.entries(master.confidenceLevels).forEach(([level, count]) => {
    const pct = ((count / master.classifiedDecisions) * 100).toFixed(1);
    console.log(`  ${level.padEnd(10)}: ${count.toString().padStart(4)} (${pct}%)`);
  });
  console.log('');
  
  console.log('═'.repeat(70));
  console.log('');
  
  if (progress.classified < progress.totalDecisions) {
    console.log('✨ NEXT STEPS:\n');
    console.log('1. Run: node scripts/prepare-ai-batch.mjs');
    console.log('2. Classify the new batch');
    console.log('3. Run this script again\n');
    console.log(`🎯 Goal: ${Math.ceil((progress.totalDecisions - progress.classified) / 50)} more batches to go!\n`);
  } else {
    console.log('🎉 ALL DECISIONS CLASSIFIED!\n');
    console.log(`✅ Completed ${progress.batches.length} batches`);
    console.log(`✅ Classified ${progress.classified.toLocaleString()} decisions`);
    console.log(`✅ Started: ${progress.startedAt}`);
    console.log(`✅ Finished: ${new Date().toISOString()}\n`);
    console.log('📁 Master file: data/comprehensive-extraction/wsiat-classified.json\n');
  }
}

// Run
try {
  consolidate();
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
