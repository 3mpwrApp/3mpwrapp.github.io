#!/usr/bin/env node

/**
 * ALL ONTARIO TRIBUNALS DATA INVENTORY
 * Analyzes current data quality across WSIAT, WSIB, HRTO, ONSBT, ONLRB, ONCA
 * Shows total cases, unknown outcomes, keyword quality for strategic extraction planning
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data', 'tribunal-decisions');

// Read all tribunal data files
const files = fs.readdirSync(dataDir).filter(f => 
  f.endsWith('-complete.json') && !f.startsWith('.')
);

const tribunalStats = {};

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║  📊 ONTARIO TRIBUNAL DATA INVENTORY & QUALITY ASSESSMENT          ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

files.forEach(filename => {
  const match = filename.match(/^([a-z]+)-(\d{4})-complete\.json$/);
  if (!match) return;
  
  const [, tribunal, year] = match;
  const tribunalKey = tribunal.toUpperCase();
  
  if (!tribunalStats[tribunalKey]) {
    tribunalStats[tribunalKey] = {
      totalCases: 0,
      unknownCount: 0,
      knownCount: 0,
      yearFiles: [],
      keywordLengths: [],
      hasLegislation: 0,
      hasRetaliation: 0
    };
  }
  
  const filePath = path.join(dataDir, filename);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const cases = Array.isArray(data) ? data : data.cases || [];
  
  tribunalStats[tribunalKey].totalCases += cases.length;
  tribunalStats[tribunalKey].yearFiles.push(year);
  
  cases.forEach(c => {
    const isUnknown = c.outcome === 'Unknown' || !c.outcome;
    if (isUnknown) {
      tribunalStats[tribunalKey].unknownCount++;
    } else {
      tribunalStats[tribunalKey].knownCount++;
    }
    
    // Analyze keyword quality - check both keywords_api and keywords_extracted
    const keywordsApi = c.keywords_api || c.keywords || [];
    const keywordsExtracted = c.keywords_extracted || [];
    const allKeywords = [...keywordsApi, ...keywordsExtracted];
    const keywordText = Array.isArray(allKeywords) ? allKeywords.join(' — ') : (allKeywords || '');
    tribunalStats[tribunalKey].keywordLengths.push(keywordText.length);
    
    if (c.legislation_cited && c.legislation_cited.length > 0) {
      tribunalStats[tribunalKey].hasLegislation++;
    }
    
    if (c.has_retaliation_issue || c.has_worker_injury_issue) {
      tribunalStats[tribunalKey].hasRetaliation++;
    }
  });
});

// Sort tribunals by total cases
const sorted = Object.entries(tribunalStats).sort((a, b) => b[1].totalCases - a[1].totalCases);

let grandTotal = 0;
let grandUnknown = 0;
let grandKnown = 0;

sorted.forEach(([tribunal, stats]) => {
  const unknownPct = (stats.unknownCount / stats.totalCases * 100).toFixed(1);
  const knownPct = (stats.knownCount / stats.totalCases * 100).toFixed(1);
  const avgKeywordLength = Math.round(stats.keywordLengths.reduce((a, b) => a + b, 0) / stats.keywordLengths.length);
  const legislationPct = (stats.hasLegislation / stats.totalCases * 100).toFixed(1);
  const retaliationPct = (stats.hasRetaliation / stats.totalCases * 100).toFixed(1);
  
  grandTotal += stats.totalCases;
  grandUnknown += stats.unknownCount;
  grandKnown += stats.knownCount;
  
  console.log(`📊 ${tribunal}:`);
  console.log(`   Years: ${stats.yearFiles.sort().join(', ')}`);
  console.log(`   Total Cases: ${stats.totalCases.toLocaleString()}`);
  console.log(`   ✅ Known Outcomes: ${stats.knownCount.toLocaleString()} (${knownPct}%)`);
  console.log(`   ❓ Unknown Outcomes: ${stats.unknownCount.toLocaleString()} (${unknownPct}%)`);
  console.log(`   📝 Avg Keyword Length: ${avgKeywordLength} chars`);
  console.log(`   📜 Has Legislation: ${stats.hasLegislation.toLocaleString()} (${legislationPct}%)`);
  console.log(`   🏥 Worker Injury Cases: ${stats.hasRetaliation.toLocaleString()} (${retaliationPct}%)`);
  console.log();
});

console.log('═══════════════════════════════════════════════════════════════════');
console.log('📊 GRAND TOTALS:');
console.log(`   Total Cases: ${grandTotal.toLocaleString()}`);
console.log(`   ✅ Known Outcomes: ${grandKnown.toLocaleString()} (${(grandKnown / grandTotal * 100).toFixed(1)}%)`);
console.log(`   ❓ Unknown Outcomes: ${grandUnknown.toLocaleString()} (${(grandUnknown / grandTotal * 100).toFixed(1)}%)`);
console.log('═══════════════════════════════════════════════════════════════════\n');

// Recommendations
console.log('🎯 STRATEGIC RECOMMENDATIONS:\n');

sorted.forEach(([tribunal, stats]) => {
  const unknownPct = (stats.unknownCount / stats.totalCases * 100);
  const avgKeywordLength = Math.round(stats.keywordLengths.reduce((a, b) => a + b, 0) / stats.keywordLengths.length);
  
  let strategy = '';
  let extractionTarget = 0;
  
  if (unknownPct > 60 && avgKeywordLength < 400) {
    strategy = '🔴 HIGH PRIORITY - Poor keyword quality, needs full text extraction';
    extractionTarget = Math.min(200, Math.ceil(stats.totalCases * 0.1)); // 10% or 200 cases
  } else if (unknownPct > 60 && avgKeywordLength >= 400) {
    strategy = '🟡 MEDIUM PRIORITY - Rich keywords, ML classification likely effective';
    extractionTarget = Math.min(100, Math.ceil(stats.totalCases * 0.05)); // 5% or 100 cases
  } else if (unknownPct > 30) {
    strategy = '🟢 LOW PRIORITY - Decent outcome classification, targeted extraction';
    extractionTarget = 50;
  } else {
    strategy = '✅ GOOD - High known outcome rate, minimal extraction needed';
    extractionTarget = 25;
  }
  
  console.log(`${tribunal}: ${strategy}`);
  console.log(`   → Extract top ${extractionTarget} high-value cases`);
  console.log(`   → ML training set: ${stats.knownCount.toLocaleString()} known outcomes available\n`);
});

console.log('\n💡 CanLII API BUDGET PLANNING:');
console.log('   Daily quota: ~1,000 requests (with 15-second delays)');
console.log('   Conservative safe limit: ~500 extractions/day');
console.log('   Recommended extraction order:');

let dailyBudget = 500;
let daysNeeded = 0;
sorted.forEach(([tribunal, stats], idx) => {
  const unknownPct = (stats.unknownCount / stats.totalCases * 100);
  const avgKeywordLength = Math.round(stats.keywordLengths.reduce((a, b) => a + b, 0) / stats.keywordLengths.length);
  
  let extractionTarget;
  if (unknownPct > 60 && avgKeywordLength < 400) {
    extractionTarget = Math.min(200, Math.ceil(stats.totalCases * 0.1));
  } else if (unknownPct > 60) {
    extractionTarget = Math.min(100, Math.ceil(stats.totalCases * 0.05));
  } else if (unknownPct > 30) {
    extractionTarget = 50;
  } else {
    extractionTarget = 25;
  }
  
  const days = Math.ceil(extractionTarget / dailyBudget);
  daysNeeded += days;
  
  console.log(`   Day ${daysNeeded}: ${tribunal} (${extractionTarget} cases)`);
});

console.log(`\n   Total extraction time: ~${daysNeeded} days\n`);
