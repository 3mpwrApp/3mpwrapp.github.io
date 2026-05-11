#!/usr/bin/env node
/**
 * Fetch Full HTML Content for Collected Cases
 * 
 * Takes metadata-only cases and fetches full decision HTML
 * Uses CanLII API to get complete case details
 * 
 * Usage:
 *   node scripts/fetch-full-content.js --input=onwsiat-2026-ultra-slow.json --max=200
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.CANLII_API_KEY;
const BASE_URL = "https://api.canlii.org/v1";
const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');

// Parse args
const args = process.argv.slice(2);
const inputFile = args.find(a => a.startsWith('--input='))?.split('=')[1] || 'filtered-disability-cases-2026-04-08.json';
const maxCalls = parseInt(args.find(a => a.startsWith('--max='))?.split('=')[1]) || 200;

console.log('═══════════════════════════════════════════════════════');
console.log('  Fetch Full Case Content');
console.log('═══════════════════════════════════════════════════════\n');
console.log(`Input: ${inputFile}`);
console.log(`Max API calls: ${maxCalls}\n`);

// Load existing cases
const inputPath = path.join(DATA_DIR, inputFile);
let cases = [];
try {
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  cases = Array.isArray(data) ? data : [];
  console.log(`✅ Loaded ${cases.length} cases\n`);
} catch (error) {
  console.error(`❌ Error: ${error.message}\n`);
  process.exit(1);
}

// Fetch full case content
async function fetchFullCase(caseId, database) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/caseBrowse/en/${database}/${caseId}?api_key=${API_KEY}`;
    
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 404) resolve(null);
        else if (res.statusCode === 429) reject(new Error('QUOTA_HIT'));
        else if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON'));
          }
        }
        else reject(new Error(`HTTP ${res.statusCode}`));
      });
    }).on('error', reject);
  });
}

// Main processing
async function enrichCases() {
  const enriched = [];
  let apiCalls = 0;
  let hasFullContent = 0;
  
  console.log('🔍 Checking for full content...\n');
  
  for (let i = 0; i < Math.min(cases.length, maxCalls); i++) {
    const caseData = cases[i];
    const data = caseData.data || caseData;
    const caseId = data.caseId || caseData.caseId;
    const database = data.databaseId || 'onwsiat';
    
    // Check if already has full content
    if (data.html || (data.keywords && data.keywords.length > 100)) {
      enriched.push(caseData);
      hasFullContent++;
      if (i % 100 === 0) process.stdout.write('.');
      continue;
    }
    
    try {
      console.log(`  [${i + 1}/${cases.length}] Fetching: ${caseId}...`);
      apiCalls++;
      
      const fullData = await fetchFullCase(caseId, database);
      
      if (fullData) {
        // Merge with existing data
        enriched.push({
          ...caseData,
          data: {
            ...data,
            ...fullData,
            fetchedFullContent: true,
            enrichedAt: new Date().toISOString()
          }
        });
        console.log(`    ✅ Enriched (${fullData.html ? 'has HTML' : 'metadata only'})`);
      } else {
        enriched.push(caseData);
        console.log(`    ⚠️  404 Not Found`);
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (error) {
      if (error.message === 'QUOTA_HIT') {
        console.log(`\n\n❌ API quota hit after ${apiCalls} calls`);
        console.log(`✅ Enriched ${enriched.length} cases so far\n`);
        break;
      }
      
      console.log(`    ❌ Error: ${error.message}`);
      enriched.push(caseData);
    }
  }
  
  // Add remaining unenriched cases
  if (enriched.length < cases.length) {
    enriched.push(...cases.slice(enriched.length));
  }
  
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`  API calls: ${apiCalls}`);
  console.log(`  Already had full content: ${hasFullContent}`);
  console.log(`  Newly enriched: ${enriched.length - hasFullContent}`);
  console.log(`  Total cases: ${enriched.length}\n`);
  
  // Save enriched data
  const outputFile = inputFile.replace('.json', '-full-content.json');
  const outputPath = path.join(DATA_DIR, outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2));
  
  console.log(`💾 Saved to: ${outputFile}\n`);
  console.log('Next: Run pattern analysis on enriched data:');
  console.log(`  node scripts/analyze-patterns.mjs ${outputFile}\n`);
}

enrichCases().catch(console.error);
