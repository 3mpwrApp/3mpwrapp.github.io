#!/usr/bin/env node

/**
 * Tribunal audit error-rate estimation from sample packs.
 *
 * This is an automated proxy audit (not human gold-label validation):
 * - Tier B: contradiction rate between inferred outcome and explicit keyword polarity.
 * - Tier C: missed-explicit rate where unresolved cases contain explicit disposition phrases.
 *
 * Reports Wilson 95% confidence intervals.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const TRIBUNALS = ['onwsib', 'onhrt', 'onwsiat', 'onsbt'];

const POSITIVE_RE = /(appeal\s+(is\s+)?allowed|appeal\s+(is\s+)?granted|application\s+(is\s+)?allowed|entitlement\s+(allowed|awarded|granted|in\s+order)|benefits\s+awarded|ongoing\s+entitlement\s+confirmed|code\s+violation\s+found|upheld|allowed\s+in\s+part|reconsideration\s+granted)/i;
const NEGATIVE_RE = /(appeal\s+(is\s+)?dismissed|application\s+(is\s+)?dismissed|entitlement\s+denied|denied\s+the\s+worker\s+entitlement|benefits\s+denied|not\s+entitled|no\s+entitlement|rejected|no\s+violation\s+found|overpayment\s+(was\s+)?correct)/i;
const DEFERRED_RE = /(withdrawn|abandoned|adjourned|deferred|settled)/i;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function pct(value) {
  return Number((value * 100).toFixed(1));
}

function wilsonCI(k, n, z = 1.96) {
  if (!n) return { low: 0, high: 0, p: 0 };
  const p = k / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return {
    p,
    low: Math.max(0, center - margin),
    high: Math.min(1, center + margin),
  };
}

function normalizeOutcome(outcome) {
  const v = String(outcome || 'Unknown').toLowerCase();
  if (v.includes('grant') || v.includes('allow') || v.includes('upheld')) return 'Granted';
  if (v.includes('denied') || v.includes('deny') || v.includes('dismiss') || v.includes('reject')) return 'Denied';
  if (v.includes('defer') || v.includes('withdraw') || v.includes('abandon') || v.includes('settle')) return 'Deferred';
  if (v === 'unknown') return 'Unknown';
  return 'Other';
}

function getText(row) {
  if (Array.isArray(row.keywords_api)) return row.keywords_api.join(' | ');
  return '';
}

function tierBContradiction(row) {
  const outcome = normalizeOutcome(row.inferred_outcome);
  const text = getText(row);
  const hasPos = POSITIVE_RE.test(text);
  const hasNeg = NEGATIVE_RE.test(text);
  const hasDef = DEFERRED_RE.test(text);

  if (hasPos && hasNeg) return false; // mixed language, skip as contradiction

  if (outcome === 'Granted' && hasNeg && !hasPos) return true;
  if (outcome === 'Denied' && hasPos && !hasNeg) return true;
  if (outcome === 'Deferred' && (hasPos || hasNeg) && !hasDef) return true;

  return false;
}

function tierCMissedExplicit(row) {
  const text = getText(row);
  return POSITIVE_RE.test(text) || NEGATIVE_RE.test(text) || DEFERRED_RE.test(text);
}

function summarizeTribunal(db) {
  const bPath = path.join(DATA_DIR, `${db}-tier-b-audit-sample.json`);
  const cPath = path.join(DATA_DIR, `${db}-tier-c-audit-sample.json`);

  if (!fs.existsSync(bPath) || !fs.existsSync(cPath)) return null;

  const bRows = readJson(bPath);
  const cRows = readJson(cPath);

  const bContradictions = bRows.filter(tierBContradiction).length;
  const cMissedExplicit = cRows.filter(tierCMissedExplicit).length;

  const bCI = wilsonCI(bContradictions, bRows.length);
  const cCI = wilsonCI(cMissedExplicit, cRows.length);

  return {
    database: db,
    tier_b_proxy_error: {
      sample_n: bRows.length,
      flagged_errors: bContradictions,
      error_rate_percent: pct(bCI.p),
      ci95_percent: [pct(bCI.low), pct(bCI.high)],
      definition: 'Contradiction between inferred Tier B outcome and explicit keyword polarity',
    },
    tier_c_proxy_missed_rate: {
      sample_n: cRows.length,
      flagged_missed: cMissedExplicit,
      missed_rate_percent: pct(cCI.p),
      ci95_percent: [pct(cCI.low), pct(cCI.high)],
      definition: 'Unresolved Tier C cases containing explicit disposition phrases',
    },
  };
}

function main() {
  const result = {
    created_at: new Date().toISOString(),
    method: 'automated_proxy_audit_from_sample_packs',
    caveat: 'Use as screening estimate; replace with human-reviewed gold-label audit for definitive error rates.',
    tribunals: [],
  };

  for (const db of TRIBUNALS) {
    const s = summarizeTribunal(db);
    if (s) result.tribunals.push(s);
  }

  const outPath = path.join(DATA_DIR, 'tribunal-audit-error-rate-estimates.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

  console.log('Audit error-rate estimates generated');
  console.log(`Saved: ${outPath}`);
  for (const t of result.tribunals) {
    console.log(`\n${t.database.toUpperCase()}`);
    console.log(
      `  Tier B proxy error: ${t.tier_b_proxy_error.error_rate_percent}% (95% CI ${t.tier_b_proxy_error.ci95_percent[0]}-${t.tier_b_proxy_error.ci95_percent[1]})`
    );
    console.log(
      `  Tier C proxy missed-explicit: ${t.tier_c_proxy_missed_rate.missed_rate_percent}% (95% CI ${t.tier_c_proxy_missed_rate.ci95_percent[0]}-${t.tier_c_proxy_missed_rate.ci95_percent[1]})`
    );
  }
}

main();
