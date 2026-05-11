#!/usr/bin/env node
/**
 * PUPPETEER FULL TEXT SCRAPER - UNDETECTABLE
 * 
 * Uses real Chrome browser to bypass CanLII bot detection (HTTP 403)
 * 
 * SETUP:
 *   npm install puppeteer --save-dev
 * 
 * USAGE:
 *   node scripts/puppeteer-fulltext-scraper.js <file> [maxDecisions]
 * 
 * EXAMPLES:
 *   node scripts/puppeteer-fulltext-scraper.js onwsiat-2026-ultra-slow.json 10
 *   node scripts/puppeteer-fulltext-scraper.js onwsib-2023-complete.json 50
 *   node scripts/puppeteer-fulltext-scraper.js all 20
 */

const fs = require('fs');
const path = require('path');

// Check if puppeteer is installed
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (error) {
  console.error('❌ Puppeteer not installed!');
  console.error('');
  console.error('Install with:');
  console.error('  npm install puppeteer --save-dev');
  console.error('');
  console.error('Or if that fails:');
  console.error('  npm install puppeteer-core --save-dev');
  console.error('  npm install chrome-aws-lambda --save-dev');
  process.exit(1);
}

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const BACKUP_DIR = path.join(DATA_DIR, 'backups-before-puppeteer-scrape');
const DELAY_MS = 3000; // 3 seconds between requests (human-like)
const PAGE_TIMEOUT = 45000; // 45 seconds per page

/**
 * Extract decision text from page using browser context
 */
