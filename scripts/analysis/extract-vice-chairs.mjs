/**
 * Extract Vice-Chair Names and Panel Composition from WSIAT Decisions
 * 
 * ETHICAL CONSIDERATIONS:
 * - This data could enable "judge shopping" (selecting favorable panels)
 * - Publishing individual vice-chair success rates may unfairly bias perceptions
 * - Focus should be on SYSTEMIC patterns (consistency, bias detection), not individual targeting
 * - Any publication MUST include ethical disclosure and limitations
 * 
 * USE CASES:
 * ✅ Identify systemic inconsistency (some panels more likely to deny)
 * ✅ Detect potential bias patterns (industry, injury type)
 * ✅ Transparency (decision-makers should be known)
 * ❌ "Shopping" for favorable panels (unethical)
 * ❌ Public shaming of individual vice-chairs (unfair)
 * 
 * @requires Node.js 20+
 * @requires ../data/comprehensive-extraction/wsiat/wsiat-ultra-complete.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common vice-chair name patterns in WSIAT decisions
const VICE_CHAIR_PATTERNS = [
  /Vice-Chair:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  /V\.?C\.?:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  /Panel:\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+\(Vice-Chair\)/gi,
  /Decision by:\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  /Chair:\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
];

// Panel composition patterns
const PANEL_PATTERNS = {
  workerRepresentative: /Worker Representative:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  employerRepresentative: /Employer Representative:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  fullPanel: /Panel:\s+(.+?)(?:\n|$)/gi,
};

/**
 * Extract vice-chair name from decision text
 * @param {string} decisionText - Full or summary text of decision
 * @returns {string|null} - Vice-chair name or null
 */
function extractViceChair(decisionText) {
  if (!decisionText) return null;
  
  for (const pattern of VICE_CHAIR_PATTERNS) {
    const matches = [...decisionText.matchAll(pattern)];
    if (matches.length > 0) {
      const name = matches[0][1].trim();
      // Filter out common false positives
      if (name.length > 2 && !['The', 'And', 'Or', 'Not', 'Yes', 'No'].includes(name)) {
        return name;
      }
    }
  }
  
  return null;
}

/**
 * Extract panel composition (worker rep, employer rep, vice-chair)
 * @param {string} decisionText - Full or summary text of decision
 * @returns {Object} - Panel composition
 */
function extractPanelComposition(decisionText) {
  const panel = {
    viceChair: null,
    workerRep: null,
    employerRep: null,
    panelType: null, // 'full' (3 members) or 'vice-chair only'
  };
  
  panel.viceChair = extractViceChair(decisionText);
  
  // Extract worker representative
  const workerMatches = [...decisionText.matchAll(PANEL_PATTERNS.workerRepresentative)];
  if (workerMatches.length > 0) {
    panel.workerRep = workerMatches[0][1].trim();
  }
  
  // Extract employer representative
  const employerMatches = [...decisionText.matchAll(PANEL_PATTERNS.employerRepresentative)];
  if (employerMatches.length > 0) {
    panel.employerRep = employerMatches[0][1].trim();
  }
  
  // Determine panel type
  if (panel.workerRep && panel.employerRep) {
    panel.panelType = 'full';
  } else if (panel.viceChair) {
    panel.panelType = 'vice-chair only';
  }
  
  return panel;
}

/**
 * Build vice-chair database from all decisions
 * @param {Array} decisions - Array of WSIAT decision objects
 * @returns {Object} - Vice-chair database with statistics
 */
