#!/usr/bin/env node
/**
 * FIX EVENT DATES IN FIRESTORE - ADMIN SDK VERSION
 * 
 * This script uses Firebase Admin SDK to fix dates for community events
 * that were incorrectly stored in Firestore.
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '..', 'serviceAccountKey.json'), 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://empowrapp-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

// Community events with correct dates from data/events.ts
const communityEvents = [
  {
    id: "evt-tbdiwsg-nov18-2025",
    title: "Tuesday Information Sessions ZOOM - Open Discussion",
    description: "It seems our message is falling on deft ears. Share your thoughts and experiences on how to talk to friends and neighbours about the failures of the system.\n\nTuesday Information Sessions with The Thunder Bay & District Injured Workers Support Group\n\nContact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!\nhttps://thunderbayinjuredworkers.com/tuesday-events/",
    date: "2025-11-18T15:00:00.000Z", // 10am EST
    endDate: "2025-11-18T17:00:00.000Z", // 12pm EST
    location: "Virtual",
    isVirtual: true,
    url: "https://thunderbayinjuredworkers.com/tuesday-events/",
    organizer: "Thunder Bay & District Injured Workers Support Group",
    organizerContact: "tbiwsg@gmail.com",
    category: "community",
    tags: ["injured-workers", "information-session", "discussion", "workers-rights", "advocacy", "zoom"],
    status: "published",
    attendeeCount: 0,
    imageUrl: "",
  },
  {
    id: "evt-tbdiwsg-nov25-2025",
    title: "Tuesday Information Sessions ZOOM - Duty to Accommodate",
    description: "Duty to Accommodate – Sandra Goodicks, PSAC OH&S Staff representative\n\nTuesday Information Sessions with The Thunder Bay & District Injured Workers Support Group\n\nContact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!\nhttps://thunderbayinjuredworkers.com/tuesday-events/",
    date: "2025-11-25T15:00:00.000Z", // 10am EST
    endDate: "2025-11-25T17:00:00.000Z", // 12pm EST
    location: "Virtual",
    isVirtual: true,
    url: "https://thunderbayinjuredworkers.com/tuesday-events/",
    organizer: "Thunder Bay & District Injured Workers Support Group",
    organizerContact: "tbiwsg@gmail.com",
    category: "community",
    tags: ["injured-workers", "duty-to-accommodate", "PSAC", "workplace-rights", "occupational-health", "information-session", "zoom"],
    status: "published",
    attendeeCount: 0,
    imageUrl: "",
  },
  {
    id: "evt-tbdiwsg-dec2-2025",
    title: "Tuesday Information Session ZOOM - Guest Speaker IWC",
    description: "We will share the experience of the November 25th MPP lobby to repeal the discrimination against injured workers over age 65, including videos of workers' testimonies. In addition there will be a report on the December 8 day of action, aka the \"Christmas demonstration\"\n\nTuesday Information Sessions with The Thunder Bay & District Injured Workers Support Group\n\nContact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!\nhttps://thunderbayinjuredworkers.com/tuesday-events/",
    date: "2025-12-02T15:00:00.000Z", // 10am EST
    endDate: "2025-12-02T17:00:00.000Z", // 12pm EST
    location: "Virtual",
    isVirtual: true,
    url: "https://thunderbayinjuredworkers.com/tuesday-events/",
    organizer: "Thunder Bay & District Injured Workers Support Group & IWC",
    organizerContact: "tbiwsg@gmail.com",
    category: "community",
    tags: ["injured-workers", "IWC", "advocacy", "workers-rights", "age-discrimination", "information-session", "zoom"],
    status: "published",
    attendeeCount: 0,
    imageUrl: "",
  },
  {
    id: "evt-3mpwr-intro-dec9-2025-updated",
    title: "Introduction to 3mpwr App - Website & App Demo",
    description: "Empowering Canadians Through Inclusive Technology!\n\nJoin us for an engaging introduction to the 3mpwr App — a new accessibility-driven platform created for Injured Workers, Persons with Disabilities, and their Allies across Canada.\n\nBuilt with accessibility, inclusion, and connection at its core, 3mpwr helps users navigate supports and services at both provincial and federal levels.\n\nPresented by Lissa Beaulieu (Creator), this session will feature a walkthrough of the 3mpwr App website and a live demo of the app currently in closed beta testing.\n\nDiscover how 3mpwr is empowering communities through technology that makes connection, coordination, and accessibility easier for everyone.\n\nTuesday Information Session with The Thunder Bay & District Injured Workers Support Group and 3mpwr App™️! Injured Workers' Unite\n\n🌐 Learn more: 3mpwrapp.pages.dev\nContact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!\nhttps://thunderbayinjuredworkers.com/tuesday-events/",
    date: "2025-12-09T15:00:00.000Z", // 10am EST
    endDate: "2025-12-09T17:00:00.000Z", // 12pm EST
    location: "Virtual",
    isVirtual: true,
    url: "https://thunderbayinjuredworkers.com/tuesday-events/",
    organizer: "Thunder Bay & District Injured Workers Support Group & 3mpwr App",
    organizerContact: "tbiwsg@gmail.com",
    category: "community",
    tags: ["accessibility", "injured-workers", "app-demo", "information-session", "technology", "inclusion", "zoom"],
    status: "published",
    attendeeCount: 0,
    imageUrl: "",
  },
  {
    id: "tbdiwsg-dec16-2025",
    title: "TBDIWSG Tuesday Information Session ZOOM",
    description: "Guest Kevon Stewart, District 6 Director, USW - Westray Law Enforcement\n\nTuesday Information Session with The Thunder Bay & District Injured Workers Support Group featuring Kevon Stewart, District 6 Director, United Steelworkers (USW).\n\nKevon will discuss in the presentation:\n\n• The criminal liability and prosecution of organizations who do not follow the Westray law\n• Why enforcement of the Westray law is not currently happening\n• The actions USW District 6 is taking for more dedicated investigators, prosecutors, and training for legal and police officials\n\nThe Westray law (Bill C-45) holds organizations and their representatives criminally liable for failing to ensure workplace health and safety. This critical session will explore the current state of enforcement and advocacy efforts to strengthen worker protections.\n\nContact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!\n\nEvent page: https://facebook.com/events/s/guest-kevon-stewart-district-6/1144594477804128/",
    date: "2025-12-16T15:00:00.000Z", // 10am EST
    endDate: "2025-12-16T17:00:00.000Z", // 12pm EST
    location: "Virtual",
    isVirtual: true,
    url: "https://thunderbayinjuredworkers.com/tuesday-events/",
    organizer: "Thunder Bay & District Injured Workers Support Group",
    organizerContact: "tbiwsg@gmail.com",
    category: "community",
    tags: ["injured-workers", "workplace-safety", "Westray-law", "USW", "workers-rights", "legal-advocacy", "occupational-health", "zoom"],
    status: "published",
    attendeeCount: 0,
    imageUrl: "",
  },
  {
    id: "tbdiwsg-nov20-2025",
    title: "TBDIWSG Community Meeting In Person & ZOOM",
    description: "Hybrid community meeting for Thunder Bay & District Injured Workers Support Group. Join us in person or via ZOOM.\n\nContact us at tbiwsg@gmail.com for details!",
    date: "2025-11-20T18:30:00.000Z", // 1:30pm EST
    endDate: "2025-11-20T20:00:00.000Z", // 3:00pm EST
    location: "Hybrid - In Person & ZOOM",
    isVirtual: false,
    url: "https://thunderbayinjuredworkers.com/tuesday-events/",
    organizer: "Thunder Bay & District Injured Workers Support Group",
    organizerContact: "tbiwsg@gmail.com",
    category: "community",
    tags: ["injured-workers", "community-meeting", "hybrid-event", "advocacy", "zoom"],
    status: "published",
    attendeeCount: 0,
    imageUrl: "",
  },
];

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   🔧 FIXING EVENT DATES IN FIRESTORE (ADMIN SDK)            ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

async function fixEventDates() {
  // Sync to both production and preview collections
  for (const collectionName of ['events_production', 'events_preview']) {
    console.log(`\n📦 Processing collection: ${collectionName}`);
    console.log('─'.repeat(64));
    
    for (const event of communityEvents) {
      try {
        console.log(`\n📅 Fixing: ${event.title}`);
        console.log(`   ID: ${event.id}`);
        console.log(`   Correct Date: ${event.date} (${new Date(event.date).toLocaleString()})`);
        
        // Convert ISO date strings to Firestore Timestamps
        const eventData = {
          ...event,
          date: admin.firestore.Timestamp.fromDate(new Date(event.date)),
          endDate: event.endDate 
            ? admin.firestore.Timestamp.fromDate(new Date(event.endDate)) 
            : admin.firestore.Timestamp.fromDate(new Date(event.date)),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'aS9Eh8A363d4EExLDWzZHLR8maw2', // System sync user
        };
        
        await db.collection(collectionName).doc(event.id).set(eventData, { merge: true });
        
        console.log(`   ✅ Fixed in ${collectionName}`);
      } catch (error) {
        console.error(`   ❌ Failed to fix ${event.id}:`, error.message);
      }
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ ALL EVENT DATES FIXED IN FIRESTORE!');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('🔄 Cloudflare Worker Cache:');
  console.log('   Cache will refresh automatically in 5 minutes (TTL: 300s)');
  console.log('   Or trigger immediate refresh by clearing cache\n');
  
  console.log('📱 Test in App:');
  console.log('   Pull to refresh on Events screen');
  console.log('   Filter by Community Events\n');
  
  console.log('🌐 Test on Website:');
  console.log('   https://3mpwrapp.pages.dev/events/');
  console.log('   Wait 5 minutes for cache to clear\n');
}

fixEventDates()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to fix event dates:', err);
    process.exit(1);
  });
