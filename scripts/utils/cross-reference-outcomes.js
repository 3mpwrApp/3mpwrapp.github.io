#!/usr/bin/env node
/**
 * Cross-Reference Tribunal Decisions with Official Databases
 * 
 * Searches official tribunal websites to extract outcomes for CanLII decisions.
 * Each tribunal has different search interfaces and outcome formats.
 * 
 * SUPPORTED TRIBUNALS:
 * - WSIAT: https://www.wsiat.ca/en/decisionSearch/decisionSearch.asp
 * - HRTO: https://www.canlii.org/en/on/onhrt/ (CanLII has better data than official)
 * - WSIB: https://www.canlii.org/en/on/onwsib/ (limited official data)
 * - ONSBT: https://www.canlii.org/en/on/onsbt/ (no official search, CanLII only)
 * 
 * STRATEGY:
 * 1. Read CanLII decision file (with decision numbers/citations)
 * 2. For each decision, search official tribunal database
 * 3. Extract outcome from search results (Appeal Allowed/Dismissed/etc.)
 * 4. Match back to CanLII data
 * 5. Save enriched file with outcomes
 * 
 * Usage:
 *   node scripts/cross-reference-outcomes.js --tribunal=wsiat
 *   node scripts/cross-reference-outcomes.js --tribunal=hrto --limit=100
 *   node scripts/cross-reference-outcomes.js --all
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const OUTPUT_SUFFIX = '-cross-referenced';
const ARGS = process.argv.slice(2);
const TRIBUNAL = ARGS.find(arg => arg.startsWith('--tribunal='))?.split('=')[1];
const LIMIT = parseInt(ARGS.find(arg => arg.startsWith('--limit='))?.split('=')[1]) || null;
const ALL = ARGS.includes('--all');

// Rate limiting (be respectful!)
const DELAY_BETWEEN_SEARCHES = 2000; // 2 seconds
const MAX_RETRIES = 3;

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * WSIAT Cross-Reference
 * Official database: https://www.wsiat.ca/en/decisionSearch/decisionSearch.asp
 */
