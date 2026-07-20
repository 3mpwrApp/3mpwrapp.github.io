/**
 * Update ONSBT & ONWSIB Content with Classifications
 * 
 * Generates statistics and content snippets for both tribunals.
 * 
 * Usage: node scripts/update-ontario-social-content.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const ONSBT_FILE = path.join(__dirname, '..', 'data/comprehensive-extraction/onsbt-classified.json');
const ONWSIB_FILE = path.join(__dirname, '..', 'data/comprehensive-extraction/onwsib-classified.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'docs/ontario-social-tribunals-content-updates.json');
const BLOG_SNIPPET_FILE = path.join(__dirname, '..', 'docs/ontario-social-tribunals-blog-snippet.md');

function pct(count, total) {
  return ((count / total) * 100).toFixed(1);
}

/**
 * Analyze ONSBT classifications
 */
function analyzeONSBT() {
  console.log('📊 Analyzing ONSBT classifications...\n');
  
  const data = JSON.parse(fs.readFileSync(ONSBT_FILE, 'utf8'));
  const decisions = data.decisions;
  
  // Overall outcome distribution
  const outcomes = {};
  decisions.forEach(d => {
    const outcome = d.outcome || 'unknown';
    outcomes[outcome] = (outcomes[outcome] || 0) + 1;
  });
  
  // Year-by-year breakdown
  const yearlyBreakdown = {};
  decisions.forEach(d => {
    const year = d.year;
    if (!yearlyBreakdown[year]) {
      yearlyBreakdown[year] = { total: 0, outcomes: {} };
    }
    yearlyBreakdown[year].total++;
    const outcome = d.outcome || 'unknown';
    yearlyBreakdown[year].outcomes[outcome] = (yearlyBreakdown[year].outcomes[outcome] || 0) + 1;
  });
  
  // Clear outcomes (allowed + denied + partial)
  const clearOutcomes = (outcomes.allowed || 0) + (outcomes.denied || 0) + (outcomes.partial || 0);
  const workerWins = (outcomes.allowed || 0) + (outcomes.partial || 0);
  const winRate = clearOutcomes > 0 ? pct(workerWins, clearOutcomes) : 0;
  
  console.log(`Total: ${decisions.length.toLocaleString()} decisions`);
  console.log(`Clear outcomes: ${clearOutcomes.toLocaleString()}`);
  console.log(`Worker win rate: ${winRate}%\n`);
  
  return {
    tribunal: 'ONSBT',
    fullName: 'Ontario Social Benefits Tribunal',
    totalDecisions: decisions.length,
    dateRange: '2020-2026',
    outcomes,
    yearlyBreakdown,
    clearOutcomes,
    workerWins,
    winRate: parseFloat(winRate),
  };
}

/**
 * Analyze ONWSIB classifications
 */
function analyzeONWSIB() {
  console.log('📊 Analyzing ONWSIB classifications...\n');
  
  const data = JSON.parse(fs.readFileSync(ONWSIB_FILE, 'utf8'));
  const decisions = data.decisions;
  
  // Overall outcome distribution
  const outcomes = {};
  decisions.forEach(d => {
    const outcome = d.outcome || 'unknown';
    outcomes[outcome] = (outcomes[outcome] || 0) + 1;
  });
  
  // Year-by-year breakdown
  const yearlyBreakdown = {};
  decisions.forEach(d => {
    const year = d.year;
    if (!yearlyBreakdown[year]) {
      yearlyBreakdown[year] = { total: 0, outcomes: {} };
    }
    yearlyBreakdown[year].total++;
    const outcome = d.outcome || 'unknown';
    yearlyBreakdown[year].outcomes[outcome] = (yearlyBreakdown[year].outcomes[outcome] || 0) + 1;
  });
  
  // Clear outcomes (allowed + denied + partial + remitted)
  const clearOutcomes = (outcomes.allowed || 0) + (outcomes.denied || 0) + (outcomes.partial || 0) + (outcomes.remitted || 0);
  const workerWins = (outcomes.allowed || 0) + (outcomes.partial || 0) + (outcomes.remitted || 0);
  const winRate = clearOutcomes > 0 ? pct(workerWins, clearOutcomes) : 0;
  
  console.log(`Total: ${decisions.length.toLocaleString()} decisions`);
  console.log(`Clear outcomes: ${clearOutcomes.toLocaleString()}`);
  console.log(`Worker win rate: ${winRate}%\n`);
  
  return {
    tribunal: 'ONWSIB',
    fullName: 'Ontario Workplace Safety & Insurance Board - Internal Review',
    totalDecisions: decisions.length,
    dateRange: '2021-2025',
    outcomes,
    yearlyBreakdown,
    clearOutcomes,
    workerWins,
    winRate: parseFloat(winRate),
  };
}

