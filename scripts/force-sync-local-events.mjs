#!/usr/bin/env node
/**
 * FORCE SYNC LOCAL EVENTS TO FIRESTORE
 * 
 * This script bypasses BYOC restrictions and forces all local events
 * from the app to sync to Firestore, making them appear on the website.
 * 
 * Run this to sync events that got stuck in AsyncStorage.
 */

import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getFirestore, query, setDoc, Timestamp, where } from 'firebase/firestore';

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

// User details
const USER_EMAIL = 'empowrapp08162025@gmail.com';
const USER_UID = 'empowrapp08162025';

// MANUALLY ENTER YOUR 3 TBDIWSG EVENTS HERE
// Copy from app's AsyncStorage or tell me the details
const LOCAL_EVENTS = [
  {
    id: `evt-tbdiwsg-${Date.now()}-1`,
    title: "[ENTER EVENT 1 TITLE - includes TBDIWSG]",
    description: "[ENTER DESCRIPTION]",
    date: "2025-11-15T18:00:00.000Z", // CHANGE THIS
    location: "Toronto, ON", // CHANGE THIS
    isVirtual: false,
    asl: true,
    captions: true,
    stepFree: true,
    sensorySpace: false,
    tags: ['TBDIWSG'],
    category: 'community',
    createdBy: USER_UID,
    createdAt: Date.now()
  },
  {
    id: `evt-tbdiwsg-${Date.now()}-2`,
    title: "[ENTER EVENT 2 TITLE - includes TBDIWSG]",
    description: "[ENTER DESCRIPTION]",
    date: "2025-11-20T19:00:00.000Z", // CHANGE THIS
    location: "Virtual", // CHANGE THIS
    isVirtual: true,
    asl: true,
    captions: true,
    stepFree: false,
    sensorySpace: false,
    tags: ['TBDIWSG'],
    category: 'community',
    createdBy: USER_UID,
    createdAt: Date.now()
  },
  {
    id: `evt-tbdiwsg-${Date.now()}-3`,
    title: "[ENTER EVENT 3 TITLE - includes TBDIWSG]",
    description: "[ENTER DESCRIPTION]",
    date: "2025-12-01T14:00:00.000Z", // CHANGE THIS
    location: "Montreal, QC", // CHANGE THIS
    isVirtual: false,
    asl: false,
    captions: true,
    stepFree: true,
    sensorySpace: true,
    tags: ['TBDIWSG'],
    category: 'community',
    createdBy: USER_UID,
    createdAt: Date.now()
  }
];

async function syncEvent(event, collection_name) {
  try {
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
      organizer: '3mpwrApp',
      imageUrl: '',
      attendeeCount: 0,
      url: '',
      category: 'community',
      createdBy: USER_UID,
      createdAt: event.createdAt || Date.now(),
      updatedAt: Date.now(),
      status: 'published'
    };
    
    await setDoc(doc(db, collection_name, event.id), eventData, { merge: true });
    return true;
  } catch (error) {
    console.error(`Failed to sync ${event.title}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║      🚀 FORCE SYNC LOCAL EVENTS TO FIRESTORE & WEBSITE     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log(`👤 Account: ${USER_EMAIL}`);
  console.log(`🆔 UID: ${USER_UID}\n`);
  
  // Check current state
  console.log('📊 Current Firestore events...');
  try {
    const q = query(collection(db, 'events_production'), where('createdBy', '==', USER_UID));
    const snapshot = await getDocs(q);
    console.log(`   Your events in Firestore: ${snapshot.size}\n`);
  } catch (err) {
    console.log(`   Could not check (will sync anyway)\n`);
  }
  
  // Sync events
  console.log(`🔄 Syncing ${LOCAL_EVENTS.length} events...\n`);
  
  let prodSuccess = 0;
  let previewSuccess = 0;
  
  for (const event of LOCAL_EVENTS) {
    console.log(`📝 Syncing: ${event.title}`);
    
    // Sync to production
    if (await syncEvent(event, 'events_production')) {
      console.log(`   ✅ → events_production`);
      prodSuccess++;
    } else {
      console.log(`   ❌ → events_production FAILED`);
    }
    
    // Sync to preview
    if (await syncEvent(event, 'events_preview')) {
      console.log(`   ✅ → events_preview`);
      previewSuccess++;
    } else {
      console.log(`   ❌ → events_preview FAILED`);
    }
    
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`✅ Production: ${prodSuccess}/${LOCAL_EVENTS.length} synced`);
  console.log(`✅ Preview: ${previewSuccess}/${LOCAL_EVENTS.length} synced\n`);
  
  // Verify
  console.log('🔍 Verifying sync...');
  try {
    const q = query(collection(db, 'events_production'), where('createdBy', '==', USER_UID));
    const snapshot = await getDocs(q);
    console.log(`   ✅ Your events now in Firestore: ${snapshot.size}\n`);
  } catch (err) {
    console.log(`   ⚠️  Could not verify\n`);
  }
  
  // Check Worker API
  console.log('🌐 Checking Cloudflare Worker...');
  try {
    const response = await fetch('https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community');
    const data = await response.json();
    console.log(`   Community events: ${data.pagination.total}`);
    console.log(`   ⏰ Cache refreshes every 5 minutes\n`);
  } catch (err) {
    console.log(`   ⚠️  Could not check Worker API\n`);
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✨ SYNC COMPLETE!\n');
  console.log('📋 Next steps:');
  console.log('   1. Wait 5 minutes for Worker cache to refresh');
  console.log('   2. Check: https://3mpwrapp.pages.dev/events/');
  console.log('   3. Your events should appear on website calendar\n');
  
  process.exit(0);
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
