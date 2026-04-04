#!/usr/bin/env node
/**
 * CanLII API Key Test
 * Quick test to verify your API key is working
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

async function testAPIKey() {
  console.log("🔍 Testing CanLII API Key...\n");
  
  if (CANLII_API_KEY === "YOUR_FREE_API_KEY_HERE") {
    console.log("❌ No API key set!");
    console.log("Run: $env:CANLII_API_KEY = \"your-key-here\"");
    process.exit(1);
  }
  
  console.log(`API Key: ${CANLII_API_KEY.substring(0, 8)}...${CANLII_API_KEY.substring(CANLII_API_KEY.length - 4)}`);
  console.log("Testing endpoint: /caseBrowse/en/onwsiat\n");
  
  const url = `https://api.canlii.org/v1/caseBrowse/en/onwsiat?api_key=${CANLII_API_KEY}&offset=0&resultCount=1`;
  
  try {
    const { statusCode, data } = await httpsGet(url);
    
    console.log(`Status Code: ${statusCode}`);
    
    if (statusCode === 200) {
      const json = JSON.parse(data);
      console.log("\n✅ API KEY WORKS!");
      console.log(`Found ${json.results?.length || 0} results`);
      if (json.results && json.results[0]) {
        console.log(`\nSample case: ${json.results[0].title}`);
        console.log(`Date: ${json.results[0].decisionDate}`);
      }
    } else if (statusCode === 429) {
      console.log("\n⚠️  THROTTLED - API key might be rate limited");
      console.log("This could mean:");
      console.log("  1. API key needs activation time (wait 1-24 hours)");
      console.log("  2. You hit the rate limit");
      console.log("  3. Free tier has very low limits");
      console.log("\nResponse:", data);
    } else if (statusCode === 403 || statusCode === 401) {
      console.log("\n❌ AUTHENTICATION ERROR");
      console.log("API key might be invalid or not activated yet");
      console.log("\nResponse:", data);
    } else {
      console.log(`\n⚠️  Unexpected status: ${statusCode}`);
      console.log("Response:", data);
    }
    
  } catch (error) {
    console.log("\n❌ ERROR:", error.message);
  }
}

testAPIKey();
