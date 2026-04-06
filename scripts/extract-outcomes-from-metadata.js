#!/usr/bin/env node
/**
 * Extract Outcomes from Existing Metadata (No API Calls!)
 * 
 * Uses keywords and metadata already in the JSON files
 * No API quota usage - instant processing
 * 
 * Author: 3mpwrApp
 * Date: April 5, 2026
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, "../data/tribunal-decisions");

// ===== OUTCOME EXTRACTION FROM KEYWORDS =====

function extractOutcomeFromKeywords(keywords) {
  if (!keywords) return "Unknown";
  
  const kw = keywords.toLowerCase();
  
  // Strong indicators
  if (/appeal.*allowed|allowed.*appeal|decision.*allowed/i.test(kw)) return "Allowed";
  if (/appeal.*dismissed|dismissed.*appeal|decision.*dismissed/i.test(kw)) return "Dismissed";
  if (/appeal.*denied|denied.*appeal|claim.*denied/i.test(kw)) return "Denied";
  if (/varied|variation/i.test(kw)) return "Varied";
  if (/remand|set aside|referred back/i.test(kw)) return "Remanded";
  
  // Weaker indicators (positive outcomes)
  if (/entitled to|entitlement.*granted|entitlement for/i.test(kw)) return "Allowed";
  if (/granted|approved|accepted/i.test(kw)) return "Allowed";
  
  // Weaker indicators (negative outcomes)
  if (/not entitled|entitlement.*denied|no entitlement/i.test(kw)) return "Dismissed";
  if (/rejected|refused/i.test(kw)) return "Dismissed";
  
  return "Unknown";
}

function extractConditionFromKeywords(keywords) {
  if (!keywords) return "Unknown";
  
  const kw = keywords.toLowerCase();
  
  const conditions = [
    "fibromyalgia", "chronic pain", "chronic fatigue",
    "ptsd", "post-traumatic stress",
    "back injury", "low back", "lumbar", "spine",
    "disc herniation", "herniated disc", "disc",
    "depression", "anxiety", "mental health",
    "arthritis", "osteoarthritis",
    "multiple sclerosis", "ms",
    "carpal tunnel",
    "tendinitis", "tendinosis",
    "rotator cuff", "shoulder",
    "knee", "meniscus",
    "neck", "cervical",
    "hip", "wrist", "ankle", "hand",
    "concussion", "brain injury", "tbi",
    "nerve damage", "neuropathy",
    "strain", "sprain", "tear"
  ];
  
  const found = [];
  for (const cond of conditions) {
    if (kw.includes(cond)) {
      found.push(cond);
    }
  }
  
  return found.length > 0 ? found.join(", ") : "Unknown";
}

// ===== PROCESS FILES =====

async function processFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📄 Processing: ${filename}`);
  console.log("=".repeat(60));
  
  const rawData = fs.readFileSync(filePath, 'utf8');
  const decisions = JSON.parse(rawData);
  
  console.log(`Total decisions: ${decisions.length}`);
  
  const unknowns = decisions.filter(d => d.outcome === "Unknown");
  console.log(`Unknown outcomes: ${unknowns.length} (${(unknowns.length/decisions.length*100).toFixed(1)}%)`);
  
  if (unknowns.length === 0) {
    console.log("✅ No unknowns to process!");
    return;
  }
  
  console.log(`\n🔄 Extracting from keywords...\n`);
  
  let updated = 0;
  let stillUnknown = 0;
  
  for (const decision of unknowns) {
    // Parse snippet JSON to get keywords
    let keywords = "";
    try {
      const snippetMatch = decision.snippet.match(/"keywords"\s*:\s*"([^"]+)"/);
      if (snippetMatch) {
        keywords = snippetMatch[1];
      }
    } catch (e) {
      // Ignore parse errors
    }
    
    if (!keywords) {
      stillUnknown++;
      continue;
    }
    
    const newOutcome = extractOutcomeFromKeywords(keywords);
    const newCondition = extractConditionFromKeywords(keywords);
    
    // Update decision
    decision.outcome = newOutcome;
    if (newCondition !== "Unknown") {
      decision.condition = newCondition;
    }
    decision.extraction_version = "v4.0-metadata";
    decision.extraction_date = new Date().toISOString().split('T')[0];
    
    if (newOutcome !== "Unknown") {
      updated++;
    } else {
      stillUnknown++;
    }
  }
  
  // Save backup
  const backupPath = filePath.replace('.json', '-v3-backup.json');
  fs.writeFileSync(backupPath, rawData, 'utf8');
  console.log(`💾 Backup saved: ${path.basename(backupPath)}`);
  
  // Save updated
  fs.writeFileSync(filePath, JSON.stringify(decisions, null, 2), 'utf8');
  console.log(`💾 Updated file saved: ${filename}`);
  
  // Stats
  console.log(`\n📊 Results:`);
  console.log(`  ✅ Outcomes extracted: ${updated}`);
  console.log(`  ⚠️  Still unknown: ${stillUnknown}`);
  console.log(`  📈 Success rate: ${(updated/(updated+stillUnknown)*100).toFixed(1)}%`);
  
  // New distribution
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
  console.log("🔬 Outcome Extractor v4.0 - Metadata Mode");
  console.log("=".repeat(60));
  console.log("✅ No API calls - uses existing keywords");
  console.log("✅ No quota usage - instant processing");
  console.log("✅ No rate limiting - processes all immediately");
  console.log();
  
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('-historical-20260404.json'))
    .filter(f => ['onwsiat', 'onca', 'onhrt'].some(prefix => f.startsWith(prefix)));
  
  console.log(`Found ${files.length} Ontario files to process:`);
  files.forEach(f => console.log(`  - ${f}`));
  
  for (const file of files) {
    await processFile(file);
  }
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ EXTRACTION COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n🎯 Next Steps:");
  console.log("  1. Re-run pattern analysis: node scripts/analyze-patterns.js");
  console.log("  2. Check success rates by condition");
  console.log("  3. Generate templates from winning cases");
}

main().catch(console.error);
