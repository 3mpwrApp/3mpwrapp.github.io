/**
 * Clean HRTO Batch JSON (Remove UTF-8 BOM)
 * 
 * PowerShell ConvertTo-Json adds UTF-8 BOM that breaks JSON parsing.
 * This script removes the BOM from HRTO batch files.
 * 
 * Usage: node scripts/clean-hrto-batch.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_DIR = path.join(__dirname, '..', 'data/comprehensive-extraction/hrto-batches');

/**
 * Find latest classified batch
 */
function findLatestClassifiedBatch() {
  const files = fs.readdirSync(BATCH_DIR).filter(f => f.includes('CLASSIFIED.json'));
  if (files.length === 0) {
    console.log('❌ No classified batches found (no *-CLASSIFIED.json files)');
    return null;
  }

  // Sort by batch number (descending)
  files.sort((a, b) => {
    const aNum = parseInt(a.match(/batch-(\d+)/)[1]);
    const bNum = parseInt(b.match(/batch-(\d+)/)[1]);
    return bNum - aNum;
  });

  return path.join(BATCH_DIR, files[0]);
}

/**
 * Clean UTF-8 BOM from JSON file
 */
function cleanBOM(filePath) {
  console.log('🧹 Cleaning UTF-8 BOM from HRTO batch JSON\n');
  console.log(`📂 File: ${path.basename(filePath)}\n`);

  const rawContent = fs.readFileSync(filePath, 'utf8');

  // Check if BOM exists
  if (rawContent.charCodeAt(0) === 0xFEFF) {
    console.log('⚠️  UTF-8 BOM detected, removing...\n');
    const cleanContent = rawContent.replace(/^\uFEFF/, '');
    fs.writeFileSync(filePath, cleanContent, 'utf8');
    console.log('✅ BOM removed successfully\n');
  } else {
    console.log('✅ No BOM found, file is clean\n');
  }

  // Rename to MERGED
  const mergedPath = filePath.replace('CLASSIFIED.json', 'MERGED.json');
  fs.renameSync(filePath, mergedPath);
  console.log(`📝 Renamed: ${path.basename(filePath)} → ${path.basename(mergedPath)}\n`);
  console.log('✅ Ready for consolidation!\n');
}

// Run
const latest = findLatestClassifiedBatch();
if (latest) {
  cleanBOM(latest);
} else {
  process.exit(1);
}
