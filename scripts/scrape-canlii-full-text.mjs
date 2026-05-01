#!/usr/bin/env node
/**
 * CanLII Full Text Scraper
 * 
 * PURPOSE:
 * - Scrape full decision text from CanLII for better classification accuracy
 * - Current limitation: Keywords only provide topics, not outcomes
 * - Full text enables 70-80% confidence vs current 60% (mostly low confidence)
 * 
 * DATA SOURCE:
 * - URLs from data/tribunal-decisions/onwsiat-YYYY-ultra-slow.json
 * - Each decision has url field pointing to CanLII
 * 
 * RATE LIMITING:
 * - CanLII API is free but requires respectful usage
 * - 1 request per second = ~3 hours for 11,430 decisions
 * - Saves progress every 100 decisions (resume capability)
 * 
 * OUTPUT:
 * - data/tribunal-decisions/full-text/YYYY/caseId.txt
 * - data/tribunal-decisions/full-text/scrape-progress.json
 * 
 * COST: $0 (CanLII is free)
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const YEARLY_FILES = [
  'data/tribunal-decisions/onwsiat-2020-ultra-slow.json',
  'data/tribunal-decisions/onwsiat-2021-ultra-slow.json',
  'data/tribunal-decisions/onwsiat-2022-ultra-slow.json',
  'data/tribunal-decisions/onwsiat-2023-ultra-slow.json',
  'data/tribunal-decisions/onwsiat-2024-ultra-slow.json',
  'data/tribunal-decisions/onwsiat-2025-ultra-slow.json',
  'data/tribunal-decisions/onwsiat-2026-ultra-slow.json',
];

const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions', 'full-text');
const PROGRESS_FILE = path.join(OUTPUT_DIR, 'scrape-progress.json');
const RATE_LIMIT_MS = 1000; // 1 second between requests
const BATCH_SIZE = 100; // Save progress every 100 decisions
const TIMEOUT_MS = 30000; // 30 second timeout per request

/**
 * Load all decisions from yearly files
 */
function loadAllDecisions() {
  console.log('📁 Loading decisions from yearly files...');
  const allDecisions = [];
  
  for (const file of YEARLY_FILES) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      continue;
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const decisions = Array.isArray(data) ? data : (data.decisions || []);
    
    decisions.forEach(d => {
      if (d.data && d.data.url && d.data.caseId) {
        allDecisions.push({
          caseId: d.data.caseId,
          url: d.data.url,
          year: parseInt(d.data.decisionDate?.substring(0, 4) || '2020'),
          title: d.data.title || 'Unknown',
        });
      }
    });
    
    console.log(`  ✓ ${file}: ${decisions.length} decisions`);
  }
  
  console.log(`✅ Total decisions loaded: ${allDecisions.length}\n`);
  return allDecisions;
}

/**
 * Load or initialize progress tracking
 */
function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  
  return {
    totalDecisions: 0,
    scraped: 0,
    failed: 0,
    lastCaseId: null,
    startedAt: new Date().toISOString(),
    lastSavedAt: null,
  };
}

/**
 * Save progress
 */
function saveProgress(progress) {
  progress.lastSavedAt = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

/**
 * Check if decision already scraped
 */
function isAlreadyScraped(year, caseId) {
  const filePath = path.join(OUTPUT_DIR, year.toString(), `${caseId}.txt`);
  return fs.existsSync(filePath);
}

/**
 * Fetch HTML from CanLII URL
 */
function fetchCanLIIPage(url) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, TIMEOUT_MS);
    
    https.get(url, { headers: { 'User-Agent': '3mpwrApp Research (empowrapp08162025@gmail.com)' } }, (res) => {
      let html = '';
      
      res.on('data', (chunk) => {
        html += chunk;
      });
      
      res.on('end', () => {
        clearTimeout(timeoutId);
        resolve(html);
      });
    }).on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}

/**
 * Extract decision text from CanLII HTML
 * CanLII uses <div class="decision-body"> or similar for decision text
 */
