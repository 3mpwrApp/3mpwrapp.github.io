/**
 * Push TBDIWSG Events to Firebase
 * 
 * This script adds the 3 TBDIWSG (Thunder Bay & District Injured Workers Support Group)
 * events to both events_production and events_preview collections in Firestore.
 * 
 * These events will automatically sync to:
 * - Cloudflare Worker website (https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events)
 * - ICS calendar feed (https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics)
 * - Static website (https://3mpwrapp.pages.dev/events/)
 * 
 * Run with: npx ts-node scripts/push-tbdiwsg-events.ts
 */

import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

// Firebase config (same as your app)
const firebaseConfig = {
  apiKey: "AIzaSyDmZy-HMf0wOMXjCxxnTHcJOLmPREjl8Gs",
  authDomain: "empowrapp-new.firebaseapp.com",
  projectId: "empowrapp-new",
  storageBucket: "empowrapp-new.firebasestorage.app",
  messagingSenderId: "733708119893",
  appId: "1:733708119893:web:c76c2e2eca75eeda4abc62",
  measurementId: "G-52DS42BFQG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// TBDIWSG Events
const tbdiwsgEvents = [
  {
    id: "tbdiwsg-nov11-2025",
    title: "TBDIWSG Tuesday Information Session ZOOM",
    description: `Thunder Bay & District Injured Workers Support Group
November 11 – IWC – The WSIB "Surplus": A Political Slush Fund
Guest Speakers: Chris Grawey & Bonnie Heath

Contact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!
https://thunderbayinjuredworkers.com/tuesday-events/

🌐 Virtual Event
📅️ 2025-11-11 10-12
✨ Powered by 3mpwr App
🔗 https://3mpwrapp.pages.dev/events/`,
    date: new Date("2025-11-11T15:00:00.000Z"),
    endDate: new Date("2025-11-11T17:00:00.000Z"),
    time: "10:00",
    duration: 120,
    location: "Virtual",
    category: "community",
    isVirtual: true,
    url: "https://thunderbayinjuredworkers.com/tuesday-events/",
    organizer: "Thunder Bay & District Injured Workers Support Group",
    asl: true,
    captions: true,
    stepFree: true,
    sensorySpace: false,
    energyLevel: "low",
    requiresRSVP: false,
    createdBy: "aS9Eh8A363d4EExLDWzZHLR8maw2",
    createdAt: 1699334000000,
    status: "published",
    tags: ["workers-rights", "zoom", "wsib", "information-session", "iwc"],
  },
  {
    id: "tbdiwsg-nov20-2025",
    title: "TBDIWSG Community Meeting In Person & ZOOM",
    description: `Join the Thunder Bay & District Injured Workers Support Group for a community meeting at 7:00 PM (doors open at 6:30) on Thursday November 20th at the OPSEU Office at 326 Memorial Ave. (beside the Merla Mae) Thunder Bay ON

• Share your experiences with WSIB
• Get updates on local actions including the Dryden RB4 exposures and the annual December Rally

Everyone Welcome
thunderbayinjuredworkers.com/

🔗 Powered by 3mpwr App
🌐 https://3mpwrapp.pages.dev/events/`,
    date: new Date("2025-11-20T23:30:00.000Z"),
    endDate: new Date("2025-11-21T01:00:00.000Z"),
    time: "18:30",
    duration: 90,
    location: "OPSEU Office, 326 Memorial Ave, Thunder Bay ON (beside the Merla Mae)",
    category: "community",
    isVirtual: false,
    url: "https://thunderbayinjuredworkers.com/",
    organizer: "Thunder Bay & District Injured Workers Support Group",
    asl: true,
    captions: true,
    stepFree: true,
    sensorySpace: false,
    energyLevel: "medium",
    requiresRSVP: true,
    rsvpDetails: "contact tbiwsg@gmail.com",
    createdBy: "aS9Eh8A363d4EExLDWzZHLR8maw2",
    createdAt: 1699334000000,
    status: "published",
    tags: ["workers-rights", "hybrid-meeting", "wsib", "community-meeting"],
  },
  {
    id: "tbdiwsg-dec16-2025",
    title: "TBDIWSG Tuesday Information Session ZOOM",
    description: `Thunder Bay & District Injured Workers Support Group 
Dec 16 – Guest Kevon Stewart, District 6 Director, USW

Kevon will discuss in the presentation:
• The criminal liability and prosecution of organizations who do not follow the Westray law.
• Why enforcement of the Westray law is not currently happening.
• The actions USW District 6 is taking for more dedicated investigators, prosecutors, and training for legal and police officials.

Contact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!
https://thunderbayinjuredworkers.com/tuesday-events/

🔗 Powered by 3mpwr App
🌐 https://3mpwrapp.pages.dev/events/`,
    date: new Date("2025-12-16T15:00:00.000Z"),
    endDate: new Date("2025-12-16T17:00:00.000Z"),
    time: "10:00",
    duration: 120,
    location: "Virtual",
    category: "community",
    isVirtual: true,
    url: "https://thunderbayinjuredworkers.com/tuesday-events/",
    organizer: "Thunder Bay & District Injured Workers Support Group",
    asl: true,
    captions: true,
    stepFree: true,
    sensorySpace: false,
    energyLevel: "low",
    requiresRSVP: false,
    createdBy: "aS9Eh8A363d4EExLDWzZHLR8maw2",
    createdAt: 1699334000000,
    status: "published",
    tags: ["workers-rights", "zoom", "wsib", "westray-law", "workplace-safety"],
  },
];

async function pushEvents() {
  console.log('📅 Pushing TBDIWSG events to Firebase...\n');
  
  try {
    for (const event of tbdiwsgEvents) {
      console.log(`   → ${event.title}`);
      console.log(`     Date: ${event.date.toLocaleDateString()}`);
      console.log(`     Location: ${event.location}`);
      
      // Add to events_production collection
      const prodRef = doc(db, 'events_production', event.id);
      await setDoc(prodRef, event);
      console.log(`     ✓ Added to events_production`);
      
      // Add to events_preview collection
      const previewRef = doc(db, 'events_preview', event.id);
      await setDoc(previewRef, event);
      console.log(`     ✓ Added to events_preview\n`);
    }
    
    console.log(`✅ Successfully pushed ${tbdiwsgEvents.length} TBDIWSG events to Firestore!\n`);
    
    console.log('🌐 Events will auto-sync to:');
    console.log('   • Cloudflare Worker API: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events');
    console.log('   • ICS Calendar Feed: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics');
    console.log('   • Static Website: https://3mpwrapp.pages.dev/events/\n');
    
    console.log('📱 Users will see these events in:');
    console.log('   • Events tab calendar');
    console.log('   • Calendar subscriptions');
    console.log('   • External calendar apps (Google Calendar, Apple Calendar, etc.)\n');
    
    console.log('✨ Done! TBDIWSG events are now live and syncing automatically.');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error pushing events:', error.message);
    console.error(error);
    process.exit(1);
  }
}

pushEvents();
