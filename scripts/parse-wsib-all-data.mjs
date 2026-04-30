#!/usr/bin/env node
/**
 * COMPREHENSIVE WSIB & TRIBUNALS ONTARIO DATA PARSER
 * 
 * Parses and analyzes:
 * 1. WSIB Open Data (CSV): Premium rates, surveillances, fatal claims, NEER/CAD-7
 * 2. WSIB Safety Check (XLSX): Claims, fatalities, benefit payments, injury profiles
 * 3. Tribunals Ontario (XLSX): HRTO decisions, ONSBT appeals
 * 4. WSIAT Appeals (JSON): 98,992 decisions already parsed
 * 5. AWCBC National Statistics (various formats)
 * 
 * OUTPUT: Cross-dataset analysis revealing WSIB claim suppression funnel
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOADS_DIR = 'C:\\Users\\bookw\\Downloads';
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'wsib-comprehensive');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🏭 WSIB COMPREHENSIVE DATA ANALYSIS');
console.log('=====================================\n');

/**
 * Parse CSV file (simple implementation without external libraries)
 */
function parseCSV(filePath, hasHeader = true) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return { headers: [], rows: [] };
    
    const headers = hasHeader ? parseCSVLine(lines[0]) : [];
    const dataLines = hasHeader ? lines.slice(1) : lines;
    
    const rows = dataLines.map(line => {
      const values = parseCSVLine(line);
      if (hasHeader) {
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = values[i] || null;
        });
        return obj;
      }
      return values;
    });
    
    return { headers, rows, rowCount: rows.length };
  } catch (error) {
    console.error(`❌ Error parsing ${path.basename(filePath)}:`, error.message);
    return null;
  }
}

/**
 * Parse a single CSV line respecting quoted values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

/**
 * Parse WSIB Premium Rates files
 */
function parsePremiumRates() {
  console.log('💰 Parsing WSIB Premium Rates...\n');
  
  const files = fs.readdirSync(DOWNLOADS_DIR)
    .filter(f => f.match(/PremiumRates\(\d{4}\)\.csv/))
    .sort();
  
  const allData = {};
  
  for (const file of files) {
    const year = file.match(/\((\d{4})\)/)[1];
    const filePath = path.join(DOWNLOADS_DIR, file);
    const parsed = parseCSV(filePath);
    
    if (!parsed) continue;
    
    console.log(`   ${year}: ${parsed.rowCount} rate classes`);
    allData[year] = parsed;
  }
  
  console.log(`\n   ✅ Total years: ${Object.keys(allData).length}\n`);
  
  const outputFile = path.join(OUTPUT_DIR, 'premium-rates-all-years.json');
  fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
  console.log(`   💾 Saved: ${outputFile}\n`);
  
  return allData;
}

/**
 * Parse Fatal Claims Investigations
 */
function parseFatalInvestigations() {
  console.log('⚰️  Parsing Fatal Claims Investigations...\n');
  
  const filePath = path.join(DOWNLOADS_DIR, 'Number of Fatal Claims Investigations (2014-2024).csv');
  const parsed = parseCSV(filePath);
  
  if (!parsed) return null;
  
  console.log(`   Total rows: ${parsed.rowCount}`);
  console.log(`   Columns: ${parsed.headers.join(', ')}\n`);
  
  // Analyze by year
  const byYear = {};
  for (const row of parsed.rows) {
    const year = row[parsed.headers[0]] || 'Unknown'; // First column is likely year
    byYear[year] = (byYear[year] || 0) + 1;
  }
  
  console.log('   By Year:');
  for (const [year, count] of Object.entries(byYear).sort()) {
    console.log(`   - ${year}: ${count}`);
  }
  
  const outputFile = path.join(OUTPUT_DIR, 'fatal-claims-investigations.json');
  fs.writeFileSync(outputFile, JSON.stringify({ ...parsed, byYear }, null, 2));
  console.log(`\n   💾 Saved: ${outputFile}\n`);
  
  return parsed;
}

/**
 * Parse Surveillances
 */
