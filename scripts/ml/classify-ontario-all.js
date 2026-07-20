#!/usr/bin/env node
/**
 * APPLY ENHANCED CLASSIFICATION TO ALL ONTARIO TRIBUNALS
 * 
 * Applies the same pattern matching + similarity approach to:
 * - ONWSIAT (98,992 cases)
 * - ONSBT (13,798 cases) - already processed
 * - ONWSIB (463 cases)
 * - ONHRT (9,269 cases)
 * - ONLRB (10,167 cases)
 * - ONCA (5,034 cases)
 * 
 * Total: 50,161 cases
 */

const fs = require('fs');
const path = require('path');

// Enhanced outcome patterns (universal across tribunals)
const ENHANCED_PATTERNS = {
  'Allowed': [
    /\ballowed?\b/i,
    /\bgranted\b/i,
    /\bapproved?\b/i,
    /\beligible\b/i,
    /\bentitled to\b/i,
    /\bin favour of.*applicant/i,
    /\bin favour of.*appellant/i,
    /\bin favour of.*worker/i,
    /\bin favour of.*claimant/i,
    /\bappeal.*allowed/i,
    /\bappeal.*successful/i,
    /\bapplication.*granted/i,
  ],
  'Dismissed': [
    /\bdismissed?\b/i,
    /\bdenied\b/i,
    /\brejected\b/i,
    /\bnot eligible\b/i,
    /\bineligible\b/i,
    /\bdoes not qualify\b/i,
    /\bno entitlement\b/i,
    /\bappeal.*dismissed\b/i,
    /\bapplication.*dismissed\b/i,
    /\bin favour of.*respondent/i,
    /\bin favour of.*employer/i,
    /\bin favour of.*board/i,
  ],
  'Remitted': [
    /\bremit/i,
    /\bsent back/i,
    /\breturned.*reconsideration/i,
    /\brefer.*back/i,
  ],
  'Reconsideration': [
    /\breconsider/i,
    /\binternal review/i,
    /\breview.*request/i,
    /\brequest.*review/i,
  ],
  'Settled/Withdrawn': [
    /\bwithdrawn?\b/i,
    /\bsettled?\b/i,
    /\babandon/i,
    /\bdiscontinued\b/i,
    /\bconsent\b/i,
    /\bsettlement\b/i,
  ],
  'No Jurisdiction': [
    /\bno jurisdiction\b/i,
    /\blacks jurisdiction\b/i,
    /\bwithout jurisdiction\b/i,
    /\boutside.*jurisdiction/i,
  ],
  'Procedural': [
    /\bprocedural\b/i,
    /\bextension.*time/i,
    /\btime.*extend/i,
    /\badjournment/i,
    /\bpostpone/i,
  ],
  'Interim Decision': [
    /\binterim\b/i,
    /\bpreliminary\b/i,
    /\btemporary\b/i,
  ],
  'Costs Decision': [
    /\bcosts\b/i,
    /\boverpayment/i,
    /\brepayment/i,
  ],
};

function calculateSimilarity(keywords1, keywords2) {
  if (!keywords1 || !keywords2) return 0;
  const set1 = new Set(keywords1.join(' ').toLowerCase().split(/\s+/));
  const set2 = new Set(keywords2.join(' ').toLowerCase().split(/\s+/));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

function classifyCase(caseData, knownCases) {
  const keywords = caseData.keywords_api ? caseData.keywords_api.join(' ') : '';
  const title = caseData.title || '';
  const combined = `${keywords} ${title}`;
  
  // Strategy 1: Pattern matching
  for (const [outcome, patterns] of Object.entries(ENHANCED_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(combined)) {
        return {
          outcome,
          method: 'pattern_match',
          confidence: 0.8,
        };
      }
    }
  }
  
  // Strategy 2: Similarity matching
  if (caseData.keywords_api && caseData.keywords_api.length > 0) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const knownCase of knownCases) {
      if (!knownCase.keywords_api) continue;
      const similarity = calculateSimilarity(caseData.keywords_api, knownCase.keywords_api);
      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = knownCase;
      }
    }
    
    if (bestScore > 0.5) {
      return {
        outcome: bestMatch.outcome,
        method: 'similarity_match',
        confidence: 0.6 + (bestScore * 0.15),
        matchedCase: bestMatch.case_id
      };
    }
  }
  
  return null;
}

