#!/usr/bin/env node
/**
 * Parse Tribunals Ontario XLSX files (HRTO decisions + ONSBT appeals)
 * 
 * Downloads from: https://tribunalsontario.ca/en/about/open-data/
 * 
 * Files downloaded:
 * - 39 HRTO quarterly decision files (2016-2026)
 * - 24 ONSBT appeals received files (2012-2026)
 * - 2 social assistance datasets
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DOWNLOADS_DIR = 'C:\\Users\\bookw\\Downloads';
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions', 'tribunals-ontario');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🏛️ TRIBUNALS ONTARIO DATA PARSER');
console.log('=====================================\n');

/**
 * Parse a single XLSX file
 */
function parseXLSXFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // First sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    
    return {
      sheetName,
      rows: data,
      rowCount: data.length,
      columns: data.length > 0 ? Object.keys(data[0]) : []
    };
  } catch (error) {
    console.error(`❌ Error parsing ${path.basename(filePath)}:`, error.message);
    return null;
  }
}

/**
 * Extract date range from filename
 * Examples:
 * - "5 39 2025-10-01_2025-12-31 Q3 2025-26 Decisions Issued.xlsx"
 * - "18 24 2026-01-01_2026-03-31 Q4 2025-2026 SBT - Appeals Received.xlsx"
 */
function extractMetadata(filename) {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})\s+(Q\d)\s+(\d{4})-?(\d{2,4})?/);
  
  if (match) {
    return {
      startDate: match[1],
      endDate: match[2],
      quarter: match[3],
      fiscalYear: `${match[4]}-${match[5] || match[4].slice(-2)}`
    };
  }
  
  return null;
}

/**
 * Determine file type from filename
 */
function getFileType(filename) {
  if (filename.includes('Decisions Issued')) return 'HRTO-Decisions';
  if (filename.includes('SBT - Appeals Received')) return 'ONSBT-Appeals';
  if (filename.includes('historical_sa_recipients')) return 'SA-Historical';
  if (filename.includes('sa_characteristics')) return 'SA-Characteristics';
  return 'Unknown';
}

/**
 * Parse all HRTO decision files
 */
function parseHRTODecisions() {
  console.log('📊 Parsing HRTO Decision Files...');
  
  const files = fs.readdirSync(DOWNLOADS_DIR)
    .filter(f => f.match(/^\d+\s+\d+\s+\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}.*Decisions Issued\.xlsx$/))
    .sort();
  
  console.log(`   Found ${files.length} HRTO decision files\n`);
  
  const allData = [];
  let totalRows = 0;
  
  for (const file of files) {
    const filePath = path.join(DOWNLOADS_DIR, file);
    const metadata = extractMetadata(file);
    
    console.log(`   Processing: ${file}`);
    
    const parsed = parseXLSXFile(filePath);
    if (!parsed) continue;
    
    console.log(`   - Rows: ${parsed.rowCount}, Columns: ${parsed.columns.length}`);
    console.log(`   - Columns: ${parsed.columns.join(', ')}`);
    
    totalRows += parsed.rowCount;
    
    allData.push({
      filename: file,
      ...metadata,
      rowCount: parsed.rowCount,
      columns: parsed.columns,
      data: parsed.rows
    });
    
    console.log('');
  }
  
  console.log(`✅ HRTO Total: ${totalRows} decision records across ${files.length} quarters\n`);
  
  // Save aggregated data
  const outputFile = path.join(OUTPUT_DIR, 'hrto-decisions-aggregated.json');
  fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
  console.log(`💾 Saved: ${outputFile}\n`);
  
  return allData;
}

/**
 * Parse all ONSBT appeals files
 */
function parseONSBTAppeals() {
  console.log('📊 Parsing ONSBT Appeals Files...');
  
  const files = fs.readdirSync(DOWNLOADS_DIR)
    .filter(f => f.includes('SBT - Appeals Received.xlsx'))
    .sort();
  
  console.log(`   Found ${files.length} ONSBT appeals files\n`);
  
  const allData = [];
  let totalRows = 0;
  
  for (const file of files) {
    const filePath = path.join(DOWNLOADS_DIR, file);
    const metadata = extractMetadata(file);
    
    console.log(`   Processing: ${file}`);
    
    const parsed = parseXLSXFile(filePath);
    if (!parsed) continue;
    
    console.log(`   - Rows: ${parsed.rowCount}, Columns: ${parsed.columns.length}`);
    console.log(`   - Columns: ${parsed.columns.join(', ')}`);
    
    totalRows += parsed.rowCount;
    
    allData.push({
      filename: file,
      ...metadata,
      rowCount: parsed.rowCount,
      columns: parsed.columns,
      data: parsed.rows
    });
    
    console.log('');
  }
  
  console.log(`✅ ONSBT Total: ${totalRows} appeal records across ${files.length} periods\n`);
  
  // Save aggregated data
  const outputFile = path.join(OUTPUT_DIR, 'onsbt-appeals-aggregated.json');
  fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
  console.log(`💾 Saved: ${outputFile}\n`);
  
  return allData;
}

