#!/usr/bin/env node
/**
 * 🔬 COMPREHENSIVE BC EST SCRAPER (2020-2026)
 * British Columbia Employment Standards Tribunal
 * 
 * CRITICAL DATASET: BC employment standards appeal decisions
 * Focus: Wage disputes, overtime, termination, employment standards violations
 * Compare to: Other provincial employment tribunals
 * 
 * Output: Year-by-year JSON files with enhanced metadata
 * bcest-2020-complete.json
 * bcest-2021-complete.json
 * ... through 2026
 * 
 * Author: 3mpwrApp Research Team
 * Date: May 6, 2026
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====
const CANLII_BASE = "https://api.canlii.org/v1";
const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";
const OUTPUT_DIR = path.join(__dirname, '../data/tribunal-decisions');
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const DELAY_MS = 15000; // 15 seconds between requests (avoid CanLII throttling)
const MAX_RETRIES = 3;

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ===== HELPER FUNCTIONS =====

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          // 🆕 Detect CanLII quota exceeded
          if (parsed.error && parsed.error.includes('QUOTA')) {
            reject(new Error('QUOTA_EXCEEDED'));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          // Check if it's a quota error in malformed JSON
          if (data.includes('QUOTA_EXCE') || data.includes('quota') || data.includes('THROTTLED')) {
            reject(new Error('QUOTA_EXCEEDED'));
          } else {
            console.error(`  ⚠️  JSON parse error: ${e.message}`);
            reject(new Error(`JSON parse error: ${e.message}`));
          }
        }
      });
    }).on('error', reject);
  });
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await httpsGet(url);
      return response;
    } catch (error) {
      if (error.message === 'QUOTA_EXCEEDED') {
        throw error; // Don't retry quota errors
      }
      if (attempt < retries) {
        console.log(`  ⚠️  Attempt ${attempt}/${retries} failed: ${error.message}`);
        await delay(DELAY_MS * attempt); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}

// ===== CASE LIST FETCHING =====

async function fetchYearCaseList(year) {
  console.log(`\n📅 Fetching BC EST case list for ${year}...`);
  
  const allCases = [];
  let offset = 0;
  const resultCount = 1000; // Max results per request
  
  while (true) {
    const params = new URLSearchParams({
      api_key: CANLII_API_KEY,
      offset: offset.toString(),
      resultCount: resultCount.toString(),
      decisionDateAfter: `${year}-01-01`,
      decisionDateBefore: `${year}-12-31`
    });
    
    const url = `${CANLII_BASE}/caseBrowse/en/bcest/?${params.toString()}`;
    
    console.log(`  🔍 Fetching offset ${offset} (batch size: ${resultCount})`);
    
    try {
      await delay(DELAY_MS);
      const response = await fetchWithRetry(url);
      
      if (!response.cases || response.cases.length === 0) {
        console.log(`  ✓ No more cases found`);
        break;
      }
      
      allCases.push(...response.cases);
      console.log(`  📦 Retrieved ${response.cases.length} cases`);
      
      // Check if we've reached the end
      if (response.cases.length < resultCount) {
        console.log(`  ✓ Reached end of results`);
        break;
      }
      
      offset += resultCount;
    } catch (error) {
      if (error.message === 'QUOTA_EXCEEDED') {
        console.log(`\n⚠️  QUOTA EXCEEDED at offset ${offset}`);
        console.log(`  📦 Collected ${allCases.length} cases before quota limit`);
        console.log(`  💾 Progress will be saved`);
        console.log(`  🔄 Re-run this script later to resume from where you left off`);
        throw error;
      }
      console.error(`  ❌ Error fetching case list: ${error.message}`);
      break;
    }
  }
  
  console.log(`  ✓ Total cases for ${year}: ${allCases.length}`);
  return allCases;
}

// ===== INDIVIDUAL CASE FETCHING =====

async function fetchCaseDetails(caseId, year) {
  const url = `${CANLII_BASE}/caseBrowse/en/bcest/${caseId}?api_key=${CANLII_API_KEY}`;
  
  try {
    await delay(DELAY_MS);
    const response = await fetchWithRetry(url);
    return response;
  } catch (error) {
    console.error(`    ⚠️  Error fetching ${caseId}: ${error.message}`);
    return null;
  }
}

// ===== TEXT EXTRACTION & ANALYSIS =====

function extractKeywords(html) {
  if (!html) return [];
  const text = html.toLowerCase();
  
  const keywordGroups = {
    issues: [
      'wages', 'overtime', 'termination', 'dismissal', 'compensation',
      'employment standards', 'statutory holiday', 'vacation pay',
      'severance', 'notice', 'hours of work', 'unpaid wages',
      'constructive dismissal', 'wrongful termination', 'just cause'
    ],
    outcomes: [
      'dismissed', 'allowed', 'granted', 'denied', 'upheld',
      'overturned', 'varied', 'remitted', 'withdrawn', 'settled'
    ],
    legal_tests: [
      'employment standards act', 'esa', 'reasonable notice',
      'just cause', 'wilful misconduct', 'good faith',
      'mitigating circumstances', 'burden of proof'
    ],
    remedies: [
      'compensation', 'reinstatement', 'wages owed', 'monetary award',
      'interest', 'costs', 'damages', 'back pay'
    ]
  };
  
  const found = [];
  for (const [category, terms] of Object.entries(keywordGroups)) {
    for (const term of terms) {
      if (text.includes(term)) {
        found.push({ category, term });
      }
    }
  }
  
  return found;
}

// 🆕 ENHANCED: Extract outcome from keyword summaries (works without full text!)
function extractOutcomeFromKeywords(keywords) {
  if (!keywords || keywords.length === 0) return null;
  
  const keywordText = keywords.join(' ').toLowerCase();
  
  // Check for outcomes in keyword summaries
  if (keywordText.includes('appeal dismissed') || keywordText.includes('determination confirmed')) {
    return 'Dismissed - Determination Upheld';
  }
  if (keywordText.includes('appeal allowed') || keywordText.includes('determination cancelled') ||
      keywordText.includes('determination varied')) {
    return 'Allowed - Determination Overturned';
  }
  if (keywordText.includes('settled') || keywordText.includes('withdrawn')) {
    return 'Settled/Withdrawn';
  }
  if (keywordText.includes('remitted') || keywordText.includes('referred back')) {
    return 'Remitted';
  }
  if (keywordText.includes('no jurisdiction')) {
    return 'No Jurisdiction';
  }
  if (keywordText.includes('reconsideration')) {
    return 'Reconsideration';
  }
  if (keywordText.includes('costs')) {
    return 'Costs Decision';
  }
  
  return null; // Will fall back to extractOutcome
}

function extractOutcome(caseData, html) {
  const text = (html || '').toLowerCase();
  const title = (caseData.title || '').toLowerCase();
  
  // Try keyword-based detection first
  // Convert keywords to array if it's a string (API returns semicolon-delimited)
  const keywordsArray = typeof caseData.keywords === 'string' 
    ? caseData.keywords.split(';').map(k => k.trim()).filter(k => k)
    : (Array.isArray(caseData.keywords) ? caseData.keywords : []);
  const outcomeFromKeywords = extractOutcomeFromKeywords(keywordsArray);
  if (outcomeFromKeywords) return outcomeFromKeywords;
  
  // Patterns for BC EST decisions
  if (text.includes('appeal is dismissed') || text.includes('appeal dismissed')) {
    return 'Dismissed - Determination Upheld';
  }
  if (text.includes('appeal is allowed') || text.includes('appeal allowed')) {
    return 'Allowed - Determination Overturned';
  }
  if (text.includes('determination is cancelled') || text.includes('determination cancelled')) {
    return 'Allowed - Determination Cancelled';
  }
  if (text.includes('determination is varied') || text.includes('determination varied')) {
    return 'Allowed - Determination Varied';
  }
  if (text.includes('remitted') || text.includes('referred back')) {
    return 'Remitted to Director';
  }
  if (text.includes('withdrawn') || title.includes('withdrawn')) {
    return 'Withdrawn';
  }
  if (text.includes('settled') || title.includes('settled')) {
    return 'Settled';
  }
  
  return 'Unknown';
}

// 🆕 ENHANCED: Extract legislation references from keyword text
function extractLegislationFromKeywords(keywords) {
  if (!keywords || keywords.length === 0) return [];
  
  const keywordText = keywords.join(' ');
  const legislation = [];
  
  // Pattern: "Employment Standards Act, s. X" or "ESA, s. X(Y)" etc.
  const patterns = [
    /Employment Standards Act,\s*[Ss]\.\s*[\d]+(\([\d]+\))?/gi,
    /ESA,\s*[Ss]\.\s*[\d]+(\([\d]+\))?/gi,
    /Employment Standards Regulation,\s*[Ss]\.\s*[\d]+/gi,
    /B\.C\. Reg\. [\d]+\/[\d]+/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = keywordText.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Normalize "ESA" to full name
        let normalized = match;
        if (match.startsWith('ESA,')) {
          normalized = 'Employment Standards Act, ' + match.substring(5);
        }
        if (!legislation.includes(normalized)) {
          legislation.push(normalized);
        }
      });
    }
  });
  
  return legislation;
}

function parseDecision(caseData, fullData) {
  const html = fullData?.html || '';
  const keywords = extractKeywords(html);
  
  // Extract caseId (can be string or {en: "xxx", fr: "yyy"})
  let caseId = fullData?.caseId || caseData.caseId;
  if (typeof caseId === 'object' && caseId !== null) {
    caseId = caseId.en || caseId.fr || 'unknown';
  }
  
  // Extract keywords as array (API returns semicolon-delimited string)
  const keywordsApi = (caseData.keywords || fullData?.keywords || '').split(';').map(k => k.trim()).filter(k => k);
  
  // 🆕 Extract legislation from keywords text
  const legislation = extractLegislationFromKeywords(keywordsApi);
  
  // Enhanced outcome parsing from keywords
  const outcomeFromKeywords = extractOutcomeFromKeywords(keywordsApi);
  
  return {
    case_id: caseId || 'unknown',
    title: caseData.title || fullData?.title || 'Untitled',
    citation: caseData.citation || fullData?.citation || '',
    decision_date: fullData?.decisionDate || caseData.decisionDate || 'Unknown',
    docket_number: fullData?.docketNumber || caseData.docketNumber || '',
    url: fullData?.url || caseData.url || `https://canlii.ca/t/${caseId}`,
    
    // Keywords
    keywords_api: keywordsApi,
    keywords_extracted: keywords,
    
    // 🆕 ENHANCED: Legislation referenced (parsed from keywords)
    legislation_cited: legislation,
    legislation_count: legislation.length,
    
    // Analysis
    outcome: outcomeFromKeywords || extractOutcome(fullData || caseData, html),
    
    // Full text
    full_text_html: html,
    full_text_length: html.length,
    
    // Metadata
    tribunal: "British Columbia Employment Standards Tribunal",
    database: "bcest",
    scraped_at: new Date().toISOString(),
    
    // Data quality
    data_quality: {
      has_full_text: !!html,
      has_keywords: keywords.length > 0,
      has_outcome: outcomeFromKeywords !== null || extractOutcome(fullData || caseData, html) !== 'Unknown',
      has_legislation: legislation.length > 0
    }
  };
}

// ===== MAIN SCRAPING LOGIC =====

async function scrapeYear(year) {
  console.log('\n' + '='.repeat(70));
  console.log(`📊 SCRAPING BC EST DECISIONS FOR ${year}`);
  console.log('='.repeat(70));
  
  const outputFile = path.join(OUTPUT_DIR, `bcest-${year}-complete.json`);
  const progressFile = path.join(OUTPUT_DIR, `.progress-bcest-${year}.json`);
  
  // Check if already completed
  if (fs.existsSync(outputFile)) {
    const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    console.log(`✓ ${year} already scraped: ${existing.length} cases`);
    console.log(`  To re-scrape, delete: ${outputFile}`);
    return existing;
  }
  
  // Load progress if exists
  let progress = { completed: [], failed: [] };
  if (fs.existsSync(progressFile)) {
    progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    console.log(`📂 Resuming: ${progress.completed.length} completed, ${progress.failed.length} failed`);
  }
  
  // Step 1: Get case list
  const caseList = await fetchYearCaseList(year);
  
  if (caseList.length === 0) {
    console.log(`⚠️  No cases found for ${year}`);
    // Save empty file to mark as complete
    fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
    return [];
  }
  
  // Step 2: Fetch full text for each case
  console.log(`\n📄 Fetching full text for ${caseList.length} cases...`);
  const results = [];
  let failedCount = 0;
  
  for (let i = 0; i < caseList.length; i++) {
    const caseData = caseList[i];
    const caseId = typeof caseData.caseId === 'string' ? caseData.caseId : (caseData.caseId?.en || 'unknown');
    
    // Skip if already completed
    if (progress.completed.includes(caseId)) {
      continue;
    }
    
    console.log(`  [${i + 1}/${caseList.length}] (${((i + 1) / caseList.length * 100).toFixed(1)}%) Fetching ${caseId}...`);
    
    try {
      const fullData = await fetchCaseDetails(caseId, year);
      
      if (fullData) {
        const parsed = parseDecision(caseData, fullData);
        results.push(parsed);
        progress.completed.push(caseId);
      } else {
        console.log(`    ⚠️  No data returned`);
        progress.failed.push(caseId);
        failedCount++;
      }
      
      // Save progress every 10 cases
      if ((i + 1) % 10 === 0) {
        fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
        console.log(`    💾 Progress saved (${progress.completed.length} completed)`);
      }
      
    } catch (error) {
      if (error.message === 'QUOTA_EXCEEDED') {
        console.log(`\n⚠️  QUOTA EXCEEDED at case ${i + 1}/${caseList.length}`);
        console.log(`  📦 Collected ${results.length} cases before quota limit`);
        console.log(`  💾 Saving progress...`);
        
        // Save progress
        fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
        
        // Save partial results
        const partialFile = path.join(OUTPUT_DIR, `bcest-${year}-PARTIAL.json`);
        fs.writeFileSync(partialFile, JSON.stringify(results, null, 2));
        
        console.log(`  ✓ Progress saved to: ${progressFile}`);
        console.log(`  ✓ Partial results saved to: ${partialFile}`);
        console.log(`\n🔄 To resume: Wait for quota reset (midnight UTC or 24h), then re-run this script`);
        console.log(`   The script will automatically resume from case ${i + 1}`);
        
        process.exit(0);
      }
      
      console.log(`    ⚠️  Error: ${error.message}`);
      progress.failed.push(caseId);
      failedCount++;
    }
  }
  
  // Step 3: Save final results
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  
  // Calculate outcome distribution
  const outcomes = {};
  results.forEach(r => {
    outcomes[r.outcome] = (outcomes[r.outcome] || 0) + 1;
  });
  
  console.log(`\n✓ ${year} complete: ${results.length} cases saved`);
  console.log(`  Failed: ${failedCount}`);
  console.log(`  Output: ${outputFile}`);
  
  // Clean up progress file
  if (fs.existsSync(progressFile)) {
    fs.unlinkSync(progressFile);
  }
  
  return results;
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║  🔬 COMPREHENSIVE BC EST SCRAPER (2020-2026)                      ║');
  console.log('║  Employment Standards Tribunal - Wage & Termination Disputes     ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  
  console.log(`\n📅 Years to scrape: ${YEARS.join(', ')}`);
  console.log(`⏱️  Delay between requests: ${DELAY_MS}ms`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  
  const allResults = {};
  const summary = {
    database: 'bcest',
    jurisdiction: 'British Columbia',
    years: [],
    totalCases: 0,
    scrapedAt: new Date().toISOString(),
    files: []
  };
  
  for (const year of YEARS) {
    try {
      const yearResults = await scrapeYear(year);
      allResults[year] = yearResults;
      
      // Calculate outcome distribution for this year
      const outcomes = {};
      yearResults.forEach(r => {
        outcomes[r.outcome] = (outcomes[r.outcome] || 0) + 1;
      });
      
      // Get top 5 outcomes
      const topOutcomes = Object.entries(outcomes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([outcome, count]) => `${outcome}: ${count}`);
      
      summary.years.push({
        year,
        totalCases: yearResults.length,
        outcomes: outcomes,
        topOutcomes
      });
      summary.totalCases += yearResults.length;
      summary.files.push(`bcest-${year}-complete.json`);
      
    } catch (error) {
      console.error(`\n❌ Fatal error scraping ${year}: ${error.message}`);
      if (error.message === 'QUOTA_EXCEEDED') {
        console.log(`\n⚠️  Stopping here due to quota. Progress is saved.`);
        break;
      }
    }
  }
  
  // Save summary
  const summaryFile = path.join(OUTPUT_DIR, 'bcest-scraping-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 SCRAPING SUMMARY');
  console.log('='.repeat(70));
  console.log(`\n✓ COMPLETE: ${summary.totalCases} total cases collected`);
  console.log(`📄 Summary saved to: ${summaryFile}`);
  
  // Print year-by-year summary
  for (const yearSummary of summary.years) {
    console.log(`\n${yearSummary.year}:`);
    console.log(`  Total cases: ${yearSummary.totalCases}`);
    console.log(`  Top outcomes:`);
    yearSummary.topOutcomes.forEach(outcome => {
      console.log(`    - ${outcome}`);
    });
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { scrapeYear, main };
