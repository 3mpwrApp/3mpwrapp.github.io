#!/usr/bin/env node
/**
 * BCWCAT PDF Data Extractor
 * Extracts statistical data from BCWCAT annual reports, quarterly reports,
 * WorkSafeBC statistics PDFs, and policy review documents.
 *
 * Output: data/worksafebc/bcwcat-pdf-extracted.json
 */

const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const SRC_DIR = 'C:\\Users\\bookw\\Downloads\\2-bcwcat';
const OUT_DIR = path.join(__dirname, '../data/worksafebc');
const OUT_FILE = path.join(OUT_DIR, 'bcwcat-pdf-extracted.json');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Files to prioritize for deep extraction (annual reports + stats books + quarterly)
const PRIORITY_FILES = [
  // WorkSafeBC official statistics books (claims data)
  'statistics-2017-pdf-en.pdf',
  'statistics-2018-pdf-en.pdf',
  'statistics-2019-pdf-en.pdf',
  'statistics-2020-pdf-en.pdf',
  'statistics-2021-supplementary-booklet-pdf-en.pdf',
  'statistics-2020-supplementary-booklet-pdf-en.pdf',
  'statistics-2022-pdf-en.pdf',
  'statistics-2023-pdf-en.pdf',
  'statistics-2024-pdf-en.pdf',
  // WCAT Annual Reports
  'WCATQ42019Report.pdf',
  'wcat-2020-annual-report.pdf',
  'wcat-2021-annual-report.pdf',
  'WCAT-Annual-Report-2022.pdf',
  'WCAT-Annual-Report-2023.pdf',
  'WCAT-Annual-Report-2024.pdf',
  // WCAT Quarterly Reports 2020-2026
  '2020-05-04_WCATQ1QuarterlyReport.pdf',
  'Q2-2020QuarterlyCommunityReport02July2020.pdf',
  'WCATQ32020QuarterlyReport.pdf',
  'q4-2020-quarterly-report.pdf',
  'wcat-2021-q1-report.pdf',
  'wcat-2021-q2-report.pdf',
  'wcat-2021-q3-report.pdf',
  'wcat-2021-q4-report.pdf',
  'wcat-2022-q1-report.pdf',
  'wcat-2022-q2-report.pdf',
  'wcat-2022-q3-report.pdf',
  'Q4-2022-quarterly-report.pdf',
  '2023-03-31_Q1.pdf',
  '2023-06-30_Q2-Report-UPDATED-Sep-7-2023.pdf',
  'WCAT-2023-q3-report.pdf',
  'WCAT-2023-Q4-report.pdf',
  'WCAT-2024-Q1-report.pdf',
  'wcat-2024-q2-report.pdf',
  'wcat-2024-q3-report.pdf',
  '2024-Q4-Report.pdf',
  'WCAT_2025-Q1-Report.pdf',
  'WCAT_2025-Q2-Report.pdf',
  'wcat-2025-q3-report.pdf',
  'WCAT_2025-Q4-Report.pdf',
  '2026-Q1-Report.pdf',
  // PIDA (Privacy/Information) Reports
  'PIDA-report-2023.pdf',
  'PIDA-report-2024.pdf',
  'PIDA-report-2025.pdf',
  // WorkSafeBC Policy Reviews
  'new-directions-report-wcb-review-2019-pdf-en.pdf',
  'addendum-report-new-directions-wcb-review-2019-pdf-en.pdf',
  'restoring-balance-worker-centred-approach-workers-compensa\u2026',
  'final-report-worksafebc-review-action-plan-pdf-en.pdf',
  'review-action-plan-implementation-status-report-pdf-en.pdf',
  // NWISP (National Work Injury Stats - BC data)
  '2023-Nwisp-Publicaiton-public-version.pdf',
];

// Patterns to extract numbers from text
const PATTERNS = {
  // WCAT appeal statistics
  appealsReceived: /(?:appeals?\s+(?:received|filed|registered|submitted)[:\s]+)([\d,]+)/gi,
  appealsDecided: /(?:appeals?\s+(?:decided|completed|resolved|closed)[:\s]+)([\d,]+)/gi,
  appealsAllowed: /(?:allowed[:\s]+)([\d,]+)/gi,
  appealsDenied: /(?:denied|dismissed|disallowed)[:\s]+([\d,]+)/gi,
  appealsPartial: /(?:partially\s+allowed|varied)[:\s]+([\d,]+)/gi,
  appealsPending: /(?:pending|outstanding|backlog)[:\s]+([\d,]+)/gi,
  // WorkSafeBC claims
  totalClaims: /(?:total\s+(?:claims?|accepted\s+claims?)[:\s]+)([\d,]+)/gi,
  lostTimeClaims: /(?:lost[\s-]time\s+claims?[:\s]+)([\d,]+)/gi,
  shortTermClaims: /(?:short[\s-]term\s+(?:disability\s+)?claims?[:\s]+)([\d,]+)/gi,
  disallowedClaims: /(?:disallowed\s+claims?[:\s]+)([\d,]+)/gi,
  fatalities: /(?:fatalities|fatal\s+injuries)[:\s]+([\d,]+)/gi,
  // Rates
  allowRate: /(?:allow(?:ance)?\s+rate|success\s+rate)[:\s]+([\d.]+\s*%)/gi,
  medianDays: /(?:median\s+(?:processing\s+)?(?:days?|time)[:\s]+)([\d,.]+)/gi,
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

function extractYearContext(text, filename) {
  // Try to determine year from filename
  const yearInName = filename.match(/20([12][0-9])/);
  if (yearInName) return `20${yearInName[1]}`;
  // Try from text
  const yearInText = text.match(/(?:annual report|statistics)\s+(?:for\s+)?(\d{4})/i);
  if (yearInText) return yearInText[1];
  return null;
}

function extractKeyTables(text) {
  const tables = [];
  // Look for table-like sections with year + number patterns
  const lines = text.split('\n');
  let inTable = false;
  let tableLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Detect table header rows
    if (line.match(/\d{4}.*\d{4}|appeals?\s+received|claims?\s+filed|allowed.*denied/i)) {
      inTable = true;
      tableLines = [line];
    } else if (inTable) {
      if (line.match(/^\d[\d,\s.%]+$/) || line.match(/\d{4}[:\s]+[\d,]+/)) {
        tableLines.push(line);
      } else if (tableLines.length > 1 && line === '') {
        tables.push(tableLines.join('\n'));
        inTable = false;
        tableLines = [];
      }
    }
  }
  if (tableLines.length > 1) tables.push(tableLines.join('\n'));
  return tables.slice(0, 5); // max 5 tables per doc
}

