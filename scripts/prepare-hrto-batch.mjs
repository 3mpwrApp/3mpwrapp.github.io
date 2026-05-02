/**
 * Prepare HRTO Classification Batch
 * 
 * Loads HRTO (Human Rights Tribunal of Ontario) decisions and prepares batches.
 * 
 * Usage: node scripts/prepare-hrto-batch.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YEARLY_FILES = [
  'onhrt-2020-complete.json',
  'onhrt-2021-complete.json',
  'onhrt-2022-complete.json',
  'onhrt-2023-complete.json',
  'onhrt-2024-complete.json',
  'onhrt-2025-complete.json',
  'onhrt-2026-complete.json',
];

const BATCH_SIZE = 500;
const BATCH_DIR = path.join(__dirname, '..', 'data/comprehensive-extraction/hrto-batches');
const PROGRESS_FILE = path.join(__dirname, '..', 'data/comprehensive-extraction/hrto-progress.json');

/**
 * Load all HRTO decisions from yearly files
 */
function loadAllDecisions() {
  const allDecisions = [];
  let index = 0;

  console.log('🔵 HRTO Classification System - FREE Edition\n');
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log('📂 Loading HRTO decisions from yearly files...\n');

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
        caseNumber: decision.case_id || `hrto${index}`,
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
    console.log('✅ All HRTO decisions already classified!\n');
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
  console.log('🎯 HRTO CLASSIFICATION PATTERNS:');
  console.log('   - Allowed: application granted, discrimination found, remedy awarded');
  console.log('   - Denied: application dismissed, no discrimination, no jurisdiction');
  console.log('   - Abandoned: applicant abandoned, withdrew, failed to attend hearing');
  console.log('   - Settled: settled, consent order, mediated resolution');
  console.log('   - Other: procedural (jurisdiction, preliminary, adjournment)');
  console.log('   - Unclear: insufficient outcome information\n');
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
