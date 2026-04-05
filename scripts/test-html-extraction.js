#!/usr/bin/env node
/**
 * Test the fixed HTML extraction from CanLII API
 * Fetches ONE decision to validate the fix works before full re-scrape
 */

const https = require('https');

const CANLII_BASE = "https://api.canlii.org/v1";
const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else if (res.statusCode === 429) {
          reject(new Error(`❌ QUOTA EXCEEDED - API rate limit hit (HTTP 429)`));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function testExtraction() {
  console.log('🧪 Testing HTML extraction fix...\n');
  console.log('🔑 API Key set:', CANLII_API_KEY ? 'YES' : 'NO');
  console.log('🔑 API Key length:', CANLII_API_KEY ? CANLII_API_KEY.length : 0, '\n');
  
  // Test with case: 2026onwsiat88 (from our existing data)
  const caseId = "2026onwsiat88";
  const database = "onwsiat";
  
  const url = `${CANLII_BASE}/caseBrowse/en/${database}/${caseId}?api_key=${CANLII_API_KEY}`;
  
  console.log(`📥 Fetching: ${CANLII_BASE}/caseBrowse/en/${database}/${caseId}?api_key=***\n`);
  
  try {
    const rawData = await httpsGet(url);
    console.log(`✅ API Response received (${rawData.length} bytes)\n`);
    
    // Parse JSON
    const jsonResponse = JSON.parse(rawData);
    console.log('📦 JSON parsed successfully\n');
    console.log('📋 Available fields:', Object.keys(jsonResponse).join(', '), '\n');
    
    // Check for HTML field
    if (jsonResponse.html) {
      const htmlLength = jsonResponse.html.length;
      console.log(`✅ HTML field found: ${htmlLength} bytes\n`);
      console.log('📝 First 500 chars of HTML:\n');
      console.log(jsonResponse.html.substring(0, 500));
      console.log('\n...\n');
      
      // Check if it contains decision text
      const text = jsonResponse.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
      const hasOutcome = /appeal.*?(allowed|dismissed)/i.test(text);
      console.log(`\n🎯 Contains outcome language: ${hasOutcome ? '✅ YES' : '❌ NO'}`);
      console.log(`📏 Text length after tag removal: ${text.length} chars\n`);
      
      if (hasOutcome) {
        const match = text.match(/appeal.*?(allowed|dismissed)/i);
        console.log(`🎉 FOUND: "${match[0]}"`);
      }
    } else {
      console.log('❌ NO HTML FIELD - API response may have changed structure\n');
      console.log('Available data:', JSON.stringify(jsonResponse, null, 2).substring(0, 1000));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('429')) {
      console.log('\n⏰ Quota exhausted. Wait until 8 PM ET (midnight UTC) for reset.');
    }
  }
}

testExtraction();
