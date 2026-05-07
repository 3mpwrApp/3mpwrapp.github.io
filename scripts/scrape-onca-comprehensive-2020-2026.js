#!/usr/bin/env node
/**
 * 🔬 COMPREHENSIVE ONCA SCRAPER (2020-2026)
 * Ontario Court of Appeal - Precedent-Setting Worker Injury Decisions
 * 
 * Focus: Appeals from WSIAT, human rights, employment law - binding precedents
 * Output: Year-by-year JSON files with full decision text
 * onca-2020-complete.json ... through 2026
 * 
 * Expected: 80-120 worker-related cases per year
 * Impact: These decisions bind lower tribunals (WSIAT, HRTO, etc.)
 * 
 * Author: 3mpwrApp Research Team
 * Date: May 7, 2026
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
        // Check for quota errors in response body
        if (data.includes('QUOTA_EXCE') || data.includes('quota') || data.includes('THROTTLED')) {
          reject(new Error('QUOTA_EXCEEDED'));
          return; // Stop execution after quota error
        }
        
        try {
          const parsed = JSON.parse(data);
          
          // Check for quota errors in parsed response
          if (parsed.error && (parsed.error.includes('QUOTA') || parsed.error.includes('quota'))) {
            reject(new Error('QUOTA_EXCEEDED'));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          console.error(`  ⚠️  JSON parse error: ${e.message}`);
          reject(new Error(`JSON parse error: ${e.message}`));
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
  console.log(`\n📅 Fetching ONCA case list for ${year}...`);
  
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
    
    const url = `${CANLII_BASE}/caseBrowse/en/onca/?${params}`;
    
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
        throw error; // Propagate quota errors
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
  const url = `${CANLII_BASE}/caseBrowse/en/onca/${caseId}/?${params}`;
  
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
      'workplace injury', 'occupational disease', 'repetitive strain', 'chronic pain',
      'mental stress', 'psychological injury', 'ptsd', 'traumatic stress',
      'back injury', 'hearing loss', 'respiratory', 'carpal tunnel',
      'work-related injury', 'industrial accident', 'aggravation'
    ],
    wsib_issues: [
      'wsiat', 'workers compensation', 'wsib', 'workplace safety and insurance',
      'loss of earnings', 'nel', 'permanent impairment', 'future economic loss',
      'initial entitlement', 'recurrence', 'pre-existing condition',
      'arising out of employment', 'course of employment'
    ],
    legal_tests: [
      'standard of review', 'reasonableness', 'correctness', 'patently unreasonable',
      'judicial review', 'privative clause', 'deference', 'appellate review',
      'error of law', 'error of fact', 'palpable and overriding error'
    ],
    human_rights: [
      'discrimination', 'accommodation', 'undue hardship', 'human rights code',
      'disability discrimination', 'reprisal', 'constructive dismissal'
    ],
    procedural: [
      'natural justice', 'procedural fairness', 'bias', 'reasonable apprehension',
      'hearing', 'evidence', 'credibility', 'cross-examination'
    ],
    remedies: [
      'damages', 'costs', 'reinstatement', 'compensation', 'pension',
      'health care benefits', 'loss of earnings', 'future economic loss'
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

// Extract outcome from keywords (Court of Appeal specific)
function extractOutcomeFromKeywords(keywords) {
  if (!keywords || keywords.length === 0) return null;
  
  const keywordText = keywords.join(' ').toLowerCase();
  
  // Court of Appeal outcomes
  if (keywordText.includes('appeal allowed') || keywordText.includes('appeal is allowed')) {
    return 'Appeal Allowed';
  }
  if (keywordText.includes('appeal dismissed') || keywordText.includes('appeal is dismissed')) {
    return 'Appeal Dismissed';
  }
  if (keywordText.includes('leave to appeal granted') || keywordText.includes('leave granted')) {
    return 'Leave to Appeal Granted';
  }
  if (keywordText.includes('leave to appeal refused') || keywordText.includes('leave refused') || 
      keywordText.includes('leave denied')) {
    return 'Leave to Appeal Refused';
  }
  if (keywordText.includes('settled') || keywordText.includes('discontinued')) {
    return 'Settled/Discontinued';
  }
  if (keywordText.includes('remitted') || keywordText.includes('matter remitted')) {
    return 'Remitted to Lower Court/Tribunal';
  }
  if (keywordText.includes('new trial ordered') || keywordText.includes('new hearing')) {
    return 'New Trial/Hearing Ordered';
  }
  if (keywordText.includes('motion granted') || keywordText.includes('interlocutory')) {
    return 'Motion/Interlocutory Decision';
  }
  if (keywordText.includes('costs')) {
    return 'Costs Decision';
  }
  
  return null;
}

function extractOutcome(caseData, html) {
  const text = (html || '').toLowerCase();
  const title = (caseData.title || '').toLowerCase();
  
  // Check title first
  if (title.includes('leave to appeal') || text.includes('application for leave')) {
    if (title.includes('granted') || text.includes('leave is granted')) {
      return 'Leave to Appeal Granted';
    }
    if (title.includes('refused') || title.includes('dismissed') || text.includes('leave is refused')) {
      return 'Leave to Appeal Refused';
    }
  }
  
  // Appeal outcomes
  if (text.includes('appeal is allowed') || text.includes('appeals are allowed')) {
    return 'Appeal Allowed';
  }
  if (text.includes('appeal is dismissed') || text.includes('appeals are dismissed')) {
    return 'Appeal Dismissed';
  }
  if (text.includes('appeal allowed in part') || text.includes('partially allowed')) {
    return 'Appeal Partially Allowed';
  }
  
  // Procedural outcomes
  if (text.includes('matter is remitted') || text.includes('remitted to')) {
    return 'Remitted to Lower Court/Tribunal';
  }
  if (text.includes('new trial') || text.includes('new hearing ordered')) {
    return 'New Trial/Hearing Ordered';
  }
  if (text.includes('motion granted') || text.includes('motion allowed')) {
    return 'Motion Granted';
  }
  if (text.includes('motion dismissed') || text.includes('motion refused')) {
    return 'Motion Dismissed';
  }
  if (text.includes('discontinued') || text.includes('abandoned')) {
    return 'Settled/Discontinued';
  }
  if (title.includes('costs') || text.includes('costs decision')) {
    return 'Costs Decision';
  }
  
  return 'Unknown';
}

function hasWorkerInjuryIssue(caseData, html, keywords) {
  const text = (html || '').toLowerCase();
  const title = (caseData.title || '').toLowerCase();
  const keywordsStr = (caseData.keywords || '').toLowerCase();
  
  const workerTerms = [
    'wsiat', 'wsib', 'workers compensation', 'workplace safety and insurance',
    'workplace injury', 'occupational', 'work-related injury',
    'employment injury', 'industrial accident', 'workplace accident'
  ];
  
  return workerTerms.some(term => 
    text.includes(term) || title.includes(term) || keywordsStr.includes(term)
  ) || keywords.some(k => k.category === 'wsib_issues' || k.category === 'injury_types');
}

// Extract legislation from keywords
function extractLegislationFromKeywords(keywords) {
  if (!keywords || keywords.length === 0) return [];
  
  const keywordText = keywords.join(' ');
  const legislation = [];
  
  const patterns = [
    /Workplace Safety and Insurance Act,\s*[\d]{4},\s*s\.\s*[\d]+(?:\([\d]+\))?/gi,
    /WSIA,\s*s\.\s*[\d]+(?:\([\d]+\))?/gi,
    /Human Rights Code,\s*s\.\s*[\d]+(?:\([\d]+\))?/gi,
    /Employment Standards Act,\s*[\d]{4},\s*s\.\s*[\d]+/gi,
    /Courts of Justice Act,\s*s\.\s*[\d]+/gi,
    /Statutory Powers Procedure Act,\s*s\.\s*[\d]+/gi,
    /SPPA,\s*s\.\s*[\d]+/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = keywordText.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (!legislation.includes(match)) {
          legislation.push(match);
        }
      });
    }
  });
  
  return legislation;
}

function parseDecision(caseData, fullData) {
  const html = fullData?.html || '';
  const keywords = extractKeywords(html);
  
  // Extract caseId
  let caseId = fullData?.caseId || caseData.caseId;
  if (typeof caseId === 'object' && caseId !== null) {
    caseId = caseId.en || caseId.fr || 'unknown';
  }
  
  // Extract keywords as array
  const keywordsApi = (caseData.keywords || fullData?.keywords || '').split(';').map(k => k.trim()).filter(k => k);
  
  // Extract legislation
  const legislation = extractLegislationFromKeywords(keywordsApi);
  
  // Enhanced outcome parsing
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
    
    // Legislation
    legislation_cited: legislation,
    legislation_count: legislation.length,
    
    // Analysis
    outcome: outcomeFromKeywords || extractOutcome(fullData || caseData, html),
    has_worker_injury_issue: hasWorkerInjuryIssue(caseData, html, keywords),
    
    // Full text
    full_text_html: html,
    full_text_length: html.length,
    
    // Metadata
    tribunal: "Court of Appeal for Ontario",
    database: "onca",
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
  console.log(`📊 SCRAPING ONCA DECISIONS FOR ${year}`);
  console.log('='.repeat(70));
  
  const outputFile = path.join(OUTPUT_DIR, `onca-${year}-complete.json`);
  const progressFile = path.join(OUTPUT_DIR, `.progress-onca-${year}.json`);
  
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
    fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
    return [];
  }
  
  // Step 2: Fetch full text for each case
  const decisions = [];
  const completedIds = new Set(progress.completed);
  
  console.log(`\n📄 Fetching full text for ${caseList.length} cases...`);
  
  for (let i = 0; i < caseList.length; i++) {
    const caseData = caseList[i];
    let caseId = caseData.caseId;
    
    // Handle {en: "xxx"} format
    if (typeof caseId === 'object' && caseId !== null) {
      caseId = caseId.en || caseId.fr || `case_${i}`;
    }
    
    // Skip if already completed
    if (completedIds.has(caseId)) {
      continue;
    }
    
    const progress_pct = ((i + 1) / caseList.length * 100).toFixed(1);
    console.log(`  [${i + 1}/${caseList.length}] (${progress_pct}%) Fetching ${caseId}...`);
    
    try {
      const fullData = await fetchFullDecision(caseId);
      
      if (fullData) {
        const parsed = parseDecision(caseData, fullData);
        decisions.push(parsed);
        progress.completed.push(caseId);
        
        // Log worker injury cases
        if (parsed.has_worker_injury_issue) {
          const issues = parsed.keywords_extracted.filter(k => k.category === 'wsib_issues' || k.category === 'injury_types').map(k => k.term);
          console.log(`    ✓ Worker injury case: ${issues.join(', ')}`);
        }
      } else {
        console.log(`    ⚠️  No data returned`);
        progress.failed.push(caseId);
      }
      
      // Save progress every 10 cases
      if ((i + 1) % 10 === 0) {
        fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
        console.log(`    💾 Progress saved (${progress.completed.length} completed)`);
      }
      
      await delay(DELAY_MS);
      
    } catch (error) {
      // QUOTA EXCEEDED - Save progress and exit gracefully
      if (error.message === 'QUOTA_EXCEEDED') {
        console.log('\n' + '⚠️ '.repeat(35));
        console.log('🚫 CanLII API QUOTA EXCEEDED');
        console.log('⚠️ '.repeat(35));
        console.log('\n📊 Progress Update:');
        console.log(`  ✅ Successfully collected: ${decisions.length} cases`);
        console.log(`  📁 Progress saved to: ${progressFile}`);
        console.log(`  ⏸️  Stopped at: ${i + 1}/${caseList.length} (${progress_pct}%)`);
        console.log('\n⏰ Next Steps:');
        console.log('  1. CanLII quota resets at midnight UTC or after 24 hours');
        console.log('  2. Run the same command tomorrow to resume:');
        console.log(`     node ${path.basename(__filename)}`);
        console.log('  3. Collection will automatically resume at case ${i + 1}');
        console.log('\n');
        
        // Save what we have so far
        fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
        if (decisions.length > 0) {
          const partialFile = outputFile.replace('.json', '-PARTIAL.json');
          fs.writeFileSync(partialFile, JSON.stringify(decisions, null, 2));
          console.log(`💾 Partial results saved to: ${partialFile}`);
        }
        
        process.exit(0); // Exit gracefully
      }
      
      console.error(`    ❌ Error: ${error.message}`);
      progress.failed.push(caseId);
    }
  }
  
  // Save final output
  fs.writeFileSync(outputFile, JSON.stringify(decisions, null, 2));
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
  
  console.log(`\n✓ ${year} complete: ${decisions.length} cases saved`);
  console.log(`  Worker injury cases: ${decisions.filter(d => d.has_worker_injury_issue).length}`);
  console.log(`  Failed: ${progress.failed.length}`);
  console.log(`  Output: ${outputFile}`);
  
  return decisions;
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║  🔬 COMPREHENSIVE ONCA SCRAPER (2020-2026)                        ║');
  console.log('║  Court of Appeal for Ontario - Worker Injury Precedents           ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`📅 Years to scrape: ${YEARS.join(', ')}`);
  console.log(`⏱️  Delay between requests: ${DELAY_MS}ms`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log();
  
  const allStats = [];
  
  for (const year of YEARS) {
    const startTime = Date.now();
    const decisions = await scrapeYear(year);
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    const stats = {
      year,
      total: decisions.length,
      worker_injury_cases: decisions.filter(d => d.has_worker_injury_issue).length,
      with_full_text: decisions.filter(d => d.data_quality.has_full_text).length,
      outcomes: {},
      duration_minutes: duration
    };
    
    // Count outcomes
    decisions.forEach(d => {
      stats.outcomes[d.outcome] = (stats.outcomes[d.outcome] || 0) + 1;
    });
    
    allStats.push(stats);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 SCRAPING SUMMARY');
  console.log('='.repeat(70));
  
  let totalCases = 0;
  let totalWorkerInjury = 0;
  
  allStats.forEach(stats => {
    totalCases += stats.total;
    totalWorkerInjury += stats.worker_injury_cases;
    
    console.log(`\n${stats.year}:`);
    console.log(`  Total cases: ${stats.total.toLocaleString()}`);
    console.log(`  Worker injury cases: ${stats.worker_injury_cases} (${stats.total > 0 ? (stats.worker_injury_cases / stats.total * 100).toFixed(1) : 0}%)`);
    console.log(`  With full text: ${stats.with_full_text}`);
    console.log(`  Duration: ${stats.duration_minutes} minutes`);
    console.log(`  Top outcomes:`);
    
    const sortedOutcomes = Object.entries(stats.outcomes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    sortedOutcomes.forEach(([outcome, count]) => {
      console.log(`    - ${outcome}: ${count}`);
    });
  });
  
  console.log('\n' + '='.repeat(70));
  console.log(`✓ COMPLETE: ${totalCases.toLocaleString()} total cases collected`);
  console.log(`  Worker injury cases: ${totalWorkerInjury} (${totalCases > 0 ? (totalWorkerInjury / totalCases * 100).toFixed(1) : 0}%)`);
  console.log('='.repeat(70));
  
  // Save summary
  const summaryFile = path.join(OUTPUT_DIR, 'onca-scraping-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify({
    scrape_date: new Date().toISOString(),
    years: YEARS,
    stats: allStats,
    total_cases: totalCases,
    total_worker_injury_cases: totalWorkerInjury
  }, null, 2));
  
  console.log(`\n📄 Summary saved to: ${summaryFile}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { scrapeYear, main };
