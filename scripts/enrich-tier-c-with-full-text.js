#!/usr/bin/env node
/**
 * Tier C Text Enrichment Pipeline (v1.0)
 * 
 * Problem: 25,895 Tier C cases (74% of total) have Unknown outcomes
 * Cause: Only using CanLII API keywords, not full decision text
 * Solution: Fetch full text from existing URLs and run enhanced NLP
 * 
 * Strategy:
 * 1. Read Tier C cases from existing JSON files (no new scraping!)
 * 2. Fetch full decision text from stored URLs (CanLII public pages)
 * 3. Apply enhanced outcome detection patterns
 * 4. Update cases that match high-confidence patterns (Tier C → Tier A/B)
 * 5. Generate updated 3-tier summary files
 * 
 * Rate Limiting:
 * - 2-second delay between requests (respectful scraping)
 * - Resume capability if interrupted
 * - Progress tracking with ETA
 * 
 * Expected Results:
 * - WSIAT: 5.7% → 30-40% detection rate
 * - ONSBT: 27.1% → 40-50% detection rate
 * - ONWSIB: 4.6% → 20-30% detection rate
 * - HRTO: Already 49.8%, may improve to 55-60%
 * 
 * Author: 3mpwrApp + GitHub Copilot
 * Date: April 27, 2026
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====

const DATA_DIR = path.join(__dirname, "../data/tribunal-decisions");
const DELAY_MS = 2000; // 2 seconds between requests
const BATCH_SIZE = 50; // Process in batches, save progress every 50 cases
const PROGRESS_FILE = path.join(DATA_DIR, '.tier-c-enrichment-progress.json');

// Tribunals to process
const TRIBUNALS = [
  { 
    name: 'WSIAT',
    tierCFile: 'onwsiat-outcomes-tier-c-manual-review-queue.json',
    tierAFile: 'onwsiat-outcomes-tier-a-high-precision.json',
    tierBFile: 'onwsiat-outcomes-tier-b-medium-confidence.json',
    summaryFile: 'onwsiat-outcomes-3-tier-summary.json'
  },
  { 
    name: 'HRTO',
    tierCFile: 'onhrt-outcomes-tier-c-manual-review-queue.json',
    tierAFile: 'onhrt-outcomes-tier-a-high-precision.json',
    tierBFile: 'onhrt-outcomes-tier-b-medium-confidence.json',
    summaryFile: 'onhrt-outcomes-3-tier-summary.json'
  },
  { 
    name: 'ONSBT',
    tierCFile: 'onsbt-outcomes-tier-c-manual-review-queue.json',
    tierAFile: 'onsbt-outcomes-tier-a-high-precision.json',
    tierBFile: 'onsbt-outcomes-tier-b-medium-confidence.json',
    summaryFile: 'onsbt-outcomes-3-tier-summary.json'
  },
  { 
    name: 'ONWSIB',
    tierCFile: 'onwsib-outcomes-tier-c-manual-review-queue.json',
    tierAFile: 'onwsib-outcomes-tier-a-high-precision.json',
    tierBFile: 'onwsib-outcomes-tier-b-medium-confidence.json',
    summaryFile: 'onwsib-outcomes-3-tier-summary.json'
  }
];

// ===== UTILITIES =====

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  console.log(`✅ Progress saved: ${progress.completed}/${progress.total} cases processed`);
}

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return { tribunal: null, completed: 0, total: 0, processedIds: [] };
}

// ===== HTML FETCHING =====

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    // Extract just the path from canlii.ca URL
    const urlObj = new URL(url);
    const options = {
      hostname: 'www.canlii.org',
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'User-Agent': '3mpwrApp Research Bot (+https://3mpwrapp.ca) - Public Access to Justice Project',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };

    https.get(options, (res) => {
      if (res.statusCode === 429) {
        reject(new Error('RATE_LIMIT'));
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// ===== ENHANCED OUTCOME DETECTION =====

/**
 * Enhanced outcome detection patterns for all 4 Ontario tribunals
 * Based on actual decision language patterns
 */
