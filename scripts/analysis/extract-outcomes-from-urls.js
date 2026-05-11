#!/usr/bin/env node
/**
 * Extract Outcomes from CanLII API (v4.0)
 * 
 * Problem: 98% of 4,632 Ontario decisions have "Unknown" outcome
 * Cause: Current scraper only reads API metadata, not full decision text
 * Solution: Fetch full HTML from CanLII API caseBrowse endpoint
 * 
 * This script:
 * 1. Reads existing JSON files (onwsiat, onca, onhrt)
 * 2. For each "Unknown" outcome, fetches full HTML via API
 * 3. Parses HTML for outcome keywords
 * 4. Updates decision with correct outcome
 * 5. Saves updated JSON
 * 
 * Uses authenticated API (not public HTML scraping) to avoid 403 errors
 * Rate limiting: 3-second delay between requests (respects free tier quota)
 * 
 * Author: 3mpwrApp
 * Date: April 5, 2026
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, "../data/tribunal-decisions");
const DELAY_MS = 3000; // 3 seconds between requests (API rate limit)
const CANLII_API_KEY = process.env.CANLII_API_KEY || "5VMAI9UyXp1syvy4nEAM58QfpGZInsTF9vVc6etc";
const CANLII_BASE = "https://api.canlii.org/v1";

// ===== API FETCHING (Use CanLII API instead of scraping) =====

function fetchFromAPI(caseId, database) {
  return new Promise((resolve, reject) => {
    const url = `${CANLII_BASE}/caseBrowse/en/${database}/${caseId}?api_key=${CANLII_API_KEY}`;
    
    https.get(url, (res) => {
      if (res.statusCode === 429) {
        reject(new Error('Rate limited - quota exceeded'));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    }).on('error', reject);
  });
}

// ===== OUTCOME EXTRACTION (Enhanced v4.0) =====

function extractOutcomeFromHTML(html) {
  // Strip HTML tags to get plain text
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  
  // WSIAT-specific patterns (from actual decisions)
  const patterns = [
    { regex: /the\s+appeal\s+(?:is\s+)?(?:hereby\s+)?allowed/i, outcome: "Allowed" },
    { regex: /appeal\s+(?:is\s+)?allowed/i, outcome: "Allowed" },
    { regex: /decision.*(?:is\s+)?allowed/i, outcome: "Allowed" },
    { regex: /\ballowed\b.*appeal/i, outcome: "Allowed" },
    
    { regex: /the\s+appeal\s+(?:is\s+)?(?:hereby\s+)?dismissed/i, outcome: "Dismissed" },
    { regex: /appeal\s+(?:is\s+)?dismissed/i, outcome: "Dismissed" },
    { regex: /decision.*(?:is\s+)?dismissed/i, outcome: "Dismissed" },
    { regex: /\bdismissed\b.*appeal/i, outcome: "Dismissed" },
    
    { regex: /the\s+appeal\s+(?:is\s+)?(?:hereby\s+)?denied/i, outcome: "Denied" },
    { regex: /claim\s+(?:is\s+)?denied/i, outcome: "Denied" },
    { regex: /entitlement\s+(?:is\s+)?denied/i, outcome: "Denied" },
    
    { regex: /decision.*(?:is\s+)?varied/i, outcome: "Varied" },
    { regex: /appeal.*varied/i, outcome: "Varied" },
    
    { regex: /decision.*(?:is\s+)?set\s+aside/i, outcome: "Remanded" },
    { regex: /remand(?:ed)?.*tribunal/i, outcome: "Remanded" },
    { regex: /referred\s+back/i, outcome: "Remanded" },
    { regex: /matter.*returned/i, outcome: "Remanded" }
  ];
  
  // Try each pattern
  for (const { regex, outcome } of patterns) {
    if (regex.test(text)) {
      return outcome;
    }
  }
  
  // If no pattern matched, check last 5000 characters (decision conclusions)
  const conclusion = text.slice(-5000);
  
  if (/\ballowed\b/.test(conclusion)) return "Allowed";
  if (/ \bdismissed\b/.test(conclusion)) return "Dismissed";
  if (/\bdenied\b/.test(conclusion)) return "Denied";
  if (/\bvaried\b/.test(conclusion)) return "Varied";
  
  return "Unknown";
}

// ===== ENHANCED CONDITION EXTRACTION =====

function extractConditionFromHTML(html) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  
  const conditions = [
    "fibromyalgia", "chronic pain", "chronic fatigue syndrome", "chronic fatigue",
    "PTSD", "post-traumatic stress disorder", "post-traumatic stress",
    "back injury", "low back pain", "lumbar", "spinal injury", "spine",
    "herniated disc", "disc herniation", "disc bulge", "disc", 
    "depression", "major depressive disorder", "depressive",
    "anxiety", "anxiety disorder", "generalized anxiety",
    "rheumatoid arthritis", "osteoarthritis", "arthritis",
    "multiple sclerosis", "MS",
    "carpal tunnel syndrome", "carpal tunnel",
    "tendinitis", "tendinosis", "tendon",
    "rotator cuff", "shoulder injury", "shoulder",
    "knee injury", "knee",
    "neck injury", "cervical", "neck",
    "hip injury", "hip",
    "wrist injury", "wrist",
    "ankle injury", "ankle",
    "hand injury", "hand",
    "concussion", "traumatic brain injury", "TBI",
    "mental health", "psychological", "psychiatric",
    "nerve damage", "neuropathy", "radiculopathy",
    "strain", "sprain",
    "tear", "rupture",
    "impairment", "disability"
  ];
  
  const found = [];
  for (const condition of conditions) {
    const regex = new RegExp(`\\b${condition}\\b`, 'i');
    if (regex.test(text)) {
      found.push(condition);
    }
  }
  
  // Remove duplicates
  const unique = [...new Set(found)];
  return unique.length > 0 ? unique.join(", ") : "Unknown";
}

// ===== MAIN PROCESSING =====

async function processDecisionFile(filename, limit = null) {
  const filePath = path.join(DATA_DIR, filename);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📄 Processing: ${filename}`);
  console.log("=".repeat(60));
  
  // Load existing decisions
  const rawData = fs.readFileSync(filePath, 'utf8');
  const decisions = JSON.parse(rawData);
  
  console.log(`Total decisions: ${decisions.length}`);
  
  // Count unknowns
  let unknowns = decisions.filter(d => d.outcome === "Unknown");
  console.log(`Unknown outcomes: ${unknowns.length} (${(unknowns.length/decisions.length*100).toFixed(1)}%)`);
  
  if (unknowns.length === 0) {
    console.log("✅ No unknowns to process!");
    return;
  }
  
  // Apply limit if in test mode
  if (limit && unknowns.length > limit) {
    console.log(`⚡ TEST MODE: Processing first ${limit} of ${unknowns.length}`);
    unknowns = unknowns.slice(0, limit);
  }
  
  console.log(`\n🔄 Fetching full text for ${unknowns.length} decisions...\n`);
  
  let updated = 0;
  let failed = 0;
  let stillUnknown = 0;
  
  for (let i = 0; i < unknowns.length; i++) {
    const decision = unknowns[i];
    const progress = `[${i+1}/${unknowns.length}]`;
    
    // Extract database and caseId from snippet JSON
    let database = null;
    let caseId = null;
    
    try {
      const snippetMatch = decision.snippet.match(/"databaseId"\s*:\s*"([^"]+)"/);
      const caseMatch = decision.snippet.match(/"caseId"\s*:\s*"([^"]+)"/);
      if (snippetMatch && caseMatch) {
        database = snippetMatch[1];
        caseId = caseMatch[1];
      }
    } catch (e) {
      // Ignore parse errors
    }
    
    if (!database || !caseId) {
      console.log(`  ⚠️  ${progress} ${decision.case_id}: Cannot extract database/caseId`);
      failed++;
      continue;
    }
    
    console.log(`  🔍 ${progress} ${decision.case_id}`);
    console.log(`      ${database}/${caseId}`);
    
    try {
      const html = await fetchFromAPI(caseId, database);
      const newOutcome = extractOutcomeFromHTML(html);
      const newCondition = extractConditionFromHTML(html);
      
      // Update the decision object (modify by reference)
      const originalDecision = decisions.find(d => d.case_id === decision.case_id);
      if (originalDecision) {
        originalDecision.outcome = newOutcome;
        originalDecision.condition = newCondition !== "Unknown" ? newCondition : originalDecision.condition;
        originalDecision.extraction_version = "v4.0-full-text";
        originalDecision.extraction_date = new Date().toISOString().split('T')[0];
        
        if (newOutcome !== "Unknown") {
          console.log(`      ✅ ${newOutcome} - ${newCondition}`);
          updated++;
        } else {
          console.log(`      ⚠️  Still Unknown`);
          stillUnknown++;
        }
      }
      
      // Rate limiting - respect API quota
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      
    } catch (error) {
      if (error.message.includes('quota exceeded')) {
        console.log(`      ❌ API Quota Exceeded - stopping`);
        console.log(`\n⚠️  Processed ${i}/${unknowns.length} before hitting quota limit`);
        break;
      }
      console.log(`      ❌ Error: ${error.message}`);
      failed++;
    }
  }
  
  // Save updated file
  const backupPath = filePath.replace('.json', '-backup.json');
  fs.writeFileSync(backupPath, rawData, 'utf8');
  console.log(`\n💾 Backup saved: ${path.basename(backupPath)}`);
  
  fs.writeFileSync(filePath, JSON.stringify(decisions, null, 2), 'utf8');
  console.log(`💾 Updated file saved: ${filename}`);
  
  // Summary
  console.log(`\n📊 Results:`);
  console.log(`  ✅ Outcomes extracted: ${updated}`);
  console.log(`  ⚠️  Still unknown: ${stillUnknown}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📈 Success rate: ${(updated/(updated+stillUnknown+failed)*100).toFixed(1)}%`);
  
  // New outcome distribution
  const outcomes = {};
  decisions.forEach(d => {
    outcomes[d.outcome] = (outcomes[d.outcome] || 0) + 1;
  });
  
  console.log(`\n📊 Updated Outcome Distribution:`);
  Object.entries(outcomes).sort((a, b) => b[1] - a[1]).forEach(([outcome, count]) => {
    const pct = (count/decisions.length*100).toFixed(1);
    console.log(`  ${outcome}: ${count} (${pct}%)`);
  });
}

async function main() {
  console.log("=".repeat(60));
  console.log("🔬 CanLII Outcome Extractor v4.0");
  console.log("=".repeat(60));
  console.log("Using CanLII API with authentication (avoids 403 errors)");
  console.log(`Rate limit: ${DELAY_MS/1000}s per request`);
  console.log(`API Key: ${CANLII_API_KEY ? '✅ Set' : '❌ Missing'}`);
  
  if (!CANLII_API_KEY || CANLII_API_KEY === "YOUR_FREE_API_KEY_HERE") {
    console.log("\n❌ ERROR: CANLII_API_KEY not set!");
    console.log("Set it with: $env:CANLII_API_KEY = 'your-key-here'");
    process.exit(1);
  }
  
  // Check for test mode
  const testMode = process.argv.includes('--test');
  const testLimit = 20;
  
  if (testMode) {
    console.log(`\n⚡ TEST MODE: Processing first ${testLimit} unknowns per file`);
  }
  console.log();
  
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('-historical-20260404.json'))
    .filter(f => ['onwsiat', 'onca', 'onhrt'].some(prefix => f.startsWith(prefix)));
  
  console.log(`Found ${files.length} Ontario files to process:`);
  files.forEach(f => console.log(`  - ${f}`));
  
  for (const file of files) {
    await processDecisionFile(file, testMode ? testLimit : null);
  }
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ EXTRACTION COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n🎯 Next Steps:");
  console.log("  1. Re-run pattern analysis: node scripts/analyze-patterns.js");
  console.log("  2. Generate templates based on winning cases");
  console.log("  3. Share updated findings with TBDIWSG pilot");
  
  if (testMode) {
    console.log("\n💡 To process ALL decisions:");
    console.log("   node scripts/extract-outcomes-from-urls.js");
    console.log("   (Estimated time: ~2.5 hours for 4,500+ decisions)");
  }
}

main().catch(console.error);
