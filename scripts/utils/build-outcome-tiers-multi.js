#!/usr/bin/env node

/**
 * Multi-Tribunal 3-Tier Outcome Pipeline
 * Databases: onwsib, onhrt, onwsiat
 * Tier A: explicit dispositions + existing known outcomes
 * Tier B: weighted lexical inference
 * Tier C: unresolved manual queue
 */

const fs = require('fs');
const path = require('path');

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

const TRIBUNALS = {
  onwsib: {
    fileForYear: (year) => `onwsib-${year}-complete.json`,
    extractRows: (json) => json.map((item) => ({
      case_id: item.case_id,
      citation: item.citation,
      decision_date: item.decision_date,
      docket_number: item.docket_number,
      url: item.url,
      keywords_text: Array.isArray(item.keywords_api) ? item.keywords_api.join(' | ') : '',
      existing_outcome: item.outcome || 'Unknown',
      raw_keywords_api: item.keywords_api || [],
    })),
  },
  onhrt: {
    fileForYear: (year) => `onhrt-${year}-complete.json`,
    extractRows: (json) => json.map((item) => ({
      case_id: item.case_id,
      citation: item.citation,
      decision_date: item.decision_date,
      docket_number: item.docket_number,
      url: item.url,
      keywords_text: Array.isArray(item.keywords_api) ? item.keywords_api.join(' | ') : '',
      existing_outcome: item.outcome || 'Unknown',
      raw_keywords_api: item.keywords_api || [],
    })),
  },
  onwsiat: {
    fileForYear: (year) => `onwsiat-${year}-ultra-slow.json`,
    extractRows: (json) => json.map((item) => ({
      case_id: item.caseId || item?.data?.caseId || 'Unknown',
      citation: item?.data?.citation || 'Unknown',
      decision_date: item?.data?.decisionDate || 'Unknown',
      docket_number: item?.data?.docketNumber || 'Unknown',
      url: item?.data?.url || '',
      keywords_text: item?.data?.keywords || '',
      existing_outcome: 'Unknown',
      raw_keywords_api: item?.data?.keywords ? [item.data.keywords] : [],
    })),
  },
};

const TIER_B_PARAMS = {
  onwsib: { minScore: 14, minMargin: 4, minConfidence: 55 },
  onhrt: { minScore: 20, minMargin: 6, minConfidence: 60 },
  onwsiat: { minScore: 14, minMargin: 4, minConfidence: 55 },
};

const OUTCOME_NORMALIZATION = {
  allowed: 'Granted',
  granted: 'Granted',
  upheld: 'Granted',
  dismissed: 'Denied',
  denied: 'Denied',
  abandoned: 'Deferred',
  withdrawn: 'Deferred',
  deferred: 'Deferred',
  settled: 'Deferred',
  unknown: 'Unknown',
};

const TIER_A_RULES = [
  { outcome: 'Granted', confidence: 95, pattern: /appeal\s+(is\s+)?allowed/i, ruleId: 'A1' },
  { outcome: 'Granted', confidence: 95, pattern: /appeal\s+(is\s+)?granted/i, ruleId: 'A2' },
  { outcome: 'Granted', confidence: 92, pattern: /application\s+(is\s+)?allowed/i, ruleId: 'A3' },
  { outcome: 'Granted', confidence: 92, pattern: /reconsideration\s+granted/i, ruleId: 'A4' },
  { outcome: 'Granted', confidence: 90, pattern: /decision\s+(is\s+)?rescinded/i, ruleId: 'A5' },
  { outcome: 'Denied', confidence: 95, pattern: /appeal\s+(is\s+)?dismissed/i, ruleId: 'A6' },
  { outcome: 'Denied', confidence: 92, pattern: /application\s+(is\s+)?dismissed/i, ruleId: 'A7' },
  { outcome: 'Denied', confidence: 92, pattern: /overpayment\s+(was\s+)?correct/i, ruleId: 'A8' },
  { outcome: 'Denied', confidence: 90, pattern: /not\s+entitled|no\s+entitlement/i, ruleId: 'A9' },
  { outcome: 'Deferred', confidence: 90, pattern: /withdrawn|abandoned|adjourned|deferred|settled/i, ruleId: 'A10' },
  { outcome: 'Other', confidence: 88, pattern: /interim\s+decision|interim\s+order|costs\s+decision/i, ruleId: 'A11' },
  { outcome: 'Granted', confidence: 94, pattern: /entitlement\s+(allowed|awarded|granted|confirmed|in\s+order)/i, ruleId: 'A12' },
  { outcome: 'Denied', confidence: 94, pattern: /entitlement\s+denied|denied\s+the\s+worker\s+entitlement|benefits\s+denied/i, ruleId: 'A13' },
  { outcome: 'Granted', confidence: 92, pattern: /appeal\s+allowed\s+in\s+part/i, ruleId: 'A14' },
  { outcome: 'Granted', confidence: 90, pattern: /code\s+violation\s+found/i, ruleId: 'A15' },
  { outcome: 'Denied', confidence: 90, pattern: /no\s+violation\s+found|application\s+dismissed/i, ruleId: 'A16' },
];

