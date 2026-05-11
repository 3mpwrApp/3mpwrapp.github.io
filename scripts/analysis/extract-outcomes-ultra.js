#!/usr/bin/env node
/**
 * 🔥 ULTRA-AGGRESSIVE OUTCOME EXTRACTION
 * 
 * Maximum extraction from keywords - every possible outcome indicator
 * Uses direct patterns + contextual inference + implicit signals
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 20, 2026
 */

const fs = require('fs');
const path = require('path');

const DATASETS = [
  {
    name: 'WSIAT 2000',
    input: path.join(__dirname, '../data/tribunal-decisions/detective-analysis/wsiat-top2000-recent.json'),
    output: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/wsiat-outcomes-ultra.json'),
    stats: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/wsiat-outcome-stats-ultra.json'),
  },
  {
    name: 'HRTO Abandoned 500',
    input: path.join(__dirname, '../data/tribunal-decisions/detective-analysis/hrto-abandoned-top500-recent.json'),
    output: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/hrto-abandoned-outcomes-ultra.json'),
    stats: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/hrto-abandoned-outcome-stats-ultra.json'),
  },
  {
    name: 'HRTO 2025 All',
    input: path.join(__dirname, '../data/tribunal-decisions/onhrt-2025-complete.json'),
    output: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/hrto-2025-outcomes-ultra.json'),
    stats: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/hrto-2025-outcome-stats-ultra.json'),
  }
];

