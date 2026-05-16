#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let currentValue = '';
    let insideQuotes = false;
    
    // Parse CSV handling quoted fields
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    
    // Create object from headers and values
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

// Calculate accuracy metrics
function calculateMetrics(samples) {
  console.log('\n📊 Calculating Validation Metrics...\n');
  
  const metrics = {
    total: samples.length,
    reviewed: 0,
    correct: 0,
    incorrect: 0,
    ambiguous: 0,
    notReviewed: 0,
    overallAccuracy: 0,
    byTribunal: {},
    byConfidenceBand: {},
    byOutcome: {},
    byMethod: {},
    confusionMatrix: {},
    recommendations: []
  };
  
  // Count reviewed samples
  for (const sample of samples) {
    const match = sample.match.trim();
    
    if (!match || !sample.actual_outcome) {
      metrics.notReviewed++;
      continue;
    }
    
    metrics.reviewed++;
    
    // Count match status
    if (match.includes('✅')) {
      metrics.correct++;
    } else if (match.includes('❌')) {
      metrics.incorrect++;
    } else if (match.includes('⚠️')) {
      metrics.ambiguous++;
    } else {
      metrics.notReviewed++;
      metrics.reviewed--;
      continue;
    }
    
    const tribunal = sample.tribunal;
    const band = sample.confidence_band;
    const mlPrediction = sample.ml_prediction;
    const actualOutcome = sample.actual_outcome;
    const method = sample.classification_method;
    const confidence = parseFloat(sample.confidence);
    
    // Initialize nested objects
    if (!metrics.byTribunal[tribunal]) {
      metrics.byTribunal[tribunal] = { total: 0, correct: 0, incorrect: 0, ambiguous: 0, accuracy: 0 };
    }
    if (!metrics.byConfidenceBand[band]) {
      metrics.byConfidenceBand[band] = { total: 0, correct: 0, incorrect: 0, ambiguous: 0, accuracy: 0, avgConfidence: 0, confidences: [] };
    }
    if (!metrics.byOutcome[mlPrediction]) {
      metrics.byOutcome[mlPrediction] = { total: 0, correct: 0, incorrect: 0, ambiguous: 0, precision: 0 };
    }
    if (!metrics.byMethod[method]) {
      metrics.byMethod[method] = { total: 0, correct: 0, incorrect: 0, ambiguous: 0, accuracy: 0 };
    }
    if (!metrics.confusionMatrix[mlPrediction]) {
      metrics.confusionMatrix[mlPrediction] = {};
    }
    
    // Increment totals
    metrics.byTribunal[tribunal].total++;
    metrics.byConfidenceBand[band].total++;
    metrics.byOutcome[mlPrediction].total++;
    metrics.byMethod[method].total++;
    metrics.byConfidenceBand[band].confidences.push(confidence);
    
    // Increment match counts
    if (match.includes('✅')) {
      metrics.byTribunal[tribunal].correct++;
      metrics.byConfidenceBand[band].correct++;
      metrics.byOutcome[mlPrediction].correct++;
      metrics.byMethod[method].correct++;
    } else if (match.includes('❌')) {
      metrics.byTribunal[tribunal].incorrect++;
      metrics.byConfidenceBand[band].incorrect++;
      metrics.byOutcome[mlPrediction].incorrect++;
      metrics.byMethod[method].incorrect++;
    } else if (match.includes('⚠️')) {
      metrics.byTribunal[tribunal].ambiguous++;
      metrics.byConfidenceBand[band].ambiguous++;
      metrics.byOutcome[mlPrediction].ambiguous++;
      metrics.byMethod[method].ambiguous++;
    }
    
    // Build confusion matrix
    if (!metrics.confusionMatrix[mlPrediction][actualOutcome]) {
      metrics.confusionMatrix[mlPrediction][actualOutcome] = 0;
    }
    metrics.confusionMatrix[mlPrediction][actualOutcome]++;
  }
  
  // Calculate percentages
  if (metrics.reviewed > 0) {
    metrics.overallAccuracy = (metrics.correct / metrics.reviewed * 100).toFixed(1);
    
    for (const tribunal in metrics.byTribunal) {
      const t = metrics.byTribunal[tribunal];
      t.accuracy = (t.correct / t.total * 100).toFixed(1);
    }
    
    for (const band in metrics.byConfidenceBand) {
      const b = metrics.byConfidenceBand[band];
      b.accuracy = (b.correct / b.total * 100).toFixed(1);
      b.avgConfidence = (b.confidences.reduce((a, c) => a + c, 0) / b.confidences.length).toFixed(3);
    }
    
    for (const outcome in metrics.byOutcome) {
      const o = metrics.byOutcome[outcome];
      o.precision = (o.correct / o.total * 100).toFixed(1);
    }
    
    for (const method in metrics.byMethod) {
      const m = metrics.byMethod[method];
      m.accuracy = (m.correct / m.total * 100).toFixed(1);
    }
  }
  
  return metrics;
}

