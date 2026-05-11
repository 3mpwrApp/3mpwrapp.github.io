#!/usr/bin/env node
/**
 * STEALTH PUPPETEER SCRAPER - Maximum Anti-Detection
 * 
 * Uses puppeteer-extra with stealth plugin to bypass sophisticated bot detection
 * 
 * SETUP:
 *   npm install puppeteer-extra puppeteer-extra-plugin-stealth --save-dev
 * 
 * USAGE:
 *   node scripts/stealth-fulltext-scraper.js <file> [maxDecisions]
 * 
 * EXAMPLES:
 *   node scripts/stealth-fulltext-scraper.js onwsiat-2026-ultra-slow.json 5
 */

const fs = require('fs');
const path = require('path');

// Check if puppeteer-extra is installed
let puppeteer, StealthPlugin;
try {
  puppeteer = require('puppeteer-extra');
  StealthPlugin = require('puppeteer-extra-plugin-stealth');
  puppeteer.use(StealthPlugin());
  console.log('✅ Stealth mode enabled');
} catch (error) {
  console.error('❌ puppeteer-extra not installed!');
  console.error('');
  console.error('Install with:');
  console.error('  npm install puppeteer-extra puppeteer-extra-plugin-stealth --save-dev');
  console.error('');
  process.exit(1);
}

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const BACKUP_DIR = path.join(DATA_DIR, 'backups-before-stealth-scrape');
const MIN_DELAY = 5000; // 5 seconds minimum
const MAX_DELAY = 10000; // 10 seconds maximum (random human-like delays)
const PAGE_TIMEOUT = 60000; // 60 seconds per page

/**
 * Random delay (human-like behavior)
 */
function randomDelay() {
  const ms = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulate human behavior on page
 */
async function simulateHumanBehavior(page) {
  try {
    // Random scroll
    await page.evaluate(() => {
      window.scrollTo(0, Math.random() * 500);
    });
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Another small delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    
    // Scroll back up a bit
    await page.evaluate(() => {
      window.scrollTo(0, Math.random() * 300);
    });
    
  } catch (error) {
    // Non-critical, continue
  }
}

/**
 * Extract decision text from page
 */
async function extractDecisionText(page) {
  try {
    // Wait for content
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Try multiple selectors
    const selectors = [
      '.documentContentBlock',
      '#origdoc',
      '.decision',
      'article',
      'main'
    ];
    
    let text = null;
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          text = await page.evaluate(el => el.innerText, element);
          if (text && text.length > 100) {
            console.log(`   ✓ Found text in ${selector} (${text.length} chars)`);
            break;
          }
        }
      } catch (e) {
        // Continue
      }
    }
    
    // Fallback
    if (!text || text.length < 100) {
      text = await page.evaluate(() => document.body.innerText);
    }
    
    text = text.trim();
    
    // Validate
    if (text.length < 100) {
      throw new Error(`Text too short: ${text.length} chars`);
    }
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('page not found') ||
        lowerText.includes('404') ||
        lowerText.includes('access denied') ||
        lowerText.includes('blocked') ||
        lowerText.includes('captcha')) {
      throw new Error('Error/block page detected');
    }
    
    return text;
    
  } catch (error) {
    throw new Error(`Extraction failed: ${error.message}`);
  }
}

/**
 * Process file with stealth browser
 */
