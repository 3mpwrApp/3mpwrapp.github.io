#!/usr/bin/env node

/**
 * Template Generator from Winning Cases
 * 
 * PURPOSE: Generate appeal templates from successful Ontario cases
 * FOR: Thunder Bay Disabled & Injured Workers Support Group (TBDIWSG)
 * HELPS: Injured workers, persons with disabilities navigate appeals
 * 
 * Extracts from ALLOWED cases:
 * - Winning arguments that succeeded
 * - Medical evidence that was compelling
 * - Cited case law (precedents)
 * - Judge reasoning (what convinced them)
 * - Key success factors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// ============================================================
// Configuration
// ============================================================

const INPUT_FILE = 'data/tribunal-decisions/ontario-local-enhanced-20260406.json';
const OUTPUT_DIR = 'data/templates';
const MIN_QUALITY = 60; // Minimum quality score

// ============================================================
// Template Generation
// ============================================================

/**
 * Generate template from a winning case
 */
function generateTemplate(winningCase) {
  const template = {
    template_id: `TBD-${winningCase.case_id}`,
    source_case_id: winningCase.case_id,
    tribunal: winningCase.tribunal || 'WSIAT',
    condition: winningCase.condition,
    outcome: winningCase.outcome,
    date: winningCase.decision_date,
    quality_score: winningCase.quality_score,
    
    // Key Template Sections
    winning_arguments: winningCase.winning_arguments || [],
    medical_evidence_used: winningCase.medical_evidence || {},
    cited_case_law: winningCase.cited_case_law || [],
    judge_reasoning: winningCase.judge_reasoning || [],
    key_factors: winningCase.key_factors || [],
    
    // Geographic relevance
    geographic_info: winningCase.geographic_info || {},
    
    // Metadata
    url: winningCase.url || '',
    citation: winningCase.citation || '',
    
    // Usage guidance
    usage_notes: generateUsageNotes(winningCase),
    applicability_score: calculateApplicabilityScore(winningCase)
  };
  
  return template;
}

/**
 * Generate usage notes for template
 */
function generateUsageNotes(winningCase) {
  const notes = [];
  
  // Condition-specific notes
  if (winningCase.condition && winningCase.condition !== 'Unknown') {
    notes.push(`This template is for ${winningCase.condition} cases.`);
  }
  
  // Medical evidence notes
  const med = winningCase.medical_evidence;
  if (med && med.reports && med.reports.length > 0) {
    notes.push(`Medical evidence included: ${med.reports.join(', ')}.`);
  }
  
  if (med && med.specialists && med.specialists.length > 0) {
    notes.push(`Specialist evidence from: ${med.specialists.join(', ')}.`);
  }
  
  // Geographic notes
  const geo = winningCase.geographic_info;
  if (geo && geo.cities && geo.cities.includes('Thunder Bay')) {
    notes.push('✅ THUNDER BAY CASE - Highly relevant for local appeals!');
  }
  
  // Key factors
  const factors = winningCase.key_factors;
  if (factors && factors.length > 0) {
    const factorTypes = factors.map(f => f.factor).join(', ');
    notes.push(`Key issues addressed: ${factorTypes}`);
  }
  
  return notes;
}

/**
 * Calculate how applicable this template is
 * Higher score = more useful for Thunder Bay workers
 */
function calculateApplicabilityScore(winningCase) {
  let score = 50; // Base score
  
  // Quality bonus
  score += (winningCase.quality_score - 50) * 0.5;
  
  // Thunder Bay bonus
  const geo = winningCase.geographic_info;
  if (geo && geo.cities && geo.cities.includes('Thunder Bay')) {
    score += 30; // Major bonus for local cases
  } else if (geo && geo.regions && geo.regions.includes('Northern Ontario')) {
    score += 15; // Regional bonus
  }
  
  // Medical evidence bonus
  const med = winningCase.medical_evidence;
  if (med) {
    if (med.reports && med.reports.length > 0) score += 5;
    if (med.tests && med.tests.length > 0) score += 3;
    if (med.specialists && med.specialists.length > 0) score += 5;
  }
  
  // Winning arguments bonus
  if (winningCase.winning_arguments && winningCase.winning_arguments.length > 0) {
    score += winningCase.winning_arguments.length * 2;
  }
  
  // Case law citation bonus
  if (winningCase.cited_case_law && winningCase.cited_case_law.length > 0) {
    score += Math.min(10, winningCase.cited_case_law.length);
  }
  
  return Math.round(Math.min(100, score));
}

/**
 * Group templates by condition
 */
function groupByCondition(templates) {
  const grouped = {};
  
  for (const template of templates) {
    const conditions = template.condition.split(',').map(c => c.trim());
    
    for (const condition of conditions) {
      if (condition === 'Unknown' || condition === 'injury') continue;
      
      if (!grouped[condition]) {
        grouped[condition] = [];
      }
      
      grouped[condition].push(template);
    }
  }
  
  // Sort each group by applicability score
  for (const condition in grouped) {
    grouped[condition].sort((a, b) => b.applicability_score - a.applicability_score);
  }
  
  return grouped;
}

/**
 * Generate summary statistics
 */