// Generate recommendations
function generateRecommendations(metrics) {
  const recommendations = [];
  
  const overallAccuracy = parseFloat(metrics.overallAccuracy);
  
  // Overall accuracy assessment
  if (overallAccuracy < 60) {
    recommendations.push({
      severity: 'CRITICAL',
      message: `Overall accuracy ${overallAccuracy}% is below acceptable threshold. Consider major revision of classification methodology.`,
      action: 'Increase minimum confidence threshold to 0.65 or higher. Consider excluding low-confidence predictions entirely.'
    });
  } else if (overallAccuracy < 70) {
    recommendations.push({
      severity: 'HIGH',
      message: `Overall accuracy ${overallAccuracy}% is below target. Add "Preliminary Classification" disclaimer.`,
      action: 'Raise minimum threshold from 0.50 to 0.60. Update all content with stronger methodology disclaimers.'
    });
  } else if (overallAccuracy < 80) {
    recommendations.push({
      severity: 'MEDIUM',
      message: `Overall accuracy ${overallAccuracy}% is acceptable but could be improved.`,
      action: 'Current conservative messaging appropriate. Continue with validation transparency.'
    });
  } else {
    recommendations.push({
      severity: 'LOW',
      message: `Overall accuracy ${overallAccuracy}% exceeds expectations!`,
      action: 'Maintain current thresholds. Consider publishing validation results prominently.'
    });
  }
  
  // Confidence band analysis
  for (const [band, data] of Object.entries(metrics.byConfidenceBand)) {
    const accuracy = parseFloat(data.accuracy);
    const avgConf = parseFloat(data.avgConfidence);
    
    if (band === 'low' && accuracy < 55) {
      recommendations.push({
        severity: 'HIGH',
        message: `Low confidence band accuracy ${accuracy}% is too low (avg confidence: ${avgConf}).`,
        action: 'Raise minimum threshold from 0.50 to 0.65 to exclude poorest predictions.'
      });
    }
    
    if (band === 'medium' && accuracy < 65) {
      recommendations.push({
        severity: 'MEDIUM',
        message: `Medium confidence band accuracy ${accuracy}% below target (avg confidence: ${avgConf}).`,
        action: 'Consider adjusting confidence calculation formula or raising medium band threshold.'
      });
    }
  }
  
  // Tribunal-specific issues
  for (const [tribunal, data] of Object.entries(metrics.byTribunal)) {
    const accuracy = parseFloat(data.accuracy);
    
    if (accuracy < 60) {
      recommendations.push({
        severity: 'HIGH',
        message: `${tribunal.toUpperCase()} accuracy ${accuracy}% significantly below average.`,
        action: `Review ${tribunal.toUpperCase()}-specific patterns. May need tribunal-specific classification adjustments or stricter thresholds.`
      });
    }
  }
  
  // Method-specific issues
  for (const [method, data] of Object.entries(metrics.byMethod)) {
    const accuracy = parseFloat(data.accuracy);
    
    if (accuracy < 55) {
      recommendations.push({
        severity: 'MEDIUM',
        message: `Classification method "${method}" has low accuracy ${accuracy}%.`,
        action: `Consider excluding or re-weighting this classification strategy. May need better training data or pattern refinement.`
      });
    }
  }
  
  return recommendations;
}

