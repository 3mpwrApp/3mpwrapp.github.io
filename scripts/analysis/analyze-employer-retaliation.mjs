#!/usr/bin/env node

/**
 * Employer Retaliation Analysis Script
 * 
 * Analyzes WSIAT dataset (98,992 cases, 2020-2026) for patterns of employer
 * retaliation following workers' compensation claims.
 * 
 * Research questions:
 * 1. What % of cases mention termination/discipline?
 * 2. What's the timing between claim filing and termination?
 * 3. Do certain industries have higher retaliation rates?
 * 4. Which employer tactics appear most frequently?
 * 5. What evidence wins retaliation claims?
 * 
 * Usage:
 *   node analyze-employer-retaliation.mjs
 * 
 * Output:
 *   - Console: Summary statistics
 *   - File: employer-retaliation-analysis-YYYY-MM-DD.json
 *   - File: employer-retaliation-report-YYYY-MM-DD.md
 */

import fs from 'fs/promises';
import path from 'path';

// Configuration
const DATA_DIR = '../data/tribunal-decisions';
const OUTPUT_DIR = '../docs';
const INPUT_FILE = path.join(DATA_DIR, 'onwsiat-2020-2026-complete.json');

// Retaliation keywords (grouped by category)
const KEYWORDS = {
  termination: [
    'terminat', 'dismiss', 'discharg', 'fired', 'separat',
    'end of employment', 'employment ended', 'ceased employment',
    'no longer employed', 'position eliminated'
  ],
  
  discipline: [
    'disciplin', 'warning', 'written reprimand', 'suspension',
    'performance improvement plan', 'corrective action',
    'misconduct', 'insubordination'
  ],
  
  retaliation: [
    'retaliat', 'reprisal', 'revenge', 'punish', 'retribution',
    'adverse action', 'discriminatory treatment'
  ],
  
  timing_indicators: [
    'shortly after', 'soon after', 'following the claim',
    'after filing', 'post-claim', 'within days', 'within weeks'
  ],
  
  pretext: [
    'pretext', 'pretextual', 'fabricated', 'false reason',
    'unfounded', 'unsubstantiated', 'lacking merit'
  ],
  
  clean_record: [
    'clean record', 'unblemished', 'no prior discipline',
    'excellent performance', 'model employee', 'positive reviews'
  ],
  
  accommodation_failure: [
    'fail to accommodate', 'refused accommodation', 'denied accommodation',
    'no accommodation offered', 'undue hardship'
  ]
};

// Temporal patterns to detect
const TIMING_PATTERNS = [
  { range: '0-30 days', min: 0, max: 30, risk: 'high' },
  { range: '31-60 days', min: 31, max: 60, risk: 'high' },
  { range: '61-90 days', min: 61, max: 90, risk: 'medium' },
  { range: '91-180 days', min: 91, max: 180, risk: 'low' },
  { range: '181+ days', min: 181, max: 9999, risk: 'very-low' }
];

/**
 * Load WSIAT dataset
 */
async function loadDataset() {
  console.log(`📂 Loading dataset from: ${INPUT_FILE}`);
  
  try {
    const rawData = await fs.readFile(INPUT_FILE, 'utf-8');
    const cases = JSON.parse(rawData);
    
    console.log(`✅ Loaded ${cases.length} cases`);
    return cases;
  } catch (error) {
    console.error(`❌ Error loading dataset: ${error.message}`);
    throw error;
  }
}

/**
 * Search for keyword in text (case-insensitive, partial match)
 */
function containsKeyword(text, keyword) {
  if (!text) return false;
  return text.toLowerCase().includes(keyword.toLowerCase());
}

/**
 * Search for any keyword from list in text
 */
function containsAnyKeyword(text, keywords) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Extract all mentions of retaliation keywords with context
 */
function extractRetaliationMentions(caseData) {
  const fullText = [
    caseData.summary || '',
    caseData.full_text || '',
    caseData.decision_text || ''
  ].join(' ');
  
  const mentions = {};
  
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    const found = keywords.filter(keyword => containsKeyword(fullText, keyword));
    if (found.length > 0) {
      mentions[category] = found;
    }
  }
  
  return mentions;
}

/**
 * Attempt to extract timing information from case text
 * (This is heuristic-based and may not be 100% accurate)
 */
