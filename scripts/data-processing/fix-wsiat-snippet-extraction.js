#!/usr/bin/env node
/**
 * EMERGENCY FIX: Parse WSIAT snippet field to extract URLs and dates
 * 
 * PROBLEM: onwsiat-historical-20260404.json has 100% missing URLs and dates
 * CAUSE: Data extraction v4.0 stored URLs/dates in "snippet" JSON string field
 * FIX: Parse snippet, extract url and decisionDate, populate main fields
 * 
 * IMPACT: Fixes 1,500+ WSIAT records making them usable in production
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const WSIAT_FILE = 'onwsiat-historical-20260404.json';
const BACKUP_SUFFIX = '.backup-before-snippet-fix';

console.log('🚨 EMERGENCY FIX: WSIAT Data Extraction from Snippet Field\n');

// Load WSIAT data
const wsiatPath = path.join(DATA_DIR, WSIAT_FILE);
console.log(`📂 Loading: ${wsiatPath}`);

if (!fs.existsSync(wsiatPath)) {
  console.error('❌ ERROR: WSIAT file not found!');
  process.exit(1);
}

const rawData = fs.readFileSync(wsiatPath, 'utf8');
const wsiatData = JSON.parse(rawData);

console.log(`📊 Total records: ${wsiatData.length}`);

// Backup original file
const backupPath = wsiatPath + BACKUP_SUFFIX;
console.log(`💾 Creating backup: ${backupPath}`);
fs.writeFileSync(backupPath, rawData, 'utf8');

// Fix records
let fixedCount = 0;
let errorCount = 0;
let alreadyFixedCount = 0;

wsiatData.forEach((record, index) => {
  try {
    // Skip if already fixed (url and date present)
    if (record.url && record.url !== '' && record.date && record.date !== 'Unknown') {
      alreadyFixedCount++;
      return;
    }

    // Parse snippet field (it's a JSON string)
    if (!record.snippet) {
      console.warn(`⚠️  Record ${index} (${record.case_id}): No snippet field`);
      errorCount++;
      return;
    }

    // Extract JSON from snippet (may have additional text after)
    const snippetMatch = record.snippet.match(/\{[^}]+\}/);
    if (!snippetMatch) {
      console.warn(`⚠️  Record ${index} (${record.case_id}): Cannot parse snippet JSON`);
      errorCount++;
      return;
    }

    const snippetData = JSON.parse(snippetMatch[0]);

    // Extract and fix fields
    if (snippetData.url) {
      record.url = snippetData.url;
    }
    
    if (snippetData.decisionDate) {
      record.date = snippetData.decisionDate;
    }

    // Also extract citation if missing
    if (snippetData.citation && !record.citation) {
      record.citation = snippetData.citation;
    }

    // Extract docket number if missing
    if (snippetData.docketNumber && !record.docket_number) {
      record.docket_number = snippetData.docketNumber;
    }

    fixedCount++;

    if (fixedCount % 100 === 0) {
      console.log(`   ✓ Fixed ${fixedCount} records...`);
    }

  } catch (error) {
    console.error(`❌ Error processing record ${index} (${record.case_id}):`, error.message);
    errorCount++;
  }
});

console.log('\n📈 Fix Summary:');
console.log(`   ✅ Fixed: ${fixedCount} records`);
console.log(`   ⏭️  Already fixed: ${alreadyFixedCount} records`);
console.log(`   ❌ Errors: ${errorCount} records`);

// Validation check
const validUrlCount = wsiatData.filter(r => r.url && r.url.startsWith('https://')).length;
const validDateCount = wsiatData.filter(r => r.date && r.date !== 'Unknown' && r.date.match(/^\d{4}-\d{2}-\d{2}$/)).length;

console.log('\n🔍 Post-Fix Validation:');
console.log(`   URLs valid: ${validUrlCount} / ${wsiatData.length} (${(validUrlCount/wsiatData.length*100).toFixed(1)}%)`);
console.log(`   Dates valid: ${validDateCount} / ${wsiatData.length} (${(validDateCount/wsiatData.length*100).toFixed(1)}%)`);

if (validUrlCount < wsiatData.length * 0.95 || validDateCount < wsiatData.length * 0.95) {
  console.warn('\n⚠️  WARNING: Less than 95% of records have valid URLs or dates!');
  console.warn('   Review errors above and check snippet field format.');
}

// Save fixed data
console.log(`\n💾 Writing fixed data to: ${wsiatPath}`);
fs.writeFileSync(wsiatPath, JSON.stringify(wsiatData, null, 2), 'utf8');

console.log('\n✅ WSIAT FIX COMPLETE!\n');
console.log('   NEXT STEPS:');
console.log('   1. Test app with fixed data');
console.log('   2. Verify CanLII links work');
console.log('   3. If successful, delete backup file');
console.log(`   4. Backup location: ${backupPath}`);
