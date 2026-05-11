#!/usr/bin/env node

/**
 * WSIAT Decision Parser
 * 
 * Parses WSIAT Decision Summary Search HTML files and extracts structured data.
 * Processes files from Downloads folder and stores in data/tribunal-decisions/wsiat/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  downloadsPath: 'C:\\Users\\bookw\\Downloads',
  rawHtmlPath: path.join(__dirname, '..', 'data', 'tribunal-decisions', 'wsiat', 'raw-html'),
  outputPath: path.join(__dirname, '..', 'data', 'tribunal-decisions', 'wsiat', 'decisions-by-year'),
  metadataPath: path.join(__dirname, '..', 'data', 'tribunal-decisions', 'wsiat', 'wsiat-metadata.json'),
  // Match any of these patterns:
  // - WSIAT - Decision Summary Search*.html
  // - decisionSearch.htm, decisionSearch (1).htm, etc.
  // - decisionSearch - 2026-04-29T210135.722.htm (timestamp format)
  htmlPatterns: [
    /^WSIAT.*Decision.*Search.*\.(html|htm)$/i,
    /^decisionSearch.*\.(html|htm)$/i,
    /^Decision.*Summary.*Search.*\.(html|htm)$/i
  ]
};

// Ensure directories exist
[CONFIG.rawHtmlPath, CONFIG.outputPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Ensure metadata directory exists
const metadataDir = path.dirname(CONFIG.metadataPath);
if (!fs.existsSync(metadataDir)) {
  fs.mkdirSync(metadataDir, { recursive: true });
}

/**
 * Extract decision data from HTML using regex patterns
 */
function parseDecisionHTML(htmlContent, filename) {
  const decisions = [];
  
  // Look for WSIAT decision number patterns (e.g., 1209/25, 756/89L)
  // Common patterns in WSIAT search results
  const decisionPattern = /(\d+)\/(\d+)([A-Z]*)/g;
  
  let match;
  while ((match = decisionPattern.exec(htmlContent)) !== null) {
    const decisionNumber = `${match[1]}/${match[2]}${match[3] || ''}`;
    
    // Extract context around the decision number (500 chars before and after)
    const contextStart = Math.max(0, match.index - 500);
    const contextEnd = Math.min(htmlContent.length, match.index + 500);
    const context = htmlContent.substring(contextStart, contextEnd);
    
    const decision = {
      decisionNumber,
      rootNumber: match[1],
      year: match[2],
      suffix: match[3] || null,
      date: extractDate(context),
      keywords: extractKeywords(context),
      summary: extractSummary(context),
      url: extractURL(context),
      sourceFile: filename,
      rawContext: context.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    };
    
    decisions.push(decision);
  }
  
  // Deduplicate by decision number
  const uniqueDecisions = [];
  const seen = new Set();
  
  for (const decision of decisions) {
    if (!seen.has(decision.decisionNumber)) {
      seen.add(decision.decisionNumber);
      uniqueDecisions.push(decision);
    }
  }
  
  return uniqueDecisions;
}

/**
 * Extract date from text
 */
function extractDate(text) {
  // Look for common date patterns in WSIAT decisions
  const patterns = [
    /(\d{4}-\d{2}-\d{2})/,                    // 2025-04-29
    /(\d{2}\/\d{2}\/\d{4})/,                  // 04/29/2025
    /(\d{1,2}\/\d{1,2}\/\d{4})/,             // 4/29/2025
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i,
    /(\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1] || match[0];
  }
  
  return null;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  if (typeof text !== 'string') return [];
  
  const keywords = [];
  
  // Common WSIAT keywords and acronyms
  const keywordPatterns = [
    'LOE', 'NEL', 'FEL', 'SIEF', 'CPD', 'HAVS', 'ESRTW', 'LMR',
    'Section 31', 'Section 44', 'Section 13', 'Section 147',
    'Initial Entitlement', 'Right to Sue', 'Traumatic Mental Stress',
    'Occupational Disease', 'Chronic Pain', 'Reconsideration',
    'Permanent Impairment', 'Loss of Earnings', 'Future Economic Loss',
    'Non-Economic Loss', 'Pre-existing Condition', 'Aggravation',
    'Labour Market Re-entry', 'Suitable Occupation', 'Deeming'
  ];
  
  keywordPatterns.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  return keywords;
}

