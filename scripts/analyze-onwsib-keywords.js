const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data', 'tribunal-decisions');

// Load all ONWSIB years
const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];
let allCases = [];

years.forEach(year => {
  const file = path.join(dataDir, `onwsib-${year}-complete.json`);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    allCases = allCases.concat(data);
  }
});

console.log(`\nONWSIB Keyword Analysis (${allCases.length} cases)\n${'='.repeat(60)}`);

// Aggregate keywords
const keywords = {};
allCases.forEach(d => {
  // Try keywords_api first (CanLII format), then keywords
  const kwSource = d.keywords_api || d.keywords || [];
  if (Array.isArray(kwSource)) {
    kwSource.forEach(k => {
      // Split on — and trim
      const parts = k.split('—').map(p => p.trim());
      parts.forEach(part => {
        if (part) {
          keywords[part] = (keywords[part] || 0) + 1;
        }
      });
    });
  }
});

// Sort and display top 40
const sorted = Object.entries(keywords)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 40);

console.log('\nTop 40 Keywords:\n');
sorted.forEach(([k, v], idx) => {
  const percent = (v / allCases.length * 100).toFixed(1);
  console.log(`${(idx + 1).toString().padStart(2)}. ${k.padEnd(50)} ${v.toString().padStart(4)} (${percent.padStart(5)}%)`);
});

// Check for specific important patterns
console.log('\n\nKey Pattern Analysis:\n' + '='.repeat(60));

const patterns = {
  'work-related injury': 0,
  'pre-existing condition': 0,
  'initial entitlement': 0,
  'entitlement': 0,
  'worker': 0,
  're-employment': 0,
  'benefits': 0,
  'employer obligation': 0,
  'chronic pain': 0,
  'non-compensable': 0
};

Object.keys(patterns).forEach(pattern => {
  const lowerPattern = pattern.toLowerCase();
  Object.keys(keywords).forEach(kw => {
    if (kw.toLowerCase().includes(lowerPattern)) {
      patterns[pattern] += keywords[kw];
    }
  });
});

Object.entries(patterns)
  .sort((a, b) => b[1] - a[1])
  .forEach(([pattern, count]) => {
    const percent = (count / allCases.length * 100).toFixed(1);
    console.log(`${pattern.padEnd(30)} ${count.toString().padStart(4)} (${percent.padStart(5)}%)`);
  });
