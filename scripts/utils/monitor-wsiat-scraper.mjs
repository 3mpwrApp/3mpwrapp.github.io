#!/usr/bin/env node

/**
 * Monitor WSIAT scraper progress
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const progressPath = path.join(__dirname, '..', 'data', 'tribunal-decisions', 'wsiat', 'scrape-progress.json');
const metadataPath = path.join(__dirname, '..', 'data', 'tribunal-decisions', 'wsiat', 'wsiat-metadata.json');

function monitor() {
  console.clear();
  console.log('='.repeat(60));
  console.log('📊 WSIAT SCRAPER PROGRESS MONITOR');
  console.log('='.repeat(60));
  console.log();
  
  if (fs.existsSync(progressPath)) {
    const progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    console.log(`📄 Last Completed Page: ${progress.lastCompletedPage}`);
    console.log(`📊 Total Decisions Scraped: ${progress.totalDecisionsScraped}`);
    console.log(`⏰ Last Updated: ${new Date(progress.lastRun).toLocaleString()}`);
    
    if (progress.errors && progress.errors.length > 0) {
      console.log(`\n⚠️  Errors: ${progress.errors.length}`);
      progress.errors.slice(-3).forEach(err => {
        console.log(`   - Page ${err.page}: ${err.error}`);
      });
    }
    
    const estimatedTotal = 991; // pages
    const percentComplete = ((progress.lastCompletedPage / estimatedTotal) * 100).toFixed(1);
    console.log(`\n📈 Progress: ${percentComplete}% (${progress.lastCompletedPage}/${estimatedTotal} pages)`);
    
    const bar = '█'.repeat(Math.floor(percentComplete / 2)) + '░'.repeat(50 - Math.floor(percentComplete / 2));
    console.log(`   [${bar}]`);
    
  } else {
    console.log('⏳ Scraper starting... (no progress file yet)');
    console.log('\nThis is normal - progress is saved every 10 pages.');
  }
  
  if (fs.existsSync(metadataPath)) {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    console.log(`\n✅ COMPLETED: ${metadata.totalDecisions} decisions scraped`);
    console.log(`📁 Years: ${Object.keys(metadata.decisionsByYear || {}).length}`);
  }
  
  console.log();
  console.log('='.repeat(60));
  console.log('Press Ctrl+C to stop monitoring');
  console.log('='.repeat(60));
}

// Monitor every 5 seconds
monitor();
const interval = setInterval(monitor, 5000);

// Clean exit
process.on('SIGINT', () => {
  clearInterval(interval);
  console.log('\n\n✋ Monitoring stopped');
  process.exit(0);
});
