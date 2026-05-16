#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data/tribunal-decisions');

// v3.0 Multi-Pass: Use ALL previously classified cases (now ~38,405) for even better cross-learning
// Lower confidence threshold slightly to catch more edge cases

const SUPER_ENHANCED_PATTERNS = {
  'Allowed': [
    /appeal\s+(is\s+)?allowed/i,
    /application\s+(is\s+)?allowed/i,
    /claim\s+(is\s+)?allowed/i,
    /decision.*in\s+favour\s+of\s+(the\s+)?(worker|appellant|applicant)/i,
    /benefits.*granted/i,
    /entitle(d|ment)\s+to/i,
    /find.*in\s+favour/i,
    /granted.*relief/i,
    /(\s|^)allowed(\s|$)/i,
    /succeeds/i,
    /appeal.*upheld/i,
    /decision.*overturned/i,
    /decision.*reversed/i,
    /accepted.*claim/i,
    /approved.*application/i,
    /finds?\s+for\s+(the\s+)?(worker|appellant|applicant)/i,
  ],
  'Dismissed': [
    /appeal\s+(is\s+)?dismissed/i,
    /application\s+(is\s+)?dismissed/i,
    /claim\s+(is\s+)?dismissed/i,
    /decision.*upheld/i,
    /no\s+entitlement/i,
    /not\s+entitled/i,
    /denied/i,
    /(\s|^)dismissed(\s|$)/i,
    /unsuccessful/i,
    /no\s+merit/i,
    /without\s+merit/i,
    /fails/i,
  ],
  'Reconsideration': [
    /reconsider(ation)?/i,
    /remit(ted)?.*for.*reconsider/i,
    /return.*for.*reconsider/i,
    /sent\s+back.*reconsider/i,
    /refer(red)?.*back/i,
    /new\s+hearing/i,
    /further\s+review/i,
    /additional\s+consider/i,
  ],
  'Settled/Withdrawn': [
    /settl(ed|ement)/i,
    /withdraw(n|al)/i,
    /discontinue(d)?/i,
    /abandon(ed)?/i,
    /consent\s+order/i,
    /minutes\s+of\s+settlement/i,
    /agreed\s+resolution/i,
  ],
  'No Jurisdiction': [
    /no\s+jurisdict/i,
    /lack.*jurisdict/i,
    /without\s+jurisdict/i,
    /jurisdiction.*decline/i,
    /not\s+within.*jurisdict/i,
    /outside.*jurisdict/i,
  ],
  'Procedural': [
    /procedural/i,
    /preliminary/i,
    /standing/i,
    /time\s+limit/i,
    /limitation\s+period/i,
    /late\s+filing/i,
    /extension.*time/i,
    /stay\s+of\s+proceedings/i,
    /adjournment/i,
    /postpone(d|ment)/i,
  ],
  'Interim Decision': [
    /interim/i,
    /interlocutory/i,
    /temporary/i,
    /pending/i,
    /until\s+final/i,
  ],
  'Costs Decision': [
    /costs?\s+award/i,
    /costs?\s+order/i,
    /costs?\s+decision/i,
    /legal\s+costs?/i,
    /represen(tation|tative)\s+costs?/i,
  ],
  'Application Deficiency': [
    /deficien(t|cy)/i,
    /incomplete\s+application/i,
    /insufficient.*informat/i,
    /material.*missing/i,
    /fail(ed)?\s+to\s+provide/i,
    /require(d)?\s+document/i,
  ],
  'Remitted': [
    /remit(ted)?(?!\s+for\s+reconsider)/i,
    /return(ed)?\s+to\s+(board|tribunal)/i,
    /sent\s+back(?!\s+for\s+reconsider)/i,
  ],
};

const tribunalPatterns = {
  onwsiat: ['-ultra-slow.json'],
  onsbt: ['-complete.json'],
  onwsib: ['-complete.json'],
  onhrt: ['-complete.json'],
  onlrb: ['-complete.json'],
  onca: ['-complete.json']
};

