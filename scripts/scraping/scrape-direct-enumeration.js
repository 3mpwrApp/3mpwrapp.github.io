#!/usr/bin/env node
/**
 * Direct ID Enumeration - No Search API Calls Needed!
 * 
 * CanLII case IDs follow predictable patterns:
 * - 2026onwsiat1, 2026onwsiat2, ..., 2026onwsiat1000
 * - 2025onwsiat1, 2025onwsiat2, ..., 2025onwsiat5000
 * 
 * Strategy: Skip search phase entirely, try fetching by ID pattern
 * Savings: 200+ search API calls eliminated
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CANLII_API_KEY = process.env.CANLII_API_KEY;
const CANLII_BASE = "https://api.canlii.org/v1";

// Generate case IDs for a given year and database
function* generateCaseIds(database, year, maxId = 10000) {
  for (let id = 1; id <= maxId; id++) {
    yield `${year}${database}${id}`;
  }
}

// Try fetching a case (returns null if doesn't exist)
async function tryFetchCase(caseId, database) {
  const url = `${CANLII_BASE}/caseBrowse/en/${database}/${caseId}?api_key=${CANLII_API_KEY}`;
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        resolve(null); // Case doesn't exist
        return;
      }
      if (res.statusCode === 429) {
        throw new Error('RATE_LIMITED');
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve(json.html ? json : null);
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Main enumeration function
async function enumerateCases(database, years = [2020, 2021, 2022, 2023, 2024, 2025, 2026]) {
  console.log(`🔢 Enumerating ${database} cases for years: ${years.join(', ')}`);
  
  const found = [];
  let notFoundCount = 0;
  const MAX_404_STREAK = 100; // Stop after 100 consecutive 404s
  
  for (const year of years) {
    console.log(`\n📅 Year ${year}:`);
    notFoundCount = 0;
    
    for (const caseId of generateCaseIds(database, year)) {
      const caseData = await tryFetchCase(caseId, database);
      
      if (caseData) {
        console.log(`  ✅ Found: ${caseId}`);
        found.push({ caseId, data: caseData });
        notFoundCount = 0; // Reset streak
      } else {
        notFoundCount++;
        if (notFoundCount >= MAX_404_STREAK) {
          console.log(`  ⏭️  ${MAX_404_STREAK} consecutive 404s - moving to next year`);
          break;
        }
      }
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  console.log(`\n✅ Found ${found.length} cases total`);
  return found;
}

// Example usage:
// const cases = await enumerateCases('onwsiat', [2020, 2021, 2022, 2023, 2024, 2025, 2026]);

module.exports = { enumerateCases, tryFetchCase, generateCaseIds };