const TIER_B_WEIGHTS = {
  granted: [
    { pattern: /person with a disability/i, weight: 16, reason: 'pwd_phrase' },
    { pattern: /substantial\s+impairment/i, weight: 20, reason: 'substantial_impairment' },
    { pattern: /substantially\s+restrict/i, weight: 16, reason: 'substantial_restrictions' },
    { pattern: /verified/i, weight: 10, reason: 'verified_language' },
    { pattern: /eligibility\s+for\s+income\s+support/i, weight: 10, reason: 'eligibility_language' },
    { pattern: /entitlement/i, weight: 8, reason: 'entitlement_term' },
    { pattern: /work-related\s+injur/i, weight: 6, reason: 'work_related_injury' },
    { pattern: /initial\s+entitlement/i, weight: 8, reason: 'initial_entitlement' },
    { pattern: /benefits\s+awarded|ongoing\s+entitlement\s+confirmed/i, weight: 18, reason: 'benefits_awarded' },
    { pattern: /appeal\s+allowed\s+in\s+part/i, weight: 12, reason: 'allowed_in_part' },
  ],
  denied: [
    { pattern: /overpayment/i, weight: 22, reason: 'overpayment' },
    { pattern: /not\s+eligible/i, weight: 20, reason: 'not_eligible' },
    { pattern: /insufficient\s+evidence/i, weight: 14, reason: 'insufficient_evidence' },
    { pattern: /failed\s+to\s+demonstrate/i, weight: 16, reason: 'failed_to_demonstrate' },
    { pattern: /not\s+substantial/i, weight: 12, reason: 'not_substantial' },
    { pattern: /no\s+jurisdiction/i, weight: 18, reason: 'no_jurisdiction' },
    { pattern: /non-compensable|noncompensable/i, weight: 16, reason: 'non_compensable' },
    { pattern: /entitlement\s+denied|denied\s+the\s+worker\s+entitlement/i, weight: 22, reason: 'entitlement_denied' },
    { pattern: /claim\s+rejected|benefits\s+denied/i, weight: 20, reason: 'claim_rejected' },
    { pattern: /pre-existing\s+condition/i, weight: 6, reason: 'pre_existing_condition' },
  ],
  deferred: [
    { pattern: /deferred|adjourned/i, weight: 20, reason: 'deferred_adjourned' },
    { pattern: /withdrawn|abandoned|settled/i, weight: 20, reason: 'withdrawn_abandoned_settled' },
    { pattern: /time\s+extension|delay/i, weight: 8, reason: 'procedural_delay' },
  ],
};

function normalizeExistingOutcome(raw) {
  if (!raw || typeof raw !== 'string') return 'Unknown';
  const v = raw.trim().toLowerCase();
  if (OUTCOME_NORMALIZATION[v]) return OUTCOME_NORMALIZATION[v];

  if (v.includes('allow') || v.includes('grant') || v.includes('upheld') || v.includes('violation found')) {
    return 'Granted';
  }
  if (v.includes('dismiss') || v.includes('denied') || v.includes('no violation') || v.includes('no jurisdiction')) {
    return 'Denied';
  }
  if (v.includes('abandon') || v.includes('withdraw') || v.includes('defer') || v.includes('settl')) {
    return 'Deferred';
  }
  return 'Unknown';
}

