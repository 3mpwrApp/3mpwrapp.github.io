#!/usr/bin/env node
/**
 * Explore all available data sources to maximize outcome classification
 * Since CanLII API doesn't provide full text, let's use what we have:
 * 1. keywords_api field
 * 2. legislation_cited field
 * 3. title patterns
 * 4. Citator API (cited/citing cases)
 * 5. Cross-reference with known outcomes
 */

const fs = require('fs');
const https = require('https');

console.log('═══════════════════════════════════════════════');
console.log('EXPLORING ALL DATA SOURCES');
console.log('═══════════════════════════════════════════════\n');

// Load ONSBT 2025 data
const data = JSON.parse(fs.readFileSync('data/tribunal-decisions/onsbt-2025-complete.json', 'utf8'));

console.log(`Total cases: ${data.length}\n`);

// 1. Analyze keywords_api field
console.log('1️⃣  KEYWORDS_API ANALYSIS');
console.log('─────────────────────────────────────────────');

const withKeywords = data.filter(c => c.keywords_api && c.keywords_api.length > 0);
const unknownWithKeywords = withKeywords.filter(c => c.outcome === 'Unknown');

console.log(`Cases with keywords: ${withKeywords.length}`);
console.log(`Unknown cases with keywords: ${unknownWithKeywords.length}\n`);

// Sample keywords
console.log('Sample keywords from Unknown cases:');
unknownWithKeywords.slice(0, 5).forEach(c => {
  console.log(`  ${c.case_id}: ${c.keywords_api.join(', ')}`);
});

// 2. Analyze legislation_cited field
console.log('\n2️⃣  LEGISLATION_CITED ANALYSIS');
console.log('─────────────────────────────────────────────');

const withLegislation = data.filter(c => c.legislation_cited && c.legislation_cited.length > 0);
const unknownWithLegislation = withLegislation.filter(c => c.outcome === 'Unknown');

console.log(`Cases with legislation: ${withLegislation.length}`);
console.log(`Unknown cases with legislation: ${unknownWithLegislation.length}`);

if (withLegislation.length > 0) {
  console.log('\nSample legislation citations:');
  withLegislation.slice(0, 3).forEach(c => {
    console.log(`  ${c.case_id}: ${c.legislation_cited.join(', ')}`);
  });
}

// 3. Analyze title patterns
console.log('\n3️⃣  TITLE PATTERN ANALYSIS');
console.log('─────────────────────────────────────────────');

const titlePatterns = {
  'dismissed': /dismiss|denial|denied/i,
  'allowed': /allow|grant|granted/i,
  'withdrawn': /withdraw|withdrawn/i,
  'settled': /settle|settled/i,
  'reconsideration': /reconsider|reconsideration/i,
  'interim': /interim/i,
  'costs': /costs/i
};

const unknownCases = data.filter(c => c.outcome === 'Unknown');
const titleMatches = {};

for (const [pattern, regex] of Object.entries(titlePatterns)) {
  const matches = unknownCases.filter(c => regex.test(c.title));
  if (matches.length > 0) {
    titleMatches[pattern] = matches.length;
  }
}

console.log('Title patterns in Unknown cases:');
for (const [pattern, count] of Object.entries(titleMatches)) {
  console.log(`  ${pattern}: ${count} cases`);
}

// 4. Cross-reference analysis
console.log('\n4️⃣  CROSS-REFERENCE OPPORTUNITY');
console.log('─────────────────────────────────────────────');

const knownCases = data.filter(c => c.outcome !== 'Unknown');
console.log(`We have ${knownCases.length} cases with known outcomes`);
console.log('These can be used to train ML models or find similar patterns\n');

// Sample known cases
console.log('Sample known outcomes:');
knownCases.slice(0, 5).forEach(c => {
  console.log(`  ${c.case_id}: ${c.outcome}`);
  if (c.keywords_api && c.keywords_api.length > 0) {
    console.log(`    Keywords: ${c.keywords_api.join(', ')}`);
  }
});

// 5. Citator API test
console.log('\n5️⃣  CITATOR API TEST (Sample)');
console.log('─────────────────────────────────────────────');
console.log('Testing if citator endpoint provides additional outcome data...\n');

const apiKey = process.env.CANLII_API_KEY;
if (!apiKey || apiKey === 'your-key') {
  console.log('⚠️  CANLII_API_KEY not set - skipping citator test');
  console.log('   Set your API key to test citator endpoint\n');
  printSummary();
} else {
  // Test citator for a known case
  const testCase = data[0];
  const url = `https://api.canlii.org/v1/caseCitator/en/onsbt/${testCase.case_id}/citedCases?api_key=${apiKey}`;
  
  console.log(`Testing citator for: ${testCase.case_id}`);
  console.log(`URL: ${url.replace(apiKey, 'API_KEY')}\n`);
  
  https.get(url, (res) => {
    let responseData = '';
    res.on('data', chunk => responseData += chunk);
    res.on('end', () => {
      console.log(`Status Code: ${res.statusCode}`);
      if (res.statusCode === 200) {
        try {
          const json = JSON.parse(responseData);
          console.log('Available fields:', Object.keys(json));
          console.log('Response preview:', JSON.stringify(json, null, 2).substring(0, 500));
        } catch (e) {
          console.log('Parse error:', e.message);
        }
      } else {
        console.log('Error response:', responseData);
      }
      console.log('\n');
      printSummary();
    });
  }).on('error', err => {
    console.error('Request error:', err.message);
    printSummary();
  });
}

function printSummary() {
  console.log('═══════════════════════════════════════════════');
  console.log('📊 SUMMARY & RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log('✅ IMMEDIATE ACTIONS:');
  console.log('  1. Enhanced keyword pattern matching (keywords_api field)');
  console.log('  2. Title-based outcome detection');
  console.log('  3. Run Phase 3 ML classification on keywords');
  console.log('  4. Cross-reference similar cases with known outcomes\n');
  
  console.log('📈 EXPECTED IMPROVEMENTS:');
  console.log(`  - Current Unknown: ${unknownCases.length} cases (${(unknownCases.length/data.length*100).toFixed(1)}%)`);
  console.log(`  - Potential via keywords: ${unknownWithKeywords.length} cases`);
  console.log(`  - Expected classification rate: 60-70% of unknowns`);
  console.log(`  - Final Unknown target: 20-30%\n`);
  
  console.log('═══════════════════════════════════════════════');
}
