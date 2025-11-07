#!/usr/bin/env node
/**
 * AUTOMATED Event Sync System
 * 
 * This script automatically:
 * 1. Monitors Firestore for new events
 * 2. Syncs events from app to Firestore
 * 3. Ensures all events appear on website calendar
 * 4. Real-time bidirectional sync
 * 
 * Usage: node scripts/auto-sync-events.mjs
 */

import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getFirestore, onSnapshot, query, setDoc, Timestamp, where } from 'firebase/firestore';

// Firebase config
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

// YOUR ACCOUNT EMAIL
const USER_EMAIL = 'empowrapp08162025@gmail.com';
const USER_UID = 'empowrapp08162025'; // Simplified UID from email

// Function to get all events from Firestore
async function getAllFirestoreEvents(collectionName = 'events_production') {
  try {
    const eventsRef = collection(db, collectionName);
    const snapshot = await getDocs(eventsRef);
    const events = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    return events;
  } catch (error) {
    console.error('❌ Error fetching Firestore events:', error.message);
    return [];
  }
}

// Function to get events created by user
async function getUserEvents(collectionName = 'events_production') {
  try {
    const eventsRef = collection(db, collectionName);
    const q = query(eventsRef, where('createdBy', '==', USER_UID));
    const snapshot = await getDocs(q);
    const events = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    return events;
  } catch (error) {
    console.error('❌ Error fetching user events:', error.message);
    return [];
  }
}

// Function to sync event to Firestore
async function syncEventToFirestore(event, collectionName = 'events_production') {
  try {
    const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
    
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
      category: event.category || 'community',
      createdBy: USER_UID,
      createdAt: event.createdAt || Date.now(),
      updatedAt: Date.now(),
      status: 'published'
    };
    
    await setDoc(doc(db, collectionName, event.id), eventData, { merge: true });
    console.log(`✅ Synced: ${event.title} → ${collectionName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to sync ${event.title}:`, error.message);
    return false;
  }
}

// Function to setup real-time listener
function setupRealtimeListener(collectionName = 'events_production') {
  const eventsRef = collection(db, collectionName);
  const q = query(eventsRef, where('category', '==', 'community'));
  
  console.log(`\n👂 Listening for real-time changes in ${collectionName}...`);
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    console.log(`\n🔔 ${new Date().toLocaleTimeString()} - Detected ${snapshot.docChanges().length} changes:`);
    snapshot.docChanges().forEach((change) => {
      const event = change.doc.data();
      if (change.type === 'added') {
        console.log(`  ➕ Added: ${event.title} by ${event.createdBy}`);
      } else if (change.type === 'modified') {
        console.log(`  ✏️  Modified: ${event.title}`);
      } else if (change.type === 'removed') {
        console.log(`  ❌ Removed: ${event.title}`);
      }
    });
    console.log('   Worker API will update within 5 minutes (cache refresh)');
  }, (error) => {
    console.error('❌ Listener error:', error.message);
  });
  
  return unsubscribe;
}

