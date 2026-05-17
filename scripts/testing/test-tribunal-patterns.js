/**
 * Test different CanLII case ID patterns for ONLTB, ONCAT, ONCICB
 * Based on: https://www.canlii.org/on/{database}
 */

const https = require('https');

const API_KEY = process.env.CANLII_API_KEY;
const API_BASE = 'https://api.canlii.org/v1';

// Common CanLII case ID patterns we've seen:
// - {year}canlii{database}{sequential} (e.g., 2024canliionca123)
// - {database}{year}canlii{sequential} (e.g., onca2024canlii123)
// - {database}{sequential} (e.g., onsbt123)

const tribunals = [
  {
    name: 'ONLTB (Landlord Tenant Board)',
    db: 'onltb',
    patterns: [
      // Pattern 1: {year}canlii{db}{seq}
      (year, seq) => `${year}canliionltb${seq}`,
      // Pattern 2: {db}{year}canlii{seq}
      (year, seq) => `onltb${year}canlii${seq}`,
      // Pattern 3: {db}{seq}
      (year, seq) => `onltb${seq}`,
      // Pattern 4: {db}-{year}-{seq}
      (year, seq) => `onltb-${year}-${seq}`,
      // Pattern 5: {year}{db}{seq} (compact)
      (year, seq) => `${year}onltb${seq}`
    ]
  },
  {
    name: 'ONCAT (Condominium Authority Tribunal)',
    db: 'oncat',
    patterns: [
      (year, seq) => `${year}canliioncat${seq}`,
      (year, seq) => `oncat${year}canlii${seq}`,
      (year, seq) => `oncat${seq}`,
      (year, seq) => `oncat-${year}-${seq}`,
      (year, seq) => `${year}oncat${seq}`
    ]
  },
  {
    name: 'ONCICB (Criminal Injuries Compensation Board)',
    db: 'oncicb',
    patterns: [
      (year, seq) => `${year}canlioncicb${seq}`,
      (year, seq) => `oncicb${year}canlii${seq}`,
      (year, seq) => `oncicb${seq}`,
      (year, seq) => `oncicb-${year}-${seq}`,
      (year, seq) => `${year}oncicb${seq}`
    ]
  }
];

function fetchCase(databaseId, caseId) {
  return new Promise((resolve) => {
    const url = `${API_BASE}/caseBrowse/en/${databaseId}/${caseId}/?api_key=${API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve({ success: true, data: json });
          } catch (err) {
            resolve({ success: false, error: 'Parse error' });
          }
        } else if (res.statusCode === 404) {
          resolve({ success: false, error: '404' });
        } else if (res.statusCode === 429) {
          resolve({ success: false, error: '429 Rate limit' });
        } else {
          resolve({ success: false, error: `HTTP ${res.statusCode}` });
        }
      });
    }).on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}

async function testTribunal(tribunal) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📋 Testing: ${tribunal.name}`);
  console.log(`Database: ${tribunal.db}`);
  console.log(`${'='.repeat(50)}\n`);
  
  const years = [2024, 2023, 2022, 2021, 2020];
  const sequences = [1, 2, 3, 5, 10, 100, 1000];
  
  let foundPattern = null;
  
  for (let patternIdx = 0; patternIdx < tribunal.patterns.length; patternIdx++) {
    console.log(`\n🔍 Pattern ${patternIdx + 1}: Testing...`);
    
    for (const year of years) {
      for (const seq of sequences) {
        const caseId = tribunal.patterns[patternIdx](year, seq);
        process.stdout.write(`   Trying: ${caseId}...`);
        
        const result = await fetchCase(tribunal.db, caseId);
        
        if (result.success) {
          console.log(` ✅ FOUND!`);
          console.log(`\n🎯 SUCCESS! Working pattern found:`);
          console.log(`   Database: ${tribunal.db}`);
          console.log(`   Pattern: ${patternIdx + 1}`);
          console.log(`   Example: ${caseId}`);
          console.log(`   Title: ${result.data.title || 'N/A'}`);
          console.log(`   Date: ${result.data.decisionDate || 'N/A'}`);
          foundPattern = {
            patternIdx,
            example: caseId,
            year,
            seq
          };
          return foundPattern;
        } else if (result.error === '429 Rate limit') {
          console.log(` ⏳ Rate limit hit`);
          console.log(`\n⚠️  API quota exhausted. Try again later.`);
          return null;
        } else {
          console.log(` ❌ ${result.error}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`   Pattern ${patternIdx + 1}: No matches`);
  }
  
  if (!foundPattern) {
    console.log(`\n❌ No working pattern found for ${tribunal.name}`);
  }
  
  return foundPattern;
}

async function main() {
  console.log('\n🔬 CanLII Tribunal Pattern Tester');
  console.log('Testing ONLTB, ONCAT, ONCICB case ID formats\n');
  
  if (!API_KEY) {
    console.error('❌ Error: CANLII_API_KEY not set');
    process.exit(1);
  }
  
  const results = {};
  
  for (const tribunal of tribunals) {
    const found = await testTribunal(tribunal);
    results[tribunal.db] = found;
    
    // Longer delay between tribunals
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  console.log(`\n\n${'='.repeat(50)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(50)}\n`);
  
  for (const [db, result] of Object.entries(results)) {
    if (result) {
      console.log(`✅ ${db.toUpperCase()}: Pattern ${result.patternIdx + 1} works (example: ${result.example})`);
    } else {
      console.log(`❌ ${db.toUpperCase()}: No working pattern found`);
    }
  }
}

main().catch(console.error);
