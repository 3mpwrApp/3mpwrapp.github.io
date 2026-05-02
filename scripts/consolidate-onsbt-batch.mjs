/**
 * Consolidate ONSBT Classified Batch
 * 
 * Merges classified ONSBT batch into master file and updates progress.
 * 
 * Usage: node scripts/consolidate-onsbt-batch.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_DIR = path.join(__dirname, '..', 'data/comprehensive-extraction/onsbt-batches');
const PROGRESS_FILE = path.join(__dirname, '..', 'data/comprehensive-extraction/onsbt-progress.json');
const MASTER_FILE = path.join(__dirname, '..', 'data/comprehensive-extraction/onsbt-classified.json');

/**
 * Find latest classified batch
 */
function findLatestClassifiedBatch() {
  if (!fs.existsSync(BATCH_DIR)) {
    console.log('❌ No batch directory found');
    return null;
  }

  const files = fs.readdirSync(BATCH_DIR)
    .filter(f => f.endsWith('-MERGED.json'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/batch-(\d+)/)[1]);
      const numB = parseInt(b.match(/batch-(\d+)/)[1]);
      return numB - numA; // Sort descending
    });

  if (files.length === 0) {
    console.log('❌ No classified batches found');
    return null;
  }

  const latestFile = path.join(BATCH_DIR, files[0]);
  const batch = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  
  console.log('📊 Consolidating classified batch...\n');
  console.log(`📁 Found: ${files[0]}`);
  console.log(`   Batch ${batch.batchNumber}: ${batch.decisions.length} decisions`);
  console.log(`   Classified at: ${batch.classifiedAt || 'Unknown'}`);
  console.log(`   Classified by: ${batch.classifiedBy || 'Unknown'}\n`);

  return { file: latestFile, batch };
}

/**
 * Load or create master file
 */
function loadMaster() {
  if (fs.existsSync(MASTER_FILE)) {
    return JSON.parse(fs.readFileSync(MASTER_FILE, 'utf8'));
  }

  return {
    metadata: {
      tribunal: 'ONSBT',
      fullName: 'Ontario Social Benefits Tribunal',
      totalDecisions: 0,
      lastUpdated: new Date().toISOString(),
      batches: [],
    },
    decisions: [],
  };
}

/**
 * Consolidate batch into master
 */
function consolidate() {
  const result = findLatestClassifiedBatch();
  if (!result) return;

  const { batch } = result;
  const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));

  // Check if already merged
  if (progress.batches.find(b => b.batchNumber === batch.batchNumber)) {
    console.log(`⚠️  Batch ${batch.batchNumber} already merged!\n`);
    console.log(`Current progress: ${progress.classified} / ${progress.totalDecisions} decisions\n`);
    return;
  }

  // Load master
  const master = loadMaster();

  // Add decisions
  batch.decisions.forEach(d => {
    master.decisions.push(d);
  });

  // Update metadata
  master.metadata.totalDecisions = master.decisions.length;
  master.metadata.lastUpdated = new Date().toISOString();
  master.metadata.batches.push({
    batchNumber: batch.batchNumber,
    decisionsCount: batch.decisions.length,
    mergedAt: new Date().toISOString(),
  });

  // Save master
  fs.writeFileSync(MASTER_FILE, JSON.stringify(master, null, 2));

  // Update progress
  progress.classified = master.decisions.length;
  progress.batches.push({
    batchNumber: batch.batchNumber,
    mergedAt: new Date().toISOString(),
  });
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

  console.log('✅ Batch consolidated successfully!\n');
  console.log(`📈 Master file updated: ${master.decisions.length} total decisions`);
  console.log(`📊 Progress: ${progress.classified} / ${progress.totalDecisions} (${((progress.classified / progress.totalDecisions) * 100).toFixed(1)}%)\n`);

  // Calculate outcome distribution
  const outcomes = {};
  master.decisions.forEach(d => {
    const outcome = d.outcome || 'unknown';
    outcomes[outcome] = (outcomes[outcome] || 0) + 1;
  });

  console.log('📋 Current Outcome Distribution:');
  Object.entries(outcomes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([outcome, count]) => {
      const pct = ((count / master.decisions.length) * 100).toFixed(1);
      console.log(`   ${outcome}: ${count} (${pct}%)`);
    });
  
  console.log('');
}

// Run
consolidate();
