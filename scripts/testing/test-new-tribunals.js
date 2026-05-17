#!/usr/bin/env node
/**
 * Test New Ontario Tribunal Codes on CanLII
 * 
 * Verifies database codes exist before collection
 */

const https = require('https');

const CANLII_API_KEY = process.env.CANLII_API_KEY;
const tribunals = [
  { code: 'onltb', name: 'Landlord Tenant Board', testCase: '2024onltb1' },
  { code: 'onlat', name: 'License Appeal Tribunal', testCase: '2024onlat1' },
  { code: 'oncfsrb', name: 'Criminal Injuries Compensation Board', testCase: '2024oncfsrb1' },
  { code: 'onhparb', name: 'Health Professions Appeal and Review Board', testCase: '2024onhparb1' },
  { code: 'oncat', name: 'Condominium Authority Tribunal', testCase: '2024oncat1' }
];

async function testDatabase(tribunal) {
  const url = `https://api.canlii.org/v1/caseBrowse/en/${tribunal.code}/${tribunal.testCase}?api_key=${CANLII_API_KEY}`;
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const json = JSON.parse(data);
          resolve({ 
            code: tribunal.code, 
            name: tribunal.name, 
            exists: true, 
            sample: json.title || 'No title' 
          });
        } else if (res.statusCode === 404) {
          resolve({ 
            code: tribunal.code, 
            name: tribunal.name, 
            exists: false, 
            error: 'Database or case not found' 
          });
        } else {
          resolve({ 
            code: tribunal.code, 
            name: tribunal.name, 
            exists: false, 
            error: `HTTP ${res.statusCode}` 
          });
        }
      });
    }).on('error', (err) => {
      resolve({ 
        code: tribunal.code, 
        name: tribunal.name, 
        exists: false, 
        error: err.message 
      });
    });
  });
}

async function testAll() {
  console.log('═══════════════════════════════════════════════');
  console.log('TESTING NEW ONTARIO TRIBUNAL CODES');
  console.log('═══════════════════════════════════════════════\n');
  
  if (!CANLII_API_KEY) {
    console.log('❌ ERROR: CANLII_API_KEY environment variable not set\n');
    process.exit(1);
  }
  
  const results = [];
  
  for (const tribunal of tribunals) {
    console.log(`Testing ${tribunal.code} (${tribunal.name})...`);
    const result = await testDatabase(tribunal);
    results.push(result);
    
    if (result.exists) {
      console.log(`  ✅ EXISTS - Sample: "${result.sample}"`);
    } else {
      console.log(`  ❌ NOT FOUND - ${result.error}`);
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════\n');
  
  const available = results.filter(r => r.exists);
  const unavailable = results.filter(r => !r.exists);
  
  console.log(`✅ Available (${available.length}):`);
  available.forEach(r => console.log(`   - ${r.code}: ${r.name}`));
  
  if (unavailable.length > 0) {
    console.log(`\n❌ Not Available (${unavailable.length}):`);
    unavailable.forEach(r => console.log(`   - ${r.code}: ${r.name} (${r.error})`));
  }
  
  console.log('\n═══════════════════════════════════════════════');
  
  if (available.length > 0) {
    console.log('\n🚀 Ready to collect:');
    available.forEach(r => {
      console.log(`   node scripts/scraping/scrape-direct.js --database=${r.code} --years=2020,2021,2022,2023,2024,2025,2026`);
    });
    console.log();
  }
}

testAll().catch(console.error);