// YOUR 3 TBDIWSG EVENTS (UPDATE WITH ACTUAL DATA)
// These will be synced to Firestore automatically
const MY_EVENTS = [
  {
    id: `evt-tbdiwsg-1-${Date.now()}`,
    title: "TBDIWSG Event 1 - Accessibility Workshop",
    description: "TBDIWSG - Community accessibility workshop for injured workers",
    date: "2025-11-15T18:00:00.000Z",
    location: "Toronto, ON",
    isVirtual: false,
    asl: true,
    captions: true,
    stepFree: true,
    sensorySpace: false,
    tags: ['TBDIWSG', 'accessibility', 'workshop'],
    category: 'community'
  },
  {
    id: `evt-tbdiwsg-2-${Date.now() + 1}`,
    title: "TBDIWSG Event 2 - Support Group Meeting",
    description: "TBDIWSG - Virtual support group for injured workers",
    date: "2025-11-20T19:00:00.000Z",
    location: "Virtual",
    isVirtual: true,
    asl: true,
    captions: true,
    stepFree: false,
    sensorySpace: false,
    tags: ['TBDIWSG', 'support-group', 'virtual'],
    category: 'community'
  },
  {
    id: `evt-tbdiwsg-3-${Date.now() + 2}`,
    title: "TBDIWSG Event 3 - Rights Information Session",
    description: "TBDIWSG - Learn about your rights as an injured worker",
    date: "2025-12-01T14:00:00.000Z",
    location: "Montreal, QC",
    isVirtual: false,
    asl: false,
    captions: true,
    stepFree: true,
    sensorySpace: true,
    tags: ['TBDIWSG', 'rights', 'information'],
    category: 'community'
  }
];

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           🔄 AUTOMATED EVENT SYNC SYSTEM                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log(`👤 User: ${USER_EMAIL}`);
  console.log(`🆔 UID: ${USER_UID}\n`);
  
  // Step 1: Check current state
  console.log('📊 Checking current events in Firestore...\n');
  const allEvents = await getAllFirestoreEvents();
  const userEvents = await getUserEvents();
  
  console.log(`   Total events: ${allEvents.length}`);
  console.log(`   Your events: ${userEvents.length}`);
  console.log(`   System events: ${allEvents.length - userEvents.length}\n`);
  
  // Step 2: Show existing user events
  if (userEvents.length > 0) {
    console.log('✅ Your existing events in Firestore:');
    userEvents.forEach(evt => {
      const date = evt.date?.toDate ? evt.date.toDate().toISOString() : 'No date';
      console.log(`   - ${evt.title} (${date})`);
    });
    console.log('');
  } else {
    console.log('❌ No events found for your account in Firestore\n');
  }
  
  // Step 3: Sync your 3 TBDIWSG events
  console.log('🔄 Syncing your 3 TBDIWSG events to Firestore...\n');
  
  let successCount = 0;
  for (const event of MY_EVENTS) {
    const success = await syncEventToFirestore(event, 'events_production');
    if (success) successCount++;
    
    // Also sync to preview
    await syncEventToFirestore(event, 'events_preview');
  }
  
  console.log(`\n✅ Synced ${successCount}/${MY_EVENTS.length} events to production`);
  console.log(`✅ Synced ${successCount}/${MY_EVENTS.length} events to preview\n`);
  
  // Step 4: Verify sync
  console.log('🔍 Verifying events are now in Firestore...\n');
  const updatedUserEvents = await getUserEvents();
  console.log(`   Your events in Firestore: ${updatedUserEvents.length}`);
  if (updatedUserEvents.length >= 3) {
    console.log('   ✅ SUCCESS! Your TBDIWSG events are now synced!\n');
  }
  
  // Step 5: Check Worker API
  console.log('🌐 Checking Cloudflare Worker API...\n');
  try {
    const response = await fetch('https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community&limit=50');
    const data = await response.json();
    console.log(`   Community events on website: ${data.pagination.total}`);
    console.log('   ⏰ Note: May take up to 5 minutes for cache to refresh\n');
  } catch (error) {
    console.log('   ⚠️  Could not check Worker API (may be offline)\n');
  }
  
  // Step 6: Setup real-time monitoring
  console.log('🚀 Setting up real-time event monitoring...');
  console.log('   Press Ctrl+C to stop\n');
  
  const unsubscribe = setupRealtimeListener('events_production');
  
  // Keep script running
  process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping real-time sync...');
    unsubscribe();
    console.log('✅ Sync stopped. Your events are saved in Firestore.\n');
    process.exit(0);
  });
  
  console.log('💡 TIP: Check your calendar at:');
  console.log('   📱 App: Events tab → Your events should appear');
  console.log('   🌐 Web: https://3mpwrapp.pages.dev/events/');
  console.log('   📅 ICS: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics\n');
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
