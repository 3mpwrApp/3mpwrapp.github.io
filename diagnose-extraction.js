const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/tribunal-decisions/onsbt-2025-complete.json', 'utf8'));

// Find cases with extracted_at timestamp  
const extracted = data.filter(c => c.extracted_at);

console.log('\n═══════════════════════════════════════════════');
console.log('ONSBT EXTRACTION DIAGNOSTIC');
console.log('═══════════════════════════════════════════════\n');

console.log('Total cases:', data.length);
console.log('Cases with extracted_at:', extracted.length);
console.log('');

if (extracted.length > 0) {
  const sample = extracted[0];
  console.log('Sample extracted case:');
  console.log('  Case ID:', sample.case_id);
  console.log('  Outcome:', sample.outcome);
  console.log('  Full text length:', sample.full_text_length);
  console.log('  Extraction method:', sample.extraction_method);
  console.log('  Extracted at:', sample.extracted_at);
  console.log('');
  console.log('  Has full_text_html?', !!sample.full_text_html);
  console.log('  full_text_html length:', sample.full_text_html ? sample.full_text_html.length : 0);
  console.log('  full_text_html value:', sample.full_text_html);
  console.log('');
  
  // Check if full text is actually empty string or missing
  if (sample.full_text_length === 0) {
    console.log('❌ PROBLEM: full_text_length is 0');
    console.log('   This means the API returned empty content');
  }
  
  // Count how many have non-empty full text
  const hasContent = extracted.filter(c => c.full_text_html && c.full_text_html.length > 100).length;
  console.log('Cases with full_text_html > 100 chars:', hasContent);
  
  // Check outcomes
  const outcomes = {};
  extracted.forEach(c => {
    outcomes[c.outcome] = (outcomes[c.outcome] || 0) + 1;
  });
  
  console.log('\nOutcome breakdown for extracted cases:');
  Object.entries(outcomes).sort((a, b) => b[1] - a[1]).forEach(([outcome, count]) => {
    console.log(`  ${outcome}: ${count}`);
  });
}

console.log('\n═══════════════════════════════════════════════\n');
