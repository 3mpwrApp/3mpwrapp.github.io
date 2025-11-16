// pii-scan-ignore-file - Contains example organizer email addresses in campaign event data
/**
 * Push "Every Canadian Counts" campaign to Firebase
 * 
 * This script adds the Every Canadian Counts campaign to Firestore,
 * which will automatically sync to the Cloudflare Worker website.
 * 
 * Run with: npx ts-node scripts/push-every-canadian-counts.ts
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

// Every Canadian Counts campaign data
const everyCanadiaCounts = {
  id: 'every-canadian-counts',
  title: 'Every Canadian Counts',
  summary: 'Support a publicly funded national disability insurance plan for Canadians with long-term or chronic disabilities. Sign and share petition e-6746.',
  target: 'Parliament of Canada',
  goalCount: 100000,
  membersCount: 460, // Real signature count as of November 9, 2025
  contactEmail: 'contact@everycanadiancounts.com',
  createdAt: Date.now(),
  createdBy: 'aS9Eh8A363d4EExLDWzZHLR8maw2', // empowrapp08162025@gmail.com user ID
  status: 'published',
  
  // Extended fields for this specific campaign
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
  
  legislation: [
    {
      name: 'Bill C-22',
      fullName: 'An Act to Reduce Poverty and to Support the Financial Security of Persons with Disabilities',
      status: 'Passed',
      description: 'Establishes the Canada Disability Benefit to reduce poverty among working-age persons with disabilities.',
    },
    {
      name: 'Accessible Canada Act',
      fullName: 'An Act to Ensure a Barrier-free Canada',
      status: 'In Force',
      description: 'Federal accessibility legislation to identify, remove, and prevent barriers to accessibility.',
    },
  ],
  
  internationalModel: {
    country: 'Australia',
    name: 'National Disability Insurance Scheme (NDIS)',
    description: 'Provides support for Australians with permanent and significant disability. Covers reasonable and necessary supports including daily activities, employment, social participation, and more.',
    launchYear: 2013,
    url: 'https://www.ndis.gov.au',
  },
  
  actionItems: [
    { id: 1, text: 'Sign petition e-6746', completed: false },
    { id: 2, text: 'Share petition on social media', completed: false },
    { id: 3, text: 'Email your MP about disability insurance', completed: false },
    { id: 4, text: 'Join the Every Canadian Counts community', completed: false },
    { id: 5, text: 'Attend a local advocacy event', completed: false },
  ],
  
  shareTemplates: {
    twitter: 'Every Canadian with a disability deserves access to housing, support, and care. Sign petition e-6746 for a national disability insurance plan! #EveryCanadianCounts #DisabilityRights\n\n🔗 Powered by 3mpwr App\n🌐 https://3mpwrapp.pages.dev/campaigns/',
    facebook: 'I just signed a petition calling for a publicly funded national disability insurance plan in Canada - similar to Australia\'s successful NDIS model. Those with long-term or chronic disabilities deserve access to housing, professionals, caregivers, programs, and technologies. Sign petition e-6746 and share! #EveryCanadianCounts\n\n🔗 Powered by 3mpwr App\n🌐 https://3mpwrapp.pages.dev/campaigns/',
    email: {
      subject: 'Support Every Canadian Counts - National Disability Insurance',
      body: `Hi,

I wanted to share an important petition with you: Every Canadian Counts.

This petition calls for a publicly funded national disability insurance plan for Canadians with long-term or chronic disabilities - ensuring access to housing, professional support, caregivers, programs, and assistive technologies.

Similar to Australia's successful National Disability Insurance Scheme (NDIS), this plan would complement Bill C-22 and the Accessible Canada Act to truly support Canadians with disabilities.

Please sign and share: https://www.ourcommons.ca/petitions/en/Petition/Details?Petition=e-6746

Learn more: https://everycanadiancounts.com

🔗 Powered by 3mpwr App
🌐 https://3mpwrapp.pages.dev/campaigns/

Thank you!`,
    },
  },
};

async function pushCampaign() {
  // eslint-disable-next-line no-console
  console.log('📣 Pushing Every Canadian Counts campaign to Firebase...\n');
  
  try {
    // Add to campaigns collection
    const campaignRef = doc(db, 'campaigns', everyCanadiaCounts.id);
    await setDoc(campaignRef, everyCanadiaCounts);
    
    // eslint-disable-next-line no-console
    console.log('✅ Campaign added to Firestore!');
    // eslint-disable-next-line no-console
    console.log(`   ID: ${everyCanadiaCounts.id}`);
    // eslint-disable-next-line no-console
    console.log(`   Title: ${everyCanadiaCounts.title}`);
    // eslint-disable-next-line no-console
    console.log(`   Goal: ${everyCanadiaCounts.goalCount.toLocaleString()} signatures`);
    // eslint-disable-next-line no-console
    console.log(`   Current: ${everyCanadiaCounts.membersCount} signatures\n`);
    
    // eslint-disable-next-line no-console
    console.log('🌐 Campaign will auto-sync to Cloudflare Worker website:');
    // eslint-disable-next-line no-console
    console.log('   https://3mpwrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns');
    // eslint-disable-next-line no-console
    console.log('   https://3mpwrapp.pages.dev/campaigns/\n');
    
    // eslint-disable-next-line no-console
    console.log('🔗 Petition URL:');
    // eslint-disable-next-line no-console
    console.log(`   ${everyCanadiaCounts.petitionUrl}\n`);
    
    // eslint-disable-next-line no-console
    console.log('✨ Done! Users can now see and join this campaign in the app.');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error pushing campaign:', error.message);
    console.error(error);
    process.exit(1);
  }
}

pushCampaign();