function generateSummary(templates, grouped) {
  const thunderBay = templates.filter(t => 
    t.geographic_info && t.geographic_info.cities && 
    t.geographic_info.cities.includes('Thunder Bay')
  ).length;
  
  const withMedEvidence = templates.filter(t => 
    t.medical_evidence_used && 
    (t.medical_evidence_used.reports?.length > 0 || 
     t.medical_evidence_used.tests?.length > 0)
  ).length;
  
  const withWinningArgs = templates.filter(t => 
    t.winning_arguments && t.winning_arguments.length > 0
  ).length;
  
  const highApplicability = templates.filter(t => 
    t.applicability_score >= 80
  ).length;
  
  return {
    total_templates: templates.length,
    by_condition: Object.keys(grouped).reduce((acc, condition) => {
      acc[condition] = grouped[condition].length;
      return acc;
    }, {}),
    thunder_bay_cases: thunderBay,
    with_medical_evidence: withMedEvidence,
    with_winning_arguments: withWinningArgs,
    high_applicability: highApplicability,
    avg_quality: Math.round(templates.reduce((sum, t) => sum + t.quality_score, 0) / templates.length),
    avg_applicability: Math.round(templates.reduce((sum, t) => sum + t.applicability_score, 0) / templates.length)
  };
}

// ============================================================
// Main Processing
// ============================================================

async function generateTemplates() {
  console.log('\n============================================================');
  console.log('📋 Template Generator for Thunder Bay Workers');
  console.log('============================================================\n');
  console.log('🎯 Mission: Help injured workers & persons with disabilities');
  console.log('📍 Focus: Thunder Bay Disabled & Injured Workers Support Group\n');
  
  // Load enhanced Ontario data
  const inputPath = path.join(ROOT, INPUT_FILE);
  if (!fs.existsSync(inputPath)) {
    console.log(`❌ Input file not found: ${INPUT_FILE}`);
    console.log('💡 Run: node scripts/extract-ontario-local.js first\n');
    process.exit(1);
  }
  
  const cases = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`✅ Loaded ${cases.length} Ontario cases\n`);
  
  // Filter for winning cases with minimum quality
  const winningCases = cases.filter(c => 
    c.outcome === 'Allowed' && 
    c.quality_score >= MIN_QUALITY
  );
  
  console.log(`🏆 Found ${winningCases.length} winning cases (quality ≥${MIN_QUALITY})\n`);
  
  if (winningCases.length === 0) {
    console.log('❌ No winning cases meet quality threshold');
    console.log('💡 Try lowering MIN_QUALITY in script\n');
    process.exit(0);
  }
  
  // Generate templates
  console.log('⚙️  Generating templates...\n');
  const templates = winningCases.map(c => generateTemplate(c));
  
  // Group by condition
  const grouped = groupByCondition(templates);
  
  console.log('📊 Templates by Condition:');
  for (const [condition, tmps] of Object.entries(grouped)) {
    console.log(`  ${condition}: ${tmps.length} templates`);
  }
  console.log('');
  
  // Create output directory
  if (!fs.existsSync(path.join(ROOT, OUTPUT_DIR))) {
    fs.mkdirSync(path.join(ROOT, OUTPUT_DIR), { recursive: true });
  }
  
  // Save all templates
  const allTemplatesPath = path.join(ROOT, OUTPUT_DIR, 'all-templates.json');
  fs.writeFileSync(allTemplatesPath, JSON.stringify(templates, null, 2));
  console.log(`✅ Saved all templates: ${OUTPUT_DIR}/all-templates.json\n`);
  
  // Save by condition
  for (const [condition, tmps] of Object.entries(grouped)) {
    const filename = condition.toLowerCase().replace(/\s+/g, '-') + '-templates.json';
    const filepath = path.join(ROOT, OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(tmps, null, 2));
    console.log(`  ✅ ${filename} (${tmps.length} templates)`);
  }
  console.log('');
  
  // Generate summary
  const summary = generateSummary(templates, grouped);
  const summaryPath = path.join(ROOT, OUTPUT_DIR, 'templates-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log('============================================================');
  console.log('✅ Template Generation Complete!');
  console.log('============================================================\n');
  
  console.log('📊 Summary:');
  console.log(`  Total templates: ${summary.total_templates}`);
  console.log(`  Thunder Bay cases: ${summary.thunder_bay_cases} ⭐`);
  console.log(`  With medical evidence: ${summary.with_medical_evidence}`);
  console.log(`  With winning arguments: ${summary.with_winning_arguments}`);
  console.log(`  High applicability (≥80): ${summary.high_applicability}`);
  console.log(`  Average quality: ${summary.avg_quality}/100`);
  console.log(`  Average applicability: ${summary.avg_applicability}/100\n`);
  
  console.log('📁 Output Location: ' + OUTPUT_DIR + '/\n');
  
  console.log('🚀 Next Steps:');
  console.log('  1. Review templates: data/templates/all-templates.json');
  console.log('  2. Share with TBDIWSG for feedback');
  console.log('  3. Customize for specific conditions');
  console.log('  4. Generate user-friendly guides from templates\n');
  
  console.log('💡 To filter for specific conditions:');
  console.log('  node scripts/generate-templates-from-wins.js --condition="chronic pain"\n');
  
  return summary;
}

// Run
generateTemplates().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
