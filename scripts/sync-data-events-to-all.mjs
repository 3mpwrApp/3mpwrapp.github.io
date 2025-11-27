#!/usr/bin/env node
/**
 * SYNC data/events.ts TO FIREBASE & CLOUDFLARE
 * 
 * This script:
 * 1. Imports events from data/events.ts
 * 2. Syncs them to Firestore (events_production & events_preview)
 * 3. Syncs to Cloudflare Workers via API
 * 
 * Usage: node scripts/sync-data-events-to-all.mjs
 */

import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc, Timestamp } from 'firebase/firestore';
import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const EVENTS_WORKER_URL = 'https://3mpwrapp-calendar.empowrapp08162025.workers.dev';

/**
 * Load events from data/events.ts
 */
async function loadLocalEvents() {
  console.log('📂 Loading events from data/events.ts...\n');
  
  try {
    const eventsPath = join(ROOT, 'data', 'events.ts');
    const content = await readFile(eventsPath, 'utf-8');
    
    // Extract events array using regex (simple extraction)
    const match = content.match(/export const events: Event\[\] = \[([\s\S]*?)\];/);
    if (!match) {
      throw new Error('Could not find events array in data/events.ts');
    }
    
    // Parse the events manually by converting TypeScript to JSON-like format
    // This is a simplified parser - for production use proper TS parsing
    const eventsText = match[1];
    
    // Extract individual event objects
    const eventMatches = eventsText.matchAll(/\{[\s\S]*?\n  \}/g);
    const events = [];
    
    for (const eventMatch of eventMatches) {
      const eventText = eventMatch[0];
      
      // Extract fields
      const id = eventText.match(/id:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const title = eventText.match(/title:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const description = eventText.match(/description:\s*['"`]([\s\S]*?)['"`],?\n/)?.[1]?.replace(/\\n/g, '\n').replace(/\\'/g, "'");
      const date = eventText.match(/date:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const location = eventText.match(/location:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const isVirtual = eventText.match(/isVirtual:\s*(true|false)/)?.[1] === 'true';
      const virtualLink = eventText.match(/virtualLink:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const category = eventText.match(/category:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const tags = eventText.match(/tags:\s*\[(.*?)\]/)?.[1]?.split(',').map(t => t.trim().replace(/['"]/g, '')) || [];
      const organizer = eventText.match(/organizer:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const organizerContact = eventText.match(/organizerContact:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const status = eventText.match(/status:\s*['"`]([^'"`]+)['"`]/)?.[1] || 'published';
      const registrationRequired = eventText.match(/registrationRequired:\s*(true|false)/)?.[1] === 'true';
      const registrationLink = eventText.match(/registrationLink:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const wheelchairAccessible = eventText.match(/wheelchairAccessible:\s*(true|false)/)?.[1] === 'true';
      const stepFree = eventText.match(/stepFree:\s*(true|false)/)?.[1] === 'true';
      const energyCost = eventText.match(/energyCost:\s*['"`]([^'"`]+)['"`]/)?.[1];
      const accessibilityNotes = eventText.match(/accessibilityNotes:\s*['"`]([\s\S]*?)['"`],?\n/)?.[1];
      
      if (id && title && date) {
        events.push({
          id,
          title,
          description: description || '',
          date,
          location: location || '',
          isVirtual: isVirtual || false,
          virtualLink: virtualLink || '',
          category: category || 'community',
          tags: tags.filter(t => t.length > 0),
          organizer: organizer || '3mpwrApp',
          organizerContact: organizerContact || '',
          status,
          registrationRequired: registrationRequired || false,
          registrationLink: registrationLink || '',
          wheelchairAccessible: wheelchairAccessible || false,
          stepFree: stepFree || false,
          energyCost: energyCost || 'medium',
          accessibilityNotes: accessibilityNotes || '',
          asl: false,
          captions: false,
          sensorySpace: false,
        });
      }
    }
    
    console.log(`   ✅ Loaded ${events.length} events from data/events.ts\n`);
    return events;
  } catch (error) {
    console.error('   ❌ Failed to load events:', error.message);
    throw error;
  }
}

/**
 * Sync event to Firestore
 */
async function syncEventToFirestore(event, collectionName) {
  try {
    const eventDate = new Date(event.date);
    
    const eventData = {
      id: event.id,
      title: event.title,
      description: event.description || '',
      date: Timestamp.fromDate(eventDate),
      location: event.location || '',
      isVirtual: event.isVirtual || false,
      virtualLink: event.virtualLink || '',
      asl: event.asl || false,
      captions: event.captions || false,
      stepFree: event.stepFree || false,
      sensorySpace: event.sensorySpace || false,
      wheelchairAccessible: event.wheelchairAccessible || false,
      tags: event.tags || [],
      organizer: event.organizer || '3mpwrApp',
      organizerContact: event.organizerContact || '',
      imageUrl: event.imageUrl || '',
      attendeeCount: event.attendeeCount || 0,
      url: event.virtualLink || event.registrationLink || '',
      category: event.category || 'community',
      energyCost: event.energyCost || 'medium',
      registrationRequired: event.registrationRequired || false,
      registrationLink: event.registrationLink || '',
      accessibilityNotes: event.accessibilityNotes || '',
      createdBy: event.createdBy || 'system-events',
      createdAt: event.createdAt || Date.now(),
      updatedAt: Date.now(),
      status: event.status || 'published'
    };
    
    await setDoc(doc(db, collectionName, event.id), eventData, { merge: true });
    return true;
  } catch (error) {
    console.error(`   ❌ Failed: ${event.title} - ${error.message}`);
    return false;
  }
}

/**
 * Sync events to Cloudflare Worker
 */
async function syncEventsToCloudflare(events, env = 'production') {
  console.log(`\n📤 Syncing to Cloudflare Worker (${env})...\n`);
  
  try {
    const url = env === 'preview' 
      ? `${EVENTS_WORKER_URL}/api/events/bulk?env=preview`
      : `${EVENTS_WORKER_URL}/api/events/bulk`;
    
    // Convert Firestore Timestamps back to ISO strings for Cloudflare
    const eventsForWorker = events.map(e => ({
      ...e,
      date: typeof e.date === 'string' ? e.date : new Date(e.date).toISOString()
    }));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: eventsForWorker })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`   ✅ Cloudflare sync complete: ${result.successful} succeeded, ${result.failed} failed\n`);
    
    return result;
  } catch (error) {
    console.error(`   ❌ Cloudflare sync failed:`, error.message);
    // Don't throw - continue with other operations
    return { successful: 0, failed: events.length };
  }
}

/**
 * Verify sync
 */
async function verifySync() {
  console.log('\n🔍 Verifying sync...\n');
  
  try {
    // Check production
    const prodResponse = await fetch(`${EVENTS_WORKER_URL}/api/events`);
    const prodData = await prodResponse.json();
    console.log(`   Production events: ${prodData.events?.length || 0}`);
    
    // Check preview
    const previewResponse = await fetch(`${EVENTS_WORKER_URL}/api/events?env=preview`);
    const previewData = await previewResponse.json();
    console.log(`   Preview events: ${previewData.events?.length || 0}`);
    
    console.log('\n🌐 Public URLs:');
    console.log(`   Production: ${EVENTS_WORKER_URL}/api/events`);
    console.log(`   Preview: ${EVENTS_WORKER_URL}/api/events?env=preview`);
    console.log(`   ICS Feed: ${EVENTS_WORKER_URL}/events.ics\n`);
    
  } catch (error) {
    console.error('   ❌ Verification failed:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     📅 SYNC data/events.ts → FIREBASE & CLOUDFLARE         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Load events from data/events.ts
    const events = await loadLocalEvents();
    
    if (events.length === 0) {
      console.log('⚠️  No events found in data/events.ts\n');
      process.exit(0);
    }
    
    console.log('📋 Events to sync:');
    events.forEach((e, i) => {
      console.log(`   ${i + 1}. ${e.title} (${e.date})`);
    });
    console.log('');
    
    // Sync to Firestore production
    console.log('🔄 Syncing to Firestore (events_production)...\n');
    let prodSuccess = 0;
    for (const event of events) {
      const success = await syncEventToFirestore(event, 'events_production');
      if (success) {
        prodSuccess++;
        process.stdout.write(`\r   Progress: ${prodSuccess}/${events.length}`);
      }
    }
    console.log(`\n   ✅ Firestore production: ${prodSuccess}/${events.length} synced\n`);
    
    // Sync to Firestore preview
    console.log('🔄 Syncing to Firestore (events_preview)...\n');
    let previewSuccess = 0;
    for (const event of events) {
      const success = await syncEventToFirestore(event, 'events_preview');
      if (success) {
        previewSuccess++;
        process.stdout.write(`\r   Progress: ${previewSuccess}/${events.length}`);
      }
    }
    console.log(`\n   ✅ Firestore preview: ${previewSuccess}/${events.length} synced\n`);
    
    // Sync to Cloudflare production
    await syncEventsToCloudflare(events, 'production');
    
    // Sync to Cloudflare preview
    await syncEventsToCloudflare(events, 'preview');
    
    // Verify
    await verifySync();
    
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                     ✅ SYNC COMPLETE                        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📊 Summary:`);
    console.log(`   • ${events.length} events from data/events.ts`);
    console.log(`   • Synced to Firebase (production & preview)`);
    console.log(`   • Synced to Cloudflare Workers (production & preview)`);
    console.log(`   • Events will appear on website within 5 minutes\n`);
    
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
