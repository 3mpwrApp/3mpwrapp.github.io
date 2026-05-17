#!/usr/bin/env node
/**
 * LTB Collection - Search-Based Approach
 * 
 * Uses CanLII search API instead of enumeration
 * More reliable for tribunals with non-sequential IDs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CANLII_API_KEY = process.env.CANLII_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../data/tribunal-decisions');

async function searchCanLII(database, query, offset = 0) {
  const searchUrl = `https://api.canlii.org/v1/caseBrowse/en/${database}/?offset=${offset}&resultCount=100&api_key=${CANLII_API_KEY}`;
  
  return new Promise((resolve, reject) => {
    https.get(searchUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

async function fetchCaseDetails(database, caseId) {
  const url = `https://api.canlii.org/v1/caseBrowse/en/${database}/${caseId}?api_key=${CANLII_API_KEY}`;
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function collectLTB() {
  console.log('═══════════════════════════════════════════════');
  console.log('LTB COLLECTION - SEARCH-BASED MODE');
  console.log('═══════════════════════════════════════════════\n');
  
  const database = 'onltb';
  const allCases = [];
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  let totalApiCalls = 0;
  
  // Load existing cases
  const existingIds = new Set();
  try {
    const files = fs.readdirSync(OUTPUT_DIR);
    for (const file of files) {
      if (file.includes('onltb') && file.endsWith('.json')) {
        const data = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf8'));
        const cases = Array.isArray(data) ? data : data.decisions || [];
        cases.forEach(c => {
          if (c.case_id) existingIds.add(c.case_id);
          if (c.caseId) existingIds.add(c.caseId);
        });
      }
    }
    console.log(`✅ Loaded ${existingIds.size} existing cases\n`);
  } catch (e) {
    console.log('ℹ️  No existing data found\n');
  }
  
  for (const year of years) {
    console.log(`\n📅 Collecting ${year} cases...`);
    let offset = 0;
    let hasMore = true;
    let yearCases = 0;
    
    while (hasMore) {
      try {
        totalApiCalls++;
        const results = await searchCanLII(database, '', offset);
        
        if (!results.cases || results.cases.length === 0) {
          hasMore = false;
          break;
        }
        
        // Filter for current year
        const yearResults = results.cases.filter(c => {
          const id = String(c.caseId || c.case_id || '');
          return id && id.startsWith(`${year}`);
        });
        
        console.log(`   Offset ${offset}: Found ${yearResults.length} cases from ${year}`);
        
        // Fetch details for each case
        for (const caseInfo of yearResults) {
          const caseId = caseInfo.caseId || caseInfo.case_id;
          
          if (existingIds.has(caseId)) {
            console.log(`   ⏭️  ${caseId} (exists)`);
            continue;
          }
          
          totalApiCalls++;
          const details = await fetchCaseDetails(database, caseId);
          
          if (details) {
            const caseData = {
              case_id: caseId,
              database_id: database,
              url: details.url || caseInfo.url,
              title: details.title || caseInfo.title,
              citation: details.citation || caseInfo.citation,
              decision_date: details.decisionDate || caseInfo.decisionDate,
              keywords_api: details.keywords ? details.keywords.split(/\s*[—–-]\s*/).filter(k => k.length > 0) : [],
              docket_number: details.docketNumber,
              language: details.language || 'en',
              outcome: 'Unknown',
              fetched_at: new Date().toISOString(),
              data_quality: {
                has_keywords: !!(details.keywords),
                has_decision_date: !!(details.decisionDate),
                keywords_count: details.keywords ? details.keywords.split(/\s*[—–-]\s*/).length : 0
              }
            };
            
            allCases.push(caseData);
            yearCases++;
            console.log(`   ✅ ${caseId} - ${caseData.title.substring(0, 60)}...`);
            existingIds.add(caseId);
          }
          
          // Rate limiting
          await new Promise(r => setTimeout(r, 1000));
        }
        
        // Check if we've moved past this year
        const futureYears = results.cases.filter(c => {
          const id = String(c.caseId || c.case_id || '');
          if (!id || id.length < 4) return false;
          const caseYear = parseInt(id.substring(0, 4));
          return caseYear > year;
        });
        
        if (futureYears.length > results.cases.length / 2) {
          console.log(`   ✅ Completed ${year} (${yearCases} new cases)`);
          break;
        }
        
        offset += 100;
        await new Promise(r => setTimeout(r, 2000)); // Rate limit between pages
        
      } catch (error) {
        console.log(`\n❌ Error: ${error.message}`);
        if (error.message.includes('429')) {
          console.log('⚠️  API quota hit - saving progress...\n');
          break;
        }
        hasMore = false;
      }
    }
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 COLLECTION SUMMARY');
  console.log('═══════════════════════════════════════════════\n');
  console.log(`Total API calls: ${totalApiCalls}`);
  console.log(`New cases collected: ${allCases.length}`);
  console.log(`Total cases now: ${allCases.length + existingIds.size}\n`);
  
  if (allCases.length > 0) {
    // Save by year
    const byYear = {};
    allCases.forEach(c => {
      const id = String(c.case_id || '');
      const year = id.length >= 4 ? id.substring(0, 4) : 'unknown';
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(c);
    });
    
    for (const [year, cases] of Object.entries(byYear)) {
      const filename = `onltb-${year}-complete.json`;
      const filepath = path.join(OUTPUT_DIR, filename);
      
      // Merge with existing if file exists
      let allYearCases = cases;
      if (fs.existsSync(filepath)) {
        const existing = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        const existingMap = new Map(existing.map(c => [c.case_id, c]));
        cases.forEach(c => existingMap.set(c.case_id, c));
        allYearCases = Array.from(existingMap.values());
      }
      
      fs.writeFileSync(filepath, JSON.stringify(allYearCases, null, 2));
      console.log(`💾 Saved ${cases.length} new cases to: ${filename} (${allYearCases.length} total)`);
    }
    
    console.log('\n✅ Collection complete!\n');
  } else {
    console.log('ℹ️  No new cases found\n');
  }
}

collectLTB().catch(console.error);
