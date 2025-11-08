/**
 * Add TBDIWSG Events to Firestore
 * Adds 3 Thunder Bay & District Injured Workers Support Group events to preview and production
 */

const path = require('path');

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '..', 'firebase', 'empowrapp-firebase-adminsdk-kl8xb-3636a6fab6.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://empowrapp.firebaseio.com'
});

const db = admin.firestore();

const events = [
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
    date: '2025-12-16T10:00:00-05:00', // 10 AM EST
    endDate: '2025-12-16T12:00:00-05:00', // 12 PM EST
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
    sensorySpace: false
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
    date: '2025-11-20T18:30:00-05:00', // 6:30 PM EST (doors open)
    endDate: '2025-11-20T20:00:00-05:00', // Estimated 8 PM end
    location: 'OPSEU Office, 326 Memorial Ave, Thunder Bay ON (beside the Merla Mae)',
    isVirtual: false, // In-person + Zoom hybrid
    category: 'community',
    organizer: 'Thunder Bay & District Injured Workers Support Group',
    url: 'https://thunderbayinjuredworkers.com/',
    tags: ['workers-rights', 'hybrid-meeting', 'wsib', 'community-meeting'],
    createdBy: 'empowrapp08162025@gmail.com',
    createdAt: Date.now(),
    status: 'published',
    asl: false,
    captions: false,
    stepFree: false, // Need to verify accessibility
    sensorySpace: false
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
    date: '2025-11-11T10:00:00-05:00', // 10 AM EST
    endDate: '2025-11-11T12:00:00-05:00', // 12 PM EST
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
    sensorySpace: false
  }
];

async function addEvents() {
  console.log('🚀 Adding TBDIWSG events to Firestore...\n');

  for (const event of events) {
    try {
      // Add to events_preview
      await db.collection('events_preview').doc(event.id).set(event);
      console.log(`✅ Added to events_preview: ${event.title}`);

      // Add to events_production
      await db.collection('events_production').doc(event.id).set(event);
      console.log(`✅ Added to events_production: ${event.title}`);
      
      console.log(`   📅 Date: ${event.date}`);
      console.log(`   📍 Location: ${event.location}\n`);
    } catch (error) {
      console.error(`❌ Error adding event ${event.id}:`, error);
    }
  }

  console.log('✅ All events added successfully!');
  console.log('\n🔄 Events will be available via:');
  console.log('   • Preview: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?env=preview');
  console.log('   • Production: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events');
  console.log('   • ICS Feed: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics');
  
  process.exit(0);
}

addEvents().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
