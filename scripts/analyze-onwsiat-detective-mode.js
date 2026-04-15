#!/usr/bin/env node
/**
 * 🕵️ ONWSIAT DETECTIVE MODE ANALYSIS (2020-2026)
 * 
 * This script looks for:
 * - Hidden patterns and anomalies
 * - Suspicious timing correlations
 * - Keyword co-occurrence patterns (what appears together?)
 * - Quarterly/monthly spikes and drops
 * - Language manipulation patterns
 * - Decision gaps and numbering anomalies
 * - Seasonal denial patterns
 * - Fiscal year-end suspicions
 * - Reconsideration timing abuse
 * - Pre-existing + body part combinations
 * - Mental health terminology suppression
 * - Representative correlation with outcomes
 * - Time-to-decision patterns
 * - And other evidence of systemic manipulation
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');
const OUTPUT_DIR = path.join(__dirname, '../data/tribunal-decisions/detective-analysis');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🕵️  DETECTIVE MODE: ONWSIAT ANOMALY INVESTIGATION (2020-2026)');
console.log('═══════════════════════════════════════════════════════════════════\n');

// Load all data
const allCases = [];
const yearlyData = {};

console.log('📂 Loading evidence...\n');
for (const year of [2020, 2021, 2022, 2023, 2024, 2025, 2026]) {
  const file = path.join(DATA_DIR, `onwsiat-${year}-ultra-slow.json`);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`   ✅ ${year}: ${data.length.toLocaleString()} cases`);
    allCases.push(...data);
    yearlyData[year] = data;
  }
}

console.log(`\n   📊 Total evidence: ${allCases.length.toLocaleString()} cases\n`);
console.log('═══════════════════════════════════════════════════════════════════\n');

// ============================================================================
// INVESTIGATION 1: MONTHLY ANOMALY DETECTION
// ============================================================================

console.log('🔍 INVESTIGATION 1: Monthly Volume Anomalies\n');
console.log('   Looking for suspicious spikes/drops...\n');

const monthlyVolume = {};
allCases.forEach(c => {
  const date = c.data?.decisionDate;
  if (date) {
    const month = date.substring(0, 7); // YYYY-MM
    monthlyVolume[month] = (monthlyVolume[month] || 0) + 1;
  }
});

const months = Object.keys(monthlyVolume).sort();
const monthlyValues = months.map(m => monthlyVolume[m]);
const avgMonthly = monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length;
const stdDev = Math.sqrt(monthlyValues.map(v => Math.pow(v - avgMonthly, 2)).reduce((a, b) => a + b, 0) / monthlyValues.length);

console.log(`   📊 Average monthly volume: ${avgMonthly.toFixed(0)}`);
console.log(`   📊 Standard deviation: ${stdDev.toFixed(0)}\n`);

const anomalies = [];
months.forEach((month, idx) => {
  const count = monthlyVolume[month];
  const zScore = (count - avgMonthly) / stdDev;
  
  if (Math.abs(zScore) > 2) { // More than 2 standard deviations = anomaly
    anomalies.push({
      month,
      count,
      avg: avgMonthly,
      deviation: zScore.toFixed(2),
      type: zScore > 0 ? 'SPIKE' : 'DROP',
    });
  }
});

console.log('   🚨 ANOMALIES DETECTED:\n');
anomalies.forEach(a => {
  const symbol = a.type === 'SPIKE' ? '⬆️' : '⬇️';
  console.log(`   ${symbol} ${a.month}: ${a.count} cases (${a.deviation}σ ${a.type})`);
});

// Fiscal year ends (March 31)
console.log('\n   💰 FISCAL YEAR-END ANALYSIS (March volumes):\n');
const marchVolumes = months.filter(m => m.endsWith('-03')).map(m => ({ month: m, count: monthlyVolume[m] }));
marchVolumes.forEach(m => {
  const isAnomaly = anomalies.some(a => a.month === m.month);
  console.log(`   ${m.month}: ${m.count} ${isAnomaly ? '🚨 ANOMALY' : ''}`);
});

// ============================================================================
// INVESTIGATION 2: KEYWORD CO-OCCURRENCE PATTERNS
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('🔍 INVESTIGATION 2: Keyword Co-Occurrence Patterns\n');
console.log('   What appears together? (Denial tactics exposed)\n');

const coOccurrence = {
  preExisting: {}, // What appears with "pre-existing condition"
  mentalHealth: {}, // What appears with mental health terms
  denied: {}, // What appears with denial indicators
  allowed: {}, // What appears with approval indicators
};

allCases.forEach(c => {
  const keywords = (c.data?.keywords || '').toLowerCase();
  const terms = keywords.split('—').map(k => k.trim()).filter(k => k.length > 3);
  
  // Pre-existing co-occurrence
  if (keywords.includes('pre-existing')) {
    terms.forEach(term => {
      if (!term.includes('pre-existing')) {
        coOccurrence.preExisting[term] = (coOccurrence.preExisting[term] || 0) + 1;
      }
    });
  }
  
  // Mental health co-occurrence
  if (keywords.includes('psychotraumatic') || keywords.includes('mental') || keywords.includes('ptsd')) {
    terms.forEach(term => {
      if (!term.includes('psychotraumatic') && !term.includes('mental') && !term.includes('ptsd')) {
        coOccurrence.mentalHealth[term] = (coOccurrence.mentalHealth[term] || 0) + 1;
      }
    });
  }
  
  // Denial indicators
  if (keywords.includes('dismissed') || keywords.includes('denied') || keywords.includes('not entitled')) {
    terms.forEach(term => {
      coOccurrence.denied[term] = (coOccurrence.denied[term] || 0) + 1;
    });
  }
  
  // Allowed indicators
  if (keywords.includes('allowed') || keywords.includes('granted') || keywords.includes('entitled')) {
    terms.forEach(term => {
      coOccurrence.allowed[term] = (coOccurrence.allowed[term] || 0) + 1;
    });
  }
});

console.log('   🚨 TOP 15 TERMS APPEARING WITH "PRE-EXISTING CONDITION":\n');
Object.entries(coOccurrence.preExisting)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([term, count]) => {
    console.log(`      ${count.toString().padStart(4)}x — ${term}`);
  });

console.log('\n   🧠 TOP 15 TERMS APPEARING WITH MENTAL HEALTH KEYWORDS:\n');
Object.entries(coOccurrence.mentalHealth)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([term, count]) => {
    console.log(`      ${count.toString().padStart(4)}x — ${term}`);
  });

// ============================================================================
// INVESTIGATION 3: TIMING PATTERNS (DELAY TACTICS)
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('🔍 INVESTIGATION 3: Timing Patterns & Delay Tactics\n');

// Extract decision numbers and dates to calculate processing time
const decisionTimes = [];
allCases.forEach(c => {
  const docketNum = c.data?.docketNumber;
  const decisionDate = c.data?.decisionDate;
  const keywords = (c.data?.keywords || '').toLowerCase();
  
  if (docketNum && decisionDate) {
    // Extract year from docket (format: 1234/19 = filed 2019)
    const match = docketNum.match(/\/(\d{2})/);
    if (match) {
      const filedYear = 2000 + parseInt(match[1]);
      const decidedYear = parseInt(decisionDate.substring(0, 4));
      const yearsToDecision = decidedYear - filedYear;
      
      if (yearsToDecision >= 0 && yearsToDecision <= 10) {
        decisionTimes.push({
          years: yearsToDecision,
          docket: docketNum,
          decisionDate,
          hasReconsideration: keywords.includes('reconsideration'),
        });
      }
    }
  }
});

const avgDecisionTime = decisionTimes.reduce((sum, d) => sum + d.years, 0) / decisionTimes.length;
const medianDecisionTime = decisionTimes.map(d => d.years).sort((a, b) => a - b)[Math.floor(decisionTimes.length / 2)];

console.log(`   ⏱️  Average time to decision: ${avgDecisionTime.toFixed(1)} years`);
console.log(`   ⏱️  Median time to decision: ${medianDecisionTime} years\n`);

// Distribution
const timeDistribution = {};
decisionTimes.forEach(d => {
  timeDistribution[d.years] = (timeDistribution[d.years] || 0) + 1;
});

console.log('   📊 Time-to-Decision Distribution:\n');
Object.keys(timeDistribution).sort((a, b) => a - b).forEach(years => {
  const count = timeDistribution[years];
  const pct = ((count / decisionTimes.length) * 100).toFixed(1);
  const bar = '█'.repeat(Math.ceil(count / 100));
  console.log(`      ${years} years: ${count.toString().padStart(5)} (${pct.toString().padStart(5)}%) ${bar}`);
});

// Reconsideration correlation with time
const withRecon = decisionTimes.filter(d => d.hasReconsideration);
const avgReconTime = withRecon.length > 0 ? withRecon.reduce((sum, d) => sum + d.years, 0) / withRecon.length : 0;
console.log(`\n   🔄 Cases with "reconsideration": ${withRecon.length} (avg time: ${avgReconTime.toFixed(1)} years)`);
console.log(`   ⚠️  Reconsideration adds ~${(avgReconTime - avgDecisionTime).toFixed(1)} years to timeline`);

// ============================================================================
// INVESTIGATION 4: PRE-EXISTING + BODY PART COMBINATIONS
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('🔍 INVESTIGATION 4: Pre-Existing Condition by Body Part\n');
console.log('   Which injuries get blamed on "pre-existing"?\n');

const bodyParts = ['shoulder', 'knee', 'back', 'neck', 'wrist', 'hip', 'elbow', 'ankle', 'hand', 'foot'];
const preExistingByBodyPart = {};

bodyParts.forEach(part => {
  const partCases = allCases.filter(c => {
    const text = `${c.data?.title || ''} ${c.data?.keywords || ''}`.toLowerCase();
    return text.includes(part);
  });
  
  const preExistingCases = partCases.filter(c => {
    const text = `${c.data?.title || ''} ${c.data?.keywords || ''}`.toLowerCase();
    return text.includes('pre-existing') || text.includes('degenerative');
  });
  
  preExistingByBodyPart[part] = {
    total: partCases.length,
    preExisting: preExistingCases.length,
    rate: ((preExistingCases.length / partCases.length) * 100).toFixed(1),
  };
});

console.log('   Body Part Analysis:\n');
Object.entries(preExistingByBodyPart)
  .sort((a, b) => parseFloat(b[1].rate) - parseFloat(a[1].rate))
  .forEach(([part, data]) => {
    console.log(`   ${part.padEnd(10)}: ${data.preExisting.toString().padStart(4)} / ${data.total.toString().padStart(4)} (${data.rate}%) blamed on pre-existing`);
  });

// ============================================================================
// INVESTIGATION 5: LANGUAGE MANIPULATION PATTERNS
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('🔍 INVESTIGATION 5: Language Manipulation Patterns\n');
console.log('   Euphemisms and obfuscation tactics...\n');

const manipulationPatterns = {
  // Denial euphemisms
  'not established': 0,
  'insufficient': 0,
  'not satisfied': 0,
  'fails to meet': 0,
  'does not support': 0,
  'lacks': 0,
  'unable to conclude': 0,
  'not persuaded': 0,
  'does not demonstrate': 0,
  'threshold not met': 0,
  
  // Blame-shifting
  'lifestyle': 0,
  'obesity': 0,
  'smoking': 0,
  'personal': 0,
  'non-work': 0,
  'domestic': 0,
  
  // Delay tactics
  'requires further': 0,
  'additional information': 0,
  'clarification needed': 0,
  'pending': 0,
  'await': 0,
  
  // Minimize injury language
  'minor': 0,
  'trivial': 0,
  'temporary': 0,
  'resolved': 0,
  'recovered': 0,
};

allCases.forEach(c => {
  const text = `${c.data?.title || ''} ${c.data?.keywords || ''}`.toLowerCase();
  
  Object.keys(manipulationPatterns).forEach(phrase => {
    if (text.includes(phrase)) {
      manipulationPatterns[phrase]++;
    }
  });
});

console.log('   🎭 DENIAL EUPHEMISMS:\n');
['not established', 'insufficient', 'not satisfied', 'fails to meet', 'does not support', 'lacks', 'unable to conclude', 'not persuaded', 'does not demonstrate', 'threshold not met']
  .forEach(phrase => {
    const count = manipulationPatterns[phrase];
    if (count > 0) {
      const pct = ((count / allCases.length) * 100).toFixed(2);
      console.log(`      "${phrase}": ${count} cases (${pct}%)`);
    }
  });

console.log('\n   🎯 VICTIM-BLAMING LANGUAGE:\n');
['lifestyle', 'obesity', 'smoking', 'personal', 'non-work', 'domestic']
  .forEach(phrase => {
    const count = manipulationPatterns[phrase];
    if (count > 0) {
      const pct = ((count / allCases.length) * 100).toFixed(2);
      console.log(`      "${phrase}": ${count} cases (${pct}%)`);
    }
  });

// ============================================================================
// INVESTIGATION 6: DECISION NUMBER GAPS
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('🔍 INVESTIGATION 6: Decision Number Gaps & Missing Cases\n');

const decisionNumbers = {};
allCases.forEach(c => {
  const docket = c.data?.docketNumber;
  if (docket) {
    const year = c.data?.decisionDate?.substring(0, 4);
    if (!decisionNumbers[year]) decisionNumbers[year] = [];
    decisionNumbers[year].push(docket);
  }
});

// Sample 2024 to check for gaps
const year2024Dockets = decisionNumbers['2024'] || [];
const year2024Numbers = year2024Dockets
  .map(d => {
    const match = d.match(/^(\d+)\//);
    return match ? parseInt(match[1]) : null;
  })
  .filter(n => n !== null)
  .sort((a, b) => a - b);

if (year2024Numbers.length > 0) {
  const min = year2024Numbers[0];
  const max = year2024Numbers[year2024Numbers.length - 1];
  const expected = max - min + 1;
  const actual = year2024Numbers.length;
  const missing = expected - actual;
  
  console.log(`   📊 2024 Decision Numbers:`);
  console.log(`      Range: ${min} to ${max}`);
  console.log(`      Expected: ${expected} decisions`);
  console.log(`      Found: ${actual} decisions`);
  console.log(`      ${missing > 0 ? `🚨 MISSING: ${missing} decisions (${((missing/expected)*100).toFixed(1)}%)` : '✅ No gaps detected'}`);
  
  // Find specific gaps
  if (missing > 0 && missing < 50) {
    const gaps = [];
    for (let i = 0; i < year2024Numbers.length - 1; i++) {
      const gap = year2024Numbers[i + 1] - year2024Numbers[i];
      if (gap > 1) {
        gaps.push({ after: year2024Numbers[i], before: year2024Numbers[i + 1], size: gap - 1 });
      }
    }
    console.log(`\n      Gap locations:`);
    gaps.slice(0, 10).forEach(g => {
      console.log(`         ${g.size} missing after decision ${g.after}`);
    });
  }
}

// ============================================================================
// INVESTIGATION 7: SEASONAL DENIAL PATTERNS
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('🔍 INVESTIGATION 7: Seasonal Patterns\n');

const seasonalData = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
const seasonalDenials = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

allCases.forEach(c => {
  const date = c.data?.decisionDate;
  if (date) {
    const month = parseInt(date.substring(5, 7));
    const quarter = `Q${Math.ceil(month / 3)}`;
    seasonalData[quarter]++;
    
    const keywords = (c.data?.keywords || '').toLowerCase();
    if (keywords.includes('dismissed') || keywords.includes('denied')) {
      seasonalDenials[quarter]++;
    }
  }
});

console.log('   📅 Quarterly Decision Volume:\n');
['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
  const total = seasonalData[q];
  const denials = seasonalDenials[q];
  const denialRate = total > 0 ? ((denials / total) * 100).toFixed(1) : 0;
  console.log(`      ${q} (${q === 'Q1' ? 'Jan-Mar' : q === 'Q2' ? 'Apr-Jun' : q === 'Q3' ? 'Jul-Sep' : 'Oct-Dec'}): ${total.toLocaleString()} decisions, ${denials} explicit denials (${denialRate}%)`);
});

console.log(`\n   🔥 ${seasonalData.Q1 > seasonalData.Q4 ? 'Q1 (fiscal year-end pressure) has HIGHER volume' : 'Q4 has higher volume'}`);

// ============================================================================
// SAVE RESULTS
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('💾 Saving detective findings...\n');

const detectiveFindings = {
  metadata: {
    analysisDate: new Date().toISOString(),
    totalCases: allCases.length,
    investigationMode: 'DETECTIVE',
  },
  anomalies: {
    monthly: anomalies,
    fiscalYearEnd: marchVolumes,
  },
  coOccurrence: {
    preExisting: Object.fromEntries(Object.entries(coOccurrence.preExisting).sort((a, b) => b[1] - a[1]).slice(0, 30)),
    mentalHealth: Object.fromEntries(Object.entries(coOccurrence.mentalHealth).sort((a, b) => b[1] - a[1]).slice(0, 30)),
  },
  timing: {
    average: avgDecisionTime,
    median: medianDecisionTime,
    distribution: timeDistribution,
    reconsiderationImpact: avgReconTime - avgDecisionTime,
  },
  preExistingByBodyPart,
  languageManipulation: manipulationPatterns,
  seasonalPatterns: {
    volume: seasonalData,
    denials: seasonalDenials,
  },
};

const jsonPath = path.join(OUTPUT_DIR, 'ONWSIAT-DETECTIVE-FINDINGS.json');
fs.writeFileSync(jsonPath, JSON.stringify(detectiveFindings, null, 2));
console.log(`   ✅ JSON: ${jsonPath}`);

// Save co-occurrence CSV for network analysis
const coOccurrenceCsvPath = path.join(OUTPUT_DIR, 'ONWSIAT-CO-OCCURRENCE.csv');
const coOccurrenceLines = ['Source,Target,Weight,Type'];

Object.entries(coOccurrence.preExisting).slice(0, 50).forEach(([term, count]) => {
  coOccurrenceLines.push(`"pre-existing condition","${term}",${count},preexisting`);
});

Object.entries(coOccurrence.mentalHealth).slice(0, 50).forEach(([term, count]) => {
  coOccurrenceLines.push(`"mental health","${term}",${count},mentalhealth`);
});

fs.writeFileSync(coOccurrenceCsvPath, coOccurrenceLines.join('\n'));
console.log(`   ✅ Co-occurrence CSV: ${coOccurrenceCsvPath}`);

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('✅ DETECTIVE INVESTIGATION COMPLETE!\n');
console.log('   🔍 Anomalies exposed');
console.log('   🕸️  Pattern networks revealed');
console.log('   ⏱️  Delay tactics documented');
console.log('   🎭 Language manipulation catalogued\n');
console.log('═══════════════════════════════════════════════════════════════════\n');
