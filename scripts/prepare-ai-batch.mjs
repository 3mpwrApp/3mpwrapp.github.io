/**
 * FREE AI Classification using Claude (GitHub Copilot)
 * 
 * Consolidates WSIAT decisions from yearly files (2020-2026)
 * Prepares batches for manual AI classification
 * 
 * WORKFLOW:
 * 1. Load all yearly WSIAT files
 * 2. Extract case metadata + keywords
 * 3. Create small batches (50 decisions) for AI classification
 * 4. You (user) ask me (Claude) to classify each batch
 * 5. Merge results and generate statistics
 * 
 * COST: $0 (uses existing Copilot access)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YEARLY_FILES = [
  'data/tribunal-decisions/onwsiat-2020-ultra-slow.json',
  'data/tribunal-decisions/onwsiat-2021-ultra-slow.json',
  'data/tribunal-decisions/onwsiat-2022-ultra-slow.json',
  'data/tribunal-decisions/onwsiat-2023-ultra-slow.json',
  'data/tribunal-decisions/onwsiat-2024-ultra-slow.json',
  'data/tribunal-decisions/onwsiat-2025-ultra-slow.json',
  'data/tribunal-decisions/onwsiat-2026-ultra-slow.json',
];

const BATCH_SIZE = 500; // Optimized batch size for complete classification
const PROGRESS_FILE = 'data/comprehensive-extraction/ai-progress.json';
const BATCH_DIR = 'data/comprehensive-extraction/ai-batches';

/**
 * Load all decisions from yearly files
 */
function loadAllDecisions() {
  console.log('📂 Loading WSIAT decisions from yearly files...\n');
  
  const allDecisions = [];
  
  for (const file of YEARLY_FILES) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${file} (not found)`);
      continue;
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const year = file.match(/(\d{4})/)[1];
    
    // Handle different structures (array or object with decisions property)
    const decisions = Array.isArray(data) ? data : (data.decisions || []);
    
    console.log(`✅ ${year}: ${decisions.length.toLocaleString()} decisions`);
    
    decisions.forEach(d => {
      allDecisions.push({
        caseId: d.caseId || d.data?.caseId,
        caseNumber: d.data?.docketNumber || d.docketNumber || d.caseId,
        year: parseInt(year),
        date: d.data?.decisionDate || d.decisionDate || `${year}-01-01`,
        title: d.data?.title || d.title || '',
        keywords: d.data?.keywords || d.keywords || '',
        citation: d.data?.citation || d.citation || '',
        url: d.data?.url || d.url || '',
        // Outcome fields (to be filled by AI)
        outcome: null,
        confidence: null,
        reasoning: null,
      });
    });
  }
  
  console.log(`\n📊 Total: ${allDecisions.length.toLocaleString()} decisions loaded\n`);
  return allDecisions;
}

/**
 * Load or initialize progress
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
  console.log('🚀 AI Classification System - FREE Edition\n');
  console.log('═'.repeat(70));
  
  // Load all decisions
  const allDecisions = loadAllDecisions();
  const progress = loadProgress();
  
  // Initialize if first run
  if (progress.totalDecisions === 0) {
    progress.totalDecisions = allDecisions.length;
    saveProgress(progress);
  }
  
  // Check if complete
  if (progress.classified >= allDecisions.length) {
    console.log('🎉 ALL DECISIONS CLASSIFIED!\n');
    console.log(`Total: ${progress.totalDecisions.toLocaleString()}`);
    console.log(`Completed: ${progress.batches.length} batches`);
    console.log(`Started: ${progress.startedAt}`);
    console.log(`Finished: ${new Date().toISOString()}`);
    return;
  }
  
  // Calculate batch range
  const startIndex = progress.classified;
  const endIndex = Math.min(startIndex + BATCH_SIZE, allDecisions.length);
  const batchNumber = progress.lastBatchNumber + 1;
  const batchDecisions = allDecisions.slice(startIndex, endIndex);
  
  console.log(`📊 Progress: ${progress.classified.toLocaleString()} / ${progress.totalDecisions.toLocaleString()} (${((progress.classified / progress.totalDecisions) * 100).toFixed(1)}%)`);
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
      // Classification fields (to be filled by Claude)
      outcome: null, // 'allowed' | 'denied' | 'partial' | 'remitted' | 'other' | 'unclear'
      confidence: null, // 'high' | 'medium' | 'low'
      reasoning: null, // Brief explanation (1-2 sentences)
    })),
  };
  
  const batchFile = path.join(BATCH_DIR, `batch-${batchNumber}-PENDING.json`);
  fs.writeFileSync(batchFile, JSON.stringify(batch, null, 2));
  
  // Display instructions
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                  ✨ READY FOR AI CLASSIFICATION ✨               ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📁 Batch file: ${batchFile}`);
  console.log('');
  console.log('🤖 INSTRUCTIONS:');
  console.log('');
  console.log('1. Open the batch file above');
  console.log('2. Look at first few decisions (keywords, title)');
  console.log('3. Ask Claude (me): "Classify these WSIAT decisions"');
  console.log('');
  console.log('   I will analyze keywords and titles to determine:');
  console.log('   - outcome: allowed/denied/partial/remitted/other/unclear');
  console.log('   - confidence: high/medium/low');
  console.log('   - reasoning: brief explanation');
  console.log('');
  console.log('4. Save my updated JSON with classifications');
  console.log('5. Run: node scripts/consolidate-ai-batch.mjs');
  console.log('6. Repeat for next batch!');
  console.log('');
  console.log('💡 TIP: You can do multiple batches in one session!');
  console.log('   Each batch takes ~2-5 minutes for me to classify.');
  console.log('');
  console.log('🎯 GOAL: Classify all decisions without spending $742!');
  console.log('   Total batches needed: ~' + Math.ceil(allDecisions.length / BATCH_SIZE));
  console.log('');
  console.log('═'.repeat(70));
  console.log('');
  
  // Show sample decisions
  console.log('📋 SAMPLE FROM THIS BATCH:\n');
  batchDecisions.slice(0, 3).forEach((d, idx) => {
    console.log(`${idx + 1}. Case ${d.caseNumber} (${d.year})`);
    console.log(`   Title: ${d.title}`);
    console.log(`   Keywords: ${d.keywords.substring(0, 100)}${d.keywords.length > 100 ? '...' : ''}`);
    console.log(`   URL: ${d.url}`);
    console.log('');
  });
  
  console.log(`(... ${batchDecisions.length - 3} more decisions in batch)\n`);
  console.log('✅ Batch prepared! Now ask me (Claude) to classify it.\n');
}

// Run
prepareNextBatch();
