#!/usr/bin/env node

/**
 * Local Ontario Data Extraction - NO API CALLS
 * 
 * PURPOSE: Extract ALL possible information from existing Ontario JSON files
 * METHOD: Parse snippet JSON, keywords, existing fields - NO external requests
 * 
 * This processes 4,435 cases locally in seconds, not hours!
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// Input files
const INPUT_FILES = [
  'data/tribunal-decisions/onwsiat-historical-20260404.json',
  'data/tribunal-decisions/onwsiat-decisions-20260404.json',
  'data/tribunal-decisions/onca-decisions-20260404.json',
  'data/tribunal-decisions/onhrt-decisions-20260404.json'
];

// Output file
const OUTPUT_FILE = `data/tribunal-decisions/ontario-local-enhanced-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.json`;

// ============================================================
// Enhanced Extraction from Existing Data
// ============================================================

/**
 * Extract outcome from keywords and snippet
 * Many cases have outcome indicators in metadata
 */
function extractOutcomeFromMetadata(keywords, snippet, existingOutcome) {
  let outcome = existingOutcome || 'Unknown';
  let confidence = 0;
  
  // Check existing outcome first
  if (existingOutcome && existingOutcome !== 'Unknown') {
    if (existingOutcome === 'Allowed' || existingOutcome === 'Dismissed') {
      outcome = existingOutcome;
      confidence = 85;
    }
  }
  
  // Check keywords for outcome indicators
  const text = `${keywords} ${snippet}`.toLowerCase();
  
  // Primary patterns (high confidence)
  if (/\b(?:appeal|application)\s+(?:is\s+)?(?:allowed|granted)\b/i.test(text)) {
    outcome = 'Allowed';
    confidence = Math.max(confidence, 80);
  } else if (/\b(?:appeal|application)\s+(?:is\s+)?dismissed\b/i.test(text)) {
    outcome = 'Dismissed';
    confidence = Math.max(confidence, 80);
  }
  
  // Secondary patterns (medium confidence)
  if (confidence === 0) {
    if (/\bentitlement\s+(?:is\s+)?granted\b/i.test(text)) {
      outcome = 'Allowed';
      confidence = 70;
    } else if (/\bentitlement\s+(?:is\s+)?denied\b/i.test(text)) {
      outcome = 'Dismissed';
      confidence = 70;
    }
  }
  
  // Additional indicators
  if (/\bbenefits?\s+(?:are\s+)?granted\b/i.test(text)) {
    outcome = 'Allowed';
    confidence = Math.max(confidence, 65);
  } else if (/\bbenefits?\s+(?:are\s+)?denied\b/i.test(text)) {
    outcome = 'Dismissed';
    confidence = Math.max(confidence, 65);
  }
  
  return { outcome, confidence };
}

/**
 * Extract conditions from keywords and snippet
 */
function extractConditionEnhanced(keywords, snippet, existingCondition) {
  const text = `${keywords} ${snippet}`.toLowerCase();
  
  const patterns = [
    { name: 'chronic pain', pattern: /\bchronic pain\b/i },
    { name: 'fibromyalgia', pattern: /\bfibromyalgia\b/i },
    { name: 'PTSD', pattern: /\b(?:ptsd|post-traumatic stress)\b/i },
    { name: 'back injury', pattern: /\b(?:back injury|spinal injury|herniated disc|disc herniation|bulging disc)\b/i },
    { name: 'depression', pattern: /\b(?:depression|depressive disorder)\b/i },
    { name: 'anxiety', pattern: /\b(?:anxiety|anxiety disorder)\b/i },
    { name: 'arthritis', pattern: /\barthritis\b/i },
    { name: 'chronic fatigue', pattern: /\bchronic fatigue\b/i },
    { name: 'MS', pattern: /\b(?:multiple sclerosis|MS)\b/i },
    { name: 'carpal tunnel', pattern: /\bcarpal tunnel\b/i },
    { name: 'tendinitis', pattern: /\btendinitis\b/i },
    { name: 'knee injury', pattern: /\bknee (?:injury|pain)\b/i },
    { name: 'shoulder injury', pattern: /\bshoulder (?:injury|pain)\b/i },
    { name: 'wrist injury', pattern: /\bwrist (?:injury|pain)\b/i },
    { name: 'mental health', pattern: /\bmental health\b/i },
    { name: 'impairment', pattern: /\bpermanent impairment\b/i },
    { name: 'occupational disease', pattern: /\boccupational disease\b/i },
    { name: 'hearing loss', pattern: /\b(?:hearing loss|noise-induced)\b/i },
    { name: 'psychological injury', pattern: /\bpsychological (?:injury|trauma)\b/i }
  ];
  
  const found = [];
  for (const { name, pattern } of patterns) {
    if (pattern.test(text)) {
      found.push(name);
    }
  }
  
  // Include existing condition if not already found
  if (existingCondition && existingCondition !== 'Unknown' && existingCondition !== 'injury') {
    const existing = existingCondition.split(',').map(c => c.trim());
    for (const c of existing) {
      if (!found.includes(c)) {
        found.push(c);
      }
    }
  }
  
  return found.length > 0 ? found.join(', ') : 'Unknown';
}

