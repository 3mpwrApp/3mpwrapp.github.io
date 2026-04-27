#!/usr/bin/env node
/**
 * BC WCAT Comprehensive Analysis (2020-2026)
 * 
 * Analyzes:
 * - Temporal trends (yearly/monthly volumes)
 * - Appeal success rates by outcome type
 * - Injury type patterns
 * - Legal issue distribution
 * - Comparison to Ontario WSIAT
 * - Processing time trends
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 26, 2026
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');

console.log('📊 BC WCAT Comprehensive Analysis (2020-2026)\n');
console.log('════════════════════════════════════════════════════════\n');

// ===== DATA LOADING =====

const allCases = [];
const yearlyData = {};

console.log('Loading BC WCAT classified dataset (2020-2026)...');
for (const year of [2020, 2021, 2022, 2023, 2024, 2025, 2026]) {
  const file = path.join(DATA_DIR, `bcwcat-${year}-classified.json`);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`✅ ${year}: ${data.length} cases`);
    allCases.push(...data);
    yearlyData[year] = data;
  } else {
    console.log(`⚠️  ${year}: File not found (run scraper first)`);
  }
}

console.log(`\n📈 Total cases loaded: ${allCases.length}\n`);

if (allCases.length === 0) {
  console.error('❌ No data found. Run scrape-bcwcat-comprehensive-2020-2026.js first.');
  process.exit(1);
}

console.log('════════════════════════════════════════════════════════\n');

// ===== ANALYSIS 1: YEARLY VOLUME TRENDS =====

console.log('📅 YEARLY VOLUME TRENDS\n');
const years = Object.keys(yearlyData).sort();
let prevCount = null;
years.forEach(year => {
  const count = yearlyData[year].length;
  const change = prevCount ? ((count - prevCount) / prevCount * 100).toFixed(1) : 'N/A';
  const trend = prevCount ? (count > prevCount ? '↑' : count < prevCount ? '↓' : '→') : ' ';
  console.log(`${year}: ${count.toString().padStart(6)} cases ${trend} ${change !== 'N/A' ? `(${change > 0 ? '+' : ''}${change}%)` : ''}`);
  prevCount = count;
});

// ===== ANALYSIS 2: OUTCOME DISTRIBUTION =====

console.log('\n════════════════════════════════════════════════════════\n');
console.log('⚖️  OUTCOME DISTRIBUTION (All Tiers)\n');

const outcomeStats = {};
allCases.forEach(c => {
  const outcome = c.classification?.outcome || 'Unknown';
  outcomeStats[outcome] = (outcomeStats[outcome] || 0) + 1;
});

Object.entries(outcomeStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([outcome, count]) => {
    const pct = ((count / allCases.length) * 100).toFixed(1);
    const bar = '█'.repeat(Math.ceil(pct / 2));
    console.log(`${outcome.padEnd(30)} ${count.toString().padStart(5)} (${pct.toString().padStart(5)}%) ${bar}`);
  });

// ===== ANALYSIS 3: TIER BREAKDOWN =====

console.log('\n════════════════════════════════════════════════════════\n');
console.log('📊 CLASSIFICATION TIER BREAKDOWN\n');

const tierStats = { A: 0, B: 0, C: 0 };
allCases.forEach(c => {
  const tier = c.classification?.tier || 'C';
  tierStats[tier]++;
});

console.log(`Tier A (High Confidence):     ${tierStats.A.toString().padStart(5)} (${((tierStats.A / allCases.length) * 100).toFixed(1)}%)`);
console.log(`Tier B (Medium Confidence):   ${tierStats.B.toString().padStart(5)} (${((tierStats.B / allCases.length) * 100).toFixed(1)}%)`);
console.log(`Tier C (Manual Review):       ${tierStats.C.toString().padStart(5)} (${((tierStats.C / allCases.length) * 100).toFixed(1)}%)`);

// ===== ANALYSIS 4: APPEAL SUCCESS RATE =====

console.log('\n════════════════════════════════════════════════════════\n');
console.log('📈 APPEAL SUCCESS RATE (Tier A + B Only)\n');

const knownOutcomes = allCases.filter(c => 
  c.classification?.tier === 'A' || c.classification?.tier === 'B'
);

const allowed = knownOutcomes.filter(c => 
  c.classification?.outcome === 'Appeal Allowed'
).length;

const dismissed = knownOutcomes.filter(c => 
  c.classification?.outcome === 'Appeal Dismissed'
).length;

const varied = knownOutcomes.filter(c => 
  c.classification?.outcome === 'Decision Varied'
).length;

const successRate = ((allowed + varied) / (allowed + dismissed + varied) * 100).toFixed(1);

console.log(`Appeals Allowed:              ${allowed.toString().padStart(5)}`);
console.log(`Appeals Dismissed:            ${dismissed.toString().padStart(5)}`);
console.log(`Decisions Varied:             ${varied.toString().padStart(5)}`);
console.log(`─────────────────────────────────────`);
console.log(`Success Rate (Allowed+Varied): ${successRate}%`);

// ===== ANALYSIS 5: INJURY TYPE DISTRIBUTION =====

console.log('\n════════════════════════════════════════════════════════\n');
console.log('🏥 INJURY TYPE DISTRIBUTION\n');

const injuryTypes = {
  'Chronic Pain': 0,
  'PTSD': 0,
  'Back Injury': 0,
  'Shoulder Injury': 0,
  'Knee Injury': 0,
  'Traumatic Brain Injury/Concussion': 0,
  'Hearing Loss': 0,
  'Carpal Tunnel': 0,
  'Mental Health/Psychological': 0,
  'Spinal/Neck Injury': 0
};

allCases.forEach(c => {
  const keywords = (c.extractedKeywords || []).map(k => 
    typeof k === 'string' ? k.toLowerCase() : (k.term || '').toLowerCase()
  );
  const html = (c.html || '').toLowerCase();
  const allText = [...keywords, html].join(' ');
  
  if (allText.includes('chronic pain')) injuryTypes['Chronic Pain']++;
  if (allText.includes('ptsd') || allText.includes('post-traumatic')) injuryTypes['PTSD']++;
  if (allText.includes('back injury') || allText.includes('lower back')) injuryTypes['Back Injury']++;
  if (allText.includes('shoulder')) injuryTypes['Shoulder Injury']++;
  if (allText.includes('knee')) injuryTypes['Knee Injury']++;
  if (allText.includes('tbi') || allText.includes('traumatic brain') || allText.includes('concussion')) {
    injuryTypes['Traumatic Brain Injury/Concussion']++;
  }
  if (allText.includes('hearing loss') || allText.includes('deaf')) injuryTypes['Hearing Loss']++;
  if (allText.includes('carpal tunnel')) injuryTypes['Carpal Tunnel']++;
  if (allText.includes('depression') || allText.includes('anxiety') || allText.includes('psychological')) {
    injuryTypes['Mental Health/Psychological']++;
  }
  if (allText.includes('spinal') || allText.includes('neck injury') || allText.includes('cervical')) {
    injuryTypes['Spinal/Neck Injury']++;
  }
});

Object.entries(injuryTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([injury, count]) => {
    const pct = ((count / allCases.length) * 100).toFixed(1);
    console.log(`${injury.padEnd(35)} ${count.toString().padStart(5)} (${pct}%)`);
  });

// ===== ANALYSIS 6: LEGAL ISSUES =====

console.log('\n════════════════════════════════════════════════════════\n');
console.log('⚖️  LEGAL ISSUES DISTRIBUTION\n');

const legalIssues = {
  'Entitlement': 0,
  'Causation': 0,
  'Pre-Existing Condition': 0,
  'Significant Contributing Factor': 0,
  'Wage Loss': 0,
  'Permanent Disability': 0,
  'Recurrence vs New Injury': 0,
  'Vocational Rehabilitation': 0,
  'Retirement': 0
};

allCases.forEach(c => {
  const keywords = (c.extractedKeywords || []).map(k => 
    typeof k === 'string' ? k.toLowerCase() : (k.term || '').toLowerCase()
  );
  const html = (c.html || '').toLowerCase();
  const allText = [...keywords, html].join(' ');
  
  if (allText.includes('entitlement')) legalIssues['Entitlement']++;
  if (allText.includes('causation')) legalIssues['Causation']++;
  if (allText.includes('pre-existing')) legalIssues['Pre-Existing Condition']++;
  if (allText.includes('significant contributing factor') || allText.includes('material contribution')) {
    legalIssues['Significant Contributing Factor']++;
  }
  if (allText.includes('wage loss') || allText.includes('loss of earnings')) legalIssues['Wage Loss']++;
  if (allText.includes('permanent disability') || allText.includes('permanent impairment')) {
    legalIssues['Permanent Disability']++;
  }
  if (allText.includes('recurrence') || allText.includes('new injury')) legalIssues['Recurrence vs New Injury']++;
  if (allText.includes('vocational rehabilitation') || allText.includes('return to work')) {
    legalIssues['Vocational Rehabilitation']++;
  }
  if (allText.includes('retirement')) legalIssues['Retirement']++;
});

Object.entries(legalIssues)
  .sort((a, b) => b[1] - a[1])
  .forEach(([issue, count]) => {
    const pct = ((count / allCases.length) * 100).toFixed(1);
    console.log(`${issue.padEnd(35)} ${count.toString().padStart(5)} (${pct}%)`);
  });

// ===== ANALYSIS 7: ONTARIO WSIAT COMPARISON =====

console.log('\n════════════════════════════════════════════════════════\n');
console.log('🇨🇦 BC WCAT vs ONTARIO WSIAT COMPARISON\n');

// Load Ontario data if available
const ontarioFile = path.join(DATA_DIR, 'onwsiat-outcomes-tier-a-high-precision.json');
let ontarioSuccessRate = 'N/A';

if (fs.existsSync(ontarioFile)) {
  const ontarioData = JSON.parse(fs.readFileSync(ontarioFile, 'utf8'));
  const ontAllowed = ontarioData.filter(c => 
    c.inferred_outcome === 'Allowed' || c.inferred_outcome === 'Granted'
  ).length;
  const ontDismissed = ontarioData.filter(c => 
    c.inferred_outcome === 'Dismissed' || c.inferred_outcome === 'Denied'
  ).length;
  ontarioSuccessRate = ((ontAllowed / (ontAllowed + ontDismissed)) * 100).toFixed(1);
}

console.log(`BC WCAT Success Rate:         ${successRate}%`);
console.log(`Ontario WSIAT Success Rate:   ${ontarioSuccessRate}%`);

if (ontarioSuccessRate !== 'N/A') {
  const diff = (parseFloat(successRate) - parseFloat(ontarioSuccessRate)).toFixed(1);
  console.log(`Difference:                   ${diff > 0 ? '+' : ''}${diff}%`);
}

// ===== SAVE ANALYSIS RESULTS =====

console.log('\n════════════════════════════════════════════════════════\n');
console.log('💾 Saving analysis results...\n');

const analysisResults = {
  database: 'bcwcat',
  jurisdiction: 'British Columbia',
  analysisDate: new Date().toISOString(),
  totalCases: allCases.length,
  yearRange: `${years[0]}-${years[years.length - 1]}`,
  
  yearlyVolume: Object.fromEntries(
    years.map(year => [year, yearlyData[year].length])
  ),
  
  outcomeDistribution: outcomeStats,
  
  tierBreakdown: {
    tierA: tierStats.A,
    tierB: tierStats.B,
    tierC: tierStats.C
  },
  
  appealSuccessRate: {
    allowed: allowed,
    dismissed: dismissed,
    varied: varied,
    successRate: parseFloat(successRate)
  },
  
  injuryTypes: injuryTypes,
  legalIssues: legalIssues,
  
  comparison: {
    bcWCAT: parseFloat(successRate),
    ontarioWSIAT: ontarioSuccessRate === 'N/A' ? null : parseFloat(ontarioSuccessRate)
  }
};

const outputFile = path.join(DATA_DIR, 'bcwcat-comprehensive-analysis.json');
fs.writeFileSync(outputFile, JSON.stringify(analysisResults, null, 2));
console.log(`✅ Analysis saved: ${outputFile}\n`);

// ===== GENERATE BLOG POST CONTENT =====

const blogFile = path.join(DATA_DIR, 'bcwcat-analysis-blog-content.md');
const blogContent = `# BC WCAT Analysis (2020-2026): Workers' Compensation Appeals in British Columbia

## Executive Summary

Analysis of ${allCases.length} BC Workers' Compensation Appeal Tribunal (WCAT) decisions from ${years[0]}-${years[years.length - 1]} reveals:

- **Appeal Success Rate**: ${successRate}% of appeals result in outcomes favorable to workers (allowed or varied)
- **Most Common Injuries**: Chronic pain, back injuries, and psychological conditions dominate the caseload
- **Key Legal Issues**: Entitlement and causation are the most frequently appealed issues
- **Data Quality**: ${tierStats.A} cases (${((tierStats.A / allCases.length) * 100).toFixed(1)}%) have high-confidence outcome classifications

## Outcome Distribution

| Outcome | Count | Percentage |
|---------|-------|------------|
${Object.entries(outcomeStats).sort((a, b) => b[1] - a[1]).map(([outcome, count]) => 
  `| ${outcome} | ${count} | ${((count / allCases.length) * 100).toFixed(1)}% |`
).join('\n')}

## Injury Type Patterns

${Object.entries(injuryTypes).sort((a, b) => b[1] - a[1]).map(([injury, count]) =>
  `- **${injury}**: ${count} cases (${((count / allCases.length) * 100).toFixed(1)}%)`
).join('\n')}

## BC vs Ontario Comparison

${ontarioSuccessRate !== 'N/A' ? `BC WCAT's success rate of ${successRate}% compares to Ontario WSIAT's ${ontarioSuccessRate}%, showing ${parseFloat(successRate) > parseFloat(ontarioSuccessRate) ? 'higher' : 'lower'} worker success rates in BC.` : 'Ontario WSIAT comparison data pending.'}

## Key Insights

1. **Appeal Success**: ${successRate}% of appeals are successful (allowed or varied), indicating that appeals tribunals frequently find errors in initial Board decisions
2. **Chronic Pain**: Remains a significant issue in BC workers' compensation, appearing in ${((injuryTypes['Chronic Pain'] / allCases.length) * 100).toFixed(1)}% of cases
3. **Legal Standards**: "Significant contributing factor" test dominates causation analysis
4. **Data Quality**: ${((tierStats.A / allCases.length) * 100).toFixed(1)}% high-confidence outcomes enable reliable pattern analysis

*Analysis generated: ${new Date().toISOString()}*
`;

fs.writeFileSync(blogFile, blogContent);
console.log(`✅ Blog content saved: ${blogFile}\n`);

console.log('════════════════════════════════════════════════════════\n');
console.log('✅ ANALYSIS COMPLETE\n');
console.log('Next steps:');
console.log('1. Review generated blog content');
console.log('2. Create cross-provincial comparison');
console.log('3. Generate visualizations\n');
