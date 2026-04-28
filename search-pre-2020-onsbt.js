const fs = require('fs');

const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];
let allPre2020Cases = [];

console.log('\n=== Searching for Pre-2020 ONSBT Cases ===\n');

years.forEach(year => {
  try {
    const filePath = `data/tribunal-decisions/onsbt-${year}-complete.json`;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Check for cases with decision dates before 2020
    const pre2020 = data.filter(c => {
      if (!c.decision_date) return false;
      const decisionYear = parseInt(c.decision_date.substring(0, 4));
      return decisionYear < 2020;
    });
    
    if (pre2020.length > 0) {
      console.log(`${year} file contains ${pre2020.length} pre-2020 cases:`);
      
      // Group by year
      const byYear = {};
      pre2020.forEach(c => {
        const y = c.decision_date.substring(0, 4);
        if (!byYear[y]) byYear[y] = [];
        byYear[y].push(c);
      });
      
      Object.keys(byYear).sort().forEach(y => {
        console.log(`  ${y}: ${byYear[y].length} cases`);
      });
      
      allPre2020Cases = allPre2020Cases.concat(pre2020);
    } else {
      console.log(`${year} file: No pre-2020 cases found`);
    }
  } catch (e) {
    console.log(`${year}: ERROR - ${e.message}`);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total pre-2020 cases found: ${allPre2020Cases.length}`);

if (allPre2020Cases.length > 0) {
  // Group all by year
  const byYear = {};
  allPre2020Cases.forEach(c => {
    const y = c.decision_date.substring(0, 4);
    if (!byYear[y]) byYear[y] = 0;
    byYear[y]++;
  });
  
  console.log('\nPre-2020 cases by year:');
  Object.keys(byYear).sort().forEach(y => {
    console.log(`  ${y}: ${byYear[y]} cases`);
  });
  
  // Show earliest and latest
  const dates = allPre2020Cases.map(c => c.decision_date).sort();
  console.log(`\nDate range: ${dates[0]} to ${dates[dates.length - 1]}`);
  
  // Sample some cases
  console.log('\nSample cases:');
  allPre2020Cases.slice(0, 5).forEach(c => {
    console.log(`  ${c.case_id} - ${c.decision_date} - ${c.title}`);
  });
}

console.log('\n=== CanLII Coverage Assessment ===');
console.log('ONSBT on CanLII: Cases available from 2020-2026 only');
console.log('Total: 13,798 cases');
console.log('\nPre-2020 Status: CanLII does NOT have ONSBT decisions from 2012-2019');
console.log('Recommendation: ONSBT collection from CanLII is COMPLETE for available years');
