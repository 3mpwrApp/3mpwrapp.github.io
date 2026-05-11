#!/usr/bin/env node
/**
 * 🎯 WSIAT TOP 2000 COMPREHENSIVE SCRAPER
 * Gets the 2000 most recent WSIAT cases to reduce 91.8% outcome obscurity gap
 * 
 * Strategy: Sort by caseId (contains year) and take top 2000
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 19, 2026
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CANLII_BASE = "https://api.canlii.org/v1";
const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";
const OUTPUT_DIR = path.join(__dirname, '../data/tribunal-decisions/detective-analysis');
const DELAY_MS = 15000;
const TARGET_COUNT = 2000;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await httpsGet(url);
    } catch (error) {
      if (attempt < retries) {
        console.log(`    ⚠️  Retry ${attempt}: ${error.message}`);
        await delay(DELAY_MS);
      } else {
        throw error;
      }
    }
  }
}

async function fetchCaseList() {
  const params = new URLSearchParams({ 
    api_key: CANLII_API_KEY,
    resultCount: 5000, // CanLII max seems to be less than 10000
    offset: 0
  });
  
  const url = `${CANLII_BASE}/caseBrowse/en/onwsiat/?${params}`;
  console.log(`  Fetching with resultCount=5000...`);
  const response = await fetchWithRetry(url);
  return response.cases || [];
}

async function fetchFullCase(caseId) {
  const params = new URLSearchParams({ api_key: CANLII_API_KEY });
  const url = `${CANLII_BASE}/caseBrowse/en/onwsiat/${caseId}/?${params}`;
  
  try {
    return await fetchWithRetry(url);
  } catch (error) {
    console.error(`    ❌ Error fetching ${caseId}: ${error.message}`);
    return null;
  }
}

function parseCaseId(caseIdObj) {
  if (typeof caseIdObj === 'string') return caseIdObj;
  return caseIdObj?.en || caseIdObj?.fr || 'unknown';
}

function extractYear(caseId) {
  const match = caseId.match(/^(\d{4})/);
  return match ? parseInt(match[1]) : 0;
}

async function main() {
  console.log('█'.repeat(80));
  console.log('🎯 WSIAT TOP 2000 COMPREHENSIVE SCRAPER');
  console.log('Getting 2000 most recent cases to reduce 91.8% outcome obscurity gap');
  console.log('█'.repeat(80));
  
  console.log('\n📋 Fetching case list...');
  const allCases = await fetchCaseList();
  console.log(`✅ Found ${allCases.length} total cases`);
  
  if (allCases.length === 0) {
    console.log('\n⚠️  No cases returned from API - possibly quota exceeded or database empty');
    console.log('   Rerun tomorrow or check CanLII API status');
    return;
  }
  
  // Sort by caseId (descending) to get most recent first
  allCases.sort((a, b) => {
    const idA = parseCaseId(a.caseId);
    const idB = parseCaseId(b.caseId);
    return idB.localeCompare(idA);
  });
  
  const top2000 = allCases.slice(0, TARGET_COUNT);
  console.log(`\n🎯 Selected top ${top2000.length} most recent cases`);
  if (top2000.length > 0) {
    console.log(`   Range: ${parseCaseId(top2000[0].caseId)} to ${parseCaseId(top2000[top2000.length-1].caseId)}`);
  }
  
  const enriched = [];
  const progressFile = path.join(OUTPUT_DIR, '.progress-wsiat-top2000.json');
  
  // Load progress if exists
  let startIndex = 0;
  if (fs.existsSync(progressFile)) {
    const progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    startIndex = progress.last_index + 1;
    console.log(`\n📂 Resuming from case ${startIndex + 1}`);
    
    const outputFile = path.join(OUTPUT_DIR, 'wsiat-top2000-recent.json');
    if (fs.existsSync(outputFile)) {
      enriched.push(...JSON.parse(fs.readFileSync(outputFile, 'utf8')));
    }
  }
  
  console.log('\n🔬 Fetching full case details...');
  for (let i = startIndex; i < top2000.length; i++) {
    const caseData = top2000[i];
    const caseId = parseCaseId(caseData.caseId);
    const year = extractYear(caseId);
    
    console.log(`  [${i + 1}/${top2000.length}] (${((i+1)/top2000.length*100).toFixed(1)}%) ${caseId}...`);
    
    const fullData = await fetchFullCase(caseId);
    
    if (!fullData) {
      enriched.push({
        case_id: caseId,
        title: caseData.title || 'Unknown',
        year,
        keywords: [],
        fetch_failed: true
      });
      continue;
    }
    
    const keywordsApi = (fullData.keywords || '').split(';').map(k => k.trim()).filter(k => k);
    
    enriched.push({
      case_id: caseId,
      title: fullData.title || caseData.title || 'Unknown',
      citation: fullData.citation || caseData.citation || '',
      decision_date: fullData.decisionDate || 'Unknown',
      docket_number: fullData.docketNumber || '',
      url: fullData.url || `https://canlii.ca/t/${caseId}`,
      year,
      keywords: keywordsApi,
      keyword_length: keywordsApi.join('; ').length
    });
    
    // Save progress every 25 cases
    if ((i + 1) % 25 === 0 || i === top2000.length - 1) {
      const outputFile = path.join(OUTPUT_DIR, 'wsiat-top2000-recent.json');
      fs.writeFileSync(outputFile, JSON.stringify(enriched, null, 2));
      fs.writeFileSync(progressFile, JSON.stringify({ last_index: i }, null, 2));
      console.log(`    💾 Saved: ${enriched.length}/${top2000.length} cases`);
    }
    
    // Delay between requests
    if (i < top2000.length - 1) {
      await delay(DELAY_MS);
    }
  }
  
  const outputFile = path.join(OUTPUT_DIR, 'wsiat-top2000-recent.json');
  fs.writeFileSync(outputFile, JSON.stringify(enriched, null, 2));
  
  // Stats
  const withKeywords = enriched.filter(c => c.keywords && c.keywords.length > 0);
  const avgKeywordLength = withKeywords.length > 0 ? 
    Math.round(withKeywords.reduce((sum, c) => sum + (c.keyword_length || 0), 0) / withKeywords.length) : 0;
  
  console.log('\n📊 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total cases: ${enriched.length}`);
  console.log(`With keywords: ${withKeywords.length}`);
  console.log(`Average keyword length: ${avgKeywordLength} chars`);
  console.log(`\n✅ Saved to: ${outputFile}`);
}

main().catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
