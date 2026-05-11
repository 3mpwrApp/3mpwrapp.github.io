/**
 * Aggregate Real Data for Visualizations
 * Processes 230,392 extracted records to generate actual statistics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to extracted data
const DATA_DIR = path.join(__dirname, '..', 'data', 'comprehensive-extraction');

/**
 * Aggregate WSIAT decisions by year for temporal evolution
 */
function aggregateWSIATByYear() {
  console.log('Aggregating WSIAT decisions by year...');
  
  const wsiatFile = path.join(DATA_DIR, 'wsiat', 'wsiat-ultra-complete.json');
  if (!fs.existsSync(wsiatFile)) {
    console.error('WSIAT data file not found');
    return null;
  }

  const wsiatFile_content = JSON.parse(fs.readFileSync(wsiatFile, 'utf-8'));
  const wsiatData = wsiatFile_content.decisions || wsiatFile_content;
  
  const yearlyStats = {};
  let totalAllowed = 0;
  let totalDenied = 0;
  
  wsiatData.forEach(decision => {
    const year = decision.DecDate ? decision.DecDate.substring(0, 4) : 'Unknown';
    
    if (!yearlyStats[year]) {
      yearlyStats[year] = { allowed: 0, denied: 0, partial: 0, other: 0, total: 0 };
    }
    
    yearlyStats[year].total++;
    
    // Parse keywords/summary for outcome (simplified - looking for key terms)
    const keywords = (decision.DecKeywords || '').toLowerCase();
    const summary = (decision.DecSummary || '').toLowerCase();
    const combined = keywords + ' ' + summary;
    
    if (combined.includes('allowed') || combined.includes('appeal granted')) {
      yearlyStats[year].allowed++;
      totalAllowed++;
    } else if (combined.includes('denied') || combined.includes('dismissed')) {
      yearlyStats[year].denied++;
      totalDenied++;
    } else if (combined.includes('partial') || combined.includes('in part')) {
      yearlyStats[year].partial++;
    } else {
      yearlyStats[year].other++;
    }
  });

  // Calculate success rates
  const yearlyData = Object.keys(yearlyStats)
    .filter(year => year !== 'Unknown' && year >= '2016' && year <= '2025')
    .sort()
    .map(year => ({
      year: parseInt(year),
      allowed: yearlyStats[year].allowed,
      denied: yearlyStats[year].denied,
      partial: yearlyStats[year].partial,
      total: yearlyStats[year].total,
      successRate: ((yearlyStats[year].allowed / yearlyStats[year].total) * 100).toFixed(1)
    }));

  const overallSuccessRate = ((totalAllowed / (totalAllowed + totalDenied)) * 100).toFixed(1);

  return {
    yearly: yearlyData,
    overall: {
      totalDecisions: wsiatData.length,
      allowed: totalAllowed,
      denied: totalDenied,
      successRate: overallSuccessRate
    }
  };
}

/**
 * Aggregate NEER/CAD-7 employer data by region
 */
function aggregateEmployersByRegion() {
  console.log('Aggregating employer data by region...');
  
  const neerFile = path.join(DATA_DIR, 'neer', 'neer-ultra-complete.json');
  const cad7File = path.join(DATA_DIR, 'cad7', 'cad7-ultra-complete.json');
  
  if (!fs.existsSync(neerFile) || !fs.existsSync(cad7File)) {
    console.error('Employer data files not found');
    return null;
  }

  const neerData_content = JSON.parse(fs.readFileSync(neerFile, 'utf-8'));
  const cad7Data_content = JSON.parse(fs.readFileSync(cad7File, 'utf-8'));
  
  const neerData = neerData_content.employers || neerData_content;
  const cad7Data = cad7Data_content.employers || cad7Data_content;

  const regionalStats = {};

  // Process NEER data
  neerData.forEach(employer => {
    const city = (employer.City || 'Unknown').trim();
    if (!regionalStats[city]) {
      regionalStats[city] = { count: 0, rebate: 0, surcharge: 0, neer: 0, cad7: 0 };
    }
    regionalStats[city].count++;
    regionalStats[city].neer++;
    
    const amount = parseFloat(employer['Rebate/Surcharge Amount'] || 0);
    if (amount > 0) {
      regionalStats[city].rebate += amount;
    } else {
      regionalStats[city].surcharge += Math.abs(amount);
    }
  });

  // Process CAD-7 data
  cad7Data.forEach(employer => {
    const city = (employer['AGMCity'] || 'Unknown').trim();
    if (!regionalStats[city]) {
      regionalStats[city] = { count: 0, rebate: 0, surcharge: 0, neer: 0, cad7: 0 };
    }
    regionalStats[city].count++;
    regionalStats[city].cad7++;
    
    const amount = parseFloat(employer['Rebate/Surcharge Amount'] || 0);
    if (amount > 0) {
      regionalStats[city].rebate += amount;
    } else {
      regionalStats[city].surcharge += Math.abs(amount);
    }
  });

  // Get top cities
  const topCities = Object.entries(regionalStats)
    .filter(([city]) => city !== 'Unknown')
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15)
    .map(([city, stats]) => ({
      city,
      count: stats.count,
      rebate: Math.round(stats.rebate),
      surcharge: Math.round(stats.surcharge),
      neer: stats.neer,
      cad7: stats.cad7,
      ratio: stats.surcharge > 0 ? (stats.rebate / stats.surcharge).toFixed(2) : 'N/A'
    }));

  return {
    topCities,
    total: {
      employers: neerData.length + cad7Data.length,
      neer: neerData.length,
      cad7: cad7Data.length,
      totalRebates: Object.values(regionalStats).reduce((sum, s) => sum + s.rebate, 0),
      totalSurcharges: Object.values(regionalStats).reduce((sum, s) => sum + s.surcharge, 0)
    }
  };
}

