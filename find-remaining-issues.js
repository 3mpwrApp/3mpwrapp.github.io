const fs = require('fs');

const data = JSON.parse(fs.readFileSync('accessibility-audit-2025-11-09T01-30-09.json', 'utf8'));

console.log('='.repeat(80));
console.log('REMAINING ACCESSIBILITY ISSUES TO FIX');
console.log('='.repeat(80));

data.forEach(page => {
  const headingIssues = page.violations.filter(v => v.id === 'heading-order');
  const imageIssues = page.violations.filter(v => v.id === 'image-redundant-alt');
  const landmarkIssues = page.violations.filter(v => v.id === 'landmark-unique');
  const regionIssues = page.violations.filter(v => v.id === 'region');
  
  if (headingIssues.length > 0 || imageIssues.length > 0 || landmarkIssues.length > 0 || regionIssues.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('PAGE:', page.pageInfo);
    console.log('='.repeat(80));
    
    if (headingIssues.length > 0) {
      console.log('\n🔴 HEADING ORDER ISSUES:');
      headingIssues.forEach(issue => {
        issue.nodes.forEach((node, i) => {
          console.log(`\n  ${i + 1}. ${node.html}`);
          console.log(`     Issue: ${node.failureSummary}`);
        });
      });
    }
    
    if (imageIssues.length > 0) {
      console.log('\n🔴 IMAGE REDUNDANT ALT ISSUES:');
      imageIssues.forEach(issue => {
        issue.nodes.forEach((node, i) => {
          console.log(`\n  ${i + 1}. ${node.html}`);
          console.log(`     Issue: ${node.failureSummary}`);
        });
      });
    }
    
    if (landmarkIssues.length > 0) {
      console.log('\n🔴 LANDMARK UNIQUE ISSUES:');
      landmarkIssues.forEach(issue => {
        issue.nodes.forEach((node, i) => {
          console.log(`\n  ${i + 1}. ${node.html}`);
          console.log(`     Issue: ${node.failureSummary}`);
        });
      });
    }
    
    if (regionIssues.length > 0) {
      console.log('\n🔴 REGION ISSUES:');
      regionIssues.forEach(issue => {
        issue.nodes.forEach((node, i) => {
          console.log(`\n  ${i + 1}. ${node.html.substring(0, 200)}...`);
          console.log(`     Issue: ${node.failureSummary}`);
        });
      });
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log('END OF REPORT');
console.log('='.repeat(80));
