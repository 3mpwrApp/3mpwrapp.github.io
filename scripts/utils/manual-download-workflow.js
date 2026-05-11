#!/usr/bin/env node
/**
 * PLAN C: MANUAL DOWNLOAD WORKFLOW
 * 
 * Step 1: Generate URL list for manual downloading
 * Step 2: You download them in your real browser
 * Step 3: We process the saved HTML files
 * 
 * USAGE:
 *   node scripts/manual-download-workflow.js generate <file> [count]
 *   node scripts/manual-download-workflow.js process <htmlDir> <file>
 * 
 * EXAMPLES:
 *   # Generate list of 20 URLs to download
 *   node scripts/manual-download-workflow.js generate onwsiat-2026-ultra-slow.json 20
 *   
 *   # Process saved HTML files
 *   node scripts/manual-download-workflow.js process data/saved-html onwsiat-2026-ultra-slow.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const SAVED_HTML_DIR = path.join(__dirname, '..', 'data', 'saved-html');

/**
 * Extract text from saved HTML file
 */
function extractTextFromHTML(html) {
  // Remove scripts and styles
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Try to extract main content
  const strategies = [
    /<div[^>]*class="[^"]*documentContentBlock[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i,
    /<div[^>]*id="origdoc"[^>]*>([\s\S]*?)<\/div>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i
  ];
  
  let extracted = null;
  for (const regex of strategies) {
    const match = text.match(regex);
    if (match && match[1] && match[1].length > 100) {
      extracted = match[1];
      break;
    }
  }
  
  if (!extracted) {
    extracted = text; // Fallback to full HTML
  }
  
  // Strip HTML tags
  extracted = extracted.replace(/<[^>]+>/g, ' ');
  
  // Decode entities
  extracted = extracted
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
  
  // Clean whitespace
  extracted = extracted.replace(/\s+/g, ' ').trim();
  
  return extracted;
}

/**
 * Generate download list
 */
function generateDownloadList(filePath, count = 20) {
  console.log('\n📋 GENERATING DOWNLOAD LIST');
  console.log('===========================\n');
  
  const filename = path.basename(filePath);
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(DATA_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`);
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  
  if (!Array.isArray(data)) {
    console.error('❌ File is not an array');
    return;
  }
  
  // Find decisions without full text
  const needingText = data.filter(d => !d.full_text || d.full_text.length < 100);
  
  console.log(`Total decisions: ${data.length}`);
  console.log(`Need full text: ${needingText.length}`);
  console.log(`Will generate URLs for: ${Math.min(count, needingText.length)}`);
  console.log('');
  
  // Create output files
  const timestamp = Date.now();
  const urlListFile = path.join(DATA_DIR, `download-urls-${timestamp}.txt`);
  const instructionsFile = path.join(DATA_DIR, `download-instructions-${timestamp}.md`);
  
  // Generate URL list
  const urlsToDownload = needingText.slice(0, count);
  const urls = urlsToDownload.map((d, i) => {
    const url = d.url || d.data?.url || d.caseUrl || d.link;
    const id = d.caseId || d.case_id || `decision-${i}`;
    return { url, id, index: i };
  }).filter(item => item.url);
  
  // Write URL list
  const urlListContent = urls.map(item => `${item.url}`).join('\n');
  fs.writeFileSync(urlListFile, urlListContent, 'utf8');
  
  // Write instructions
  const instructions = `# Manual Download Instructions

**Generated:** ${new Date().toISOString()}  
**File:** ${filename}  
**URLs to download:** ${urls.length}

## 📥 Step 1: Download Pages

### Method A: One-by-one (Recommended for accuracy)

For each URL below:

1. **Open URL** in your browser (Chrome/Firefox/Edge)
2. **Wait for page to fully load** (3-5 seconds)
3. **Right-click** anywhere on the page → **"Save As"** (or Ctrl+S)
4. **Save as:** 
   - Type: **"Webpage, Complete"** or **"Web Page, HTML Only"**
   - Filename: Use the **exact filename** listed below (very important!)
   - Location: \`${SAVED_HTML_DIR}\`
5. **Move to next URL**

### Method B: Bulk download (Faster but may miss some)

1. Install browser extension **"Download All URLs"** or **"Bulk URL Opener"**
2. Load all URLs from: \`${path.basename(urlListFile)}\`
3. Save each page with its case ID as filename

---

## 🔗 URLs to Download

${urls.map((item, i) => {
  const filename = `${item.id}.html`;
  return `### ${i + 1}. ${item.id}

**URL:** ${item.url}  
**Save as:** \`${filename}\`  
**Index:** ${item.index}

---`;
}).join('\n\n')}

