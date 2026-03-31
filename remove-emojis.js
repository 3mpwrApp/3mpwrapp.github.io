const fs = require('fs');

const files = [
  '_posts/2026-03-31-axios-supply-chain-attack-3mpwrapp-safe.md',
  '_posts/2026-03-31-3mpwrapp-safe-from-axios-supply-chain-attack.md',
  'security.md',
  'docs/emails/beta-testers-axios-security-update.md',
  'docs/social-media/axios-security-incident-posts.md'
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove all emojis and special Unicode characters
    content = content.replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); // Emojis
    content = content.replace(/[\u{2600}-\u{26FF}]/gu, '');  // Misc symbols
    content = content.replace(/[\u{2700}-\u{27BF}]/gu, '');  // Dingbats
    content = content.replace(/[\u{FE00}-\u{FE0F}]/gu, '');  // Variation selectors
    content = content.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, ''); // Flags
    content = content.replace(/[\u{1F900}-\u{1F9FF}]/gu, ''); // Supplemental symbols
    content = content.replace(/[\u{2300}-\u{23FF}]/gu, '');  // Miscellaneous Technical
    content = content.replace(/[\u{200D}\u{FEF0}-\u{FEFF}]/gu, ''); // Zero-width joiners
    
    // Clean up corrupted emoji encodings
    content = content.replace(/ðŸ[^\s]*/g, '');
    
    // Clean up:Multiple spaces to single space
    content = content.replace(/  +/g, ' ');
    
    // Clean up: Remove spaces at start of lines that are now empty
    content = content.replace(/^[ \t]+$/gm, '');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ Cleaned: ${file}`);
  } catch (error) {
    console.error(`✗ Error with ${file}:`, error.message);
  }
});

console.log('\nAll files processed!');
