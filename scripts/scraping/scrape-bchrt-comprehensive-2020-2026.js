#!/usr/bin/env node
/**
 * 🔬 COMPREHENSIVE BC HRT SCRAPER (2020-2026)
 * British Columbia Human Rights Tribunal
 * 
 * CRITICAL DATASET: BC human rights complaints and decisions
 * Focus: Disability accommodation, employment discrimination, housing discrimination
 * Compare to: Ontario HRTO (similar human rights function)
 * 
 * Output: Year-by-year JSON files with enhanced metadata
 * bchrt-2020-complete.json
 * bchrt-2021-complete.json
 * ... through 2026
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 29, 2026
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
  console.log(`\n📅 Fetching BC HRT case list for ${year}...`);
  
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
    
    const url = `${CANLII_BASE}/caseBrowse/en/bchrt/?${params}`;
    
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
  const url = `${CANLII_BASE}/caseBrowse/en/bchrt/${caseId}/?${params}`;
  
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
    grounds: [
      'disability', 'physical disability', 'mental disability',
      'race', 'colour', 'ancestry', 'place of origin', 'ethnic origin',
      'citizenship', 'religion', 'age', 'sex', 'gender identity',
      'sexual orientation', 'marital status', 'family status',
      'source of income', 'political belief', 'conviction'
    ],
    areas: [
      'employment', 'workplace', 'accommodation', 'housing',
      'services', 'facility', 'publication', 'wage', 'tenancy'
    ],
    issues: [
      'discrimination', 'adverse effect', 'prima facie', 'adverse treatment',
      'reasonable accommodation', 'undue hardship', 'bona fide',
      'occupational requirement', 'adverse impact', 'differential treatment',
      'constructive dismissal', 'poisoned environment', 'harassment',
      'reprisal', 'retaliation'
    ],
    medical: [
      'chronic pain', 'ptsd', 'anxiety', 'depression', 'bipolar',
      'schizophrenia', 'autism', 'adhd', 'learning disability',
      'back injury', 'mobility impairment', 'vision impairment',
      'hearing impairment', 'cancer', 'diabetes', 'heart condition',
      'epilepsy', 'fibromyalgia', 'arthritis', 'substance use disorder',
      'addiction', 'alcoholism', 'drug dependency'
    ],
    accommodation: [
      'modified duties', 'reduced hours', 'work from home',
      'flexible schedule', 'leave of absence', 'medical leave',
      'assistive devices', 'accessible', 'wheelchair', 'service animal',
      'interpreter', 'reasonable modifications', 'job restructuring'
    ],
    outcomes: [
      'complaint dismissed', 'complaint accepted', 'no reasonable prospect',
      'prima facie case', 'discrimination proven', 'justified',
      'remedy', 'damages', 'injury to dignity', 'compensation',
      'reinstatement', 'cease and desist', 'policy change'
    ],
    legal_tests: [
      'prima facie case', 'moore test', 'meiorin test', 'british columbia test',
      'burden of proof', 'bona fide requirement', 'undue hardship',
      'substantial connection', 'reasonable and justifiable', 'proportionate'
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
  
  // BC HRT specific outcome patterns
  if (combinedText.includes('complaint dismissed') || combinedText.includes('application dismissed')) {
    return 'Complaint Dismissed';
  }
  if (combinedText.includes('no reasonable prospect') || combinedText.includes('no reasonable likelihood')) {
    return 'No Reasonable Prospect';
  }
  if (combinedText.includes('discrimination proven') || combinedText.includes('contravention established')) {
    return 'Discrimination Proven';
  }
  if (combinedText.includes('prima facie case') && !combinedText.includes('no prima facie')) {
    return 'Prima Facie Case Established';
  }
  if (combinedText.includes('justified') || combinedText.includes('bona fide')) {
    return 'Discrimination Justified';
  }
  if (combinedText.includes('settled') || combinedText.includes('settlement')) {
    return 'Settled';
  }
  if (combinedText.includes('withdrawn')) {
    return 'Withdrawn';
  }
  if (combinedText.includes('jurisd') && (combinedText.includes('declined') || combinedText.includes('no jurisdiction'))) {
    return 'No Jurisdiction';
  }
  if (combinedText.includes('remedy') || combinedText.includes('damages awarded')) {
    return 'Remedy Ordered';
  }
  if (combinedText.includes('interim') || combinedText.includes('preliminary')) {
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
  
  // Scan decision text for BC HRT patterns
  const patterns = [
    { regex: /complaint\s+(?:is\s+)?dismissed/i, outcome: 'Complaint Dismissed' },
    { regex: /application\s+(?:is\s+)?dismissed/i, outcome: 'Complaint Dismissed' },
    { regex: /no\s+reasonable\s+prospect/i, outcome: 'No Reasonable Prospect' },
    { regex: /discrimination\s+(?:is\s+)?proven/i, outcome: 'Discrimination Proven' },
    { regex: /contravention\s+(?:is\s+)?established/i, outcome: 'Discrimination Proven' },
    { regex: /prima\s+facie\s+case/i, outcome: 'Prima Facie Case Established' },
    { regex: /(?:discrimination|treatment)\s+(?:is\s+)?justified/i, outcome: 'Discrimination Justified' },
    { regex: /bona\s+fide.*requirement/i, outcome: 'Discrimination Justified' },
    { regex: /settled/i, outcome: 'Settled' },
    { regex: /withdrawn/i, outcome: 'Withdrawn' },
    { regex: /no\s+jurisdiction/i, outcome: 'No Jurisdiction' },
    { regex: /damages\s+awarded/i, outcome: 'Remedy Ordered' },
    { regex: /remedy\s+(?:is\s+)?ordered/i, outcome: 'Remedy Ordered' }
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
  console.log(`🚀 STARTING BC HRT SCRAPE FOR ${year}`);
  console.log(`${'='.repeat(60)}`);
  
  // Step 1: Get case list
  const caseList = await fetchYearCaseList(year);
  
  if (caseList.length === 0) {
    console.log(`⚠️  No cases found for ${year}`);
    return { year, total: 0, outcomes: {} };
  }
  
  // Step 2: Process each case
  const processedCases = [];
  const outcomes = {};
  
  for (let i = 0; i < caseList.length; i++) {
    const caseItem = caseList[i];
    const progress = `[${i + 1}/${caseList.length}]`;
    
    // Extract caseId (could be object with language keys or string)
    const caseId = typeof caseItem.caseId === 'object' ? caseItem.caseId.en : caseItem.caseId;
    
    console.log(`\n${progress} Processing: ${caseId || 'unknown'}`);
    
    // Fetch full decision
    const fullDecision = await fetchFullDecision(caseId);
    
    if (!fullDecision) {
      console.log(`  ⚠️  Skipping - fetch failed`);
      continue;
    }
    
    // Extract keywords
    const extractedKeywords = extractKeywords(fullDecision.text || '');
    
    // Determine outcome
    const outcome = extractOutcome(fullDecision, fullDecision.text);
    outcomes[outcome] = (outcomes[outcome] || 0) + 1;
    
    // Build comprehensive case object
    const processedCase = {
      case_id: fullDecision.caseId || caseId,
      title: fullDecision.title || caseItem.title,
      citation: fullDecision.citation || caseItem.citation,
      decision_date: fullDecision.decisionDate || caseItem.decisionDate,
      url: fullDecision.url || `https://canlii.ca/t/${caseId}`,
      keywords_api: fullDecision.keywords || [],
      keywords_extracted: extractedKeywords,
      outcome: outcome,
      data_quality: {
        has_full_text: !!fullDecision.text,
        has_keywords: (fullDecision.keywords && fullDecision.keywords.length > 0),
        extracted_keyword_count: extractedKeywords.length,
        outcome_confidence: outcome !== 'Unknown' ? 'high' : 'none'
      }
    };
    
    processedCases.push(processedCase);
    
    console.log(`  ✓ Outcome: ${outcome}`);
    console.log(`  ✓ Keywords: ${extractedKeywords.length} extracted`);
    
    // Delay between cases
    if (i < caseList.length - 1) {
      await delay(DELAY_MS);
    }
  }
  
  // Save to file
  const outputFile = path.join(OUTPUT_DIR, `bchrt-${year}-complete.json`);
  fs.writeFileSync(outputFile, JSON.stringify(processedCases, null, 2), 'utf8');
  
  console.log(`\n✅ COMPLETE: ${year} - Saved ${processedCases.length} cases to ${outputFile}`);
  console.log(`\n📈 OUTCOME BREAKDOWN:`);
  
  const sortedOutcomes = Object.entries(outcomes)
    .sort((a, b) => b[1] - a[1]);
  
  for (const [outcome, count] of sortedOutcomes) {
    const percentage = ((count / processedCases.length) * 100).toFixed(1);
    console.log(`   ${outcome.padEnd(35)} ${count.toString().padStart(4)} (${percentage}%)`);
  }
  
  return {
    year,
    total: processedCases.length,
    outcomes
  };
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log('\n🔬 BC HUMAN RIGHTS TRIBUNAL COMPREHENSIVE SCRAPER');
  console.log('='.repeat(60));
  console.log(`Years: ${YEARS.join(', ')}`);
  console.log(`Delay: ${DELAY_MS}ms between requests`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('='.repeat(60));
  
  const allResults = [];
  
  for (const year of YEARS) {
    try {
      const result = await scrapeYear(year);
      allResults.push(result);
    } catch (error) {
      if (error.message === 'QUOTA_EXCEEDED') {
        console.error(`\n❌ Stopping due to quota limit. Results saved so far.`);
        break;
      }
      console.error(`\n❌ Error processing ${year}: ${error.message}`);
      console.error('Continuing with next year...');
    }
  }
  
  // Final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ ALL YEARS COMPLETE');
  console.log('='.repeat(60) + '\n');
  
  const totalCases = allResults.reduce((sum, r) => sum + r.total, 0);
  const yearsProcessed = allResults.map(r => r.year).join(', ');
  const avgPerYear = allResults.length > 0 ? Math.round(totalCases / allResults.length) : 0;
  
  console.log(`\n📊 FINAL SUMMARY:`);
  console.log(`   Total BC HRT cases: ${totalCases}`);
  console.log(`   Years covered: ${yearsProcessed}`);
  console.log(`   Average per year: ${avgPerYear}`);
  
  // Save summary
  const summaryFile = path.join(OUTPUT_DIR, 'bchrt-scraping-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify({
    generated: new Date().toISOString(),
    tribunal: 'BC Human Rights Tribunal (BCHRT)',
    years: allResults,
    totals: {
      cases: totalCases,
      years_processed: allResults.length,
      avg_per_year: avgPerYear
    }
  }, null, 2), 'utf8');
  
  console.log(`\n💾 Summary saved: ${summaryFile}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ FATAL ERROR:', error.message);
    process.exit(1);
  });
}

module.exports = { scrapeYear, extractOutcome, extractKeywords };
