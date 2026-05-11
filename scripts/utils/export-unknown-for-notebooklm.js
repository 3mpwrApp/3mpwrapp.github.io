#!/usr/bin/env node
/**
 * EXPORT UNKNOWN DECISIONS FOR NOTEBOOKLM BATCH 2
 * 
 * Purpose: Extract sample of decisions still marked "Unknown" after initial
 *          re-extraction for pattern discovery via NotebookLM
 * 
 * Strategy:
 *   1. Load tribunal JSON file(s)
 *   2. Filter for outcome === "Unknown"
 *   3. Sample N random decisions (or all if fewer than N)
 *   4. Export as markdown with full text for NotebookLM upload
 * 
 * Usage:
 *   node scripts/export-unknown-for-notebooklm.js [tribunal] [count]
 * 
 * Examples:
 *   node scripts/export-unknown-for-notebooklm.js wsiat 50
 *   node scripts/export-unknown-for-notebooklm.js all 25
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const EXPORT_DIR = path.join(__dirname, '..', 'docs', 'notebooklm-exports');

// Tribunal file patterns
const TRIBUNAL_PATTERNS = {
  wsiat: /onwsiat-\d{4}.*\.json$/i,
  onsbt: /onsbt-\d{4}.*\.json$/i,
  onwsib: /onwsib-\d{4}.*\.json$/i,
  onhrt: /onhrt-\d{4}.*\.json$/i,
  bcwcat: /bcwcat-\d{4}.*\.json$/i
};

/**
 * Load all decisions from tribunal file(s)
 */
function loadDecisions(tribunalArg) {
  const decisions = [];
  
  // Find matching files
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .filter(f => !f.includes('BACKUP'))
    .filter(f => {
      if (tribunalArg === 'all') return true;
      const pattern = TRIBUNAL_PATTERNS[tribunalArg.toLowerCase()];
      return pattern && pattern.test(f);
    });
  
  console.log(`📂 Loading ${files.length} files...`);
  
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (Array.isArray(data)) {
      for (const decision of data) {
        decision._sourceFile = file; // Track source
        decisions.push(decision);
      }
    }
  }
  
  return decisions;
}

/**
 * Sample N random items from array
 */
