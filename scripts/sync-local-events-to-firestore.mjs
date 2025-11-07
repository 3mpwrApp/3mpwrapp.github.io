#!/usr/bin/env node
/**
 * Sync Local Events to Firestore Production Collection
 * 
 * This script reads locally created events from AsyncStorage simulation
 * and pushes them to Firestore events_production collection so they
 * appear on the website calendar via the Cloudflare Worker.
 * 
 * Usage: node scripts/sync-local-events-to-firestore.mjs
 */

import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc, Timestamp } from 'firebase/firestore';
import * as readline from 'readline';

// Firebase config (from your project)
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// YOUR 3 TBDIWSG EVENTS created under empowrapp08162025@gmail.com
// **REPLACE THESE WITH YOUR ACTUAL EVENT DETAILS**
// To find them: Open app > React Native Debugger > AsyncStorage > "events:local:v1"
const LOCAL_EVENTS = [
  {
    id: `evt-tbdiwsg-1-${Date.now()}`,
    title: "TBDIWSG Event 1 - [ADD YOUR TITLE]",
    description: "TBDIWSG - [ADD YOUR DESCRIPTION]",
    date: "2025-11-15T18:00:00.000Z", // CHANGE DATE
    location: "Toronto, ON", // CHANGE LOCATION
    isVirtual: false,
    asl: true,
    captions: true,
    stepFree: true,
    sensorySpace: false,
    tags: ['TBDIWSG'],
    createdBy: "empowrapp08162025@gmail.com", // YOUR ACCOUNT
    createdAt: Date.now(),
    status: 'published'
  },
  {
    id: `evt-tbdiwsg-2-${Date.now()}`,
    title: "TBDIWSG Event 2 - [ADD YOUR TITLE]",
    description: "TBDIWSG - [ADD YOUR DESCRIPTION]",
    date: "2025-11-20T19:00:00.000Z", // CHANGE DATE
    location: "Virtual", // CHANGE LOCATION
    isVirtual: true,
    asl: true,
    captions: true,
    stepFree: false,
    sensorySpace: false,
    tags: ['TBDIWSG'],
    createdBy: "empowrapp08162025@gmail.com", // YOUR ACCOUNT
    createdAt: Date.now(),
    status: 'published'
  },
  {
    id: `evt-tbdiwsg-3-${Date.now()}`,
    title: "TBDIWSG Event 3 - [ADD YOUR TITLE]",
    description: "TBDIWSG - [ADD YOUR DESCRIPTION]",
    date: "2025-12-01T14:00:00.000Z", // CHANGE DATE
    location: "Montreal, QC", // CHANGE LOCATION
    isVirtual: false,
    asl: false,
    captions: true,
    stepFree: true,
    sensorySpace: true,
    tags: ['TBDIWSG'],
    createdBy: "empowrapp08162025@gmail.com", // YOUR ACCOUNT
    createdAt: Date.now(),
    status: 'published'
  }
];

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function syncEventsToFirestore(events, targetCollection = 'events_production') {
  console.log(`\n🔄 Syncing ${events.length} events to Firestore ${targetCollection} collection...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const event of events) {
    try {
      // Convert date string to Firestore Timestamp
      const eventDate = new Date(event.date);
      
      const eventData = {
        id: event.id,
        title: event.title,
        description: event.description || '',
        date: Timestamp.fromDate(eventDate),
        location: event.location || '',
        isVirtual: event.isVirtual || false,
        asl: event.asl || false,
        captions: event.captions || false,
        stepFree: event.stepFree || false,
        sensorySpace: event.sensorySpace || false,
        tags: event.tags || [],
        organizer: event.organizer || '3mpwrApp',
        imageUrl: event.imageUrl || '',
        attendeeCount: event.attendeeCount || 0,
        url: event.url || '',
        category: 'community', // User-created events are always 'community'
        createdBy: event.createdBy || 'anonymous',
        createdAt: event.createdAt || Date.now(),
        updatedAt: Date.now(),
        status: 'published'
      };
      
      // Write to Firestore
      await setDoc(doc(db, targetCollection, event.id), eventData);
      
      console.log(`✅ Synced: ${event.title} (${event.id})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to sync ${event.title}:`, error.message);
      failCount++;
    }
  }
  
  console.log(`\n📊 Sync Complete:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`\n🌐 Events will appear on website within 5 minutes (cache refresh)`);
  console.log(`🔗 Check: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community\n`);
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   📅 Sync Local Events to Firestore Production Collection   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 YOUR 3 TBDIWSG EVENTS');
  console.log('   Account: empowrapp08162025@gmail.com\n');
  console.log('⚠️  IMPORTANT: Update LOCAL_EVENTS array with your actual event details!');
  console.log('   1. Edit this script: scripts/sync-local-events-to-firestore.mjs');
  console.log('   2. Replace [ADD YOUR TITLE], [ADD YOUR DESCRIPTION], dates, etc.');
  console.log('   3. OR find them in: React Native Debugger > AsyncStorage > "events:local:v1"');
  console.log('   4. Copy the JSON and replace LOCAL_EVENTS array\n');
  
  const answer = await prompt('Do you want to sync these SAMPLE events? (yes/no): ');
  
  if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
    console.log('\n❌ Sync cancelled. Please update LOCAL_EVENTS array with your actual events.\n');
    process.exit(0);
  }
  
  // Sync to production collection
  await syncEventsToFirestore(LOCAL_EVENTS, 'events_production');
  
  // Also sync to preview collection
  const syncPreview = await prompt('\nSync to preview collection too? (yes/no): ');
  if (syncPreview.toLowerCase() === 'yes' || syncPreview.toLowerCase() === 'y') {
    await syncEventsToFirestore(LOCAL_EVENTS, 'events_preview');
  }
  
  console.log('✨ Done!\n');
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
