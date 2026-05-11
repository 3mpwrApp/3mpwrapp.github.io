#!/usr/bin/env node
/**
 * CanLII API Structure Test
 * Test different API endpoints to find the right structure
 */

const https = require('https');

const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    }).on('error', reject);
  });
}

async function testEndpoint(description, url) {
  console.log(`\n🔍 ${description}`);
  console.log(`URL: ${url.replace(CANLII_API_KEY, '***')}`);
  
  try {
    const { statusCode, data } = await httpsGet(url);
    console.log(`Status: ${statusCode}`);
    
    if (statusCode === 200) {
      const json = JSON.parse(data);
      console.log(`Response keys: ${Object.keys(json).join(', ')}`);
      console.log(`Full response:`, JSON.stringify(json, null, 2).substring(0, 500));
      return json;
    } else {
      console.log(`Error response:`, data.substring(0, 300));
      return null;
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("🔬 CanLII API Structure Discovery");
  console.log("=".repeat(60));
  
  if (CANLII_API_KEY === "YOUR_FREE_API_KEY_HERE") {
    console.log("❌ No API key set!");
    process.exit(1);
  }
  
  // Test 1: List databases endpoint
  await testEndpoint(
    "Test 1: List all databases",
    `https://api.canlii.org/v1/databases?api_key=${CANLII_API_KEY}`
  );
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 2: Legislation endpoint (known to work)
  await testEndpoint(
    "Test 2: Browse legislation",
    `https://api.canlii.org/v1/legislationBrowse/en?api_key=${CANLII_API_KEY}`
  );
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 3: Case browse with different format
  await testEndpoint(
    "Test 3: Browse ONWSIAT cases (minimal params)",
    `https://api.canlii.org/v1/caseBrowse/en/onwsiat?api_key=${CANLII_API_KEY}`
  );
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 4: Try with changedSince parameter (common pattern)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const dateStr = oneYearAgo.toISOString().split('T')[0];
  
  await testEndpoint(
    `Test 4: Browse ONWSIAT with changedSince=${dateStr}`,
    `https://api.canlii.org/v1/caseBrowse/en/onwsiat?api_key=${CANLII_API_KEY}&changedSince=${dateStr}&offset=0&resultCount=5`
  );
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Test 5: Try getting a specific case (if we can find one)
  await testEndpoint(
    "Test 5: Search with broad term",
    `https://api.canlii.org/v1/caseBrowse/en/onca?api_key=${CANLII_API_KEY}&offset=0&resultCount=5&search=disability`
  );
  
  console.log("\n" + "=".repeat(60));
  console.log("💡 Tips:");
  console.log("  - CanLII free API might have limited browse access");
  console.log("  - May require specific case IDs or date ranges");
  console.log("  - Check CanLII documentation: https://www.canlii.org/en/info/api.html");
}

main();
