#!/usr/bin/env node
/**
 * SUPER ENHANCED CLASSIFICATION - Version 2.0
 * 
 * Improvements:
 * - 120+ outcome patterns (up from 70)
 * - WSIAT file support (-ultra-slow.json)
 * - Multi-database cross-learning
 * - Confidence boosting for multiple pattern matches
 * - Outcome-specific keyword dictionaries
 */

const fs = require('fs');
const path = require('path');

// EXPANDED OUTCOME PATTERNS - 120+ patterns
const SUPER_ENHANCED_PATTERNS = {
  'Allowed': [
    // Core patterns
    /\ballowed?\b/i,
    /\bgranted\b/i,
    /\bapproved?\b/i,
    /\beligible\b/i,
    /\bentitled to\b/i,
    /\bentitlement\b/i,
    // Favorable decisions
    /\bin favour of.*applicant/i,
    /\bin favour of.*appellant/i,
    /\bin favour of.*worker/i,
    /\bin favour of.*claimant/i,
    /\bin favor of.*applicant/i,
    /\bin favor of.*worker/i,
    // Appeal outcomes
    /\bappeal.*allowed/i,
    /\bappeal.*successful/i,
    /\bappeal.*granted/i,
    /\bapplication.*granted/i,
    /\bapplication.*successful/i,
    /\bapplication.*approved/i,
    // Benefits
    /\bbenefits?.*granted/i,
    /\bbenefits?.*allowed/i,
    /\bbenefits?.*approved/i,
    /\bbenefits?.*entitled/i,
    /\bclaim.*allowed/i,
    /\bclaim.*granted/i,
    /\bclaim.*approved/i,
    /\bclaim.*successful/i,
    // Financial outcomes
    /\bfunding.*approved/i,
    /\bfunding.*granted/i,
    /\bmedications?.*approved/i,
    /\bassistance.*granted/i,
    /\bsupport.*granted/i,
    /\bcompensation.*granted/i,
    /\bawards?.*granted/i,
    // Decision language
    /\bthe board.*allows/i,
    /\bthe tribunal.*allows/i,
    /\bthe appeal.*is allowed/i,
    /\bthe application.*is granted/i,
  ],
  
  'Dismissed': [
    // Core patterns
    /\bdismissed?\b/i,
    /\bdenied\b/i,
    /\brejected\b/i,
    /\brefused\b/i,
    /\bdeclined\b/i,
    // Eligibility
    /\bnot eligible\b/i,
    /\bineligible\b/i,
    /\bdoes not qualify\b/i,
    /\bno entitlement\b/i,
    /\bnot entitled\b/i,
    /\blacks entitlement\b/i,
    // Negative outcomes
    /\bappeal.*dismissed\b/i,
    /\bappeal.*denied\b/i,
    /\bappeal.*rejected\b/i,
    /\bappeal.*unsuccessful/i,
    /\bapplication.*dismissed\b/i,
    /\bapplication.*denied\b/i,
    /\bapplication.*rejected\b/i,
    /\bapplication.*unsuccessful/i,
    // Favor respondent
    /\bin favour of.*respondent/i,
    /\bin favour of.*employer/i,
    /\bin favour of.*board/i,
    /\bin favour of.*director/i,
    /\bin favor of.*respondent/i,
    /\bin favor of.*employer/i,
    // Claims
    /\bclaim.*dismissed\b/i,
    /\bclaim.*denied\b/i,
    /\bclaim.*rejected\b/i,
    /\bclaim.*unsuccessful/i,
    // Decision language
    /\bupheld.*director/i,
    /\bconfirmed.*director/i,
    /\bupheld.*board/i,
    /\bconfirmed.*board/i,
    /\bthe board.*dismisses/i,
    /\bthe tribunal.*dismisses/i,
    /\bthe appeal.*is dismissed/i,
    /\bthe application.*is dismissed/i,
    /\bno compensable/i,
    /\bno right to.*benefits?/i,
  ],
  
  'Remitted': [
    /\bremit\b/i,
    /\bremitted\b/i,
    /\bremitting\b/i,
    /\bsent back/i,
    /\breturned.*reconsideration/i,
    /\breturned.*further consideration/i,
    /\brefer.*back/i,
    /\breferred back/i,
    /\breturn.*board/i,
    /\breturn.*director/i,
    /\breturn.*decision maker/i,
    /\bappeal.*allowed in part.*remitted/i,
    /\bpartially allowed.*remitted/i,
  ],
  
  'Reconsideration': [
    /\breconsider/i,
    /\breconsideration\b/i,
    /\binternal review/i,
    /\breview.*request/i,
    /\brequest.*review/i,
    /\brequest.*reconsideration/i,
    /\binternal.*review.*request/i,
    /\bapplication.*reconsideration/i,
    /\bmotion.*reconsider/i,
    /\bseeks? reconsideration/i,
  ],
  
  'Settled/Withdrawn': [
    /\bwithdrawn?\b/i,
    /\bsettled?\b/i,
    /\babandon/i,
    /\babandoned\b/i,
    /\bdiscontinued\b/i,
    /\bdiscontinuance\b/i,
    /\bconsent\b/i,
    /\bconsent order/i,
    /\bsettlement\b/i,
    /\bsettlement agreement/i,
    /\bminutes of settlement/i,
    /\bvoluntarily withdrawn/i,
    /\bparties.*settled/i,
  ],
  
  'No Jurisdiction': [
    /\bno jurisdiction\b/i,
    /\blacks jurisdiction\b/i,
    /\bwithout jurisdiction\b/i,
    /\boutside.*jurisdiction/i,
    /\bjurisdiction.*declined/i,
    /\bdoes not have jurisdiction/i,
    /\bno authority/i,
    /\bno power to/i,
    /\bbeyond.*jurisdiction/i,
    /\btribunal.*no jurisdiction/i,
    /\bboard.*no jurisdiction/i,
  ],
  
  'Procedural': [
    /\bprocedural\b/i,
    /\bpreliminary\b/i,
    /\bextension.*time/i,
    /\btime.*extend/i,
    /\btime limit/i,
    /\bnotice.*requirement/i,
    /\badjournment/i,
    /\badjourned\b/i,
    /\bpostpone/i,
    /\bpostponed\b/i,
    /\bdefer/i,
    /\bdeferred\b/i,
    /\bstay.*proceedings/i,
    /\bamendment/i,
    /\bjoinder\b/i,
    /\bintervention/i,
    /\bdisclosure\b/i,
    /\bproduction.*documents/i,
  ],
  
  'Interim Decision': [
    /\binterim\b/i,
    /\bpreliminary\b/i,
    /\btemporary\b/i,
    /\bprovisional\b/i,
    /\bpending\b/i,
    /\binterlocutory\b/i,
    /\binterim order/i,
    /\btemporary order/i,
  ],
  
  'Costs Decision': [
    /\bcosts\b/i,
    /\boverpayment/i,
    /\brepayment/i,
    /\brecovery.*overpayment/i,
    /\basses.*overpayment/i,
    /\bcost.*award/i,
    /\bcost.*order/i,
    /\blegal costs/i,
    /\bparty.*party costs/i,
  ],
  
  'Application Deficiency': [
    /\bapplication.*incomplete/i,
    /\bapplication.*deficient/i,
    /\bdeficiency\b/i,
    /\bincomplete.*application/i,
    /\bmissing.*information/i,
    /\binsufficient.*information/i,
    /\badditional.*information.*required/i,
    /\bdocuments?.*required/i,
    /\bfailed to provide/i,
  ],
};

