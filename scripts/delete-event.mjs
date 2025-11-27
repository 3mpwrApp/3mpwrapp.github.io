#!/usr/bin/env node
/**
 * Delete a specific event from Firestore and Cloudflare
 */

import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Initialize Firebase Admin
const serviceAccountPath = join(ROOT, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const EVENT_ID = 'evt-thunder-bay-rally-dec9-2025';
const EVENTS_WORKER_URL = 'https://3mpwrapp-calendar.empowrapp08162025.workers.dev';

async function deleteEvent() {
  console.log(`\n🗑️  Deleting event: ${EVENT_ID}\n`);
  
  try {
    // Delete from production
    console.log('Deleting from events_production...');
    await db.collection('events_production').doc(EVENT_ID).delete();
    console.log('✅ Deleted from production');
    
    // Delete from preview
    console.log('Deleting from events_preview...');
    await db.collection('events_preview').doc(EVENT_ID).delete();
    console.log('✅ Deleted from preview');
    
    // Delete from Cloudflare (production)
    console.log('\nDeleting from Cloudflare production...');
    const prodResponse = await fetch(`${EVENTS_WORKER_URL}/api/events/${EVENT_ID}`, {
      method: 'DELETE'
    });
    if (prodResponse.ok) {
      console.log('✅ Deleted from Cloudflare production');
    } else {
      console.log('⚠️  Cloudflare production delete failed (may not exist)');
    }
    
    // Delete from Cloudflare (preview)
    console.log('Deleting from Cloudflare preview...');
    const previewResponse = await fetch(`${EVENTS_WORKER_URL}/api/events/${EVENT_ID}?env=preview`, {
      method: 'DELETE'
    });
    if (previewResponse.ok) {
      console.log('✅ Deleted from Cloudflare preview');
    } else {
      console.log('⚠️  Cloudflare preview delete failed (may not exist)');
    }
    
    console.log('\n✅ Event deleted successfully!\n');
    
  } catch (error) {
    console.error('❌ Delete failed:', error.message);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
  
  process.exit(0);
}

deleteEvent();