function detectOutcomeFromText(html, tribunal) {
  // Strip HTML tags and normalize whitespace
  const text = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const lowerText = text.toLowerCase();

  // Focus on decision conclusion (last 10,000 characters typically contain disposition)
  const conclusion = lowerText.slice(-10000);
  const fullTextSearch = lowerText;

  // ===== WSIAT PATTERNS =====
  if (tribunal === 'WSIAT') {
    // Tier A patterns (High confidence - 95%+)
    const tierAPatterns = [
      { regex: /the\s+appeal\s+is\s+(?:hereby\s+)?allowed/i, outcome: 'Granted', confidence: 95 },
      { regex: /decision:\s*(?:the\s+)?appeal\s+(?:is\s+)?allowed/i, outcome: 'Granted', confidence: 95 },
      { regex: /conclusion:.*?appeal\s+(?:is\s+)?allowed/i, outcome: 'Granted', confidence: 95 },
      
      { regex: /the\s+appeal\s+is\s+(?:hereby\s+)?dismissed/i, outcome: 'Denied', confidence: 95 },
      { regex: /decision:\s*(?:the\s+)?appeal\s+(?:is\s+)?dismissed/i, outcome: 'Denied', confidence: 95 },
      { regex: /conclusion:.*?appeal\s+(?:is\s+)?dismissed/i, outcome: 'Denied', confidence: 95 },
      
      { regex: /the\s+appeal\s+is\s+(?:hereby\s+)?adjourned/i, outcome: 'Deferred', confidence: 90 },
      { regex: /appeal\s+(?:is\s+)?deemed\s+withdrawn/i, outcome: 'Deferred', confidence: 90 },
      { regex: /this\s+appeal\s+is\s+inactive/i, outcome: 'Deferred', confidence: 90 }
    ];

    // Tier B patterns (Medium confidence - 75-85%)
    const tierBPatterns = [
      { regex: /i\s+find\s+in\s+(?:favour|favor)\s+of\s+the\s+worker/i, outcome: 'Granted', confidence: 85 },
      { regex: /worker\s+has\s+established.*?entitlement/i, outcome: 'Granted', confidence: 80 },
      { regex: /wsib.*?decision.*?set\s+aside/i, outcome: 'Granted', confidence: 80 },
      
      { regex: /i\s+find\s+against\s+the\s+worker/i, outcome: 'Denied', confidence: 85 },
      { regex: /worker\s+has\s+not\s+established.*?entitlement/i, outcome: 'Denied', confidence: 80 },
      { regex: /wsib.*?decision.*?upheld/i, outcome: 'Denied', confidence: 80 }
    ];

    // Check Tier A first
    for (const { regex, outcome, confidence } of tierAPatterns) {
      if (regex.test(conclusion) || regex.test(fullTextSearch)) {
        return { outcome, confidence, tier: 'A' };
      }
    }

    // Then Tier B
    for (const { regex, outcome, confidence } of tierBPatterns) {
      if (regex.test(conclusion)) {
        return { outcome, confidence, tier: 'B' };
      }
    }
  }

  // ===== HRTO PATTERNS =====
  if (tribunal === 'HRTO') {
    const tierAPatterns = [
      { regex: /the\s+application\s+is\s+(?:hereby\s+)?dismissed/i, outcome: 'Denied', confidence: 95 },
      { regex: /application\s+(?:is\s+)?dismissed\s+without\s+a\s+hearing/i, outcome: 'Denied', confidence: 95 },
      { regex: /application.*?deemed\s+(?:to\s+be\s+)?withdrawn/i, outcome: 'Deferred', confidence: 95 },
      { regex: /application.*?abandoned/i, outcome: 'Deferred', confidence: 95 },
      
      { regex: /application\s+(?:is\s+)?allowed/i, outcome: 'Granted', confidence: 95 },
      { regex: /respondent.*?found\s+to\s+have\s+discriminated/i, outcome: 'Granted', confidence: 90 }
    ];

    const tierBPatterns = [
      { regex: /email.*?undeliverable/i, outcome: 'Deferred', confidence: 85 },
      { regex: /deadline.*?not\s+met/i, outcome: 'Deferred', confidence: 80 },
      { regex: /no\s+reasonable\s+prospect\s+of\s+success/i, outcome: 'Denied', confidence: 85 }
    ];

    for (const { regex, outcome, confidence } of tierAPatterns) {
      if (regex.test(conclusion)) {
        return { outcome, confidence, tier: 'A' };
      }
    }

    for (const { regex, outcome, confidence } of tierBPatterns) {
      if (regex.test(conclusion)) {
        return { outcome, confidence, tier: 'B' };
      }
    }
  }

  // ===== ONSBT PATTERNS =====
  if (tribunal === 'ONSBT') {
    const tierAPatterns = [
      { regex: /the\s+appeal\s+is\s+(?:hereby\s+)?allowed/i, outcome: 'Granted', confidence: 95 },
      { regex: /decision:\s*appeal\s+allowed/i, outcome: 'Granted', confidence: 95 },
      { regex: /appellant.*?is\s+a\s+person\s+with\s+a\s+disability/i, outcome: 'Granted', confidence: 90 },
      
      { regex: /the\s+appeal\s+is\s+(?:hereby\s+)?dismissed/i, outcome: 'Denied', confidence: 95 },
      { regex: /decision:\s*appeal\s+dismissed/i, outcome: 'Denied', confidence: 95 },
      { regex: /appellant.*?is\s+not\s+a\s+person\s+with\s+a\s+disability/i, outcome: 'Denied', confidence: 90 },
      
      { regex: /appeal\s+(?:is\s+)?adjourned/i, outcome: 'Deferred', confidence: 90 }
    ];

    const tierBPatterns = [
      { regex: /substantial\s+impairment.*?demonstrated/i, outcome: 'Granted', confidence: 85 },
      { regex: /evidence.*?supports.*?disability/i, outcome: 'Granted', confidence: 80 },
      { regex: /insufficient\s+evidence.*?disability/i, outcome: 'Denied', confidence: 85 }
    ];

    for (const { regex, outcome, confidence } of tierAPatterns) {
      if (regex.test(conclusion)) {
        return { outcome, confidence, tier: 'A' };
      }
    }

    for (const { regex, outcome, confidence } of tierBPatterns) {
      if (regex.test(conclusion)) {
        return { outcome, confidence, tier: 'B' };
      }
    }
  }

  // ===== ONWSIB PATTERNS =====
  if (tribunal === 'ONWSIB') {
    const tierAPatterns = [
      { regex: /decision:\s*(?:the\s+)?review\s+(?:is\s+)?granted/i, outcome: 'Granted', confidence: 95 },
      { regex: /the\s+review\s+is\s+(?:hereby\s+)?granted/i, outcome: 'Granted', confidence: 95 },
      { regex: /original\s+decision.*?overturned/i, outcome: 'Granted', confidence: 90 },
      
      { regex: /decision:\s*(?:the\s+)?review\s+(?:is\s+)?denied/i, outcome: 'Denied', confidence: 95 },
      { regex: /the\s+review\s+is\s+(?:hereby\s+)?denied/i, outcome: 'Denied', confidence: 95 },
      { regex: /original\s+decision.*?upheld/i, outcome: 'Denied', confidence: 90 }
    ];

    for (const { regex, outcome, confidence } of tierAPatterns) {
      if (regex.test(conclusion)) {
        return { outcome, confidence, tier: 'A' };
      }
    }
  }

  // No match found
  return { outcome: 'Unknown', confidence: 0, tier: 'C' };
}