function categorizeFile(filename) {
  const f = filename.toLowerCase();
  if (f.match(/statistics-20\d\d|stats20\d\d|stats-20\d\d/)) return 'worksafebc-statistics';
  if (f.match(/wcat.*annual|annual.*report/)) return 'wcat-annual';
  if (f.match(/wcat.*q[1-4]|q[1-4].*report|quarterly/)) return 'wcat-quarterly';
  if (f.match(/pida/)) return 'pida-report';
  if (f.match(/nwisp/)) return 'nwisp-national';
  if (f.match(/review|new-directions|restoring-balance|core-services/)) return 'policy-review';
  if (f.match(/annual_report/)) return 'wcat-annual-old';
  if (f.match(/qtr|_qtr/)) return 'wcat-quarterly-old';
  return 'other';
}

async function extractPdf(filepath) {
  try {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdfParse(dataBuffer, { max: 0 }); // all pages
    return {
      text: data.text,
      pages: data.numpages,
      info: data.info || {}
    };
  } catch (err) {
    return { error: err.message, text: '', pages: 0, info: {} };
  }
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const allFiles = fs.readdirSync(SRC_DIR)
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .sort();

  console.log(`📄 Found ${allFiles.length} PDFs in ${SRC_DIR}`);

  // Process priority files first, then the rest
  const prioritySet = new Set(PRIORITY_FILES.map(f => f.toLowerCase()));
  const orderedFiles = [
    ...allFiles.filter(f => prioritySet.has(f.toLowerCase())),
    ...allFiles.filter(f => !prioritySet.has(f.toLowerCase()))
  ];

  const results = {
    extractedAt: new Date().toISOString(),
    source: SRC_DIR,
    totalFiles: allFiles.length,
    documents: []
  };

  let processed = 0;
  for (const filename of orderedFiles) {
    const filepath = path.join(SRC_DIR, filename);
    const stats = fs.statSync(filepath);
    const isPriority = prioritySet.has(filename.toLowerCase());
    const category = categorizeFile(filename);

    process.stdout.write(`[${++processed}/${allFiles.length}] ${filename} (${Math.round(stats.size/1024)}KB)... `);

    const { text, pages, info, error } = await extractPdf(filepath);

    if (error) {
      console.log(`❌ ${error}`);
      results.documents.push({ filename, category, priority: isPriority, error });
      continue;
    }

    const year = extractYearContext(text, filename);
    const extracted = extractNumbers(text);
    const tables = extractKeyTables(text);

    // Extract a relevant summary snippet (first 2000 chars with numbers)
    const numbersSection = text.match(/[\s\S]{0,500}(?:\d{4,}[\s\S]{0,200}){3,}/)?.[0]?.substring(0, 2000) || '';

    const doc = {
      filename,
      category,
      priority: isPriority,
      year,
      pages,
      fileSize: stats.size,
      info: {
        title: info.Title || '',
        subject: info.Subject || '',
        creator: info.Creator || '',
      },
      extracted,
      tables: tables.slice(0, 3),
      textLength: text.length,
      // Save full text only for priority files
      fullText: isPriority ? text : undefined,
      // Save first 3000 chars as preview for all
      preview: text.substring(0, 3000).replace(/\s+/g, ' ').trim(),
    };

    results.documents.push(doc);

    const numKeys = Object.keys(extracted).length;
    console.log(`✅ ${pages}pp, year=${year || '?'}, ${numKeys} data fields, ${tables.length} tables`);

    // Small delay to avoid hogging CPU
    await delay(50);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Saved to ${OUT_FILE}`);
  console.log(`   Total docs: ${results.documents.length}`);
  console.log(`   With data:  ${results.documents.filter(d => d.extracted && Object.keys(d.extracted).length > 0).length}`);
  console.log(`   With tables: ${results.documents.filter(d => d.tables && d.tables.length > 0).length}`);
  console.log(`   Errors: ${results.documents.filter(d => d.error).length}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