// WSIAT-specific patterns (workplace injury compensation)
const WSIAT_PATTERNS = {
  allowed: [
    // Explicit
    /\bappeal.{0,20}(?:is |was |be )?(?:allowed|granted|successful)\b/i,
    /\bmotion.{0,20}(?:is |was |be )?(?:allowed|granted)\b/i,
    /\brequest.{0,20}(?:is |was |be )?(?:allowed|granted|approved)\b/i,
    
    // Benefits awarded (implicit allowed)
    /\bbenefits?.{0,50}(?:awarded|granted|payable|paid|restored|reinstated|continued)\b/i,
    /\b(?:LOE|loss of earnings?).{0,50}(?:awarded|granted|payable|allowed|approved|paid)\b/i,
    /\b(?:NEL|non[- ]?economic loss).{0,50}(?:awarded|granted|increased|approved)\b/i,
    /\b(?:FEL|future economic loss).{0,50}(?:awarded|granted|approved)\b/i,
    /\bhealth ?care.{0,50}(?:approved|granted|covered|restored)\b/i,
    /\brehabilitation.{0,50}(?:approved|granted|services awarded)\b/i,
    /\btemporary.{0,30}benefits?.{0,30}(?:awarded|granted|continued)\b/i,
    /\bpermanent.{0,30}benefits?.{0,30}(?:awarded|granted)\b/i,
    
    // Decision overturned (strong allowed signal)
    /\bboard'?s (?:decision|determination).{0,30}(?:overturned|reversed|set aside|quashed|rescinded|vacated)\b/i,
    /\b(?:overturns?|reverses?|sets? aside|quashes).{0,30}board'?s (?:decision|determination)\b/i,
    
    // Entitlement (strong allowed signal)
    /\b(?:worker|appellant|claimant).{0,30}(?:is |was )?entitled to\b/i,
    /\bentitlement.{0,30}(?:established|confirmed|recognized|found)\b/i,
    /\b(?:entitled|entitlement) to.{0,50}benefits?\b/i,
    
    // Claim/injury accepted
    /\bclaim.{0,30}(?:is |was )?(?:allowed|accepted|approved|recognized|confirmed)\b/i,
    /\binjury.{0,30}(?:is |was )?(?:accepted|compensable|work[- ]?related|recognized)\b/i,
    /\b(?:compensable|work[- ]?related).{0,30}(?:injury|condition|illness|disease)\b/i,
    /\barising out of.{0,30}employment\b/i,
    /\bcourse of employment\b/i,
    
    // Favorable determination
    /\bin favo?ur of.{0,30}(?:worker|appellant|claimant)\b/i,
    /\b(?:worker|appellant|claimant).{0,20}(?:succeeds?|successful|prevails?)\b/i,
    /\bpanel.{0,30}(?:finds?|concludes?).{0,30}in favo?ur\b/i,
    /\bdecision.{0,30}favo?urable to.{0,30}(?:worker|appellant)\b/i,
    
    // Relief granted
    /\brelief.{0,30}(?:granted|awarded|approved)\b/i,
    /\b(?:grants?|awards?).{0,30}relief\b/i,
    
    // Percentage/rate increases (usually allowed)
    /\bNEL.{0,30}(?:increased|raised|adjusted upward)\b/i,
    /\bimpairment.{0,30}(?:rating|percentage).{0,30}(?:increased|raised)\b/i,
    /\b(?:\d{1,3}%|\d{1,2} percent).{0,30}(?:NEL|impairment)\b/i,
  ],
  
  dismissed: [
    // Explicit
    /\bappeal.{0,20}(?:is |was |be )?(?:dismissed|denied|rejected|unsuccessful)\b/i,
    /\bmotion.{0,20}(?:is |was |be )?(?:dismissed|denied)\b/i,
    /\brequest.{0,20}(?:is |was |be )?(?:dismissed|denied|rejected)\b/i,
    
    // Benefits denied/terminated
    /\bbenefits?.{0,50}(?:denied|terminated|discontinued|ended|suspended|not (?:awarded|granted))\b/i,
    /\bLOE.{0,50}(?:denied|terminated|discontinued|not (?:awarded|granted))\b/i,
    /\bNEL.{0,50}(?:denied|not awarded|reduced to zero)\b/i,
    /\bhealth ?care.{0,50}(?:denied|not approved|not covered)\b/i,
    
    // Board decision upheld
    /\bboard'?s (?:decision|determination).{0,30}(?:upheld|confirmed|affirmed|maintained|stands?)\b/i,
    /\b(?:upholds?|confirms?|affirms?|maintains?).{0,30}board'?s (?:decision|determination)\b/i,
    
    // Not entitled
    /\b(?:worker|appellant|claimant).{0,30}(?:is |was )?not entitled\b/i,
    /\bno entitlement.{0,30}(?:to|for)\b/i,
    /\bent itlement.{0,30}(?:denied|rejected|not established)\b/i,
    
    // Claim denied
    /\bclaim.{0,30}(?:is |was )?(?:denied|dismissed|rejected|not accepted)\b/i,
    /\binjury.{0,30}(?:is |was )?(?:not accepted|not compensable|not work[- ]?related)\b/i,
    /\bnot.{0,30}(?:compensable|work[- ]?related)\b/i,
    
    // Failure to establish
    /\b(?:failed|fails|unable).{0,30}to (?:establish|prove|demonstrate|show)\b/i,
    /\binsufficient evidence\b/i,
    /\bpreponderance.{0,30}evidence.{0,30}not (?:met|satisfied)\b/i,
    /\bbalance of probabilities.{0,30}not (?:met|satisfied)\b/i,
    
    // Pre-existing/non-work-related
    /\bpre[- ]?existing.{0,30}(?:condition|injury|illness)\b/i,
    /\bdegenerative.{0,30}condition\b/i,
    /\bnot.{0,50}(?:caused|contributed) by.{0,30}employment\b/i,
    /\bnot.{0,30}arising out of employment\b/i,
    /\boutside.{0,30}(?:scope|course).{0,30}employment\b/i,
    /\bnon[- ]?work.{0,30}(?:related|cause)\b/i,
    
    // Jurisdiction declined
    /\blocks?.{0,20}jurisdiction\b/i,
    /\bjurisdiction.{0,30}(?:declined|absent|lacking)\b/i,
    /\boutside.{0,30}tribunal'?s jurisdiction\b/i,
    
    // In favor of Board/employer
    /\bin favo?ur of.{0,30}(?:board|employer|respondent)\b/i,
    /\bdecision.{0,30}favo?urable to.{0,30}board\b/i,
    
    // No reasonable prospect
    /\bno reasonable prospect\b/i,
    /\bno arguable case\b/i,
  ],
  
  varied: [
    /\bappeal.{0,20}allowed in part\b/i,
    /\bpartially.{0,20}(?:allowed|granted|successful)\b/i,
    /\bdecision.{0,20}varied\b/i,
    /\b(?:varied|modifies?|amends?).{0,20}(?:board'?s )?decision\b/i,
    /\brecalculated\b/i,
    /\bNEL.{0,50}(?:increased|decreased|adjusted|changed).{0,50}from\b/i,
    /\bLOE.{0,50}(?:increased|decreased|adjusted|recalculated).{0,50}(?:from|to)\b/i,
    /\brate.{0,30}(?:increased|decreased|adjusted|changed).{0,30}from.{0,30}\d/i,
    /\bpercentage.{0,30}(?:adjusted|changed|modified)\b/i,
    /\bbenefits?.{0,30}(?:partially|some).{0,30}(?:awarded|granted)\b/i,
    /\bsome.{0,20}relief granted\b/i,
    /\b(?:increased|decreased|reduced).{0,30}from.{0,30}\d/i,
  ],
  
  settled: [
    /\b(?:parties|worker and board).{0,30}(?:agreed|agree)\b/i,
    /\b(?:consent|agreed).{0,20}order\b/i,
    /\bsettlement\b/i,
    /\bwithdrawn.{0,30}by consent\b/i,
    /\bresolved by agreement\b/i,
    /\bmediat(?:ed|ion)\b/i,
    /\bdispute resolution officer\b/i,
    /\bearly intervention\b/i,
    /\bminutes of settlement\b/i,
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

// HRTO-specific patterns (human rights discrimination)
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
    /\bmental.{0,20}(?:distress|anguish).{0,30}(?:damages|award)\b/i,
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
    /\binsufficient evidence of discrimination\b/i,
    /\bbona fide.{0,30}(?:occupational requirement|qualification)\b/i,
    /\breasonable and.{0,20}(?:bona fide|justifiable)\b/i,
    /\bundue hardship.{0,30}(?:established|proven|shown)\b/i,
  ],
  
  abandoned: [
    /\babandoned\b/i,
    /\bapplication.{0,20}abandoned\b/i,
    /\bfailed to (?:attend|appear)\b/i,
    /\bnon[- ]?attendance\b/i,
    /\bemail.{0,50}undeliverable\b/i,
    /\bundeliverable\b/i,
    /\breturned.{0,30}undeliverable\b/i,
    /\bfailed to (?:comply|respond)\b/i,
    /\bmissed.{0,30}deadline\b/i,
    /\btime limit.{0,30}expired\b/i,
    /\bwithdrawn by.{0,20}applicant\b/i,
    /\bno response.{0,30}(?:from|by).{0,20}applicant\b/i,
  ],
  
  settled: [
    /\b(?:parties|applicant and respondent).{0,30}(?:agreed|agree)\b/i,
    /\bminutes of settlement\b/i,
    /\b(?:consent|agreed).{0,20}order\b/i,
    /\bsettlement\b/i,
    /\bresolved by agreement\b/i,
    /\bmediat(?:ed|ion).{0,30}(?:successful|resolved)\b/i,
    /\bwithdrawn.{0,50}settlement\b/i,
    /\bterms of settlement\b/i,
  ],
  
  reconsideration: [
    /\breconsideration\b/i,
    /\bmotion to reconsider\b/i,
    /\breview of decision\b/i,
  ],
  
  deferred: [
    /\badjourned\b/i,
    /\bdeferred\b/i,
    /\bpostponed\b/i,
    /\bheld in abeyance\b/i,
    /\bpending\b/i,
  ],
};

const OUTCOME_CONFIDENCE = {
  allowed: { weight: 1.0, category: 'victory' },
  dismissed: { weight: 1.0, category: 'loss' },
  varied: { weight: 0.9, category: 'partial' },
  settled: { weight: 1.0, category: 'negotiated' },
  abandoned: { weight: 1.0, category: 'procedural' },
  deferred: { weight: 0.7, category: 'procedural' },
  reconsideration: { weight: 0.6, category: 'procedural' },
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
  
  // Multi-pass extraction
  for (const [outcome, regexList] of Object.entries(patterns)) {
    for (const pattern of regexList) {
      const match = text.match(pattern);
      if (match) {
        if (!matches[outcome]) matches[outcome] = 0;
        matches[outcome]++;
        matchDetails.push({
          outcome,
          matched_text: match[0],
          position: match.index,
          context: text.substring(Math.max(0, match.index - 50), Math.min(text.length, match.index + match[0].length + 50))
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
  
  // More aggressive confidence calculation
  let confidence = Math.min(100, Math.round((primaryScore / 2) * 100)); // Lower threshold
  
  // Reduce confidence if competing outcomes
  if (sortedOutcomes.length > 1) {
    const secondScore = sortedOutcomes[1][1];
    if (secondScore > primaryScore * 0.6) {
      confidence = Math.round(confidence * 0.6);
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
    matchDetails: matchDetails.filter(m => m.outcome === primaryOutcome).slice(0, 3)
  };
}

async function processDataset(config) {
  console.log('\n' + '='.repeat(80));
  console.log(`🔥 ULTRA-EXTRACTION: ${config.name}`);
  console.log('='.repeat(80));
  
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
    by_method: { 'high-confidence': 0, 'pattern-match': 0, 'none': 0 },
    by_confidence: {
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
    const keywords = caseData.keywords_api || caseData.keywords || '';
    const result = extractOutcome(keywords, config.name);
    
    enriched.push({
      ...caseData,
      outcome_ultra: result
    });
    
    if (result.outcome) {
      stats.with_outcomes++;
      
      if (!stats.by_outcome[result.outcome]) stats.by_outcome[result.outcome] = 0;
      stats.by_outcome[result.outcome]++;
      
      if (!stats.by_category[result.category]) stats.by_category[result.category] = 0;
      stats.by_category[result.category]++;
      
      stats.by_method[result.method]++;
      confidenceSum += result.confidence;
      
      if (result.confidence >= 80) stats.by_confidence['very-high (80-100%)']++;
      else if (result.confidence >= 60) stats.by_confidence['high (60-79%)']++;
      else if (result.confidence >= 40) stats.by_confidence['medium (40-59%)']++;
      else if (result.confidence >= 20) stats.by_confidence['low (20-39%)']++;
      else stats.by_confidence['very-low (1-19%)']++;
    } else {
      stats.by_confidence['none (0%)']++;
      stats.by_method['none']++;
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
  
  console.log('\n📊 ULTRA-EXTRACTION SUMMARY');
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
  console.log('🎯 BY CONFIDENCE:');
  for (const [range, count] of Object.entries(stats.by_confidence)) {
    if (count > 0) {
      const pct = (count / stats.total_cases * 100).toFixed(1);
      console.log(`  - ${range}: ${count} (${pct}%)`);
    }
  }
  
  return stats;
}

async function main() {
  console.log('█'.repeat(80));
  console.log('🔥 ULTRA-AGGRESSIVE OUTCOME EXTRACTION');
  console.log('Maximum possible extraction from keywords');
  console.log('█'.repeat(80));
  
  const allStats = [];
  
  for (const dataset of DATASETS) {
    if (fs.existsSync(dataset.input)) {
      const stats = await processDataset(dataset);
      if (stats) allStats.push(stats);
    }
  }
  
  console.log('\n' + '█'.repeat(80));
  console.log('✅ ULTRA-EXTRACTION COMPLETE');
  console.log('█'.repeat(80));
  
  for (const stats of allStats) {
    const outcomeRate = (stats.with_outcomes / stats.total_cases * 100).toFixed(1);
    const obscurity = (100 - outcomeRate).toFixed(1);
    const improvement = (91.8 - parseFloat(obscurity)).toFixed(1);
    console.log(`\n${stats.dataset}:`);
    console.log(`  - Outcomes: ${stats.with_outcomes}/${stats.total_cases} (${outcomeRate}%)`);
    console.log(`  - Obscurity: ${obscurity}% (was 91.8%)`);
    console.log(`  - Improvement: ${improvement > 0 ? '+' : ''}${improvement} percentage points`);
    console.log(`  - Confidence: ${stats.average_confidence}%`);
  }
}

main().catch(console.error);
