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
    // Read source data files
    const eventsPath = join(ROOT, 'data', 'events.ts');
    const campaignsPath = join(ROOT, 'data', 'campaigns.ts');

    const eventsContent = await fs.readFile(eventsPath, 'utf-8');
    const campaignsContent = await fs.readFile(campaignsPath, 'utf-8');

    // Extract JSON data from TypeScript files
    const eventsMatch = eventsContent.match(/export const events[^=]*=\s*(\[[\s\S]*?\]);/);
    const campaignsMatch = campaignsContent.match(/export const campaigns[^=]*=\s*(\[[\s\S]*?\]);/);

    if (!eventsMatch || !campaignsMatch) {
      throw new Error('Could not parse data files');
    }

    // Clean up TypeScript syntax to make valid JSON
    const cleanTStoJSON = (str) => {
      return str
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote property names
        .replace(/‑/g, '-') // Replace non-breaking hyphens with regular ones
        .trim();
    };

    const eventsJSON = cleanTStoJSON(eventsMatch[1]);
    const campaignsJSON = cleanTStoJSON(campaignsMatch[1]);

    // Validate JSON
    const events = JSON.parse(eventsJSON);
    const campaigns = JSON.parse(campaignsJSON);

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
