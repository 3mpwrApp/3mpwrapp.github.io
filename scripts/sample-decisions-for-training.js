#!/usr/bin/env node

/**
 * Sample Decisions for Training
 * 
 * Randomly samples decisions and displays their full text
 * to help build better extraction patterns
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const NUM_SAMPLES = 10;

function sampleDecisions() {
  // Read WSIAT historical file (has most data)
  const filePath = path.join(DATA_DIR, 'onwsiat-historical-20260404.json');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ No data file found');
    return;
  }

  const decisions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log(`\n📊 Total decisions: ${decisions.length}\n`);
  
  // Sample random decisions
  const samples = [];
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const idx = Math.floor(Math.random() * decisions.length);
    samples.push(decisions[idx]);
  }

  // Display samples with key sections
  samples.forEach((decision, i) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`SAMPLE ${i + 1}/${NUM_SAMPLES}: ${decision.case_id}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Title: ${decision.title}`);
    console.log(`Date: ${decision.date}`);
    console.log(`\nCurrent Extraction:`);
    console.log(`  Outcome: ${decision.outcome || 'Unknown'}`);
    console.log(`  Condition: ${decision.condition || 'Unknown'}`);
    console.log(`  Evidence: ${decision.evidence_cited?.join(', ') || 'None'}`);
    
    console.log(`\nSnippet (first 800 chars):`);
    console.log('-'.repeat(80));
    console.log(decision.snippet.substring(0, 800));
    console.log('-'.repeat(80));
  });

  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`📋 PATTERN DISCOVERY INSTRUCTIONS:`);
  console.log(`${'='.repeat(80)}`);
  console.log(`
1. Look for OUTCOME patterns:
   - Words/phrases indicating "Allowed" (appeal granted, in favour of worker, etc.)
   - Words/phrases indicating "Dismissed" (appeal denied, not entitled, etc.)

2. Look for CONDITION patterns:
   - Medical terminology (diagnosis names, injury types)
   - Common abbreviations (PTSD, MS, OA, etc.)

3. Look for EVIDENCE patterns:
   - Document types (RFC, FCE, IME, reports)
   - Who provided it (specialist, family doctor, etc.)

4. Note the CONTEXT around these terms to improve confidence scoring
`);
}

sampleDecisions();
