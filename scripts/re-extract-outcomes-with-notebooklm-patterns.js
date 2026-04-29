#!/usr/bin/env node
/**
 * RE-EXTRACT OUTCOMES USING NOTEBOOKLM-ENHANCED PATTERNS
 * 
 * Purpose: Update existing tribunal JSON files with new outcome detection patterns
 *          discovered via NotebookLM analysis (April 2026)
 * 
 * Target: Reduce "Unknown" outcomes from ~95% to 30-70% depending on tribunal:
 *   - WSIAT: 94.3% → 50-60% (administrative language patterns)
 *   - ONSBT: 95.4% → 40-50% (consent orders + eligibility language)
 *   - ONWSIB: 95.4% → ~70% (internal review administrative language - CRITICAL)
 *   - ONHRT: N/A → 30-40% (discrimination findings)
 * 
 * Strategy:
 *   1. Load enhanced keyword library
 *   2. For each decision in existing JSON files:
 *      a. Extract full text summary/disposition sections
 *      b. Apply tribunal-specific pattern matching
 *      c. Assign confidence level (High/Medium/Low)
 *      d. Update outcome field if confidence >= Medium
 *   3. Generate before/after comparison report
 * 
 * Usage:
 *   node scripts/re-extract-outcomes-with-notebooklm-patterns.js [tribunal] [year]
 *   
 * Examples:
 *   node scripts/re-extract-outcomes-with-notebooklm-patterns.js onwsib 2023
 *   node scripts/re-extract-outcomes-with-notebooklm-patterns.js all all
 */

const fs = require('fs');
const path = require('path');
const enhancedKeywords = require('./enhanced-outcome-keywords');

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const BACKUP_DIR = path.join(DATA_DIR, 'backups-before-reextraction');
const REPORT_DIR = path.join(__dirname, '..', 'docs');

// Tribunal file patterns
const TRIBUNAL_PATTERNS = {
  wsiat: /onwsiat-\d{4}.*\.json$/i,
  onsbt: /onsbt-\d{4}.*\.json$/i,
  onwsib: /onwsib-\d{4}.*\.json$/i,
  onhrt: /onhrt-\d{4}.*\.json$/i,
  bcwcat: /bcwcat-\d{4}.*\.json$/i
};

/**
 * Extract outcome using enhanced NotebookLM patterns
 * @param {string} text - Full decision text (summary + disposition)
 * @param {string} tribunal - Tribunal code (wsiat, onsbt, onwsib, onhrt)
 * @returns {Object} { outcome: string, confidence: string, matchedPhrase: string }
 */
function extractOutcomeEnhanced(text, tribunal) {
  if (!text) {
    return { outcome: 'Unknown', confidence: 'None', matchedPhrase: null };
  }
  
  const textLower = text.toLowerCase();
  const keywords = enhancedKeywords[tribunal];
  
  if (!keywords) {
    console.warn(`⚠️  No enhanced keywords for tribunal: ${tribunal}`);
    return { outcome: 'Unknown', confidence: 'None', matchedPhrase: null };
  }
  
  // Check worker wins (high confidence)
  if (keywords.workerWins?.high) {
    for (const phrase of keywords.workerWins.high) {
      if (textLower.includes(phrase.toLowerCase())) {
        return {
          outcome: 'Appeal Allowed',
          confidence: 'High',
          matchedPhrase: phrase
        };
      }
    }
  }
  
  // Check worker loses (high confidence)
  if (keywords.workerLoses?.high) {
    for (const phrase of keywords.workerLoses.high) {
      if (textLower.includes(phrase.toLowerCase())) {
        return {
          outcome: 'Appeal Dismissed',
          confidence: 'High',
          matchedPhrase: phrase
        };
      }
    }
  }
  
  // Check worker wins (medium confidence)
  if (keywords.workerWins?.medium) {
    for (const phrase of keywords.workerWins.medium) {
      if (textLower.includes(phrase.toLowerCase())) {
        return {
          outcome: 'Appeal Allowed',
          confidence: 'Medium',
          matchedPhrase: phrase
        };
      }
    }
  }
  
  // Check worker loses (medium confidence)
  if (keywords.workerLoses?.medium) {
    for (const phrase of keywords.workerLoses.medium) {
      if (textLower.includes(phrase.toLowerCase())) {
        return {
          outcome: 'Appeal Dismissed',
          confidence: 'Medium',
          matchedPhrase: phrase
        };
      }
    }
  }
  
  // Check mixed outcomes
  if (keywords.mixed?.high) {
    for (const phrase of keywords.mixed.high) {
      if (textLower.includes(phrase.toLowerCase())) {
        return {
          outcome: 'Appeal Partially Allowed',
          confidence: 'High',
          matchedPhrase: phrase
        };
      }
    }
  }
  
  // Check procedural outcomes
  if (keywords.procedural) {
    // Remitted
    if (keywords.procedural.remitted) {
      for (const phrase of keywords.procedural.remitted) {
        if (textLower.includes(phrase.toLowerCase())) {
          return {
            outcome: 'Remitted',
            confidence: 'High',
            matchedPhrase: phrase
          };
        }
      }
    }
    
    // Varied
    if (keywords.procedural.varied) {
      for (const phrase of keywords.procedural.varied) {
        if (textLower.includes(phrase.toLowerCase())) {
          return {
            outcome: 'Varied',
            confidence: 'High',
            matchedPhrase: phrase
          };
        }
      }
    }
    
    // Withdrawn
    if (keywords.procedural.withdrawn) {
      for (const phrase of keywords.procedural.withdrawn) {
        if (textLower.includes(phrase.toLowerCase())) {
          return {
            outcome: 'Withdrawn',
            confidence: 'High',
            matchedPhrase: phrase
          };
        }
      }
    }
  }
  
  // Check common "deemed" language
  const deemedKeywords = enhancedKeywords.deemedLanguage;
  if (deemedKeywords) {
    for (const phrase of deemedKeywords.workerLoses) {
      if (textLower.includes(phrase.toLowerCase())) {
        return {
          outcome: 'Appeal Dismissed',
          confidence: 'Medium',
          matchedPhrase: phrase
        };
      }
    }
    
    for (const phrase of deemedKeywords.workerWins) {
      if (textLower.includes(phrase.toLowerCase())) {
        return {
          outcome: 'Appeal Allowed',
          confidence: 'Medium',
          matchedPhrase: phrase
        };
      }
    }
  }
  
  return { outcome: 'Unknown', confidence: 'None', matchedPhrase: null };
}

