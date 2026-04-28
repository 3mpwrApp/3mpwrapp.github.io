#!/usr/bin/env node
/**
 * Official Tribunal Website Scraper (v1.0)
 * 
 * Strategy: Bypass CanLII entirely - scrape directly from official tribunal sites
 * 
 * Advantages:
 * - No CanLII rate limits or CAPTCHAs
 * - Better structured data (official sources)
 * - May have more complete outcome information
 * - Direct access to tribunal metadata
 * 
 * Target Sites:
 * 1. WSIAT: https://www.wsiat.on.ca/en/decisions/search/search.aspx
 * 2. HRTO: https://www.hrto.ca/en/decisions-and-orders
 * 3. ONSBT: https://www.olt.gov.on.ca/social-benefits-tribunal/decisions-and-orders/
 * 4. ONWSIB: Internal WSIB decisions (may need different approach)
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

const DATA_DIR = path.join(__dirname, "../data/tribunal-decisions");
const OFFICIAL_DIR = path.join(DATA_DIR, "official-sources");
const DELAY_MS = 3000; // 3 seconds between requests (be respectful)

// Create official sources directory
if (!fs.existsSync(OFFICIAL_DIR)) {
  fs.mkdirSync(OFFICIAL_DIR, { recursive: true });
}

// ===== UTILITIES =====

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchURL(url, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': '3mpwrApp Research (+https://3mpwrapp.ca) - Public Access Tool',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      }
    };

    if (postData) {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = client.request(options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        const redirectUrl = new URL(res.headers.location, url);
        resolve(fetchURL(redirectUrl.toString()));
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

// ===== WSIAT SCRAPER =====

/**
 * WSIAT Decision Search
 * URL: https://www.wsiat.on.ca/en/decisions/search/search.aspx
 * 
 * Features:
 * - Search by date range
 * - Filter by outcome (Allowed, Dismissed, etc.)
 * - Downloadable PDFs
 */
