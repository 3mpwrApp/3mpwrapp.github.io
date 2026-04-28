#!/usr/bin/env node
/**
 * Geographic Distribution Analysis
 * 
 * Analyzes tribunal decisions by geographic distribution:
 * - Provincial breakdown (Ontario, BC, etc.)
 * - Regional patterns within Ontario
 * - Urban vs rural case volumes
 * - Geographic win rate variations
 * 
 * Outputs: JSON report for map visualizations
 */

const fs = require('fs');
const path = require('path');

// Data directory
const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');
const OUTPUT_DIR = path.join(__dirname, '../public/data');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Province mapping from tribunal IDs
const PROVINCE_MAP = {
  'onwsiat': { province: 'Ontario', name: 'Workplace Safety and Insurance Appeals Tribunal' },
  'onhrt': { province: 'Ontario', name: 'Human Rights Tribunal of Ontario' },
  'onsbt': { province: 'Ontario', name: 'Social Benefits Tribunal' },
  'onwsib': { province: 'Ontario', name: 'Workplace Safety and Insurance Board' },
  'onca': { province: 'Ontario', name: 'Court of Appeal for Ontario' },
  'bcwcat': { province: 'British Columbia', name: 'Workers\' Compensation Appeal Tribunal' },
  'bchrt': { province: 'British Columbia', name: 'Human Rights Tribunal' },
};

// Ontario regions (extracted from decision keywords/locations when available)
const ONTARIO_REGIONS = {
  'Greater Toronto Area': ['Toronto', 'Mississauga', 'Brampton', 'Vaughan', 'Markham', 'Richmond Hill', 'Scarborough'],
  'Ottawa': ['Ottawa', 'Gatineau'],
  'Hamilton-Niagara': ['Hamilton', 'St. Catharines', 'Niagara Falls', 'Burlington'],
  'Southwestern Ontario': ['London', 'Windsor', 'Kitchener', 'Cambridge', 'Waterloo', 'Sarnia', 'Chatham'],
  'Central Ontario': ['Barrie', 'Orillia', 'Collingwood', 'Midland'],
  'Eastern Ontario': ['Kingston', 'Cornwall', 'Belleville', 'Peterborough'],
  'Northern Ontario': ['Sudbury', 'Thunder Bay', 'Sault Ste. Marie', 'Timmins', 'North Bay'],
};

// Statistics by geography
const statsByProvince = {};
const statsByRegion = {};

/**
 * Detect region from keywords/title
 */
function detectRegion(decision) {
  const d = decision.data || decision;
  const searchText = `${d.title || ''} ${d.keywords || ''}`.toLowerCase();

  for (const [region, cities] of Object.entries(ONTARIO_REGIONS)) {
    for (const city of cities) {
      if (searchText.includes(city.toLowerCase())) {
        return region;
      }
    }
  }

  return 'Unknown';
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
      const tribunalId = d.databaseId || 'unknown';
      const provinceInfo = PROVINCE_MAP[tribunalId] || { province: 'Unknown', name: 'Unknown Tribunal' };
      const province = provinceInfo.province;

      // By province
      if (!statsByProvince[province]) {
        statsByProvince[province] = {
          total: 0,
          by_tribunal: {},
          by_outcome: {},
          wins: 0,
          losses: 0,
        };
      }

      statsByProvince[province].total++;
      statsByProvince[province].by_tribunal[tribunalId] = 
        (statsByProvince[province].by_tribunal[tribunalId] || 0) + 1;

      if (decision.outcome) {
        statsByProvince[province].by_outcome[decision.outcome] = 
          (statsByProvince[province].by_outcome[decision.outcome] || 0) + 1;

        if (isWin(decision.outcome)) {
          statsByProvince[province].wins++;
        } else if (isLoss(decision.outcome)) {
          statsByProvince[province].losses++;
        }
      }

      // Ontario regional analysis
      if (province === 'Ontario') {
        const region = detectRegion(decision);

        if (!statsByRegion[region]) {
          statsByRegion[region] = {
            total: 0,
            by_tribunal: {},
            by_outcome: {},
            wins: 0,
            losses: 0,
          };
        }

        statsByRegion[region].total++;
        statsByRegion[region].by_tribunal[tribunalId] = 
          (statsByRegion[region].by_tribunal[tribunalId] || 0) + 1;

        if (decision.outcome) {
          statsByRegion[region].by_outcome[decision.outcome] = 
            (statsByRegion[region].by_outcome[decision.outcome] || 0) + 1;

          if (isWin(decision.outcome)) {
            statsByRegion[region].wins++;
          } else if (isLoss(decision.outcome)) {
            statsByRegion[region].losses++;
          }
        }
      }
    });

    console.log(`   ✓ Processed ${decisions.length} decisions`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
}

/**
 * Calculate win rates and format output
 */