## 📝 Naming Convention

**CRITICAL:** Files must be named exactly as shown above so the processor can match them!

Format: \`<case-id>.html\`

Examples:
- \`kjm50.html\`
- \`kjm4k.html\`
- \`2023canlii138774.html\`

---

## ✅ Step 2: Process Downloaded Files

Once you've saved the HTML files, run:

\`\`\`bash
node scripts/manual-download-workflow.js process data/saved-html ${filename}
\`\`\`

This will:
1. Read each HTML file
2. Extract the decision text
3. Add it to your JSON file
4. Generate a report

---

## 📊 Progress Tracking

- [ ] Downloaded ${urls.length} HTML files
- [ ] Verified files exist in \`${SAVED_HTML_DIR}\`
- [ ] Ran processor script
- [ ] Checked report for errors

---

## 🆘 Troubleshooting

**Q: Page won't load / shows error**  
A: CanLII might be temporarily down. Wait 5 minutes and retry.

**Q: Save dialog doesn't show "Webpage, Complete"**  
A: Use "Web Page, HTML Only" - that works too!

**Q: Forgot which filename to use**  
A: Check this file - each URL has the exact filename below it.

**Q: Can I save to a different folder?**  
A: Yes, but remember to use that folder in Step 2 command.

---

## 📁 File Locations

- URL list: \`${urlListFile}\`
- Instructions: \`${instructionsFile}\`
- Save HTML to: \`${SAVED_HTML_DIR}\`
- JSON file: \`${fullPath}\`
`;

  fs.writeFileSync(instructionsFile, instructions, 'utf8');
  
  // Create saved-html directory
  if (!fs.existsSync(SAVED_HTML_DIR)) {
    fs.mkdirSync(SAVED_HTML_DIR, { recursive: true });
  }
  
  // Output summary
  console.log('✅ Files created:');
  console.log(`   📄 ${path.basename(urlListFile)}`);
  console.log(`   📄 ${path.basename(instructionsFile)}`);
  console.log('');
  console.log('📝 NEXT STEPS:');
  console.log('');
  console.log('1. Open instructions file:');
  console.log(`   code ${instructionsFile}`);
  console.log('');
  console.log('2. Follow instructions to download HTML files');
  console.log('');
  console.log('3. Process downloaded files:');
  console.log(`   node scripts/manual-download-workflow.js process data/saved-html ${filename}`);
  console.log('');
  console.log(`💡 TIP: Start with just 5 URLs to test the workflow!`);
  console.log('');
}

/**
 * Process saved HTML files
 */
