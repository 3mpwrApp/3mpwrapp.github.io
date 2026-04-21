#!/usr/bin/env node
const fs = require('fs');

console.log('COMPARISON: Advanced vs Ultra Extraction\n');
console.log('='.repeat(80));

// WSIAT
const adv = JSON.parse(fs.readFileSync('./data/tribunal-decisions/deep-analysis/wsiat-outcomes-advanced.json', 'utf8'));
const ultra = JSON.parse(fs.readFileSync('./data/tribunal-decisions/deep-analysis/wsiat-outcomes-ultra.json', 'utf8'));

const advDetected = adv.filter(c => c.outcome_detection?.outcome).length;
const ultraDetected = ultra.filter(c => c.outcome_ultra?.outcome).length;

console.log('WSIAT 2000:');
console.log(`  Advanced: ${advDetected}/2000 (${(advDetected/20).toFixed(1)}%)`);
console.log(`  Ultra: ${ultraDetected}/2000 (${(ultraDetected/20).toFixed(1)}%)`);
console.log(`  Difference: ${ultraDetected - advDetected} cases (${((ultraDetected - advDetected)/20).toFixed(1)}%)`);

const advAvgConf = adv.filter(c => c.outcome_detection?.outcome).reduce((sum, c) => sum + c.outcome_detection.confidence, 0) / advDetected;
const ultraAvgConf = ultra.filter(c => c.outcome_ultra?.outcome).reduce((sum, c) => sum + c.outcome_ultra.confidence, 0) / ultraDetected;

console.log(`  Advanced avg confidence: ${advAvgConf.toFixed(1)}%`);
console.log(`  Ultra avg confidence: ${ultraAvgConf.toFixed(1)}%`);
console.log('');

// HRTO 2025
const advHRTO = JSON.parse(fs.readFileSync('./data/tribunal-decisions/deep-analysis/hrto-2025-outcomes-advanced.json', 'utf8'));
const ultraHRTO = JSON.parse(fs.readFileSync('./data/tribunal-decisions/deep-analysis/hrto-2025-outcomes-ultra.json', 'utf8'));

const advHDetected = advHRTO.filter(c => c.outcome_detection?.outcome).length;
const ultraHDetected = ultraHRTO.filter(c => c.outcome_ultra?.outcome).length;

console.log('HRTO 2025:');
console.log(`  Advanced: ${advHDetected}/2686 (${(advHDetected/26.86).toFixed(1)}%)`);
console.log(`  Ultra: ${ultraHDetected}/2686 (${(ultraHDetected/26.86).toFixed(1)}%)`);
console.log(`  Difference: ${ultraHDetected - advHDetected} cases (${((ultraHDetected - advHDetected)/26.86).toFixed(1)}%)`);

const advHAvgConf = advHRTO.filter(c => c.outcome_detection?.outcome).reduce((sum, c) => sum + c.outcome_detection.confidence, 0) / advHDetected;
const ultraHAvgConf = ultraHRTO.filter(c => c.outcome_ultra?.outcome).reduce((sum, c) => sum + c.outcome_ultra.confidence, 0) / ultraHDetected;

console.log(`  Advanced avg confidence: ${advHAvgConf.toFixed(1)}%`);
console.log(`  Ultra avg confidence: ${ultraHAvgConf.toFixed(1)}%`);
console.log('');

console.log('='.repeat(80));
console.log('\nIMPROVEMENT SUMMARY:');
console.log(`  WSIAT: +${ultraDetected - advDetected} outcomes (+${((ultraDetected - advDetected)/20).toFixed(1)}%)`);
console.log(`  HRTO: +${ultraHDetected - advHDetected} outcomes (+${((ultraHDetected - advHDetected)/26.86).toFixed(1)}%)`);
console.log(`  Total: +${(ultraDetected - advDetected) + (ultraHDetected - advHDetected)} outcomes`);
console.log('');
console.log('OBSCURITY GAP (vs baseline 91.8%):');
console.log(`  WSIAT Advanced: ${(100 - advDetected/20).toFixed(1)}% → Ultra: ${(100 - ultraDetected/20).toFixed(1)}%`);
console.log(`  HRTO Advanced: ${(100 - advHDetected/26.86).toFixed(1)}% → Ultra: ${(100 - ultraHDetected/26.86).toFixed(1)}%`);
