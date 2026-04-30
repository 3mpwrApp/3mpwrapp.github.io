#!/usr/bin/env node
/**
 * XLSX to CSV Converter using ExcelJS
 * Converts remaining XLSX files to CSV format
 */

import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOADS_FOLDER = 'C:\\Users\\bookw\\Downloads';
const OUTPUT_FOLDER = path.join(DOWNLOADS_FOLDER, 'converted-csv');

// Ensure output folder exists
if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
}

console.log('🔄 XLSX TO CSV CONVERTER (ExcelJS)');
console.log('=====================================\n');

// Get all XLSX files
const xlsxFiles = fs.readdirSync(DOWNLOADS_FOLDER)
    .filter(f => f.endsWith('.xlsx') && !f.startsWith('~'))
    .map(f => path.join(DOWNLOADS_FOLDER, f));

console.log(`📊 Found ${xlsxFiles.length} XLSX files\n`);

let converted = 0;
let skipped = 0;
let failed = 0;

for (const xlsxFile of xlsxFiles) {
    const fileName = path.basename(xlsxFile);
    const csvFileName = fileName.replace('.xlsx', '.csv');
    const csvPath = path.join(OUTPUT_FOLDER, csvFileName);
    
    // Skip if already converted
    if (fs.existsSync(csvPath)) {
        console.log(`⏭️  Skipping: ${fileName} (already exists)`);
        skipped++;
        continue;
    }
    
    console.log(`🔄 Converting: ${fileName}`);
    
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(xlsxFile);
        
        // Get first worksheet
        const worksheet = workbook.worksheets[0];
        
        if (!worksheet) {
            console.log(`   ⚠️  No worksheets found`);
            failed++;
            continue;
        }
        
        // Convert to CSV
        const csvRows = [];
        worksheet.eachRow((row, rowNumber) => {
            const values = row.values.slice(1); // Remove first empty element
            const csvRow = values.map(v => {
                if (v === null || v === undefined) return '';
                const str = String(v);
                // Quote if contains comma, quote, or newline
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',');
            csvRows.push(csvRow);
        });
        
        fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');
        console.log(`   ✅ Saved: ${csvFileName} (${csvRows.length} rows)`);
        converted++;
        
    } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        failed++;
    }
}

console.log('\n=====================================');
console.log('✅ CONVERSION COMPLETE');
console.log('=====================================\n');
console.log(`✅ Converted: ${converted} files`);
console.log(`⏭️  Skipped:   ${skipped} files`);
console.log(`❌ Failed:    ${failed} files`);
console.log(`\n📁 Output: ${OUTPUT_FOLDER}\n`);

if (converted > 0) {
    console.log('🚀 Next: Run parse-wsib-all-data.mjs or parse-tribunals-ontario-data.mjs\n');
}
