#!/usr/bin/env node
/**
 * Export Tribunal Data for App Integration
 * 
 * Reads comprehensive tribunal analysis from website data and generates
 * simplified JSON files optimized for React Native app consumption.
 * 
 * Input: data/tribunal-decisions/ (website repository)
 * Output: Formatted JSON files ready for empowrapp-new/data/tribunal-decisions/
 * 
 * Authors: Lissa Beaulieu (Founder, 3mpwrApp) & GitHub Copilot
 * Date: April 26, 2026
 */

const fs = require('fs');
const path = require('path');

// ===== PATHS =====
const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');
const OUTPUT_DIR = path.join(__dirname, '../data/tribunal-decisions/app-export');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🔄 Exporting tribunal data for app integration...\n');

// ===== LOAD SOURCE DATA =====

function loadJSON(filename) {
  try {
    const filepath = path.join(DATA_DIR, filename);
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch (error) {
    console.error(`❌ Error loading ${filename}:`, error.message);
    return null;
  }
}

const onwsiatSummary = loadJSON('onwsiat-outcomes-3-tier-summary.json');
const onwsibSummary = loadJSON('onwsib-outcomes-3-tier-summary.json');
const onsbtSummary = loadJSON('onsbt-outcomes-3-tier-summary.json');
const hrtoSummary = loadJSON('onhrt-outcomes-3-tier-summary.json'); // Note: file uses 'onhrt' not 'hrto'

const evidenceTable = loadJSON('justice-evidence-table-strict.json');
const auditCI = loadJSON('tribunal-audit-error-rate-estimates.json');
const issueSlices = loadJSON('issue-slices-summary.json');

// ===== KEYWORD ANALYSIS =====

// ONSBT top issues (from analyze-onsbt-keywords.js output)
const onsbtTopIssues = [
  { issue: 'Person with disability determination', percentage: 75.9, count: 10477 },
  { issue: 'Impairments/functional limitations', percentage: 64.8, count: 8941 },
  { issue: 'Substantial impairment test', percentage: 49.4, count: 6813 },
  { issue: 'Pain-related cases', percentage: 25.7, count: 3542 },
  { issue: 'Medical verification required', percentage: 11.8, count: 1628 },
  { issue: 'Overpayment allegations', percentage: 5.4, count: 739 },
];

// ONWSIB top issues (from analyze-onwsib-keywords.js output)
const onwsibTopIssues = [
  { issue: 'Worker designation', percentage: 80.0, count: 345 },
  { issue: 'Work-related injury determination', percentage: 12.1, count: 52 },
  { issue: 'Pre-existing condition defense', percentage: 6.7, count: 29 },
  { issue: 'Knee injuries', percentage: 4.9, count: 21 },
  { issue: 'Shoulder injuries', percentage: 4.2, count: 18 },
  { issue: 'Benefits eligibility', percentage: 6.3, count: 27 },
];

// WSIAT top issues (from existing analysis)
const wsiatTopIssues = [
  { issue: 'Pre-existing condition denial', percentage: 13.3, count: 1522 },
  { issue: 'Chronic pain cases', percentage: 2.1, count: 239 },
  { issue: 'Entitlement determination', percentage: 9.2, count: 1055 },
  { issue: 'Work-related injury proof', percentage: 6.1, count: 700 },
  { issue: 'Non-compensable classification', percentage: 1.2, count: 138 },
];

// HRTO top issues (from existing analysis)
const hrtoTopIssues = [
  { issue: 'Case abandonment', percentage: 73.5, count: 3138 },
  { issue: 'Email delivery issues', percentage: 36.6, count: 983 },
  { issue: 'Deadline compliance', percentage: 28.8, count: 1200 },
  { issue: 'Dismissed applications', percentage: 26.8, count: 1146 },
  { issue: 'Reconsideration requests', percentage: 5.2, count: 223 },
];

// ===== GENERATE TRIBUNAL SUMMARY =====

function generateTribunalSummary(id, name, fullName, summary, topIssues, auditData) {
  if (!summary) {
    console.warn(`⚠️  No summary data for ${id}, skipping...`);
    return null;
  }

  const tierA = summary.tier_a_confirmed || summary.tierA || {};
  const tierB = summary.tier_b_probable || summary.tierB || {};
  const tierC = summary.tier_c_unresolved || summary.tierC || {};

  const totalCases = (tierA.count || 0) + (tierB.count || 0) + (tierC.count || 0);

  return {
    id,
    name,
    fullName,
    totalCases,
    yearRange: '2020-2026',
    tierA: {
      count: tierA.count || 0,
      percentage: totalCases > 0 ? ((tierA.count || 0) / totalCases * 100).toFixed(1) : 0,
    },
    tierB: {
      count: tierB.count || 0,
      percentage: totalCases > 0 ? ((tierB.count || 0) / totalCases * 100).toFixed(1) : 0,
    },
    tierC: {
      count: tierC.count || 0,
      percentage: totalCases > 0 ? ((tierC.count || 0) / totalCases * 100).toFixed(1) : 0,
    },
    topIssues: topIssues.slice(0, 5), // Top 5 issues
    auditCI: auditData ? {
      tierBError: auditData.tier_b_proxy_error_estimate || 'N/A',
      tierCMissed: auditData.tier_c_missed_explicit_estimate || 'N/A',
    } : undefined,
  };
}

const tribunals = [
  {
    ...generateTribunalSummary(
      'wsiat',
      'WSIAT',
      'Workplace Safety and Insurance Appeals Tribunal',
      onwsiatSummary,
      wsiatTopIssues,
      auditCI?.onwsiat
    ),
    keyFinding: '65-73% worker success rate (official statistics)',
    successRate: '65-73%',
  },
  {
    ...generateTribunalSummary(
      'hrto',
      'HRTO',
      'Human Rights Tribunal of Ontario',
      hrtoSummary || { tierA: { count: 4618 }, tierB: { count: 1 }, tierC: { count: 4650 } }, // Fallback
      hrtoTopIssues,
      auditCI?.hrto
    ),
    keyFinding: '73.5% abandonment rate, 70.1% cite email issues',
    successRate: '0.7% applicant victory',
  },
  {
    ...generateTribunalSummary(
      'onsbt',
      'ONSBT',
      'Ontario Social Benefits Tribunal',
      onsbtSummary,
      onsbtTopIssues,
      auditCI?.onsbt
    ),
    keyFinding: '67.4% grant rate in classified cases',
    successRate: '67.4%',
  },
  {
    ...generateTribunalSummary(
      'onwsib',
      'ONWSIB',
      'WSIB Internal Review',
      onwsibSummary,
      onwsibTopIssues,
      auditCI?.onwsib
    ),
    keyFinding: '89.5% probable grant rate, very limited data',
    successRate: '89.5% (probable)',
  },
].filter(Boolean); // Remove nulls

// ===== TRIBUNAL COMPARISON =====

const tribunalComparison = {
  tribunals,
  totalCases: tribunals.reduce((sum, t) => sum + t.totalCases, 0),
  analysisDate: '2026-04-26',
  methodology: 'Tiered evidence framework (Tier A: confirmed, Tier B: probable, Tier C: unresolved) with Wilson 95% confidence intervals for audit estimates.',
  authors: 'Lissa Beaulieu (Founder, 3mpwrApp) & GitHub Copilot',
};

// ===== ONSBT-SPECIFIC DATA =====

const onsbtAnalysis = {
  tribunal: 'ONSBT',
  fullName: 'Ontario Social Benefits Tribunal',
  totalCases: 13798,
  yearRange: '2020-2026',
  grantRate: 67.4,
  denialRate: 32.1,
  topIssues: onsbtTopIssues,
  context: {
    odspRates: {
      singlePerson: 1368,
      averageRent: 2200,
      deficit: -832,
      description: 'ODSP single person rate ($1,368/month) cannot cover average 1-BR rent ($2,200+/month) leaving -$832/month deficit before food, utilities, medication, or transit.',
    },
    resources: [
      { title: 'ODSP Rates (official)', url: 'https://www.ontario.ca/page/social-assistance-rates' },
      { title: 'Income Security Tracker', url: 'https://incomesecurity.org/policy/income-support-tracker/' },
      { title: 'ACORN ODSP Campaign', url: 'https://acorncanada.org/campaigns/odsp' },
      { title: 'CBC Homelessness Crisis', url: 'https://www.cbc.ca/news/canada/toronto/ontario-disability-homelessness-housing-1.7083951' },
      { title: 'StatCan Material Deprivation', url: 'https://www150.statcan.gc.ca/n1/pub/75-006-x/2023001/article/00002-eng.htm' },
    ],
  },
  tiers: {
    tierA: { count: 494, percentage: 3.6, description: 'Confirmed explicit dispositions' },
    tierB: { count: 3251, percentage: 23.6, description: 'Probable keyword inference' },
    tierC: { count: 10053, percentage: 72.9, description: 'Unresolved metadata gap' },
  },
};

// ===== ONWSIB-SPECIFIC DATA =====

const onwsibAnalysis = {
  tribunal: 'ONWSIB',
  fullName: 'WSIB Internal Review',
  totalCases: 431,
  yearRange: '2020-2026',
  probableGrantRate: 89.5,
  topIssues: onwsibTopIssues,
  threeStageSystem: {
    stage1: {
      name: 'WSIB Initial Decision',
      description: 'Workplace Safety and Insurance Board decides on your claim',
      outcome: 'If denied, you have 2 appeal options',
    },
    stage2: {
      name: 'ONWSIB Internal Review (optional)',
      description: 'WSIB reviews its own decision',
      probableGrantRate: 89.5,
      dataQuality: 'Very limited (95.4% unresolved in public records)',
      recommendation: 'Most workers skip this and go straight to WSIAT',
    },
    stage3: {
      name: 'WSIAT Independent Appeal',
      description: 'Independent tribunal (not WSIB)',
      successRate: '65-73%',
      casesAnalyzed: 11430,
      recommendation: 'Primary appeal venue for most workers',
    },
  },
  tiers: {
    tierA: { count: 1, percentage: 0.2, description: 'Confirmed explicit dispositions' },
    tierB: { count: 19, percentage: 4.4, description: 'Probable keyword inference' },
    tierC: { count: 411, percentage: 95.4, description: 'Unresolved metadata gap' },
  },
};

// ===== ISSUE SLICES (if available) =====

const issueSlicesForApp = issueSlices ? {
  slices: [
    {
      issue: 'Chronic Pain',
      totalCases: issueSlices.chronic_pain?.total || 349,
      byTribunal: issueSlices.chronic_pain?.by_tribunal || {},
      description: 'Cases involving chronic pain conditions and their classification challenges',
    },
    {
      issue: 'Pre-Existing Condition',
      totalCases: issueSlices.pre_existing_condition?.total || 1519,
      byTribunal: issueSlices.pre_existing_condition?.by_tribunal || {},
      description: 'Denial pattern escalation: 6.7% at ONWSIB → 13.3% at WSIAT',
    },
    {
      issue: 'Entitlement Denied',
      totalCases: issueSlices.entitlement_denied?.total || 20,
      byTribunal: issueSlices.entitlement_denied?.by_tribunal || {},
      description: 'Cases where initial entitlement to benefits was denied',
    },
  ],
  methodology: 'Cross-tribunal keyword matching and outcome classification',
} : null;

// ===== WRITE OUTPUT FILES =====

const outputFiles = [
  { filename: 'tribunal-comparison.json', data: tribunalComparison },
  { filename: 'onsbt-analysis.json', data: onsbtAnalysis },
  { filename: 'onwsib-analysis.json', data: onwsibAnalysis },
  { filename: 'issue-slices.json', data: issueSlicesForApp },
];

outputFiles.forEach(({ filename, data }) => {
  if (data) {
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`✅ Exported: ${filename}`);
  } else {
    console.warn(`⚠️  Skipped: ${filename} (no data)`);
  }
});

