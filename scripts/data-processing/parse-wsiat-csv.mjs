#!/usr/bin/env node

/**
 * WSIAT CSV Parser
 * 
 * Converts WSIAT's CSV export to structured JSON organized by year
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  csvPath: 'C:\\Users\\bookw\\Downloads\\WSIATDecisions (1).csv',
  outputPath: path.join(__dirname, '..', 'data', 'tribunal-decisions', 'wsiat', 'decisions-by-year'),
  metadataPath: path.join(__dirname, '..', 'data', 'tribunal-decisions', 'wsiat', 'wsiat-metadata.json')
};

// Ensure directories exist
if (!fs.existsSync(CONFIG.outputPath)) {
  fs.mkdirSync(CONFIG.outputPath, { recursive: true });
}

/**
 * Parse CSV manually (avoids Import-Csv issues with duplicate columns)
 */
function parseCSV(csvPath) {
  console.log('📂 Reading CSV file...');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');
  
  console.log(`📊 Total lines: ${lines.toLocaleString()}`);
  
  // Skip first 2 lines (metadata header)
  // Line 3 is the column headers
  const headerLine = lines[2].trim();
  const headers = parseCSVLine(headerLine);
  
  console.log(`📋 Headers: ${headers.join(', ')}\n`);
  
  const decisions = [];
  let skipped = 0;
  
  // Start from line 4 (index 3)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      const values = parseCSVLine(line);
      
      if (values.length < headers.length) {
        skipped++;
        continue;
      }
      
      const decision = {};
      headers.forEach((header, index) => {
        decision[header] = values[index] || null;
      });
      
      // Extract year from DecNum (e.g., "763 99" -> 99)
      const decNumMatch = decision.DecNum?.match(/(\d+)\s+(\d+)([A-Z]*)/);
      if (decNumMatch) {
        decision.rootNumber = decNumMatch[1];
        decision.year = decNumMatch[2];
        decision.suffix = decNumMatch[3] || null;
        decision.decisionNumber = `${decNumMatch[1]}/${decNumMatch[2]}${decNumMatch[3] || ''}`;
      }
      
      decisions.push(decision);
      
      if (decisions.length % 10000 === 0) {
        console.log(`   Processed ${decisions.length.toLocaleString()} decisions...`);
      }
      
    } catch (error) {
      skipped++;
    }
  }
  
  console.log(`\n✅ Parsed ${decisions.length.toLocaleString()} decisions`);
  console.log(`⚠️  Skipped ${skipped} malformed lines\n`);
  
  return decisions;
}

/**
 * Parse a CSV line respecting quoted values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Main processing function
 */
function processWSIATCSV() {
  console.log('🚀 WSIAT CSV Parser Starting...\n');
  console.log('='.repeat(60));
  
  // Check if CSV exists
  if (!fs.existsSync(CONFIG.csvPath)) {
    console.error(`❌ CSV file not found: ${CONFIG.csvPath}`);
    process.exit(1);
  }
  
  // Parse CSV
  const decisions = parseCSV(CONFIG.csvPath);
  
  // Organize by year
  console.log('📁 Organizing decisions by year...');
  const decisionsByYear = {};
  
  decisions.forEach(decision => {
    const year = decision.year || 'unknown';
    if (!decisionsByYear[year]) {
      decisionsByYear[year] = [];
    }
    decisionsByYear[year].push(decision);
  });
  
  console.log(`📊 Years covered: ${Object.keys(decisionsByYear).sort().length}`);
  console.log(`   Range: ${Math.min(...Object.keys(decisionsByYear).filter(y => y !== 'unknown'))} - ${Math.max(...Object.keys(decisionsByYear).filter(y => y !== 'unknown'))}\n`);
  
  // Save decisions by year
  console.log('💾 Saving decisions by year...');
  Object.entries(decisionsByYear).forEach(([year, decs]) => {
    const yearFile = path.join(CONFIG.outputPath, `wsiat-${year}.json`);
    fs.writeFileSync(yearFile, JSON.stringify(decs, null, 2));
    console.log(`   ├─ wsiat-${year}.json (${decs.length.toLocaleString()} decisions)`);
  });
  
  // Create metadata
  const metadata = {
    lastUpdated: new Date().toISOString(),
    source: 'CSV Export from WSIAT',
    totalDecisions: decisions.length,
    decisionsByYear: Object.fromEntries(
      Object.entries(decisionsByYear)
        .map(([year, decs]) => [year, decs.length])
        .sort((a, b) => a[0].localeCompare(b[0]))
    ),
    columns: ['DecNum', 'DecDate', 'DecFileName', 'Vicechair', 'EmpMember', 'WkrMember', 'DecKeywords', 'DecSummary'],
    dataComplete: true
  };
  
  fs.writeFileSync(CONFIG.metadataPath, JSON.stringify(metadata, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ PROCESSING COMPLETE!');
  console.log('='.repeat(60));
  console.log(`Total Decisions: ${decisions.length.toLocaleString()}`);
  console.log(`Years: ${Object.keys(decisionsByYear).length}`);
  console.log(`Output: ${path.relative(process.cwd(), CONFIG.outputPath)}`);
  console.log(`Metadata: ${path.relative(process.cwd(), CONFIG.metadataPath)}`);
  console.log('='.repeat(60));
}

// Run the processor
try {
  processWSIATCSV();
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
