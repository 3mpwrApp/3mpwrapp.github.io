#!/usr/bin/env node
/**
 * Extract Outcomes from Keywords/Summaries
 * 
 * Scans existing tribunal decision files and extracts outcomes using pattern matching
 * on keywords, summaries, and titles.
 * 
 * OUTCOME PATTERNS:
 * - WIN: "entitled", "appeal allowed", "granted", "succeed"
 * - LOSS: "not entitled", "appeal dismissed", "denied", "rejected"
 * - PARTIAL: "partially allowed", "allowed in part", "remitted"
 * - REMAND: "remitted back", "returned to", "sent back"
 * 
 * Usage:
 *   node scripts/extract-outcomes-from-keywords.js
 *   node scripts/extract-outcomes-from-keywords.js --database=onwsiat
 *   node scripts/extract-outcomes-from-keywords.js --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const OUTPUT_SUFFIX = '-with-outcomes';
const DRY_RUN = process.argv.includes('--dry-run');
const TARGET_DB = process.argv.find(arg => arg.startsWith('--database='))?.split('=')[1];

// Outcome detection patterns (case-insensitive)
const OUTCOME_PATTERNS = {
  WIN: [
    // Direct win indicators
    /\bentitled to\b/i,
    /\bappeal allowed\b/i,
    /\bappeal is allowed\b/i,
    /\bappeal granted\b/i,
    /\bgranted\b.*\bappeal\b/i,
    /\bworker.*\bentitled\b/i,
    /\bsuccessful.*\bappeal\b/i,
    /\bappeal.*\bsucceed/i,
    /\bin favour of.*\bworker\b/i,
    /\bworker.*\bsuccess/i,
    /\bentitlement.*\bconfirmed\b/i,
    /\bentitlement.*\bestablished\b/i,
    /\baward.*\bbenefits?\b/i,
    /\breinstated\b/i,
    
    // Benefit-specific wins
    /\bentitled to.*\bNEL\b/i,
    /\bentitled to.*\bnon-economic loss\b/i,
    /\bentitled to.*\bLOE\b/i,
    /\bentitled to.*\bloss of earnings\b/i,
    /\bentitled to.*\bbenefits?\b/i,
    /\breceive.*\bbenefits?\b/i,
    /\baward.*\bcompensation\b/i,
  ],
  
  LOSS: [
    // Direct loss indicators
    /\bnot entitled\b/i,
    /\bappeal dismissed\b/i,
    /\bappeal is dismissed\b/i,
    /\bappeal denied\b/i,
    /\bdenied\b.*\bappeal\b/i,
    /\bappeal.*\brejected\b/i,
    /\bunsuccessful.*\bappeal\b/i,
    /\bappeal.*\bfail/i,
    /\bagainst.*\bworker\b/i,
    /\bin favour of.*\bemployer\b/i,
    /\bin favour of.*\bWSIB\b/i,
    /\bboard.*\bdecision.*\bupheld\b/i,
    /\bno entitlement\b/i,
    /\bentitlement.*\bdenied\b/i,
    
    // Insufficient evidence
    /\binsufficient evidence\b/i,
    /\black.*\bevidence\b/i,
    /\bfailed to establish\b/i,
    /\bfailed to prove\b/i,
    /\bcredibility.*\bissues?\b/i,
    /\bnot credible\b/i,
  ],
  
  PARTIAL: [
    // Partial win indicators
    /\bpartially allowed\b/i,
    /\ballowed in part\b/i,
    /\bappeal.*\bpartially\b/i,
    /\bpartly successful\b/i,
    /\bin part.*\bgranted\b/i,
    /\bsome.*\bbenefits?\b/i,
    /\blimited.*\bentitlement\b/i,
    /\breduced.*\baward\b/i,
  ],
  
  REMAND: [
    // Remanded back for reconsideration
    /\bremitted back\b/i,
    /\breturned to\b.*\b(WSIB|board|tribunal)\b/i,
    /\bsent back\b/i,
    /\breferred back\b/i,
    /\bremit.*\bfor\b.*\b(reconsideration|review|decision)\b/i,
    /\bfor further\b.*\b(consideration|review|hearing)\b/i,
    /\breconsider\b/i,
  ],
};

/**
 * Extract outcome from decision metadata
 */
