const fs = require('fs');

const data = JSON.parse(fs.readFileSync('_site/accessibility-reports-2025-11-08T21-34-37/accessibility-audit-2025-11-08T21-38-23.json', 'utf8'));

const contrastIssues = {};

data.forEach(page => {
  page.violations.forEach(v => {
    if (v.id === 'color-contrast-enhanced' || v.id === 'color-contrast') {
      v.nodes.forEach(node => {
        const colorData = node.any[0].data;
        const key = `${colorData.fgColor} on ${colorData.bgColor}`;
        
        if (!contrastIssues[key]) {
          contrastIssues[key] = {
            fg: colorData.fgColor,
            bg: colorData.bgColor,
            ratio: colorData.contrastRatio,
            required: colorData.expectedContrastRatio,
            count: 0,
            examples: []
          };
        }
        
        contrastIssues[key].count++;
        if (contrastIssues[key].examples.length < 3) {
          contrastIssues[key].examples.push({
            page: page.pageInfo,
            element: node.html.substring(0, 100)
          });
        }
      });
    }
  });
});

console.log('=' .repeat(80));
console.log('COLOR CONTRAST ISSUES - PRIORITIZED FIX LIST');
console.log('='.repeat(80));

Object.entries(contrastIssues)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([combo, data]) => {
    console.log(`\n${combo}`);
    console.log(`  Current ratio: ${data.ratio.toFixed(2)}:1`);
    console.log(`  Required ratio: ${data.required}`);
    console.log(`  Instances: ${data.count}`);
    console.log(`  Examples:`);
    data.examples.forEach(ex => {
      console.log(`    - ${ex.page}: ${ex.element}...`);
    });
  });

console.log('\n' + '='.repeat(80));
console.log(`Total unique color combinations to fix: ${Object.keys(contrastIssues).length}`);
console.log('='.repeat(80));
