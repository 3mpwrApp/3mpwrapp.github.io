#!/usr/bin/env node
/**
 * Sync data files to public API directory for website consumption
 * 
 * This script copies events and campaigns data to public/api/ as JSON files
 * so your Cloudflare Pages website can fetch them directly.
 * 
 * Usage:
 *   node scripts/sync-data-to-public.mjs
 */

import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

async function syncData() {
  console.log('📦 Syncing data files to public/api/...');

  try {
    // Use tsx to execute TypeScript and get the exported data
    const { execSync } = await import('child_process');
    
    // Create temp script to extract data - include ALL event types
    const currentYear = new Date().getFullYear();
    const tempScript = `
import { events } from './data/events.ts';
import { campaigns } from './data/campaigns.ts';
import { generateCanadianHolidays } from './data/holidays-ca.ts';
import { generateDisabilityObservances } from './data/disability-observances.ts';
import { generateHealthAwarenessEvents } from './data/health-awareness-months.ts';

const year = ${currentYear};
const holidays = generateCanadianHolidays(year);
const observances = generateDisabilityObservances(year);
const healthAwareness = generateHealthAwarenessEvents(year);

// Combine all events: community events + system-generated events
const allEvents = [...events, ...holidays, ...observances, ...healthAwareness];

console.log(JSON.stringify({ events: allEvents, campaigns }));
`;
    
    const tempFile = join(ROOT, '.temp-sync.ts');
    await fs.writeFile(tempFile, tempScript, 'utf-8');
    
    let events, campaigns;
    try {
      const output = execSync(`npx tsx ${tempFile}`, { 
        cwd: ROOT,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      
      const data = JSON.parse(output);
      events = data.events;
      campaigns = data.campaigns;
      
      if (!Array.isArray(events) || !Array.isArray(campaigns)) {
        throw new Error('Invalid data format');
      }
    } finally {
      // Clean up temp file
      await fs.unlink(tempFile).catch(() => {});
    }

    // Ensure public/api directory exists
    const publicApiDir = join(ROOT, 'public', 'api');
    await fs.mkdir(publicApiDir, { recursive: true });

    // Write pretty-printed JSON files
    await fs.writeFile(
      join(publicApiDir, 'events.json'),
      JSON.stringify(events, null, 2),
      'utf-8'
    );
    await fs.writeFile(
      join(publicApiDir, 'campaigns.json'),
      JSON.stringify(campaigns, null, 2),
      'utf-8'
    );

    console.log('✅ Synced events:', events.length, 'items');
    console.log('✅ Synced campaigns:', campaigns.length, 'items');
    console.log('');
    console.log('📍 Files created:');
    console.log('   - public/api/events.json');
    console.log('   - public/api/campaigns.json');
    console.log('');
    console.log('🌐 Website can now fetch from:');
    console.log('   - https://3mpwrapp.pages.dev/api/events.json');
    console.log('   - https://3mpwrapp.pages.dev/api/campaigns.json');

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

syncData();
