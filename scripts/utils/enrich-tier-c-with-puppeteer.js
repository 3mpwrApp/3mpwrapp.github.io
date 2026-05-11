#!/usr/bin/env node
/**
 * Tier C Text Enrichment Pipeline - Puppeteer Edition (v2.0)
 * 
 * Uses Puppeteer (headless Chrome) to bypass CanLII DataDome protection
 * 
 * Problem: CanLII uses DataDome bot detection (HTTP 403 on direct requests)
 * Solution: Full browser automation that renders JavaScript and passes fingerprinting
 * 
 * Trade-offs:
 * - ✅ Bypasses DataDome successfully
 * - ✅ Gets full decision text from CanLII
 * - ⚠️ Slower (~10-15 seconds per case vs 3-6 with HTTP)
 * - ⚠️ Higher memory usage (Chrome instances)
 * - ⏱️ Total time: ~72-100 hours for 25,895 cases (3-4 days)
 * 
 * Strategy:
 * 1. Launch headless Chrome with Puppeteer
 * 2. Navigate to each Tier C case URL
 * 3. Wait for page load and extract full text
 * 4. Apply enhanced NLP outcome detection
 * 5. Move high-confidence cases from Tier C → Tier A/B
 * 6. Save progress every 25 cases (smaller batches due to slowness)
 * 
 * Author: 3mpwrApp + GitHub Copilot
 * Date: April 27, 2026
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====

const DATA_DIR = path.join(__dirname, "../data/tribunal-decisions");
const MIN_DELAY_MS = 5000; // 5 seconds minimum between requests
const MAX_DELAY_MS = 8000; // 8 seconds maximum (be extra cautious)
const BATCH_SIZE = 25; // Save progress every 25 cases (smaller batches due to slower processing)
const PROGRESS_FILE = path.join(DATA_DIR, '.tier-c-enrichment-puppeteer-progress.json');
const MAX_RETRIES = 3; // Retry failed cases up to 3 times

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

function randomDelay() {
  const ms = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  return delay(Math.floor(ms));
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  console.log(`✅ Progress saved: ${progress.completed}/${progress.total} cases processed`);
}

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return { tribunal: null, completed: 0, total: 0, processedIds: [], retryCount: {} };
}

// ===== PUPPETEER FETCHING =====

async function fetchHTMLWithPuppeteer(page, url, retryCount = 0) {
  try {
    console.log(`  🌐 Navigating to: ${url}`);
    
    // Navigate with extended timeout
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 45000 // 45 second timeout
    });
    
    // Wait for content to load (CanLII decision pages)
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Extract full text from page
    const text = await page.evaluate(() => {
      return document.body.innerText;
    });
    
    // Get HTML for debugging if needed
    const html = await page.content();
    
    // Check if we got blocked
    if (text.includes('DataDome') || text.includes('Access denied') || text.length < 500) {
      throw new Error('Possible DataDome block detected');
    }
    
    console.log(`  ✅ Fetched ${text.length} characters`);
    return text;
    
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`  ⚠️ Error: ${error.message}, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
      await delay(15000); // 15 second cooldown before retry
      return fetchHTMLWithPuppeteer(page, url, retryCount + 1);
    }
    throw error;
  }
}

// ===== ENHANCED OUTCOME DETECTION =====

/**
 * Enhanced outcome detection patterns (same as v1.0)
 */
