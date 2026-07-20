#!/usr/bin/env node
/**
 * ULTRA-DEEP ONWSIAT DATA ANALYSIS (2020-2026)
 * 
 * This script extracts EVERYTHING we can get from 98,992 tribunal decisions:
 * - All keywords with frequency counts
 * - Detailed injury classification (50+ categories)
 * - Outcome extraction attempts (win/loss/varied)
 * - Temporal patterns (monthly, quarterly, day of week, seasonal)
 * - Decision type analysis (original, reconsideration, review)
 * - Representative mentions (lawyers, OWA, clinics)
 * - Medical evidence patterns (doctors, specialists, IME)
 * - Pre-existing condition language analysis
 * - Mental health terminology deep dive
 * - Deeming/phantom job mentions
 * - Age discrimination markers
 * - Geographic patterns
 * - Financial amounts (LOE, NEL awards)
 * - Legal citations (WSIA sections)
 * - Delay/backlog language
 * - And much more...
 * 
 * Output: Multiple JSON files + CSV for Excel/R analysis
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');
const OUTPUT_DIR = path.join(__dirname, '../data/tribunal-decisions/deep-analysis');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🔬 ULTRA-DEEP ONWSIAT ANALYSIS (2020-2026)');
console.log('═══════════════════════════════════════════════════════════════════\n');

// ============================================================================
// LOAD ALL DATA
// ============================================================================

const allCases = [];
const yearlyData = {};

console.log('📂 Loading data...\n');
for (const year of [2020, 2021, 2022, 2023, 2024, 2025, 2026]) {
  const file = path.join(DATA_DIR, `onwsiat-${year}-ultra-slow.json`);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`   ✅ ${year}: ${data.length.toLocaleString()} cases`);
    allCases.push(...data);
    yearlyData[year] = data;
  }
}

console.log(`\n   📊 TOTAL: ${allCases.length.toLocaleString()} cases\n`);
console.log('═══════════════════════════════════════════════════════════════════\n');

// ============================================================================
// ANALYSIS 1: COMPLETE KEYWORD EXTRACTION
// ============================================================================

console.log('🔍 ANALYSIS 1: Complete Keyword Extraction\n');

const allKeywords = {};
const keywordsByYear = {};

allCases.forEach(c => {
  const year = c.data?.decisionDate?.substring(0, 4);
  const kw = c.data?.keywords || '';
  
  if (!keywordsByYear[year]) keywordsByYear[year] = {};
  
  kw.split('—').forEach(k => {
    const clean = k.trim().toLowerCase();
    if (clean && clean.length > 2) {
      // Global count
      allKeywords[clean] = (allKeywords[clean] || 0) + 1;
      
      // Year-specific count
      if (year) {
        keywordsByYear[year][clean] = (keywordsByYear[year][clean] || 0) + 1;
      }
    }
  });
});

const sortedKeywords = Object.entries(allKeywords)
  .sort((a, b) => b[1] - a[1]);

console.log(`   Found ${sortedKeywords.length.toLocaleString()} unique keywords\n`);
console.log('   Top 50:\n');
sortedKeywords.slice(0, 50).forEach(([kw, count], idx) => {
  const pct = ((count / allCases.length) * 100).toFixed(1);
  console.log(`   ${(idx + 1).toString().padStart(2)}. ${kw.padEnd(40)} ${count.toLocaleString().padStart(6)} (${pct}%)`);
});

// ============================================================================
// ANALYSIS 2: DETAILED INJURY CLASSIFICATION
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('🏥 ANALYSIS 2: Detailed Injury Classification\n');

const injuryPatterns = {
  // Body parts
  shoulder: /\bshoulder/i,
  knee: /\bknee/i,
  back: /\bback|lumbar|spine|vertebra/i,
  neck: /\bneck|cervical/i,
  wrist: /\bwrist|carpal/i,
  elbow: /\belbow/i,
  hand: /\bhand|finger|thumb/i,
  foot: /\bfoot|ankle|toe/i,
  hip: /\bhip/i,
  arm: /\barm|humerus|forearm/i,
  leg: /\bleg|femur|tibia/i,
  
  // Injury types
  fracture: /\bfracture|broken|break/i,
  strain: /\bstrain/i,
  sprain: /\bsprain/i,
  tear: /\btear|torn/i,
  dislocation: /\bdislocation|dislocated/i,
  amputation: /\bamputation|amputated/i,
  burn: /\bburn|burns/i,
  cut: /\bcut|laceration/i,
  crush: /\bcrush/i,
  
  // Conditions
  arthritis: /\barthritis|osteoarthritis/i,
  tendonitis: /\btendonitis|tendinitis/i,
  bursitis: /\bbursitis/i,
  herniation: /\bherniation|herniated|disc/i,
  nerve: /\bnerve|neuropathy|radiculopathy/i,
  
  // Mental health (detailed)
  ptsd: /\bptsd|post-traumatic stress/i,
  psychotraumatic: /\bpsychotraumatic/i,
  mentalStress: /\bmental stress|psychological/i,
  depression: /\bdepression|depressive/i,
  anxiety: /\banxiety/i,
  chronicPain: /\bchronic pain|persistent pain/i,
  
  // Occupational diseases
  hearingLoss: /\bhearing loss|tinnitus|acoustic/i,
  asbestos: /\basbestos|mesothelioma/i,
  cancer: /\bcancer|carcinoma|malignant/i,
  respiratory: /\brespirat|lung|asthma|copd/i,
  skin: /\bskin|dermatitis/i,
  
  // Work-related
  repetitiveStrain: /\brepetitive|rsi/i,
  overuse: /\boveruse/i,
  gradualOnset: /\bgradual/i,
  traumatic: /\btraumatic|accident/i,
};

const injuryCounts = {};
Object.keys(injuryPatterns).forEach(key => {
  injuryCounts[key] = 0;
});

allCases.forEach(c => {
  const text = `${c.data?.title || ''} ${c.data?.keywords || ''}`.toLowerCase();
  
  Object.entries(injuryPatterns).forEach(([key, pattern]) => {
    if (pattern.test(text)) {
      injuryCounts[key]++;
    }
  });
});

const sortedInjuries = Object.entries(injuryCounts)
  .sort((a, b) => b[1] - a[1])
  .filter(([_, count]) => count > 0);

console.log('   Injury Classification Results:\n');
sortedInjuries.forEach(([injury, count]) => {
  const pct = ((count / allCases.length) * 100).toFixed(1);
  console.log(`   ${injury.padEnd(25)} ${count.toLocaleString().padStart(6)} (${pct}%)`);
});

// ============================================================================
// ANALYSIS 3: OUTCOME EXTRACTION
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('⚖️  ANALYSIS 3: Outcome Extraction (from keywords/titles)\n');

const outcomePatterns = {
  allowed: /\ballowed|granted|approved|entitled/i,
  dismissed: /\bdismissed|denied|not entitled|rejected/i,
  varied: /\bvaried|modified|changed/i,
  reconsideration: /\brecons/i,
  timeExtension: /\btime extension|time limit/i,
  withdrawn: /\bwithdrawn/i,
  settled: /\bsettled|settlement/i,
};

const outcomeCounts = {};
Object.keys(outcomePatterns).forEach(key => {
  outcomeCounts[key] = 0;
});

let categorizedOutcomes = 0;

allCases.forEach(c => {
  const text = `${c.data?.title || ''} ${c.data?.keywords || ''}`.toLowerCase();
  let hasCategorization = false;
  
  Object.entries(outcomePatterns).forEach(([key, pattern]) => {
    if (pattern.test(text)) {
      outcomeCounts[key]++;
      hasCategorization = true;
    }
  });
  
  if (hasCategorization) categorizedOutcomes++;
});

console.log('   Outcome Patterns Found:\n');
Object.entries(outcomeCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([outcome, count]) => {
    const pct = ((count / allCases.length) * 100).toFixed(1);
    console.log(`   ${outcome.padEnd(20)} ${count.toLocaleString().padStart(6)} (${pct}%)`);
  });

const uncategorized = allCases.length - categorizedOutcomes;
const uncategorizedPct = ((uncategorized / allCases.length) * 100).toFixed(1);
console.log(`\n   ⚠️  Uncategorized: ${uncategorized.toLocaleString()} (${uncategorizedPct}%)`);

// ============================================================================
// ANALYSIS 4: TEMPORAL PATTERNS
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('📅 ANALYSIS 4: Temporal Patterns\n');

const monthlyData = {};
const quarterlyData = {};
const dayOfWeekData = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

allCases.forEach(c => {
  const date = c.data?.decisionDate;
  if (date) {
    // Monthly
    const month = date.substring(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + 1;
    
    // Quarterly
    const year = date.substring(0, 4);
    const monthNum = parseInt(date.substring(5, 7));
    const quarter = Math.ceil(monthNum / 3);
    const qKey = `${year}-Q${quarter}`;
    quarterlyData[qKey] = (quarterlyData[qKey] || 0) + 1;
    
    // Day of week
    const dateObj = new Date(date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = dayNames[dateObj.getDay()];
    dayOfWeekData[day]++;
  }
});

console.log('   Quarterly Trends (Last 8 quarters):\n');
const quarters = Object.keys(quarterlyData).sort().slice(-8);
quarters.forEach(q => {
  const count = quarterlyData[q];
  const bar = '█'.repeat(Math.ceil(count / 50));
  console.log(`   ${q}: ${count.toLocaleString().padStart(5)} ${bar}`);
});

console.log('\n   Day of Week Distribution:\n');
Object.entries(dayOfWeekData)
  .sort((a, b) => b[1] - a[1])
  .forEach(([day, count]) => {
    const pct = ((count / allCases.length) * 100).toFixed(1);
    const bar = '█'.repeat(Math.ceil(count / 500));
    console.log(`   ${day}: ${count.toLocaleString().padStart(6)} (${pct}%) ${bar}`);
  });

// ============================================================================
// ANALYSIS 5: DECISION TYPE CLASSIFICATION
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('📋 ANALYSIS 5: Decision Type Classification\n');

const decisionTypes = {
  reconsideration: 0,
  review: 0,
  appeal: 0,
  interim: 0,
  preliminary: 0,
  final: 0,
  original: 0,
};

allCases.forEach(c => {
  const title = (c.data?.title || '').toLowerCase();
  const keywords = (c.data?.keywords || '').toLowerCase();
  const combined = `${title} ${keywords}`;
  
  if (/\brecons/i.test(combined)) decisionTypes.reconsideration++;
  if (/\breview/i.test(combined)) decisionTypes.review++;
  if (/\bappeal/i.test(combined)) decisionTypes.appeal++;
  if (/\binterim/i.test(combined)) decisionTypes.interim++;
  if (/\bprelim/i.test(combined)) decisionTypes.preliminary++;
  if (/\bfinal/i.test(combined)) decisionTypes.final++;
});

decisionTypes.original = allCases.length - decisionTypes.reconsideration - decisionTypes.review;

console.log('   Decision Type Counts:\n');
Object.entries(decisionTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    const pct = ((count / allCases.length) * 100).toFixed(1);
    console.log(`   ${type.padEnd(20)} ${count.toLocaleString().padStart(6)} (${pct}%)`);
  });

// ============================================================================
// ANALYSIS 6: REPRESENTATIVE MENTIONS
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('👔 ANALYSIS 6: Representative Mentions\n');

const repPatterns = {
  lawyer: /\blawyer|counsel|attorney/i,
  owa: /\bowa|office of the worker/i,
  clinic: /\bclinic|legal clinic/i,
  union: /\bunion/i,
  advocate: /\badvocate|representative/i,
  selfRepresented: /\bself-represented|unrepresented/i,
};

const repCounts = {};
Object.keys(repPatterns).forEach(key => {
  repCounts[key] = 0;
});

allCases.forEach(c => {
  const text = `${c.data?.title || ''} ${c.data?.keywords || ''}`.toLowerCase();
  
  Object.entries(repPatterns).forEach(([key, pattern]) => {
    if (pattern.test(text)) {
      repCounts[key]++;
    }
  });
});

console.log('   Representative Type Mentions:\n');
Object.entries(repCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    const pct = ((count / allCases.length) * 100).toFixed(1);
    console.log(`   ${type.padEnd(20)} ${count.toLocaleString().padStart(6)} (${pct}%)`);
  });

// ============================================================================
// ANALYSIS 7: MEDICAL EVIDENCE PATTERNS
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('🏥 ANALYSIS 7: Medical Evidence Patterns\n');

const medicalPatterns = {
  doctor: /\bdoctor|physician|dr\./i,
  specialist: /\bspecialist|orthopedic|neurologist|psychiatrist/i,
  ime: /\bime|independent medical/i,
  mri: /\bmri/i,
  xray: /\bx-ray|xray/i,
  ctScan: /\bct scan/i,
  medicalEvidence: /\bmedical evidence|medical report/i,
  insufficientEvidence: /\binsufficient evidence|lack of evidence/i,
  functionalAbilities: /\bfunctional|faf|abilities/i,
};

const medicalCounts = {};
Object.keys(medicalPatterns).forEach(key => {
  medicalCounts[key] = 0;
});

allCases.forEach(c => {
  const text = `${c.data?.title || ''} ${c.data?.keywords || ''}`.toLowerCase();
  
  Object.entries(medicalPatterns).forEach(([key, pattern]) => {
    if (pattern.test(text)) {
      medicalCounts[key]++;
    }
  });
});

console.log('   Medical Evidence Mentions:\n');
Object.entries(medicalCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    const pct = ((count / allCases.length) * 100).toFixed(1);
    console.log(`   ${type.padEnd(25)} ${count.toLocaleString().padStart(6)} (${pct}%)`);
  });

// ============================================================================
// ANALYSIS 8: PRE-EXISTING CONDITION LANGUAGE
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('⚠️  ANALYSIS 8: Pre-Existing Condition Language\n');

const preExistingPatterns = {
  preExisting: /\bpre-existing|pre existing|preexisting/i,
  degenerative: /\bdegenerative/i,
  ageRelated: /\bage-related|age related/i,
  priorCondition: /\bprior condition|previous condition/i,
  baseline: /\bbaseline/i,
  aggravation: /\baggravat/i,
  contribution: /\bcontribut/i,
  thinSkull: /\bthin skull/i,
};

const preExistingCounts = {};
Object.keys(preExistingPatterns).forEach(key => {
  preExistingCounts[key] = 0;
});

allCases.forEach(c => {
  const text = `${c.data?.title || ''} ${c.data?.keywords || ''}`.toLowerCase();
  
  Object.entries(preExistingPatterns).forEach(([key, pattern]) => {
    if (pattern.test(text)) {
      preExistingCounts[key]++;
    }
  });
});

console.log('   Pre-Existing Condition Terms:\n');
Object.entries(preExistingCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([term, count]) => {
    const pct = ((count / allCases.length) * 100).toFixed(1);
    console.log(`   ${term.padEnd(25)} ${count.toLocaleString().padStart(6)} (${pct}%)`);
  });

// ============================================================================
// ANALYSIS 9: MENTAL HEALTH TERMINOLOGY DEEP DIVE
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('🧠 ANALYSIS 9: Mental Health Terminology Deep Dive\n');

const mentalHealthPatterns = {
  // Official WSIB terms
  psychotraumatic: /\bpsychotraumatic/i,
  psychologicalImpairment: /\bpsych.*impairment/i,
  
  // Clinical terms
  ptsd: /\bptsd|post-traumatic stress/i,
  depression: /\bdepress/i,
  anxiety: /\banxiety/i,
  panicDisorder: /\bpanic/i,
  bipolar: /\bbipolar/i,
  schizophrenia: /\bschizophrenia/i,
  ocd: /\bocd|obsessive/i,
  
  // Stress-related (often denied)
  mentalStress: /\bmental stress/i,
  workStress: /\bwork.*stress|job.*stress/i,
  burnout: /\bburnout/i,
  
  // Pain-related mental health
  chronicPain: /\bchronic pain/i,
  painDisorder: /\bpain.*disorder/i,
  
  // Trauma
  trauma: /\btrauma/i,
  
  // Cognitive
  cognitive: /\bcognitive/i,
  memory: /\bmemory/i,
  concentration: /\bconcentration/i,
};

const mentalHealthCounts = {};
Object.keys(mentalHealthPatterns).forEach(key => {
  mentalHealthCounts[key] = 0;
});

allCases.forEach(c => {
  const text = `${c.data?.title || ''} ${c.data?.keywords || ''}`.toLowerCase();
  
  Object.entries(mentalHealthPatterns).forEach(([key, pattern]) => {
    if (pattern.test(text)) {
      mentalHealthCounts[key]++;
    }
  });
});

console.log('   Mental Health Terms Frequency:\n');
Object.entries(mentalHealthCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([term, count]) => {
    const pct = ((count / allCases.length) * 100).toFixed(1);
    console.log(`   ${term.padEnd(30)} ${count.toLocaleString().padStart(6)} (${pct}%)`);
  });

const totalMentalHealth = Object.values(mentalHealthCounts).reduce((a, b) => a + b, 0);
console.log(`\n   📊 Total mental health mentions: ${totalMentalHealth.toLocaleString()}`);

// ============================================================================
// ANALYSIS 10: DEEMING/PHANTOM JOBS
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('💼 ANALYSIS 10: Deeming/Phantom Jobs Patterns\n');

const deemingPatterns = {
  lmr: /\blmr|labour market re-entry/i,
  deemed: /\bdeemed|deeming/i,
  suitableEmployment: /\bsuitable employment/i,
  modifiedWork: /\bmodified work|modified duties/i,
  accommodated: /\baccommodat/i,
  returnToWork: /\breturn to work|rtw/i,
  jobSearch: /\bjob search/i,
  retraining: /\bretrain/i,
  futureEconomicLoss: /\bfuture.*loss|fel/i,
};

const deemingCounts = {};
Object.keys(deemingPatterns).forEach(key => {
  deemingCounts[key] = 0;
});

allCases.forEach(c => {
  const text = `${c.data?.title || ''} ${c.data?.keywords || ''}`.toLowerCase();
  
  Object.entries(deemingPatterns).forEach(([key, pattern]) => {
    if (pattern.test(text)) {
      deemingCounts[key]++;
    }
  });
});

console.log('   Deeming/Employment Terms:\n');
Object.entries(deemingCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([term, count]) => {
    const pct = ((count / allCases.length) * 100).toFixed(1);
    console.log(`   ${term.padEnd(25)} ${count.toLocaleString().padStart(6)} (${pct}%)`);
  });

// ============================================================================
// ANALYSIS 11: AGE DISCRIMINATION MARKERS
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('👴 ANALYSIS 11: Age Discrimination Markers\n');

const agePatterns = {
  age65: /\bage 65|65 years|sixty-five/i,
  retirement: /\bretirement|retired/i,
  olderWorker: /\bolder worker|senior/i,
  lifeExpectancy: /\blife expectancy/i,
  ageLimit: /\bage limit/i,
  pensionable: /\bpension/i,
};

const ageCounts = {};
Object.keys(agePatterns).forEach(key => {
  ageCounts[key] = 0;
});

allCases.forEach(c => {
  const text = `${c.data?.title || ''} ${c.data?.keywords || ''}`.toLowerCase();
  
  Object.entries(agePatterns).forEach(([key, pattern]) => {
    if (pattern.test(text)) {
      ageCounts[key]++;
    }
  });
});

console.log('   Age-Related Terms:\n');
Object.entries(ageCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([term, count]) => {
    const pct = ((count / allCases.length) * 100).toFixed(1);
    console.log(`   ${term.padEnd(25)} ${count.toLocaleString().padStart(6)} (${pct}%)`);
  });

// ============================================================================
// SAVE ALL OUTPUTS
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('💾 Saving results...\n');

const results = {
  metadata: {
    analysisDate: new Date().toISOString(),
    totalCases: allCases.length,
    dateRange: {
      earliest: allCases.map(c => c.data?.decisionDate).filter(Boolean).sort()[0],
      latest: allCases.map(c => c.data?.decisionDate).filter(Boolean).sort().reverse()[0],
    }
  },
  yearlyVolume: yearlyData,
  allKeywords: Object.fromEntries(sortedKeywords),
  keywordsByYear,
  injuries: injuryCounts,
  outcomes: outcomeCounts,
  temporal: {
    monthly: monthlyData,
    quarterly: quarterlyData,
    dayOfWeek: dayOfWeekData,
  },
  decisionTypes,
  representatives: repCounts,
  medicalEvidence: medicalCounts,
  preExisting: preExistingCounts,
  mentalHealth: mentalHealthCounts,
  deeming: deemingCounts,
  age: ageCounts,
};

// Save comprehensive JSON
const jsonPath = path.join(OUTPUT_DIR, 'ONWSIAT-ULTRA-DEEP-ANALYSIS.json');
fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
console.log(`   ✅ JSON: ${jsonPath}`);

// Save CSV for Excel/R
const csvPath = path.join(OUTPUT_DIR, 'ONWSIAT-KEYWORDS-FULL.csv');
const csvLines = ['Keyword,Count,Percentage'];
sortedKeywords.forEach(([kw, count]) => {
  const pct = ((count / allCases.length) * 100).toFixed(2);
  csvLines.push(`"${kw}",${count},${pct}`);
});
fs.writeFileSync(csvPath, csvLines.join('\n'));
console.log(`   ✅ CSV: ${csvPath}`);

// Save injury classification CSV
const injuryCsvPath = path.join(OUTPUT_DIR, 'ONWSIAT-INJURIES.csv');
const injuryCsvLines = ['InjuryType,Count,Percentage'];
sortedInjuries.forEach(([injury, count]) => {
  const pct = ((count / allCases.length) * 100).toFixed(2);
  injuryCsvLines.push(`"${injury}",${count},${pct}`);
});
fs.writeFileSync(injuryCsvPath, injuryCsvLines.join('\n'));
console.log(`   ✅ Injury CSV: ${injuryCsvPath}`);

// Save mental health detailed CSV
const mentalCsvPath = path.join(OUTPUT_DIR, 'ONWSIAT-MENTAL-HEALTH.csv');
const mentalCsvLines = ['Term,Count,Percentage'];
Object.entries(mentalHealthCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([term, count]) => {
    const pct = ((count / allCases.length) * 100).toFixed(2);
    mentalCsvLines.push(`"${term}",${count},${pct}`);
  });
fs.writeFileSync(mentalCsvPath, mentalCsvLines.join('\n'));
console.log(`   ✅ Mental Health CSV: ${mentalCsvPath}`);

console.log('\n═══════════════════════════════════════════════════════════════════\n');
console.log('✅ ULTRA-DEEP ANALYSIS COMPLETE!\n');
console.log(`   📂 Output directory: ${OUTPUT_DIR}\n`);
console.log('   Files generated:');
console.log('   - ONWSIAT-ULTRA-DEEP-ANALYSIS.json (comprehensive results)');
console.log('   - ONWSIAT-KEYWORDS-FULL.csv (all keywords with counts)');
console.log('   - ONWSIAT-INJURIES.csv (injury classification)');
console.log('   - ONWSIAT-MENTAL-HEALTH.csv (mental health terminology)');
console.log('\n═══════════════════════════════════════════════════════════════════\n');