function sampleRandom(arr, n) {
  if (arr.length <= n) return arr;
  
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

/**
 * Generate markdown for NotebookLM
 */
function generateMarkdown(decisions, tribunal) {
  const lines = [];
  
  lines.push(`# Unknown Outcome Decisions - ${tribunal.toUpperCase()} - Batch 2`);
  lines.push('');
  lines.push(`**Exported:** ${new Date().toISOString()}`);
  lines.push(`**Count:** ${decisions.length} decisions`);
  lines.push(`**Purpose:** Pattern discovery for outcome classification`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Instructions for NotebookLM');
  lines.push('');
  lines.push('Upload this file to NotebookLM and ask:');
  lines.push('');
  lines.push('> **"Analyze these tribunal decisions and identify common phrases that indicate:**');
  lines.push('> 1. The worker won (appeal allowed, entitlement granted, etc.)');
  lines.push('> 2. The worker lost (appeal dismissed, denied, etc.)');
  lines.push('> 3. Mixed outcomes (partially allowed, varied, etc.)');
  lines.push('> 4. Procedural outcomes (remitted, withdrawn, adjourned)');
  lines.push('>');
  lines.push('> **For each phrase, provide:**');
  lines.push('> - The exact wording');
  lines.push('> - The outcome it indicates');
  lines.push('> - A confidence level (High/Medium/Low)');
  lines.push('> - The decision number where it appears"');
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Export each decision
  for (let i = 0; i < decisions.length; i++) {
    const d = decisions[i];
    
    lines.push(`## Decision ${i + 1}: ${d.caseNumber || 'Unknown Case Number'}`);
    lines.push('');
    lines.push(`**Source:** ${d._sourceFile}`);
    lines.push(`**Date:** ${d.decisionDate || 'Unknown'}`);
    lines.push(`**Current Outcome:** ${d.outcome || 'Unknown'}`);
    
    if (d.keywords?.issues) {
      lines.push(`**Issues:** ${d.keywords.issues.join(', ')}`);
    }
    
    lines.push('');
    lines.push('### Summary');
    lines.push('');
    lines.push(d.summary || '*No summary available*');
    lines.push('');
    
    if (d.disposition) {
      lines.push('### Disposition');
      lines.push('');
      lines.push(d.disposition);
      lines.push('');
    }
    
    if (d.keywords) {
      lines.push('### Keywords Extracted');
      lines.push('');
      if (d.keywords.injury_types?.length > 0) {
        lines.push(`**Injury Types:** ${d.keywords.injury_types.join(', ')}`);
      }
      if (d.keywords.legal_tests?.length > 0) {
        lines.push(`**Legal Tests:** ${d.keywords.legal_tests.join(', ')}`);
      }
      if (d.keywords.outcomes?.length > 0) {
        lines.push(`**Outcomes Detected:** ${d.keywords.outcomes.join(', ')}`);
      }
      lines.push('');
    }
    
    lines.push('---');
    lines.push('');
  }
  
  // Add analysis template
  lines.push('## PATTERN ANALYSIS TEMPLATE');
  lines.push('');
  lines.push('*(NotebookLM: Please fill this out after analyzing all decisions above)*');
  lines.push('');
  lines.push('### Worker Win Phrases');
  lines.push('');
  lines.push('| Phrase | Decision # | Confidence | Notes |');
  lines.push('|--------|------------|------------|-------|');
  lines.push('| [phrase] | [number] | High/Medium/Low | [context] |');
  lines.push('');
  lines.push('### Worker Loss Phrases');
  lines.push('');
  lines.push('| Phrase | Decision # | Confidence | Notes |');
  lines.push('|--------|------------|------------|-------|');
  lines.push('| [phrase] | [number] | High/Medium/Low | [context] |');
  lines.push('');
  lines.push('### Mixed/Procedural Phrases');
  lines.push('');
  lines.push('| Phrase | Decision # | Confidence | Notes |');
  lines.push('|--------|------------|------------|-------|');
  lines.push('| [phrase] | [number] | High/Medium/Low | [context] |');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const tribunalArg = args[0] || 'all';
  const countArg = parseInt(args[1]) || 50;
  
  console.log('📤 EXPORT UNKNOWN DECISIONS FOR NOTEBOOKLM');
  console.log('==========================================');
  console.log(`Tribunal: ${tribunalArg}`);
  console.log(`Sample Size: ${countArg}`);
  console.log('');
  
  // Create export directory
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }
  
  // Load decisions
  const allDecisions = loadDecisions(tribunalArg);
  console.log(`✅ Loaded ${allDecisions.length} total decisions`);
  
  // Filter for Unknown outcomes
  const unknownDecisions = allDecisions.filter(d => 
    (d.outcome || 'Unknown') === 'Unknown'
  );
  console.log(`🔍 Found ${unknownDecisions.length} Unknown outcomes`);
  
  if (unknownDecisions.length === 0) {
    console.log('🎉 No Unknown outcomes found! Re-extraction was successful.');
    return;
  }
  
  // Sample random subset
  const sample = sampleRandom(unknownDecisions, countArg);
  console.log(`📊 Selected ${sample.length} decisions for analysis`);
  
  // Generate markdown
  const markdown = generateMarkdown(sample, tribunalArg);
  
  // Save export
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `unknown-decisions-${tribunalArg}-batch2-${timestamp}.md`;
  const exportPath = path.join(EXPORT_DIR, filename);
  
  fs.writeFileSync(exportPath, markdown, 'utf8');
  
  console.log('');
  console.log('✅ Export complete!');
  console.log(`📄 File: ${exportPath}`);
  console.log(`📦 Size: ${(markdown.length / 1024).toFixed(1)} KB`);
  console.log('');
  console.log('📋 NEXT STEPS:');
  console.log('');
  console.log('1. Upload this file to NotebookLM (notebooklm.google.com)');
  console.log('2. Ask NotebookLM to analyze outcome patterns (see instructions in file)');
  console.log('3. Copy new phrases to scripts/enhanced-outcome-keywords.js');
  console.log('4. Re-run: node scripts/re-extract-outcomes-with-notebooklm-patterns.js');
  console.log('5. Check improvement in next report');
  console.log('');
  
  // Stats
  const unknownPct = ((unknownDecisions.length / allDecisions.length) * 100).toFixed(1);
  console.log(`📊 CURRENT STATUS:`);
  console.log(`   Unknown: ${unknownDecisions.length} / ${allDecisions.length} (${unknownPct}%)`);
  console.log(`   Sample: ${sample.length} decisions exported for Batch 2`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { loadDecisions, sampleRandom, generateMarkdown };