// ===== GENERATE README =====

const readme = `# Tribunal Data Export for App

Generated: ${new Date().toISOString()}
Authors: Lissa Beaulieu (Founder, 3mpwrApp) & GitHub Copilot

## Files

- **tribunal-comparison.json** - Summary of all 4 tribunals with Tier A/B/C breakdown
- **onsbt-analysis.json** - ONSBT 13,798 decisions + ODSP poverty context
- **onwsib-analysis.json** - ONWSIB 431 decisions + 3-stage system explanation
- **issue-slices.json** - Cross-tribunal issue analysis (chronic pain, pre-existing, entitlement)

## Usage in App

Copy these files to:
\`\`\`
empowrapp-new/data/tribunal-decisions/
\`\`\`

Import in screens:
\`\`\`typescript
import tribunalComparison from '../../../data/tribunal-decisions/tribunal-comparison.json';
import onsbtAnalysis from '../../../data/tribunal-decisions/onsbt-analysis.json';
import onwsibAnalysis from '../../../data/tribunal-decisions/onwsib-analysis.json';
\`\`\`

## TypeScript Types

See: \`empowrapp-new/types/tribunalData.ts\` for interface definitions.

## Data Source

All data derived from CanLII tribunal decisions (2020-2026):
- WSIAT: 11,430 decisions
- HRTO: 9,269 decisions  
- ONSBT: 13,798 decisions
- ONWSIB: 431 decisions

Total: 35,928 tribunal decisions analyzed.
`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readme);
console.log(`✅ Exported: README.md\n`);

console.log('✨ Export complete!');
console.log(`📂 Output directory: ${OUTPUT_DIR}`);
console.log('\n📋 Next steps:');
console.log('1. Copy files to empowrapp-new/data/tribunal-decisions/');
console.log('2. Create TypeScript types (see TRIBUNAL_DATA_INTEGRATION_PLAN.md)');
console.log('3. Build tribunal research screens in app');
