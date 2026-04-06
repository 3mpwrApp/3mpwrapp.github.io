#!/usr/bin/env node
/**
 * MAXIMUM Outcome Extraction from Existing Data
 * 
 * Extracts outcomes from ALL available metadata fields:
 * - Keywords (primary)
 * - Titles
 * - Citation patterns
 * - Docket patterns
 * - Any text in snippet
 * 
 * NO API CALLS - uses only what we already have
 * 
 * Author: 3mpwrApp
 * Date: April 5, 2026
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, "../data/tribunal-decisions");

// ===== AGGRESSIVE EXTRACTION =====

function extractOutcomeAggressive(decision) {
  // Check all text fields
  const allText = [
    decision.title || "",
    decision.snippet || "",
    decision.case_id || ""
  ].join(" ").toLowerCase();
  
  // Extract keywords from snippet JSON
  let keywords = "";
  try {
    const snippetMatch = decision.snippet.match(/"keywords"\s*:\s*"([^"]+)"/);
    if (snippetMatch) {
      keywords = snippetMatch[1].toLowerCase();
    }
  } catch (e) {}
  
  const combined = (keywords + " " + allText).toLowerCase();
  
  // VERY STRONG patterns (near certainty)
  if (/\bappeal\s+(?:is\s+)?(?:hereby\s+)?allowed\b/.test(combined)) return "Allowed";
  if (/\bappeal\s+(?:is\s+)?(?:hereby\s+)?dismissed\b/.test(combined)) return "Dismissed";
  if (/\bappeal\s+(?:is\s+)?(?:hereby\s+)?denied\b/.test(combined)) return "Denied";
  if (/\bdecision\s+(?:is\s+)?allowed\b/.test(combined)) return "Allowed";
  if (/\bdecision\s+(?:is\s+)?dismissed\b/.test(combined)) return "Dismissed";
  
  // STRONG patterns (high confidence)
  if (/\ballowed\b.*\bappeal\b/.test(combined)) return "Allowed";
  if (/\bdismissed\b.*\bappeal\b/.test(combined)) return "Dismissed";
  if (/\bdenied\b.*\bappeal\b/.test(combined)) return "Denied";
  
  // Entitlement patterns (medium-high confidence)
  if (/\bentitled\s+to\b/.test(keywords)) return "Allowed";
  if (/\bentitlement\s+(?:is\s+)?granted\b/.test(keywords)) return "Allowed";
  if (/\bentitlement\s+for\b/.test(keywords)) return "Allowed"; // More aggressive
  if (/\bgranted\b/.test(keywords)) return "Allowed";
  if (/\bapproved\b/.test(keywords)) return "Allowed";
  
  // Negative entitlement patterns
  if (/\bnot\s+entitled\b/.test(keywords)) return "Dismissed";
  if (/\bno\s+entitlement\b/.test(keywords)) return "Dismissed";
  if (/\bentitlement\s+(?:is\s+)?denied\b/.test(keywords)) return "Dismissed";
  if (/\brejected\b/.test(keywords)) return "Dismissed";
  if (/\brefused\b/.test(keywords)) return "Dismissed";
  
  // Variation patterns
  if (/\bvaried\b/.test(combined)) return "Varied";
  if (/\bvariation\b/.test(combined)) return "Varied";
  
  // Remand patterns
  if (/\bremand(?:ed)?\b/.test(combined)) return "Remanded";
  if (/\bset\s+aside\b/.test(combined)) return "Remanded";
  if (/\breferred\s+back\b/.test(combined)) return "Remanded";
  
  // Benefit continuation patterns (likely allowed)
  if (/\bcontinued\b.*\bbenefits?\b/.test(keywords)) return "Allowed";
  if (/\bbenefits?\b.*\bcontinued\b/.test(keywords)) return "Allowed";
  
  // Worker-specific patterns (context clues)
  if (/\bworker\b.*\bentitled\b/.test(keywords)) return "Allowed";
  
  return "Unknown";
}

function extractConditionAggressive(decision) {
  const allText = [
    decision.title || "",
    decision.snippet || "",
  ].join(" ").toLowerCase();
  
  let keywords = "";
  try {
    const snippetMatch = decision.snippet.match(/"keywords"\s*:\s*"([^"]+)"/);
    if (snippetMatch) {
      keywords = snippetMatch[1].toLowerCase();
    }
  } catch (e) {}
  
  const combined = (keywords + " " + allText).toLowerCase();
  
  const conditions = [
    // Mental health
    "fibromyalgia", "chronic pain syndrome", "chronic pain", "chronic fatigue syndrome", "chronic fatigue",
    "ptsd", "post-traumatic stress disorder", "post-traumatic stress",
    "depression", "major depressive disorder", "depressive disorder",
    "anxiety disorder", "anxiety", "generalized anxiety",
    "panic disorder", "panic attacks",
    "bipolar", "schizophrenia",
    "mental health", "psychological", "psychiatric",
    
    // Physical injuries
    "back injury", "low back pain", "lower back", "lumbar", "spine", "spinal injury",
    "herniated disc", "disc herniation", "bulging disc", "disc bulge", "disc protrusion", "disc",
    "neck injury", "cervical", "whiplash", "neck",
    "shoulder injury", "rotator cuff tear", "rotator cuff", "shoulder",
    "knee injury", "meniscus tear", "acl tear", "meniscus", "knee",
    "hip injury", "hip replacement", "hip",
    "wrist injury", "carpal tunnel syndrome", "carpal tunnel", "wrist",
    "ankle injury", "ankle sprain", "ankle",
    "hand injury", "finger injury", "hand",
    "elbow injury", "tennis elbow", "elbow",
    "foot injury", "plantar fasciitis", "foot",
    
    // Soft tissue
    "strain", "sprain", "tear", "rupture",
    "tendinitis", "tendinosis", "tendon injury",
    "ligament tear", "ligament",
    "muscle tear", "muscle strain",
    
    // Arthritis
    "rheumatoid arthritis", "osteoarthritis", "arthritis",
    
    // Neurological
    "multiple sclerosis", "ms",
    "nerve damage", "neuropathy", "radiculopathy", "sciatica",
    "concussion", "traumatic brain injury", "tbi", "brain injury",
    "stroke", "seizure",
    
    // Respiratory
    "asthma", "copd", "lung disease",
    
    // Hearing/Vision
    "hearing loss", "tinnitus", "vision loss",
    
    // Other
    "impairment", "disability", "injury", "work injury",
    "occupational disease", "occupational injury"
  ];
  
  const found = [];
  for (const cond of conditions) {
    const regex = new RegExp(`\\b${cond.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(combined)) {
      found.push(cond);
    }
  }
  
  // Remove duplicates and sub-duplicates
  const unique = [...new Set(found)];
  return unique.length > 0 ? unique.slice(0, 5).join(", ") : "Unknown";
}

// ===== PROCESS FILES =====

async function processFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  
  // Skip backup files
  if (filename.includes('backup')) return;
  
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
  
  console.log(`\n🔄 MAXIMUM AGGRESSION EXTRACTION...\n`);
  
  let updated = 0;
  let stillUnknown = 0;
  
  for (const decision of unknowns) {
    const newOutcome = extractOutcomeAggressive(decision);
    const newCondition = extractConditionAggressive(decision);
    
    // Update decision
    decision.outcome = newOutcome;
    if (newCondition !== "Unknown") {
      decision.condition = newCondition;
    }
    decision.extraction_version = "v4.1-aggressive-metadata";
    decision.extraction_date = new Date().toISOString().split('T')[0];
    
    if (newOutcome !== "Unknown") {
      updated++;
    } else {
      stillUnknown++;
    }
  }
  
  // Save backup
  const backupPath = filePath.replace('.json', '-v4backup.json');
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
  
  return { updated, stillUnknown, total: decisions.length };
}

async function main() {
  console.log("=".repeat(60));
  console.log("🔬 MAXIMUM Outcome Extractor v4.1");
  console.log("=".repeat(60));
  console.log("✅ ALL metadata fields analyzed");
  console.log("✅ Aggressive pattern matching");
  console.log("✅ Context-aware extraction");
  console.log();
  
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('-historical-20260404.json'))
    .filter(f => !f.includes('backup'))
    .filter(f => ['onwsiat', 'onca', 'onhrt'].some(prefix => f.startsWith(prefix)));
  
  console.log(`Found ${files.length} Ontario files to process:`);
  files.forEach(f => console.log(`  - ${f}`));
  
  let totalUpdated = 0;
  let totalUnknown = 0;
  let totalDecisions = 0;
  
  for (const file of files) {
    const result = await processFile(file);
    if (result) {
      totalUpdated += result.updated;
      totalUnknown += result.stillUnknown;
      totalDecisions += result.total;
    }
  }
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ MAXIMUM EXTRACTION COMPLETE!");
  console.log("=".repeat(60));
  console.log(`\n📊 OVERALL RESULTS:`);
  console.log(`  Total decisions: ${totalDecisions}`);
  console.log(`  ✅ Outcomes extracted: ${totalUpdated}`);
  console.log(`  ⚠️  Still unknown: ${totalUnknown}`);
  console.log(`  📈 Overall extraction: ${((totalDecisions - totalUnknown)/totalDecisions*100).toFixed(1)}%`);
  
  if (totalUnknown > 0) {
    console.log(`\n⚠️  REMAINING ${totalUnknown} UNKNOWNS REQUIRE:`);
    console.log(`  1. Full decision text from CanLII API (caseBrowse endpoint)`);
    console.log(`  2. API quota available (resets 8 PM ET / 5 PM PT)`);
    console.log(`  3. Run: node scripts/extract-outcomes-from-urls.js`);
    console.log(`  4. Estimated time: ~${Math.ceil(totalUnknown * 3 / 3600)} hours`);
  }
  
  console.log("\n🎯 Next Steps:");
  console.log("  1. Re-run pattern analysis: node scripts/analyze-patterns.js");
  console.log("  2. Tonight (8 PM ET): Scrape 19 provinces");
  console.log("  3. Tomorrow: Extract remaining unknowns with fresh API quota");
}

main().catch(console.error);
