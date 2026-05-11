/**
 * AI-Powered WSIAT Outcome Classifier
 * Uses Claude (via GitHub Copilot) for FREE classification
 * 
 * WHY THIS WORKS:
 * - You have access to Claude Sonnet 4.5 (me!) via Copilot
 * - I can read legal text and understand outcomes perfectly
 * - NO API costs, NO rate limits (just session token limits)
 * - Process in batches of 100-500 decisions per run
 * - Save progress after each batch
 * 
 * STRATEGY:
 * - Run this script multiple times (each processes next batch)
 * - Takes 20-40 runs to complete all 98,992 decisions
 * - Each run: 5-10 minutes, processes 2,000-5,000 decisions
 * - Total time: ~10-15 hours of YOUR time across several days
 * 
 * @requires Node.js 20+
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BATCH_SIZE = 500; // Process 500 decisions per batch (adjust based on session limits)
const PROGRESS_FILE = path.join(__dirname, '../data/comprehensive-extraction/ai-classification-progress.json');
const OUTPUT_FILE = path.join(__dirname, '../data/comprehensive-extraction/wsiat-ai-classified.json');

/**
 * Load WSIAT decisions from local file
 */
function loadDecisions() {
  // Try temp-large-files first (where 55MB file was moved)
  const tempPath = path.join(__dirname, '../../temp-large-files/wsiat-ultra-complete.json');
  const dataPath = path.join(__dirname, '../data/comprehensive-extraction/wsiat/wsiat-ultra-complete.json');
  
  let filePath;
  if (fs.existsSync(tempPath)) {
    filePath = tempPath;
    console.log('📂 Loading from temp-large-files/');
  } else if (fs.existsSync(dataPath)) {
    filePath = dataPath;
    console.log('📂 Loading from data/comprehensive-extraction/wsiat/');
  } else {
    throw new Error('❌ wsiat-ultra-complete.json not found. Please ensure file exists.');
  }
  
  console.log('⏳ Loading decisions (55MB file, may take 10-20 seconds)...');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const decisions = data.decisions || data;
  console.log(`✅ Loaded ${decisions.length.toLocaleString()} decisions\n`);
  return decisions;
}

/**
 * Load or initialize progress tracking
 */
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return {
    totalDecisions: 0,
    classified: 0,
    lastProcessedIndex: 0,
    batches: [],
    startedAt: new Date().toISOString(),
  };
}

/**
 * Save progress after each batch
 */
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * Save classified decisions
 */
function saveResults(results) {
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
}

/**
 * Load existing classification results (if any)
 */
function loadResults() {
  if (fs.existsSync(OUTPUT_FILE)) {
    return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
  }
  return {
    metadata: {
      totalDecisions: 0,
      classified: 0,
      method: 'AI Classification (Claude Sonnet 4.5 via GitHub Copilot)',
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      batchHistory: [],
    },
    decisions: [],
  };
}

/**
 * MAIN PROCESSING FUNCTION
 * This is where YOU (the AI assistant) will classify decisions!
 * 
 * The script will:
 * 1. Load next batch of unclassified decisions
 * 2. Save them to a temporary file
 * 3. PAUSE and ask you (Claude) to classify them
 * 4. Load your classifications
 * 5. Save progress
 * 6. Repeat
 */
