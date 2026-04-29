#!/usr/bin/env node
/**
 * UNIVERSAL FULL TEXT SCRAPER FOR ALL TRIBUNALS
 * 
 * Purpose: Add full decision text to existing tribunal JSON files
 *          by scraping CanLII web pages with browser-like headers
 * 
 * Works for: WSIAT, ONWSIB, ONSBT, ONHRT, BCWCAT, and ANY tribunal with CanLII URLs
 * 
 * Strategy:
 *   1. Read existing JSON file
 *   2. For each decision without full text:
 *      - Visit the CanLII URL with browser headers
 *      - Extract decision text from HTML
 *      - Add to JSON
 *   3. Save progress incrementally
 * 
 * Usage:
 *   node scripts/universal-fulltext-scraper.js [file] [maxDecisions]
 * 
 * Examples:
 *   node scripts/universal-fulltext-scraper.js onwsib-2023-complete.json 50
 *   node scripts/universal-fulltext-scraper.js onwsiat-2026-ultra-slow.json 100
 *   node scripts/universal-fulltext-scraper.js all 20
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const BACKUP_DIR = path.join(DATA_DIR, 'backups-before-fulltext-scrape');
const DELAY_MS = 2000; // 2 seconds between requests
const MAX_RETRIES = 3;

/**
 * Fetch HTML from URL with browser-like headers
 */
function fetchWithHeaders(url, attempt = 1) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    };
    
    const req = protocol.request(options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchWithHeaders(res.headers.location, attempt));
      }
      
      if (res.statusCode !== 200) {
        if (attempt < MAX_RETRIES) {
          console.log(`   ⚠️  HTTP ${res.statusCode}, retry ${attempt}/${MAX_RETRIES}`);
          setTimeout(() => {
            resolve(fetchWithHeaders(url, attempt + 1));
          }, DELAY_MS * attempt);
          return;
        }
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      
      let html = '';
      
      // Handle gzip/deflate encoding
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') {
        const zlib = require('zlib');
        stream = res.pipe(zlib.createGunzip());
      } else if (res.headers['content-encoding'] === 'deflate') {
        const zlib = require('zlib');
        stream = res.pipe(zlib.createInflate());
      }
      
      stream.on('data', chunk => html += chunk);
      stream.on('end', () => resolve(html));
      stream.on('error', reject);
    });
    
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Extract decision text from CanLII HTML
 */
function extractDecisionText(html, url) {
  try {
    // Remove script and style tags
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Try multiple extraction strategies
    let extracted = null;
    
    // Strategy 1: documentContentBlock (most common)
    const contentMatch = text.match(/<div[^>]*class="[^"]*documentContentBlock[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i);
    if (contentMatch) {
      extracted = contentMatch[1];
    }
    
    // Strategy 2: origdoc
    if (!extracted) {
      const origdocMatch = text.match(/<div[^>]*id="origdoc"[^>]*>([\s\S]*?)<\/div>/i);
      if (origdocMatch) {
        extracted = origdocMatch[1];
      }
    }
    
    // Strategy 3: decision content area
    if (!extracted) {
      const decisionMatch = text.match(/<div[^>]*class="[^"]*decision[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
      if (decisionMatch) {
        extracted = decisionMatch[1];
      }
    }
    
    // If no specific container found, try to extract between common markers
    if (!extracted) {
      // Look for decision text between header and footer
      const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        extracted = bodyMatch[1];
      }
    }
    
    if (!extracted) {
      extracted = text; // Fallback to full HTML
    }
    
    // Clean up HTML tags
    extracted = extracted.replace(/<[^>]+>/g, ' ');
    
    // Decode HTML entities
    extracted = extracted.replace(/&nbsp;/g, ' ');
    extracted = extracted.replace(/&amp;/g, '&');
    extracted = extracted.replace(/&lt;/g, '<');
    extracted = extracted.replace(/&gt;/g, '>');
    extracted = extracted.replace(/&quot;/g, '"');
    extracted = extracted.replace(/&#39;/g, "'");
    extracted = extracted.replace(/&mdash;/g, '—');
    extracted = extracted.replace(/&ndash;/g, '–');
    
    // Clean up whitespace
    extracted = extracted.replace(/\s+/g, ' ').trim();
    
    // Validate extraction
    if (extracted.length < 100) {
      throw new Error(`Extracted text too short (${extracted.length} chars)`);
    }
    
    // Check if we got error page instead of decision
    if (extracted.toLowerCase().includes('page not found') ||
        extracted.toLowerCase().includes('404') ||
        extracted.toLowerCase().includes('no results found')) {
      throw new Error('Error page detected instead of decision');
    }
    
    return extracted;
    
  } catch (error) {
    throw new Error(`Extraction failed: ${error.message}`);
  }
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
      const html = await fetchWithHeaders(url);
      const fullText = extractDecisionText(html, url);
      
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
      
      // Delay before next request
      await delay(DELAY_MS);
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      stats.failed++;
      stats.errors.push({ index: i, url, reason: error.message });
      
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
  const fileArg = args[0];
  const maxDecisions = args[1] ? parseInt(args[1]) : null;
  
  if (!fileArg) {
    console.error('❌ Usage: node universal-fulltext-scraper.js <file|all> [maxDecisions]');
    console.error('');
    console.error('Examples:');
    console.error('  node universal-fulltext-scraper.js onwsib-2023-complete.json 50');
    console.error('  node universal-fulltext-scraper.js onwsiat-2026-ultra-slow.json 100');
    console.error('  node universal-fulltext-scraper.js all 20  (processes ALL tribunal files)');
    return;
  }
  
  console.log('🚀 UNIVERSAL FULL TEXT SCRAPER');
  console.log('==============================');
  console.log(`Target: ${fileArg}`);
  console.log(`Max Decisions: ${maxDecisions || 'unlimited (per file)'}`);
  console.log(`Delay: ${DELAY_MS}ms between requests`);
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

module.exports = { fetchWithHeaders, extractDecisionText, processFile };
