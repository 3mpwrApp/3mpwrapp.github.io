#!/usr/bin/env node

/**
 * COMPREHENSIVE ONTARIO TRIBUNAL DATA IMPROVEMENT STRATEGY
 * 
 * Current State (After ML Classification):
 * - Total: 48,298 cases
 * - Known: 16,866 (34.9%)
 * - Unknown: 31,432 (65.1%)
 * 
 * Focus: Ontario tribunals (WSIAT/ONSBT, WSIB, HRTO, ONLRB, ONCA)
 * 
 * Strategy:
 * 1. ✅ COMPLETE: Pattern-based ML classification (+9,995 cases, 0 API calls)
 * 2. Extract full text for high-value unknowns (targeted, quota-aware)
 * 3. Train deeper ML model with TF-IDF on extracted full text
 * 4. Final classification pass on remaining unknowns
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data', 'tribunal-decisions');

// Ontario tribunals prioritized by injured worker relevance
const ONTARIO_PRIORITY = [
  { 
    code: 'onsbt', 
    name: 'WSIAT (Ontario Social Benefits Tribunal)',
    relevance: 'CRITICAL',
    extractTarget: 500,
    rationale: '93.3% unknown, primary injured worker tribunal'
  },
  { 
    code: 'onwsib', 
    name: 'ONWSIB (Ontario WSIB Appeals)',
    relevance: 'CRITICAL',
    extractTarget: 200,
    rationale: '95.2% unknown, direct WSIB appeals'
  },
  {
    code: 'onhrt',
    name: 'HRTO (Human Rights Tribunal)',
    relevance: 'HIGH',
    extractTarget: 200,
    rationale: '32.6% unknown, disability discrimination cases'
  },
  {
    code: 'onlrb',
    name: 'ONLRB (Labour Relations Board)',
    relevance: 'MEDIUM',
    extractTarget: 150,
    rationale: '47.0% unknown, some worker injury retaliation'
  },
  {
    code: 'onca',
    name: 'ONCA (Court of Appeal)',
    relevance: 'MEDIUM',
    extractTarget: 100,
    rationale: '17.9% unknown, precedent-setting cases'
  }
];

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║  🎯 ONTARIO TRIBUNAL DATA IMPROVEMENT STRATEGY                     ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

console.log('📊 CURRENT STATE (After ML Classification):\n');

let ontarioTotal = 0;
let ontarioKnown = 0;
let ontarioUnknown = 0;

ONTARIO_PRIORITY.forEach(({ code, name, relevance }) => {
  const files = fs.readdirSync(dataDir).filter(f => 
    f.startsWith(`${code}-`) && f.endsWith('-complete.json')
  );
  
  let total = 0, known = 0, unknown = 0;
  
  files.forEach(filename => {
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, filename), 'utf8'));
    const cases = Array.isArray(data) ? data : data.cases || [];
    
    total += cases.length;
    known += cases.filter(c => c.outcome && c.outcome !== 'Unknown').length;
    unknown += cases.filter(c => !c.outcome || c.outcome === 'Unknown').length;
  });
  
  ontarioTotal += total;
  ontarioKnown += known;
  ontarioUnknown += unknown;
  
  const knownPct = total > 0 ? (known / total * 100).toFixed(1) : 0;
  const unknownPct = total > 0 ? (unknown / total * 100).toFixed(1) : 0;
  
  console.log(`${code.toUpperCase()} - ${relevance} PRIORITY`);
  console.log(`   ${name}`);
  console.log(`   Total: ${total.toLocaleString()} | Known: ${known.toLocaleString()} (${knownPct}%) | Unknown: ${unknown.toLocaleString()} (${unknownPct}%)`);
  console.log();
});

console.log('═══════════════════════════════════════════════════════════════════');
console.log(`ONTARIO TOTALS: ${ontarioTotal.toLocaleString()} cases`);
console.log(`   ✅ Known: ${ontarioKnown.toLocaleString()} (${(ontarioKnown/ontarioTotal*100).toFixed(1)}%)`);
console.log(`   ❓ Unknown: ${ontarioUnknown.toLocaleString()} (${(ontarioUnknown/ontarioTotal*100).toFixed(1)}%)`);
console.log('═══════════════════════════════════════════════════════════════════\n');

// Extraction Strategy
console.log('🚀 PHASE 2: TARGETED FULL TEXT EXTRACTION\n');
console.log('CanLII API Budget:');
console.log('   • Free tier: ~1,000 requests/day');
console.log('   • Required delay: 15 seconds between requests');
console.log('   • Safe daily target: 500 extractions/day');
console.log('   • Max runtime: 500 * 15s = 7,500s = 2.08 hours/day\n');

let totalExtractionTarget = 0;
let dayCount = 0;

console.log('📋 EXTRACTION SCHEDULE:\n');

ONTARIO_PRIORITY.forEach(({ code, name, extractTarget, rationale }) => {
  const days = Math.ceil(extractTarget / 500);
  dayCount += days;
  totalExtractionTarget += extractTarget;
  
  console.log(`Day ${dayCount}: ${code.toUpperCase()} - ${extractTarget} cases`);
  console.log(`   Tribunal: ${name}`);
  console.log(`   Rationale: ${rationale}`);
  console.log(`   Runtime: ~${(extractTarget * 15 / 3600).toFixed(2)} hours`);
  console.log();
});

console.log('═══════════════════════════════════════════════════════════════════');
console.log(`TOTAL EXTRACTION: ${totalExtractionTarget.toLocaleString()} cases over ${dayCount} days\n`);

// Prioritization Criteria
console.log('🎯 CASE PRIORITIZATION CRITERIA:\n');
console.log('High Value Cases (Score 150-200):');
console.log('   • Worker injury/retaliation flags (+100)');
console.log('   • Substantive outcomes (Allowed, Dismissed) (+50)');
console.log('   • Recent cases (2024+) (+30)');
console.log('   • Legislation cited (+25)');
console.log('   • Multiple keywords (+10)\n');

console.log('Medium Value Cases (Score 100-149):');
console.log('   • Procedural outcomes (Settled, Remitted) (+30)');
console.log('   • Mid-range cases (2022-2023) (+20)');
console.log('   • Some keywords (+5)\n');

console.log('Low Value Cases (Score < 100):');
console.log('   • Minimal metadata');
console.log('   • Older cases (2020-2021)');
console.log('   • Administrative/procedural only\n');

// Implementation Scripts
console.log('═══════════════════════════════════════════════════════════════════');
console.log('📝 IMPLEMENTATION SCRIPTS TO CREATE:\n');

console.log('1️⃣  generate-extraction-queues-ontario.js');
console.log('   • Analyze all Ontario unknown cases');
console.log('   • Calculate priority scores');
console.log('   • Generate extraction queues (JSON files)');
console.log('   • One queue per tribunal\n');

console.log('2️⃣  extract-full-text-batch.js');
console.log('   • Read extraction queue');
console.log('   • Fetch full text from CanLII (15s delays)');
console.log('   • Extract outcome from full HTML');
console.log('   • Save progress every 50 cases');
console.log('   • Resume capability if quota exceeded\n');

console.log('3️⃣  train-ml-classifier-tfidf.js');
console.log('   • Train on all known outcomes + extracted text');
console.log('   • Use TF-IDF vectorization');
console.log('   • Random Forest or Naive Bayes classifier');
console.log('   • Cross-validation (80/20 split)\n');

console.log('4️⃣  final-classification-pass.js');
console.log('   • Apply trained model to remaining unknowns');
console.log('   • Confidence thresholds (> 70% only)');
console.log('   • Manual review queue for borderline cases\n');

// Expected Outcomes
console.log('═══════════════════════════════════════════════════════════════════');
console.log('📈 EXPECTED OUTCOMES:\n');

console.log('After Phase 1 (ML Pattern-Based): ✅ COMPLETE');
console.log(`   • Classified: 9,995 cases (25.8%)`);
console.log(`   • Known outcomes: 34.9% (from 14.2%)\n`);

console.log('After Phase 2 (Targeted Extraction): 🔄 IN PROGRESS');
console.log(`   • Extract: ${totalExtractionTarget.toLocaleString()} high-value cases`);
console.log(`   • Expected improvement: +${Math.round(totalExtractionTarget * 0.8).toLocaleString()} classifications (~80% success)`);
console.log(`   • Timeline: ${dayCount} days (2-3 weeks with buffer)\n`);

console.log('After Phase 3 (Deep ML + TF-IDF): 🔮 PROJECTED');
console.log(`   • Training set: ${ontarioKnown.toLocaleString()} known outcomes + ${totalExtractionTarget.toLocaleString()} extracted`);
console.log(`   • Remaining unknowns: ~${Math.round(ontarioUnknown * 0.6).toLocaleString()} cases`);
console.log(`   • Expected classification: +${Math.round(ontarioUnknown * 0.3).toLocaleString()} cases (~50% of remaining)`);
console.log(`   • Timeline: 1-2 days for training + classification\n`);

console.log('After Phase 4 (Final Pass): 🎯 TARGET');
console.log(`   • Expected final known outcomes: ~70-80% of Ontario cases`);
console.log(`   • Remaining ~20-30% will be:`)
console.log(`     - Administrative notices`);
console.log(`     - Incomplete filings`);
console.log(`     - Cases without published reasons\n`);

console.log('═══════════════════════════════════════════════════════════════════');
console.log('✅ Strategy Document Complete\n');
console.log('Next Step: Run generate-extraction-queues-ontario.js\n');