function parseSurveillances() {
  console.log('👁️  Parsing WSIB Surveillances...\n');
  
  const filePath = path.join(DOWNLOADS_DIR, 'Number of Surveillances (2014-2024).csv');
  const parsed = parseCSV(filePath);
  
  if (!parsed) return null;
  
  console.log(`   Total rows: ${parsed.rowCount}`);
  console.log(`   Columns: ${parsed.headers.join(', ')}\n`);
  
  const outputFile = path.join(OUTPUT_DIR, 'surveillances.json');
  fs.writeFileSync(outputFile, JSON.stringify(parsed, null, 2));
  console.log(`   💾 Saved: ${outputFile}\n`);
  
  return parsed;
}

/**
 * Parse NEER Rebate/Surcharge files (large employer-level data)
 */
function parseNEER() {
  console.log('📊 Parsing NEER Rebate/Surcharge Data...\n');
  
  const files = fs.readdirSync(DOWNLOADS_DIR)
    .filter(f => f.match(/NEERBulkIssueRebateSurcharge\(\d{4}\)\.csv/))
    .sort();
  
  const summary = {};
  
  for (const file of files) {
    const year = file.match(/\((\d{4})\)/)[1];
    const filePath = path.join(DOWNLOADS_DIR, file);
    
    console.log(`   Parsing ${year}...`);
    const parsed = parseCSV(filePath);
    
    if (!parsed) continue;
    
    console.log(`   - Rows: ${parsed.rowCount}`);
    console.log(`   - Columns: ${parsed.headers.length} (${parsed.headers.slice(0, 5).join(', ')}...)`);
    
    // Analyze rebate vs. surcharge distribution
    const rebateCount = parsed.rows.filter(r => {
      const typeCol = parsed.headers.find(h => h.toLowerCase().includes('type') || h.toLowerCase().includes('rebate'));
      return typeCol && r[typeCol] && r[typeCol].toLowerCase().includes('rebate');
    }).length;
    
    const surchargeCount = parsed.rows.filter(r => {
      const typeCol = parsed.headers.find(h => h.toLowerCase().includes('type') || h.toLowerCase().includes('surcharge'));
      return typeCol && r[typeCol] && r[typeCol].toLowerCase().includes('surcharge');
    }).length;
    
    summary[year] = {
      totalEmployers: parsed.rowCount,
      rebates: rebateCount,
      surcharges: surchargeCount,
      rebatePercentage: ((rebateCount / parsed.rowCount) * 100).toFixed(2) + '%',
      surchargePercentage: ((surchargeCount / parsed.rowCount) * 100).toFixed(2) + '%'
    };
    
    console.log(`   - Rebates: ${rebateCount} (${summary[year].rebatePercentage})`);
    console.log(`   - Surcharges: ${surchargeCount} (${summary[year].surchargePercentage})\n`);
  }
  
  const outputFile = path.join(OUTPUT_DIR, 'neer-summary.json');
  fs.writeFileSync(outputFile, JSON.stringify(summary, null, 2));
  console.log(`   ✅ Total years analyzed: ${Object.keys(summary).length}`);
  console.log(`   💾 Saved: ${outputFile}\n`);
  
  return summary;
}

/**
 * Parse CAD-7 Rebate/Surcharge files
 */
function parseCAD7() {
  console.log('📊 Parsing CAD-7 Rebate/Surcharge Data...\n');
  
  const files = fs.readdirSync(DOWNLOADS_DIR)
    .filter(f => f.match(/CAD7BulkIssueRebateSurcharge\(\d{4}\)\.csv/) && !f.includes('(1)'))
    .sort();
  
  const summary = {};
  
  for (const file of files) {
    const year = file.match(/\((\d{4})\)/)[1];
    const filePath = path.join(DOWNLOADS_DIR, file);
    
    console.log(`   Parsing ${year}...`);
    const parsed = parseCSV(filePath);
    
    if (!parsed) continue;
    
    console.log(`   - Rows: ${parsed.rowCount}`);
    
    summary[year] = {
      totalEmployers: parsed.rowCount,
      columns: parsed.headers
    };
    
    console.log(`   - Columns: ${parsed.headers.length}\n`);
  }
  
  const outputFile = path.join(OUTPUT_DIR, 'cad7-summary.json');
  fs.writeFileSync(outputFile, JSON.stringify(summary, null, 2));
  console.log(`   ✅ Total years analyzed: ${Object.keys(summary).length}`);
  console.log(`   💾 Saved: ${outputFile}\n`);
  
  return summary;
}

/**
 * Analyze claim funnel: Registered → Allowed → WSIAT Appeals
 */
