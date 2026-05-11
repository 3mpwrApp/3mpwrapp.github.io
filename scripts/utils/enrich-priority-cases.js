#!/usr/bin/env node
/**
 * Enrich Priority Cases with Full HTML Content (MANUAL MODE)
 * 
 * Fetches full decision HTML from CanLII API for high-priority cases
 * User runs manually in batches (50-100 cases at a time)
 * Resume-enabled: picks up where you left off
 * 
 * Usage:
 *   node scripts/enrich-priority-cases.js --batch=50
 *   node scripts/enrich-priority-cases.js --batch=100
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.CANLII_API_KEY;
const BASE_URL = "https://api.canlii.org/v1";
const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');
const PRIORITY_FILE = path.join(DATA_DIR, 'priority-cases-500.json');

// Parse args
const args = process.argv.slice(2);
const batchSize = parseInt(args.find(a => a.startsWith('--batch='))?.split('=')[1]) || 50;

console.log('═══════════════════════════════════════════════════════');
console.log('  Enrich Priority Cases (MANUAL MODE)');
console.log('═══════════════════════════════════════════════════════\n');

// Load priority cases
if (!fs.existsSync(PRIORITY_FILE)) {
  console.error('❌ Error: priority-cases-500.json not found!');
  console.error('   Run: node scripts/create-priority-list.js\n');
  process.exit(1);
}

const priorityData = JSON.parse(fs.readFileSync(PRIORITY_FILE, 'utf8'));
const cases = priorityData.cases || [];

console.log(`📊 Total priority cases: ${cases.length}`);
console.log(`✅ Already enriched: ${priorityData.enrichmentProgress.enriched}`);
console.log(`⏳ Remaining: ${priorityData.enrichmentProgress.remaining}`);
console.log(`📦 Batch size: ${batchSize} cases\n`);

// Find unenriched cases
const unenriched = cases.filter(c => !c.enriched);

if (unenriched.length === 0) {
  console.log('🎉 All priority cases already enriched!\n');
  process.exit(0);
}

console.log(`🔄 Will enrich next ${Math.min(batchSize, unenriched.length)} cases...\n`);

// Fetch full case HTML
async function fetchFullHTML(caseId, database) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/caseBrowse/en/${database}/${caseId}?api_key=${API_KEY}`;
    
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 404) {
          resolve({ html: null, error: '404 Not Found' });
        } else if (res.statusCode === 429) {
          reject(new Error('QUOTA_HIT'));
        } else if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve({ html: json.html || null, fullData: json });
          } catch (e) {
            reject(new Error('Invalid JSON'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Extract full text from HTML
function extractFullText(html) {
  if (!html) return '';
  
  // Remove HTML tags
  const text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
  
  return text;
}

// Extract outcome from full text
function extractOutcome(text) {
  const lower = text.toLowerCase();
  
  if (/appeal\s+(?:is\s+)?(?:hereby\s+)?allowed/i.test(lower)) return 'Allowed';
  if (/appeal\s+(?:is\s+)?(?:hereby\s+)?dismissed/i.test(lower)) return 'Dismissed';
  if (/appeal\s+(?:is\s+)?(?:hereby\s+)?denied/i.test(lower)) return 'Denied';
  if (/decision.*(?:is\s+)?varied/i.test(lower)) return 'Varied';
  if (/remand(?:ed)?|referred\s+back/i.test(lower)) return 'Remanded';
  
  return 'Unknown';
}

// Extract legal precedents
function extractPrecedents(text) {
  const precedents = [];
  
  // Match case citations: Name v. Name, [year] ONWSIAT ###
  const citationPattern = /(\w+)\s+v\.?\s+(\w+),?\s+\[?(\d{4})\]?\s+([A-Z]+)\s+(\d+)/gi;
  const matches = text.matchAll(citationPattern);
  
  for (const match of matches) {
    precedents.push({
      citation: match[0],
      year: match[3],
      court: match[4]
    });
  }
  
  return precedents.slice(0, 10); // Top 10 most relevant
}

// Main enrichment
async function enrichBatch() {
  const batch = unenriched.slice(0, batchSize);
  let enriched = 0;
  let failed = 0;
  let hasHTML = 0;
  
  console.log(`Starting enrichment at ${new Date().toLocaleTimeString()}\n`);
  
  for (let i = 0; i < batch.length; i++) {
    const caseObj = batch[i];
    const data = caseObj.data || caseObj;
    const caseId = data.caseId || data.concatenatedId;
    const database = data.databaseId || 'onwsiat';
    
    const progress = `[${i + 1}/${batch.length}]`;
    
    try {
      process.stdout.write(`${progress} ${caseId}... `);
      
      const result = await fetchFullHTML(caseId, database);
      
      if (result.html) {
        const fullText = extractFullText(result.html);
        const outcome = extractOutcome(fullText);
        const precedents = extractPrecedents(fullText);
        
        // Update case object in original array
        const originalIndex = cases.findIndex(c => {
          const cData = c.data || c;
          const cId = cData.caseId || cData.concatenatedId;
          return cId === caseId;
        });
        
        if (originalIndex !== -1) {
          cases[originalIndex].enriched = true;
          cases[originalIndex].enrichedAt = new Date().toISOString();
          cases[originalIndex].fullText = fullText;
          cases[originalIndex].fullHTML = result.html;
          cases[originalIndex].extractedOutcome = outcome;
          cases[originalIndex].citedPrecedents = precedents;
          cases[originalIndex].data = { ...data, ...result.fullData };
        }
        
        console.log(`✅ (${fullText.length.toLocaleString()} chars, outcome: ${outcome})`);
        enriched++;
        hasHTML++;
      } else {
        console.log(`⚠️  ${result.error || 'No HTML available'}`);
        
        // Mark as attempted
        const originalIndex = cases.findIndex(c => {
          const cData = c.data || c;
          const cId = cData.caseId || cData.concatenatedId;
          return cId === caseId;
        });
        
        if (originalIndex !== -1) {
          cases[originalIndex].enriched = true;
          cases[originalIndex].enrichedAt = new Date().toISOString();
          cases[originalIndex].enrichmentError = result.error;
        }
        
        failed++;
      }
      
      // Rate limiting (2 seconds between calls)
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (error) {
      if (error.message === 'QUOTA_HIT') {
        console.log(`\n\n❌ API quota hit after ${i + 1} calls`);
        console.log(`✅ Enriched ${enriched} cases this session`);
        console.log(`\n⏰ Quota resets at midnight UTC (8 PM ET)`);
        console.log(`   Run again after reset to continue\n`);
        break;
      }
      
      console.log(`❌ ${error.message}`);
      failed++;
    }
  }
  
  // Update progress tracking
  priorityData.enrichmentProgress.enriched = cases.filter(c => c.enriched).length;
  priorityData.enrichmentProgress.remaining = cases.filter(c => !c.enriched).length;
  priorityData.enrichmentProgress.lastEnrichmentDate = new Date().toISOString();
  priorityData.cases = cases;
  
  // Save updated data
  fs.writeFileSync(PRIORITY_FILE, JSON.stringify(priorityData, null, 2));
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Session Summary');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`  ✅ Enriched with full text: ${hasHTML}`);
  console.log(`  ⚠️  No HTML available: ${failed}`);
  console.log(`  📊 Total enriched: ${priorityData.enrichmentProgress.enriched}/${cases.length}`);
  console.log(`  ⏳ Remaining: ${priorityData.enrichmentProgress.remaining}\n`);
  
  if (priorityData.enrichmentProgress.remaining > 0) {
    console.log('To continue enrichment:');
    console.log(`  node scripts/enrich-priority-cases.js --batch=${batchSize}\n`);
  } else {
    console.log('🎉 All priority cases enriched!');
    console.log('\nNext step: Analyze enriched data');
    console.log('  node scripts/analyze-enriched-cases.js\n');
  }
}

enrichBatch().catch(console.error);
