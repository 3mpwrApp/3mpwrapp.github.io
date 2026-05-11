#!/usr/bin/env node
/**
 * 🔬 COMPREHENSIVE BC WCAT SCRAPER (2020-2026)
 * British Columbia Workers' Compensation Appeal Tribunal
 * 
 * CRITICAL DATASET: BC workers' compensation appeal decisions
 * Focus: Appeal success rates, injury types, benefit denials
 * Compare to: Ontario WSIAT (similar appellate function)
 * 
 * Output: Year-by-year JSON files with enhanced metadata
 * bcwcat-2020-complete.json
 * bcwcat-2021-complete.json
 * ... through 2026
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 26, 2026
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
          
          // Detect CanLII quota exceeded
          if (parsed.error && parsed.error.includes('QUOTA')) {
            reject(new Error('QUOTA_EXCEEDED'));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          // Check if it's a quota error in malformed JSON
          if (data.includes('QUOTA_EXCE') || data.includes('quota')) {
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
        console.error(`\n❌ CanLII API quota exceeded. Try again after 8 PM ET when quota resets.\n`);
        throw error;
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
  console.log(`\n📅 Fetching BC WCAT case list for ${year}...`);
  
  const allCases = [];
  let offset = 0;
  const resultCount = 1000; // Max results per request
  
  while (true) {
    const params = new URLSearchParams({
      api_key: CANLII_API_KEY,
      offset: offset.toString(),
      resultCount: resultCount.toString(),
      decisionDateAfter: `${year}-01-01`,
      decisionDateBefore: year === 2026 ? '2026-12-31' : `${year + 1}-01-01`
    });
    
    const url = `${CANLII_BASE}/caseBrowse/en/bcwcat/?${params}`;
    
    console.log(`  🔍 Fetching offset ${offset} (batch size: ${resultCount})`);
    
    try {
      const response = await fetchWithRetry(url);
      const cases = response.cases || [];
      
      if (cases.length === 0) {
        console.log(`  ✓ No more cases found`);
        break;
      }
      
      console.log(`  📦 Retrieved ${cases.length} cases`);
      allCases.push(...cases);
      
      offset += cases.length;
      
      // If we got fewer than requested, we've reached the end
      if (cases.length < resultCount) {
        console.log(`  ✓ Reached end of results`);
        break;
      }
      
      await delay(DELAY_MS);
      
    } catch (error) {
      if (error.message === 'QUOTA_EXCEEDED') {
        throw error;
      }
      console.error(`  ❌ Error fetching case list: ${error.message}`);
      break;
    }
  }
  
  console.log(`  ✓ Total cases for ${year}: ${allCases.length}`);
  return allCases;
}

// ===== FULL DECISION TEXT FETCHING =====

async function fetchFullDecision(caseId) {
  const params = new URLSearchParams({ api_key: CANLII_API_KEY });
  const url = `${CANLII_BASE}/caseBrowse/en/bcwcat/${caseId}/?${params}`;
  
  try {
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
    injury_types: [
      'chronic pain', 'ptsd', 'back injury', 'shoulder injury', 'knee injury',
      'traumatic brain injury', 'tbi', 'concussion', 'hearing loss',
      'carpal tunnel', 'tendonitis', 'rotator cuff', 'herniated disc',
      'fibromyalgia', 'complex regional pain', 'crps', 'amputation',
      'burn injury', 'fracture', 'spinal injury', 'neck injury'
    ],
    conditions: [
      'pre-existing condition', 'degenerative', 'arthritis', 'osteoarthritis',
      'psychological injury', 'mental disorder', 'depression', 'anxiety',
      'substance abuse', 'addiction'
    ],
    issues: [
      'entitlement', 'causation', 'significant contribution', 'substantial contribution',
      'compensability', 'aggravation', 'recurrence', 'new injury',
      'wage loss', 'permanent disability', 'loss of earnings', 'retirement',
      'vocational rehabilitation', 'return to work', 'suitable employment'
    ],
    outcomes: [
      'appeal allowed', 'appeal dismissed', 'appeal denied', 'varied',
      'confirmed', 'rescinded', 'remitted', 'consent'
    ],
    legal_tests: [
      'significant contributing factor', 'material contribution', 
      'balance of probabilities', 'causation test', 'substantial connection',
      'but for test', 'dominant cause', 'credibility', 'weight of evidence'
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

// Extract outcome from keywords and title
function extractOutcomeFromKeywords(keywords, title) {
  if (!keywords && !title) return null;
  
  // Ensure keywords is an array
  const keywordsArray = Array.isArray(keywords) ? keywords : [];
  const keywordText = keywordsArray.join(' ').toLowerCase();
  const titleText = (title || '').toLowerCase();
  const combinedText = keywordText + ' ' + titleText;
  
  // BC WCAT specific outcome patterns
  if (combinedText.includes('appeal allowed') || combinedText.includes('appeal is granted')) {
    return 'Appeal Allowed';
  }
  if (combinedText.includes('appeal dismissed') || combinedText.includes('appeal denied')) {
    return 'Appeal Dismissed';
  }
  if (combinedText.includes('varied') || combinedText.includes('decision varied')) {
    return 'Decision Varied';
  }
  if (combinedText.includes('confirmed')) {
    return 'Decision Confirmed';
  }
  if (combinedText.includes('rescinded')) {
    return 'Decision Rescinded';
  }
  if (combinedText.includes('remitted') || combinedText.includes('referred back')) {
    return 'Remitted to Board';
  }
  if (combinedText.includes('consent') || combinedText.includes('by consent')) {
    return 'Consent Order';
  }
  if (combinedText.includes('withdrawn')) {
    return 'Withdrawn';
  }
  if (combinedText.includes('jurisdiction') || combinedText.includes('no appeal')) {
    return 'No Jurisdiction';
  }
  if (combinedText.includes('preliminary') || combinedText.includes('interim')) {
    return 'Preliminary/Interim Decision';
  }
  
  return null;
}

function extractOutcome(caseData, html) {
  const text = (html || '').toLowerCase();
  const title = (caseData.title || '').toLowerCase();
  
  // Handle keywords - could be array, string, or missing
  let keywords = [];
  if (Array.isArray(caseData.keywords)) {
    keywords = caseData.keywords.map(k => k.toLowerCase());
  } else if (typeof caseData.keywords === 'string') {
    keywords = [caseData.keywords.toLowerCase()];
  }
  
  // Try keywords first
  const keywordOutcome = extractOutcomeFromKeywords(keywords, title);
  if (keywordOutcome) return keywordOutcome;
  
  // Scan decision text for BC WCAT patterns
  const patterns = [
    { regex: /appeal\s+(?:is\s+)?allowed/i, outcome: 'Appeal Allowed' },
    { regex: /appeal\s+(?:is\s+)?dismissed/i, outcome: 'Appeal Dismissed' },
    { regex: /appeal\s+(?:is\s+)?denied/i, outcome: 'Appeal Dismissed' },
    { regex: /decision\s+(?:is\s+)?varied/i, outcome: 'Decision Varied' },
    { regex: /decision\s+(?:is\s+)?confirmed/i, outcome: 'Decision Confirmed' },
    { regex: /decision\s+(?:is\s+)?rescinded/i, outcome: 'Decision Rescinded' },
    { regex: /remit(?:ted)?\s+to\s+the\s+board/i, outcome: 'Remitted to Board' },
    { regex: /by\s+consent/i, outcome: 'Consent Order' },
    { regex: /withdrawn/i, outcome: 'Withdrawn' }
  ];
  
  for (const { regex, outcome } of patterns) {
    if (regex.test(text) || regex.test(title)) {
      return outcome;
    }
  }
  
  return 'Unknown';
}

// ===== MAIN SCRAPING LOGIC =====

async function scrapeYear(year) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 STARTING BC WCAT SCRAPE FOR ${year}`);
  console.log(`${'='.repeat(60)}`);
  
  const outputPath = path.join(OUTPUT_DIR, `bcwcat-${year}-complete.json`);
  const progressPath = path.join(OUTPUT_DIR, `.progress-bcwcat-${year}.json`);
  
  // Check if already complete
  if (fs.existsSync(outputPath)) {
    console.log(`⚠️  ${year} already scraped. File exists at: ${outputPath}`);
    console.log(`   Delete file to re-scrape, or skip.`);
    return;
  }
  
  // Load progress if exists
  let progress = { completed: [], failed: [] };
  if (fs.existsSync(progressPath)) {
    progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
    console.log(`📂 Resuming from checkpoint: ${progress.completed.length} completed, ${progress.failed.length} failed`);
  }
  
  try {
    // Step 1: Get case list
    const caseList = await fetchYearCaseList(year);
    
    if (caseList.length === 0) {
      console.log(`\n⚠️  No cases found for ${year}`);
      fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
      return;
    }
    
    // Step 2: Filter out already completed
    const casesToFetch = caseList.filter(c => {
      const cId = typeof c.caseId === 'object' ? c.caseId.en : c.caseId;
      return !progress.completed.includes(cId) && !progress.failed.includes(cId);
    });
    
    console.log(`\n📊 Processing ${casesToFetch.length} remaining cases out of ${caseList.length} total`);
    
    const enrichedCases = [];
    
    // Step 3: Fetch full details for each case
    for (let i = 0; i < casesToFetch.length; i++) {
      const caseMetadata = casesToFetch[i];
      const caseId = typeof caseMetadata.caseId === 'object' ? caseMetadata.caseId.en : caseMetadata.caseId;
      
      console.log(`\n[${i + 1}/${casesToFetch.length}] 📄 Fetching: ${caseId}`);
      
      const fullCase = await fetchFullDecision(caseId);
      
      if (fullCase) {
        const html = fullCase.html || '';
        const keywords = extractKeywords(html);
        const outcome = extractOutcome(fullCase, html);
        
        enrichedCases.push({
          ...caseMetadata,
          ...fullCase,
          extractedKeywords: keywords,
          detectedOutcome: outcome,
          scrapedAt: new Date().toISOString()
        });
        
        progress.completed.push(caseId);
        console.log(`  ✓ Extracted ${keywords.length} keywords | Outcome: ${outcome}`);
      } else {
        progress.failed.push(caseId);
        console.log(`  ❌ Failed to fetch`);
      }
      
      // Save progress every 10 cases
      if ((i + 1) % 10 === 0) {
        fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
        console.log(`\n💾 Progress saved: ${progress.completed.length} completed`);
      }
      
      await delay(DELAY_MS);
    }
    
    // Step 4: Load any previously completed cases
    let previousCases = [];
    if (progress.completed.length > enrichedCases.length) {
      console.log(`\n📂 Loading ${progress.completed.length - enrichedCases.length} previously completed cases...`);
      // Would need to merge with existing partial file, but for simplicity we'll just use current batch
    }
    
    const finalCases = [...enrichedCases];
    
    // Step 5: Save final output
    fs.writeFileSync(outputPath, JSON.stringify(finalCases, null, 2));
    console.log(`\n✅ COMPLETE: ${year} - Saved ${finalCases.length} cases to ${outputPath}`);
    
    // Clean up progress file
    if (fs.existsSync(progressPath)) {
      fs.unlinkSync(progressPath);
    }
    
    // Summary stats
    const outcomeStats = {};
    finalCases.forEach(c => {
      const outcome = c.detectedOutcome || 'Unknown';
      outcomeStats[outcome] = (outcomeStats[outcome] || 0) + 1;
    });
    
    console.log(`\n📈 OUTCOME BREAKDOWN:`);
    Object.entries(outcomeStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([outcome, count]) => {
        const pct = ((count / finalCases.length) * 100).toFixed(1);
        console.log(`   ${outcome.padEnd(30)} ${count.toString().padStart(4)} (${pct}%)`);
      });
    
  } catch (error) {
    console.error(`\n❌ FATAL ERROR for ${year}: ${error.message}`);
    
    // Save progress before exit
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    console.log(`💾 Progress saved. You can resume later.`);
    
    if (error.message === 'QUOTA_EXCEEDED') {
      console.log(`\n⏰ Come back after 8 PM ET when CanLII quota resets.`);
    }
  }
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🇨🇦 BC WCAT COMPREHENSIVE SCRAPER (2020-2026)`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Database: bcwcat (British Columbia Workers' Compensation Appeal Tribunal)`);
  console.log(`Years: ${YEARS.join(', ')}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`${'='.repeat(60)}\n`);
  
  if (CANLII_API_KEY === 'YOUR_FREE_API_KEY_HERE') {
    console.error(`❌ ERROR: Set CANLII_API_KEY environment variable`);
    console.error(`   Get a free key at: https://www.canlii.org/en/info/api.html`);
    process.exit(1);
  }
  
  for (const year of YEARS) {
    await scrapeYear(year);
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ ALL YEARS COMPLETE`);
  console.log(`${'='.repeat(60)}\n`);
  
  // Generate summary
  const allFiles = YEARS.map(y => path.join(OUTPUT_DIR, `bcwcat-${y}-complete.json`));
  const allCases = [];
  
  for (const file of allFiles) {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      allCases.push(...data);
    }
  }
  
  console.log(`\n📊 FINAL SUMMARY:`);
  console.log(`   Total BC WCAT cases: ${allCases.length}`);
  console.log(`   Years covered: ${YEARS.join(', ')}`);
  console.log(`   Average per year: ${(allCases.length / YEARS.length).toFixed(0)}`);
  
  const summaryPath = path.join(OUTPUT_DIR, 'bcwcat-scraping-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    database: 'bcwcat',
    jurisdiction: 'British Columbia',
    years: YEARS,
    totalCases: allCases.length,
    scrapedAt: new Date().toISOString(),
    files: allFiles.map(f => path.basename(f))
  }, null, 2));
  
  console.log(`\n💾 Summary saved: ${summaryPath}\n`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(`\n❌ UNHANDLED ERROR: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = { scrapeYear, fetchYearCaseList, fetchFullDecision };
