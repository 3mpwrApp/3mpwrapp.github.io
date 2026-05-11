#!/usr/bin/env node
/**
 * Generate Outcome Statistics JSON Files for Website Visualizations
 * 
 * Reads outcome data from empowrapp-new and generates aggregated statistics
 * for use in research page, visualizations, and blog posts.
 * 
 * Outputs:
 *   - public/data/outcome-summary.json (overall statistics)
 *   - public/data/outcome-by-tribunal.json (tribunal breakdowns)
 *   - public/data/outcome-by-year.json (temporal trends)
 */

const fs = require('fs');
const path = require('path');

// Path to outcome data files (in the same repo)
const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');
const OUTPUT_DIR = path.join(__dirname, '../public/data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Outcome categories for win/loss analysis
const WIN_OUTCOMES = new Set(['Allowed', 'Granted', 'Partial Win']);
const LOSS_OUTCOMES = new Set(['Dismissed', 'Dismissed - No Violation', 'Denied', 'No Jurisdiction']);

// Statistics accumulators
const stats = {
  total_decisions: 0,
  decisions_with_outcomes: 0,
  by_tribunal: {},
  by_outcome: {},
  by_confidence: { high: 0, medium: 0, low: 0 },
  by_year: {},
  wins: 0,
  losses: 0,
};

/**
 * Process a single outcome file
 */
function processFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`📄 Processing: ${fileName}`);

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const decisions = JSON.parse(rawData);

    if (!Array.isArray(decisions)) {
      console.warn(`   ⚠️  Invalid format (not an array), skipping`);
      return;
    }

    decisions.forEach((decision) => {
      // Handle nested data structure
      const d = decision.data || decision;
      
      stats.total_decisions++;

      if (decision.outcome) {
        stats.decisions_with_outcomes++;

        // By tribunal
        const tribunal = d.databaseId || 'unknown';
        if (!stats.by_tribunal[tribunal]) {
          stats.by_tribunal[tribunal] = {
            total: 0,
            with_outcomes: 0,
            by_outcome: {},
            wins: 0,
            losses: 0,
          };
        }
        stats.by_tribunal[tribunal].total++;
        stats.by_tribunal[tribunal].with_outcomes++;

        // By outcome
        stats.by_outcome[decision.outcome] = (stats.by_outcome[decision.outcome] || 0) + 1;
        stats.by_tribunal[tribunal].by_outcome[decision.outcome] = 
          (stats.by_tribunal[tribunal].by_outcome[decision.outcome] || 0) + 1;

        // By confidence
        if (decision.outcome_confidence) {
          stats.by_confidence[decision.outcome_confidence]++;
        }

        // By year
        if (d.decisionDate) {
          const year = d.decisionDate.substring(0, 4);
          if (!stats.by_year[year]) {
            stats.by_year[year] = {
              total: 0,
              with_outcomes: 0,
              by_outcome: {},
              wins: 0,
              losses: 0,
            };
          }
          stats.by_year[year].total++;
          stats.by_year[year].with_outcomes++;
          stats.by_year[year].by_outcome[decision.outcome] = 
            (stats.by_year[year].by_outcome[decision.outcome] || 0) + 1;

          // Win/loss counts by year
          if (WIN_OUTCOMES.has(decision.outcome)) {
            stats.by_year[year].wins++;
          } else if (LOSS_OUTCOMES.has(decision.outcome)) {
            stats.by_year[year].losses++;
          }
        }

        // Win/loss counts overall
        if (WIN_OUTCOMES.has(decision.outcome)) {
          stats.wins++;
          stats.by_tribunal[tribunal].wins++;
        } else if (LOSS_OUTCOMES.has(decision.outcome)) {
          stats.losses++;
          stats.by_tribunal[tribunal].losses++;
        }
      } else {
        // No outcome - just count total
        const tribunal = d.databaseId || 'unknown';
        if (!stats.by_tribunal[tribunal]) {
          stats.by_tribunal[tribunal] = {
            total: 0,
            with_outcomes: 0,
            by_outcome: {},
            wins: 0,
            losses: 0,
          };
        }
        stats.by_tribunal[tribunal].total++;

        if (d.decisionDate) {
          const year = d.decisionDate.substring(0, 4);
          if (!stats.by_year[year]) {
            stats.by_year[year] = {
              total: 0,
              with_outcomes: 0,
              by_outcome: {},
              wins: 0,
              losses: 0,
            };
          }
          stats.by_year[year].total++;
        }
      }
    });

    console.log(`   ✓ Processed ${decisions.length} decisions`);
  } catch (error) {
    console.error(`   ❌ Error reading file: ${error.message}`);
  }
}

/**
 * Calculate win rates
 */
