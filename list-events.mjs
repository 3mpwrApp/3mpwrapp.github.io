// List events from Firestore
import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function main() {
  console.log('\n=== EVENTS IN FIRESTORE ===\n');
  
  // Production
  const prodSnap = await db.collection('events_production').get();
  console.log(`events_production: ${prodSnap.size} docs`);
  for (const doc of prodSnap.docs) {
    const d = doc.data();
    console.log(`  - ${doc.id}`);
    console.log(`    title: ${d.title}`);
    console.log(`    status: ${d.status}`);
    console.log(`    category: ${d.category}`);
    console.log(`    createdBy: ${d.createdBy}`);
    console.log('');
  }
  
  // Preview  
  const previewSnap = await db.collection('events_preview').get();
  console.log(`\nevents_preview: ${previewSnap.size} docs`);
  for (const doc of previewSnap.docs) {
    const d = doc.data();
    console.log(`  - ${doc.id}`);
    console.log(`    title: ${d.title}`);
    console.log(`    status: ${d.status}`);
    console.log(`    category: ${d.category}`);
    console.log(`    createdBy: ${d.createdBy}`);
    console.log('');
  }
  
  process.exit(0);
}

main().catch(console.error);
