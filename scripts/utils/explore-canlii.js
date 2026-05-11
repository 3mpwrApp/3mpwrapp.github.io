#!/usr/bin/env node
/**
 * CanLII Database Explorer
 * Find what's actually available in the databases
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

async function exploreDatabase(dbName, dbLabel) {
  console.log(`\n📊 Testing: ${dbLabel} (${dbName})`);
  console.log("=".repeat(60));
  
  // Try without search first - just browse
  const browseUrl = `https://api.canlii.org/v1/caseBrowse/en/${dbName}?api_key=${CANLII_API_KEY}&offset=0&resultCount=5`;
  
  try {
    const { statusCode, data } = await httpsGet(browseUrl);
    
    if (statusCode === 200) {
      const json = JSON.parse(data);
      console.log(`✅ Status: ${statusCode}`);
      console.log(`📄 Total results available: ${json.totalResults || '?'}`);
      console.log(`📋 Returned in this batch: ${json.results?.length || 0}`);
      
      if (json.results && json.results.length > 0) {
        console.log("\n🎯 Sample cases:");
        json.results.slice(0, 3).forEach((c, i) => {
          console.log(`  ${i+1}. ${c.title || 'Untitled'}`);
          console.log(`     Date: ${c.decisionDate || 'Unknown'}`);
          console.log(`     ID: ${c.caseId?.en || 'No ID'}`);
        });
        return true;
      } else {
        console.log("⚠️  No results returned");
        return false;
      }
    } else {
      console.log(`❌ Status: ${statusCode}`);
      console.log(`Response: ${data.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🔍 CanLII Database Explorer");
  console.log("=".repeat(60));
  
  if (CANLII_API_KEY === "YOUR_FREE_API_KEY_HERE") {
    console.log("❌ No API key set!");
    process.exit(1);
  }
  
  const databases = [
    { name: "onwsiat", label: "WSIAT (Ontario)" },
    { name: "sst", label: "Social Security Tribunal" },
    { name: "onhrt", label: "Human Rights Tribunal Ontario" },
    { name: "onca", label: "Ontario Court of Appeal" },
    { name: "onsc", label: "Ontario Superior Court" },
    { name: "skca", label: "Saskatchewan Court of Appeal" }
  ];
  
  const workingDatabases = [];
  
  for (const db of databases) {
    const works = await exploreDatabase(db.name, db.label);
    if (works) workingDatabases.push(db);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Working databases: ${workingDatabases.length}`);
  workingDatabases.forEach(db => {
    console.log(`  - ${db.label} (${db.name})`);
  });
  
  if (workingDatabases.length === 0) {
    console.log("\n⚠️  No databases returned results!");
    console.log("This could mean:");
    console.log("  1. Database names are wrong");
    console.log("  2. API requires different parameters");
    console.log("  3. Free tier has very limited access");
  } else {
    console.log("\n✅ Ready to scrape these databases!");
  }
}

main();