/**
 * Analyze HRTO abandonment patterns
 */
function analyzeHRTOAbandonmentPatterns(hrtoData) {
  console.log('🔍 ANALYZING HRTO ABANDONMENT CRISIS...\n');
  
  const stats = {
    totalDecisions: 0,
    byType: {},
    byYear: {},
    abandonmentRate: 0,
    dismissalWithoutHearingRate: 0
  };
  
  // Aggregate all decision rows
  for (const quarter of hrtoData) {
    for (const row of quarter.data) {
      stats.totalDecisions++;
      
      // Extract decision type (column name varies - find the right one)
      const decisionTypeCol = quarter.columns.find(col => 
        col.toLowerCase().includes('decision') || 
        col.toLowerCase().includes('type') ||
        col.toLowerCase().includes('outcome')
      );
      
      if (decisionTypeCol && row[decisionTypeCol]) {
        const type = row[decisionTypeCol];
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      }
      
      // Track by year
      if (quarter.fiscalYear) {
        stats.byYear[quarter.fiscalYear] = (stats.byYear[quarter.fiscalYear] || 0) + 1;
      }
    }
  }
  
  // Calculate abandonment and dismissal rates
  const abandonmentKeywords = ['abandon', 'withdrawn', 'discontin'];
  const dismissalKeywords = ['dismiss', 'jurisdict', 'procedur'];
  
  let abandonmentCount = 0;
  let dismissalCount = 0;
  
  for (const [type, count] of Object.entries(stats.byType)) {
    const typeLower = type.toLowerCase();
    
    if (abandonmentKeywords.some(kw => typeLower.includes(kw))) {
      abandonmentCount += count;
    }
    
    if (dismissalKeywords.some(kw => typeLower.includes(kw))) {
      dismissalCount += count;
    }
  }
  
  stats.abandonmentRate = ((abandonmentCount / stats.totalDecisions) * 100).toFixed(2);
  stats.dismissalWithoutHearingRate = ((dismissalCount / stats.totalDecisions) * 100).toFixed(2);
  
  console.log('📈 HRTO STATISTICS:');
  console.log(`   Total Decisions: ${stats.totalDecisions.toLocaleString()}`);
  console.log(`   Abandonment Rate: ${stats.abandonmentRate}%`);
  console.log(`   Dismissal Without Hearing Rate: ${stats.dismissalWithoutHearingRate}%`);
  console.log(`\n   Decision Types:`);
  
  const sortedTypes = Object.entries(stats.byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10
  
  for (const [type, count] of sortedTypes) {
    const percentage = ((count / stats.totalDecisions) * 100).toFixed(2);
    console.log(`   - ${type}: ${count.toLocaleString()} (${percentage}%)`);
  }
  
  console.log(`\n   By Fiscal Year:`);
  for (const [year, count] of Object.entries(stats.byYear).sort()) {
    console.log(`   - ${year}: ${count.toLocaleString()}`);
  }
  
  // Save analysis
  const outputFile = path.join(OUTPUT_DIR, 'hrto-analysis.json');
  fs.writeFileSync(outputFile, JSON.stringify(stats, null, 2));
  console.log(`\n💾 Saved analysis: ${outputFile}\n`);
  
  return stats;
}

/**
 * Analyze ONSBT appeal patterns
 */
function analyzeONSBTPatterns(onsbtData) {
  console.log('🔍 ANALYZING ONSBT APPEAL PATTERNS...\n');
  
  const stats = {
    totalAppeals: 0,
    byProgram: {},
    byYear: {},
    averageAppealsPerQuarter: 0
  };
  
  // Aggregate all appeal rows
  for (const quarter of onsbtData) {
    for (const row of quarter.data) {
      stats.totalAppeals++;
      
      // Extract program type
      const programCol = quarter.columns.find(col => 
        col.toLowerCase().includes('program') ||
        col.toLowerCase().includes('type') ||
        col.toLowerCase().includes('category')
      );
      
      if (programCol && row[programCol]) {
        const program = row[programCol];
        stats.byProgram[program] = (stats.byProgram[program] || 0) + 1;
      }
      
      // Track by year
      if (quarter.fiscalYear) {
        stats.byYear[quarter.fiscalYear] = (stats.byYear[quarter.fiscalYear] || 0) + 1;
      }
    }
  }
  
  stats.averageAppealsPerQuarter = Math.round(stats.totalAppeals / onsbtData.length);
  
  console.log('📈 ONSBT STATISTICS:');
  console.log(`   Total Appeals: ${stats.totalAppeals.toLocaleString()}`);
  console.log(`   Average Per Quarter: ${stats.averageAppealsPerQuarter.toLocaleString()}`);
  console.log(`\n   By Program Type:`);
  
  const sortedPrograms = Object.entries(stats.byProgram)
    .sort((a, b) => b[1] - a[1]);
  
  for (const [program, count] of sortedPrograms) {
    const percentage = ((count / stats.totalAppeals) * 100).toFixed(2);
    console.log(`   - ${program}: ${count.toLocaleString()} (${percentage}%)`);
  }
  
  console.log(`\n   By Fiscal Year:`);
  for (const [year, count] of Object.entries(stats.byYear).sort()) {
    console.log(`   - ${year}: ${count.toLocaleString()}`);
  }
  
  // Save analysis
  const outputFile = path.join(OUTPUT_DIR, 'onsbt-analysis.json');
  fs.writeFileSync(outputFile, JSON.stringify(stats, null, 2));
  console.log(`\n💾 Saved analysis: ${outputFile}\n`);
  
  return stats;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Parse HRTO decisions
    const hrtoData = parseHRTODecisions();
    
    // Parse ONSBT appeals
    const onsbtData = parseONSBTAppeals();
    
    // Analyze patterns
    const hrtoStats = analyzeHRTOAbandonmentPatterns(hrtoData);
    const onsbtStats = analyzeONSBTPatterns(onsbtData);
    
    // Create cross-tribunal comparison
    const comparison = {
      dataSource: 'Tribunals Ontario Open Data Portal',
      dataSourceURL: 'https://tribunalsontario.ca/en/about/open-data/',
      extractedDate: new Date().toISOString(),
      tribunals: {
        HRTO: {
          fullName: 'Human Rights Tribunal of Ontario',
          decisionsAnalyzed: hrtoStats.totalDecisions,
          timeRange: '2016-2026 (10 years)',
          quarterlyFiles: hrtoData.length,
          abandonmentRate: hrtoStats.abandonmentRate + '%',
          dismissalWithoutHearingRate: hrtoStats.dismissalWithoutHearingRate + '%',
          keyFinding: 'TribunalWatch reports 96% dismissal rate in 2023/24, backlog doubled to 9,527 cases'
        },
        ONSBT: {
          fullName: 'Ontario Social Benefits Tribunal',
          appealsAnalyzed: onsbtStats.totalAppeals,
          timeRange: '2012-2026 (14 years)',
          quarterlyFiles: onsbtData.length,
          averageAppealsPerQuarter: onsbtStats.averageAppealsPerQuarter,
          keyFinding: 'Appeals from ODSP, OW, and other social assistance programs'
        },
        WSIAT: {
          fullName: 'Workplace Safety & Insurance Appeals Tribunal',
          decisionsAnalyzed: 98992,
          timeRange: '1987-2026 (40 years)',
          dataSource: 'WSIAT Open Data Portal CSV export',
          successRate: '65-73% worker victory rate',
          abandonmentRate: '0.5%',
          keyFinding: 'Transparent, accessible, 40-year historical dataset'
        }
      },
      comparison: {
        hrtoVsWsiat: {
          abandonmentRatio: (parseFloat(hrtoStats.abandonmentRate) / 0.5).toFixed(1) + 'x higher',
          transparencyGap: 'WSIAT provides 40 years of CSV data; HRTO provides quarterly XLSX summaries',
          outcomeTracking: 'WSIAT tracks outcomes; HRTO decision types unclear'
        }
      }
    };
    
    const comparisonFile = path.join(OUTPUT_DIR, 'cross-tribunal-comparison.json');
    fs.writeFileSync(comparisonFile, JSON.stringify(comparison, null, 2));
    console.log(`💾 Saved cross-tribunal comparison: ${comparisonFile}\n`);
    
    console.log('========================================');
    console.log('✅ PARSING COMPLETE!');
    console.log('========================================');
    console.log(`\n📊 Summary:`);
    console.log(`   HRTO: ${hrtoStats.totalDecisions.toLocaleString()} decisions (2016-2026)`);
    console.log(`   ONSBT: ${onsbtStats.totalAppeals.toLocaleString()} appeals (2012-2026)`);
    console.log(`   WSIAT: 98,992 decisions (1987-2026)`);
    console.log(`\n🔥 Key Insight: HRTO abandonment rate ${comparison.comparison.hrtoVsWsiat.abandonmentRatio} than WSIAT\n`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
