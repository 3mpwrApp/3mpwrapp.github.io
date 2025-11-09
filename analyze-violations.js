const fs = require('fs');

const data = JSON.parse(fs.readFileSync('_site/accessibility-reports-2025-11-08T21-34-37/accessibility-audit-2025-11-08T21-38-23.json', 'utf8'));

const violations = {};
const violationsByPage = {};

data.forEach(page => {
  const pageName = page.pageInfo;
  violationsByPage[pageName] = page.violations.length;
  
  page.violations.forEach(v => {
    if (!violations[v.id]) {
      violations[v.id] = {
        count: 0,
        impact: v.impact,
        description: v.description,
        pages: []
      };
    }
    violations[v.id].count += v.nodes.length;
    violations[v.id].pages.push({
      page: pageName,
      nodes: v.nodes.length
    });
  });
});

console.log('=' .repeat(70));
console.log('VIOLATION SUMMARY BY TYPE');
console.log('='.repeat(70));

Object.entries(violations)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([id, data]) => {
    console.log(`\n${id} (${data.impact}): ${data.count} instances`);
    console.log(`  ${data.description}`);
    console.log(`  Affects ${data.pages.length} page(s)`);
  });

console.log('\n' + '='.repeat(70));
console.log('VIOLATIONS BY PAGE');
console.log('='.repeat(70));

Object.entries(violationsByPage)
  .sort((a, b) => b[1] - a[1])
  .forEach(([page, count]) => {
    console.log(`${page}: ${count} violation type(s)`);
  });

console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`Total unique violation types: ${Object.keys(violations).length}`);
console.log(`Total violation instances: ${Object.values(violations).reduce((sum, v) => sum + v.count, 0)}`);
console.log(`Pages with violations: ${Object.keys(violationsByPage).length}`);
