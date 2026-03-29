# User Guide PDF Generation

## How to Create PDF from HTML

The user guide HTML file exists at: `assets/downloads/3mpwrapp-user-guide-full.html`

To create a PDF version, use one of these methods:

### Method 1: Browser Print to PDF
1. Open `3mpwrapp-user-guide-full.html` in Chrome/Edge
2. Press Ctrl+P (Print)
3. Choose "Save as PDF" as destination
4. Save as `3mpwrapp-user-guide-full.pdf`

### Method 2: Online Converter
1. Upload HTML file to: https://www.sejda.com/html-to-pdf
2. Download resulting PDF
3. Save as `3mpwrapp-user-guide-full.pdf`

### Method 3: Command Line (if wkhtmltopdf installed)
```bash
wkhtmltopdf assets/downloads/3mpwrapp-user-guide-full.html assets/downloads/3mpwrapp-user-guide-full.pdf
```

### Method 4: Node.js Puppeteer
```javascript
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://' + __dirname + '/3mpwrapp-user-guide-full.html', {waitUntil: 'networkidle0'});
  await page.pdf({path: '3mpwrapp-user-guide-full.pdf', format: 'A4'});
  await browser.close();
})();
```

## Current Status
- ✅ HTML version available
- ⏳ PDF version pending creation (use one of the methods above)
