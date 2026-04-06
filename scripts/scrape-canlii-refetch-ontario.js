#!/usr/bin/env node

/**
 * CanLII Ontario Refetch Script - v5.0 Enhanced Extraction
 * 
 * PURPOSE: Refetch existing Ontario cases with full HTML extraction
 * WHY: Original v3.0 scraper only saved API metadata, not decision text
 * STRATEGY: Skip expensive discovery phase, use existing case IDs
 * 
 * INPUT: Existing onwsiat/onca/onhrt JSON files (4,632 cases)
 * OUTPUT: Enhanced JSON with outcomes, reasoning, case law, etc.
 * 
 * QUOTA OPTIMIZATION:
 * - Discovery phase: SKIPPED (saves ~200 API calls)
 * - Only fetches full HTML for cases we already have
 * - Maximizes data collection per API call
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// ============================================================
// Configuration
// ============================================================

const API_KEY = process.env.CANLII_API_KEY;
const API_BASE = 'https://api.canlii.org/v1';
const LANG = 'en';

// Safety configuration (per v5.0 spec)
const MIN_DELAY = 800;  // 0.8 seconds
const MAX_DELAY = 1500; // 1.5 seconds

// Batch configuration
const BATCH_SIZE = 750;
const BATCH_PAUSE_MIN = 5 * 60 * 1000;  // 5 minutes
const BATCH_PAUSE_MAX = 10 * 60 * 1000; // 10 minutes

// Progress tracking
const PROGRESS_FILE = path.join(ROOT, 'data', '.scraper-progress.json');
const CACHE_DIR = path.join(ROOT, 'data', '.scraper-cache');
const ERROR_LOG_FILE = path.join(ROOT, 'data', '.scraper-errors.jsonl');

// Input files (existing Ontario data)
const INPUT_FILES = [
  'data/tribunal-decisions/onwsiat-historical-20260404.json',
  'data/tribunal-decisions/onwsiat-decisions-20260404.json',
  'data/tribunal-decisions/onca-decisions-20260404.json',
  'data/tribunal-decisions/onhrt-decisions-20260404.json'
];

// Output file
const OUTPUT_FILE = `data/tribunal-decisions/ontario-enhanced-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.json`;

// ============================================================
// Extraction Functions (v5.0 Enhanced)
// ============================================================

/**
 * Extract condition from decision text
 * Detects: chronic pain, fibromyalgia, PTSD, back injury, depression, anxiety, etc.
 */
function extractCondition(text) {
  const patterns = [
    { name: 'chronic pain', pattern: /\bchronic pain\b/gi },
    { name: 'fibromyalgia', pattern: /\bfibromyalgia\b/gi },
    { name: 'PTSD', pattern: /\b(?:ptsd|post-traumatic stress)\b/gi },
    { name: 'back injury', pattern: /\b(?:back injury|spinal injury|herniated disc)\b/gi },
    { name: 'depression', pattern: /\b(?:depression|depressive disorder)\b/gi },
    { name: 'anxiety', pattern: /\b(?:anxiety|anxiety disorder)\b/gi },
    { name: 'arthritis', pattern: /\barthritis\b/gi },
    { name: 'chronic fatigue', pattern: /\bchronic fatigue\b/gi },
    { name: 'MS', pattern: /\b(?:multiple sclerosis|MS)\b/gi },
    { name: 'carpal tunnel', pattern: /\bcarpal tunnel\b/gi },
    { name: 'tendinitis', pattern: /\btendinitis\b/gi },
    { name: 'knee', pattern: /\bknee (?:injury|pain)\b/gi },
    { name: 'shoulder', pattern: /\bshoulder (?:injury|pain)\b/gi },
    { name: 'wrist', pattern: /\bwrist (?:injury|pain)\b/gi },
    { name: 'mental health', pattern: /\bmental health\b/gi },
    { name: 'impairment', pattern: /\bpermanent impairment\b/gi },
    { name: 'disc', pattern: /\b(?:disc herniation|bulging disc|ruptured disc)\b/gi }
  ];

  const found = [];
  for (const { name, pattern } of patterns) {
    if (pattern.test(text)) {
      found.push(name);
    }
  }

  return found.length > 0 ? found.join(', ') : 'Unknown';
}

/**
 * Extract outcome with confidence scoring
 * Primary: "appeal is allowed/dismissed" (90% confidence)
 * Secondary: "entitlement granted/denied" (80% confidence)
 * Tertiary: "benefits granted/denied" (75% confidence)
 */
