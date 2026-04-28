#!/usr/bin/env node
/**
 * NLP Outcome Predictor - Train & Predict
 * 
 * Trains a machine learning model to predict tribunal decision outcomes
 * based on keywords, titles, and other metadata from CanLII API.
 * 
 * APPROACH:
 * 1. Collect all decisions with known outcomes (training data)
 * 2. Extract features: keywords, word counts, tribunal, year
 * 3. Train classifier (TF-IDF + Logistic Regression)
 * 4. Predict outcomes for unknown decisions
 * 5. Output confidence scores for each prediction
 * 
 * TRAINING DATA SOURCES:
 * - onwsiat-historical-20260404.json (226 with outcomes from snippet analysis)
 * - User-tagged decisions (tier A/B files if available)
 * - Any decisions with outcome != "Unknown"
 * 
 * Usage:
 *   node scripts/train-outcome-predictor.js --train
 *   node scripts/train-outcome-predictor.js --predict --input=onwsiat-2020.json
 *   node scripts/train-outcome-predictor.js --all
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const MODEL_DIR = path.join(__dirname, '..', 'models');
const OUTPUT_SUFFIX = '-predicted-outcomes';

// Ensure model directory exists
if (!fs.existsSync(MODEL_DIR)) {
  fs.mkdirSync(MODEL_DIR, { recursive: true });
}

// Configuration
const ARGS = process.argv.slice(2);
const TRAIN = ARGS.includes('--train');
const PREDICT = ARGS.includes('--predict');
const ALL = ARGS.includes('--all');
const INPUT_FILE = ARGS.find(arg => arg.startsWith('--input='))?.split('=')[1];

/**
 * Extract features from decision metadata
 */
function extractFeatures(decision) {
  const keywords = (decision.keywords || '').toLowerCase();
  const title = (decision.title || '').toLowerCase();
  const snippet = (decision.snippet || '').toLowerCase();
  const text = [keywords, title, snippet].join(' ');
  
  // Word presence features (binary)
  const features = {
    // Win indicators
    has_entitled: text.includes('entitled') ? 1 : 0,
    has_allowed: text.includes('allowed') || text.includes('granted') ? 1 : 0,
    has_successful: text.includes('successful') ? 1 : 0,
    has_favour_worker: text.includes('in favour') && text.includes('worker') ? 1 : 0,
    
    // Loss indicators
    has_not_entitled: text.includes('not entitled') ? 1 : 0,
    has_dismissed: text.includes('dismissed') || text.includes('denied') ? 1 : 0,
    has_insufficient: text.includes('insufficient') ? 1 : 0,
    has_credibility: text.includes('credibility') ? 1 : 0,
    
    // Partial/Remand indicators
    has_partial: text.includes('partially') || text.includes('in part') ? 1 : 0,
    has_remitted: text.includes('remitted') || text.includes('sent back') ? 1 : 0,
    
    // Medical conditions (correlate with outcomes)
    has_chronic_pain: text.includes('chronic pain') ? 1 : 0,
    has_psychological: text.includes('psychological') || text.includes('mental') || text.includes('ptsd') ? 1 : 0,
    has_back_injury: text.includes('back') || text.includes('spine') ? 1 : 0,
    has_preexisting: text.includes('pre-existing') || text.includes('preexisting') ? 1 : 0,
    
    // NEL/LOE benefits (common win scenarios)
    has_nel: text.includes('nel') || text.includes('non-economic loss') ? 1 : 0,
    has_loe: text.includes('loe') || text.includes('loss of earnings') ? 1 : 0,
    
    // Metadata features
    year: parseInt(decision.decisionDate?.substring(0, 4)) || 2020,
    tribunal_wsiat: (decision.tribunal || '').toLowerCase().includes('wsiat') ? 1 : 0,
    tribunal_hrto: (decision.tribunal || '').toLowerCase().includes('hrto') || (decision.tribunal || '').toLowerCase().includes('human rights') ? 1 : 0,
    tribunal_onsbt: (decision.tribunal || '').toLowerCase().includes('onsbt') || (decision.tribunal || '').toLowerCase().includes('social benefits') ? 1 : 0,
    
    // Text length (longer = more detailed = possibly more favorable)
    keyword_length: keywords.length,
    snippet_length: snippet.length,
  };
  
  return features;
}

