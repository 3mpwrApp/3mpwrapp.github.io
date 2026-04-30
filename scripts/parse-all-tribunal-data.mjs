#!/usr/bin/env node

/**
 * COMPREHENSIVE TRIBUNAL & WSIB DATA PARSER
 * 
 * Parses all converted CSV files from:
 * - WSIB Claims (Registered vs Allowed) → Suppression Funnel
 * - HRTO Decisions (39 quarterly files) → Abandonment Rates
 * - ONSBT Appeals (24 files) → Cross-Tribunal Comparison
 * - Mental Stress Claims → Mental Health Suppression
 * - Body Part Profiles → Claim Pattern Validation
 * - Fatality Data → Fatal Claim Suppression
 * 
 * THE SMOKING GUN: Registered - Allowed = Denied
 *                  WSIAT Appeals / Denied = Appeal Rate
 *                  Denied - Appeals = Suppression Gap
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_FOLDER = 'C:\\Users\\bookw\\Downloads\\converted-csv';
const OUTPUT_FOLDER = path.join(__dirname, '..', 'data', 'tribunal-comprehensive');

// Ensure output folder exists
if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
}

console.log('🔍 COMPREHENSIVE TRIBUNAL & WSIB DATA PARSER');
console.log('='.repeat(60));
console.log('');

// ============================================================================
// UTILITY: Parse CSV
// ============================================================================
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, idx) => {
                row[header] = values[idx];
            });
            rows.push(row);
        }
    }
    
    return rows;
}

// ============================================================================
// 1. WSIB REGISTERED VS ALLOWED CLAIMS (THE SMOKING GUN)
// ============================================================================
console.log('💣 PARSING WSIB CLAIM SUPPRESSION FUNNEL...');
console.log('');

let registeredData = null;
let allowedData = null;
let suppressionFunnel = null;

try {
    const registeredPath = path.join(CSV_FOLDER, 'Registered-claims.csv');
    const allowedPath = path.join(CSV_FOLDER, 'Allowed-claims.csv');
    
    if (fs.existsSync(registeredPath) && fs.existsSync(allowedPath)) {
        const registeredRows = parseCSV(registeredPath);
        const allowedRows = parseCSV(allowedPath);
        
        console.log(`   📊 Registered claims: ${registeredRows.length} rows`);
        console.log(`   ✅ Allowed claims: ${allowedRows.length} rows`);
        
        // Extract years and values
        registeredData = {
            source: 'WSIB Open Data - Registered Claims',
            rows: registeredRows,
            totalByYear: {}
        };
        
        allowedData = {
            source: 'WSIB Open Data - Allowed Claims',
            rows: allowedRows,
            totalByYear: {}
        };
        
        // Calculate suppression funnel
        suppressionFunnel = {
            methodology: 'Registered - Allowed = Denied; WSIAT Appeals / Denied = Appeal Rate',
            years: [],
            summary: {
                avgAppealRate: 0,
                avgSuppressionGap: 0
            }
        };
        
        // Process each year
        registeredRows.forEach((regRow, idx) => {
            const allowedRow = allowedRows[idx];
            if (allowedRow) {
                const year = regRow.Year || regRow[''] || `Year ${idx + 1}`;
                const registered = parseInt(regRow['Number of registered claims'] || regRow['Registered'] || '0');
                const allowed = parseInt(allowedRow['Number of allowed claims'] || allowedRow['Allowed'] || '0');
                const denied = registered - allowed;
                
                // WSIAT appeals: ~2,475/year average (98,992 over 40 years)
                const wsiatAppealsPerYear = 2475;
                const appealRate = denied > 0 ? (wsiatAppealsPerYear / denied * 100) : 0;
                const suppressionGap = denied - wsiatAppealsPerYear;
                
                suppressionFunnel.years.push({
                    year,
                    registered,
                    allowed,
                    denied,
                    wsiatAppeals: wsiatAppealsPerYear,
                    appealRate: parseFloat(appealRate.toFixed(2)),
                    suppressionGap,
                    suppressionRate: parseFloat(((suppressionGap / denied) * 100).toFixed(2))
                });
            }
        });
        
        // Calculate averages
        const validYears = suppressionFunnel.years.filter(y => y.denied > 0);
        suppressionFunnel.summary.avgAppealRate = parseFloat(
            (validYears.reduce((sum, y) => sum + y.appealRate, 0) / validYears.length).toFixed(2)
        );
        suppressionFunnel.summary.avgSuppressionGap = Math.round(
            validYears.reduce((sum, y) => sum + y.suppressionGap, 0) / validYears.length
        );
        suppressionFunnel.summary.totalDeniedPerYear = Math.round(
            validYears.reduce((sum, y) => sum + y.denied, 0) / validYears.length
        );
        
        console.log('');
        console.log('   🔥 THE SMOKING GUN:');
        console.log(`   📊 Avg Denied/Year: ${suppressionFunnel.summary.totalDeniedPerYear.toLocaleString()}`);
        console.log(`   ⚖️  WSIAT Appeals/Year: ${wsiatAppealsPerYear.toLocaleString()}`);
        console.log(`   📉 Avg Appeal Rate: ${suppressionFunnel.summary.avgAppealRate}%`);
        console.log(`   💀 Avg Suppression Gap: ${suppressionFunnel.summary.avgSuppressionGap.toLocaleString()} workers/year give up`);
        console.log('');
        
        const outputPath = path.join(OUTPUT_FOLDER, 'wsib-suppression-funnel.json');
        fs.writeFileSync(outputPath, JSON.stringify({
            registered: registeredData,
            allowed: allowedData,
            suppressionFunnel
        }, null, 2));
        
        console.log(`   💾 Saved: wsib-suppression-funnel.json`);
        console.log('');
    } else {
        console.log('   ⚠️  Registered claims.csv or Allowed claims.csv not found');
        console.log('');
    }
} catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    console.log('');
}

// ============================================================================
// 2. HRTO DECISIONS (ABANDONMENT ANALYSIS)
// ============================================================================
console.log('⚖️  PARSING HRTO DECISIONS (ABANDONMENT CRISIS)...');
console.log('');

const hrtoFiles = fs.readdirSync(CSV_FOLDER)
    .filter(f => f.startsWith('5 ') && f.endsWith('.csv'))
    .sort();

const hrtoData = {
    source: 'Tribunals Ontario Open Data - HRTO Decisions',
    quarterlyFiles: hrtoFiles.length,
    decisions: [],
    abandonmentAnalysis: {
        totalDecisions: 0,
        abandonedCount: 0,
        dismissedCount: 0,
        allowedCount: 0,
        abandonmentRate: 0
    }
};

console.log(`   📁 Found ${hrtoFiles.length} HRTO quarterly files`);

hrtoFiles.forEach(file => {
    const filePath = path.join(CSV_FOLDER, file);
    const rows = parseCSV(filePath);
    
    rows.forEach(row => {
        // Extract decision type from status/outcome columns
        const status = (row.Status || row.Outcome || row['Decision Type'] || '').toLowerCase();
        const abandoned = status.includes('abandon') || status.includes('withdrawn');
        const dismissed = status.includes('dismiss') || status.includes('denied');
        const allowed = status.includes('allow') || status.includes('granted');
        
        hrtoData.decisions.push({
            quarter: file.replace('.csv', ''),
            caseNumber: row['Case Number'] || row['File Number'] || row['Application Number'],
            status: row.Status || row.Outcome || row['Decision Type'],
            abandoned,
            dismissed,
            allowed
        });
        
        hrtoData.abandonmentAnalysis.totalDecisions++;
        if (abandoned) hrtoData.abandonmentAnalysis.abandonedCount++;
        if (dismissed) hrtoData.abandonmentAnalysis.dismissedCount++;
        if (allowed) hrtoData.abandonmentAnalysis.allowedCount++;
    });
});

hrtoData.abandonmentAnalysis.abandonmentRate = 
    (hrtoData.abandonmentAnalysis.abandonedCount / hrtoData.abandonmentAnalysis.totalDecisions * 100).toFixed(2);

console.log('');
console.log(`   📊 Total HRTO Decisions: ${hrtoData.abandonmentAnalysis.totalDecisions.toLocaleString()}`);
console.log(`   🏳️  Abandoned: ${hrtoData.abandonmentAnalysis.abandonedCount.toLocaleString()} (${hrtoData.abandonmentAnalysis.abandonmentRate}%)`);
console.log(`   ❌ Dismissed: ${hrtoData.abandonmentAnalysis.dismissedCount.toLocaleString()}`);
console.log(`   ✅ Allowed: ${hrtoData.abandonmentAnalysis.allowedCount.toLocaleString()}`);
console.log('');

const hrtoOutputPath = path.join(OUTPUT_FOLDER, 'hrto-abandonment-analysis.json');
fs.writeFileSync(hrtoOutputPath, JSON.stringify(hrtoData, null, 2));
console.log(`   💾 Saved: hrto-abandonment-analysis.json`);
console.log('');

// ============================================================================
// 3. ONSBT APPEALS
// ============================================================================
console.log('📋 PARSING ONSBT APPEALS (WSIB→ODSP FUNNEL)...');
console.log('');

const onsbtFiles = fs.readdirSync(CSV_FOLDER)
    .filter(f => f.startsWith('18 ') && f.endsWith('.csv'))
    .sort();

const onsbtData = {
    source: 'Tribunals Ontario Open Data - ONSBT Appeals',
    files: onsbtFiles.length,
    appeals: [],
    summary: {
        totalAppeals: 0,
        byProgram: {},
        byYear: {}
    }
};

console.log(`   📁 Found ${onsbtFiles.length} ONSBT appeal files`);

onsbtFiles.forEach(file => {
    const filePath = path.join(CSV_FOLDER, file);
    const rows = parseCSV(filePath);
    
    rows.forEach(row => {
        const program = row.Program || row['Program Type'] || 'Unknown';
        const year = file.match(/\d{4}/)?.[0] || 'Unknown';
        
        onsbtData.appeals.push({
            period: file.replace('.csv', ''),
            program,
            year,
            appealNumber: row['Appeal Number'] || row['File Number'],
            outcome: row.Outcome || row.Status
        });
        
        onsbtData.summary.totalAppeals++;
        onsbtData.summary.byProgram[program] = (onsbtData.summary.byProgram[program] || 0) + 1;
        onsbtData.summary.byYear[year] = (onsbtData.summary.byYear[year] || 0) + 1;
    });
});

console.log(`   📊 Total ONSBT Appeals: ${onsbtData.summary.totalAppeals.toLocaleString()}`);
console.log(`   📅 Years covered: ${Object.keys(onsbtData.summary.byYear).length}`);
console.log('');

const onsbtOutputPath = path.join(OUTPUT_FOLDER, 'onsbt-appeals-analysis.json');
fs.writeFileSync(onsbtOutputPath, JSON.stringify(onsbtData, null, 2));
console.log(`   💾 Saved: onsbt-appeals-analysis.json`);
console.log('');

// ============================================================================
// 4. MENTAL STRESS CLAIMS
// ============================================================================
console.log('🧠 PARSING MENTAL STRESS CLAIMS...');
console.log('');

try {
    const mentalStressPath = path.join(CSV_FOLDER, 'Mental Stress Claims.csv');
    if (fs.existsSync(mentalStressPath)) {
        const rows = parseCSV(mentalStressPath);
        
        const mentalStressData = {
            source: 'WSIB Safety Check - Mental Stress Claims',
            totalRows: rows.length,
            data: rows,
            wsiatComparison: {
                wsiatMentalHealthCases: 471, // PTSD (159) + Psychotraumatic (312)
                wsiatPercentage: 0.48,
                note: 'WSIAT mental health: 471 of 98,992 decisions (0.48%)'
            }
        };
        
        console.log(`   📊 Mental Stress Claims: ${rows.length} rows`);
        console.log(`   🆚 WSIAT Mental Health: 471 cases (0.48%)`);
        console.log('');
        
        const mentalOutputPath = path.join(OUTPUT_FOLDER, 'mental-stress-claims.json');
        fs.writeFileSync(mentalOutputPath, JSON.stringify(mentalStressData, null, 2));
        console.log(`   💾 Saved: mental-stress-claims.json`);
        console.log('');
    }
} catch (error) {
    console.log(`   ⚠️  Mental Stress Claims.csv not found or error: ${error.message}`);
    console.log('');
}

// ============================================================================
// 5. BODY PART PROFILES
// ============================================================================
console.log('🦴 PARSING BODY PART PROFILES...');
console.log('');

const bodyPartFiles = [
    'Schedule 1 and 2 - Part of body category profile.csv',
    'Schedule 1 - Part of body category profile.csv',
    'Schedule 2 - Part of body category profile.csv'
];

const bodyPartData = {
    source: 'WSIB Safety Check - Body Part Category Profiles',
    profiles: {},
    wsiatComparison: {
        back: { wsiat: 13407, percentage: 13.54 },
        shoulder: { wsiat: 5295, percentage: 5.35 },
        neck: { wsiat: 3535, percentage: 3.57 },
        knee: { wsiat: 3162, percentage: 3.19 },
        hand: { wsiat: 2785, percentage: 2.81 }
    }
};

bodyPartFiles.forEach(file => {
    const filePath = path.join(CSV_FOLDER, file);
    if (fs.existsSync(filePath)) {
        const rows = parseCSV(filePath);
        const profileName = file.replace('.csv', '');
        
        bodyPartData.profiles[profileName] = {
            totalRows: rows.length,
            data: rows
        };
        
        console.log(`   ✅ ${profileName}: ${rows.length} body parts`);
    }
});

console.log('');
const bodyPartOutputPath = path.join(OUTPUT_FOLDER, 'body-part-profiles.json');
fs.writeFileSync(bodyPartOutputPath, JSON.stringify(bodyPartData, null, 2));
console.log(`   💾 Saved: body-part-profiles.json`);
console.log('');

// ============================================================================
// 6. FATALITY DATA
// ============================================================================
console.log('⚰️  PARSING FATALITY DATA...');
console.log('');

const fatalityFiles = [
    'Fatalities-data-2023.csv',
    'allowed Traumatic fatalities.csv',
    'allowed Occupational disease fatalities.csv',
    'Lost-time-claims-2023.csv'
];

const fatalityData = {
    source: 'WSIB Open Data - Fatality Statistics',
    files: {}
};

fatalityFiles.forEach(file => {
    const filePath = path.join(CSV_FOLDER, file);
    if (fs.existsSync(filePath)) {
        const rows = parseCSV(filePath);
        const fileName = file.replace('.csv', '');
        
        fatalityData.files[fileName] = {
            totalRows: rows.length,
            data: rows
        };
        
        console.log(`   ✅ ${fileName}: ${rows.length} rows`);
    }
});

console.log('');
const fatalityOutputPath = path.join(OUTPUT_FOLDER, 'fatality-data.json');
fs.writeFileSync(fatalityOutputPath, JSON.stringify(fatalityData, null, 2));
console.log(`   💾 Saved: fatality-data.json`);
console.log('');

// ============================================================================
// 7. CROSS-TRIBUNAL COMPARISON
// ============================================================================
console.log('🔄 CREATING CROSS-TRIBUNAL COMPARISON...');
console.log('');

const crossTribunalComparison = {
    generatedDate: new Date().toISOString(),
    tribunals: {
        WSIAT: {
            totalDecisions: 98992,
            timespan: '1987-2026 (40 years)',
            avgPerYear: 2475,
            successRate: '65-73%',
            abandonmentRate: '0.5%',
            dataQuality: 'Excellent - Full text, keywords, summaries',
            source: 'WSIAT Open Data Portal'
        },
        HRTO: {
            totalDecisions: hrtoData.abandonmentAnalysis.totalDecisions,
            abandonmentRate: `${hrtoData.abandonmentAnalysis.abandonmentRate}%`,
            abandonedCount: hrtoData.abandonmentAnalysis.abandonedCount,
            dataQuality: 'Good - Quarterly reports',
            source: 'Tribunals Ontario Open Data'
        },
        ONSBT: {
            totalAppeals: onsbtData.summary.totalAppeals,
            timespan: '2012-2026',
            dataQuality: 'Good - Appeal statistics',
            source: 'Tribunals Ontario Open Data'
        },
        WSIB: {
            avgDeniedPerYear: suppressionFunnel?.summary?.totalDeniedPerYear || 'Pending',
            avgAppealRate: suppressionFunnel?.summary?.avgAppealRate || 'Pending',
            suppressionGap: suppressionFunnel?.summary?.avgSuppressionGap || 'Pending',
            dataQuality: 'Good - Open Data Portal',
            source: 'WSIB Open Data'
        }
    },
    keyFindings: [
        `WSIAT: ${hrtoData.abandonmentAnalysis.abandonmentRate}% vs HRTO ${hrtoData.abandonmentAnalysis.abandonmentRate}% abandonment (${(parseFloat(hrtoData.abandonmentAnalysis.abandonmentRate) / 0.5).toFixed(0)}x higher)`,
        `WSIB Suppression: ~${suppressionFunnel?.summary?.avgSuppressionGap?.toLocaleString() || 'Pending'} workers/year give up without appealing`,
        `Appeal Rate: Only ${suppressionFunnel?.summary?.avgAppealRate || 'Pending'}% of denied workers reach WSIAT`
    ]
};

const comparisonOutputPath = path.join(OUTPUT_FOLDER, 'cross-tribunal-comparison.json');
fs.writeFileSync(comparisonOutputPath, JSON.stringify(crossTribunalComparison, null, 2));
console.log(`   💾 Saved: cross-tribunal-comparison.json`);
console.log('');

// ============================================================================
// SUMMARY
// ============================================================================
console.log('='.repeat(60));
console.log('✅ PARSING COMPLETE!');
console.log('='.repeat(60));
console.log('');
console.log('📊 FILES GENERATED:');
console.log('   1. wsib-suppression-funnel.json (THE SMOKING GUN)');
console.log('   2. hrto-abandonment-analysis.json');
console.log('   3. onsbt-appeals-analysis.json');
console.log('   4. mental-stress-claims.json');
console.log('   5. body-part-profiles.json');
console.log('   6. fatality-data.json');
console.log('   7. cross-tribunal-comparison.json');
console.log('');
console.log(`📁 Output folder: ${OUTPUT_FOLDER}`);
console.log('');
console.log('🚀 NEXT STEPS:');
console.log('   1. Review suppression funnel calculation');
console.log('   2. Create blog post: "The Suppression Gap: XXX,XXX Workers Give Up"');
console.log('   3. Update research page with cross-tribunal data');
console.log('   4. Create visualization: WSIB denial funnel');
console.log('');
