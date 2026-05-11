#!/usr/bin/env node
/**
 * 🔍 CanLII API PARAMETER TESTER
 * Tests different parameters to see if HTML content can be retrieved
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 19, 2026
 */

const https = require('https');

const CANLII_BASE = "https://api.canlii.org/v1";
const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";
const TEST_CASE = "2026hrto550";
const TEST_DB = "onhrt";

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing: ${url.substring(0, 100)}...`);
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ success: true, data: parsed, size: data.length });
        } catch (e) {
          resolve({ success: false, raw: data, error: e.message });
        }
      });
    }).on('error', reject);
  });
}

async function testParams(name, extraParams) {
  console.log('\n' + '='.repeat(80));
  console.log(`Testing: ${name}`);
  console.log('='.repeat(80));
  
  const params = new URLSearchParams({ 
    api_key: CANLII_API_KEY,
    ...extraParams
  });
  const url = `${CANLII_BASE}/caseBrowse/en/${TEST_DB}/${TEST_CASE}/?${params}`;
  
  try {
    const result = await httpsGet(url);
    
    if (result.success) {
      const fields = Object.keys(result.data);
      console.log(`✅ Response size: ${result.size} bytes`);
      console.log(`📋 Fields: ${fields.join(', ')}`);
      
      // Check for new fields with these params
      const newFields = fields.filter(f => 
        f.toLowerCase().includes('html') || 
        f.toLowerCase().includes('content') ||
        f.toLowerCase().includes('text') ||
        f.toLowerCase().includes('body') ||
        f.toLowerCase().includes('decision')
      );
      
      if (newFields.length > 0) {
        console.log(`🎯 CONTENT FIELDS:`, newFields);
        newFields.forEach(field => {
          const value = result.data[field];
          if (typeof value === 'string' && value.length > 100) {
            console.log(`   ✅ ${field}: ${value.length} chars - MIGHT BE HTML!`);
            console.log(`      Preview: ${value.substring(0, 150)}...`);
          }
        });
      }
      
      // Show full keywords field to see how much text it contains
      if (result.data.keywords) {
        console.log(`\n📝 Full keywords field (${result.data.keywords.length} chars):`);
        console.log(result.data.keywords.substring(0, 500) + '...');
      }
      
    } else {
      console.log(`❌ FAILED: ${result.error}`);
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}

async function main() {
  console.log('█'.repeat(80));
  console.log('🔍 CanLII API PARAMETER TESTER');
  console.log(`Test Case: ${TEST_CASE} (${TEST_DB})`);
  console.log('█'.repeat(80));
  
  const paramTests = [
    { name: "Default (no extra params)", params: {} },
    { name: "format=html", params: { format: 'html' } },
    { name: "format=json", params: { format: 'json' } },
    { name: "includeContent=true", params: { includeContent: 'true' } },
    { name: "includeContent=1", params: { includeContent: '1' } },
    { name: "fullText=true", params: { fullText: 'true' } },
    { name: "html=true", params: { html: 'true' } },
    { name: "content=true", params: { content: 'true' } },
    { name: "expand=all", params: { expand: 'all' } },
    { name: "expand=content", params: { expand: 'content' } },
    { name: "lang=en (explicit)", params: { lang: 'en' } }
  ];
  
  for (const test of paramTests) {
    await testParams(test.name, test.params);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
  }
  
  console.log('\n' + '█'.repeat(80));
  console.log('✅ PARAMETER TESTING COMPLETE');
  console.log('█'.repeat(80));
  console.log('\n💡 CONCLUSION:');
  console.log('If all tests returned same fields → CanLII free tier has no HTML');
  console.log('If any test showed content → that parameter unlocks HTML!');
}

main().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