async function analyzeClaimFunnel() {
  console.log('🔍 ANALYZING WSIB CLAIM SUPPRESSION FUNNEL...\n');
  
  // Load WSIAT metadata (already parsed 98,992 decisions)
  const wsiatMetaPath = path.join(__dirname, '..', 'data', 'tribunal-decisions', 'wsiat', 'wsiat-metadata.json');
  
  let wsiatTotal = 98992; // Default
  if (fs.existsSync(wsiatMetaPath)) {
    const wsiatMeta = JSON.parse(fs.readFileSync(wsiatMetaPath, 'utf-8'));
    wsiatTotal = wsiatMeta.totalDecisions || 98992;
  }
  
  // NOTE: Safety Check XLSX files need separate parser (xlsx library)
  // For now, document the analysis structure
  
  const funnel = {
    description: 'WSIB Claim Suppression Funnel Analysis',
    dataSource: {
      wsiat: 'WSIAT Open Data Portal CSV (98,992 decisions, 1987-2026)',
      wsib: 'WSIB Open Data Portal + Safety Check (2014-2026)',
      hrto: 'Tribunals Ontario Open Data (2016-2026)',
      onsbt: 'Tribunals Ontario Open Data (2012-2026)'
    },
    wsiatAppeals: wsiatTotal,
    analysisNeeded: {
      registeredClaims: 'Parse: Registered claims.xlsx from Safety Check',
      allowedClaims: 'Parse: Allowed claims.xlsx from Safety Check',
      deniedClaims: 'Calculate: Registered - Allowed = Denied',
      appealRate: 'Calculate: WSIAT appeals / Denied claims = % who appeal',
      suppressionGap: 'Calculate: Denied claims - WSIAT appeals = Workers who gave up',
      onsbtFunnel: 'Cross-reference: WSIB denials → ODSP applications → ONSBT appeals',
      mentalStressSuppression: 'Compare: Mental Stress Claims.xlsx vs WSIAT PTSD (159 cases)',
      fatalClaimsSuppression: 'Compare: Fatal claims investigations vs WSIAT fatal appeals'
    },
    hypothesis: 'If WSIB denies 200,000 claims/year but WSIAT only receives 5,000 appeals, then 97.5% of denied workers never appeal (195,000 suppressed claims)'
  };
  
  console.log('📊 FUNNEL STRUCTURE:');
  console.log('   1. Registered Claims (WSIB initial decisions)');
  console.log('   2. Allowed Claims (WSIB approvals)');
  console.log('   3. Denied Claims (Registered - Allowed)');
  console.log('   4. WSIAT Appeals: 98,992 (known)');
  console.log('   5. ONSBT Appeals (WSIB→ODSP funnel)');
  console.log('   6. Suppression Gap = Denied - Appeals\n');
  
  const outputFile = path.join(OUTPUT_DIR, 'claim-funnel-analysis-structure.json');
  fs.writeFileSync(outputFile, JSON.stringify(funnel, null, 2));
  console.log(`   💾 Saved analysis structure: ${outputFile}\n`);
  
  return funnel;
}

/**
 * Create comprehensive data inventory
 */
