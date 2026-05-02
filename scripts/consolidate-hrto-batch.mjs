/**
 * Consolidate HRTO Classification Batch
 * 
 * Merges classified HRTO batch into master file hrto-classified.json.
 * Prevents duplicates by checking progress.batches.
 * 
 * Usage: node scripts/consolidate-hrto-batch.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_DIR = path.join(__dirname, '..', 'data/comprehensive-extraction/hrto-batches');
const MASTER_FILE = path.join(__dirname, '..', 'data/comprehensive-extraction/hrto-classified.json');
const PROGRESS_FILE = path.join(__dirname, '..', 'data/comprehensive-extraction/hrto-progress.json');

/**
 * Find latest classified batch
 */
function findLatestClassifiedBatch() {
  const files = fs.readdirSync(BATCH_DIR).filter(f => f.includes('MERGED.json'));
  if (files.length === 0) {
    console.log('❌ No classified batches found (no *-MERGED.json files)');
    return null;
  }

  // Sort by batch number
  files.sort((a, b) => {
    const aNum = parseInt(a.match(/batch-(\d+)/)[1]);
    const bNum = parseInt(b.match(/batch-(\d+)/)[1]);
    return bNum - aNum; // descending
  });

  const latestFile = path.join(BATCH_DIR, files[0]);
  const batchNumber = parseInt(files[0].match(/batch-(\d+)/)[1]);

  console.log(`📂 Found classified batch: ${files[0]} (Batch #${batchNumber})\n`);
  return { file: latestFile, batchNumber };
}

/**
 * Consolidate batch into master file
 */
function consolidateBatch() {
  console.log('🔵 HRTO Batch Consolidation\n');
  console.log('══════════════════════════════════════════════════════════════════════\n');

  const latest = findLatestClassifiedBatch();
  if (!latest) {
    process.exit(1);
  }

  // Load progress
  if (!fs.existsSync(PROGRESS_FILE)) {
    console.log('❌ Progress file not found. Run prepare-hrto-batch.mjs first.');
    process.exit(1);
  }

  const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));

  // Check if already consolidated
  if (progress.batches.includes(latest.batchNumber)) {
    console.log(`⚠️  Batch ${latest.batchNumber} already consolidated. Skipping to prevent duplicates.\n`);
    console.log('✅ No action needed.\n');
    return;
  }

  // Load batch
  const rawBatchContent = fs.readFileSync(latest.file, 'utf8');
  
  // Clean encoding issues - more aggressive cleanup
  let cleanedContent = rawBatchContent
    // Remove BOM
    .replace(/^\uFEFF/, '')
    // Fix common UTF-8 corruption patterns
    .replace(/â€"/g, '—')
    .replace(/â€'/g, '"')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/Â/g, '')
    .replace(/├│/g, '—')
    .replace(/Γé¼/g, "'")
    .replace(/ΓÇ¥/g, '—')
    .replace(/ΓÇÿ/g, "'")
    .replace(/Γä/g, "'")
    // Remove other problematic characters
    .replace(/[^\x20-\x7E\n\r\t{}\[\]",:]/g, ' ');
  
  let batchData;
  try {
    batchData = JSON.parse(cleanedContent);
  } catch (error) {
    console.log(`⚠️  JSON parse error: ${error.message}`);
    console.log('Attempting fallback: stripping all non-ASCII from keywords...\n');
    
    // More aggressive: strip keywords field entirely if needed
    const keywordStripped = cleanedContent.replace(/"keywords":\s*\[[^\]]*\]/g, '"keywords":[]');
    batchData = JSON.parse(keywordStripped);
  }
  
  const batchDecisions = batchData.decisions || batchData;

  console.log(`📦 Batch ${latest.batchNumber}:`);
  console.log(`   Decisions: ${batchDecisions.length}`);
  console.log(`   Range: ${batchData.startIndex + 1} - ${batchData.endIndex}\n`);

  // Load or create master file
  let masterData = { decisions: [] };
  if (fs.existsSync(MASTER_FILE)) {
    masterData = JSON.parse(fs.readFileSync(MASTER_FILE, 'utf8'));
    console.log(`📁 Current master file: ${masterData.decisions.length} decisions\n`);
  } else {
    console.log('📁 Creating new master file\n');
  }

  // Append batch
  masterData.decisions.push(...batchDecisions);

  // Write master file
  fs.writeFileSync(MASTER_FILE, JSON.stringify(masterData, null, 2));

  // Update progress
  progress.classified += batchDecisions.length;
  progress.batches.push(latest.batchNumber);
  progress.lastConsolidatedAt = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

  console.log('✅ Consolidation complete!\n');
  console.log(`📊 Master file: ${masterData.decisions.length.toLocaleString()} total decisions`);
  console.log(`📊 Progress: ${progress.classified} / ${progress.totalDecisions} (${((progress.classified / progress.totalDecisions) * 100).toFixed(1)}%)`);
  console.log(`📊 Batches completed: ${progress.batches.length}\n`);
  console.log('══════════════════════════════════════════════════════════════════════\n');
}

// Run
consolidateBatch();
