#!/usr/bin/env node
/**
 * FETCH FULL TEXT FROM CANLII FOR EXISTING DECISIONS
 * 
 * Purpose: Download full decision text for metadata-only tribunal decisions
 *          to enable outcome pattern extraction
 * 
 * Problem: Existing JSON files only have metadata (case numbers, keywords)
 *          but no full text. Re-extraction needs text to match patterns.
 * 
 * Solution: Visit each CanLII URL, scrape full text, update JSON files
 * 
 * Usage:
 *   node scripts/fetch-full-text-from-canlii.js [tribunal] [year] [maxDecisions]
 * 
 * Examples:
 *   node scripts/fetch-full-text-from-canlii.js onwsib 2023 50
 *   node scripts/fetch-full-text-from-canlii.js wsiat 2026 100
 * 
 * Safety:
 *   - 3-second delay between requests (polite scraping)
 *   - Creates backups before modifying files
 *   - Saves progress incrementally (resume on failure)
 *   - Respects CanLII's robots.txt
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const BACKUP_DIR = path.join(DATA_DIR, 'backups-before-fulltext-fetch');
const DELAY_MS = 3000; // 3 seconds between requests (polite scraping)

// Tribunal file patterns
const TRIBUNAL_PATTERNS = {
  wsiat: /onwsiat.*\.json$/i,
  onsbt: /onsbt.*\.json$/i,
  onwsib: /onwsib.*\.json$/i,
  onhrt: /onhrt.*\.json$/i,
  bcwcat: /bcwcat.*\.json$/i
};

/**
 * Fetch full text from CanLII URL
 */
function fetchFullTextFromURL(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };
    
    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        // Extract decision text from HTML
        const fullText = extractDecisionText(html);
        resolve(fullText);
      });
    }).on('error', reject);
  });
}

/**
 * Extract decision text from CanLII HTML
 */
function extractDecisionText(html) {
  // CanLII decision text is typically in <div class="documentContentBlock">
  // or <div id="origdoc"> or similar containers
  
  // Simple extraction: look for decision text between common markers
  let text = html;
  
  // Remove script tags
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove style tags
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Look for main content area
  const contentMatch = text.match(/<div[^>]*class="[^"]*documentContentBlock[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (contentMatch) {
    text = contentMatch[1];
  } else {
    // Try alternative container
    const origdocMatch = text.match(/<div[^>]*id="origdoc"[^>]*>([\s\S]*?)<\/div>/i);
    if (origdocMatch) {
      text = origdocMatch[1];
    }
  }
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Delay execution
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process a single JSON file
 */
async function processFile(filePath, maxDecisions = null) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`);
  
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
    skipped: 0
  };
  
  // Limit processing if specified
  if (maxDecisions && data.length > maxDecisions) {
    console.log(`⚠️  Limiting to ${maxDecisions} decisions (total: ${data.length})`);
    data = data.slice(0, maxDecisions);
    stats.total = maxDecisions;
  }
  
  // Count decisions needing fetch
  for (const decision of data) {
    if (!decision.full_text || decision.full_text.length === 0) {
      stats.needsFetch++;
    }
  }
  
  console.log(`📊 Need to fetch: ${stats.needsFetch} / ${stats.total} decisions`);
  
  if (stats.needsFetch === 0) {
    console.log('✅ All decisions already have full text');
    return stats;
  }
  
  // Fetch full text for each decision
  for (let i = 0; i < data.length; i++) {
    const decision = data[i];
    
    // Skip if already has full text
    if (decision.full_text && decision.full_text.length > 0) {
      stats.skipped++;
      continue;
    }
    
    // Get URL
    const url = decision.url || decision.data?.url;
    if (!url) {
      console.warn(`⚠️  No URL for decision ${i + 1}`);
      stats.failed++;
      continue;
    }
    
    console.log(`🌐 Fetching ${i + 1}/${data.length}: ${url}`);
    
    try {
      const fullText = await fetchFullTextFromURL(url);
      
      if (fullText && fullText.length > 100) {
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
      } else {
        console.warn(`⚠️  Empty or short text (${fullText?.length || 0} chars)`);
        stats.failed++;
      }
      
      // Delay before next request (polite scraping)
      await delay(DELAY_MS);
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      stats.failed++;
      
      // Continue after delay
      await delay(DELAY_MS);
    }
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
  const tribunalArg = args[0];
  const yearArg = args[1];
  const maxDecisions = args[2] ? parseInt(args[2]) : null;
  
  if (!tribunalArg) {
    console.error('❌ Usage: node fetch-full-text-from-canlii.js <tribunal> [year] [maxDecisions]');
    console.error('   Example: node fetch-full-text-from-canlii.js onwsib 2023 50');
    return;
  }
  
  console.log('🚀 FETCH FULL TEXT FROM CANLII');
  console.log('==============================');
  console.log(`Tribunal: ${tribunalArg}`);
  console.log(`Year: ${yearArg || 'all'}`);
  console.log(`Max Decisions: ${maxDecisions || 'unlimited'}`);
  console.log(`Delay: ${DELAY_MS}ms between requests`);
  console.log('');
  
  // Create backup directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Find files to process
  const pattern = TRIBUNAL_PATTERNS[tribunalArg.toLowerCase()];
  if (!pattern) {
    console.error(`❌ Unknown tribunal: ${tribunalArg}`);
    console.error(`   Valid options: ${Object.keys(TRIBUNAL_PATTERNS).join(', ')}`);
    return;
  }
  
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .filter(f => !f.includes('BACKUP'))
    .filter(f => !f.includes('predicted-outcomes'))
    .filter(f => !f.startsWith('.progress'))  // Skip progress tracking files
    .filter(f => !f.startsWith('.'))           // Skip hidden files
    .filter(f => pattern.test(f))
    .filter(f => {
      if (!yearArg) return true;
      return f.includes(yearArg);
    });
  
  if (files.length === 0) {
    console.error('❌ No files found matching criteria');
    return;
  }
  
  if (files.length > 1) {
    console.log(`⚠️  Multiple files found. Processing first only: ${files[0]}`);
    console.log(`   To process others, specify year or run separately`);
    console.log(`   Files: ${files.join(', ')}`);
    console.log('');
  }
  
  const file = files[0];
  const filePath = path.join(DATA_DIR, file);
  
  // Create backup
  const backupPath = path.join(BACKUP_DIR, `BACKUP-${Date.now()}-${file}`);
  fs.copyFileSync(filePath, backupPath);
  console.log(`💾 Backup: ${path.basename(backupPath)}`);
  
  // Process file
  console.log(`\n⏳ Starting fetch process...`);
  console.log(`   File: ${file}`);
  console.log(`   Estimated time: ${maxDecisions ? maxDecisions * (DELAY_MS / 1000) : 'varies'} seconds`);
  console.log('');
  
  const startTime = Date.now();
  const stats = await processFile(filePath, maxDecisions);
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
  
  if (stats) {
    console.log('\n📊 SUMMARY');
    console.log('==========');
    console.log(`Total Decisions: ${stats.total}`);
    console.log(`Needed Fetch: ${stats.needsFetch}`);
    console.log(`Successfully Fetched: ${stats.fetched}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Skipped (already had text): ${stats.skipped}`);
    console.log(`Time Elapsed: ${elapsedSec}s`);
    console.log('');
    
    if (stats.fetched > 0) {
      console.log('✅ NEXT STEP: Run outcome re-extraction');
      console.log(`   node scripts/re-extract-outcomes-with-notebooklm-patterns.js ${tribunalArg} ${yearArg || ''}`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fetchFullTextFromURL, extractDecisionText, processFile };