function createDataInventory() {
  console.log('📋 CREATING DATA INVENTORY...\n');
  
  const inventory = {
    created: new Date().toISOString(),
    dataSources: {
      wsibOpenData: {
        url: 'https://www.wsib.ca/en/open-data',
        files: [
          'Premium Rates (2016-2020): 5 CSV files',
          'Fatal Claims Investigations (2014-2024): 1 CSV file',
          'Surveillances (2014-2024): 1 CSV file',
          'NEER Rebate/Surcharge (2017-2020): 4 CSV files (~2-3MB each)',
          'CAD-7 Rebate/Surcharge (2017-2020): 4 CSV files (~900KB-1MB each)'
        ],
        totalFiles: 15
      },
      wsibSafetyCheck: {
        url: 'https://safetycheck.onlineservices.wsib.on.ca/',
        categories: [
          'Benefit Payments (Schedule 1, 2, combined)',
          'Occupational Diseases',
          'Fatalities (COVID-19, Occupational, Traumatic)',
          'Mental Stress Claims',
          'Injury Profiles (Occupation, Source, Event, Body Part, Nature, Age)',
          'Injury Rates',
          'Allowed Claims',
          'Registered Claims',
          'Insurable Earnings',
          'Premiums Paid',
          'Workplaces (Employment, Employers)',
          'Lost-Time Claims',
          'Fatalities Data'
        ],
        totalFiles: '40-50 XLSX files'
      },
      tribunalsOntario: {
        url: 'https://tribunalsontario.ca/en/about/open-data/',
        hrto: '39 quarterly decision files (2016-2026)',
        onsbt: '24 appeals received files (2012-2026)',
        totalFiles: 63
      },
      wsiat: {
        url: 'https://www.wsiat.ca/en/home/opendata_decisions.html',
        data: '98,992 decisions (1987-2026) - Already parsed',
        format: 'JSON (41 year files + metadata + 8 deep-analysis files)'
      },
      awcbc: {
        url: 'https://awcbc.org/data-and-statistics/',
        data: 'National Work Injury Statistics (cross-provincial comparison)',
        status: 'Files downloaded, format unknown'
      }
    },
    parsingStatus: {
      completed: [
        'WSIAT 98,992 decisions (CSV → JSON)',
        'WSIB Premium Rates (5 CSV files)',
        'WSIB Fatal Claims Investigations (1 CSV)',
        'WSIB Surveillances (1 CSV)',
        'NEER Summary (4 CSV files)',
        'CAD-7 Summary (4 CSV files)'
      ],
      pending: [
        'Safety Check XLSX files (40-50 files) - requires xlsx library',
        'Tribunals Ontario XLSX files (63 files) - requires xlsx library',
        'AWCBC national statistics (format unknown)'
      ]
    },
    analysisGoals: {
      claimFunnel: 'Registered → Allowed → Denied → WSIAT Appeals → Suppression Gap',
      crossTribunal: 'WSIAT vs HRTO abandonment rates (0.5% vs 73.5%)',
      bodyPartValidation: 'WSIB body part data vs WSIAT body part patterns',
      mentalStressSuppression: 'Mental stress claims vs WSIAT PTSD appeals (159)',
      fatalClaimsSuppression: 'Fatal investigations vs WSIAT fatal appeals',
      onsbtFunnel: 'WSIB denials → ODSP appeals → ONSBT',
      crossProvincial: 'Ontario vs BC vs other provinces (AWCBC data)'
    }
  };
  
  const outputFile = path.join(OUTPUT_DIR, 'data-inventory.json');
  fs.writeFileSync(outputFile, JSON.stringify(inventory, null, 2));
  console.log(`   💾 Saved: ${outputFile}\n`);
  
  return inventory;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Parse CSV files (don't require external libraries)
    const premiumRates = parsePremiumRates();
    const fatalInvestigations = parseFatalInvestigations();
    const surveillances = parseSurveillances();
    const neerSummary = parseNEER();
    const cad7Summary = parseCAD7();
    
    // Analyze claim funnel structure
    const funnelStructure = await analyzeClaimFunnel();
    
    // Create data inventory
    const inventory = createDataInventory();
    
    console.log('========================================');
    console.log('✅ CSV PARSING COMPLETE!');
    console.log('========================================\n');
    
    console.log('📊 SUMMARY:');
    console.log(`   Premium Rates: ${Object.keys(premiumRates).length} years`);
    console.log(`   Fatal Investigations: ${fatalInvestigations?.rowCount || 0} records`);
    console.log(`   Surveillances: ${surveillances?.rowCount || 0} records`);
    console.log(`   NEER: ${Object.keys(neerSummary).length} years`);
    console.log(`   CAD-7: ${Object.keys(cad7Summary).length} years`);
    console.log(`   WSIAT: 98,992 decisions (already parsed)\n`);
    
    console.log('⚠️  NEXT STEPS:');
    console.log('   1. Install xlsx package: npm install xlsx');
    console.log('   2. Parse Safety Check XLSX files (40-50 files)');
    console.log('   3. Parse Tribunals Ontario XLSX files (63 files)');
    console.log('   4. Cross-reference all datasets');
    console.log('   5. Calculate claim suppression funnel\n');
    
    console.log('🎯 KEY ANALYSIS:');
    console.log('   WSIB Registered Claims - WSIB Allowed Claims = Denied');
    console.log('   WSIAT Appeals (98,992) / Denied Claims = Appeal Rate');
    console.log('   Denied - WSIAT Appeals = Suppression Gap (workers who gave up)\n');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