/**
 * Extract medical evidence indicators from keywords
 */
function extractMedicalEvidenceFromKeywords(keywords, snippet, existingEvidence) {
  const text = `${keywords} ${snippet}`.toLowerCase();
  
  const evidence = {
    reports: [],
    tests: [],
    specialists: [],
    has_ime: false
  };
  
  // Medical reports
  if (/\bime\b/i.test(text)) {
    evidence.reports.push('IME');
    evidence.has_ime = true;
  }
  if (/\bfce\b/i.test(text)) evidence.reports.push('FCE');
  if (/\bspecialist report\b/i.test(text)) evidence.reports.push('specialist report');
  if (/\bmedical report\b/i.test(text)) evidence.reports.push('medical report');
  if (/\bpsychiatric (?:assessment|report)\b/i.test(text)) evidence.reports.push('psychiatric assessment');
  
  // Tests
  if (/\bmri\b/i.test(text)) evidence.tests.push('MRI');
  if (/\bct scan\b/i.test(text)) evidence.tests.push('CT scan');
  if (/\bx-ray\b/i.test(text)) evidence.tests.push('X-ray');
  if (/\bemg\b/i.test(text)) evidence.tests.push('EMG');
  
  // Specialists
  if (/\borthopedic\b/i.test(text)) evidence.specialists.push('orthopedic surgeon');
  if (/\bpsychiatrist\b/i.test(text)) evidence.specialists.push('psychiatrist');
  if (/\bpsychologist\b/i.test(text)) evidence.specialists.push('psychologist');
  if (/\bneurologist\b/i.test(text)) evidence.specialists.push('neurologist');
  
  // Merge with existing evidence
  if (existingEvidence && Array.isArray(existingEvidence)) {
    for (const item of existingEvidence) {
      if (item && !evidence.reports.includes(item)) {
        evidence.reports.push(item);
      }
    }
  }
  
  return evidence;
}

/**
 * Extract key legal factors from keywords
 */
function extractKeyFactors(keywords, snippet) {
  const text = `${keywords} ${snippet}`.toLowerCase();
  const factors = [];
  
  if (/\bpre-existing condition\b/i.test(text)) {
    factors.push({ factor: 'Pre-existing condition', type: 'challenge' });
  }
  if (/\bwork-related\b/i.test(text)) {
    factors.push({ factor: 'Work-related determination', type: 'key_issue' });
  }
  if (/\bcredibility\b/i.test(text)) {
    factors.push({ factor: 'Credibility assessment', type: 'key_issue' });
  }
  if (/\bstatutory time limit\b/i.test(text)) {
    factors.push({ factor: 'Time limit issue', type: 'procedural' });
  }
  if (/\brecurrence\b/i.test(text)) {
    factors.push({ factor: 'Recurrence claimed', type: 'key_issue' });
  }
  if (/\bloss of earnings\b/i.test(text)) {
    factors.push({ factor: 'Loss of earnings', type: 'benefit' });
  }
  if (/\bpermanent impairment\b/i.test(text)) {
    factors.push({ factor: 'Permanent impairment', type: 'benefit' });
  }
  
  return factors;
}

