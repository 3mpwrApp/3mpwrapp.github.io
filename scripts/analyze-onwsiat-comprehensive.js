#!/usr/bin/env node
/**
 * Comprehensive ONWSIAT Data Analysis (2020-2026)
 * 
 * Analyzes:
 * - Temporal trends (yearly/monthly volumes)
 * - Keyword patterns (injuries, occupations, outcomes)
 * - Decision outcomes (allowed, dismissed, varied)
 * - Processing times
 * - Geographic patterns
 * - Common issues and trends
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');

// Load all data
console.log('📊 ONWSIAT Comprehensive Analysis (2020-2026)\n');
console.log('════════════════════════════════════════════════════════\n');

const allCases = [];
const yearlyData = {};

// Load historical data (contains whatever years are in file)
console.log('Loading historical data...');
const historicalFile = path.join(DATA_DIR, 'onwsiat-historical-20260404.json');
const historicalYears = new Set(); // Track which years are in historical file
if (fs.existsSync(historicalFile)) {
  const historical = JSON.parse(fs.readFileSync(historicalFile, 'utf8'));
  console.log(`✅ Loaded ${historical.length} historical cases`);
  allCases.push(...historical);
  
  // Group by year - FIX: Don't filter by year range, take what's available
  historical.forEach(c => {
    // Historical data uses case_id field
    const caseId = c.case_id || c.caseId || c.id || c.data?.caseId;
    if (caseId) {
      const year = caseId.toString().match(/^(\d{4})/)?.[1];
      if (year) {
        historicalYears.add(parseInt(year)); // Track this year
        if (!yearlyData[year]) yearlyData[year] = [];
        yearlyData[year].push(c);
      }
    }
  });
}

// Load recent years (2024-2026) - FIX: Skip if already loaded from historical file
console.log('Loading recent data (2024-2026)...');
for (const year of [2024, 2025, 2026]) {
  if (historicalYears.has(year)) {
    console.log(`⏭️  Skipping ${year} (already in historical file)`);
    continue;
  }
  const file = path.join(DATA_DIR, `onwsiat-${year}-ultra-slow.json`);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`✅ Loaded ${data.length} cases from ${year}`);
    allCases.push(...data);
    yearlyData[year] = data;
  }
}

console.log(`\n📈 Total cases loaded: ${allCases.length}\n`);
console.log('════════════════════════════════════════════════════════\n');

// Analysis 1: Yearly Volume Trends
console.log('📅 YEARLY VOLUME TRENDS\n');
const years = Object.keys(yearlyData).sort();
let prevCount = null;
years.forEach(year => {
  const count = yearlyData[year].length;
  const change = prevCount ? ((count - prevCount) / prevCount * 100).toFixed(1) : 'N/A';
  const trend = prevCount ? (count > prevCount ? '↑' : count < prevCount ? '↓' : '→') : ' ';
  console.log(`${year}: ${count.toString().padStart(6)} cases ${trend} ${change !== 'N/A' ? `(${change > 0 ? '+' : ''}${change}%)` : ''}`);
  prevCount = count;
});

// Analysis 2: Monthly Trends (2024-2026)
console.log('\n════════════════════════════════════════════════════════\n');
console.log('📆 MONTHLY TRENDS (2024-2026)\n');
const monthlyData = {};
[2024, 2025, 2026].forEach(year => {
  if (yearlyData[year]) {
    yearlyData[year].forEach(c => {
      const date = c.data?.decisionDate;
      if (date) {
        const month = date.substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) monthlyData[month] = 0;
        monthlyData[month]++;
      }
    });
  }
});

const months = Object.keys(monthlyData).sort();
const recentMonths = months.slice(-12); // Last 12 months
recentMonths.forEach(month => {
  const count = monthlyData[month];
  const bar = '█'.repeat(Math.ceil(count / 20));
  console.log(`${month}: ${count.toString().padStart(4)} ${bar}`);
});

// Analysis 3: Top Keywords
console.log('\n════════════════════════════════════════════════════════\n');
console.log('🔍 TOP KEYWORDS & ISSUES\n');
const keywords = {};
allCases.forEach(c => {
  const kw = c.data?.keywords;
  if (kw && typeof kw === 'string') {
    kw.split('—').forEach(k => {
      const clean = k.trim().toLowerCase();
      if (clean && clean.length > 3) {
        keywords[clean] = (keywords[clean] || 0) + 1;
      }
    });
  }
});

const sortedKeywords = Object.entries(keywords)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30);

console.log('Top 30 Keywords:\n');
sortedKeywords.forEach(([kw, count], i) => {
  const pct = (count / allCases.length * 100).toFixed(1);
  console.log(`${(i + 1).toString().padStart(2)}. ${kw.padEnd(40)} ${count.toString().padStart(5)} (${pct}%)`);
});

// Analysis 4: Injury Types
console.log('\n════════════════════════════════════════════════════════\n');
console.log('🏥 COMMON INJURY TYPES\n');
const injuryKeywords = ['chronic pain', 'back', 'shoulder', 'knee', 'mental stress', 
  'ptsd', 'concussion', 'hearing loss', 'carpal tunnel', 'neck', 'wrist', 'ankle'];

injuryKeywords.forEach(injury => {
  const count = allCases.filter(c => 
    c.data?.keywords?.toLowerCase().includes(injury)
  ).length;
  const pct = (count / allCases.length * 100).toFixed(1);
  if (count > 0) {
    console.log(`${injury.padEnd(20)} ${count.toString().padStart(5)} (${pct}%)`);
  }
});

// Analysis 5: Decision Patterns (use structured data where available)
console.log('\n════════════════════════════════════════════════════════\n');
console.log('⚖️  DECISION PATTERNS\n');
const outcomeKeywords = {
  'allowed': 0,
  'dismissed': 0,
  'varied': 0,
  'reconsideration': 0,
  'appeal': 0,
  'partial': 0,
  'denied': 0
};

allCases.forEach(c => {
  // Historical data has structured outcome field
  if (c.outcome) {
    const outcome = c.outcome.toLowerCase();
    if (outcome.includes('allow')) outcomeKeywords.allowed++;
    else if (outcome.includes('dismiss') || outcome.includes('deny')) outcomeKeywords.dismissed++;
    else if (outcome.includes('varied') || outcome.includes('partial')) outcomeKeywords.partial++;
    return;
  }
  
  // Recent data: analyze title/keywords
  const title = (c.data?.title || '').toLowerCase();
  const keywords = (c.data?.keywords || '').toLowerCase();
  const text = title + ' ' + keywords;
  
  if (text.includes('allowed') || text.includes('grant')) outcomeKeywords.allowed++;
  if (text.includes('dismiss') || text.includes('deny')) outcomeKeywords.dismissed++;
  if (text.includes('varied') || text.includes('vary') || text.includes('partial')) outcomeKeywords.varied++;
  if (text.includes('reconsideration')) outcomeKeywords.reconsideration++;
  if (text.includes('appeal')) outcomeKeywords.appeal++;
});

Object.entries(outcomeKeywords)
  .filter(([_, count]) => count > 0)
  .sort((a, b) => b[1] - a[1])
  .forEach(([outcome, count]) => {
    const pct = (count / allCases.length * 100).toFixed(1);
    console.log(`${outcome.charAt(0).toUpperCase() + outcome.slice(1).padEnd(19)} ${count.toString().padStart(5)} (${pct}%)`);
  });

// Analysis 6: Medical Conditions (from historical data)
console.log('\n════════════════════════════════════════════════════════\n');
console.log('🏥 MEDICAL CONDITIONS (2020-2023 Historical Data)\n');
const conditions = {};
allCases.forEach(c => {
  if (c.condition && c.condition !== 'Unknown') {
    const cond = c.condition.toLowerCase().trim();
    conditions[cond] = (conditions[cond] || 0) + 1;
  }
});

const sortedConditions = Object.entries(conditions)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

if (sortedConditions.length > 0) {
  sortedConditions.forEach(([cond, count]) => {
    const pct = (count / allCases.length * 100).toFixed(1);
    console.log(`${cond.padEnd(30)} ${count.toString().padStart(5)} (${pct}%)`);
  });
} else {
  console.log('(No condition data available)');
}

// Analysis 7: Data Quality Check
console.log('\n════════════════════════════════════════════════════════\n');
console.log('✅ DATA QUALITY CHECK\n');
const missingData = {
  decisionDate: 0,
  keywords: 0,
  title: 0,
  url: 0
};

allCases.forEach(c => {
  // Check both historical and recent data formats
  const hasDate = c.data?.decisionDate || c.date !== 'Unknown';
  const hasKeywords = c.data?.keywords || c.condition;
  const hasTitle = c.data?.title || c.title;
  const hasUrl = c.data?.url || c.url;
  
  if (!hasDate) missingData.decisionDate++;
  if (!hasKeywords) missingData.keywords++;
  if (!hasTitle) missingData.title++;
  if (!hasUrl) missingData.url++;
});

console.log(`Total cases: ${allCases.length}`);
console.log(`Complete records: ${allCases.length - Math.max(...Object.values(missingData))} (${((1 - Math.max(...Object.values(missingData)) / allCases.length) * 100).toFixed(1)}%)`);
console.log(`Missing decision dates: ${missingData.decisionDate} (${(missingData.decisionDate / allCases.length * 100).toFixed(1)}%)`);
console.log(`Missing keywords: ${missingData.keywords} (${(missingData.keywords / allCases.length * 100).toFixed(1)}%)`);
console.log(`Missing titles: ${missingData.title} (${(missingData.title / allCases.length * 100).toFixed(1)}%)`);
console.log(`Missing URLs: ${missingData.url} (${(missingData.url / allCases.length * 100).toFixed(1)}%)`);

console.log(`\nData Breakdown:`);
console.log(`  2020-2023 (Historical): ${Object.values(yearlyData).filter((v, i) => Object.keys(yearlyData)[i] < '2024').reduce((a, b) => a + b.length, 0)} cases`);
console.log(`  2024-2026 (Recent): ${Object.values(yearlyData).filter((v, i) => Object.keys(yearlyData)[i] >= '2024').reduce((a, b) => a + b.length, 0)} cases`);
// Save summary report
const report = {
  generatedAt: new Date().toISOString(),
  totalCases: allCases.length,
  yearRange: `${years[0]}-${years[years.length - 1]}`,
  yearlyBreakdown: Object.fromEntries(
    years.map(y => [y, yearlyData[y].length])
  ),
  topKeywords: sortedKeywords.slice(0, 20).map(([kw, count]) => ({ keyword: kw, count })),
  commonInjuries: injuryKeywords
    .map(injury => ({
      type: injury,
      count: allCases.filter(c => c.data?.keywords?.toLowerCase().includes(injury)).length
    }))
    .filter(i => i.count > 0)
    .sort((a, b) => b.count - a.count),
  outcomes: outcomeKeywords,
  dataQuality: {
    total: allCases.length,
    completeness: (1 - (Object.values(missingData).reduce((a, b) => a + b, 0) / (allCases.length * 4))) * 100
  }
};

const reportPath = path.join(DATA_DIR, 'ONWSIAT-ANALYSIS-REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n📄 Full report saved to: ${reportPath}\n`);
console.log('════════════════════════════════════════════════════════\n');
