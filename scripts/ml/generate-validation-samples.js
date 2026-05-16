#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data/tribunal-decisions');

// Tribunal files to process
const TRIBUNAL_FILES = [
  'onwsiat-2020-ultra-slow.json',
  'onwsiat-2021-ultra-slow.json',
  'onwsiat-2022-ultra-slow.json',
  'onwsiat-2023-ultra-slow.json',
  'onwsiat-2024-ultra-slow.json',
  'onwsiat-2025-ultra-slow.json',
  'onsbt-2021-complete.json',
  'onsbt-2022-complete.json',
  'onsbt-2023-complete.json',
  'onsbt-2024-complete.json',
  'onsbt-2025-complete.json',
  'onwsib-2021-complete.json',
  'onwsib-2022-complete.json',
  'onwsib-2023-complete.json',
  'onwsib-2024-complete.json',
  'onwsib-2025-complete.json',
  'onhrt-2021-complete.json',
  'onhrt-2022-complete.json',
  'onhrt-2023-complete.json',
  'onhrt-2024-complete.json',
  'onhrt-2025-complete.json',
  'onlrb-2021-complete.json',
  'onlrb-2022-complete.json',
  'onlrb-2023-complete.json',
  'onlrb-2024-complete.json',
  'onlrb-2025-complete.json',
  'onca-2021-complete.json',
  'onca-2022-complete.json',
  'onca-2023-complete.json',
  'onca-2024-complete.json',
  'onca-2025-complete.json',
];

// Confidence bands for stratification
const CONFIDENCE_BANDS = {
  high: { min: 0.75, max: 1.0, target: 40 },
  medium: { min: 0.60, max: 0.75, target: 40 },
  low: { min: 0.50, max: 0.60, target: 20 }
};

const SAMPLES_PER_TRIBUNAL = 100;

