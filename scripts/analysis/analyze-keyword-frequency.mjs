#!/usr/bin/env node

/**
 * analyze-keyword-frequency.mjs
 * 
 * Analyzes keyword frequency across 98,992 WSIAT decisions (2020-2026)
 * from CanLII's keywords field (summary terms provided by CanLII).
 * 
 * IMPORTANT LIMITATION:
 * This analysis uses only the "keywords" field from CanLII metadata,
 * which contains brief summary phrases (e.g., "pre-existing condition",
 * "worker", "low back pain"). This is NOT full decision text.
 * 
 * Many terms that appear in full decisions may not appear in keywords field.
 * Results represent MINIMUM frequencies - actual occurrence in full text
 * would be higher.
 * 
 * Output: JSON file with keyword frequencies, percentages, and co-occurrence
 */

import fs from 'fs/promises';
import path from 'path';

// Configuration
const DATA_DIR = './data/tribunal-decisions';
const OUTPUT_DIR = './data/analysis';
const OUTPUT_JSON = path.join(OUTPUT_DIR, 'keyword-frequency-analysis.json');

// Yearly data files to analyze
const DATA_FILES = [
  'onwsiat-2020-ultra-slow.json',
  'onwsiat-2021-ultra-slow.json',
  'onwsiat-2022-ultra-slow.json',
  'onwsiat-2023-ultra-slow.json',
  'onwsiat-2024-ultra-slow.json',
  'onwsiat-2025-ultra-slow.json',
  'onwsiat-2026-ultra-slow.json'
];

/**
 * Calculate 95% confidence interval for proportion
 * Using Wilson score interval (better for small proportions)
 */
function calculateCI(count, total, confidence = 0.95) {
  const z = 1.96; // 95% confidence
  const p = count / total;
  
  if (count === 0) {
    return { lower: 0, upper: (z * z) / (2 * total + z * z) };
  }
  
  const denominator = 1 + (z * z) / total;
  const center = (p + (z * z) / (2 * total)) / denominator;
  const margin = (z / denominator) * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total));
  
  return {
    lower: Math.max(0, center - margin),
    upper: Math.min(1, center + margin)
  };
}

/**
 * Extract all keywords/phrases from a case
 */