// Keyword dictionaries for similarity matching
const OUTCOME_KEYWORDS = {
  'Allowed': ['granted', 'approved', 'eligible', 'entitled', 'successful', 'favor', 'favour', 'allowed'],
  'Dismissed': ['dismissed', 'denied', 'rejected', 'ineligible', 'unsuccessful', 'respondent', 'employer'],
  'Reconsideration': ['reconsider', 'review', 'internal', 'request'],
  'Costs Decision': ['costs', 'overpayment', 'repayment', 'recovery'],
};

function calculateSimilarity(keywords1, keywords2) {
  if (!keywords1 || !keywords2) return 0;
  const set1 = new Set(keywords1.join(' ').toLowerCase().split(/\s+/));
  const set2 = new Set(keywords2.join(' ').toLowerCase().split(/\s+/));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

function classifyCase(caseData, knownCases, allKnownCases = []) {
  const keywords = caseData.keywords_api ? caseData.keywords_api.join(' ') : '';
  const title = caseData.title || '';
  const combined = `${keywords} ${title}`;
  
  // Strategy 1: Pattern matching with confidence boosting
  let patternMatches = [];
  for (const [outcome, patterns] of Object.entries(SUPER_ENHANCED_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(combined)) {
        patternMatches.push(outcome);
      }
    }
  }
  
  // If multiple patterns match same outcome, boost confidence
  if (patternMatches.length > 0) {
    const matchCounts = {};
    patternMatches.forEach(outcome => {
      matchCounts[outcome] = (matchCounts[outcome] || 0) + 1;
    });
    
    const topOutcome = Object.entries(matchCounts).sort((a, b) => b[1] - a[1])[0];
    const confidence = Math.min(0.95, 0.75 + (topOutcome[1] * 0.05)); // Boost for multiple matches
    
    return {
      outcome: topOutcome[0],
      method: 'pattern_match',
      confidence: confidence,
      matchCount: topOutcome[1]
    };
  }
  
  // Strategy 2: Similarity matching (same database)
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
        method: 'similarity_match_same_db',
        confidence: 0.6 + (bestScore * 0.15),
        similarity: bestScore,
        matchedCase: bestMatch.case_id
      };
    }
    
    // Strategy 3: Cross-database learning
    if (allKnownCases.length > 0 && bestScore < 0.5) {
      for (const knownCase of allKnownCases) {
        if (!knownCase.keywords_api) continue;
        const similarity = calculateSimilarity(caseData.keywords_api, knownCase.keywords_api);
        if (similarity > bestScore && similarity > 0.45) { // Lower threshold for cross-db
          bestScore = similarity;
          bestMatch = knownCase;
        }
      }
      
      if (bestScore > 0.45) {
        return {
          outcome: bestMatch.outcome,
          method: 'similarity_match_cross_db',
          confidence: 0.55 + (bestScore * 0.1),
          similarity: bestScore,
          matchedCase: bestMatch.case_id,
          sourceDb: bestMatch.database || 'unknown'
        };
      }
    }
  }
  
  return null;
}