function extractOutcomeWithConfidence(text) {
  let outcome = 'Unknown';
  let confidence = 0;

  // Primary patterns (90% confidence)
  if (/\bappeal\s+is\s+(?:hereby\s+)?allowed\b/i.test(text)) {
    outcome = 'Allowed';
    confidence = 90;
  } else if (/\bappeal\s+is\s+(?:hereby\s+)?dismissed\b/i.test(text)) {
    outcome = 'Dismissed';
    confidence = 90;
  }

  // Secondary patterns (80% confidence) - only if no primary match
  if (confidence === 0) {
    if (/\bentitlement\s+(?:is\s+)?granted\b/i.test(text)) {
      outcome = 'Allowed';
      confidence = 80;
    } else if (/\bentitlement\s+(?:is\s+)?denied\b/i.test(text)) {
      outcome = 'Dismissed';
      confidence = 80;
    }
  }

  // Tertiary patterns (75% confidence)
  if (confidence === 0) {
    if (/\bbenefits?\s+(?:are\s+)?granted\b/i.test(text)) {
      outcome = 'Allowed';
      confidence = 75;
    } else if (/\bbenefits?\s+(?:are\s+)?denied\b/i.test(text)) {
      outcome = 'Dismissed';
      confidence = 75;
    }
  }

  // Boost confidence if multiple indicators present
  if (confidence > 0) {
    const indicators = [
      /\b(?:find|conclude|determine)s?\s+that\b/i,
      /\bfor\s+the\s+(?:foregoing|above)\s+reasons\b/i,
      /\baccordingly\b/i
    ];
    const boosts = indicators.filter(p => p.test(text)).length;
    confidence = Math.min(95, confidence + (boosts * 2));
  }

  return { outcome, confidence };
}

/**
 * Extract judge reasoning sections
 * Captures key reasoning paragraphs from decision
 */
function extractJudgeReasoning(text) {
  const patterns = [
    /(?:REASONS?|ANALYSIS|DISCUSSION):?\s+([\s\S]{500,3000}?(?:\n\n|\n(?=[A-Z]{3,})))/i,
    /(?:The panel|The court|The tribunal)\s+(?:find|conclude)s?\s+that\s+([\s\S]{200,1000}?\.)/gi,
    /(?:After\s+reviewing|Having\s+considered)\s+(?:the\s+)?(?:evidence|submissions)\s*,?\s+([\s\S]{200,1000}?\.)/gi
  ];

  const sections = [];
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 100) {
        sections.push(match[1].trim().substring(0, 500) + '...');
        if (sections.length >= 3) break;
      }
    }
 if (sections.length >= 3) break;
  }
  
  return sections;
}

/**
 * Extract cited case law
 * Finds precedent citations in decision
 */
function extractCitedCaseLaw(text) {
  const pattern = /\b(\d{4}\s+(?:ONWSIAT|ONCA|CanLII|SCC|FC|FCA)\s+\d+)\b/gi;
  const matches = Array.from(text.matchAll(pattern));
  const unique = [...new Set(matches.map(m => m[1]))];
  return unique.slice(0, 10); // Top 10 citations
}

/**
 * Extract winning arguments
 * Identifies successful legal/factual arguments
 */
function extractWinningArguments(text, outcome) {
  if (outcome === 'Unknown') return [];

  const patterns = [
    /(?:The\s+evidence\s+demonstrates?|The\s+evidence\s+shows?)\s+([\s\S]{100,500}?\.)/gi,
    /(?:The\s+worker\s+has\s+established|The\s+appellant\s+has\s+shown)\s+([\s\S]{100,500}?\.)/gi,
    /(?:I\s+am\s+satisfied\s+that|I\s+find\s+that)\s+([\s\S]{100,500}?\.)/gi
  ];

  const winningArgs = [];
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 50) {
        winningArgs.push(match[1].trim());
        if (winningArgs.length >= 5) break;
      }
    }
    if (winningArgs.length >= 5) break;
  }

  return winningArgs;
}

/**
 * Extract medical evidence details
 * Reports, tests, specialists mentioned in decision
 */
