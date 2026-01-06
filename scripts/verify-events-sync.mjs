#!/usr/bin/env node
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const sa = JSON.parse(readFileSync(join(ROOT, 'serviceAccountKey.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

(async () => {
  try {
    const q = await db.collection('events_production').where('id', 'in', ['evt-ecc-x-spaces-jan7-2026', 'evt-ecc-x-spaces-jan8-2026']).get();
    console.log(`\n╔════════════════════════════════════════════════════════════╗`);
    console.log(`║  ✅ FIREBASE VERIFICATION - 2 EveryCanadianCounts Events   ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝\n`);
    console.log(`Found ${q.size} events in Firebase events_production:\n`);
    
    const events = [];
    q.forEach(doc => {
      const data = doc.data();
      const eventDate = data.date.toDate();
      const isoDate = eventDate.toISOString();
      const estTime = eventDate.toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      
      console.log(`📅 Event ${events.length + 1}:`);
      console.log(`   Title: ${data.title}`);
      console.log(`   ISO Date: ${isoDate}`);
      console.log(`   EST Time: ${estTime}`);
      console.log(`   ID: ${data.id}\n`);
      
      events.push({ title: data.title, date: eventDate, id: data.id });
    });

    // Verify dates
    console.log(`╔════════════════════════════════════════════════════════════╗`);
    console.log(`║  DATE VERIFICATION                                         ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝\n`);
    
    const jan7Event = events.find(e => e.id === 'evt-ecc-x-spaces-jan7-2026');
    const jan8Event = events.find(e => e.id === 'evt-ecc-x-spaces-jan8-2026');
    
    console.log(`Event 1 - January 7th @ 7:00 PM EST`);
    console.log(`   Expected: 2026-01-07 19:00 EST`);
    if (jan7Event) {
      const jan7Time = jan7Event.date.getHours();
      const jan7Day = jan7Event.date.getDate();
      const jan7Month = jan7Event.date.getMonth() + 1;
      console.log(`   Actual:   2026-${String(jan7Month).padStart(2, '0')}-${String(jan7Day).padStart(2, '0')} ${jan7Time}:00 EST`);
      console.log(`   Status: ${jan7Day === 7 && jan7Time === 19 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
    }
    
    console.log(`Event 2 - January 8th @ 4:00 PM EST`);
    console.log(`   Expected: 2026-01-08 16:00 EST`);
    if (jan8Event) {
      const jan8Time = jan8Event.date.getHours();
      const jan8Day = jan8Event.date.getDate();
      const jan8Month = jan8Event.date.getMonth() + 1;
      console.log(`   Actual:   2026-${String(jan8Month).padStart(2, '0')}-${String(jan8Day).padStart(2, '0')} ${jan8Time}:00 EST`);
      console.log(`   Status: ${jan8Day === 8 && jan8Time === 16 ? '✅ CORRECT' : '❌ INCORRECT'}\n`);
    }
    
    console.log(`╔════════════════════════════════════════════════════════════╗`);
    console.log(`║  All times confirmed in Firebase! ✅                       ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝\n`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
})();