async function crossReferenceWSIAT(decisions, browser) {
  console.log('\n🔍 WSIAT Cross-Reference Starting...\n');
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  let found = 0;
  let notFound = 0;
  let errors = 0;
  
  const limit = LIMIT || decisions.length;
  
  for (let i = 0; i < Math.min(limit, decisions.length); i++) {
    const originalDecision = decisions[i];
    
    // Handle nested data structure (decision.data.title vs decision.title)
    const decision = originalDecision.data ? originalDecision.data : originalDecision;
    
    // Extract decision number from title or citation
    // e.g., "Decision No. 456/19" or "2019 ONWSIAT 1234"
    let decisionNumber = null;
    
    if (decision.title && decision.title.includes('Decision No.')) {
      decisionNumber = decision.title.match(/Decision No\. ([\d\/]+)/i)?.[1];
    } else if (decision.docketNumber) {
      decisionNumber = decision.docketNumber;
    } else if (decision.citation) {
      // Try extracting from citation: "2019 ONWSIAT 1234"
      decisionNumber = decision.citation.match(/ONWSIAT (\d+)/i)?.[1];
    }
    
    if (!decisionNumber) {
      console.log(`⚠️  [${i+1}/${limit}] No decision number found: ${decision.caseId || decision.case_id}`);
      notFound++;
      continue;
    }
    
    try {
      console.log(`🔎 [${i+1}/${limit}] Searching WSIAT: ${decisionNumber}`);
      
      // Navigate to search page
      await page.goto('https://www.wsiat.ca/en/decisionSearch/decisionSearch.asp', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      
      // Fill in decision number search - field is labeled "Decision #:"
      // Try to find input by selecting first text input field in the form
      const inputFields = await page.$$('input[type="text"]');
      if (inputFields.length > 0) {
        await inputFields[0].type(decisionNumber);
      } else {
        throw new Error('Could not find Decision # input field');
      }
      
      // Submit search
      await page.click('input[type="submit"]');
      await sleep(1000);
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
      
      // Extract outcome from results page
      const outcome = await page.evaluate(() => {
        // Look for outcome indicators in the results table
        const text = document.body.innerText.toLowerCase();
        
        if (text.includes('appeal allowed') || text.includes('appeal is allowed')) {
          return 'Worker Won';
        }
        if (text.includes('appeal dismissed') || text.includes('appeal is dismissed')) {
          return 'Worker Lost';
        }
        if (text.includes('partially allowed') || text.includes('allowed in part')) {
          return 'Partial Win';
        }
        if (text.includes('remitted') || text.includes('sent back')) {
          return 'Remanded';
        }
        if (text.includes('no results found')) {
          return null; // Not found in official database
        }
        
        return 'Unknown';
      });
      
      if (outcome && outcome !== 'Unknown') {
        // Save outcome to the correct location (nested or flat)
        const targetDecision = originalDecision.data ? originalDecision.data : originalDecision;
        targetDecision.outcome = outcome;
        targetDecision.outcome_method = 'wsiat_official';
        targetDecision.outcome_confidence = 'official';
        found++;
        console.log(`   ✅ Found: ${outcome}`);
      } else if (outcome === null) {
        notFound++;
        console.log(`   ⚠️  Not found in WSIAT database`);
      } else {
        notFound++;
        console.log(`   ⚠️  Outcome unclear`);
      }
      
      await sleep(DELAY_BETWEEN_SEARCHES);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      errors++;
      
      // Take screenshot on error (debugging)
      try {
        await page.screenshot({ path: `debug-wsiat-${decisionNumber}.png` });
      } catch {}
    }
  }
  
  await page.close();
  
  console.log(`\n📊 WSIAT Cross-Reference Complete:`);
  console.log(`   Found outcomes: ${found}`);
  console.log(`   Not found: ${notFound}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Success rate: ${((found/(found+notFound+errors))*100).toFixed(1)}%`);
  
  return decisions;
}

/**
 * HRTO Cross-Reference
 * Note: HRTO official site has limited search, CanLII is better source
 */
async function crossReferenceHRTO(decisions, browser) {
  console.log('\n🔍 HRTO Cross-Reference Starting...\n');
  console.log('Note: HRTO official database has limited outcome data.');
  console.log('CanLII keywords are the best source for HRTO outcomes.\n');
  
  // For HRTO, we'll use CanLII's own search since it's more comprehensive
  const page = await browser.newPage();
  
  let found = 0;
  let notFound = 0;
  
  const limit = LIMIT || decisions.length;
  
  for (let i = 0; i < Math.min(limit, decisions.length); i++) {
    const decision = decisions[i];
    
    // Extract from existing CanLII data (keywords field often has outcome hints)
    const keywords = (decision.keywords || '').toLowerCase();
    
    if (keywords.includes('entitled') || keywords.includes('allowed')) {
      decision.outcome = 'Worker Won';
      decision.outcome_method = 'canlii_keywords';
      decision.outcome_confidence = 'medium';
      found++;
      console.log(`✅ [${i+1}/${limit}] ${decision.case_id}: Worker Won (from keywords)`);
    } else if (keywords.includes('not entitled') || keywords.includes('dismissed')) {
      decision.outcome = 'Worker Lost';
      decision.outcome_method = 'canlii_keywords';
      decision.outcome_confidence = 'medium';
      found++;
      console.log(`✅ [${i+1}/${limit}] ${decision.case_id}: Worker Lost (from keywords)`);
    } else {
      notFound++;
      if (i % 100 === 0) {
        console.log(`⚠️  [${i+1}/${limit}] No outcome detected in keywords`);
      }
    }
  }
  
  await page.close();
  
  console.log(`\n📊 HRTO Cross-Reference Complete:`);
  console.log(`   Found outcomes: ${found}`);
  console.log(`   Not found: ${notFound}`);
  console.log(`   Success rate: ${((found/(found+notFound))*100).toFixed(1)}%`);
  
  return decisions;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 TRIBUNAL OUTCOME CROSS-REFERENCE\n');
  console.log('='.repeat(60));
  
  if (!TRIBUNAL && !ALL) {
    console.log('❌ Error: Must specify --tribunal=<name> or --all');
    console.log('\nUsage:');
    console.log('  node scripts/cross-reference-outcomes.js --tribunal=wsiat');
    console.log('  node scripts/cross-reference-outcomes.js --tribunal=hrto');
    console.log('  node scripts/cross-reference-outcomes.js --all');
    console.log('  node scripts/cross-reference-outcomes.js --tribunal=wsiat --limit=100');
    process.exit(1);
  }
  
  const tribunals = ALL ? ['wsiat', 'hrto', 'wsib', 'onsbt'] : [TRIBUNAL];
  
  console.log(`\n📋 Processing tribunals: ${tribunals.join(', ')}`);
  if (LIMIT) {
    console.log(`⏱️  Limit: ${LIMIT} decisions per tribunal`);
  }
  console.log('');
  
  // Launch browser once for all tribunals
  console.log('🚀 Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  for (const tribunal of tribunals) {
    console.log('\n' + '='.repeat(60));
    console.log(`Processing: ${tribunal.toUpperCase()}`);
    console.log('='.repeat(60));
    
    // Find decision files for this tribunal
    // Note: Ontario tribunals have "on" prefix (e.g., "onwsiat", "onhrt")
    const files = fs.readdirSync(DATA_DIR)
      .filter(f => (f.startsWith(tribunal) || f.startsWith('on' + tribunal)) && f.endsWith('.json') && !f.includes(OUTPUT_SUFFIX))
      .filter(f => {
        const filePath = path.join(DATA_DIR, f);
        const size = fs.statSync(filePath).size;
        return size > 1000; // At least 1KB
      });
    
    if (files.length === 0) {
      console.log(`⚠️  No files found for ${tribunal}`);
      continue;
    }
    
    console.log(`Found ${files.length} files for ${tribunal}\n`);
    
    for (const file of files) {
      const filePath = path.join(DATA_DIR, file);
      console.log(`📂 Loading: ${file}`);
      
      const rawData = fs.readFileSync(filePath, 'utf-8');
      let decisions;
      let originalStructure;
      
      try {
        const parsed = JSON.parse(rawData);
        originalStructure = parsed;
        decisions = Array.isArray(parsed) ? parsed : (parsed.decisions || parsed.data || []);
      } catch (error) {
        console.log(`   ❌ Error parsing: ${error.message}`);
        continue;
      }
      
      if (decisions.length === 0) {
        console.log(`   ⚠️  No decisions found in file`);
        continue;
      }
      
      console.log(`   Total decisions: ${decisions.length}`);
      
      // Cross-reference based on tribunal
      let enrichedDecisions;
      if (tribunal === 'wsiat') {
        enrichedDecisions = await crossReferenceWSIAT(decisions, browser);
      } else if (tribunal === 'hrto') {
        enrichedDecisions = await crossReferenceHRTO(decisions, browser);
      } else {
        console.log(`   ⚠️  Cross-reference not yet implemented for ${tribunal}`);
        enrichedDecisions = decisions;
      }
      
      // Save enriched file (preserve original structure)
      const outputPath = filePath.replace('.json', `${OUTPUT_SUFFIX}.json`);
      let outputData;
      if (Array.isArray(originalStructure)) {
        outputData = enrichedDecisions;
      } else if (originalStructure.decisions) {
        outputData = { ...originalStructure, decisions: enrichedDecisions };
      } else {
        outputData = { decisions: enrichedDecisions, Count: enrichedDecisions.length };
      }
      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
      console.log(`\n💾 Saved: ${path.basename(outputPath)}`);
    }
  }
  
  await browser.close();
  console.log('\n✅ CROSS-REFERENCE COMPLETE!\n');
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