function extractDecisionText(html) {
  // Very basic HTML parsing - extract text between decision body tags
  // CanLII format: <div class="decision-body">...</div>
  
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Try to find decision body
  const bodyMatch = text.match(/<div[^>]*class="decision-body"[^>]*>([\s\S]*?)<\/div>/i);
  if (bodyMatch) {
    text = bodyMatch[1];
  } else {
    // Fallback: Try to find main content area
    const contentMatch = text.match(/<div[^>]*id="content"[^>]*>([\s\S]*?)<\/div>/i);
    if (contentMatch) {
      text = contentMatch[1];
    }
  }
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Scrape single decision
 */
async function scrapeDecision(decision) {
  try {
    const html = await fetchCanLIIPage(decision.url);
    const text = extractDecisionText(html);
    
    // Save to file
    const yearDir = path.join(OUTPUT_DIR, decision.year.toString());
    if (!fs.existsSync(yearDir)) {
      fs.mkdirSync(yearDir, { recursive: true });
    }
    
    const filePath = path.join(yearDir, `${decision.caseId}.txt`);
    fs.writeFileSync(filePath, text, 'utf8');
    
    return { success: true, length: text.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Main scraping function
 */
async function main() {
  console.log('🔍 CanLII Full Text Scraper');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Load decisions
  const decisions = loadAllDecisions();
  
  // Load progress
  const progress = loadProgress();
  progress.totalDecisions = decisions.length;
  
  // Find starting point (resume capability)
  let startIndex = 0;
  if (progress.lastCaseId) {
    startIndex = decisions.findIndex(d => d.caseId === progress.lastCaseId) + 1;
    console.log(`📍 Resuming from decision ${startIndex + 1} (last: ${progress.lastCaseId})\n`);
  }
  
  console.log('⏱️  Rate limit: 1 request/second (~3 hours for all 11,430)\n');
  console.log('🚀 Starting scrape...\n');
  
  const startTime = Date.now();
  let batchCount = 0;
  
  for (let i = startIndex; i < decisions.length; i++) {
    const decision = decisions[i];
    
    // Skip if already scraped
    if (isAlreadyScraped(decision.year, decision.caseId)) {
      console.log(`⏩ [${i + 1}/${decisions.length}] Already scraped: ${decision.caseId}`);
      progress.scraped++;
      continue;
    }
    
    // Scrape decision
    console.log(`🔄 [${i + 1}/${decisions.length}] Scraping: ${decision.caseId} (${decision.year})`);
    const result = await scrapeDecision(decision);
    
    if (result.success) {
      console.log(`   ✅ Success: ${result.length} chars`);
      progress.scraped++;
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
      progress.failed++;
    }
    
    progress.lastCaseId = decision.caseId;
    batchCount++;
    
    // Save progress every BATCH_SIZE decisions
    if (batchCount >= BATCH_SIZE) {
      saveProgress(progress);
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = progress.scraped / elapsed;
      const remaining = decisions.length - i - 1;
      const eta = remaining / rate;
      
      console.log(`\n💾 Progress saved: ${progress.scraped}/${decisions.length} (${((progress.scraped / decisions.length) * 100).toFixed(1)}%)`);
      console.log(`   Failed: ${progress.failed}`);
      console.log(`   Rate: ${rate.toFixed(2)} decisions/sec`);
      console.log(`   ETA: ${(eta / 3600).toFixed(1)} hours\n`);
      
      batchCount = 0;
    }
    
    // Rate limiting (except for last decision)
    if (i < decisions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS));
    }
  }
  
  // Final save
  saveProgress(progress);
  
  const elapsed = (Date.now() - startTime) / 1000;
  console.log('\n✅ Scraping complete!');
  console.log(`   Scraped: ${progress.scraped}`);
  console.log(`   Failed: ${progress.failed}`);
  console.log(`   Time: ${(elapsed / 3600).toFixed(2)} hours`);
  console.log(`   Output: ${OUTPUT_DIR}`);
}

// Run
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
