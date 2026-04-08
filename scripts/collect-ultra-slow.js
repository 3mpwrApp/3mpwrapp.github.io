#!/usr/bin/env node
/**
 * Ultra-Slow CanLII Collection (Quota-Constrained)
 * 
 * For APIs with extremely low quota (2-5 calls/day):
 * - Collects 1 case at a time
 * - Saves progress after each case
 * - Resume support for multi-day collection
 * - Run daily via cron/Task Scheduler
 * 
 * Usage:
 *   node collect-ultra-slow.js --database=onwsiat --year=2026 --max=2
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.CANLII_API_KEY;
const BASE_URL = "https://api.canlii.org/v1";
const OUTPUT_DIR = path.join(__dirname, '../data/tribunal-decisions');
const PROGRESS_FILE = path.join(OUTPUT_DIR, '.ultra-slow-progress.json');

// Parse args
const args = process.argv.slice(2);
const database = args.find(a => a.startsWith('--database='))?.split('=')[1] || 'onwsiat';
const year = parseInt(args.find(a => a.startsWith('--year='))?.split('=')[1]) || 2026;
const maxCalls = parseInt(args.find(a => a.startsWith('--max='))?.split('=')[1]) || 2;

console.log('═══════════════════════════════════════════════════════');
console.log('  CanLII Ultra-Slow Collection');
console.log('═══════════════════════════════════════════════════════\n');
console.log(`Database: ${database}`);
console.log(`Year: ${year}`);
console.log(`Max API calls: ${maxCalls}\n`);

// Load progress
let progress = { lastCaseNum: 0, collected: [], failed: [] };
if (fs.existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  console.log(`✅ Resumed from case #${progress.lastCaseNum} (${progress.collected.length} collected so far)\n`);
}

// Fetch case
async function fetchCase(caseId) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/caseBrowse/en/${database}/${caseId}?api_key=${API_KEY}`;
    
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 404) resolve(null); // Case doesn't exist
        else if (res.statusCode === 429) reject(new Error('QUOTA_HIT'));
        else if (res.statusCode === 200) resolve(JSON.parse(data));
        else reject(new Error(`HTTP ${res.statusCode}`));
      });
    }).on('error', reject);
  });
}

// Main collection
async function collect() {
  let apiCalls = 0;
  let consecutive404s = 0;
  const MAX_404_STREAK = 50;
  
  for (let caseNum = progress.lastCaseNum + 1; caseNum <= 9999; caseNum++) {
    if (apiCalls >= maxCalls) {
      console.log(`\n⏸️  Reached max API calls (${maxCalls}). Run again tomorrow!\n`);
      break;
    }
    
    const caseId = `${year}${database}${caseNum}`;
    
    try {
      console.log(`  Trying: ${caseId}...`);
      apiCalls++;
      
      const caseData = await fetchCase(caseId);
      
      if (caseData) {
        console.log(`  ✅ Found! (${apiCalls}/${maxCalls} calls used)`);
        progress.collected.push({ caseId, data: caseData, fetchedAt: new Date().toISOString() });
        consecutive404s = 0;
      } else {
        console.log(`  ⚠️  404 Not Found`);
        progress.failed.push({ caseId, reason: '404', attemptedAt: new Date().toISOString() });
        consecutive404s++;
        
        if (consecutive404s >= MAX_404_STREAK) {
          console.log(`\n  ⏭️  ${MAX_404_STREAK} consecutive 404s - moving to next year\n`);
          break;
        }
      }
      
      // Update progress after each call
      progress.lastCaseNum = caseNum;
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
      
      // Small delay between calls
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (error) {
      if (error.message === 'QUOTA_HIT') {
        console.log(`\n❌ API quota hit after ${apiCalls} calls`);
        console.log(`💾 Progress saved at case #${caseNum}`);
        console.log(`\n⏰ Run again after quota resets (midnight UTC / 8 PM ET)\n`);
        break;
      }
      
      console.log(`  ❌ Error: ${error.message}`);
      progress.failed.push({ caseId, reason: error.message });
      progress.lastCaseNum = caseNum;
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`📊 Session Summary:`);
  console.log(`   API calls made: ${apiCalls}`);
  console.log(`   Total collected: ${progress.collected.length}`);
  console.log(`   Progress: Case #${progress.lastCaseNum}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Save full data
  if (progress.collected.length > 0) {
    const outputFile = path.join(OUTPUT_DIR, `${database}-${year}-ultra-slow.json`);
    fs.writeFileSync(outputFile, JSON.stringify(progress.collected, null, 2));
    console.log(`💾 Saved to: ${path.basename(outputFile)}`);
    console.log(`\n📅 Run daily with cron/Task Scheduler to collect ~60 cases/month\n`);
  }
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

collect().catch(console.error);
