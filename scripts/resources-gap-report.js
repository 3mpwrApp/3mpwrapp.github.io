#!/usr/bin/env node
/* Resources Gap Report Script (CommonJS JS version)
 * Usage:
 *   node scripts/resources-gap-report.js [--json] [--out reports/resources-gap.json]
 */

const { writeFileSync, mkdirSync } = require('fs');
const path = require('path');

// Prefer JS mirror to avoid TS transpilation at runtime
const { resources } = require('../data/resources.js');

const PROVINCES = [ 'AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT' ];

const BASELINE = [
  {
    key: 'employment_standards',
    label: 'Employment Standards',
    match: (r) => /Employment Standards/i.test(r.title),
    requiredIn: () => true,
  },
  {
    key: 'human_rights',
    label: 'Human Rights / Commission',
    match: (r) => /Human Rights/i.test(r.title) || /Rights \(/i.test(r.title),
    requiredIn: () => true,
  },
  {
    key: 'income_support',
    label: 'Income / Disability Assistance',
    match: (r) => /(Disability|Income|Assistance|Support) (Program|Support|Assistance|PWD|AISH|SAID|Solidarity)/i.test(r.title) || /(ODSP|AISH|SAID|PWD|EIA|Solidarity)/i.test(r.title),
    requiredIn: () => true,
  },
  {
    key: 'workers_comp',
    label: "Workers' Compensation / WCB",
    match: (r) => /(WCB|WSIB|WorkSafe|CNESST|WSCC|Workers.? Compensation|WorkplaceNL|Compensation Board)/i.test(r.title),
    requiredIn: () => true,
  },
  {
    key: 'appeals_overview',
    label: 'Appeals / Reconsideration Overview',
    match: (r) => /Appeal|Reconsideration/i.test(r.title),
    requiredIn: () => true,
  },
  {
    key: 'accommodation_guidance',
    label: 'Accommodation Guidance',
    match: (r) => /Accommodation/i.test(r.title),
    requiredIn: () => true,
  },
];

function provinceResources(code) {
  return resources.filter((r) => {
    if (r.scope === 'province' && r.province === code) return true;
    if (r.scope === 'canada') return true;
    if (Array.isArray(r.jurisdictions) && r.jurisdictions.includes(code)) return true;
    return false;
  });
}

const report = {};
for (const prov of PROVINCES) {
  const list = provinceResources(prov);
  const matchedResources = {};
  const present = [];
  for (const need of BASELINE) {
    if (!need.requiredIn(prov)) continue;
    const matches = list.filter(need.match);
    if (matches.length) {
      present.push(need.key);
      matchedResources[need.key] = matches.map((m) => m.id);
    }
  }
  const requiredKeys = BASELINE.filter((n) => n.requiredIn(prov)).map((n) => n.key);
  const missing = requiredKeys.filter((k) => !present.includes(k));
  report[prov] = { present, missing, matchedResources };
}

const aggregate = {
  provinces: PROVINCES.length,
  requirementKeys: BASELINE.map((b) => b.key),
  missingByKey: BASELINE.reduce((acc, need) => {
    acc[need.key] = PROVINCES.filter((p) => report[p].missing.includes(need.key));
    return acc;
  }, {}),
};

function renderConsole() {
  console.log('Resources Gap Report\n====================\n');
  for (const prov of PROVINCES) {
    const { present, missing } = report[prov];
    console.log(`${prov}: present ${present.length}/${BASELINE.length}`);
    if (missing.length) console.log(`  Missing: ${missing.join(', ')}`);
  }
  console.log('\nAggregate Missing Counts:');
  for (const key of BASELINE.map((b) => b.key)) {
    const missingList = aggregate.missingByKey[key];
    console.log(`  ${key}: missing in ${missingList.length} provinces`);
  }
}

const args = process.argv.slice(2);
const asJson = args.includes('--json');
let outPath = '';
const outIndex = args.findIndex((a) => a === '--out');
if (outIndex !== -1 && args[outIndex + 1]) outPath = args[outIndex + 1];

if (asJson && outPath) {
  const full = path.resolve(outPath);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, JSON.stringify({ report, aggregate }, null, 2), 'utf-8');
  console.log(`Wrote JSON report to ${full}`);
} else if (asJson) {
  console.log(JSON.stringify({ report, aggregate }, null, 2));
} else {
  renderConsole();
}
