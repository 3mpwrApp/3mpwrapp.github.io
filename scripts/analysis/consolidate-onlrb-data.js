#!/usr/bin/env node
/**
 * ONLRB DATA CONSOLIDATION & VALIDATION
 * Checks progress trackers vs complete files, identifies gaps, improves outcome classification
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

// Improved outcome classification from keywords
function classifyOutcomeFromKeywords(keywords) {
  if (!keywords || keywords.length === 0) return 'Unknown';
  
  const keywordText = keywords.join(' — ').toLowerCase();
  
  // Priority order matters - check most specific first
  if (keywordText.match(/\b(dismiss|denied|reject|refuse)\b/i) && !keywordText.match(/\b(granted|allow)\b/i)) {
    return 'Dismissed';
  }
  if (keywordText.match(/\b(allowed|granted|approved)\b/i) && !keywordText.match(/\b(dismiss|denied)\b/i)) {
    return 'Allowed';
  }
  if (keywordText.match(/\b(settled|settlement agreement|withdrawn|abandon)\b/i)) {
    return 'Settled/Withdrawn';
  }
  if (keywordText.match(/\bcertif(ication|ied|y)\s+(granted|approved)\b/i)) {
    return 'Certification Granted';
  }
  if (keywordText.match(/\bcertif(ication|y)\s+(dismiss|denied|reject)\b/i)) {
    return 'Certification Dismissed';
  }
  if (keywordText.match(/\b(interim|interlocutory)\b/i)) {
    return 'Interim Decision';
  }
  if (keywordText.match(/\breconsider(ation)?\b/i)) {
    return 'Reconsideration';
  }
  if (keywordText.match(/\bno jurisdiction\b/i) || keywordText.match(/\bjurisdiction\s+lacking\b/i)) {
    return 'No Jurisdiction';
  }
  if (keywordText.match(/\b(stay|stayed|adjourn|adjourned)\b/i)) {
    return 'Stayed/Adjourned';
  }
  if (keywordText.match(/\bvote\b/i) && keywordText.match(/\b(ballots|cast|posted)\b/i)) {
    return 'Representation Vote';
  }
  if (keywordText.match(/\bdeficienc(y|ies)\b/i) && keywordText.match(/\bapplication\b/i)) {
    return 'Application Deficiency';
  }
  
  return 'Unknown';
}

function consolidateYear(year) {
  console.log(`\n📅 ${year}:`);
  
  const completeFile = path.join(DATA_DIR, `onlrb-${year}-complete.json`);
  const progressFile = path.join(DATA_DIR, `.progress-onlrb-${year}.json`);
  
  if (!fs.existsSync(completeFile)) {
    console.log(`  ⚠️  No complete file found`);
    return null;
  }
  
  const completeData = JSON.parse(fs.readFileSync(completeFile, 'utf8'));
  const progress = fs.existsSync(progressFile) ? JSON.parse(fs.readFileSync(progressFile, 'utf8')) : { completed: [] };
  
  console.log(`  Complete file: ${completeData.length} cases`);
  console.log(`  Progress tracker: ${progress.completed.length} IDs`);
  
  // Re-classify outcomes using improved algorithm
  let reclassified = 0;
  completeData.forEach(c => {
    const oldOutcome = c.outcome;
    if (c.outcome === 'Unknown' && c.keywords_api && c.keywords_api.length > 0) {
      const newOutcome = classifyOutcomeFromKeywords(c.keywords_api);
      if (newOutcome !== 'Unknown') {
        c.outcome = newOutcome;
        reclassified++;
      }
    }
  });
  
  if (reclassified > 0) {
    console.log(`  ✓ Reclassified ${reclassified} outcomes`);
    fs.writeFileSync(completeFile, JSON.stringify(completeData, null, 2));
  }
  
  // Check for duplicates
  const ids = completeData.map(c => c.case_id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    console.log(`  ⚠️  Found ${ids.length - uniqueIds.size} duplicate case IDs`);
  }
  
  // Analyze outcomes
  const outcomes = {};
  completeData.forEach(c => {
    outcomes[c.outcome] = (outcomes[c.outcome] || 0) + 1;
  });
  
  const unknownPct = ((outcomes['Unknown'] || 0) / completeData.length * 100).toFixed(1);
  console.log(`  Outcomes: ${Object.keys(outcomes).length} types`);
  console.log(`  Unknown: ${outcomes['Unknown'] || 0} (${unknownPct}%)`);
  
  // Show top 5 outcomes
  const topOutcomes = Object.entries(outcomes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  topOutcomes.forEach(([outcome, count]) => {
    const pct = (count / completeData.length * 100).toFixed(1);
    console.log(`    - ${outcome}: ${count} (${pct}%)`);
  });
  
  return {
    year,
    total: completeData.length,
    progress_count: progress.completed.length,
    reclassified,
    unknown_pct: parseFloat(unknownPct),
    outcomes
  };
}

async function checkCanLIIAvailability(year) {
  console.log(`\n🔍 Checking CanLII for actual ${year} case count...`);
  
  const https = require('https');
  const CANLII_API_KEY = process.env.CANLII_API_KEY || '';
  
  if (!CANLII_API_KEY) {
    console.log(`  ⚠️  No API key - set CANLII_API_KEY env var`);
    return null;
  }
  
  return new Promise((resolve) => {
    const params = new URLSearchParams({
      api_key: CANLII_API_KEY,
      offset: '0',
      resultCount: '1',
      decisionDateAfter: `${year}-01-01`,
      decisionDateBefore: year === 2026 ? '2026-12-31' : `${year + 1}-01-01`
    });
    
    const url = `https://api.canlii.org/v1/caseBrowse/en/onlrb/?${params}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const resultCount = json.resultCount || 0;
          console.log(`  CanLII reports: ${resultCount} total cases for ${year}`);
          resolve(resultCount);
        } catch (e) {
          console.log(`  ⚠️  Error parsing response: ${e.message}`);
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.log(`  ⚠️  Network error: ${err.message}`);
      resolve(null);
    });
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║  🔧 ONLRB DATA CONSOLIDATION & VALIDATION                         ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  
  const stats = [];
  
  for (const year of YEARS) {
    const yearStats = consolidateYear(year);
    if (yearStats) {
      stats.push(yearStats);
    }
    
    // Check CanLII for actual count (for suspicious years like 2022)
    if (year === 2022) {
      const actualCount = await checkCanLIIAvailability(year);
      if (actualCount && actualCount > yearStats.total) {
        console.log(`  ⚠️  MISSING DATA: CanLII has ${actualCount - yearStats.total} more cases!`);
        console.log(`      Action: Re-run scraper for ${year}`);
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 CONSOLIDATION SUMMARY');
  console.log('='.repeat(70));
  
  const totalCases = stats.reduce((sum, s) => sum + s.total, 0);
  const totalReclassified = stats.reduce((sum, s) => sum + s.reclassified, 0);
  const avgUnknown = (stats.reduce((sum, s) => sum + s.unknown_pct, 0) / stats.length).toFixed(1);
  
  console.log(`\nTotal cases: ${totalCases.toLocaleString()}`);
  console.log(`Reclassified: ${totalReclassified}`);
  console.log(`Average "Unknown": ${avgUnknown}%`);
  
  // Identify problem years
  const problemYears = stats.filter(s => s.unknown_pct > 85 || s.total < 500 && s.year !== 2024);
  if (problemYears.length > 0) {
    console.log(`\n⚠️  Problem years (high unknown % or suspiciously low count):`);
    problemYears.forEach(s => {
      console.log(`  - ${s.year}: ${s.total} cases, ${s.unknown_pct}% unknown`);
    });
  }
  
  console.log('\n✓ Consolidation complete!');
  console.log('\nNext steps to improve data:');
  console.log('  1. For years with <500 cases (except 2024): Re-run scraper');
  console.log('  2. For high "Unknown" %: Implement ML-based outcome classification');
  console.log('  3. Extract full text for top 100 cases per year for deeper analysis');
}

main().catch(console.error);
