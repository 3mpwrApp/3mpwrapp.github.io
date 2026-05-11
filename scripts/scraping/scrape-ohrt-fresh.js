#!/usr/bin/env node
/**
 * OHRT (Ontario Human Rights Tribunal) Fresh Scraper
 * Collect ALL disability discrimination cases 2020-2026
 * 
 * Focus: Employment discrimination, housing, services
 * Search terms: disability, accommodation, persons with disabilities, mental health
 * 
 * Author: 3mpwrApp
 * Date: April 15, 2026
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====
const CANLII_BASE = "https://api.canlii.org/v1";
const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";
const OUTPUT_DIR = path.join(__dirname, '../data/tribunal-decisions');
const CHANGED_SINCE = "2020-01-01"; // Start from 2020
const SEARCH_BATCH_SIZE = 50; // Back to 50 cases per batch
const MIN_DELAY = 2000; // 2 seconds between requests (avoid throttling)
const MAX_DELAY = 3000; // 3 seconds max

// Ensure output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// OHRT search configuration
const OHRT_CONFIG = {
  name: "Human Rights Tribunal of Ontario",
  database: "onhrt",
  jurisdiction: "ON",
  search_terms: [
    "disability",
    "accommodation",
    "discrimination",    "mental health"
  ]
};

// ===== HELPER FUNCTIONS =====

function randomDelay() {
  const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
  return new Promise(resolve => setTimeout(resolve, delay));
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function searchCanLII(database, searchTerm, offset = 0, retries = 3) {
  const params = new URLSearchParams({
    api_key: CANLII_API_KEY,
    offset: offset.toString(),
    resultCount: SEARCH_BATCH_SIZE.toString()
    // Temporarily remove changedSince filter to test
    // changedSince: CHANGED_SINCE
  });
  
  const url = `${CANLII_BASE}/caseBrowse/en/${database}/?${params}&search=${encodeURIComponent(searchTerm)}`;
  
  console.log(`  🔍 Searching: "${searchTerm}" (offset ${offset})`);
  console.log(`  🌐 URL: ${url.substring(0, 120)}...`);
  
  try {
    const response = await httpsGet(url);
    console.log(`  📦 Response keys: ${Object.keys(response).join(', ')}`);
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`  ⚠️  Retry ${4 - retries}/3: ${error.message}`);
      await randomDelay();
      return searchCanLII(database, searchTerm, offset, retries - 1);
    }
    throw error;
  }
}

async function fetchDecisionHTML(caseId, database) {
  // Use correct CanLII endpoint for full decision text
  const url = `https://api.canlii.org/v1/caseBrowse/en/${database}/${caseId}/`;
  const params = new URLSearchParams({ api_key: CANLII_API_KEY });
  const fullUrl = `${url}?${params}`;
  
  try {
    const response = await httpsGet(fullUrl);
    // DEBUG: Log response structure for first case
    if (globalThis._firstFetch === undefined) {
      globalThis._firstFetch = true;
      console.log(`\n🔍 DEBUG - First fetchDecisionHTML response for ${caseId}:`);
      console.log(`  Response type: ${typeof response}`);
      console.log(`  Response keys: ${response ? Object.keys(response).join(', ') : 'null'}`);
      if (response && response.html) {
        console.log(`  HTML length: ${response.html.length}`);
      }
      console.log();
    }
    return response;
  } catch (error) {
    console.log(`    ⚠️  Error fetching ${caseId}: ${error.message}`);
    return null;
  }
}

function extractKeywords(html) {
  if (!html) return [];
  const text = html.toLowerCase();
  
  const keywords = {
    discrimination_grounds: [
      'disability', 'mental health', 'physical disability', 
      'chronic illness', 'addiction', 'PTSD', 'depression', 'anxiety'
    ],
    areas: [
      'employment', 'housing', 'services', 'goods', 'facilities', 'contracts'
    ],
    issues: [
      'accommodation', 'undue hardship', 'prima facie', 'bona fide',
      'termination', 'constructive dismissal', 'harassment', 'poisoned environment',
      'eviction', 'denial of service', 'refusal to accommodate'
    ]
  };
  
  const found = [];
  for (const [category, terms] of Object.entries(keywords)) {
    for (const term of terms) {
      if (text.includes(term.toLowerCase())) {
        found.push({ category, term });
      }
    }
  }
  
  return found;
}

function extractOutcome(caseData, html) {
  const text = (html || '').toLowerCase();
  const keywords = caseData.keywords || '';
  
  // Check outcome indicators
  if (text.includes('application is allowed') || text.includes('application is granted')) {
    return 'Allowed - Violation Found';
  }
  if (text.includes('application is dismissed')) {
    return 'Dismissed - No Violation';
  }
  if (text.includes('settled') || text.includes('withdrawn')) {
    return 'Settled/Withdrawn';
  }
  if (keywords.includes('deferral') || text.includes('deferred')) {
    return 'Deferred';
  }
  if (keywords.includes('jurisdiction') || text.includes('no jurisdiction')) {
    return 'No Jurisdiction';
  }
  if (keywords.includes('abandonment') || text.includes('abandoned')) {
    return 'Abandoned';
  }
  
  return 'Unknown';
}

function parseDecision(caseData, fullData) {
  // Use fullData if available, otherwise use caseData
  const responseData = fullData || caseData;
  const html = fullData?.html || '';
  const keywords_from_api = caseData.keywords || '';
  const keywords_extracted = extractKeywords(html);
  
  // Extract case_id string (can be string or {en: "xxx", fr: "yyy"})
  let caseId = responseData.caseId || caseData.caseId;
  if (typeof caseId === 'object' && caseId !== null) {
    caseId = caseId.en || caseId.fr || 'unknown';
  }
  
  return {
    case_id: caseId || 'unknown',
    title: caseData.title || 'Untitled',
    date: responseData.decisionDate || 'Unknown',
    citation: caseData.citation || '',
    url: responseData.url || '',
    docket_number: responseData.docketNumber || '',
    keywords_raw: keywords_from_api,
    keywords_extracted: keywords_extracted,
    keywords_api: keywords_from_api.split('; ').filter(k => k.trim()).slice(0, 10), // Top 10 keywords from API
    outcome: extractOutcome(responseData, html || keywords_from_api),
    tribunal: "Ontario Human Rights Tribunal",
    scraped_at: new Date().toISOString(),
    data_quality: {
      has_full_text: !!html,
      html_length: html.length,
      has_keywords: keywords_extracted.length > 0 || keywords_from_api.length > 0
    }
  };
}

// ===== MAIN SCRAPING FUNCTION =====

async function scrapeOHRT() {
  console.log('='.repeat(70));
  console.log('🔍 OHRT Fresh Scraper - 2020-2026');
  console.log('='.repeat(70));
  console.log(`Database: ${OHRT_CONFIG.database}`);
  console.log(`Date range: ${CHANGED_SINCE} to today`);
  console.log(`Search terms: ${OHRT_CONFIG.search_terms.length}`);
  console.log();
  
  const allDecisions = [];
  const seenCaseIds = new Set();
  let searchedCount = 0;
  let duplicates = 0;
  
  for (const searchTerm of OHRT_CONFIG.search_terms) {
    console.log(`\n📋 Search: "${searchTerm}"`);
    let offset = 0;
    
    while (true) {
      // Search
      const results = await searchCanLII(OHRT_CONFIG.database, searchTerm, offset);
      // CanLII returns 'cases' not 'results'
      const cases = results.cases || results.results || [];
      
      console.log(`  📊 Found ${cases.length} cases in response`);
      
      if (cases.length === 0) {
        console.log(`  ℹ️  No more results`);
        break;
      }
      
      searchedCount += cases.length;
      console.log(`  📄 Processing ${cases.length} results...`);
      
      // Process each case
      for (const caseData of cases) {
        // Extract caseId (can be string or language object {en: "xxx", fr: "yyy"})
        let caseId = caseData.caseId;
        if (typeof caseId === 'object' && caseId !== null) {
          caseId = caseId.en || caseId.fr || null;
        }
        
        if (!caseId || typeof caseId !== 'string') {
          console.log(`    ⚠️  Skipping case without valid ID (got: ${JSON.stringify(caseData.caseId)})`);
          continue;
        }
        
        // Skip duplicates
        if (seenCaseIds.has(caseId)) {
          duplicates++;
          continue;
        }
        seenCaseIds.add(caseId);
        
        // Fetch full decision
        console.log(`    📄 ${caseId}: ${caseData.title?.substring(0, 60)}...`);
        const fullData = await fetchDecisionHTML(caseId, OHRT_CONFIG.database);
        
        // Parse and add
        const decision = parseDecision(caseData, fullData);
        allDecisions.push(decision);
        
        console.log(`      ✅ ${decision.outcome} - ${decision.keywords_extracted.length} keywords`);
        
        // Rate limiting
        await randomDelay();
      }
      
      offset += SEARCH_BATCH_SIZE;
      
      // Safety: Stop at 5000 cases per search term
      if (offset >= 5000) {
        console.log(`  ⚠️  Reached 5000 results limit for this search`);
        break;
      }
    }
  }
  
  // Save results
  console.log(`\n🔍 DEBUG: allDecisions array length = ${allDecisions.length}`);
  if (allDecisions.length > 0) {
    console.log(`First case: ${allDecisions[0].case_id} - ${allDecisions[0].title}`);
  }
  
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `onhrt-fresh-${timestamp}.json`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(allDecisions, null, 2), 'utf8');
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 SCRAPING COMPLETE');
  console.log('='.repeat(70));
  console.log(`Total cases searched: ${searchedCount}`);
  console.log(`Duplicates skipped: ${duplicates}`);
  console.log(`Unique cases saved: ${allDecisions.length}`);
  console.log(`Output file: ${filename}`);
  console.log();
  
  // Outcome breakdown
  const outcomes = {};
  allDecisions.forEach(d => {
    outcomes[d.outcome] = (outcomes[d.outcome] || 0) + 1;
  });
  
  console.log('📈 Outcome Distribution:');
  Object.entries(outcomes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([outcome, count]) => {
      const pct = (count / allDecisions.length * 100).toFixed(1);
      console.log(`  ${outcome}: ${count} (${pct}%)`);
    });
  
  // Date range
  const dates = allDecisions
    .map(d => d.date)
    .filter(d => d !== 'Unknown')
    .sort();
  
  if (dates.length > 0) {
    console.log(`\n📅 Date Range: ${dates[0]} to ${dates[dates.length - 1]}`);
  }
  
  console.log('\n✅ Data ready for analysis!');
  console.log(`Run: node scripts/analyze-ohrt.js`);
}

// ===== RUN =====

if (CANLII_API_KEY === "YOUR_FREE_API_KEY_HERE") {
  console.error('❌ Error: CANLII_API_KEY environment variable not set');
  console.error('Get your free API key at: https://www.canlii.org/en/info/api.html');
  console.error('Then run: set CANLII_API_KEY=your_key_here (Windows) or export CANLII_API_KEY=your_key_here (Mac/Linux)');
  process.exit(1);
}

scrapeOHRT().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
