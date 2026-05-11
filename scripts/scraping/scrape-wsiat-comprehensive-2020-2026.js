#!/usr/bin/env node
/**
 * 🔬 COMPREHENSIVE WSIAT SCRAPER (2020-2026)
 * Workplace Safety and Insurance Appeals Tribunal - Full Dataset Collection
 * 
 * Parallel to HRTO analysis - collecting ALL WSIAT decisions for comparative research
 * Focus: Pre-existing condition denials, chronic pain, mental health claims
 * 
 * Output: Year-by-year JSON files with keywords
 * onwsiat-2020-complete.json
 * onwsiat-2021-complete.json
 * ... through 2026
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 19, 2026
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
            reject(e);
          }
        }
      });
    }).on('error', reject);
  });
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const data = await httpsGet(url);
      return data;
    } catch (error) {
      if (error.message === 'QUOTA_EXCEEDED') {
        console.error('❌ CanLII API quota exceeded! Stopping.');
        throw error; // Don't retry quota errors
      }
      
      if (attempt < retries) {
        console.log(`    ⚠️  Retry ${attempt}/${retries}: ${error.message}`);
        await delay(DELAY_MS * attempt); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}

// ===== YEAR CASE LIST FETCHING =====

async function fetchYearCaseList(year) {
  const params = new URLSearchParams({ 
    api_key: CANLII_API_KEY,
    resultCount: 10000,
    offset: 0
  });
  
  const url = `${CANLII_BASE}/caseBrowse/en/onwsiat/?${params}`;
  
  try {
    const response = await fetchWithRetry(url);
    const allCases = response.cases || [];
    
    // Filter to specific year (CanLII returns all cases, we filter locally)
    const yearCases = allCases.filter(c => {
      const decisionDate = c.decisionDate || '';
      return decisionDate.startsWith(year.toString());
    });
    
    console.log(`  ✓ Found ${yearCases.length} cases for ${year} (from ${allCases.length} total)`);
    return yearCases;
  } catch (error) {
    console.error(`  ✗ Error fetching ${year} case list: ${error.message}`);
    return [];
  }
}

// ===== FULL DECISION TEXT FETCHING =====

async function fetchFullDecision(caseId) {
  const params = new URLSearchParams({ api_key: CANLII_API_KEY });
  const url = `${CANLII_BASE}/caseBrowse/en/onwsiat/${caseId}/?${params}`;
  
  try {
    const response = await fetchWithRetry(url);
    return response;
  } catch (error) {
    console.error(`    ⚠️  Error fetching ${caseId}: ${error.message}`);
    return null;
  }
}

// ===== TEXT EXTRACTION & ANALYSIS =====

function extractOutcomeFromKeywords(keywordsArray) {
  if (!keywordsArray || keywordsArray.length === 0) return null;
  
  const keywordsText = keywordsArray.join(' ').toLowerCase();
  
  // WSIAT-specific outcomes
  if (keywordsText.includes('appeal allowed') || keywordsText.includes('granted')) {
    return 'Allowed';
  }
  if (keywordsText.includes('appeal dismissed') || keywordsText.includes('dismissed')) {
    return 'Dismissed';
  }
  if (keywordsText.includes('abandoned')) {
    return 'Abandoned';
  }
  if (keywordsText.includes('withdrawn')) {
    return 'Withdrawn';
  }
  if (keywordsText.includes('settled')) {
    return 'Settled';
  }
  
  return null; // Unknown
}

function hasPreExistingCondition(caseData, keywords) {
  const searchText = [
    ...(keywords || []),
    caseData.title || ''
  ].join(' ').toLowerCase();
  
  const preExistingTerms = [
    'pre-existing', 'preexisting', 'pre existing',
    'degenerative', 'chronic condition', 'prior condition',
    'previous injury', 'prior injury', 'underlying condition',
    'obesity', 'diabetes', 'arthritis', 'spondylosis'
  ];
  
  return preExistingTerms.some(term => searchText.includes(term));
}

function hasMentalHealthClaim(caseData, keywords) {
  const searchText = [
    ...(keywords || []),
    caseData.title || ''
  ].join(' ').toLowerCase();
  
  const mentalHealthTerms = [
    'mental', 'psychological', 'psychiatric',
    'ptsd', 'depression', 'anxiety', 'stress',
    'chronic pain', 'pain disorder'
  ];
  
  return mentalHealthTerms.some(term => searchText.includes(term));
}

function extractLegislationFromKeywords(keywordsArray) {
  if (!keywordsArray || keywordsArray.length === 0) return [];
  
  const legislation = new Set();
  const keywordsText = keywordsArray.join('; ');
  
  // WSIAT legislation patterns
  const patterns = [
    /Workplace Safety and Insurance Act[^—|]*/gi,
    /WSIA[^—|]*/gi,
    /Ontario Regulation \d+\/\d+/gi,
    /s\.\s*\d+(\.\d+)?/gi, // Section references
  ];
  
  patterns.forEach(pattern => {
    const matches = keywordsText.match(pattern);
    if (matches) {
      matches.forEach(m => legislation.add(m.trim()));
    }
  });
  
  return Array.from(legislation);
}