/**
 * Simple Naive Bayes classifier
 */
class NaiveBayesClassifier {
  constructor() {
    this.classCounts = {};
    this.featureCounts = {};
    this.totalDocs = 0;
  }
  
  train(features, label) {
    // Count classes
    this.classCounts[label] = (this.classCounts[label] || 0) + 1;
    this.totalDocs++;
    
    // Count features per class
    if (!this.featureCounts[label]) {
      this.featureCounts[label] = {};
    }
    
    for (const [feature, value] of Object.entries(features)) {
      if (typeof value === 'number' && value !== 0) {
        this.featureCounts[label][feature] = (this.featureCounts[label][feature] || 0) + 1;
      }
    }
  }
  
  predict(features) {
    const scores = {};
    
    for (const [label, count] of Object.entries(this.classCounts)) {
      // Prior probability: P(class)
      let score = Math.log((count + 1) / (this.totalDocs + Object.keys(this.classCounts).length));
      
      // Likelihood: P(features|class)
      for (const [feature, value] of Object.entries(features)) {
        if (typeof value === 'number' && value !== 0) {
          const featureCount = this.featureCounts[label]?.[feature] || 0;
          const probability = (featureCount + 1) / (count + 2); // Laplace smoothing
          score += Math.log(probability);
        }
      }
      
      scores[label] = score;
    }
    
    // Convert log scores to probabilities
    const maxScore = Math.max(...Object.values(scores));
    const expScores = {};
    let sumExp = 0;
    
    for (const [label, score] of Object.entries(scores)) {
      expScores[label] = Math.exp(score - maxScore);
      sumExp += expScores[label];
    }
    
    const probabilities = {};
    for (const [label, expScore] of Object.entries(expScores)) {
      probabilities[label] = expScore / sumExp;
    }
    
    // Get top prediction
    const topLabel = Object.keys(probabilities).reduce((a, b) => 
      probabilities[a] > probabilities[b] ? a : b
    );
    
    return {
      prediction: topLabel,
      confidence: probabilities[topLabel],
      probabilities: probabilities,
    };
  }
  
  save(filepath) {
    const model = {
      classCounts: this.classCounts,
      featureCounts: this.featureCounts,
      totalDocs: this.totalDocs,
    };
    fs.writeFileSync(filepath, JSON.stringify(model, null, 2));
  }
  
  load(filepath) {
    const model = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    this.classCounts = model.classCounts;
    this.featureCounts = model.featureCounts;
    this.totalDocs = model.totalDocs;
  }
}

/**
 * Collect training data from all files with known outcomes
 */
function collectTrainingData() {
  console.log('📚 Collecting training data...\n');
  
  const trainingData = [];
  
  // Find all decision files
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(DATA_DIR, f));
  
  for (const file of files) {
    try {
      const rawData = fs.readFileSync(file, 'utf-8');
      const parsed = JSON.parse(rawData);
      const decisions = Array.isArray(parsed) ? parsed : (parsed.decisions || parsed.data || []);
      
      // Filter for decisions with known outcomes
      const labeled = decisions.filter(d => {
        const outcome = d.outcome || 'Unknown';
        return outcome !== 'Unknown' && outcome !== 'unknown' && outcome !== '';
      });
      
      if (labeled.length > 0) {
        console.log(`   ✅ ${path.basename(file)}: ${labeled.length} labeled decisions`);
        trainingData.push(...labeled);
      }
    } catch (error) {
      // Skip files that can't be parsed
      continue;
    }
  }
  
  console.log(`\n📊 Total training examples: ${trainingData.length}`);
  
  // Show class distribution
  const classCounts = {};
  trainingData.forEach(d => {
    const outcome = d.outcome;
    classCounts[outcome] = (classCounts[outcome] || 0) + 1;
  });
  
  console.log('\n📋 Class distribution:');
  for (const [outcome, count] of Object.entries(classCounts).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / trainingData.length) * 100).toFixed(1);
    console.log(`   ${outcome}: ${count} (${pct}%)`);
  }
  
  return trainingData;
}

/**
 * Train the model
 */