// ===== MAIN PROCESSING =====

async function processTribunal(tribunalConfig) {
  console.log(`\n🔍 Processing ${tribunalConfig.name}...`);

  // Load Tier C cases
  const tierCPath = path.join(DATA_DIR, tribunalConfig.tierCFile);
  if (!fs.existsSync(tierCPath)) {
    console.log(`❌ Tier C file not found: ${tribunalConfig.tierCFile}`);
    return { processed: 0, improved: 0, errors: 0 };
  }

  const tierCCases = JSON.parse(fs.readFileSync(tierCPath, 'utf8'));
  console.log(`📊 Found ${tierCCases.length} Tier C cases`);

  // Load existing Tier A and B
  const tierAPath = path.join(DATA_DIR, tribunalConfig.tierAFile);
  const tierBPath = path.join(DATA_DIR, tribunalConfig.tierBFile);
  
  let tierACases = fs.existsSync(tierAPath) ? JSON.parse(fs.readFileSync(tierAPath, 'utf8')) : [];
  let tierBCases = fs.existsSync(tierBPath) ? JSON.parse(fs.readFileSync(tierBPath, 'utf8')) : [];

  // Load progress
  const progress = loadProgress();
  const startIdx = progress.tribunal === tribunalConfig.name ? progress.completed : 0;
  const processedIds = new Set(progress.processedIds || []);

  let improved = 0;
  let errors = 0;
  let remainingInTierC = [];

  console.log(`🚀 Starting from case ${startIdx + 1}/${tierCCases.length}`);

  for (let i = startIdx; i < tierCCases.length; i++) {
    const caseData = tierCCases[i];
    
    // Skip if already processed
    if (processedIds.has(caseData.case_id)) {
      remainingInTierC.push(caseData);
      continue;
    }

    try {
      console.log(`\n[${i + 1}/${tierCCases.length}] Processing ${caseData.case_id}...`);
      
      // Fetch full text
      const html = await fetchHTML(caseData.url);
      
      // Detect outcome
      const detection = detectOutcomeFromText(html, tribunalConfig.name);
      
      if (detection.outcome !== 'Unknown' && detection.confidence >= 75) {
        // Move to appropriate tier
        const enrichedCase = {
          ...caseData,
          inferred_outcome: detection.outcome,
          confidence: detection.confidence,
          tier: detection.tier,
          enrichment_date: new Date().toISOString(),
          enrichment_method: 'full_text_nlp'
        };

        if (detection.tier === 'A') {
          tierACases.push(enrichedCase);
          console.log(`  ✅ Tier C → A: ${detection.outcome} (${detection.confidence}% confidence)`);
        } else if (detection.tier === 'B') {
          tierBCases.push(enrichedCase);
          console.log(`  ✅ Tier C → B: ${detection.outcome} (${detection.confidence}% confidence)`);
        }
        
        improved++;
      } else {
        // Stay in Tier C
        remainingInTierC.push(caseData);
        console.log(`  ℹ️ Remains Tier C (confidence: ${detection.confidence}%)`);
      }

      processedIds.add(caseData.case_id);

      // Save progress every BATCH_SIZE cases
      if ((i + 1) % BATCH_SIZE === 0) {
        saveProgress({
          tribunal: tribunalConfig.name,
          completed: i + 1,
          total: tierCCases.length,
          processedIds: Array.from(processedIds)
        });

        // Save updated tier files
        fs.writeFileSync(tierAPath, JSON.stringify(tierACases, null, 2));
        fs.writeFileSync(tierBPath, JSON.stringify(tierBCases, null, 2));
        fs.writeFileSync(tierCPath, JSON.stringify(remainingInTierC, null, 2));
        
        console.log(`💾 Batch saved: ${improved} improvements so far`);
      }

      // Rate limiting
      await delay(DELAY_MS);

    } catch (error) {
      if (error.message === 'RATE_LIMIT') {
        console.log(`⚠️ Rate limit hit! Waiting 60 seconds...`);
        await delay(60000);
        i--; // Retry this case
        continue;
      }

      console.log(`  ❌ Error: ${error.message}`);
      errors++;
      remainingInTierC.push(caseData);
    }
  }

  // Final save
  fs.writeFileSync(tierAPath, JSON.stringify(tierACases, null, 2));
  fs.writeFileSync(tierBPath, JSON.stringify(tierBCases, null, 2));
  fs.writeFileSync(tierCPath, JSON.stringify(remainingInTierC, null, 2));

  // Update summary
  updateSummary(tribunalConfig, tierACases.length, tierBCases.length, remainingInTierC.length);

  console.log(`\n✅ ${tribunalConfig.name} Complete:`);
  console.log(`   - Processed: ${tierCCases.length} cases`);
  console.log(`   - Improved: ${improved} cases moved from Tier C`);
  console.log(`   - Errors: ${errors}`);
  console.log(`   - New Tier A: ${tierACases.length}`);
  console.log(`   - New Tier B: ${tierBCases.length}`);
  console.log(`   - Remaining Tier C: ${remainingInTierC.length}`);

  return { processed: tierCCases.length, improved, errors };
}