/**
 * Process a single JSON file
 */
function processFile(filePath, tribunal) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`);
  
  // Load JSON
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!Array.isArray(data)) {
    console.error('❌ File is not an array of decisions');
    return null;
  }
  
  // Stats
  let stats = {
    total: data.length,
    beforeUnknown: 0,
    afterUnknown: 0,
    improved: 0,
    unchanged: 0,
    highConfidence: 0,
    mediumConfidence: 0
  };
  
  // Process each decision
  for (let decision of data) {
    const oldOutcome = decision.outcome || 'Unknown';
    
    if (oldOutcome === 'Unknown') {
      stats.beforeUnknown++;
    }
    
    // Build text for analysis from all available fields
    let analysisText = '';
    
    // Different tribunals have different field structures
    if (decision.full_text) {
      analysisText += decision.full_text + ' ';
    }
    if (decision.summary) {
      analysisText += decision.summary + ' ';
    }
    if (decision.disposition) {
      analysisText += decision.disposition + ' ';
    }
    if (decision.data?.summary) {
      analysisText += decision.data.summary + ' ';
    }
    if (decision.data?.disposition) {
      analysisText += decision.data.disposition + ' ';
    }
    
    // Add keywords as context
    if (decision.keywords_api) {
      analysisText += decision.keywords_api.join(' ') + ' ';
    }
    if (decision.data?.keywords) {
      analysisText += decision.data.keywords + ' ';
    }
    if (decision.keywords?.issues) {
      analysisText += decision.keywords.issues.join(' ') + ' ';
    }
    
    // Skip if no text available
    if (analysisText.trim().length === 0) {
      stats.unchanged++;
      if ((decision.outcome || 'Unknown') === 'Unknown') {
        stats.afterUnknown++;
      }
      continue;
    }
    
    // Extract outcome
    const result = extractOutcomeEnhanced(analysisText, tribunal);
    
    // Only update if we found something AND it's not already set correctly
    if (result.outcome !== 'Unknown' && result.confidence !== 'None') {
      decision.outcome = result.outcome;
      decision.outcomeConfidence = result.confidence;
      decision.outcomeMatchedPhrase = result.matchedPhrase;
      
      if (oldOutcome === 'Unknown') {
        stats.improved++;
      }
      
      if (result.confidence === 'High') {
        stats.highConfidence++;
      } else if (result.confidence === 'Medium') {
        stats.mediumConfidence++;
      }
    } else {
      stats.unchanged++;
    }
    
    if ((decision.outcome || 'Unknown') === 'Unknown') {
      stats.afterUnknown++;
    }
  }
  
  return { data, stats };
}

/**
 * Generate before/after report
 */
function generateReport(results, reportPath) {
  const lines = [];
  
  lines.push('# OUTCOME RE-EXTRACTION REPORT');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Strategy:** NotebookLM-Enhanced Patterns (April 2026)`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  let totalBefore = 0;
  let totalAfter = 0;
  let totalImproved = 0;
  let totalDecisions = 0;
  
  for (const [file, result] of Object.entries(results)) {
    if (!result) continue;
    
    const { stats } = result;
    totalBefore += stats.beforeUnknown;
    totalAfter += stats.afterUnknown;
    totalImproved += stats.improved;
    totalDecisions += stats.total;
    
    const beforePct = ((stats.beforeUnknown / stats.total) * 100).toFixed(1);
    const afterPct = ((stats.afterUnknown / stats.total) * 100).toFixed(1);
    const improvement = (beforePct - afterPct).toFixed(1);
    
    lines.push(`## ${path.basename(file)}`);
    lines.push('');
    lines.push(`- **Total Decisions:** ${stats.total}`);
    lines.push(`- **Before Unknown:** ${stats.beforeUnknown} (${beforePct}%)`);
    lines.push(`- **After Unknown:** ${stats.afterUnknown} (${afterPct}%)`);
    lines.push(`- **Improved:** ${stats.improved} decisions`);
    lines.push(`- **High Confidence:** ${stats.highConfidence}`);
    lines.push(`- **Medium Confidence:** ${stats.mediumConfidence}`);
    lines.push(`- **Improvement:** ↓ ${improvement}% Unknown rate`);
    lines.push('');
  }
  
  lines.push('---');
  lines.push('');
  lines.push('## OVERALL SUMMARY');
  lines.push('');
  
  const overallBeforePct = ((totalBefore / totalDecisions) * 100).toFixed(1);
  const overallAfterPct = ((totalAfter / totalDecisions) * 100).toFixed(1);
  const overallImprovement = (overallBeforePct - overallAfterPct).toFixed(1);
  
  lines.push(`- **Total Decisions:** ${totalDecisions}`);
  lines.push(`- **Before Unknown:** ${totalBefore} (${overallBeforePct}%)`);
  lines.push(`- **After Unknown:** ${totalAfter} (${overallAfterPct}%)`);
  lines.push(`- **Improved:** ${totalImproved} decisions`);
  lines.push(`- **Overall Improvement:** ↓ ${overallImprovement}% Unknown rate`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## NEXT STEPS');
  lines.push('');
  lines.push('1. **Manual Review:** Check decisions still marked "Unknown" for patterns');
  lines.push('2. **NotebookLM Batch 2:** Upload remaining Unknown cases for pattern discovery');
  lines.push('3. **Tribunal-Specific Extraction:** Use CanLII proximity operators for full text');
  lines.push('4. **Bulk Data:** Contact data@wsiat.ca for CSV machine-readable outcomes');
  
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
  console.log(`\n✅ Report saved: ${reportPath}`);
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const tribunalArg = args[0] || 'all';
  const yearArg = args[1] || 'all';
  
  console.log('🚀 OUTCOME RE-EXTRACTION USING NOTEBOOKLM PATTERNS');
  console.log('================================================');
  console.log(`Tribunal: ${tribunalArg}`);
  console.log(`Year: ${yearArg}`);
  
  // Create backup directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Find files to process
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .filter(f => !f.includes('BACKUP'))
    .filter(f => !f.startsWith('.progress'))  // Skip progress tracking files
    .filter(f => !f.startsWith('.'))           // Skip hidden files
    .filter(f => {
      if (tribunalArg === 'all') return true;
      const pattern = TRIBUNAL_PATTERNS[tribunalArg.toLowerCase()];
      return pattern && pattern.test(f);
    })
    .filter(f => {
      if (yearArg === 'all') return true;
      return f.includes(yearArg);
    });
  
  if (files.length === 0) {
    console.error('❌ No files found matching criteria');
    return;
  }
  
  console.log(`\n📊 Found ${files.length} files to process\n`);
  
  const results = {};
  
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    
    // Determine tribunal from filename
    let tribunal = null;
    for (const [key, pattern] of Object.entries(TRIBUNAL_PATTERNS)) {
      if (pattern.test(file)) {
        tribunal = key;
        break;
      }
    }
    
    if (!tribunal) {
      console.warn(`⚠️  Could not determine tribunal for: ${file}`);
      continue;
    }
    
    // Create backup
    const backupPath = path.join(BACKUP_DIR, `BACKUP-${Date.now()}-${file}`);
    fs.copyFileSync(filePath, backupPath);
    console.log(`💾 Backup: ${path.basename(backupPath)}`);
    
    // Process file
    const result = processFile(filePath, tribunal);
    
    if (result) {
      // Save updated file
      fs.writeFileSync(filePath, JSON.stringify(result.data, null, 2), 'utf8');
      console.log(`✅ Updated: ${file}`);
      
      results[file] = result;
    }
  }
  
  // Generate report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const reportPath = path.join(REPORT_DIR, `outcome-reextraction-report-${timestamp}.md`);
  generateReport(results, reportPath);
  
  console.log('\n🎉 RE-EXTRACTION COMPLETE!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { extractOutcomeEnhanced, processFile };
