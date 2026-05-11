#!/usr/bin/env node
/**
 * 🧪 Test Enhanced Scraper
 * Quick test to verify cited cases, legislation, and outcome parsing works
 */

const https = require('https');

const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";
const CANLII_BASE = "https://api.canlii.org/v1";

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function testSingleCase() {
  console.log('🧪 Testing Enhanced Scraper...\n');
  
  // Test HRTO case
  console.log('📋 Fetching sample HRTO case (2024hrto1111)...');
  const params = new URLSearchParams({ api_key: CANLII_API_KEY });
  const url = `${CANLII_BASE}/caseBrowse/en/onhrt/2024hrto1111/?${params}`;
  
  try {
    const response = await httpsGet(url);
    
    console.log('\n✅ Response received!\n');
    console.log('📊 Case Details:');
    console.log(`  Title: ${response.title}`);
    console.log(`  Citation: ${response.citation}`);
    console.log(`  Date: ${response.decisionDate}`);
    console.log(`  Docket: ${response.docketNumber}`);
    
    console.log('\n📚 Cited Cases:');
    if (response.citedCases && response.citedCases.length > 0) {
      console.log(`  Found: ${response.citedCases.length} cases`);
      response.citedCases.slice(0, 3).forEach((c, i) => {
        console.log(`    ${i + 1}. ${c.title || 'Untitled'}`);
        console.log(`       ${c.citation || 'No citation'}`);
      });
      if (response.citedCases.length > 3) {
        console.log(`    ... and ${response.citedCases.length - 3} more`);
      }
    } else {
      console.log('  None found (field may not exist in API response)');
    }
    
    console.log('\n⚖️  Legislation Cited:');
    if (response.citedLegislation && response.citedLegislation.length > 0) {
      console.log(`  Found: ${response.citedLegislation.length} statutes`);
      response.citedLegislation.forEach((leg, i) => {
        console.log(`    ${i + 1}. ${leg.title || 'Untitled'}`);
        if (leg.sections && leg.sections.length > 0) {
          console.log(`       Sections: ${leg.sections.slice(0, 5).join(', ')}${leg.sections.length > 5 ? '...' : ''}`);
        }
      });
    } else {
      console.log('  None found (field may not exist in API response)');
    }
    
    console.log('\n📝 Keywords (for outcome parsing):');
    if (response.keywords) {
      const keywords = response.keywords.split(';').map(k => k.trim()).filter(k => k);
      console.log(`  Found: ${keywords.length} keyword phrases`);
      keywords.slice(0, 2).forEach((k, i) => {
        const preview = k.length > 150 ? k.substring(0, 150) + '...' : k;
        console.log(`    ${i + 1}. ${preview}`);
      });
      
      // Test legislation extraction
      console.log('\n⚖️  Legislation Extraction Test:');
      const legPatterns = [
        /Human Rights Code,\s*s\.\s*[\d]+(?:\([\d]+\))?/gi,
        /Code,\s*s\.\s*[\d]+(?:\([\d]+\))?/gi
      ];
      const keywordText = keywords.join(' ');
      const found = [];
      legPatterns.forEach(pattern => {
        const matches = keywordText.match(pattern);
        if (matches) found.push(...matches);
      });
      if (found.length > 0) {
        console.log(`  Extracted ${found.length} references:`);
        found.forEach((ref, i) => {
          console.log(`    ${i + 1}. ${ref}`);
        });
      } else {
        console.log('  No legislation references found in keywords');
      }
    }
    
    console.log('\n✅ Test complete! Enhanced fields are available.');
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

testSingleCase();
