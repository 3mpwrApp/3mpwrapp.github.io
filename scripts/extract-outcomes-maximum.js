#!/usr/bin/env node
/**
 * 🌟 MAXIMUM OUTCOME EXTRACTION - FINAL VERSION
 * 
 * Combines best patterns from advanced + ultra versions
 * Lower confidence threshold to maximize detection
 * Accepts lower-confidence matches to "extract all you can"
 * 
 * Strategy: Advanced patterns + Ultra patterns + Minimal filtering
 * Author: 3mpwrApp Research Team
 * Date: April 20, 2026
 */

const fs = require('fs');
const path = require('path');

const DATASETS = [
  {
    name: 'WSIAT 2000',
    input: path.join(__dirname, '../data/tribunal-decisions/detective-analysis/wsiat-top2000-recent.json'),
    output: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/wsiat-outcomes-maximum.json'),
    stats: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/wsiat-outcome-stats-maximum.json'),
  },
  {
    name: 'HRTO 2025 All',
    input: path.join(__dirname, '../data/tribunal-decisions/onhrt-2025-complete.json'),
    output: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/hrto-2025-outcomes-maximum.json'),
    stats: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/hrto-2025-outcome-stats-maximum.json'),
  }
];

// COMBINED WSIAT patterns (Advanced + Ultra + Additional)
const WSIAT_PATTERNS = {
  allowed: [
    // Explicit outcomes
    /\bappeal.{0,20}(?:is |was |be )?(?:allowed|granted|successful)\b/i,
    /\bappeal succeeds?\b/i,
    /\bmotion.{0,20}(?:allowed|granted)\b/i,
    
    // Benefits awarded
    /\bbenefits?.{0,50}(?:awarded|granted|payable|paid|restored|reinstated|continued|approved)\b/i,
    /\b(?:LOE|loss of earnings?).{0,50}(?:awarded|granted|payable|allowed|approved|paid)\b/i,
    /\b(?:NEL|non[- ]?economic loss).{0,50}(?:awarded|granted|increased|approved|payable)\b/i,
    /\b(?:FEL|future economic loss).{0,50}(?:awarded|granted)\b/i,
    /\bhealth ?care.{0,50}(?:approved|granted|covered|restored|continued)\b/i,
    /\brehabilitation.{0,50}(?:approved|granted|services awarded|continued)\b/i,
    /\btemporary.{0,30}benefits?.{0,30}(?:awarded|granted|continued)\b/i,
    /\bpermanent.{0,30}benefits?.{0,30}(?:awarded|granted)\b/i,
    /\bloss of earnings.{0,30}(?:awarded|granted|allowed)\b/i,
    /\bnon-economic loss.{0,30}(?:awarded|granted|allowed)\b/i,
    
    // Board decision overturned
    /\bboard'?s (?:decision|determination).{0,30}(?:overturned|reversed|set aside|quashed|rescinded|vacated)\b/i,
    /\b(?:overturns?|reverses?|sets? aside|quashes).{0,30}board'?s (?:decision|determination)\b/i,
    
    // Entitlement
    /\b(?:worker|appellant|claimant).{0,30}(?:is |was )?entitled to\b/i,
    /\bentitlement.{0,30}(?:established|confirmed|recognized|found)\b/i,
    /\b(?:entitled|entitlement) to.{0,50}benefits?\b/i,
    
    // Claim accepted
    /\bclaim.{0,30}(?:is |was )?(?:allowed|accepted|approved|recognized|confirmed)\b/i,
    /\binjury.{0,30}(?:is |was )?(?:accepted|compensable|work[- ]?related|recognized)\b/i,
    /\b(?:compensable|work[- ]?related).{0,30}(?:injury|condition|illness|disease)\b/i,
    /\barising out of.{0,30}employment\b/i,
    /\bcompensable\b/i,
    /\bwork-?related\b/i,
    
    // Favorable finding
    /\bin favo?ur of.{0,30}(?:worker|appellant|claimant)\b/i,
    /\b(?:worker|appellant|claimant).{0,20}(?:succeeds?|successful|prevails?)\b/i,
    /\bpanel.{0,30}(?:finds?|concludes?).{0,30}in favo?ur\b/i,
    
    // Relief/remedy granted
    /\brelief.{0,30}(?:granted|awarded|approved)\b/i,
    
    // Specific benefit types
    /\bfull LOE\b/i,
    /\bpartial LOE\b/i,
    /\brehabilitation services.{0,30}(?:awarded|granted)\b/i,
    
    // Additional implicit patterns
    /\brecognized.{0,30}claim\b/i,
    /\bworker.{0,30}(?:is |was )?successful\b/i,
    /\btribunal.{0,30}(?:grants?|awards?)\b/i,
    /\b(?:granted|awarded).{0,30}(?:to|for).{0,30}(?:worker|appellant)\b/i,
    /\b(?:accepts?|accepted).{0,30}(?:claim|injury|condition)\b/i,
    /\bfinds? in favo?ur\b/i,
  ],
  
  dismissed: [
    // Explicit
    /\bappeal.{0,20}(?:is |was |be )?(?:dismissed|denied|rejected|unsuccessful)\b/i,
    /\bappeal fails?\b/i,
    /\bmotion.{0,20}(?:dismissed|denied)\b/i,
    
    // Benefits denied
    /\bbenefits?.{0,50}(?:denied|terminated|discontinued|ended|suspended|not (?:awarded|granted|payable))\b/i,
    /\bLOE.{0,50}(?:denied|terminated|discontinued|not (?:awarded|granted))\b/i,
    /\bNEL.{0,50}(?:denied|not awarded|reduced to zero)\b/i,
    /\bhealth ?care.{0,50}(?:denied|not approved|not covered)\b/i,
    /\brehabilitation.{0,50}(?:denied|not approved)\b/i,
    
    // Board decision upheld
    /\bboard'?s (?:decision|determination).{0,30}(?:upheld|confirmed|affirmed|maintained|stands?)\b/i,
    /\b(?:upholds?|confirms?|affirms?|maintains?).{0,30}board'?s (?:decision|determination)\b/i,
    
    // Not entitled
    /\b(?:worker|appellant|claimant).{0,30}(?:is |was )?not entitled\b/i,
    /\bno entitlement.{0,30}(?:to|for)\b/i,
    /\bentitlement.{0,30}(?:denied|rejected|not established)\b/i,
    
    // Claim denied
    /\bclaim.{0,30}(?:is |was )?(?:denied|dismissed|rejected|not accepted)\b/i,
    /\binjury.{0,30}(?:is |was )?(?:not accepted|not compensable|not work[- ]?related)\b/i,
    /\bnot.{0,30}(?:compensable|work[- ]?related)\b/i,
    
    // Failure to establish
    /\b(?:failed|fails|unable).{0,30}to (?:establish|prove|demonstrate|show)\b/i,
    /\binsufficient evidence\b/i,
    /\bpreponderance.{0,30}evidence.{0,30}not (?:met|satisfied)\b/i,
    /\bbalance of probabilities.{0,30}not (?:met|satisfied)\b/i,
    
    // Pre-existing/exclusions
    /\bpre[- ]?existing.{0,30}(?:condition|injury|illness)\b/i,
    /\bdegenerative.{0,30}condition\b/i,
    /\bnot.{0,50}(?:caused|contributed) by.{0,30}employment\b/i,
    /\boutside.{0,30}(?:scope|course).{0,30}employment\b/i,
    /\bnon[- ]?work.{0,30}(?:related|cause)\b/i,
    /\bnot causally related\b/i,
    /\bno causal (?:connection|relationship)\b/i,
    
    // Jurisdiction
    /\blocks?.{0,20}jurisdiction\b/i,
    /\boutside.{0,30}tribunal'?s jurisdiction\b/i,
    
    // Additional dismissal patterns
    /\bin favo?ur of.{0,30}(?:board|employer|respondent)\b/i,
    /\bno reasonable prospect\b/i,
    /\binconclusive evidence\b/i,
    /\bworker.{0,30}(?:unsuccessful|failed)\b/i,
  ],
  
  varied: [
    /\bappeal.{0,20}allowed in part\b/i,
    /\bpartially.{0,20}(?:allowed|granted|successful)\b/i,
    /\bappeal.{0,20}(?:partially|in part)\b/i,
    /\bdecision.{0,20}varied\b/i,
    /\b(?:varied|varies|modifies?|modified|amends?|amended).{0,20}(?:board'?s )?decision\b/i,
    /\brecalculated?\b/i,
    /\brecalculation\b/i,
    /\bNEL.{0,50}(?:increased|decreased|adjusted|changed|varied|recalculated).{0,30}(?:from|to)\b/i,
    /\bLOE.{0,50}(?:increased|decreased|adjusted|recalculated|changed|varied).{0,30}(?:from|to)\b/i,
    /\brate.{0,30}(?:increased|decreased|adjusted|changed).{0,30}from.{0,30}\d/i,
    /\bpercentage.{0,30}(?:adjusted|changed|modified|varied)\b/i,
    /\bbenefits?.{0,30}(?:partially|some).{0,30}(?:awarded|granted)\b/i,
    /\bsome.{0,20}(?:relief|benefits) granted\b/i,
    /\b(?:increased|decreased|reduced).{0,30}from.{0,30}[\d$]/i,
    /\bboard'?s decision.{0,30}(?:amended|modified)\b/i,
    /\bsome benefits.{0,30}(?:awarded|granted)\b/i,
  ],
  
  settled: [
    /\b(?:parties|worker and board).{0,30}(?:agreed|agree)\b/i,
    /\b(?:consent|agreed).{0,20}order\b/i,
    /\bsettlement\b/i,
    /\bwithdrawn.{0,30}by consent\b/i,
    /\bresolved by agreement\b/i,
    /\bmediat(?:ed|ion)\b/i,
    /\bdispute resolution officer\b/i,
    /\bminutes of settlement\b/i,
    /\bproposed resolution.{0,30}(?:accepted|approved)\b/i,
  ],
  
  abandoned: [
    /\babandoned\b/i,
    /\bfailed to (?:attend|appear)\b/i,
    /\bnon[- ]?attendance\b/i,
    /\bdismissed for (?:delay|non[- ]?compliance|failure to)\b/i,
    /\bfailed to (?:comply|respond|prosecute)\b/i,
    /\bwithdrawn by.{0,20}(?:worker|appellant)\b/i,
  ],
  
  deferred: [
    /\badjourned\b/i,
    /\bdeferred\b/i,
    /\bpostponed\b/i,
    /\bheld in abeyance\b/i,
    /\binactive status\b/i,
    /\bpending.{0,30}(?:further|additional)\b/i,
  ],
};

// HRTO patterns (from ultra version)
const HRTO_PATTERNS = {
  allowed: [
    /\bapplication.{0,20}(?:allowed|granted|successful)\b/i,
    /\b(?:applicant|complainant).{0,20}(?:successful|succeeds?|prevails?)\b/i,
    /\bin favo?ur of.{0,20}applicant\b/i,
    /\b(?:found|finding of|establishes?).{0,30}discrimination\b/i,
    /\bcode.{0,20}(?:violated|breached|contravened)\b/i,
    /\bviolation of.{0,20}(?:the )?(?:code|human rights)\b/i,
    /\bprima facie case.{0,30}(?:established|made out|proven)\b/i,
    /\bproven.{0,20}discrimination\b/i,
    /\bremedies?.{0,30}(?:awarded|granted|ordered)\b/i,
    /\bdamages.{0,30}(?:awarded|granted)\b/i,
    /\b\$[\d,]+.{0,50}(?:awarded|ordered|granted)\b/i,
    /\bmonetary.{0,30}(?:award|order|compensation)\b/i,
    /\bpublic interest remedy\b/i,
    /\bcompensation.{0,30}(?:ordered|awarded)\b/i,
  ],
  
  dismissed: [
    /\bapplication.{0,20}(?:dismissed|denied)\b/i,
    /\bapplicant.{0,20}(?:failed|unable).{0,20}to (?:establish|prove)\b/i,
    /\bno prima facie case\b/i,
    /\bno.{0,30}discrimination.{0,30}(?:found|established|proven)\b/i,
    /\bfailed to.{0,30}(?:establish|prove|demonstrate).{0,30}discrimination\b/i,
    /\bno reasonable prospect\b/i,
    /\bin favo?ur of.{0,20}respondent\b/i,
    /\bno code violation\b/i,
    /\bbona fide.{0,30}(?:occupational requirement|qualification)\b/i,
    /\bundue hardship.{0,30}(?:established|proven|shown)\b/i,
  ],
  
  abandoned: [
    /\babandoned\b/i,
    /\bfailed to (?:attend|appear)\b/i,
    /\bemail.{0,50}undeliverable\b/i,
    /\bundeliverable\b/i,
    /\bfailed to (?:comply|respond)\b/i,
    /\bmissed.{0,30}deadline\b/i,
    /\btime limit.{0,30}expired\b/i,
    /\bwithdrawn by.{0,20}applicant\b/i,
  ],
  
  settled: [
    /\bminutes of settlement\b/i,
    /\b(?:consent|agreed).{0,20}order\b/i,
    /\bsettlement\b/i,
    /\bresolved by agreement\b/i,
    /\bmediat(?:ed|ion)\b/i,
  ],
  
  reconsideration: [
    /\breconsideration\b/i,
    /\bmotion to reconsider\b/i,
  ],
  
  deferred: [
    /\badjourned\b/i,
    /\bdeferred\b/i,
    /\bpostponed\b/i,
    /\bpending\b/i,
  ],
};

const OUTCOME_CONFIDENCE = {
  allowed: { weight: 1.0, category: 'victory' },
  dismissed: { weight: 1.0, category: 'loss' },
  varied: { weight: 0.9, category: 'partial' },
  settled: { weight: 1.0, category: 'negotiated' },
  abandoned: { weight: 1.0, category: 'procedural' },
  deferred: { weight: 0.6, category: 'procedural' },
  reconsideration: { weight: 0.5, category: 'procedural' },
};

function selectPatterns(datasetName) {
  if (datasetName.includes('WSIAT') || datasetName.includes('wsiat')) {
    return WSIAT_PATTERNS;
  } else {
    return HRTO_PATTERNS;
  }
}

function extractOutcome(keywords, datasetName) {
  if (!keywords) return { outcome: null, confidence: 0, method: 'none' };
  
  let text = '';
  if (Array.isArray(keywords)) {
    text = keywords.join(' ');
  } else if (typeof keywords === 'string') {
    text = keywords;
  } else {
    return { outcome: null, confidence: 0, method: 'none' };
  }
  
  const patterns = selectPatterns(datasetName);
  const matches = {};
  const matchDetails = [];
  
  for (const [outcome, regexList] of Object.entries(patterns)) {
    for (const pattern of regexList) {
      const match = text.match(pattern);
      if (match) {
        if (!matches[outcome]) matches[outcome] = 0;
        matches[outcome]++;
        matchDetails.push({
          outcome,
          matched_text: match[0],
          position: match.index
        });
      }
    }
  }
  
  if (Object.keys(matches).length === 0) {
    return { outcome: null, confidence: 0, method: 'none', matchDetails };
  }
  
  const scores = {};
  for (const [outcome, count] of Object.entries(matches)) {
    const weight = OUTCOME_CONFIDENCE[outcome]?.weight || 0.5;
    scores[outcome] = count * weight;
  }
  
  const sortedOutcomes = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primaryOutcome = sortedOutcomes[0][0];
  const primaryScore = sortedOutcomes[0][1];
  
  // MAXIMUM extraction: Lower threshold (divide by 2.5 instead of 3)
  let confidence = Math.min(100, Math.round((primaryScore / 2.5) * 100));
  
  // Less aggressive penalization for competing outcomes
  if (sortedOutcomes.length > 1) {
    const secondScore = sortedOutcomes[1][1];
    if (secondScore > primaryScore * 0.7) {  // Higher threshold
      confidence = Math.round(confidence * 0.7);
    }
  }
  
  return {
    outcome: primaryOutcome,
    confidence,
    category: OUTCOME_CONFIDENCE[primaryOutcome]?.category || 'unknown',
    method: confidence >= 50 ? 'high-confidence' : 'pattern-match',
    scores,
    matchCount: matches[primaryOutcome],
    totalMatches: Object.values(matches).reduce((a, b) => a + b, 0),
    topMatches: matchDetails.filter(m => m.outcome === primaryOutcome).slice(0, 3)
  };
}

async function processDataset(config) {
  console.log('\n' + '='.repeat(80));
  console.log(`🌟 MAXIMUM EXTRACTION: ${config.name}`);
  console.log(')'.repeat(80));
  
  if (!fs.existsSync(config.input)) {
    console.log(`⚠️  File not found: ${config.input}`);
    return null;
  }
  
  const cases = JSON.parse(fs.readFileSync(config.input, 'utf8'));
  console.log(`✅ Loaded ${cases.length} cases`);
  
  const enriched = [];
  const stats = {
    dataset: config.name,
    total_cases: cases.length,
    with_outcomes: 0,
    by_outcome: {},
    by_category: {},
    by_confidence_range: {
      'very-high (80-100%)': 0,
      'high (60-79%)': 0,
      'medium (40-59%)': 0,
      'low (20-39%)': 0,
      'very-low (1-19%)': 0,
      'none (0%)': 0
    },
    average_confidence: 0
  };
  
  let confidenceSum = 0;
  
  for (let i = 0; i < cases.length; i++) {
    const caseData = cases[i];
    const keywords = caseData.keywords || '';
    const result = extractOutcome(keywords, config.name);
    
    enriched.push({
      ...caseData,
      outcome_maximum: result
    });
    
    if (result.outcome) {
      stats.with_outcomes++;
      
      if (!stats.by_outcome[result.outcome]) stats.by_outcome[result.outcome] = 0;
      stats.by_outcome[result.outcome]++;
      
      if (!stats.by_category[result.category]) stats.by_category[result.category] = 0;
      stats.by_category[result.category]++;
      
      confidenceSum += result.confidence;
      
      if (result.confidence >= 80) stats.by_confidence_range['very-high (80-100%)']++;
      else if (result.confidence >= 60) stats.by_confidence_range['high (60-79%)']++;
      else if (result.confidence >= 40) stats.by_confidence_range['medium (40-59%)']++;
      else if (result.confidence >= 20) stats.by_confidence_range['low (20-39%)']++;
      else stats.by_confidence_range['very-low (1-19%)']++;
    } else {
      stats.by_confidence_range['none (0%)']++;
    }
    
    if ((i + 1) % 500 === 0) {
      console.log(`  Processed ${i + 1}/${cases.length}...`);
    }
  }
  
  stats.average_confidence = stats.with_outcomes > 0 
    ? Math.round(confidenceSum / stats.with_outcomes) 
    : 0;
  
  fs.writeFileSync(config.output, JSON.stringify(enriched, null, 2));
  fs.writeFileSync(config.stats, JSON.stringify(stats, null, 2));
  
  const outcomeRate = (stats.with_outcomes / stats.total_cases * 100).toFixed(1);
  const obscurity = (100 - outcomeRate).toFixed(1);
  
  console.log('\n📊 MAXIMUM EXTRACTION SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total cases: ${stats.total_cases}`);
  console.log(`Outcomes detected: ${stats.with_outcomes} (${outcomeRate}%)`);
  console.log(`Obscurity gap: ${obscurity}%`);
  console.log(`Average confidence: ${stats.average_confidence}%`);
  console.log('');
  console.log('📋 OUTCOME BREAKDOWN:');
  for (const [outcome, count] of Object.entries(stats.by_outcome).sort((a, b) => b[1] - a[1])) {
    const pct = (count / stats.with_outcomes * 100).toFixed(1);
    console.log(`  - ${outcome}: ${count} (${pct}%)`);
  }
  console.log('');
  console.log('🎯 BY CONFIDENCE RANGE:');
  for (const [range, count] of Object.entries(stats.by_confidence_range)) {
    if (count > 0) {
      const pct = (count / stats.total_cases * 100).toFixed(1);
      console.log(`  - ${range}: ${count} (${pct}%)`);
    }
  }
  
  return stats;
}

async function main() {
  console.log('█'.repeat(80));
  console.log('🌟 MAXIMUM OUTCOME EXTRACTION');
  console.log('"Extract all you can" - Combined Advanced + Ultra patterns, lowest threshold');
  console.log('█'.repeat(80));
  
  const allStats = [];
  
  for (const dataset of DATASETS) {
    if (fs.existsSync(dataset.input)) {
      const stats = await processDataset(dataset);
      if (stats) allStats.push(stats);
    }
  }
  
  console.log('\n' + '█'.repeat(80));
  console.log('✅ MAXIMUM EXTRACTION COMPLETE');
  console.log('█'.repeat(80));
  
  for (const stats of allStats) {
    const outcomeRate = (stats.with_outcomes / stats.total_cases * 100).toFixed(1);
    const obscurity = (100 - outcomeRate).toFixed(1);
    const improvement = (91.8 - parseFloat(obscurity)).toFixed(1);
    console.log(`\n${stats.dataset}:`);
    console.log(`  - Outcomes: ${stats.with_outcomes}/${stats.total_cases} (${outcomeRate}%)`);
    console.log(`  - Obscurity: ${obscurity}% (was 91.8%)`);
    console.log(`  - Gap reduction: ${improvement > 0 ? '+' : ''}${improvement} percentage points`);
    console.log(`  - Confidence: ${stats.average_confidence}%`);
  }
}

main().catch(console.error);
#!/usr/bin/env node
/**
 * MAXIMUM Outcome Extraction from Existing Data
 * 
 * Extracts outcomes from ALL available metadata fields:
 * - Keywords (primary)
 * - Titles
 * - Citation patterns
 * - Docket patterns
 * - Any text in snippet
 * 
 * NO API CALLS - uses only what we already have
 * 
 * Author: 3mpwrApp
 * Date: April 5, 2026
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, "../data/tribunal-decisions");

// ===== AGGRESSIVE EXTRACTION =====

function extractOutcomeAggressive(decision) {
  // Check all text fields
  const allText = [
    decision.title || "",
    decision.snippet || "",
    decision.case_id || ""
  ].join(" ").toLowerCase();
  
  // Extract keywords from snippet JSON
  let keywords = "";
  try {
    const snippetMatch = decision.snippet.match(/"keywords"\s*:\s*"([^"]+)"/);
    if (snippetMatch) {
      keywords = snippetMatch[1].toLowerCase();
    }
  } catch (e) {}
  
  const combined = (keywords + " " + allText).toLowerCase();
  
  // VERY STRONG patterns (near certainty)
  if (/\bappeal\s+(?:is\s+)?(?:hereby\s+)?allowed\b/.test(combined)) return "Allowed";
  if (/\bappeal\s+(?:is\s+)?(?:hereby\s+)?dismissed\b/.test(combined)) return "Dismissed";
  if (/\bappeal\s+(?:is\s+)?(?:hereby\s+)?denied\b/.test(combined)) return "Denied";
  if (/\bdecision\s+(?:is\s+)?allowed\b/.test(combined)) return "Allowed";
  if (/\bdecision\s+(?:is\s+)?dismissed\b/.test(combined)) return "Dismissed";
  
  // STRONG patterns (high confidence)
  if (/\ballowed\b.*\bappeal\b/.test(combined)) return "Allowed";
  if (/\bdismissed\b.*\bappeal\b/.test(combined)) return "Dismissed";
  if (/\bdenied\b.*\bappeal\b/.test(combined)) return "Denied";
  
  // Entitlement patterns (medium-high confidence)
  if (/\bentitled\s+to\b/.test(keywords)) return "Allowed";
  if (/\bentitlement\s+(?:is\s+)?granted\b/.test(keywords)) return "Allowed";
  if (/\bentitlement\s+for\b/.test(keywords)) return "Allowed"; // More aggressive
  if (/\bgranted\b/.test(keywords)) return "Allowed";
  if (/\bapproved\b/.test(keywords)) return "Allowed";
  
  // Negative entitlement patterns
  if (/\bnot\s+entitled\b/.test(keywords)) return "Dismissed";
  if (/\bno\s+entitlement\b/.test(keywords)) return "Dismissed";
  if (/\bentitlement\s+(?:is\s+)?denied\b/.test(keywords)) return "Dismissed";
  if (/\brejected\b/.test(keywords)) return "Dismissed";
  if (/\brefused\b/.test(keywords)) return "Dismissed";
  
  // Variation patterns
  if (/\bvaried\b/.test(combined)) return "Varied";
  if (/\bvariation\b/.test(combined)) return "Varied";
  
  // Remand patterns
  if (/\bremand(?:ed)?\b/.test(combined)) return "Remanded";
  if (/\bset\s+aside\b/.test(combined)) return "Remanded";
  if (/\breferred\s+back\b/.test(combined)) return "Remanded";
  
  // Benefit continuation patterns (likely allowed)
  if (/\bcontinued\b.*\bbenefits?\b/.test(keywords)) return "Allowed";
  if (/\bbenefits?\b.*\bcontinued\b/.test(keywords)) return "Allowed";
  
  // Worker-specific patterns (context clues)
  if (/\bworker\b.*\bentitled\b/.test(keywords)) return "Allowed";
  
  return "Unknown";
}

function extractConditionAggressive(decision) {
  const allText = [
    decision.title || "",
    decision.snippet || "",
  ].join(" ").toLowerCase();
  
  let keywords = "";
  try {
    const snippetMatch = decision.snippet.match(/"keywords"\s*:\s*"([^"]+)"/);
    if (snippetMatch) {
      keywords = snippetMatch[1].toLowerCase();
    }
  } catch (e) {}
  
  const combined = (keywords + " " + allText).toLowerCase();
  
  const conditions = [
    // Mental health
    "fibromyalgia", "chronic pain syndrome", "chronic pain", "chronic fatigue syndrome", "chronic fatigue",
    "ptsd", "post-traumatic stress disorder", "post-traumatic stress",
    "depression", "major depressive disorder", "depressive disorder",
    "anxiety disorder", "anxiety", "generalized anxiety",
    "panic disorder", "panic attacks",
    "bipolar", "schizophrenia",
    "mental health", "psychological", "psychiatric",
    
    // Physical injuries
    "back injury", "low back pain", "lower back", "lumbar", "spine", "spinal injury",
    "herniated disc", "disc herniation", "bulging disc", "disc bulge", "disc protrusion", "disc",
    "neck injury", "cervical", "whiplash", "neck",
    "shoulder injury", "rotator cuff tear", "rotator cuff", "shoulder",
    "knee injury", "meniscus tear", "acl tear", "meniscus", "knee",
    "hip injury", "hip replacement", "hip",
    "wrist injury", "carpal tunnel syndrome", "carpal tunnel", "wrist",
    "ankle injury", "ankle sprain", "ankle",
    "hand injury", "finger injury", "hand",
    "elbow injury", "tennis elbow", "elbow",
    "foot injury", "plantar fasciitis", "foot",
    
    // Soft tissue
    "strain", "sprain", "tear", "rupture",
    "tendinitis", "tendinosis", "tendon injury",
    "ligament tear", "ligament",
    "muscle tear", "muscle strain",
    
    // Arthritis
    "rheumatoid arthritis", "osteoarthritis", "arthritis",
    
    // Neurological
    "multiple sclerosis", "ms",
    "nerve damage", "neuropathy", "radiculopathy", "sciatica",
    "concussion", "traumatic brain injury", "tbi", "brain injury",
    "stroke", "seizure",
    
    // Respiratory
    "asthma", "copd", "lung disease",
    
    // Hearing/Vision
    "hearing loss", "tinnitus", "vision loss",
    
    // Other
    "impairment", "disability", "injury", "work injury",
    "occupational disease", "occupational injury"
  ];
  
  const found = [];
  for (const cond of conditions) {
    const regex = new RegExp(`\\b${cond.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(combined)) {
      found.push(cond);
    }
  }
  
  // Remove duplicates and sub-duplicates
  const unique = [...new Set(found)];
  return unique.length > 0 ? unique.slice(0, 5).join(", ") : "Unknown";
}

// ===== PROCESS FILES =====

async function processFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  
  // Skip backup files
  if (filename.includes('backup')) return;
  
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📄 Processing: ${filename}`);
  console.log("=".repeat(60));
  
  const rawData = fs.readFileSync(filePath, 'utf8');
  const decisions = JSON.parse(rawData);
  
  console.log(`Total decisions: ${decisions.length}`);
  
  const unknowns = decisions.filter(d => d.outcome === "Unknown");
  console.log(`Unknown outcomes: ${unknowns.length} (${(unknowns.length/decisions.length*100).toFixed(1)}%)`);
  
  if (unknowns.length === 0) {
    console.log("✅ No unknowns to process!");
    return;
  }
  
  console.log(`\n🔄 MAXIMUM AGGRESSION EXTRACTION...\n`);
  
  let updated = 0;
  let stillUnknown = 0;
  
  for (const decision of unknowns) {
    const newOutcome = extractOutcomeAggressive(decision);
    const newCondition = extractConditionAggressive(decision);
    
    // Update decision
    decision.outcome = newOutcome;
    if (newCondition !== "Unknown") {
      decision.condition = newCondition;
    }
    decision.extraction_version = "v4.1-aggressive-metadata";
    decision.extraction_date = new Date().toISOString().split('T')[0];
    
    if (newOutcome !== "Unknown") {
      updated++;
    } else {
      stillUnknown++;
    }
  }
  
  // Save backup
  const backupPath = filePath.replace('.json', '-v4backup.json');
  fs.writeFileSync(backupPath, rawData, 'utf8');
  console.log(`💾 Backup saved: ${path.basename(backupPath)}`);
  
  // Save updated
  fs.writeFileSync(filePath, JSON.stringify(decisions, null, 2), 'utf8');
  console.log(`💾 Updated file saved: ${filename}`);
  
  // Stats
  console.log(`\n📊 Results:`);
  console.log(`  ✅ Outcomes extracted: ${updated}`);
  console.log(`  ⚠️  Still unknown: ${stillUnknown}`);
  console.log(`  📈 Success rate: ${(updated/(updated+stillUnknown)*100).toFixed(1)}%`);
  
  // New distribution
  const outcomes = {};
  decisions.forEach(d => {
    outcomes[d.outcome] = (outcomes[d.outcome] || 0) + 1;
  });
  
  console.log(`\n📊 Updated Outcome Distribution:`);
  Object.entries(outcomes).sort((a, b) => b[1] - a[1]).forEach(([outcome, count]) => {
    const pct = (count/decisions.length*100).toFixed(1);
    console.log(`  ${outcome}: ${count} (${pct}%)`);
  });
  
  return { updated, stillUnknown, total: decisions.length };
}

async function main() {
  console.log("=".repeat(60));
  console.log("🔬 MAXIMUM Outcome Extractor v4.1");
  console.log("=".repeat(60));
  console.log("✅ ALL metadata fields analyzed");
  console.log("✅ Aggressive pattern matching");
  console.log("✅ Context-aware extraction");
  console.log();
  
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('-historical-20260404.json'))
    .filter(f => !f.includes('backup'))
    .filter(f => ['onwsiat', 'onca', 'onhrt'].some(prefix => f.startsWith(prefix)));
  
  console.log(`Found ${files.length} Ontario files to process:`);
  files.forEach(f => console.log(`  - ${f}`));
  
  let totalUpdated = 0;
  let totalUnknown = 0;
  let totalDecisions = 0;
  
  for (const file of files) {
    const result = await processFile(file);
    if (result) {
      totalUpdated += result.updated;
      totalUnknown += result.stillUnknown;
      totalDecisions += result.total;
    }
  }
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ MAXIMUM EXTRACTION COMPLETE!");
  console.log("=".repeat(60));
  console.log(`\n📊 OVERALL RESULTS:`);
  console.log(`  Total decisions: ${totalDecisions}`);
  console.log(`  ✅ Outcomes extracted: ${totalUpdated}`);
  console.log(`  ⚠️  Still unknown: ${totalUnknown}`);
  console.log(`  📈 Overall extraction: ${((totalDecisions - totalUnknown)/totalDecisions*100).toFixed(1)}%`);
  
  if (totalUnknown > 0) {
    console.log(`\n⚠️  REMAINING ${totalUnknown} UNKNOWNS REQUIRE:`);
    console.log(`  1. Full decision text from CanLII API (caseBrowse endpoint)`);
    console.log(`  2. API quota available (resets 8 PM ET / 5 PM PT)`);
    console.log(`  3. Run: node scripts/extract-outcomes-from-urls.js`);
    console.log(`  4. Estimated time: ~${Math.ceil(totalUnknown * 3 / 3600)} hours`);
  }
  
  console.log("\n🎯 Next Steps:");
  console.log("  1. Re-run pattern analysis: node scripts/analyze-patterns.js");
  console.log("  2. Tonight (8 PM ET): Scrape 19 provinces");
  console.log("  3. Tomorrow: Extract remaining unknowns with fresh API quota");
}

main().catch(console.error);
