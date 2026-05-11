#!/usr/bin/env node

/**
 * Test WSIAT scraper - simplified version to verify Playwright works
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Starting WSIAT scraper test...\n');

async function testScraper() {
  console.log('1️⃣ Launching browser (visible window)...');
  
  const browser = await chromium.launch({
    headless: false,  // Show browser window
    slowMo: 500       // Slow down for visibility
  });
  
  console.log('✅ Browser launched!\n');
  
  const page = await browser.newPage();
  console.log('2️⃣ Opening WSIAT decision search page...');
  
  await page.goto('https://www.wsiat.ca/en/decisionSearch/decisionSearch.asp', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  console.log('✅ Page loaded!\n');
  console.log('3️⃣ Waiting 5 seconds for you to see the page...');
  await page.waitForTimeout(5000);
  
  console.log('4️⃣ Looking for search form...');
  
  // The WSIAT site has a search form that might need to be visible
  // Let's use JavaScript to submit the form directly
  console.log('5️⃣ Submitting search form directly (JavaScript approach)...');
  
  await page.evaluate(() => {
    // Find all forms on the page
    const forms = document.querySelectorAll('form');
    console.log('Found', forms.length, 'forms');
    
    // Submit the first form (main search form)
    if (forms.length > 0) {
      // Try to find a form with search-related attributes
      for (const form of forms) {
        if (form.action.includes('search') || form.querySelector('[name*="search"]')) {
          form.submit();
          return true;
        }
      }
      // Fallback: submit first form
      forms[0].submit();
      return true;
    }
    return false;
  });
  
  console.log('✅ Form submitted!');
    
    console.log('⏳ Waiting for results to load (Swiftype search engine)...');
    
    // Wait for Swiftype results to appear
    try {
      await page.waitForSelector('.st-result, [data-result-id], .st-ui-type-heading', { 
        timeout: 15000 
      });
      console.log('✅ Results loaded!');
    } catch (e) {
      console.log('⚠️  Timeout waiting for .st-result - trying to continue anyway');
    }
    
    await page.waitForTimeout(3000);
    
    console.log('6️⃣ Looking for results...');
    
    // Try to find result count
    const pageText = await page.evaluate(() => document.body.innerText);
    const countMatch = pageText.match(/of\s+([\d,]+)\s+decision/i);
    
    if (countMatch) {
      console.log(`✅ Found ${countMatch[1]} decisions!\n`);
    } else {
      console.log('⚠️  Could not find result count\n');
    }
    
    // Try to extract some decisions
    console.log('7️⃣ Extracting decisions from first page...');
    
    const decisions = await page.evaluate(() => {
      const results = [];
      const text = document.body.innerText;
      const pattern = /(\d+)\/(\d+)([A-Z]*)/g;
      let match;
      
      while ((match = pattern.exec(text)) !== null) {
        results.push(`${match[1]}/${match[2]}${match[3] || ''}`);
      }
      
      return results;
    });
    
    console.log(`✅ Extracted ${decisions.length} decision numbers from first page:`);
    console.log(`   ${decisions.slice(0, 10).join(', ')}${decisions.length > 10 ? '...' : ''}\n`);
    
    // Scroll down to find pagination
    console.log('8️⃣ Scrolling down to find pagination...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    // Look for Next button with multiple selectors
    console.log('9️⃣ Looking for Next button...');
    const selectors = ['.st-next', 'a.st-next', 'button:has-text("Next")', 'a:has-text("Next")'];
    let nextFound = false;
    
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`   ✅ Found ${count} "Next" button(s) with selector: ${selector}`);
        nextFound = true;
        break;
      }
    }
    
    if (nextFound) {
      console.log('   ✅ Pagination found - full scraper should work!\n');
    } else {
      console.log('   ⚠️  No Next button found - checking page HTML...\n');
      
      // Get pagination HTML for debugging
      const paginationHTML = await page.evaluate(() => {
        const pagination = document.querySelector('.st-pagination, [class*="pagination"]');
        return pagination ? pagination.outerHTML : 'No pagination element found';
      });
      console.log('Pagination HTML:', paginationHTML.substring(0, 500));
    }
  
  console.log('\n🔟 Keeping browser open for 10 seconds so you can see it...');
  await page.waitForTimeout(10000);
  
  console.log('1️⃣1️⃣ Closing browser...');
  await browser.close();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST COMPLETE!');
  console.log('='.repeat(60));
  console.log('\nIf you saw a browser window and results, the scraper should work!');
  console.log('Run: npm run wsiat:scrape\n');
}

testScraper().catch(error => {
  console.error('\n❌ ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
});
