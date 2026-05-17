const fs = require('fs');

const tribunals = ['onsbt', 'onwsib', 'onhrt', 'onlrb', 'onca'];
const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

console.log('\n=== Ontario Tribunal Case Counts ===\n');

let grandTotal = 0;

tribunals.forEach(tribunal => {
  let total = 0;
  years.forEach(year => {
    try {
      const filePath = `data/tribunal-decisions/${tribunal}-${year}-complete.json`;
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      total += data.length;
    } catch(e) {
      // File doesn't exist, skip
    }
  });
  
  const name = {
    'onsbt': 'ONSBT (Ontario Social Benefits Tribunal)',
    'onwsib': 'ONWSIB (Workplace Safety Insurance Board)',
    'onhrt': 'ONHRT (Human Rights Tribunal)',
    'onlrb': 'ONLRB (Labour Relations Board)',
    'onca': 'ONCA (Court of Appeal)'
  }[tribunal];
  
  console.log(`${name}: ${total.toLocaleString()} cases`);
  grandTotal += total;
});

console.log(`\n${'='.repeat(50)}`);
console.log(`TOTAL ONTARIO: ${grandTotal.toLocaleString()} cases\n`);
