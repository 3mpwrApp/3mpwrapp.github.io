#!/usr/bin/env node
/**
 * Create Priority Case List (500 High-Value Cases)
 * 
 * Scans all existing ONWSIAT data and extracts:
 * - All chronic pain cases
 * - All fibromyalgia cases
 * - All PTSD/psychotraumatic cases
 * - All pre-existing condition cases
 * - Top employer termination cases
 * 
 * Output: priority-cases-500.json (ready for enrichment)
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/tribunal-decisions');
const OUTPUT_FILE = path.join(DATA_DIR, 'priority-cases-500.json');

console.log('═══════════════════════════════════════════════════════');
console.log('  Creating Priority Case List');
console.log('═══════════════════════════════════════════════════════\n');

// Load all year files
const yearFiles = [
  'onwsiat-2020-ultra-slow.json',
  'onwsiat-2021-ultra-slow.json',
  'onwsiat-2022-ultra-slow.json',
  'onwsiat-2023-ultra-slow.json',
  'onwsiat-2024-ultra-slow.json',
  'onwsiat-2025-ultra-slow.json',
  'onwsiat-2026-ultra-slow.json'
];

let allCases = [];

for (const file of yearFiles) {
  const filePath = path.join(DATA_DIR, file);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const cases = Array.isArray(data) ? data : [];
      allCases.push(...cases);
      console.log(`✅ Loaded ${file}: ${cases.length} cases`);
    } catch (error) {
      console.log(`⚠️  Skipped ${file}: ${error.message}`);
    }
  }
}

console.log(`\n📊 Total cases loaded: ${allCases.length}\n`);

// Priority keyword patterns (from guides)
const priorityPatterns = [
  { name: 'chronic pain', regex: /chronic\s+pain/i, target: 200 },
  { name: 'fibromyalgia', regex: /fibromyalgia/i, target: 70 },
  { name: 'PTSD/psychotraumatic', regex: /ptsd|post[\s-]traumatic\s+stress|psychotraumatic/i, target: 100 },
  { name: 'pre-existing condition', regex: /pre[\s-]existing/i, target: 100 },
  { name: 'back injury', regex: /back\s+(injury|pain)|lumbar|disc|spinal/i, target: 50 },
  { name: 'employer termination', regex: /terminat|dismiss|fire|discharge.*employ/i, target: 50 }
];

const priorityCases = [];
const categoryCounts = {};

console.log('🔍 Scanning for priority cases...\n');

// Extract priority cases
for (const pattern of priorityPatterns) {
  categoryCounts[pattern.name] = 0;
  
  for (const caseObj of allCases) {
    // Check if already added
    const data = caseObj.data || caseObj;
    const caseId = data.caseId || data.concatenatedId;
    
    if (priorityCases.some(p => {
      const pData = p.data || p;
      const pId = pData.caseId || pData.concatenatedId;
      return pId === caseId;
    })) {
      continue;
    }
    
    const keywords = data.keywords || '';
    const title = data.title || '';
    const searchText = (keywords + ' ' + title).toLowerCase();
    
    if (pattern.regex.test(searchText)) {
      priorityCases.push({
        ...caseObj,
        priorityCategory: pattern.name,
        enrichmentPriority: pattern.target
      });
      categoryCounts[pattern.name]++;
      
      if (categoryCounts[pattern.name] >= pattern.target) {
        break;
      }
    }
  }
}

// Sort by priority (highest first)
priorityCases.sort((a, b) => b.enrichmentPriority - a.enrichmentPriority);

// Limit to top 500
const top500 = priorityCases.slice(0, 500);

console.log('🎯 Priority cases by category:\n');
for (const [category, count] of Object.entries(categoryCounts)) {
  console.log(`   ${category.padEnd(30)} ${count} cases`);
}

console.log(`\n✅ Total priority cases: ${top500.length}`);
console.log(`💾 Saving to: priority-cases-500.json\n`);

// Save with enrichment tracking
const output = {
  generatedAt: new Date().toISOString(),
  totalCases: top500.length,
  enrichmentProgress: {
    total: top500.length,
    enriched: 0,
    remaining: top500.length,
    lastEnrichmentDate: null
  },
  cases: top500.map(c => ({
    ...c,
    enriched: false,
    enrichedAt: null,
    fullText: null
  }))
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

console.log('═══════════════════════════════════════════════════════');
console.log('✅ Priority list created!');
console.log('═══════════════════════════════════════════════════════\n');
console.log('Next step:');
console.log('  node scripts/enrich-priority-cases.js --batch=50\n');