function processSavedHTML(htmlDir, jsonFile) {
  console.log('\n⚙️  PROCESSING SAVED HTML FILES');
  console.log('==============================\n');
  
  const fullJsonPath = path.isAbsolute(jsonFile) ? jsonFile : path.join(DATA_DIR, jsonFile);
  
  if (!fs.existsSync(fullJsonPath)) {
    console.error(`❌ JSON file not found: ${fullJsonPath}`);
    return;
  }
  
  if (!fs.existsSync(htmlDir)) {
    console.error(`❌ HTML directory not found: ${htmlDir}`);
    console.error('');
    console.error('Did you download the HTML files?');
    return;
  }
  
  // Load JSON
  const data = JSON.parse(fs.readFileSync(fullJsonPath, 'utf8'));
  
  if (!Array.isArray(data)) {
    console.error('❌ JSON is not an array');
    return;
  }
  
  // Get HTML files
  const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
  
  console.log(`JSON decisions: ${data.length}`);
  console.log(`HTML files found: ${htmlFiles.length}`);
  console.log('');
  
  if (htmlFiles.length === 0) {
    console.error('❌ No HTML files found!');
    console.error('');
    console.error('Make sure you:');
    console.error('1. Downloaded the pages');
    console.error('2. Saved them to the correct directory');
    console.error('3. Named them with .html extension');
    return;
  }
  
  // Stats
  const stats = {
    processed: 0,
    matched: 0,
    unmatched: 0,
    errors: []
  };
  
  // Process each HTML file
  for (const htmlFile of htmlFiles) {
    stats.processed++;
    const htmlPath = path.join(htmlDir, htmlFile);
    const caseId = path.basename(htmlFile, '.html');
    
    console.log(`📄 Processing: ${htmlFile}`);
    
    try {
      // Read HTML
      const html = fs.readFileSync(htmlPath, 'utf8');
      
      // Extract text
      const fullText = extractTextFromHTML(html);
      
      if (fullText.length < 100) {
        throw new Error(`Text too short: ${fullText.length} chars`);
      }
      
      console.log(`   ✓ Extracted ${fullText.length} chars`);
      
      // Find matching decision in JSON
      let matched = false;
      
      for (const decision of data) {
        const decisionId = decision.caseId || 
                          decision.case_id || 
                          decision.url?.split('/').pop() ||
                          decision.data?.url?.split('/').pop();
        
        if (decisionId && decisionId === caseId) {
          decision.full_text = fullText;
          decision.full_text_length = fullText.length;
          
          if (decision.data_quality) {
            decision.data_quality.has_full_text = true;
          }
          
          matched = true;
          stats.matched++;
          console.log(`   ✓ Matched to decision: ${decisionId}`);
          break;
        }
      }
      
      if (!matched) {
        stats.unmatched++;
        console.warn(`   ⚠️  No matching decision found for: ${caseId}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      stats.errors.push({ file: htmlFile, error: error.message });
    }
  }
  
  // Save updated JSON
  const backupPath = fullJsonPath.replace('.json', `-BACKUP-${Date.now()}.json`);
  fs.copyFileSync(fullJsonPath, backupPath);
  console.log(`\n💾 Backup: ${path.basename(backupPath)}`);
  
  fs.writeFileSync(fullJsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`💾 Updated: ${path.basename(fullJsonPath)}`);
  
  // Summary
  console.log('\n\n📊 SUMMARY');
  console.log('==========');
  console.log(`HTML files processed: ${stats.processed}`);
  console.log(`✅ Matched to decisions: ${stats.matched}`);
  console.log(`⚠️  Unmatched: ${stats.unmatched}`);
  console.log(`❌ Errors: ${stats.errors.length}`);
  
  if (stats.errors.length > 0 && stats.errors.length <= 10) {
    console.log('\nErrors:');
    stats.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  }
  
  if (stats.matched > 0) {
    console.log('\n✅ NEXT STEP: Run outcome extraction');
    console.log('   node scripts/re-extract-outcomes-with-notebooklm-patterns.js wsiat 2026');
  }
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.error('❌ Usage:');
    console.error('');
    console.error('Generate download list:');
    console.error('  node scripts/manual-download-workflow.js generate <file> [count]');
    console.error('');
    console.error('Process saved HTML:');
    console.error('  node scripts/manual-download-workflow.js process <htmlDir> <file>');
    console.error('');
    console.error('Examples:');
    console.error('  node scripts/manual-download-workflow.js generate onwsiat-2026-ultra-slow.json 20');
    console.error('  node scripts/manual-download-workflow.js process data/saved-html onwsiat-2026-ultra-slow.json');
    return;
  }
  
  if (command === 'generate') {
    const file = args[1];
    const count = args[2] ? parseInt(args[2]) : 20;
    
    if (!file) {
      console.error('❌ Missing file argument');
      return;
    }
    
    generateDownloadList(file, count);
    
  } else if (command === 'process') {
    const htmlDir = args[1];
    const file = args[2];
    
    if (!htmlDir || !file) {
      console.error('❌ Missing arguments');
      console.error('Usage: node manual-download-workflow.js process <htmlDir> <file>');
      return;
    }
    
    processSavedHTML(htmlDir, file);
    
  } else {
    console.error(`❌ Unknown command: ${command}`);
    console.error('Use: generate or process');
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateDownloadList, processSavedHTML, extractTextFromHTML };
