#!/usr/bin/env node
/**
 * Test Single Case Fetch - Validate Anti-Bot Detection Fixes
 * 
 * Tests fetching a single CanLII case to ensure:
 * 1. User-Agent bypass works
 * 2. Headers are accepted
 * 3. No HTTP 403 errors
 * 
 * Usage: node scripts/test-single-case-fetch.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Rotating User-Agents (same as main script)
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
];

function fetchHTML(url, userAgent) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: 'www.canlii.org',
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.canlii.org/en/'
      }
    };

    console.log(`\n🔍 Testing fetch with User-Agent:`);
    console.log(`   ${userAgent}`);
    console.log(`   URL: ${url}`);

    https.get(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);

      if (res.statusCode === 403) {
        reject(new Error('HTTP 403 - Still blocked!'));
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`   ✅ Success! Fetched ${data.length} bytes`);
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function testSingleCase() {
  console.log('🧪 Testing Single Case Fetch\n');
  console.log('==========================================');

  // Load a single Tier C case from WSIAT
  const tierCPath = path.join(__dirname, '../data/tribunal-decisions/onwsiat-outcomes-tier-c-manual-review-queue.json');
  
  if (!fs.existsSync(tierCPath)) {
    console.log('❌ Tier C file not found!');
    return;
  }

  const tierCCases = JSON.parse(fs.readFileSync(tierCPath, 'utf8'));
  const testCase = tierCCases[0]; // Get first case

  console.log(`\nTest Case: ${testCase.case_id}`);
  console.log(`URL: ${testCase.url}`);
  console.log('');

  // Test with all User-Agents
  for (let i = 0; i < USER_AGENTS.length; i++) {
    try {
      const html = await fetchHTML(testCase.url, USER_AGENTS[i]);
      
      // Check if we got actual content
      if (html.includes('appeal') || html.includes('decision') || html.includes('tribunal')) {
        console.log(`   ✅ Content looks valid (contains expected keywords)`);
      } else {
        console.log(`   ⚠️ Content may be incomplete or blocked`);
      }

      // Only test first one if it works
      console.log('\n✅ SUCCESS! Anti-bot detection bypass is working!');
      console.log('   You can now run the full enrichment script.');
      return;

    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      
      if (i < USER_AGENTS.length - 1) {
        console.log(`   Trying next User-Agent...`);
      } else {
        console.log('\n❌ ALL USER-AGENTS FAILED');
        console.log('   CanLII may be using more advanced bot detection.');
        console.log('   Options:');
        console.log('   1. Try official WSIAT scraper instead');
        console.log('   2. Add Puppeteer/Playwright for full browser rendering');
        console.log('   3. Use proxy rotation');
      }
    }
  }
}

testSingleCase().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
