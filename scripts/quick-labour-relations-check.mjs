#!/usr/bin/env node
/**
 * Quick keyword search in WSIAT data for labour relations pattern
 */

import fs from 'fs';

console.log('🔍 Searching WSIAT keyword frequencies for labour relations patterns...\n');

// Read the analysis report
const report = JSON.parse(fs.readFileSync('data/tribunal-decisions/ONWSIAT-ANALYSIS-REPORT.json', 'utf8'));

console.log(`📊 Dataset: ${report.totalCases} cases (${report.yearRange})\n`);

// Search for relevant keywords
const searchTerms = [
  'labour relations',
  'labor relations', 
  'jurisdiction',
  'psychotraumatic',
  'mental stress',
  'ptsd',
  'psychiatric',
  'prohibited',
  'retaliation',
  'reprisal',
  'termination',
  'dismissal'
];

console.log('🔎 Keyword Frequency Results:\n');
console.log('─'.repeat(60));

const found = [];
for (const term of searchTerms) {
  const match = report.topKeywords.find(k => 
    k.keyword.toLowerCase().includes(term.toLowerCase())
  );
  
  if (match) {
    found.push(match);
    console.log(`✅ "${match.keyword}": ${match.count} cases (${(match.count/report.totalCases*100).toFixed(2)}%)`);
  } else {
    console.log(`❌ "${term}": 0 or not in top keywords`);
  }
}

console.log('─'.repeat(60));

console.log('\n📋 Mental Disorder Keywords Found:');
const mentalKeywords = found.filter(k => 
  k.keyword.includes('psycho') || 
  k.keyword.includes('mental') || 
  k.keyword.includes('ptsd') || 
  k.keyword.includes('psychiatric')
);
for (const k of mentalKeywords) {
  console.log(`   • ${k.keyword}: ${k.count} cases`);
}

console.log('\n🚨 Key Finding:');
if (!found.some(k => k.keyword.toLowerCase().includes('labour') || k.keyword.toLowerCase().includes('labor'))) {
  console.log('   "Labour relations" does NOT appear in WSIAT top keywords');
  console.log('   → This suggests WSIAT may NOT use the same "labour relations');
  console.log('     exclusion" tactic that BC WCAT used before Pickering (2025)');
} else {
  console.log('   "Labour relations" DOES appear - needs deeper investigation');
}

console.log('\n💡 Next Steps:');
console.log('   1. Search full case text (not just keywords) for "labour relations"');
console.log('   2. Look for jurisdiction dismissals on mental disorder claims');
console.log('   3. Check if Ontario uses different terminology for same tactic\n');
