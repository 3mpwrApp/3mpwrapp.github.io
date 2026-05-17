#!/usr/bin/env node
/**
 * ONWSIAT Data Structure Transformer
 * 
 * Converts nested ONWSIAT structure to flat structure compatible with classification scripts.
 * 
 * INPUT (nested):
 * {
 *   "caseId": "2025onwsiat1",
 *   "data": {
 *     "databaseId": "onwsiat",
 *     "keywords": "worker — injury — claim",
 *     "title": "Decision No. 123/24"
 *   },
 *   "fetchedAt": "2026-04-13T05:13:45.550Z"
 * }
 * 
 * OUTPUT (flat):
 * {
 *   "case_id": "2025onwsiat1",
 *   "database_id": "onwsiat",
 *   "keywords_api": ["worker", "injury", "claim"],
 *   "title": "Decision No. 123/24",
 *   "outcome": "Unknown",
 *   "fetched_at": "2026-04-13T05:13:45.550Z"
 * }
 */

const fs = require('fs');
const path = require('path');

function transformCase(nestedCase) {
  if (!nestedCase.data) {
    console.log(`⚠️  Case ${nestedCase.caseId} missing 'data' field - skipping`);
    return null;
  }
  
  const data = nestedCase.data;
  
  // Split keywords string into array
  let keywords_api = [];
  if (data.keywords) {
    keywords_api = data.keywords
      .split(/\s*[—–-]\s*/)  // em-dash, en-dash, or hyphen
      .map(k => k.trim())
      .filter(k => k.length > 0);
  }
  
  // Create flat structure
  const flatCase = {
    case_id: nestedCase.caseId || data.caseId,
    database_id: data.databaseId,
    url: data.url,
    title: data.title,
    citation: data.citation,
    language: data.language,
    docket_number: data.docketNumber,
    decision_date: data.decisionDate,
    keywords_api: keywords_api,
    topics: data.topics || '',
    concatenated_id: data.concatenatedId,
    outcome: 'Unknown',  // Default - will be classified
    fetched_at: nestedCase.fetchedAt,
    
    // Add data quality indicator
    data_quality: {
      has_keywords: keywords_api.length > 0,
      keywords_count: keywords_api.length,
      has_decision_date: !!data.decisionDate,
      transformed_at: new Date().toISOString()
    }
  };
  
  return flatCase;
}

function transformFile(filePath) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`);
  
  // Read file
  const nestedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`   Read ${nestedData.length} cases`);
  
  // Transform each case
  let transformed = 0;
  let skipped = 0;
  const flatData = [];
  
  for (const nestedCase of nestedData) {
    const flatCase = transformCase(nestedCase);
    if (flatCase) {
      flatData.push(flatCase);
      transformed++;
    } else {
      skipped++;
    }
  }
  
  // Backup original
  const backupPath = filePath.replace('.json', '-BACKUP-NESTED.json');
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(`   ✅ Backed up to: ${path.basename(backupPath)}`);
  }
  
  // Write transformed data
  fs.writeFileSync(filePath, JSON.stringify(flatData, null, 2));
  console.log(`   ✅ Transformed ${transformed} cases`);
  if (skipped > 0) {
    console.log(`   ⚠️  Skipped ${skipped} cases`);
  }
  
  // Sample validation
  if (flatData.length > 0) {
    const sample = flatData[0];
    console.log(`\n   Sample case:`);
    console.log(`     case_id: ${sample.case_id}`);
    console.log(`     keywords_api: ${sample.keywords_api.length} keywords`);
    console.log(`     outcome: ${sample.outcome}`);
    console.log(`     has data_quality: ${!!sample.data_quality}`);
  }
  
  return { transformed, skipped };
}

// Main execution
console.log('═══════════════════════════════════════════════');
console.log('ONWSIAT DATA STRUCTURE TRANSFORMATION');
console.log('═══════════════════════════════════════════════\n');

const dataDir = 'data/tribunal-decisions';
const files = fs.readdirSync(dataDir)
  .filter(f => f.includes('onwsiat') && 
               f.endsWith('-ultra-slow.json') && 
               !f.includes('BACKUP') &&
               !f.includes('cross-referenced') &&
               !f.includes('predicted'));

console.log(`Found ${files.length} ONWSIAT files to transform:\n`);
files.forEach(f => console.log(`  - ${f}`));

let totalTransformed = 0;
let totalSkipped = 0;

for (const file of files) {
  const filePath = path.join(dataDir, file);
  const stats = transformFile(filePath);
  totalTransformed += stats.transformed;
  totalSkipped += stats.skipped;
}

console.log('\n═══════════════════════════════════════════════');
console.log('🎯 TRANSFORMATION COMPLETE');
console.log('═══════════════════════════════════════════════\n');
console.log(`Total cases transformed: ${totalTransformed}`);
console.log(`Total cases skipped: ${totalSkipped}`);
console.log(`\nBackup files created with -BACKUP-NESTED.json suffix`);
console.log(`\n✅ Ready for classification!`);
console.log(`Next command: node scripts/classify-super-enhanced.js\n`);