/**
 * Generate blog post snippet
 */
function generateBlogSnippet(onsbtStats, onwsibStats) {
  const onsbtTotal = onsbtStats.totalDecisions;
  const onwsibTotal = onwsibStats.totalDecisions;
  
  let md = `## 🎯 Ontario Social Tribunals Classification Results\n\n`;
  md += `### ONSBT: ${onsbtTotal.toLocaleString()} Decisions Analyzed (2020-2026)\n\n`;
  md += `**Outcome Distribution:**\n\n`;
  md += `| Outcome | Count | Percentage |\n`;
  md += `|---------|-------|------------|\n`;
  
  Object.entries(onsbtStats.outcomes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([outcome, count]) => {
      md += `| ${outcome} | ${count.toLocaleString()} | ${pct(count, onsbtTotal)}% |\n`;
    });
  
  md += `\n**Key Finding:** ${onsbtStats.winRate}% success rate from ${onsbtStats.clearOutcomes} clear outcomes (allowed + partial)\n\n`;
  md += `**Interpretation:** ONSBT shows significantly higher clarity in outcomes compared to WSIAT (${(100 - parseFloat(pct(onsbtStats.outcomes.unclear, onsbtTotal))).toFixed(1)}% clear vs. WSIAT's 23%). `;
  md += `Social benefits appeals have more explicit eligibility determinations.\n\n`;
  
  md += `---\n\n`;
  md += `### ONWSIB: ${onwsibTotal.toLocaleString()} Decisions Analyzed (2021-2025)\n\n`;
  md += `**Outcome Distribution:**\n\n`;
  md += `| Outcome | Count | Percentage |\n`;
  md += `|---------|-------|------------|\n`;
  
  Object.entries(onwsibStats.outcomes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([outcome, count]) => {
      md += `| ${outcome} | ${count.toLocaleString()} | ${pct(count, onwsibTotal)}% |\n`;
    });
  
  md += `\n**Key Finding:** ${onwsibStats.winRate}% success rate from ${onwsibStats.clearOutcomes} clear outcomes\n\n`;
  md += `**Interpretation:** ONWSIB (internal WSIB reviews) shows extremely high "unclear" outcomes (${pct(onwsibStats.outcomes.unclear, onwsibTotal)}%), `;
  md += `suggesting most decisions lack explicit outcome language or involve complex medical determinations.\n\n`;
  
  md += `---\n\n`;
  md += `### Cross-Tribunal Comparison\n\n`;
  md += `| Tribunal | Total Decisions | Clear Outcomes | Win Rate | Unclear Rate |\n`;
  md += `|----------|----------------|----------------|----------|-------------|\n`;
  md += `| WSIAT | 98,992 | 393 (3.4%) | 89.1% | 77.0% |\n`;
  md += `| ONSBT | ${onsbtTotal.toLocaleString()} | ${onsbtStats.clearOutcomes.toLocaleString()} (${pct(onsbtStats.clearOutcomes, onsbtTotal)}%) | ${onsbtStats.winRate}% | ${pct(onsbtStats.outcomes.unclear, onsbtTotal)}% |\n`;
  md += `| ONWSIB | ${onwsibTotal.toLocaleString()} | ${onwsibStats.clearOutcomes.toLocaleString()} (${pct(onwsibStats.clearOutcomes, onwsibTotal)}%) | ${onwsibStats.winRate}% | ${pct(onwsibStats.outcomes.unclear, onwsibTotal)}% |\n\n`;
  
  return md;
}