/**
 * Extract summary text from context
 */
function extractSummary(text) {
  if (typeof text !== 'string') return null;
  
  // Look for summary-like text patterns
  // Usually the longest sentence or text block near the decision number
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 50);
  
  if (sentences.length > 0) {
    // Return the longest sentence as the likely summary
    return sentences.reduce((a, b) => a.length > b.length ? a : b).trim();
  }
  
  return null;
}

/**
 * Extract URL from HTML context
 */
function extractURL(htmlText) {
  if (typeof htmlText !== 'string') return null;
  
  // Look for WSIAT decision URLs
  const urlPatterns = [
    /href=["']([^"']*\/decisions\/[^"']*)["']/i,
    /href=["']([^"']*wsiat\.ca[^"']*)["']/i,
    /(https?:\/\/[^\s<>"]+decision[^\s<>"]*)/i
  ];
  
  for (const pattern of urlPatterns) {
    const match = htmlText.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Process all WSIAT HTML files
 */
function processWSIATFiles() {
  console.log('🔍 Scanning for WSIAT decision files...\n');
  
  const files = fs.readdirSync(CONFIG.downloadsPath)
    .filter(f => {
      return (f.endsWith('.html') || f.endsWith('.htm')) && 
             CONFIG.htmlPatterns.some(pattern => pattern.test(f));
    });
  
  console.log(`✅ Found ${files.length} WSIAT decision files\n`);
  
  if (files.length === 0) {
    console.log('⚠️  No WSIAT decision files found in Downloads folder.');
    console.log(`   Looking for patterns: WSIAT*Decision*Search*.html, decisionSearch*.htm`);
    return;
  }
  
  let allDecisions = [];
  const metadata = {
    lastUpdated: new Date().toISOString(),
    totalFiles: files.length,
    totalDecisions: 0,
    decisionsByYear: {},
    processingLog: []
  };
  
  files.forEach((filename, index) => {
    console.log(`📄 Processing [${index + 1}/${files.length}]: ${filename}`);
    
    const sourcePath = path.join(CONFIG.downloadsPath, filename);
    const htmlContent = fs.readFileSync(sourcePath, 'utf-8');
    
    // Parse decisions
    const decisions = parseDecisionHTML(htmlContent, filename);
    console.log(`   ├─ Extracted ${decisions.length} decisions`);
    
    // Move to raw-html directory
    const destPath = path.join(CONFIG.rawHtmlPath, filename);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`   ├─ Moved to: ${path.relative(process.cwd(), destPath)}`);
    
    // Update metadata
    metadata.processingLog.push({
      filename,
      decisionsExtracted: decisions.length,
      processedAt: new Date().toISOString()
    });
    
    allDecisions = allDecisions.concat(decisions);
    console.log(`   └─ ✅ Complete\n`);
  });
  
  // Organize decisions by year
  const decisionsByYear = {};
  allDecisions.forEach(decision => {
    const year = decision.year;
    if (!decisionsByYear[year]) {
      decisionsByYear[year] = [];
    }
    decisionsByYear[year].push(decision);
  });
  
  // Save decisions by year
  Object.entries(decisionsByYear).forEach(([year, decisions]) => {
    const yearFile = path.join(CONFIG.outputPath, `wsiat-${year}.json`);
    fs.writeFileSync(yearFile, JSON.stringify(decisions, null, 2));
    console.log(`📊 Saved ${decisions.length} decisions to: wsiat-${year}.json`);
    
    metadata.decisionsByYear[year] = decisions.length;
  });
  
  // Update metadata
  metadata.totalDecisions = allDecisions.length;
  fs.writeFileSync(CONFIG.metadataPath, JSON.stringify(metadata, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ PROCESSING COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total Files Processed: ${files.length}`);
  console.log(`Total Decisions Extracted: ${allDecisions.length}`);
  console.log(`Years Covered: ${Object.keys(decisionsByYear).sort().join(', ')}`);
  console.log(`Metadata saved to: ${path.relative(process.cwd(), CONFIG.metadataPath)}`);
  console.log('='.repeat(60));
}

// Run the processor
try {
  processWSIATFiles();
} catch (error) {
  console.error('❌ Error processing WSIAT files:', error.message);
  console.error(error.stack);
  process.exit(1);
}
