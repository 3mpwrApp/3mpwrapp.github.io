#!/usr/bin/env node
/**
 * BATCH TRANSLATE - Run DeepL translations in batches
 * This script provides better progress tracking and error handling
 */

const { translateFile } = require('./translate-deepl.js');
const fs = require('fs');
const path = require('path');

// All files to translate
const FILES_TO_TRANSLATE = [
  // Root pages
  { source: 'index.md', target: 'fr/index.md', priority: 1 },
  { source: 'about.md', target: 'fr/about.md', priority: 1 },
  { source: 'contact.md', target: 'fr/contact.md', priority: 1 },
  { source: 'accessibility.md', target: 'fr/accessibility.md', priority: 1 },
  { source: 'privacy.md', target: 'fr/privacy.md', priority: 1 },
  { source: 'faq.md', target: 'fr/faq.md', priority: 1 },
  { source: 'roadmap.md', target: 'fr/roadmap.md', priority: 2 },
  { source: 'whats-new.md', target: 'fr/whats-new.md', priority: 2 },
  
  // Subdirectory pages
  { source: 'user-guide/index.md', target: 'fr/user-guide.md', priority: 1 },
  { source: 'events/index.md', target: 'fr/events/index.md', priority: 3 },
  { source: 'site-map/index.md', target: 'fr/site-map/index.md', priority: 3 },
  { source: 'wellness/index.md', target: 'fr/wellness/index.md', priority: 2 },
  { source: 'resources/index.md', target: 'fr/resources/index.md', priority: 1 },
  { source: 'community/index.md', target: 'fr/community/index.md', priority: 1 },
  { source: 'campaigns/index.md', target: 'fr/campaigns/index.md', priority: 2 },
  { source: 'connect/index.md', target: 'fr/connect/index.md', priority: 2 },
  { source: 'community-spotlight/index.md', target: 'fr/community-spotlight/index.md', priority: 2 },
  { source: 'newsletter/index.md', target: 'fr/newsletter/index.md', priority: 2 },
  { source: 'blog/index.md', target: 'fr/blog/index.md', priority: 2 },
  { source: 'terms/index.md', target: 'fr/terms/index.md', priority: 1 },
  { source: 'cookies/index.md', target: 'fr/cookies/index.md', priority: 2 },
  { source: 'privacy/index.md', target: 'fr/privacy/index.md', priority: 1 },
  { source: 'data-ownership/index.md', target: 'fr/data-ownership/index.md', priority: 1 },
  { source: 'privacy-controls/index.md', target: 'fr/privacy-controls/index.md', priority: 2 },
  { source: 'delete-data/index.md', target: 'fr/delete-data/index.md', priority: 2 },
  { source: 'beta/index.md', target: 'fr/beta/index.md', priority: 2 },
  { source: 'beta-guide/index.md', target: 'fr/beta-guide/index.md', priority: 3 },
  { source: 'search/index.md', target: 'fr/search/index.md', priority: 3 }
];

async function batchTranslate(options = {}) {
  const {
    priority = null,
    skipExisting = false,
    dryRun = false
  } = options;

  console.log('\n🌍 Batch Translation with DeepL');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no files will be created)' : 'LIVE'}`);
  console.log(`Skip existing: ${skipExisting}`);
  if (priority) console.log(`Priority filter: ${priority}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Filter files by priority if specified
  let filesToProcess = FILES_TO_TRANSLATE;
  if (priority) {
    filesToProcess = FILES_TO_TRANSLATE.filter(f => f.priority === priority);
  }

  const stats = {
    total: filesToProcess.length,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  for (let i = 0; i < filesToProcess.length; i++) {
    const file = filesToProcess[i];
    const sourcePath = path.join(process.cwd(), file.source);
    const targetPath = path.join(process.cwd(), file.target);

    console.log(`\n[${ i + 1}/${filesToProcess.length}] Processing: ${file.source}`);
    console.log(`Priority: ${file.priority} | Target: ${file.target}`);

    // Check if source exists
    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️  Source file not found, skipping...`);
      stats.skipped++;
      continue;
    }

    // Skip if target exists and skipExisting is true
    if (skipExisting && fs.existsSync(targetPath)) {
      console.log(`⏭️  Target already exists, skipping...`);
      stats.skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`✓ Would translate: ${sourcePath} → ${targetPath}`);
      stats.processed++;
      continue;
    }

    try {
      await translateFile(sourcePath, targetPath);
      stats.succeeded++;
      stats.processed++;
      console.log('✅ Success!');
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      stats.failed++;
      stats.errors.push({
        file: file.source,
        error: err.message
      });
    }

    // Progress indicator
    const progress = ((i + 1) / filesToProcess.length * 100).toFixed(1);
    console.log(`Progress: ${progress}% (${i + 1}/${filesToProcess.length})`);
  }

  // Final summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 Translation Summary');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Total files: ${stats.total}`);
  console.log(`✅ Succeeded: ${stats.succeeded}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`⏭️  Skipped: ${stats.skipped}`);
  console.log(`📈 Processed: ${stats.processed}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.file}: ${err.error}`);
    });
  }

  console.log('═══════════════════════════════════════════════════════════════\n');

  return stats;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    priority: args.includes('--priority-1') ? 1 : args.includes('--priority-2') ? 2 : args.includes('--priority-3') ? 3 : null,
    skipExisting: args.includes('--skip-existing'),
    dryRun: args.includes('--dry-run')
  };

  if (args.includes('--help')) {
    console.log(`
Usage: node scripts/batch-translate.js [options]

Options:
  --priority-1       Only translate priority 1 files (most important)
  --priority-2       Only translate priority 2 files
  --priority-3       Only translate priority 3 files
  --skip-existing    Skip files that already exist in target
  --dry-run          Show what would be translated without actually translating
  --help             Show this help message

Examples:
  node scripts/batch-translate.js --priority-1
  node scripts/batch-translate.js --dry-run
  node scripts/batch-translate.js --skip-existing
    `);
    process.exit(0);
  }

  batchTranslate(options).catch(err => {
    console.error(`\n❌ Fatal error: ${err.message}\n`);
    process.exit(1);
  });
}

module.exports = { batchTranslate, FILES_TO_TRANSLATE };
