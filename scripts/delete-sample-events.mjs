#!/usr/bin/env node
/**
 * Delete Sample Events from Firestore
 * Removes the 2 sample "Community Accessibility Workshop" events
 */

import { initializeApp } from 'firebase/app';
import { deleteDoc, doc, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDXw7xyLFgPCkS9sX3Ps6jS7ZWOqRLaYVk",
  authDomain: "empowrapp.firebaseapp.com",
  databaseURL: "https://empowrapp-default-rtdb.firebaseio.com",
  projectId: "empowrapp",
  storageBucket: "empowrapp.firebasestorage.app",
  messagingSenderId: "733708119893",
  appId: "1:733708119893:web:4bca1ee64c2b89bb4e9bfa",
  measurementId: "G-H22M582PXT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample event IDs to delete
const SAMPLE_EVENT_IDS = [
  'Yk1p4IJ66gGxkI0F8mCc',
  'bYfSpZdmLv2o5Pfijv4V'
];

async function deleteSampleEvents() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           🗑️  DELETE SAMPLE EVENTS                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log('Deleting 2 sample "Community Accessibility Workshop" events...\n');
  
  let successCount = 0;
  
  for (const eventId of SAMPLE_EVENT_IDS) {
    try {
      // Delete from events_production
      await deleteDoc(doc(db, 'events_production', eventId));
      console.log(`✅ Deleted from production: ${eventId}`);
      
      // Delete from events_preview
      try {
        await deleteDoc(doc(db, 'events_preview', eventId));
        console.log(`✅ Deleted from preview: ${eventId}`);
      } catch (err) {
        console.log(`   (Not in preview collection)`);
      }
      
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to delete ${eventId}:`, error.message);
    }
  }
  
  console.log(`\n✅ Successfully deleted ${successCount}/${SAMPLE_EVENT_IDS.length} sample events`);
  console.log('\n⏰ Changes will appear on website within 5 minutes (cache refresh)');
  console.log('🔗 Verify: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community\n');
}

deleteSampleEvents()
  .then(() => {
    console.log('✨ Done!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
