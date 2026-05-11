const fs = require('fs');
const path = require('path');

// Read file as buffer to preserve exact bytes
const filePath = path.join(__dirname, 'daily-feature-generator.js');
const buffer = fs.readFileSync(filePath);

// Convert to string (it will be mangled UTF-8)
let content = buffer.toString('utf8');

console.log('Original length:', content.length);
console.log('Sample of corrupted text:', content.substring(2628, 2635));

// These are the exact byte sequences that appear when UTF-8 is double-encoded or misinterpreted
const replacements = [
  // Em-dash
  [/â€"/g, '—'],
  // Sparkles emoji
  [/âœ¨/g, '✨'],
  // Book emoji  
  [/ðŸ"–/g, '📖'],
  // Wrench emoji
  [/ðŸ"§/g, '🔧'],
  // Bulb emoji
  [/ðŸ'¡/g, '💡'],
  // Rocket emoji
  [/ðŸš€/g, '🚀'],
  // Key emoji
  [/ðŸ"'/g, '🔑'],
  // Bullet
  [/â€¢/g, '•'],
  // Arrow
  [/â†'/g, '→'],
  // Newspaper emoji
  [/ðŸ"°/g, '📰'],
  // Pointing down emoji
  [/ðŸ'‡/g, '👇'],
];

let fixedContent = content;
let totalReplacements = 0;

replacements.forEach(([pattern, replacement]) => {
  const before = fixedContent.length;
  fixedContent = fixedContent.replace(pattern, replacement);
  const after = fixedContent.length;
  const count = (before - after + replacement.length) / (pattern.source.length - replacement.length + 1);
  if (count > 0) {
    console.log(`Replaced ${count} instances of ${pattern.source.substring(0, 10)}...`);
    totalReplacements += count;
  }
});

// Write back as UTF-8
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log(`\n✅ Fixed ${totalReplacements} encoding issues`);
console.log('New length:', fixedContent.length);
console.log('Sample after fix:', fixedContent.substring(2628, 2635));
