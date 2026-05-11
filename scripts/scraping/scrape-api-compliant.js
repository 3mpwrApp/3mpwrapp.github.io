#!/usr/bin/env node
/**
 * CanLII Scraper - FIXED VERSION per Official API Docs
 * 
 * Key fixes:
 * 1. Removed non-existent "search" parameter
 * 2. Changed "changedSince" to "changedAfter" (correct parameter)
 * 3. Uses caseBrowse correctly per https://github.com/canlii/API_documentation
 * 
 * Strategy: Get ALL cases from database, filter locally by content
 * (CanLII API doesn't support keyword search in caseBrowse endpoint)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CANLII_API_KEY = process.env.CANLII_API_KEY;
const CANLII_BASE = "https://api.canlii.org/v1";
const OUTPUT_DIR = path.join(__dirname, '../data/tribunal-decisions');

// Parse command line args
const args = process.argv.slice(2);
const database = args.find(a => a.startsWith('--database='))?.split('=')[1] || 'onwsiat';
const dateFrom = args.find(a => a.startsWith('--from='))?.split('=')[1] || '2020-01-01';
const dateTo = args.find(a => a.startsWith('--to='))?.split('=')[1];
const maxResults = parseInt(args.find(a => a.startsWith('--max='))?.split('=')[1]) || 10000;

console.log('═══════════════════════════════════════════════════════');
console.log('  CanLII Scraper - API-Compliant Version');
console.log('═══════════════════════════════════════════════════════\n');
console.log(`Database: ${database}`);
console.log(`Date range: ${dateFrom} to ${dateTo || 'present'}`);
console.log(`Max results: ${maxResults}\n`);

// Load existing cases to skip
const existingIds = new Set();
try {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  const files = fs.readdirSync(OUTPUT_DIR);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const data = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf8'));
      const cases = Array.isArray(data) ? data : data.decisions || [];
      cases.forEach(c => {
        if (c.case_id) existingIds.add(c.case_id);
        if (c.caseId) existingIds.add(c.caseId);
      });
    } catch (e) {
      // Skip invalid files
    }
  }
  console.log(`✅ Loaded ${existingIds.size} existing cases (will skip)\n`);
} catch (e) {
  console.log('ℹ️  No existing data found\n');
}

// Fetch with retry
async function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 429) reject(new Error('QUOTA_HIT'));
        else if (res.statusCode === 200) resolve(data);
        else reject(new Error(`HTTP ${res.statusCode}`));
      });
    }).on('error', reject);
  });
}

// Main collection
async function collectCases() {
  const collected = [];
  let offset = 0;
  const batchSize = 100; // Max per query
  let apiCalls = 0;
  
  console.log('🔍 Fetching case list from CanLII API...\n');
  
  while (collected.length < maxResults) {
    try {
      // Build params per official API docs
      const params = new URLSearchParams({
        api_key: CANLII_API_KEY,
        offset: offset.toString(),
        resultCount: Math.min(batchSize, maxResults - collected.length).toString()
      });
      
      // Add date filters (official parameters)
      if (dateFrom) {
        params.append('changedAfter', dateFrom); // Fixed: was "changedSince"
        params.append('decisionDateAfter', dateFrom);
      }
      if (dateTo) {
        params.append('changedBefore', dateTo);
        params.append('decisionDateBefore', dateTo);
      }
      
      const url = `${CANLII_BASE}/caseBrowse/en/${database}?${params}`;
      apiCalls++;
      
      console.log(`  Query ${apiCalls}: offset=${offset}...`);
      
      const response = JSON.parse(await httpsGet(url));
      
      if (!response.cases || response.cases.length === 0) {
        console.log('  ℹ️  No more cases found\n');
        break;
      }
      
      // Filter out existing cases
      const newCases = response.cases.filter(c => {
        const caseId = c.caseId?.en || c.caseId;
        return caseId && !existingIds.has(caseId);
      });
      
      console.log(`  ✅ Found ${response.cases.length} cases (${newCases.length} new)\n`);
      
      collected.push(...newCases);
      offset += batchSize;
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 1000));
      
      // Stop if we got fewer results than requested (end of data)
      if (response.cases.length < batchSize) {
        console.log('  ℹ️  Reached end of dataset\n');
        break;
      }
      
    } catch (error) {
      if (error.message === 'QUOTA_HIT') {
        console.log(`\n❌ API quota hit after ${apiCalls} calls`);
        console.log(`✅ Collected ${collected.length} case IDs\n`);
        break;
      }
      console.error(`  ⚠️  Error: ${error.message}`);
      break;
    }
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Discovery complete!`);
  console.log(`   API calls: ${apiCalls}`);
  console.log(`   Total cases found: ${collected.length}`);
  console.log(`   Already had: ${existingIds.size}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Save case list
  if (collected.length > 0) {
    const filename = `${database}-caselist-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(collected, null, 2));
    console.log(`💾 Saved case list to: ${filename}`);
    console.log(`\nNext step: Fetch full case details with scrape-direct.js\n`);
  }
}

collectCases().catch(console.error);
