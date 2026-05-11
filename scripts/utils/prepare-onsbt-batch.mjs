/**
 * Prepare ONSBT Batch for Classification
 * 
 * Loads ONSBT (Ontario Social Benefits Tribunal) decisions from yearly files
 * and prepares next batch of 500 decisions for classification.
 * 
 * Usage: node scripts/prepare-onsbt-batch.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YEARLY_FILES = [
  'data/tribunal-decisions/onsbt-2020-complete.json',
  'data/tribunal-decisions/onsbt-2021-complete.json',
  'data/tribunal-decisions/onsbt-2022-complete.json',
  'data/tribunal-decisions/onsbt-2023-complete.json',
  'data/tribunal-decisions/onsbt-2024-complete.json',
  'data/tribunal-decisions/onsbt-2025-complete.json',
  'data/tribunal-decisions/onsbt-2026-complete.json',
];

const BATCH_SIZE = 500;

// Resolve paths relative to parent directory
const PROGRESS_FILE = path.join(__dirname, '..', 'data/comprehensive-extraction/onsbt-progress.json');
const BATCH_DIR = path.join(__dirname, '..', 'data/comprehensive-extraction/onsbt-batches');

/**
 * Load all ONSBT decisions from yearly files
 */
function loadAllDecisions() {
  console.log('🔵 ONSBT Classification System - FREE Edition\n');
  console.log('═'.repeat(70));
  console.log('📂 Loading ONSBT decisions from yearly files...\n');

  const allDecisions = [];
  const yearlyStats = {};

  for (const file of YEARLY_FILES) {
    try {
      const filePath = path.join(__dirname, '..', file);
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${path.basename(file)} (not found)`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const year = path.basename(file).match(/(\d{4})/)[1];
      
      yearlyStats[year] = data.length;
      console.log(`✅ ${year}: ${data.length.toLocaleString()} decisions`);

      // Extract relevant fields
      data.forEach(d => {
        allDecisions.push({
          caseNumber: d.case_id || d.caseNumber || 'Unknown',
          year: d.decision_date ? new Date(d.decision_date).getFullYear() : parseInt(year),
          date: d.decision_date || null,
          title: d.title || '',
          keywords: (d.keywords_api || []).join(', '),
          url: d.url || '',
          docketNumber: d.docket_number || '',
        });
      });
    } catch (err) {
      console.error(`❌ Error loading ${file}:`, err.message);
    }
  }

  console.log(`\n📊 Total: ${allDecisions.length.toLocaleString()} decisions loaded\n`);
  return allDecisions;
}

/**
 * Load progress tracking
 */
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }

  return {
    totalDecisions: 0,
    classified: 0,
    lastBatchNumber: 0,
    batches: [],
    startedAt: new Date().toISOString(),
  };
}

/**
 * Save progress
 */
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * Prepare next batch for classification
 */
function prepareNextBatch() {
  const allDecisions = loadAllDecisions();
  const progress = loadProgress();

  // Update total if first run
  if (progress.totalDecisions === 0) {
    progress.totalDecisions = allDecisions.length;
  }

  // Calculate next batch
  const classified = progress.classified || 0;
  const remaining = allDecisions.length - classified;

  if (remaining === 0) {
    console.log('🎉 All ONSBT decisions already classified!\n');
    return;
  }

  const batchNumber = progress.lastBatchNumber + 1;
  const startIndex = classified;
  const endIndex = Math.min(startIndex + BATCH_SIZE, allDecisions.length);
  const batchDecisions = allDecisions.slice(startIndex, endIndex);

  console.log('📊 Progress: ' + `${classified.toLocaleString()} / ${allDecisions.length.toLocaleString()} (${((classified / allDecisions.length) * 100).toFixed(1)}%)`);
  console.log(`📦 Batch ${batchNumber}: Decisions ${startIndex + 1} - ${endIndex}`);
  console.log(`📝 Size: ${batchDecisions.length} decisions`);
  console.log('═'.repeat(70));
  console.log('\n');
  
  // Create batch directory if needed
  if (!fs.existsSync(BATCH_DIR)) {
    fs.mkdirSync(BATCH_DIR, { recursive: true });
  }
  
  // Prepare batch file
  const batch = {
    batchNumber,
    startIndex,
    endIndex,
    createdAt: new Date().toISOString(),
    decisions: batchDecisions.map((d, idx) => ({
      index: startIndex + idx,
      caseNumber: d.caseNumber,
      year: d.year,
      date: d.date,
      title: d.title,
      keywords: d.keywords,
      url: d.url,
      docketNumber: d.docketNumber,
      outcome: null, // 'allowed' | 'denied' | 'partial' | 'dismissed' | 'other' | 'unclear'
      confidence: null, // 'high' | 'medium' | 'low'
      reasoning: null, // Brief explanation (1-2 sentences)
    })),
  };
  
  const batchFile = path.join(BATCH_DIR, `batch-${batchNumber}-PENDING.json`);
  fs.writeFileSync(batchFile, JSON.stringify(batch, null, 2));
  
  // Update progress
  progress.lastBatchNumber = batchNumber;
  saveProgress(progress);
  
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║              ✨ READY FOR CLASSIFICATION ✨                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📁 Batch file: ${batchFile}`);
  console.log('');
  console.log('🎯 ONSBT CLASSIFICATION PATTERNS:');
  console.log('   - Allowed: appeal allowed, granted eligibility, entitlement upheld');
  console.log('   - Denied: appeal dismissed, not eligible, no entitlement');
  console.log('   - Partial: partial success, some benefits granted');
  console.log('   - Other: procedural (reconsideration, withdrawal, time limits)');
  console.log('   - Unclear: medical/disability terms without clear resolution');
  console.log('');
  console.log('🔵 Next: Run PowerShell classification script on this batch');
  console.log('');
  console.log('═'.repeat(70));
  
  // Display sample decisions
  console.log('\n📋 SAMPLE FROM THIS BATCH:\n');
  batchDecisions.slice(0, 3).forEach((d, i) => {
    console.log(`${i + 1}. Case ${d.caseNumber} (${d.year})`);
    console.log(`   Title: ${d.title}`);
    console.log(`   Keywords: ${d.keywords || 'None'}`);
    console.log(`   URL: ${d.url}\n`);
  });
  
  console.log(`(... ${batchDecisions.length - 3} more decisions in batch)\n`);
  console.log('✅ Batch prepared! Now classify with PowerShell script.\n');
}

// Run
prepareNextBatch();
