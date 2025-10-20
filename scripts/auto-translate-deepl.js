/**
 * Auto-translate missing i18n keys using DeepL API (free tier: 500k chars/month)
 * 
 * SETUP:
 * 1. Sign up for free DeepL API account: https://www.deepl.com/pro-api
 * 2. Get your API key from account dashboard
 * 3. Set environment variable: DEEPL_API_KEY=your-key-here
 * 4. Run: node scripts/auto-translate-deepl.js
 * 
 * Free tier limits:
 * - 500,000 characters/month
 * - Unlimited requests
 * - All language pairs
 * - No credit card required
 */

const fs = require('fs');
const path = require('path');

const deepl = require('deepl-node');

// Configuration
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const LOCALES_DIR = path.resolve(__dirname, '../locales');
const OUTPUT_DIR = path.resolve(__dirname, '../i18n-auto-translated');
const RATE_LIMIT_MS = 200; // 200ms between requests (conservative)

// Language mappings (DeepL codes)
const TARGET_LANGS = {
  es: 'ES', // Spanish
  fr: 'FR'  // French
};

// Flatten nested object to dot-notation
function flattenObject(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return { ...acc, ...flattenObject(value, newKey) };
    }
    acc[newKey] = value;
    return acc;
  }, {});
}

// Unflatten dot-notation object back to nested
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

// Get missing keys by comparing English with target
function getMissingKeys(enKeys, targetKeys) {
  const missing = {};
  for (const [key, value] of Object.entries(enKeys)) {
    if (!targetKeys[key]) {
      missing[key] = value;
    }
  }
  return missing;
}

// Translate a single string with retry logic
async function translateString(translator, text, targetLang, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await translator.translateText(text, null, targetLang);
      return result.text;
    } catch (error) {
      console.warn(`Retry ${i + 1}/${retries} for: "${text.substring(0, 50)}..."`);
      console.warn(`Error: ${error.message}`);
      
      if (i === retries - 1) {
        console.error(`Failed to translate after ${retries} retries: ${text.substring(0, 50)}...`);
        return text; // Fallback to English
      }
      
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return text;
}

// Translate all missing keys for a language
async function translateKeys(translator, keys, targetLang) {
  const translations = {};
  const entries = Object.entries(keys);
  const total = entries.length;
  
  console.log(`Translating ${total} keys to ${targetLang}...`);
  
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    
    // Progress update every 10 keys
    if ((i + 1) % 10 === 0 || i === entries.length - 1) {
      console.log(`Progress: ${i + 1}/${total} (${Math.round((i + 1) / total * 100)}%)`);
    }
    
    // Translate
    translations[key] = await translateString(translator, value, targetLang);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS));
  }
  
  return translations;
}

