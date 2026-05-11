#!/usr/bin/env node

/**
 * Create Priority Queue for Refetching
 * 
 * PURPOSE: Identify Unknown outcome cases and prioritize them for refetch
 * OUTPUT: Priority queue JSON file for targeted refetch
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const INPUT_FILE = 'data/tribunal-decisions/ontario-local-enhanced-20260406.json';
const OUTPUT_FILE = 'data/.refetch-priority-queue.json';

console.log('\n============================================================');
console.log('📋 Creating Priority Queue for Refetch');
console.log('============================================================\n');

// Load enhanced data
const enhancedPath = path.join(ROOT, INPUT_FILE);
if (!fs.existsSync(enhancedPath)) {
  console.log(`❌ File not found: ${INPUT_FILE}`);
  console.log('💡 Run: node scripts/extract-ontario-local.js first\n');
  process.exit(1);
}

const cases = JSON.parse(fs.readFileSync(enhancedPath, 'utf8'));
console.log(`✅ Loaded ${cases.length} cases\n`);

// Categorize by priority
const priorities = {
  high: [],      // Unknown outcome + has medical evidence
  medium: [],    // Unknown outcome + no medical evidence
  low: [],       // Has outcome but low quality
  complete: []   // Has outcome + good quality
};

for (const c of cases) {
  const isUnknown = c.outcome === 'Unknown';
  const hasMedEvidence = c.medical_evidence && 
    (c.medical_evidence.reports.length > 0 || c.medical_evidence.tests.length > 0);
  
  if (isUnknown && hasMedEvidence) {
    priorities.high.push(c.case_id);
  } else if (isUnknown) {
    priorities.medium.push(c.case_id);
  } else if (c.quality_score < 70) {
    priorities.low.push(c.case_id);
  } else {
    priorities.complete.push(c.case_id);
  }
}

console.log('📊 Priority Breakdown:');
console.log(`  🔴 High Priority (Unknown + Med Evidence): ${priorities.high.length}`);
console.log(`  🟡 Medium Priority (Unknown): ${priorities.medium.length}`);
console.log(`  🟢 Low Priority (Has Outcome, Low Quality): ${priorities.low.length}`);
console.log(`  ✅ Complete (Has Outcome, Good Quality): ${priorities.complete.length}\n`);

// Create queue metadata
const queue = {
  created_at: new Date().toISOString(),
  total_to_refetch: priorities.high.length + priorities.medium.length + priorities.low.length,
  high_priority: priorities.high,
  medium_priority: priorities.medium,
  low_priority: priorities.low,
  complete: priorities.complete,
  progress: {
    high_completed: 0,
    medium_completed: 0,
    low_completed: 0,
    last_updated: null
  }
};

// Save queue
const outputPath = path.join(ROOT, OUTPUT_FILE);
fs.writeFileSync(outputPath, JSON.stringify(queue, null, 2));

console.log(`✅ Priority queue saved: ${OUTPUT_FILE}`);
console.log(`📦 Total cases to refetch: ${queue.total_to_refetch}\n`);

console.log('🚀 Next Steps:');
console.log('  1. Wait for quota reset (8 PM ET / Midnight UTC)');
console.log('  2. Run: node scripts/refetch-ontario-priority.js');
console.log('  3. Script will process high priority first\n');