function extractKeywords(caseData) {
  const data = caseData.data || caseData;
  const keywordsField = data.keywords || '';
  const title = data.title || '';
  
  // CanLII keywords are typically separated by em-dashes or dashes
  // Clean up encoding issues (â€" is a mangled em-dash)
  const cleanedKeywords = keywordsField
    .replace(/â€"/g, '—')
    .replace(/â€/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split on em-dash, en-dash, or hyphen surrounded by spaces
  const phrases = cleanedKeywords
    .split(/\s*[—–-]\s*/)
    .map(p => p.trim().toLowerCase())
    .filter(p => p.length > 0);
  
  return {
    caseId: data.caseId || data.concatenatedId,
    citation: data.citation || '',
    title: title,
    phrases: phrases,
    fullKeywordText: keywordsField.toLowerCase()
  };
}

/**
 * Count keyword occurrences across all cases
 */
function countKeywords(allCases) {
  const keywordCounts = new Map();
  const casesContaining = new Map(); // Track which cases contain each keyword
  
  allCases.forEach(caseData => {
    const { caseId, phrases } = caseData;
    const seenInThisCase = new Set();
    
    // Count each unique phrase
    phrases.forEach(phrase => {
      if (phrase.length < 3) return; // Skip very short phrases
      
      keywordCounts.set(phrase, (keywordCounts.get(phrase) || 0) + 1);
      
      if (!seenInThisCase.has(phrase)) {
        if (!casesContaining.has(phrase)) {
          casesContaining.set(phrase, new Set());
        }
        casesContaining.get(phrase).add(caseId);
        seenInThisCase.add(phrase);
      }
    });
  });
  
  return { keywordCounts, casesContaining };
}

/**
 * Search for specific term in full keyword text
 * (for terms that might not be discrete phrases)
 */
function searchTerm(allCases, term) {
  const lowerTerm = term.toLowerCase();
  const matches = allCases.filter(c => 
    c.fullKeywordText.includes(lowerTerm)
  );
  return matches.length;
}

/**
 * Calculate co-occurrence statistics
 */
function calculateCoOccurrence(allCases, term1, term2) {
  let both = 0;
  let term1Only = 0;
  let term2Only = 0;
  let neither = 0;
  
  allCases.forEach(caseData => {
    const text = caseData.fullKeywordText;
    const has1 = text.includes(term1.toLowerCase());
    const has2 = text.includes(term2.toLowerCase());
    
    if (has1 && has2) both++;
    else if (has1) term1Only++;
    else if (has2) term2Only++;
    else neither++;
  });
  
  const total = allCases.length;
  const p1 = (term1Only + both) / total;
  const p2 = (term2Only + both) / total;
  const pBoth = both / total;
  const expectedBoth = p1 * p2;
  
  // Lift: how much more likely are they to co-occur than random
  const lift = expectedBoth > 0 ? pBoth / expectedBoth : 0;
  
  // Chi-square test
  const expected = {
    both: total * p1 * p2,
    term1Only: total * p1 * (1 - p2),
    term2Only: total * (1 - p1) * p2,
    neither: total * (1 - p1) * (1 - p2)
  };
  
  const chiSquare = 
    Math.pow(both - expected.both, 2) / (expected.both + 0.001) +
    Math.pow(term1Only - expected.term1Only, 2) / (expected.term1Only + 0.001) +
    Math.pow(term2Only - expected.term2Only, 2) / (expected.term2Only + 0.001) +
    Math.pow(neither - expected.neither, 2) / (expected.neither + 0.001);
  
  return {
    count: both,
    percentage: (pBoth * 100).toFixed(2),
    lift: lift.toFixed(2),
    chi_square: chiSquare.toFixed(2),
    term1_count: term1Only + both,
    term2_count: term2Only + both
  };
}

/**
 * Main analysis function
 */
async function analyze() {
  console.log('🔍 Starting keyword frequency analysis...\n');
  
  // Load all data files
  const allCases = [];
  
  for (const filename of DATA_FILES) {
    const filepath = path.join(DATA_DIR, filename);
    console.log(`Loading ${filename}...`);
    
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      const data = JSON.parse(content);
      const cases = Array.isArray(data) ? data : [data];
      
      cases.forEach(c => {
        allCases.push(extractKeywords(c));
      });
      
      console.log(`  ✓ Loaded ${cases.length} cases`);
    } catch (error) {
      console.error(`  ✗ Error loading ${filename}:`, error.message);
    }
  }
  
  const totalCases = allCases.length;
  console.log(`\n✓ Total cases loaded: ${totalCases}\n`);
  
  // Count keyword occurrences
  console.log('Counting keyword frequencies...');
  const { keywordCounts, casesContaining } = countKeywords(allCases);
  
  // Convert to array and sort by frequency
  const sortedKeywords = Array.from(keywordCounts.entries())
    .map(([phrase, count]) => {
      const percentage = (count / totalCases) * 100;
      const ci = calculateCI(count, totalCases);
      
      return {
        phrase,
        count,
        percentage: percentage.toFixed(2),
        ci_lower: (ci.lower * 100).toFixed(2),
        ci_upper: (ci.upper * 100).toFixed(2),
        cases_containing: casesContaining.get(phrase).size
      };
    })
    .sort((a, b) => b.count - a.count);
  
  console.log(`✓ Found ${sortedKeywords.length} unique keyword phrases\n`);
  
  // Top 50 keywords
  const top50 = sortedKeywords.slice(0, 50);
  
  console.log('Top 10 most frequent keywords:');
  top50.slice(0, 10).forEach((k, i) => {
    console.log(`  ${i + 1}. "${k.phrase}" - ${k.count} cases (${k.percentage}%)`);
  });
  
  // Search for specific terms of interest
  console.log('\n\nSearching for specific terms...');
  const specificTerms = {
    'worker': searchTerm(allCases, 'worker'),
    'pre-existing': searchTerm(allCases, 'pre-existing'),
    'pain': searchTerm(allCases, 'pain'),
    'employer': searchTerm(allCases, 'employer'),
    'injury': searchTerm(allCases, 'injury'),
    'work': searchTerm(allCases, 'work'),
    'benefits': searchTerm(allCases, 'benefits'),
    'accident': searchTerm(allCases, 'accident'),
    'impairment': searchTerm(allCases, 'impairment'),
    'psychotraumatic': searchTerm(allCases, 'psychotraumatic'),
    'mental stress': searchTerm(allCases, 'mental stress'),
    'shoulder': searchTerm(allCases, 'shoulder'),
    'knee': searchTerm(allCases, 'knee'),
    'back': searchTerm(allCases, 'back'),
    'neck': searchTerm(allCases, 'neck'),
    'termination': searchTerm(allCases, 'termination'),
    'terminated': searchTerm(allCases, 'terminated'),
    'dismissal': searchTerm(allCases, 'dismissal'),
    'fired': searchTerm(allCases, 'fired'),
    'coercion': searchTerm(allCases, 'coercion'),
    'threat': searchTerm(allCases, 'threat'),
    'decision of employer': searchTerm(allCases, 'decision of employer'),
    'labour relations': searchTerm(allCases, 'labour relations'),
    'work-related': searchTerm(allCases, 'work-related'),
    'entitlement': searchTerm(allCases, 'entitlement'),
    'reconsideration': searchTerm(allCases, 'reconsideration')
  };
  
  Object.entries(specificTerms)
    .sort((a, b) => b[1] - a[1])
    .forEach(([term, count]) => {
      const pct = ((count / totalCases) * 100).toFixed(2);
      console.log(`  "${term}": ${count} cases (${pct}%)`);
    });
  
  // Calculate co-occurrence for important pairs
  console.log('\n\nCalculating co-occurrence patterns...');
  const coOccurrences = {
    'pre-existing + greater severity': calculateCoOccurrence(allCases, 'pre-existing', 'greater severity'),
    'pre-existing + knee': calculateCoOccurrence(allCases, 'pre-existing', 'knee'),
    'pre-existing + back': calculateCoOccurrence(allCases, 'pre-existing', 'back'),
    'mental stress + labour relations': calculateCoOccurrence(allCases, 'mental stress', 'labour relations'),
    'termination + mental stress': calculateCoOccurrence(allCases, 'termination', 'mental stress'),
    'worker + pain': calculateCoOccurrence(allCases, 'worker', 'pain')
  };
  
  Object.entries(coOccurrences).forEach(([pair, stats]) => {
    console.log(`  ${pair}: ${stats.count} cases (lift: ${stats.lift}x)`);
  });
  
  // Build output JSON
  const output = {
    metadata: {
      generated_at: new Date().toISOString(),
      total_cases: totalCases,
      analysis_period: '2020-2026',
      jurisdiction: 'Ontario (WSIAT)',
      data_source: 'CanLII keywords field only',
      limitation: 'Keywords field contains brief summary phrases, not full decision text. Actual frequencies in full text would be higher.'
    },
    
    top_50_keywords: top50,
    
    specific_terms: Object.entries(specificTerms)
      .map(([term, count]) => {
        const percentage = (count / totalCases) * 100;
        const ci = calculateCI(count, totalCases);
        return {
          term,
          count,
          percentage: percentage.toFixed(2),
          ci_lower: (ci.lower * 100).toFixed(2),
          ci_upper: (ci.upper * 100).toFixed(2)
        };
      })
      .sort((a, b) => b.count - a.count),
    
    co_occurrence: coOccurrences,
    
    all_keywords: sortedKeywords.slice(0, 200) // Top 200 for reference
  };
  
  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  // Write output
  await fs.writeFile(OUTPUT_JSON, JSON.stringify(output, null, 2));
  
  console.log(`\n✅ Analysis complete!`);
  console.log(`📄 Output saved to: ${OUTPUT_JSON}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total cases: ${totalCases}`);
  console.log(`   Unique phrases: ${sortedKeywords.length}`);
  console.log(`   Top keyword: "${top50[0].phrase}" (${top50[0].percentage}%)`);
}

// Run analysis
analyze().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
