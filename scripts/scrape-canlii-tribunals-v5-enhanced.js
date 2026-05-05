#!/usr/bin/env node
/**
 * CanLII Tribunal Decision Scraper v5.0-Enhanced
 * Complete Canada-wide coverage with safety features and data quality validation
 * 
 * Features:
 * - Rate limiting: Random delays 0.8-1.5s (safe zone)
 * - Resumable pipeline: Progress tracking + recovery
 * - Local caching: Avoid re-fetching
 * - Batch processing: 750 cases/batch, 5-10min pauses
 * - Enhanced extraction: Outcomes, reasoning, case law, arguments
 * - Quality scoring: Validation + confidence metrics
 * - Geographic data: Municipal, provincial, territorial
 * - Error logging: Comprehensive debugging
 * 
 * Author: 3mpwrApp
 * Date: April 5, 2026
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ===== CONFIGURATION =====
const CANLII_BASE = "https://api.canlii.org/v1";
const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";
const OUTPUT_DIR = path.join(__dirname, "../data/tribunal-decisions");
const CACHE_DIR = path.join(__dirname, "../data/.scraper-cache");
const PROGRESS_FILE = path.join(__dirname, "../data/.scraper-progress.json");
const ERROR_LOG_FILE = path.join(__dirname, "../data/.scraper-errors.jsonl");

// Rate limiting & batch configuration
const MIN_DELAY = 800;   // 0.8 seconds
const MAX_DELAY = 1500;  // 1.5 seconds
const BATCH_SIZE = 750;  // Cases per batch
const BATCH_PAUSE_MIN = 5 * 60 * 1000;  // 5 minutes
const BATCH_PAUSE_MAX = 10 * 60 * 1000; // 10 minutes
const SEARCH_BATCH_SIZE = 50; // API search results per page
let MAX_SEARCH_PAGES = Number.POSITIVE_INFINITY; // Optional CLI cap per search term
let MAX_CASES = Number.POSITIVE_INFINITY; // Optional CLI cap for case extraction

// ===== HYBRID APPROACH: Recent cases first =====
const RECENT_ONLY = true;   // Enable date filtering for Phase 1 (pilot launch)
const MIN_YEAR = 2020;      // Only collect 2020-2026 (7 years back)
// Set RECENT_ONLY = false later to backfill historical cases (Phase 2)

// API date filter - changes based on RECENT_ONLY setting
const CHANGED_SINCE = RECENT_ONLY ? "2020-01-01" : "1900-01-01";

// Global error tracking
global.sessionErrors = [];
const SESSION_START = Date.now();

// ===== TRIBUNALS CONFIGURATION =====
const TRIBUNALS = {
  // Ontario (re-scrape with full text)
  "onwsiat": {
    "name": "Workplace Safety & Insurance Appeals Tribunal (Ontario)",
    "database": "onwsiat",
    "jurisdiction": "ON",
    "search_terms": ["chronic pain", "PTSD", "back injury", "disability", "fibromyalgia"]
  },
  "onhrt": {
    "name": "Human Rights Tribunal of Ontario",
    "database": "onhrt",
    "jurisdiction": "ON",
    "search_terms": ["disability", "accommodation"]
  },
  "onca": {
    "name": "Ontario Court of Appeal",
    "database": "onca",
    "jurisdiction": "ON",
    "search_terms": ["disability", "WSIB"]
  },
  
  // British Columbia
  "bchrt": {
    "name": "British Columbia Human Rights Tribunal",
    "database": "bchrt",
    "jurisdiction": "BC",
    "search_terms": ["accommodation", "disability"]
  },
  "bcwcat": {
    "name": "Workers' Compensation Appeal Tribunal (BC)",
    "database": "bcwcat",
    "jurisdiction": "BC",
    "search_terms": ["chronic pain", "PTSD", "back injury", "disability"]
  },
  "bcest": {
    "name": "Employment Standards Tribunal (BC)",
    "database": "bcest",
    "jurisdiction": "BC",
    "search_terms": ["wages", "overtime", "termination", "employment standards", "compensation"]
  },
  "bclrb": {
    "name": "Labour Relations Board (BC)",
    "database": "bclrb",
    "jurisdiction": "BC",
    "search_terms": ["union", "collective agreement", "dismissal", "labour practice", "accommodation"]
  },
  "bcca": {
    "name": "British Columbia Court of Appeal",
    "database": "bcca",
    "jurisdiction": "BC",
    "search_terms": ["disability", "WorkSafeBC"]
  },
  
  // Alberta
  "abqb": {
    "name": "Alberta Court of Queen's Bench",
    "database": "abqb",
    "jurisdiction": "AB",
    "search_terms": ["disability", "WCB", "accommodation"]
  },
  "abca": {
    "name": "Alberta Court of Appeal",
    "database": "abca",
    "jurisdiction": "AB",
    "search_terms": ["disability", "WCB"]
  },
  
  // Saskatchewan
  "skca": {
    "name": "Saskatchewan Court of Appeal",
    "database": "skca",
    "jurisdiction": "SK",
    "search_terms": ["disability", "WCB"]
  },
  
  // Manitoba
  "mbca": {
    "name": "Manitoba Court of Appeal",
    "database": "mbca",
    "jurisdiction": "MB",
    "search_terms": ["disability", "WCB", "accommodation"]
  },
  
  // Quebec
  "qctat": {
    "name": "Tribunal administratif du travail (Quebec)",
    "database": "qctat",
    "jurisdiction": "QC",
    "search_terms": ["disability", "CNESST", "accommodation"]
  },
  "qcca": {
    "name": "Quebec Court of Appeal",
    "database": "qcca",
    "jurisdiction": "QC",
    "search_terms": ["disability"]
  },
  
  // Atlantic provinces
  "nbca": {
    "name": "New Brunswick Court of Appeal",
    "database": "nbca",
    "jurisdiction": "NB",
    "search_terms": ["disability", "WorkSafeNB"]
  },
  "nsca": {
    "name": "Nova Scotia Court of Appeal",
    "database": "nsca",
    "jurisdiction": "NS",
    "search_terms": ["disability", "WCB"]
  },
  "peca": {
    "name": "Prince Edward Island Court of Appeal",
    "database": "peca",
    "jurisdiction": "PE",
    "search_terms": ["disability", "WCB"]
  },
  "nlca": {
    "name": "Newfoundland and Labrador Court of Appeal",
    "database": "nlca",
    "jurisdiction": "NL",
    "search_terms": ["disability", "WorkplaceNL"]
  },
  
  // Territories
  "ykca": {
    "name": "Yukon Court of Appeal",
    "database": "ykca",
    "jurisdiction": "YT",
    "search_terms": ["disability"]
  },
  "nwtca": {
    "name": "Northwest Territories Court of Appeal",
    "database": "nwtca",
    "jurisdiction": "NT",
    "search_terms": ["disability"]
  },
  "nuca": {
    "name": "Nunavut Court of Appeal",
    "database": "nuca",
    "jurisdiction": "NU",
    "search_terms": ["disability"]
  },
  
  // Federal
  "chrt": {
    "name": "Canadian Human Rights Tribunal",
    "database": "chrt",
    "jurisdiction": "FED",
    "search_terms": ["accommodation", "disability"]
  },
  "fct": {
    "name": "Federal Court of Canada",
    "database": "fct",
    "jurisdiction": "FED",
    "search_terms": ["disability", "Canada Pension Plan"]
  },
  "fca": {
    "name": "Federal Court of Appeal",
    "database": "fca",
    "jurisdiction": "FED",
    "search_terms": ["disability", "CPP"]
  }
};

// ===== SAFETY & UTILITY FUNCTIONS =====

function randomDelay() {
  const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
  return new Promise(resolve => setTimeout(resolve, delay));
}

function logError(caseId, database, errorType, errorMessage, context = {}) {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    case_id: caseId,
    database,
    error_type: errorType,
    error_message: errorMessage,
    context,
    retry_count: context.retryCount || 0
  };
  
  fs.appendFileSync(ERROR_LOG_FILE, JSON.stringify(errorEntry) + '\n');
  global.sessionErrors.push(errorEntry);
}

function loadProgress(tribunalId) {
  try {
    if (!fs.existsSync(PROGRESS_FILE)) return { completed: [], failed: [], lastBatch: 0 };
    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    return data[tribunalId] || { completed: [], failed: [], lastBatch: 0 };
  } catch (error) {
    logError(null, tribunalId, 'PROGRESS_LOAD_ERROR', error.message);
    return { completed: [], failed: [], lastBatch: 0 };
  }
}

function saveProgress(tribunalId, completed, failed, batchNum) {
  try {
    let progress = {};
    if (fs.existsSync(PROGRESS_FILE)) {
      progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
    
    progress[tribunalId] = {
      completed,
      failed,
      lastBatch: batchNum,
      lastUpdate: new Date().toISOString(),
      completedCount: completed.length,
      failedCount: failed.length
    };
    
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch (error) {
    logError(null, tribunalId, 'PROGRESS_SAVE_ERROR', error.message);
  }
}

function getCacheKey(caseId, database) {
  return `${database}_${caseId}.json`;
}

function getCachedResponse(caseId, database) {
  const cacheFile = path.join(CACHE_DIR, getCacheKey(caseId, database));
  try {
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile);
      const age = Date.now() - stats.mtimeMs;
      
      // Cache valid for 30 days
      if (age < 30 * 24 * 60 * 60 * 1000) {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return cached;
      }
    }
  } catch (error) {
    // Cache read error, will fetch fresh
  }
  return null;
}

function cacheResponse(caseId, database, data) {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    
    const cacheFile = path.join(CACHE_DIR, getCacheKey(caseId, database));
    fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
  } catch (error) {
    // Cache write error, not critical
  }
}

function generateFingerprint(decision) {
  return `${decision.tribunal}_${decision.case_id}_${decision.date}`;
}

// ===== PRE-FLIGHT CHECKS =====

function performPreFlightChecks() {
  const issues = [];
  
  console.log('\n🔍 Running pre-flight checks...\n');
  
  // Check API key
  if (!CANLII_API_KEY || CANLII_API_KEY === "YOUR_FREE_API_KEY_HERE") {
    issues.push("❌ CANLII_API_KEY not set");
  } else {
    console.log(`✅ API key configured (${CANLII_API_KEY.length} characters)`);
  }
  
  // Create directories
  const dirs = [OUTPUT_DIR, CACHE_DIR];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      console.log(`📁 Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    } else {
      console.log(`✅ Directory exists: ${dir}`);
    }
  }
  
  // Check disk space
  try {
    const stats = fs.statfsSync ? fs.statfsSync(OUTPUT_DIR) : null;
    if (stats) {
      const freeSpaceGB = (stats.bavail * stats.bsize) / (1024 ** 3);
      if (freeSpaceGB < 0.5) {
        issues.push(`⚠️  Low disk space: ${freeSpaceGB.toFixed(2)}GB free`);
      } else {
        console.log(`✅ Disk space: ${freeSpaceGB.toFixed(2)}GB free`);
      }
    }
  } catch (error) {
    console.log(`⚠️  Could not check disk space: ${error.message}`);
  }
  
  // Check write permissions
  try {
    const testFile = path.join(OUTPUT_DIR, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log(`✅ Write permissions verified`);
  } catch (error) {
    issues.push(`❌ No write permission in ${OUTPUT_DIR}`);
  }
  
  // Check for existing progress
  if (fs.existsSync(PROGRESS_FILE)) {
    const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    const totalCompleted = Object.values(progress).reduce((sum, p) => sum + (p.completed?.length || 0), 0);
    console.log(`\n📊 Found existing progress: ${totalCompleted} cases completed`);
  }
  
  // Check cache
  if (fs.existsSync(CACHE_DIR)) {
    const cacheFiles = fs.readdirSync(CACHE_DIR);
    console.log(`💾 Cache directory: ${cacheFiles.length} files`);
  }
  
  if (issues.length > 0) {
    console.error('\n❌ Pre-flight checks failed:\n');
    issues.forEach(issue => console.error(`  ${issue}`));
    return false;
  }
  
  console.log('\n✅ Pre-flight checks passed!\n');
  return true;
}

// ===== EXTRACTION FUNCTIONS =====

function extractCondition(text) {
  const conditions = [];
  const patterns = [
    { name: 'chronic pain', pattern: /\bchronic pain\b/gi },
    { name: 'fibromyalgia', pattern: /\bfibromyalgia\b/gi },
    { name: 'PTSD', pattern: /\b(?:ptsd|post-traumatic stress)\b/gi },
    { name: 'back injury', pattern: /\b(?:back injury|spinal injury|herniated disc)\b/gi },
    { name: 'depression', pattern: /\bdepression\b/gi },
    { name: 'anxiety', pattern: /\banxiety\b/gi },
    { name: 'arthritis', pattern: /\b(?:rheumatoid arthritis|osteoarthritis|arthritis)\b/gi },
    { name: 'chronic fatigue', pattern: /\bchronic fatigue\b/gi },
    { name: 'multiple sclerosis', pattern: /\b(?:multiple sclerosis|ms)\b/gi },
    { name: 'carpal tunnel', pattern: /\bcarpal tunnel\b/gi },
    { name: 'tendinitis', pattern: /\btendinitis\b/gi },
    { name: 'knee', pattern: /\b(?:knee injury|knee pain)\b/gi },
    { name: 'shoulder', pattern: /\b(?:shoulder injury|rotator cuff)\b/gi },
    { name: 'wrist', pattern: /\b(?:wrist injury|wrist pain)\b/gi },
    { name: 'mental health', pattern: /\b(?:mental health|psychological)\b/gi },
    { name: 'impairment', pattern: /\bimpairment\b/gi },
    { name: 'disc', pattern: /\b(?:disc|disk herniation)\b/gi }
  ];
  
  for (const { name, pattern } of patterns) {
    if (pattern.test(text)) {
      conditions.push(name);
    }
  }
  
  return conditions.length > 0 ? conditions.join(', ') : 'Unknown';
}

function extractOutcomeWithConfidence(text) {
  let outcome = "Unknown";
  let confidence = 0;
  
  // Primary indicators (most reliable)
  if (/\bappeal\s+is\s+(?:hereby\s+)?allowed\b/i.test(text)) {
    outcome = "Allowed";
    confidence = 90;
  } else if (/\bappeal\s+is\s+(?:hereby\s+)?dismissed\b/i.test(text)) {
    outcome = "Dismissed";
    confidence = 90;
  } else if (/\bdecision\s+is\s+(?:hereby\s+)?allowed\b/i.test(text)) {
    outcome = "Allowed";
    confidence = 85;
  } else if (/\bdecision\s+is\s+(?:hereby\s+)?dismissed\b/i.test(text)) {
    outcome = "Dismissed";
    confidence = 85;
  } else if (/\b(?:worker|appellant)\s+is\s+entitled\s+to\b/i.test(text)) {
    outcome = "Allowed";
    confidence = 75;
  } else if (/\bentitlement\s+is\s+(?:hereby\s+)?granted\b/i.test(text)) {
    outcome = "Allowed";
    confidence = 80;
  } else if (/\bentitlement\s+is\s+(?:hereby\s+)?denied\b/i.test(text)) {
    outcome = "Dismissed";
    confidence = 80;
  } else if (/\bbenefits?\s+(?:are|is)\s+(?:hereby\s+)?granted\b/i.test(text)) {
    outcome = "Allowed";
    confidence = 75;
  } else if (/\bbenefits?\s+(?:are|is)\s+(?:hereby\s+)?denied\b/i.test(text)) {
    outcome = "Dismissed";
    confidence = 75;
  } else if (/\bclaim\s+is\s+(?:hereby\s+)?allowed\b/i.test(text)) {
    outcome = "Allowed";
    confidence = 80;
  } else if (/\bclaim\s+is\s+(?:hereby\s+)?dismissed\b/i.test(text)) {
    outcome = "Dismissed";
    confidence = 80;
  }
  
  // Check for multiple indicators to boost confidence
  if (outcome !== "Unknown") {
    const indicators = [
      /\bappeal\s+is\s+(?:hereby\s+)?(?:allowed|dismissed)\b/i,
      /\bentitlement\s+is\s+(?:hereby\s+)?(?:granted|denied)\b/i,
      /\bbenefits?\s+(?:are|is)\s+(?:hereby\s+)?(?:granted|denied)\b/i
    ];
    
    const matches = indicators.filter(pattern => pattern.test(text)).length;
    if (matches > 1) confidence = Math.min(100, confidence + 10);
  }
  
  return { outcome, confidence };
}

function extractJudgeReasoning(text) {
  const sections = [];
  
  const reasoningPatterns = [
    /(?:REASONS?|ANALYSIS|DISCUSSION):?\s+([\s\S]{500,3000}?)(?:\n\n|CONCLUSION|DECISION)/gi,
    /(?:The (?:panel|tribunal|court|I))\s+(?:find|conclude|determine)s?\s+that\s+([\s\S]{200,1000}?)(?:\.|;|\n\n)/gi
  ];
  
  for (const pattern of reasoningPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      if (match[1] && match[1].length > 100) {
        sections.push(match[1].trim().substring(0, 1000));
      }
    }
  }
  
  return sections.slice(0, 3); // Top 3 reasoning sections
}

function extractCitedCaseLaw(text) {
  const citations = [];
  
  // Canadian case law citation patterns
  const patterns = [
    /\b(\d{4}\s+[A-Z]{2,10}\s+\d+)\b/g,
    /\b([A-Z][a-z]+\s+v\.?\s+[A-Z][a-z]+(?:\s+\(\d{4}\))?)\b/g
  ];
  
  for (const pattern of patterns) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      citations.push(match[1]);
    }
  }
  
  return [...new Set(citations)].slice(0, 10);
}

function extractWinningArguments(text, outcome) {
  if (outcome === "Unknown") return [];
  
  const arguments = [];
  
  const keyPhrases = [
    /(?:The evidence (?:shows?|demonstrates?|establishes)|It is clear|I am satisfied)\s+that\s+([\s\S]{100,500}?)(?:\.|;)/gi,
    /(?:Based on|Given|Considering)\s+([\s\S]{100,500}?)(?:, (?:the|I))/gi,
    /(?:I (?:find|conclude|accept))\s+(?:that\s+)?([\s\S]{100,500}?)(?:\.|;)/gi
  ];
  
  for (const pattern of keyPhrases) {
    const matches = Array.from(text.matchAll(pattern));
    for (const match of matches) {
      if (match[1] && match[1].length > 50) {
        arguments.push(match[1].trim().substring(0, 500));
      }
    }
  }
  
  return arguments.slice(0, 5);
}

function extractEvidence(text) {
  const evidence = [];
  
  const evidenceTypes = [
    { pattern: /\b(?:rfc|residual functional capacity)\b/i, name: "RFC form" },
    { pattern: /\b(?:fce|functional capacity evaluation)\b/i, name: "FCE" },
    { pattern: /\bspecialist report\b/i, name: "Specialist report" },
    { pattern: /\btimeline\b/i, name: "Timeline" },
    { pattern: /\b(?:ime|independent medical exam(?:ination)?)\b/i, name: "IME" },
    { pattern: /\bmedical records?\b/i, name: "Medical records" },
    { pattern: /\bemployer statement\b/i, name: "Employment docs" },
    { pattern: /\bpre-existing condition\b/i, name: "Pre-existing condition" }
  ];
  
  for (const { pattern, name } of evidenceTypes) {
    if (pattern.test(text)) evidence.push(name);
  }
  
  return evidence;
}

function extractMedicalEvidence(text) {
  const evidence = {
    reports: [],
    assessments: [],
    tests: [],
    specialists: []
  };
  
  // Medical reports
  const reportPatterns = [
    /\b(?:ime|independent medical exam(?:ination)?)\b/gi,
    /\b(?:fce|functional capacity evaluat(?:ion|e))\b/gi,
    /\bmedical report\b/gi,
    /\bspecialist report\b/gi,
    /\bdiagnostic report\b/gi,
    /\btreatment record\b/gi,
    /\bclinical note\b/gi
  ];
  
  for (const pattern of reportPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      evidence.reports.push(...new Set(matches.map(m => m[0].toLowerCase())));
    }
  }
  
  // Diagnostic tests
  const testPatterns = [
    /\b(?:mri|ct scan|x-ray|ultrasound|emg|nerve conduction)\b/gi,
    /\b(?:blood work|lab test|diagnostic imaging)\b/gi
  ];
  
  for (const pattern of testPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      evidence.tests.push(...new Set(matches.map(m => m[0].toLowerCase())));
    }
  }
  
  // Medical specialists
  const specialistPatterns = [
    /\b(?:orthopedic surgeon|neurologist|psychiatrist|psychologist)\b/gi,
    /\b(?:physiatrist|occupational therapist|physiotherapist)\b/gi,
    /\b(?:family physician|general practitioner|gp)\b/gi,
    /\b(?:rheumatologist|pain specialist)\b/gi
  ];
  
  for (const pattern of specialistPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      evidence.specialists.push(...new Set(matches.map(m => m[0].toLowerCase())));
    }
  }
  
  return evidence;
}

function extractGeographicInfo(text, database) {
  const geo = {
    province_territory: null,
    cities: [],
    regions: [],
    postal_codes: []
  };
  
  // Provincial/territorial patterns
  const provincePatterns = {
    'ON': /\b(?:Ontario|ON)\b/i,
    'BC': /\b(?:British Columbia|BC|B\.C\.)\b/i,
    'AB': /\b(?:Alberta|AB)\b/i,
    'SK': /\b(?:Saskatchewan|SK)\b/i,
    'MB': /\b(?:Manitoba|MB)\b/i,
    'QC': /\b(?:Quebec|Québec|QC)\b/i,
    'NB': /\b(?:New Brunswick|NB|N\.B\.)\b/i,
    'NS': /\b(?:Nova Scotia|NS|N\.S\.)\b/i,
    'PE': /\b(?:Prince Edward Island|PEI|PE|P\.E\.I\.)\b/i,
    'NL': /\b(?:Newfoundland and Labrador|Newfoundland|Labrador|NL|N\.L\.)\b/i,
    'NT': /\b(?:Northwest Territories|NWT|NT|N\.W\.T\.)\b/i,
    'YT': /\b(?:Yukon|YT)\b/i,
    'NU': /\b(?:Nunavut|NU)\b/i
  };
  
  for (const [code, pattern] of Object.entries(provincePatterns)) {
    if (pattern.test(text)) {
      geo.province_territory = code;
      break;
    }
  }
  
  // City patterns (major cities only to keep data manageable)
  const cityPatterns = {
    'Toronto': /\bToronto\b/gi, 'Ottawa': /\bOttawa\b/gi, 'Thunder Bay': /\bThunder Bay\b/gi,
    'Vancouver': /\bVancouver\b/gi, 'Victoria': /\bVictoria\b/gi,
    'Calgary': /\bCalgary\b/gi, 'Edmonton': /\bEdmonton\b/gi,
    'Saskatoon': /\bSaskatoon\b/gi, 'Regina': /\bRegina\b/gi,
    'Winnipeg': /\bWinnipeg\b/gi,
    'Montreal': /\b(?:Montreal|Montréal)\b/gi, 'Quebec City': /\bQuebec City\b/gi,
    'Halifax': /\bHalifax\b/gi, 'St. John\'s': /\bSt\.?\s*John'?s\b/gi,
    'Yellowknife': /\bYellowknife\b/gi, 'Whitehorse': /\bWhitehorse\b/gi, 'Iqaluit': /\bIqaluit\b/gi
  };
  
  for (const [city, pattern] of Object.entries(cityPatterns)) {
    if (pattern.test(text)) {
      geo.cities.push(city);
    }
  }
  
  // Region patterns
  const regionPatterns = {
    'Northern Ontario': /\bNorthern Ontario\b/gi,
    'Greater Toronto Area': /\b(?:GTA|Greater Toronto)\b/gi,
    'Lower Mainland': /\bLower Mainland\b/gi,
    'Vancouver Island': /\bVancouver Island\b/gi
  };
  
  for (const [region, pattern] of Object.entries(regionPatterns)) {
    if (pattern.test(text)) {
      geo.regions.push(region);
    }
  }
  
  // Postal codes
  const postalPattern = /\b([A-Z]\d[A-Z]\s?\d[A-Z]\d)\b/gi;
  const postalMatches = Array.from(text.matchAll(postalPattern));
  for (const match of postalMatches) {
    geo.postal_codes.push(match[1].toUpperCase());
  }
  
  // Derive province from database if not found
  if (!geo.province_territory) {
    const dbToProvince = {
      'onwsiat': 'ON', 'onca': 'ON', 'onhrt': 'ON',
      'bchrt': 'BC', 'bcwcat': 'BC', 'bcca': 'BC',
      'abqb': 'AB', 'abca': 'AB',
      'skca': 'SK', 'mbca': 'MB',
      'qctat': 'QC', 'qcca': 'QC',
      'nbca': 'NB', 'nsca': 'NS', 'peca': 'PE', 'nlca': 'NL',
      'ykca': 'YT', 'nwtca': 'NT', 'nuca': 'NU'
    };
    geo.province_territory = dbToProvince[database] || null;
  }
  
  return geo;
}

function extractRepresentationInfo(text) {
  const hasLawyer = /\b(?:represented by|counsel|attorney|lawyer|legal representative)\b/i.test(text);
  const isSelfRep = /\b(?:self-represented|unrepresented|pro se|without counsel)\b/i.test(text);
  const hasUnion = /\b(?:union representative|union counsel|opseu|cupe|unifor)\b/i.test(text);
  
  let representation = "Unknown";
  if (hasLawyer) representation = "Legal Counsel";
  else if (hasUnion) representation = "Union Representative";
  else if (isSelfRep) representation = "Self-Represented";
  
  return {
    representation,
    has_legal_help: hasLawyer || hasUnion
  };
}

function categorizeByRecency(decisionDate) {
  try {
    const date = new Date(decisionDate);
    const now = new Date();
    const monthsAgo = (now - date) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsAgo <= 12) return "Recent (Past Year)";
    if (monthsAgo <= 36) return "Medium (1-3 Years)";
    if (monthsAgo <= 60) return "Older (3-5 Years)";
    return "Historical (5+ Years)";
  } catch {
    return "Unknown";
  }
}

function extractKeyFactors(text) {
  const factors = [];
  
  const factorPatterns = [
    { pattern: /\bcredible|credibility established\b/i, name: "Credible testimony" },
    { pattern: /\bconsistent with medical evidence\b/i, name: "Consistent evidence" },
    { pattern: /\bobjective medical findings\b/i, name: "Objective findings" },
    { pattern: /\bpre-existing condition\b/i, name: "Pre-existing condition" },
    { pattern: /\binsufficient evidence\b/i, name: "Insufficient evidence" },
    { pattern: /\bnot credible|credibility concerns\b/i, name: "Credibility issues" }
  ];
  
  for (const { pattern, name } of factorPatterns) {
    if (pattern.test(text)) factors.push(name);
  }
  
  return factors;
}

function validateExtraction(decision) {
  const issues = [];
  
  if (decision.outcome === "Unknown" && decision.raw_html && decision.raw_html.length > 1000) {
    issues.push("Has HTML but no outcome - extraction may have failed");
  }
  
  if (decision.outcome !== "Unknown" && decision.outcome_confidence < 40) {
    issues.push("Low confidence outcome - needs manual review");
  }
  
  if (decision.judge_reasoning.length === 0 && decision.outcome !== "Unknown") {
    issues.push("Missing reasoning for decided case");
  }
  
  if (decision.winning_arguments.length === 0 && decision.outcome === "Allowed") {
    issues.push("No winning arguments extracted from successful appeal");
  }
  
  return {
    valid: issues.length === 0,
    issues,
    quality_score: calculateQualityScore(decision)
  };
}

function calculateQualityScore(decision) {
  let score = 0;
  
  if (decision.outcome !== "Unknown") score += 30;
  if (decision.outcome_confidence >= 70) score += 20;
  if (decision.judge_reasoning.length > 0) score += 15;
  if (decision.cited_case_law.length > 0) score += 10;
  if (decision.winning_arguments.length > 0) score += 15;
  if (decision.evidence_cited.length > 0) score += 10;
  
  return score;
}

// ===== API & NETWORK FUNCTIONS =====

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else if (res.statusCode === 429) {
          reject(new Error('RATE_LIMITED'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function fetchDecisionHTMLWithRetry(caseId, database, retries = 3) {
  // Check cache first
  const cached = getCachedResponse(caseId, database);
  if (cached) {
    console.log(`  💾 Using cached: ${caseId}`);
    return cached.html || null;
  }
  
  // Fetch from API with retries
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `${CANLII_BASE}/caseBrowse/en/${database}/${caseId}?api_key=${CANLII_API_KEY}`;
      const data = await httpsGet(url);
      const jsonResponse = JSON.parse(data);
      
      // Cache the response
      cacheResponse(caseId, database, jsonResponse);
      
      return jsonResponse.html || data;
    } catch (error) {
      if (error.message === 'RATE_LIMITED') {
        logError(caseId, database, 'RATE_LIMITED', 'API quota exceeded', { attempt });
        throw error; // Don't retry rate limits
      }
      
      if (attempt === retries) {
        logError(caseId, database, 'FETCH_ERROR', error.message, { attempt });
        return null;
      }
      
      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  
  return null;
}

async function searchCanLII(database, searchTerm, offset = 0) {
  const params = new URLSearchParams({
    api_key: CANLII_API_KEY,
    offset: offset.toString(),
    resultCount: SEARCH_BATCH_SIZE.toString(),
    changedSince: CHANGED_SINCE,
    search: searchTerm
  });
  
  const url = `${CANLII_BASE}/caseBrowse/en/${database}?${params}`;
  
  try {
    const data = await httpsGet(url);
    const response = JSON.parse(data);
    
    if (response.cases && Array.isArray(response.cases)) {
      return { results: response.cases };
    }
    
    return { results: [] };
  } catch (error) {
    if (error.message === 'RATE_LIMITED') {
      throw error;
    }
    logError(null, database, 'SEARCH_ERROR', error.message, { searchTerm, offset });
    return { results: [] };
  }
}

// ===== DECISION PARSING =====

function parseDecision(caseData, html, tribunalName, database) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  
  // Extract all fields
  const { outcome, confidence } = extractOutcomeWithConfidence(text);
  const condition = extractCondition(text);
  const evidence_cited = extractEvidence(text);
  const judge_reasoning = extractJudgeReasoning(text);
  const cited_case_law = extractCitedCaseLaw(text);
  const winning_arguments = outcome === "Allowed" ? extractWinningArguments(text, outcome) : [];
  const medical_evidence = extractMedicalEvidence(text);
  const geographic_info = extractGeographicInfo(text, database);
  const representation_info = extractRepresentationInfo(text);
  const recency_category = categorizeByRecency(caseData.decisionDate);
  const key_factors = extractKeyFactors(text);
  
  const decision = {
    // Core fields
    case_id: caseData.caseId?.en || caseData.caseId || "Unknown",
    title: caseData.title || "Unknown",
    date: caseData.decisionDate || "Unknown",
    tribunal: tribunalName,
    url: caseData.url || "",
    
    // Geographic data
    province_territory: geographic_info.province_territory,
    cities: geographic_info.cities,
    regions: geographic_info.regions,
    postal_codes: geographic_info.postal_codes,
    
    // Primary extraction
    condition,
    outcome,
    outcome_confidence: confidence,
    
    // Evidence & reasoning
    evidence_cited,
    medical_evidence,
    judge_reasoning,
    cited_case_law,
    winning_arguments,
    key_factors,
    
    // Contextual data
    representation_info,
    recency_category,
    
    // Raw data
    snippet: text.substring(0, 500).trim() + "...",
    raw_html: html.substring(0, 2000),
    
    // Metadata
    extraction_version: "v5.0-enhanced",
    extraction_timestamp: new Date().toISOString()
  };
  
  // Validate and score
  const validation = validateExtraction(decision);
  decision.quality_score = validation.quality_score;
  decision.validation_issues = validation.issues;
  
  return decision;
}

// ===== MAIN SCRAPING LOGIC =====

async function scrapeTribunalBatched(tribunalId, config) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Scraping ${config.name}`);
  console.log(`${'='.repeat(60)}\n`);
  
  const progress = loadProgress(tribunalId);
  const completedSet = new Set(progress.completed);
  const allDecisions = [];
  const allCaseIds = new Set();
  
  // Step 1: Collect all case IDs
  console.log('🔍 Step 1: Discovering cases...\n');
  
  for (const searchTerm of config.search_terms) {
    console.log(`  Searching: "${searchTerm}"`);
    let offset = 0;
    let hasMore = true;
    let searchPages = 0;
    
    while (hasMore) {
      if (searchPages >= MAX_SEARCH_PAGES) {
        console.log(`    Reached search page cap (${MAX_SEARCH_PAGES}) for this term`);
        break;
      }

      try {
        const results = await searchCanLII(config.database, searchTerm, offset);
        
        if (results.results.length === 0) {
          hasMore = false;
          break;
        }
        
        // Add case IDs (API already filtered by date via changedSince parameter)
        for (const caseData of results.results) {
          const caseId = caseData.caseId?.en || caseData.caseId;
          if (caseId) allCaseIds.add(caseId);
        }
        
        console.log(`    Found ${results.results.length} cases (offset ${offset})`);
        offset += SEARCH_BATCH_SIZE;
        searchPages += 1;
        
        await randomDelay();
        
      } catch (error) {
        if (error.message === 'RATE_LIMITED') {
          console.error('\n❌ API quota exceeded during search phase');
          throw error;
        }
        console.error(`  ⚠️  Search error: ${error.message}`);
        break;
      }
    }
  }
  
  const totalCases = allCaseIds.size;
  const discoveredNewCases = Array.from(allCaseIds).filter(id => !completedSet.has(id));
  const newCases = Number.isFinite(MAX_CASES)
    ? discoveredNewCases.slice(0, MAX_CASES)
    : discoveredNewCases;
  
  console.log(`\n✅ Discovery complete: ${totalCases} total cases`);
  console.log(`📋 Already completed: ${completedSet.size}`);
  console.log(`🆕 New cases to scrape: ${newCases.length}${Number.isFinite(MAX_CASES) ? ` (capped from ${discoveredNewCases.length})` : ''}\n`);
  
  if (newCases.length === 0) {
    console.log('✅ All cases already scraped!\n');
    return [];
  }
  
  // Step 2: Batch processing
  const batches = [];
  for (let i = 0; i < newCases.length; i += BATCH_SIZE) {
    batches.push(newCases.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`\n📦 Step 2: Processing ${batches.length} batches of ~${BATCH_SIZE} cases each\n`);
  
  for (let batchNum = 0; batchNum < batches.length; batchNum++) {
    const batch = batches[batchNum];
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🔄 Batch ${batchNum + 1}/${batches.length} (${batch.length} cases)`);
    console.log(`${'─'.repeat(60)}\n`);
    
    for (let i = 0; i < batch.length; i++) {
      const caseId = batch[i];
      
      try {
        console.log(`  [${i + 1}/${batch.length}] ${caseId}...`);
        
        const html = await fetchDecisionHTMLWithRetry(caseId, config.database);
        
        if (html && html.length > 100) {
          const decision = parseDecision({ caseId, decisionDate: "Unknown", title: caseId }, html, config.name, config.database);
          allDecisions.push(decision);
          progress.completed.push(caseId);
          
          console.log(`    ✅ Extracted (quality: ${decision.quality_score}, outcome: ${decision.outcome})`);
        } else {
          progress.failed.push({ caseId, reason: 'No HTML content' });
          console.log(`    ⚠️  No content`);
        }
        
        // Save progress every 10 cases
        if (progress.completed.length % 10 === 0) {
          saveProgress(tribunalId, progress.completed, progress.failed, batchNum);
        }
        
        await randomDelay();
        
      } catch (error) {
        if (error.message === 'RATE_LIMITED') {
          console.error(`\n❌ API quota exceeded at case ${caseId}`);
          console.error('💾 Progress saved. Re-run later to continue.\n');
          saveProgress(tribunalId, progress.completed, progress.failed, batchNum);
          throw error;
        }
        
        progress.failed.push({ caseId, reason: error.message });
        console.log(`    ❌ Error: ${error.message}`);
      }
    }
    
    // Save batch results
    saveProgress(tribunalId, progress.completed, progress.failed, batchNum);
    console.log(`\n💾 Batch ${batchNum + 1} complete. Progress saved.`);
    
    // Pause between batches (except last batch)
    if (batchNum < batches.length - 1) {
      const pauseTime = BATCH_PAUSE_MIN + Math.random() * (BATCH_PAUSE_MAX - BATCH_PAUSE_MIN);
      const pauseMinutes = Math.round(pauseTime / 60000);
      console.log(`\n⏸️  Pausing for ${pauseMinutes} minutes before next batch...\n`);
      await new Promise(resolve => setTimeout(resolve, pauseTime));
    }
  }
  
  console.log(`\n✅ ${config.name} complete: ${allDecisions.length} decisions scraped\n`);
  
  return allDecisions;
}

// ===== SESSION SUMMARY =====

function generateSessionSummary(allDecisions) {
  const endTime = Date.now();
  const durationHours = (endTime - SESSION_START) / (1000 * 60 * 60);
  
  const summary = {
    session: {
      started: new Date(SESSION_START).toISOString(),
      ended: new Date(endTime).toISOString(),
      duration_hours: durationHours.toFixed(2)
    },
    statistics: {
      total_cases: allDecisions.length,
      with_outcomes: allDecisions.filter(d => d.outcome !== "Unknown").length,
      high_quality: allDecisions.filter(d => d.quality_score >= 70).length,
      by_province: {}
    },
    outcomes: {
      allowed: allDecisions.filter(d => d.outcome === "Allowed").length,
      dismissed: allDecisions.filter(d => d.outcome === "Dismissed").length,
      unknown: allDecisions.filter(d => d.outcome === "Unknown").length
    },
    quality_metrics: {
      avg_quality_score: allDecisions.length > 0 
        ? (allDecisions.reduce((sum, d) => sum + (d.quality_score || 0), 0) / allDecisions.length).toFixed(1)
        : 0,
      avg_confidence: allDecisions.length > 0
        ? (allDecisions.reduce((sum, d) => sum + (d.outcome_confidence || 0), 0) / allDecisions.length).toFixed(1)
        : 0,
      cases_needing_review: allDecisions.filter(d => d.quality_score < 50).length
    },
    flywheel_readiness: {
      ready_for_templates: allDecisions.filter(d => 
        d.outcome === "Allowed" && 
        d.judge_reasoning.length > 0 && 
        d.winning_arguments.length > 0
      ).length,
      ready_for_evidence_analysis: allDecisions.filter(d => 
        d.medical_evidence?.reports?.length > 0
      ).length,
      ready_for_pattern_analysis: allDecisions.filter(d =>
        d.outcome !== "Unknown" &&
        d.condition !== "Unknown"
      ).length
    },
    errors: {
      total: global.sessionErrors.length,
      by_type: {}
    }
  };
  
  // Province breakdown
  for (const decision of allDecisions) {
    const prov = decision.province_territory || 'Unknown';
    summary.statistics.by_province[prov] = (summary.statistics.by_province[prov] || 0) + 1;
  }
  
  // Error breakdown
  for (const error of global.sessionErrors) {
    const type = error.error_type;
    summary.errors.by_type[type] = (summary.errors.by_type[type] || 0) + 1;
  }
  
  // Save summary
  const summaryFile = path.join(__dirname, `../docs/scrape-session-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  // Print to console
  console.log('\n' + '='.repeat(60));
  console.log('📊 SESSION SUMMARY');
  console.log('='.repeat(60));
  console.log(`\n⏱️  Duration: ${summary.session.duration_hours} hours`);
  console.log(`📁 Total Cases: ${summary.statistics.total_cases}`);
  console.log(`✅ With Outcomes: ${summary.statistics.with_outcomes} (${summary.statistics.total_cases > 0 ? (summary.statistics.with_outcomes/summary.statistics.total_cases*100).toFixed(1) : 0}%)`);
  console.log(`⭐ High Quality: ${summary.statistics.high_quality} (${summary.statistics.total_cases > 0 ? (summary.statistics.high_quality/summary.statistics.total_cases*100).toFixed(1) : 0}%)`);
  
  console.log(`\n📍 By Province/Territory:`);
  for (const [prov, count] of Object.entries(summary.statistics.by_province).sort((a,b) => b[1] - a[1])) {
    console.log(`  ${prov}: ${count}`);
  }
  
  console.log(`\n🎯 Flywheel Readiness:`);
  console.log(`  Templates: ${summary.flywheel_readiness.ready_for_templates} cases`);
  console.log(`  Evidence: ${summary.flywheel_readiness.ready_for_evidence_analysis} cases`);
  console.log(`  Patterns: ${summary.flywheel_readiness.ready_for_pattern_analysis} cases`);
  
  if (summary.errors.total > 0) {
    console.log(`\n⚠️  Errors: ${summary.errors.total} total`);
    for (const [type, count] of Object.entries(summary.errors.by_type)) {
      console.log(`  ${type}: ${count}`);
    }
  }
  
  console.log(`\n📋 Full report: ${summaryFile}\n`);
  
  return summary;
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 CanLII Scraper v5.0-Enhanced');
  console.log('   Full Canada Coverage | Safety First | Data Quality');
  console.log('='.repeat(60));
  
  // Pre-flight checks
  if (!performPreFlightChecks()) {
    process.exit(1);
  }
  
  // Parse command-line arguments
  const args = process.argv.slice(2);
  let targetTribunals = Object.keys(TRIBUNALS);
  
  if (args.includes('--tribunals')) {
    const tribunalsArg = args[args.indexOf('--tribunals') + 1];
    if (tribunalsArg) {
      targetTribunals = tribunalsArg.split(',').map(t => t.trim());
    }
  }

  if (args.includes('--max-search-pages')) {
    const pageCapArg = args[args.indexOf('--max-search-pages') + 1];
    const parsedCap = Number.parseInt(pageCapArg, 10);
    if (Number.isFinite(parsedCap) && parsedCap > 0) {
      MAX_SEARCH_PAGES = parsedCap;
    }
  }

  if (args.includes('--max-cases')) {
    const maxCasesArg = args[args.indexOf('--max-cases') + 1];
    const parsedCases = Number.parseInt(maxCasesArg, 10);
    if (Number.isFinite(parsedCases) && parsedCases > 0) {
      MAX_CASES = parsedCases;
    }
  }
  
  console.log(`\n📋 Target Tribunals: ${targetTribunals.join(', ')}`);
  console.log(`📊 Total: ${targetTribunals.length} tribunals`);
  console.log(`📄 Search page cap per term: ${Number.isFinite(MAX_SEARCH_PAGES) ? MAX_SEARCH_PAGES : 'none'}`);
  console.log(`🧪 Max cases to extract: ${Number.isFinite(MAX_CASES) ? MAX_CASES : 'none'}\n`);
  
  const allDecisions = [];
  
  for (const tribunalId of targetTribunals) {
    const config = TRIBUNALS[tribunalId];
    if (!config) {
      console.error(`⚠️  Unknown tribunal: ${tribunalId}`);
      continue;
    }
    
    try {
      const decisions = await scrapeTribunalBatched(tribunalId, config);
      allDecisions.push(...decisions);
      
      // Save tribunal file
      if (decisions.length > 0) {
        const filename = `${tribunalId}-historical-${new Date().toISOString().split('T')[0]}.json`;
        const filepath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(filepath, JSON.stringify(decisions, null, 2));
        console.log(`💾 Saved: ${filename} (${decisions.length} decisions)\n`);
      }
      
    } catch (error) {
      if (error.message === 'RATE_LIMITED') {
        console.error(`\n❌ Stopping: API quota exceeded`);
        console.error(`💾 Progress saved. Resumable with: node ${path.basename(__filename)} --tribunals=${targetTribunals.slice(targetTribunals.indexOf(tribunalId)).join(',')}\n`);
        break;
      }
      console.error(`❌ Error scraping ${tribunalId}: ${error.message}\n`);
    }
  }
  
  // Generate session summary
  if (allDecisions.length > 0) {
    generateSessionSummary(allDecisions);
  }
  
  console.log('🎉 Scraping session complete!\n');
}

// Run
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main };
