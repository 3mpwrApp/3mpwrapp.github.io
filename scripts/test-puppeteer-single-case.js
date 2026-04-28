#!/usr/bin/env node
/**
 * Test Single Case with Puppeteer - Validate DataDome Bypass
 * 
 * Quick test to ensure Puppeteer successfully bypasses CanLII DataDome protection
 * before running the full 25,895 case enrichment (which takes 3-4 days)
 * 
 * Usage: node scripts/test-puppeteer-single-case.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testSingleCase() {
  console.log('🧪 Testing Puppeteer DataDome Bypass\n');
  console.log('==========================================');

  // Load first Tier C case from WSIAT
  const tierCPath = path.join(__dirname, '../data/tribunal-decisions/onwsiat-outcomes-tier-c-manual-review-queue.json');
  
  if (!fs.existsSync(tierCPath)) {
    console.log('❌ Tier C file not found!');
    return;
  }

  const tierCCases = JSON.parse(fs.readFileSync(tierCPath, 'utf8'));
  const testCase = tierCCases[0];

  console.log(`\nTest Case: ${testCase.case_id}`);
  console.log(`URL: ${testCase.url}`);
  console.log('');

  let browser;
  try {
    console.log('🚀 Launching headless Chrome...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    console.log('✅ Browser launched\n');

    const page = await browser.newPage();
    
    // Set viewport and realistic User-Agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    console.log('🌐 Navigating to CanLII page...');
    await page.goto(testCase.url, { 
      waitUntil: 'networkidle2',
      timeout: 45000
    });
    console.log('✅ Page loaded\n');

    // Wait for content
    await page.waitForSelector('body', { timeout: 10000 });

    // Extract text
    const text = await page.evaluate(() => {
      return document.body.innerText;
    });

    console.log('📄 Content Analysis:');
    console.log(`   Length: ${text.length} characters`);
    console.log(`   Contains "DataDome": ${text.includes('DataDome') ? 'YES ❌' : 'NO ✅'}`);
    console.log(`   Contains "appeal": ${text.includes('appeal') || text.includes('Appeal') ? 'YES ✅' : 'NO ❌'}`);
    console.log(`   Contains "decision": ${text.includes('decision') || text.includes('Decision') ? 'YES ✅' : 'NO ❌'}`);
    console.log('');

    if (text.includes('DataDome') || text.length < 500) {
      console.log('❌ FAILED - Still being blocked by DataDome!');
      console.log('   This should not happen with Puppeteer.');
      console.log('   Try running with headless: false to see what\'s happening.');
      return false;
    }

    // Test outcome detection
    const { detectOutcomeFromText } = require('./enrich-tier-c-with-puppeteer.js');
    const detection = detectOutcomeFromText(text, 'WSIAT');

    console.log('🔍 Outcome Detection Test:');
    console.log(`   Outcome: ${detection.outcome}`);
    console.log(`   Confidence: ${detection.confidence}%`);
    console.log(`   Tier: ${detection.tier}`);
    console.log('');

    if (detection.outcome !== 'Unknown') {
      console.log('✅ SUCCESS! Puppeteer bypass is working!');
      console.log('   You can now run the full enrichment script:');
      console.log('   node scripts/enrich-tier-c-with-puppeteer.js');
    } else {
      console.log('⚠️ DataDome bypass works, but no outcome detected.');
      console.log('   This is normal for some cases - NLP patterns may need tuning.');
      console.log('   The enrichment script is ready to run.');
    }

    console.log('');
    console.log('Sample text (first 500 chars):');
    console.log(text.substring(0, 500).replace(/\s+/g, ' '));

    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n✅ Browser closed');
    }
  }
}

testSingleCase().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
