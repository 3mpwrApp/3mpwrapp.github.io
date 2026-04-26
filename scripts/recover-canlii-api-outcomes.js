#!/usr/bin/env node

/**
 * ONSBT CanLII API Outcome Recovery (Correct Endpoint)
 * Re-queries CanLII caseBrowse endpoint for remaining unknown outcomes.
 * Extracts outcome from returned HTML text.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_BASE = 'https://api.canlii.org/v1';
const API_KEY = process.env.CANLII_API_KEY || '';

// Conservative rate limiting: 2 requests/sec
const RATE_LIMIT_MS = 500;
let lastRequestTime = 0;

/**
 * Delay between API requests
 */
async function rateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

/**
 * Generic GET helper
 */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else if (res.statusCode === 429) {
          reject(new Error('RATE_LIMITED'));
        } else {
          reject(new Error(`HTTP_${res.statusCode}`));
        }
      });
    }).on('error', reject);

    req.setTimeout(15000, () => {
      req.destroy(new Error('REQUEST_TIMEOUT'));
    });
  });
}

/**
 * Query CanLII caseBrowse endpoint for a case ID.
 */
async function queryCaseBrowse(database, caseId) {
  await rateLimit();

  if (!API_KEY || API_KEY === 'YOUR_FREE_API_KEY_HERE') {
    throw new Error('MISSING_API_KEY');
  }

  const url = `${API_BASE}/caseBrowse/en/${database}/${caseId}?api_key=${API_KEY}`;
  const data = await httpsGet(url);
  return JSON.parse(data);
}

/**
 * Extract outcome from plain text using outcome phrases.
 */
function extractOutcomeFromText(text) {
  if (!text || typeof text !== 'string') {
    return { outcome: 'Unknown', confidence: 0 };
  }

  if (/\bappeal\s+is\s+(?:hereby\s+)?allowed\b/i.test(text)) {
    return { outcome: 'Granted', confidence: 95 };
  }
  if (/\bappeal\s+is\s+(?:hereby\s+)?dismissed\b/i.test(text)) {
    return { outcome: 'Denied', confidence: 95 };
  }

  if (/\bdecision\s+is\s+(?:hereby\s+)?allowed\b/i.test(text) || /\bentitlement\s+is\s+(?:hereby\s+)?granted\b/i.test(text)) {
    return { outcome: 'Granted', confidence: 88 };
  }
  if (/\bdecision\s+is\s+(?:hereby\s+)?dismissed\b/i.test(text) || /\bentitlement\s+is\s+(?:hereby\s+)?denied\b/i.test(text)) {
    return { outcome: 'Denied', confidence: 88 };
  }

  if (/\bwithdrawn\b|\babandoned\b|\badjourned\b|\bdeferred\b/i.test(text)) {
    return { outcome: 'Deferred', confidence: 80 };
  }

  return { outcome: 'Unknown', confidence: 0 };
}

/**
 * Process unknown cases and attempt API recovery from caseBrowse HTML.
 */