// Main function
async function main() {
  try {
    // Validate API key
    if (!DEEPL_API_KEY) {
      console.error('\n❌ ERROR: DEEPL_API_KEY environment variable not set!\n');
      console.error('Setup instructions:');
      console.error('1. Sign up for free DeepL API: https://www.deepl.com/pro-api');
      console.error('2. Get your API key from account dashboard');
      console.error('3. Set environment variable:');
      console.error('   Windows (PowerShell): $env:DEEPL_API_KEY="your-key-here"');
      console.error('   Linux/Mac:            export DEEPL_API_KEY="your-key-here"');
      console.error('4. Run: node scripts/auto-translate-deepl.js\n');
      process.exit(1);
    }

    // Initialize DeepL translator
    console.log('Initializing DeepL translator...');
    const translator = new deepl.Translator(DEEPL_API_KEY);
    
    // Test API connection
    try {
      const usage = await translator.getUsage();
      console.log(`✅ DeepL API connected successfully`);
      console.log(`Character usage: ${usage.character.count}/${usage.character.limit} (${Math.round(usage.character.count / usage.character.limit * 100)}%)`);
    } catch (error) {
      console.error('\n❌ ERROR: Failed to connect to DeepL API');
      console.error('Please check your API key is correct');
      console.error(`Error: ${error.message}\n`);
      process.exit(1);
    }

    // Load English source
    const enPath = path.join(LOCALES_DIR, 'en', 'common.json');
    const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const enFlat = flattenObject(enData);
    console.log(`Loaded EN: ${Object.keys(enFlat).length} keys`);

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const results = {
      total: 0,
      successful: 0,
      failed: 0,
      byLanguage: {}
    };

    // Process each target language
    for (const [langCode, deeplCode] of Object.entries(TARGET_LANGS)) {
      console.log(`\n--- Processing ${langCode.toUpperCase()} ---`);
      
      // Load existing translations
      const targetPath = path.join(LOCALES_DIR, langCode, 'common.json');
      const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      const targetFlat = flattenObject(targetData);
      console.log(`Loaded ${langCode.toUpperCase()}: ${Object.keys(targetFlat).length} keys`);

      // Find missing keys
      const missingKeys = getMissingKeys(enFlat, targetFlat);
      const missingCount = Object.keys(missingKeys).length;
      console.log(`Missing: ${missingCount} keys`);

      if (missingCount === 0) {
        console.log('✅ No missing keys - skipping');
        results.byLanguage[langCode] = { missing: 0, translated: 0, failed: 0 };
        continue;
      }

      // Estimate character count
      const charCount = Object.values(missingKeys).join('').length;
      console.log(`Estimated characters: ${charCount}`);

      // Translate missing keys
      const translations = await translateKeys(translator, missingKeys, deeplCode);
      
      // Count successes and failures
      let successful = 0;
      let failed = 0;
      for (const [key, value] of Object.entries(translations)) {
        if (value !== missingKeys[key]) {
          successful++;
        } else {
          failed++;
        }
      }

      // Merge with existing translations
      const mergedFlat = { ...targetFlat, ...translations };
      const mergedNested = unflattenObject(mergedFlat);

      // Write output
      const outputPath = path.join(OUTPUT_DIR, `${langCode}-common.json`);
      fs.writeFileSync(outputPath, JSON.stringify(mergedNested, null, 2), 'utf8');
      console.log(`✅ Wrote ${Object.keys(mergedFlat).length} keys to ${outputPath}`);
      console.log(`   Translated: ${successful}, Fallback: ${failed}`);

      // Update results
      results.total += missingCount;
      results.successful += successful;
      results.failed += failed;
      results.byLanguage[langCode] = {
        missing: missingCount,
        translated: successful,
        failed: failed
      };
    }

    // Generate CSV for review
    console.log('\n--- Generating Review CSV ---');
    const csvRows = [
      ['Key', 'English', 'Spanish (Auto)', 'Spanish (Reviewed)', 'French (Auto)', 'French (Reviewed)']
    ];

    // Load all translated files
    const esTranslated = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'es-common.json'), 'utf8'));
    const frTranslated = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'fr-common.json'), 'utf8'));
    const esFlat = flattenObject(esTranslated);
    const frFlat = flattenObject(frTranslated);

    // Add rows for all missing keys
    const allMissingKeys = new Set([
      ...Object.keys(getMissingKeys(enFlat, flattenObject(JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'es', 'common.json'), 'utf8'))))),
      ...Object.keys(getMissingKeys(enFlat, flattenObject(JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'fr', 'common.json'), 'utf8')))))
    ]);

    for (const key of allMissingKeys) {
      csvRows.push([
        key,
        enFlat[key] || '',
        esFlat[key] || '',
        '', // Empty for human review
        frFlat[key] || '',
        ''  // Empty for human review
      ]);
    }

    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'review-translations.csv'), csvContent, 'utf8');
    console.log(`✅ Wrote ${csvRows.length - 1} rows to review-translations.csv`);

    // Generate markdown report
    console.log('\n--- Generating Report ---');
    const report = `# Auto-Translation Report (DeepL)

Generated: ${new Date().toISOString()}

## Summary
- Total missing keys: ${results.total}
- Successfully translated: ${results.successful} (${Math.round(results.successful / results.total * 100)}%)
- Failed (English fallback): ${results.failed} (${Math.round(results.failed / results.total * 100)}%)

## By Language
${Object.entries(results.byLanguage).map(([lang, data]) => `
### ${lang.toUpperCase()}
- Missing: ${data.missing}
- Translated: ${data.translated}
- Failed: ${data.failed}
`).join('')}

## Next Steps
1. Review translations in \`review-translations.csv\`
2. Test translations in app
3. Have native speakers verify accuracy
4. Update baseline files in \`locales/\` directory
5. Run \`npm run i18n:validate\` to verify

## Quality Expectations
DeepL typically provides:
- 85-95% accuracy for technical content
- 90-98% accuracy for general content
- Better context awareness than Google Translate
- High quality for ES/FR language pairs

## Notes
- All translations generated with DeepL API (free tier)
- Character count: ~${Object.values(enFlat).join('').length * Object.keys(TARGET_LANGS).length} used
- API usage tracked in DeepL dashboard
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'REPORT.md'), report, 'utf8');
    console.log('✅ Wrote REPORT.md');

    // Check final API usage
    const finalUsage = await translator.getUsage();
    console.log(`\n📊 Final API Usage: ${finalUsage.character.count}/${finalUsage.character.limit} characters`);
    console.log(`   Remaining: ${finalUsage.character.limit - finalUsage.character.count} (${Math.round((finalUsage.character.limit - finalUsage.character.count) / finalUsage.character.limit * 100)}%)`);

    console.log('\n✅ Translation complete! Check output in i18n-auto-translated/');
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { flattenObject, unflattenObject, getMissingKeys };