function buildViceChairDatabase(decisions) {
  const viceChairs = new Map();
  
  let extracted = 0;
  let notExtracted = 0;
  
  decisions.forEach((decision, index) => {
    const panel = extractPanelComposition(decision.summary || decision.decision || '');
    
    if (panel.viceChair) {
      extracted++;
      
      if (!viceChairs.has(panel.viceChair)) {
        viceChairs.set(panel.viceChair, {
          name: panel.viceChair,
          totalDecisions: 0,
          years: new Set(),
          panelTypes: { full: 0, viceChairOnly: 0 },
          outcomes: { allowed: 0, denied: 0, partial: 0, remitted: 0, other: 0, unclear: 0 },
          injuries: {},
          industries: {},
        });
      }
      
      const vc = viceChairs.get(panel.viceChair);
      vc.totalDecisions++;
      vc.years.add(decision.year);
      
      if (panel.panelType === 'full') {
        vc.panelTypes.full++;
      } else {
        vc.panelTypes.viceChairOnly++;
      }
      
      // Track outcomes (if available)
      const outcomeText = (decision.summary || '').toLowerCase();
      if (outcomeText.includes('allowed') || outcomeText.includes('granted')) {
        vc.outcomes.allowed++;
      } else if (outcomeText.includes('denied') || outcomeText.includes('dismissed')) {
        vc.outcomes.denied++;
      } else if (outcomeText.includes('partial')) {
        vc.outcomes.partial++;
      } else if (outcomeText.includes('remit') || outcomeText.includes('return')) {
        vc.outcomes.remitted++;
      } else {
        vc.outcomes.unclear++;
      }
      
      // Track injury types (if available)
      if (decision.injuryType) {
        vc.injuries[decision.injuryType] = (vc.injuries[decision.injuryType] || 0) + 1;
      }
      
      // Track industries (if available)
      if (decision.industry) {
        vc.industries[decision.industry] = (vc.industries[decision.industry] || 0) + 1;
      }
    } else {
      notExtracted++;
    }
  });
  
  // Convert Map to array and calculate statistics
  const viceChairArray = Array.from(viceChairs.values()).map(vc => ({
    ...vc,
    years: Array.from(vc.years).sort(),
    yearRange: `${Math.min(...vc.years)}-${Math.max(...vc.years)}`,
    detectableOutcomes: vc.outcomes.allowed + vc.outcomes.denied + vc.outcomes.partial,
    detectedSuccessRate: vc.outcomes.allowed + vc.outcomes.denied + vc.outcomes.partial > 0
      ? ((vc.outcomes.allowed / (vc.outcomes.allowed + vc.outcomes.denied + vc.outcomes.partial)) * 100).toFixed(1) + '%'
      : 'N/A',
  }));
  
  // Sort by total decisions (most active first)
  viceChairArray.sort((a, b) => b.totalDecisions - a.totalDecisions);
  
  return {
    totalViceChairs: viceChairArray.length,
    totalDecisions: decisions.length,
    extractionRate: ((extracted / decisions.length) * 100).toFixed(1) + '%',
    extracted,
    notExtracted,
    viceChairs: viceChairArray,
    metadata: {
      note: 'Extraction based on text patterns. May miss some vice-chairs or misidentify names.',
      ethicalConsideration: 'This data should NOT be used for judge shopping or individual targeting.',
      useCase: 'Systemic analysis only - detect inconsistency patterns, not individual bias.',
      limitation: 'Only 6.1% of decisions have detectable outcomes. True success rates require NLP (Task 8).',
    },
  };
}

/**
 * Generate vice-chair consistency report
 * @param {Object} database - Vice-chair database from buildViceChairDatabase()
 * @returns {Object} - Consistency analysis
 */