function extractMedicalEvidence(text) {
  const evidence = {
    reports: [],
    tests: [],
    specialists: []
  };

  // Medical reports
  const reportPatterns = /\b(ime|FCE|specialist\s+report|medical\s+report|assessment\s+report|psychiatric\s+assessment)\b/gi;
  const reportMatches = Array.from(text.matchAll(reportPatterns));
  evidence.reports = [...new Set(reportMatches.map(m => m[1].toLowerCase()))];

  // Diagnostic tests
  const testPatterns = /\b(MRI|CT\s+scan|x-ray|ultrasound|EMG|nerve\s+conduction)\b/gi;
  const testMatches = Array.from(text.matchAll(testPatterns));
  evidence.tests = [...new Set(testMatches.map(m => m[1].toUpperCase()))];

  // Medical specialists
  const specialistPatterns = /\b(orthopedic\s+surgeon|psychiatrist|psychologist|neurologist|physiatrist|pain\s+specialist)\b/gi;
  const specialistMatches = Array.from(text.matchAll(specialistPatterns));
  evidence.specialists = [...new Set(specialistMatches.map(m => m[1].toLowerCase()))];

  return evidence;
}

/**
 * Extract geographic information
 * Province, cities, regions, postal codes
 */
function extractGeographicInfo(text, database) {
  const info = {
    province_territory: null,
    cities: [],
    regions: [],
    postal_codes: []
  };

  // Province/territory from database
  const provinceMap = {
    'onwsiat': 'ON', 'onca': 'ON', 'onhrt': 'ON',
    'bchrt': 'BC', 'bcwcat': 'BC', 'bcca': 'BC',
    'abqb': 'AB', 'abca': 'AB',
    'skca': 'SK', 'mbca': 'MB', 'qctat': 'QC', 'qcca': 'QC',
    'nbca': 'NB', 'nsca': 'NS', 'peca': 'PE', 'nlca': 'NL',
    'ykca': 'YT', 'nwtca': 'NT', 'nuca': 'NU',
    'chrt': 'Federal', 'fct': 'Federal', 'fca': 'Federal'
  };
  info.province_territory = provinceMap[database] || 'Unknown';

  // Cities (20+ major cities)
  const cityPatterns = [
    'Thunder Bay', 'Toronto', 'Ottawa', 'Hamilton', 'London', 'Windsor',
    'Vancouver', 'Victoria', 'Surrey', 'Burnaby',
    'Calgary', 'Edmonton', 'Red Deer',
    'Saskatoon', 'Regina',
    'Winnipeg',
    'Montreal', 'Quebec City',
    'Halifax', 'Moncton', 'Fredericton',
    'Charlottetown', "St. John's"
  ];
  for (const city of cityPatterns) {
    if (new RegExp(`\\b${city}\\b`, 'i').test(text)) {
      info.cities.push(city);
    }
  }

  // Regions
  const regionPatterns = ['Northern Ontario', 'Eastern Ontario', 'Southwestern Ontario', 
                          'GTA', 'Lower Mainland', 'Vancouver Island'];
  for (const region of regionPatterns) {
    if (new RegExp(`\\b${region}\\b`, 'i').test(text)) {
      info.regions.push(region);
    }
  }

  // Postal codes
  const postalPattern = /\b([A-Z]\d[A-Z]\s?\d[A-Z]\d)\b/g;
  const postalMatches = Array.from(text.matchAll(postalPattern));
  info.postal_codes = [...new Set(postalMatches.map(m => m[1]))];

  return info;
}

/**
 * Calculate quality score (0-100)
 * Based on completeness of extracted data
 */
function calculateQualityScore(decision) {
  let score = 0;

  // Outcome (30 points max)
  if (decision.outcome !== 'Unknown') {
    score += decision.outcome_confidence * 0.3;
  }

  // Condition (15 points)
  if (decision.condition && decision.condition !== 'Unknown') {
    score += 15;
  }

  // Judge reasoning (20 points)
  if (decision.judge_reasoning && decision.judge_reasoning.length > 0) {
    score += Math.min(20, decision.judge_reasoning.length * 7);
  }

  // Cited case law (15 points)
  if (decision.cited_case_law && decision.cited_case_law.length > 0) {
    score += Math.min(15, decision.cited_case_law.length * 2);
  }

  // Medical evidence (10 points)
  const medEvidence = decision.medical_evidence;
  if (medEvidence) {
    const hasReports = medEvidence.reports && medEvidence.reports.length > 0;
    const hasTests = medEvidence.tests && medEvidence.tests.length > 0;
    const hasSpecialists = medEvidence.specialists && medEvidence.specialists.length > 0;
    score += (hasReports ? 4 : 0) + (hasTests ? 3 : 0) + (hasSpecialists ? 3 : 0);
  }

  // Geographic data (10 points)
  const geo = decision.geographic_info;
  if (geo) {
    const hasCities = geo.cities && geo.cities.length > 0;
    const hasRegions = geo.regions && geo.regions.length > 0;
    score += (hasCities ? 5 : 0) + (hasRegions ? 5 : 0);
  }

  return Math.round(Math.min(100, score));
}

