#!/usr/bin/env node
/**
 * EXTRACT FULL TEXT FROM ONCA & ONLRB CASES
 * Strategy to overcome CanLII throttling and get actual decision text
 * 
 * CanLII Limitations:
 * - API throttles heavily (15 sec delays, quota limits)
 * - No full text in bulk responses
 * - Must fetch each case individually
 * 
 * Solution Strategy:
 * 1. Prioritize high-value cases (known outcomes, keywords present)
 * 2. Batch extraction (100 cases/day to avoid quota)
 * 3. Focus on precedent-setting cases
 * 4. Extract outcome signals from available metadata
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');

// ===== PRIORITIZATION LOGIC =====

function calculateCaseValue(caseData) {
  let score = 0;
  
  // Known outcomes are more valuable
  if (caseData.outcome && caseData.outcome !== 'Unknown') {
    score += 50;
  }
  
  // Cases with keywords
  if (caseData.keywords_api && caseData.keywords_api.length > 0) {
    score += caseData.keywords_api.length * 2;
  }
  
  // Retaliation/worker injury issues (HIGHEST PRIORITY)
  if (caseData.has_retaliation_issue || caseData.has_worker_injury_issue) {
    score += 100;
  }
  
  // Substantive outcomes (not procedural)
  const substantiveOutcomes = ['Appeal Allowed', 'Appeal Dismissed', 'Allowed', 'Dismissed', 
                                'Certification Granted', 'Certification Dismissed'];
  if (substantiveOutcomes.includes(caseData.outcome)) {
    score += 30;
  }
  
  // Recent cases (2024-2026)
  const year = parseInt(caseData.decision_date?.substring(0, 4) || '2020');
  if (year >= 2024) {
    score += 20;
  } else if (year >= 2022) {
    score += 10;
  }
  
  // Legislation cited
  if (caseData.legislation_cited && caseData.legislation_cited.length > 0) {
    score += caseData.legislation_cited.length * 5;
  }
  
  return score;
}

function analyzeONLRB() {
  console.log('\n=== ONLRB CASE PRIORITIZATION ===\n');
  
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  let allCases = [];
  
  years.forEach(year => {
    const file = path.join(DATA_DIR, `onlrb-${year}-complete.json`);
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      allCases = allCases.concat(data.map(c => ({ ...c, year })));
    }
  });
  
  console.log(`Total cases: ${allCases.length.toLocaleString()}`);
  
  // Calculate scores
  const scored = allCases.map(c => ({
    ...c,
    value_score: calculateCaseValue(c)
  }));
  
  // Sort by score (descending)
  scored.sort((a, b) => b.value_score - a.value_score);
  
  // Top 100 cases
  const top100 = scored.slice(0, 100);
  
  console.log('\nTop 100 High-Value Cases:');
  console.log('  Retaliation cases:', top100.filter(c => c.has_retaliation_issue).length);
  console.log('  Known outcomes:', top100.filter(c => c.outcome !== 'Unknown').length);
  console.log('  With legislation:', top100.filter(c => c.legislation_count > 0).length);
  console.log('  Recent (2024+):', top100.filter(c => c.year >= 2024).length);
  
  // Show examples
  console.log('\nTop 10 Examples:');
  top100.slice(0, 10).forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.title} (${c.year})`);
    console.log(`     Score: ${c.value_score} | Outcome: ${c.outcome}`);
    console.log(`     Keywords: ${(c.keywords_api || []).slice(0, 2).join('; ')}`);
  });
  
  // Save extraction queue
  const queueFile = path.join(DATA_DIR, 'onlrb-extraction-queue.json');
  fs.writeFileSync(queueFile, JSON.stringify({
    generated_at: new Date().toISOString(),
    strategy: 'Prioritize retaliation, known outcomes, recent cases',
    total_candidates: allCases.length,
    queue: top100.map(c => ({
      case_id: c.case_id,
      url: c.url,
      value_score: c.value_score,
      year: c.year,
      outcome: c.outcome,
      title: c.title,
      keywords: c.keywords_api
    }))
  }, null, 2));
  
  console.log(`\n✓ Extraction queue saved: ${queueFile}`);
  
  return top100;
}

function analyzeONCA() {
  console.log('\n\n=== ONCA CASE PRIORITIZATION ===\n');
  
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  let allCases = [];
  
  years.forEach(year => {
    const file = path.join(DATA_DIR, `onca-${year}-complete.json`);
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      allCases = allCases.concat(data.map(c => ({ ...c, year })));
    }
  });
  
  console.log(`Total appeals: ${allCases.length.toLocaleString()}`);
  
  // Calculate scores
  const scored = allCases.map(c => ({
    ...c,
    value_score: calculateCaseValue(c)
  }));
  
  // Sort by score
  scored.sort((a, b) => b.value_score - a.value_score);
  
  // Top 100
  const top100 = scored.slice(0, 100);
  
  console.log('\nTop 100 High-Value Appeals:');
  console.log('  Worker injury cases:', top100.filter(c => c.has_worker_injury_issue).length);
  console.log('  Substantive outcomes:', top100.filter(c => 
    ['Appeal Allowed', 'Appeal Dismissed', 'New Trial/Hearing Ordered', 'Remitted to Lower Court/Tribunal'].includes(c.outcome)
  ).length);
  console.log('  With legislation:', top100.filter(c => c.legislation_count > 0).length);
  console.log('  Recent (2024+):', top100.filter(c => c.year >= 2024).length);
  
  // Show examples
  console.log('\nTop 10 Examples:');
  top100.slice(0, 10).forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.title} (${c.year})`);
    console.log(`     Score: ${c.value_score} | Outcome: ${c.outcome}`);
    const keywordPreview = (c.keywords_api || [])[0] || 'No keywords';
    console.log(`     Keywords: ${keywordPreview.substring(0, 80)}...`);
  });
  
  // Save extraction queue
  const queueFile = path.join(DATA_DIR, 'onca-extraction-queue.json');
  fs.writeFileSync(queueFile, JSON.stringify({
    generated_at: new Date().toISOString(),
    strategy: 'Prioritize worker injury, substantive outcomes, recent cases',
    total_candidates: allCases.length,
    queue: top100.map(c => ({
      case_id: c.case_id,
      url: c.url,
      value_score: c.value_score,
      year: c.year,
      outcome: c.outcome,
      title: c.title,
      keywords: c.keywords_api
    }))
  }, null, 2));
  
  console.log(`\n✓ Extraction queue saved: ${queueFile}`);
  
  return top100;
}

function generateExtractionStrategy() {
  console.log('\n\n=== EXTRACTION STRATEGY ===\n');
  
  console.log('CanLII API Constraints:');
  console.log('  • Free tier: ~1000 requests/day');
  console.log('  • Required delay: 15 seconds/request');
  console.log('  • Full text: Individual case fetch only\n');
  
  console.log('Recommended Approach:');
  console.log('  1. Extract top 100 ONLRB cases (25 min runtime)');
  console.log('  2. Extract top 100 ONCA cases (25 min runtime)');
  console.log('  3. Run daily until queues complete\n');
  
  console.log('Alternative Strategies to Get Full Text:');
  console.log('  1. CanLII Bulk Data Program (research institutions only)');
  console.log('  2. Web scraping (respect robots.txt, slower)');
  console.log('  3. Manual download for highest-priority cases');
  console.log('  4. Use title + keywords for ML-based outcome prediction\n');
  
  console.log('Current Data Improvement:');
  console.log('  • ONLRB: 73.5% Unknown outcomes → can classify ~40% with better algorithms');
  console.log('  • ONCA: 58.1% Unknown outcomes → keywords are descriptive enough for classification');
  console.log('  • Focus: Extract signals from existing metadata before fetching full text\n');
}

function analyzeMetadataQuality() {
  console.log('\n=== METADATA QUALITY ANALYSIS ===\n');
  
  // ONLRB analysis
  const onlrbFile = path.join(DATA_DIR, 'onlrb-2026-complete.json');
  if (fs.existsSync(onlrbFile)) {
    const data = JSON.parse(fs.readFileSync(onlrbFile, 'utf8'));
    
    console.log('ONLRB 2026 Sample (most recent):');
    console.log(`  Cases: ${data.length}`);
    
    // Analyze keyword richness
    const keywordLengths = data.map(c => (c.keywords_api || []).join(' ').length);
    const avgKeywordLength = keywordLengths.reduce((a, b) => a + b, 0) / keywordLengths.length;
    
    console.log(`  Avg keyword text length: ${avgKeywordLength.toFixed(0)} chars`);
    
    // Check for outcome signals in keywords
    const outcomeSignals = data.filter(c => {
      const kw = (c.keywords_api || []).join(' ').toLowerCase();
      return kw.includes('dismiss') || kw.includes('allow') || kw.includes('grant') || 
             kw.includes('settled') || kw.includes('withdrawn');
    });
    
    console.log(`  Cases with outcome signals in keywords: ${outcomeSignals.length} (${(outcomeSignals.length / data.length * 100).toFixed(1)}%)`);
  }
  
  // ONCA analysis
  const oncaFile = path.join(DATA_DIR, 'onca-2026-complete.json');
  if (fs.existsSync(oncaFile)) {
    const data = JSON.parse(fs.readFileSync(oncaFile, 'utf8'));
    
    console.log('\nONCA 2026 Sample:');
    console.log(`  Appeals: ${data.length}`);
    
    // Keyword richness
    const keywordLengths = data.map(c => (c.keywords_api || []).join(' ').length);
    const avgKeywordLength = keywordLengths.reduce((a, b) => a + b, 0) / keywordLengths.length;
    
    console.log(`  Avg keyword text length: ${avgKeywordLength.toFixed(0)} chars`);
    
    // ONCA keywords are VERY detailed - often contain outcome
    const outcomeInKeywords = data.filter(c => {
      const kw = (c.keywords_api || []).join(' ').toLowerCase();
      return kw.includes('appeal dismissed') || kw.includes('appeal allowed') || 
             kw.includes('appeal granted') || kw.includes('remitted') || kw.includes('new trial');
    });
    
    console.log(`  Cases with explicit outcome in keywords: ${outcomeInKeywords.length} (${(outcomeInKeywords.length / data.length * 100).toFixed(1)}%)`);
  }
}

// ===== MAIN =====

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║  📊 ONCA & ONLRB EXTRACTION STRATEGY                              ║');
console.log('║  Overcome CanLII throttling with smart prioritization             ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');

analyzeMetadataQuality();
const onlrbQueue = analyzeONLRB();
const oncaQueue = analyzeONCA();
generateExtractionStrategy();

console.log('\n✓ Strategy complete!');
console.log('\nNext Steps:');
console.log('  1. Review extraction queues in data/tribunal-decisions/');
console.log('  2. Run targeted extraction for top 100 cases per tribunal');
console.log('  3. Implement ML-based outcome classification from keywords');
console.log('  4. Deploy improved data to website');
