const admin = require('firebase-admin');

const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'empowrapp'
});

const db = admin.firestore();

// Every Canadian Counts campaign data (from data/campaigns.ts)
const everyCanadiaCounts = {
  id: 'every-canadian-counts',
  title: 'Every Canadian Counts',
  summary: 'Support a publicly funded national disability insurance plan for Canadians with long-term or chronic disabilities. Sign and share petition e-6746.',
  target: 'Parliament of Canada',
  goalCount: 100000,
  membersCount: 460, // Real signature count as of November 9, 2025
  contactEmail: 'info@everycanadiancounts.com',
  createdAt: 1731196800000, // November 9, 2025
  createdBy: 'system',
  updatedAt: Date.now(),
  status: 'published',
  
  // Extended fields
  petitionId: 'e-6746',
  petitionUrl: 'https://www.ourcommons.ca/petitions/en/Petition/Details?Petition=e-6746',
  websiteUrl: 'https://everycanadiancounts.com',
  description: `Every Canadian Counts is a movement to ensure that those with long-term or chronic disabilities have access to:

• Housing
• Professional support
• Caregivers
• Programs and services
• Assistive technologies

All provided through a publicly funded national disability insurance plan, similar to Australia's National Disability Insurance Scheme (NDIS).`,
};

async function syncCampaignToFirestore() {
  console.log('🚀 Syncing Every Canadian Counts campaign to Firestore...\n');
  
  const collections = ['campaigns_production', 'campaigns_preview'];
  let successCount = 0;
  let errorCount = 0;

  for (const collection of collections) {
    console.log(`📁 Syncing to ${collection}...`);

    try {
      await db.collection(collection).doc(everyCanadiaCounts.id).set(everyCanadiaCounts, { merge: true });
      console.log(`  ✅ ${everyCanadiaCounts.id}`);
      successCount++;
    } catch (error) {
      console.log(`  ❌ ${everyCanadiaCounts.id}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n📊 SYNC SUMMARY:');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}\n`);
  
  if (successCount > 0) {
    console.log('✅ Campaign synced to Firestore!');
    console.log('🔄 Will appear in Cloudflare Worker within 5 minutes');
    console.log('🌐 https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/campaigns\n');
    console.log('📊 Campaign Details:');
    console.log(`  Title: ${everyCanadiaCounts.title}`);
    console.log(`  Petition: ${everyCanadiaCounts.petitionUrl}`);
    console.log(`  Goal: ${everyCanadiaCounts.goalCount.toLocaleString()} signatures`);
    console.log(`  Current: ${everyCanadiaCounts.membersCount} signatures`);
    console.log(`  Website: ${everyCanadiaCounts.websiteUrl}\n`);
  }

  process.exit(errorCount > 0 && successCount === 0 ? 1 : 0);
}

syncCampaignToFirestore();