function calculateWinRates() {
  // Province win rates
  Object.keys(statsByProvince).forEach(province => {
    const stats = statsByProvince[province];
    const decisive = stats.wins + stats.losses;
    stats.win_rate = decisive > 0 ? parseFloat(((stats.wins / decisive) * 100).toFixed(2)) : null;
    stats.coverage_percent = parseFloat(((Object.values(stats.by_outcome).reduce((a, b) => a + b, 0) / stats.total) * 100).toFixed(2));
  });

  // Region win rates
  Object.keys(statsByRegion).forEach(region => {
    const stats = statsByRegion[region];
    const decisive = stats.wins + stats.losses;
    stats.win_rate = decisive > 0 ? parseFloat(((stats.wins / decisive) * 100).toFixed(2)) : null;
    stats.coverage_percent = parseFloat(((Object.values(stats.by_outcome).reduce((a, b) => a + b, 0) / stats.total) * 100).toFixed(2));
  });
}

/**
 * Generate insights
 */
function generateInsights() {
  const insights = [];

  // Find province with highest volume
  const provinceVolumes = Object.entries(statsByProvince)
    .sort(([, a], [, b]) => b.total - a.total);

  if (provinceVolumes.length > 0) {
    const [topProvince, topStats] = provinceVolumes[0];
    const percentage = (topStats.total / Object.values(statsByProvince).reduce((sum, s) => sum + s.total, 0)) * 100;
    insights.push({
      type: 'volume_concentration',
      finding: `${topProvince} accounts for ${percentage.toFixed(1)}% of all analyzed decisions (${topStats.total.toLocaleString()} cases)`,
    });
  }

  // Ontario regional concentration
  const regionVolumes = Object.entries(statsByRegion)
    .filter(([region]) => region !== 'Unknown')
    .sort(([, a], [, b]) => b.total - a.total);

  if (regionVolumes.length > 0) {
    const [topRegion, topStats] = regionVolumes[0];
    const totalOntario = Object.values(statsByRegion).reduce((sum, s) => sum + s.total, 0);
    const percentage = (topStats.total / totalOntario) * 100;
    insights.push({
      type: 'regional_concentration',
      finding: `Within Ontario, ${topRegion} has the highest case volume (${percentage.toFixed(1)}% of identified regional cases)`,
    });
  }

  // Win rate variations
  const winRates = Object.entries(statsByProvince)
    .filter(([, stats]) => stats.win_rate !== null)
    .map(([province, stats]) => ({ province, winRate: stats.win_rate }));

  if (winRates.length > 1) {
    const avgWinRate = winRates.reduce((sum, { winRate }) => sum + winRate, 0) / winRates.length;
    const maxDeviation = Math.max(...winRates.map(({ winRate }) => Math.abs(winRate - avgWinRate)));

    if (maxDeviation < 10) {
      insights.push({
        type: 'geographic_consistency',
        finding: `Win rates are consistent across provinces (avg ${avgWinRate.toFixed(1)}%, max deviation ${maxDeviation.toFixed(1)}%)`,
      });
    } else {
      const highest = winRates.reduce((max, curr) => curr.winRate > max.winRate ? curr : max);
      const lowest = winRates.reduce((min, curr) => curr.winRate < min.winRate ? curr : min);
      insights.push({
        type: 'geographic_variation',
        finding: `Win rates vary geographically: ${highest.province} (${highest.winRate.toFixed(1)}%) vs ${lowest.province} (${lowest.winRate.toFixed(1)}%)`,
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
  console.log('🗺️  GEOGRAPHIC DISTRIBUTION ANALYSIS');
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

  // Calculate win rates
  calculateWinRates();

  // Generate insights
  const insights = generateInsights();

  // Summary report
  console.log('\n' + '='.repeat(80));
  console.log('📊 GEOGRAPHIC SUMMARY');
  console.log('='.repeat(80));

  console.log('\nBY PROVINCE:');
  console.log('-'.repeat(80));
  Object.entries(statsByProvince)
    .sort(([, a], [, b]) => b.total - a.total)
    .forEach(([province, stats]) => {
      console.log(`\n${province}`);
      console.log(`  Total cases: ${stats.total.toLocaleString()}`);
      console.log(`  Win rate: ${stats.win_rate !== null ? stats.win_rate + '%' : 'N/A'}`);
      console.log(`  Top tribunals: ${Object.entries(stats.by_tribunal).sort(([, a], [, b]) => b - a).slice(0, 3).map(([t, c]) => `${t} (${c})`).join(', ')}`);
    });

  console.log('\n\nONTARIO REGIONAL BREAKDOWN:');
  console.log('-'.repeat(80));
  Object.entries(statsByRegion)
    .sort(([, a], [, b]) => b.total - a.total)
    .forEach(([region, stats]) => {
      console.log(`\n${region}`);
      console.log(`  Total cases: ${stats.total.toLocaleString()}`);
      console.log(`  Win rate: ${stats.win_rate !== null ? stats.win_rate + '%' : 'N/A'}`);
    });

  console.log('\n' + '='.repeat(80));
  console.log('💡 KEY INSIGHTS');
  console.log('='.repeat(80));

  insights.forEach((insight, index) => {
    console.log(`${index + 1}. ${insight.finding}`);
  });

  console.log('\n' + '='.repeat(80));

  // Write output file
  const outputPath = path.join(OUTPUT_DIR, 'geographic-analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    by_province: statsByProvince,
    ontario_regions: statsByRegion,
    insights: insights,
    province_mapping: PROVINCE_MAP,
  }, null, 2));

  console.log(`\n📤 Analysis written to: ${outputPath}\n`);
  console.log('✅ Geographic analysis complete!\n');
}

// Execute
main();
