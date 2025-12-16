#!/usr/bin/env node
/**
 * Delete Community Accessibility Workshop sample events from Firestore
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

// The two Community Accessibility Workshop sample events to delete
const eventIds = ['Yk1p4IJ66gGxkI0F8mCc', 'bYfSpZdmLv2o5Pfijv4V'];

async function deleteEvents() {
  console.log('\n🗑️  Deleting Community Accessibility Workshop sample events...\n');
  
  for (const id of eventIds) {
    console.log(`Deleting event: ${id}`);
    
    try {
      await db.collection('events_production').doc(id).delete();
      console.log('  ✅ Deleted from events_production');
    } catch (e) {
      console.log('  ⚠️  Not found in events_production');
    }
    
    try {
      await db.collection('events_preview').doc(id).delete();
      console.log('  ✅ Deleted from events_preview');
    } catch (e) {
      console.log('  ⚠️  Not found in events_preview');
    }
  }
  
  console.log('\n✅ Done! Sample events removed.\n');
  process.exit(0);
}

deleteEvents();
