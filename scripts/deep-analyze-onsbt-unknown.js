#!/usr/bin/env node

/**
 * Deep Pattern Analysis for Remaining ONSBT Cases
 * Attempts to recover outcomes from 9,030 cases with Unknown outcomes
 * using advanced keyword pattern analysis + decision language extraction
 */

const fs = require('fs');
const path = require('path');

// More sophisticated outcome patterns
const ADVANCED_PATTERNS = {
  // GRANTED indicators (strong signals)
  GRANTED_STRONG: [
    /appeal (was )?granted/i,
    /appeal (was )?allowed/i,
    /relief granted/i,
    /entitlement.*confirmed/i,
    /entitlement.*upheld/i,
    /applicant.*entitled/i,
    /person with a disability.*impairment.*substantial/i,
    /substantial and persistent|persistent and substantial/i,
  ],

  // GRANTED indicators (weak signals)
  GRANTED_WEAK: [
    /person with a disability/i,
    /substantial impairment/i,
    /substantial restrictions/i,
    /substantially restrict/i,
    /restrictions.*substantial/i,
  ],

  // DENIED indicators (strong signals)
  DENIED_STRONG: [
    /appeal.*dismissed|dismissed.*appeal/i,
    /appeal.*denied|denied.*appeal/i,
    /appeal (was )?denied/i,
    /not entitled/i,
    /overpayment.*correct/i,
    /overpayment (was )?correct/i,
    /applicant.*failed/i,
    /failed.*demonstrate.*disability/i,
  ],

  // DENIED indicators (weak signals)
  DENIED_WEAK: [
    /overpayment/i,
    /failed/i,
    /insufficient evidence/i,
    /not demonstrate/i,
  ],

  // DEFERRED indicators
  DEFERRED: [
    /appeal.*deferred/i,
    /deferred/i,
    /adjourned/i,
    /withdrawn/i,
    /abandoned/i,
    /discontinued/i,
    /settled/i,
  ],

  // Impairment strength indicators
  MINIMAL_IMPAIRMENT: [
    /minimal.*impairment/i,
    /minimal.*restriction/i,
    /not substantial/i,
  ],

  // Treatment & expectations
  TREATMENT_EXPECTATIONS: [
    /reasonable.*expectation.*treatment/i,
    /treatment.*expectation/i,
    /likely benefit.*treatment/i,
  ],

  // Evidence & documentation
  WEAK_EVIDENCE: [
    /insufficient.*documentation/i,
    /inadequate.*medical/i,
    /limited.*evidence/i,
  ],
};

/**
 * Advanced outcome inference using weighted scoring
 */
