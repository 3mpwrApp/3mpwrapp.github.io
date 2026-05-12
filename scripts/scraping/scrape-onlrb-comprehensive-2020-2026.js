#!/usr/bin/env node
/**
 * 🔬 COMPREHENSIVE ONLRB SCRAPER (2020-2026)
 * Ontario Labour Relations Board - Union Disputes & Wrongful Termination
 * 
 * Focus: Employer retaliation after WSIB claims, wrongful termination patterns
 * Output: Year-by-year JSON files with full decision text
 * onlrb-2020-complete.json ... through 2026
 * 
 * Expected: 200-400 worker-related cases per year
 * Impact: Reveals retaliation patterns against injured workers
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
const OUTPUT_DIR = path.join(__dirname, '../../data/tribunal-decisions');
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
  console.log(`\n📅 Fetching ONLRB case list for ${year}...`);
  
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
    
    const url = `${CANLII_BASE}/caseBrowse/en/onlrb/?${params}`;
    
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
  const url = `${CANLII_BASE}/caseBrowse/en/onlrb/${caseId}/?${params}`;
  
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
    retaliation: [
      'reprisal', 'retaliation', 'termination', 'discharge', 'dismissal',
      'constructive dismissal', 'unjust dismissal', 'wrongful dismissal',
      'discipline', 'suspension', 'demotion', 'harassment'
    ],
    wsib_issues: [
      'wsib claim', 'workplace injury', 'modified work', 'accommodation',
      'light duties', 'return to work', 'disability', 'medical leave',
      'absent due to injury', 'work-related injury'
    ],
    union_issues: [
      'grievance', 'collective agreement', 'seniority', 'layoff',
      'recall', 'arbitration', 'union certification', 'unfair labour practice',
      'duty of fair representation', 'union dues', 'strike', 'lockout'
    ],
    procedural: [
      'preliminary objection', 'jurisdiction', 'time limit', 'filing deadline',
      'procedural fairness', 'natural justice', 'hearing', 'evidence',
      'witness', 'credibility'
    ],
    remedies: [
      'reinstatement', 'compensation', 'damages', 'back pay', 'lost wages',
      'notice pay', 'severance', 'benefits restoration', 'costs'
    ],
    employment_context: [
      'probationary period', 'just cause', 'reasonable notice', 'cause',
      'performance', 'attendance', 'conduct', 'insubordination',
      'misconduct', 'absenteeism'
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

// Extract outcome from keywords
function extractOutcomeFromKeywords(keywords) {
  if (!keywords || keywords.length === 0) return null;
  
  const keywordText = keywords.join(' ').toLowerCase();
  
  // Labour Board outcomes
  if (keywordText.includes('application dismissed') || keywordText.includes('grievance dismissed')) {
    return 'Dismissed';
  }
  if (keywordText.includes('application allowed') || keywordText.includes('grievance allowed') ||
      keywordText.includes('application granted')) {
    return 'Allowed';
  }
  if (keywordText.includes('settled') || keywordText.includes('withdrawn')) {
    return 'Settled/Withdrawn';
  }
  if (keywordText.includes('certification granted') || keywordText.includes('union certified')) {
    return 'Certification Granted';
  }
  if (keywordText.includes('certification dismissed') || keywordText.includes('certification denied')) {
    return 'Certification Dismissed';
  }
  if (keywordText.includes('interim order') || keywordText.includes('interim relief')) {
    return 'Interim Decision';
  }
  if (keywordText.includes('reconsideration')) {
    return 'Reconsideration';
  }
  if (keywordText.includes('no jurisdiction') || keywordText.includes('lack of jurisdiction')) {
    return 'No Jurisdiction';
  }
  if (keywordText.includes('stayed') || keywordText.includes('adjourned')) {
    return 'Stayed/Adjourned';
  }
  
  return null;
}

function extractOutcome(caseData, html) {
  const text = (html || '').toLowerCase();
  const title = (caseData.title || '').toLowerCase();
  
  // Check title and text for outcomes
  if (text.includes('application is dismissed') || text.includes('grievance is dismissed')) {
    return 'Dismissed';
  }
  if (text.includes('application is allowed') || text.includes('grievance is allowed') ||
      text.includes('application is granted')) {
    return 'Allowed';
  }
  if (text.includes('application allowed in part') || text.includes('partially allowed')) {
    return 'Partially Allowed';
  }
  if (text.includes('settled') || text.includes('minutes of settlement')) {
    return 'Settled';
  }
  if (text.includes('withdrawn') || text.includes('abandonment')) {
    return 'Withdrawn';
  }
  if (text.includes('certification granted') || text.includes('union is certified')) {
    return 'Certification Granted';
  }
  if (text.includes('certification dismissed') || text.includes('certification denied')) {
    return 'Certification Dismissed';
  }
  if (text.includes('no jurisdiction') || text.includes('lacks jurisdiction')) {
    return 'No Jurisdiction';
  }
  if (title.includes('interim') || text.includes('interim order')) {
    return 'Interim Decision';
  }
  if (text.includes('reconsideration')) {
    return 'Reconsideration';
  }
  if (text.includes('stayed') || text.includes('adjourned')) {
    return 'Stayed/Adjourned';
  }
  
  return 'Unknown';
}

function hasRetaliationIssue(caseData, html, keywords) {
  const text = (html || '').toLowerCase();
  const title = (caseData.title || '').toLowerCase();
  const keywordsStr = (caseData.keywords || '').toLowerCase();
  
  const retaliationTerms = [
    'reprisal', 'retaliation', 'wsib claim', 'workplace injury',
    'termination after injury', 'dismissed after claim', 'accommodation',
    'modified work', 'return to work', 'disability discrimination'
  ];
  
  return retaliationTerms.some(term => 
    text.includes(term) || title.includes(term) || keywordsStr.includes(term)
  ) || keywords.some(k => k.category === 'retaliation' || k.category === 'wsib_issues');
}

// Extract legislation from keywords
function extractLegislationFromKeywords(keywords) {
  if (!keywords || keywords.length === 0) return [];
  
  const keywordText = keywords.join(' ');
  const legislation = [];
  
  const patterns = [
    /Labour Relations Act,\s*[\d]{4},\s*s\.\s*[\d]+(?:\([\d]+\))?/gi,
    /LRA,\s*s\.\s*[\d]+(?:\([\d]+\))?/gi,
    /Employment Standards Act,\s*[\d]{4},\s*s\.\s*[\d]+/gi,
    /ESA,\s*s\.\s*[\d]+/gi,
    /Workplace Safety and Insurance Act,\s*[\d]{4},\s*s\.\s*[\d]+/gi,
    /WSIA,\s*s\.\s*[\d]+/gi,
    /Human Rights Code,\s*s\.\s*[\d]+/gi,
    /Collective Agreement,\s*Article\s*[\d]+/gi
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
    has_retaliation_issue: hasRetaliationIssue(caseData, html, keywords),
    
    // Full text
    full_text_html: html,
    full_text_length: html.length,
    
    // Metadata
    tribunal: "Ontario Labour Relations Board",
    database: "onlrb",
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
  console.log(`📊 SCRAPING ONLRB DECISIONS FOR ${year}`);
  console.log('='.repeat(70));
  
  const outputFile = path.join(OUTPUT_DIR, `onlrb-${year}-complete.json`);
  const progressFile = path.join(OUTPUT_DIR, `.progress-onlrb-${year}.json`);
  
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
        
        // Log retaliation cases
        if (parsed.has_retaliation_issue) {
          const issues = parsed.keywords_extracted.filter(k => k.category === 'retaliation' || k.category === 'wsib_issues').map(k => k.term);
          console.log(`    ✓ Retaliation case: ${issues.slice(0, 3).join(', ')}`);
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
  console.log(`  Retaliation cases: ${decisions.filter(d => d.has_retaliation_issue).length}`);
  console.log(`  Failed: ${progress.failed.length}`);
  console.log(`  Output: ${outputFile}`);
  
  return decisions;
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║  🔬 COMPREHENSIVE ONLRB SCRAPER (2020-2026)                       ║');
  console.log('║  Ontario Labour Relations Board - Retaliation Patterns            ║');
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
      retaliation_cases: decisions.filter(d => d.has_retaliation_issue).length,
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
  let totalRetaliation = 0;
  
  allStats.forEach(stats => {
    totalCases += stats.total;
    totalRetaliation += stats.retaliation_cases;
    
    console.log(`\n${stats.year}:`);
    console.log(`  Total cases: ${stats.total.toLocaleString()}`);
    console.log(`  Retaliation cases: ${stats.retaliation_cases} (${stats.total > 0 ? (stats.retaliation_cases / stats.total * 100).toFixed(1) : 0}%)`);
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
  console.log(`  Retaliation cases: ${totalRetaliation} (${totalCases > 0 ? (totalRetaliation / totalCases * 100).toFixed(1) : 0}%)`);
  console.log('='.repeat(70));
  
  // Save summary
  const summaryFile = path.join(OUTPUT_DIR, 'onlrb-scraping-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify({
    scrape_date: new Date().toISOString(),
    years: YEARS,
    stats: allStats,
    total_cases: totalCases,
    total_retaliation_cases: totalRetaliation
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
