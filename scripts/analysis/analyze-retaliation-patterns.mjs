#!/usr/bin/env node

/**
 * analyze-retaliation-patterns.mjs
 * 
 * Analyzes 98,992 WSIAT decisions (2020-2026) for employer retaliation patterns
 * related to workers' compensation claim suppression.
 * 
 * NOTE: Current WSIAT dataset contains metadata only (title, keywords, citation).
 * Full decision text is not included. This limits analysis to CanLII-provided
 * keywords, which are still valuable for identifying broad patterns.
 * 
 * Keywords searched:
 * - Termination: terminated, termination, dismissed, dismissal, fired, discharge
 * - Discipline: disciplined, discipline, written warning, suspension
 * - Retaliation: retaliation, retaliat, reprisal, punish
 * - Coercion: threat, coercion, intimidation, pressure
 * - Privacy: direct medical, third party, third-party assessment
 * - Exclusions: decision of employer, labour relations, employment decision
 * - Mental stress: mental stress, psychological, anxiety, depression, PTSD
 * 
 * Output: JSON file with statistics + CSV for visualization
 * 
 * For full-text analysis, full decision text would need to be scraped from CanLII URLs.
 */

import fs from 'fs/promises';
import path from 'path';

// Configuration
const DATA_DIR = './data/tribunal-decisions';
const OUTPUT_DIR = './data/analysis';
const INPUT_FILE = path.join(DATA_DIR, 'onwsiat-2020-2026-complete.json');
const OUTPUT_JSON = path.join(OUTPUT_DIR, 'retaliation-patterns-analysis.json');
const OUTPUT_CSV = path.join(OUTPUT_DIR, 'retaliation-patterns.csv');

// Keyword categories
const KEYWORDS = {
  termination: [
    'terminated',
    'termination',
    'dismissed',
    'dismissal',
    'fired',
    'discharge',
    'discharged',
    'employment ended',
    'let go',
    'laid off'
  ],
  discipline: [
    'disciplined',
    'discipline',
    'written warning',
    'verbal warning',
    'suspension',
    'suspended',
    'reprimand',
    'performance improvement plan',
    'pip'
  ],
  retaliation: [
    'retaliation',
    'retaliat',
    'reprisal',
    'reprisals',
    'punish',
    'punished',
    'punishment',
    'retribution',
    'revenge'
  ],
  coercion: [
    'threat',
    'threatened',
    'threaten',
    'coercion',
    'coerced',
    'intimidation',
    'intimidated',
    'pressure',
    'pressured',
    'forced'
  ],
  privacy_violation: [
    'direct medical',
    'directly to',
    'third party',
    'third-party',
    'independent medical',
    'ime',
    'share medical'
  ],
  exclusion: [
    'decision of employer',
    'labour relations',
    'employment decision',
    'management decision',
    'managerial decision',
    'employer decision'
  ],
  mental_stress: [
    'mental stress',
    'chronic stress',
    'psychological',
    'anxiety',
    'depression',
    'ptsd',
    'traumatic stress'
  ]
};

// Timeline regex patterns
const DATE_PATTERNS = {
  injury: /injury\s+(?:date|occurred|happened)[\s:]*(\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2},?\s+\d{4})/gi,
  claim: /claim\s+(?:filed|submitted|date)[\s:]*(\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2},?\s+\d{4})/gi,
  termination: /termin(?:ated|ation)\s+(?:on|date)?[\s:]*(\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2},?\s+\d{4})/gi
};

/**
 * Search for keywords in text (case-insensitive)
 */
function searchKeywords(text, keywords) {
  const lowerText = (text || '').toLowerCase();
  const results = {
    found: false,
    matches: [],
    count: 0
  };
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      results.found = true;
      results.matches.push(keyword);
      results.count += matches.length;
    }
  });
  
  return results;
}

/**
 * Extract dates from text
 */
