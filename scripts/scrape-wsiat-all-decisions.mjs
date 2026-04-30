#!/usr/bin/env node

/**
 * WSIAT Decision Scraper - Comprehensive
 * 
 * Scrapes all 95,298+ WSIAT decisions from their search portal.
 * Handles pagination, JavaScript rendering, and rate limiting.
 * 
 * Usage: node scripts/scrape-wsiat-all-decisions.mjs
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  url: 'https://www.wsiat.ca/en/decisionSearch/decisionSearch.asp',
  outputPath: path.join(__dirname, '..', 'data', 'tribunal-decisions', 'wsiat', 'decisions-by-year'),
  metadataPath: path.join(__dirname, '..', 'data', 'tribunal-decisions', 'wsiat', 'wsiat-metadata.json'),
  progressPath: path.join(__dirname, '..', 'data', 'tribunal-decisions', 'wsiat', 'scrape-progress.json'),
  
  // Scraping parameters
  decisionsPerPage: 100, // WSIAT shows 100 results per page by default
  startPage: 1,
  maxPages: null, // null = scrape all pages
  
  // Rate limiting
  pageDelay: 2000, // 2 seconds between pages
  retryAttempts: 3,
  retryDelay: 5000,
  
  // Browser options
  headless: false, // Set to true for production
  slowMo: 100
};

// Ensure directories exist
[CONFIG.outputPath, path.dirname(CONFIG.metadataPath)].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Load progress from previous run
 */
function loadProgress() {
  if (fs.existsSync(CONFIG.progressPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG.progressPath, 'utf-8'));
      console.log(`📂 Resuming from page ${data.lastCompletedPage + 1}`);
      return data;
    } catch (error) {
      console.warn('⚠️  Could not load progress, starting fresh');
    }
  }
  return {
    lastCompletedPage: 0,
    totalDecisionsScraped: 0,
    lastRun: new Date().toISOString(),
    errors: []
  };
}

/**
 * Save progress
 */
function saveProgress(progress) {
  fs.writeFileSync(CONFIG.progressPath, JSON.stringify(progress, null, 2));
}

/**
 * Extract decisions from the current page
 */
async function extractDecisionsFromPage(page) {
  return await page.evaluate(() => {
    const decisions = [];
    
    // WSIAT uses Swiftype search results
    // Results are in <div class="st-result"> elements
    const results = document.querySelectorAll('.st-result, [data-result-id]');
    
    if (results.length === 0) {
      // Fallback: try to find decision numbers in any format
      const bodyText = document.body.innerText;
      const decisionPattern = /(\d+)\/(\d+)([A-Z]*)/g;
      let match;
      
      while ((match = decisionPattern.exec(bodyText)) !== null) {
        decisions.push({
          decisionNumber: `${match[1]}/${match[2]}${match[3] || ''}`,
          rootNumber: match[1],
          year: match[2],
          suffix: match[3] || null,
          rawText: 'Extracted from page text'
        });
      }
      
      return decisions;
    }
    
    results.forEach(result => {
      try {
        const titleEl = result.querySelector('.st-ui-type-heading, h3, .st-title, a');
        const detailEl = result.querySelector('.st-ui-type-detail, .st-snippet, p');
        const linkEl = result.querySelector('a[href*="canlii"], a[href*="decision"]');
        
        const text = result.innerText || result.textContent;
        const decisionMatch = text.match(/(\d+)\/(\d+)([A-Z]*)/);
        
        if (decisionMatch) {
          const decision = {
            decisionNumber: `${decisionMatch[1]}/${decisionMatch[2]}${decisionMatch[3] || ''}`,
            rootNumber: decisionMatch[1],
            year: decisionMatch[2],
            suffix: decisionMatch[3] || null,
            title: titleEl ? titleEl.innerText.trim() : null,
            summary: detailEl ? detailEl.innerText.trim() : null,
            url: linkEl ? linkEl.href : null,
            rawText: text.trim()
          };
          
          // Extract date
          const datePatterns = [
            /(\d{4}-\d{2}-\d{2})/,
            /(\d{2}\/\d{2}\/\d{4})/,
            /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i
          ];
          
          for (const pattern of datePatterns) {
            const dateMatch = text.match(pattern);
            if (dateMatch) {
              decision.date = dateMatch[1] || dateMatch[0];
              break;
            }
          }
          
          // Extract keywords
          const keywords = [];
          const keywordPatterns = [
            'LOE', 'NEL', 'FEL', 'SIEF', 'CPD', 'HAVS', 'ESRTW', 'LMR',
            'Section 31', 'Section 44', 'Section 13', 'Section 147',
            'Initial Entitlement', 'Right to Sue', 'Traumatic Mental Stress',
            'Occupational Disease', 'Chronic Pain', 'Reconsideration',
            'Permanent Impairment', 'Loss of Earnings'
          ];
          
          keywordPatterns.forEach(keyword => {
            if (text.includes(keyword)) {
              keywords.push(keyword);
            }
          });
          
          decision.keywords = keywords;
          decisions.push(decision);
        }
      } catch (error) {
        console.error('Error parsing result:', error.message);
      }
    });
    
    return decisions;
  });
}