function extractOutcome(decision) {
  // Combine searchable fields
  const searchText = [
    decision.title || '',
    decision.keywords || '',
    decision.snippet || '',
    decision.topics || '',
    decision.summary || '',
  ].join(' ');
  
  // Track all matched patterns for confidence scoring
  const matches = {
    WIN: 0,
    LOSS: 0,
    PARTIAL: 0,
    REMAND: 0,
  };
  
  // Test each pattern
  for (const [outcome, patterns] of Object.entries(OUTCOME_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(searchText)) {
        matches[outcome]++;
      }
    }
  }
  
  // Priority order: PARTIAL > REMAND > WIN > LOSS
  // (Partial and Remand are more specific, should override general win/loss)
  if (matches.PARTIAL > 0) {
    return {
      outcome: 'Partial Win',
      confidence: matches.PARTIAL >= 2 ? 'high' : 'medium',
      method: 'keyword_analysis',
      matches: matches.PARTIAL,
    };
  }
  
  if (matches.REMAND > 0) {
    return {
      outcome: 'Remanded',
      confidence: matches.REMAND >= 2 ? 'high' : 'medium',
      method: 'keyword_analysis',
      matches: matches.REMAND,
    };
  }
  
  // Conflicting signals? (Both WIN and LOSS patterns found)
  if (matches.WIN > 0 && matches.LOSS > 0) {
    // More WIN signals = likely win
    if (matches.WIN > matches.LOSS) {
      return {
        outcome: 'Worker Won',
        confidence: 'low', // Conflicting signals = lower confidence
        method: 'keyword_analysis',
        matches: matches.WIN,
        conflict: true,
      };
    }
    // More LOSS signals = likely loss
    if (matches.LOSS > matches.WIN) {
      return {
        outcome: 'Worker Lost',
        confidence: 'low',
        method: 'keyword_analysis',
        matches: matches.LOSS,
        conflict: true,
      };
    }
    // Equal signals = unknown
    return {
      outcome: 'Unknown',
      confidence: 'none',
      method: 'keyword_analysis',
      conflict: true,
    };
  }
  
  // Clear WIN signal
  if (matches.WIN > 0) {
    return {
      outcome: 'Worker Won',
      confidence: matches.WIN >= 3 ? 'high' : matches.WIN >= 2 ? 'medium' : 'low',
      method: 'keyword_analysis',
      matches: matches.WIN,
    };
  }
  
  // Clear LOSS signal
  if (matches.LOSS > 0) {
    return {
      outcome: 'Worker Lost',
      confidence: matches.LOSS >= 3 ? 'high' : matches.LOSS >= 2 ? 'medium' : 'low',
      method: 'keyword_analysis',
      matches: matches.LOSS,
    };
  }
  
  // No patterns matched
  return {
    outcome: 'Unknown',
    confidence: 'none',
    method: 'keyword_analysis',
  };
}

/**
 * Process a single tribunal decision file
 */
