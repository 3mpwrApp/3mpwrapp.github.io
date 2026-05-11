#!/usr/bin/env node
/**
 * 🔬 FULL TEXT EXTRACTOR (FIXED)
 * Enriches existing HRTO and WSIAT data with full decision text
 * 
 * Strategy:
 * 1. Load existing JSON files (cases without full text)
 * 2. Fetch full text via CanLII API (NOT web scraping - that gets 403!)
 * 3. Parse HTML from API response
 * 4. Update JSON files with enriched data
 * 
 * FIXED: Uses CanLII API with api_key parameter (no 403 errors)
 * 
 * Author: 3mpwrApp Research Team
 * Date: April 19, 2026
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====
const CANLII_BASE = "https://api.canlii.org/v1";
const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";
const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');
const DETECTIVE_DIR = path.join(DATA_DIR, 'detective-analysis');
const DELAY_MS = 15000; // 15 seconds between requests (CanLII rate limit - same as working scrapers)
const BATCH_SIZE = 25; // Save progress every 25 cases
const MAX_RETRIES = 3;

// Database codes
const DB_CODES = {
  hrto: 'onhrt',
  wsiat: 'onwsiat'
};

// Input files (from detective analysis)
const INPUT_FILES = [
  {
    path: path.join(DETECTIVE_DIR, 'hrto-abandoned-top500-recent.json'),
    outputKey: 'hrto',
    database: 'onhrt'
  },
  {
    path: path.join(DETECTIVE_DIR, 'wsiat-top500-recent.json'),
    outputKey: 'wsiat',
    database: 'onwsiat'
  }
];

// Output files
const OUTPUT_FILES = {
  hrto: path.join(DATA_DIR, 'deep-analysis', 'hrto-abandoned-enriched.json'),
  wsiat: path.join(DATA_DIR, 'deep-analysis', 'wsiat-enriched.json')
};

// ===== HELPER FUNCTIONS =====

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          // Detect CanLII quota exceeded
          if (parsed.error && parsed.error.includes('QUOTA')) {
            reject(new Error('QUOTA_EXCEEDED'));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          // Check if it's a quota error in malformed JSON
          if (data.includes('QUOTA_EXCE') || data.includes('quota')) {
            reject(new Error('QUOTA_EXCEEDED'));
          } else {
            reject(e);
          }
        }
      });
    }).on('error', reject);
  });
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const data = await httpsGet(url);
      return data;
    } catch (error) {
      if (error.message === 'QUOTA_EXCEEDED') {
        console.error('    ❌ CanLII API quota exceeded! Stopping.');
        throw error; // Don't retry quota errors
      }
      
      if (attempt < retries) {
        console.log(`    ⚠️  Retry ${attempt}/${retries}: ${error.message}`);
        await delay(DELAY_MS * attempt); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}

// Fetch full decision using CanLII API (same as working scrapers)
async function fetchFullDecision(caseId, database) {
  const params = new URLSearchParams({ api_key: CANLII_API_KEY });
  
  // Use caseBrowse endpoint (same as working scrapers)
  const url = `${CANLII_BASE}/caseBrowse/en/${database}/${caseId}/?${params}`;
  
  try {
    const response = await fetchWithRetry(url);
    return response;
  } catch (error) {
    console.error(`    ⚠️  Error fetching ${caseId}: ${error.message}`);
    return null;
  }
}

// Extract text content from HTML (simple approach)
function extractTextFromHtml(html) {
  if (!html) return '';
  
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Enhanced disability detection with full text
function detectDisabilityGround(text) {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  const disabilityTerms = [
    'disability', 'disabled', 'handicap', 'impairment',
    'mental health', 'mental illness', 'mental disorder',
    'physical disability', 'chronic illness', 'chronic condition',
    'addiction', 'substance abuse', 'alcoholism',
    'ptsd', 'post-traumatic stress', 'trauma',
    'depression', 'depressive', 'anxiety', 'anxious',
    'bipolar', 'schizophrenia', 'psychosis',
    'autism', 'autistic', 'asperger',
    'adhd', 'attention deficit', 'learning disability',
    'mobility', 'wheelchair', 'walker', 'cane',
    'chronic pain', 'fibromyalgia', 'arthritis',
    'crohn', 'colitis', 'diabetes', 'epilepsy', 'seizure',
    'visual impairment', 'blind', 'vision',
    'hearing impairment', 'deaf', 'hard of hearing',
    'accommodation', 'accommodated', 'undue hardship'
  ];
  
  return disabilityTerms.some(term => lowerText.includes(term));
}

// Extract abandonment reason from full text
function extractAbandonmentReason(text, caseData) {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  
  const reasons = [];
  
  // Email/service patterns
  if (lowerText.includes('undeliverable') || lowerText.includes('email not returned') || 
      lowerText.includes('returned as undeliverable') || lowerText.includes('email bounced')) {
    reasons.push('Email undeliverable');
  }
  
  if (lowerText.includes('failure to respond') || lowerText.includes('failed to respond') ||
      lowerText.includes('did not respond') || lowerText.includes('no response')) {
    reasons.push('Failure to respond to Tribunal');
  }
  
  if (lowerText.includes('missed deadline') || lowerText.includes('deadline expired') ||
      lowerText.includes('time limit') || lowerText.includes('did not file within')) {
    reasons.push('Missed deadline');
  }
  
  if (lowerText.includes('failed to attend mediation') || lowerText.includes('did not attend mediation') ||
      lowerText.includes('non-attendance at mediation')) {
    reasons.push('Failed to attend mediation');
  }
  
  if (lowerText.includes('non-compliance') || lowerText.includes('failed to comply') ||
      lowerText.includes('did not comply with')) {
    reasons.push('Non-compliance with Tribunal direction');
  }
  
  if (lowerText.includes('no contact') || lowerText.includes('unable to contact') ||
      lowerText.includes('lost contact')) {
    reasons.push('Lost contact');
  }
  
  return reasons.length > 0 ? reasons : null;
}

// ===== ENRICHMENT LOGIC =====

async function enrichCase(caseData, index, total, database) {
  const progress_pct = ((index + 1) / total * 100).toFixed(1);
  console.log(`  [${index + 1}/${total}] (${progress_pct}%) ${caseData.case_id}...`);
  
  // Skip if already has full text
  if (caseData.full_text_html && caseData.full_text_html.length > 1000) {
    console.log(`    ✓ Already has full text (${caseData.full_text_html.length} chars)`);
    return caseData;
  }
  
  try {
    console.log(`    → Fetching via CanLII API: ${database}/${caseData.case_id}`);
    const apiData = await fetchFullDecision(caseData.case_id, database);
    
    if (!apiData) {
      return { ...caseData, enrichment_status: 'api_failed' };
    }
    
    // Check if API response has HTML field
    const html = apiData.html || '';
    const text = extractTextFromHtml(html);
    
    if (html.length === 0) {
      console.log(`    ⚠️  API returned no HTML (empty response)`);
      // Log what fields ARE in the response for debugging
      console.log(`    📋 Available fields: ${Object.keys(apiData).join(', ')}`);
      return { 
        ...caseData, 
        enrichment_status: 'no_html_in_api',
        api_fields_found: Object.keys(apiData)
      };
    }
    
    // Enhanced analysis with full text
    const hasDisability = detectDisabilityGround(text);
    const abandonmentReasons = caseData.outcome === 'Abandoned' ? 
      extractAbandonmentReason(text, caseData) : null;
    
    console.log(`    ✓ Extracted ${text.length} chars of text (HTML: ${html.length} chars)`);
    if (hasDisability) console.log(`    ✓ Disability ground detected`);
    if (abandonmentReasons) console.log(`    ✓ Reasons: ${abandonmentReasons.join(', ')}`);
    
    return {
      ...caseData,
      full_text_html: html,
      full_text_plain: text,
      full_text_length: html.length,
      has_disability_ground: hasDisability || caseData.has_disability_ground,
      abandonment_reasons: abandonmentReasons,
      enrichment_status: 'success',
      enriched_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`    ❌ Error: ${error.message}`);
    return {
      ...caseData,
      enrichment_status: 'failed',
      enrichment_error: error.message
    };
  }
}

async function enrichDataset(inputConfig) {
  const { path: inputFile, outputKey, database } = inputConfig;
  const outputFile = OUTPUT_FILES[outputKey];
  const datasetName = `${outputKey.toUpperCase()} (${database})`;
  
  console.log('\n' + '='.repeat(80));
  console.log(`🔬 ENRICHING: ${datasetName}`);
  console.log('='.repeat(80));
  
  if (!fs.existsSync(inputFile)) {
    console.log(`⚠️  Input file not found: ${inputFile}`);
    return;
  }
  
  const cases = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  console.log(`✅ Loaded ${cases.length} cases`);
  
  // Check how many already have full text
  const withText = cases.filter(c => c.full_text_html && c.full_text_html.length > 1000).length;
  const needEnrichment = cases.length - withText;
  
  console.log(`📊 Status: ${withText} with text, ${needEnrichment} need enrichment`);
  
  if (needEnrichment === 0) {
    console.log(`✓ All cases already enriched!`);
    return;
  }
  
  const enriched = [];
  const progressFile = outputFile.replace('.json', '-progress.json');
  
  // Load progress if exists
  let startIndex = 0;
  if (fs.existsSync(progressFile)) {
    const progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    startIndex = progress.last_index + 1;
    console.log(`📂 Resuming from case ${startIndex + 1}`);
  }
  
  // Load existing output if available
  if (fs.existsSync(outputFile)) {
    const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    enriched.push(...existing);
  }
  
  for (let i = startIndex; i < cases.length; i++) {
    const enrichedCase = await enrichCase(cases[i], i, cases.length, database);
    
    if (i < enriched.length) {
      enriched[i] = enrichedCase;
    } else {
      enriched.push(enrichedCase);
    }
    
    // Save progress every BATCH_SIZE cases
    if ((i + 1) % BATCH_SIZE === 0 || i === cases.length - 1) {
      // Ensure output directory exists
      const outDir = path.dirname(outputFile);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      
      fs.writeFileSync(outputFile, JSON.stringify(enriched, null, 2));
      fs.writeFileSync(progressFile, JSON.stringify({ last_index: i }, null, 2));
      console.log(`    💾 Progress saved (${i + 1}/${cases.length} cases)`);
    }
    
    // Delay between requests (same as working scrapers)
    if (i < cases.length - 1) {
      await delay(DELAY_MS);
    }
  }
  
  // Generate summary statistics
  const stats = {
    total: enriched.length,
    with_full_text: enriched.filter(c => c.full_text_length > 1000).length,
    no_html_in_api: enriched.filter(c => c.enrichment_status === 'no_html_in_api').length,
    disability_cases: enriched.filter(c => c.has_disability_ground).length,
    abandoned_with_reasons: enriched.filter(c => c.abandonment_reasons && c.abandonment_reasons.length > 0).length,
    enrichment_failed: enriched.filter(c => c.enrichment_status === 'failed').length
  };
  
  console.log('\n📊 ENRICHMENT SUMMARY');
  console.log('-'.repeat(80));
  Object.entries(stats).forEach(([key, value]) => {
    console.log(`  ${key.replace(/_/g, ' ')}: ${value}`);
  });
  
  // Save summary
  const summaryFile = outputFile.replace('.json', '-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(stats, null, 2));
  
  console.log(`\n✅ Complete! Output: ${outputFile}`);
  console.log(`📋 Summary: ${summaryFile}`);
  
  // If many cases returned no HTML, that's the real issue
  if (stats.no_html_in_api > stats.total * 0.5) {
    console.log('\n⚠️  WARNING: Most cases returned no HTML from API!');
    console.log('   This means CanLII caseBrowse endpoint does NOT include HTML field.');
    console.log('   Need to find alternative CanLII API endpoint for full text.');
  }
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log('█'.repeat(80));
  console.log('🔬 FULL TEXT EXTRACTION ENGINE (FIXED - Uses CanLII API)');
  console.log('Enriching HRTO & WSIAT datasets with decision text via API (no 403!)');
  console.log('█'.repeat(80));
  console.log(`\n🔑 API Key: ${CANLII_API_KEY.substring(0, 10)}...`);
  console.log(`⏱️  Delay: ${DELAY_MS}ms between requests (same as working scrapers)`);
  
  for (const inputConfig of INPUT_FILES) {
    if (fs.existsSync(inputConfig.path)) {
      await enrichDataset(inputConfig);
    } else {
      console.log(`\n⚠️  Skipping ${inputConfig.outputKey}: Input file not found`);
    }
  }
  
  console.log('\n' + '█'.repeat(80));
  console.log('✅ FULL TEXT EXTRACTION COMPLETE');
  console.log('█'.repeat(80));
  console.log('\n🎯 NEXT STEPS:');
  console.log('  1. Check if API returned HTML (see summary stats)');
  console.log('  2. If no HTML in API: need to find different CanLII endpoint');
  console.log('  3. If has HTML: proceed with disability analysis & blog writing');
}

main().catch(err => {
  console.error('❌ Enrichment failed:', err);
  process.exit(1);
});
