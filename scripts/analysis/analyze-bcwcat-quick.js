#!/usr/bin/env node
/**
 * Quick BC WCAT Analysis - Works with -complete.json files
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

console.log('\n📊 BC WCAT QUICK ANALYSIS (2020-2026)');
console.log('='.repeat(60));

let totalCases = 0;
let totalUnknown = 0;
const allOutcomes = {};
const yearData = [];

for (const year of YEARS) {
  const filePath = path.join(DATA_DIR, `bcwcat-${year}-complete.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`\n⚠️  ${year}: File not found`);
    continue;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const outcomes = {};
  
  data.forEach(d => {
    const outcome = d.outcome || 'Unknown';
    outcomes[outcome] = (outcomes[outcome] || 0) + 1;
    allOutcomes[outcome] = (allOutcomes[outcome] || 0) + 1;
  });
  
  const unknownCount = outcomes['Unknown'] || 0;
  const unknownPct = ((unknownCount / data.length) * 100).toFixed(1);
  
  totalCases += data.length;
  totalUnknown += unknownCount;
  
  console.log(`\n${year}: ${data.length} cases - Unknown: ${unknownCount} (${unknownPct}%)`);
  
  // Show top 3 categorized outcomes
  const categorized = Object.entries(outcomes)
    .filter(([outcome]) => outcome !== 'Unknown')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  if (categorized.length > 0) {
    categorized.forEach(([outcome, count]) => {
      console.log(`   → ${outcome}: ${count}`);
    });
  }
  
  yearData.push({ year, total: data.length, unknown: unknownCount, outcomes });
}

console.log('\n' + '='.repeat(60));
console.log('📈 OVERALL (2020-2026)');
console.log('='.repeat(60));
console.log(`Total: ${totalCases} cases`);
console.log(`Unknown: ${totalUnknown} (${((totalUnknown/totalCases)*100).toFixed(1)}%)`);
console.log(`Categorized: ${totalCases - totalUnknown} (${(((totalCases-totalUnknown)/totalCases)*100).toFixed(1)}%)`);

console.log('\n📊 ALL OUTCOMES:');
Object.entries(allOutcomes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([outcome, count]) => {
    const pct = ((count / totalCases) * 100).toFixed(1);
    console.log(`   ${outcome.padEnd(35)} ${count.toString().padStart(4)} (${pct}%)`);
  });

console.log('\n');
