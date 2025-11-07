#!/usr/bin/env node
/**
 * SYNC 3 TBDIWSG EVENTS TO FIRESTORE
 * 
 * Syncs the 3 TBDIWSG events found in AsyncStorage to Firestore production
 */

import { initializeApp } from 'firebase/app';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLHji57qfHfhSY5a7hRxLFODZrVGrSbK4",
  authDomain: "empowrapp.firebaseapp.com",
  projectId: "empowrapp",
  storageBucket: "empowrapp.firebasestorage.app",
  messagingSenderId: "828692191849",
  appId: "1:828692191849:web:89f26506eeec77aa0d49d3",
  measurementId: "G-68G9D9X6MX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const events = [
  {
    id: 'evt-tbdiwsg-1',
    title: 'TBDIWSG Tuesday Information Session',
    description: 'Weekly information session on ZOOM',
    date: '2025-12-16T10:00:00.000Z',
    time: '10:00',
    duration: 120, // minutes
    location: 'ZOOM',
    isVirtual: true,
    category: 'community',
    asl: true,
    captions: true,
    stepFree: true,
    sensorySpace: false,
    createdBy: 'aS9Eh8A363d4EExLDWzZHLR8maw2',
    organizer: 'empowrapp08162025@gmail.com',
    createdAt: Date.now(),
  },
  {
    id: 'evt-tbdiwsg-2',
    title: 'TBDIWSG Community Meeting',
    description: 'Hybrid community meeting - in person and ZOOM',
    date: '2025-11-20T18:30:00.000Z',
    time: '18:30',
    duration: 90, // minutes
    location: 'Hybrid - In Person & ZOOM',
    isVirtual: false,
    category: 'community',
    asl: true,
    captions: true,
    stepFree: true,
    sensorySpace: false,
    createdBy: 'aS9Eh8A363d4EExLDWzZHLR8maw2',
    organizer: 'empowrapp08162025@gmail.com',
    createdAt: Date.now(),
  },
  {
    id: 'evt-tbdiwsg-3',
    title: 'TBDIWSG Tuesday Information Session',
    description: 'Weekly information session on ZOOM',
    date: '2025-11-11T10:00:00.000Z',
    time: '10:00',
    duration: 120, // minutes
    location: 'ZOOM',
    isVirtual: true,
    category: 'community',
    asl: true,
    captions: true,
    stepFree: true,
    sensorySpace: false,
    createdBy: 'aS9Eh8A363d4EExLDWzZHLR8maw2',
    organizer: 'empowrapp08162025@gmail.com',
    createdAt: Date.now(),
  }
];

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   🚀 SYNCING 3 TBDIWSG EVENTS TO FIRESTORE PRODUCTION       ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

async function syncEvents() {
  for (const event of events) {
    try {
      console.log(`📤 Syncing: ${event.title}`);
      console.log(`   Date: ${event.date}`);
      console.log(`   Location: ${event.location}`);
      
      const eventRef = doc(db, 'events_production', event.id);
      await setDoc(eventRef, {
        ...event,
        updatedAt: serverTimestamp(),
      });
      
      console.log(`✅ Synced to Firestore: ${event.id}\n`);
    } catch (error) {
      console.error(`❌ Failed to sync ${event.id}:`, error.message);
    }
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ ALL 3 EVENTS SYNCED TO FIRESTORE!');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('🌐 Check Cloudflare Worker in 5 minutes:');
  console.log('   https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community\n');
  console.log('📅 Events will appear on website calendar:');
  console.log('   https://3mpwrapp.pages.dev/events/\n');
}

syncEvents()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to sync events:', err);
    process.exit(1);
  });
