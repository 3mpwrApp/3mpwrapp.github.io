#!/usr/bin/env node

/**
 * Justice Artifacts Generator
 * Produces:
 * 1) Strict evidence table (confirmed vs probable vs unresolved)
 * 2) Audit samples from Tier B and Tier C
 * 3) Per-issue slices for community-focused topics
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const TRIBUNALS = ['onwsib', 'onhrt', 'onwsiat', 'onsbt'];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function safeExists(filePath) {
  return fs.existsSync(filePath);
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleDeterministic(rows, n, seed) {
  if (rows.length <= n) return rows.slice();
  const rand = mulberry32(seed);
  const scored = rows.map((row, idx) => ({ row, score: rand(), idx }));
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, n).map((x) => x.row);
}

function normalizeOutcome(outcome) {
  if (!outcome) return 'Unknown';
  const v = String(outcome).toLowerCase();
  if (v.includes('grant') || v.includes('allow') || v.includes('upheld')) return 'Granted';
  if (v.includes('deny') || v.includes('denied') || v.includes('dismiss') || v.includes('reject')) return 'Denied';
  if (v.includes('withdraw') || v.includes('abandon') || v.includes('defer') || v.includes('settle')) return 'Deferred';
  if (v === 'unknown') return 'Unknown';
  return 'Other';
}

function summarizeRows(rows) {
  const byOutcome = { Granted: 0, Denied: 0, Deferred: 0, Other: 0, Unknown: 0 };
  for (const r of rows) {
    const out = normalizeOutcome(r.inferred_outcome || r.outcome || 'Unknown');
    byOutcome[out] = (byOutcome[out] || 0) + 1;
  }
  return byOutcome;
}

function generateStrictEvidenceTable() {
  const table = {
    created_at: new Date().toISOString(),
    method: {
      confirmed_definition: 'Tier A only (explicit disposition phrases or existing known outcomes)',
      probable_definition: 'Tier B only (weighted lexical or tribunal heuristic inference)',
      unresolved_definition: 'Tier C only (no reliable inference from available metadata)',
      caution: 'Tier B is inferred, not confirmed adjudicative disposition.'
    },
    tribunals: []
  };

  for (const db of TRIBUNALS) {
    const tierAPath = path.join(DATA_DIR, `${db}-outcomes-tier-a-high-precision.json`);
    const tierBPath = path.join(DATA_DIR, `${db}-outcomes-tier-b-medium-confidence.json`);
    const tierCPath = path.join(DATA_DIR, `${db}-outcomes-tier-c-manual-review-queue.json`);

    if (!safeExists(tierAPath) || !safeExists(tierBPath) || !safeExists(tierCPath)) {
      continue;
    }

    const tierA = readJson(tierAPath);
    const tierB = readJson(tierBPath);
    const tierC = readJson(tierCPath);

    const total = tierA.length + tierB.length + tierC.length;
    const confirmed = tierA.length;
    const probable = tierB.length;
    const unresolved = tierC.length;

    table.tribunals.push({
      database: db,
      total_cases: total,
      confirmed_tier_a: {
        count: confirmed,
        rate_percent: total ? Number(((confirmed / total) * 100).toFixed(1)) : 0,
        outcomes: summarizeRows(tierA),
      },
      probable_tier_b: {
        count: probable,
        rate_percent: total ? Number(((probable / total) * 100).toFixed(1)) : 0,
        outcomes: summarizeRows(tierB),
      },
      unresolved_tier_c: {
        count: unresolved,
        rate_percent: total ? Number(((unresolved / total) * 100).toFixed(1)) : 0,
      },
    });
  }

  const outPath = path.join(DATA_DIR, 'justice-evidence-table-strict.json');
  writeJson(outPath, table);
  return { outPath, table };
}

function buildAuditSamples() {
  const audit = {
    created_at: new Date().toISOString(),
    sample_policy: {
      tier_b_sample_per_tribunal: 120,
      tier_c_sample_per_tribunal: 120,
      deterministic_seed_base: 26042026,
      note: 'Samples are deterministic for reproducibility and quality audit.'
    },
    tribunals: []
  };

  for (const db of TRIBUNALS) {
    const tierBPath = path.join(DATA_DIR, `${db}-outcomes-tier-b-medium-confidence.json`);
    const tierCPath = path.join(DATA_DIR, `${db}-outcomes-tier-c-manual-review-queue.json`);
    if (!safeExists(tierBPath) || !safeExists(tierCPath)) continue;

    const tierB = readJson(tierBPath);
    const tierC = readJson(tierCPath);

    const bSample = sampleDeterministic(tierB, 120, 26042026 + db.length * 11 + 1).map((r) => ({
      case_id: r.case_id,
      citation: r.citation,
      inferred_outcome: r.inferred_outcome,
      confidence: r.confidence,
      tier: r.tier,
      rule_id: r.rule_id,
      reasons: r.reasons,
      keywords_api: r.keywords_api,
      url: r.url,
    }));

    const cSample = sampleDeterministic(tierC, 120, 26042026 + db.length * 11 + 2).map((r) => ({
      case_id: r.case_id,
      citation: r.citation,
      inferred_outcome: r.inferred_outcome,
      confidence: r.confidence,
      tier: r.tier,
      rule_id: r.rule_id,
      reasons: r.reasons,
      keywords_api: r.keywords_api,
      url: r.url,
    }));

    const tribunalOut = {
      database: db,
      tier_b_population: tierB.length,
      tier_b_sample: bSample,
      tier_c_population: tierC.length,
      tier_c_sample: cSample,
    };

    audit.tribunals.push(tribunalOut);

    writeJson(path.join(DATA_DIR, `${db}-tier-b-audit-sample.json`), bSample);
    writeJson(path.join(DATA_DIR, `${db}-tier-c-audit-sample.json`), cSample);
  }

  const outPath = path.join(DATA_DIR, 'justice-audit-samples.json');
  writeJson(outPath, audit);
  return { outPath, audit };
}

const ISSUE_DEFS = [
  {
    issue_key: 'chronic-pain',
    label: 'Chronic pain',
    pattern: /chronic\s+pain|fibromyalgia|crps|complex\s+regional\s+pain|pain\s+disorder/i,
  },
  {
    issue_key: 'pre-existing-condition',
    label: 'Pre-existing condition',
    pattern: /pre-existing\s+condition|preexisting\s+condition|degenerative/i,
  },
  {
    issue_key: 'entitlement-denied',
    label: 'Entitlement denied',
    pattern: /entitlement\s+denied|denied\s+the\s+worker\s+entitlement|benefits\s+denied|not\s+entitled/i,
  },
];

function generateIssueSlices() {
  const allSlicesSummary = {
    created_at: new Date().toISOString(),
    issues: [],
  };

  for (const issue of ISSUE_DEFS) {
    const issueRows = [];

    for (const db of TRIBUNALS) {
      const consolidatedPath = path.join(DATA_DIR, `${db}-outcomes-3-tier-consolidated.json`);
      if (!safeExists(consolidatedPath)) continue;

      const rows = readJson(consolidatedPath);
      for (const r of rows) {
        const text = Array.isArray(r.keywords_api) ? r.keywords_api.join(' | ') : '';
        if (!issue.pattern.test(text)) continue;

        issueRows.push({
          database: db,
          case_id: r.case_id,
          citation: r.citation,
          decision_date: r.decision_date,
          inferred_outcome: r.inferred_outcome,
          tier: r.tier,
          confidence: r.confidence,
          rule_id: r.rule_id,
          reasons: r.reasons,
          keywords_api: r.keywords_api,
          url: r.url,
        });
      }
    }

    const outPath = path.join(DATA_DIR, `issue-slice-${issue.issue_key}.json`);
    writeJson(outPath, issueRows);

    const byTribunal = {};
    const byTier = { A: 0, B: 0, C: 0 };
    const byOutcome = { Granted: 0, Denied: 0, Deferred: 0, Other: 0, Unknown: 0 };

    for (const row of issueRows) {
      byTribunal[row.database] = (byTribunal[row.database] || 0) + 1;
      byTier[row.tier] = (byTier[row.tier] || 0) + 1;
      const out = normalizeOutcome(row.inferred_outcome);
      byOutcome[out] = (byOutcome[out] || 0) + 1;
    }

    allSlicesSummary.issues.push({
      issue_key: issue.issue_key,
      label: issue.label,
      output_file: path.basename(outPath),
      total_cases: issueRows.length,
      by_tribunal: byTribunal,
      by_tier: byTier,
      by_outcome: byOutcome,
    });
  }

  const summaryPath = path.join(DATA_DIR, 'issue-slices-summary.json');
  writeJson(summaryPath, allSlicesSummary);
  return { summaryPath, allSlicesSummary };
}

function main() {
  const evidence = generateStrictEvidenceTable();
  const audits = buildAuditSamples();
  const slices = generateIssueSlices();

  console.log('Justice artifact generation complete');
  console.log('='.repeat(60));
  console.log(`Strict evidence table: ${evidence.outPath}`);
  console.log(`Audit sample pack: ${audits.outPath}`);
  console.log(`Issue slice summary: ${slices.summaryPath}`);
}

main();