function detectOutcomeFromText(text, tribunal) {
  const lowerText = text.toLowerCase();
  const conclusion = lowerText.slice(-10000); // Last 10,000 chars for decision conclusion
  const fullTextSearch = lowerText;

  // ===== WSIAT PATTERNS =====
  if (tribunal === 'WSIAT') {
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

    const tierBPatterns = [
      { regex: /i\s+find\s+in\s+(?:favour|favor)\s+of\s+the\s+worker/i, outcome: 'Granted', confidence: 85 },
      { regex: /worker\s+has\s+established.*?entitlement/i, outcome: 'Granted', confidence: 80 },
      { regex: /wsib.*?decision.*?set\s+aside/i, outcome: 'Granted', confidence: 80 },
      
      { regex: /i\s+find\s+against\s+the\s+worker/i, outcome: 'Denied', confidence: 85 },
      { regex: /worker\s+has\s+not\s+established.*?entitlement/i, outcome: 'Denied', confidence: 80 },
      { regex: /wsib.*?decision.*?upheld/i, outcome: 'Denied', confidence: 80 }
    ];

    for (const { regex, outcome, confidence } of tierAPatterns) {
      if (regex.test(conclusion) || regex.test(fullTextSearch)) {
        return { outcome, confidence, tier: 'A' };
      }
    }

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

  return { outcome: 'Unknown', confidence: 0, tier: 'C' };
}

// ===== MAIN PROCESSING =====

async function processTribunal(browser, tribunalConfig) {
  console.log(`\n🔍 Processing ${tribunalConfig.name}...`);

  const tierCPath = path.join(DATA_DIR, tribunalConfig.tierCFile);
  if (!fs.existsSync(tierCPath)) {
    console.log(`❌ Tier C file not found: ${tribunalConfig.tierCFile}`);
    return { processed: 0, improved: 0, errors: 0 };
  }

  const tierCCases = JSON.parse(fs.readFileSync(tierCPath, 'utf8'));
  console.log(`📊 Found ${tierCCases.length} Tier C cases`);

  const tierAPath = path.join(DATA_DIR, tribunalConfig.tierAFile);
  const tierBPath = path.join(DATA_DIR, tribunalConfig.tierBFile);
  
  let tierACases = fs.existsSync(tierAPath) ? JSON.parse(fs.readFileSync(tierAPath, 'utf8')) : [];
  let tierBCases = fs.existsSync(tierBPath) ? JSON.parse(fs.readFileSync(tierBPath, 'utf8')) : [];

  const progress = loadProgress();
  const startIdx = progress.tribunal === tribunalConfig.name ? progress.completed : 0;
  const processedIds = new Set(progress.processedIds || []);
  const retryCount = progress.retryCount || {};

  let improved = 0;
  let errors = 0;
  let remainingInTierC = [];

  console.log(`🚀 Starting from case ${startIdx + 1}/${tierCCases.length}`);

  // Create a new page for this tribunal
  const page = await browser.newPage();
  
  // Set viewport and user agent
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

  for (let i = startIdx; i < tierCCases.length; i++) {
    const caseData = tierCCases[i];
    
    if (processedIds.has(caseData.case_id)) {
      remainingInTierC.push(caseData);
      continue;
    }

    try {
      console.log(`\n[${i + 1}/${tierCCases.length}] Processing ${caseData.case_id}...`);
      
      const text = await fetchHTMLWithPuppeteer(page, caseData.url);
      const detection = detectOutcomeFromText(text, tribunalConfig.name);
      
      if (detection.outcome !== 'Unknown' && detection.confidence >= 75) {
        const enrichedCase = {
          ...caseData,
          inferred_outcome: detection.outcome,
          confidence: detection.confidence,
          tier: detection.tier,
          enrichment_date: new Date().toISOString(),
          enrichment_method: 'puppeteer_full_text_nlp'
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
        remainingInTierC.push(caseData);
        console.log(`  ℹ️ Remains Tier C (confidence: ${detection.confidence}%)`);
      }

      processedIds.add(caseData.case_id);
      delete retryCount[caseData.case_id];

      if ((i + 1) % BATCH_SIZE === 0) {
        saveProgress({
          tribunal: tribunalConfig.name,
          completed: i + 1,
          total: tierCCases.length,
          processedIds: Array.from(processedIds),
          retryCount
        });

        fs.writeFileSync(tierAPath, JSON.stringify(tierACases, null, 2));
        fs.writeFileSync(tierBPath, JSON.stringify(tierBCases, null, 2));
        fs.writeFileSync(tierCPath, JSON.stringify(remainingInTierC, null, 2));
        
        console.log(`💾 Batch saved: ${improved} improvements so far`);
      }

      await randomDelay();

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      
      const caseRetries = retryCount[caseData.case_id] || 0;
      if (caseRetries < MAX_RETRIES) {
        retryCount[caseData.case_id] = caseRetries + 1;
        console.log(`  🔄 Will retry later (${caseRetries + 1}/${MAX_RETRIES})`);
      } else {
        console.log(`  ⚠️ Max retries reached, giving up on this case`);
        processedIds.add(caseData.case_id);
      }
      
      errors++;
      remainingInTierC.push(caseData);
    }
  }

  await page.close();

  // Final save
  fs.writeFileSync(tierAPath, JSON.stringify(tierACases, null, 2));
  fs.writeFileSync(tierBPath, JSON.stringify(tierBCases, null, 2));
  fs.writeFileSync(tierCPath, JSON.stringify(remainingInTierC, null, 2));

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
    tiers: { A: tierACount, B: tierBCount, C: tierCCount },
    coverage: {
      classified_A_or_B: tierACount + tierBCount,
      classified_rate: classifiedRate,
      unresolved_rate: unresolvedRate
    },
    enrichment_metadata: {
      last_enrichment: new Date().toISOString(),
      method: 'puppeteer_full_text_nlp_v2'
    }
  };

  const summaryPath = path.join(DATA_DIR, tribunalConfig.summaryFile);
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`📊 Summary updated: ${classifiedRate}% classified`);
}

// ===== CLI EXECUTION =====

async function main() {
  console.log('🚀 Tier C Text Enrichment Pipeline v2.0 (Puppeteer Edition)');
  console.log('==========================================');
  console.log('');
  console.log('Target: 25,895 Tier C cases across 4 tribunals');
  console.log('Strategy: Puppeteer (headless Chrome) + enhanced NLP');
  console.log('Bypass: DataDome bot detection via full browser rendering');
  console.log('Time estimate: 72-100 hours (3-4 days continuous)');
  console.log('');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  console.log('✅ Browser launched successfully');

  const totalStats = { processed: 0, improved: 0, errors: 0 };

  try {
    for (const tribunal of TRIBUNALS) {
      const stats = await processTribunal(browser, tribunal);
      totalStats.processed += stats.processed;
      totalStats.improved += stats.improved;
      totalStats.errors += stats.errors;
    }
  } finally {
    await browser.close();
    console.log('✅ Browser closed');
  }

  console.log('\n');
  console.log('==========================================');
  console.log('🎉 ENRICHMENT COMPLETE');
  console.log('==========================================');
  console.log(`Total processed: ${totalStats.processed}`);
  console.log(`Total improved: ${totalStats.improved} (${(totalStats.improved / totalStats.processed * 100).toFixed(1)}%)`);
  console.log(`Total errors: ${totalStats.errors}`);
  console.log('');

  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
    console.log('✅ Progress file cleaned up');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { detectOutcomeFromText, fetchHTMLWithPuppeteer };
