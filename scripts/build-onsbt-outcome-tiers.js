#!/usr/bin/env node

/**
 * ONSBT 3-Tier Outcome Pipeline
 * Tier A: High-precision explicit disposition phrases only
 * Tier B: Medium-confidence lexical inference
 * Tier C: Unresolved/manual-review queue
 */

const fs = require('fs');
const path = require('path');

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

const TIER_A_RULES = [
  { outcome: 'Granted', confidence: 95, pattern: /appeal\s+(is\s+)?allowed/i, ruleId: 'A1' },
  { outcome: 'Granted', confidence: 95, pattern: /appeal\s+(is\s+)?granted/i, ruleId: 'A2' },
  { outcome: 'Granted', confidence: 92, pattern: /application\s+(is\s+)?allowed/i, ruleId: 'A3' },
  { outcome: 'Granted', confidence: 92, pattern: /reconsideration\s+granted/i, ruleId: 'A4' },
  { outcome: 'Granted', confidence: 90, pattern: /decision\s+(is\s+)?rescinded/i, ruleId: 'A5' },
  { outcome: 'Denied', confidence: 95, pattern: /appeal\s+(is\s+)?dismissed/i, ruleId: 'A6' },
  { outcome: 'Denied', confidence: 92, pattern: /application\s+(is\s+)?dismissed/i, ruleId: 'A7' },
  { outcome: 'Denied', confidence: 92, pattern: /overpayment\s+(was\s+)?correct/i, ruleId: 'A8' },
  { outcome: 'Denied', confidence: 90, pattern: /not\s+entitled/i, ruleId: 'A9' },
  { outcome: 'Deferred', confidence: 90, pattern: /withdrawn|abandoned|adjourned|deferred/i, ruleId: 'A10' },
  { outcome: 'Other', confidence: 88, pattern: /interim\s+decision|interim\s+order|costs\s+decision/i, ruleId: 'A11' },
];

const TIER_B_WEIGHTS = {
  granted: [
    { pattern: /person with a disability/i, weight: 16, reason: 'pwd_phrase' },
    { pattern: /substantial\s+impairment/i, weight: 20, reason: 'substantial_impairment' },
    { pattern: /substantially\s+restrict/i, weight: 16, reason: 'substantial_restrictions' },
    { pattern: /verified/i, weight: 10, reason: 'verified_language' },
    { pattern: /eligibility\s+for\s+income\s+support/i, weight: 8, reason: 'eligibility_language' },
    { pattern: /medical\s+adjudication/i, weight: 8, reason: 'medical_adjudication' },
  ],
  denied: [
    { pattern: /overpayment/i, weight: 22, reason: 'overpayment' },
    { pattern: /not\s+eligible/i, weight: 20, reason: 'not_eligible' },
    { pattern: /insufficient\s+evidence/i, weight: 14, reason: 'insufficient_evidence' },
    { pattern: /failed\s+to\s+demonstrate/i, weight: 16, reason: 'failed_to_demonstrate' },
    { pattern: /not\s+substantial/i, weight: 12, reason: 'not_substantial' },
    { pattern: /minimal\s+impairment|minimal\s+restriction/i, weight: 12, reason: 'minimal_impairment' },
  ],
  deferred: [
    { pattern: /deferred|adjourned/i, weight: 20, reason: 'deferred_adjourned' },
    { pattern: /withdrawn|abandoned/i, weight: 20, reason: 'withdrawn_abandoned' },
  ],
};

function normalizeText(keywordsApi) {
  if (!Array.isArray(keywordsApi) || keywordsApi.length === 0) return '';
  return keywordsApi.join(' | ');
}

function inferTierA(text) {
  for (const rule of TIER_A_RULES) {
    if (rule.pattern.test(text)) {
      return {
        tier: 'A',
        inferred_outcome: rule.outcome,
        confidence: rule.confidence,
        rule_id: rule.ruleId,
        reasons: [rule.ruleId],
      };
    }
  }

  return null;
}

function scoreBucket(text, bucketRules) {
  let score = 0;
  const reasons = [];

  for (const rule of bucketRules) {
    if (rule.pattern.test(text)) {
      score += rule.weight;
      reasons.push(rule.reason);
    }
  }

  return { score, reasons };
}

function inferTierB(text) {
  const granted = scoreBucket(text, TIER_B_WEIGHTS.granted);
  const denied = scoreBucket(text, TIER_B_WEIGHTS.denied);
  const deferred = scoreBucket(text, TIER_B_WEIGHTS.deferred);

  const ranked = [
    { outcome: 'Granted', ...granted },
    { outcome: 'Denied', ...denied },
    { outcome: 'Deferred', ...deferred },
  ].sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const second = ranked[1];

  if (!top || top.score < 22) {
    return null;
  }

  const margin = top.score - second.score;
  if (margin < 8) {
    return null;
  }

  const confidence = Math.min(84, 55 + Math.floor(top.score / 4));

  if (confidence < 60) {
    return null;
  }

  return {
    tier: 'B',
    inferred_outcome: top.outcome,
    confidence,
    rule_id: 'B_WEIGHTED',
    reasons: top.reasons,
    score_breakdown: {
      granted: granted.score,
      denied: denied.score,
      deferred: deferred.score,
      margin,
    },
  };
}