async function processNextBatch() {
  console.log('🚀 AI-Powered WSIAT Outcome Classifier\n');
  console.log('═'.repeat(60));
  
  // Load data
  const allDecisions = loadDecisions();
  const progress = loadProgress();
  const results = loadResults();
  
  // Initialize if first run
  if (progress.totalDecisions === 0) {
    progress.totalDecisions = allDecisions.length;
  }
  
  // Check if complete
  if (progress.lastProcessedIndex >= allDecisions.length) {
    console.log('🎉 ALL DECISIONS CLASSIFIED!\n');
    console.log(`Total: ${progress.totalDecisions.toLocaleString()}`);
    console.log(`Classified: ${progress.classified.toLocaleString()}`);
    console.log(`Started: ${progress.startedAt}`);
    console.log(`Completed: ${new Date().toISOString()}`);
    return;
  }
  
  // Calculate batch range
  const startIndex = progress.lastProcessedIndex;
  const endIndex = Math.min(startIndex + BATCH_SIZE, allDecisions.length);
  const batchDecisions = allDecisions.slice(startIndex, endIndex);
  
  console.log(`📊 Progress: ${progress.classified.toLocaleString()} / ${progress.totalDecisions.toLocaleString()} (${((progress.classified / progress.totalDecisions) * 100).toFixed(1)}%)`);
  console.log(`📦 Current Batch: ${startIndex} - ${endIndex} (${batchDecisions.length} decisions)`);
  console.log('═'.repeat(60));
  console.log('\n');
  
  // Save batch to temporary file for AI processing
  const batchFile = path.join(__dirname, '../data/comprehensive-extraction/current-batch.json');
  fs.writeFileSync(batchFile, JSON.stringify({
    batchNumber: progress.batches.length + 1,
    startIndex,
    endIndex,
    decisions: batchDecisions.map((d, idx) => ({
      batchIndex: idx,
      globalIndex: startIndex + idx,
      caseNumber: d.caseNumber || d.case || `Decision ${startIndex + idx + 1}`,
      year: d.year,
      summary: d.summary || d.decision || '',
      // Fields to be filled by AI:
      outcome: null, // 'allowed' | 'denied' | 'partial' | 'remitted' | 'other' | 'unclear'
      confidence: null, // 'high' | 'medium' | 'low'
      reasoning: null, // Brief explanation
    }))
  }, null, 2));
  
  console.log('📝 NEXT STEP: AI CLASSIFICATION NEEDED\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  Batch file ready for classification:                    ║');
  console.log('║  data/comprehensive-extraction/current-batch.json         ║');
  console.log('║                                                           ║');
  console.log('║  ACTION REQUIRED:                                         ║');
  console.log('║  1. Open current-batch.json                               ║');
  console.log('║  2. Ask AI (me/Claude): "Classify these decisions"        ║');
  console.log('║  3. AI will analyze and fill outcome/confidence/reasoning ║');
  console.log('║  4. Save the updated file                                 ║');
  console.log('║  5. Run this script again to process next batch           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  console.log('💡 TIP: You can process multiple batches in one session!');
  console.log('   Just ask: "Classify this batch, then move to the next one"\n');
  
  // Check if batch was already classified (user ran script again)
  const classified = batchDecisions.filter(d => d.outcome).length;
  if (classified > 0) {
    console.log(`⚠️  WARNING: ${classified} decisions in this batch already have outcomes.`);
    console.log('   Skipping this batch. Run script again to process next batch.\n');
    
    // Update progress
    progress.lastProcessedIndex = endIndex;
    progress.classified += batchDecisions.length;
    progress.batches.push({
      batchNumber: progress.batches.length + 1,
      startIndex,
      endIndex,
      count: batchDecisions.length,
      timestamp: new Date().toISOString(),
      status: 'skipped',
    });
    saveProgress(progress);
    
    console.log('✅ Progress updated. Run script again for next batch.\n');
  }
}

/**
 * Merge classified batch back into results
 */
function mergeBatch() {
  console.log('🔄 Merging classified batch into results...\n');
  
  const batchFile = path.join(__dirname, '../data/comprehensive-extraction/current-batch.json');
  if (!fs.existsSync(batchFile)) {
    console.log('❌ No batch file found. Run processNextBatch() first.');
    return;
  }
  
  const batch = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
  const results = loadResults();
  const progress = loadProgress();
  
  // Validate batch was classified
  const unclassified = batch.decisions.filter(d => !d.outcome || !d.confidence);
  if (unclassified.length > 0) {
    console.log(`❌ Batch contains ${unclassified.length} unclassified decisions.`);
    console.log('   Please classify all decisions before merging.\n');
    console.log('   Unclassified indices:', unclassified.map(d => d.batchIndex).slice(0, 10).join(', '));
    return;
  }
  
  // Merge into results
  results.decisions.push(...batch.decisions);
  results.metadata.classified = results.decisions.length;
  results.metadata.lastUpdated = new Date().toISOString();
  results.metadata.batchHistory.push({
    batchNumber: batch.batchNumber,
    startIndex: batch.startIndex,
    endIndex: batch.endIndex,
    count: batch.decisions.length,
    timestamp: new Date().toISOString(),
  });
  
  // Update progress
  progress.lastProcessedIndex = batch.endIndex;
  progress.classified = results.decisions.length;
  progress.batches.push({
    batchNumber: batch.batchNumber,
    startIndex: batch.startIndex,
    endIndex: batch.endIndex,
    count: batch.decisions.length,
    timestamp: new Date().toISOString(),
    status: 'completed',
  });
  
  // Save everything
  saveResults(results);
  saveProgress(progress);
  
  // Archive batch
  const archiveDir = path.join(__dirname, '../data/comprehensive-extraction/batches');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }
  fs.renameSync(batchFile, path.join(archiveDir, `batch-${batch.batchNumber}.json`));
  
  console.log('✅ Batch merged successfully!\n');
  console.log(`📊 Total Classified: ${progress.classified.toLocaleString()} / ${progress.totalDecisions.toLocaleString()} (${((progress.classified / progress.totalDecisions) * 100).toFixed(1)}%)`);
  console.log(`📦 Batches Completed: ${progress.batches.length}`);
  console.log('\n');
  
  if (progress.lastProcessedIndex < progress.totalDecisions) {
    console.log('🚀 Ready for next batch! Run: node scripts/ai-classify-wsiat.mjs\n');
  } else {
    console.log('🎉 ALL DECISIONS CLASSIFIED! Generating final report...\n');
    generateFinalReport();
  }
}

