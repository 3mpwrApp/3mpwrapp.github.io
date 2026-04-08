#!/usr/bin/env node
/**
 * Filter Downloaded Cases by Keywords
 * 
 * Since CanLII API doesn't support search, download ALL cases first,
 * then run this script to filter locally by keywords.
 * 
 * Usage:
 *   node filter-cases.js --input=onwsiat-direct-2026-04-08.json --output=onwsiat-filtered.json
 *   node filter-cases.js --input=*.json --terms="PTSD,chronic pain,fibromyalgia"
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Parse command line args
const args = process.argv.slice(2);
const inputPattern = args.find(a => a.startsWith('--input='))?.split('=')[1] || '*.json';
const outputFile = args.find(a => a.startsWith('--output='))?.split('=')[1];
const customTerms = args.find(a => a.startsWith('--terms='))?.split('=')[1];

// Default search terms
const DEFAULT_TERMS = {
  disability: /persons?\s+with\s+disabilit(y|ies)/i,
  injured_worker: /injured\s+(worker|employee)/i,
  chronic_pain: /chronic\s+pain/i,
  ptsd: /\b(ptsd|post[\s-]traumatic stress|post traumatic stress)\b/i,
  fibromyalgia: /fibromyalgia/i,
  back_injury: /back\s+(injury|injuries|pain|problem)/i,
  repetitive_strain: /repetitive\s+(strain|stress)/i,
  mental_injury: /mental\s+(injury|health\s+injury|condition)/i,
  occupational_disease: /occupational\s+disease/i,
  permanent_disability: /permanent(\s+partial|\s+total)?\s+disability/i
};

console.log('═══════════════════════════════════════════════════════');
console.log('  CanLII Case Filter (Local Keyword Search)');
console.log('═══════════════════════════════════════════════════════\n');

// Load input files
const dataDir = path.join(__dirname, '../data/tribunal-decisions');
let allCases = [];
let fileCount = 0;

try {
  const files = fs.readdirSync(dataDir);
  const jsonFiles = files.filter(f => f.endsWith('.json') && !f.includes('filtered'));
  
  for (const file of jsonFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
      const cases = Array.isArray(data) ? data : data.decisions || data.cases || [];
      allCases.push(...cases);
      fileCount++;
      console.log(`✅ Loaded: ${file} (${cases.length} cases)`);
    } catch (e) {
      console.log(`⚠️  Skipped: ${file} (${e.message})`);
    }
  }
  
  console.log(`\n📊 Total: ${allCases.length} cases from ${fileCount} files\n`);
  
} catch (error) {
  console.error(`❌ Error loading files: ${error.message}`);
  process.exit(1);
}

if (allCases.length === 0) {
  console.log('❌ No cases found. Download cases first with scrape-direct.js\n');
  process.exit(1);
}

// Filter cases
console.log('🔍 Filtering cases by keywords...\n');

const matchResults = {
  disability: 0,
  injured_worker: 0,
  chronic_pain: 0,
  ptsd: 0,
  fibromyalgia: 0,
  back_injury: 0,
  repetitive_strain: 0,
  mental_injury: 0,
  occupational_disease: 0,
  permanent_disability: 0,
  total_matched: 0
};

const filteredCases = allCases.filter((caseData, index) => {
  // Extract text from various fields
  const text = [
    caseData.html || '',
    caseData.text || '',
    caseData.title || '',
    caseData.snippet || '',
    caseData.keywords || '',
    caseData.condition || '',
    caseData.outcome || '',
    caseData.judge_reasoning || ''
  ].join(' ').toLowerCase();
  
  if (!text || text.length < 50) {
    return false; // Skip cases without content
  }
  
  // Check each search term
  let matched = false;
  for (const [key, regex] of Object.entries(DEFAULT_TERMS)) {
    if (regex.test(text)) {
      matchResults[key]++;
      matched = true;
    }
  }
  
  if (matched) {
    matchResults.total_matched++;
    
    // Log progress every 100 matches
    if (matchResults.total_matched % 100 === 0) {
      process.stdout.write('.');
    }
  }
  
  return matched;
});

console.log('\n\n═══════════════════════════════════════════════════════');
console.log('  Filtering Results');
console.log('═══════════════════════════════════════════════════════\n');

console.log(`Total cases processed: ${allCases.length}`);
console.log(`Cases matched: ${filteredCases.length} (${Math.round(filteredCases.length/allCases.length*100)}%)\n`);

console.log('Match breakdown by term:');
for (const [key, count] of Object.entries(matchResults)) {
  if (key === 'total_matched') continue;
  const pct = Math.round(count / filteredCases.length * 100);
  console.log(`  ${key.replace(/_/g, ' ')}: ${count} (${pct}%)`);
}

// Save filtered results
if (filteredCases.length > 0) {
  const outputPath = outputFile || 
    path.join(dataDir, `filtered-disability-cases-${new Date().toISOString().split('T')[0]}.json`);
  
  fs.writeFileSync(outputPath, JSON.stringify(filteredCases, null, 2));
  
  console.log(`\n💾 Saved filtered cases to: ${path.basename(outputPath)}`);
  console.log(`\nNext steps:`);
  console.log(`1. Review: ${outputPath}`);
  console.log(`2. Generate patterns: node scripts/analyze-patterns.mjs ${path.basename(outputPath)}`);
  console.log(`3. Create templates: node scripts/generate-templates.mjs\n`);
  
} else {
  console.log('\n⚠️  No cases matched the filters.\n');
}
