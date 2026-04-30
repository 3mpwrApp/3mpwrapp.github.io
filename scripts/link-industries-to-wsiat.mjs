#!/usr/bin/env node
/**
 * Link WSIB Premium Rate Groups to WSIAT Decisions
 * 
 * Purpose: Extract industry classifications from WSIAT decision text
 * and link to WSIB Premium Rate Groups for industry-specific analysis
 * 
 * Inputs:
 *   - wsiat-ultra-complete.json (98,992 decisions)
 *   - premium-rates-ultra-complete.json (664 rate groups)
 * 
 * Output:
 *   - wsiat-with-industries.json (decisions with industry codes)
 *   - industry-injury-correlation.json (injury patterns by industry)
 * 
 * Method: Full-text keyword matching for industry mentions
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// File paths
const PATHS = {
  wsiatData: join(__dirname, '../../../temp-large-files/wsiat-ultra-complete.json'),
  premiumRates: join(__dirname, '../../../temp-large-files/premium-rates-ultra-complete.json'),
  output: join(__dirname, '../data/comprehensive-extraction/wsiat-with-industries.json'),
  correlations: join(__dirname, '../data/comprehensive-extraction/industry-injury-correlation.json'),
};

// Industry keyword mappings to Premium Rate Groups
const INDUSTRY_KEYWORDS = {
  // Healthcare & Social Services (Rate Groups 860-879)
  healthcare: {
    rateGroup: '863',
    name: 'Healthcare & Social Assistance',
    keywords: ['hospital', 'nursing', 'healthcare', 'medical', 'nurse', 'doctor', 'clinic', 'health care', 'patient care', 'psw', 'personal support worker', 'home care'],
  },
  
  // Construction (Rate Groups 701-749)
  construction: {
    rateGroup: '732',
    name: 'Construction - General',
    keywords: ['construction', 'builder', 'contractor', 'carpentry', 'carpenter', 'roofing', 'framing', 'drywall', 'concrete', 'excavation', 'building site', 'job site'],
  },
  
  // Manufacturing (Rate Groups 200-599)
  manufacturing: {
    rateGroup: '401',
    name: 'Manufacturing - General',
    keywords: ['manufacturing', 'factory', 'production', 'assembly', 'plant', 'fabrication', 'machinist', 'machine operator', 'production line'],
  },
  
  // Transportation & Warehousing (Rate Groups 600-699)
  transportation: {
    rateGroup: '651',
    name: 'Transportation & Warehousing',
    keywords: ['trucking', 'truck driver', 'driver', 'warehouse', 'logistics', 'shipping', 'delivery', 'courier', 'forklift', 'loading dock'],
  },
  
  // Retail Trade (Rate Groups 880-899)
  retail: {
    rateGroup: '890',
    name: 'Retail Trade',
    keywords: ['retail', 'store', 'cashier', 'sales associate', 'grocery', 'supermarket', 'shop', 'clerk', 'customer service'],
  },
  
  // Food Services (Rate Groups 910-929)
  foodServices: {
    rateGroup: '921',
    name: 'Food Services & Accommodation',
    keywords: ['restaurant', 'kitchen', 'cook', 'chef', 'server', 'waitress', 'waiter', 'hotel', 'hospitality', 'food service'],
  },
  
  // Agriculture & Forestry (Rate Groups 101-199)
  agriculture: {
    rateGroup: '141',
    name: 'Agriculture & Forestry',
    keywords: ['farm', 'farming', 'agriculture', 'forestry', 'lumber', 'logging', 'agricultural', 'crop', 'livestock', 'orchard'],
  },
  
  // Mining & Extraction (Rate Groups 1-99)
  mining: {
    rateGroup: '011',
    name: 'Mining & Extraction',
    keywords: ['mining', 'mine', 'quarry', 'extraction', 'underground', 'miner', 'ore'],
  },
  
  // Education (Rate Groups 930-939)
  education: {
    rateGroup: '931',
    name: 'Educational Services',
    keywords: ['school', 'teacher', 'education', 'university', 'college', 'daycare', 'childcare', 'educational assistant', 'ea'],
  },
  
  // Public Administration (Rate Groups 940-999)
  publicAdmin: {
    rateGroup: '951',
    name: 'Public Administration',
    keywords: ['municipal', 'city', 'government', 'police', 'fire', 'firefighter', 'paramedic', 'ems', 'public works', 'municipal worker'],
  },
};

/**
 * Load WSIAT decisions
 */
