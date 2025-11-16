const admin = require('firebase-admin');

// Initialize without credentials for Cloud Functions environment
admin.initializeApp({
  projectId: 'empowrapp'
});

const db = admin.firestore();

// Load events from data/events.ts compiled output
const { events } = require('../data/events');

async function restoreEvents() {
  console.log(`🔄 Restoring ${events.length} events to Firestore...\n`);
  
  const collections = ['events_preview', 'events_production'];
  let successCount = 0;
  let errorCount = 0;

  for (const collection of collections) {
    console.log(`📁 Restoring to ${collection}...`);

    const batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH = 500;

    for (const event of events) {
      const docRef = db.collection(collection).doc(event.id);
      batch.set(docRef, event, { merge: true });
      batchCount++;

      if (batchCount >= MAX_BATCH) {
        try {
          await batch.commit();
          successCount += batchCount;
          console.log(`  ✅ Batch of ${batchCount} events written`);
          batchCount = 0;
        } catch (error) {
          console.log(`  ❌ Batch failed: ${error.message}`);
          errorCount += batchCount;
        }
      }
    }

    // Commit remaining
    if (batchCount > 0) {
      try {
        await batch.commit();
        successCount += batchCount;
        console.log(`  ✅ Final batch of ${batchCount} events written`);
      } catch (error) {
        console.log(`  ❌ Final batch failed: ${error.message}`);
        errorCount += batchCount;
      }
    }
    console.log('');
  }

  console.log('📊 RESTORE SUMMARY:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}\n`);
  
  if (successCount > 0) {
    console.log('✅ All events restored to Firestore!');
    console.log('🔄 Will appear in Cloudflare Worker within 5 minutes\n');
  }

  process.exit(errorCount > 0 && successCount === 0 ? 1 : 0);
}

restoreEvents();
