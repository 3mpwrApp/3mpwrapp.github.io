#!/usr/bin/env node

/**
 * SMOKING GUN PARSER - Calculate WSIB Claim Suppression Funnel
 * 
 * Parses Registered-claims.csv and Allowed-claims.csv
 * Each file has yearly columns (2020-2026) with industry class breakdowns
 * 
 * Calculation:
 * Denied = Registered - Allowed
 * Appeal Rate = WSIAT Appeals / Denied
 * Suppression Gap = Denied - WSIAT Appeals
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_FOLDER = 'C:\\Users\\bookw\\Downloads\\converted-csv';
const OUTPUT_FOLDER = path.join(__dirname, '..', 'data', 'tribunal-comprehensive');

if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
}

console.log('💣 SMOKING GUN: WSIB CLAIM SUPPRESSION FUNNEL');
console.log('='.repeat(70));
console.log('');

// Parse a multi-column year CSV
function parseYearlyCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Find the "Total" row at the end
    let totalRow = null;
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('"Total"')) {
            totalRow = lines[i];
            break;
        }
    }
    
    if (!totalRow) {
        console.log('   ❌ Could not find Total row');
        return null;
    }
    
    // Split by comma but respect quoted values
    const cells = totalRow.match(/"[^"]*"/g).map(cell => {
        return cell.replace(/"/g, '').replace(/,/g, '');
    });
    
    // First cell is "Total", rest are year values
    // Structure: "Total","200,575","224,999","255,247",...
    const years = {};
    const yearLabels = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    
    yearLabels.forEach((year, idx) => {
        const cellIndex = idx + 1; // Skip "Total" label in column 0
        if (cellIndex < cells.length) {
            const value = parseInt(cells[cellIndex]);
            if (!isNaN(value) && value > 0) {
                years[year] = { total: value };
            }
        }
    });
    
    console.log(`   📅 Found years: ${Object.keys(years).join(', ')}`);
    
    return years;
}

// Parse Registered claims
console.log('📊 PARSING REGISTERED CLAIMS...');
const registeredPath = path.join(CSV_FOLDER, 'Registered-claims.csv');
const registeredData = parseYearlyCSV(registeredPath);

if (!registeredData) {
    console.log('   ❌ Failed to parse Registered claims');
    process.exit(1);
}

Object.keys(registeredData).forEach(year => {
    console.log(`   ${year}: ${registeredData[year].total.toLocaleString()} registered`);
});
console.log('');

// Parse Allowed claims
console.log('✅ PARSING ALLOWED CLAIMS...');
const allowedPath = path.join(CSV_FOLDER, 'Allowed-claims.csv');
const allowedData = parseYearlyCSV(allowedPath);

if (!allowedData) {
    console.log('   ❌ Failed to parse Allowed claims');
    process.exit(1);
}

Object.keys(allowedData).forEach(year => {
    console.log(`   ${year}: ${allowedData[year].total.toLocaleString()} allowed`);
});
console.log('');

// Calculate suppression funnel
console.log('💀 CALCULATING SUPPRESSION FUNNEL...');
console.log('');

const wsiatAppealsPerYear = 2475; // 98,992 decisions over 40 years
const suppressionFunnel = {
    methodology: 'Denied = Registered - Allowed; Appeal Rate = WSIAT Appeals / Denied; Suppression Gap = Denied - Appeals',
    wsiatAppealRate: wsiatAppealsPerYear,
    years: [],
    summary: {
        avgRegistered: 0,
        avgAllowed: 0,
        avgDenied: 0,
        avgAppealRate: 0,
        avgSuppressionGap: 0
    }
};

const years = Object.keys(registeredData).sort();
let totalRegistered = 0;
let totalAllowed = 0;
let totalDenied = 0;

years.forEach(year => {
    const registered = registeredData[year].total;
    const allowed = allowedData[year].total;
    const denied = registered - allowed;
    const appealRate = (wsiatAppealsPerYear / denied * 100).toFixed(2);
    const suppressionGap = denied - wsiatAppealsPerYear;
    const suppressionRate = ((suppressionGap / denied) * 100).toFixed(2);
    
    suppressionFunnel.years.push({
        year: parseInt(year),
        registered,
        allowed,
        denied,
        denialRate: ((denied / registered) * 100).toFixed(2),
        wsiatAppeals: wsiatAppealsPerYear,
        appealRate: parseFloat(appealRate),
        suppressionGap,
        suppressionRate: parseFloat(suppressionRate)
    });
    
    totalRegistered += registered;
    totalAllowed += allowed;
    totalDenied += denied;
    
    console.log(`   ${year}:`);
    console.log(`      Registered: ${registered.toLocaleString()}`);
    console.log(`      Allowed: ${allowed.toLocaleString()}`);
    console.log(`      Denied: ${denied.toLocaleString()} (${((denied / registered) * 100).toFixed(1)}%)`);
    console.log(`      Appeal Rate: ${appealRate}%`);
    console.log(`      Suppression Gap: ${suppressionGap.toLocaleString()} workers gave up`);
    console.log('');
});

// Calculate averages
const numYears = years.length;
suppressionFunnel.summary.avgRegistered = Math.round(totalRegistered / numYears);
suppressionFunnel.summary.avgAllowed = Math.round(totalAllowed / numYears);
suppressionFunnel.summary.avgDenied = Math.round(totalDenied / numYears);
suppressionFunnel.summary.avgAppealRate = parseFloat(
    (wsiatAppealsPerYear / suppressionFunnel.summary.avgDenied * 100).toFixed(2)
);
suppressionFunnel.summary.avgSuppressionGap = suppressionFunnel.summary.avgDenied - wsiatAppealsPerYear;
suppressionFunnel.summary.avgSuppressionRate = parseFloat(
    ((suppressionFunnel.summary.avgSuppressionGap / suppressionFunnel.summary.avgDenied) * 100).toFixed(2)
);

console.log('='.repeat(70));
console.log('🔥 THE SMOKING GUN - SUMMARY');
console.log('='.repeat(70));
console.log('');
console.log(`   📊 Avg Registered/Year: ${suppressionFunnel.summary.avgRegistered.toLocaleString()}`);
console.log(`   ✅ Avg Allowed/Year: ${suppressionFunnel.summary.avgAllowed.toLocaleString()}`);
console.log(`   ❌ Avg Denied/Year: ${suppressionFunnel.summary.avgDenied.toLocaleString()}`);
console.log(`   ⚖️  WSIAT Appeals/Year: ${wsiatAppealsPerYear.toLocaleString()}`);
console.log(`   📉 Avg Appeal Rate: ${suppressionFunnel.summary.avgAppealRate}%`);
console.log(`   💀 Avg Suppression Gap: ${suppressionFunnel.summary.avgSuppressionGap.toLocaleString()} workers/year`);
console.log(`   🚨 Suppression Rate: ${suppressionFunnel.summary.avgSuppressionRate}% of denied workers NEVER appeal`);
console.log('');
console.log('🎯 KEY FINDINGS:');
console.log(`   • Only ${suppressionFunnel.summary.avgAppealRate}% of denied workers reach WSIAT`);
console.log(`   • ${suppressionFunnel.summary.avgSuppressionRate}% of denied workers give up without appealing`);
console.log(`   • ~${suppressionFunnel.summary.avgSuppressionGap.toLocaleString()} workers/year disappear from the system`);
console.log('');

// Save results
const outputPath = path.join(OUTPUT_FOLDER, 'wsib-suppression-funnel.json');
fs.writeFileSync(outputPath, JSON.stringify(suppressionFunnel, null, 2));

console.log(`💾 Saved: wsib-suppression-funnel.json`);
console.log('');
console.log('🚀 NEXT STEPS:');
console.log('   1. Create blog post: "The Suppression Gap: XXX,XXX Workers Give Up Every Year"');
console.log('   2. Create visualization: WSIB Denial Funnel (Sankey diagram)');
console.log('   3. Cross-reference with ONSBT data (WSIB → ODSP funnel)');
console.log('');