function trainModel(trainingData) {
  console.log('\n🎓 Training Naive Bayes classifier...\n');
  
  const model = new NaiveBayesClassifier();
  
  // Split into train/test (80/20)
  const shuffled = trainingData.sort(() => Math.random() - 0.5);
  const splitIdx = Math.floor(shuffled.length * 0.8);
  const trainSet = shuffled.slice(0, splitIdx);
  const testSet = shuffled.slice(splitIdx);
  
  console.log(`   Training set: ${trainSet.length} examples`);
  console.log(`   Test set: ${testSet.length} examples\n`);
  
  // Train
  let trainCount = 0;
  for (const decision of trainSet) {
    const features = extractFeatures(decision);
    model.train(features, decision.outcome);
    trainCount++;
    
    if (trainCount % 100 === 0) {
      process.stdout.write(`   Trained: ${trainCount}/${trainSet.length}\r`);
    }
  }
  console.log(`   Trained: ${trainCount}/${trainSet.length} ✅\n`);
  
  // Test
  console.log('🎯 Testing on holdout set...\n');
  let correct = 0;
  const confusionMatrix = {};
  
  for (const decision of testSet) {
    const features = extractFeatures(decision);
    const result = model.predict(features);
    
    const actual = decision.outcome;
    const predicted = result.prediction;
    
    if (actual === predicted) {
      correct++;
    }
    
    // Build confusion matrix
    if (!confusionMatrix[actual]) confusionMatrix[actual] = {};
    confusionMatrix[actual][predicted] = (confusionMatrix[actual][predicted] || 0) + 1;
  }
  
  const accuracy = (correct / testSet.length) * 100;
  console.log(`   ✅ Accuracy: ${accuracy.toFixed(1)}% (${correct}/${testSet.length})\n`);
  
  // Show confusion matrix
  console.log('📊 Confusion Matrix:');
  console.log('   (Actual → Predicted)\n');
  
  const outcomes = [...new Set([...Object.keys(confusionMatrix), ...Object.values(confusionMatrix).flatMap(Object.keys)])];
  
  for (const actual of outcomes) {
    console.log(`   ${actual}:`);
    for (const predicted of outcomes) {
      const count = confusionMatrix[actual]?.[predicted] || 0;
      if (count > 0) {
        console.log(`      → ${predicted}: ${count}`);
      }
    }
  }
  
  // Save model
  const modelPath = path.join(MODEL_DIR, 'outcome-predictor.json');
  model.save(modelPath);
  console.log(`\n💾 Model saved: ${modelPath}`);
  
  // Save training metadata
  const metadata = {
    trainedDate: new Date().toISOString(),
    trainingExamples: trainSet.length,
    testExamples: testSet.length,
    accuracy: accuracy,
    classes: Object.keys(model.classCounts),
  };
  fs.writeFileSync(path.join(MODEL_DIR, 'model-metadata.json'), JSON.stringify(metadata, null, 2));
  
  return model;
}

/**
 * Predict outcomes for a file
 */