// Shuffle array using Fisher-Yates
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Load all classified cases
function loadAllCases() {
  console.log('📂 Loading tribunal decision files...');
  const allCases = [];
  
  for (const filename of TRIBUNAL_FILES) {
    const filepath = path.join(dataDir, filename);
    if (!fs.existsSync(filepath)) {
      console.warn(`⚠️  File not found: ${filename}`);
      continue;
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    // Filter to only classified cases
    const classified = data.filter(c => 
      c.outcome && 
      c.outcome !== 'Unknown' && 
      c.classification_confidence && 
      c.classification_confidence >= 0.50
    );
    
    console.log(`   ${filename}: ${classified.length} classified cases`);
    allCases.push(...classified);
  }
  
  console.log(`✅ Total classified cases loaded: ${allCases.length}\n`);
  return allCases;
}

// Generate stratified samples for one tribunal
function generateTribunalSamples(tribunal, allCases) {
  console.log(`\n🎯 Sampling from ${tribunal.toUpperCase()}...`);
  
  // Filter to this tribunal's classified cases (check both database_id and database fields)
  const tribunalCases = allCases.filter(c => c.database_id === tribunal || c.database === tribunal);
  console.log(`   Total classified cases: ${tribunalCases.length}`);
  
  const samples = [];
  
  // Sample from each confidence band
  for (const [bandName, band] of Object.entries(CONFIDENCE_BANDS)) {
    const bandCases = tribunalCases.filter(c => 
      c.classification_confidence >= band.min && 
      c.classification_confidence < band.max
    );
    
    console.log(`   ${bandName} confidence (${band.min}-${band.max}): ${bandCases.length} cases`);
    
    // Shuffle and take target number
    const shuffled = shuffleArray(bandCases);
    const sampled = shuffled.slice(0, Math.min(band.target, bandCases.length));
    
    console.log(`   → Sampled ${sampled.length}/${band.target} cases`);
    
    samples.push(...sampled.map(c => ({
      ...c,
      confidence_band: bandName,
      sample_date: new Date().toISOString()
    })));
  }
  
  console.log(`✅ ${tribunal.toUpperCase()}: ${samples.length} samples generated`);
  return samples;
}

// Convert to CSV format
function generateCSV(samples) {
  const headers = [
    'case_id',
    'tribunal',
    'ml_prediction',
    'confidence',
    'confidence_band',
    'title',
    'decision_date',
    'canlii_url',
    'classification_method',
    'keywords',
    'actual_outcome',
    'match',
    'notes'
  ];
  
  let csv = headers.join(',') + '\n';
  
  for (const sample of samples) {
    const row = [
      sample.case_id || '',
      sample.database_id || sample.database || '',
      sample.outcome || '',
      sample.classification_confidence?.toFixed(2) || '',
      sample.confidence_band || '',
      `"${(sample.title || '').replace(/"/g, '""')}"`,
      sample.decision_date || '',
      sample.url || '',
      sample.classification_method || '',
      `"${(sample.keywords_api || []).join('; ').replace(/"/g, '""')}"`,
      '', // actual_outcome - to be filled manually
      '', // match - to be filled manually
      ''  // notes - to be filled manually
    ];
    csv += row.join(',') + '\n';
  }
  
  return csv;
}

// Main execution
async function main() {
  console.log('🔬 Ontario Tribunal Classification Validation Sampling');
  console.log('=====================================================\n');
  console.log(`Target: ${SAMPLES_PER_TRIBUNAL} samples per tribunal (600 total)`);
  console.log(`Stratification: High 40, Medium 40, Low 20 per tribunal\n`);
  
  try {
    // Load all cases
    const allCases = loadAllCases();
    
    // Generate samples for each tribunal
    const tribunals = ['onwsiat', 'onsbt', 'onwsib', 'onhrt', 'onlrb', 'onca'];
    const allSamples = [];
    
    for (const tribunal of tribunals) {
      const samples = generateTribunalSamples(tribunal, allCases);
      allSamples.push(...samples);
    }
    
    console.log(`\n📊 Total samples generated: ${allSamples.length}/600`);
    
    // Write JSON output
    const jsonPath = path.join(__dirname, '../../validation-samples.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allSamples, null, 2));
    console.log(`✅ JSON saved: validation-samples.json`);
    
    // Write CSV output for manual review
    const csv = generateCSV(allSamples);
    const csvPath = path.join(__dirname, '../../validation-samples.csv');
    fs.writeFileSync(csvPath, csv);
    console.log(`✅ CSV saved: validation-samples.csv`);
    
    // Generate summary statistics
    console.log('\n📈 Sample Distribution:');
    const byTribunal = {};
    const byBand = { high: 0, medium: 0, low: 0 };
    const byOutcome = {};
    
    for (const sample of allSamples) {
      const tribunal = sample.database_id || sample.database;
      byTribunal[tribunal] = (byTribunal[tribunal] || 0) + 1;
      byBand[sample.confidence_band]++;
      byOutcome[sample.outcome] = (byOutcome[sample.outcome] || 0) + 1;
    }
    
    console.log('\nBy Tribunal:');
    for (const [tribunal, count] of Object.entries(byTribunal)) {
      console.log(`   ${tribunal}: ${count}`);
    }
    
    console.log('\nBy Confidence Band:');
    for (const [band, count] of Object.entries(byBand)) {
      console.log(`   ${band}: ${count}`);
    }
    
    console.log('\nBy ML Prediction:');
    for (const [outcome, count] of Object.entries(byOutcome)) {
      console.log(`   ${outcome}: ${count}`);
    }
    
    console.log('\n✨ Validation sampling complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open validation-samples.csv');
    console.log('2. For each row:');
    console.log('   - Visit the canlii_url');
    console.log('   - Read the actual decision');
    console.log('   - Fill in actual_outcome column');
    console.log('   - Mark match: ✅ (correct), ❌ (incorrect), ⚠️ (ambiguous)');
    console.log('   - Add notes if needed');
    console.log('3. Save completed CSV');
    console.log('4. Run: node scripts/ml/calculate-validation-metrics.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
