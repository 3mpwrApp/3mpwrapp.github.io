#!/usr/bin/env node
/**
 * FETCH FULL TEXT FROM CANLII API
 * 
 * Purpose: Download full decision text using CanLII's official API
 *          instead of scraping HTML (which gets blocked)
 * 
 * API Docs: https://www.canlii.org/en/info/api.html
 * 
 * Setup:
 *   1. Get API key: https://www.canlii.org/en/info/api.html#signup
 *   2. Set environment variable: CANLII_API_KEY=your_key_here
 *   3. Run script
 * 
 * Usage:
 *   node scripts/fetch-full-text-from-canlii-api.js [tribunal] [year] [maxDecisions]
 * 
 * Examples:
 *   node scripts/fetch-full-text-from-canlii-api.js onwsib 2023 50
 *   node scripts/fetch-full-text-from-canlii-api.js wsiat 2026 100
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const BACKUP_DIR = path.join(DATA_DIR, 'backups-before-fulltext-fetch');
const DELAY_MS = 1000; // 1 second between requests (API is more permissive)

// CanLII API Configuration
const CANLII_API_KEY = process.env.CANLII_API_KEY;
const CANLII_API_BASE = 'https://api.canlii.org/v1';

// Tribunal database IDs for CanLII API
const CANLII_DATABASE_IDS = {
  wsiat: 'onwsiat',
  onwsib: 'onwsib',
  onsbt: 'onsbt',
  onhrt: 'onhrt',
  bcwcat: 'bcwcat'
};

// Tribunal file patterns
const TRIBUNAL_PATTERNS = {
  wsiat: /onwsiat.*\.json$/i,
  onsbt: /onsbt.*\.json$/i,
  onwsib: /onwsib.*\.json$/i,
  onhrt: /onhrt.*\.json$/i,
  bcwcat: /bcwcat.*\.json$/i
};

/**
 * Fetch case details from CanLII API
 */
function fetchCaseFromAPI(databaseId, caseId) {
  return new Promise((resolve, reject) => {
    if (!CANLII_API_KEY) {
      return reject(new Error('CANLII_API_KEY not set. Get one at https://www.canlii.org/en/info/api.html'));
    }
    
    // API endpoint: /caseBrowse/:language/:databaseId/:caseId
    const url = `${CANLII_API_BASE}/caseBrowse/en/${databaseId}/${caseId}/?api_key=${CANLII_API_KEY}`;
    
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      
      let json = '';
      res.on('data', chunk => json += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(json);
          resolve(data);
        } catch (error) {
          reject(new Error(`Invalid JSON: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Extract case ID from CanLII URL
 * Example: https://canlii.ca/t/k3zj2 -> k3zj2
 */
function extractCaseIdFromURL(url) {
  const match = url.match(/canlii\.ca\/t\/([a-z0-9]+)/i);
  return match ? match[1] : null;
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
async function processFile(filePath, tribunal, maxDecisions = null) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`);
  
  // Get CanLII database ID
  const databaseId = CANLII_DATABASE_IDS[tribunal];
  if (!databaseId) {
    console.error(`❌ Unknown CanLII database ID for tribunal: ${tribunal}`);
    return null;
  }
  
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
    
    // Get case ID from URL (CanLII API uses URL identifiers like 'k3zj2', not numeric IDs)
    const url = decision.url || decision.data?.url;
    let caseId = null;
    
    if (url) {
      caseId = extractCaseIdFromURL(url);
    }
    
    // Fallback to case_id field only if URL extraction failed
    if (!caseId) {
      caseId = decision.case_id || decision.caseId;
      
      // Strip year prefix if present (2023canlii138774 -> 138774)
      if (caseId && caseId.match(/^\d{4}canlii/i)) {
        caseId = caseId.replace(/^\d{4}canlii/i, '');
      }
    }
    
    if (!caseId) {
      console.warn(`⚠️  No case ID for decision ${i + 1}`);
      stats.failed++;
      continue;
    }
    
    console.log(`🌐 Fetching ${i + 1}/${data.length}: ${databaseId}/${caseId}`);
    
    try {
      const apiData = await fetchCaseFromAPI(databaseId, caseId);
      
      // Extract full text from API response
      let fullText = '';
      
      // CanLII API returns case in multiple formats
      if (apiData.content) {
        fullText = apiData.content;
      } else if (apiData.htmlContent) {
        // Strip HTML tags if HTML version returned
        fullText = apiData.htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      
      if (fullText && fullText.length > 100) {
        // Store full text
        decision.full_text = fullText;
        decision.full_text_length = fullText.length;
        if (decision.data_quality) {
          decision.data_quality.has_full_text = true;
        }
        
        // Store additional metadata from API if available
        if (apiData.summary) {
          decision.summary = apiData.summary;
        }
        if (apiData.keywords) {
          decision.keywords_api = apiData.keywords;
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
      
      // Delay before next request
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
    console.error('❌ Usage: node fetch-full-text-from-canlii-api.js <tribunal> [year] [maxDecisions]');
    console.error('   Example: node fetch-full-text-from-canlii-api.js onwsib 2023 50');
    console.error('');
    console.error('⚠️  IMPORTANT: Set CANLII_API_KEY environment variable first!');
    console.error('   Get API key: https://www.canlii.org/en/info/api.html');
    console.error('');
    console.error('   Windows PowerShell:');
    console.error('   $env:CANLII_API_KEY="your_key_here"');
    console.error('');
    console.error('   Windows CMD:');
    console.error('   set CANLII_API_KEY=your_key_here');
    return;
  }
  
  console.log('🚀 FETCH FULL TEXT FROM CANLII API');
  console.log('===================================');
  console.log(`Tribunal: ${tribunalArg}`);
  console.log(`Year: ${yearArg || 'all'}`);
  console.log(`Max Decisions: ${maxDecisions || 'unlimited'}`);
  console.log(`Delay: ${DELAY_MS}ms between requests`);
  console.log(`API Key: ${CANLII_API_KEY ? '✅ Set' : '❌ NOT SET'}`);
  console.log('');
  
  if (!CANLII_API_KEY) {
    console.error('❌ CANLII_API_KEY not set!');
    console.error('   Get API key: https://www.canlii.org/en/info/api.html');
    return;
  }
  
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
    .filter(f => !f.startsWith('.progress'))
    .filter(f => !f.startsWith('.'))
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
  console.log(`\n⏳ Starting fetch process via CanLII API...`);
  console.log(`   File: ${file}`);
  console.log(`   Estimated time: ${maxDecisions ? maxDecisions * (DELAY_MS / 1000) : 'varies'} seconds`);
  console.log('');
  
  const startTime = Date.now();
  const stats = await processFile(filePath, tribunalArg.toLowerCase(), maxDecisions);
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

module.exports = { fetchCaseFromAPI, extractCaseIdFromURL, processFile };
