#!/usr/bin/env node

/**
 * SMART HRTO PARSER - Extracts summary statistics from header rows
 * 
 * HRTO CSV format has statistics in headers like:
 * - "Final Decision: 208"
 * - "Dismissal - Jurisdictional and Procedural: 179"
 * - "Withdrawn In Part: 0"
 * 
 * This parser extracts those numbers from the first 20 rows
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

console.log('🔍 SMART HRTO ABANDONMENT PARSER');
console.log('='.repeat(60));
console.log('');

// Get all HRTO files
const hrtoFiles = fs.readdirSync(CSV_FOLDER)
    .filter(f => f.startsWith('5 ') && f.endsWith('.csv'))
    .sort();

console.log(`📁 Found ${hrtoFiles.length} HRTO quarterly files`);
console.log('');

const quarterlyData = [];
const aggregateStats = {
    totalDecisions: 0,
    interimDecisions: 0,
    finalDecisions: 0,
    proceduralDecisions: 0,
    dismissals: {
        jurisdictional: 0,
        noReasonableProspect: 0,
        total: 0
    },
    withdrawals: {
        withdrawn: 0,
        withdrawnInPart: 0,
        total: 0
    },
    decisionsOnMerits: {
        total: 0,
        discriminationFound: 0,
        discriminationNotFound: 0
    }
};

// Parse each quarterly file
hrtoFiles.forEach((file, index) => {
    const filePath = path.join(CSV_FOLDER, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').slice(0, 30); // Only read first 30 rows (headers)
    
    const quarterStats = {
        quarter: file.replace('.csv', ''),
        fileName: file,
        rawStats: {},
        extracted: {}
    };
    
    // Extract statistics from header rows
    lines.forEach(line => {
        // Look for patterns like "Decision Type: NUMBER"
        const statMatch = line.match(/([A-Za-z\s\-&]+):\s*(\d+)/g);
        if (statMatch) {
            statMatch.forEach(match => {
                const [label, value] = match.split(':').map(s => s.trim());
                const numValue = parseInt(value);
                if (!isNaN(numValue) && numValue > 0) {
                    quarterStats.rawStats[label] = numValue;
                    
                    // Categorize the stat
                    const lowerLabel = label.toLowerCase();
                    
                    if (lowerLabel.includes('interim decision')) {
                        quarterStats.extracted.interimDecisions = numValue;
                        aggregateStats.interimDecisions += numValue;
                        aggregateStats.totalDecisions += numValue;
                    }
                    else if (lowerLabel.includes('final decision')) {
                        quarterStats.extracted.finalDecisions = numValue;
                        aggregateStats.finalDecisions += numValue;
                        aggregateStats.totalDecisions += numValue;
                    }
                    else if (lowerLabel.includes('procedural decision')) {
                        quarterStats.extracted.proceduralDecisions = numValue;
                        aggregateStats.proceduralDecisions += numValue;
                        aggregateStats.totalDecisions += numValue;
                    }
                    else if (lowerLabel.includes('dismissal') && lowerLabel.includes('jurisdictional')) {
                        quarterStats.extracted.dismissalJurisdictional = numValue;
                        aggregateStats.dismissals.jurisdictional += numValue;
                        aggregateStats.dismissals.total += numValue;
                    }
                    else if (lowerLabel.includes('summary hearing') && lowerLabel.includes('no reasonable prospect')) {
                        quarterStats.extracted.dismissalNoProspect = numValue;
                        aggregateStats.dismissals.noReasonableProspect += numValue;
                        aggregateStats.dismissals.total += numValue;
                    }
                    else if (lowerLabel.includes('withdrawn in part')) {
                        quarterStats.extracted.withdrawnInPart = numValue;
                        aggregateStats.withdrawals.withdrawnInPart += numValue;
                        aggregateStats.withdrawals.total += numValue;
                    }
                    else if (lowerLabel.includes('decision on merits')) {
                        quarterStats.extracted.decisionsOnMerits = numValue;
                        aggregateStats.decisionsOnMerits.total += numValue;
                    }
                    else if (lowerLabel.includes('discrimination found')) {
                        quarterStats.extracted.discriminationFound = numValue;
                        aggregateStats.decisionsOnMerits.discriminationFound += numValue;
                    }
                    else if (lowerLabel.includes('discrimination not found')) {
                        quarterStats.extracted.discriminationNotFound = numValue;
                        aggregateStats.decisionsOnMerits.discriminationNotFound += numValue;
                    }
                }
            });
        }
    });
    
    quarterlyData.push(quarterStats);
    
    if ((index + 1) % 10 === 0) {
        console.log(`   ✅ Processed ${index + 1}/${hrtoFiles.length} files...`);
    }
});

console.log(`   ✅ Processed all ${hrtoFiles.length} files`);
console.log('');

// Calculate abandonment rate from dismissals
// TribunalWatch reported 73.5% abandonment + 23.1% dismissal = 96.6% failure rate
// Our "Dismissal - Jurisdictional" likely includes many abandonments

const totalFinalDecisions = aggregateStats.finalDecisions;
const totalDismissals = aggregateStats.dismissals.total;
const dismissalRate = (totalDismissals / totalFinalDecisions * 100).toFixed(2);
const totalWithdrawals = aggregateStats.withdrawals.total;
const withdrawalRate = (totalWithdrawals / totalFinalDecisions * 100).toFixed(2);
const successRate = (aggregateStats.decisionsOnMerits.discriminationFound / totalFinalDecisions * 100).toFixed(2);

console.log('📊 HRTO AGGREGATE STATISTICS');
console.log('='.repeat(60));
console.log('');
console.log(`   Total Decisions: ${aggregateStats.totalDecisions.toLocaleString()}`);
console.log(`   - Interim: ${aggregateStats.interimDecisions.toLocaleString()}`);
console.log(`   - Procedural: ${aggregateStats.proceduralDecisions.toLocaleString()}`);
console.log(`   - Final: ${totalFinalDecisions.toLocaleString()}`);
console.log('');
console.log(`   Dismissals: ${totalDismissals.toLocaleString()} (${dismissalRate}% of final)`);
console.log(`   - Jurisdictional/Procedural: ${aggregateStats.dismissals.jurisdictional.toLocaleString()}`);
console.log(`   - No Reasonable Prospect: ${aggregateStats.dismissals.noReasonableProspect.toLocaleString()}`);
console.log('');
console.log(`   Withdrawals: ${totalWithdrawals.toLocaleString()} (${withdrawalRate}% of final)`);
console.log(`   - Withdrawn In Part: ${aggregateStats.withdrawals.withdrawnInPart.toLocaleString()}`);
console.log('');
console.log(`   Decisions on Merits: ${aggregateStats.decisionsOnMerits.total.toLocaleString()}`);
console.log(`   - Discrimination Found: ${aggregateStats.decisionsOnMerits.discriminationFound.toLocaleString()} (${successRate}% of final)`);
console.log(`   - Discrimination Not Found: ${aggregateStats.decisionsOnMerits.discriminationNotFound.toLocaleString()}`);
console.log('');
console.log(`   🚨 FAILURE RATE: ${((parseFloat(dismissalRate) + parseFloat(withdrawalRate))).toFixed(2)}% (dismissals + withdrawals)`);
console.log('');

// Compare with WSIAT
const wsiatSuccessRate = 69; // 65-73% average
const wsiatAbandonmentRate = 0.5;

console.log('📊 HRTO vs WSIAT COMPARISON');
console.log('='.repeat(60));
console.log('');
console.log(`   HRTO Dismissal Rate: ${dismissalRate}%`);
console.log(`   WSIAT Success Rate: ${wsiatSuccessRate}%`);
console.log(`   Difference: ${Math.abs(parseFloat(dismissalRate) - wsiatSuccessRate).toFixed(2)}x worse for HRTO`);
console.log('');
console.log(`   HRTO Withdrawal Rate: ${withdrawalRate}%`);
console.log(`   WSIAT Abandonment Rate: ${wsiatAbandonmentRate}%`);
console.log(`   Difference: ${(parseFloat(withdrawalRate) / wsiatAbandonmentRate).toFixed(1)}x higher at HRTO`);
console.log('');

// Save results
const outputData = {
    source: 'Tribunals Ontario Open Data - HRTO Decisions (Smart Parser)',
    dateGenerated: new Date().toISOString(),
    quarterlyFiles: hrtoFiles.length,
    quarterlyData,
    aggregateStats,
    analysis: {
        totalFinalDecisions,
        dismissalRate: parseFloat(dismissalRate),
        withdrawalRate: parseFloat(withdrawalRate),
        successRate: parseFloat(successRate),
        failureRate: parseFloat(dismissalRate) + parseFloat(withdrawalRate),
        comparison: {
            wsiat: {
                successRate: wsiatSuccessRate,
                abandonmentRate: wsiatAbandonmentRate
            },
            hrtoVsWsiat: {
                dismissalDifference: Math.abs(parseFloat(dismissalRate) - wsiatSuccessRate),
                withdrawalMultiplier: parseFloat(withdrawalRate) / wsiatAbandonmentRate
            }
        }
    },
    keyFindings: [
        `HRTO has ${dismissalRate}% dismissal rate vs WSIAT ${wsiatSuccessRate}% success rate`,
        `HRTO withdrawals (${withdrawalRate}%) are ${(parseFloat(withdrawalRate) / wsiatAbandonmentRate).toFixed(1)}x higher than WSIAT abandonments (${wsiatAbandonmentRate}%)`,
        `Combined HRTO failure rate: ${((parseFloat(dismissalRate) + parseFloat(withdrawalRate))).toFixed(2)}%`,
        `Only ${successRate}% of HRTO final decisions find discrimination`
    ]
};

const outputPath = path.join(OUTPUT_FOLDER, 'hrto-smart-analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

console.log(`💾 Saved: hrto-smart-analysis.json`);
console.log('');
console.log('🚀 Next: Review data and create blog post comparing HRTO vs WSIAT');
console.log('');
