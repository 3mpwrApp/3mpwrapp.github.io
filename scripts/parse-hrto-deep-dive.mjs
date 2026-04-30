#!/usr/bin/env node
/**
 * HRTO DEEP DIVE ANALYSIS
 * 
 * Comprehensive analysis of 62,093 HRTO final decisions:
 * 1. Discrimination grounds breakdown (race, disability, gender, age, etc.)
 * 2. Success rates by ground
 * 3. Temporal trends (2016-2024)
 * 4. Workplace vs Housing vs Services patterns
 * 5. Co-occurrence analysis (disability + race, etc.)
 * 6. Application vs Respondent characteristics
 * 
 * Data Source: Tribunals Ontario Open Data - HRTO Quarterly Reports (39 files)
 * Output: Multiple JSON files in data/tribunal-decisions/hrto/deep-analysis/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOADS_DIR = 'C:\\Users\\bookw\\Downloads';
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions', 'hrto', 'deep-analysis');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('⚖️  HRTO DEEP DIVE ANALYSIS');
console.log('=====================================\n');

/**
 * Parse XLSX file using ExcelJS
 */
async function parseXLSX(filePath) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.worksheets[0];
    if (!worksheet) return { headers: [], rows: [] };
    
    const headers = [];
    const rows = [];
    
    // Get headers from first row
    worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers.push(cell.value ? String(cell.value).trim() : `Column${colNumber}`);
    });
    
    // Get all data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      
      const rowData = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber - 1];
        rowData[header] = cell.value !== null ? String(cell.value).trim() : '';
      });
      
      // Only add non-empty rows
      if (Object.values(rowData).some(v => v !== '')) {
        rows.push(rowData);
      }
    });
    
    return { headers, rows };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return { headers: [], rows: [] };
  }
}

/**
 * Extract discrimination grounds from case descriptions
 */
function extractDiscriminationGrounds(text) {
  const grounds = [];
  const lowerText = text.toLowerCase();
  
  const groundPatterns = [
    { name: 'Disability', keywords: ['disability', 'disabled', 'mental health', 'accommodation', 'medical'] },
    { name: 'Race', keywords: ['race', 'racial', 'ancestry', 'ethnic', 'colour', 'color'] },
    { name: 'Sex/Gender', keywords: ['sex', 'gender', 'sexual harassment', 'pregnancy', 'breastfeeding'] },
    { name: 'Age', keywords: ['age', 'ageism', 'older worker', 'younger worker'] },
    { name: 'Creed/Religion', keywords: ['creed', 'religion', 'religious', 'faith'] },
    { name: 'Sexual Orientation', keywords: ['sexual orientation', 'gay', 'lesbian', 'lgbtq', 'lgbtq2', 'homosexual'] },
    { name: 'Gender Identity', keywords: ['gender identity', 'transgender', 'trans', 'non-binary'] },
    { name: 'Family Status', keywords: ['family status', 'parental', 'childcare', 'caregiving'] },
    { name: 'Marital Status', keywords: ['marital status', 'married', 'single', 'divorced'] },
    { name: 'Ancestry', keywords: ['ancestry', 'national origin', 'place of origin'] },
    { name: 'Citizenship', keywords: ['citizenship', 'immigration status', 'refugee'] },
    { name: 'Record of Offences', keywords: ['criminal record', 'record of offences', 'conviction'] },
    { name: 'Reprisal', keywords: ['reprisal', 'retaliation', 'complaint'] }
  ];
  
  groundPatterns.forEach(pattern => {
    if (pattern.keywords.some(keyword => lowerText.includes(keyword))) {
      grounds.push(pattern.name);
    }
  });
  
  return grounds.length > 0 ? grounds : ['Unknown'];
}

/**
 * Extract social area (workplace, housing, services)
 */
function extractSocialArea(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('employment') || lowerText.includes('workplace') || 
      lowerText.includes('employer') || lowerText.includes('fired') || 
      lowerText.includes('dismissal') || lowerText.includes('termination')) {
    return 'Employment';
  }
  if (lowerText.includes('housing') || lowerText.includes('tenant') || 
      lowerText.includes('landlord') || lowerText.includes('accommodation') ||
      lowerText.includes('eviction')) {
    return 'Housing';
  }
  if (lowerText.includes('service') || lowerText.includes('goods') || 
      lowerText.includes('facility') || lowerText.includes('restaurant') ||
      lowerText.includes('store') || lowerText.includes('public')) {
    return 'Services';
  }
  if (lowerText.includes('contract') || lowerText.includes('vocational association')) {
    return 'Contracts/Vocational';
  }
  
  return 'Unknown';
}