function calculateWinRates() {
  // Overall win rate
  const decisiveOutcomes = stats.wins + stats.losses;
  stats.win_rate = decisiveOutcomes > 0 ? (stats.wins / decisiveOutcomes) * 100 : null;

  // Win rates by tribunal
  Object.keys(stats.by_tribunal).forEach((tribunal) => {
    const t = stats.by_tribunal[tribunal];
    const decisive = t.wins + t.losses;
    t.win_rate = decisive > 0 ? (t.wins / decisive) * 100 : null;
    t.coverage_percent = t.total > 0 ? (t.with_outcomes / t.total) * 100 : 0;
  });

  // Win rates by year
  Object.keys(stats.by_year).forEach((year) => {
    const y = stats.by_year[year];
    const decisive = y.wins + y.losses;
    y.win_rate = decisive > 0 ? (y.wins / decisive) * 100 : null;
    y.coverage_percent = y.total > 0 ? (y.with_outcomes / y.total) * 100 : 0;
  });

  // Overall coverage
  stats.coverage_percent = stats.total_decisions > 0 
    ? (stats.decisions_with_outcomes / stats.total_decisions) * 100 
    : 0;
}

/**
 * Main execution
 */
function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 GENERATING OUTCOME STATISTICS FOR WEBSITE');
  console.log('='.repeat(80));
  console.log('');

  // Check if data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ Data directory not found: ${DATA_DIR}`);
    console.error('   Make sure empowrapp-new repo is in the expected location.');
    process.exit(1);
  }

  // Read all outcome files
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('-predicted-outcomes.json'))
    .map(f => path.join(DATA_DIR, f));

  console.log(`✅ Found ${files.length} outcome data files\n`);

  // Process all files
  files.forEach(processFile);

  // Calculate win rates
  calculateWinRates();

  // Generate output files
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY STATISTICS');
  console.log('='.repeat(80));
  console.log(`Total decisions:          ${stats.total_decisions.toLocaleString()}`);
  console.log(`Decisions with outcomes:  ${stats.decisions_with_outcomes.toLocaleString()} (${stats.coverage_percent.toFixed(1)}%)`);
  console.log(`Overall win rate:         ${stats.win_rate ? stats.win_rate.toFixed(1) + '%' : 'N/A'}`);
  console.log('');
  console.log('By Tribunal:');
  console.log('-'.repeat(80));
  Object.entries(stats.by_tribunal)
    .sort(([, a], [, b]) => b.total - a.total)
    .forEach(([tribunal, data]) => {
      console.log(`  ${tribunal.padEnd(20)} ${data.total.toString().padStart(6)} total  ${data.with_outcomes.toString().padStart(6)} outcomes  ${data.win_rate ? data.win_rate.toFixed(1) + '%' : 'N/A'} win rate`);
    });
  console.log('='.repeat(80));
  console.log('');

  // Write output files
  console.log('📤 Writing output files...\n');

  // 1. Overall summary
  const summaryPath = path.join(OUTPUT_DIR, 'outcome-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    total_decisions: stats.total_decisions,
    decisions_with_outcomes: stats.decisions_with_outcomes,
    coverage_percent: parseFloat(stats.coverage_percent.toFixed(2)),
    win_rate: stats.win_rate ? parseFloat(stats.win_rate.toFixed(2)) : null,
    wins: stats.wins,
    losses: stats.losses,
    by_outcome: stats.by_outcome,
    by_confidence: stats.by_confidence,
  }, null, 2));
  console.log(`   ✓ ${summaryPath}`);

  // 2. By tribunal
  const tribunalPath = path.join(OUTPUT_DIR, 'outcome-by-tribunal.json');
  fs.writeFileSync(tribunalPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    tribunals: Object.entries(stats.by_tribunal).map(([id, data]) => ({
      id,
      total: data.total,
      with_outcomes: data.with_outcomes,
      coverage_percent: parseFloat(data.coverage_percent.toFixed(2)),
      win_rate: data.win_rate ? parseFloat(data.win_rate.toFixed(2)) : null,
      wins: data.wins,
      losses: data.losses,
      by_outcome: data.by_outcome,
    })),
  }, null, 2));
  console.log(`   ✓ ${tribunalPath}`);

  // 3. By year
  const yearPath = path.join(OUTPUT_DIR, 'outcome-by-year.json');
  fs.writeFileSync(yearPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    years: Object.entries(stats.by_year)
      .sort(([a], [b]) => b.localeCompare(a)) // Sort descending
      .map(([year, data]) => ({
        year,
        total: data.total,
        with_outcomes: data.with_outcomes,
        coverage_percent: parseFloat(data.coverage_percent.toFixed(2)),
        win_rate: data.win_rate ? parseFloat(data.win_rate.toFixed(2)) : null,
        wins: data.wins,
        losses: data.losses,
        by_outcome: data.by_outcome,
      })),
  }, null, 2));
  console.log(`   ✓ ${yearPath}`);

  console.log('\n✅ Statistics generation complete!\n');
}

// Execute
main();