/**
 * Parse snippet JSON for additional metadata
 */
function parseSnippet(snippetStr) {
  try {
    // The snippet contains JSON - parse it
    const jsonMatch = snippetStr.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
  } catch (e) {
    // Ignore parse errors
  }
  return null;
}

/**
 * Extract geographic info from keywords and metadata
 */
function extractGeographicFromMetadata(keywords, snippet, database) {
  const text = `${keywords} ${snippet}`.toLowerCase();
  
  const info = {
    province_territory: null,
    cities: [],
    regions: []
  };
  
  // Province from database
  const provinceMap = {
    'onwsiat': 'ON', 'onca': 'ON', 'onhrt': 'ON'
  };
  info.province_territory = provinceMap[database] || 'ON';
  
  // Cities
  const cityPatterns = [
    'Thunder Bay', 'Toronto', 'Ottawa', 'Hamilton', 'London', 'Windsor',
    'Sudbury', 'Sault Ste. Marie', 'Kingston', 'Barrie', 'Peterborough'
  ];
  for (const city of cityPatterns) {
    if (new RegExp(`\\b${city}\\b`, 'i').test(text)) {
      info.cities.push(city);
    }
  }
  
  return info;
}

/**
 * Calculate quality score based on available data
 */
function calculateQualityScore(enhanced) {
  let score = 0;
  
  // Outcome (30 points)
  if (enhanced.outcome !== 'Unknown') {
    score += enhanced.outcome_confidence * 0.3;
  }
  
  // Condition (15 points)
  if (enhanced.condition && enhanced.condition !== 'Unknown') {
    score += 15;
  }
  
  // Medical evidence (20 points)
  const med = enhanced.medical_evidence;
  if (med) {
    score += Math.min(20, (med.reports.length * 5) + (med.tests.length * 3) + (med.specialists.length * 3));
  }
  
  // Key factors (15 points)
  if (enhanced.key_factors && enhanced.key_factors.length > 0) {
    score += Math.min(15, enhanced.key_factors.length * 3);
  }
  
  // Decision date (10 points)
  if (enhanced.decision_date && enhanced.decision_date !== 'Unknown') {
    score += 10;
  }
  
  // Citation/URL (10 points)
  if (enhanced.url) {
    score += 10;
  }
  
  return Math.round(Math.min(100, score));
}

/**
 * Process a single case locally
 */
function processCaseLocal(caseData) {
  // Extract database from case_id
  const database = caseData.case_id.match(/^\d{4}(\w+)\d+$/)?.[1] || 'onwsiat';
  
  // Get keywords and snippet
  const keywords = '';
  const snippet = caseData.snippet || '';
  
  // Parse snippet for metadata
  const snippetData = parseSnippet(snippet);
  const snippetKeywords = snippetData?.keywords || '';
  
  // Extract enhanced data
  const { outcome, confidence } = extractOutcomeFromMetadata(snippetKeywords, snippet, caseData.outcome);
  const condition = extractConditionEnhanced(snippetKeywords, snippet, caseData.condition);
  const medical_evidence = extractMedicalEvidenceFromKeywords(snippetKeywords, snippet, caseData.evidence_cited);
  const key_factors = extractKeyFactors(snippetKeywords, snippet);
  const geographic_info = extractGeographicFromMetadata(snippetKeywords, snippet, database);
  
  // Build enhanced case
  const enhanced = {
    ...caseData, // Preserve all original fields
    outcome,
    outcome_confidence: confidence,
    condition,
    medical_evidence,
    key_factors,
    geographic_info,
    decision_date: snippetData?.decisionDate || caseData.date || 'Unknown',
    url: snippetData?.url || caseData.url || '',
    citation: snippetData?.citation || '',
    docket_number: snippetData?.docketNumber || '',
    database_id: database,
    extraction_version: 'v5.0-local-enhanced',
    extraction_method: 'metadata-keywords-analysis',
    quality_score: 0 // Calculated below
  };
  
  enhanced.quality_score = calculateQualityScore(enhanced);
  
  return enhanced;
}

// ============================================================
// Main Processing
// ============================================================