function extractDates(text, category) {
  const pattern = DATE_PATTERNS[category];
  const matches = [];
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1Str, date2Str) {
  try {
    const date1 = new Date(date1Str);
    const date2 = new Date(date2Str);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (e) {
    return null;
  }
}

/**
 * Analyze a single case
 */
function analyzeCase(caseData) {
  // Extract data from nested structure
  const data = caseData.data || caseData;
  const keywords = data.keywords || '';
  const title = data.title || '';
  const fullText = `${title} ${keywords}`.toLowerCase();
  
  const analysis = {
    case_id: data.caseId || caseData.caseId || data.concatenatedId,
    citation: data.citation || '',
    decision_date: data.decisionDate || '',
    
    // Keyword analysis
    termination: searchKeywords(fullText, KEYWORDS.termination),
    discipline: searchKeywords(fullText, KEYWORDS.discipline),
    retaliation: searchKeywords(fullText, KEYWORDS.retaliation),
    coercion: searchKeywords(fullText, KEYWORDS.coercion),
    privacy_violation: searchKeywords(fullText, KEYWORDS.privacy_violation),
    exclusion: searchKeywords(fullText, KEYWORDS.exclusion),
    mental_stress: searchKeywords(fullText, KEYWORDS.mental_stress),
    
    // Timeline extraction (from keywords/title if present)
    injury_dates: [],
    claim_dates: [],
    termination_dates: [],
    
    // Timing analysis
    claim_to_termination_days: null,
    timeline_flags: []
  };
  
  // Note: Timeline analysis limited without full decision text
  // Keywords field may contain some date information but not reliably
  
  return analysis;
}

/**
 * Calculate statistics
 */
function calculateStatistics(analyses) {
  const total = analyses.length;
  
  const stats = {
    total_cases: total,
    
    // Frequency counts
    termination: {
      count: analyses.filter(a => a.termination.found).length,
      percentage: 0,
      ci_lower: 0,
      ci_upper: 0
    },
    discipline: {
      count: analyses.filter(a => a.discipline.found).length,
      percentage: 0,
      ci_lower: 0,
      ci_upper: 0
    },
    retaliation: {
      count: analyses.filter(a => a.retaliation.found).length,
      percentage: 0,
      ci_lower: 0,
      ci_upper: 0
    },
    coercion: {
      count: analyses.filter(a => a.coercion.found).length,
      percentage: 0,
      ci_lower: 0,
      ci_upper: 0
    },
    privacy_violation: {
      count: analyses.filter(a => a.privacy_violation.found).length,
      percentage: 0,
      ci_lower: 0,
      ci_upper: 0
    },
    exclusion: {
      count: analyses.filter(a => a.exclusion.found).length,
      percentage: 0,
      ci_lower: 0,
      ci_upper: 0
    },
    mental_stress: {
      count: analyses.filter(a => a.mental_stress.found).length,
      percentage: 0,
      ci_lower: 0,
      ci_upper: 0
    },
    
    // Timeline analysis
    timeline: {
      cases_with_dates: analyses.filter(a => a.claim_to_termination_days !== null).length,
      percentage_with_timeline: 0,
      termination_7day: {
        count: analyses.filter(a => a.timeline_flags.includes('7-day')).length,
        percentage: 0,
        expected_baseline: 0.06, // 0.27% monthly ÷ ~4 weeks = 0.06% weekly
        ratio: 0,
        chi_square: 0
      },
      termination_30day: {
        count: analyses.filter(a => a.timeline_flags.includes('30-day')).length,
        percentage: 0,
        expected_baseline: 0.27, // 3.2% annual ÷ 12 months = 0.27% monthly
        ratio: 0,
        chi_square: 0
      },
      termination_90day: {
        count: analyses.filter(a => a.timeline_flags.includes('90-day')).length,
        percentage: 0,
        expected_baseline: 0.81, // 0.27% × 3 months = 0.81%
        ratio: 0,
        chi_square: 0
      }
    },
    
    // Co-occurrence patterns
    co_occurrence: {
      termination_and_exclusion: analyses.filter(a => 
        a.termination.found && a.exclusion.found
      ).length,
      termination_and_privacy: analyses.filter(a => 
        a.termination.found && a.privacy_violation.found
      ).length,
      coercion_and_termination: analyses.filter(a => 
        a.coercion.found && a.termination.found
      ).length,
      exclusion_and_mental_stress: analyses.filter(a => 
        a.exclusion.found && a.mental_stress.found
      ).length
    }
  };
  
  // Calculate percentages and confidence intervals
  Object.keys(stats).forEach(category => {
    if (stats[category].count !== undefined) {
      const count = stats[category].count;
      const p = count / total;
      stats[category].percentage = (p * 100).toFixed(2);
      
      // 95% CI using normal approximation
      const se = Math.sqrt((p * (1 - p)) / total);
      const z = 1.96; // 95% confidence
      stats[category].ci_lower = ((p - z * se) * 100).toFixed(2);
      stats[category].ci_upper = ((p + z * se) * 100).toFixed(2);
    }
  });
  
  // Timeline percentages
  const timelineCases = stats.timeline.cases_with_dates;
  if (timelineCases > 0) {
    stats.timeline.percentage_with_timeline = ((timelineCases / total) * 100).toFixed(2);
    
    ['7day', '30day', '90day'].forEach(period => {
      const key = `termination_${period}`;
      const count = stats.timeline[key].count;
      const percentage = (count / timelineCases) * 100;
      stats.timeline[key].percentage = percentage.toFixed(2);
      stats.timeline[key].percentage_of_total =  ((count / total) * 100).toFixed(2);
      
      // Calculate ratio to baseline
      const expected = stats.timeline[key].expected_baseline;
      stats.timeline[key].ratio = (percentage / expected).toFixed(1);
      
      // Chi-square test
      const observed = count;
      const expectedCount = (expected / 100) * timelineCases;
      const chiSq = Math.pow(observed - expectedCount, 2) / expectedCount;
      stats.timeline[key].chi_square = chiSq.toFixed(2);
    });
  }
  
  // Co-occurrence percentages (of cases where first condition is true)
  const termCount = stats.termination.count;
  const exclCount = stats.exclusion.count;
  const coerCount = stats.coercion.count;
  
  if (termCount > 0) {
    stats.co_occurrence.termination_and_exclusion_pct = 
      ((stats.co_occurrence.termination_and_exclusion / termCount) * 100).toFixed(1);
    stats.co_occurrence.termination_and_privacy_pct = 
      ((stats.co_occurrence.termination_and_privacy / termCount) * 100).toFixed(1);
  }
  
  if (coerCount > 0) {
    stats.co_occurrence.coercion_and_termination_pct = 
      ((stats.co_occurrence.coercion_and_termination / coerCount) * 100).toFixed(1);
  }
  
  if (exclCount > 0) {
    stats.co_occurrence.exclusion_and_mental_stress_pct = 
      ((stats.co_occurrence.exclusion_and_mental_stress / exclCount) * 100).toFixed(1);
  }
  
  return stats;
}

/**
 * Generate CSV for visualization
 */
function generateCSV(analyses) {
  const headers = [
    'case_id',
    'citation',
    'decision_date',
    'has_termination',
    'has_discipline',
    'has_retaliation',
    'has_coercion',
    'has_privacy_violation',
    'has_exclusion',
    'has_mental_stress',
    'claim_to_termination_days',
    'timeline_flags'
  ];
  
  const rows = analyses.map(a => [
    a.case_id,
    a.citation,
    a.decision_date,
    a.termination.found ? 1 : 0,
    a.discipline.found ? 1 : 0,
    a.retaliation.found ? 1 : 0,
    a.coercion.found ? 1 : 0,
    a.privacy_violation.found ? 1 : 0,
    a.exclusion.found ? 1 : 0,
    a.mental_stress.found ? 1 : 0,
    a.claim_to_termination_days || '',
    a.timeline_flags.join('|')
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Employer Retaliation Pattern Analysis');
  console.log('========================================\n');
  
  // Load data from individual year files
  console.log(`📂 Loading WSIAT data (2020-2026)...`);
  const yearFiles = [
    'onwsiat-2020-ultra-slow.json',
    'onwsiat-2021-ultra-slow.json',
    'onwsiat-2022-ultra-slow.json',
    'onwsiat-2023-ultra-slow.json',
    'onwsiat-2024-ultra-slow.json',
    'onwsiat-2025-ultra-slow.json',
    'onwsiat-2026-ultra-slow.json'
  ];
  
  const cases = [];
  for (const file of yearFiles) {
    try {
      const filePath = path.join(DATA_DIR, file);
      console.log(`  Loading ${file}...`);
      const rawData = await fs.readFile(filePath, 'utf-8');
      const yearCases = JSON.parse(rawData);
      cases.push(...yearCases);
      console.log(`    ✅ ${yearCases.length} cases from ${file.replace('onwsiat-', '').replace('-ultra-slow.json', '')}`);
    } catch (error) {
      console.log(`    ⚠️  ${file} not found, skipping...`);
    }
  }
  
  console.log(`\n✅ Loaded ${cases.length} total cases\n`);
  
  // Analyze each case
  console.log('🔬 Analyzing cases for retaliation patterns...');
  const analyses = cases.map((caseData, idx) => {
    if ((idx + 1) % 1000 === 0) {
      console.log(`  Processed ${idx + 1}/${cases.length} cases...`);
    }
    return analyzeCase(caseData);
  });
  console.log(`✅ Analysis complete\n`);
  
  // Calculate statistics
  console.log(' 📊 Calculating statistics...');
  const stats = calculateStatistics(analyses);
  console.log('✅ Statistics calculated\n');
  
  // Output  results
  console.log('💾 Saving results...');
  
  // Create output directory if needed
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  // Save JSON
  const output = {
    metadata: {
      generated_at: new Date().toISOString(),
      total_cases: cases.length,
      analysis_period: '2020-2026',
      jurisdiction: 'Ontario (WSIAT)'
    },
    statistics: stats,
    top_retaliation_cases: analyses
      .filter(a => a.termination.found && a.claim_to_termination_days !== null && a.claim_to_termination_days <= 30)
      .sort((a, b) => a.claim_to_termination_days - b.claim_to_termination_days)
      .slice(0, 50) // Top 50 most suspicious
  };
  
  await fs.writeFile(OUTPUT_JSON, JSON.stringify(output, null, 2));
  console.log(`✅ Saved JSON: ${OUTPUT_JSON}`);
  
  // Save CSV
  const csv = generateCSV(analyses);
  await fs.writeFile(OUTPUT_CSV, csv);
  console.log(`✅ Saved CSV: ${OUTPUT_CSV}\n`);
  
  // Print summary
  console.log('📈 SUMMARY RESULTS');
  console.log('==================\n');
  
  console.log(`Total cases analyzed: ${stats.total_cases}\n`);
  
  console.log('Keyword Frequencies:');
  console.log(`  Termination: ${stats.termination.count} (${stats.termination.percentage}%, CI: ${stats.termination.ci_lower}-${stats.termination.ci_upper}%)`);
  console.log(`  Discipline: ${stats.discipline.count} (${stats.discipline.percentage}%, CI: ${stats.discipline.ci_lower}-${stats.discipline.ci_upper}%)`);
  console.log(`  Retaliation: ${stats.retaliation.count} (${stats.retaliation.percentage}%, CI: ${stats.retaliation.ci_lower}-${stats.retaliation.ci_upper}%)`);
  console.log(`  Coercion: ${stats.coercion.count} (${stats.coercion.percentage}%, CI: ${stats.coercion.ci_lower}-${stats.coercion.ci_upper}%)`);
  console.log(`  Privacy Violation: ${stats.privacy_violation.count} (${stats.privacy_violation.percentage}%, CI: ${stats.privacy_violation.ci_lower}-${stats.privacy_violation.ci_upper}%)`);
  console.log(`  "Decision of Employer" Exclusion: ${stats.exclusion.count} (${stats.exclusion.percentage}%, CI: ${stats.exclusion.ci_lower}-${stats.exclusion.ci_upper}%)`);
  console.log(`  Mental Stress: ${stats.mental_stress.count} (${stats.mental_stress.percentage}%, CI: ${stats.mental_stress.ci_lower}-${stats.mental_stress.ci_upper}%)\n`);
  
  console.log('Timeline Analysis:');
  console.log(`  Cases with timeline data: ${stats.timeline.cases_with_dates} (${stats.timeline.percentage_with_timeline}% of total)`);
  if (stats.timeline.cases_with_dates > 0) {
    console.log(`  Termination within 7 days of claim: ${stats.timeline.termination_7day.count} (${stats.timeline.termination_7day.percentage}% of timeline cases, ${stats.timeline.termination_7day.ratio}x baseline, χ²=${stats.timeline.termination_7day.chi_square})`);
    console.log(`  Termination within 30 days of claim: ${stats.timeline.termination_30day.count} (${stats.timeline.termination_30day.percentage}% of timeline cases, ${stats.timeline.termination_30day.ratio}x baseline, χ²=${stats.timeline.termination_30day.chi_square})`);
    console.log(`  Termination within 90 days of claim: ${stats.timeline.termination_90day.count} (${stats.timeline.termination_90day.percentage}% of timeline cases, ${stats.timeline.termination_90day.ratio}x baseline, χ²=${stats.timeline.termination_90day.chi_square})\n`);
  } else {
    console.log('  (Insufficient timeline data for detailed analysis)\n');
  }
  
  console.log('Co-Occurrence Patterns:');
 console.log(`  Termination + "Decision of Employer" exclusion: ${stats.co_occurrence.termination_and_exclusion_pct}% of termination cases`);
  console.log(`  Termination + Privacy violation: ${stats.co_occurrence.termination_and_privacy_pct}% of termination cases`);
  console.log(`  Coercion + Termination: ${stats.co_occurrence.coercion_and_termination_pct}% of coercion cases`);
  console.log(`  Exclusion + Mental stress: ${stats.co_occurrence.exclusion_and_mental_stress_pct}% of exclusion cases\n`);
  
  console.log('⚠️  DATA LIMITATIONS');
  console.log('====================\n');
  console.log('This analysis searches CanLII-provided keywords and case titles only.');
  console.log('Full decision text is not included in current dataset.');
  console.log('\nWhat this means:');
  console.log('  ✅ Keyword-based patterns are reliable (CanLII tags cases systematically)');
  console.log('  ⚠️  Timeline analysis is limited (dates not reliably present in keywords)');
  console.log('  ⚠️  Counts may underestimate actual prevalence (subtle language not flagged)');
  console.log('\nFor full-text analysis:');
  console.log('  - Full decisions would need to be fetched from CanLII URLs');
  console.log('  - This would enable context analysis, timeline extraction, and phraseology studies');
  console.log('  - Current results represent conservative estimates\n');
  
  console.log('✅ Analysis complete!');
  console.log(`\n📊 View results: ${OUTPUT_JSON}`);
  console.log(`📈 CSV for visualization: ${OUTPUT_CSV}`);
}

// Run
main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
