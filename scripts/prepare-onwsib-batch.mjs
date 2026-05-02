/**
 * Prepare ONWSIB Classification Batch - FREE Edition
 * 
 * Loads ONWSIB (Workplace Safety and Insurance Board - Internal Review) decisions and prepares batches.
 * 
 * Usage: node scripts/prepare-onwsib-batch.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YEARLY_FILES = [
  'onwsib-2021-complete.json',
  'onwsib-2022-complete.json',
  'onwsib-2023-complete.json',
  'onwsib-2024-complete.json',
  'onwsib-2025-complete.json',
];

const BATCH_SIZE = 100; // Smaller batches for 431 decisions
const BATCH_DIR = path.join(__dirname, '..', 'data/comprehensive-extraction/onwsib-batches');
const PROGRESS_FILE = path.join(__dirname, '..', 'data/comprehensive-extraction/onwsib-progress.json');

/**
 * Load all ONWSIB decisions from yearly files
 */
function loadAllDecisions() {
  const allDecisions = [];
  let index = 0;

  console.log('🔵 ONWSIB Classification System - FREE Edition\n');
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log('📂 Loading ONWSIB decisions from yearly files...\n');

  for (const filename of YEARLY_FILES) {
    const filePath = path.join(__dirname, '..', 'data/tribunal-decisions', filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${filename}: File not found, skipping...`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const decisions = JSON.parse(content);
    const year = filename.match(/(\d{4})/)[1];

    decisions.forEach(decision => {
      allDecisions.push({
        index: index++,
        caseNumber: decision.case_id || `onwsib${index}`,
        year: parseInt(year),
        date: decision.decision_date || null,
        title: decision.title || 'Untitled Decision',
        keywords: decision.keywords_api || decision.keywords || '',
        url: decision.url || '',
        docketNumber: decision.docket_number || decision.case_id || '',
      });
    });

    console.log(`✅ ${year}: ${decisions.length.toLocaleString()} decisions`);
  }

  console.log(`\n📊 Total: ${allDecisions.length.toLocaleString()} decisions loaded\n`);
  return allDecisions;
}

/**
 * Load or create progress file
 */
function loadProgress(totalDecisions) {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }

  return {
    totalDecisions,
    classified: 0,
    lastBatchNumber: 0,
    batches: [],
    startedAt: new Date().toISOString(),
  };
}

/**
 * Prepare next batch
 */
function prepareNextBatch(decisions, progress) {
  const classified = progress.classified;
  const remaining = decisions.slice(classified);

  if (remaining.length === 0) {
    console.log('✅ All ONWSIB decisions already classified!\n');
    return null;
  }

  const batchNumber = progress.lastBatchNumber + 1;
  const batchDecisions = remaining.slice(0, BATCH_SIZE);

  const batch = {
    batchNumber,
    startIndex: classified,
    endIndex: classified + batchDecisions.length,
    createdAt: new Date().toISOString(),
    decisions: batchDecisions,
  };

  // Create batch directory if needed
  if (!fs.existsSync(BATCH_DIR)) {
    fs.mkdirSync(BATCH_DIR, { recursive: true });
  }

  // Write PENDING batch
  const pendingFile = path.join(BATCH_DIR, `batch-${batchNumber}-PENDING.json`);
  fs.writeFileSync(pendingFile, JSON.stringify(batch, null, 2));

  // Update progress
  progress.lastBatchNumber = batchNumber;
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

  console.log(`📊 Progress: ${classified} / ${progress.totalDecisions} (${((classified / progress.totalDecisions) * 100).toFixed(1)}%)`);
  console.log(`📦 Batch ${batchNumber}: Decisions ${batch.startIndex + 1} - ${batch.endIndex}`);
  console.log(`📝 Size: ${batchDecisions.length} decisions`);
  console.log('══════════════════════════════════════════════════════════════════════\n\n');

  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║              ✨ READY FOR CLASSIFICATION ✨                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  console.log(`📁 Batch file: ${pendingFile}\n`);
  console.log('🎯 ONWSIB CLASSIFICATION PATTERNS:');
  console.log('   - Allowed: appeal granted, decision overturned, entitlement upheld');
  console.log('   - Denied: appeal dismissed, decision confirmed, no entitlement');
  console.log('   - Remitted: remitted back to WSIB, refer back');
  console.log('   - Other: procedural (jurisdiction, time limits, withdrawal)');
  console.log('   - Unclear: medical terms without clear resolution\n');
  console.log('🔵 Next: Run PowerShell classification script on this batch\n');
  console.log('══════════════════════════════════════════════════════════════════════\n');

  // Show sample
  console.log('📋 SAMPLE FROM THIS BATCH:\n');
  batchDecisions.slice(0, 3).forEach((d, i) => {
    console.log(`${i + 1}. Case ${d.caseNumber} (${d.year})`);
    console.log(`   Title: ${d.title}`);
    console.log(`   Keywords: ${d.keywords}`);
    console.log(`   URL: ${d.url}\n`);
  });

  console.log(`(... ${batchDecisions.length - 3} more decisions in batch)\n`);
  console.log('✅ Batch prepared! Now classify with PowerShell script.');

  return batch;
}

// Run
const decisions = loadAllDecisions();
const progress = loadProgress(decisions.length);
prepareNextBatch(decisions, progress);
