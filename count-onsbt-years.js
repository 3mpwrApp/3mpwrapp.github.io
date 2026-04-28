const fs = require('fs');

const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];
let total = 0;
const yearCounts = {};

console.log('\n=== ONSBT Decision Counts by Year ===\n');

years.forEach(year => {
  try {
    const filePath = `data/tribunal-decisions/onsbt-${year}-complete.json`;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    yearCounts[year] = data.length;
    total += data.length;
    console.log(`${year}: ${data.length.toLocaleString()} cases`);
    
    // Check for pre-2020 cases in each file
    if (year === '2020' || year === '2021') {
      const pre2020 = data.filter(c => {
        const caseYear = parseInt(c.case_id.substring(0, 4));
        return caseYear < 2020;
      });
      if (pre2020.length > 0) {
        console.log(`  └─ Contains ${pre2020.length} pre-2020 cases`);
      }
    }
  } catch (e) {
    console.log(`${year}: ERROR - ${e.message}`);
  }
});

console.log(`\nTOTAL: ${total.toLocaleString()} cases (2020-2026)`);

// Check for earliest case
console.log('\n=== Checking Date Range ===\n');
try {
  const data2020 = JSON.parse(fs.readFileSync('data/tribunal-decisions/onsbt-2020-complete.json', 'utf8'));
  const dates = data2020.map(c => c.decision_date).filter(d => d).sort();
  const caseIds = data2020.map(c => c.case_id).sort();
  console.log(`Earliest decision date: ${dates[0]}`);
  console.log(`Latest decision date: ${dates[dates.length - 1]}`);
  console.log(`Earliest case ID: ${caseIds[0]}`);
  console.log(`Latest case ID: ${caseIds[caseIds.length - 1]}`);
} catch (e) {
  console.log('Could not check date range');
}
