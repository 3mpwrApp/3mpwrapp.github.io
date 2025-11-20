#!/usr/bin/env node
/**
 * Clean up test campaigns from Firestore
 * Removes:
 * - "Verification Test Campaign" 
 * - "Test Sync Campaign"
 * - Duplicate "Every Canadian Counts" entries
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load Firebase credentials
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found');
  console.error(`   Expected at: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase
const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

async function cleanupTestCampaigns() {
  console.log('🧹 Cleaning up test campaigns from Firestore...\n');

  const collections = ['campaigns_production', 'campaigns_preview'];
  
  for (const collectionName of collections) {
    console.log(`\n📂 Checking ${collectionName}...`);
    
    try {
      const snapshot = await db.collection(collectionName).get();
      
      if (snapshot.empty) {
        console.log(`   ℹ️  Collection is empty`);
        continue;
      }

      console.log(`   Found ${snapshot.size} campaigns`);
      
      const testCampaignPatterns = [
        /verification.*test/i,
        /test.*sync/i,
        /test.*campaign/i,
      ];
      
      let deleted = 0;
      const everyCanadianCounts = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const title = data.title || '';
        const id = doc.id;
        
        // Check for test campaigns
        const isTestCampaign = testCampaignPatterns.some(pattern => pattern.test(title));
        
        if (isTestCampaign) {
          console.log(`   🗑️  Deleting test campaign: "${title}" (${id})`);
          await doc.ref.delete();
          deleted++;
        }
        
        // Track Every Canadian Counts entries for duplicate detection
        if (title.toLowerCase().includes('every canadian counts')) {
          everyCanadianCounts.push({ id, title, createdAt: data.createdAt });
        }
      }
      
      // Handle duplicates of "Every Canadian Counts"
      if (everyCanadianCounts.length > 1) {
        console.log(`\n   ⚠️  Found ${everyCanadianCounts.length} "Every Canadian Counts" entries`);
        
        // Sort by createdAt to keep the oldest one
        everyCanadianCounts.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        
        console.log(`   ✅ Keeping: "${everyCanadianCounts[0].title}" (${everyCanadianCounts[0].id})`);
        
        // Delete all duplicates except the first one
        for (let i = 1; i < everyCanadianCounts.length; i++) {
          const dup = everyCanadianCounts[i];
          console.log(`   🗑️  Deleting duplicate: "${dup.title}" (${dup.id})`);
          await db.collection(collectionName).doc(dup.id).delete();
          deleted++;
        }
      }
      
      if (deleted > 0) {
        console.log(`   ✅ Deleted ${deleted} campaigns from ${collectionName}`);
      } else {
        console.log(`   ✨ No test campaigns or duplicates found`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing ${collectionName}:`, error.message);
    }
  }
  
  console.log('\n✅ Cleanup complete!\n');
  process.exit(0);
}

cleanupTestCampaigns().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