function analyzeConsistency(database) {
  const viceChairs = database.viceChairs;
  
  // Filter to vice-chairs with 50+ decisions (enough for statistical analysis)
  const activeViceChairs = viceChairs.filter(vc => vc.totalDecisions >= 50);
  
  // Calculate success rate variance
  const successRates = activeViceChairs
    .filter(vc => vc.detectableOutcomes >= 10) // Need 10+ detectable outcomes
    .map(vc => ({
      name: vc.name,
      totalDecisions: vc.totalDecisions,
      detectableOutcomes: vc.detectableOutcomes,
      successRate: parseFloat(vc.detectedSuccessRate),
    }));
  
  if (successRates.length === 0) {
    return {
      error: 'Insufficient data for consistency analysis (need 10+ vice-chairs with 50+ decisions and 10+ detectable outcomes)',
    };
  }
  
  const mean = successRates.reduce((sum, vc) => sum + vc.successRate, 0) / successRates.length;
  const variance = successRates.reduce((sum, vc) => sum + Math.pow(vc.successRate - mean, 2), 0) / successRates.length;
  const stdDev = Math.sqrt(variance);
  
  // Identify outliers (>2 standard deviations from mean)
  const outliers = successRates.filter(vc => Math.abs(vc.successRate - mean) > 2 * stdDev);
  
  return {
    totalViceChairs: activeViceChairs.length,
    analyzed: successRates.length,
    meanSuccessRate: mean.toFixed(1) + '%',
    standardDeviation: stdDev.toFixed(1) + '%',
    range: {
      lowest: Math.min(...successRates.map(vc => vc.successRate)).toFixed(1) + '%',
      highest: Math.max(...successRates.map(vc => vc.successRate)).toFixed(1) + '%',
    },
    outliers: outliers.length,
    interpretation: stdDev > 5
      ? 'HIGH variance - suggests significant inconsistency between vice-chairs'
      : stdDev > 2
      ? 'MODERATE variance - some inconsistency detected'
      : 'LOW variance - relatively consistent decision-making',
    ethicalNote: 'Outliers do NOT prove bias - case mix, injury complexity, representation quality all affect outcomes.',
    limitation: 'Only 6.1% outcome detection - true consistency requires NLP analysis (Task 8).',
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Extracting vice-chair names and panel composition...\n');
  
  // NOTE: Large file (55MB) was moved to temp location to avoid Cloudflare size limit
  const wsiatPath = path.join(__dirname, '../temp-large-files/wsiat-ultra-complete.json');
  
  if (!fs.existsSync(wsiatPath)) {
    console.error('❌ Error: wsiat-ultra-complete.json not found.');
    console.error('   Expected location:', wsiatPath);
    console.error('   This file is 55MB and was excluded from deployment.');
    console.error('   To run this script, ensure the file is available locally.');
    process.exit(1);
  }
  
  console.log('📂 Loading WSIAT decisions...');
  const wsiatData = JSON.parse(fs.readFileSync(wsiatPath, 'utf8'));
  const decisions = wsiatData.decisions || wsiatData;
  
  console.log(`✅ Loaded ${decisions.length.toLocaleString()} decisions\n`);
  
  // Build vice-chair database
  console.log('👨‍⚖️ Extracting vice-chair names...');
  const database = buildViceChairDatabase(decisions);
  
  console.log(`✅ Extraction complete:`);
  console.log(`   - Total vice-chairs identified: ${database.totalViceChairs}`);
  console.log(`   - Extraction rate: ${database.extractionRate}`);
  console.log(`   - Extracted: ${database.extracted.toLocaleString()}`);
  console.log(`   - Not extracted: ${database.notExtracted.toLocaleString()}\n`);
  
  // Analyze consistency
  console.log('📊 Analyzing consistency...');
  const consistency = analyzeConsistency(database);
  
  if (!consistency.error) {
    console.log(`✅ Consistency analysis complete:`);
    console.log(`   - Vice-chairs analyzed: ${consistency.analyzed}`);
    console.log(`   - Mean success rate: ${consistency.meanSuccessRate}`);
    console.log(`   - Standard deviation: ${consistency.standardDeviation}`);
    console.log(`   - Range: ${consistency.range.lowest} - ${consistency.range.highest}`);
    console.log(`   - Interpretation: ${consistency.interpretation}\n`);
  } else {
    console.log(`⚠️  ${consistency.error}\n`);
  }
  
  // Save results
  const outputDir = path.join(__dirname, '../data/comprehensive-extraction');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'vice-chair-database.json');
  fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));
  console.log(`💾 Saved: ${outputPath}\n`);
  
  const consistencyPath = path.join(outputDir, 'vice-chair-consistency.json');
  fs.writeFileSync(consistencyPath, JSON.stringify(consistency, null, 2));
  console.log(`💾 Saved: ${consistencyPath}\n`);
  
  // Ethical disclosure
  console.log('⚠️  ETHICAL CONSIDERATIONS:');
  console.log('   - This data should NOT be used for "judge shopping"');
  console.log('   - Individual vice-chairs should NOT be publicly targeted');
  console.log('   - Focus on SYSTEMIC patterns (inconsistency, bias detection)');
  console.log('   - Case mix and complexity affect outcomes - outliers ≠ bias');
  console.log('   - Publication requires ethical disclosure and expert review\n');
  
  console.log('✅ Vice-chair extraction complete!');
}

main().catch(console.error);