function processAllTribunals(dataDir) {
  const tribunals = ['onwsiat', 'onsbt', 'onwsib', 'onhrt', 'onlrb', 'onca'];
  const overallStats = {
    totalProcessed: 0,
    totalClassified: 0,
    totalUnknown: 0,
    byTribunal: {},
    byOutcome: {},
    byMethod: {}
  };
  
  console.log('═══════════════════════════════════════════════');
  console.log('ONTARIO-WIDE ENHANCED CLASSIFICATION');
  console.log('═══════════════════════════════════════════════\n');
  
  for (const tribunal of tribunals) {
    console.log(`\n📊 Processing tribunal: ${tribunal.toUpperCase()}`);
    console.log('─────────────────────────────────────────────');
    
    const files = fs.readdirSync(dataDir)
      .filter(f => f.endsWith('-complete.json') && f.includes(tribunal) && !f.startsWith('BACKUP'));
    
    if (files.length === 0) {
      console.log(`  ⚠️  No files found for ${tribunal}`);
      continue;
    }
    
    let tribunalTotal = 0;
    let tribunalClassified = 0;
    let tribunalUnknown = 0;
    
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const knownCases = data.filter(c => c.outcome && c.outcome !== 'Unknown');
      const unknownCases = data.filter(c => c.outcome === 'Unknown');
      
      let fileClassified = 0;
      
      for (const caseData of unknownCases) {
        const classification = classifyCase(caseData, knownCases);
        
        if (classification && classification.confidence >= 0.6) {
          fileClassified++;
          caseData.outcome = classification.outcome;
          caseData.classification_method = classification.method;
          caseData.classification_confidence = classification.confidence;
          caseData.classified_at = new Date().toISOString();
          
          if (classification.matchedCase) {
            caseData.matched_case = classification.matchedCase;
          }
          
          overallStats.byOutcome[classification.outcome] = (overallStats.byOutcome[classification.outcome] || 0) + 1;
          overallStats.byMethod[classification.method] = (overallStats.byMethod[classification.method] || 0) + 1;
          
          if (!caseData.data_quality) caseData.data_quality = {};
          caseData.data_quality.has_outcome = true;
        }
      }
      
      tribunalTotal += data.length;
      tribunalClassified += fileClassified;
      tribunalUnknown += (unknownCases.length - fileClassified);
      
      // Write back
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
    
    overallStats.totalProcessed += tribunalTotal;
    overallStats.totalClassified += tribunalClassified;
    overallStats.totalUnknown += tribunalUnknown;
    overallStats.byTribunal[tribunal] = {
      total: tribunalTotal,
      classified: tribunalClassified,
      unknown: tribunalUnknown,
      unknownRate: (tribunalUnknown / tribunalTotal * 100).toFixed(1)
    };
    
    console.log(`  Total: ${tribunalTotal} cases`);
    console.log(`  ✅ Classified: ${tribunalClassified} new cases`);
    console.log(`  ⏳ Unknown: ${tribunalUnknown} (${(tribunalUnknown/tribunalTotal*100).toFixed(1)}%)`);
  }
  
  // Print Ontario-wide summary
  console.log('\n═══════════════════════════════════════════════');
  console.log('🎯 ONTARIO-WIDE SUMMARY');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log(`Total cases: ${overallStats.totalProcessed}`);
  console.log(`New classifications: ${overallStats.totalClassified}`);
  console.log(`Remaining unknown: ${overallStats.totalUnknown}`);
  console.log(`Unknown rate: ${(overallStats.totalUnknown/overallStats.totalProcessed*100).toFixed(1)}%\n`);
  
  console.log('By Tribunal:');
  for (const [tribunal, stats] of Object.entries(overallStats.byTribunal)) {
    console.log(`  ${tribunal.toUpperCase()}: ${stats.unknown}/${stats.total} unknown (${stats.unknownRate}%)`);
  }
  
  console.log('\nTop Outcomes:');
  const sortedOutcomes = Object.entries(overallStats.byOutcome).sort((a, b) => b[1] - a[1]);
  for (const [outcome, count] of sortedOutcomes.slice(0, 10)) {
    console.log(`  ${outcome}: ${count}`);
  }
  
  console.log('\nBy Method:');
  for (const [method, count] of Object.entries(overallStats.byMethod)) {
    console.log(`  ${method}: ${count}`);
  }
  
  console.log('\n═══════════════════════════════════════════════');
  
  return overallStats;
}

// Run
const dataDir = 'data/tribunal-decisions';
const stats = processAllTribunals(dataDir);

// Save stats for blog update
fs.writeFileSync('ontario-classification-stats.json', JSON.stringify(stats, null, 2));
console.log('\n💾 Stats saved to: ontario-classification-stats.json\n');
