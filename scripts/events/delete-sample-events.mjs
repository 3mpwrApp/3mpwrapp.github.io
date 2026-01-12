// Delete sample events from Firestore
import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Known sample event IDs
const SAMPLE_EVENT_IDS = [
  'Yk1p4IJ66gGxkI0F8mCc',
  'bYfSpZdmLv2o5Pfijv4V'
];

async function main() {
  console.log('\n=== DELETING SAMPLE EVENTS ===\n');
  
  // Delete by ID
  for (const id of SAMPLE_EVENT_IDS) {
    try {
      await db.collection('events_production').doc(id).delete();
      console.log(`DELETE from events_production: ${id}`);
    } catch (e) {
      console.log(`Not found in production: ${id}`);
    }
    try {
      await db.collection('events_preview').doc(id).delete();
      console.log(`DELETE from events_preview: ${id}`);
    } catch (e) {
      // Ignore
    }
  }
  
  // Also find and delete by title pattern
  const prodSnap = await db.collection('events_production').get();
  let deleted = 0;
  
  for (const doc of prodSnap.docs) {
    const d = doc.data();
    // Delete sample events - Community Accessibility Workshop
    if (d.title && d.title.includes('Community Accessibility Workshop')) {
      console.log(`DELETE from events_production: ${doc.id} - "${d.title}"`);
      await db.collection('events_production').doc(doc.id).delete();
      deleted++;
      
      // Also delete from preview
      try {
        await db.collection('events_preview').doc(doc.id).delete();
        console.log(`DELETE from events_preview: ${doc.id}`);
      } catch (e) {
        // Ignore if not in preview
      }
    }
  }
  
  console.log(`\nDeleted ${deleted + SAMPLE_EVENT_IDS.length} sample events`);
  process.exit(0);
}

main().catch(console.error);