async function processOntarioLocal() {
  console.log('\n============================================================');
  console.log('🔍 Local Ontario Data Extraction - NO API CALLS');
  console.log('============================================================\n');
  
  const allCases = [];
  
  // Load all files
  console.log('📂 Loading existing Ontario cases...\n');
  
  for (const filePath of INPUT_FILES) {
    const fullPath = path.join(ROOT, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`  ⚠️  Not found: ${filePath}`);
      continue;
    }
    
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const cases = Array.isArray(data) ? data : [data];
    
    console.log(`  ✅ Loaded: ${cases.length} cases from ${path.basename(filePath)}`);
    allCases.push(...cases);
  }
  
  console.log(`\n✅ Total cases to process: ${allCases.length}\n`);
  console.log('⚙️  Processing locally (no API calls)...\n');
  
  // Process all cases
  const enhanced = [];
  let processed = 0;
  
  for (const caseData of allCases) {
    const enhancedCase = processCaseLocal(caseData);
    enhanced.push(enhancedCase);
    processed++;
    
    if (processed % 500 === 0) {
      console.log(`  Progress: ${processed}/${allCases.length} (${Math.round(processed/allCases.length*100)}%)`);
    }
  }
  
  console.log(`  Progress: ${processed}/${allCases.length} (100%)\n`);
  
  // Save results
  const outputPath = path.join(ROOT, OUTPUT_FILE);
  fs.writeFileSync(outputPath, JSON.stringify(enhanced, null, 2));
  
  console.log('============================================================');
  console.log('✅ Local Extraction Complete!');
  console.log('============================================================\n');
  
  // Generate statistics
  const stats = {
    total_cases: enhanced.length,
    with_outcomes: enhanced.filter(c => c.outcome !== 'Unknown').length,
    high_quality: enhanced.filter(c => c.quality_score >= 70).length,
    excellent_quality: enhanced.filter(c => c.quality_score >= 80).length,
    avg_quality: Math.round(enhanced.reduce((sum, c) => sum + c.quality_score, 0) / enhanced.length),
    by_outcome: {
      allowed: enhanced.filter(c => c.outcome === 'Allowed').length,
      dismissed: enhanced.filter(c => c.outcome === 'Dismissed').length,
      unknown: enhanced.filter(c => c.outcome === 'Unknown').length
    },
    with_medical_evidence: enhanced.filter(c => c.medical_evidence && 
      (c.medical_evidence.reports.length > 0 || c.medical_evidence.tests.length > 0)).length,
    with_ime: enhanced.filter(c => c.medical_evidence?.has_ime).length,
    ready_for_templates: enhanced.filter(c => c.outcome === 'Allowed' && c.quality_score >= 60).length,
    ready_for_evidence_analysis: enhanced.filter(c => c.medical_evidence && c.medical_evidence.reports.length > 0).length,
    timestamp: new Date().toISOString()
  };
  
  console.log(`📊 Statistics:`);
  console.log(`  Total cases: ${stats.total_cases}`);
  console.log(`  With outcomes: ${stats.with_outcomes} (${Math.round(stats.with_outcomes/stats.total_cases*100)}%)`);
  console.log(`    - Allowed: ${stats.by_outcome.allowed}`);
  console.log(`    - Dismissed: ${stats.by_outcome.dismissed}`);
  console.log(`    - Unknown: ${stats.by_outcome.unknown}`);
  console.log(`  High quality (≥70): ${stats.high_quality}`);
  console.log(`  Excellent quality (≥80): ${stats.excellent_quality}`);
  console.log(`  Average quality: ${stats.avg_quality}/100`);
  console.log(`  With medical evidence: ${stats.with_medical_evidence}`);
  console.log(`  With IME reports: ${stats.with_ime}`);
  console.log(`  Ready for templates: ${stats.ready_for_templates}`);
  console.log(`  Ready for evidence analysis: ${stats.ready_for_evidence_analysis}\n`);
  
  console.log(`📁 Output file: ${OUTPUT_FILE}\n`);
  
  // Save summary
  const summaryPath = `docs/local-extraction-summary-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(path.join(ROOT, summaryPath), JSON.stringify(stats, null, 2));
  console.log(`📋 Summary: ${summaryPath}\n`);
  
  return stats;
}

// Run
processOntarioLocal().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