function advancedInferOutcome(keywordsApi) {
  if (!keywordsApi || !Array.isArray(keywordsApi) || keywordsApi.length === 0) {
    return { outcome: 'Unknown', confidence: 0, source: 'no_keywords', reasoning: [] };
  }

  const combinedKeywords = keywordsApi.join(' ').toLowerCase();
  const reasoning = [];

  let scores = {
    GRANTED: 0,
    DENIED: 0,
    DEFERRED: 0,
  };

  // Score strong signals first
  for (const pattern of ADVANCED_PATTERNS.GRANTED_STRONG) {
    const matches = (combinedKeywords.match(pattern) || []).length;
    if (matches > 0) {
      scores.GRANTED += matches * 10;
      reasoning.push(`+ Granted (strong): ${pattern.source || pattern}`);
    }
  }

  for (const pattern of ADVANCED_PATTERNS.DENIED_STRONG) {
    const matches = (combinedKeywords.match(pattern) || []).length;
    if (matches > 0) {
      scores.DENIED += matches * 10;
      reasoning.push(`- Denied (strong): ${pattern.source || pattern}`);
    }
  }

  for (const pattern of ADVANCED_PATTERNS.DEFERRED) {
    const matches = (combinedKeywords.match(pattern) || []).length;
    if (matches > 0) {
      scores.DEFERRED += matches * 8;
      reasoning.push(`⏸ Deferred: ${pattern.source || pattern}`);
    }
  }

  // Score weak signals (lower weight)
  for (const pattern of ADVANCED_PATTERNS.GRANTED_WEAK) {
    const matches = (combinedKeywords.match(pattern) || []).length;
    if (matches > 0) {
      scores.GRANTED += matches * 3;
    }
  }

  for (const pattern of ADVANCED_PATTERNS.DENIED_WEAK) {
    const matches = (combinedKeywords.match(pattern) || []).length;
    if (matches > 0) {
      scores.DENIED += matches * 3;
    }
  }

  // Adjust scores based on evidence quality
  for (const pattern of ADVANCED_PATTERNS.WEAK_EVIDENCE) {
    const matches = (combinedKeywords.match(pattern) || []).length;
    if (matches > 0) {
      scores.GRANTED -= matches * 2; // Weak evidence reduces grant likelihood
    }
  }

  // Determine outcome by highest score
  const maxScore = Math.max(scores.GRANTED, scores.DENIED, scores.DEFERRED);
  if (maxScore === 0) {
    return {
      outcome: 'Unknown',
      confidence: 0,
      source: 'no_pattern_match',
      reasoning,
    };
  }

  let outcome = 'Unknown';
  let confidence = 0;
  let source = '';

  if (scores.GRANTED === maxScore && scores.GRANTED > 0) {
    outcome = 'Granted';
    confidence = Math.min(95, 40 + Math.sqrt(scores.GRANTED) * 8);
    source = 'advanced_pattern_analysis';
  } else if (scores.DENIED === maxScore && scores.DENIED > 0) {
    outcome = 'Denied';
    confidence = Math.min(95, 40 + Math.sqrt(scores.DENIED) * 8);
    source = 'advanced_pattern_analysis';
  } else if (scores.DEFERRED === maxScore && scores.DEFERRED > 0) {
    outcome = 'Deferred';
    confidence = Math.min(85, 40 + Math.sqrt(scores.DEFERRED) * 7);
    source = 'advanced_pattern_analysis';
  }

  return {
    outcome,
    confidence: Math.round(confidence),
    source,
    reasoning: reasoning.slice(0, 3), // Top 3 reasons
    scores,
  };
}

/**
 * Process remaining unknown cases
 */
