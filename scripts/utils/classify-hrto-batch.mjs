#!/usr/bin/env node

/**
 * Classify HRTO batch decisions using keyword pattern matching
 * Node.js version to avoid PowerShell encoding issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_DIR = path.join(__dirname, '..', 'data', 'comprehensive-extraction', 'hrto-batches');
const PROGRESS_FILE = path.join(__dirname, '..', 'data', 'comprehensive-extraction', 'hrto-progress.json');
const MASTER_FILE = path.join(__dirname, '..', 'data', 'comprehensive-extraction', 'hrto-classified.json');

// HRTO classification patterns (human rights cases)
function classifyHRTODecision(decision) {
  const keywords_api = (decision.keywords_api || []).join(' ').toLowerCase();
  const keywords_extracted = (decision.keywords_extracted || []).join(' ').toLowerCase();
  const title = (decision.title || '').toLowerCase();
  const combined = `${keywords_api} ${keywords_extracted} ${title}`;
  
  // Pattern 1: Abandoned (application withdrawn, email undeliverable, no attendance)
  if (/(application.*dismissed.*abandoned|applicant did not|failed to attend|email.*undeliverable|did not appear|withdrawn|abandoned)/i.test(combined)) {
    return {
      outcome: 'abandoned',
      confidence: 'high',
      reasoning: 'Application abandoned or withdrawn by applicant'
    };
  }
  
  // Pattern 2: Allowed (discrimination found, application granted, remedy awarded)
  if (/(discrimination.*found|application.*granted|upheld|remedy|awarded|found.*discrimination|breach.*code|violation.*code)/i.test(combined)) {
    return {
      outcome: 'allowed',
      confidence: 'high',
      reasoning: 'Application granted or discrimination found'
    };
  }
  
  // Pattern 3: Denied (application dismissed, no discrimination found)
  if (/(application.*dismissed|no.*discrimination|dismissed.*without.*hearing|not.*established|claim.*dismissed|failed to establish)/i.test(combined)) {
    return {
      outcome: 'denied',
      confidence: 'high',
      reasoning: 'Application dismissed or no discrimination found'
    };
  }
  
  // Pattern 4: Settled (consent order, settlement, mediation successful)
  if (/(settlement|consent.*order|mediation|agreed|minutes.*settlement|resolved)/i.test(combined)) {
    return {
      outcome: 'settled',
      confidence: 'high',
      reasoning: 'Case settled or consent order'
    };
  }
  
  // Pattern 5: Other (procedural, jurisdictional, preliminary matters)
  if (/(jurisdiction|preliminary|procedural|motion|standing|defer|stay|abuse.*process)/i.test(combined)) {
    return {
      outcome: 'other',
      confidence: 'high',
      reasoning: 'Procedural or jurisdictional matter'
    };
  }
  
  // Default: Unclear
  return {
    outcome: 'unclear',
    confidence: 'low',
    reasoning: 'Insufficient information to determine outcome'
  };
}

// Load progress tracker
function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
  } catch (error) {
    console.warn('Warning: Could not load progress file:', error.message);
  }
  return {
    totalDecisions: 0,
    classified: 0,
    lastBatchNumber: 0,
    batches: []
  };
}

// Save progress tracker
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
}

// Load master classified file
function loadMasterFile() {
  try {
    if (fs.existsSync(MASTER_FILE)) {
      return JSON.parse(fs.readFileSync(MASTER_FILE, 'utf8'));
    }
  } catch (error) {
    console.warn('Warning: Could not load master file:', error.message);
  }
  return [];
}

// Save master classified file
function saveMasterFile(decisions) {
  fs.writeFileSync(MASTER_FILE, JSON.stringify(decisions, null, 2), 'utf8');
}

// Process a single batch
async function processBatch(batchNumber) {
  const pendingFile = path.join(BATCH_DIR, `batch-${batchNumber}-PENDING.json`);
  const classifiedFile = path.join(BATCH_DIR, `batch-${batchNumber}-CLASSIFIED.json`);
  
  if (!fs.existsSync(pendingFile)) {
    console.log(`No pending file found for batch ${batchNumber}`);
    return null;
  }
  
  console.log(`\n=== Processing Batch ${batchNumber} ===`);
  
  // Load batch
  const batchData = JSON.parse(fs.readFileSync(pendingFile, 'utf8'));
  const { decisions, batchNumber: bNum, startIndex, endIndex } = batchData;
  
  console.log(`Loaded ${decisions.length} decisions (indices ${startIndex}-${endIndex})`);
  
  // Classify each decision
  let classified = 0;
  for (const decision of decisions) {
    const classification = classifyHRTODecision(decision);
    decision.outcome = classification.outcome;
    decision.confidence = classification.confidence;
    decision.reasoning = classification.reasoning;
    classified++;
  }
  
  console.log(`Classified ${classified} decisions`);
  
  // Save classified batch
  const classifiedData = {
    batchNumber: bNum,
    startIndex,
    endIndex,
    createdAt: new Date().toISOString(),
    decisions
  };
  
  fs.writeFileSync(classifiedFile, JSON.stringify(classifiedData, null, 2), 'utf8');
  console.log(`Saved: ${classifiedFile}`);
  
  // Delete pending file
  fs.unlinkSync(pendingFile);
  console.log(`Deleted: ${pendingFile}`);
  
  return classifiedData;
}

// Consolidate a classified batch into master file
function consolidateBatch(batchNumber) {
  const classifiedFile = path.join(BATCH_DIR, `batch-${batchNumber}-CLASSIFIED.json`);
  
  if (!fs.existsSync(classifiedFile)) {
    console.log(`No classified file found for batch ${batchNumber}`);
    return false;
  }
  
  console.log(`Consolidating batch ${batchNumber}...`);
  
  // Load classified batch
  const batchData = JSON.parse(fs.readFileSync(classifiedFile, 'utf8'));
  const { decisions } = batchData;
  
  // Load master file
  let masterData = loadMasterFile();
  
  // Get existing case IDs to avoid duplicates
  const existingCases = new Set(masterData.map(d => d.case_id));
  
  // Add new decisions
  let added = 0;
  for (const decision of decisions) {
    if (!existingCases.has(decision.case_id)) {
      masterData.push(decision);
      added++;
    }
  }
  
  console.log(`Added ${added} new decisions to master file`);
  
  // Save master file
  saveMasterFile(masterData);
  
  // Update progress
  const progress = loadProgress();
  progress.classified = masterData.length;
  progress.lastBatchNumber = Math.max(progress.lastBatchNumber, batchNumber);
  if (!progress.batches.includes(batchNumber)) {
    progress.batches.push(batchNumber);
    progress.batches.sort((a, b) => a - b);
  }
  saveProgress(progress);
  
  console.log(`Progress: ${progress.classified} / ${progress.totalDecisions} classified`);
  
  // Rename classified file to MERGED
  const mergedFile = path.join(BATCH_DIR, `batch-${batchNumber}-MERGED.json`);
  fs.renameSync(classifiedFile, mergedFile);
  console.log(`Renamed to: ${mergedFile}`);
  
  return true;
}

// Main execution
async function main() {
  console.log('HRTO Batch Classification (Node.js)');
  console.log('====================================\n');
  
  // Load progress
  const progress = loadProgress();
  console.log(`Total decisions: ${progress.totalDecisions}`);
  console.log(`Classified: ${progress.classified}`);
  console.log(`Last batch: ${progress.lastBatchNumber}`);
  
  // Find ALL pending batch files
  const pendingFiles = fs.readdirSync(BATCH_DIR)
    .filter(f => f.endsWith('-PENDING.json'))
    .map(f => parseInt(f.match(/batch-(\d+)-PENDING/)[1]))
    .sort((a, b) => a - b);
  
  console.log(`\nFound ${pendingFiles.length} pending batches: ${pendingFiles.slice(0, 5).join(', ')}${pendingFiles.length > 5 ? '...' : ''}`);
  
  // Process all pending batches
  for (const batchNumber of pendingFiles) {
    console.log(`\n--- Batch ${batchNumber} ---`);
    
    // Process batch
    const batchData = await processBatch(batchNumber);
    if (!batchData) {
      console.log(`Failed to process batch ${batchNumber}, skipping...`);
      continue;
    }
    
    // Consolidate batch
    const consolidated = consolidateBatch(batchNumber);
    if (!consolidated) {
      console.log(`Failed to consolidate batch ${batchNumber}, skipping...`);
      continue;
    }
  }
  
  // Final summary
  const finalProgress = loadProgress();
  console.log('\n=== Final Summary ===');
  console.log(`Total decisions: ${finalProgress.totalDecisions}`);
  console.log(`Classified: ${finalProgress.classified}`);
  console.log(`Completion: ${((finalProgress.classified / finalProgress.totalDecisions) * 100).toFixed(1)}%`);
  console.log(`Batches processed: ${finalProgress.batches.length}`);
  console.log(`Master file: ${MASTER_FILE}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