async function extractDecisionTextFromPage(page) {
  try {
    // Wait for main content to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Try multiple selectors in order of preference
    const selectors = [
      '.documentContentBlock',  // Most common CanLII structure
      '#origdoc',               // Alternative structure
      '.decision',              // Generic decision container
      'article',                // Semantic HTML
      'main'                    // Main content area
    ];
    
    let text = null;
    
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          text = await page.evaluate(el => el.innerText, element);
          if (text && text.length > 100) {
            console.log(`   ✓ Extracted from ${selector}`);
            break;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Fallback: get all visible text
    if (!text || text.length < 100) {
      text = await page.evaluate(() => document.body.innerText);
    }
    
    // Clean up text
    text = text.trim();
    
    // Validate
    if (text.length < 100) {
      throw new Error(`Text too short: ${text.length} chars`);
    }
    
    // Check for error pages
    if (text.toLowerCase().includes('page not found') ||
        text.toLowerCase().includes('404') ||
        text.toLowerCase().includes('access denied') ||
        text.toLowerCase().includes('no results found')) {
      throw new Error('Error page detected');
    }
    
    return text;
    
  } catch (error) {
    throw new Error(`Extraction failed: ${error.message}`);
  }
}

/**
 * Delay execution (human-like timing)
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process a single JSON file with Puppeteer
 */
async function processFile(filePath, maxDecisions = null) {
  const filename = path.basename(filePath);
  console.log(`\n📄 Processing: ${filename}`);
  
  // Load JSON
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!Array.isArray(data)) {
    console.error('❌ File is not an array of decisions');
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
  
  // Limit processing if specified
  let decisionsToProcess = data;
  if (maxDecisions && data.length > maxDecisions) {
    console.log(`⚠️  Limiting to ${maxDecisions} decisions (total: ${data.length})`);
    decisionsToProcess = data.slice(0, maxDecisions);
    stats.total = maxDecisions;
  }
  
  // Count decisions needing fetch
  for (const decision of decisionsToProcess) {
    if (!decision.full_text || decision.full_text.length < 100) {
      stats.needsFetch++;
    }
  }
  
  console.log(`📊 Need to fetch: ${stats.needsFetch} / ${stats.total} decisions`);
  
  if (stats.needsFetch === 0) {
    console.log('✅ All decisions already have full text');
    return stats;
  }
  
  // Launch browser
  console.log('🚀 Launching Chrome...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Fetch full text for each decision
    for (let i = 0; i < decisionsToProcess.length; i++) {
      const decision = decisionsToProcess[i];
      
      // Skip if already has full text
      if (decision.full_text && decision.full_text.length >= 100) {
        stats.skipped++;
        continue;
      }
      
      // Get URL from various possible fields
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
      
      console.log(`🌐 Fetching ${i + 1}/${decisionsToProcess.length}: ${url}`);
      
      try {
        // Navigate to page
        const response = await page.goto(url, { 
          waitUntil: 'networkidle2',
          timeout: PAGE_TIMEOUT 
        });
        
        if (!response.ok()) {
          throw new Error(`HTTP ${response.status()}`);
        }
        
        // Extract text
        const fullText = await extractDecisionTextFromPage(page);
        
        // Store full text
        decision.full_text = fullText;
        decision.full_text_length = fullText.length;
        
        if (decision.data_quality) {
          decision.data_quality.has_full_text = true;
        }
        
        stats.fetched++;
        console.log(`✅ Fetched ${fullText.length} chars`);
        
        // Save progress every 10 decisions
        if (stats.fetched % 10 === 0) {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
          console.log(`💾 Progress saved (${stats.fetched} fetched)`);
        }
        
        // Human-like delay before next request
        await delay(DELAY_MS);
        
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        stats.failed++;
        stats.errors.push({ index: i, url, reason: error.message });
        
        // Continue after delay
        await delay(DELAY_MS);
      }
    }
    
  } finally {
    // Always close browser
    await browser.close();
    console.log('🔒 Browser closed');
  }
  
  // Save final file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n✅ Final save complete`);
  
  return stats;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const fileArg = args[0];
  const maxDecisions = args[1] ? parseInt(args[1]) : null;
  
  if (!fileArg) {
    console.error('❌ Usage: node puppeteer-fulltext-scraper.js <file|all> [maxDecisions]');
    console.error('');
    console.error('Examples:');
    console.error('  node puppeteer-fulltext-scraper.js onwsiat-2026-ultra-slow.json 10');
    console.error('  node puppeteer-fulltext-scraper.js onwsib-2023-complete.json 50');
    console.error('  node puppeteer-fulltext-scraper.js all 20');
    return;
  }
  
  console.log('🤖 PUPPETEER FULL TEXT SCRAPER - UNDETECTABLE');
  console.log('==============================================');
  console.log(`Target: ${fileArg}`);
  console.log(`Max Decisions: ${maxDecisions || 'unlimited (per file)'}`);
  console.log(`Delay: ${DELAY_MS}ms between requests`);
  console.log(`Page Timeout: ${PAGE_TIMEOUT}ms`);
  console.log('');
  
  // Create backup directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Find files to process
  let files = [];
  
  if (fileArg.toLowerCase() === 'all') {
    // Process all tribunal JSON files
    files = fs.readdirSync(DATA_DIR)
      .filter(f => f.endsWith('.json'))
      .filter(f => !f.includes('BACKUP'))
      .filter(f => !f.includes('predicted-outcomes'))
      .filter(f => !f.startsWith('.progress'))
      .filter(f => !f.startsWith('.'))
      .map(f => path.join(DATA_DIR, f));
    
    console.log(`📊 Found ${files.length} tribunal files to process`);
    files.forEach((f, i) => console.log(`   ${i + 1}. ${path.basename(f)}`));
    console.log('');
    
  } else {
    // Process specific file
    const filePath = path.isAbsolute(fileArg) ? fileArg : path.join(DATA_DIR, fileArg);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return;
    }
    
    files = [filePath];
  }
  
  // Process each file
  const allStats = [];
  
  for (const filePath of files) {
    // Create backup
    const backupPath = path.join(BACKUP_DIR, `BACKUP-${Date.now()}-${path.basename(filePath)}`);
    fs.copyFileSync(filePath, backupPath);
    console.log(`💾 Backup: ${path.basename(backupPath)}`);
    
    // Process file
    const startTime = Date.now();
    const stats = await processFile(filePath, maxDecisions);
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (stats) {
      stats.file = path.basename(filePath);
      stats.elapsedSec = elapsedSec;
      allStats.push(stats);
      
      console.log('\n📊 FILE SUMMARY');
      console.log('===============');
      console.log(`File: ${stats.file}`);
      console.log(`Total Decisions: ${stats.total}`);
      console.log(`Needed Fetch: ${stats.needsFetch}`);
      console.log(`Successfully Fetched: ${stats.fetched}`);
      console.log(`Failed: ${stats.failed}`);
      console.log(`Skipped (already had text): ${stats.skipped}`);
      console.log(`Time Elapsed: ${stats.elapsedSec}s`);
      
      if (stats.errors.length > 0 && stats.errors.length <= 5) {
        console.log(`\nErrors:`);
        stats.errors.forEach(e => console.log(`  - Decision ${e.index}: ${e.reason}`));
      }
    }
  }
  
  // Overall summary if multiple files
  if (allStats.length > 1) {
    console.log('\n\n🎉 OVERALL SUMMARY');
    console.log('==================');
    console.log(`Files Processed: ${allStats.length}`);
    console.log(`Total Fetched: ${allStats.reduce((sum, s) => sum + s.fetched, 0)}`);
    console.log(`Total Failed: ${allStats.reduce((sum, s) => sum + s.failed, 0)}`);
    console.log(`Total Time: ${allStats.reduce((sum, s) => sum + parseFloat(s.elapsedSec), 0).toFixed(1)}s`);
    console.log('');
    
    allStats.forEach(s => {
      const successRate = s.needsFetch > 0 ? ((s.fetched / s.needsFetch) * 100).toFixed(1) : '100.0';
      console.log(`  ${s.file}: ${s.fetched}/${s.needsFetch} (${successRate}%)`);
    });
  }
  
  console.log('\n✅ NEXT STEP: Run outcome re-extraction');
  console.log('   node scripts/re-extract-outcomes-with-notebooklm-patterns.js [tribunal] [year]');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processFile, extractDecisionTextFromPage };
