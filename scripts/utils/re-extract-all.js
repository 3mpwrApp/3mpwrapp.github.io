#!/usr/bin/env node
/**
 * Re-Extract All Decisions with Improved Patterns
 * Updates existing JSON files with better extraction
 * 
 * Author: 3mpwrApp
 * Date: April 2026
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, "../data/tribunal-decisions");
const BACKUP_DIR = path.join(__dirname, "../data/tribunal-decisions-backup");

// ===== LOAD ENHANCED PATTERNS =====

const ENHANCED_PATTERNS = {
  outcomes: [
    { pattern: /(?:the\s+)?appeal\s+(?:is\s+)?allowed/i, outcome: "Allowed", confidence: 95 },
    { pattern: /grant(?:ed|ing|s)\s+(?:the\s+)?appeal/i, outcome: "Allowed", confidence: 90 },
    { pattern: /(?:the\s+)?appeal\s+(?:is\s+)?granted/i, outcome: "Allowed", confidence: 90 },
    { pattern: /in\s+favour\s+of\s+(?:the\s+)?(?:worker|appellant)/i, outcome: "Allowed", confidence: 85 },
    
    { pattern: /(?:the\s+)?appeal\s+(?:is\s+)?dismissed/i, outcome: "Dismissed", confidence: 95 },
    { pattern: /dismiss(?:es|ing|ed)\s+(?:the\s+)?appeal/i, outcome: "Dismissed", confidence: 90 },
    { pattern: /not\s+successful|unsuccessful/i, outcome: "Dismissed", confidence: 70 },
    
    { pattern: /(?:application|claim)\s+(?:is\s+)?denied/i, outcome: "Denied", confidence: 90 },
    { pattern: /den(?:y|ies|ying|ied)\s+(?:the\s+)?(?:claim|application)/i, outcome: "Denied", confidence: 85 },
    
    { pattern: /decision\s+(?:is\s+)?varied/i, outcome: "Varied", confidence: 90 },
    { pattern: /varied\s+and\s+substituted/i, outcome: "Varied", confidence: 95 },
    
    { pattern: /remanded/i, outcome: "Remanded", confidence: 90 },
    { pattern: /returned\s+to\s+(?:the\s+)?(?:tribunal|board)/i, outcome: "Remanded", confidence: 85 }
  ],
  
  conditions: [
    { pattern: /fibromyalgia/i, condition: "fibromyalgia" },
    { pattern: /chronic\s+pain\s+syndrome|CPS/i, condition: "chronic pain" },
    { pattern: /PTSD|post[\s-]traumatic\s+stress(?:\s+disorder)?/i, condition: "PTSD" },
    { pattern: /low(?:er)?\s+back\s+(?:pain|injury)|lumbar\s+(?:pain|injury|strain)/i, condition: "back injury" },
    { pattern: /herniated\s+(?:disc|disk)|disc\s+herniation|bulging\s+disc/i, condition: "herniated disc" },
    { pattern: /multiple\s+sclerosis|MS(?!\w)/i, condition: "MS" },
    { pattern: /major\s+depressive\s+disorder|depression|MDD/i, condition: "depression" },
    { pattern: /generalized\s+anxiety\s+disorder|anxiety|GAD/i, condition: "anxiety" },
    { pattern: /rheumatoid\s+arthritis|RA(?!\w)/i, condition: "rheumatoid arthritis" },
    { pattern: /osteoarthritis|OA(?!\w)/i, condition: "osteoarthritis" },
    { pattern: /carpal\s+tunnel\s+syndrome|CTS/i, condition: "carpal tunnel" },
    { pattern: /tendinitis|tendonitis|tendinopathy/i, condition: "tendinitis" },
    { pattern: /chronic\s+fatigue\s+syndrome|ME\/CFS|CFS/i, condition: "chronic fatigue" },
    { pattern: /migraine|chronic\s+headache/i, condition: "migraine" },
    { pattern: /rotator\s+cuff/i, condition: "rotator cuff injury" },
    { pattern: /whiplash/i, condition: "whiplash" }
  ],
  
  evidence: [
    { pattern: /RFC|residual\s+functional\s+capacity\s+(?:form|assessment)/i, evidence: "RFC form" },
    { pattern: /FCE|functional\s+capacity\s+evaluation/i, evidence: "FCE" },
    { pattern: /specialist\s+report|(?:neurologist|psychiatrist|rheumatologist|orthop[ae]dic|physiatrist)\s+report/i, evidence: "Specialist report" },
    { pattern: /family\s+(?:doctor|physician)|GP\s+report/i, evidence: "Family physician report" },
    { pattern: /medical\s+records|clinical\s+notes|chart\s+review/i, evidence: "Medical records" },
    { pattern: /timeline|chronology|detailed\s+history/i, evidence: "Timeline/history" },
    { pattern: /IME|independent\s+medical\s+exam(?:ination)?/i, evidence: "IME" },
    { pattern: /employment\s+records|ROE|work\s+history/i, evidence: "Employment records" },
    { pattern: /witness\s+testimony|affidavit|statutory\s+declaration/i, evidence: "Witness testimony" },
    { pattern: /x[\s-]ray|radiograph|imaging|MRI|CT\s+scan|diagnostic\s+imaging/i, evidence: "Medical imaging" },
    { pattern: /peer[\s-]reviewed|medical\s+literature|journal\s+article/i, evidence: "Medical literature" },
    { pattern: /vocational\s+assessment|job\s+search\s+report/i, evidence: "Vocational assessment" }
  ]
};

// ===== RE-EXTRACTION LOGIC =====

function reExtract(decision) {
  const text = decision.snippet || "";
  const improved = {
    ...decision,
    extraction_version: "v2.0",
    extraction_confidence: 0
  };
  
  // Re-extract outcome with confidence scoring
  let bestOutcome = { outcome: "Unknown", confidence: 0 };
  for (const { pattern, outcome, confidence } of ENHANCED_PATTERNS.outcomes) {
    if (pattern.test(text)) {
      if (confidence > bestOutcome.confidence) {
        bestOutcome = { outcome, confidence };
      }
    }
  }
  improved.outcome = bestOutcome.outcome;
  improved.extraction_confidence = bestOutcome.confidence;
  
  // Re-extract conditions (multiple possible)
  const conditions = new Set();
  for (const { pattern, condition } of ENHANCED_PATTERNS.conditions) {
    if (pattern.test(text)) {
      conditions.add(condition);
    }
  }
  improved.condition = conditions.size > 0 ? Array.from(conditions).join(", ") : "Unknown";
  
  // Re-extract evidence (multiple possible)
  const evidence = new Set();
  for (const { pattern, evidence: evidenceType } of ENHANCED_PATTERNS.evidence) {
    if (pattern.test(text)) {
      evidence.add(evidenceType);
    }
  }
  improved.evidence_cited = Array.from(evidence);
  
  return improved;
}

// ===== MAIN =====

async function main() {
  console.log("=".repeat(60));
  console.log("🔄 RE-EXTRACTING ALL DECISIONS WITH IMPROVED PATTERNS");
  console.log("=".repeat(60));
  console.log();
  
  // Create backup
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !f.includes('summary'));
  
  let totalDecisions = 0;
  let improvedExtractions = 0;
  
  for (const file of files) {
    const filepath = path.join(DATA_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);
    
    console.log(`\n📄 Processing: ${file}`);
    
    // Backup original
    fs.copyFileSync(filepath, backupPath);
    console.log(`  💾 Backed up to: ${backupPath}`);
    
    // Load and re-extract
    const decisions = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    if (!Array.isArray(decisions) || decisions.length === 0) {
      console.log(`  ⏭️  Skipping (empty or invalid)`);
      continue;
    }
    
    const reExtracted = decisions.map(d => {
      const improved = reExtract(d);
      
      // Check if extraction improved
      if (d.outcome === "Unknown" && improved.outcome !== "Unknown") {
        improvedExtractions++;
      }
      if (d.condition === "Unknown" && improved.condition !== "Unknown") {
        improvedExtractions++;
      }
      
      return improved;
    });
    
    // Save improved version
    fs.writeFileSync(filepath, JSON.stringify(reExtracted, null, 2));
    
    totalDecisions += reExtracted.length;
    console.log(`  ✅ Re-extracted ${reExtracted.length} decisions`);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ RE-EXTRACTION COMPLETE!");
  console.log("=".repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   Total decisions processed: ${totalDecisions}`);
  console.log(`   Improved extractions: ${improvedExtractions}`);
  console.log(`   Backup location: ${BACKUP_DIR}`);
  console.log();
}

main().catch(error => {
  console.error("\n❌  Fatal error:", error);
  process.exit(1);
});