// Display results
function displayResults(metrics) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('           VALIDATION RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('📋 Review Status:');
  console.log(`   Total samples: ${metrics.total}`);
  console.log(`   Reviewed: ${metrics.reviewed} (${(metrics.reviewed/metrics.total*100).toFixed(1)}%)`);
  console.log(`   Not reviewed: ${metrics.notReviewed}`);
  console.log(`   ✅ Correct: ${metrics.correct}`);
  console.log(`   ❌ Incorrect: ${metrics.incorrect}`);
  console.log(`   ⚠️  Ambiguous: ${metrics.ambiguous}\n`);
  
  console.log('🎯 Overall Accuracy:');
  console.log(`   ${metrics.overallAccuracy}% (${metrics.correct}/${metrics.reviewed} correct)\n`);
  
  console.log('📊 Accuracy by Tribunal:');
  for (const [tribunal, data] of Object.entries(metrics.byTribunal).sort()) {
    const bar = '█'.repeat(Math.round(parseFloat(data.accuracy) / 5));
    console.log(`   ${tribunal.toUpperCase().padEnd(8)} ${data.accuracy}% ${bar.padEnd(20)} (${data.correct}/${data.total})`);
  }
  console.log();
  
  console.log('🎲 Accuracy by Confidence Band:');
  for (const [band, data] of Object.entries(metrics.byConfidenceBand)) {
    const bar = '█'.repeat(Math.round(parseFloat(data.accuracy) / 5));
    console.log(`   ${band.padEnd(8)} ${data.accuracy}% ${bar.padEnd(20)} (${data.correct}/${data.total}) avg conf: ${data.avgConfidence}`);
  }
  console.log();
  
  console.log('🔍 Precision by ML Prediction:');
  for (const [outcome, data] of Object.entries(metrics.byOutcome).sort()) {
    const bar = '█'.repeat(Math.round(parseFloat(data.precision) / 5));
    console.log(`   ${outcome.padEnd(20)} ${data.precision}% ${bar.padEnd(20)} (${data.correct}/${data.total})`);
  }
  console.log();
  
  console.log('⚙️  Accuracy by Classification Method:');
  for (const [method, data] of Object.entries(metrics.byMethod).sort()) {
    const bar = '█'.repeat(Math.round(parseFloat(data.accuracy) / 5));
    console.log(`   ${method.substring(0, 25).padEnd(26)} ${data.accuracy}% ${bar.padEnd(15)} (${data.correct}/${data.total})`);
  }
  console.log();
  
  console.log('🔀 Confusion Matrix (ML Prediction → Actual Outcome):');
  console.log('   Top 10 misclassifications:');
  const confusionPairs = [];
  for (const [predicted, actuals] of Object.entries(metrics.confusionMatrix)) {
    for (const [actual, count] of Object.entries(actuals)) {
      if (predicted !== actual) {
        confusionPairs.push({ predicted, actual, count });
      }
    }
  }
  confusionPairs.sort((a, b) => b.count - a.count);
  for (let i = 0; i < Math.min(10, confusionPairs.length); i++) {
    const pair = confusionPairs[i];
    console.log(`   ${i + 1}. ${pair.predicted} → ${pair.actual}: ${pair.count} cases`);
  }
  console.log();
}

// Display recommendations
function displayRecommendations(recommendations) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('              RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const critical = recommendations.filter(r => r.severity === 'CRITICAL');
  const high = recommendations.filter(r => r.severity === 'HIGH');
  const medium = recommendations.filter(r => r.severity === 'MEDIUM');
  const low = recommendations.filter(r => r.severity === 'LOW');
  
  if (critical.length > 0) {
    console.log('🚨 CRITICAL:');
    critical.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.message}`);
      console.log(`      → ${r.action}\n`);
    });
  }
  
  if (high.length > 0) {
    console.log('⚠️  HIGH PRIORITY:');
    high.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.message}`);
      console.log(`      → ${r.action}\n`);
    });
  }
  
  if (medium.length > 0) {
    console.log('📌 MEDIUM PRIORITY:');
    medium.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.message}`);
      console.log(`      → ${r.action}\n`);
    });
  }
  
  if (low.length > 0) {
    console.log('✅ LOW PRIORITY / POSITIVE:');
    low.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.message}`);
      console.log(`      → ${r.action}\n`);
    });
  }
}

