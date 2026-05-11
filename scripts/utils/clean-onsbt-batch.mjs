/**
 * Clean ONSBT JSON files (remove BOM and fix encoding)
 * 
 * Usage: node scripts/clean-onsbt-batch.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_DIR = path.join(__dirname, '..', 'data/comprehensive-extraction/onsbt-batches');

function findLatestMergedBatch() {
  if (!fs.existsSync(BATCH_DIR)) {
    console.log('No batch directory found');
    return null;
  }

  const files = fs.readdirSync(BATCH_DIR)
    .filter(f => f.endsWith('-MERGED.json'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/batch-(\d+)/)[1]);
      const numB = parseInt(b.match(/batch-(\d+)/)[1]);
      return numB - numA;
    });

  if (files.length === 0) {
    console.log('No merged batches found');
    return null;
  }

  return path.join(BATCH_DIR, files[0]);
}

function cleanJSON(filePath) {
  // Read raw content
  let rawContent = fs.readFileSync(filePath, 'utf8');
  
  // Remove BOM if present
  rawContent = rawContent.replace(/^\uFEFF/, '');
  
  // Write back
  fs.writeFileSync(filePath, rawContent, 'utf8');
  
  console.log(`Cleaned: ${path.basename(filePath)}`);
}

// Run
const file = findLatestMergedBatch();
if (file) {
  cleanJSON(file);
} else {
  console.log('No file to clean');
}