async function deepAnalyzeUnknown() {
  const dataDir = path.join(__dirname, '..', 'data', 'tribunal-decisions');
  const yearsToProcess = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

  const stats = {
    totalCases: 0,
    alreadyRecovered: 0,
    stillUnknown: 0,
    newlyRecovered: 0,
    byOutcome: { Granted: 0, Denied: 0, Deferred: 0, Unknown: 0 },
    byConfidence: { high: 0, medium: 0, low: 0, veryLow: 0 },
  };

  const recoveredCases = [];

  console.log(`🔬 Deep Pattern Analysis of Unknown ONSBT Cases\n`);
  console.log('='.repeat(70));

  for (const year of yearsToProcess) {
    const filePath = path.join(dataDir, `onsbt-${year}-complete.json`);
    if (!fs.existsSync(filePath)) continue;

    console.log(`\nAnalyzing ONSBT ${year}...`);

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const cases = JSON.parse(fileContent);

      let yearRecovered = 0;
      let yearStillUnknown = 0;

      for (const caseData of cases) {
        stats.totalCases++;

        // Check if already recovered
        if (caseData.outcome && caseData.outcome !== 'Unknown') {
          stats.alreadyRecovered++;
          continue;
        }

        // Attempt deep analysis
        const result = advancedInferOutcome(caseData.keywords_api);

        if (result.outcome !== 'Unknown' && result.confidence >= 30) {
          stats.newlyRecovered++;
          yearRecovered++;
          stats.byOutcome[result.outcome]++;

          if (result.confidence >= 75) stats.byConfidence.high++;
          else if (result.confidence >= 60) stats.byConfidence.medium++;
          else if (result.confidence >= 45) stats.byConfidence.low++;
          else stats.byConfidence.veryLow++;

          recoveredCases.push({
            case_id: caseData.case_id,
            citation: caseData.citation,
            docket_number: caseData.docket_number,
            url: caseData.url,
            inferred_outcome: result.outcome,
            confidence: result.confidence,
            source: result.source,
            reasoning: result.reasoning,
            keywords_sample: caseData.keywords_api?.[0] || 'N/A',
          });
        } else {
          stats.stillUnknown++;
          yearStillUnknown++;
        }
      }

      console.log(`  ✓ ${cases.length} cases analyzed`);
      console.log(`    - Recovered: ${yearRecovered}`);
      console.log(`    - Still Unknown: ${yearStillUnknown}`);
    } catch (err) {
      console.error(`❌ Error processing ${year}:`, err.message);
    }
  }

  // Generate report
  console.log(`\n\n📊 DEEP PATTERN ANALYSIS REPORT\n`);
  console.log('='.repeat(70));
  console.log(`Total Cases: ${stats.totalCases}`);
  console.log(`Already Recovered (earlier passes): ${stats.alreadyRecovered}`);
  console.log(`Newly Recovered: ${stats.newlyRecovered} (${((stats.newlyRecovered / (stats.totalCases - stats.alreadyRecovered)) * 100).toFixed(1)}% of remaining)`);
  console.log(`Still Unknown: ${stats.stillUnknown} (${((stats.stillUnknown / stats.totalCases) * 100).toFixed(1)}% of total)\n`);

  console.log('Newly Recovered Outcomes:');
  console.log(`  Granted: ${stats.byOutcome.Granted} (${((stats.byOutcome.Granted / stats.newlyRecovered) * 100).toFixed(1)}%)`);
  console.log(`  Denied:  ${stats.byOutcome.Denied} (${((stats.byOutcome.Denied / stats.newlyRecovered) * 100).toFixed(1)}%)`);
  console.log(`  Deferred: ${stats.byOutcome.Deferred} (${((stats.byOutcome.Deferred / stats.newlyRecovered) * 100).toFixed(1)}%)\n`);

  console.log('Confidence Distribution (newly recovered):');
  console.log(`  High (75-100%):     ${stats.byConfidence.high}`);
  console.log(`  Medium (60-74%):    ${stats.byConfidence.medium}`);
  console.log(`  Low (45-59%):       ${stats.byConfidence.low}`);
  console.log(`  Very Low (30-44%):  ${stats.byConfidence.veryLow}\n`);

  // Calculate combined recovery rate
  const totalRecovered = stats.alreadyRecovered + stats.newlyRecovered;
  const combinedRecoveryRate = ((totalRecovered / stats.totalCases) * 100).toFixed(1);
  console.log(`📈 COMBINED RECOVERY RATE (all passes): ${totalRecovered}/${stats.totalCases} cases (${combinedRecoveryRate}%)\n`);

  // Save newly recovered cases
  const outputPath = path.join(
    dataDir,
    'onsbt-deep-analysis-recovered-outcomes.json'
  );
  fs.writeFileSync(outputPath, JSON.stringify(recoveredCases, null, 2));
  console.log(`✅ Newly recovered outcomes saved: onsbt-deep-analysis-recovered-outcomes.json (${recoveredCases.length})`);

  // Create consolidated dataset with ALL recovered outcomes
  console.log(`\n💾 Building consolidated outcome dataset...\n`);
  buildConsolidatedDataset(dataDir, stats);
}

/**
 * Consolidate all recovery passes into single enriched dataset
 */