// ============================================================
// Utility Functions
// ============================================================

function randomDelay() {
  return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logError(context, error) {
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({ timestamp, context, error: error.message, stack: error.stack }) + '\n';
  fs.appendFileSync(ERROR_LOG_FILE, logEntry);
}

function saveProgressResumable(data) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
}

function getCachedCase(caseId) {
  const cacheFile = path.join(CACHE_DIR, `${caseId}.json`);
  if (fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    const age = Date.now() - new Date(cached.cached_at).getTime();
    if (age < 30 * 24 * 60 * 60 * 1000) { // 30 days
      return cached.data;
    }
  }
  return null;
}

function cacheCase(caseId, data) {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  const cacheFile = path.join(CACHE_DIR, `${caseId}.json`);
  fs.writeFileSync(cacheFile, JSON.stringify({
    cached_at: new Date().toISOString(),
    data
  }));
}

// ============================================================
// API Functions
// ============================================================

async function fetchCaseHTML(database, caseId) {
  // Check cache first
  const cached = getCachedCase(caseId);
  if (cached) {
    console.log(`    ✅ Cached: ${caseId}`);
    return cached;
  }

  // Fetch from API
  const url = `${API_BASE}/caseBrowse/${LANG}/${database}/${caseId}?api_key=${API_KEY}`;
  
  try {
    await sleep(randomDelay());
    
    const response = await fetch(url);
    
    if (response.status === 429) {
      console.log(`\n❌ API quota exceeded`);
      return null; // Quota exceeded
    }
    
    if (!response.ok) {
      console.log(`    ⚠️  HTTP ${response.status}: ${caseId}`);
      return null;
    }
    
    const json = await response.json();
    
    // Cache the result
    cacheCase(caseId, json);
    
    return json;
  } catch (error) {
    logError({ action: 'fetchCaseHTML', database, caseId }, error);
    return null;
  }
}

/**
 * Process a single case - fetch HTML and extract all data
 */
async function processCase(database, caseId, existingData) {
  const html = await fetchCaseHTML(database, caseId);
  
  if (!html) {
    return null; // Quota exceeded or error
  }
  
  // Extract full text from HTML (strip tags for text analysis)
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  
  // Apply v5.0 enhanced extraction
  const { outcome, confidence } = extractOutcomeWithConfidence(text);
  const condition = extractCondition(text);
  const judge_reasoning = extractJudgeReasoning(text);
  const cited_case_law = extractCitedCaseLaw(text);
  const winning_arguments = extractWinningArguments(text, outcome);
  const medical_evidence = extractMedicalEvidence(text);
  const geographic_info = extractGeographicInfo(text, database);
  
  // Build enhanced decision object
  const enhanced = {
    ...existingData, // Preserve original metadata
    full_text_extracted: true,
    extraction_version: 'v5.0-enhanced',
    outcome,
    outcome_confidence: confidence,
    condition,
    judge_reasoning,
    cited_case_law,
    winning_arguments,
    medical_evidence,
    geographic_info,
    quality_score: 0 // Calculated below
  };
  
  enhanced.quality_score = calculateQualityScore(enhanced);
  
  return enhanced;
}

// ============================================================
// Main Refetch Logic
// ============================================================

