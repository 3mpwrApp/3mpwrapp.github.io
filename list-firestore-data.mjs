import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function getData() {
  // Get campaigns
  const campaigns = await db.collection('campaigns_production').get();
  console.log('=== CAMPAIGNS (Production) ===\n');
  
  campaigns.docs.forEach(doc => {
    const d = doc.data();
    console.log(`📢 ${d.title}`);
    console.log(`   ID: ${doc.id}`);
    console.log(`   Status: ${d.status || 'active'}`);
    console.log(`   Type: ${d.type || 'petition'}`);
    console.log(`   Target: ${d.target || 'N/A'}`);
    console.log(`   Website: ${d.websiteUrl || 'N/A'}`);
    console.log(`   Petition: ${d.petitionUrl || 'N/A'}`);
    console.log('');
  });

  // Get events
  const events = await db.collection('events_production').get();
  console.log('\n=== EVENTS (Production) ===\n');
  
  events.docs.forEach(doc => {
    const d = doc.data();
    const date = d.date?.toDate?.() || new Date(d.date);
    console.log(`📅 ${d.title}`);
    console.log(`   ID: ${doc.id}`);
    console.log(`   Date: ${date.toLocaleString('en-US', { 
      timeZone: 'America/Toronto', 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })}`);
    console.log(`   Type: ${d.type || 'N/A'}`);
    console.log(`   Location: ${d.location || 'N/A'}`);
    console.log(`   Virtual: ${d.isVirtual ? 'Yes' : 'No'}`);
    if (d.virtualLink) console.log(`   Link: ${d.virtualLink}`);
    if (d.eventUrl) console.log(`   Event URL: ${d.eventUrl}`);
    console.log('');
  });

  process.exit(0);
}

getData().catch(console.error);
