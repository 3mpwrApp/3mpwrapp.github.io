#!/usr/bin/env node
/**
 * CanLII Pattern Analysis
 * 
 * Analyzes filtered tribunal decisions to extract:
 * - Winning arguments and strategies
 * - Judge reasoning patterns
 * - Medical evidence that succeeds
 * - Common denial reasons
 * - Appeal success factors
 * 
 * Usage:
 *   node scripts/analyze-patterns.mjs [filtered-file.json]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');

// Get input file from command line or use default
const inputFile = process.argv[2] || 'filtered-disability-cases-2026-04-08.json';
const inputPath = path.isAbsolute(inputFile) ? inputFile : path.join(DATA_DIR, inputFile);

console.log('═══════════════════════════════════════════════════════');
console.log('  CanLII Pattern Analysis');
console.log('═══════════════════════════════════════════════════════\n');

// Load data
let cases = [];
try {
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  cases = Array.isArray(data) ? data : data.cases || data.decisions || [];
  console.log(`✅ Loaded: ${path.basename(inputPath)}`);
  console.log(`📊 Analyzing ${cases.length} cases\n`);
} catch (error) {
  console.error(`❌ Error loading file: ${error.message}\n`);
  process.exit(1);
}

// Pattern extraction functions
const patterns = {
  outcomes: {
    allowed: 0,
    dismissed: 0,
    varied: 0,
    unknown: 0
  },
  conditions: {},
  keywords: {},
  successFactors: [],
  denialReasons: [],
  medicalEvidence: [],
  judgeReasoningPatterns: []
};

// Analyze each case
console.log('🔍 Analyzing patterns...\n');

for (const caseData of cases) {
  // Extract text from various fields
  const data = caseData.data || caseData;
  
  // Try to extract keywords from snippet JSON
  let keywords = data.keywords || caseData.keywords || '';
  if (!keywords && caseData.snippet) {
    try {
      const snippetData = JSON.parse(caseData.snippet);
      keywords = snippetData.keywords || '';
    } catch (e) {
      // If snippet isn't valid JSON, try string match
      const match = caseData.snippet.match(/"keywords":\s*"([^"]+)"/);
      if (match) keywords = match[1];
    }
  }
  
  const title = data.title || caseData.title || '';
  const citation = data.citation || caseData.citation || '';
  const date = data.decisionDate || data.date || caseData.decision_date || '';
  const condition = caseData.condition || '';
  
  // Combine all text for analysis
  const fullText = [keywords, title, condition].join(' ').toLowerCase();
  
  // Detect outcome (from keywords)
  let outcome = 'unknown';
  if (/\ballow(ed)?\b|granted|upheld|successful appeal/i.test(fullText)) {
    outcome = 'allowed';
    patterns.outcomes.allowed++;
  } else if (/\bdismiss(ed)?\b|denied|rejected|unsuccessful/i.test(fullText)) {
    outcome = 'dismissed';
    patterns.outcomes.dismissed++;
  } else if (/\bvari(ed)?\b|modified|adjusted/i.test(fullText)) {
    outcome = 'varied';
    patterns.outcomes.varied++;
  } else {
    patterns.outcomes.unknown++;
  }
  
  // Extract conditions
  const conditionPatterns = {
    'Chronic Pain': /chronic\s+pain/i,
    'PTSD': /\bptsd\b|post[\s-]traumatic\s+stress/i,
    'Fibromyalgia': /fibromyalgia/i,
    'Back Injury': /back\s+(injury|pain|problem)/i,
    'Mental Health': /mental\s+(health|injury|condition|illness)/i,
    'Repetitive Strain': /repetitive\s+(strain|stress)/i,
    'Permanent Disability': /permanent\s+disability/i,
    'Occupational Disease': /occupational\s+disease/i
  };
  
  for (const [condition, regex] of Object.entries(conditionPatterns)) {
    if (regex.test(fullText)) {
      patterns.conditions[condition] = patterns.conditions[condition] || { total: 0, allowed: 0, dismissed: 0 };
      patterns.conditions[condition].total++;
      if (outcome === 'allowed') patterns.conditions[condition].allowed++;
      if (outcome === 'dismissed') patterns.conditions[condition].dismissed++;
    }
  }
  
  // Extract key phrases from keywords
  if (keywords) {
    // Clean up encoding issues (â€" should be —)
    const cleanKeywords = keywords.replace(/â€"/g, '—').replace(/â€™/g, "'");
    const keywordList = cleanKeywords.split(/[–—\-,]+/).map(k => k.trim()).filter(k => k.length > 3);
    for (const kw of keywordList) {
      const normalized = kw.toLowerCase();
      patterns.keywords[normalized] = patterns.keywords[normalized] || 0;
      patterns.keywords[normalized]++;
    }
  }
  
  // Success factors (for allowed cases)
  if (outcome === 'allowed') {
    const successIndicators = [
      /medical\s+evidence/i,
      /expert\s+(opinion|testimony|report)/i,
      /credible\s+(witness|testimony)/i,
      /objective\s+medical\s+evidence/i,
      /independent\s+medical\s+exam/i,
      /treating\s+physician/i,
      /diagnostic\s+(test|imaging)/i,
      /functional\s+impairment/i,
      /work\s+restrictions/i
    ];
    
    for (const pattern of successIndicators) {
      if (pattern.test(fullText)) {
        const match = fullText.match(pattern);
        if (match) patterns.successFactors.push(match[0]);
      }
    }
  }
  
  // Denial reasons (for dismissed cases)
  if (outcome === 'dismissed') {
    const denialIndicators = [
      /insufficient\s+evidence/i,
      /lack\s+of\s+medical\s+evidence/i,
      /inconsistent\s+(statements|testimony)/i,
      /pre[\s-]existing\s+condition/i,
      /not\s+work[\s-]related/i,
      /credibility\s+(issue|concern)/i,
      /no\s+objective\s+evidence/i,
      /failed\s+to\s+prove/i
    ];
    
    for (const pattern of denialIndicators) {
      if (pattern.test(fullText)) {
        const match = fullText.match(pattern);
        if (match) patterns.denialReasons.push(match[0]);
      }
    }
  }
}

// Generate report
console.log('═══════════════════════════════════════════════════════');
console.log('  Analysis Results');
console.log('═══════════════════════════════════════════════════════\n');

console.log('📊 OUTCOMES:\n');
const total = cases.length;
console.log(`  Allowed:   ${patterns.outcomes.allowed} (${Math.round(patterns.outcomes.allowed/total*100)}%)`);
console.log(`  Dismissed: ${patterns.outcomes.dismissed} (${Math.round(patterns.outcomes.dismissed/total*100)}%)`);
console.log(`  Varied:    ${patterns.outcomes.varied} (${Math.round(patterns.outcomes.varied/total*100)}%)`);
console.log(`  Unknown:   ${patterns.outcomes.unknown} (${Math.round(patterns.outcomes.unknown/total*100)}%)\n`);

console.log('🏥 CONDITIONS BY SUCCESS RATE:\n');
const sortedConditions = Object.entries(patterns.conditions)
  .map(([name, stats]) => ({
    name,
    total: stats.total,
    successRate: stats.total > 0 ? Math.round(stats.allowed / stats.total * 100) : 0,
    allowed: stats.allowed,
    dismissed: stats.dismissed
  }))
  .sort((a, b) => b.successRate - a.successRate);

for (const condition of sortedConditions) {
  console.log(`  ${condition.name}:`);
  console.log(`    Total: ${condition.total} | Allowed: ${condition.allowed} | Success Rate: ${condition.successRate}%`);
}

console.log('\n✅ TOP SUCCESS FACTORS (Allowed Cases):\n');
const topSuccessFactors = [...new Set(patterns.successFactors)]
  .map(factor => ({
    factor,
    count: patterns.successFactors.filter(f => f === factor).length
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);

for (const { factor, count } of topSuccessFactors) {
  console.log(`  • ${factor} (${count} cases)`);
}

console.log('\n❌ TOP DENIAL REASONS (Dismissed Cases):\n');
const topDenialReasons = [...new Set(patterns.denialReasons)]
  .map(reason => ({
    reason,
    count: patterns.denialReasons.filter(r => r === reason).length
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);

for (const { reason, count } of topDenialReasons) {
  console.log(`  • ${reason} (${count} cases)`);
}

console.log('\n🔑 TOP KEYWORDS:\n');
const topKeywords = Object.entries(patterns.keywords)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

for (const [keyword, count] of topKeywords) {
  console.log(`  • ${keyword} (${count})`);
}

// Save detailed report
const report = {
  metadata: {
    analysisDate: new Date().toISOString(),
    inputFile: path.basename(inputPath),
    totalCases: cases.length
  },
  outcomes: patterns.outcomes,
  conditionSuccessRates: sortedConditions,
  successFactors: topSuccessFactors,
  denialReasons: topDenialReasons,
  topKeywords: topKeywords.map(([k, c]) => ({ keyword: k, count: c }))
};

const reportPath = path.join(DATA_DIR, `pattern-analysis-${new Date().toISOString().split('T')[0]}.json`);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n💾 Detailed report saved: ${path.basename(reportPath)}`);
console.log('\n═══════════════════════════════════════════════════════');
console.log('  Next Steps');
console.log('═══════════════════════════════════════════════════════\n');
console.log('1. Review success factors for Thunder Bay pilot strategies');
console.log('2. Prepare templates based on high-success-rate conditions');
console.log('3. Document common denial reasons to help avoid them');
console.log('4. Generate knowledge base articles from top keywords\n');
