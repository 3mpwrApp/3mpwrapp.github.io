const fs = require('fs');
const path = require('path');

const dataDir = 'data/tribunal-decisions';

console.log('=== ONSBT COMPREHENSIVE ANALYSIS 2020-2026 ===\n');

let allCases = [];
let yearData = {};

// Load all ONSBT data
for (let year = 2020; year <= 2026; year++) {
  const file = path.join(dataDir, `onsbt-${year}-complete.json`);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    yearData[year] = {
      count: data.length,
      cases: data
    };
    allCases = allCases.concat(data);
    console.log(`✓ Loaded ${year}: ${data.length} cases`);
  }
}

console.log(`\n✓ TOTAL ONSBT CASES: ${allCases.length}\n`);

// Analysis: Data Quality
console.log('=== DATA QUALITY ASSESSMENT ===\n');

let dataQualityStats = {
  has_full_text: 0,
  has_keywords: 0,
  has_outcome: 0,
  has_legislation: 0,
  full_outcome: 0,
  unknown_outcome: 0,
  deferred_outcome: 0
};

let keywordFrequency = {};
let outcomeFrequency = {};
let legislationFrequency = {};

allCases.forEach(caseObj => {
  // Data quality
  if (caseObj.data_quality) {
    if (caseObj.data_quality.has_full_text) dataQualityStats.has_full_text++;
    if (caseObj.data_quality.has_keywords) dataQualityStats.has_keywords++;
    if (caseObj.data_quality.has_outcome) dataQualityStats.has_outcome++;
    if (caseObj.data_quality.has_legislation) dataQualityStats.has_legislation++;
  }

  // Outcomes
  if (caseObj.outcome) {
    outcomeFrequency[caseObj.outcome] = (outcomeFrequency[caseObj.outcome] || 0) + 1;
    if (caseObj.outcome !== 'Unknown') dataQualityStats.full_outcome++;
    if (caseObj.outcome === 'Unknown') dataQualityStats.unknown_outcome++;
    if (caseObj.outcome === 'Deferred') dataQualityStats.deferred_outcome++;
  }

  // Keywords
  if (caseObj.keywords_api && Array.isArray(caseObj.keywords_api)) {
    caseObj.keywords_api.forEach(keyword => {
      keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1;
    });
  }

  // Legislation
  if (caseObj.legislation_cited && Array.isArray(caseObj.legislation_cited)) {
    caseObj.legislation_cited.forEach(leg => {
      legislationFrequency[leg] = (legislationFrequency[leg] || 0) + 1;
    });
  }
});

console.log(`Cases with full text: ${dataQualityStats.has_full_text} (${(dataQualityStats.has_full_text / allCases.length * 100).toFixed(1)}%)`);
console.log(`Cases with keywords: ${dataQualityStats.has_keywords} (${(dataQualityStats.has_keywords / allCases.length * 100).toFixed(1)}%)`);
console.log(`Cases with outcome: ${dataQualityStats.has_outcome} (${(dataQualityStats.has_outcome / allCases.length * 100).toFixed(1)}%)`);
console.log(`Cases with legislation: ${dataQualityStats.has_legislation} (${(dataQualityStats.has_legislation / allCases.length * 100).toFixed(1)}%)`);

console.log('\n=== OUTCOME DISTRIBUTION ===\n');
Object.entries(outcomeFrequency)
  .sort((a, b) => b[1] - a[1])
  .forEach(([outcome, count]) => {
    console.log(`${outcome}: ${count} (${(count / allCases.length * 100).toFixed(1)}%)`);
  });

console.log('\n=== TOP 20 KEYWORDS (indicating case subject matter) ===\n');
Object.entries(keywordFrequency)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([keyword, count]) => {
    console.log(`${keyword}: ${count}`);
  });

console.log('\n=== ACCESSIBILITY-RELATED KEYWORDS ===\n');
const accessibilityKeywords = Object.entries(keywordFrequency)
  .filter(([keyword]) => 
    keyword.toLowerCase().includes('disability') ||
    keyword.toLowerCase().includes('disabled') ||
    keyword.toLowerCase().includes('accessible') ||
    keyword.toLowerCase().includes('accommodation') ||
    keyword.toLowerCase().includes('barrier') ||
    keyword.toLowerCase().includes('mental health') ||
    keyword.toLowerCase().includes('impairment') ||
    keyword.toLowerCase().includes('vision') ||
    keyword.toLowerCase().includes('hearing') ||
    keyword.toLowerCase().includes('mobility')
  )
  .sort((a, b) => b[1] - a[1]);

if (accessibilityKeywords.length > 0) {
  accessibilityKeywords.forEach(([keyword, count]) => {
    console.log(`${keyword}: ${count}`);
  });
} else {
  console.log('(None detected in keywords)');
}

console.log('\n=== YEAR-OVER-YEAR BREAKDOWN ===\n');
for (let year = 2020; year <= 2026; year++) {
  if (yearData[year]) {
    const yearCases = yearData[year].cases;
    const yearOutcomes = {};
    const yearDisability = yearCases.filter(c => c.keywords_api && 
      c.keywords_api.some(k => 
        k.toLowerCase().includes('disability') || 
        k.toLowerCase().includes('impairment')
      )).length;
    
    yearCases.forEach(c => {
      if (c.outcome) {
        yearOutcomes[c.outcome] = (yearOutcomes[c.outcome] || 0) + 1;
      }
    });

    console.log(`${year}: ${yearCases.length} cases | Disability-related: ${yearDisability} (${(yearDisability/yearCases.length*100).toFixed(1)}%)`);
    const outcomeStr = Object.entries(yearOutcomes)
      .map(([o, c]) => `${o}:${c}`)
      .join(' | ');
    console.log(`  Outcomes: ${outcomeStr || 'All Unknown'}`);
  }
}

console.log('\n=== KEY FINDINGS ===\n');

// Data quality insight
const fullTextPercent = (dataQualityStats.has_full_text / allCases.length * 100).toFixed(1);
console.log(`📊 Data Quality: Only ${fullTextPercent}% of cases have full text available`);

// Outcome insight
const unknownPercent = (dataQualityStats.unknown_outcome / allCases.length * 100).toFixed(1);
console.log(`⚠️  Outcome Obscurity: ${unknownPercent}% of cases have unknown outcomes`);

// Accessibility insight
const disabilityCases = Object.entries(keywordFrequency)
  .filter(([k]) => k.toLowerCase().includes('disability'))
  .reduce((sum, [, count]) => sum + count, 0);
console.log(`♿ Accessibility: ~${disabilityCases} case references to disability matters`);

// Temporal insight
const casesByYear = Object.entries(yearData)
  .map(([year, data]) => parseInt(year) * 1000 + data.count)
  .sort((a, b) => a - b);
const avgCases = (allCases.length / 7).toFixed(0);
console.log(`📈 Temporal Pattern: Average ${avgCases} cases/year (spike in 2025: ${yearData[2025]?.count || 0} cases)`);

console.log('\n=== LEGISLATIVE FRAMEWORK (Top Cited) ===\n');
if (Object.keys(legislationFrequency).length > 0) {
  Object.entries(legislationFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([leg, count]) => {
      console.log(`${leg}: ${count}`);
    });
} else {
  console.log('(No legislation data extracted - may require full text analysis)');
}
