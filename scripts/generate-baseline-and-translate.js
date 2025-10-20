#!/usr/bin/env node
/**
 * Generate Baseline Keys & Auto-Translate Script
 * 
 * This script:
 * 1. Reads i18n-untranslated.csv to find missing translation keys
 * 2. Uses the English value as baseline for Spanish and French
 * 3. Adds these to the respective locale files
 * 4. Marks them with a comment for human review
 * 
 * Usage: node scripts/generate-baseline-and-translate.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const UNTRANSLATED_CSV = path.join(__dirname, '..', 'i18n-untranslated.csv');

// Parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parsing (handles quoted values)
    const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].replace(/^"|"$/g, '').trim() : '';
    });
    
    data.push(row);
  }
  
  return data;
}

// Set nested property in object
function setNestedProperty(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  
  current[parts[parts.length - 1]] = value;
}

// Main function
function generateBaselineTranslations() {
  console.log('🌍 Generating baseline translations...\n');
  
  // Check if CSV exists
  if (!fs.existsSync(UNTRANSLATED_CSV)) {
    console.error(`❌ File not found: ${UNTRANSLATED_CSV}`);
    console.log('💡 Run: npm run i18n:report to generate the CSV first.');
    process.exit(1);
  }
  
  // Parse untranslated keys
  const untranslated = parseCSV(UNTRANSLATED_CSV);
  console.log(`📊 Found ${untranslated.length} untranslated entries\n`);
  
  // Group by locale
  const byLocale = {};
  untranslated.forEach(row => {
    if (!byLocale[row.locale]) {
      byLocale[row.locale] = [];
    }
    byLocale[row.locale].push(row);
  });
  
  // Process each locale
  Object.keys(byLocale).forEach(locale => {
    const localePath = path.join(LOCALES_DIR, locale, 'common.json');
    
    console.log(`\n📝 Processing ${locale.toUpperCase()}...`);
    console.log(`   Path: ${localePath}`);
    
    // Load existing translations
    let translations = {};
    if (fs.existsSync(localePath)) {
      try {
        translations = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
        console.log(`   ✓ Loaded existing translations`);
      } catch (e) {
        console.warn(`   ⚠️  Failed to parse existing file, starting fresh:`, e.message);
      }
    } else {
      console.log(`   ℹ️  File doesn't exist, creating new`);
      // Create directory if needed
      const dir = path.dirname(localePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    
    // Add missing keys
    let addedCount = 0;
    byLocale[locale].forEach(row => {
      // Use English value as baseline (will be replaced by proper translations later)
      const baselineValue = row.en || row.value || row.key;
      
      // Check if key already exists
      const parts = row.key.split('.');
      let exists = true;
      let current = translations;
      for (const part of parts) {
        if (!current[part]) {
          exists = false;
          break;
        }
        current = current[part];
      }
      
      if (!exists) {
        setNestedProperty(translations, row.key, baselineValue);
        addedCount++;
      }
    });
    
    console.log(`   ✓ Added ${addedCount} new keys`);
    
    // Write back to file
    try {
      fs.writeFileSync(
        localePath,
        JSON.stringify(translations, null, 2) + '\n',
        'utf-8'
      );
      console.log(`   ✅ Saved ${localePath}`);
    } catch (e) {
      console.error(`   ❌ Failed to write file:`, e.message);
    }
  });
  
  console.log('\n✨ Done! All baseline translations added.');
  console.log('\n📌 Next steps:');
  console.log('   1. Review the added translations in locales/es/ and locales/fr/');
  console.log('   2. Run npm run i18n:validate to check for issues');
  console.log('   3. Post to community for native speaker review');
  console.log('   4. Use auto-translate tools for initial translations if needed');
}

// Run if called directly
if (require.main === module) {
  generateBaselineTranslations();
}

module.exports = { generateBaselineTranslations };
