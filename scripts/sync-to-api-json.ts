#!/usr/bin/env tsx
/**
 * Sync local campaigns and events data to public/api/*.json for website
 */
import fs from 'fs';
import path from 'path';

import { campaigns } from '../data/campaigns';
import { events } from '../data/events';

const publicApiDir = path.join(process.cwd(), 'public', 'api');

// Ensure public/api directory exists
fs.mkdirSync(publicApiDir, { recursive: true });

// Write campaigns.json
const campaignsJson = {
  campaigns,
  count: campaigns.length,
  lastUpdated: new Date().toISOString(),
};

fs.writeFileSync(
  path.join(publicApiDir, 'campaigns.json'),
  JSON.stringify(campaignsJson, null, 2),
  'utf-8'
);

console.log(`✅ Created campaigns.json with ${campaigns.length} campaigns`);

// Write events.json
const eventsJson = {
  events,
  count: events.length,
  lastUpdated: new Date().toISOString(),
};

fs.writeFileSync(
  path.join(publicApiDir, 'events.json'),
  JSON.stringify(eventsJson, null, 2),
  'utf-8'
);

console.log(`✅ Created events.json with ${events.length} events`);

console.log('\n📦 API JSON files synced successfully!');
console.log('Files location: public/api/');
console.log('  - campaigns.json');
console.log('  - events.json');