function inferTierA(existingOutcome, text) {
  const normalized = normalizeExistingOutcome(existingOutcome);
  if (normalized !== 'Unknown') {
    return {
      tier: 'A',
      inferred_outcome: normalized,
      confidence: 100,
      rule_id: 'A_EXISTING_OUTCOME',
      reasons: ['existing_outcome'],
    };
  }

  const hasPositive = /(allowed|granted|awarded|upheld|confirmed)/i.test(text);
  const hasNegative = /(denied|dismissed|rejected|not\s+entitled|no\s+entitlement|no\s+violation)/i.test(text);
  if (hasPositive && hasNegative) {
    return {
      tier: 'A',
      inferred_outcome: 'Other',
      confidence: 90,
      rule_id: 'A_MIXED_DISPOSITION',
      reasons: ['mixed_disposition_keywords'],
    };
  }

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

function inferTierB(text, db) {
  const params = TIER_B_PARAMS[db] || TIER_B_PARAMS.onhrt;
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
  if (!top || top.score < params.minScore) {
    if (db === 'onwsiat') {
      const hasEntitlement = /\bentitlement\b/i.test(text);
      const hasPositive = /(allowed|granted|awarded|confirmed|in\s+order)/i.test(text);
      const hasNegative = /(denied|dismissed|not\s+entitled|no\s+entitlement|non-compensable)/i.test(text);
      const hasInjuryContext = /(work-related\s+injur|disablement|benefits|permanent\s+impairment)/i.test(text);

      if (hasEntitlement && hasPositive) {
        return {
          tier: 'B',
          inferred_outcome: 'Granted',
          confidence: 60,
          rule_id: 'B_HEUR_WSIAT_ENTITLEMENT_POSITIVE',
          reasons: ['entitlement_positive_phrase'],
          score_breakdown: { granted: 0, denied: 0, deferred: 0, margin: 0 },
        };
      }

      if (hasEntitlement && hasNegative) {
        return {
          tier: 'B',
          inferred_outcome: 'Denied',
          confidence: 60,
          rule_id: 'B_HEUR_WSIAT_ENTITLEMENT_NEGATIVE',
          reasons: ['entitlement_negative_phrase'],
          score_breakdown: { granted: 0, denied: 0, deferred: 0, margin: 0 },
        };
      }

      if (hasEntitlement && hasInjuryContext && !hasNegative) {
        return {
          tier: 'B',
          inferred_outcome: 'Granted',
          confidence: 57,
          rule_id: 'B_HEUR_WSIAT_CONTEXTUAL_ENTITLEMENT',
          reasons: ['entitlement_with_injury_context'],
          score_breakdown: { granted: 0, denied: 0, deferred: 0, margin: 0 },
        };
      }
    }

    if (db === 'onwsib') {
      const hasInitialEntitlement = /initial\s+entitlement/i.test(text);
      const hasPositive = /(allowed|granted|awarded|entitled\s+to\s+benefits)/i.test(text);
      const hasNegative = /(denied|dismissed|rejected|non-compensable)/i.test(text);
      const hasInjuryContext = /(work-related\s+injur|benefits|loe|occupational\s+disease)/i.test(text);

      if (hasInitialEntitlement && hasPositive) {
        return {
          tier: 'B',
          inferred_outcome: 'Granted',
          confidence: 60,
          rule_id: 'B_HEUR_WSIB_INITIAL_ENTITLEMENT_POSITIVE',
          reasons: ['initial_entitlement_positive_phrase'],
          score_breakdown: { granted: 0, denied: 0, deferred: 0, margin: 0 },
        };
      }

      if (hasInjuryContext && hasNegative) {
        return {
          tier: 'B',
          inferred_outcome: 'Denied',
          confidence: 58,
          rule_id: 'B_HEUR_WSIB_INJURY_NEGATIVE',
          reasons: ['injury_context_negative_phrase'],
          score_breakdown: { granted: 0, denied: 0, deferred: 0, margin: 0 },
        };
      }
    }

    return null;
  }

  const margin = top.score - second.score;
  if (margin < params.minMargin) return null;

  const confidence = Math.min(84, 55 + Math.floor(top.score / 4));
  if (confidence < params.minConfidence) return null;

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

function buildRecord(row, inference) {
  return {
    case_id: row.case_id,
    citation: row.citation,
    decision_date: row.decision_date,
    docket_number: row.docket_number,
    url: row.url,
    inferred_outcome: inference?.inferred_outcome || 'Unknown',
    confidence: inference?.confidence || 0,
    tier: inference?.tier || 'C',
    rule_id: inference?.rule_id || 'C_UNRESOLVED',
    reasons: inference?.reasons || [],
    score_breakdown: inference?.score_breakdown || null,
    keywords_api: row.raw_keywords_api || [],
  };
}

function summarize(rows, db) {
  const tiers = { A: 0, B: 0, C: 0 };
  const outcomes = { Granted: 0, Denied: 0, Deferred: 0, Other: 0, Unknown: 0 };

  for (const r of rows) {
    tiers[r.tier] += 1;
    if (outcomes[r.inferred_outcome] === undefined) outcomes[r.inferred_outcome] = 0;
    outcomes[r.inferred_outcome] += 1;
  }

  return {
    database: db,
    created_at: new Date().toISOString(),
    total_cases: rows.length,
    tiers,
    outcomes,
    coverage: {
      classified_A_or_B: tiers.A + tiers.B,
      classified_rate: rows.length ? (((tiers.A + tiers.B) / rows.length) * 100).toFixed(1) : '0.0',
      unresolved_rate: rows.length ? ((tiers.C / rows.length) * 100).toFixed(1) : '0.0',
    },
  };
}

function loadRowsForTribunal(dataDir, db) {
  const cfg = TRIBUNALS[db];
  if (!cfg) throw new Error(`Unsupported tribunal: ${db}`);

  const rows = [];
  for (const year of YEARS) {
    const file = path.join(dataDir, cfg.fileForYear(year));
    if (!fs.existsSync(file)) continue;
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    rows.push(...cfg.extractRows(json));
  }
  return rows;
}

function runForTribunal(dataDir, db) {
  const rows = loadRowsForTribunal(dataDir, db);

  const classified = rows.map((row) => {
    const text = row.keywords_text || '';
    const tierA = inferTierA(row.existing_outcome, text);
    const inference = tierA || inferTierB(text, db);
    return buildRecord(row, inference);
  });

  const tierA = classified.filter((r) => r.tier === 'A');
  const tierB = classified.filter((r) => r.tier === 'B');
  const tierC = classified.filter((r) => r.tier === 'C');

  fs.writeFileSync(path.join(dataDir, `${db}-outcomes-tier-a-high-precision.json`), JSON.stringify(tierA, null, 2));
  fs.writeFileSync(path.join(dataDir, `${db}-outcomes-tier-b-medium-confidence.json`), JSON.stringify(tierB, null, 2));
  fs.writeFileSync(path.join(dataDir, `${db}-outcomes-tier-c-manual-review-queue.json`), JSON.stringify(tierC, null, 2));
  fs.writeFileSync(path.join(dataDir, `${db}-outcomes-3-tier-consolidated.json`), JSON.stringify(classified, null, 2));

  const summary = summarize(classified, db);
  fs.writeFileSync(path.join(dataDir, `${db}-outcomes-3-tier-summary.json`), JSON.stringify(summary, null, 2));

  return summary;
}

function main() {
  const dataDir = path.join(__dirname, '..', 'data', 'tribunal-decisions');
  const dbs = ['onwsib', 'onhrt', 'onwsiat'];

  const summaries = [];
  for (const db of dbs) {
    const summary = runForTribunal(dataDir, db);
    summaries.push(summary);

    console.log('\n' + '='.repeat(60));
    console.log(`${db.toUpperCase()} 3-Tier Pipeline Complete`);
    console.log('='.repeat(60));
    console.log(`Total cases: ${summary.total_cases}`);
    console.log(`Tier A: ${summary.tiers.A}`);
    console.log(`Tier B: ${summary.tiers.B}`);
    console.log(`Tier C: ${summary.tiers.C}`);
    console.log(`Classified A+B: ${summary.coverage.classified_A_or_B} (${summary.coverage.classified_rate}%)`);
    console.log(`Unresolved C: ${summary.tiers.C} (${summary.coverage.unresolved_rate}%)`);
  }

  fs.writeFileSync(
    path.join(dataDir, 'ontario-tribunals-outcomes-3-tier-summary.json'),
    JSON.stringify({ created_at: new Date().toISOString(), tribunals: summaries }, null, 2)
  );

  console.log('\nSaved aggregate summary: ontario-tribunals-outcomes-3-tier-summary.json');
}

main();