function toRecord(caseData, inference) {
  return {
    case_id: caseData.case_id,
    citation: caseData.citation,
    decision_date: caseData.decision_date,
    docket_number: caseData.docket_number,
    url: caseData.url,
    inferred_outcome: inference?.inferred_outcome || 'Unknown',
    confidence: inference?.confidence || 0,
    tier: inference?.tier || 'C',
    rule_id: inference?.rule_id || 'C_UNRESOLVED',
    reasons: inference?.reasons || [],
    score_breakdown: inference?.score_breakdown || null,
    keywords_api: caseData.keywords_api || [],
  };
}

function loadAllCases(dataDir) {
  const all = [];
  for (const year of YEARS) {
    const file = path.join(dataDir, `onsbt-${year}-complete.json`);
    if (!fs.existsSync(file)) continue;
    const cases = JSON.parse(fs.readFileSync(file, 'utf8'));
    all.push(...cases);
  }
  return all;
}

function buildSummary(rows) {
  const byTier = { A: 0, B: 0, C: 0 };
  const byOutcome = { Granted: 0, Denied: 0, Deferred: 0, Other: 0, Unknown: 0 };

  for (const row of rows) {
    byTier[row.tier] += 1;
    if (byOutcome[row.inferred_outcome] === undefined) byOutcome[row.inferred_outcome] = 0;
    byOutcome[row.inferred_outcome] += 1;
  }

  return {
    created_at: new Date().toISOString(),
    total_cases: rows.length,
    tiers: byTier,
    outcomes: byOutcome,
    coverage: {
      classified_A_or_B: byTier.A + byTier.B,
      classified_rate: rows.length ? (((byTier.A + byTier.B) / rows.length) * 100).toFixed(1) : '0.0',
      unresolved_rate: rows.length ? ((byTier.C / rows.length) * 100).toFixed(1) : '0.0',
    },
  };
}

function main() {
  const dataDir = path.join(__dirname, '..', 'data', 'tribunal-decisions');
  const cases = loadAllCases(dataDir);

  const allRows = [];
  for (const c of cases) {
    const text = normalizeText(c.keywords_api);

    let inference = inferTierA(text);
    if (!inference) {
      inference = inferTierB(text);
    }

    allRows.push(toRecord(c, inference));
  }

  const tierA = allRows.filter((r) => r.tier === 'A');
  const tierB = allRows.filter((r) => r.tier === 'B');
  const tierC = allRows.filter((r) => r.tier === 'C');

  const tierAFile = path.join(dataDir, 'onsbt-outcomes-tier-a-high-precision.json');
  const tierBFile = path.join(dataDir, 'onsbt-outcomes-tier-b-medium-confidence.json');
  const tierCFile = path.join(dataDir, 'onsbt-outcomes-tier-c-manual-review-queue.json');
  const allFile = path.join(dataDir, 'onsbt-outcomes-3-tier-consolidated.json');
  const summaryFile = path.join(dataDir, 'onsbt-outcomes-3-tier-summary.json');

  fs.writeFileSync(tierAFile, JSON.stringify(tierA, null, 2));
  fs.writeFileSync(tierBFile, JSON.stringify(tierB, null, 2));
  fs.writeFileSync(tierCFile, JSON.stringify(tierC, null, 2));
  fs.writeFileSync(allFile, JSON.stringify(allRows, null, 2));

  const summary = buildSummary(allRows);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  console.log('ONSBT 3-Tier Outcome Pipeline Complete');
  console.log('='.repeat(60));
  console.log(`Total cases: ${summary.total_cases}`);
  console.log(`Tier A (high precision): ${summary.tiers.A}`);
  console.log(`Tier B (medium confidence): ${summary.tiers.B}`);
  console.log(`Tier C (manual queue): ${summary.tiers.C}`);
  console.log(`Classified A+B: ${summary.coverage.classified_A_or_B} (${summary.coverage.classified_rate}%)`);
  console.log(`Unresolved C: ${summary.tiers.C} (${summary.coverage.unresolved_rate}%)`);
  console.log('Outcomes:');
  for (const [k, v] of Object.entries(summary.outcomes)) {
    console.log(`  ${k}: ${v}`);
  }
  console.log(`\nSaved: ${summaryFile}`);
}

main();
