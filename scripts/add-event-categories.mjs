import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Define category mappings based on event IDs and titles
const categoryMappings = {
  // Community events (TBDIWSG)
  community: [
    'tbdiwsg-nov11-2025',
    'evt-tbdiwsg-nov18-2025',
    'tbdiwsg-nov20-2025',
    'evt-tbdiwsg-nov25-2025',
    'evt-tbdiwsg-dec2-2025',
    'evt-3mpwr-intro-dec9-2025-updated',
    'tbdiwsg-dec16-2025'
  ],
  
  // Canadian holidays
  holiday: [
    'nF2ufSwSB78HOBN12ZO7', // New Year's Day
    'OVgwKohcDzNpXgO4SYtt', // Family Day
    '9yJ9t3yDbklIPLqzzCS6', // Good Friday
    'gcVoyPkJq2EH6ZwpFPmi', // Canada Day
    'hUpK3BfDx873Bn3eRvk3', // Victoria Day
    'O1YUl2zIMVn45UN5SxZx', // Labour Day
    'zo2z3WGy01ThBil9krPu', // Thanksgiving
    'pvOuoDWXwMuQMAfuHxDy', // Remembrance Day
    'bDbvEWLRpzLKJkMpiNmt', // Christmas Day
    'kPOHC2BuQFoH6NTntwFz'  // Boxing Day
  ],
  
  // Awareness days/months
  awareness: [
    'C6pf6823eHWc8zCrgpCS', // World Braille Day
    'Ef6uxs3BTHDrFxnSeGMt', // International Wheelchair Day
    'pdsESR3nELIuD6hiU9Ul', // International Wheelchair Day
    'COlxz0K5iJVX0C3u6zcC', // World Autism Awareness Day
    'KeZv4vuIZ2cRgh38QjIo', // Global Accessibility Awareness Day
    'B5KEah3frZ5frvnkcWdU', // International Day of Sign Languages
    'cG1MyVCIZbZfMBxZE8rv', // International Day of Persons with Disabilities
    'Tm5rlN691XzwSqHdehiM', // National Day of Mourning
    '3GGLYnGQMqhVXql2YaOe', // Injured Workers Day
    'RPx6DlhMFsem8N6Dqfde', // Autism Acceptance Month
    'PiuxdlrLhyP1sVr4jbhE', // Mental Health Awareness Month
    'AlsQT4eBNTpi1VB3GAdw', // Disability Employment Awareness Month
    'F08t2Xqoee3WYRklES27'  // Deafblind Awareness Month
  ],
  
  // Health awareness
  health: [
    'cciqcfgrhbP3vq6nOQMt', // Brain Injury Awareness Month
    'vY4YG09MxKEhl32TQdBl', // Multiple Sclerosis Awareness Month
    'FOFgH8gIkrcgoX6RP33P', // Parkinson's Awareness Month
    '2CDu055sjmdczWMZPS5f', // Celiac Disease Awareness Month
    'UwliscB7WM3gyg0uxvK3', // Arthritis Awareness Month
    'dUndXTQoXEZqOM1UHBPR', // Ehlers-Danlos Syndrome Awareness
    'vV1gntUdz5o1oSc9eai2', // Lupus Awareness Month
    'u0xp1XHkOdjbNMXDGzSr'  // Spinal Cord Injury Awareness Month
  ]
};

async function addCategories() {
  console.log('🔄 Starting to add categories to events...\n');
  
  const collections = ['events_production', 'events_preview'];
  let totalUpdated = 0;
  
  for (const collectionName of collections) {
    console.log(`\n📁 Processing collection: ${collectionName}`);
    
    const eventsRef = db.collection(collectionName);
    const snapshot = await eventsRef.get();
    
    console.log(`   Found ${snapshot.docs.length} events`);
    
    for (const doc of snapshot.docs) {
      const eventId = doc.id;
      const eventData = doc.data();
      
      // Find which category this event belongs to
      let category = null;
      for (const [cat, ids] of Object.entries(categoryMappings)) {
        if (ids.includes(eventId)) {
          category = cat;
          break;
        }
      }
      
      if (category) {
        // Update the event with the category
        await doc.ref.update({ category });
        console.log(`   ✓ Updated ${eventId} → category: ${category}`);
        totalUpdated++;
      } else {
        console.log(`   ⚠ Skipped ${eventId} (no category mapping)`);
      }
    }
  }
  
  console.log(`\n✅ Complete! Updated ${totalUpdated} events across both collections.`);
  console.log('\n📊 Category breakdown:');
  console.log(`   • Community events: ${categoryMappings.community.length}`);
  console.log(`   • Holidays: ${categoryMappings.holiday.length}`);
  console.log(`   • Awareness days/months: ${categoryMappings.awareness.length}`);
  console.log(`   • Health awareness: ${categoryMappings.health.length}`);
  console.log(`\n🌐 Website will sync these changes within 5 minutes!`);
  
  process.exit(0);
}

addCategories().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
