#!/usr/bin/env node
/**
 * 🔬 COMPREHENSIVE ONWSIB SCRAPER (2020-2026)
 * Ontario Workplace Safety and Insurance Board - First Level Decisions
 * 
 * CRITICAL DATASET: Original WSIB claim decisions (before WSIAT appeals)
 * Focus: Initial denial patterns, pre-existing condition denials at source
 * Compare to: WSIAT appeals (13.31% pre-existing rate)
 * 
 * Output: Year-by-year JSON files with enhanced metadata
 * onwsib-2020-complete.json
 * onwsib-2021-complete.json
 * ... through 2026
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 18, 2026
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====
const CANLII_BASE = "https://api.canlii.org/v1";
const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";
const OUTPUT_DIR = path.join(__dirname, '../data/tribunal-decisions');
const DEFAULT_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const DELAY_MS = 15000; // 15 seconds between requests (avoid CanLII throttling)
const MAX_RETRIES = 3;
const MODE = process.env.ONWSIB_MODE || 'scrape'; // scrape | deep-dive | coverage-audit
const APPLY_RECLASSIFICATION = process.env.APPLY_RECLASSIFICATION === '1';
const PREDICTION_MIN_CONFIDENCE = Number(process.env.ONWSIB_PRED_MIN_CONF || '0.55');
const OBSERVED_COUNTS = {
  2020: 0,
  2021: 49,
  2022: 149,
  2023: 120,
  2024: 73,
  2025: 64,
  2026: 8
};

function parseYears() {
  const raw = process.env.ONWSIB_YEARS;
  if (!raw) return DEFAULT_YEARS;
  const parsed = raw
    .split(',')
    .map((y) => Number(y.trim()))
    .filter((y) => Number.isInteger(y) && y >= 2020 && y <= 2026);
  return parsed.length > 0 ? parsed : DEFAULT_YEARS;
}

const YEARS = parseYears();
const FORCE_RESCRAPE = process.env.ONWSIB_FORCE_RESCRAPE === '1';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ===== HELPER FUNCTIONS =====

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function asKeywordArray(keywords) {
  if (Array.isArray(keywords)) return keywords.filter(Boolean);
  if (typeof keywords === 'string') {
    return keywords.split(';').map(k => k.trim()).filter(Boolean);
  }
  return [];
}

function toDecisionText(caseData, html) {
  const title = (caseData?.title || '').toLowerCase();
  const keywordsApi = asKeywordArray(caseData?.keywords_api || caseData?.keywords || '').join(' ').toLowerCase();
  const text = (html || '').toLowerCase();
  return `${title}\n${keywordsApi}\n${text}`;
}

function manualReviewSignalScore(decision) {
  const text = toDecisionText(decision, decision.full_text_html || '');
  let score = 0;
  if (/entitled\s+to/i.test(text)) score += 4;
  if (/denied\s+entitlement|benefits\s+denied|is\s+denied/i.test(text)) score += 4;
  if (/allowed|dismissed|upheld|rescinded/i.test(text)) score += 3;
  if (/\|/.test(text)) score += 2; // often mixed issue summaries
  if ((decision.keywords_api || []).join(' ').length > 180) score += 1;
  return score;
}

function classifyOnwsibOutcome(caseData, html) {
  const text = toDecisionText(caseData, html);

  const positive = [
    /appeal\s+is\s+allowed/i,
    /appeal\s+allowed/i,
    /entitlement\s+allowed/i,
    /initial\s+entitlement\s+allowed/i,
    /worker\s+is\s+entitled\s+to/i,
    /entitled\s+to\s+(benefits|full\s+loss|re-employment\s+payments)/i,
    /benefits\s+are\s+payable/i,
    /balance\s+of\s+probabilities\s+met/i,
    /decision\s+is\s+rescinded/i,
    /decision\s+varied\s+in\s+favour/i
  ];

  const negative = [
    /appeal\s+is\s+dismissed/i,
    /appeal\s+dismissed/i,
    /appeal\s+is\s+denied/i,
    /benefits\s+denied/i,
    /ongoing\s+\w+\s+benefits\s+denied/i,
    /denied\s+entitlement/i,
    /entitlement\s+.*\s+is\s+denied/i,
    /worker\s+is\s+not\s+entitled/i,
    /no\s+entitlement\s+to/i,
    /decision\s+(is\s+)?upheld/i,
    /decision\s+remains\s+in\s+effect/i,
    /request\s+is\s+denied/i,
    /\sis\sdenied/i
  ];

  const partial = [
    /appeal\s+allowed\s+in\s+part/i,
    /partially\s+allowed/i,
    /granted\s+in\s+part/i,
    /part\s+of\s+the\s+decision\s+is\s+varied/i
  ];

  const procedural = [
    /referred\s+back\s+to\s+wsib/i,
    /matter\s+is\s+remitted/i,
    /returned\s+to\s+the\s+board/i,
    /new\s+decision\s+required/i,
    /withdrawn/i,
    /abandoned/i,
    /interim\s+decision/i,
    /adjourned/i,
    /procedural\s+order/i,
    /extension\s+of\s+time/i,
    /reconsideration/i
  ];

  const positiveHits = positive.filter((p) => p.test(text));
  const negativeHits = negative.filter((p) => p.test(text));
  const partialHits = partial.filter((p) => p.test(text));
  const proceduralHits = procedural.filter((p) => p.test(text));

  if (partialHits.length > 0) {
    return {
      outcome: 'Allowed - Partial',
      confidence: 'high',
      evidence: partialHits[0].toString()
    };
  }

  if (positiveHits.length > 0 && negativeHits.length > 0) {
    return {
      outcome: 'Mixed / Partially Allowed',
      confidence: 'medium',
      evidence: `${positiveHits[0].toString()} + ${negativeHits[0].toString()}`
    };
  }

  if (positiveHits.length > 0) {
    return {
      outcome: 'Allowed - Full',
      confidence: 'high',
      evidence: positiveHits[0].toString()
    };
  }

  if (negativeHits.length > 0) {
    return {
      outcome: 'Denied - Upheld',
      confidence: 'high',
      evidence: negativeHits[0].toString()
    };
  }

  if (proceduralHits.length > 0) {
    return {
      outcome: 'Interim / Procedural',
      confidence: 'low',
      evidence: proceduralHits[0].toString()
    };
  }

  return {
    outcome: 'Unknown',
    confidence: 'low',
    evidence: 'no-pattern-match'
  };
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.includes('QUOTA_EXCE') || data.includes('THROTTLED') || data.includes('quota')) {
          reject(new Error('QUOTA_EXCEEDED'));
          return;
        }

        try {
          const parsed = JSON.parse(data);
          
          // 🆕 Detect CanLII quota exceeded
          if (parsed.error && (parsed.error.includes('QUOTA') || parsed.error.includes('THROTTLED') || parsed.error.includes('quota'))) {
            reject(new Error('QUOTA_EXCEEDED'));
            return;
          } else {
            resolve(parsed);
          }
        } catch (e) {
          // Check if it's a quota error in malformed JSON
          if (data.includes('QUOTA_EXCE') || data.includes('THROTTLED') || data.includes('quota')) {
            reject(new Error('QUOTA_EXCEEDED'));
          } else {
            console.error(`  ⚠️  JSON parse error: ${e.message}`);
            reject(new Error(`JSON parse error: ${e.message}`));
          }
        }
      });
    }).on('error', reject);
  });
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await httpsGet(url);
      return response;
    } catch (error) {
      if (attempt < retries) {
        console.log(`  ⚠️  Attempt ${attempt}/${retries} failed: ${error.message}`);
        await delay(DELAY_MS * attempt); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}

// ===== CASE LIST FETCHING =====

async function fetchYearCaseList(year) {
  console.log(`\n📅 Fetching ONWSIB case list for ${year}...`);
  
  const allCases = [];
  let offset = 0;
  const resultCount = 1000; // Max results per request
  
  while (true) {
    const params = new URLSearchParams({
      api_key: CANLII_API_KEY,
      offset: offset.toString(),
      resultCount: resultCount.toString(),
      decisionDateAfter: `${year}-01-01`,
      decisionDateBefore: year === 2026 ? '2026-12-31' : `${year + 1}-01-01`
    });
    
    const url = `${CANLII_BASE}/caseBrowse/en/onwsib/?${params}`;
    
    console.log(`  🔍 Fetching offset ${offset} (batch size: ${resultCount})`);
    
    try {
      const response = await fetchWithRetry(url);
      const cases = response.cases || [];
      
      if (cases.length === 0) {
        console.log(`  ✓ No more cases found`);
        break;
      }
      
      console.log(`  📦 Retrieved ${cases.length} cases`);
      allCases.push(...cases);
      
      offset += cases.length;
      
      // If we got fewer than requested, we've reached the end
      if (cases.length < resultCount) {
        console.log(`  ✓ Reached end of results`);
        break;
      }
      
      await delay(DELAY_MS);
      
    } catch (error) {
      console.error(`  ❌ Error fetching case list: ${error.message}`);
      break;
    }
  }
  
  console.log(`  ✓ Total cases for ${year}: ${allCases.length}`);
  return allCases;
}

// ===== FULL DECISION TEXT FETCHING =====

async function fetchFullDecision(caseId) {
  const params = new URLSearchParams({ api_key: CANLII_API_KEY });
  const url = `${CANLII_BASE}/caseBrowse/en/onwsib/${caseId}/?${params}`;
  
  try {
    const response = await fetchWithRetry(url);
    return response;
  } catch (error) {
    console.error(`    ⚠️  Error fetching ${caseId}: ${error.message}`);
    return null;
  }
}

// ===== TEXT EXTRACTION & ANALYSIS =====

function extractKeywords(html) {
  if (!html) return [];
  const text = html.toLowerCase();
  
  const keywordGroups = {
    grounds: [
      'disability', 'mental health', 'physical disability', 'chronic illness',
      'addiction', 'ptsd', 'depression', 'anxiety', 'bipolar', 'schizophrenia',
      'autism', 'adhd', 'learning disability', 'mobility', 'wheelchair',
      'chronic pain', 'fibromyalgia', 'crohn', 'diabetes', 'epilepsy',
      'visual impairment', 'hearing impairment', 'deaf', 'blind'
    ],
    areas: [
      'employment', 'housing', 'services', 'goods', 'facilities', 'contracts',
      'accommodation', 'vocational association'
    ],
    outcomes: [
      'dismissed', 'allowed', 'granted', 'settled', 'withdrawn', 
      'deferred', 'no jurisdiction', 'abandoned', 'public interest remedy'
    ],
    legal_tests: [
      'accommodation', 'undue hardship', 'prima facie', 'bona fide',
      'adverse effect', 'direct discrimination', 'constructive discrimination',
      'poisoned environment', 'discrimination by association'
    ],
    remedies: [
      'compensation', 'reinstatement', 'damages', 'monetary award',
      'public interest remedy', 'costs', 'lost wages', 'injury to dignity'
    ],
    issues: [
      'termination', 'dismissal', 'constructive dismissal', 'harassment',
      'failure to accommodate', 'eviction', 'denial of service',
      'refusal to hire', 'demotion', 'suspension'
    ]
  };
  
  const found = [];
  for (const [category, terms] of Object.entries(keywordGroups)) {
    for (const term of terms) {
      if (text.includes(term)) {
        found.push({ category, term });
      }
    }
  }
  
  return found;
}

// 🆕 ENHANCED: Extract outcome from keyword summaries (works without full text!)
function extractOutcomeFromKeywords(keywords) {
  if (!keywords || keywords.length === 0) return null;
  
  const keywordText = keywords.join(' ').toLowerCase();
  
  // Check for outcomes in keyword summaries
  if (keywordText.includes('application dismissed') || keywordText.includes('application is dismissed')) {
    return 'Dismissed - No Violation';
  }
  if (keywordText.includes('application allowed') || keywordText.includes('application is granted') || 
      keywordText.includes('code violation found')) {
    return 'Allowed - Violation Found';
  }
  if (keywordText.includes('settled') || keywordText.includes('minutes of settlement')) {
    return 'Settled';
  }
  if (keywordText.includes('withdrawn')) {
    return 'Withdrawn';
  }
  if (keywordText.includes('deferred')) {
    return 'Deferred';
  }
  if (keywordText.includes('no jurisdiction') || keywordText.includes('tribunal has no jurisdiction')) {
    return 'No Jurisdiction';
  }
  if (keywordText.includes('abandoned')) {
    return 'Abandoned';
  }
  if (keywordText.includes('interim decision') || keywordText.includes('interim order')) {
    return 'Interim Decision';
  }
  if (keywordText.includes('reconsideration')) {
    return 'Reconsideration';
  }
  if (keywordText.includes('costs')) {
    return 'Costs Decision';
  }
  
  return null; // Will fall back to extractOutcome
}

function extractOutcome(caseData, html) {
  const text = (html || '').toLowerCase();
  const title = (caseData.title || '').toLowerCase();
  
  // Order matters - check most specific first
  if (text.includes('application is allowed') || text.includes('application is granted')) {
    return 'Allowed - Violation Found';
  }
  if (text.includes('application is dismissed')) {
    return 'Dismissed - No Violation';
  }
  if (text.includes('settled') || text.includes('minutes of settlement')) {
    return 'Settled';
  }
  if (text.includes('withdrawn')) {
    return 'Withdrawn';
  }
  if (text.includes('deferred to') || text.includes('deferred pending')) {
    return 'Deferred';
  }
  if (text.includes('no jurisdiction') || text.includes('lack of jurisdiction')) {
    return 'No Jurisdiction';
  }
  if (text.includes('abandoned') || text.includes('abandonment')) {
    return 'Abandoned';
  }
  if (title.includes('interim') || text.includes('interim decision')) {
    return 'Interim Decision';
  }
  if (text.includes('request for reconsideration')) {
    return 'Reconsideration Request';
  }
  
  return 'Unknown';
}

function hasDisabilityGround(caseData, html, keywords) {
  const text = (html || '').toLowerCase();
  const title = (caseData.title || '').toLowerCase();
  const keywordsStr = (caseData.keywords || '').toLowerCase();
  
  const disabilityTerms = [
    'disability', 'mental health', 'physical', 'chronic', 'illness',
    'addiction', 'ptsd', 'depression', 'anxiety', 'wheelchair',
    'accommodation', 'medical'
  ];
  
  return disabilityTerms.some(term => 
    text.includes(term) || title.includes(term) || keywordsStr.includes(term)
  ) || keywords.some(k => k.category === 'grounds');
}

// 🆕 ENHANCED: Extract legislation references from keyword text
function extractLegislationFromKeywords(keywords) {
  if (!keywords || keywords.length === 0) return [];
  
  const keywordText = keywords.join(' ');
  const legislation = [];
  
  // Pattern: "Human Rights Code, s. 5" or "Code, s. 34(1)" etc.
  const patterns = [
    /Workplace Safety and Insurance Act,\s*[\d]{4},\s*s\.\s*[\d]+/gi,
    /WSIA,\s*[\d]{4},\s*s\.\s*[\d]+/gi,
    /WSIA,\s*s\.\s*[\d]+/gi,
    /Act,\s*s\.\s*[\d]+/gi,
    /Regulation [\d]+\/[\d]+,\s*s\.\s*[\d]+/gi,
    /O\. Reg\. [\d]+\/[\d]+/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = keywordText.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Normalize "Act" to "Workplace Safety and Insurance Act"
        let normalized = match;
        if (match.startsWith('Act,') || match.startsWith('Act ')) {
          normalized = 'Workplace Safety and Insurance ' + match;
        }
        if (!legislation.includes(normalized)) {
          legislation.push(normalized);
        }
      });
    }
  });
  
  return legislation;
}

function parseDecision(caseData, fullData) {
  const html = fullData?.html || '';
  const keywords = extractKeywords(html);
  
  // Extract caseId (can be string or {en: "xxx", fr: "yyy"})
  let caseId = fullData?.caseId || caseData.caseId;
  if (typeof caseId === 'object' && caseId !== null) {
    caseId = caseId.en || caseId.fr || 'unknown';
  }
  
  // Extract keywords as array (API returns semicolon-delimited string)
  const keywordsApi = (caseData.keywords || fullData?.keywords || '').split(';').map(k => k.trim()).filter(k => k);
  
  // 🆕 Extract legislation from keywords text
  const legislation = extractLegislationFromKeywords(keywordsApi);
  
  // ONWSIB-specific outcome parsing (stronger than generic HRTO rules)
  const deepOutcome = classifyOnwsibOutcome({
    ...caseData,
    keywords_api: keywordsApi
  }, html);
  const outcomeFromKeywords = extractOutcomeFromKeywords(keywordsApi);
  const resolvedOutcome = deepOutcome.outcome !== 'Unknown'
    ? deepOutcome.outcome
    : (outcomeFromKeywords || extractOutcome(fullData || caseData, html));
  
  return {
    case_id: caseId || 'unknown',
    title: caseData.title || fullData?.title || 'Untitled',
    citation: caseData.citation || fullData?.citation || '',
    decision_date: fullData?.decisionDate || caseData.decisionDate || 'Unknown',
    docket_number: fullData?.docketNumber || caseData.docketNumber || '',
    url: fullData?.url || caseData.url || `https://canlii.ca/t/${caseId}`,
    
    // Keywords
    keywords_api: keywordsApi,
    keywords_extracted: keywords,
    
    // 🆕 ENHANCED: Legislation referenced (parsed from keywords)
    legislation_cited: legislation,
    legislation_count: legislation.length,
    
    // Analysis
    outcome: resolvedOutcome,
    outcome_confidence: deepOutcome.confidence,
    outcome_evidence: deepOutcome.evidence,
    has_disability_ground: hasDisabilityGround(caseData, html, keywords),
    
    // Full text
    full_text_html: html,
    full_text_length: html.length,
    
    // Metadata
    tribunal: "Ontario Workplace Safety and Insurance Board",
    database: "onwsib",
    scraped_at: new Date().toISOString(),
    
    // Data quality
    data_quality: {
      has_full_text: !!html,
      has_keywords: keywords.length > 0,
      has_outcome: resolvedOutcome !== 'Unknown',
      has_legislation: legislation.length > 0
    }
  };
}

function enhanceExistingDecision(decision) {
  const html = decision.full_text_html || '';
  const deepOutcome = classifyOnwsibOutcome(decision, html);
  const priorOutcome = decision.outcome || 'Unknown';
  const upgradedOutcome = priorOutcome === 'Unknown' && deepOutcome.outcome !== 'Unknown'
    ? deepOutcome.outcome
    : priorOutcome;

  return {
    ...decision,
    outcome: upgradedOutcome,
    outcome_deep_dive: deepOutcome.outcome,
    outcome_confidence: deepOutcome.confidence,
    outcome_evidence: deepOutcome.evidence,
    deep_dive_reviewed_at: new Date().toISOString(),
    data_quality: {
      ...(decision.data_quality || {}),
      has_outcome: upgradedOutcome !== 'Unknown'
    }
  };
}

function loadPredictionMapForYear(year) {
  const predFile = path.join(OUTPUT_DIR, `onwsib-${year}-complete-predicted-outcomes.json`);
  if (!fs.existsSync(predFile)) return new Map();
  const rows = JSON.parse(fs.readFileSync(predFile, 'utf8'));
  const map = new Map();
  rows.forEach((r) => {
    if (r.case_id) {
      map.set(r.case_id, {
        outcome: r.outcome,
        confidence: typeof r.outcome_confidence === 'number' ? r.outcome_confidence : 0,
        method: r.outcome_method || 'ml_prediction'
      });
    }
  });
  return map;
}

function applyPrediction(decision, prediction) {
  if (!prediction) return decision;
  const canPromote =
    (decision.outcome || 'Unknown') === 'Unknown' &&
    prediction.confidence >= PREDICTION_MIN_CONFIDENCE;

  return {
    ...decision,
    predicted_outcome: prediction.outcome,
    predicted_confidence: prediction.confidence,
    predicted_method: prediction.method,
    outcome: canPromote ? `Predicted - ${prediction.outcome}` : decision.outcome,
    outcome_confidence: canPromote ? 'low' : decision.outcome_confidence,
    outcome_evidence: canPromote
      ? `ml:${prediction.method}:${prediction.confidence.toFixed(3)}`
      : decision.outcome_evidence,
    data_quality: {
      ...(decision.data_quality || {}),
      has_outcome: canPromote ? true : (decision.data_quality?.has_outcome || false)
    }
  };
}

// ===== MAIN SCRAPING LOGIC =====

async function scrapeYear(year) {
  console.log('\n' + '='.repeat(70));
  console.log(`📊 SCRAPING ONWSIB DECISIONS FOR ${year}`);
  console.log('='.repeat(70));
  
  const outputFile = path.join(OUTPUT_DIR, `onwsib-${year}-complete.json`);
  const progressFile = path.join(OUTPUT_DIR, `.progress-onwsib-${year}.json`);
  const existingDecisions = fs.existsSync(outputFile) && !FORCE_RESCRAPE
    ? JSON.parse(fs.readFileSync(outputFile, 'utf8'))
    : [];
  
  // Check if already completed
  if (fs.existsSync(outputFile) && !FORCE_RESCRAPE) {
    console.log(`✓ ${year} already scraped: ${existingDecisions.length} cases`);
    console.log(`  To re-scrape, delete: ${outputFile}`);
    return existingDecisions;
  }

  if (fs.existsSync(outputFile) && FORCE_RESCRAPE) {
    console.log(`♻️  Force re-scrape enabled for ${year}`);
  }
  
  // Load progress if exists
  let progress = { completed: [], failed: [] };
  if (fs.existsSync(progressFile) && !FORCE_RESCRAPE) {
    progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    console.log(`📂 Resuming: ${progress.completed.length} completed, ${progress.failed.length} failed`);
  } else if (fs.existsSync(progressFile) && FORCE_RESCRAPE) {
    console.log(`🧹 Ignoring saved progress for ${year}; refetching all selected cases`);
  }
  
  // Step 1: Get case list
  const caseList = await fetchYearCaseList(year);
  
  if (caseList.length === 0) {
    console.log(`⚠️  No cases found for ${year}`);
    fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
    return [];
  }
  
  // Step 2: Fetch full text for each case
  const decisionsById = new Map(existingDecisions.map((decision) => [decision.case_id, decision]));
  const completedIds = new Set([
    ...progress.completed,
    ...existingDecisions.map((decision) => decision.case_id)
  ]);
  
  console.log(`\n📄 Fetching full text for ${caseList.length} cases...`);
  
  for (let i = 0; i < caseList.length; i++) {
    const caseData = caseList[i];
    let caseId = caseData.caseId;
    
    // Handle {en: "xxx"} format
    if (typeof caseId === 'object' && caseId !== null) {
      caseId = caseId.en || caseId.fr || `case_${i}`;
    }
    
    // Skip if already completed
    if (completedIds.has(caseId)) {
      continue;
    }
    
    const progress_pct = ((i + 1) / caseList.length * 100).toFixed(1);
    console.log(`  [${i + 1}/${caseList.length}] (${progress_pct}%) Fetching ${caseId}...`);
    
    try {
      const fullData = await fetchFullDecision(caseId);
      
      if (fullData) {
        const parsed = parseDecision(caseData, fullData);
        
        // 🎯 FILTER: Only include decisions from 2020-2026
        const decisionYear = parsed.decision_date ? parseInt(parsed.decision_date.substring(0, 4)) : null;
        if (decisionYear && (decisionYear < 2020 || decisionYear > 2026)) {
          console.log(`    ⏭️  Skipping ${caseId} - decision year ${decisionYear} outside 2020-2026 range`);
          if (!completedIds.has(caseId)) {
            progress.completed.push(caseId);
            completedIds.add(caseId);
          }
          continue;
        }
        decisionsById.set(parsed.case_id, parsed);
        if (!completedIds.has(caseId)) {
          progress.completed.push(caseId);
          completedIds.add(caseId);
        }
        
        // Log disabilities found
        if (parsed.has_disability_ground) {
          const grounds = parsed.keywords_extracted.filter(k => k.category === 'grounds').map(k => k.term);
          console.log(`    ✓ Disability case: ${grounds.join(', ')}`);
        }
      } else {
        console.log(`    ⚠️  No data returned`);
        progress.failed.push(caseId);
      }
      
      // Save progress every 10 cases
      if ((i + 1) % 10 === 0) {
        fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
        console.log(`    💾 Progress saved (${progress.completed.length} completed)`);
      }
      
      await delay(DELAY_MS);
      
    } catch (error) {
      // 🆕 QUOTA EXCEEDED - Save progress and exit gracefully
      if (error.message === 'QUOTA_EXCEEDED') {
        console.log('\n' + '⚠️ '.repeat(35));
        console.log('🚫 CanLII API QUOTA EXCEEDED');
        console.log('⚠️ '.repeat(35));
        console.log('\n📊 Progress Update:');
        console.log(`  ✅ Successfully collected: ${decisionsById.size} cases`);
        console.log(`  📁 Progress saved to: ${progressFile}`);
        console.log(`  ⏸️  Stopped at: ${i + 1}/${caseList.length} (${progress_pct}%)`);
        console.log('\n⏰ Next Steps:');
        console.log('  1. CanLII quota resets at midnight UTC or after 24 hours');
        console.log('  2. Run the same command tomorrow to resume:');
        console.log(`     node ${path.basename(__filename)}`);
        console.log('  3. Collection will automatically resume at case ${i + 1}');
        console.log('\n💡 Alternative: Start a different tribunal (ONSBT/HRTO)');
        console.log('   (uses same quota, but different dataset)');
        console.log('\n');
        
        // Save what we have so far
        fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
        if (decisionsById.size > 0) {
          const partialFile = outputFile.replace('.json', '-PARTIAL.json');
          fs.writeFileSync(partialFile, JSON.stringify(Array.from(decisionsById.values()), null, 2));
          console.log(`💾 Partial results saved to: ${partialFile}`);
        }
        
        process.exit(0); // Exit gracefully
      }
      
      console.error(`    ❌ Error: ${error.message}`);
      progress.failed.push(caseId);
    }
  }

  const decisions = caseList
    .map((caseData, index) => {
      let caseId = caseData.caseId;
      if (typeof caseId === 'object' && caseId !== null) {
        caseId = caseId.en || caseId.fr || `case_${index}`;
      }
      return decisionsById.get(caseId);
    })
    .filter(Boolean);
  
  // Save final output
  fs.writeFileSync(outputFile, JSON.stringify(decisions, null, 2));
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
  
  console.log(`\n✓ ${year} complete: ${decisions.length} cases saved`);
  console.log(`  Disability cases: ${decisions.filter(d => d.has_disability_ground).length}`);
  console.log(`  Failed: ${progress.failed.length}`);
  console.log(`  Output: ${outputFile}`);
  
  return decisions;
}

async function runDeepDiveLocal() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║  🔎 ONWSIB DEEP-DIVE MODE (LOCAL ONLY, NO API CALLS)             ║');
  console.log('║  Reclassifies existing files with ONWSIB-specific outcome rules   ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🛡️  API-safe mode: YES (safe to run while ONCA scraper is active)`);
  console.log();

  const summary = [];
  const manualQueue = [];

  for (const year of YEARS) {
    const inputFile = path.join(OUTPUT_DIR, `onwsib-${year}-complete.json`);
    const outputFile = APPLY_RECLASSIFICATION
      ? inputFile
      : path.join(OUTPUT_DIR, `onwsib-${year}-complete-deep-dive.json`);

    if (!fs.existsSync(inputFile)) {
      summary.push({ year, skipped: true, reason: 'missing-file' });
      continue;
    }

    const existing = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const predictions = loadPredictionMapForYear(year);
    const beforeKnown = existing.filter(d => (d.outcome || 'Unknown') !== 'Unknown').length;
    const enhanced = existing
      .map(enhanceExistingDecision)
      .map((d) => applyPrediction(d, predictions.get(d.case_id)));
    const afterKnown = enhanced.filter(d => (d.outcome || 'Unknown') !== 'Unknown').length;

    fs.writeFileSync(outputFile, JSON.stringify(enhanced, null, 2));

    summary.push({
      year,
      total: existing.length,
      beforeKnown,
      afterKnown,
      netGain: afterKnown - beforeKnown,
      predMinConfidence: PREDICTION_MIN_CONFIDENCE,
      outputFile: path.basename(outputFile)
    });

    enhanced
      .filter((d) => (d.outcome || 'Unknown') === 'Unknown')
      .map((d) => ({
        year,
        case_id: d.case_id,
        title: d.title,
        url: d.url,
        signal_score: manualReviewSignalScore(d),
        keywords_api: d.keywords_api,
        predicted_outcome: d.predicted_outcome || null,
        predicted_confidence: d.predicted_confidence || null
      }))
      .filter((d) => d.signal_score > 0)
      .forEach((d) => manualQueue.push(d));

    console.log(`✅ ${year}: known outcomes ${beforeKnown} → ${afterKnown} (net +${afterKnown - beforeKnown})`);
  }

  const summaryFile = path.join(OUTPUT_DIR, 'onwsib-deep-dive-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify({
    generated_at: new Date().toISOString(),
    mode: APPLY_RECLASSIFICATION ? 'in-place' : 'sidecar',
    summary
  }, null, 2));

  const queueFile = path.join(OUTPUT_DIR, 'onwsib-manual-review-queue-top100.json');
  const topQueue = manualQueue
    .sort((a, b) => {
      if (b.signal_score !== a.signal_score) return b.signal_score - a.signal_score;
      return (b.predicted_confidence || 0) - (a.predicted_confidence || 0);
    })
    .slice(0, 100);
  fs.writeFileSync(queueFile, JSON.stringify({
    generated_at: new Date().toISOString(),
    pred_min_confidence: PREDICTION_MIN_CONFIDENCE,
    total_candidates: manualQueue.length,
    top_100: topQueue
  }, null, 2));

  console.log();
  console.log(`📄 Deep-dive summary saved: ${summaryFile}`);
  console.log(`📄 Manual review queue saved: ${queueFile}`);
  if (!APPLY_RECLASSIFICATION) {
    console.log('ℹ️  Original files preserved. Use APPLY_RECLASSIFICATION=1 to overwrite originals.');
  }
}

async function runCoverageAudit() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║  📊 ONWSIB COVERAGE AUDIT MODE (LOCAL ONLY, NO API CALLS)        ║');
  console.log('║  Compares local records vs observed CanLII year counts            ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log();

  const report = [];
  let localTotal = 0;
  let observedTotal = 0;

  for (const year of YEARS) {
    const localFile = path.join(OUTPUT_DIR, `onwsib-${year}-complete.json`);
    const localCount = fs.existsSync(localFile)
      ? JSON.parse(fs.readFileSync(localFile, 'utf8')).length
      : 0;
    const observedCount = OBSERVED_COUNTS[year] || 0;
    const gap = observedCount - localCount;

    localTotal += localCount;
    observedTotal += observedCount;

    report.push({
      year,
      local_count: localCount,
      observed_canlii_count: observedCount,
      gap,
      status: gap === 0 ? 'aligned' : (gap > 0 ? 'missing-local-records' : 'local-exceeds-observed')
    });
  }

  const out = {
    generated_at: new Date().toISOString(),
    mode: 'coverage-audit',
    totals: {
      local_total: localTotal,
      observed_total: observedTotal,
      net_gap: observedTotal - localTotal
    },
    by_year: report
  };

  const outFile = path.join(OUTPUT_DIR, 'onwsib-coverage-gap-report.json');
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));

  report.forEach((r) => {
    console.log(`${r.year}: local=${r.local_count}, observed=${r.observed_canlii_count}, gap=${r.gap}`);
  });
  console.log();
  console.log(`📄 Coverage report saved: ${outFile}`);
}

// ===== MAIN EXECUTION =====

async function main() {
  if (MODE === 'deep-dive') {
    await runDeepDiveLocal();
    return;
  }

  if (MODE === 'coverage-audit') {
    await runCoverageAudit();
    return;
  }

  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║  🔬 COMPREHENSIVE ONWSIB SCRAPER (2020-2026)                      ║');
  console.log('║  WSIB First-Level Decisions - Pre-existing Denial Patterns       ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`📅 Years to scrape: ${YEARS.join(', ')}`);
  console.log(`⏱️  Delay between requests: ${DELAY_MS}ms`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log();
  
  const allStats = [];
  
  for (const year of YEARS) {
    const startTime = Date.now();
    const decisions = await scrapeYear(year);
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    const stats = {
      year,
      total: decisions.length,
      disability_cases: decisions.filter(d => d.has_disability_ground).length,
      with_full_text: decisions.filter(d => d.data_quality.has_full_text).length,
      outcomes: {},
      duration_minutes: duration
    };
    
    // Count outcomes
    decisions.forEach(d => {
      stats.outcomes[d.outcome] = (stats.outcomes[d.outcome] || 0) + 1;
    });
    
    allStats.push(stats);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 SCRAPING SUMMARY');
  console.log('='.repeat(70));
  
  let totalCases = 0;
  let totalDisability = 0;
  
  allStats.forEach(stats => {
    totalCases += stats.total;
    totalDisability += stats.disability_cases;
    
    console.log(`\n${stats.year}:`);
    console.log(`  Total cases: ${stats.total.toLocaleString()}`);
    console.log(`  Disability cases: ${stats.disability_cases} (${(stats.disability_cases / stats.total * 100).toFixed(1)}%)`);
    console.log(`  With full text: ${stats.with_full_text}`);
    console.log(`  Duration: ${stats.duration_minutes} minutes`);
    console.log(`  Top outcomes:`);
    
    const sortedOutcomes = Object.entries(stats.outcomes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    sortedOutcomes.forEach(([outcome, count]) => {
      console.log(`    - ${outcome}: ${count}`);
    });
  });
  
  console.log('\n' + '='.repeat(70));
  console.log(`✓ COMPLETE: ${totalCases.toLocaleString()} total cases collected`);
  console.log(`  Disability cases: ${totalDisability} (${(totalDisability / totalCases * 100).toFixed(1)}%)`);
  console.log('='.repeat(70));
  
  // Save summary
  const summaryFile = path.join(OUTPUT_DIR, 'onwsib-scraping-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify({
    scrape_date: new Date().toISOString(),
    years: YEARS,
    stats: allStats,
    total_cases: totalCases,
    total_disability_cases: totalDisability
  }, null, 2));
  
  console.log(`\n📄 Summary saved: ${summaryFile}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { scrapeYear, main };
