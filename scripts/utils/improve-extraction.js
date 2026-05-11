#!/usr/bin/env node
/**
 * Improved Extraction Engine
 * Uses CanLII AI Content API + enhanced regex + manual tuning
 * 
 * Author: 3mpwrApp
 * Date: April 2026
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, "../data/tribunal-decisions");
const OUTPUT_DIR = path.join(__dirname, "../data/extraction-training");
const CANLII_API_KEY = process.env.CANLII_API_KEY;

// ===== STEP 1: CHECK FOR CANLII AI CONTENT API =====

function testCanLIIAIContent(caseId, database) {
  return new Promise((resolve, reject) => {
    const url = `https://api.canlii.org/v1/caseBrowse/en/${database}/${caseId}?api_key=${CANLII_API_KEY}`;
    
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // Check if AI content available
          if (json.aiContentId && json.aiContentId.en) {
            console.log(`  ✅ AI Content available for ${caseId}: ${json.aiContentId.en}`);
            resolve(json.aiContentId.en);
          } else {
            console.log(`  ℹ️  No AI content for ${caseId}, using manual extraction`);
            resolve(null);
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// ===== STEP 2: ENHANCED REGEX PATTERNS =====

const ENHANCED_PATTERNS = {
  outcomes: [
    { pattern: /the\s+appeal\s+is\s+allowed/i, outcome: "Allowed" },
    { pattern: /appeal\s+allowed/i, outcome: "Allowed" },
    { pattern: /grant(?:ed|ing)\s+the\s+appeal/i, outcome: "Allowed" },
    { pattern: /appeal\s+is\s+granted/i, outcome: "Allowed" },
    
    { pattern: /the\s+appeal\s+is\s+dismissed/i, outcome: "Dismissed" },
    { pattern: /appeal\s+dismissed/i, outcome: "Dismissed" },
    { pattern: /dismiss(?:es|ing)\s+the\s+appeal/i, outcome: "Dismissed" },
    
    { pattern: /application\s+is\s+denied/i, outcome: "Denied" },
    { pattern: /claim\s+is\s+denied/i, outcome: "Denied" },
    
    { pattern: /decision\s+is\s+varied/i, outcome: "Varied" },
    { pattern: /varied\s+and\s+substituted/i, outcome: "Varied" },
    
    { pattern: /remanded/i, outcome: "Remanded" },
    { pattern: /returned\s+to/i, outcome: "Remanded" }
  ],
  
  conditions: [
    { pattern: /fibromyalgia/i, condition: "fibromyalgia" },
    { pattern: /chronic\s+pain/i, condition: "chronic pain" },
    { pattern: /PTSD|post[\s-]traumatic\s+stress/i, condition: "PTSD" },
    { pattern: /back\s+injury|lumbar|spine\s+injury/i, condition: "back injury" },
    { pattern: /herniated\s+disc|disc\s+herniation/i, condition: "herniated disc" },
    { pattern: /multiple\s+sclerosis|MS(?!\w)/i, condition: "multiple sclerosis" },
    { pattern: /depression|major\s+depressive/i, condition: "depression" },
    { pattern: /anxiety|generalized\s+anxiety/i, condition: "anxiety" },
    { pattern: /rheumatoid\s+arthritis/i, condition: "rheumatoid arthritis" },
    { pattern: /osteoarthritis/i, condition: "osteoarthritis" },
    { pattern: /carpal\s+tunnel/i, condition: "carpal tunnel" },
    { pattern: /tendinitis|tendonitis/i, condition: "tendinitis" },
    { pattern: /chronic\s+fatigue/i, condition: "chronic fatigue" },
    { pattern: /migraine|headache/i, condition: "migraine" }
  ],
  
  evidence: [
    { pattern: /RFC|residual\s+functional\s+capacity/i, evidence: "RFC form" },
    { pattern: /FCE|functional\s+capacity\s+evaluation/i, evidence: "FCE" },
    { pattern: /specialist\s+report|neurologist|psychiatrist|rheumatologist/i, evidence: "Specialist report" },
    { pattern: /medical\s+records|clinical\s+notes/i, evidence: "Medical records" },
    { pattern: /timeline|chronology|history\s+of/i, evidence: "Timeline/history" },
    { pattern: /IME|independent\s+medical\s+exam/i, evidence: "IME" },
    { pattern: /employment\s+records|work\s+history/i, evidence: "Employment records" },
    { pattern: /witness\s+testimony|affidavit/i, evidence: "Witness testimony" },
    { pattern: /x[\s-]ray|imaging|MRI|CT\s+scan/i, evidence: "Medical imaging" }
  ]
};

// ===== STEP 3: IMPROVED EXTRACTION FUNCTION =====

function improvedExtraction(decisionText, caseData) {
  const text = decisionText;
  const result = {
    case_id: caseData.caseId?.en || "unknown",
    title: caseData.title || "",
    outcome: "Unknown",
    conditions: [],
    evidence_cited: [],
    confidence_score: 0
  };
  
  // Extract outcome with confidence scoring
  let outcomeMatches = 0;
  for (const { pattern, outcome } of ENHANCED_PATTERNS.outcomes) {
    if (pattern.test(text)) {
      outcomeMatches++;
      if (outcomeMatches === 1) {
        result.outcome = outcome;
      }
    }
  }
  result.confidence_score += outcomeMatches > 0 ? 25 : 0;
  
  // Extract conditions
  for (const { pattern, condition } of ENHANCED_PATTERNS.conditions) {
    if (pattern.test(text)) {
      result.conditions.push(condition);
      result.confidence_score += 10;
    }
  }
  
  // Extract evidence
  for (const { pattern, evidence } of ENHANCED_PATTERNS.evidence) {
    if (pattern.test(text)) {
      result.evidence_cited.push(evidence);
      result.confidence_score += 5;
    }
  }
  
  // Cap confidence at 100
  result.confidence_score = Math.min(100, result.confidence_score);
  
  return result;
}

// ===== STEP 4: SAMPLE CASES FOR MANUAL TUNING =====

async function createTrainingSamples() {
  console.log("=".repeat(60));
  console.log("📚 CREATING TRAINING SAMPLES FOR MANUAL TUNING");
  console.log("=".repeat(60));
  
  // Load existing decisions
  const decisionsFile = path.join(DATA_DIR, "onwsiat-historical-20260404.json");
  const decisions = JSON.parse(fs.readFileSync(decisionsFile, 'utf8'));
  
  // Sample 50 random decisions for manual review
  const sample = [];
  const indices = new Set();
  while (indices.size < Math.min(50, decisions.length)) {
    indices.add(Math.floor(Math.random() * decisions.length));
  }
  
  Array.from(indices).forEach(i => {
    const d = decisions[i];
    sample.push({
      case_id: d.case_id,
      title: d.title,
      current_extraction: {
        outcome: d.outcome,
        condition: d.condition,
        evidence: d.evidence_cited
      },
      full_text_snippet: d.snippet || "",
      manual_correction: {
        outcome: "",  // To be filled manually
        conditions: [],
        evidence: [],
        notes: ""
      }
    });
  });
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const outputPath = path.join(OUTPUT_DIR, "training-samples-manual-review.json");
  fs.writeFileSync(outputPath, JSON.stringify(sample, null, 2));
  
  console.log(`\n✅ Created ${sample.length} training samples`);
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`\n📋 INSTRUCTIONS:`);
  console.log(`   1. Open the file and manually correct the extractions`);
  console.log(`   2. Fill in outcome, conditions, evidence accurately`);
  console.log(`   3. Add notes about patterns you observe`);
  console.log(`   4. Run training script to learn from corrections\n`);
  
  return sample;
}

// ===== STEP 5: PATTERN LEARNING FROM MANUAL CORRECTIONS =====

function learnFromCorrections(sampleFile) {
  console.log("=".repeat(60));
  console.log("🧠 LEARNING FROM MANUAL CORRECTIONS");
  console.log("=".repeat(60));
  
  const samples = JSON.parse(fs.readFileSync(sampleFile, 'utf8'));
  const patterns = {
    outcome_phrases: {},
    condition_phrases: {},
    evidence_phrases: {}
  };
  
  // Analyze manually corrected samples
  samples.forEach(sample => {
    if (sample.manual_correction.outcome && sample.full_text_snippet) {
      const outcome = sample.manual_correction.outcome;
      // Extract phrases near outcome indicators
      // (simplified - would use NLP for real ML)
      if (!patterns.outcome_phrases[outcome]) {
        patterns.outcome_phrases[outcome] = [];
      }
      patterns.outcome_phrases[outcome].push(sample.full_text_snippet.substring(0, 200));
    }
  });
  
  console.log(`\n✅ Learned ${Object.keys(patterns.outcome_phrases).length} outcome patterns`);
  
  // Save learned patterns
  const outputPath = path.join(OUTPUT_DIR, "learned-patterns.json");
  fs.writeFileSync(outputPath, JSON.stringify(patterns, null, 2));
  console.log(`📁 Saved to: ${outputPath}\n`);
  
  return patterns;
}

// ===== MAIN =====

async function main() {
  console.log("=".repeat(60));
  console.log("🔬 IMPROVED EXTRACTION ENGINE");
  console.log("=".repeat(60));
  console.log();
  
  // Step 1: Test CanLII AI Content (if available)
  console.log("🧪 Testing CanLII AI Content API...\n");
  try {
    const testCase = "2026onwsiat88";
    const aiContentId = await testCanLIIAIContent(testCase, "onwsiat");
    if (aiContentId) {
      console.log(`\n✅ CanLII AI Content API available!`);
      console.log(`   Can use AI summaries for better extraction\n`);
    }
  } catch (err) {
    console.log(`\n⚠️  CanLII AI Content API test failed: ${err.message}`);
    console.log(`   Proceeding with manual extraction improvements\n`);
  }
  
  // Step 2: Create training samples
  await createTrainingSamples();
  
  console.log("=".repeat(60));
  console.log("✅ EXTRACTION IMPROVEMENT SETUP COMPLETE!");
  console.log("=".repeat(60));
  console.log();
}

main().catch(error => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
