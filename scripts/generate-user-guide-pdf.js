// Generate PDF from User Guide HTML
// Run with: node scripts/generate-user-guide-pdf.js

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting PDF generation...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Load the rendered HTML from the live site
  const url = 'https://3mpwrapp.pages.dev/user-guide';
  console.log(`📄 Loading page: ${url}`);
  
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Wait for content to load
  await page.waitForTimeout(2000);
  
  const outputPath = path.join(__dirname, '..', 'assets', 'downloads', '3mpwrapp-user-guide-full.pdf');
  
  console.log(`💾 Generating PDF: ${outputPath}`);
  
  await page.pdf({
    path: outputPath,
    format: 'Letter',
    margin: {
      top: '0.75in',
      right: '0.75in',
      bottom: '0.75in',
      left: '0.75in'
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center;"><span class="title"></span></div>',
    footerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
  });
  
  await browser.close();
  
  // Check file size
  const stats = fs.statSync(outputPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`✅ PDF generated successfully!`);
  console.log(`   File: ${outputPath}`);
  console.log(`   Size: ${fileSizeInMB} MB`);
  
})().catch(err => {
  console.error('❌ Error generating PDF:', err);
  process.exit(1);
});
