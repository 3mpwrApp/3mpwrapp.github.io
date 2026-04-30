#!/usr/bin/env node
/**
 * WSIAT Outcome Classification using GPT-4
 * 
 * Purpose: Classify 98,992 WSIAT decisions to determine appeal outcomes
 * Current coverage: 6.1% (keyword matching)
 * Target coverage: 100% (AI classification)
 * 
 * Usage:
 *   # Test on sample (1,000 decisions)
 *   node classify-wsiat-outcomes.mjs --sample 1000
 * 
 *   # Run on full dataset
 *   node classify-wsiat-outcomes.mjs --full
 * 
 *   # Validate against known outcomes
 *   node classify-wsiat-outcomes.mjs --validate
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pLimit from 'p-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4-turbo-preview',
  temperature: 0, // Deterministic output
  maxTokens: 150,
  concurrency: 5, // 5 concurrent API calls
  batchSize: 100,
  sampleSize: 1000,
  confidenceThreshold: 0.7,
};

// File paths
const PATHS = {
  wsiatData: join(__dirname, '../data/comprehensive-extraction/wsiat-ultra-complete.json'),
  wsiatDataBackup: join(__dirname, '../../../temp-large-files/wsiat-ultra-complete.json'),
  aggregatedStats: join(__dirname, '../data/comprehensive-extraction/aggregated-statistics.json'),
  output: join(__dirname, '../data/comprehensive-extraction/wsiat-with-outcomes.json'),
  validation: join(__dirname, '../data/comprehensive-extraction/nlp-validation-results.json'),
  progress: join(__dirname, '../data/comprehensive-extraction/nlp-progress.json'),
};

// Classification prompt template
const CLASSIFICATION_PROMPT = `You are a legal analyst specializing in Canadian workplace injury appeals.

Your task: Read this WSIAT (Workplace Safety and Insurance Appeals Tribunal) decision summary and determine the outcome.

DECISION SUMMARY:
"""
{summary}
"""

CLASSIFICATION TASK:
Determine the outcome of this WSIAT appeal. Choose ONE of these categories:

1. **allowed** - Appeal was fully allowed. Worker won. WSIB decision overturned in worker's favor.
2. **denied** - Appeal was denied/dismissed. Worker lost. WSIB decision upheld.
3. **partial** - Appeal partially allowed. Some issues allowed, others denied. Mixed outcome.
4. **remitted** - Case sent back to WSIB for reconsideration. No final decision yet.
5. **other** - Procedural dismissal, withdrawal, settlement, jurisdiction issue. Not a merit decision.
6. **unclear** - Outcome cannot be determined from the summary provided.

IMPORTANT:
- Focus on the FINAL OUTCOME, not intermediate findings
- "Set aside" or "overturned" = allowed
- "Upheld" or "confirmed" = denied
- If multiple appeals are mentioned, classify the PRIMARY appellant's outcome
- Base your classification ONLY on the text provided, do not assume

OUTPUT FORMAT (JSON only, no markdown):
{
  "outcome": "allowed|denied|partial|remitted|other|unclear",
  "confidence": 0.95,
  "reasoning": "Brief explanation (1-2 sentences) of key phrases that led to this classification"
}

CLASSIFICATION:`;

/**
 * Load WSIAT decisions from JSON file
 */
function loadDecisions() {
  console.log('📂 Loading WSIAT decisions...');
  
  // Try main path first, then backup
  let filePath = PATHS.wsiatData;
  if (!existsSync(filePath)) {
    console.log('   ⚠️  Main file not found, trying backup location...');
    filePath = PATHS.wsiatDataBackup;
  }
  
  if (!existsSync(filePath)) {
    throw new Error('WSIAT data file not found. Run extract-ultra-comprehensive.mjs first.');
  }
  
  const content = readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  
  // Handle both array and object with "decisions" property
  const decisions = Array.isArray(data) ? data : (data.decisions || []);
  
  console.log(`   ✅ Loaded ${decisions.length.toLocaleString()} decisions`);
  return decisions;
}

/**
 * Select stratified random sample from decisions
 */
