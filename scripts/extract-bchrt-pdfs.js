#!/usr/bin/env node
/**
 * BCHRT PDF Data Extractor
 * Extracts statistical data from BC Human Rights Tribunal annual reports (2003-2025)
 * and policy/research documents.
 *
 * Output: data/worksafebc/bchrt-pdf-extracted.json
 */

const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const SRC_DIR = 'C:\\Users\\bookw\\Downloads\\3-bchrt';
const OUT_DIR = path.join(__dirname, '../data/worksafebc');
const OUT_FILE = path.join(OUT_DIR, 'bchrt-pdf-extracted.json');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Patterns for BCHRT data
const PATTERNS = {
  complaintsReceived:    /(?:complaints?\s+(?:received|filed|registered)[:\s]+)([\d,]+)/gi,
  complaintsDecided:     /(?:complaints?\s+(?:decided|resolved|completed|dismissed)[:\s]+)([\d,]+)/gi,
  hearingsHeld:          /(?:hearings?\s+(?:held|completed)[:\s]+)([\d,]+)/gi,
  complaintsWithdrawn:   /(?:withdrawn[:\s]+)([\d,]+)/gi,
  complaintsSettled:     /(?:settled|mediation[:\s]+)([\d,]+)/gi,
  complaintsAmended:     /(?:amended[:\s]+)([\d,]+)/gi,
  remediesAwarded:       /(?:remedies?\s+(?:awarded|ordered)[:\s]+)([\d,]+|\$[\d,]+)/gi,
  compensationAwarded:   /\$\s*([\d,]+)\s*(?:compensation|damages|remedy)/gi,
  groundDisability:      /(?:disability[:\s]+)([\d,]+)\s*(?:complaint|%)/gi,
  groundRace:            /(?:race[:\s]+)([\d,]+)\s*(?:complaint|%)/gi,
  groundSex:             /(?:sex(?:ual harassment)?[:\s]+)([\d,]+)\s*(?:complaint|%)/gi,
  groundAge:             /(?:age[:\s]+)([\d,]+)\s*(?:complaint|%)/gi,
  groundReligion:        /(?:religion[:\s]+)([\d,]+)\s*(?:complaint|%)/gi,
  areaEmployment:        /(?:employment[:\s]+)([\d,]+)\s*(?:complaint|%)/gi,
  areaServices:          /(?:services[:\s]+)([\d,]+)\s*(?:complaint|%)/gi,
  areaHousing:           /(?:housing[:\s]+)([\d,]+)\s*(?:complaint|%)/gi,
  medianDays:            /(?:median\s+(?:processing\s+)?(?:days?|time)[:\s]+)([\d,]+)/gi,
  pendingYear:           /(?:pending\s+(?:at\s+)?(?:year|end)[:\s]+)([\d,]+)/gi,
};

function extractNumbers(text) {
  const results = {};
  for (const [key, pattern] of Object.entries(PATTERNS)) {
    pattern.lastIndex = 0;
    const matches = [];
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const val = m[1].replace(/,/g, '').trim();
      if (!matches.includes(val)) matches.push(val);
    }
    if (matches.length > 0) results[key] = matches;
  }
  return results;
}

function extractFiscalYear(filename) {
  // filename format: 2003-2004.pdf → fiscal year 2003-04
  const match = filename.match(/(\d{4})-(\d{4})/);
  if (match) return `${match[1]}-${match[2]}`;
  const single = filename.match(/(\d{4})/);
  if (single) return single[1];
  return null;
}

function extractSummaryStats(text) {
  // Pull out a statistics section
  const statsSection = text.match(/(?:statistics|at a glance|highlights?)[\s\S]{0,3000}/i)?.[0] || '';
  // Try to find year-over-year table rows
  const rows = [];
  const lineRe = /(?:20\d\d|19\d\d)[^\n]*[\d,]{3,}[^\n]*/g;
  let m;
  while ((m = lineRe.exec(statsSection)) !== null) {
    rows.push(m[0].trim());
  }
  return rows.slice(0, 20);
}

async function extractPdf(filepath) {
  try {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdfParse(dataBuffer, { max: 0 });
    return { text: data.text, pages: data.numpages, info: data.info || {} };
  } catch (err) {
    return { error: err.message, text: '', pages: 0, info: {} };
  }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const allFiles = fs.readdirSync(SRC_DIR)
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .sort();

  console.log(`📄 Found ${allFiles.length} PDFs in ${SRC_DIR}`);

  const results = {
    extractedAt: new Date().toISOString(),
    source: SRC_DIR,
    totalFiles: allFiles.length,
    documents: []
  };

  let processed = 0;
  for (const filename of allFiles) {
    const filepath = path.join(SRC_DIR, filename);
    const stats = fs.statSync(filepath);
    const fiscalYear = extractFiscalYear(filename);

    process.stdout.write(`[${++processed}/${allFiles.length}] ${filename} (${Math.round(stats.size/1024)}KB, FY ${fiscalYear || '?'})... `);

    const { text, pages, info, error } = await extractPdf(filepath);

    if (error) {
      console.log(`❌ ${error}`);
      results.documents.push({ filename, fiscalYear, error });
      continue;
    }

    const extracted = extractNumbers(text);
    const summaryRows = extractSummaryStats(text);

    // Identify document type
    let docType = 'annual-report';
    if (filename.match(/brief|bcli|reform|commission|vision|process|strengthen/i)) docType = 'policy-research';

    const doc = {
      filename,
      docType,
      fiscalYear,
      pages,
      fileSize: stats.size,
      info: {
        title: info.Title || '',
        subject: info.Subject || '',
      },
      extracted,
      summaryRows: summaryRows.slice(0, 15),
      textLength: text.length,
      fullText: text,
      preview: text.substring(0, 3000).replace(/\s+/g, ' ').trim(),
    };

    results.documents.push(doc);
    const numKeys = Object.keys(extracted).length;
    console.log(`✅ ${pages}pp, ${numKeys} data fields, ${summaryRows.length} table rows`);

    await delay(50);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Saved to ${OUT_FILE}`);
  console.log(`   Total docs: ${results.documents.length}`);
  console.log(`   With data:  ${results.documents.filter(d => d.extracted && Object.keys(d.extracted).length > 0).length}`);
  console.log(`   Errors: ${results.documents.filter(d => d.error).length}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
