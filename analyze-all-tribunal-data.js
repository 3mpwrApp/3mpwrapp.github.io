const fs = require('fs');
const path = require('path');

const dataDir = 'data/tribunal-decisions';

console.log('=== COMPREHENSIVE TRIBUNAL DATA ANALYSIS 2020-2026 ===\n');

let totalOnsbt = 0;
let totalHrto = 0;
let totalWsiat = 0;

// ONSBT Data
console.log('=== ONTARIO SOCIAL BENEFITS TRIBUNAL (ONSBT) ===');
const onsbtYears = {};
for (let year = 2020; year <= 2026; year++) {
  const file = path.join(dataDir, 'onsbt-' + year + '-complete.json');
  if (fs.existsSync(file)) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      const count = Array.isArray(data) ? data.length : 1;
      onsbtYears[year] = count;
      totalOnsbt += count;
      console.log('  ' + year + ': ' + count + ' cases');
    } catch (e) {
      console.log('  ' + year + ': ERROR -', e.message);
    }
  }
}
console.log('  TOTAL: ' + totalOnsbt + ' cases\n');

// HRTO Data
console.log('=== HUMAN RIGHTS TRIBUNAL OF ONTARIO (HRTO) ===');
const hrtoYears = {};
for (let year = 2020; year <= 2026; year++) {
  const file = path.join(dataDir, 'onhrt-' + year + '-complete.json');
  if (fs.existsSync(file)) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      const count = Array.isArray(data) ? data.length : 1;
      hrtoYears[year] = count;
      totalHrto += count;
      console.log('  ' + year + ': ' + count + ' cases');
    } catch (e) {
      console.log('  ' + year + ': ERROR -', e.message);
    }
  }
}
console.log('  TOTAL: ' + totalHrto + ' cases\n');

// WSIAT Data (if available)
console.log('=== WORKERS\' SAFETY AND INSURANCE APPEALS TRIBUNAL (WSIAT) ===');
for (let year = 2020; year <= 2026; year++) {
  const file = path.join(dataDir, 'onwsiat-' + year + '-ultra-slow.json');
  if (fs.existsSync(file)) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      const count = Array.isArray(data) ? data.length : 1;
      totalWsiat += count;
      console.log('  ' + year + ': ' + count + ' cases');
    } catch (e) {
      console.log('  ' + year + ': ERROR -', e.message);
    }
  }
}

// Load key analysis reports
console.log('\n=== KEY ANALYSIS REPORTS AVAILABLE ===\n');

const reportFiles = [
  'deep-analysis/HRTO-DEEP-DIVE-REPORT.json',
  'deep-analysis/ONWSIAT-ULTRA-DEEP-ANALYSIS.json',
  'detective-analysis/ONWSIAT-DETECTIVE-FINDINGS.json',
  'detective-analysis/ABANDONED-CASES-REPORT.md'
];

for (const reportFile of reportFiles) {
  const fullPath = path.join(dataDir, reportFile);
  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);
    const sizeKB = Math.round(stat.size / 1024);
    console.log('✓ ' + reportFile + ' (' + sizeKB + ' KB)');
  }
}

console.log('\n=== DATASET SUMMARY ===');
console.log('Total ONSBT cases: ' + totalOnsbt);
console.log('Total HRTO cases: ' + totalHrto);
console.log('Total WSIAT cases: ' + totalWsiat);
console.log('GRAND TOTAL: ' + (totalOnsbt + totalHrto + totalWsiat) + ' tribunal decisions');