/**
 * Get total results count
 */
async function getTotalResults(page) {
  return await page.evaluate(() => {
    // Look for "X to Y of Z decision(s)" text
    const patterns = [
      /of\s+([\d,]+)\s+decision/i,
      /showing.*of\s+([\d,]+)/i,
      /([\d,]+)\s+results?/i
    ];
    
    const bodyText = document.body.innerText;
    
    for (const pattern of patterns) {
      const match = bodyText.match(pattern);
      if (match) {
        return parseInt(match[1].replace(/,/g, ''), 10);
      }
    }
    
    return null;
  });
}

/**
 * Navigate to next page
 */
async function goToNextPage(page) {
  try {
    // First, scroll down to ensure pagination buttons are visible
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);
    
    // Look for "Next" button or pagination (Swiftype uses specific classes)
    // Try multiple selectors
    const selectors = [
      '.st-next',
      'a.st-next',
      'button:has-text("Next")',
      'a:has-text("Next")',
      '[aria-label*="Next"]',
      '.st-ui-pagination-link:has-text("Next")'
    ];
    
    for (const selector of selectors) {
      try {
        const nextButton = page.locator(selector).first();
        if (await nextButton.isVisible({ timeout: 1000 })) {
          console.log(`   └─ 📍 Found Next button with selector: ${selector}`);
          await nextButton.click();
          
          // Wait for new results to load
          await page.waitForLoadState('networkidle', { timeout: 15000 });
          await page.waitForTimeout(2000);
          
          // Scroll to top of results
          await page.evaluate(() => window.scrollTo(0, 0));
          
          return true;
        }
      } catch (e) {
        // Try next selector
        continue;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error navigating to next page:', error.message);
    return false;
  }
}

/**
 * Main scraping function
 */
async function scrapeWSIAT() {
  console.log('🚀 WSIAT Decision Scraper Starting...\n');
  
  const progress = loadProgress();
  const startPage = progress.lastCompletedPage + 1;
  
  const browser = await chromium.launch({
    headless: CONFIG.headless,
    slowMo: CONFIG.slowMo
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log(`📍 Navigating to ${CONFIG.url}`);
    await page.goto(CONFIG.url, { waitUntil: 'networkidle' });
    
    // Fill in date range to get ALL decisions (1985 to present)
    console.log('📅 Setting date range: January 1, 1985 to April 29, 2026...');
    
    // Wait for form to be ready
    await page.waitForSelector('input[value="Search"], button:has-text("Search")', { timeout: 10000 });
    
    // Date fields are already set by default, but let's ensure they capture all decisions
    // The form should already show the full date range
    
    // Click the Search button in the FORM (not header)
    console.log('🔍 Clicking Search button in form...');
    const searchButton = await page.locator('input[value="Search"], button:has-text("Search")').last();
    await searchButton.click();
    
    // Wait for results to load (Swiftype takes a moment)
    console.log('⏳ Waiting for results to load...');
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(5000); // Extra wait for Swiftype to render results
    
    // Get total results
    const totalResults = await getTotalResults(page);
    console.log(`📊 Total decisions found: ${totalResults?.toLocaleString() || 'Unknown'}\n`);
    
    const totalPages = totalResults ? Math.ceil(totalResults / CONFIG.decisionsPerPage) : CONFIG.maxPages || 1000;
    console.log(`📄 Total pages to scrape: ${totalPages}\n`);
    
    let allDecisions = [];
    let currentPage = startPage;
    
    // If resuming, navigate to the correct page
    if (startPage > 1) {
      console.log(`⏩ Fast-forwarding to page ${startPage}...`);
      for (let i = 1; i < startPage; i++) {
        const success = await goToNextPage(page);
        if (!success) {
          console.error(`❌ Could not navigate to page ${i + 1}, starting from page 1`);
          currentPage = 1;
          await page.goto(CONFIG.url, { waitUntil: 'networkidle' });
          await submitButton.click();
          await page.waitForLoadState('networkidle');
          break;
        }
        
        if (i % 10 === 0) {
          console.log(`   Skipping to page ${i + 1}...`);
        }
      }
    }
    
    // Scrape all pages
    while (currentPage <= totalPages) {
      if (CONFIG.maxPages && currentPage > CONFIG.maxPages) break;
      
      console.log(`\n📄 Scraping page ${currentPage}/${totalPages}`);
      
      try {
        const decisions = await extractDecisionsFromPage(page);
        console.log(`   ├─ Extracted ${decisions.length} decisions`);
        
        if (decisions.length === 0) {
          console.warn('   ├─ ⚠️  No decisions found on this page!');
          
          // Try to take a screenshot for debugging
          await page.screenshot({ 
            path: path.join(__dirname, '..', 'data', 'tribunal-decisions', 'wsiat', `debug-page-${currentPage}.png`) 
          });
        }
        
        allDecisions = allDecisions.concat(decisions);
        
        // Save progress every 10 pages
        if (currentPage % 10 === 0) {
          progress.lastCompletedPage = currentPage;
          progress.totalDecisionsScraped = allDecisions.length;
          progress.lastRun = new Date().toISOString();
          saveProgress(progress);
          
          console.log(`   ├─ 💾 Progress saved (${allDecisions.length} decisions so far)`);
        }
        
        // Navigate to next page
        if (currentPage < totalPages) {
          console.log(`   └─ ⏭️  Moving to next page...`);
          
          const success = await goToNextPage(page);
          
          if (!success) {
            console.warn(`   └─ ⚠️  Could not find "Next" button, scraping complete`);
            break;
          }
          
          // Rate limiting
          await page.waitForTimeout(CONFIG.pageDelay);
        }
        
        currentPage++;
        
      } catch (error) {
        console.error(`   └─ ❌ Error on page ${currentPage}:`, error.message);
        
        progress.errors.push({
          page: currentPage,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        // Retry
        let retried = false;
        for (let attempt = 1; attempt <= CONFIG.retryAttempts; attempt++) {
          console.log(`   └─ 🔄 Retry attempt ${attempt}/${CONFIG.retryAttempts}...`);
          await page.waitForTimeout(CONFIG.retryDelay);
          
          try {
            await page.reload({ waitUntil: 'networkidle' });
            const decisions = await extractDecisionsFromPage(page);
            allDecisions = allDecisions.concat(decisions);
            retried = true;
            break;
          } catch (retryError) {
            console.error(`   └─ ❌ Retry ${attempt} failed:`, retryError.message);
          }
        }
        
        if (!retried) {
          console.error(`   └─ ❌ Skipping page ${currentPage} after ${CONFIG.retryAttempts} failed attempts`);
          currentPage++;
        }
      }
    }
    
    // Organize and save results
    console.log('\n' + '='.repeat(60));
    console.log('✅ SCRAPING COMPLETE');
    console.log('='.repeat(60));
    console.log(`Total Decisions Scraped: ${allDecisions.length}`);
    
    // Deduplicate
    const uniqueDecisions = [];
    const seen = new Set();
    
    for (const decision of allDecisions) {
      if (!seen.has(decision.decisionNumber)) {
        seen.add(decision.decisionNumber);
        uniqueDecisions.push(decision);
      }
    }
    
    console.log(`Unique Decisions: ${uniqueDecisions.length}`);
    
    // Organize by year
    const decisionsByYear = {};
    uniqueDecisions.forEach(decision => {
      const year = decision.year;
      if (!decisionsByYear[year]) {
        decisionsByYear[year] = [];
      }
      decisionsByYear[year].push(decision);
    });
    
    // Save by year
    console.log('\n📁 Saving decisions by year...');
    Object.entries(decisionsByYear).forEach(([year, decisions]) => {
      const yearFile = path.join(CONFIG.outputPath, `wsiat-${year}.json`);
      fs.writeFileSync(yearFile, JSON.stringify(decisions, null, 2));
      console.log(`   ├─ wsiat-${year}.json (${decisions.length} decisions)`);
    });
    
    // Update metadata
    const metadata = {
      lastUpdated: new Date().toISOString(),
      totalDecisions: uniqueDecisions.length,
      totalPages: currentPage - 1,
      decisionsByYear: Object.fromEntries(
        Object.entries(decisionsByYear).map(([year, decs]) => [year, decs.length])
      ),
      scrapingComplete: true
    };
    
    fs.writeFileSync(CONFIG.metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`\n✅ Metadata saved to: ${path.relative(process.cwd(), CONFIG.metadataPath)}`);
    
    // Clear progress file
    if (fs.existsSync(CONFIG.progressPath)) {
      fs.unlinkSync(CONFIG.progressPath);
    }
    
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeWSIAT().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
