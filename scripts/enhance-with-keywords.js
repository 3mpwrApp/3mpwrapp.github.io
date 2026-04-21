#!/usr/bin/env node
/**
 * 🔬 PRAGMATIC ENRICHMENT (Keywords-Based)
 * 
 * REALITY CHECK:
 * - CanLII free API does NOT provide full HTML (confirmed via testing)
 * - Keywords field contains ~1100 chars of decision summary
 * - This is actually enough for pattern extraction!
 * 
 * Strategy:
 * 1. Re-process existing data with enhanced keyword analysis
 * 2. Extract abandonment reasons, disability terms from keywords
 * 3. Classify legal issues and outcomes more accurately
 * 4. No API calls needed - work with what we already have!
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 19, 2026
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');
const DETECTIVE_DIR = path.join(DATA_DIR, 'detective-analysis');

// Enhanced analysis functions

function analyzeKeywords(keywords) {
  if (!keywords || typeof keywords !== 'string') return null;
  
  const lower = keywords.toLowerCase();
  const analysis = {
    abandonment_indicators: [],
    disability_indicators: [],
    procedure_issues: [],
    legal_tests: [],
    outcomes: []
  };
  
  // Abandonment patterns (from your detective analysis)
  const abandonmentPatterns = {
    'email_undeliverable': ['undeliverable', 'email not returned', 'returned as undeliverable'],
    'failure_to_respond': ['failure to respond', 'failed to respond', 'no response', 'did not respond'],
    'missed_deadline': ['deadline', 'time limit', 'late', 'expired'],
    'non_attendance': ['failed to attend', 'did not attend', 'non-attendance'],
    'non_compliance': ['non-compliance', 'failed to comply', 'did not comply']
  };
  
  for (const [key, patterns] of Object.entries(abandonmentPatterns)) {
    if (patterns.some(p => lower.includes(p))) {
      analysis.abandonment_indicators.push(key);
    }
  }
  
  // Disability indicators
  const disabilityTerms = [
    'disability', 'mental health', 'chronic illness', 'addiction',
    'depression', 'anxiety', 'ptsd', 'bipolar', 'autism', 'adhd',
    'mobility', 'wheelchair', 'chronic pain', 'diabetes', 'epilepsy',
    'visual impairment', 'hearing impairment', 'accommodation', 'undue hardship'
  ];
  
  analysis.disability_indicators = disabilityTerms.filter(term => lower.includes(term));
  
  // Procedure issues
  const procedureTerms = [
    'reconsideration', 'motion to dismiss', 'preliminary hearing',
    'summary dismissal', 'jurisdiction', 'no reasonable prospect',
    'abuse of process', 'res judicata', 'vexatious'
  ];
  
  analysis.procedure_issues = procedureTerms.filter(term => lower.includes(term));
  
  // Legal tests
  const legalTests = [
    'prima facie', 'bona fide', 'undue hardship', 
    'adverse effect', 'constructive discrimination',
    'poisoned environment', 'reasonable prospect of success'
  ];
  
  analysis.legal_tests = legalTests.filter(term => lower.includes(term));
  
  // Outcome indicators
  const outcomes = {
    'dismissed': ['dismissed', 'dismiss'],
    'allowed': ['allowed', 'granted'],
    'abandoned': ['abandoned'],
    'settled': ['settled', 'withdrawn'],
    'deferred': ['deferred', 'adjourned']
  };
  
  for (const [outcome, patterns] of Object.entries(outcomes)) {
    if (patterns.some(p => lower.includes(p))) {
      analysis.outcomes.push(outcome);
    }
  }
  
  return analysis;
}

function enhanceCase(caseData) {
  // Handle different keyword field formats:
  // - keywords_api (array from scraper)
  // - keywords (could be array or string from detective analysis)
  let keywords = '';
  
  if (caseData.keywords_api && Array.isArray(caseData.keywords_api)) {
    keywords = caseData.keywords_api.join('; ');
  } else if (caseData.keywords) {
    if (Array.isArray(caseData.keywords)) {
      keywords = caseData.keywords.join('; ');
    } else if (typeof caseData.keywords === 'string') {
      keywords = caseData.keywords;
    }
  }
  
  const keywordAnalysis = analyzeKeywords(keywords);
  
  return {
    ...caseData,
    keyword_length: keywords.length,
    keyword_analysis: keywordAnalysis,
    enhanced_disability_detection: keywordAnalysis?.disability_indicators.length > 0,
    enhanced_abandonment_reasons: keywordAnalysis?.abandonment_indicators || [],
    procedure_flags: keywordAnalysis?.procedure_issues || [],
    legal_framework: keywordAnalysis?.legal_tests || [],
    keyword_outcome_hints: keywordAnalysis?.outcomes || []
  };
}

async function processDataset(inputFile, outputFile, datasetName) {
  console.log('\n' + '='.repeat(80));
  console.log(`📊 ENHANCING: ${datasetName}`);
  console.log('='.repeat(80));
  
  if (!fs.existsSync(inputFile)) {
    console.log(`⚠️  Input file not found: ${inputFile}`);
    return null;
  }
  
  const cases = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  console.log(`✅ Loaded ${cases.length} cases`);
  
  const enhanced = cases.map((c, i) => {
    if ((i + 1) % 100 === 0) {
      console.log(`  Processing ${i + 1}/${cases.length}...`);
    }
    return enhanceCase(c);
  });
  
  // Show sample keyword to verify extraction working
  const sampleWithKeywords = enhanced.find(c => c.keyword_length > 500);
  if (sampleWithKeywords) {
    console.log(`\n📝 Sample keywords (${sampleWithKeywords.keyword_length} chars):`);
    console.log(`  "${sampleWithKeywords.keyword_analysis ? 
      Object.keys(sampleWithKeywords.keyword_analysis).join(', ') : 'N/A'}"`);
  }
  
  // Generate statistics
  const stats = {
    total: enhanced.length,
    with_keywords: enhanced.filter(c => c.keyword_length > 100).length,
    avg_keyword_length: Math.round(enhanced.reduce((sum, c) => sum + (c.keyword_length || 0), 0) / enhanced.length),
    disability_cases: enhanced.filter(c => c.enhanced_disability_detection).length,
    with_abandonment_reasons: enhanced.filter(c => c.enhanced_abandonment_reasons.length > 0).length,
    with_procedure_flags: enhanced.filter(c => c.procedure_flags.length > 0).length,
    with_legal_tests: enhanced.filter(c => c.legal_framework.length > 0).length,
    
    // Detailed abandonment breakdown
    abandonment_breakdown: {
      email_undeliverable: enhanced.filter(c => c.enhanced_abandonment_reasons.includes('email_undeliverable')).length,
      failure_to_respond: enhanced.filter(c => c.enhanced_abandonment_reasons.includes('failure_to_respond')).length,
      missed_deadline: enhanced.filter(c => c.enhanced_abandonment_reasons.includes('missed_deadline')).length,
      non_attendance: enhanced.filter(c => c.enhanced_abandonment_reasons.includes('non_attendance')).length,
      non_compliance: enhanced.filter(c => c.enhanced_abandonment_reasons.includes('non_compliance')).length
    }
  };
  
  console.log('\n📊 ENHANCEMENT SUMMARY');
  console.log('-'.repeat(80));
  console.log(`  Total cases: ${stats.total}`);
  console.log(`  Cases with substantial keywords (>100 chars): ${stats.with_keywords}`);
  console.log(`  Average keyword length: ${stats.avg_keyword_length} chars`);
  console.log(`  Disability cases detected: ${stats.disability_cases}`);
  console.log(`  Cases with abandonment indicators: ${stats.with_abandonment_reasons}`);
  
  if (stats.with_abandonment_reasons > 0) {
    console.log(`\n  📋 Abandonment Reasons Breakdown:`);
    console.log(`     - Email undeliverable: ${stats.abandonment_breakdown.email_undeliverable}`);
    console.log(`     - Failure to respond: ${stats.abandonment_breakdown.failure_to_respond}`);
    console.log(`     - Missed deadline: ${stats.abandonment_breakdown.missed_deadline}`);
    console.log(`     - Non-attendance: ${stats.abandonment_breakdown.non_attendance}`);
    console.log(`     - Non-compliance: ${stats.abandonment_breakdown.non_compliance}`);
  }
  
  console.log(`\n  Cases with procedure flags: ${stats.with_procedure_flags}`);
  console.log(`  Cases citing legal tests: ${stats.with_legal_tests}`);
  
  // Ensure output directory exists
  const outDir = path.dirname(outputFile);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(enhanced, null, 2));
  console.log(`\n✅ Saved to: ${outputFile}`);
  
  return stats;
}

async function main() {
  console.log('█'.repeat(80));
  console.log('🔬 PRAGMATIC KEYWORD-BASED ENRICHMENT');
  console.log('Working with what CanLII gives us: ~1100 chars of keywords per case');
  console.log('█'.repeat(80));
  
  const datasets = [
    {
      input: path.join(DETECTIVE_DIR, 'hrto-abandoned-top500-recent.json'),
      output: path.join(DATA_DIR, 'deep-analysis', 'hrto-abandoned-enhanced-keywords.json'),
      name: 'HRTO Abandoned Cases (Top 500)'
    },
    {
      input: path.join(DETECTIVE_DIR, 'wsiat-top2000-recent.json'),
      output: path.join(DATA_DIR, 'deep-analysis', 'wsiat-top2000-enhanced-keywords.json'),
      name: 'WSIAT Cases (Top 2000)'
    },
    {
      input: path.join(DATA_DIR, 'onhrt-2025-complete.json'),
      output: path.join(DATA_DIR, 'deep-analysis', 'hrto-2025-enhanced.json'),
      name: 'HRTO 2025 (All Cases)'
    }
  ];
  
  const allStats = [];
  
  for (const dataset of datasets) {
    const stats = await processDataset(dataset.input, dataset.output, dataset.name);
    if (stats) allStats.push({ name: dataset.name, ...stats });
  }
  
  console.log('\n' + '█'.repeat(80));
  console.log('✅ ENHANCEMENT COMPLETE');
  console.log('█'.repeat(80));
  console.log('\n🎯 KEY FINDINGS:');
  allStats.forEach(s => {
    console.log(`\n${s.name}:`);
    console.log(`  - ${s.total} cases analyzed`);
    console.log(`  - ${s.with_keywords} with substantial keywords (${((s.with_keywords/s.total)*100).toFixed(1)}%)`);
    console.log(`  - ${s.disability_cases} disability cases (${((s.disability_cases/s.total)*100).toFixed(1)}%)`);
    console.log(`  - ${s.with_abandonment_reasons} with abandonment indicators (${((s.with_abandonment_reasons/s.total)*100).toFixed(1)}%)`);
    console.log(`  - Avg keyword length: ${s.avg_keyword_length} chars`);
    
    if (s.abandonment_breakdown && s.with_abandonment_reasons > 0) {
      console.log(`  - Top abandonment reasons:`);
      const breakdown = s.abandonment_breakdown;
      if (breakdown.email_undeliverable > 0) console.log(`    → Email: ${breakdown.email_undeliverable} (${((breakdown.email_undeliverable/s.with_abandonment_reasons)*100).toFixed(1)}%)`);
      if (breakdown.failure_to_respond > 0) console.log(`    → No response: ${breakdown.failure_to_respond} (${((breakdown.failure_to_respond/s.with_abandonment_reasons)*100).toFixed(1)}%)`);
      if (breakdown.missed_deadline > 0) console.log(`    → Deadline: ${breakdown.missed_deadline} (${((breakdown.missed_deadline/s.with_abandonment_reasons)*100).toFixed(1)}%)`);
    }
  });
  
  console.log('\n💡 NEXT STEPS:');
  console.log('  1. Use enhanced datasets for blog writing (keywords contain decision summaries!)');
  console.log('  2. Abandonment indicators show the "why" from keywords');
  console.log('  3. Disability detection now catches more cases via keyword analysis');
  console.log('  4. If you need FULL text: consider CanLII premium API or manual export');
}

main().catch(err => {
  console.error('❌ Enhancement failed:', err);
  process.exit(1);
});
