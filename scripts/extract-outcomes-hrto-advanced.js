#!/usr/bin/env node
/**
 * 🎯 ADVANCED HRTO OUTCOME EXTRACTION
 * 
 * HRTO-specific pattern matching for discrimination/human rights cases
 * Different language than WSIB/WSIAT tribunal decisions
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 20, 2026
 */

const fs = require('fs');
const path = require('path');

const DATASETS = [
  {
    input: path.join(__dirname, '../data/tribunal-decisions/detective-analysis/hrto-abandoned-top500-recent.json'),
    output: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/hrto-abandoned-outcomes-advanced.json'),
    stats: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/hrto-abandoned-outcome-stats.json'),
    name: 'HRTO Abandoned (Top 500)'
  },
  {
    input: path.join(__dirname, '../data/tribunal-decisions/onhrt-2025-complete.json'),
    output: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/hrto-2025-outcomes-advanced.json'),
    stats: path.join(__dirname, '../data/tribunal-decisions/deep-analysis/hrto-2025-outcome-stats.json'),
    name: 'HRTO 2025 (All Cases)'
  }
];

// HRTO-specific outcome patterns (discrimination cases have different language)
const OUTCOME_PATTERNS = {
  allowed: [
    /\bapplication (?:is |was )?allowed\b/i,
    /\bapplication (?:is |was )?granted\b/i,
    /\bapplication succeeds?\b/i,
    /\bapplicant succeeds?\b/i,
    /\bapplicant (?:is |was )?successful\b/i,
    /\bin favour of (?:the )?applicant\b/i,
    /\bfound discrimination\b/i,
    /\bfinding of discrimination\b/i,
    /\bprima facie case (?:is |was )?established\b/i,
    /\bproven discrimination\b/i,
    /\bviolation of (?:the )?code\b/i,
    /\bcode (?:is |was )?violated\b/i,
    /\bremedy (?:is |was )?awarded\b/i,
    /\bremedy (?:is |was )?granted\b/i,
    /\bdamages (?:are |were )?awarded\b/i,
    /\bcompensation (?:is |was )?ordered\b/i,
    /\bmonetary (?:award|order|compensation)\b/i,
    /\bpublic interest remedy\b/i,
  ],
  
  dismissed: [
    /\bapplication (?:is |was )?dismissed\b/i,
    /\bapplication (?:is |was )?denied\b/i,
    /\bapplicant (?:has |had )?failed to (?:establish|prove)\b/i,
    /\bno prima facie case\b/i,
    /\bfailed to (?:establish|prove|demonstrate) discrimination\b/i,
    /\bno (?:reasonable )?prospect of success\b/i,
    /\bin favour of (?:the )?respondent\b/i,
    /\bno code violation\b/i,
    /\bno discrimination (?:found|established)\b/i,
    /\binsufficient evidence of discrimination\b/i,
    /\bbona fide (?:occupational )?(?:requirement|qualification)\b/i,
    /\breasonable and (?:bona fide|justifiable)\b/i,
    /\bundue hardship (?:established|proven)\b/i,
  ],
  
  abandoned: [
    /\babandoned\b/i,
    /\bapplication (?:is |was )?abandoned\b/i,
    /\bfailed to (?:attend|appear)\b/i,
    /\bnon-?attendance\b/i,
    /\bemail.{0,30}undeliverable\b/i,
    /\bundeliverable\b/i,
    /\breturned.{0,20}undeliverable\b/i,
    /\bfailed to comply\b/i,
    /\bfailed to respond\b/i,
    /\bno response (?:from|by) (?:the )?applicant\b/i,
    /\bmissed.{0,20}deadline\b/i,
    /\btime limit.{0,20}expired\b/i,
    /\bwithdrawn by (?:the )?applicant\b/i,
  ],
  
  settled: [
    /\bparties (?:have )?agreed\b/i,
    /\bsettlement\b/i,
    /\bminutes of settlement\b/i,
    /\bconsent order\b/i,
    /\bresolved by agreement\b/i,
    /\bmediated (?:resolution|settlement)\b/i,
    /\bmediation (?:was )?successful\b/i,
    /\bwithdrawn.{0,30}settlement\b/i,
    /\bterms of settlement\b/i,
  ],
  
  deferred: [
    /\badjourned\b/i,
    /\bdeferred\b/i,
    /\bpostponed\b/i,
    /\bheld in abeyance\b/i,
    /\bpending (?:further|additional)\b/i,
    /\bawaiting\b/i,
  ],
  
  reconsideration: [
    /\breconsideration\b/i,
    /\bmotion to reconsider\b/i,
    /\breview of decision\b/i,
  ],
  
  jurisdiction_declined: [
    /\blacks? jurisdiction\b/i,
    /\bjurisdiction (?:is |was )?declined\b/i,
    /\boutside.{0,20}tribunal'?s jurisdiction\b/i,
    /\bno jurisdiction to\b/i,
    /\bjurisdictional objection (?:is |was )?allowed\b/i,
  ],
  
  preliminary_granted: [
    /\bpreliminary (?:motion|issue) (?:is |was )?granted\b/i,
    /\bmotion to dismiss (?:is |was )?granted\b/i,
    /\bsummary dismissal granted\b/i,
    /\bstrike (?:the )?application\b/i,
  ],
  
  preliminary_dismissed: [
    /\bpreliminary (?:motion|issue) (?:is |was )?dismissed\b/i,
    /\bmotion to dismiss (?:is |was )?dismissed\b/i,
    /\bapplication proceeds?\b/i,
  ]
};

