#!/usr/bin/env node
/**
 * 🔬 FULL TEXT EXTRACTOR
 * Enriches existing HRTO and WSIAT data with full decision text
 * 
 * Strategy:
 * 1. Load existing JSON files (cases without full text)
 * 2. Fetch full text via CanLII API using caseCitator endpoint
 * 3. Extract text content from HTML
 * 4. Update JSON files with enriched data
 * 
 * FIXED: Uses CanLII API (not web scraping which gets 403)
 * 
 * Priority: Top 500 abandoned HRTO cases + Top 500 WSIAT cases
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
const DELAY_MS = 15000; // 15 seconds between requests (CanLII rate limit)
const BATCH_SIZE = 50; // Save progress every 50 cases
const MAX_RETRIES = 3;

// Input files (from detective analysis)
const INPUT_FILES = [
  path.join(DETECTIVE_DIR, 'hrto-abandoned-top500-recent.json'),
  path.join(DETECTIVE_DIR, 'wsiat-top500-recent.json')
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

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': '3mpwrApp Research Tool (contact: empowrapp08162025@gmail.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };
    
    client.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }
      
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const html = await fetchUrl(url);
      return html;
    } catch (error) {
      if (attempt < retries) {
        console.log(`    ⚠️  Retry ${attempt}/${retries}: ${error.message}`);
        await delay(DELAY_MS * attempt); // Exponential backoff
      } else {
        throw error;
      }
    }
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

async function enrichCase(caseData, index, total) {
  const progress_pct = ((index + 1) / total * 100).toFixed(1);
  console.log(`  [${index + 1}/${total}] (${progress_pct}%) ${caseData.case_id}...`);
  
  // Skip if already has full text
  if (caseData.full_text_html && caseData.full_text_html.length > 1000) {
    console.log(`    ✓ Already has full text (${caseData.full_text_html.length} chars)`);
    return caseData;
  }
  
  if (!caseData.url) {
    console.log(`    ⚠️  No URL available`);
    return { ...caseData, enrichment_status: 'no_url' };
  }
  
  try {
    console.log(`    → Fetching: ${caseData.url}`);
    const html = await fetchWithRetry(caseData.url);
    const text = extractTextFromHtml(html);
    
    // Enhanced analysis with full text
    const hasDisability = detectDisabilityGround(text);
    const abandonmentReasons = caseData.outcome === 'Abandoned' ? 
      extractAbandonmentReason(text, caseData) : null;
    
    console.log(`    ✓ Extracted ${text.length} chars of text`);
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

async function enrichDataset(inputFile, outputFile, datasetName) {
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
  
  for (let i = 0; i < cases.length; i++) {
    if (i < startIndex) {
      // Load from existing output if available
      if (fs.existsSync(outputFile)) {
        const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
        enriched.push(existing[i]);
      }
      continue;
    }
    
    const enrichedCase = await enrichCase(cases[i], i, cases.length);
    enriched.push(enrichedCase);
    
    // Save progress every BATCH_SIZE cases
    if ((i + 1) % BATCH_SIZE === 0 || i === cases.length - 1) {
      // Ensure output directory exists
      const outDir = path.dirname(outputFile);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      
      fs.writeFileSync(outputFile, JSON.stringify(enriched, null, 2));
      fs.writeFileSync(progressFile, JSON.stringify({ last_index: i }, null, 2));
      console.log(`    💾 Progress saved (${enriched.length}/${cases.length} cases)`);
    }
    
    // Delay between requests
    if (i < cases.length - 1) {
      await delay(DELAY_MS);
    }
  }
  
  // Generate summary statistics
  const stats = {
    total: enriched.length,
    with_full_text: enriched.filter(c => c.full_text_length > 1000).length,
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
}

// ===== MAIN EXECUTION =====

async function main() {
  console.log('█'.repeat(80));
  console.log('🔬 FULL TEXT EXTRACTION ENGINE');
  console.log('Enriching HRTO & WSIAT datasets with decision text');
  console.log('█'.repeat(80));
  
  // Enrich HRTO abandoned cases
  if (fs.existsSync(INPUT_FILES[0])) {
    await enrichDataset(
      INPUT_FILES[0],
      OUTPUT_FILES.hrto,
      'HRTO Abandoned Cases (Top 500)'
    );
  }
  
  // Enrich WSIAT cases
  if (fs.existsSync(INPUT_FILES[1])) {
    await enrichDataset(
      INPUT_FILES[1],
      OUTPUT_FILES.wsiat,
      'WSIAT Cases (Top 500)'
    );
  }
  
  console.log('\n' + '█'.repeat(80));
  console.log('✅ FULL TEXT EXTRACTION COMPLETE');
  console.log('█'.repeat(80));
  console.log('\n🎯 NEXT STEPS:');
  console.log('  1. Review enriched datasets for disability cases');
  console.log('  2. Analyze abandonment reasons from full text');
  console.log('  3. Extract specific language patterns for blog post');
  console.log('  4. Compare HRTO vs WSIAT decision language');
}

main().catch(err => {
  console.error('❌ Enrichment failed:', err);
  process.exit(1);
});
