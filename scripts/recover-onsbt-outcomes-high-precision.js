#!/usr/bin/env node

/**
 * ONSBT High-Precision Outcome Recovery
 * Metadata-only (no browser scraping): extracts only explicit disposition phrases
 * from keywords_api and abstains otherwise.
 */

const fs = require('fs');
const path = require('path');

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

const EXPLICIT_RULES = [
  { outcome: 'Granted', confidence: 95, pattern: /appeal\s+(is\s+)?allowed/i },
  { outcome: 'Granted', confidence: 95, pattern: /appeal\s+(is\s+)?granted/i },
  { outcome: 'Granted', confidence: 92, pattern: /reconsideration\s+granted/i },
  { outcome: 'Granted', confidence: 92, pattern: /decision\s+(is\s+)?rescinded/i },
  { outcome: 'Denied', confidence: 95, pattern: /appeal\s+(is\s+)?dismissed/i },
  { outcome: 'Denied', confidence: 92, pattern: /application\s+(is\s+)?dismissed/i },
  { outcome: 'Denied', confidence: 92, pattern: /overpayment\s+(was\s+)?correct/i },
  { outcome: 'Denied', confidence: 92, pattern: /not\s+entitled/i },
  { outcome: 'Deferred', confidence: 90, pattern: /withdrawn|abandoned|adjourned|deferred/i },
  { outcome: 'Other', confidence: 88, pattern: /interim\s+decision|interim\s+order/i },
  { outcome: 'Other', confidence: 88, pattern: /costs\s+decision/i },
];

function inferFromKeywords(keywordsApi) {
  if (!Array.isArray(keywordsApi) || keywordsApi.length === 0) {
    return { inferred_outcome: 'Unknown', confidence: 0, match: null };
  }

  const text = keywordsApi.join(' | ');
  for (const rule of EXPLICIT_RULES) {
    if (rule.pattern.test(text)) {
      return {
        inferred_outcome: rule.outcome,
        confidence: rule.confidence,
        match: rule.pattern.source,
      };
    }
  }

  return { inferred_outcome: 'Unknown', confidence: 0, match: null };
}

function main() {
  const dataDir = path.join(__dirname, '..', 'data', 'tribunal-decisions');
  const rows = [];

  const stats = {
    total: 0,
    recovered: 0,
    unknown: 0,
    byOutcome: { Granted: 0, Denied: 0, Deferred: 0, Other: 0, Unknown: 0 },
  };

  for (const year of YEARS) {
    const file = path.join(dataDir, `onsbt-${year}-complete.json`);
    if (!fs.existsSync(file)) continue;

    const cases = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const c of cases) {
      stats.total += 1;

      const inferred = inferFromKeywords(c.keywords_api);
      if (inferred.inferred_outcome === 'Unknown') {
        stats.unknown += 1;
        stats.byOutcome.Unknown += 1;
      } else {
        stats.recovered += 1;
        stats.byOutcome[inferred.inferred_outcome] += 1;
      }

      rows.push({
        case_id: c.case_id,
        citation: c.citation,
        decision_date: c.decision_date,
        docket_number: c.docket_number,
        url: c.url,
        inferred_outcome: inferred.inferred_outcome,
        recovery_confidence: inferred.confidence,
        matched_rule: inferred.match,
        keywords_api: c.keywords_api,
      });
    }
  }

  const outFile = path.join(dataDir, 'onsbt-outcomes-high-precision.json');
  fs.writeFileSync(outFile, JSON.stringify(rows, null, 2));

  console.log('High-Precision Recovery Summary');
  console.log('='.repeat(60));
  console.log(`Total cases: ${stats.total}`);
  console.log(`Recovered (explicit only): ${stats.recovered} (${((stats.recovered / stats.total) * 100).toFixed(1)}%)`);
  console.log(`Unknown (abstained): ${stats.unknown} (${((stats.unknown / stats.total) * 100).toFixed(1)}%)`);
  console.log('By outcome:');
  Object.entries(stats.byOutcome).forEach(([k, v]) => {
    console.log(`  ${k}: ${v}`);
  });
  console.log(`\nSaved: ${outFile}`);
}

main();
