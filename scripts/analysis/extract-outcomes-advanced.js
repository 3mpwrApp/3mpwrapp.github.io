#!/usr/bin/env node
/**
 * 🎯 ADVANCED OUTCOME EXTRACTION
 * 
 * Problem: CanLII keywords contain decision summaries, but only 8.7% have explicit outcomes
 * Solution: Use sophisticated pattern matching to infer outcomes from keyword text
 * 
 * Strategy:
 * 1. Explicit outcome phrases ("allowed", "dismissed", "granted")
 * 2. Decision language ("the appeal is...", "the Board's decision is...")
 * 3. Relief granted ("benefits awarded", "LOE granted", "claim denied")
 * 4. Procedural outcomes ("motion granted", "jurisdiction declined")
 * 5. Settlement indicators ("parties agreed", "consent order")
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 20, 2026
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../data/tribunal-decisions/detective-analysis/wsiat-top2000-recent.json');
const OUTPUT_FILE = path.join(__dirname, '../data/tribunal-decisions/deep-analysis/wsiat-outcomes-advanced.json');
const STATS_FILE = path.join(__dirname, '../data/tribunal-decisions/deep-analysis/wsiat-outcome-stats.json');

// Enhanced outcome detection patterns
const OUTCOME_PATTERNS = {
  allowed: [
    // Explicit allowances
    /\bappeal (?:is |was )?allowed\b/i,
    /\bappeal (?:is |was )?granted\b/i,
    /\bappeal succeeds?\b/i,
    /\bmotion (?:is |was )?granted\b/i,
    /\bbenefits? (?:are |were )?awarded\b/i,
    /\bbenefits? (?:are |were )?granted\b/i,
    /\bbenefits? (?:shall|should) be (?:awarded|granted|paid)\b/i,
    /\bclaim (?:is |was )?allowed\b/i,
    /\bclaim (?:is |was )?accepted\b/i,
    /\bclaim (?:is |was )?recognized\b/i,
    /\bentitled to\b/i,
    /\bworker (?:is |was )?entitled\b/i,
    /\bLOE (?:is |was )?awarded\b/i,
    /\bNEL (?:is |was )?awarded\b/i,
    /\bLOE.{0,50}granted\b/i,
    /\bNEL.{0,50}granted\b/i,
    /\bloss of earnings.{0,30}(?:awarded|granted|allowed)\b/i,
    /\bnon-economic loss.{0,30}(?:awarded|granted|allowed)\b/i,
    /\bboard'?s decision (?:is |was )?overturned\b/i,
    /\bboard'?s decision (?:is |was )?reversed\b/i,
    /\bboard'?s decision (?:is |was )?varied\b/i,
    /\bboard'?s decision (?:is |was )?set aside\b/i,
    /\bin favour of (?:the )?worker\b/i,
    /\bworker succeeds?\b/i,
    /\bpanel (?:finds?|decides) in favour\b/i,
    /\bcompensable\b/i,
    /\bwork-?related\b/i,
    /\brelief granted\b/i,
    /\bdecision favourable to (?:the )?worker\b/i,
    /\bfull LOE\b/i,
    /\bpartial LOE\b/i,
    /\brehabilitation services.{0,30}(?:awarded|granted)\b/i,
    /\bhealthcare.{0,30}(?:coverage|approved|granted)\b/i,
  ],
  
  dismissed: [
    // Explicit dismissals
    /\bappeal (?:is |was )?dismissed\b/i,
    /\bappeal (?:is |was )?denied\b/i,
    /\bappeal fails?\b/i,
    /\bmotion (?:is |was )?dismissed\b/i,
    /\bmotion (?:is |was )?denied\b/i,
    /\bclaim (?:is |was )?denied\b/i,
    /\bclaim (?:is |was )?dismissed\b/i,
    /\bclaim (?:is |was )?rejected\b/i,
    /\bno reasonable prospect\b/i,
    /\bboard'?s decision (?:is |was )?upheld\b/i,
    /\bboard'?s decision (?:is |was )?confirmed\b/i,
    /\bboard'?s decision (?:is |was )?affirmed\b/i,
    /\bboard'?s decision (?:is |was )?maintained\b/i,
    /\bboard'?s decision stands?\b/i,
    /\bnot entitled to\b/i,
    /\bworker (?:is |was )?not entitled\b/i,
    /\bnot compensable\b/i,
    /\bnot work-?related\b/i,
    /\bfailed to (?:establish|prove|demonstrate)\b/i,
    /\binsufficient evidence\b/i,
    /\binconclusive evidence\b/i,
    /\blacks? jurisdiction\b/i,
    /\bjurisdiction (?:is |was )?declined\b/i,
    /\bjurisdiction (?:is |was )?absent\b/i,
    /\bin favour of (?:the )?board\b/i,
    /\bin favour of (?:the )?employer\b/i,
    /\bdecision favourable to (?:the )?(?:board|employer)\b/i,
    /\bpre-?existing condition\b/i,
    /\bnot causally related\b/i,
    /\bno causal (?:connection|relationship)\b/i,
    /\bnot arising out of employment\b/i,
    /\boutside (?:the )?scope of coverage\b/i,
  ],
  
  varied: [
    // Partial victories
    /\bappeal (?:is |was )?allowed in part\b/i,
    /\bpartially allowed\b/i,
    /\bpartially granted\b/i,
    /\bboard'?s decision (?:is |was )?varied\b/i,
    /\bboard'?s decision (?:is |was )?modified\b/i,
    /\bboard'?s decision (?:is |was )?amended\b/i,
    /\badjusted to\b/i,
    /\brecalculated\b/i,
    /\brecalculation\b/i,
    /\bincreased (?:from|to)\b/i,
    /\bdecreased (?:from|to)\b/i,
    /\breduced (?:from|to)\b/i,
    /\bchanged from .+ to\b/i,
    /\bsome relief granted\b/i,
    /\bsome benefits.{0,30}(?:awarded|granted)\b/i,
    /\bNEL.{0,30}(?:increased|decreased|adjusted|varied)\b/i,
    /\bLOE.{0,30}(?:increased|decreased|adjusted|varied|recalculated)\b/i,
    /\brate.{0,30}(?:increased|decreased|adjusted|changed)\b/i,
    /\bpercentage.{0,30}(?:increased|decreased|adjusted|changed)\b/i,
  ],
  
  settled: [
    // Settlement indicators
    /\bparties (?:have )?agreed\b/i,
    /\bconsent order\b/i,
    /\bsettlement\b/i,
    /\bwithdrawn by consent\b/i,
    /\bresolved by agreement\b/i,
    /\bmediated (?:resolution|settlement)\b/i,
    /\bdispute resolution officer\b/i,
    /\bearly intervention\b/i,
    /\bconsensus (?:reached|achieved)\b/i,
  ],
  
  abandoned: [
    // Abandonment indicators
    /\babandoned\b/i,
    /\bfailed to (?:attend|appear)\b/i,
    /\bnon-?attendance\b/i,
    /\bdismissed for (?:delay|non-compliance)\b/i,
    /\bfailed to comply\b/i,
    /\bfailed to respond\b/i,
    /\bno longer pursuing\b/i,
    /\bwithdrawn by (?:the )?worker\b/i,
  ],
  
  deferred: [
    // Deferred/Adjourned
    /\badjourned\b/i,
    /\bdeferred\b/i,
    /\bpostponed\b/i,
    /\bheld in abeyance\b/i,
    /\binactive status\b/i,
    /\bpending (?:further|additional)\b/i,
    /\bawaiting\b/i,
  ],
  
  jurisdiction_declined: [
    // Jurisdictional issues
    /\blacks? jurisdiction\b/i,
    /\bjurisdiction (?:is |was )?declined\b/i,
    /\boutside (?:the )?tribunal'?s jurisdiction\b/i,
    /\bno jurisdiction to\b/i,
    /\bjurisdictional objection (?:is |was )?allowed\b/i,
  ],
  
  preliminary_granted: [
    // Preliminary motions granted
    /\bpreliminary (?:motion|issue) (?:is |was )?granted\b/i,
    /\bmotion to dismiss (?:is |was )?granted\b/i,
    /\bsummary dismissal granted\b/i,
    /\bstrike (?:the )?application\b/i,
  ],
  
  preliminary_dismissed: [
    // Preliminary motions dismissed (case continues)
    /\bpreliminary (?:motion|issue) (?:is |was )?dismissed\b/i,
    /\bmotion to dismiss (?:is |was )?dismissed\b/i,
    /\bsummary dismissal denied\b/i,
    /\bcase proceeds? to (?:full )?hearing\b/i,
  ]
};

// Weight scoring: some outcomes are stronger indicators than others
const OUTCOME_CONFIDENCE = {
  allowed: { weight: 1.0, category: 'worker_victory' },
  dismissed: { weight: 1.0, category: 'board_victory' },
  varied: { weight: 0.9, category: 'partial_victory' },
  settled: { weight: 1.0, category: 'negotiated' },
  abandoned: { weight: 1.0, category: 'procedural' },
  deferred: { weight: 0.8, category: 'procedural' },
  jurisdiction_declined: { weight: 0.9, category: 'board_victory' },
  preliminary_granted: { weight: 0.7, category: 'board_victory' },
  preliminary_dismissed: { weight: 0.6, category: 'case_continues' }
};

function extractOutcome(keywords) {
  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return { outcome: null, confidence: 0, matches: [], text_analyzed: '' };
  }
  
  const text = keywords.join(' ');
  const matches = {};
  const matchDetails = [];
  
  // Test all patterns
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
  
  // No matches found
  if (Object.keys(matches).length === 0) {
    return { outcome: null, confidence: 0, matches: matchDetails, text_analyzed: text.substring(0, 200) };
  }
  
  // Calculate weighted scores
  const scores = {};
  for (const [outcome, count] of Object.entries(matches)) {
    const weight = OUTCOME_CONFIDENCE[outcome]?.weight || 0.5;
    scores[outcome] = count * weight;
  }
  
  // Get highest scoring outcome
  const sortedOutcomes = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primaryOutcome = sortedOutcomes[0][0];
  const primaryScore = sortedOutcomes[0][1];
  
  // Confidence based on score and competition
  let confidence = Math.min(1.0, primaryScore / 3); // Max confidence if 3+ matches
  if (sortedOutcomes.length > 1) {
    const secondScore = sortedOutcomes[1][1];
    if (secondScore > primaryScore * 0.5) {
      confidence *= 0.7; // Reduce confidence if competing outcomes
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

async function main() {
  console.log('█'.repeat(80));
  console.log('🎯 ADVANCED WSIAT OUTCOME EXTRACTION');
  console.log('Sophisticated pattern matching to reduce 91.8% outcome obscurity');
  console.log('█'.repeat(80));
  
  console.log('\n📂 Loading WSIAT 2000 dataset...');
  const cases = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`✅ Loaded ${cases.length} cases`);
  
  console.log('\n🔬 Extracting outcomes with advanced patterns...');
  const enriched = [];
  const stats = {
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
    const result = extractOutcome(caseData.keywords);
    
    const enhanced = {
      ...caseData,
      outcome_detection: result
    };
    
    enriched.push(enhanced);
    
    if (result.outcome) {
      stats.with_outcomes++;
      
      // Track outcome types
      if (!stats.by_outcome[result.outcome]) stats.by_outcome[result.outcome] = 0;
      stats.by_outcome[result.outcome]++;
      
      // Track categories
      if (!stats.by_category[result.category]) stats.by_category[result.category] = 0;
      stats.by_category[result.category]++;
      
      // Track confidence
      confidenceSum += result.confidence;
      if (result.confidence >= 80) stats.by_confidence['high (80-100%)']++;
      else if (result.confidence >= 50) stats.by_confidence['medium (50-79%)']++;
      else stats.by_confidence['low (1-49%)']++;
      
      // Collect sample matches
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
  
  console.log('\n💾 Saving results...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enriched, null, 2));
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  
  console.log('\n📊 EXTRACTION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total cases: ${stats.total_cases}`);
  console.log(`Cases with outcomes detected: ${stats.with_outcomes} (${(stats.with_outcomes/stats.total_cases*100).toFixed(1)}%)`);
  console.log(`Average confidence: ${stats.average_confidence}%`);
  console.log('');
  console.log('📋 OUTCOME BREAKDOWN:');
  for (const [outcome, count] of Object.entries(stats.by_outcome).sort((a, b) => b[1] - a[1])) {
    const pct = (count / stats.with_outcomes * 100).toFixed(1);
    console.log(`  - ${outcome}: ${count} (${pct}%)`);
  }
  console.log('');
  console.log('📊 CATEGORY BREAKDOWN:');
  for (const [category, count] of Object.entries(stats.by_category).sort((a, b) => b[1] - a[1])) {
    const pct = (count / stats.with_outcomes * 100).toFixed(1);
    console.log(`  - ${category}: ${count} (${pct}%)`);
  }
  console.log('');
  console.log('🎯 CONFIDENCE DISTRIBUTION:');
  for (const [range, count] of Object.entries(stats.by_confidence)) {
    const pct = (count / stats.total_cases * 100).toFixed(1);
    console.log(`  - ${range}: ${count} (${pct}%)`);
  }
  console.log('');
  console.log(`✅ Enhanced data saved to: ${OUTPUT_FILE}`);
  console.log(`📊 Statistics saved to: ${STATS_FILE}`);
  console.log('');
  console.log('🎯 IMPACT ON 91.8% GAP:');
  const originalObscurity = 91.8;
  const newOutcomeRate = (stats.with_outcomes / stats.total_cases * 100);
  const newObscurity = 100 - newOutcomeRate;
  const improvement = originalObscurity - newObscurity;
  console.log(`  - Original obscurity: ${originalObscurity}% (8.2% with outcomes)`);
  console.log(`  - New obscurity: ${newObscurity.toFixed(1)}% (${newOutcomeRate.toFixed(1)}% with outcomes)`);
  if (improvement > 0) {
    console.log(`  - ✅ REDUCED GAP BY ${improvement.toFixed(1)} percentage points!`);
  } else {
    console.log(`  - ⚠️ Gap remains similar (advanced patterns needed)`);
  }
}

main().catch(console.error);
