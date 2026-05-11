#!/usr/bin/env node

/**
 * Extract from Keywords Field
 * 
 * The CanLII API doesn't give us full text, but the keywords field
 * contains tons of useful medical/legal terminology!
 * 
 * Examples from real data:
 * - "shoulder ΓÇö work-related accident ΓÇö pre-existing condition"
 * - "worker ΓÇö impairment  ΓÇö ankle ΓÇö sinus tarsi syndrome"
 * - "hip labral tear ΓÇö pre-existing condition ΓÇö femoroacetabular impingement"
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');

// EXPANDED EXTRACTION PATTERNS - Extract EVERYTHING possible from keywords
const MEDICAL_CONDITIONS = {
  // Musculoskeletal - Upper Body
  'shoulder': /shoulder/i,
  'rotator cuff': /rotator cuff/i,
  'labral tear': /(labral tear|labrum)/i,
  'arm': /\b(arm|forearm|upper arm)\b/i,
  'elbow': /elbow/i,
  'wrist': /wrist/i,
  'hand': /\b(hand|finger|thumb)\b/i,
  'carpal tunnel': /carpal tunnel/i,
  'neck': /(neck|cervical)/i,
  
  // Musculoskeletal - Lower Body
  'back injury': /(back|lumbar|thoracic|spinal|spine)/i,
  'disc': /(disc|disk|herniat|bulg|degenerat)/i,
  'hip': /(hip|femoroacetabular|pelvis|pelvic)/i,
  'knee': /knee/i,
  'ankle': /ankle/i,
  'foot': /\b(foot|feet|toe)\b/i,
  'leg': /\b(leg|lower leg|thigh)\b/i,
  'sinus tarsi syndrome': /sinus tarsi/i,
  
  // Soft Tissue & Joint
  'tendinitis': /(tendinitis|tendonitis|tenosynovitis)/i,
  'bursitis': /bursitis/i,
  'arthritis': /(arthritis|arthritic)/i,
  'osteoarthritis': /osteoarthritis/i,
  'rheumatoid arthritis': /rheumatoid/i,
  'fracture': /fracture/i,
  'sprain': /sprain/i,
  'strain': /strain/i,
  'tear': /\b(tear|torn)\b/i,
  
  // Neurological & Pain
  'chronic pain': /chronic pain/i,
  'neuropathy': /neuropathy/i,
  'nerve damage': /(nerve|neural|radiculopathy)/i,
  'sciatica': /sciatica/i,
  'headache': /(headache|migraine|cephalgia)/i,
  'concussion': /(concussion|head injury|traumatic brain)/i,
  
  // Mental Health
  'PTSD': /(ptsd|post-traumatic|traumatic stress)/i,
  'anxiety': /anxiety/i,
  'depression': /depression/i,
  'stress': /\b(stress|stressor)\b/i,
  'mental health': /(mental health|psychological|psychiatric)/i,
  
  // Chronic Conditions
  'fibromyalgia': /fibromyalgia/i,
  'chronic fatigue': /(chronic fatigue|CFS|ME)/i,
  'MS': /(multiple sclerosis|^ms$)/i,
  
  // Sensory & Respiratory
  'hearing loss': /(hearing|deaf|tinnitus|acoustic)/i,
  'vision loss': /(vision|eye|sight|blind)/i,
  'respiratory': /(asthma|COPD|lung|respiratory|breathing)/i,
  
  // Systemic
  'impairment': /impairment/i,
  'disability': /disability/i,
  'injury': /injury/i,
  'occupational disease': /(occupational disease|illness)/i,
  'cancer': /cancer/i,
  'dermatitis': /(dermatitis|skin|rash)/i,
};

// Positive outcome indicators from keywords
const OUTCOME_ALLOWED = [
  /worker is entitled to/i,
  /entitled to full/i,
  /appeal.*allowed/i,
  /grant.*appeal/i,
];

// Negative outcome indicators from keywords
const OUTCOME_DENIED = [
  /not entitled to/i,
  /appeal.*dismissed/i,
  /deny.*appeal/i,
  /discreditable conduct/i,
  /non-compensable/i,
];

function extractFromKeywords(decision) {
  // Parse keywords from snippet JSON
  let keywords = '';
  let rawData = null;
  
  try {
    // The snippet contains the raw CanLII API response as JSON
    const snippetMatch = decision.snippet.match(/\{[^]*\}/);
    if (snippetMatch) {
      rawData = JSON.parse(snippetMatch[0]);
      keywords = rawData.keywords || '';
    }
  } catch (err) {
    // Fallback to decision.keywords if it exists
    keywords = decision.keywords || '';
  }
  
  const title = decision.title || '';
  
  // Extract conditions from keywords
  const conditions = [];
  for (const [condition, pattern] of Object.entries(MEDICAL_CONDITIONS)) {
    if (pattern.test(keywords)) {
      conditions.push(condition);
    }
  }
  
  // Extract outcome from keywords
  let outcome = 'Unknown';
  let confidence = 0;
  
  for (const pattern of OUTCOME_ALLOWED) {
    if (pattern.test(keywords)) {
      outcome = 'Allowed';
      confidence = 85;
      break;
    }
  }
  
  if (outcome === 'Unknown') {
    for (const pattern of OUTCOME_DENIED) {
      if (pattern.test(keywords)) {
        outcome = 'Dismissed';
        confidence = 80;
        break;
      }
    }
  }
  
  // Additional context clues
  const hasPreExistingCondition = /pre-existing/i.test(keywords);
  const hasWorkRelated = /work-related/i.test(keywords);
  const hasInjury = /injury|accident/i.test(keywords);
  
  return {
    ...decision,
    condition: conditions.length > 0 ? conditions.join(', ') : 'Unknown',
    outcome: outcome,
    extraction_confidence: confidence,
    context_flags: {
      pre_existing_condition: hasPreExistingCondition,
      work_related: hasWorkRelated,
      injury: hasInjury
    },
    extraction_version: 'v3.0-keywords'
  };
}

function reExtractAll() {
  const files = fs.readdirSync(DATA_DIR).filter(f => 
    f.endsWith('.json') && !f.startsWith('summary') && !f.includes('backup')
  );
  
  let totalProcessed = 0;
  let totalImproved = 0;
  
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log(`⏭️  Skipped: ${file} (empty or invalid)`);
        continue;
      }
      
      console.log(`\n📄 Processing: ${file}`);
      
      const reExtracted = data.map(decision => {
        const oldOutcome = decision.outcome || 'Unknown';
        const oldCondition = decision.condition || 'Unknown';
        
        const newDecision = extractFromKeywords(decision);
        
        const improved = (
          (newDecision.outcome !== 'Unknown' && oldOutcome === 'Unknown') ||
          (newDecision.condition !== 'Unknown' && oldCondition === 'Unknown')
        );
        
        if (improved) totalImproved++;
        
        return newDecision;
      });
      
      // Save updated file
      fs.writeFileSync(filePath, JSON.stringify(reExtracted, null, 2));
      
      totalProcessed += reExtracted.length;
      console.log(`   ✅ Re-extracted ${reExtracted.length} decisions`);
      
    } catch (err) {
      console.error(`   ❌ Error processing ${file}:`, err.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total decisions processed: ${totalProcessed}`);
  console.log(`   Improved extractions: ${totalImproved}`);
  console.log(`   Improvement rate: ${((totalImproved/totalProcessed)*100).toFixed(1)}%`);
}

reExtractAll();