function parseDecision(caseData, fullData) {
  const html = fullData?.html || '';
  
  // Extract caseId (can be string or {en: "xxx", fr: "yyy"})
  let caseId = fullData?.caseId || caseData.caseId;
  if (typeof caseId === 'object' && caseId !== null) {
    caseId = caseId.en || caseId.fr || 'unknown';
  }
  
  // Extract keywords as array (API returns semicolon-delimited string)
  const keywordsApi = (caseData.keywords || fullData?.keywords || '').split(';').map(k => k.trim()).filter(k => k);
  
  // Extract legislation from keywords text
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
    
    // WSIAT-specific flags
    legislation_cited: legislation,
    legislation_count: legislation.length,
    
    // Analysis
    outcome: outcomeFromKeywords || 'Unknown',
    has_preexisting_condition: hasPreExistingCondition(caseData, keywordsApi),
    has_mental_health_claim: hasMentalHealthClaim(caseData, keywordsApi),
    
    // Full text (will be empty from CanLII free API)
    full_text_html: html,
    full_text_length: html.length,
    
    // Metadata
    tribunal: "Workplace Safety and Insurance Appeals Tribunal",
    database: "onwsiat",
    scraped_at: new Date().toISOString(),
    
    // Data quality
    data_quality: {
      has_full_text: !!html,
      has_keywords: keywordsApi.length > 0,
      has_outcome: outcomeFromKeywords !== null,
      has_legislation: legislation.length > 0
    }
  };
}

// ===== MAIN SCRAPING LOGIC =====

async function scrapeYear(year) {
  console.log('\n' + '='.repeat(70));
  console.log(`📊 SCRAPING WSIAT DECISIONS FOR ${year}`);
  console.log('='.repeat(70));
  
  const outputFile = path.join(OUTPUT_DIR, `onwsiat-${year}-complete.json`);
  const progressFile = path.join(OUTPUT_DIR, `.progress-onwsiat-${year}.json`);
  
  // Load progress if resuming
  let progress = { completedCases: 0, lastCaseId: null };
  if (fs.existsSync(progressFile)) {
    progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    console.log(`📂 Resuming from case ${progress.completedCases + 1}`);
  }
  
  // Load existing decisions if resuming
  let decisions = [];
  if (fs.existsSync(outputFile)) {
    decisions = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    console.log(`📂 Loaded ${decisions.length} existing decisions`);
  }
  
  // Fetch case list for year
  const yearCases = await fetchYearCaseList(year);
  
  if (yearCases.length === 0) {
    console.log(`⚠️  No cases found for ${year}`);
    return;
  }
  
  console.log(`📋 Processing ${yearCases.length} cases from ${year}`);
  
  // Process each case
  for (let i = progress.completedCases; i < yearCases.length; i++) {
    const caseData = yearCases[i];
    const caseId = typeof caseData.caseId === 'object' ? caseData.caseId.en : caseData.caseId;
    
    console.log(`  [${i + 1}/${yearCases.length}] ${caseId}...`);
    
    // Fetch full decision
    const fullData = await fetchFullDecision(caseId);
    
    if (!fullData) {
      console.log(`    ⚠️  Skipping ${caseId} (fetch failed)`);
      continue;
    }
    
    // Parse decision
    const parsed = parseDecision(caseData, fullData);
    
    if (i < decisions.length) {
      decisions[i] = parsed; // Update existing
    } else {
      decisions.push(parsed); // Add new
    }
    
    // Save progress every 25 cases
    if ((i + 1) % 25 === 0 || i === yearCases.length - 1) {
      fs.writeFileSync(outputFile, JSON.stringify(decisions, null, 2));
      fs.writeFileSync(progressFile, JSON.stringify({
        completedCases: i + 1,
        lastCaseId: caseId,
        lastUpdate: new Date().toISOString()
      }, null, 2));
      console.log(`    💾 Saved progress: ${i + 1}/${yearCases.length} cases`);
    }
    
    // Delay between requests
    if (i < yearCases.length - 1) {
      await delay(DELAY_MS);
    }
  }
  
  // Generate summary
  const stats = {
    total: decisions.length,
    with_keywords: decisions.filter(d => d.keywords_api?.length > 0).length,
    outcomes: {
      allowed: decisions.filter(d => d.outcome === 'Allowed').length,
      dismissed: decisions.filter(d => d.outcome === 'Dismissed').length,
      abandoned: decisions.filter(d => d.outcome === 'Abandoned').length,
      withdrawn: decisions.filter(d => d.outcome === 'Withdrawn').length,
      settled: decisions.filter(d => d.outcome === 'Settled').length,
      unknown: decisions.filter(d => d.outcome === 'Unknown').length
    },
    preexisting: decisions.filter(d => d.has_preexisting_condition).length,
    mental_health: decisions.filter(d => d.has_mental_health_claim).length
  };
  
  console.log('\n📊 YEAR SUMMARY');
  console.log('-'.repeat(70));
  console.log(`Total cases: ${stats.total}`);
  console.log(`With keywords: ${stats.with_keywords}`);
  console.log(`\nOutcomes:`);
  Object.entries(stats.outcomes).forEach(([k, v]) => {
    console.log(`  ${k}: ${v}`);
  });
  console.log(`\nPre-existing condition cases: ${stats.preexisting}`);
  console.log(`Mental health cases: ${stats.mental_health}`);
  
  console.log(`\n✅ Complete! Saved to: ${outputFile}`);
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log('█'.repeat(70));
  console.log('🔬 WSIAT COMPREHENSIVE SCRAPER (2020-2026)');
  console.log('Workplace Safety & Insurance Appeals Tribunal');
  console.log('█'.repeat(70));
  console.log(`\n🔑 API Key: ${CANLII_API_KEY.substring(0, 10)}...`);
  console.log(`⏱️  Delay: ${DELAY_MS}ms between requests`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  
  for (const year of YEARS) {
    await scrapeYear(year);
  }
  
  console.log('\n' + '█'.repeat(70));
  console.log('✅ ALL YEARS COMPLETE');
  console.log('█'.repeat(70));
}

main().catch(err => {
  console.error('❌ Scraper failed:', err);
  process.exit(1);
});