function updateSummary(tribunalConfig, tierACount, tierBCount, tierCCount) {
  const totalCases = tierACount + tierBCount + tierCCount;
  const classifiedRate = ((tierACount + tierBCount) / totalCases * 100).toFixed(1);
  const unresolvedRate = (tierCCount / totalCases * 100).toFixed(1);

  const summary = {
    created_at: new Date().toISOString(),
    total_cases: totalCases,
    tiers: {
      A: tierACount,
      B: tierBCount,
      C: tierCCount
    },
    coverage: {
      classified_A_or_B: tierACount + tierBCount,
      classified_rate: classifiedRate,
      unresolved_rate: unresolvedRate
    },
    enrichment_metadata: {
      last_enrichment: new Date().toISOString(),
      method: 'full_text_nlp_v1'
    }
  };

  const summaryPath = path.join(DATA_DIR, tribunalConfig.summaryFile);
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`📊 Summary updated: ${classifiedRate}% classified (was lower before enrichment)`);
}

// ===== CLI EXECUTION =====

async function main() {
  console.log('🚀 Tier C Text Enrichment Pipeline v1.0');
  console.log('==========================================');
  console.log('');
  console.log('Target: 25,895 Tier C cases across 4 tribunals');
  console.log('Strategy: Fetch full text + enhanced NLP');
  console.log('Rate limit: 2-second delay between requests');
  console.log('');

  const totalStats = { processed: 0, improved: 0, errors: 0 };

  for (const tribunal of TRIBUNALS) {
    const stats = await processTribunal(tribunal);
    totalStats.processed += stats.processed;
    totalStats.improved += stats.improved;
    totalStats.errors += stats.errors;
  }

  console.log('\n');
  console.log('==========================================');
  console.log('🎉 ENRICHMENT COMPLETE');
  console.log('==========================================');
  console.log(`Total processed: ${totalStats.processed}`);
  console.log(`Total improved: ${totalStats.improved} (${(totalStats.improved / totalStats.processed * 100).toFixed(1)}%)`);
  console.log(`Total errors: ${totalStats.errors}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Review updated tier files');
  console.log('2. Run: node scripts/build-outcome-tiers-multi.js (regenerate consolidated summaries)');
  console.log('3. Deploy updated data to app');
  console.log('');

  // Clean up progress file
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
    console.log('✅ Progress file cleaned up');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { detectOutcomeFromText, fetchHTML };