// Generate markdown report
function generateMarkdownReport(metrics) {
  const date = new Date().toISOString().split('T')[0];
  
  let report = `# Ontario Tribunal Classification Validation Report v3.0

**Date**: ${date}  
**Samples Reviewed**: ${metrics.reviewed}/${metrics.total}  
**Overall Accuracy**: ${metrics.overallAccuracy}%

## Executive Summary

This report documents the validation of v3.0 ML classification results across ${metrics.total} manually-reviewed cases from 6 Ontario tribunals.

**Key Findings**:
- ${metrics.correct} correct predictions (${metrics.overallAccuracy}%)
- ${metrics.incorrect} incorrect predictions
- ${metrics.ambiguous} ambiguous cases

`;

  report += `## Accuracy by Tribunal

| Tribunal | Accuracy | Correct | Total | Samples |\n`;
  report += `|----------|----------|---------|-------|----------|\n`;
  for (const [tribunal, data] of Object.entries(metrics.byTribunal).sort()) {
    report += `| ${tribunal.toUpperCase()} | ${data.accuracy}% | ${data.correct} | ${data.total} | ${data.total} |\n`;
  }

  report += `\n## Accuracy by Confidence Band

| Band | Accuracy | Avg Confidence | Correct | Total |\n`;
  report += `|------|----------|----------------|---------|-------|\n`;
  for (const [band, data] of Object.entries(metrics.byConfidenceBand)) {
    report += `| ${band} | ${data.accuracy}% | ${data.avgConfidence} | ${data.correct} | ${data.total} |\n`;
  }

  report += `\n## Precision by ML Prediction

| Outcome | Precision | Correct | Total |\n`;
  report += `|---------|-----------|---------|-------|\n`;
  for (const [outcome, data] of Object.entries(metrics.byOutcome).sort()) {
    report += `| ${outcome} | ${data.precision}% | ${data.correct} | ${data.total} |\n`;
  }

  report += `\n## Accuracy by Classification Method

| Method | Accuracy | Correct | Total |\n`;
  report += `|--------|----------|---------|-------|\n`;
  for (const [method, data] of Object.entries(metrics.byMethod).sort()) {
    report += `| ${method} | ${data.accuracy}% | ${data.correct} | ${data.total} |\n`;
  }

  report += `\n## Top Misclassifications\n\n`;
  const confusionPairs = [];
  for (const [predicted, actuals] of Object.entries(metrics.confusionMatrix)) {
    for (const [actual, count] of Object.entries(actuals)) {
      if (predicted !== actual) {
        confusionPairs.push({ predicted, actual, count });
      }
    }
  }
  confusionPairs.sort((a, b) => b.count - a.count);
  for (let i = 0; i < Math.min(10, confusionPairs.length); i++) {
    const pair = confusionPairs[i];
    report += `${i + 1}. **${pair.predicted}** → **${pair.actual}**: ${pair.count} cases\n`;
  }

  report += `\n## Recommendations\n\n`;
  for (const rec of metrics.recommendations) {
    report += `### ${rec.severity}: ${rec.message}\n\n`;
    report += `**Action**: ${rec.action}\n\n`;
  }

  report += `\n## Methodology

**Sampling Strategy**: Stratified random sampling
- 100 samples per tribunal (600 total)
- 40 high confidence (0.75-0.95)
- 40 medium confidence (0.60-0.75)
- 20 low confidence (0.50-0.60)

**Validation Process**:
1. Generated random samples from classified cases
2. Manually reviewed each case via CanLII URL
3. Compared ML prediction with actual decision outcome
4. Marked as correct (✅), incorrect (❌), or ambiguous (⚠️)

**Limitations**:
- Sample size represents ~1.4% of classified cases
- Manual review subject to human interpretation
- Some decisions have mixed/partial outcomes
- Keyword-only classification (no full text analysis)

## Next Steps

`;

  if (parseFloat(metrics.overallAccuracy) >= 70) {
    report += `✅ Accuracy meets threshold. Proceed with deployment.\n\n`;
    report += `- Publish this validation report\n`;
    report += `- Update blog post with validation results\n`;
    report += `- Maintain conservative messaging\n`;
  } else {
    report += `⚠️ Accuracy below 70% threshold. Additional work needed.\n\n`;
    report += `- Implement recommended threshold adjustments\n`;
    report += `- Add "Preliminary Classification" disclaimer\n`;
    report += `- Consider re-classifying with stricter parameters\n`;
  }

  return report;
}

// Main execution
async function main() {
  console.log('🔬 Ontario Tribunal Classification Validation Analysis');
  console.log('=======================================================\n');
  
  try {
    const csvPath = path.join(__dirname, '../../validation-samples.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Error: validation-samples.csv not found!');
      console.log('\nPlease ensure you have:');
      console.log('1. Run: node scripts/ml/generate-validation-samples.js');
      console.log('2. Manually reviewed the CSV file');
      console.log('3. Filled in actual_outcome and match columns');
      process.exit(1);
    }
    
    console.log('📂 Loading validation samples...');
    const samples = parseCSV(csvPath);
    console.log(`✅ Loaded ${samples.length} samples\n`);
    
    // Calculate metrics
    const metrics = calculateMetrics(samples);
    
    // Generate recommendations
    metrics.recommendations = generateRecommendations(metrics);
    
    // Display results
    displayResults(metrics);
    displayRecommendations(metrics.recommendations);
    
    // Save detailed results
    const outputPath = path.join(__dirname, '../../validation-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2));
    console.log(`\n✅ Detailed results saved: validation-results.json`);
    
    // Generate markdown report
    const reportPath = path.join(__dirname, '../../docs/VALIDATION_REPORT_V3.0.md');
    const report = generateMarkdownReport(metrics);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report);
    console.log(`✅ Validation report saved: docs/VALIDATION_REPORT_V3.0.md`);
    
    console.log('\n✨ Validation analysis complete!\n');
    
    // Exit with warning if accuracy below threshold
    if (parseFloat(metrics.overallAccuracy) < 70) {
      console.log('⚠️  WARNING: Overall accuracy below 70% target!');
      console.log('   Review recommendations above before deploying updates.\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
