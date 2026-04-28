#!/usr/bin/env node
/**
 * COVID-19 Impact Analysis on Tribunal Decisions
 * 
 * Analyzes how the pandemic affected tribunal decision patterns:
 * - Volume changes (pre-COVID vs during vs post-COVID)
 * - Outcome distribution shifts
 * - Processing time impacts
 * - Abandonment rate changes
 * 
 * Outputs: JSON report + visualization-ready data
 */

const fs = require('fs');
const path = require('path');

// COVID-19 periods
const PERIODS = {
  PRE_COVID: { start: '2020-01-01', end: '2020-03-15', label: 'Pre-COVID (Jan-Mar 2020)' },
  EARLY_COVID: { start: '2020-03-16', end: '2020-12-31', label: 'Early COVID (Mar-Dec 2020)' },
  COVID_PEAK: { start: '2021-01-01', end: '2021-12-31', label: 'COVID Peak (2021)' },
  COVID_TRANSITION: { start: '2022-01-01', end: '2022-12-31', label: 'Transition (2022)' },
  POST_COVID: { start: '2023-01-01', end: '2026-12-31', label: 'Post-COVID (2023-2026)' },
};

// Data directory
const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');
const OUTPUT_DIR = path.join(__dirname, '../public/data');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Statistics by period
const statsByPeriod = {};
Object.keys(PERIODS).forEach(key => {
  statsByPeriod[key] = {
    label: PERIODS[key].label,
    total: 0,
    by_outcome: {},
    by_tribunal: {},
    abandoned: 0,
    wins: 0,
    losses: 0,
  };
});

/**
 * Determine which period a decision belongs to
 */
function getPeriod(decisionDate) {
  if (!decisionDate) return null;
  
  for (const [key, period] of Object.entries(PERIODS)) {
    if (decisionDate >= period.start && decisionDate <= period.end) {
      return key;
    }
  }
  return null;
}

/**
 * Check if outcome is a worker win
 */
function isWin(outcome) {
  return ['Allowed', 'Granted', 'Partial Win', 'Allowed - Violation Found'].includes(outcome);
}

/**
 * Check if outcome is a worker loss
 */
function isLoss(outcome) {
  return ['Dismissed', 'Dismissed - No Violation', 'Denied', 'No Jurisdiction'].includes(outcome);
}

/**
 * Process outcome file
 */
function processFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`📄 Processing: ${fileName}`);

  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const decisions = JSON.parse(rawData);

    if (!Array.isArray(decisions)) {
      console.warn(`   ⚠️  Invalid format, skipping`);
      return;
    }

    decisions.forEach((decision) => {
      const d = decision.data || decision;
      const period = getPeriod(d.decisionDate);
      
      if (!period) return; // Skip if date is outside our analysis range

      const stats = statsByPeriod[period];
      stats.total++;

      // By tribunal
      const tribunal = d.databaseId || 'unknown';
      stats.by_tribunal[tribunal] = (stats.by_tribunal[tribunal] || 0) + 1;

      // By outcome
      if (decision.outcome) {
        stats.by_outcome[decision.outcome] = (stats.by_outcome[decision.outcome] || 0) + 1;

        if (decision.outcome === 'Abandoned') {
          stats.abandoned++;
        } else if (isWin(decision.outcome)) {
          stats.wins++;
        } else if (isLoss(decision.outcome)) {
          stats.losses++;
        }
      }
    });

    console.log(`   ✓ Processed ${decisions.length} decisions`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
}

/**
 * Calculate period-over-period changes
 */
function calculateChanges() {
  const changes = {};
  const periodKeys = Object.keys(PERIODS);

  for (let i = 1; i < periodKeys.length; i++) {
    const currentKey = periodKeys[i];
    const previousKey = periodKeys[i - 1];
    const current = statsByPeriod[currentKey];
    const previous = statsByPeriod[previousKey];

    const volumeChange = previous.total > 0 
      ? ((current.total - previous.total) / previous.total) * 100 
      : 0;

    const currentWinRate = (current.wins + current.losses) > 0
      ? (current.wins / (current.wins + current.losses)) * 100
      : null;

    const previousWinRate = (previous.wins + previous.losses) > 0
      ? (previous.wins / (previous.wins + previous.losses)) * 100
      : null;

    const winRateChange = (currentWinRate !== null && previousWinRate !== null)
      ? currentWinRate - previousWinRate
      : null;

    const currentAbandonmentRate = current.total > 0
      ? (current.abandoned / current.total) * 100
      : 0;

    const previousAbandonmentRate = previous.total > 0
      ? (previous.abandoned / previous.total) * 100
      : 0;

    const abandonmentChange = currentAbandonmentRate - previousAbandonmentRate;

    changes[currentKey] = {
      from: PERIODS[previousKey].label,
      to: PERIODS[currentKey].label,
      volume_change_percent: parseFloat(volumeChange.toFixed(2)),
      win_rate_change_percent: winRateChange !== null ? parseFloat(winRateChange.toFixed(2)) : null,
      abandonment_change_percent: parseFloat(abandonmentChange.toFixed(2)),
    };
  }

  return changes;
}

/**
 * Generate insights
 */