function predictOutcomes(inputFile, model) {
  console.log(`\n🔮 Predicting outcomes for: ${path.basename(inputFile)}\n`);
  
  // Load decisions
  const rawData = fs.readFileSync(inputFile, 'utf-8');
  const parsed = JSON.parse(rawData);
  const decisions = Array.isArray(parsed) ? parsed : (parsed.decisions || parsed.data || []);
  
  // Filter for unknown outcomes
  const unknownOutcomes = decisions.filter(d => {
    const outcome = d.outcome || 'Unknown';
    return outcome === 'Unknown' || outcome === 'unknown' || outcome === '';
  });
  
  console.log(`   Total decisions: ${decisions.length}`);
  console.log(`   Unknown outcomes: ${unknownOutcomes.length}\n`);
  
  if (unknownOutcomes.length === 0) {
    console.log('   ✅ All decisions already have outcomes!\n');
    return decisions;
  }
  
  // Predict
  let predicted = 0;
  const outcomeCounts = {
    'Worker Won': 0,
    'Worker Lost': 0,
    'Partial Win': 0,
    'Remanded': 0,
  };
  const confidenceBuckets = {
    'high': 0,    // >80%
    'medium': 0,  // 60-80%
    'low': 0,     // <60%
  };
  
  const enrichedDecisions = decisions.map(decision => {
    const outcome = decision.outcome || 'Unknown';
    
    if (outcome !== 'Unknown' && outcome !== 'unknown' && outcome !== '') {
      return decision; // Keep existing outcome
    }
    
    // Predict
    const features = extractFeatures(decision);
    const result = model.predict(features);
    
    predicted++;
    outcomeCounts[result.prediction] = (outcomeCounts[result.prediction] || 0) + 1;
    
    if (result.confidence > 0.8) {
      confidenceBuckets.high++;
    } else if (result.confidence > 0.6) {
      confidenceBuckets.medium++;
    } else {
      confidenceBuckets.low++;
    }
    
    return {
      ...decision,
      outcome: result.prediction,
      outcome_confidence: result.confidence,
      outcome_method: 'ml_prediction',
      outcome_probabilities: result.probabilities,
    };
  });
  
  console.log(`   ✅ Predicted: ${predicted} outcomes\n`);
  console.log('   📊 Predicted outcome distribution:');
  for (const [outcome, count] of Object.entries(outcomeCounts).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / predicted) * 100).toFixed(1);
    console.log(`      ${outcome}: ${count} (${pct}%)`);
  }
  
  console.log('\n   🎓 Confidence distribution:');
  console.log(`      High (>80%):   ${confidenceBuckets.high} (${((confidenceBuckets.high/predicted)*100).toFixed(1)}%)`);
  console.log(`      Medium (60-80%): ${confidenceBuckets.medium} (${((confidenceBuckets.medium/predicted)*100).toFixed(1)}%)`);
  console.log(`      Low (<60%):    ${confidenceBuckets.low} (${((confidenceBuckets.low/predicted)*100).toFixed(1)}%)`);
  
  // Save enriched file
  const outputPath = inputFile.replace('.json', `${OUTPUT_SUFFIX}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(enrichedDecisions, null, 2));
  console.log(`\n   💾 Saved: ${path.basename(outputPath)}\n`);
  
  return enrichedDecisions;
}

/**
 * Main execution
 */
async function main() {
  console.log('🤖 NLP OUTCOME PREDICTOR\n');
  console.log('='.repeat(60));
  
  if (!TRAIN && !PREDICT && !ALL) {
    console.log('❌ Error: Must specify --train, --predict, or --all');
    console.log('\nUsage:');
    console.log('  node scripts/train-outcome-predictor.js --train');
    console.log('  node scripts/train-outcome-predictor.js --predict --input=onwsiat-2020.json');
    console.log('  node scripts/train-outcome-predictor.js --all  (train + predict all files)');
    process.exit(1);
  }
  
  let model;
  
  // Train new model
  if (TRAIN || ALL) {
    const trainingData = collectTrainingData();
    
    if (trainingData.length < 10) {
      console.log('\n❌ Error: Not enough training data (need at least 10 labeled examples)');
      console.log('   Run extract-outcomes-from-keywords.js first to extract some outcomes.');
      process.exit(1);
    }
    
    model = trainModel(trainingData);
  }
  
  // Predict
  if (PREDICT || ALL) {
    // Load model if not just trained
    if (!model) {
      const modelPath = path.join(MODEL_DIR, 'outcome-predictor.json');
      if (!fs.existsSync(modelPath)) {
        console.log('\n❌ Error: No trained model found. Run --train first.');
        process.exit(1);
      }
      console.log('\n📥 Loading trained model...\n');
      model = new NaiveBayesClassifier();
      model.load(modelPath);
    }
    
    // Predict for specific file or all files
    const files = INPUT_FILE 
      ? [path.join(DATA_DIR, INPUT_FILE)]
      : fs.readdirSync(DATA_DIR)
          .filter(f => f.endsWith('.json') && !f.includes(OUTPUT_SUFFIX))
          .filter(f => {
            // Only predict for main decision files (not backup/audit files)
            return f.includes('ultra-slow') || f.includes('decisions-202') || f.includes('-202');
          })
          .map(f => path.join(DATA_DIR, f));
    
    console.log(`\n🔮 Predicting outcomes for ${files.length} files...\n`);
    
    for (const file of files) {
      try {
        predictOutcomes(file, model);
      } catch (error) {
        console.log(`   ❌ Error processing ${path.basename(file)}: ${error.message}\n`);
      }
    }
  }
  
  console.log('\n✅ PREDICTION COMPLETE!\n');
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
