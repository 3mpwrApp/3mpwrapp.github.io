#!/usr/bin/env node

/**
 * BATCH FULL TEXT EXTRACTOR FOR ONTARIO TRIBUNALS
 * 
 * Reads extraction queues and fetches full text from CanLII API
 * - Respects 15-second delays between requests
 * - Saves progress every 50 cases
 * - Resume capability if quota exceeded
 * - Extracts outcome from full HTML content
 * 
 * Usage:
 *   node scripts/extraction/extract-full-text-batch.js <tribunal> [start_index]
 *   
 * Examples:
 *   node scripts/extraction/extract-full-text-batch.js onsbt
 *   node scripts/extraction/extract-full-text-batch.js onhrt 100
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CANLII_API_KEY = process.env.CANLII_API_KEY;
const DELAY_MS = 15000; // 15 seconds between requests
const SAVE_INTERVAL = 50; // Save progress every 50 cases

if (!CANLII_API_KEY) {
  console.error('❌ Error: CANLII_API_KEY environment variable not set');
  console.error('   Set it with: $env:CANLII_API_KEY="your-key-here"');
  process.exit(1);
}

const tribunal = process.argv[2];
const startIndex = parseInt(process.argv[3]) || 0;

if (!tribunal) {
  console.error('❌ Error: Tribunal code required');
  console.error('   Usage: node scripts/extraction/extract-full-text-batch.js <tribunal> [start_index]');
  console.error('   Available: onsbt, onwsib, onhrt, onlrb, onca');
  process.exit(1);
}

const dataDir = path.join(__dirname, '..', '..', 'data', 'tribunal-decisions');
const queueFile = path.join(dataDir, 'extraction-queues', `${tribunal}-extraction-queue.json`);
const progressFile = path.join(dataDir, `.extraction-progress-${tribunal}.json`);

if (!fs.existsSync(queueFile)) {
  console.error(`❌ Error: Queue file not found: ${queueFile}`);
  process.exit(1);
}

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║  🔍 CANLII FULL TEXT BATCH EXTRACTOR                              ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
console.log(`📋 Loaded extraction queue: ${queue.length} cases`);
console.log(`🚀 Starting from index: ${startIndex}`);
console.log(`⏱️  Delay between requests: ${DELAY_MS / 1000} seconds`);
console.log(`💾 Save progress every: ${SAVE_INTERVAL} cases\n`);

// Load progress if exists
let progress = { completed: [], failed: [], lastIndex: 0 };
if (fs.existsSync(progressFile)) {
  progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  console.log(`📂 Loaded existing progress: ${progress.completed.length} completed, ${progress.failed.length} failed\n`);
}

// Extract outcome from HTML content using pattern matching
function extractOutcomeFromHTML(html) {
  if (!html) return 'Unknown';
  
  const text = html.toLowerCase();
  
  // Strong outcome patterns (in order of specificity)
  const patterns = [
    { regex: /application\s+(?:is\s+)?dismissed/i, outcome: 'Dismissed' },
    { regex: /complaint\s+(?:is\s+)?dismissed/i, outcome: 'Dismissed' },
    { regex: /appeal\s+(?:is\s+)?dismissed/i, outcome: 'Dismissed' },
    { regex: /grievance\s+(?:is\s+)?dismissed/i, outcome: 'Dismissed' },
    { regex: /application\s+(?:is\s+)?allowed/i, outcome: 'Allowed' },
    { regex: /appeal\s+(?:is\s+)?allowed/i, outcome: 'Allowed' },
    { regex: /grievance\s+(?:is\s+)?allowed/i, outcome: 'Allowed' },
    { regex: /application\s+(?:is\s+)?granted/i, outcome: 'Allowed' },
    { regex: /settlement\s+agreement/i, outcome: 'Settled/Withdrawn' },
    { regex: /application\s+(?:is\s+)?withdrawn/i, outcome: 'Settled/Withdrawn' },
    { regex: /matter\s+(?:is\s+)?settled/i, outcome: 'Settled/Withdrawn' },
    { regex: /consent\s+order/i, outcome: 'Settled/Withdrawn' },
    { regex: /no\s+jurisdiction/i, outcome: 'No Jurisdiction' },
    { regex: /lack\s+(?:of\s+)?jurisdiction/i, outcome: 'No Jurisdiction' },
    { regex: /remit(?:ted)?\s+(?:to|for)/i, outcome: 'Remitted' },
    { regex: /new\s+trial\s+ordered/i, outcome: 'Remitted' },
    { regex: /application\s+(?:is\s+)?discontinued/i, outcome: 'Discontinued' },
    { regex: /matter\s+(?:is\s+)?abandoned/i, outcome: 'Discontinued' },
    { regex: /representation\s+vote/i, outcome: 'Representation Vote' },
    { regex: /certification\s+granted/i, outcome: 'Allowed' },
    { regex: /certification\s+denied/i, outcome: 'Dismissed' },
    { regex: /interim\s+(?:relief|order)/i, outcome: 'Interim Decision' },
    { regex: /application\s+deficiency/i, outcome: 'Application Deficiency' }
  ];
  
  for (const { regex, outcome } of patterns) {
    if (regex.test(text)) {
      return outcome;
    }
  }
  
  return 'Unknown';
}

// Extract database ID from case_id (e.g., "2025onsbt4273" -> "onsbt")
function extractDatabaseId(caseId) {
  const tribunalCodes = ['onsbt', 'onwsib', 'onhrt', 'onlrb', 'onca', 'bcwcat', 'bchrt', 'bcest'];
  for (const code of tribunalCodes) {
    if (caseId.toLowerCase().includes(code)) {
      return code;
    }
  }
  return null;
}

// Fetch full text from CanLII API
function fetchFullText(caseId) {
  return new Promise((resolve, reject) => {
    const databaseId = extractDatabaseId(caseId);
    if (!databaseId) {
      return reject(new Error(`Could not extract database ID from case_id: ${caseId}`));
    }
    
    // Correct CanLII API endpoint format: /v1/caseBrowse/en/{databaseId}/{caseId}/
    const url = `https://api.canlii.org/v1/caseBrowse/en/${databaseId}/${caseId}/?api_key=${CANLII_API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve({
              success: true,
              html: json.caseCitedHtml || json.caseHTML || '',
              text: json.caseText || ''
            });
          } catch (err) {
            reject(new Error(`JSON parse error: ${err.message}`));
          }
        } else if (res.statusCode === 429) {
          // Quota exceeded
          resolve({ success: false, quotaExceeded: true });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Update original data files with extracted outcomes
function updateOriginalFile(sourceFile, caseId, outcome, fullText) {
  const filePath = path.join(dataDir, sourceFile);
  
  if (!fs.existsSync(filePath)) {
    console.error(`   ⚠️  Source file not found: ${sourceFile}`);
    return false;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const cases = Array.isArray(data) ? data : data.cases || [];
    
    const caseIndex = cases.findIndex(c => c.case_id === caseId);
    if (caseIndex === -1) {
      console.error(`   ⚠️  Case ${caseId} not found in ${sourceFile}`);
      return false;
    }
    
    // Update case with extracted data
    cases[caseIndex].outcome = outcome;
    cases[caseIndex].full_text_html = fullText.substring(0, 50000); // Limit to 50KB
    cases[caseIndex].full_text_length = fullText.length;
    cases[caseIndex].extracted_at = new Date().toISOString();
    cases[caseIndex].extraction_method = 'canlii_api_full_text';
    
    if (cases[caseIndex].data_quality) {
      cases[caseIndex].data_quality.has_full_text = true;
      cases[caseIndex].data_quality.has_outcome = outcome !== 'Unknown';
    }
    
    // Write back
    fs.writeFileSync(filePath, JSON.stringify(cases, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`   ❌ Error updating ${sourceFile}: ${err.message}`);
    return false;
  }
}

// Main extraction loop
async function extractBatch() {
  const startTime = Date.now();
  let extractedCount = 0;
  let failedCount = 0;
  let quotaExceeded = false;
  
  for (let i = startIndex; i < queue.length; i++) {
    const item = queue[i];
    const { case_id, title, source_file } = item;
    
    console.log(`\n[${i + 1}/${queue.length}] Processing: ${case_id}`);
    console.log(`   Title: ${title.substring(0, 60)}...`);
    
    try {
      const result = await fetchFullText(case_id);
      
      if (result.quotaExceeded) {
        console.log('   ⛔ QUOTA EXCEEDED - Stopping extraction');
        quotaExceeded = true;
        progress.lastIndex = i;
        break;
      }
      
      if (result.success) {
        const outcome = extractOutcomeFromHTML(result.html || result.text);
        console.log(`   ✅ Extracted: ${outcome}`);
        
        // Update original file
        const updated = updateOriginalFile(source_file, case_id, outcome, result.html || result.text);
        
        if (updated) {
          extractedCount++;
          progress.completed.push(case_id);
        } else {
          failedCount++;
          progress.failed.push({ case_id, reason: 'Update failed' });
        }
      } else {
        console.log('   ❌ Extraction failed');
        failedCount++;
        progress.failed.push({ case_id, reason: 'API error' });
      }
      
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      failedCount++;
      progress.failed.push({ case_id, reason: err.message });
    }
    
    progress.lastIndex = i;
    
    // Save progress periodically
    if ((i + 1) % SAVE_INTERVAL === 0 || i === queue.length - 1) {
      fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2), 'utf8');
      console.log(`\n💾 Progress saved: ${extractedCount} extracted, ${failedCount} failed`);
    }
    
    // Delay before next request (except for last item)
    if (i < queue.length - 1 && !quotaExceeded) {
      const remainingTime = DELAY_MS - (Date.now() % DELAY_MS);
      console.log(`   ⏳ Waiting ${DELAY_MS / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('📊 EXTRACTION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  console.log(`Total processed: ${extractedCount + failedCount}`);
  console.log(`✅ Successful: ${extractedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`⏱️  Duration: ${duration} minutes`);
  console.log(`🔢 Last index: ${progress.lastIndex}`);
  
  if (quotaExceeded) {
    console.log('\n⛔ QUOTA EXCEEDED');
    console.log(`   Completed: ${extractedCount}/${queue.length}`);
    console.log(`   Remaining: ${queue.length - progress.lastIndex - 1}`);
    console.log(`\n   Resume with: node scripts/extraction/extract-full-text-batch.js ${tribunal} ${progress.lastIndex + 1}`);
  } else if (progress.lastIndex >= queue.length - 1) {
    console.log('\n✅ EXTRACTION COMPLETE!');
    console.log(`   All ${queue.length} cases processed`);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════════\n');
  
  // Final save
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2), 'utf8');
}

// Run extraction
extractBatch().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