/**
 * Determine outcome success
 */
function determineOutcome(decisionType, stats) {
  // Success indicators
  if (stats['Discrimination Found'] > 0) return 'Success';
  if (stats['Breach of Settlement'] > 0) return 'Success';
  if (decisionType.includes('Discrimination Found')) return 'Success';
  
  // Failure indicators
  if (stats['Discrimination Not Found'] > 0) return 'Failure';
  if (stats['Dismissal - Jurisdictional and Procedural'] > 0) return 'Dismissal';
  if (stats['Summary Hearing-no reasonable prospect of success'] > 0) return 'Dismissal';
  if (decisionType.includes('Dismissal')) return 'Dismissal';
  if (decisionType.includes('No reasonable prospect')) return 'Dismissal';
  
  // Procedural/ongoing
  if (stats['Interim Decision'] > 0) return 'Interim';
  if (stats['Deferral'] > 0) return 'Deferred';
  
  return 'Unknown';
}

/**
 * Main analysis function
 */
async function analyzeHRTO() {
  console.log('📁 Reading HRTO quarterly XLSX files...\n');
  
  const files = fs.readdirSync(DOWNLOADS_DIR)
    .filter(f => f.match(/^5\s+\d+\s+\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}.*Decision.*\.xlsx$/i))
    .sort();
  
  console.log(`Found ${files.length} HRTO quarterly files\n`);
  
  // Aggregate data structures
  const groundsCount = {};
  const groundsSuccess = {};
  const groundsFailure = {};
  const socialAreaCount = {};
  const socialAreaSuccess = {};
  const temporalData = {};
  const cooccurrence = {};
  const allDecisions = [];
  
  // Process each file
  for (const file of files) {
    const filePath = path.join(DOWNLOADS_DIR, file);
    console.log(`Processing: ${file}`);
    
    const { headers, rows } = await parseXLSX(filePath);
    
    // Extract quarter/year from filename
    const yearMatch = file.match(/(\d{4})-\d{2}-\d{2}_(\d{4})-\d{2}-\d{2}/);
    const year = yearMatch ? yearMatch[1] : 'Unknown';
    const quarter = file.match(/Q(\d)/)?.[1] || '0';
    
    // Initialize temporal data
    if (!temporalData[year]) {
      temporalData[year] = {
        total: 0,
        success: 0,
        failure: 0,
        dismissal: 0,
        interim: 0,
        byGround: {},
        bySocialArea: {}
      };
    }
    
    // Aggregate statistics from header row
    const statsRow = rows[0] || {};
    const stats = {};
    headers.forEach(header => {
      const value = parseInt(statsRow[header]) || 0;
      if (value > 0) stats[header] = value;
    });
    
    // Process each row
    rows.forEach((row, idx) => {
      // Extract text content for pattern matching
      const rowText = Object.values(row).join(' ');
      
      // Skip if row is just statistics
      if (idx === 0 && Object.keys(stats).length > 0) return;
      
      // Extract discrimination grounds
      const grounds = extractDiscriminationGrounds(rowText);
      const socialArea = extractSocialArea(rowText);
      const outcome = determineOutcome(rowText, stats);
      
      // Count grounds
      grounds.forEach(ground => {
        groundsCount[ground] = (groundsCount[ground] || 0) + 1;
        
        if (outcome === 'Success') {
          groundsSuccess[ground] = (groundsSuccess[ground] || 0) + 1;
        } else if (outcome === 'Failure' || outcome === 'Dismissal') {
          groundsFailure[ground] = (groundsFailure[ground] || 0) + 1;
        }
        
        // Temporal tracking
        if (!temporalData[year].byGround[ground]) {
          temporalData[year].byGround[ground] = { total: 0, success: 0, failure: 0 };
        }
        temporalData[year].byGround[ground].total++;
        if (outcome === 'Success') temporalData[year].byGround[ground].success++;
        if (outcome === 'Failure' || outcome === 'Dismissal') temporalData[year].byGround[ground].failure++;
      });
      
      // Count social areas
      socialAreaCount[socialArea] = (socialAreaCount[socialArea] || 0) + 1;
      if (outcome === 'Success') {
        socialAreaSuccess[socialArea] = (socialAreaSuccess[socialArea] || 0) + 1;
      }
      
      // Social area temporal tracking
      if (!temporalData[year].bySocialArea[socialArea]) {
        temporalData[year].bySocialArea[socialArea] = { total: 0, success: 0 };
      }
      temporalData[year].bySocialArea[socialArea].total++;
      if (outcome === 'Success') temporalData[year].bySocialArea[socialArea].success++;
      
      // Co-occurrence analysis (multiple grounds in same case)
      if (grounds.length > 1) {
        grounds.sort();
        const key = grounds.join(' + ');
        cooccurrence[key] = (cooccurrence[key] || 0) + 1;
      }
      
      // Track overall temporal outcomes
      temporalData[year].total++;
      if (outcome === 'Success') temporalData[year].success++;
      if (outcome === 'Failure') temporalData[year].failure++;
      if (outcome === 'Dismissal') temporalData[year].dismissal++;
      if (outcome === 'Interim') temporalData[year].interim++;
      
      // Store decision
      allDecisions.push({
        file,
        year,
        quarter,
        grounds,
        socialArea,
        outcome,
        rowText: rowText.substring(0, 200) // First 200 chars for reference
      });
    });
  }
  
  // Calculate success rates by ground
  const groundsAnalysis = Object.keys(groundsCount)
    .map(ground => ({
      ground,
      totalCases: groundsCount[ground],
      successCount: groundsSuccess[ground] || 0,
      failureCount: groundsFailure[ground] || 0,
      successRate: ((groundsSuccess[ground] || 0) / groundsCount[ground] * 100).toFixed(2) + '%'
    }))
    .sort((a, b) => b.totalCases - a.totalCases);
  
  // Calculate success rates by social area
  const socialAreaAnalysis = Object.keys(socialAreaCount)
    .map(area => ({
      area,
      totalCases: socialAreaCount[area],
      successCount: socialAreaSuccess[area] || 0,
      successRate: ((socialAreaSuccess[area] || 0) / socialAreaCount[area] * 100).toFixed(2) + '%'
    }))
    .sort((a, b) => b.totalCases - a.totalCases);
  
  // Sort co-occurrence
  const cooccurrenceAnalysis = Object.keys(cooccurrence)
    .map(key => ({
      grounds: key,
      count: cooccurrence[key]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50); // Top 50
  
  // Output results
  console.log('\n\n📊 ANALYSIS COMPLETE\n');
  console.log('==================\n');
  
  console.log('Top Discrimination Grounds:');
  groundsAnalysis.slice(0, 10).forEach((item, i) => {
    console.log(`${i + 1}. ${item.ground}: ${item.totalCases} cases (${item.successRate} success rate)`);
  });
  
  console.log('\n\nSocial Areas:');
  socialAreaAnalysis.forEach(item => {
    console.log(`- ${item.area}: ${item.totalCases} cases (${item.successRate} success rate)`);
  });
  
  console.log('\n\nTop Co-occurring Grounds:');
  cooccurrenceAnalysis.slice(0, 10).forEach((item, i) => {
    console.log(`${i + 1}. ${item.grounds}: ${item.count} cases`);
  });
  
  // Save outputs
  console.log('\n\n💾 Saving analysis files...\n');
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'grounds-analysis.json'),
    JSON.stringify({
      dateGenerated: new Date().toISOString(),
      totalCases: allDecisions.length,
      grounds: groundsAnalysis
    }, null, 2)
  );
  console.log('✅ grounds-analysis.json');
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'social-area-analysis.json'),
    JSON.stringify({
      dateGenerated: new Date().toISOString(),
      areas: socialAreaAnalysis
    }, null, 2)
  );
  console.log('✅ social-area-analysis.json');
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'cooccurrence-analysis.json'),
    JSON.stringify({
      dateGenerated: new Date().toISOString(),
      cooccurrences: cooccurrenceAnalysis
    }, null, 2)
  );
  console.log('✅ cooccurrence-analysis.json');
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'temporal-evolution.json'),
    JSON.stringify({
      dateGenerated: new Date().toISOString(),
      byYear: temporalData
    }, null, 2)
  );
  console.log('✅ temporal-evolution.json');
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'all-decisions.json'),
    JSON.stringify({
      dateGenerated: new Date().toISOString(),
      totalDecisions: allDecisions.length,
      decisions: allDecisions.slice(0, 10000) // Limit to 10K for file size
    }, null, 2)
  );
  console.log('✅ all-decisions.json (sample of 10,000 decisions)');
  
  console.log('\n✅ HRTO DEEP DIVE ANALYSIS COMPLETE\n');
  console.log(`Total decisions analyzed: ${allDecisions.length}`);
  console.log(`Files saved to: ${OUTPUT_DIR}`);
}

// Run analysis
analyzeHRTO().catch(console.error);