function processFile(filePath) {
  console.log(`\n📂 Processing: ${path.basename(filePath)}`);
  
  // Read existing file
  const rawData = fs.readFileSync(filePath, 'utf-8');
  let decisions;
  
  try {
    const parsed = JSON.parse(rawData);
    
    // Handle different file structures
    if (Array.isArray(parsed)) {
      decisions = parsed;
    } else if (parsed.decisions && Array.isArray(parsed.decisions)) {
      decisions = parsed.decisions;
    } else if (parsed.data && Array.isArray(parsed.data)) {
      decisions = parsed.data;
    } else {
      console.log(`   ⚠️  Skipping: Not an array or unknown structure`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error parsing file: ${error.message}`);
    return null;
  }
  
  if (!decisions || decisions.length === 0) {
    console.log(`   ⚠️  Skipping: Empty or no decisions found`);
    return null;
  }
  
  console.log(`   Total decisions: ${decisions.length}`);
  
  // Track statistics
  const stats = {
    total: decisions.length,
    beforeUnknown: 0,
    afterUnknown: 0,
    wins: 0,
    losses: 0,
    partial: 0,
    remanded: 0,
    highConfidence: 0,
    mediumConfidence: 0,
    lowConfidence: 0,
    conflicts: 0,
  };
  
  // Count before
  stats.beforeUnknown = decisions.filter(d => 
    !d.outcome || d.outcome === 'Unknown' || d.outcome === 'unknown'
  ).length;
  
  // Process each decision
  const updatedDecisions = decisions.map(decision => {
    const outcomeData = extractOutcome(decision);
    
    // Update decision with extracted outcome
    const updated = {
      ...decision,
      outcome: outcomeData.outcome,
      outcome_confidence: outcomeData.confidence,
      outcome_method: outcomeData.method,
    };
    
    // Add metadata for analysis
    if (outcomeData.matches) {
      updated.outcome_pattern_matches = outcomeData.matches;
    }
    if (outcomeData.conflict) {
      updated.outcome_conflict = true;
      stats.conflicts++;
    }
    
    // Update statistics
    if (outcomeData.outcome === 'Unknown') {
      stats.afterUnknown++;
    } else if (outcomeData.outcome === 'Worker Won') {
      stats.wins++;
    } else if (outcomeData.outcome === 'Worker Lost') {
      stats.losses++;
    } else if (outcomeData.outcome === 'Partial Win') {
      stats.partial++;
    } else if (outcomeData.outcome === 'Remanded') {
      stats.remanded++;
    }
    
    // Confidence tracking
    if (outcomeData.confidence === 'high') stats.highConfidence++;
    else if (outcomeData.confidence === 'medium') stats.mediumConfidence++;
    else if (outcomeData.confidence === 'low') stats.lowConfidence++;
    
    return updated;
  });
  
  // Calculate improvement
  const improvement = stats.beforeUnknown - stats.afterUnknown;
  const improvementPct = ((improvement / stats.beforeUnknown) * 100).toFixed(1);
  
  // Display statistics
  console.log(`\n   📊 BEFORE: ${stats.beforeUnknown} unknown (${((stats.beforeUnknown/stats.total)*100).toFixed(1)}%)`);
  console.log(`   📊 AFTER:  ${stats.afterUnknown} unknown (${((stats.afterUnknown/stats.total)*100).toFixed(1)}%)`);
  console.log(`   ✅ Improvement: +${improvement} outcomes detected (${improvementPct}% of unknowns resolved)`);
  console.log(`\n   🎯 OUTCOMES:`);
  console.log(`      Worker Won:  ${stats.wins} (${((stats.wins/stats.total)*100).toFixed(1)}%)`);
  console.log(`      Worker Lost: ${stats.losses} (${((stats.losses/stats.total)*100).toFixed(1)}%)`);
  console.log(`      Partial Win: ${stats.partial} (${((stats.partial/stats.total)*100).toFixed(1)}%)`);
  console.log(`      Remanded:    ${stats.remanded} (${((stats.remanded/stats.total)*100).toFixed(1)}%)`);
  console.log(`      Unknown:     ${stats.afterUnknown} (${((stats.afterUnknown/stats.total)*100).toFixed(1)}%)`);
  console.log(`\n   🎓 CONFIDENCE:`);
  console.log(`      High:   ${stats.highConfidence} (${((stats.highConfidence/stats.total)*100).toFixed(1)}%)`);
  console.log(`      Medium: ${stats.mediumConfidence} (${((stats.mediumConfidence/stats.total)*100).toFixed(1)}%)`);
  console.log(`      Low:    ${stats.lowConfidence} (${((stats.lowConfidence/stats.total)*100).toFixed(1)}%)`);
  console.log(`      None:   ${stats.afterUnknown} (${((stats.afterUnknown/stats.total)*100).toFixed(1)}%)`);
  
  if (stats.conflicts > 0) {
    console.log(`\n   ⚠️  Conflicting signals: ${stats.conflicts} decisions`);
  }
  
  // Save updated file (unless dry run)
  if (!DRY_RUN) {
    const outputPath = filePath.replace('.json', `${OUTPUT_SUFFIX}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(updatedDecisions, null, 2));
    console.log(`\n   💾 Saved: ${path.basename(outputPath)}`);
  } else {
    console.log(`\n   🔍 DRY RUN - No files modified`);
  }
  
  return stats;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 OUTCOME EXTRACTION FROM KEYWORDS\n');
  console.log('=' .repeat(60));
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  // Find all tribunal decision files
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json') && !f.includes(OUTPUT_SUFFIX))
    .filter(f => {
      // Filter by database if specified
      if (!TARGET_DB) return true;
      return f.startsWith(TARGET_DB);
    })
    .filter(f => {
      // Exclude small test files
      const filePath = path.join(DATA_DIR, f);
      const size = fs.statSync(filePath).size;
      return size > 1000; // At least 1KB
    })
    .map(f => path.join(DATA_DIR, f));
  
  if (files.length === 0) {
    console.log('❌ No tribunal decision files found!');
    console.log(`   Looking in: ${DATA_DIR}`);
    if (TARGET_DB) {
      console.log(`   Database filter: ${TARGET_DB}`);
    }
    process.exit(1);
  }
  
  console.log(`Found ${files.length} tribunal decision files\n`);
  if (TARGET_DB) {
    console.log(`Filtering: ${TARGET_DB} only\n`);
  }
  
  // Process each file
  const allStats = {
    totalDecisions: 0,
    totalBeforeUnknown: 0,
    totalAfterUnknown: 0,
    totalWins: 0,
    totalLosses: 0,
    totalPartial: 0,
    totalRemanded: 0,
    totalHighConf: 0,
    totalMediumConf: 0,
    totalLowConf: 0,
    totalConflicts: 0,
  };
  
  for (const file of files) {
    const stats = processFile(file);
    
    // Skip if file couldn't be processed
    if (!stats) continue;
    
    // Aggregate
    allStats.totalDecisions += stats.total;
    allStats.totalBeforeUnknown += stats.beforeUnknown;
    allStats.totalAfterUnknown += stats.afterUnknown;
    allStats.totalWins += stats.wins;
    allStats.totalLosses += stats.losses;
    allStats.totalPartial += stats.partial;
    allStats.totalRemanded += stats.remanded;
    allStats.totalHighConf += stats.highConfidence;
    allStats.totalMediumConf += stats.mediumConfidence;
    allStats.totalLowConf += stats.lowConfidence;
    allStats.totalConflicts += stats.conflicts;
  }
  
  // Display overall statistics
  console.log('\n' + '='.repeat(60));
  console.log('📊 OVERALL STATISTICS');
  console.log('='.repeat(60));
  console.log(`\nTotal decisions processed: ${allStats.totalDecisions}`);
  console.log(`\nBEFORE: ${allStats.totalBeforeUnknown} unknown outcomes (${((allStats.totalBeforeUnknown/allStats.totalDecisions)*100).toFixed(1)}%)`);
  console.log(`AFTER:  ${allStats.totalAfterUnknown} unknown outcomes (${((allStats.totalAfterUnknown/allStats.totalDecisions)*100).toFixed(1)}%)`);
  
  const totalImprovement = allStats.totalBeforeUnknown - allStats.totalAfterUnknown;
  const improvementPct = ((totalImprovement / allStats.totalBeforeUnknown) * 100).toFixed(1);
  console.log(`\n✅ TOTAL IMPROVEMENT: +${totalImprovement} outcomes detected`);
  console.log(`   (Resolved ${improvementPct}% of previously unknown outcomes)`);
  
  console.log(`\n🎯 OUTCOME BREAKDOWN:`);
  console.log(`   Worker Won:  ${allStats.totalWins} (${((allStats.totalWins/allStats.totalDecisions)*100).toFixed(1)}%)`);
  console.log(`   Worker Lost: ${allStats.totalLosses} (${((allStats.totalLosses/allStats.totalDecisions)*100).toFixed(1)}%)`);
  console.log(`   Partial Win: ${allStats.totalPartial} (${((allStats.totalPartial/allStats.totalDecisions)*100).toFixed(1)}%)`);
  console.log(`   Remanded:    ${allStats.totalRemanded} (${((allStats.totalRemanded/allStats.totalDecisions)*100).toFixed(1)}%)`);
  console.log(`   Unknown:     ${allStats.totalAfterUnknown} (${((allStats.totalAfterUnknown/allStats.totalDecisions)*100).toFixed(1)}%)`);
  
  console.log(`\n🎓 CONFIDENCE LEVELS:`);
  console.log(`   High:   ${allStats.totalHighConf} (${((allStats.totalHighConf/allStats.totalDecisions)*100).toFixed(1)}%)`);
  console.log(`   Medium: ${allStats.totalMediumConf} (${((allStats.totalMediumConf/allStats.totalDecisions)*100).toFixed(1)}%)`);
  console.log(`   Low:    ${allStats.totalLowConf} (${((allStats.totalLowConf/allStats.totalDecisions)*100).toFixed(1)}%)`);
  
  if (allStats.totalConflicts > 0) {
    console.log(`\n⚠️  Decisions with conflicting signals: ${allStats.totalConflicts} (${((allStats.totalConflicts/allStats.totalDecisions)*100).toFixed(1)}%)`);
    console.log(`   (Recommend manual review or cross-reference with official databases)`);
  }
  
  if (!DRY_RUN) {
    console.log(`\n💾 Updated files saved with suffix: ${OUTPUT_SUFFIX}.json`);
    console.log(`   Original files preserved unchanged.`);
  } else {
    console.log(`\n🔍 DRY RUN COMPLETE - No files were modified`);
    console.log(`   Remove --dry-run flag to save updated files`);
  }
  
  console.log('\n✅ OUTCOME EXTRACTION COMPLETE!\n');
}

// Run
main();
