import fs from 'fs';
import path from 'path';

const batchesDir = '../data/comprehensive-extraction/ai-batches';
const inputFile = path.join(batchesDir, 'batch-29-MERGED.json');
const outputFile = path.join(batchesDir, 'batch-29-MERGED-clean.json');

// Read with BOM handling
const rawContent = fs.readFileSync(inputFile, 'utf8');
// Remove BOM if present
const cleanContent = rawContent.replace(/^\uFEFF/, '');

// Parse and rewrite
const data = JSON.parse(cleanContent);
fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');

// Replace original
fs.unlinkSync(inputFile);
fs.renameSync(outputFile, inputFile);

console.log('✅ File cleaned and reformatted');
console.log(`   Decisions: ${data.decisions.length}`);