function generateInsights() {
  const insights = [];

  // Find period with highest volume
  let maxVolume = 0;
  let maxVolumePeriod = null;
  Object.entries(statsByPeriod).forEach(([key, stats]) => {
    if (stats.total > maxVolume) {
      maxVolume = stats.total;
      maxVolumePeriod = key;
    }
  });

  if (maxVolumePeriod) {
    insights.push({
      type: 'volume_peak',
      finding: `Highest decision volume during ${PERIODS[maxVolumePeriod].label} with ${maxVolume.toLocaleString()} decisions`,
    });
  }

  // Check abandonment rate changes
  const preCovidAbandonmentRate = statsByPeriod.PRE_COVID.total > 0
    ? (statsByPeriod.PRE_COVID.abandoned / statsByPeriod.PRE_COVID.total) * 100
    : 0;

  const covidPeakAbandonmentRate = statsByPeriod.COVID_PEAK.total > 0
    ? (statsByPeriod.COVID_PEAK.abandoned / statsByPeriod.COVID_PEAK.total) * 100
    : 0;

  if (covidPeakAbandonmentRate > preCovidAbandonmentRate + 5) {
    insights.push({
      type: 'abandonment_spike',
      finding: `Abandonment rate increased from ${preCovidAbandonmentRate.toFixed(1)}% pre-COVID to ${covidPeakAbandonmentRate.toFixed(1)}% during COVID peak (${(covidPeakAbandonmentRate - preCovidAbandonmentRate).toFixed(1)}% increase)`,
    });
  }

  // Check win rate stability
  const winRates = {};
  Object.entries(statsByPeriod).forEach(([key, stats]) => {
    const decisive = stats.wins + stats.losses;
    if (decisive > 0) {
      winRates[key] = (stats.wins / decisive) * 100;
    }
  });

  const winRateValues = Object.values(winRates);
  if (winRateValues.length > 0) {
    const avgWinRate = winRateValues.reduce((a, b) => a + b, 0) / winRateValues.length;
    const maxDeviation = Math.max(...winRateValues.map(v => Math.abs(v - avgWinRate)));

    if (maxDeviation < 5) {
      insights.push({
        type: 'win_rate_stability',
        finding: `Win rates remained stable across all COVID periods (avg ${avgWinRate.toFixed(1)}%, max deviation ${maxDeviation.toFixed(1)}%)`,
      });
    }
  }

  return insights;
}

/**
 * Main execution
 */
function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🦠 COVID-19 IMPACT ANALYSIS ON TRIBUNAL DECISIONS');
  console.log('='.repeat(80));
  console.log('');

  // Check if data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ Data directory not found: ${DATA_DIR}`);
    process.exit(1);
  }

  // Read all outcome files
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('-predicted-outcomes.json'))
    .map(f => path.join(DATA_DIR, f));

  console.log(`✅ Found ${files.length} outcome data files\n`);

  // Process all files
  files.forEach(processFile);

  // Calculate changes
  const changes = calculateChanges();

  // Generate insights
  const insights = generateInsights();

  // Summary report
  console.log('\n' + '='.repeat(80));
  console.log('📊 COVID-19 IMPACT SUMMARY');
  console.log('='.repeat(80));

  Object.entries(statsByPeriod).forEach(([key, stats]) => {
    const decisive = stats.wins + stats.losses;
    const winRate = decisive > 0 ? (stats.wins / decisive) * 100 : null;
    const abandonmentRate = stats.total > 0 ? (stats.abandoned / stats.total) * 100 : 0;

    console.log(`\n${stats.label}`);
    console.log(`  Total decisions: ${stats.total.toLocaleString()}`);
    console.log(`  Win rate: ${winRate !== null ? winRate.toFixed(1) + '%' : 'N/A'}`);
    console.log(`  Abandonment rate: ${abandonmentRate.toFixed(1)}%`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('📈 PERIOD-OVER-PERIOD CHANGES');
  console.log('='.repeat(80));

  Object.entries(changes).forEach(([key, change]) => {
    console.log(`\n${change.from} → ${change.to}`);
    console.log(`  Volume change: ${change.volume_change_percent > 0 ? '+' : ''}${change.volume_change_percent}%`);
    console.log(`  Win rate change: ${change.win_rate_change_percent !== null ? (change.win_rate_change_percent > 0 ? '+' : '') + change.win_rate_change_percent + '%' : 'N/A'}`);
    console.log(`  Abandonment change: ${change.abandonment_change_percent > 0 ? '+' : ''}${change.abandonment_change_percent}%`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('💡 KEY INSIGHTS');
  console.log('='.repeat(80));

  insights.forEach((insight, index) => {
    console.log(`${index + 1}. ${insight.finding}`);
  });

  console.log('\n' + '='.repeat(80));

  // Write output file
  const outputPath = path.join(OUTPUT_DIR, 'covid-impact-analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    analysis_period: '2020-01-01 to 2026-12-31',
    periods: statsByPeriod,
    changes: changes,
    insights: insights,
  }, null, 2));

  console.log(`\n📤 Analysis written to: ${outputPath}\n`);
  console.log('✅ COVID-19 impact analysis complete!\n');
}

// Execute
main();