async function scrapeWSIAT(startYear = 2020, endYear = 2026) {
  console.log('\n🏛️ Scraping WSIAT Official Site...');
  
  const decisions = [];
  
  for (let year = startYear; year <= endYear; year++) {
    console.log(`\n📅 Processing year ${year}...`);
    
    const searchUrl = `https://www.wsiat.on.ca/en/decisions/search/search.aspx`;
    
    try {
      // Initial page load to get form tokens
      const initialPage = await fetchURL(searchUrl);
      
      // Extract form tokens (ASP.NET __VIEWSTATE, __EVENTVALIDATION)
      const viewStateMatch = initialPage.html.match(/name="__VIEWSTATE".*?value="([^"]+)"/);
      const eventValidationMatch = initialPage.html.match(/name="__EVENTVALIDATION".*?value="([^"]+)"/);
      
      if (!viewStateMatch || !eventValidationMatch) {
        console.log(`⚠️ Could not extract form tokens for year ${year}`);
        continue;
      }

      const viewState = viewStateMatch[1];
      const eventValidation = eventValidationMatch[1];

      // Build search form data
      const formData = new URLSearchParams({
        '__VIEWSTATE': viewState,
        '__EVENTVALIDATION': eventValidation,
        'ctl00$MainContent$txtDecisionNumber': '',
        'ctl00$MainContent$txtKeywords': '',
        'ctl00$MainContent$ddlDecisionYear': year.toString(),
        'ctl00$MainContent$ddlDecisionOutcome': 'All',
        'ctl00$MainContent$btnSearch': 'Search'
      }).toString();

      // Submit search
      console.log(`  🔍 Searching WSIAT for ${year}...`);
      const searchResults = await fetchURL(searchUrl, 'POST', formData);

      // Parse results table
      const tableMatch = searchResults.html.match(/<table[^>]*id="[^"]*DecisionsGrid[^"]*"[^>]*>(.*?)<\/table>/s);
      
      if (!tableMatch) {
        console.log(`  ℹ️ No results table found for ${year}`);
        continue;
      }

      const tableHTML = tableMatch[1];
      const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
      const rows = [...tableHTML.matchAll(rowRegex)];

      console.log(`  📊 Found ${rows.length - 1} decisions (excluding header)`);

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i][1];
        
        // Extract decision data from row
        const decisionNumMatch = row.match(/>(\d+\/\d+[A-Z]*)</);
        const dateMatch = row.match(/(\d{4}-\d{2}-\d{2})/);
        const outcomeMatch = row.match(/>(Allowed|Dismissed|Varied|Remanded|Withdrawn)</);
        const pdfLinkMatch = row.match(/href="([^"]*\.pdf)"/);

        if (decisionNumMatch && dateMatch) {
          const decision = {
            case_id: `wsiat_${decisionNumMatch[1].replace('/', '_')}`,
            docket_number: decisionNumMatch[1],
            decision_date: dateMatch[1],
            outcome: outcomeMatch ? outcomeMatch[1] : 'Unknown',
            pdf_url: pdfLinkMatch ? `https://www.wsiat.on.ca${pdfLinkMatch[1]}` : null,
            source: 'wsiat_official',
            scraped_at: new Date().toISOString()
          };

          decisions.push(decision);
        }
      }

      console.log(`  ✅ Extracted ${decisions.length} decisions so far`);
      await delay(DELAY_MS);

    } catch (error) {
      console.log(`  ❌ Error processing ${year}: ${error.message}`);
    }
  }

  // Save results
  const outputFile = path.join(OFFICIAL_DIR, `wsiat-official-${startYear}-${endYear}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(decisions, null, 2));
  console.log(`\n💾 Saved ${decisions.length} WSIAT decisions to ${path.basename(outputFile)}`);

  return decisions;
}

// ===== HRTO SCRAPER =====

/**
 * HRTO Decisions and Orders
 * URL: https://www.hrto.ca/en/decisions-and-orders
 * 
 * Note: HRTO may use a database system - this is a starting point
 */
async function scrapeHRTO(startYear = 2020, endYear = 2026) {
  console.log('\n🏛️ Scraping HRTO Official Site...');
  
  const decisions = [];
  
  try {
    // HRTO decision search page
    const searchUrl = 'https://www.hrto.ca/en/decisions-and-orders';
    console.log(`🔍 Fetching HRTO decision index...`);
    
    const page = await fetchURL(searchUrl);
    
    // HRTO structure analysis needed
    // This is a template - actual parsing depends on HRTO's HTML structure
    console.log(`⚠️ HRTO scraping requires manual structure analysis`);
    console.log(`ℹ️ Recommend using CanLII for HRTO until official API is identified`);
    
    // Placeholder: Check if there's a decision database link
    const dbLinkMatch = page.html.match(/href="([^"]*decision[^"]*)"/i);
    if (dbLinkMatch) {
      console.log(`✅ Found potential decision database link: ${dbLinkMatch[1]}`);
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  return decisions;
}

// ===== ONSBT SCRAPER =====

/**
 * ONSBT (Social Benefits Tribunal)
 * URL: https://www.olt.gov.on.ca/social-benefits-tribunal/decisions-and-orders/
 */
async function scrapeONSBT(startYear = 2020, endYear = 2026) {
  console.log('\n🏛️ Scraping ONSBT Official Site...');
  
  const decisions = [];
  
  try {
    const searchUrl = 'https://www.olt.gov.on.ca/social-benefits-tribunal/decisions-and-orders/';
    console.log(`🔍 Fetching ONSBT decision index...`);
    
    const page = await fetchURL(searchUrl);
    
    // ONSBT structure analysis needed
    console.log(`⚠️ ONSBT scraping requires manual structure analysis`);
    console.log(`ℹ️ Recommend using CanLII for ONSBT until official scraper is refined`);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  return decisions;
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log('🚀 Official Tribunal Website Scraper v1.0');
  console.log('==========================================');
  console.log('');
  console.log('Target: Direct scraping from official tribunal sites');
  console.log('Advantages: No CanLII rate limits, better structured data');
  console.log('');

  const startYear = 2020;
  const endYear = 2026;

  // WSIAT is ready to go
  const wsiatDecisions = await scrapeWSIAT(startYear, endYear);

  // HRTO and ONSBT need structure analysis
  console.log('\n');
  console.log('==========================================');
  console.log('⚠️ NEXT STEPS FOR HRTO & ONSBT');
  console.log('==========================================');
  console.log('');
  console.log('1. HRTO: Visit https://www.hrto.ca/en/decisions-and-orders');
  console.log('   - Analyze HTML structure');
  console.log('   - Identify decision database/search system');
  console.log('   - Update scrapeHRTO() function');
  console.log('');
  console.log('2. ONSBT: Visit https://www.olt.gov.on.ca/social-benefits-tribunal/decisions-and-orders/');
  console.log('   - Analyze HTML structure');
  console.log('   - Identify decision listing format');
  console.log('   - Update scrapeONSBT() function');
  console.log('');
  console.log('3. ONWSIB: Internal WSIB decisions may require different approach');
  console.log('   - Consider FOI request for bulk data');
  console.log('   - Or continue using CanLII as primary source');
  console.log('');
  console.log(`✅ WSIAT: ${wsiatDecisions.length} decisions scraped successfully`);
  console.log('');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { scrapeWSIAT, scrapeHRTO, scrapeONSBT };
