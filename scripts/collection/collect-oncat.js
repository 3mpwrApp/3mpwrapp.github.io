#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.CANLII_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../data/tribunal-decisions');
const OUTPUT_FILE = 'oncat-2020-2026-complete.json';

// ONCAT: Ontario Condominium Authority Tribunal
// Likely small tribunal, try direct enumeration with simple IDs

console.log('\n═══════════════════════════════════════════════');
console.log('ONCAT COLLECTION');
console.log('═══════════════════════════════════════════════\n');

const existingFile = path.join(OUTPUT_DIR, OUTPUT_FILE);
let existingCases = [];
let existingIds = new Set();

if (fs.existsSync(existingFile)) {
  existingCases = JSON.parse(fs.readFileSync(existingFile, 'utf8'));
  existingIds = new Set(existingCases.map(c => c.case_id));
  console.log(`✅ Loaded ${existingCases.length} existing cases\n`);
} else {
  console.log('✅ Starting fresh collection\n');
}

let apiCalls = 0;
let newCases = 0;

async function fetchCase(caseId) {
  return new Promise((resolve) => {
    const url = `/v1/caseBrowse/en/oncat/${caseId}/`;
    
    const options = {
      hostname: 'api.canlii.org',
      path: url,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        apiCalls++;
        
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve({ found: true, data: json });
          } catch (e) {
            resolve({ found: false, error: 'Invalid JSON' });
          }
        } else if (res.statusCode === 404) {
          resolve({ found: false });
        } else if (res.statusCode === 429) {
          resolve({ found: false, quota: true });
        } else {
          resolve({ found: false, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (e) => {
      resolve({ found: false, error: e.message });
    });
    
    req.end();
  });
}

async function collectONCAT() {
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const allCases = [...existingCases];
  
  // Strategy: Try sequential IDs for each year
  // ONCAT is small, so try: 2020canliioncat1, 2020canliioncat2, etc.
  
  for (const year of years) {
    console.log(`\n📅 Collecting ${year} cases...`);
    let consecutive404 = 0;
    let yearCases = 0;
    
    for (let i = 1; i <= 500; i++) { // Try up to 500 cases per year
      const caseId = `${year}canliioncat${i}`;
      
      if (existingIds.has(caseId)) {
        console.log(`   ⏭️  ${caseId} - Already have`);
        continue;
      }
      
      const result = await fetchCase(caseId);
      
      if (result.quota) {
        console.log(`\n⚠️  API quota hit - saving progress...`);
        break;
      }
      
      if (result.found && result.data) {
        const details = result.data;
        
        const caseData = {
          case_id: caseId,
          database_id: 'oncat',
          title: details.title || 'No title',
          url: details.url || `https://www.canlii.org/en/on/oncat/doc/${year}/${caseId}/`,
          decision_date: details.decisionDate || null,
          keywords_api: details.keywords || [],
          citation: details.citation || null,
          outcome: 'Unknown',
          fetched_at: new Date().toISOString(),
          data_quality: {
            has_keywords: !!(details.keywords),
            has_decision_date: !!(details.decisionDate),
            keywords_count: details.keywords ? details.keywords.length : 0
          }
        };
        
        allCases.push(caseData);
        yearCases++;
        newCases++;
        consecutive404 = 0;
        
        console.log(`   ✅ ${caseId} - ${caseData.title.substring(0, 60)}...`);
        existingIds.add(caseId);
      } else {
        consecutive404++;
        
        if (consecutive404 >= 20) {
          console.log(`   ⏭️  ${consecutive404} consecutive 404s - moving to next year`);
          break;
        }
      }
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 1000));
      
      // Save progress every 10 cases
      if (newCases > 0 && newCases % 10 === 0) {
        fs.writeFileSync(path.join(OUTPUT_DIR, OUTPUT_FILE), JSON.stringify(allCases, null, 2));
      }
    }
    
    console.log(`   ✅ Completed ${year} (${yearCases} new cases)`);
  }
  
  // Final save
  if (allCases.length > 0) {
    fs.writeFileSync(path.join(OUTPUT_DIR, OUTPUT_FILE), JSON.stringify(allCases, null, 2));
    console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 COLLECTION SUMMARY');
  console.log('═══════════════════════════════════════════════\n');
  console.log(`Total API calls: ${apiCalls}`);
  console.log(`New cases collected: ${newCases}`);
  console.log(`Total cases now: ${allCases.length}\n`);
}

collectONCAT();
