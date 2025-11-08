/**
 * Add TBDIWSG Events to Firestore
 * Adds 3 Thunder Bay & District Injured Workers Support Group events
 * Usage: node add-tbdiwsg-events.mjs [production|preview|both]
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
  console.error('This file should exist in the server/ directory');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase
const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

// Determine which collections to seed
const environment = process.argv[2] || 'both';

const tbdiwsgEvents = [
  {
    id: 'tbdiwsg-dec16-2025',
    title: 'TBDIWSG Tuesday Information Session ZOOM',
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
    date: new Date('2025-12-16T10:00:00-05:00'),
    endDate: new Date('2025-12-16T12:00:00-05:00'),
    location: 'Virtual',
    isVirtual: true,
    category: 'community',
    organizer: 'Thunder Bay & District Injured Workers Support Group',
    url: 'https://thunderbayinjuredworkers.com/tuesday-events/',
    tags: ['workers-rights', 'zoom', 'information-session', 'westray-law', 'usw'],
    createdBy: 'empowrapp08162025@gmail.com',
    createdAt: Date.now(),
    status: 'published',
    asl: false,
    captions: false,
    stepFree: true, // Virtual event
    sensorySpace: false,
    attendeeCount: 0,
    imageUrl: '',
  },
  {
    id: 'tbdiwsg-nov20-2025',
    title: 'TBDIWSG Community Meeting In Person & ZOOM',
    description: `Join the Thunder Bay & District Injured Workers Support Group for a community meeting at 7:00 PM (doors open at 6:30) on Thursday November 20th at the OPSEU Office at 326 Memorial Ave. (beside the Merla Mae) Thunder Bay ON

• Share your experiences with WSIB
• Get updates on local actions including the Dryden RB4 exposures and the annual December Rally

Everyone Welcome
thunderbayinjuredworkers.com/

🔗 Powered by 3mpwr App
🌐 https://3mpwrapp.pages.dev/events/`,
    date: new Date('2025-11-20T18:30:00-05:00'),
    endDate: new Date('2025-11-20T20:00:00-05:00'),
    location: 'OPSEU Office, 326 Memorial Ave, Thunder Bay ON (beside the Merla Mae)',
    isVirtual: false, // Hybrid meeting
    category: 'community',
    organizer: 'Thunder Bay & District Injured Workers Support Group',
    url: 'https://thunderbayinjuredworkers.com/',
    tags: ['workers-rights', 'hybrid-meeting', 'wsib', 'community-meeting'],
    createdBy: 'empowrapp08162025@gmail.com',
    createdAt: Date.now(),
    status: 'published',
    asl: false,
    captions: false,
    stepFree: false,
    sensorySpace: false,
    attendeeCount: 0,
    imageUrl: '',
  },
  {
    id: 'tbdiwsg-nov11-2025',
    title: 'TBDIWSG Tuesday Information Session ZOOM',
    description: `Thunder Bay & District Injured Workers Support Group
November 11 – IWC – The WSIB "Surplus": A Political Slush Fund
Guest Speakers: Chris Grawey & Bonnie Heath

Contact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!
https://thunderbayinjuredworkers.com/tuesday-events/

📍 Virtual Event
🗓️ 2025-11-11 10-12
✨ Powered by 3mpwr App
🔗 https://3mpwrapp.pages.dev/events/`,
    date: new Date('2025-11-11T10:00:00-05:00'),
    endDate: new Date('2025-11-11T12:00:00-05:00'),
    location: 'Virtual',
    isVirtual: true,
    category: 'community',
    organizer: 'Thunder Bay & District Injured Workers Support Group',
    url: 'https://thunderbayinjuredworkers.com/tuesday-events/',
    tags: ['workers-rights', 'zoom', 'wsib', 'information-session', 'iwc'],
    createdBy: 'empowrapp08162025@gmail.com',
    createdAt: Date.now(),
    status: 'published',
    asl: false,
    captions: false,
    stepFree: true, // Virtual event
    sensorySpace: false,
    attendeeCount: 0,
    imageUrl: '',
  },
];

async function addEvents() {
  console.log('🚀 Adding TBDIWSG events to Firestore...\n');

  const collections = [];
  if (environment === 'production' || environment === 'both') {
    collections.push('events_production');
  }
  if (environment === 'preview' || environment === 'both') {
    collections.push('events_preview');
  }

  console.log(`📍 Target collections: ${collections.join(', ')}\n`);

  for (const event of tbdiwsgEvents) {
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).doc(event.id).set(event);
        console.log(`✅ ${collectionName}: ${event.title}`);
        console.log(`   📅 ${event.date.toISOString()}`);
        console.log(`   📍 ${event.location}\n`);
      } catch (error) {
        console.error(`❌ Error adding ${event.id} to ${collectionName}:`, error);
      }
    }
  }

  console.log('✅ All events added successfully!\n');
  console.log('🔄 Events will be available via:');
  console.log('   • Preview: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?env=preview');
  console.log('   • Production: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events');
  console.log('   • ICS Feed: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics');
  console.log('\n💡 Note: Cache refreshes every 5 minutes for JSON, 1 hour for ICS\n');
  
  process.exit(0);
}

addEvents().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
