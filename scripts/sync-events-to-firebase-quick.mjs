#!/usr/bin/env node
/**
 * Quick sync of data/events.ts to Firebase + Cloudflare
 * Uses serviceAccountKey.json for Firebase Admin SDK
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load service account
const serviceAccountPath = join(ROOT, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'empowrapp'
});

const db = admin.firestore();

// Load events from public/api/events.json (already exported from data/events.ts)
const eventsJsonPath = join(ROOT, 'public', 'api', 'events.json');
let events = [];
try {
  const data = JSON.parse(readFileSync(eventsJsonPath, 'utf8'));
  events = Array.isArray(data) ? data : (data.events || []);
  console.log(`✅ Loaded ${events.length} events from public/api/events.json`);
} catch (error) {
  console.error(`❌ Failed to load events: ${error.message}`);
  process.exit(1);
}

async function syncToFirestore() {
  console.log('\n📤 Syncing to Firestore...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const event of events) {
    try {
      // Parse date to Timestamp
      const date = new Date(event.date);
      
      const eventData = {
        ...event,
        date: admin.firestore.Timestamp.fromDate(date),
        updatedAt: admin.firestore.Timestamp.now(),
      };
      
      // Sync to both production and preview
      await db.collection('events_production').doc(event.id).set(eventData, { merge: true });
      await db.collection('events_preview').doc(event.id).set(eventData, { merge: true });
      
      successCount++;
      process.stdout.write(`\r   Progress: ${successCount}/${events.length}`);
    } catch (error) {
      console.error(`\n   ❌ Failed to sync ${event.title}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n   ✅ Synced ${successCount} events to Firestore`);
  if (errorCount > 0) {
    console.log(`   ⚠️  ${errorCount} events failed`);
  }
  
  return successCount;
}

async function syncToCloudflare() {
  console.log('\n📤 Syncing to Cloudflare...');
  
  const WORKER_URL = 'https://3mpwrapp-calendar.empowrapp08162025.workers.dev';
  
  try {
    const response = await fetch(`${WORKER_URL}/api/events/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`   ✅ Cloudflare sync: ${result.successful} events synced`);
    return true;
  } catch (error) {
    console.error(`   ⚠️  Cloudflare sync failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  SYNC Events to Firebase + Cloudflare                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  try {
    await syncToFirestore();
    await syncToCloudflare();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ SYNC COMPLETE                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 Summary:');
    console.log(`   • ${events.length} events synced`);
    console.log('   • Firebase: events_production & events_preview');
    console.log('   • Cloudflare: Worker API');
    console.log('   • Website will update within 5 minutes\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
