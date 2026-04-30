#!/usr/bin/env node

/**
 * Convert ONLY the 2 critical XLSX files: Registered claims + Allowed claims
 * These unlock the suppression funnel calculation (THE SMOKING GUN)
 */

import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

const DOWNLOADS = 'C:\\Users\\bookw\\Downloads';
const OUTPUT_FOLDER = 'C:\\Users\\bookw\\Downloads\\converted-csv';

console.log('💣 CONVERTING CRITICAL SMOKING GUN FILES');
console.log('='.repeat(50));
console.log('');

const criticalFiles = [
    'Registered claims.xlsx',
    'Allowed claims.xlsx'
];

for (const filename of criticalFiles) {
    const xlsxPath = path.join(DOWNLOADS, filename);
    const csvPath = path.join(OUTPUT_FOLDER, filename.replace('.xlsx', '.csv'));
    
    console.log(`🔄 Converting: ${filename}`);
    
    if (!fs.existsSync(xlsxPath)) {
        console.log(`   ❌ File not found: ${xlsxPath}`);
        continue;
    }
    
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(xlsxPath);
        
        const worksheet = workbook.worksheets[0];
        const csvLines = [];
        
        worksheet.eachRow((row, rowNumber) => {
            const values = row.values.slice(1); // Skip index 0
            const csvLine = values.map(v => {
                if (v === null || v === undefined) return '';
                const str = String(v);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',');
            csvLines.push(csvLine);
        });
        
        fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf-8');
        
        console.log(`   ✅ Saved: ${filename.replace('.xlsx', '.csv')} (${csvLines.length} rows)`);
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
}

console.log('');
console.log('='.repeat(50));
console.log('✅ CONVERSION COMPLETE!');
console.log('');
console.log('🚀 Next: node scripts/parse-all-tribunal-data.mjs');
console.log('');