function loadWSIATDecisions() {
  console.log('📂 Loading WSIAT decisions...');
  
  if (!existsSync(PATHS.wsiatData)) {
    throw new Error('WSIAT data not found. Large files may have been moved for deployment.');
  }
  
  const content = readFileSync(PATHS.wsiatData, 'utf8');
  const data = JSON.parse(content);
  const decisions = Array.isArray(data) ? data : (data.decisions || []);
  
  console.log(`   ✅ Loaded ${decisions.length.toLocaleString()} decisions`);
  return decisions;
}

/**
 * Load Premium Rate Groups
 */
function loadPremiumRates() {
  console.log('📂 Loading premium rate groups...');
  
  if (!existsSync(PATHS.premiumRates)) {
    console.log('   ⚠️  Premium rates file not found (moved for deployment)');
    console.log('   Using hardcoded industry classifications');
    return Object.values(INDUSTRY_KEYWORDS);
  }
  
  const content = readFileSync(PATHS.premiumRates, 'utf8');
  const data = JSON.parse(content);
  
  console.log(`   ✅ Loaded ${data.length} rate groups`);
  return data;
}

/**
 * Extract industry from decision text using keyword matching
 */
function extractIndustry(decision) {
  const text = (decision.summary || '').toLowerCase();
  
  // Check each industry's keywords
  for (const [industryKey, industry] of Object.entries(INDUSTRY_KEYWORDS)) {
    for (const keyword of industry.keywords) {
      if (text.includes(keyword)) {
        return {
          industryKey,
          industryName: industry.name,
          rateGroup: industry.rateGroup,
          matchedKeyword: keyword,
          confidence: 'keyword-matched',
        };
      }
    }
  }
  
  return {
    industryKey: 'unknown',
    industryName: 'Unknown/Not Detected',
    rateGroup: null,
    matchedKeyword: null,
    confidence: 'undetected',
  };
}

/**
 * Extract injury type from decision (reuse from aggregate-real-data.mjs)
 */
function extractInjuryType(decision) {
  const text = (decision.summary || '').toLowerCase();
  
  const injuryPatterns = {
    'back': ['back', 'spine', 'lumbar', 'disc', 'vertebra'],
    'hearing': ['hearing', 'deaf', 'tinnitus', 'acoustic', 'auditory'],
    'chronic_pain': ['chronic pain', 'crps', 'fibromyalgia', 'persistent pain'],
    'shoulder': ['shoulder', 'rotator cuff', 'clavicle'],
    'knee': ['knee', 'meniscus', 'acl', 'patella'],
    'mental': ['mental', 'psychological', 'ptsd', 'depression', 'anxiety', 'stress'],
    'repetitive': ['repetitive', 'carpal tunnel', 'tendonitis', 'rsi'],
    'fracture': ['fracture', 'broken', 'break'],
    'amputation': ['amputation', 'amputate', 'loss of limb'],
    'concussion': ['concussion', 'traumatic brain', 'tbi', 'head injury'],
  };
  
  const detectedInjuries = [];
  
  for (const [injury, keywords] of Object.entries(injuryPatterns)) {
    if (keywords.some(kw => text.includes(kw))) {
      detectedInjuries.push(injury);
    }
  }
  
  return detectedInjuries;
}

/**
 * Link industries to decisions
 */
function linkIndustries(decisions) {
  console.log('\n🔗 Linking industries to decisions...');
  
  const linked = decisions.map((decision, index) => {
    if (index % 10000 === 0 && index > 0) {
      console.log(`   Progress: ${index.toLocaleString()}/${decisions.length.toLocaleString()}`);
    }
    
    const industry = extractIndustry(decision);
    const injuries = extractInjuryType(decision);
    
    return {
      ...decision,
      industry_key: industry.industryKey,
      industry_name: industry.industryName,
      rate_group: industry.rateGroup,
      industry_matched_keyword: industry.matchedKeyword,
      industry_confidence: industry.confidence,
      injury_types: injuries,
    };
  });
  
  console.log(`   ✅ Industry linking complete`);
  return linked;
}

/**
 * Generate industry × injury correlation matrix
 */
