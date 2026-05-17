const fs = require('fs');

// Read all ONSBT files
const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];
let totalCases = 0;
let knownOutcomes = 0;
let unknownOutcomes = 0;
let extracted = 0;
let outcomeBreakdown = {};

console.log('\n📊 ONSBT Data Analysis After Extraction\n');
console.log('═══════════════════════════════════════════════\n');

for (const year of years) {
  try {
    const data = JSON.parse(fs.readFileSync(`data/tribunal-decisions/onsbt-${year}-complete.json`, 'utf8'));
    const yearTotal = data.length;
    const yearKnown = data.filter(c => c.outcome && c.outcome !== 'unknown').length;
    const yearExtracted = data.filter(c => c.full_text_html || c.extracted_outcome).length;
    
    // Count outcome types
    data.forEach(c => {
      const outcome = c.outcome || 'unknown';
      outcomeBreakdown[outcome] = (outcomeBreakdown[outcome] || 0) + 1;
    });
    
    totalCases += yearTotal;
    knownOutcomes += yearKnown;
    extracted += yearExtracted;
    
    console.log(`${year}: ${yearTotal} cases, ${yearKnown} known (${(yearKnown/yearTotal*100).toFixed(1)}%), ${yearExtracted} extracted`);
  } catch (e) {
    console.log(`${year}: File not found`);
  }
}

unknownOutcomes = totalCases - knownOutcomes;

console.log('\n═══════════════════════════════════════════════');
console.log(`\nTOTAL: ${totalCases} cases`);
console.log(`Known: ${knownOutcomes} (${(knownOutcomes/totalCases*100).toFixed(1)}%)`);
console.log(`Unknown: ${unknownOutcomes} (${(unknownOutcomes/totalCases*100).toFixed(1)}%)`);
console.log(`Extracted: ${extracted} cases with full text\n`);

console.log('Outcome Breakdown:');
Object.entries(outcomeBreakdown)
  .sort((a, b) => b[1] - a[1])
  .forEach(([outcome, count]) => {
    console.log(`  ${outcome}: ${count} (${(count/totalCases*100).toFixed(1)}%)`);
  });

console.log('\n═══════════════════════════════════════════════\n');
