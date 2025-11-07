/**
 * Debug script to check what's in Firestore
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load Firebase credentials
const serviceAccountPath = path.join(__dirname, '.firebase-key.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: .firebase-key.json not found');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase
const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

async function checkEvents() {
  try {
    console.log('\n📋 Checking Firestore collections...\n');
    
    // Check production
    console.log('🔍 events_production collection:');
    const prodSnapshot = await db.collection('events_production').get();
    console.log(`   Found ${prodSnapshot.size} documents`);
    if (prodSnapshot.size > 0) {
      prodSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.title} (${data.status}, date: ${data.date})`);
      });
    }
    
    // Check preview
    console.log('\n🔍 events_preview collection:');
    const previewSnapshot = await db.collection('events_preview').get();
    console.log(`   Found ${previewSnapshot.size} documents`);
    if (previewSnapshot.size > 0) {
      previewSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.title} (${data.status}, date: ${data.date})`);
      });
    }
    
    console.log('\n✅ Done!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkEvents();
