const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing UTF-8 encoding issues across blog files...\n');

// Fix daily-feature-generator.js
const generatorPath = path.join(__dirname, 'daily-feature-generator.js');
let generatorContent = fs.readFileSync(generatorPath, 'utf8');

// Fix em-dashes and common corrupted sequences
generatorContent = generatorContent.split('â€"').join('—');
generatorContent = generatorContent.split('âœ¨').join('✨');
generatorContent = generatorContent.split('ðŸ"–').join('📖');
generatorContent = generatorContent.split('ðŸ"§').join('🔧');
generatorContent = generatorContent.split('ðŸ'¡').join('💡');
generatorContent = generatorContent.split('ðŸš€').join('🚀');
generatorContent = generatorContent.split('ðŸ"'').join('🔑');
generatorContent = generatorContent.split('â€¢').join('•');
generatorContent = generatorContent.split('â†'').join('→');
generatorContent = generatorContent.split('ðŸ"°').join('📰');
generatorContent = generatorContent.split('ðŸ'‡').join('👇');

fs.writeFileSync(generatorPath, generatorContent, 'utf8');
console.log('✅ Fixed daily-feature-generator.js encoding issues');

// Fix blog/index.md
const blogIndexPath = path.join(__dirname, '..', 'blog', 'index.md');
let blogContent = fs.readFileSync(blogIndexPath, 'utf8');

// Fix specific emoji issues in blog index
blogContent = blogContent.replace(/\[� Daily News Highlights\]/g, '[📰 Daily News Highlights]');
blogContent = blogContent.replace(/id="weekly-recaps">� Weekly Recaps</g, 'id="weekly-recaps">📅 Weekly Recaps<');

fs.writeFileSync(blogIndexPath, blogContent, 'utf8');
console.log('✅ Fixed blog/index.md encoding issues');

console.log('\n✨ All encoding issues fixed!');
console.log('📝 Next: Add character limits for social media posts');
