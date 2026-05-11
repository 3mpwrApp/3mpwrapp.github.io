#!/usr/bin/env node
/**
 * WSIAT Official Search Scraper
 * 
 * Scrapes WSIAT's official decision search database
 * URL: https://www.wsiat.ca/en/decisionSearch/decisionSearch.asp
 * 
 * Key advantages:
 * - 95,298 decisions available (vs 11,430 on CanLII!)
 * - No DataDome protection (government site)
 * - Structured search form with year/date filters
 * - Can extract decision numbers, dates, keywords, outcomes
 * 
 * Strategy:
 * 1. Submit search queries by year (2020-2026)
 * 2. Parse HTML result tables
 * 3. Extract decision metadata (number, date, panel, keywords)
 * 4. Save to JSON for analysis
 * 5. Optional: Fetch full decision text by decision number
 * 
 * Author: 3mpwrApp + GitHub Copilot
 * Date: April 27, 2026
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// ===== CONFIGURATION =====

const DATA_DIR = path.join(__dirname, "../data/tribunal-decisions/official-sources");
const DELAY_MS = 3000; // 3 seconds between requests (respectful scraping)

// Create directory if needed
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ===== UTILITIES =====

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchURL(url, method = 'GET', postData = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        ...headers
      }
    };

    if (postData) {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = client.request(options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = new URL(res.headers.location, url);
        resolve(fetchURL(redirectUrl.toString(), method, postData, headers));
        return;
      }

      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ html: data, statusCode: 200 });
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// ===== WSIAT SEARCH FORM SCRAPER =====

async function searchWSIATByYear(year) {
  console.log(`\n📅 Searching WSIAT for year ${year}...`);
  
  const searchUrl = 'https://www.wsiat.ca/en/decisionSearch/decisionSearch.asp';
  
  try {
    // Build form data for search (year range)
    const formData = new URLSearchParams({
      'fromMonth': '1',
      'fromDay': '1',
      'fromYear': year.toString(),
      'toMonth': '12',
      'toDay': '31',
      'toYear': year.toString(),
      'decisionNumber': '',
      'structuredKeywords': '',
      'summaryContains': '',
      'panelFirstName': '',
      'panelLastName': '',
      'referencesEtc': '',
      'noteworthyOnly': '',
      'summarizedOnly': '',
      'displaySummary': 'on',
      'displayKeywords': 'on',
      'displayReferences': 'on',
      'displayStyleOfCause': 'on',
      'displayNeutralCitation': 'on',
      'btnSearch': 'Search'
    }).toString();

    console.log(`  🔍 Submitting search form...`);
    const response = await fetchURL(searchUrl, 'POST', formData);
    
    // Parse HTML results
    const decisions = parseWSIATResults(response.html, year);
    
    console.log(`  ✅ Found ${decisions.length} decisions for ${year}`);
    return decisions;

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return [];
  }
}

function parseWSIATResults(html, year) {
  const decisions = [];
  
  // Look for decision result rows
  // WSIAT results typically show in a table or list format
  // Pattern: Decision #, Date, Keywords, Summary, etc.
  
  // Extract decision numbers (format: YYYY/NNNNN or YYYYONWSIATNNNN)
  const decisionRegex = /(\d{4}\/\d+|\d{4}ONWSIAT\d+)/g;
  const matches = html.match(decisionRegex) || [];
  
  // Remove duplicates
  const uniqueDecisions = [...new Set(matches)];
  
  // Extract more details from HTML
  const rows = html.match(/<tr[^>]*>(.*?)<\/tr>/gs) || [];
  
  for (const row of rows) {
    const decisionMatch = row.match(/(\d{4}\/\d+|\d{4}ONWSIAT\d+)/);
    if (!decisionMatch) continue;
    
    const decisionNum = decisionMatch[1];
    
    // Extract date if available
    const dateMatch = row.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/);
    const date = dateMatch ? dateMatch[1] : null;
    
    // Extract keywords if available
    const keywordMatch = row.match(/Keywords?:?\s*([^<]+)/i);
    const keywords = keywordMatch ? keywordMatch[1].trim() : null;
    
    // Check for outcome indicators
    let outcome = 'Unknown';
    const rowLower = row.toLowerCase();
    if (rowLower.includes('allowed') && !rowLower.includes('not allowed')) {
      outcome = 'Granted';
    } else if (rowLower.includes('dismissed')) {
      outcome = 'Denied';
    } else if (rowLower.includes('withdrawn') || rowLower.includes('adjourned')) {
      outcome = 'Deferred';
    }
    
    decisions.push({
      case_id: `wsiat_${decisionNum.replace(/\//g, '_')}`,
      docket_number: decisionNum,
      decision_date: date,
      keywords: keywords,
      inferred_outcome: outcome,
      source: 'wsiat_official_search',
      search_year: year,
      scraped_at: new Date().toISOString(),
      url: `https://www.wsiat.ca/en/decisionSearch/decisionDetail.asp?id=${decisionNum}`
    });
  }
  
  // Fallback: If we can't parse structured data, just extract decision numbers
  if (decisions.length === 0 && uniqueDecisions.length > 0) {
    for (const decisionNum of uniqueDecisions) {
      decisions.push({
        case_id: `wsiat_${decisionNum.replace(/\//g, '_')}`,
        docket_number: decisionNum,
        decision_date: null,
        keywords: null,
        inferred_outcome: 'Unknown',
        source: 'wsiat_official_search',
        search_year: year,
        scraped_at: new Date().toISOString(),
        url: `https://www.wsiat.ca/en/decisionSearch/decisionDetail.asp?id=${decisionNum}`
      });
    }
  }
  
  return decisions;
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log('🚀 WSIAT Official Search Scraper');
  console.log('==========================================');
  console.log('');
  console.log('Target: WSIAT official database (95,298 decisions available)');
  console.log('Strategy: Search by year, parse results, extract metadata');
  console.log('Advantage: No DataDome, direct from source');
  console.log('');

  const startYear = 2020;
  const endYear = 2026;
  const allDecisions = [];

  for (let year = startYear; year <= endYear; year++) {
    const decisions = await searchWSIATByYear(year);
    allDecisions.push(...decisions);
    
    // Save progress after each year
    const progressFile = path.join(DATA_DIR, `wsiat-official-partial-${year}.json`);
    fs.writeFileSync(progressFile, JSON.stringify(decisions, null, 2));
    console.log(`  💾 Saved to ${path.basename(progressFile)}`);
    
    await delay(DELAY_MS);
  }

  // Save consolidated results
  const outputFile = path.join(DATA_DIR, `wsiat-official-${startYear}-${endYear}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(allDecisions, null, 2));

  console.log('\n');
  console.log('==========================================');
  console.log('🎉 WSIAT SCRAPE COMPLETE');
  console.log('==========================================');
  console.log(`Total decisions found: ${allDecisions.length}`);
  console.log(`Years covered: ${startYear}-${endYear}`);
  console.log(`Output file: ${path.basename(outputFile)}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Review extracted data for quality');
  console.log('2. If needed, adjust parsing patterns');
  console.log('3. Fetch full decision text by decision number');
  console.log('4. Run outcome detection on full text');
  console.log('');
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { searchWSIATByYear, parseWSIATResults };