function processAllTribunals(dataDir) {
  const tribunalPatterns = {
    'onwsiat': ['-ultra-slow.json', '-complete.json'],
    'onsbt': ['-complete.json'],
    'onwsib': ['-complete.json'],
    'onhrt': ['-complete.json'],
    'onlrb': ['-complete.json'],
    'onca': ['-complete.json']
  };
  
  const overallStats = {
    totalProcessed: 0,
    totalClassified: 0,
    totalUnknown: 0,
    byTribunal: {},
    byOutcome: {},
    byMethod: {}
  };
  
  // First pass: collect all known cases for cross-database learning
  console.log('═══════════════════════════════════════════════');
  console.log('SUPER ENHANCED CLASSIFICATION v2.0');
  console.log('═══════════════════════════════════════════════\n');
  console.log('📚 Loading known cases for cross-database learning...\n');
  
  const allKnownCases = [];
  for (const [tribunal, patterns] of Object.entries(tribunalPatterns)) {
    for (const pattern of patterns) {
      const files = fs.readdirSync(dataDir)
        .filter(f => f.endsWith(pattern) && f.includes(tribunal) && !f.startsWith('BACKUP'));
      
      for (const file of files) {
        const filePath = path.join(dataDir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (!content || content.trim().length === 0) {
            console.log(`   ⚠️  Skipping empty file: ${file}`);
            continue;
          }
          const data = JSON.parse(content);
          const known = data.filter(c => c.outcome && c.outcome !== 'Unknown');
          allKnownCases.push(...known);
        } catch (err) {
          console.log(`   ❌ Error reading ${file}: ${err.message}`);
          throw err;
        }
      }
    }
  }
  
  console.log(`   Loaded ${allKnownCases.length} known cases for cross-learning\n`);
  
  // Second pass: classify
  for (const [tribunal, patterns] of Object.entries(tribunalPatterns)) {
    console.log(`\n📊 Processing tribunal: ${tribunal.toUpperCase()}`);
    console.log('─────────────────────────────────────────────');
    
    const files = [];
    for (const pattern of patterns) {
      const matches = fs.readdirSync(dataDir)
        .filter(f => f.endsWith(pattern) && f.includes(tribunal) && !f.startsWith('BACKUP'));
      files.push(...matches);
    }
    
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
        const classification = classifyCase(caseData, knownCases, allKnownCases);
        
        if (classification && classification.confidence >= 0.55) { // Lowered threshold slightly
          fileClassified++;
          caseData.outcome = classification.outcome;
          caseData.classification_method = classification.method;
          caseData.classification_confidence = classification.confidence;
          caseData.classified_at = new Date().toISOString();
          
          if (classification.matchedCase) {
            caseData.matched_case = classification.matchedCase;
          }
          if (classification.sourceDb) {
            caseData.source_database = classification.sourceDb;
          }
          if (classification.matchCount) {
            caseData.pattern_match_count = classification.matchCount;
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
    
    console.log(`  Files processed: ${files.length}`);
    console.log(`  Total: ${tribunalTotal} cases`);
    console.log(`  ✅ Classified: ${tribunalClassified} new cases`);
    console.log(`  ⏳ Unknown: ${tribunalUnknown} (${(tribunalUnknown/tribunalTotal*100).toFixed(1)}%)`);
  }
  
  // Print Ontario-wide summary
  console.log('\n═══════════════════════════════════════════════');
  console.log('🎯 ONTARIO-WIDE SUPER SUMMARY');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log(`Total cases: ${overallStats.totalProcessed}`);
  console.log(`New classifications: ${overallStats.totalClassified}`);
  console.log(`Remaining unknown: ${overallStats.totalUnknown}`);
  console.log(`Unknown rate: ${(overallStats.totalUnknown/overallStats.totalProcessed*100).toFixed(1)}%\n`);
  
  console.log('By Tribunal:');
  for (const [tribunal, stats] of Object.entries(overallStats.byTribunal).sort((a, b) => a[1].unknownRate - b[1].unknownRate)) {
    console.log(`  ${tribunal.toUpperCase()}: ${stats.unknown}/${stats.total} unknown (${stats.unknownRate}%)`);
  }
  
  console.log('\nTop Outcomes:');
  const sortedOutcomes = Object.entries(overallStats.byOutcome).sort((a, b) => b[1] - a[1]);
  for (const [outcome, count] of sortedOutcomes.slice(0, 15)) {
    const pct = (count / overallStats.totalClassified * 100).toFixed(1);
    console.log(`  ${outcome}: ${count} (${pct}%)`);
  }
  
  console.log('\nBy Method:');
  for (const [method, count] of Object.entries(overallStats.byMethod)) {
    const pct = (count / overallStats.totalClassified * 100).toFixed(1);
    console.log(`  ${method}: ${count} (${pct}%)`);
  }
  
  console.log('\n═══════════════════════════════════════════════');
  
  return overallStats;
}

// Run
const dataDir = 'data/tribunal-decisions';
const stats = processAllTribunals(dataDir);

// Save stats for blog update
fs.writeFileSync('ontario-classification-stats-v2.json', JSON.stringify(stats, null, 2));
console.log('\n💾 Stats saved to: ontario-classification-stats-v2.json\n');
