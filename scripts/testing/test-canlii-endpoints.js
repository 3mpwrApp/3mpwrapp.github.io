#!/usr/bin/env node
/**
 * 🔍 CanLII API ENDPOINT TESTER
 * Tests different CanLII API endpoints to find which one returns HTML
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 19, 2026
 */

const https = require('https');

const CANLII_BASE = "https://api.canlii.org/v1";
const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";
const TEST_CASE = "2026hrto550"; // A recent HRTO case
const TEST_DB = "onhrt";

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing: ${url}`);
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ success: true, data: parsed, raw: data });
        } catch (e) {
          // Might be HTML or plain text
          resolve({ success: false, raw: data, error: e.message });
        }
      });
    }).on('error', reject);
  });
}

async function testEndpoint(name, urlPath) {
  console.log('\n' + '='.repeat(80));
  console.log(`Testing: ${name}`);
  console.log('='.repeat(80));
  
  const params = new URLSearchParams({ api_key: CANLII_API_KEY });
  const url = `${CANLII_BASE}${urlPath}?${params}`;
  
  try {
    const result = await httpsGet(url);
    
    if (result.success) {
      const fields = Object.keys(result.data);
      console.log(`✅ SUCCESS - JSON Response`);
      console.log(`📋 Fields (${fields.length}): ${fields.join(', ')}`);
      
      // Check for HTML-like fields
      const htmlFields = fields.filter(f => 
        f.toLowerCase().includes('html') || 
        f.toLowerCase().includes('content') ||
        f.toLowerCase().includes('text') ||
        f.toLowerCase().includes('body')
      );
      
      if (htmlFields.length > 0) {
        console.log(`🎯 POSSIBLE HTML FIELDS:`, htmlFields);
        htmlFields.forEach(field => {
          const value = result.data[field];
          if (typeof value === 'string') {
            console.log(`   - ${field}: ${value.length} chars`);
            console.log(`     Preview: ${value.substring(0, 100)}...`);
          } else {
            console.log(`   - ${field}: ${typeof value}`);
          }
        });
      } else {
        console.log(`❌ No HTML/content fields found`);
      }
      
      // Show a sample of the data
      console.log(`\n📄 Sample data:`);
      console.log(JSON.stringify(result.data, null, 2).substring(0, 500) + '...');
      
    } else {
      console.log(`❌ FAILED - Not JSON`);
      console.log(`Response preview: ${result.raw.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}

async function main() {
  console.log('█'.repeat(80));
  console.log('🔍 CanLII API ENDPOINT TESTER');
  console.log(`Test Case: ${TEST_CASE} (${TEST_DB})`);
  console.log(`API Key: ${CANLII_API_KEY.substring(0, 10)}...`);
  console.log('█'.repeat(80));
  
  // Test different endpoint patterns
  const endpoints = [
    {
      name: "caseBrowse (current - metadata only)",
      path: `/caseBrowse/en/${TEST_DB}/${TEST_CASE}/`
    },
    {
      name: "Direct case path (might have full content)",
      path: `/en/${TEST_DB}/${TEST_CASE}/`
    },
    {
      name: "caseCitator (might have citations + text)",
      path: `/caseCitator/en/${TEST_DB}/${TEST_CASE}/`
    },
    {
      name: "caseBrowse without trailing slash",
      path: `/caseBrowse/en/${TEST_DB}/${TEST_CASE}`
    },
    {
      name: "Direct path without trailing slash",
      path: `/en/${TEST_DB}/${TEST_CASE}`
    }
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint.name, endpoint.path);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay between tests
  }
  
  console.log('\n' + '█'.repeat(80));
  console.log('✅ ENDPOINT TESTING COMPLETE');
  console.log('█'.repeat(80));
  console.log('\n💡 Look for endpoints that returned HTML/content fields above');
}

main().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
