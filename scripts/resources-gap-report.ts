#!/usr/bin/env ts-node
/* Resources Gap Report Script (CommonJS-friendly) */
// Usage:
//   npx ts-node scripts/resources-gap-report.ts [--json] [--out reports/resources-gap.json]

 
const { writeFileSync, mkdirSync } = require("fs");
const path = require("path");

 
const { resources } = require("../data/resources");

interface BaselineNeed {
  key: string; // semantic key
  label: string; // human label
  match: (r: any) => boolean; // predicate
  requiredIn: (province: string) => boolean; // whether required for province
}

// Provinces / territories codes used in data
const PROVINCES = [
  "AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"
];

// Baseline requirements (keep small & extensible). Each semantic key should have a predicate.
const BASELINE: BaselineNeed[] = [
  {
    key: "employment_standards",
    label: "Employment Standards",
    match: (r) => /Employment Standards/i.test(r.title),
    requiredIn: () => true,
  },
  {
    key: "human_rights",
    label: "Human Rights / Commission",
    match: (r) => /Human Rights/i.test(r.title) || /Rights \(/i.test(r.title),
    requiredIn: () => true,
  },
  {
    key: "income_support",
    label: "Income / Disability Assistance",
    match: (r) => /(Disability|Income|Assistance|Support) (Program|Support|Assistance|PWD|AISH|SAID)/i.test(r.title) || /(ODSP|AISH|SAID|PWD)/i.test(r.title),
    requiredIn: () => true,
  },
  {
    key: "workers_comp",
    label: "Workers' Compensation / WCB",
    match: (r) => /(WCB|WSIB|WorkSafe|CNESST|WSCC|Workers.? Compensation)/i.test(r.title),
    requiredIn: () => true,
  },
  {
    key: "appeals_overview",
    label: "Appeals / Reconsideration Overview",
    match: (r) => /Appeal|Reconsideration/i.test(r.title),
    requiredIn: () => true,
  },
  {
    key: "accommodation_guidance",
    label: "Accommodation Guidance",
    match: (r) => /Accommodation/i.test(r.title),
    requiredIn: () => true,
  },
];

// Helper: map province code to the resources relevant to it (including Canada-wide for universal keys)
function provinceResources(code: string) {
  return resources.filter((r: any) => {
    if (r.scope === "province" && r.province === code) return true;
    if (r.scope === "canada") return true; // treat federal as universal
    if (Array.isArray(r.jurisdictions) && r.jurisdictions.includes(code)) return true;
    return false;
  });
}

interface ProvinceReport {
  present: string[];
  missing: string[];
  matchedResources: Record<string, string[]>;
}

const report: Record<string, ProvinceReport> = {};
for (const prov of PROVINCES) {
  const list = provinceResources(prov);
  const matchedResources: Record<string, string[]> = {};
  const present: string[] = [];
  for (const need of BASELINE) {
    if (!need.requiredIn(prov)) continue;
    const matches = list.filter(need.match);
    if (matches.length) {
      present.push(need.key);
  matchedResources[need.key] = matches.map((m: any) => m.id);
    }
  }
  const requiredKeys = BASELINE.filter((n) => n.requiredIn(prov)).map((n) => n.key);
  const missing = requiredKeys.filter((k) => !present.includes(k));
  report[prov] = { present, missing, matchedResources };
}

// Aggregate summary
const aggregate = {
  provinces: PROVINCES.length,
  requirementKeys: BASELINE.map((b) => b.key),
  missingByKey: BASELINE.reduce<Record<string, string[]>>((acc, need) => {
    acc[need.key] = PROVINCES.filter((p) => report[p].missing.includes(need.key));
    return acc;
  }, {}),
};

// Render console output
function renderConsole() {
  console.warn("Resources Gap Report\n====================\n");
  for (const prov of PROVINCES) {
    const { present, missing } = report[prov];
    console.warn(`${prov}: present ${present.length}/${BASELINE.length}`);
    if (missing.length) console.warn(`  Missing: ${missing.join(", ")}`);
  }
  console.warn("\nAggregate Missing Counts:");
  for (const key of BASELINE.map((b) => b.key)) {
    const missingList = aggregate.missingByKey[key];
    console.warn(`  ${key}: missing in ${missingList.length} provinces`);
  }
}

const args = process.argv.slice(2);
const asJson = args.includes("--json");
let outPath = "";
const outIndex = args.findIndex((a) => a === "--out");
if (outIndex !== -1 && args[outIndex + 1]) outPath = args[outIndex + 1];

if (asJson && outPath) {
  const full = path.resolve(outPath);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, JSON.stringify({ report, aggregate }, null, 2), "utf-8");
  console.warn(`Wrote JSON report to ${full}`);
} else if (asJson) {
  console.warn(JSON.stringify({ report, aggregate }, null, 2));
} else {
  renderConsole();
}