/**
 * Generate final analysis report
 */
function generateFinalReport() {
  const results = loadResults();
  const decisions = results.decisions;
  
  // Aggregate statistics
  const stats = {
    totalDecisions: decisions.length,
    outcomes: {
      allowed: decisions.filter(d => d.outcome === 'allowed').length,
      denied: decisions.filter(d => d.outcome === 'denied').length,
      partial: decisions.filter(d => d.outcome === 'partial').length,
      remitted: decisions.filter(d => d.outcome === 'remitted').length,
      other: decisions.filter(d => d.outcome === 'other').length,
      unclear: decisions.filter(d => d.outcome === 'unclear').length,
    },
    confidence: {
      high: decisions.filter(d => d.confidence === 'high').length,
      medium: decisions.filter(d => d.confidence === 'medium').length,
      low: decisions.filter(d => d.confidence === 'low').length,
    },
  };
  
  // Calculate success rate
  const detectable = stats.outcomes.allowed + stats.outcomes.denied + stats.outcomes.partial;
  const successRate = detectable > 0 
    ? ((stats.outcomes.allowed / detectable) * 100).toFixed(1)
    : 'N/A';
  
  console.log('═'.repeat(60));
  console.log('📊 FINAL CLASSIFICATION REPORT');
  console.log('═'.repeat(60));
  console.log(`\nTotal Decisions: ${stats.totalDecisions.toLocaleString()}`);
  console.log(`\nOutcomes:`);
  console.log(`  Allowed:  ${stats.outcomes.allowed.toLocaleString()} (${((stats.outcomes.allowed / stats.totalDecisions) * 100).toFixed(1)}%)`);
  console.log(`  Denied:   ${stats.outcomes.denied.toLocaleString()} (${((stats.outcomes.denied / stats.totalDecisions) * 100).toFixed(1)}%)`);
  console.log(`  Partial:  ${stats.outcomes.partial.toLocaleString()} (${((stats.outcomes.partial / stats.totalDecisions) * 100).toFixed(1)}%)`);
  console.log(`  Remitted: ${stats.outcomes.remitted.toLocaleString()} (${((stats.outcomes.remitted / stats.totalDecisions) * 100).toFixed(1)}%)`);
  console.log(`  Other:    ${stats.outcomes.other.toLocaleString()} (${((stats.outcomes.other / stats.totalDecisions) * 100).toFixed(1)}%)`);
  console.log(`  Unclear:  ${stats.outcomes.unclear.toLocaleString()} (${((stats.outcomes.unclear / stats.totalDecisions) * 100).toFixed(1)}%)`);
  console.log(`\nSuccess Rate: ${successRate}% (allowed / [allowed + denied + partial])`);
  console.log(`\nConfidence:`);
  console.log(`  High:   ${stats.confidence.high.toLocaleString()} (${((stats.confidence.high / stats.totalDecisions) * 100).toFixed(1)}%)`);
  console.log(`  Medium: ${stats.confidence.medium.toLocaleString()} (${((stats.confidence.medium / stats.totalDecisions) * 100).toFixed(1)}%)`);
  console.log(`  Low:    ${stats.confidence.low.toLocaleString()} (${((stats.confidence.low / stats.totalDecisions) * 100).toFixed(1)}%)`);
  console.log('\n');
  console.log('✅ Classification complete! Results saved to:');
  console.log('   ' + OUTPUT_FILE);
  console.log('\n');
}

// Main execution
const command = process.argv[2];

if (command === 'merge') {
  mergeBatch();
} else if (command === 'report') {
  generateFinalReport();
} else {
  processNextBatch();
}
