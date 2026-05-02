#!/usr/bin/env node

/**
 * Prepare ALL HRTO batches at once
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const BATCH_DIR = path.join(__dirname, '..', 'data', 'comprehensive-extraction', 'hrto-batches');
const PROGRESS_FILE = path.join(__dirname, '..', 'data', 'comprehensive-extraction', 'hrto-progress.json');

const YEARLY_FILES = [
  'onhrt-2020-complete.json',
  'onhrt-2021-complete.json',
  'onhrt-2022-complete.json',
  'onhrt-2023-complete.json',
  'onhrt-2024-complete.json',
  'onhrt-2025-complete.json',
  'onhrt-2026-complete.json'
];

const BATCH_SIZE = 500;

console.log('Loading all HRTO decisions...\n');

// Load all decisions
let allDecisions = [];
for (const file of YEARLY_FILES) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${file} not found`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  allDecisions = allDecisions.concat(data);
  console.log(`Loaded ${data.length} from ${file}`);
}

console.log(`\nTotal: ${allDecisions.length} decisions`);

// Create batches directory
if (!fs.existsSync(BATCH_DIR)) {
  fs.mkdirSync(BATCH_DIR, { recursive: true });
}

// Calculate number of batches
const numBatches = Math.ceil(allDecisions.length / BATCH_SIZE);
console.log(`Creating ${numBatches} batches...`);

// Create each batch
for (let i = 0; i < numBatches; i++) {
  const batchNumber = i + 1;
  const startIndex = i * BATCH_SIZE;
  const endIndex = Math.min(startIndex + BATCH_SIZE, allDecisions.length);
  const batchDecisions = allDecisions.slice(startIndex, endIndex);
  
  const batchData = {
    batchNumber,
    startIndex,
    endIndex,
    decisions: batchDecisions
  };
  
  const batchFile = path.join(BATCH_DIR, `batch-${batchNumber}-PENDING.json`);
  fs.writeFileSync(batchFile, JSON.stringify(batchData, null, 2), 'utf8');
  console.log(`Batch ${batchNumber}: ${startIndex}-${endIndex} (${batchDecisions.length} decisions)`);
}

// Initialize progress tracker
const progress = {
  totalDecisions: allDecisions.length,
  classified: 0,
  lastBatchNumber: 0,
  batches: []
};

fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');

console.log(`\nAll ${numBatches} batches created!`);
console.log(`Run: node scripts/classify-hrto-batch.mjs`);