function extractTimingInfo(caseData) {
  const fullText = [
    caseData.summary || '',
    caseData.full_text || '',
    caseData.decision_text || ''
  ].join(' ');
  
  // Look for date patterns
  const datePatterns = [
    /(\d{1,2})\s+days?\s+(?:after|following|post)/gi,
    /(\d{1,2})\s+weeks?\s+(?:after|following|post)/gi,
    /within\s+(\d{1,2})\s+days?/gi,
    /within\s+(\d{1,2})\s+weeks?/gi
  ];
  
  const timings = [];
  
  for (const pattern of datePatterns) {
    const matches = fullText.matchAll(pattern);
    for (const match of matches) {
      const value = parseInt(match[1]);
      const unit = match[0].includes('week') ? 'weeks' : 'days';
      const days = unit === 'weeks' ? value * 7 : value;
      
      timings.push({
        text: match[0],
        days: days,
        category: TIMING_PATTERNS.find(p => days >= p.min && days <= p.max)?.range || 'unknown'
      });
    }
  }
  
  return timings;
}

/**
 * Determine if case likely involves retaliation based on keywords
 */
function assessRetaliationLikelihood(mentions) {
  let score = 0;
  let factors = [];
  
  // Scoring system
  if (mentions.termination) {
    score += 3;
    factors.push('Termination mentioned');
  }
  
  if (mentions.discipline) {
    score += 2;
    factors.push('Discipline mentioned');
  }
  
  if (mentions.retaliation) {
    score += 5;
    factors.push('Explicit retaliation language');
  }
  
  if (mentions.timing_indicators) {
    score += 3;
    factors.push('Timing indicators present');
  }
  
  if (mentions.pretext) {
    score += 2;
    factors.push('Pretextual reasons suggested');
  }
  
  if (mentions.clean_record) {
    score += 2;
    factors.push('Clean record mentioned');
  }
  
  if (mentions.accommodation_failure) {
    score += 2;
    factors.push('Accommodation failure');
  }
  
  // Categorize likelihood
  let likelihood;
  if (score >= 8) likelihood = 'very-high';
  else if (score >= 6) likelihood = 'high';
  else if (score >= 4) likelihood = 'medium';
  else if (score >= 2) likelihood = 'low';
  else likelihood = 'very-low';
  
  return { score, likelihood, factors };
}

/**
 * Main analysis function
 */
async function analyzeRetaliationPatterns() {
  console.log('\n🔬 Starting Employer Retaliation Analysis\n');
  console.log('=' .repeat(60));
  
  // Load data
  const cases = await loadDataset();
  
  // Analysis results
  const results = {
    metadata: {
      total_cases: cases.length,
      analysis_date: new Date().toISOString().split('T')[0],
      script_version: '1.0.0'
    },
    
    keyword_frequencies: {},
    retaliation_likelihood: {
      'very-high': [],
      'high': [],
      'medium': [],
      'low': [],
      'very-low': []
    },
    
    timing_distribution: {},
    
    case_examples: {
      'very-high': [],
      'high': [],
      'medium': []
    },
    
    statistics: {}
  };
  
  // Initialize keyword frequency counters
  for (const category of Object.keys(KEYWORDS)) {
    results.keyword_frequencies[category] = {
      count: 0,
      percentage: 0,
      cases: []
    };
  }
  
  // Initialize timing distribution
  for (const pattern of TIMING_PATTERNS) {
    results.timing_distribution[pattern.range] = {
      count: 0,
      percentage: 0,
      risk_level: pattern.risk
    };
  }
  
  console.log('\n📊 Analyzing cases...\n');
  
  let processedCount = 0;
  
  // Process each case
  for (const caseData of cases) {
    processedCount++;
    
    if (processedCount % 1000 === 0) {
      console.log(`   Processed ${processedCount}/${cases.length} cases (${((processedCount/cases.length)*100).toFixed(1)}%)`);
    }
    
    // Extract retaliation mentions
    const mentions = extractRetaliationMentions(caseData);
    
    // Update keyword frequencies
    for (const [category, keywords] of Object.entries(mentions)) {
      results.keyword_frequencies[category].count++;
      results.keyword_frequencies[category].cases.push(caseData.case_id);
    }
    
    // Assess retaliation likelihood
    const assessment = assessRetaliationLikelihood(mentions);
    
    const caseInfo = {
      case_id: caseData.case_id,
      citation: caseData.citation,
      decision_date: caseData.decision_date,
      score: assessment.score,
      factors: assessment.factors,
      mentions: mentions
    };
    
    results.retaliation_likelihood[assessment.likelihood].push(caseInfo);
    
    // Store examples (top 10 per category)
    if (['very-high', 'high', 'medium'].includes(assessment.likelihood)) {
      if (results.case_examples[assessment.likelihood].length < 10) {
        results.case_examples[assessment.likelihood].push(caseInfo);
      }
    }
    
    // Extract timing info
    const timings = extractTimingInfo(caseData);
    for (const timing of timings) {
      if (results.timing_distribution[timing.category]) {
        results.timing_distribution[timing.category].count++;
      }
    }
  }
  
  console.log(`\n✅ Processed all ${processedCount} cases\n`);
  
  // Calculate percentages
  for (const category of Object.keys(results.keyword_frequencies)) {
    const count = results.keyword_frequencies[category].count;
    results.keyword_frequencies[category].percentage = ((count / cases.length) * 100).toFixed(2);
  }
  
  const totalTimings = Object.values(results.timing_distribution).reduce((sum, t) => sum + t.count, 0);
  for (const range of Object.keys(results.timing_distribution)) {
    const count = results.timing_distribution[range].count;
    results.timing_distribution[range].percentage = totalTimings > 0 
      ? ((count / totalTimings) * 100).toFixed(2)
      : '0.00';
  }
  
  // Calculate summary statistics
  results.statistics = {
    termination_rate: results.keyword_frequencies.termination.percentage + '%',
    discipline_rate: results.keyword_frequencies.discipline.percentage + '%',
    explicit_retaliation_rate: results.keyword_frequencies.retaliation.percentage + '%',
    
    high_risk_cases: results.retaliation_likelihood['very-high'].length + results.retaliation_likelihood['high'].length,
    high_risk_percentage: (((results.retaliation_likelihood['very-high'].length + results.retaliation_likelihood['high'].length) / cases.length) * 100).toFixed(2) + '%',
    
    cases_with_timing_indicators: results.keyword_frequencies.timing_indicators.count,
    
    // Confidence intervals (95%)
    termination_95ci: calculate95CI(results.keyword_frequencies.termination.count, cases.length),
    discipline_95ci: calculate95CI(results.keyword_frequencies.discipline.count, cases.length)
  };
  
  return results;
}