function selectSample(decisions, n = 1000) {
  console.log(`\n📊 Selecting stratified sample (n=${n})...`);
  
  // Group by year
  const byYear = {};
  decisions.forEach(d => {
    const year = new Date(d.date).getFullYear();
    if (year >= 2016 && year <= 2025) {
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(d);
    }
  });
  
  // Sample ~100 from each year (10 years = 1,000 total)
  const perYear = Math.floor(n / 10);
  const sample = [];
  
  Object.keys(byYear).sort().forEach(year => {
    const yearDecisions = byYear[year];
    const shuffled = yearDecisions.sort(() => Math.random() - 0.5);
    const yearSample = shuffled.slice(0, perYear);
    sample.push(...yearSample);
    console.log(`   ${year}: ${yearSample.length} decisions`);
  });
  
  console.log(`   ✅ Sample size: ${sample.length}`);
  return sample;
}

/**
 * Call OpenAI API to classify a single decision
 */
async function classifyOutcome(decision) {
  const prompt = CLASSIFICATION_PROMPT.replace('{summary}', decision.summary);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: CONFIG.model,
        temperature: CONFIG.temperature,
        max_tokens: CONFIG.maxTokens,
        messages: [
          { role: 'system', content: 'You are a legal analyst. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response (handle markdown code blocks if present)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const classification = JSON.parse(jsonMatch[0]);
    
    // Validate classification
    const validOutcomes = ['allowed', 'denied', 'partial', 'remitted', 'other', 'unclear'];
    if (!validOutcomes.includes(classification.outcome)) {
      throw new Error(`Invalid outcome: ${classification.outcome}`);
    }
    
    return {
      ...decision,
      nlp_outcome: classification.outcome,
      nlp_confidence: classification.confidence,
      nlp_reasoning: classification.reasoning,
      nlp_model: CONFIG.model,
      nlp_timestamp: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error(`   ❌ Error classifying decision ${decision.decision_id}: ${error.message}`);
    return {
      ...decision,
      nlp_outcome: 'error',
      nlp_confidence: 0,
      nlp_reasoning: error.message,
      nlp_model: CONFIG.model,
      nlp_timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Batch classify decisions with rate limiting
 */
async function batchClassify(decisions, startIndex = 0) {
  console.log(`\n🤖 Classifying ${decisions.length} decisions with GPT-4...`);
  console.log(`   Model: ${CONFIG.model}`);
  console.log(`   Concurrency: ${CONFIG.concurrency} requests`);
  console.log(`   Batch size: ${CONFIG.batchSize}`);
  
  const limit = pLimit(CONFIG.concurrency);
  const results = [];
  let processed = startIndex;
  let errors = 0;
  
  // Process in batches
  for (let i = startIndex; i < decisions.length; i += CONFIG.batchSize) {
    const batch = decisions.slice(i, i + CONFIG.batchSize);
    console.log(`\n   Batch ${Math.floor(i / CONFIG.batchSize) + 1}/${Math.ceil(decisions.length / CONFIG.batchSize)}: Processing ${batch.length} decisions...`);
    
    const batchPromises = batch.map(decision =>
      limit(() => classifyOutcome(decision))
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Count errors
    const batchErrors = batchResults.filter(r => r.nlp_outcome === 'error').length;
    errors += batchErrors;
    processed += batch.length;
    
    // Progress report
    const pct = ((processed / decisions.length) * 100).toFixed(1);
    console.log(`   ✅ Batch complete: ${batchResults.length} classified (${batchErrors} errors)`);
    console.log(`   📊 Overall progress: ${processed}/${decisions.length} (${pct}%)`);
    
    // Save progress
    saveProgress({ processed, total: decisions.length, errors, results });
    
    // Rate limiting pause (avoid hitting API limits)
    if (i + CONFIG.batchSize < decisions.length) {
      console.log('   ⏳ Pausing 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n✨ Classification complete!`);
  console.log(`   Total: ${results.length}`);
  console.log(`   Errors: ${errors} (${((errors / results.length) * 100).toFixed(1)}%)`);
  
  return results;
}

/**
 * Validate classifications against known outcomes (keyword-detected)
 */
function validateAccuracy(classifications) {
  console.log(`\n🔍 Validating accuracy against known outcomes...`);
  
  // Load known outcomes from keyword detection
  const aggregated = JSON.parse(readFileSync(PATHS.aggregatedStats, 'utf8'));
  
  // Find decisions with keyword-detected outcomes
  const knownOutcomes = classifications.filter(d => {
    const summary = d.summary.toLowerCase();
    return summary.includes('allowed') || 
           summary.includes('denied') || 
           summary.includes('dismissed') ||
           summary.includes('partial');
  });
  
  console.log(`   Found ${knownOutcomes.length} decisions with keyword-detectable outcomes`);
  
  // Compare NLP vs keyword detection
  let matches = 0;
  let mismatches = 0;
  const confusionMatrix = {};
  
  knownOutcomes.forEach(d => {
    const summary = d.summary.toLowerCase();
    let keywordOutcome = 'unclear';
    
    if (summary.includes('appeal allowed') || summary.includes('appeal is allowed')) {
      keywordOutcome = 'allowed';
    } else if (summary.includes('partially allowed')) {
      keywordOutcome = 'partial';
    } else if (summary.includes('denied') || summary.includes('dismissed')) {
      keywordOutcome = 'denied';
    }
    
    const nlpOutcome = d.nlp_outcome;
    
    if (keywordOutcome !== 'unclear') {
      if (keywordOutcome === nlpOutcome) {
        matches++;
      } else {
        mismatches++;
        if (!confusionMatrix[keywordOutcome]) confusionMatrix[keywordOutcome] = {};
        if (!confusionMatrix[keywordOutcome][nlpOutcome]) confusionMatrix[keywordOutcome][nlpOutcome] = 0;
        confusionMatrix[keywordOutcome][nlpOutcome]++;
      }
    }
  });
  
  const accuracy = ((matches / (matches + mismatches)) * 100).toFixed(1);
  
  console.log(`\n   📊 Validation Results:`);
  console.log(`   Matches: ${matches}`);
  console.log(`   Mismatches: ${mismatches}`);
  console.log(`   Accuracy: ${accuracy}%`);
  
  if (Object.keys(confusionMatrix).length > 0) {
    console.log(`\n   🔀 Confusion Matrix (Keyword → NLP):`);
    Object.entries(confusionMatrix).forEach(([keyword, nlpCounts]) => {
      console.log(`   ${keyword}:`);
      Object.entries(nlpCounts).forEach(([nlp, count]) => {
        console.log(`      → ${nlp}: ${count}`);
      });
    });
  }
  
  // Outcome distribution
  const distribution = {};
  classifications.forEach(d => {
    if (d.nlp_outcome !== 'error') {
      distribution[d.nlp_outcome] = (distribution[d.nlp_outcome] || 0) + 1;
    }
  });
  
  console.log(`\n   📈 Outcome Distribution:`);
  Object.entries(distribution).sort((a, b) => b[1] - a[1]).forEach(([outcome, count]) => {
    const pct = ((count / classifications.length) * 100).toFixed(1);
    console.log(`   ${outcome}: ${count} (${pct}%)`);
  });
  
  // Confidence analysis
  const avgConfidence = classifications
    .filter(d => d.nlp_outcome !== 'error')
    .reduce((sum, d) => sum + d.nlp_confidence, 0) / classifications.filter(d => d.nlp_outcome !== 'error').length;
  
  const lowConfidence = classifications.filter(d => d.nlp_confidence < CONFIG.confidenceThreshold && d.nlp_outcome !== 'error').length;
  
  console.log(`\n   🎯 Confidence Analysis:`);
  console.log(`   Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);
  console.log(`   Low confidence (<${CONFIG.confidenceThreshold}): ${lowConfidence} (${((lowConfidence / classifications.length) * 100).toFixed(1)}%)`);
  
  const validationResults = {
    total: classifications.length,
    matches,
    mismatches,
    accuracy: parseFloat(accuracy),
    distribution,
    avgConfidence,
    lowConfidence,
    confusionMatrix,
    timestamp: new Date().toISOString(),
  };
  
  // Save validation results
  writeFileSync(PATHS.validation, JSON.stringify(validationResults, null, 2));
  console.log(`\n   💾 Validation results saved to: ${PATHS.validation}`);
  
  return validationResults;
}

/**
 * Save progress to file (for resuming interrupted runs)
 */
function saveProgress(progress) {
  writeFileSync(PATHS.progress, JSON.stringify(progress, null, 2));
}

/**
 * Load progress from file
 */
function loadProgress() {
  if (existsSync(PATHS.progress)) {
    return JSON.parse(readFileSync(PATHS.progress, 'utf8'));
  }
  return null;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--sample';
  
  console.log('🚀 WSIAT Outcome Classification System');
  console.log('========================================\n');
  
  // Check API key
  if (!CONFIG.apiKey) {
    console.error('❌ Error: OPENAI_API_KEY environment variable not set');
    console.error('   Set it with: export OPENAI_API_KEY=sk-...');
    process.exit(1);
  }
  
  console.log(`✅ API Key found: ${CONFIG.apiKey.substring(0, 10)}...${CONFIG.apiKey.substring(CONFIG.apiKey.length - 4)}`);
  
  // Load decisions
  const allDecisions = loadDecisions();
  
  let decisions;
  let outputPath;
  
  if (mode === '--sample') {
    // Sample mode: 1,000 decisions for validation
    const sampleSize = parseInt(args[1]) || CONFIG.sampleSize;
    decisions = selectSample(allDecisions, sampleSize);
    outputPath = PATHS.output.replace('.json', '-sample.json');
    
  } else if (mode === '--full') {
    // Full mode: All 98,992 decisions
    decisions = allDecisions;
    outputPath = PATHS.output;
    
    // Check for existing progress
    const progress = loadProgress();
    if (progress && progress.processed > 0) {
      console.log(`\n📥 Found existing progress: ${progress.processed}/${progress.total} decisions classified`);
      console.log('   Resume from last checkpoint? (Press Ctrl+C to cancel, or wait 5 seconds to resume)');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Load partial results and continue
      const partialResults = JSON.parse(readFileSync(outputPath, 'utf8'));
      decisions = allDecisions.slice(progress.processed);
      console.log(`   ✅ Resuming from decision ${progress.processed + 1}`);
    }
    
  } else if (mode === '--validate') {
    // Validation mode: Just validate existing results
    console.log('🔍 Validation mode: Analyzing existing classifications...');
    const results = JSON.parse(readFileSync(PATHS.output.replace('.json', '-sample.json'), 'utf8'));
    validateAccuracy(results);
    return;
    
  } else {
    console.error(`❌ Unknown mode: ${mode}`);
    console.error('   Usage: node classify-wsiat-outcomes.mjs [--sample|--full|--validate] [sampleSize]');
    process.exit(1);
  }
  
  // Run classification
  const startTime = Date.now();
  const results = await batchClassify(decisions);
  const endTime = Date.now();
  
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n⏱️  Total time: ${duration} minutes`);
  
  // Save results
  console.log(`\n💾 Saving results to: ${outputPath}`);
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log('   ✅ Results saved');
  
  // Validate accuracy
  if (mode === '--sample') {
    const validation = validateAccuracy(results);
    
    // Go/No-Go decision
    console.log('\n🎯 GO/NO-GO DECISION:');
    if (validation.accuracy >= 90) {
      console.log(`   ✅ GO: Accuracy ${validation.accuracy}% ≥ 90% threshold`);
      console.log(`   📝 Recommendation: Proceed to Task 8 (full dataset classification)`);
      console.log(`   💰 Estimated cost: $${((allDecisions.length * 0.0075)).toFixed(2)}`);
      console.log(`   ⏱️  Estimated time: 10 days (rate limits) or 24-48 hours (batch API)`);
    } else {
      console.log(`   ❌ NO-GO: Accuracy ${validation.accuracy}% < 90% threshold`);
      console.log(`   📝 Recommendation: Tune prompt and re-test`);
      console.log(`   💡 Suggestions:`);
      console.log(`      - Add few-shot examples to prompt`);
      console.log(`      - Try Claude 3.5 Sonnet (better instruction following)`);
      console.log(`      - Manual review of misclassified cases`);
    }
  }
  
  console.log('\n✨ Classification complete!\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

export { classifyOutcome, batchClassify, validateAccuracy };
