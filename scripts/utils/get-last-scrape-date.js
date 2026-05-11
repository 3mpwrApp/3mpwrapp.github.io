#!/usr/bin/env node

/**
 * Get Last Scrape Date
 * 
 * Reads existing decision files and returns the most recent decision date
 * to use as changedSince parameter for incremental scraping
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'tribunal-decisions');
const DEFAULT_START_DATE = '2000-01-01';

function getLastScrapeDate() {
  if (!fs.existsSync(DATA_DIR)) {
    console.log(DEFAULT_START_DATE);
    return;
  }

  let mostRecentDate = null;
  
  // Read all decision files
  const files = fs.readdirSync(DATA_DIR).filter(f => 
    f.endsWith('.json') && !f.startsWith('summary')
  );

  for (const file of files) {
    try {
      const filePath = path.join(DATA_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (!Array.isArray(data) || data.length === 0) continue;

      // Find most recent decision date in this file
      for (const decision of data) {
        if (!decision.date) continue;
        
        const decisionDate = new Date(decision.date);
        if (isNaN(decisionDate.getTime())) continue;
        
        if (!mostRecentDate || decisionDate > mostRecentDate) {
          mostRecentDate = decisionDate;
        }
      }
    } catch (err) {
      // Skip invalid files
    }
  }

  if (mostRecentDate) {
    // Go back 7 days to catch any late additions
    const weekBefore = new Date(mostRecentDate);
    weekBefore.setDate(weekBefore.getDate() - 7);
    
    const dateStr = weekBefore.toISOString().split('T')[0];
    console.log(dateStr);
  } else {
    console.log(DEFAULT_START_DATE);
  }
}

getLastScrapeDate();