async function recoverUnknownOutcomes() {
  const dataDir = path.join(__dirname, '..', 'data', 'tribunal-decisions');
  const sourceFile = path.join(dataDir, 'onsbt-2020-2026-with-inferred-outcomes.json');
  const checkpointFile = path.join(dataDir, '.onsbt-api-recovery-checkpoint.json');

  if (!fs.existsSync(sourceFile)) {
    console.error('Missing source dataset: onsbt-2020-2026-with-inferred-outcomes.json');
    process.exit(1);
  }

  const stats = {
    totalUnknown: 0,
    apiRecovered: 0,
    apiUnrecoverable: 0,
    byOutcome: { Granted: 0, Denied: 0, Deferred: 0 },
    errors: 0,
    rateLimited: 0,
  };

  const recoveredCases = [];
  const unknownCases = [];

  let checkpoint = { processed: 0, lastCaseId: null };
  if (fs.existsSync(checkpointFile)) {
    try {
      checkpoint = JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
    } catch (error) {
      // Ignore corrupted checkpoint and start fresh.
    }
  }

  console.log(`API Key available: ${API_KEY ? 'Yes' : 'No'}\n`);
  if (!API_KEY || API_KEY === 'YOUR_FREE_API_KEY_HERE') {
    console.error('CANLII_API_KEY is missing or placeholder.');
    process.exit(1);
  }

  console.log('Starting CanLII caseBrowse re-query for unknown ONSBT outcomes...\n');

  const allCases = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  const unknownTargets = allCases.filter((c) => c.inferred_outcome === 'Unknown');
  stats.totalUnknown = unknownTargets.length;

  console.log(`Unknown target cases: ${stats.totalUnknown}`);
  console.log(`Resuming from checkpoint index: ${checkpoint.processed}\n`);

  const startTime = Date.now();

  for (let i = checkpoint.processed; i < unknownTargets.length; i++) {
    const caseData = unknownTargets[i];
    try {
      const caseId = caseData.case_id;
      const response = await queryCaseBrowse('onsbt', caseId);
      const html = response?.html || '';
      const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
      const outcomeData = extractOutcomeFromText(text);

      if (outcomeData.outcome !== 'Unknown') {
        stats.apiRecovered++;
        stats.byOutcome[outcomeData.outcome]++;

        recoveredCases.push({
          case_id: caseData.case_id,
          citation: caseData.citation,
          url: caseData.url,
          docket_number: caseData.docket_number,
          inferred_outcome: outcomeData.outcome,
          recovery_method: 'canlii_caseBrowse_html',
          recovery_confidence: outcomeData.confidence,
        });
      } else {
        stats.apiUnrecoverable++;
        unknownCases.push({
          case_id: caseData.case_id,
          citation: caseData.citation,
          url: caseData.url,
          docket_number: caseData.docket_number,
          keywords_sample: caseData.keywords_api?.[0] || 'N/A',
        });
      }
    } catch (err) {
      if (err.message === 'RATE_LIMITED') {
        stats.rateLimited++;
      } else {
        stats.errors++;
      }

      stats.apiUnrecoverable++;
      unknownCases.push({
        case_id: caseData.case_id,
        citation: caseData.citation,
        url: caseData.url,
        docket_number: caseData.docket_number,
        error: err.message,
      });
    }

    const processedCount = i + 1;
    if (processedCount % 100 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = (processedCount / elapsed).toFixed(2);
      console.log(`  Processed: ${processedCount}/${stats.totalUnknown} (${rate} cases/sec, recovered: ${stats.apiRecovered})`);

      checkpoint = { processed: processedCount, lastCaseId: unknownTargets[i].case_id };
      fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2));
    }
  }

  // Generate report
  console.log(`\n\n📊 CanLII API RECOVERY REPORT\n`);
  console.log('='.repeat(70));
  console.log(`Total Unknown Cases: ${stats.totalUnknown}`);
  console.log(`Recovered via API: ${stats.apiRecovered} (${((stats.apiRecovered / stats.totalUnknown) * 100).toFixed(1)}%)`);
  console.log(`Still Unrecoverable: ${stats.apiUnrecoverable} (${((stats.apiUnrecoverable / stats.totalUnknown) * 100).toFixed(1)}%)\n`);

  console.log('API-Recovered Outcomes:');
  console.log(`  Granted: ${stats.byOutcome.Granted}`);
  console.log(`  Denied:  ${stats.byOutcome.Denied}`);
  console.log(`  Deferred: ${stats.byOutcome.Deferred}\n`);

  console.log('Errors:');
  console.log(`  Rate Limited: ${stats.rateLimited}`);
  console.log(`  Other Errors: ${stats.errors}\n`);

  // Save recovered cases
  const recoveredPath = path.join(
    dataDir,
    'onsbt-api-recovered-outcomes.json'
  );
  fs.writeFileSync(recoveredPath, JSON.stringify(recoveredCases, null, 2));
  console.log(`✅ API-recovered outcomes: onsbt-api-recovered-outcomes.json (${recoveredCases.length})`);

  // Save unrecoverable cases (candidates for web scraping)
  const unrecoverablePath = path.join(
    dataDir,
    'onsbt-unrecoverable-candidates.json'
  );
  fs.writeFileSync(unrecoverablePath, JSON.stringify(unknownCases, null, 2));
  console.log(`📋 Unrecoverable candidates: onsbt-unrecoverable-candidates.json (${unknownCases.length})`);

  if (fs.existsSync(checkpointFile)) {
    fs.unlinkSync(checkpointFile);
  }

  console.log('\n✅ Recovery run complete\n');

  return stats;
}

// Run recovery
recoverUnknownOutcomes().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
