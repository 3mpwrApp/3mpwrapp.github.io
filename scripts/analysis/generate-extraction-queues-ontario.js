#!/usr/bin/env node

/**
 * GENERATE EXTRACTION QUEUES FOR ONTARIO TRIBUNALS
 * 
 * Creates prioritized lists of unknown cases for full text extraction
 * Focuses on: WSIAT (ONSBT), WSIB, HRTO, ONLRB, ONCA
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data', 'tribunal-decisions');
const outputDir = path.join(dataDir, 'extraction-queues');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Tribunal extraction targets
const TARGETS = {
  'onsbt': { name: 'WSIAT', target: 500, priority: 'CRITICAL' },
  'onwsib': { name: 'ONWSIB', target: 200, priority: 'CRITICAL' },
  'onhrt': { name: 'HRTO', target: 200, priority: 'HIGH' },
  'onlrb': { name: 'ONLRB', target: 150, priority: 'MEDIUM' },
  'onca': { name: 'ONCA', target: 100, priority: 'MEDIUM' }
};

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║  🎯 GENERATE EXTRACTION QUEUES - ONTARIO TRIBUNALS                ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

function calculateCaseValue(caseData) {
  let score = 0;
  const year = parseInt((caseData.decision_date || '').substring(0, 4)) || 2020;
  const keywordsApi = caseData.keywords_api || [];
  const keywordsText = keywordsApi.join(' — ').toLowerCase();
  const title = (caseData.title || '').toLowerCase();
  
  // HIGHEST PRIORITY: Worker injury/retaliation
  if (caseData.has_retaliation_issue || caseData.has_worker_injury_issue) {
    score += 100;
  }
  
  // Check title and keywords for injury-related terms
  const injuryTerms = /\b(injury|injured|accident|wsib|wsiat|compensation|disability|chronic pain|ptsd|concussion)\b/i;
  if (injuryTerms.test(title) || injuryTerms.test(keywordsText)) {
    score += 50;
  }
  
  // Substantive outcomes get priority (even if Unknown, might have hints in metadata)
  const substantiveHints = /\b(allowed|dismissed|denied|granted|upheld|rejected)\b/i;
  if (substantiveHints.test(keywordsText) || substantiveHints.test(title)) {
    score += 40;
  }
  
  // Recent cases are more relevant
  if (year >= 2025) score += 30;
  else if (year >= 2023) score += 20;
  else if (year >= 2021) score += 10;
  
  // Legislation cited indicates substantive case
  if (caseData.legislation_cited && caseData.legislation_cited.length > 0) {
    score += 25;
    score += Math.min(caseData.legislation_cited.length * 5, 25); // Bonus for multiple statutes
  }
  
  // Rich keywords indicate substantive decision
  if (keywordsApi.length > 5) score += 15;
  else if (keywordsApi.length > 2) score += 10;
  else if (keywordsApi.length > 0) score += 5;
  
  // Longer titles often indicate substantive cases
  if (title.length > 100) score += 10;
  else if (title.length > 50) score += 5;
  
  // Specific tribunal adjustments
  const database = caseData.database || '';
  
  if (database.includes('onsbt') || database.includes('wsiat')) {
    // WSIAT cases are highest priority
    score += 30;
  }
  
  if (database.includes('hrto') || database.includes('hrt')) {
    // Disability discrimination is high priority
    if (/disability/i.test(keywordsText) || /disability/i.test(title)) {
      score += 40;
    }
  }
  
  return score;
}

Object.entries(TARGETS).forEach(([code, { name, target, priority }]) => {
  console.log(`\n📊 Processing ${code.toUpperCase()} (${name}) - ${priority} PRIORITY`);
  console.log(`   Target: ${target} cases\n`);
  
  const files = fs.readdirSync(dataDir).filter(f => 
    f.startsWith(`${code}-`) && f.endsWith('-complete.json')
  );
  
  let allUnknowns = [];
  let totalCases = 0;
  let unknownCount = 0;
  
  files.forEach(filename => {
    const filePath = path.join(dataDir, filename);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const cases = Array.isArray(data) ? data : data.cases || [];
    
    totalCases += cases.length;
    
    cases.forEach(c => {
      if (!c.outcome || c.outcome === 'Unknown') {
        unknownCount++;
        
        const score = calculateCaseValue(c);
        
        allUnknowns.push({
          case_id: c.case_id,
          url: c.url,
          title: c.title,
          citation: c.citation,
          decision_date: c.decision_date,
          docket_number: c.docket_number,
          keywords_api: c.keywords_api || [],
          legislation_cited: c.legislation_cited || [],
          value_score: score,
          source_file: filename
        });
      }
    });
  });
  
  console.log(`   Total cases: ${totalCases.toLocaleString()}`);
  console.log(`   Unknown: ${unknownCount.toLocaleString()}`);
  
  // Sort by value score (descending)
  allUnknowns.sort((a, b) => b.value_score - a.value_score);
  
  // Take top N
  const queue = allUnknowns.slice(0, target);
  
  // Statistics
  const avgScore = queue.reduce((sum, c) => sum + c.value_score, 0) / queue.length;
  const highValue = queue.filter(c => c.value_score >= 150).length;
  const mediumValue = queue.filter(c => c.value_score >= 100 && c.value_score < 150).length;
  const lowValue = queue.filter(c => c.value_score < 100).length;
  
  const withLegislation = queue.filter(c => c.legislation_cited.length > 0).length;
  const recentCases = queue.filter(c => {
    const year = parseInt((c.decision_date || '').substring(0, 4)) || 2020;
    return year >= 2024;
  }).length;
  
  console.log(`\n   Queue Statistics:`);
  console.log(`   • Selected: ${queue.length} cases`);
  console.log(`   • Average Score: ${avgScore.toFixed(1)}`);
  console.log(`   • High Value (150+): ${highValue}`);
  console.log(`   • Medium Value (100-149): ${mediumValue}`);
  console.log(`   • Low Value (<100): ${lowValue}`);
  console.log(`   • With Legislation: ${withLegislation}`);
  console.log(`   • Recent (2024+): ${recentCases}`);
  console.log(`   • Top Score: ${queue[0].value_score}`);
  console.log(`   • Bottom Score: ${queue[queue.length - 1].value_score}`);
  
  // Write queue to file
  const outputFile = path.join(outputDir, `${code}-extraction-queue.json`);
  fs.writeFileSync(outputFile, JSON.stringify(queue, null, 2), 'utf8');
  
  console.log(`\n   ✅ Queue saved: extraction-queues/${code}-extraction-queue.json`);
});

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('✅ All extraction queues generated!\n');
console.log('Queue files created in: data/tribunal-decisions/extraction-queues/\n');
console.log('Next steps:');
console.log('   1. Review queue priorities (open JSON files)');
console.log('   2. Run extract-full-text-batch.js to start extraction');
console.log('   3. Monitor CanLII API quota (stop at 500 requests/day)\n');