async function loadExistingCases() {
  console.log('\n📂 Loading existing Ontario case IDs...\n');
  
  const allCases = [];
  
  for (const filePath of INPUT_FILES) {
    const fullPath = path.join(ROOT, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`  ⚠️  Not found: ${filePath}`);
      continue;
    }
    
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const cases = Array.isArray(data) ? data : [data];
    
    console.log(`  ✅ Loaded: ${cases.length} cases from ${path.basename(filePath)}`);
    
    // Extract case ID and database from each case
    for (const c of cases) {
      // Current format has case_id like "2025onwsiat892"
      if (c.case_id) {
        // Extract database from case_id (e.g., "onwsiat" from "2025onwsiat892")
        const match = c.case_id.match(/^\d{4}(\w+)\d+$/);
        if (match) {
          allCases.push({
            caseId: c.case_id,
            database: match[1], // e.g., "onwsiat", "onca", "onhrt"
            originalData: c
          });
        }
      } else if (c.caseId && c.databaseId) {
        // Legacy format (if any exist)
        allCases.push({
          caseId: c.caseId.en || c.caseId,
          database: c.databaseId,
          originalData: c
        });
      }
    }
  }
  
  // Deduplicate by case ID
  const uniqueCases = [];
  const seen = new Set();
  for (const c of allCases) {
    const key = `${c.database}:${c.caseId}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCases.push(c);
    }
  }
  
  console.log(`\n✅ Total unique cases to refetch: ${uniqueCases.length}\n`);
  
  return uniqueCases;
}

async function refetchOntarioCases() {
  console.log('\n============================================================');
  console.log('🔄 CanLII Ontario Refetch - v5.0 Enhanced Extraction');
  console.log('============================================================\n');
  
  // Load existing cases
  const cases = await loadExistingCases();
  
  if (cases.length === 0) {
    console.log('❌ No cases found to refetch');
    return;
  }
  
  // Group into batches
  const batches = [];
  for (let i = 0; i < cases.length; i += BATCH_SIZE) {
    batches.push(cases.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`📊 Processing ${cases.length} cases in ${batches.length} batches of ${BATCH_SIZE}\n`);
  
  const enhancedCases = [];
  let totalProcessed = 0;
  let quotaExceeded = false;
  
  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    if (quotaExceeded) break;
    
    const batch = batches[batchIdx];
    console.log(`\n📦 Batch ${batchIdx + 1}/${batches.length} (${batch.length} cases)\n`);
    
    for (const { caseId, database, originalData } of batch) {
      const enhanced = await processCase(database, caseId, originalData);
      
      if (enhanced === null) {
        // Quota exceeded
        quotaExceeded = true;
        console.log(`\n❌ Stopping: API quota exceeded`);
        console.log(`💾 Progress: ${totalProcessed}/${cases.length} cases processed\n`);
        break;
      }
      
      enhancedCases.push(enhanced);
      totalProcessed++;
      
      if (totalProcessed % 10 === 0) {
        console.log(`  Progress: ${totalProcessed}/${cases.length} (${Math.round(totalProcessed/cases.length*100)}%)`);
        
        // Save progress  every 10 cases
        saveProgressResumable({
          processed: totalProcessed,
          total: cases.length,
          last_batch: batchIdx,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Pause between batches
    if (batchIdx < batches.length - 1 && !quotaExceeded) {
      const pauseMs = BATCH_PAUSE_MIN + Math.random() * (BATCH_PAUSE_MAX - BATCH_PAUSE_MIN);
      console.log(`\n⏸️  Pausing ${Math.round(pauseMs/60000)} minutes before next batch...\n`);
      await sleep(pauseMs);
    }
  }
  
  // Save final results
  const outputPath = path.join(ROOT, OUTPUT_FILE);
  fs.writeFileSync(outputPath, JSON.stringify(enhancedCases, null, 2));
  
  console.log('\n============================================================');
  console.log('✅ Refetch Complete!');
  console.log('============================================================\n');
  console.log(`📊 Statistics:`);
  console.log(`  Total processed: ${totalProcessed}/${cases.length}`);
  console.log(`  Output file: ${OUTPUT_FILE}`);
  console.log(`  Cache files: ${fs.readdirSync(CACHE_DIR).length}\n`);
  
  // Generate summary
  const summary = {
    total_cases: totalProcessed,
    with_outcomes: enhancedCases.filter(c => c.outcome !== 'Unknown').length,
    high_quality: enhancedCases.filter(c => c.quality_score >= 70).length,
    avg_quality: enhancedCases.reduce((sum, c) => sum + c.quality_score, 0) / enhancedCases.length,
    ready_for_templates: enhancedCases.filter(c => c.quality_score >= 80 && c.outcome === 'Allowed').length,
    ready_for_evidence: enhancedCases.filter(c => c.medical_evidence && 
      (c.medical_evidence.reports.length > 0 || c.medical_evidence.tests.length > 0)).length,
    quota_exhausted: quotaExceeded,
    timestamp: new Date().toISOString()
  };
  
  const summaryPath = `docs/refetch-session-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(path.join(ROOT, summaryPath), JSON.stringify(summary, null, 2));
  
  console.log(`📋 Session summary: ${summaryPath}\n`);
  
  return summary;
}

// ============================================================
// Entry Point
// ============================================================

if (!API_KEY) {
  console.log('❌ CANLII_API_KEY not set');
  console.log('💡 Set it with: $env:CANLII_API_KEY = "your_key_here"');
  process.exit(1);
}

refetchOntarioCases().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
