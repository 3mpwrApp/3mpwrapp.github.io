const fs = require('fs');
const lines = fs.readFileSync('daily-feature-generator.js', 'utf8').split('\n');
console.log('Finding key lines...\n');
lines.forEach((l, i) => {
  if (l.includes('TUTORIALS') || l.includes('selectFeature()')) {
    console.log(`Line ${i + 1}: ${l.trim().substring(0, 80)}`);
  }
  if (l.trim() === '}' && lines[i + 1] && lines[i + 1].trim() === '];' && lines[i-1] && lines[i-1].includes('benefits')) {
    console.log(`\n✨ Features array closing bracket at line ${i + 1}`);
  }
});
