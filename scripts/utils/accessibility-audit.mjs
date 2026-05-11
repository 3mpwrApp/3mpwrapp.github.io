import fs from 'fs';
import path from 'path';

console.log('=== COMPREHENSIVE ACCESSIBILITY AUDIT ===\n');

// Check research page
console.log('1. RESEARCH PAGE AUDIT');
const researchContent = fs.readFileSync('research.md', 'utf8');

// Check for inline styles that might not be accessible
const inlineColorMatches = researchContent.match(/style="[^"]*color:\s*#([0-9a-fA-F]{3,6})/g) || [];
console.log(`   Inline color styles: ${inlineColorMatches.length}`);

// Check if there's dark mode override CSS
const hasDarkModeCSS = researchContent.includes('@media (prefers-color-scheme: dark)');
const hasHighContrastCSS = researchContent.includes('@media (prefers-contrast: high)') || researchContent.includes('@media (prefers-contrast: more)');
console.log(`   Dark mode CSS: ${hasDarkModeCSS ? '✓' : '✗'}`);
console.log(`   High contrast CSS: ${hasHighContrastCSS ? '✓' : '✗'}`);

// Check for low contrast colors
const lowContrastPatterns = ['#666', '#999', '#ccc', '#888'];
let lowContrastCount = 0;
let lowContrastFixed = 0;

lowContrastPatterns.forEach(color => {
  const matches = researchContent.match(new RegExp(color, 'gi')) || [];
  const inDarkMode = researchContent.match(new RegExp(`prefers-color-scheme: dark[\\s\\S]{0,500}${color}`, 'gi')) || [];
  lowContrastCount += matches.length;
  lowContrastFixed += inDarkMode.length;
});

console.log(`   Low contrast colors found: ${lowContrastCount}`);
console.log(`   Low contrast colors fixed in dark mode: ${lowContrastFixed}`);

// Check knowledge base
console.log('\n2. KNOWLEDGE BASE AUDIT');
const kbFiles = fs.readdirSync('knowledge-base').filter(f => f.endsWith('.md'));
console.log(`   Total KB articles: ${kbFiles.length}`);

let kbIssues = 0;
kbFiles.forEach(file => {
  const content = fs.readFileSync(path.join('knowledge-base', file), 'utf8');
  const hasInlineColors = /<[^>]+style="[^"]*color:/.test(content);
  const hasInlineStyle = /<style>/.test(content);
  
  if (hasInlineColors && !hasInlineStyle) {
    console.log(`   ⚠ ${file}: Inline colors without style tag`);
    kbIssues++;
  }
});
console.log(`   Articles with potential issues: ${kbIssues}`);

// Check guides
console.log('\n3. GUIDES AUDIT');
const guideFiles = fs.readdirSync('guides').filter(f => f.endsWith('.md'));
console.log(`   Total guides: ${guideFiles.length}`);

let guideIssues = 0;
guideFiles.forEach(file => {
  const content = fs.readFileSync(path.join('guides', file), 'utf8');
  const hasInlineColors = /<[^>]+style="[^"]*color:/.test(content);
  const hasInlineStyle = /<style>/.test(content);
  
  if (hasInlineColors && !hasInlineStyle) {
    console.log(`   ⚠ ${file}: Inline colors without style tag`);
    guideIssues++;
  }
});
console.log(`   Guides with potential issues: ${guideIssues}`);

// Check templates
console.log('\n4. TEMPLATES AUDIT');
const templateFiles = fs.readdirSync('templates').filter(f => f.endsWith('.md'));
console.log(`   Total templates: ${templateFiles.length}`);

let templateIssues = 0;
templateFiles.forEach(file => {
  const content = fs.readFileSync(path.join('templates', file), 'utf8');
  const hasInlineColors = /<[^>]+style="[^"]*color:/.test(content);
  const hasInlineStyle = /<style>/.test(content);
  
  if (hasInlineColors && !hasInlineStyle) {
    console.log(`   ⚠ ${file}: Inline colors without style tag`);
    templateIssues++;
  }
});
console.log(`   Templates with potential issues: ${templateIssues}`);

// Check for site-wide CSS
console.log('\n5. SITE-WIDE CSS AUDIT');
const cssFiles = [
  'assets/css/accessibility-first-colors.css',
  'assets/css/wcag-aaa-colors.css',
  'assets/css/universal-text-legibility.css'
];

cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasDark = content.includes('prefers-color-scheme: dark');
    const hasHighContrast = content.includes('prefers-contrast: high') || content.includes('prefers-contrast: more');
    console.log(`   ${path.basename(file)}:`);
    console.log(`     Dark mode: ${hasDark ? '✓' : '✗'}`);
    console.log(`     High contrast: ${hasHighContrast ? '✓' : '✗'}`);
  }
});

// Summary
console.log('\n=== SUMMARY ===');
const totalIssues = kbIssues + guideIssues + templateIssues;
if (totalIssues === 0 && hasDarkModeCSS && hasHighContrastCSS) {
  console.log('✓ ALL PAGES PASS ACCESSIBILITY AUDIT');
  console.log('✓ Dark mode supported');
  console.log('✓ High contrast mode supported');
  console.log('✓ No inline color issues found');
} else {
  console.log(`⚠ ${totalIssues} potential issues found`);
  if (!hasDarkModeCSS) console.log('✗ Research page missing dark mode CSS');
  if (!hasHighContrastCSS) console.log('✗ Research page missing high contrast CSS');
}