function calculateSimilarity(case1, case2) {
  const keywords1 = new Set(case1.keywords_api || []);
  const keywords2 = new Set(case2.keywords_api || []);
  
  const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
  const union = new Set([...keywords1, ...keywords2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

function classifyCase(caseData, sameDbCases, allKnownCases) {
  // Strategy 1: Pattern matching (highest confidence)
  let matchCount = 0;
  let matchedOutcome = null;
  
  const titleLower = (caseData.title || '').toLowerCase();
  const keywordsStr = (caseData.keywords_api || []).join(' ').toLowerCase();
  const combined = titleLower + ' ' + keywordsStr;
  
  for (const [outcome, patterns] of Object.entries(SUPER_ENHANCED_PATTERNS)) {
    let outcomeMatches = 0;
    for (const pattern of patterns) {
      if (pattern.test(combined)) {
        outcomeMatches++;
      }
    }
    if (outcomeMatches > matchCount) {
      matchCount = outcomeMatches;
      matchedOutcome = outcome;
    }
  }
  
  if (matchCount >= 2) {
    return {
      outcome: matchedOutcome,
      confidence: Math.min(0.95, 0.75 + (matchCount * 0.05)),
      method: 'pattern_match',
      matchCount
    };
  }
  
  // Strategy 2: Same-database similarity (good confidence)
  const similarities = sameDbCases.map(knownCase => ({
    case: knownCase,
    similarity: calculateSimilarity(caseData, knownCase)
  })).filter(s => s.similarity >= 0.50); // v3.0: Slightly lower threshold
  
  if (similarities.length > 0) {
    similarities.sort((a, b) => b.similarity - a.similarity);
    const best = similarities[0];
    
    return {
      outcome: best.case.outcome,
      confidence: 0.55 + (best.similarity * 0.20), // v3.0: Adjusted scoring
      method: 'similarity_match_same_db',
      matchedCase: best.case.case_id,
      similarity: best.similarity
    };
  }
  
  // Strategy 3: Cross-database learning (moderate confidence)
  const crossSimilarities = allKnownCases.map(knownCase => ({
    case: knownCase,
    similarity: calculateSimilarity(caseData, knownCase)
  })).filter(s => s.similarity >= 0.42); // v3.0: Lower threshold for v3
  
  if (crossSimilarities.length > 0) {
    crossSimilarities.sort((a, b) => b.similarity - a.similarity);
    const best = crossSimilarities[0];
    
    return {
      outcome: best.case.outcome,
      confidence: 0.50 + (best.similarity * 0.15), // v3.0: Lower base
      method: 'similarity_match_cross_db',
      matchedCase: best.case.case_id,
      sourceDb: best.case.database_id,
      similarity: best.similarity
    };
  }
  
  // Strategy 4: Single pattern match (low confidence - new in v3.0)
  if (matchCount === 1) {
    return {
      outcome: matchedOutcome,
      confidence: 0.52,
      method: 'pattern_match_single',
      matchCount: 1
    };
  }
  
  return null;
}

async function processAllTribunals() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('SUPER ENHANCED CLASSIFICATION v3.0 - MULTI-PASS');
  console.log('═══════════════════════════════════════════════\n');
  console.log('📚 Loading ALL known cases (including v2.0 results)...\n');
  
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
  
  console.log(`   ✅ Loaded ${allKnownCases.length} known cases (v2.0 enhanced training)\n`);
  
  const overallStats = {
    totalProcessed: 0,
    totalClassified: 0,
    totalUnknown: 0,
    byTribunal: {},
    byOutcome: {},
    byMethod: {}
  };
  
  for (const [tribunal, patterns] of Object.entries(tribunalPatterns)) {
    console.log(`\n📊 Processing tribunal: ${tribunal.toUpperCase()}`);
    console.log('─────────────────────────────────────────────');
    
    let tribunalTotal = 0;
    let tribunalClassified = 0;
    let tribunalUnknown = 0;
    let filesProcessed = 0;
    
    for (const pattern of patterns) {
      const files = fs.readdirSync(dataDir)
        .filter(f => f.endsWith(pattern) && f.includes(tribunal) && !f.startsWith('BACKUP'));
      
      for (const file of files) {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content || content.trim().length === 0) continue;
        
        const data = JSON.parse(content);
        const knownCases = data.filter(c => c.outcome && c.outcome !== 'Unknown');
        const unknownCases = data.filter(c => !c.outcome || c.outcome === 'Unknown');
        
        let fileClassified = 0;
        filesProcessed++;
        
        for (const caseData of unknownCases) {
          const classification = classifyCase(caseData, knownCases, allKnownCases);
          
          if (classification && classification.confidence >= 0.50) { // v3.0: Lower threshold
            fileClassified++;
            caseData.outcome = classification.outcome;
            caseData.classification_method = classification.method;
            caseData.classification_confidence = classification.confidence;
            caseData.classified_at = new Date().toISOString();
            caseData.classification_version = 'v3.0';
            
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
    
    console.log(`  Files processed: ${filesProcessed}`);
    console.log(`  Total: ${tribunalTotal} cases`);
    console.log(`  ✅ NEW in v3.0: ${tribunalClassified} cases`);
    console.log(`  ⏳ Unknown: ${tribunalUnknown} (${(tribunalUnknown/tribunalTotal*100).toFixed(1)}%)`);
  }
  
  // Print summary
  console.log('\n═══════════════════════════════════════════════');
  console.log('🎯 v3.0 MULTI-PASS SUMMARY');
  console.log('═══════════════════════════════════════════════\n');
  
  console.log(`Total cases: ${overallStats.totalProcessed}`);
  console.log(`NEW classifications v3.0: ${overallStats.totalClassified}`);
  console.log(`Remaining unknown: ${overallStats.totalUnknown}`);
  console.log(`Unknown rate: ${(overallStats.totalUnknown/overallStats.totalProcessed*100).toFixed(1)}%`);
  
  console.log('\nBy Tribunal:');
  const sortedTribunals = Object.entries(overallStats.byTribunal)
    .sort((a, b) => parseFloat(a[1].unknownRate) - parseFloat(b[1].unknownRate));
  for (const [tribunal, stats] of sortedTribunals) {
    console.log(`  ${tribunal.toUpperCase()}: ${stats.unknown}/${stats.total} unknown (${stats.unknownRate}%)`);
  }
  
  if (Object.keys(overallStats.byOutcome).length > 0) {
    console.log('\nTop Outcomes:');
    const sortedOutcomes = Object.entries(overallStats.byOutcome)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
    for (const [outcome, count] of sortedOutcomes) {
      const pct = (count / overallStats.totalClassified * 100).toFixed(1);
      console.log(`  ${outcome}: ${count} (${pct}%)`);
    }
    
    console.log('\nBy Method:');
    const sortedMethods = Object.entries(overallStats.byMethod)
      .sort((a, b) => b[1] - a[1]);
    for (const [method, count] of sortedMethods) {
      const pct = (count / overallStats.totalClassified * 100).toFixed(1);
      console.log(`  ${method}: ${count} (${pct}%)`);
    }
  }
  
  // Save stats
  const statsPath = path.join(__dirname, '../ontario-classification-stats-v3.json');
  fs.writeFileSync(statsPath, JSON.stringify(overallStats, null, 2));
  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`💾 Stats saved to: ontario-classification-stats-v3.json\n`);
}

processAllTribunals();
