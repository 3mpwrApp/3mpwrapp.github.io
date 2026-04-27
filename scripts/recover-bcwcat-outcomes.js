#!/usr/bin/env node

/**
 * BC WCAT Outcome Recovery & 3-Tier Classification
 * Processes BC WCAT cases and classifies outcomes into confidence tiers:
 * - Tier A: High confidence (explicit outcome statements)
 * - Tier B: Medium confidence (keyword inference)
 * - Tier C: Manual review queue (insufficient data)
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 26, 2026
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');

// ===== TIER A: HIGH CONFIDENCE PATTERNS =====
const TIER_A_PATTERNS = {
  allowed: [
    /appeal\s+(?:is\s+)?allowed/i,
    /appeal\s+granted/i,
    /entitlement\s+(?:is\s+)?allowed/i,
    /decision\s+(?:is\s+)?varied\s+to\s+allow/i
  ],
  dismissed: [
    /appeal\s+(?:is\s+)?dismissed/i,
    /appeal\s+(?:is\s+)?denied/i,
    /entitlement\s+(?:is\s+)?denied/i,
    /decision\s+(?:is\s+)?confirmed/i
  ],
  varied: [
    /decision\s+(?:is\s+)?varied/i,
    /board\s+decision\s+varied/i
  ],
  remitted: [
    /remit(?:ted)?\s+to\s+the\s+board/i,
    /referred\s+back\s+to\s+(?:the\s+)?board/i
  ],
  consent: [
    /by\s+consent/i,
    /consent\s+order/i,
    /parties\s+have\s+agreed/i
  ],
  withdrawn: [
    /appeal\s+withdrawn/i,
    /worker\s+withdrew/i
  ]
};

// ===== TIER B: KEYWORD INFERENCE =====
const TIER_B_KEYWORDS = {
  allowed: [
    'compensation awarded',
    'entitled to benefits',
    'board erred',
    'tribunal finds in favor',
    'claim accepted'
  ],
  dismissed: [
    'not compensable',
    'does not arise out of',
    'insufficient evidence',
    'not work-related',
    'board decision upheld'
  ],
  varied: [
    'partially accepted',
    'increased award',
    'reduced benefits'
  ]
};

// ===== OUTCOME CLASSIFICATION =====

function classifyOutcome(caseData) {
  const html = (caseData.html || '').toLowerCase();
  const title = (caseData.title || '').toLowerCase();
  const keywords = (caseData.keywords || []).map(k => k.toLowerCase());
  const extractedKeywords = (caseData.extractedKeywords || []).map(k => 
    typeof k === 'string' ? k.toLowerCase() : (k.term || '').toLowerCase()
  );
  
  const allText = [html, title, ...keywords, ...extractedKeywords].join(' ');
  
  // TIER A: High confidence (explicit outcome statements)
  for (const [outcome, patterns] of Object.entries(TIER_A_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(html) || pattern.test(title)) {
        return {
          tier: 'A',
          outcome: outcomeMap(outcome),
          confidence: 95,
          method: 'explicit_pattern',
          matchedPattern: pattern.toString()
        };
      }
    }
  }
  
  // TIER B: Medium confidence (keyword inference)
  for (const [outcome, keywordList] of Object.entries(TIER_B_KEYWORDS)) {
    for (const keyword of keywordList) {
      if (allText.includes(keyword)) {
        return {
          tier: 'B',
          outcome: outcomeMap(outcome),
          confidence: 70,
          method: 'keyword_inference',
          matchedKeyword: keyword
        };
      }
    }
  }
  
  // Check existing detectedOutcome from scraper
  if (caseData.detectedOutcome && caseData.detectedOutcome !== 'Unknown') {
    return {
      tier: 'B',
      outcome: caseData.detectedOutcome,
      confidence: 65,
      method: 'scraper_detection'
    };
  }
  
  // TIER C: Manual review needed
  return {
    tier: 'C',
    outcome: 'Unknown',
    confidence: 0,
    method: 'manual_review_required',
    reason: 'insufficient_data'
  };
}

function outcomeMap(rawOutcome) {
  const mapping = {
    'allowed': 'Appeal Allowed',
    'dismissed': 'Appeal Dismissed',
    'varied': 'Decision Varied',
    'remitted': 'Remitted to Board',
    'consent': 'Consent Order',
    'withdrawn': 'Withdrawn'
  };
  return mapping[rawOutcome] || rawOutcome;
}

// ===== PROCESSING LOGIC =====

async function processYearFile(year) {
  const inputFile = path.join(DATA_DIR, `bcwcat-${year}-complete.json`);
  
  if (!fs.existsSync(inputFile)) {
    console.log(`⚠️  Skipping ${year}: File not found`);
    return null;
  }
  
  console.log(`\n📅 Processing BC WCAT ${year}...`);
  
  const cases = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  console.log(`   Loaded ${cases.length} cases`);
  
  const tierStats = { A: 0, B: 0, C: 0 };
  const outcomeStats = {};
  
  const classifiedCases = cases.map(caseData => {
    const classification = classifyOutcome(caseData);
    
    tierStats[classification.tier]++;
    outcomeStats[classification.outcome] = (outcomeStats[classification.outcome] || 0) + 1;
    
    return {
      ...caseData,
      classification: classification
    };
  });
  
  // Save classified file
  const outputFile = path.join(DATA_DIR, `bcwcat-${year}-classified.json`);
  fs.writeFileSync(outputFile, JSON.stringify(classifiedCases, null, 2));
  
  console.log(`   ✅ Classified: Tier A=${tierStats.A}, B=${tierStats.B}, C=${tierStats.C}`);
  console.log(`   Outcomes:`);
  Object.entries(outcomeStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([outcome, count]) => {
      const pct = ((count / cases.length) * 100).toFixed(1);
      console.log(`      ${outcome.padEnd(25)} ${count.toString().padStart(4)} (${pct}%)`);
    });
  
  return {
    year,
    totalCases: cases.length,
    tierStats,
    outcomeStats,
    file: outputFile
  };
}

async function generateTierFiles() {
  console.log(`\n📊 Generating consolidated tier files...`);
  
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const allCases = [];
  
  for (const year of years) {
    const classifiedFile = path.join(DATA_DIR, `bcwcat-${year}-classified.json`);
    if (fs.existsSync(classifiedFile)) {
      const data = JSON.parse(fs.readFileSync(classifiedFile, 'utf8'));
      allCases.push(...data);
    }
  }
  
  console.log(`   Total cases across all years: ${allCases.length}`);
  
  // Split into tiers
  const tierA = allCases.filter(c => c.classification.tier === 'A');
  const tierB = allCases.filter(c => c.classification.tier === 'B');
  const tierC = allCases.filter(c => c.classification.tier === 'C');
  
  // Save tier files
  const tierAFile = path.join(DATA_DIR, 'bcwcat-outcomes-tier-a-high-precision.json');
  const tierBFile = path.join(DATA_DIR, 'bcwcat-outcomes-tier-b-medium-confidence.json');
  const tierCFile = path.join(DATA_DIR, 'bcwcat-outcomes-tier-c-manual-review-queue.json');
  
  fs.writeFileSync(tierAFile, JSON.stringify(tierA, null, 2));
  fs.writeFileSync(tierBFile, JSON.stringify(tierB, null, 2));
  fs.writeFileSync(tierCFile, JSON.stringify(tierC, null, 2));
  
  console.log(`   ✅ Tier A: ${tierA.length} cases (${((tierA.length / allCases.length) * 100).toFixed(1)}%)`);
  console.log(`   ✅ Tier B: ${tierB.length} cases (${((tierB.length / allCases.length) * 100).toFixed(1)}%)`);
  console.log(`   ✅ Tier C: ${tierC.length} cases (${((tierC.length / allCases.length) * 100).toFixed(1)}%)`);
  
  // Generate summary
  const summaryFile = path.join(DATA_DIR, 'bcwcat-outcomes-3-tier-summary.json');
  const summary = {
    database: 'bcwcat',
    jurisdiction: 'British Columbia',
    totalCases: allCases.length,
    tierBreakdown: {
      tierA: { count: tierA.length, percentage: ((tierA.length / allCases.length) * 100).toFixed(1) },
      tierB: { count: tierB.length, percentage: ((tierB.length / allCases.length) * 100).toFixed(1) },
      tierC: { count: tierC.length, percentage: ((tierC.length / allCases.length) * 100).toFixed(1) }
    },
    outcomeDistribution: {},
    generatedAt: new Date().toISOString()
  };
  
  // Calculate outcome distribution for Tier A + B
  const knownOutcomes = [...tierA, ...tierB];
  knownOutcomes.forEach(c => {
    const outcome = c.classification.outcome;
    summary.outcomeDistribution[outcome] = (summary.outcomeDistribution[outcome] || 0) + 1;
  });
  
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  console.log(`   ✅ Summary saved: ${summaryFile}`);
  
  return summary;
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🇨🇦 BC WCAT OUTCOME RECOVERY & CLASSIFICATION`);
  console.log(`${'='.repeat(60)}\n`);
  
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const results = [];
  
  for (const year of years) {
    const result = await processYearFile(year);
    if (result) {
      results.push(result);
    }
  }
  
  // Generate consolidated tier files
  const summary = await generateTierFiles();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ CLASSIFICATION COMPLETE`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n📊 FINAL SUMMARY:`);
  console.log(`   Total BC WCAT cases: ${summary.totalCases}`);
  console.log(`   Tier A (High Confidence): ${summary.tierBreakdown.tierA.count} (${summary.tierBreakdown.tierA.percentage}%)`);
  console.log(`   Tier B (Medium Confidence): ${summary.tierBreakdown.tierB.count} (${summary.tierBreakdown.tierB.percentage}%)`);
  console.log(`   Tier C (Manual Review): ${summary.tierBreakdown.tierC.count} (${summary.tierBreakdown.tierC.percentage}%)`);
  
  console.log(`\n📈 OUTCOME DISTRIBUTION (Tier A + B):`);
  Object.entries(summary.outcomeDistribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([outcome, count]) => {
      const knownTotal = summary.tierBreakdown.tierA.count + summary.tierBreakdown.tierB.count;
      const pct = ((count / knownTotal) * 100).toFixed(1);
      console.log(`   ${outcome.padEnd(30)} ${count.toString().padStart(4)} (${pct}%)`);
    });
  
  console.log(`\n💡 NEXT STEPS:`);
  console.log(`   1. Review Tier C cases manually if needed`);
  console.log(`   2. Run analyze-bcwcat-comprehensive.js for detailed analysis`);
  console.log(`   3. Generate blog posts and visualizations\n`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(`\n❌ ERROR: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = { classifyOutcome, processYearFile, generateTierFiles };