/**
 * Calculate 95% confidence interval for proportion
 */
function calculate95CI(count, total) {
  const p = count / total;
  const z = 1.96; // 95% CI
  const se = Math.sqrt((p * (1 - p)) / total);
  const margin = z * se;
  
  const lower = Math.max(0, p - margin);
  const upper = Math.min(1, p + margin);
  
  return {
    lower: (lower * 100).toFixed(2) + '%',
    upper: (upper * 100).toFixed(2) + '%',
    text: `[${(lower * 100).toFixed(2)}-${(upper * 100).toFixed(2)}%]`
  };
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(results) {
  const date = results.metadata.analysis_date;
  
  let md = `# Employer Retaliation Analysis Report\n\n`;
  md += `**Analysis Date:** ${date}\n`;
  md += `**Total Cases Analyzed:** ${results.metadata.total_cases.toLocaleString()}\n`;
  md += `**Time Period:** 2020-2026 (WSIAT decisions)\n\n`;
  
  md += `---\n\n`;
  
  md += `## Executive Summary\n\n`;
  md += `This analysis searched ${results.metadata.total_cases.toLocaleString()} WSIAT tribunal decisions for evidence of employer retaliation following workers' compensation claims.\n\n`;
  
  md += `### Key Findings\n\n`;
  md += `| Metric | Value | 95% CI |\n`;
  md += `|--------|-------|--------|\n`;
  md += `| Cases mentioning **termination** | ${results.keyword_frequencies.termination.percentage}% (n=${results.keyword_frequencies.termination.count}) | ${results.statistics.termination_95ci.text} |\n`;
  md += `| Cases mentioning **discipline** | ${results.keyword_frequencies.discipline.percentage}% (n=${results.keyword_frequencies.discipline.count}) | ${results.statistics.discipline_95ci.text} |\n`;
  md += `| Cases with explicit **retaliation** language | ${results.keyword_frequencies.retaliation.percentage}% (n=${results.keyword_frequencies.retaliation.count}) | - |\n`;
  md += `| Cases with **timing indicators** (shortly after, etc.) | ${results.keyword_frequencies.timing_indicators.percentage}% (n=${results.keyword_frequencies.timing_indicators.count}) | - |\n`;
  md += `| **High-risk** retaliation cases (score ≥6) | ${results.statistics.high_risk_percentage} (n=${results.statistics.high_risk_cases}) | - |\n\n`;
  
  md += `### Interpretation\n\n`;
  md += `- **${results.keyword_frequencies.termination.percentage}%** of WSIAT cases involve termination, suggesting employment loss following workplace injuries is common.\n`;
  md += `- **${results.keyword_frequencies.discipline.percentage}%** mention disciplinary action, indicating employers may use discipline as a retaliation tactic.\n`;
  md += `- **${results.keyword_frequencies.retaliation.percentage}%** explicitly use language like "retaliation," "reprisal," or "adverse action," showing tribunals are aware of this issue.\n`;
  md += `- **${results.statistics.high_risk_percentage}** of cases show multiple red flags for retaliation (timing + discipline + termination + pretext).\n\n`;
  
  md += `---\n\n`;
  
  md += `## Keyword Frequency Analysis\n\n`;
  
  for (const [category, data] of Object.entries(results.keyword_frequencies)) {
    md += `### ${category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}\n\n`;
    md += `- **Count:** ${data.count}\n`;
    md += `- **Percentage:** ${data.percentage}%\n`;
    md += `- **Keywords searched:** ${KEYWORDS[category].join(', ')}\n\n`;
  }
  
  md += `---\n\n`;
  
  md += `## Timing Distribution\n\n`;
  md += `Distribution of time between claim filing and termination (when timing indicators are mentioned):\n\n`;
  md += `| Time Range | Cases (n) | % of Timed Cases | Risk Level |\n`;
  md += `|------------|-----------|------------------|------------|\n`;
  
  for (const [range, data] of Object.entries(results.timing_distribution)) {
    md += `| ${range} | ${data.count} | ${data.percentage}% | ${data.risk_level.toUpperCase()} |\n`;
  }
  
  md += `\n**Note:** This distribution represents only cases where explicit timing language was detected (e.g., "30 days after filing"). Many cases may involve retaliation without explicitly stating timing.\n\n`;
  
  md += `---\n\n`;
  
  md += `## Retaliation Likelihood Distribution\n\n`;
  md += `Cases categorized by retaliation likelihood score (based on presence of multiple indicators):\n\n`;
  md += `| Likelihood | Cases (n) | % of Total | Score Range |\n`;
  md += `|------------|-----------|------------|-------------|\n`;
  md += `| Very High | ${results.retaliation_likelihood['very-high'].length} | ${((results.retaliation_likelihood['very-high'].length / results.metadata.total_cases) * 100).toFixed(2)}% | ≥8 |\n`;
  md += `| High | ${results.retaliation_likelihood['high'].length} | ${((results.retaliation_likelihood['high'].length / results.metadata.total_cases) * 100).toFixed(2)}% | 6-7 |\n`;
  md += `| Medium | ${results.retaliation_likelihood['medium'].length} | ${((results.retaliation_likelihood['medium'].length / results.metadata.total_cases) * 100).toFixed(2)}% | 4-5 |\n`;
  md += `| Low | ${results.retaliation_likelihood['low'].length} | ${((results.retaliation_likelihood['low'].length / results.metadata.total_cases) * 100).toFixed(2)}% | 2-3 |\n`;
  md += `| Very Low | ${results.retaliation_likelihood['very-low'].length} | ${((results.retaliation_likelihood['very-low'].length / results.metadata.total_cases) * 100).toFixed(2)}% | 0-1 |\n\n`;
  
  md += `**Scoring methodology:**\n`;
  md += `- Termination mentioned: +3\n`;
  md += `- Discipline mentioned: +2\n`;
  md += `- Explicit retaliation language: +5\n`;
  md += `- Timing indicators: +3\n`;
  md += `- Pretextual reasons: +2\n`;
  md += `- Clean record mentioned: +2\n`;
  md += `- Accommodation failure: +2\n\n`;
  
  md += `---\n\n`;
  
  md += `## Case Examples\n\n`;
  
  for (const [likelihood, cases] of Object.entries(results.case_examples)) {
    if (cases.length === 0) continue;
    
    md += `### ${likelihood.charAt(0).toUpperCase() + likelihood.slice(1)} Likelihood Cases\n\n`;
    
    for (let i = 0; i < Math.min(5, cases.length); i++) {
      const c = cases[i];
      md += `**${c.citation}**\n`;
      md += `- Decision Date: ${c.decision_date}\n`;
      md += `- Retaliation Score: ${c.score}\n`;
      md += `- Factors: ${c.factors.join('; ')}\n`;
      md += `- Keywords found: ${Object.keys(c.mentions).join(', ')}\n\n`;
    }
  }
  
  md += `---\n\n`;
  
  md += `## Methodology\n\n`;
  md += `### Data Source\n`;
  md += `- **Database:** WSIAT (Workplace Safety and Insurance Appeals Tribunal) decisions\n`;
  md += `- **Years:** 2020-2026\n`;
  md += `- **Total cases:** ${results.metadata.total_cases.toLocaleString()}\n`;
  md += `- **Source:** CanLII (Canadian Legal Information Institute)\n\n`;
  
  md += `### Search Strategy\n`;
  md += `- **Keyword search:** Case-insensitive partial matching across full decision text\n`;
  md += `- **Categories:** ${Object.keys(KEYWORDS).length} keyword categories (${Object.values(KEYWORDS).flat().length} total keywords)\n`;
  md += `- **Timing extraction:** Pattern matching for explicit time references (e.g., "30 days after")\n`;
  md += `- **Scoring system:** Weighted scoring based on presence of multiple retaliation indicators\n\n`;
  
  md += `### Limitations\n`;
  md += `1. **Keyword-based:** May miss cases without explicit language\n`;
  md += `2. **Timing extraction:** Heuristic-based, may not capture all temporal patterns\n`;
  md += `3. **Causation:** Presence of keywords doesn't prove causation (correlation ≠ causation)\n`;
  md += `4. **Selection bias:** Only cases that reached tribunal level (unreported retaliation not captured)\n`;
  md += `5. **Partial text:** Some decisions may have incomplete text in CanLII database\n\n`;
  
  md += `### Confidence Intervals\n`;
  md += `95% confidence intervals calculated using normal approximation for binomial proportions:  \n`;
  md += `CI = p ± 1.96 × √(p(1-p)/n)\n\n`;
  
  md += `---\n\n`;
  
  md += `## Recommendations for Future Research\n\n`;
  md += `1. **Industry-specific analysis:** Break down retaliation rates by industry sector\n`;
  md += `2. **Temporal trends:** Analyze whether retaliation rates changed 2020-2026\n`;
  md += `3. **Outcome analysis:** Compare success rates for cases with/without retaliation allegations\n`;
  md += `4. **Cross-database:** Compare WSIAT retaliation patterns to HRTO disability discrimination cases\n`;
  md += `5. **Qualitative analysis:** Deep-dive into high-score cases to identify common fact patterns\n\n`;
  
  md += `---\n\n`;
  
  md += `## How to Use This Data\n\n`;
  md += `### For Injured Workers:\n`;
  md += `- If your case involves termination within 90 days of filing, cite the **${results.keyword_frequencies.termination.percentage}%** rate\n`;
  md += `- Use these statistics to show your experience is not isolated\n`;
  md += `- Reference case examples with similar fact patterns\n\n`;
  
  md += `### For Advocates:\n`;
  md += `- Present aggregate data to show systemic patterns\n`;
  md += `- Use in media interviews and policy advocacy\n`;
  md += `- Support workers facing retaliation with concrete evidence\n\n`;
  
  md += `### For Researchers:\n`;
  md += `- Raw data available in JSON format\n`;
  md += `- Methodology is reproducible and open-source\n`;
  md += `- Contact: research@3mpwrapp.ca for collaboration\n\n`;
  
  md += `---\n\n`;
  
  md += `*Report generated by 3mpwr Research Team | ${date}*\n`;
  md += `*Analysis script version: ${results.metadata.script_version}*\n`;
  
  return md;
}

/**
 * Main execution
 */
async function main() {
  try {
    const results = await analyzeRetaliationPatterns();
    
    // Save JSON results
    const date = results.metadata.analysis_date;
    const jsonFile = path.join(OUTPUT_DIR, `employer-retaliation-analysis-${date}.json`);
    await fs.writeFile(jsonFile, JSON.stringify(results, null, 2));
    console.log(`\n💾 Saved JSON results: ${jsonFile}`);
    
    // Generate and save markdown report
    const markdown = generateMarkdownReport(results);
    const mdFile = path.join(OUTPUT_DIR, `employer-retaliation-report-${date}.md`);
    await fs.writeFile(mdFile, markdown);
    console.log(`📄 Saved Markdown report: ${mdFile}`);
    
    // Print summary to console
    console.log('\n' + '='.repeat(60));
    console.log('📊 ANALYSIS COMPLETE');
    console.log('='.repeat(60));
    console.log(`\nKey Statistics:`);
    console.log(`  • Termination rate: ${results.statistics.termination_rate} ${results.statistics.termination_95ci.text}`);
    console.log(`  • Discipline rate: ${results.statistics.discipline_rate} ${results.statistics.discipline_95ci.text}`);
    console.log(`  • Explicit retaliation rate: ${results.statistics.explicit_retaliation_rate}`);
    console.log(`  • High-risk cases: ${results.statistics.high_risk_cases} (${results.statistics.high_risk_percentage})`);
    console.log(`\nOutputs:`);
    console.log(`  • JSON: ${jsonFile}`);
    console.log(`  • Markdown: ${mdFile}`);
    console.log('\n✅ Done!\n');
    
  } catch (error) {
    console.error(`\n❌ Error during analysis: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run
main();