function generateCorrelations(linkedDecisions) {
  console.log('\n📊 Generating industry × injury correlations...');
  
  const matrix = {};
  const industryTotals = {};
  const injuryTotals = {};
  
  // Initialize matrix
  Object.keys(INDUSTRY_KEYWORDS).forEach(industry => {
    matrix[industry] = {};
    industryTotals[industry] = 0;
  });
  matrix['unknown'] = {};
  industryTotals['unknown'] = 0;
  
  // Count occurrences
  linkedDecisions.forEach(decision => {
    const industry = decision.industry_key || 'unknown';
    industryTotals[industry]++;
    
    decision.injury_types.forEach(injury => {
      if (!matrix[industry][injury]) {
        matrix[industry][injury] = 0;
      }
      matrix[industry][injury]++;
      
      if (!injuryTotals[injury]) {
        injuryTotals[injury] = 0;
      }
      injuryTotals[injury]++;
    });
  });
  
  // Calculate percentages
  const correlations = {};
  Object.entries(matrix).forEach(([industry, injuries]) => {
    correlations[industry] = {
      total: industryTotals[industry],
      injuries: {},
    };
    
    Object.entries(injuries).forEach(([injury, count]) => {
      const percentage = ((count / industryTotals[industry]) * 100).toFixed(1);
      correlations[industry].injuries[injury] = {
        count,
        percentage: parseFloat(percentage),
      };
    });
    
    // Sort by count descending
    correlations[industry].injuries = Object.fromEntries(
      Object.entries(correlations[industry].injuries)
        .sort((a, b) => b[1].count - a[1].count)
    );
  });
  
  // Summary statistics
  const detectedIndustries = linkedDecisions.filter(d => d.industry_key !== 'unknown').length;
  const detectionRate = ((detectedIndustries / linkedDecisions.length) * 100).toFixed(1);
  
  console.log(`\n   📈 Industry Detection Summary:`);
  console.log(`   Total decisions: ${linkedDecisions.length.toLocaleString()}`);
  console.log(`   Detected industries: ${detectedIndustries.toLocaleString()} (${detectionRate}%)`);
  console.log(`   Unknown: ${industryTotals['unknown'].toLocaleString()}`);
  
  console.log(`\n   🏭 Top Industries:`);
  Object.entries(industryTotals)
    .filter(([key]) => key !== 'unknown')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([industry, count]) => {
      const pct = ((count / linkedDecisions.length) * 100).toFixed(1);
      console.log(`   ${INDUSTRY_KEYWORDS[industry]?.name || industry}: ${count.toLocaleString()} (${pct}%)`);
    });
  
  return {
    matrix: correlations,
    summary: {
      totalDecisions: linkedDecisions.length,
      detectedIndustries,
      detectionRate: parseFloat(detectionRate),
      industryTotals,
      injuryTotals,
    },
    metadata: {
      generated: new Date().toISOString(),
      method: 'keyword-matching',
      keywords: INDUSTRY_KEYWORDS,
    },
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 WSIAT Industry Linking System');
  console.log('=====================================\n');
  
  try {
    // Load data
    const decisions = loadWSIATDecisions();
    const premiumRates = loadPremiumRates();
    
    // Link industries
    const linked = linkIndustries(decisions);
    
    // Generate correlations
    const correlations = generateCorrelations(linked);
    
    // Save results
    console.log(`\n💾 Saving results...`);
    
    // Note: Not saving full dataset due to size (55MB)
    // Instead, save correlation matrix only
    console.log(`   Saving correlations to: ${PATHS.correlations}`);
    writeFileSync(PATHS.correlations, JSON.stringify(correlations, null, 2));
    console.log(`   ✅ Correlations saved`);
    
    // Save sample of linked decisions (first 1,000)
    const samplePath = PATHS.output.replace('.json', '-sample.json');
    const sample = linked.slice(0, 1000);
    console.log(`   Saving sample (n=1,000) to: ${samplePath}`);
    writeFileSync(samplePath, JSON.stringify(sample, null, 2));
    console.log(`   ✅ Sample saved`);
    
    // Summary for user
    console.log(`\n✨ Industry linking complete!`);
    console.log(`\n📊 Key Findings:`);
    console.log(`   Detection rate: ${correlations.summary.detectionRate}%`);
    console.log(`   Top industry: ${Object.entries(correlations.summary.industryTotals).filter(([k]) => k !== 'unknown').sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A'}`);
    console.log(`\n📝 Next Steps:`);
    console.log(`   1. Review correlations in: ${PATHS.correlations}`);
    console.log(`   2. Use for Task 11 (Generate industry-specific appeal guides)`);
    console.log(`   3. Update visualizations with industry breakdowns`);
    console.log(`\n⚠️  Note: Full dataset (55MB) not saved. Use sample or regenerate as needed.`);
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractIndustry, extractInjuryType, generateCorrelations };
