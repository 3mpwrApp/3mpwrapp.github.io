const fs = require('fs');
const path = require('path');

const admin = require('firebase-admin');

// Initialize Firebase Admin with service account
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'empowrapp'
});

const db = admin.firestore();

async function restoreEvents() {
  console.log('📖 Loading events from public/api/events.json...\n');
  
  // Read the JSON file
  const jsonPath = path.join(__dirname, '..', 'public', 'api', 'events.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  
  // Remove BOM if present
  const cleanData = rawData.replace(/^\uFEFF/, '');
  const events = JSON.parse(cleanData);

  console.log(`🔄 Restoring ${events.length} events to Firestore...\n`);
  
  const collections = ['events_preview', 'events_production'];
  let successCount = 0;
  let errorCount = 0;

  for (const collection of collections) {
    console.log(`📁 Restoring to ${collection}...`);

    for (const event of events) {
      try {
        await db.collection(collection).doc(event.id).set(event, { merge: true });
        process.stdout.write('.');
        successCount++;
      } catch (error) {
        console.log(`\n  ❌ ${event.id}: ${error.message}`);
        errorCount++;
      }
    }
    console.log(` ✅ ${events.length} events\n`);
  }

  console.log('📊 RESTORE SUMMARY:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}\n`);
  
  if (successCount > 0) {
    console.log('✅ All events restored to Firestore!');
    console.log('🔄 Will appear in Cloudflare Worker within 5 minutes');
    console.log('🌐 https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events\n');
  }

  process.exit(errorCount > 0 && successCount === 0 ? 1 : 0);
}

restoreEvents().catch(error => {
  console.error('❌ Fatal error:', error.message);
  console.log('\n💡 You may need to manually restore events via Firebase Console:');
  console.log('https://console.firebase.google.com/project/empowrapp/firestore\n');
  process.exit(1);
});