/**
 * Generate visualization data
 */
function generateVisualizationData(onsbtStats, onwsibStats) {
  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      tribunals: ['ONSBT', 'ONWSIB'],
      totalDecisions: onsbtStats.totalDecisions + onwsibStats.totalDecisions,
    },
    onsbt: {
      overallStats: {
        total: onsbtStats.totalDecisions,
        clearOutcomes: onsbtStats.clearOutcomes,
        workerWins: onsbtStats.workerWins,
        winRate: onsbtStats.winRate,
      },
      outcomeDistribution: Object.entries(onsbtStats.outcomes).map(([outcome, count]) => ({
        outcome,
        count,
        percentage: parseFloat(pct(count, onsbtStats.totalDecisions)),
      })),
      yearlyBreakdown: Object.entries(onsbtStats.yearlyBreakdown).map(([year, data]) => ({
        year: parseInt(year),
        total: data.total,
        outcomes: data.outcomes,
      })),
    },
    onwsib: {
      overallStats: {
        total: onwsibStats.totalDecisions,
        clearOutcomes: onwsibStats.clearOutcomes,
        workerWins: onwsibStats.workerWins,
        winRate: onwsibStats.winRate,
      },
      outcomeDistribution: Object.entries(onwsibStats.outcomes).map(([outcome, count]) => ({
        outcome,
        count,
        percentage: parseFloat(pct(count, onwsibStats.totalDecisions)),
      })),
      yearlyBreakdown: Object.entries(onwsibStats.yearlyBreakdown).map(([year, data]) => ({
        year: parseInt(year),
        total: data.total,
        outcomes: data.outcomes,
      })),
    },
    visualizationSuggestions: [
      {
        type: 'comparison-bar',
        title: 'Ontario Tribunals: Outcome Distribution Comparison',
        description: 'Side-by-side comparison of WSIAT, ONSBT, and ONWSIB outcome rates',
      },
      {
        type: 'pie-chart',
        title: 'ONSBT Outcome Distribution (2020-2026)',
        description: 'Breakdown of 13,798 ONSBT social benefits decisions',
      },
      {
        type: 'timeline',
        title: 'Year-by-Year Trends: Social Benefits vs. Workplace Injury',
        description: 'Compare ONSBT and ONWSIB trends over time',
      },
    ],
  };
}

// Run analysis
console.log('🔵 Ontario Social Tribunals Content Generator\n');
console.log('══════════════════════════════════════════════════════════════════════\n');

const onsbtStats = analyzeONSBT();
const onwsibStats = analyzeONWSIB();

console.log('📝 Generating content updates...\n');

// Generate blog snippet
const blogSnippet = generateBlogSnippet(onsbtStats, onwsibStats);
fs.writeFileSync(BLOG_SNIPPET_FILE, blogSnippet);
console.log(`✅ Blog snippet: ${BLOG_SNIPPET_FILE}\n`);

// Generate visualization data
const vizData = generateVisualizationData(onsbtStats, onwsibStats);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(vizData, null, 2));
console.log(`✅ Visualization data: ${OUTPUT_FILE}\n`);

console.log('══════════════════════════════════════════════════════════════════════');
console.log('✨ Content generation complete!\n');
console.log('📋 Summary:');
console.log(`   ONSBT: ${onsbtStats.totalDecisions.toLocaleString()} decisions, ${onsbtStats.winRate}% win rate`);
console.log(`   ONWSIB: ${onwsibStats.totalDecisions.toLocaleString()} decisions, ${onwsibStats.winRate}% win rate`);
console.log('');
