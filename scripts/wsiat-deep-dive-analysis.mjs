#!/usr/bin/env node

/**
 * WSIAT Deep Dive Analysis - Super Detective Mode 🕵️
 * 
 * Extracts advanced patterns from 98,992 decisions:
 * - Keyword co-occurrence networks (which issues cluster together)
 * - Temporal evolution (how issues changed over 40 years)
 * - Vice-chair specialization patterns
 * - Decision complexity indicators
 * - Representative participation patterns
 * - Medical specialist mentions
 * - Policy citation analysis
 * - Body part injury patterns
 * - Appeal success indicators
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WSIAT_DIR = path.join(__dirname, '../data/tribunal-decisions/wsiat/decisions-by-year');
const OUTPUT_DIR = path.join(__dirname, '../data/tribunal-decisions/wsiat/deep-analysis');
const VIZ_OUTPUT = path.join(__dirname, '../data/visualizations/wsiat-keyword-network.json');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(path.dirname(VIZ_OUTPUT))) {
  fs.mkdirSync(path.dirname(VIZ_OUTPUT), { recursive: true });
}

// Comprehensive keyword tracking
const LEGAL_ISSUES = {
  'NEL': /\bNEL\b/i,
  'LOE': /\bLOE\b/i,
  'FEL': /\bFEL\b/i,
  'SIEF': /\bSIEF\b/i,
  'Initial Entitlement': /initial entitlement/i,
  'Reconsideration': /reconsideration/i,
  'Right to Sue': /right to sue|section 31/i,
  'Chronic Pain': /chronic pain/i,
  'Pre-existing': /pre[-\s]?existing/i,
  'Permanent Impairment': /permanent impairment/i,
  'Loss of Earnings': /loss of earnings/i,
  'Vocational Rehab': /vocational rehab/i,
  'CPD': /\bCPD\b/i,
  'HAVS': /\bHAVS\b/i,
  'PTSD': /\bPTSD\b/i,
  'Mental Health': /mental health|psychological/i
};

const BODY_PARTS = {
  'Back': /\b(back|lumbar|spine|spinal|vertebra)\b/i,
  'Knee': /\bknee\b/i,
  'Shoulder': /\bshoulder\b/i,
  'Neck': /\b(neck|cervical)\b/i,
  'Hand': /\b(hand|wrist|finger)\b/i,
  'Foot': /\b(foot|ankle|toe)\b/i,
  'Hip': /\bhip\b/i,
  'Elbow': /\belbow\b/i,
  'Head': /\b(head|brain|skull)\b/i,
  'Chest': /\b(chest|thoracic|rib)\b/i,
  'Arm': /\b(arm|humerus)\b/i,
  'Leg': /\b(leg|femur|tibia)\b/i
};

const MEDICAL_SPECIALISTS = {
  'Orthopedic': /orthop[ae]dic|ortho surgeon/i,
  'Physiatrist': /physiatrist|PM&R|physical medicine/i,
  'Neurologist': /neurologist|neurology/i,
  'Psychiatrist': /psychiatrist|psychiatry/i,
  'Psychologist': /psychologist|psychology/i,
  'Pain Specialist': /pain (specialist|clinic|medicine)/i,
  'Rheumatologist': /rheumatologist|rheumatology/i,
  'Occupational Medicine': /occupational (medicine|health)/i,
  'Family Doctor': /family (doctor|physician)|GP\b/i,
  'Surgeon': /surgeon|surgical/i
};

const WSIB_POLICIES = {
  'Section 13': /section 13\b/i,
  'Section 31': /section 31\b/i,
  'Section 43': /section 43\b/i,
  'Section 44': /section 44\b/i,
  'Section 45': /section 45\b/i,
  'Section 147': /section 147\b/i,
  'Policy 18-02-02': /policy 18[-\s]02[-\s]02/i,
  'Policy 18-02-14': /policy 18[-\s]02[-\s]14/i
};

const OUTCOME_INDICATORS = {
  'Allowed': /\b(allowed|granted|approved|upheld)\b/i,
  'Dismissed': /\b(dismissed|denied|rejected)\b/i,
  'Varied': /\bvaried\b/i,
  'Remitted': /\b(remitted|returned)\b/i
};

// Load all decisions
async function loadAllDecisions() {
  const files = fs.readdirSync(WSIAT_DIR).filter(f => f.endsWith('.json'));
  const allDecisions = [];
  
  console.log(`Loading ${files.length} year files...`);
  for (const file of files) {
    const content = fs.readFileSync(path.join(WSIAT_DIR, file), 'utf-8');
    const decisions = JSON.parse(content);
    allDecisions.push(...decisions);
  }
  
  return allDecisions;
}

// 1. KEYWORD CO-OCCURRENCE ANALYSIS
function analyzeKeywordCooccurrence(decisions) {
  console.log('\n🔗 Analyzing keyword co-occurrence patterns...');
  
  const cooccurrence = {};
  const totalPairs = {};
  
  // Initialize
  for (const key1 of Object.keys(LEGAL_ISSUES)) {
    cooccurrence[key1] = {};
    for (const key2 of Object.keys(LEGAL_ISSUES)) {
      if (key1 !== key2) {
        cooccurrence[key1][key2] = 0;
      }
    }
  }
  
  // Count co-occurrences
  for (const decision of decisions) {
    const text = `${decision.DecKeywords || ''} ${decision.DecSummary || ''}`.toLowerCase();
    const presentKeywords = [];
    
    for (const [keyword, pattern] of Object.entries(LEGAL_ISSUES)) {
      if (pattern.test(text)) {
        presentKeywords.push(keyword);
      }
    }
    
    // Record all pairs
    for (let i = 0; i < presentKeywords.length; i++) {
      for (let j = i + 1; j < presentKeywords.length; j++) {
        const key1 = presentKeywords[i];
        const key2 = presentKeywords[j];
        cooccurrence[key1][key2]++;
        cooccurrence[key2][key1]++;
        
        const pairKey = [key1, key2].sort().join('|');
        totalPairs[pairKey] = (totalPairs[pairKey] || 0) + 1;
      }
    }
  }
  
  // Convert to sorted array
  const topPairs = Object.entries(totalPairs)
    .map(([pair, count]) => {
      const [key1, key2] = pair.split('|');
      return { keyword1: key1, keyword2: key2, count, percentage: ((count / decisions.length) * 100).toFixed(2) };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
  
  return { cooccurrence, topPairs };
}

// 2. TEMPORAL EVOLUTION ANALYSIS
function analyzeTemporalEvolution(decisions) {
  console.log('\n📈 Analyzing temporal evolution (40 years)...');
  
  const evolution = {};
  
  for (const keyword of Object.keys(LEGAL_ISSUES)) {
    evolution[keyword] = {};
  }
  
  for (const decision of decisions) {
    const year = decision.year || 'unknown';
    if (year === 'unknown') continue;
    
    const text = `${decision.DecKeywords || ''} ${decision.DecSummary || ''}`.toLowerCase();
    
    for (const [keyword, pattern] of Object.entries(LEGAL_ISSUES)) {
      if (pattern.test(text)) {
        if (!evolution[keyword][year]) {
          evolution[keyword][year] = 0;
        }
        evolution[keyword][year]++;
      }
    }
  }
  
  // Calculate trends (comparing decades)
  const decades = {
    '80s': ['87', '88', '89'],
    '90s': ['90', '91', '92', '93', '94', '95', '96', '97', '98', '99'],
    '00s': ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'],
    '10s': ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
    '20s': ['20', '21', '22', '23', '24', '25', '26']
  };
  
  const decadeTrends = {};
  for (const [keyword, yearData] of Object.entries(evolution)) {
    decadeTrends[keyword] = {};
    for (const [decade, years] of Object.entries(decades)) {
      const total = years.reduce((sum, year) => sum + (yearData[year] || 0), 0);
      decadeTrends[keyword][decade] = total;
    }
  }
  
  return { evolution, decadeTrends };
}

// 3. VICE-CHAIR SPECIALIZATION ANALYSIS
function analyzeViceChairSpecialization(decisions) {
  console.log('\n👨‍⚖️ Analyzing vice-chair specialization patterns...');
  
  const viceChairIssues = {};
  
  for (const decision of decisions) {
    const viceChair = decision.Vicechair;
    if (!viceChair) continue;
    
    if (!viceChairIssues[viceChair]) {
      viceChairIssues[viceChair] = { total: 0, issues: {} };
    }
    
    viceChairIssues[viceChair].total++;
    
    const text = `${decision.DecKeywords || ''} ${decision.DecSummary || ''}`.toLowerCase();
    
    for (const [keyword, pattern] of Object.entries(LEGAL_ISSUES)) {
      if (pattern.test(text)) {
        if (!viceChairIssues[viceChair].issues[keyword]) {
          viceChairIssues[viceChair].issues[keyword] = 0;
        }
        viceChairIssues[viceChair].issues[keyword]++;
      }
    }
  }
  
  // Find specialists (vice-chairs who handle >30% of certain issues)
  const specialists = [];
  for (const [viceChair, data] of Object.entries(viceChairIssues)) {
    if (data.total < 100) continue; // Only analyze prolific vice-chairs
    
    for (const [issue, count] of Object.entries(data.issues)) {
      const percentage = (count / data.total) * 100;
      if (percentage > 30) {
        specialists.push({
          viceChair,
          issue,
          count,
          totalDecisions: data.total,
          percentage: percentage.toFixed(1)
        });
      }
    }
  }
  
  specialists.sort((a, b) => b.percentage - a.percentage);
  
  return { viceChairIssues, specialists: specialists.slice(0, 50) };
}

// 4. BODY PART INJURY PATTERNS
function analyzeBodyPartPatterns(decisions) {
  console.log('\n🦴 Analyzing body part injury patterns...');
  
  const bodyPartCounts = {};
  const bodyPartWithIssue = {};
  
  for (const bodyPart of Object.keys(BODY_PARTS)) {
    bodyPartCounts[bodyPart] = 0;
    bodyPartWithIssue[bodyPart] = {};
    for (const issue of Object.keys(LEGAL_ISSUES)) {
      bodyPartWithIssue[bodyPart][issue] = 0;
    }
  }
  
  for (const decision of decisions) {
    const text = `${decision.DecKeywords || ''} ${decision.DecSummary || ''}`.toLowerCase();
    
    const detectedBodyParts = [];
    for (const [bodyPart, pattern] of Object.entries(BODY_PARTS)) {
      if (pattern.test(text)) {
        bodyPartCounts[bodyPart]++;
        detectedBodyParts.push(bodyPart);
      }
    }
    
    const detectedIssues = [];
    for (const [issue, pattern] of Object.entries(LEGAL_ISSUES)) {
      if (pattern.test(text)) {
        detectedIssues.push(issue);
      }
    }
    
    // Cross-reference body parts with issues
    for (const bodyPart of detectedBodyParts) {
      for (const issue of detectedIssues) {
        bodyPartWithIssue[bodyPart][issue]++;
      }
    }
  }
  
  const sortedBodyParts = Object.entries(bodyPartCounts)
    .map(([bodyPart, count]) => ({ bodyPart, count, percentage: ((count / decisions.length) * 100).toFixed(2) }))
    .sort((a, b) => b.count - a.count);
  
  return { bodyPartCounts: sortedBodyParts, bodyPartWithIssue };
}

// 5. MEDICAL SPECIALIST MENTIONS
function analyzeMedicalSpecialists(decisions) {
  console.log('\n🏥 Analyzing medical specialist mentions...');
  
  const specialistCounts = {};
  const specialistWithIssue = {};
  
  for (const specialist of Object.keys(MEDICAL_SPECIALISTS)) {
    specialistCounts[specialist] = 0;
    specialistWithIssue[specialist] = {};
    for (const issue of Object.keys(LEGAL_ISSUES)) {
      specialistWithIssue[specialist][issue] = 0;
    }
  }
  
  for (const decision of decisions) {
    const text = `${decision.DecKeywords || ''} ${decision.DecSummary || ''}`.toLowerCase();
    
    const detectedSpecialists = [];
    for (const [specialist, pattern] of Object.entries(MEDICAL_SPECIALISTS)) {
      if (pattern.test(text)) {
        specialistCounts[specialist]++;
        detectedSpecialists.push(specialist);
      }
    }
    
    const detectedIssues = [];
    for (const [issue, pattern] of Object.entries(LEGAL_ISSUES)) {
      if (pattern.test(text)) {
        detectedIssues.push(issue);
      }
    }
    
    for (const specialist of detectedSpecialists) {
      for (const issue of detectedIssues) {
        specialistWithIssue[specialist][issue]++;
      }
    }
  }
  
  const sortedSpecialists = Object.entries(specialistCounts)
    .map(([specialist, count]) => ({ specialist, count, percentage: ((count / decisions.length) * 100).toFixed(2) }))
    .sort((a, b) => b.count - a.count);
  
  return { specialistCounts: sortedSpecialists, specialistWithIssue };
}

// 6. POLICY CITATION ANALYSIS
function analyzePolicyCitations(decisions) {
  console.log('\n📜 Analyzing WSIB policy citations...');
  
  const policyCounts = {};
  const policyWithIssue = {};
  
  for (const policy of Object.keys(WSIB_POLICIES)) {
    policyCounts[policy] = 0;
    policyWithIssue[policy] = {};
    for (const issue of Object.keys(LEGAL_ISSUES)) {
      policyWithIssue[policy][issue] = 0;
    }
  }
  
  for (const decision of decisions) {
    const text = `${decision.DecKeywords || ''} ${decision.DecSummary || ''}`.toLowerCase();
    
    const detectedPolicies = [];
    for (const [policy, pattern] of Object.entries(WSIB_POLICIES)) {
      if (pattern.test(text)) {
        policyCounts[policy]++;
        detectedPolicies.push(policy);
      }
    }
    
    const detectedIssues = [];
    for (const [issue, pattern] of Object.entries(LEGAL_ISSUES)) {
      if (pattern.test(text)) {
        detectedIssues.push(issue);
      }
    }
    
    for (const policy of detectedPolicies) {
      for (const issue of detectedIssues) {
        policyWithIssue[policy][issue]++;
      }
    }
  }
  
  const sortedPolicies = Object.entries(policyCounts)
    .map(([policy, count]) => ({ policy, count, percentage: ((count / decisions.length) * 100).toFixed(2) }))
    .sort((a, b) => b.count - a.count);
  
  return { policyCounts: sortedPolicies, policyWithIssue };
}

// 7. DECISION COMPLEXITY ANALYSIS
function analyzeDecisionComplexity(decisions) {
  console.log('\n🧩 Analyzing decision complexity...');
  
  const complexityDistribution = {
    'Simple (1 issue)': 0,
    'Moderate (2-3 issues)': 0,
    'Complex (4-5 issues)': 0,
    'Highly Complex (6+ issues)': 0
  };
  
  const complexDecisions = [];
  
  for (const decision of decisions) {
    const text = `${decision.DecKeywords || ''} ${decision.DecSummary || ''}`.toLowerCase();
    
    let issueCount = 0;
    const presentIssues = [];
    for (const [issue, pattern] of Object.entries(LEGAL_ISSUES)) {
      if (pattern.test(text)) {
        issueCount++;
        presentIssues.push(issue);
      }
    }
    
    if (issueCount === 1) complexityDistribution['Simple (1 issue)']++;
    else if (issueCount >= 2 && issueCount <= 3) complexityDistribution['Moderate (2-3 issues)']++;
    else if (issueCount >= 4 && issueCount <= 5) complexityDistribution['Complex (4-5 issues)']++;
    else if (issueCount >= 6) {
      complexityDistribution['Highly Complex (6+ issues)']++;
      complexDecisions.push({
        decisionNumber: decision.decisionNumber,
        year: decision.year,
        issueCount,
        issues: presentIssues,
        viceChair: decision.Vicechair
      });
    }
  }
  
  complexDecisions.sort((a, b) => b.issueCount - a.issueCount);
  
  return { complexityDistribution, mostComplexDecisions: complexDecisions.slice(0, 100) };
}

// 8. OUTCOME INDICATORS ANALYSIS
function analyzeOutcomeIndicators(decisions) {
  console.log('\n⚖️ Analyzing outcome indicators...');
  
  const outcomeCounts = {};
  const outcomeByIssue = {};
  
  for (const outcome of Object.keys(OUTCOME_INDICATORS)) {
    outcomeCounts[outcome] = 0;
    outcomeByIssue[outcome] = {};
    for (const issue of Object.keys(LEGAL_ISSUES)) {
      outcomeByIssue[outcome][issue] = 0;
    }
  }
  
  for (const decision of decisions) {
    const text = `${decision.DecKeywords || ''} ${decision.DecSummary || ''}`.toLowerCase();
    
    const detectedOutcomes = [];
    for (const [outcome, pattern] of Object.entries(OUTCOME_INDICATORS)) {
      if (pattern.test(text)) {
        outcomeCounts[outcome]++;
        detectedOutcomes.push(outcome);
      }
    }
    
    const detectedIssues = [];
    for (const [issue, pattern] of Object.entries(LEGAL_ISSUES)) {
      if (pattern.test(text)) {
        detectedIssues.push(issue);
      }
    }
    
    for (const outcome of detectedOutcomes) {
      for (const issue of detectedIssues) {
        outcomeByIssue[outcome][issue]++;
      }
    }
  }
  
  const sortedOutcomes = Object.entries(outcomeCounts)
    .map(([outcome, count]) => ({ outcome, count, percentage: ((count / decisions.length) * 100).toFixed(2) }))
    .sort((a, b) => b.count - a.count);
  
  return { outcomeCounts: sortedOutcomes, outcomeByIssue };
}

// 9. GENERATE VISUALIZATION NETWORK DATA
function generateVisualizationNetwork(cooccurrenceData, decisions) {
  console.log('\n🕸️ Generating keyword network visualization data...');
  
  const nodes = [];
  const links = [];
  
  // Count total occurrences for node sizing
  const nodeCounts = {};
  for (const decision of decisions) {
    const text = `${decision.DecKeywords || ''} ${decision.DecSummary || ''}`.toLowerCase();
    for (const [keyword, pattern] of Object.entries(LEGAL_ISSUES)) {
      if (pattern.test(text)) {
        nodeCounts[keyword] = (nodeCounts[keyword] || 0) + 1;
      }
    }
  }
  
  // Create nodes
  for (const [keyword, count] of Object.entries(nodeCounts)) {
    nodes.push({
      id: keyword,
      label: keyword,
      value: count,
      percentage: ((count / decisions.length) * 100).toFixed(2)
    });
  }
  
  // Create links from top pairs
  for (const pair of cooccurrenceData.topPairs) {
    links.push({
      source: pair.keyword1,
      target: pair.keyword2,
      value: pair.count,
      percentage: pair.percentage
    });
  }
  
  return { nodes, links };
}

// MAIN EXECUTION
async function main() {
  console.log('🕵️ WSIAT DEEP DIVE ANALYSIS - SUPER DETECTIVE MODE');
  console.log('================================================\n');
  
  const decisions = await loadAllDecisions();
  console.log(`✓ Loaded ${decisions.length.toLocaleString()} decisions`);
  
  const results = {};
  
  // 1. Keyword co-occurrence
  results.cooccurrence = analyzeKeywordCooccurrence(decisions);
  console.log(`✓ Found ${results.cooccurrence.topPairs.length} keyword pairs`);
  
  // 2. Temporal evolution
  results.temporal = analyzeTemporalEvolution(decisions);
  console.log(`✓ Analyzed ${Object.keys(results.temporal.evolution).length} keywords across 40 years`);
  
  // 3. Vice-chair specialization
  results.viceChairSpecialization = analyzeViceChairSpecialization(decisions);
  console.log(`✓ Identified ${results.viceChairSpecialization.specialists.length} vice-chair specialists`);
  
  // 4. Body part patterns
  results.bodyParts = analyzeBodyPartPatterns(decisions);
  console.log(`✓ Analyzed ${results.bodyParts.bodyPartCounts.length} body part patterns`);
  
  // 5. Medical specialists
  results.specialists = analyzeMedicalSpecialists(decisions);
  console.log(`✓ Found ${results.specialists.specialistCounts.filter(s => s.count > 0).length} medical specialists mentioned`);
  
  // 6. Policy citations
  results.policies = analyzePolicyCitations(decisions);
  console.log(`✓ Analyzed ${results.policies.policyCounts.filter(p => p.count > 0).length} policy citations`);
  
  // 7. Decision complexity
  results.complexity = analyzeDecisionComplexity(decisions);
  console.log(`✓ Categorized ${decisions.length.toLocaleString()} decisions by complexity`);
  
  // 8. Outcome indicators
  results.outcomes = analyzeOutcomeIndicators(decisions);
  console.log(`✓ Detected ${results.outcomes.outcomeCounts.filter(o => o.count > 0).length} outcome types`);
  
  // 9. Visualization network
  const vizNetwork = generateVisualizationNetwork(results.cooccurrence, decisions);
  console.log(`✓ Generated network with ${vizNetwork.nodes.length} nodes and ${vizNetwork.links.length} links`);
  
  // Save all results
  console.log('\n💾 Saving analysis results...');
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'keyword-cooccurrence.json'),
    JSON.stringify(results.cooccurrence, null, 2)
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'temporal-evolution.json'),
    JSON.stringify(results.temporal, null, 2)
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'vice-chair-specialization.json'),
    JSON.stringify(results.viceChairSpecialization, null, 2)
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'body-part-patterns.json'),
    JSON.stringify(results.bodyParts, null, 2)
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'medical-specialists.json'),
    JSON.stringify(results.specialists, null, 2)
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'policy-citations.json'),
    JSON.stringify(results.policies, null, 2)
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'decision-complexity.json'),
    JSON.stringify(results.complexity, null, 2)
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'outcome-indicators.json'),
    JSON.stringify(results.outcomes, null, 2)
  );
  
  fs.writeFileSync(
    VIZ_OUTPUT,
    JSON.stringify(vizNetwork, null, 2)
  );
  
  // Generate summary report
  const summary = generateSummaryReport(results, vizNetwork, decisions);
  fs.writeFileSync(
    path.join(__dirname, '../docs/WSIAT-DEEP-DIVE-REPORT-2026-04-29.md'),
    summary
  );
  
  console.log('\n✅ ANALYSIS COMPLETE!');
  console.log(`\n📊 Results saved to: ${OUTPUT_DIR}`);
  console.log(`🕸️ Visualization: ${VIZ_OUTPUT}`);
  console.log(`📄 Report: docs/WSIAT-DEEP-DIVE-REPORT-2026-04-29.md`);
  
  // Print key insights
  printKeyInsights(results, vizNetwork);
}

function generateSummaryReport(results, vizNetwork, decisions) {
  return `# WSIAT Deep Dive Analysis Report
## Super Detective Mode 🕵️ - 98,992 Decisions

**Generated:** ${new Date().toISOString().split('T')[0]}  
**Total Decisions:** ${decisions.length.toLocaleString()}  
**Analysis Depth:** 9 advanced pattern categories

---

## 🔗 1. Keyword Co-Occurrence Patterns

### Top 10 Keyword Pairs (Issues That Appear Together)

| Rank | Keyword 1 | Keyword 2 | Co-Occurrences | % of Decisions |
|------|-----------|-----------|----------------|----------------|
${results.cooccurrence.topPairs.slice(0, 10).map((pair, idx) => 
  `| ${idx + 1} | ${pair.keyword1} | ${pair.keyword2} | ${pair.count.toLocaleString()} | ${pair.percentage}% |`
).join('\n')}

**Insight:** These pairs indicate common appeal combinations. For example, if NEL + Chronic Pain appear together frequently, create a guide addressing both.

---

## 📈 2. Temporal Evolution (40 Years)

### Issue Trends by Decade

${Object.keys(LEGAL_ISSUES).slice(0, 5).map(keyword => {
  const decadeData = results.temporal.decadeTrends[keyword];
  return `**${keyword}:**
- 1980s: ${decadeData['80s'] || 0}
- 1990s: ${decadeData['90s'] || 0}
- 2000s: ${decadeData['00s'] || 0}
- 2010s: ${decadeData['10s'] || 0}
- 2020s: ${decadeData['20s'] || 0}
`;
}).join('\n')}

---

## 👨‍⚖️ 3. Vice-Chair Specialization

### Top 10 Specialists (Vice-Chairs with >30% Focus on Specific Issues)

| Rank | Vice-Chair | Specialization | Cases | % of Their Work |
|------|------------|----------------|-------|-----------------|
${results.viceChairSpecialization.specialists.slice(0, 10).map((spec, idx) =>
  `| ${idx + 1} | ${spec.viceChair} | ${spec.issue} | ${spec.count.toLocaleString()} | ${spec.percentage}% |`
).join('\n')}

**Insight:** These vice-chairs handle disproportionately high volumes of specific issues, suggesting expertise.

---

## 🦴 4. Body Part Injury Patterns

### Most Common Injuries

| Rank | Body Part | Cases | % of Decisions |
|------|-----------|-------|----------------|
${results.bodyParts.bodyPartCounts.slice(0, 10).map((bp, idx) =>
  `| ${idx + 1} | ${bp.bodyPart} | ${bp.count.toLocaleString()} | ${bp.percentage}% |`
).join('\n')}

---

## 🏥 5. Medical Specialist Mentions

### Top 5 Specialists Referenced

| Rank | Specialist Type | Mentions | % of Decisions |
|------|----------------|----------|----------------|
${results.specialists.specialistCounts.slice(0, 5).map((spec, idx) =>
  `| ${idx + 1} | ${spec.specialist} | ${spec.count.toLocaleString()} | ${spec.percentage}% |`
).join('\n')}

---

## 📜 6. WSIB Policy Citations

### Most Cited Policies

| Rank | Policy/Section | Citations | % of Decisions |
|------|---------------|-----------|----------------|
${results.policies.policyCounts.filter(p => p.count > 0).slice(0, 5).map((pol, idx) =>
  `| ${idx + 1} | ${pol.policy} | ${pol.count.toLocaleString()} | ${pol.percentage}% |`
).join('\n')}

---

## 🧩 7. Decision Complexity Distribution

| Complexity Level | Count | % of Total |
|------------------|-------|------------|
${Object.entries(results.complexity.complexityDistribution).map(([level, count]) =>
  `| ${level} | ${count.toLocaleString()} | ${((count / decisions.length) * 100).toFixed(2)}% |`
).join('\n')}

### Top 5 Most Complex Decisions

${results.complexity.mostComplexDecisions.slice(0, 5).map((dec, idx) =>
  `${idx + 1}. **Decision ${dec.decisionNumber}/${dec.year}** - ${dec.issueCount} issues: ${dec.issues.join(', ')}`
).join('\n')}

---

## ⚖️ 8. Outcome Indicators

### Detected Outcomes

| Outcome | Mentions | % of Decisions |
|---------|----------|----------------|
${results.outcomes.outcomeCounts.map(outcome =>
  `| ${outcome.outcome} | ${outcome.count.toLocaleString()} | ${outcome.percentage}% |`
).join('\n')}

**Note:** These are text-based indicators, not definitive outcomes. Many decisions don't explicitly state outcomes in keywords/summaries.

---

## 🕸️ 9. Keyword Network Visualization

**Network Stats:**
- **Nodes:** ${vizNetwork.nodes.length} keywords
- **Links:** ${vizNetwork.links.length} co-occurrence connections
- **Strongest Link:** ${results.cooccurrence.topPairs[0].keyword1} ↔ ${results.cooccurrence.topPairs[0].keyword2} (${results.cooccurrence.topPairs[0].count.toLocaleString()} cases)

**Visualization File:** \`/data/visualizations/wsiat-keyword-network.json\`

---

## 🎯 Key Insights for Knowledge Base

### 1. Create Multi-Issue Guides

Top co-occurring pairs suggest users need guides addressing:
${results.cooccurrence.topPairs.slice(0, 5).map((pair, idx) =>
  `${idx + 1}. **${pair.keyword1} + ${pair.keyword2}** (${pair.count.toLocaleString()} cases)`
).join('\n')}

### 2. Body Part-Specific Templates

Most common injuries warrant specialized templates:
${results.bodyParts.bodyPartCounts.slice(0, 5).map((bp, idx) =>
  `${idx + 1}. **${bp.bodyPart}** (${bp.count.toLocaleString()} cases)`
).join('\n')}

### 3. Specialist Referral Guide

Create "Which Specialist Do I Need?" guide featuring:
${results.specialists.specialistCounts.slice(0, 5).map((spec, idx) =>
  `${idx + 1}. **${spec.specialist}** (mentioned in ${spec.percentage}% of decisions)`
).join('\n')}

### 4. Policy Citation Patterns

Most-cited policies need dedicated explainers:
${results.policies.policyCounts.filter(p => p.count > 0).slice(0, 5).map((pol, idx) =>
  `${idx + 1}. **${pol.policy}** (${pol.count.toLocaleString()} citations)`
).join('\n')}

---

## 📊 Data Files

All analysis results saved to:
- \`/data/tribunal-decisions/wsiat/deep-analysis/keyword-cooccurrence.json\`
- \`/data/tribunal-decisions/wsiat/deep-analysis/temporal-evolution.json\`
- \`/data/tribunal-decisions/wsiat/deep-analysis/vice-chair-specialization.json\`
- \`/data/tribunal-decisions/wsiat/deep-analysis/body-part-patterns.json\`
- \`/data/tribunal-decisions/wsiat/deep-analysis/medical-specialists.json\`
- \`/data/tribunal-decisions/wsiat/deep-analysis/policy-citations.json\`
- \`/data/tribunal-decisions/wsiat/deep-analysis/decision-complexity.json\`
- \`/data/tribunal-decisions/wsiat/deep-analysis/outcome-indicators.json\`
- \`/data/visualizations/wsiat-keyword-network.json\`

---

**Generated by:** WSIAT Deep Dive Analysis v2.0  
**License:** Open Data (CC BY 4.0)
`;
}

function printKeyInsights(results, vizNetwork) {
  console.log('\n========================================');
  console.log('🔍 KEY INSIGHTS');
  console.log('========================================\n');
  
  console.log('Top 3 Keyword Pairs:');
  results.cooccurrence.topPairs.slice(0, 3).forEach((pair, idx) => {
    console.log(`  ${idx + 1}. ${pair.keyword1} + ${pair.keyword2}: ${pair.count.toLocaleString()} cases (${pair.percentage}%)`);
  });
  
  console.log('\nTop 3 Body Parts:');
  results.bodyParts.bodyPartCounts.slice(0, 3).forEach((bp, idx) => {
    console.log(`  ${idx + 1}. ${bp.bodyPart}: ${bp.count.toLocaleString()} cases (${bp.percentage}%)`);
  });
  
  console.log('\nMost Mentioned Specialists:');
  results.specialists.specialistCounts.slice(0, 3).forEach((spec, idx) => {
    console.log(`  ${idx + 1}. ${spec.specialist}: ${spec.count.toLocaleString()} mentions (${spec.percentage}%)`);
  });
  
  console.log('\nComplexity Distribution:');
  Object.entries(results.complexity.complexityDistribution).forEach(([level, count]) => {
    const pct = ((count / 99036) * 100).toFixed(1);
    console.log(`  ${level}: ${count.toLocaleString()} (${pct}%)`);
  });
  
  console.log('\n========================================\n');
}

main().catch(console.error);
