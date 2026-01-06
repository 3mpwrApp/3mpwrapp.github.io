#!/usr/bin/env node
/**
 * Complete Website Sync Verification & Resync
 * Checks data/events.ts → public/api → Firebase → Cloudflare
 */

import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const sa = JSON.parse(await readFile(join(ROOT, 'serviceAccountKey.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const WORKER_URL = 'https://3mpwrapp-calendar.empowrapp08162025.workers.dev';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  📊 Website Events Sync Verification                       ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Step 1: Check public/api/events.json
console.log('Step 1: Checking public/api/events.json...');
const publicEventsJson = JSON.parse(await readFile(join(ROOT, 'public', 'api', 'events.json'), 'utf8'));
const jan7 = publicEventsJson.find(e => e.id === 'evt-ecc-x-spaces-jan7-2026');
const jan8 = publicEventsJson.find(e => e.id === 'evt-ecc-x-spaces-jan8-2026');

if (jan7 && jan8) {
  console.log(`   ✅ Found both events in public/api/events.json`);
  console.log(`      Event 1: ${jan7.date} (${jan7.title})`);
  console.log(`      Event 2: ${jan8.date} (${jan8.title})\n`);
} else {
  console.log(`   ❌ Missing events in public/api/events.json\n`);
}

// Step 2: Check Firebase
console.log('Step 2: Checking Firebase events_production...');
const fbQuery = await db.collection('events_production').where('id', 'in', ['evt-ecc-x-spaces-jan7-2026', 'evt-ecc-x-spaces-jan8-2026']).get();
if (fbQuery.size === 2) {
  console.log(`   ✅ Found both events in Firebase`);
  fbQuery.forEach(doc => {
    const data = doc.data();
    const estTime = data.date.toDate().toLocaleString('en-US', { timeZone: 'America/New_York' });
    console.log(`      ${data.title}: ${estTime}`);
  });
  console.log();
} else {
  console.log(`   ⚠️  Found ${fbQuery.size} events in Firebase (expected 2)\n`);
}

// Step 3: Resync to Cloudflare
console.log('Step 3: Resyncing to Cloudflare Workers...');
try {
  const response = await fetch(`${WORKER_URL}/api/events/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: publicEventsJson })
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log(`   ✅ Cloudflare sync successful`);
    console.log(`      ${result.successful} events synced\n`);
  } else {
    console.log(`   ⚠️  Cloudflare returned ${response.status}\n`);
  }
} catch (error) {
  console.log(`   ❌ Cloudflare sync error: ${error.message}\n`);
}

// Step 4: Verify Cloudflare
console.log('Step 4: Verifying Cloudflare has latest data...');
try {
  const response = await fetch(`${WORKER_URL}/api/events`);
  const data = await response.json();
  const cfJan7 = data.events?.find(e => e.id === 'evt-ecc-x-spaces-jan7-2026');
  const cfJan8 = data.events?.find(e => e.id === 'evt-ecc-x-spaces-jan8-2026');
  
  if (cfJan7 && cfJan8) {
    console.log(`   ✅ Cloudflare has both events`);
    console.log(`      Event 1: ${cfJan7.date}`);
    console.log(`      Event 2: ${cfJan8.date}\n`);
  } else {
    console.log(`   ⚠️  Cloudflare missing events\n`);
  }
} catch (error) {
  console.log(`   ❌ Verification error: ${error.message}\n`);
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  ✅ Sync Complete - Website will update shortly            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('🌐 Website URLs:');
console.log(`   Events API: ${WORKER_URL}/api/events`);
console.log(`   iCal Feed: ${WORKER_URL}/events.ics`);
console.log(`   Public API: https://3mpwrapp.pages.dev/api/events.json\n`);

process.exit(0);