async function processFile(filePath, maxDecisions = null) {
  const filename = path.basename(filePath);
  console.log(`\n📄 Processing: ${filename}`);
  
  // Load JSON
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!Array.isArray(data)) {
    console.error('❌ File is not an array');
    return null;
  }
  
  // Stats
  let stats = {
    total: data.length,
    needsFetch: 0,
    fetched: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };
  
  // Limit processing
  let decisionsToProcess = data;
  if (maxDecisions && data.length > maxDecisions) {
    console.log(`⚠️  Limiting to ${maxDecisions} decisions (total: ${data.length})`);
    decisionsToProcess = data.slice(0, maxDecisions);
    stats.total = maxDecisions;
  }
  
  // Count needing fetch
  for (const decision of decisionsToProcess) {
    if (!decision.full_text || decision.full_text.length < 100) {
      stats.needsFetch++;
    }
  }
  
  console.log(`📊 Need to fetch: ${stats.needsFetch} / ${stats.total}`);
  
  if (stats.needsFetch === 0) {
    console.log('✅ All have full text');
    return stats;
  }
  
  // Launch browser with maximum stealth
  console.log('🚀 Launching stealth browser...');
  const browser = await puppeteer.launch({
    headless: false, // FALSE = looks more human (shows actual browser)
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080',
      '--start-maximized'
    ],
    defaultViewport: null
  });
  
  try {
    const page = await browser.newPage();
    
    // Extra stealth measures
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver flag
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // Mock chrome object
      window.chrome = {
        runtime: {},
      };
      
      // Mock permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });
    
    // Fetch each decision
    for (let i = 0; i < decisionsToProcess.length; i++) {
      const decision = decisionsToProcess[i];
      
      // Skip if has text
      if (decision.full_text && decision.full_text.length >= 100) {
        stats.skipped++;
        continue;
      }
      
      // Get URL
      const url = decision.url || 
                  decision.data?.url || 
                  decision.caseUrl ||
                  decision.link;
      
      if (!url) {
        console.warn(`⚠️  No URL for decision ${i + 1}`);
        stats.failed++;
        stats.errors.push({ index: i, reason: 'No URL' });
        continue;
      }
      
      console.log(`\n🌐 [${i + 1}/${decisionsToProcess.length}] Fetching: ${url}`);
      
      try {
        // Navigate
        console.log('   ⏳ Loading page...');
        const response = await page.goto(url, { 
          waitUntil: 'domcontentloaded', // Faster, don't wait for everything
          timeout: PAGE_TIMEOUT 
        });
        
        const status = response.status();
        console.log(`   ℹ️  HTTP ${status}`);
        
        if (status === 403) {
          throw new Error('HTTP 403 - Blocked');
        }
        
        if (status !== 200) {
          throw new Error(`HTTP ${status}`);
        }
        
        // Wait a bit more for content
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate human behavior
        console.log('   🧑 Simulating human behavior...');
        await simulateHumanBehavior(page);
        
        // Extract text
        console.log('   📖 Extracting text...');
        const fullText = await extractDecisionText(page);
        
        // Store
        decision.full_text = fullText;
        decision.full_text_length = fullText.length;
        
        if (decision.data_quality) {
          decision.data_quality.has_full_text = true;
        }
        
        stats.fetched++;
        console.log(`   ✅ Success! ${fullText.length} chars`);
        
        // Save progress every 5 decisions
        if (stats.fetched % 5 === 0) {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
          console.log(`   💾 Progress saved (${stats.fetched} fetched)`);
        }
        
        // Random human-like delay
        const delayMs = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
        console.log(`   ⏸️  Waiting ${(delayMs/1000).toFixed(1)}s before next...`);
        await randomDelay();
        
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        stats.failed++;
        stats.errors.push({ index: i, url, reason: error.message });
        
        // Still delay before continuing
        await randomDelay();
      }
    }
    
  } finally {
    await browser.close();
    console.log('\n🔒 Browser closed');
  }
  
  // Final save
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('✅ Final save complete');
  
  return stats;
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const fileArg = args[0];
  const maxDecisions = args[1] ? parseInt(args[1]) : null;
  
  if (!fileArg) {
    console.error('❌ Usage: node stealth-fulltext-scraper.js <file> [maxDecisions]');
    console.error('');
    console.error('Examples:');
    console.error('  node stealth-fulltext-scraper.js onwsiat-2026-ultra-slow.json 5');
    console.error('  node stealth-fulltext-scraper.js onwsib-2023-complete.json 10');
    return;
  }
  
  console.log('🕵️  STEALTH PUPPETEER SCRAPER - Maximum Anti-Detection');
  console.log('======================================================');
  console.log(`Target: ${fileArg}`);
  console.log(`Max Decisions: ${maxDecisions || 'unlimited'}`);
  console.log(`Delay: ${MIN_DELAY/1000}-${MAX_DELAY/1000}s (random, human-like)`);
  console.log(`Headless: FALSE (shows browser = more human-like)`);
  console.log('');
  
  // Create backup dir
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Get file path
  const filePath = path.isAbsolute(fileArg) ? fileArg : path.join(DATA_DIR, fileArg);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }
  
  // Backup
  const backupPath = path.join(BACKUP_DIR, `BACKUP-${Date.now()}-${path.basename(filePath)}`);
  fs.copyFileSync(filePath, backupPath);
  console.log(`💾 Backup: ${path.basename(backupPath)}\n`);
  
  // Process
  const startTime = Date.now();
  const stats = await processFile(filePath, maxDecisions);
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
  
  if (stats) {
    console.log('\n\n📊 SUMMARY');
    console.log('==========');
    console.log(`File: ${path.basename(filePath)}`);
    console.log(`Total Decisions: ${stats.total}`);
    console.log(`Needed Fetch: ${stats.needsFetch}`);
    console.log(`✅ Successfully Fetched: ${stats.fetched}`);
    console.log(`❌ Failed: ${stats.failed}`);
    console.log(`⏭️  Skipped: ${stats.skipped}`);
    console.log(`⏱️  Time: ${elapsedSec}s`);
    
    if (stats.fetched > 0) {
      const avgTime = (parseFloat(elapsedSec) / stats.fetched).toFixed(1);
      console.log(`📈 Avg per decision: ${avgTime}s`);
    }
    
    if (stats.errors.length > 0 && stats.errors.length <= 10) {
      console.log(`\n⚠️  Errors:`);
      stats.errors.forEach(e => console.log(`  - Decision ${e.index}: ${e.reason}`));
    }
    
    if (stats.fetched > 0) {
      console.log('\n✅ NEXT STEP: Run outcome extraction');
      console.log('   node scripts/re-extract-outcomes-with-notebooklm-patterns.js wsiat 2026');
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processFile, extractDecisionText };