function buildConsolidatedDataset(dataDir, stats) {
  const yearsToProcess = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

  // Load all recovery files
  let patternRecovered = [];
  let apiRecovered = [];
  let deepRecovered = [];

  const patternPath = path.join(dataDir, 'onsbt-recovered-outcomes.json');
  const apiPath = path.join(dataDir, 'onsbt-api-recovered-outcomes.json');
  const deepPath = path.join(dataDir, 'onsbt-deep-analysis-recovered-outcomes.json');

  if (fs.existsSync(patternPath)) {
    patternRecovered = JSON.parse(fs.readFileSync(patternPath, 'utf8'));
  }
  if (fs.existsSync(apiPath)) {
    apiRecovered = JSON.parse(fs.readFileSync(apiPath, 'utf8'));
  }
  if (fs.existsSync(deepPath)) {
    deepRecovered = JSON.parse(fs.readFileSync(deepPath, 'utf8'));
  }

  // Create lookup maps
  const recoveryMap = new Map();
  patternRecovered.forEach((c) => recoveryMap.set(c.case_id, c));
  apiRecovered.forEach((c) => {
    if (!recoveryMap.has(c.case_id)) recoveryMap.set(c.case_id, c);
  });
  deepRecovered.forEach((c) => {
    if (!recoveryMap.has(c.case_id)) recoveryMap.set(c.case_id, c);
  });

  // Consolidate into final dataset
  const consolidatedCases = [];
  let grantRate = { granted: 0, denied: 0, deferred: 0, unknown: 0 };

  for (const year of yearsToProcess) {
    const filePath = path.join(dataDir, `onsbt-${year}-complete.json`);
    if (!fs.existsSync(filePath)) continue;

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const cases = JSON.parse(fileContent);

    for (const caseData of cases) {
      let outcome = 'Unknown';
      let confidence = 0;
      let source = 'unknown';

      if (recoveryMap.has(caseData.case_id)) {
        const recovery = recoveryMap.get(caseData.case_id);
        outcome = recovery.inferred_outcome || recovery.outcome || 'Unknown';
        confidence = recovery.recovery_confidence || recovery.confidence || 0;
        source = recovery.recovery_source || recovery.source || 'unknown';
      } else if (caseData.outcome && caseData.outcome !== 'Unknown') {
        outcome = caseData.outcome;
        confidence = 100;
        source = 'original_data';
      }

      consolidatedCases.push({
        case_id: caseData.case_id,
        citation: caseData.citation,
        docket_number: caseData.docket_number,
        decision_date: caseData.decision_date,
        url: caseData.url,
        keywords_api: caseData.keywords_api,
        outcome,
        confidence,
        recovery_source: source,
        has_disability_ground: caseData.has_disability_ground,
      });

      // Track grant rate
      if (outcome === 'Granted') grantRate.granted++;
      else if (outcome === 'Denied') grantRate.denied++;
      else if (outcome === 'Deferred') grantRate.deferred++;
      else grantRate.unknown++;
    }
  }

  // Save consolidated dataset
  const consolidatedPath = path.join(
    dataDir,
    'onsbt-2020-2026-consolidated-with-recovered-outcomes.json'
  );
  fs.writeFileSync(consolidatedPath, JSON.stringify(consolidatedCases, null, 2));

  // Generate final summary
  const totalRecovered =
    grantRate.granted + grantRate.denied + grantRate.deferred;
  const grantRatePercent = (
    (grantRate.granted / totalRecovered) *
    100
  ).toFixed(1);

  console.log(`📊 FINAL CONSOLIDATED DATASET`);
  console.log('='.repeat(70));
  console.log(`Total Cases: ${consolidatedCases.length}`);
  console.log(`Outcomes Recovered: ${totalRecovered} (${((totalRecovered / consolidatedCases.length) * 100).toFixed(1)}%)`);
  console.log(`Still Unknown: ${grantRate.unknown}\n`);

  console.log('Final Outcome Distribution:');
  console.log(`  Granted: ${grantRate.granted} (${grantRatePercent}% grant rate)`);
  console.log(`  Denied:  ${grantRate.denied}`);
  console.log(`  Deferred: ${grantRate.deferred}`);
  console.log(`  Unknown: ${grantRate.unknown}\n`);

  console.log(
    `✅ Consolidated dataset saved: onsbt-2020-2026-consolidated-with-recovered-outcomes.json\n`
  );
}

// Run deep analysis
deepAnalyzeUnknown().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
