#!/usr/bin/env node

/**
 * TF-IDF ML CLASSIFIER FOR REMAINING UNKNOWNS
 * 
 * Phase 3 of data improvement strategy:
 * 1. Load all known outcomes (from Phase 1 ML + Phase 2 extraction)
 * 2. Extract TF-IDF features from full text + keywords
 * 3. Train Naive Bayes classifier
 * 4. Classify remaining unknowns with confidence scoring
 * 5. Only apply classifications with >70% confidence
 * 
 * Requires: natural package (install with: npm install natural)
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║  🤖 TF-IDF ML CLASSIFIER - PHASE 3                                ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

// Check if natural package is installed
let natural;
try {
  natural = require('natural');
} catch (err) {
  console.error('❌ Error: "natural" package not installed\n');
  console.error('   Install with: npm install natural\n');
  console.error('   Or run: npm install --save natural\n');
  process.exit(1);
}

const { TfIdf, BayesClassifier } = natural;

const dataDir = path.join(__dirname, '..', '..', 'data', 'tribunal-decisions');
const ONTARIO_TRIBUNALS = ['onsbt', 'onwsib', 'onhrt', 'onlrb', 'onca'];
const CONFIDENCE_THRESHOLD = 0.70; // 70% minimum confidence

console.log('📚 Loading training data from all Ontario tribunals...\n');

let trainingData = [];
let testData = [];
let totalCases = 0;
let knownCases = 0;
let unknownCases = 0;

// Load all cases
ONTARIO_TRIBUNALS.forEach(tribunal => {
  const files = fs.readdirSync(dataDir).filter(f => 
    f.startsWith(`${tribunal}-`) && f.endsWith('-complete.json')
  );
  
  files.forEach(filename => {
    const filePath = path.join(dataDir, filename);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const cases = Array.isArray(data) ? data : data.cases || [];
    
    cases.forEach(c => {
      totalCases++;
      
      // Extract text features
      const keywordsApi = c.keywords_api || [];
      const keywordsExtracted = c.keywords_extracted || [];
      const allKeywords = [...keywordsApi, ...keywordsExtracted].join(' ');
      const title = c.title || '';
      const fullText = c.full_text_html || '';
      
      // Combine all text features
      const combinedText = `${title} ${allKeywords} ${fullText}`.substring(0, 10000); // Limit to 10KB
      
      const caseData = {
        case_id: c.case_id,
        text: combinedText,
        outcome: c.outcome || 'Unknown',
        source_file: filename,
        has_full_text: !!c.full_text_html
      };
      
      if (c.outcome && c.outcome !== 'Unknown') {
        knownCases++;
        trainingData.push(caseData);
      } else {
        unknownCases++;
        testData.push(caseData);
      }
    });
  });
});

console.log(`Total cases loaded: ${totalCases.toLocaleString()}`);
console.log(`✅ Known outcomes: ${knownCases.toLocaleString()} (training set)`);
console.log(`❓ Unknown outcomes: ${unknownCases.toLocaleString()} (test set)\n`);

if (knownCases < 100) {
  console.error('❌ Error: Not enough training data (need at least 100 known cases)\n');
  console.error('   Run Phase 2 extraction first to build training set\n');
  process.exit(1);
}

// Split training data into train/validation (80/20)
const shuffled = trainingData.sort(() => Math.random() - 0.5);
const splitIndex = Math.floor(shuffled.length * 0.8);
const trainSet = shuffled.slice(0, splitIndex);
const validationSet = shuffled.slice(splitIndex);

console.log('═══════════════════════════════════════════════════════════════════');
console.log('🧠 TRAINING CLASSIFIER\n');

console.log(`Training set: ${trainSet.length.toLocaleString()} cases`);
console.log(`Validation set: ${validationSet.length.toLocaleString()} cases\n`);

// Train Naive Bayes classifier
const classifier = new BayesClassifier();

console.log('📊 Training Naive Bayes classifier...\n');

trainSet.forEach(({ text, outcome }, idx) => {
  classifier.addDocument(text, outcome);
  
  if ((idx + 1) % 1000 === 0) {
    console.log(`   Processed: ${idx + 1}/${trainSet.length}`);
  }
});

console.log('🎓 Training model...\n');
classifier.train();
console.log('✅ Training complete!\n');

// Validate on validation set
console.log('═══════════════════════════════════════════════════════════════════');
console.log('🔍 VALIDATION\n');

let validationCorrect = 0;
const confusionMatrix = {};

validationSet.forEach(({ text, outcome }) => {
  const predicted = classifier.classify(text);
  
  if (!confusionMatrix[outcome]) confusionMatrix[outcome] = {};
  if (!confusionMatrix[outcome][predicted]) confusionMatrix[outcome][predicted] = 0;
  confusionMatrix[outcome][predicted]++;
  
  if (predicted === outcome) validationCorrect++;
});

const validationAccuracy = (validationCorrect / validationSet.length * 100).toFixed(1);

console.log(`Validation accuracy: ${validationAccuracy}% (${validationCorrect}/${validationSet.length})\n`);

console.log('Confusion Matrix (top outcomes):\n');
const topOutcomes = Object.keys(confusionMatrix).slice(0, 5);
topOutcomes.forEach(actual => {
  console.log(`${actual}:`);
  Object.entries(confusionMatrix[actual]).forEach(([predicted, count]) => {
    console.log(`   → ${predicted}: ${count}`);
  });
});

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('🎯 CLASSIFYING UNKNOWN CASES\n');

console.log(`Applying classifier to ${unknownCases.toLocaleString()} unknown cases...`);
console.log(`Confidence threshold: ${(CONFIDENCE_THRESHOLD * 100).toFixed(0)}%\n`);

let classified = 0;
let belowThreshold = 0;
const outcomeDistribution = {};

testData.forEach(({ case_id, text, source_file }, idx) => {
  const classifications = classifier.getClassifications(text);
  const topClass = classifications[0];
  const confidence = topClass.value;
  
  if (confidence >= CONFIDENCE_THRESHOLD && topClass.label !== 'Unknown') {
    classified++;
    
    if (!outcomeDistribution[topClass.label]) {
      outcomeDistribution[topClass.label] = 0;
    }
    outcomeDistribution[topClass.label]++;
    
    // Update original file
    const filePath = path.join(dataDir, source_file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const cases = Array.isArray(data) ? data : data.cases || [];
      
      const caseIndex = cases.findIndex(c => c.case_id === case_id);
      if (caseIndex !== -1) {
        cases[caseIndex].outcome = topClass.label;
        cases[caseIndex].ml_classification = {
          confidence: confidence,
          classified_at: new Date().toISOString(),
          method: 'tfidf_naive_bayes',
          top_3_predictions: classifications.slice(0, 3).map(c => ({
            label: c.label,
            confidence: c.value.toFixed(3)
          }))
        };
        
        if (cases[caseIndex].data_quality) {
          cases[caseIndex].data_quality.has_outcome = true;
        }
        
        fs.writeFileSync(filePath, JSON.stringify(cases, null, 2), 'utf8');
      }
    } catch (err) {
      console.error(`   ❌ Error updating ${case_id}: ${err.message}`);
    }
  } else {
    belowThreshold++;
  }
  
  if ((idx + 1) % 500 === 0) {
    console.log(`   Processed: ${idx + 1}/${unknownCases} (${classified} classified, ${belowThreshold} below threshold)`);
  }
});

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('📊 CLASSIFICATION SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════\n');

console.log(`Total unknowns: ${unknownCases.toLocaleString()}`);
console.log(`✅ Classified: ${classified.toLocaleString()} (${(classified / unknownCases * 100).toFixed(1)}%)`);
console.log(`⚠️  Below threshold: ${belowThreshold.toLocaleString()} (${(belowThreshold / unknownCases * 100).toFixed(1)}%)\n`);

console.log('Outcome Distribution:\n');
const sorted = Object.entries(outcomeDistribution).sort((a, b) => b[1] - a[1]);
sorted.forEach(([outcome, count]) => {
  console.log(`   ${outcome}: ${count.toLocaleString()}`);
});

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('✅ TF-IDF CLASSIFICATION COMPLETE!\n');

// Calculate final statistics
const finalKnown = knownCases + classified;
const finalUnknown = unknownCases - classified;
const finalPct = (finalKnown / totalCases * 100).toFixed(1);

console.log('📈 FINAL STATISTICS:\n');
console.log(`   Before Phase 3: ${knownCases.toLocaleString()} known (${(knownCases / totalCases * 100).toFixed(1)}%)`);
console.log(`   After Phase 3: ${finalKnown.toLocaleString()} known (${finalPct}%)`);
console.log(`   Improvement: +${classified.toLocaleString()} cases (+${((classified / totalCases) * 100).toFixed(1)}%)\n`);
console.log(`   Remaining unknowns: ${finalUnknown.toLocaleString()} (${(finalUnknown / totalCases * 100).toFixed(1)}%)\n`);

console.log('Next steps:');
console.log('   1. Review low-confidence cases for manual classification');
console.log('   2. Run final data quality report:');
console.log('      node scripts/analysis/all-ontario-tribunals-inventory.js');
console.log('   3. Create visualizations of outcome distributions\n');

console.log('═══════════════════════════════════════════════════════════════════\n');
