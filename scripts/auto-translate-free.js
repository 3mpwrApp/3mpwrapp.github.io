#!/usr/bin/env node
/**
 * Auto-translate missing i18n keys using free Google Translate API
 * Zero-budget solution for Spanish (es) and French (fr) translations
 * 
 * Usage: node scripts/auto-translate-free.js
 */

const fs = require('fs');
const path = require('path');

const translate = require('@vitalets/google-translate-api');

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const EN_FILE = path.join(LOCALES_DIR, 'en', 'common.json');
const ES_FILE = path.join(LOCALES_DIR, 'es', 'common.json');
const FR_FILE = path.join(LOCALES_DIR, 'fr', 'common.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'i18n-auto-translated');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Flatten nested JSON object into dot-notation keys
 * e.g., { a: { b: "value" } } => { "a.b": "value" }
 */
function flattenObject(obj, prefix = '') {
  const flattened = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }
  return flattened;
}

/**
 * Unflatten dot-notation keys back to nested object
 * e.g., { "a.b": "value" } => { a: { b: "value" } }
 */
function unflattenObject(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split('.');
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }
  return result;
}

/**
 * Get missing keys for a target language
 */
function getMissingKeys(enKeys, targetKeys) {
  const missing = {};
  for (const [key, value] of Object.entries(enKeys)) {
    if (!targetKeys[key]) {
      missing[key] = value;
    }
  }
  return missing;
}

/**
 * Translate a single string with retry logic
 */
async function translateString(text, targetLang, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await translate(text, { from: 'en', to: targetLang });
      return result.text;
    } catch (error) {
      console.warn(`Retry ${i + 1}/${retries} for: "${text.substring(0, 50)}..."`);
      if (i === retries - 1) {
        console.error(`Failed to translate after ${retries} retries: ${error.message}`);
        return text; // Fallback to English
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return text;
}

/**
 * Translate all keys for a target language
 */
async function translateKeys(keys, targetLang) {
  const translations = {};
  const entries = Object.entries(keys);
  const total = entries.length;
  
  console.log(`\nTranslating ${total} keys to ${targetLang.toUpperCase()}...`);
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    
    // Skip empty values or non-string values
    if (!value || typeof value !== 'string') {
      translations[key] = value;
      continue;
    }
    
    // Show progress
    if ((i + 1) % 10 === 0 || i === entries.length - 1) {
      console.log(`Progress: ${i + 1}/${total} (${Math.round((i + 1) / total * 100)}%)`);
    }
    
    try {
      translations[key] = await translateString(value, targetLang);
      
      // Rate limiting: 100ms delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to translate ${key}: ${error.message}`);
      translations[key] = value; // Fallback to English
    }
  }
  
  return translations;
}

/**
 * Main execution
 */
async function main() {
  console.log('🌍 Auto-translate i18n keys (FREE)\n');
  console.log('Loading locale files...');
  
  // Load locale files
  const enData = JSON.parse(fs.readFileSync(EN_FILE, 'utf-8'));
  const esData = JSON.parse(fs.readFileSync(ES_FILE, 'utf-8'));
  const frData = JSON.parse(fs.readFileSync(FR_FILE, 'utf-8'));
  
  // Flatten to dot-notation for easier comparison
  const enFlat = flattenObject(enData);
  const esFlat = flattenObject(esData);
  const frFlat = flattenObject(frData);
  
  console.log(`Loaded ${Object.keys(enFlat).length} English keys`);
  console.log(`Loaded ${Object.keys(esFlat).length} Spanish keys`);
  console.log(`Loaded ${Object.keys(frFlat).length} French keys\n`);
  
  // Find missing keys
  const missingES = getMissingKeys(enFlat, esFlat);
  const missingFR = getMissingKeys(enFlat, frFlat);
  
  console.log(`Missing Spanish keys: ${Object.keys(missingES).length}`);
  console.log(`Missing French keys: ${Object.keys(missingFR).length}\n`);
  
  if (Object.keys(missingES).length === 0 && Object.keys(missingFR).length === 0) {
    console.log('✅ No missing translations! All keys are complete.');
    return;
  }
  
  // Translate missing keys
  const translatedES = Object.keys(missingES).length > 0 
    ? await translateKeys(missingES, 'es')
    : {};
  
  const translatedFR = Object.keys(missingFR).length > 0
    ? await translateKeys(missingFR, 'fr')
    : {};
  
  // Merge with existing translations
  const newESFlat = { ...esFlat, ...translatedES };
  const newFRFlat = { ...frFlat, ...translatedFR };
  
  // Unflatten back to nested structure
  const newESData = unflattenObject(newESFlat);
  const newFRData = unflattenObject(newFRFlat);
  
  // Save to output directory for review
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'es-common.json'),
    JSON.stringify(newESData, null, 2),
    'utf-8'
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'fr-common.json'),
    JSON.stringify(newFRData, null, 2),
    'utf-8'
  );
  
  // Generate CSV for community review
  const csvRows = [['Key', 'English', 'Spanish (Auto)', 'Spanish (Reviewed)', 'French (Auto)', 'French (Reviewed)']];
  
  for (const [key, value] of Object.entries(enFlat)) {
    if (missingES[key] || missingFR[key]) {
      csvRows.push([
        key,
        value,
        translatedES[key] || esFlat[key] || '',
        '', // Empty column for community review
        translatedFR[key] || frFlat[key] || '',
        '' // Empty column for community review
      ]);
    }
  }
  
  const csv = csvRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'review-translations.csv'), csv, 'utf-8');
  
  // Generate summary report
  const report = `# Auto-Translation Report

**Generated:** ${new Date().toISOString()}

## Summary

- **English keys:** ${Object.keys(enFlat).length}
- **Spanish translations added:** ${Object.keys(translatedES).length}
- **French translations added:** ${Object.keys(translatedFR).length}

## Output Files

1. \`i18n-auto-translated/es-common.json\` - Updated Spanish translations (for review)
2. \`i18n-auto-translated/fr-common.json\` - Updated French translations (for review)
3. \`i18n-auto-translated/review-translations.csv\` - CSV for community review

## Next Steps

1. **Review translations** - Auto-translate is 70-80% accurate, needs human review
2. **Community feedback** - Share CSV with Spanish/French speakers
3. **Test in app** - Copy reviewed files to \`locales/es/\` and \`locales/fr/\`
4. **Validate** - Run \`npm run i18n:validate\`

## Important Notes

⚠️ **Auto-translated content requires review for:**
- Disability-specific terminology
- Cultural sensitivity
- Context accuracy
- Grammatical correctness

## Quality Estimate

- **Auto-translate:** 70-80% accurate
- **With community review:** 90-95% accurate
- **With native speaker polish:** 95-98% accurate

---

**Cost:** $0 (free Google Translate API)
`;
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'REPORT.md'), report, 'utf-8');
  
  console.log('\n✅ Translation complete!\n');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`- es-common.json (${Object.keys(newESFlat).length} keys)`);
  console.log(`- fr-common.json (${Object.keys(newFRFlat).length} keys)`);
  console.log(`- review-translations.csv (for community review)`);
  console.log(`- REPORT.md (summary report)\n`);
  console.log('⚠️  IMPORTANT: Review translations before using in production!');
  console.log('   Auto-translate is 70-80% accurate. Human review required.\n');
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
