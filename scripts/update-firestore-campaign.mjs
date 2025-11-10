#!/usr/bin/env node

/**
 * Update Every Canadian Counts campaign contact email in Firestore
 * Run: node scripts/update-firestore-campaign.mjs
 */

import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';

// Firebase config from firebase/config.ts
const firebaseConfig = {
  apiKey: "AIzaSyC8bSc6_xYvHlp8S8pnhAMYYsI-FHOwhGE",
  authDomain: "empowrapp.firebaseapp.com",
  projectId: "empowrapp",
  storageBucket: "empowrapp.firebasestorage.app",
  messagingSenderId: "462685253323",
  appId: "1:462685253323:web:d33a2c9c7b79e4a5926d14",
};

console.log('🔧 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateCampaignEmail() {
  try {
    console.log('📝 Updating campaign email in Firestore...\n');
    
    const campaignRef = doc(db, 'campaigns_production', 'every-canadian-counts');
    
    // Check if document exists and get current data
    console.log('🔍 Fetching current document...');
    const docSnap = await getDoc(campaignRef);
    
    if (!docSnap.exists()) {
      console.error('❌ Campaign document not found at: campaigns_production/every-canadian-counts');
      console.log('\n💡 Tip: Make sure the document exists in Firestore');
      process.exit(1);
    }
    
    const currentData = docSnap.data();
    console.log('📧 Current contactEmail:', currentData.contactEmail || 'NOT SET');
    
    // Update the email
    console.log('\n⏳ Updating contactEmail...');
    await updateDoc(campaignRef, {
      contactEmail: 'info@everycanadiancounts.com'
    });
    
    console.log('✅ Successfully updated contactEmail!');
    
    // Verify the update
    console.log('\n🔍 Verifying update...');
    const updatedDocSnap = await getDoc(campaignRef);
    const updatedData = updatedDocSnap.data();
    console.log('✓ Confirmed contactEmail:', updatedData.contactEmail);
    
    console.log('\n✨ All done! The campaign email has been updated.');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error updating campaign:');
    console.error('   Message:', error.message);
    if (error.code) {
      console.error('   Code:', error.code);
    }
    console.log('\n💡 Common issues:');
    console.log('   - Firestore rules may require authentication');
    console.log('   - Check your Firebase project permissions');
    console.log('   - Document path may be incorrect');
    process.exit(1);
  }
}

console.log('🚀 Starting Firestore update...\n');
updateCampaignEmail();
