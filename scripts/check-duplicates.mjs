import fs from 'fs';

const content = fs.readFileSync('research.md', 'utf8');

// Extract only actual content lines (not CSS, HTML, or style declarations)
const lines = content.split('\n')
  .map(l => l.trim())
  .filter(l => 
    l.length > 50 && 
    !l.startsWith('<') && 
    !l.startsWith('//') && 
    !l.startsWith('/*') && 
    !l.startsWith('*') && 
    !l.startsWith('@media') &&
    !l.includes('color:') && 
    !l.includes('background:') && 
    !l.includes('border:') &&
    !l.includes('padding:') &&
    !l.includes('margin:') &&
    !l.includes('font-')
  );

const lineCount = {};
const duplicates = [];

lines.forEach((line, idx) => {
  if (lineCount[line]) {
    lineCount[line].push(idx);
    if (lineCount[line].length === 2) {
      duplicates.push({
        line: line.substring(0, 100),
        count: 2,
        first: lineCount[line][0],
        second: idx
      });
    }
  } else {
    lineCount[line] = [idx];
  }
});

console.log('Total content lines checked:', lines.length);
console.log('Duplicate content lines found:', duplicates.length);

if (duplicates.length > 0) {
  console.log('\nDuplicate content lines:');
  duplicates.forEach(d => {
    console.log(`"${d.line}..."`);
    console.log(`  (appears at positions: ${d.first} and ${d.second})`);
    console.log('');
  });
}