/**
 * Extract injury types from WSIAT keywords
 */
function extractInjuryPatterns() {
  console.log('Extracting injury patterns from WSIAT data...');
  
  const wsiatFile = path.join(DATA_DIR, 'wsiat', 'wsiat-ultra-complete.json');
  if (!fs.existsSync(wsiatFile)) {
    console.error('WSIAT data file not found');
    return null;
  }

  const wsiatFile_content = JSON.parse(fs.readFileSync(wsiatFile, 'utf-8'));
  const wsiatData = wsiatFile_content.decisions || wsiatFile_content;
  
  // Common injury keywords
  const injuryPatterns = {
    'Back/Spine': ['back', 'spine', 'lumbar', 'disc', 'vertebra'],
    'Shoulder': ['shoulder', 'rotator cuff'],
    'Knee': ['knee', 'meniscus', 'patella'],
    'Repetitive Strain': ['repetitive', 'carpal tunnel', 'rsi', 'tendonitis'],
    'Mental Stress': ['ptsd', 'depression', 'anxiety', 'mental stress', 'psychological'],
    'Hearing Loss': ['hearing', 'tinnitus', 'acoustic'],
    'Fracture': ['fracture', 'broken', 'break'],
    'Amputation': ['amputation', 'limb loss'],
    'Chronic Pain': ['chronic pain', 'fibromyalgia'],
    'Concussion': ['concussion', 'head injury', 'tbi']
  };

  const injuryCounts = {};
  Object.keys(injuryPatterns).forEach(injury => {
    injuryCounts[injury] = 0;
  });

  wsiatData.forEach(decision => {
    const keywords = (decision.DecKeywords || '').toLowerCase();
    const summary = (decision.DecSummary || '').toLowerCase();
    const combined = keywords + ' ' + summary;

    Object.entries(injuryPatterns).forEach(([injury, patterns]) => {
      if (patterns.some(pattern => combined.includes(pattern))) {
        injuryCounts[injury]++;
      }
    });
  });

  return Object.entries(injuryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([injury, count]) => ({
      injury,
      count,
      percentage: ((count / wsiatData.length) * 100).toFixed(1)
    }));
}

/**
 * Main aggregation function
 */
async function main() {
  console.log('Starting data aggregation from 230,392 extracted records...\n');

  const results = {
    generatedAt: new Date().toISOString(),
    source: '230,392 tribunal records extracted April 29, 2026',
    wsiat: aggregateWSIATByYear(),
    employers: aggregateEmployersByRegion(),
    injuries: extractInjuryPatterns()
  };

  // Write results
  const outputFile = path.join(DATA_DIR, 'aggregated-statistics.json');
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

  console.log('\n✅ Aggregation complete!');
  console.log(`Output: ${outputFile}`);
  console.log('\nSummary:');
  console.log(`- WSIAT decisions: ${results.wsiat.overall.totalDecisions}`);
  console.log(`- Overall success rate: ${results.wsiat.overall.successRate}%`);
  console.log(`- Total employers analyzed: ${results.employers.total.employers}`);
  console.log(`- Top injury type: ${results.injuries[0].injury} (${results.injuries[0].count} cases)`);
}

main().catch(console.error);