const OUTCOME_CONFIDENCE = {
  allowed: { weight: 1.0, category: 'applicant_victory' },
  dismissed: { weight: 1.0, category: 'respondent_victory' },
  abandoned: { weight: 1.0, category: 'procedural' },
  settled: { weight: 1.0, category: 'negotiated' },
  deferred: { weight: 0.8, category: 'procedural' },
  reconsideration: { weight: 0.7, category: 'procedural' },
  jurisdiction_declined: { weight: 0.9, category: 'respondent_victory' },
  preliminary_granted: { weight: 0.7, category: 'respondent_victory' },
  preliminary_dismissed: { weight: 0.6, category: 'case_continues' }
};

function extractOutcome(keywords) {
  if (!keywords) return { outcome: null, confidence: 0, matches: [], text_analyzed: '' };
  
  let text = '';
  if (Array.isArray(keywords)) {
    text = keywords.join(' ');
  } else if (typeof keywords === 'string') {
    text = keywords;
  } else {
    return { outcome: null, confidence: 0, matches: [], text_analyzed: '' };
  }
  
  const matches = {};
  const matchDetails = [];
  
  for (const [outcome, patterns] of Object.entries(OUTCOME_PATTERNS)) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        if (!matches[outcome]) matches[outcome] = 0;
        matches[outcome]++;
        matchDetails.push({
          outcome,
          pattern: pattern.source,
          matched_text: match[0],
          position: match.index
        });
      }
    }
  }
  
  if (Object.keys(matches).length === 0) {
    return { outcome: null, confidence: 0, matches: matchDetails, text_analyzed: text.substring(0, 200) };
  }
  
  const scores = {};
  for (const [outcome, count] of Object.entries(matches)) {
    const weight = OUTCOME_CONFIDENCE[outcome]?.weight || 0.5;
    scores[outcome] = count * weight;
  }
  
  const sortedOutcomes = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primaryOutcome = sortedOutcomes[0][0];
  const primaryScore = sortedOutcomes[0][1];
  
  let confidence = Math.min(1.0, primaryScore / 3);
  if (sortedOutcomes.length > 1) {
    const secondScore = sortedOutcomes[1][1];
    if (secondScore > primaryScore * 0.5) {
      confidence *= 0.7;
    }
  }
  
  return {
    outcome: primaryOutcome,
    confidence: Math.round(confidence * 100),
    category: OUTCOME_CONFIDENCE[primaryOutcome]?.category || 'unknown',
    scores,
    matches: matchDetails,
    text_analyzed: text.substring(0, 300)
  };
}

async function processDataset(config) {
  console.log('\n' + '='.repeat(80));
  console.log(`📊 PROCESSING: ${config.name}`);
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
    by_confidence: {
      'high (80-100%)': 0,
      'medium (50-79%)': 0,
      'low (1-49%)': 0,
      'none (0%)': 0
    },
    average_confidence: 0,
    sample_matches: []
  };
  
  let confidenceSum = 0;
  
  for (let i = 0; i < cases.length; i++) {
    const caseData = cases[i];
    const keywords = caseData.keywords_api || caseData.keywords || '';
    const result = extractOutcome(keywords);
    
    enriched.push({
      ...caseData,
      outcome_detection: result
    });
    
    if (result.outcome) {
      stats.with_outcomes++;
      
      if (!stats.by_outcome[result.outcome]) stats.by_outcome[result.outcome] = 0;
      stats.by_outcome[result.outcome]++;
      
      if (!stats.by_category[result.category]) stats.by_category[result.category] = 0;
      stats.by_category[result.category]++;
      
      confidenceSum += result.confidence;
      if (result.confidence >= 80) stats.by_confidence['high (80-100%)']++;
      else if (result.confidence >= 50) stats.by_confidence['medium (50-79%)']++;
      else stats.by_confidence['low (1-49%)']++;
      
      if (stats.sample_matches.length < 20) {
        stats.sample_matches.push({
          case_id: caseData.case_id,
          outcome: result.outcome,
          confidence: result.confidence,
          sample_text: result.text_analyzed
        });
      }
    } else {
      stats.by_confidence['none (0%)']++;
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
  
  console.log('\n📊 EXTRACTION SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total cases: ${stats.total_cases}`);
  console.log(`Cases with outcomes: ${stats.with_outcomes} (${(stats.with_outcomes/stats.total_cases*100).toFixed(1)}%)`);
  console.log(`Average confidence: ${stats.average_confidence}%`);
  console.log('');
  console.log('📋 OUTCOME BREAKDOWN:');
  for (const [outcome, count] of Object.entries(stats.by_outcome).sort((a, b) => b[1] - a[1])) {
    const pct = stats.with_outcomes > 0 ? (count / stats.with_outcomes * 100).toFixed(1) : 0;
    console.log(`  - ${outcome}: ${count} (${pct}%)`);
  }
  
  return stats;
}

async function main() {
  console.log('█'.repeat(80));
  console.log('🎯 ADVANCED HRTO OUTCOME EXTRACTION');
  console.log('Human Rights Tribunal discrimination case patterns');
  console.log('█'.repeat(80));
  
  const allStats = [];
  
  for (const dataset of DATASETS) {
    const stats = await processDataset(dataset);
    if (stats) allStats.push(stats);
  }
  
  console.log('\n' + '█'.repeat(80));
  console.log('✅ HRTO EXTRACTION COMPLETE');
  console.log('█'.repeat(80));
  
  for (const stats of allStats) {
    const outcomeRate = (stats.with_outcomes / stats.total_cases * 100).toFixed(1);
    const obscurity = (100 - outcomeRate).toFixed(1);
    console.log(`\n${stats.dataset}:`);
    console.log(`  - Outcomes detected: ${stats.with_outcomes}/${stats.total_cases} (${outcomeRate}%)`);
    console.log(`  - Obscurity gap: ${obscurity}%`);
    console.log(`  - Average confidence: ${stats.average_confidence}%`);
  }
}

main().catch(console.error);
