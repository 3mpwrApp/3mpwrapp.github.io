#!/usr/bin/env node
/**
 * CanLII Scraper - Direct Enumeration Mode (Quota-Friendly)
 * 
 * Uses direct case ID enumeration instead of search API
 * Saves 90% of API quota by skipping discovery phase
 * 
 * Usage:
 *   node scrape-direct.js --database=onwsiat --years=2024,2025,2026
 */

const https = require('https');
const fs = require('path');
const path = require('path');

// Import existing scraper functions
const enhancedScraper = require('./scrape-canlii-tribunals-v5-enhanced.js');

const CANLII_API_KEY = process.env.CANLII_API_KEY;
const CANLII_BASE = "https://api.canlii.org/v1";
const OUTPUT_DIR = path.join(__dirname, '../data/tribunal-decisions');

// Parse command line args
const args = process.argv.slice(2);
const database = args.find(a => a.startsWith('--database='))?.split('=')[1] || 'onwsiat';
const yearsArg = args.find(a => a.startsWith('--years='))?.split('=')[1];
const years = yearsArg ? yearsArg.split(',').map(Number) : [2024, 2025, 2026];

console.log('🎯 Direct Enumeration Mode');
console.log(`   Database: ${database}`);
console.log(`   Years: ${years.join(', ')}\n`);

// Load existing case IDs to skip
const existingIds = new Set();
try {
  const files = fs.readdirSync(OUTPUT_DIR);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const data = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf8'));
    const cases = Array.isArray(data) ? data : data.decisions || [];
    cases.forEach(c => c.case_id && existingIds.add(c.case_id));
  }
  console.log(`✅ Loaded ${existingIds.size} existing cases (will skip)\n`);
} catch (e) {
  console.log('ℹ️  No existing data found\n');
}

// Main collection
async function collectByEnumeration() {
  const collected = [];
  let apiCalls = 0;
  let skipped = 0;
  
  for (const year of years) {
    console.log(`\n📅 Collecting ${year} cases...\n`);
    
    let consecutive404s = 0;
    const MAX_404_STREAK = 50; // Stop after 50 consecutive misses
    
    for (let id = 1; id <= 5000; id++) {
      const caseId = `${year}${database}${id}`;
      
      // Skip if we already have it
      if (existingIds.has(caseId)) {
        skipped++;
        if (id % 100 === 0) process.stdout.write('.');
        continue;
      }
      
      try {
        const url = `${CANLII_BASE}/caseBrowse/en/${database}/${caseId}?api_key=${CANLII_API_KEY}`;
        apiCalls++;
        
        const response = await new Promise((resolve, reject) => {
          https.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              if (res.statusCode === 200) resolve(JSON.parse(data));
              else if (res.statusCode === 404) resolve(null);
              else if (res.statusCode === 429) reject(new Error('QUOTA_HIT'));
              else resolve(null);
            });
          }).on('error', reject);
        });
        
        if (response && response.html) {
          console.log(`  ✅ ${caseId}`);
          collected.push({ caseId, ...response });
          consecutive404s = 0;
        } else {
          consecutive404s++;
          if (consecutive404s >= MAX_404_STREAK) {
            console.log(`\n  ⏭️  ${MAX_404_STREAK} consecutive 404s - moving to next year\n`);
            break;
          }
          if (id % 100 === 0) process.stdout.write('x');
        }
        
        // Rate limiting
        await new Promise(r => setTimeout(r, 1000));
        
      } catch (error) {
        if (error.message === 'QUOTA_HIT') {
          console.log(`\n\n❌ API quota hit after ${apiCalls} calls`);
          console.log(`✅ Collected ${collected.length} new cases`);
          console.log(`⏭️  Skipped ${skipped} existing cases\n`);
          
          // Save what we have
          if (collected.length > 0) {
            const filename = `${database}-direct-${new Date().toISOString().split('T')[0]}.json`;
            fs.writeFileSync(
              path.join(OUTPUT_DIR, filename),
              JSON.stringify(collected, null, 2)
            );
            console.log(`💾 Saved to: ${filename}\n`);
          }
          
          return;
        }
      }
    }
  }
  
  console.log(`\n\n✅ Collection complete!`);
  console.log(`   API calls: ${apiCalls}`);
  console.log(`   New cases: ${collected.length}`);
  console.log(`   Skipped: ${skipped}\n`);
  
  if (collected.length > 0) {
    const filename = `${database}-direct-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(
      path.join(OUTPUT_DIR, filename),
      JSON.stringify(collected, null, 2)
    );
    console.log(`💾 Saved to: ${filename}\n`);
  }
}

collectByEnumeration().catch(console.error);
