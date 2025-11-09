#!/usr/bin/env node
/**
 * Firestore Event Deduplication Script
 * 
 * Identifies and merges duplicate events in Firestore based on:
 * - Normalized title (case-insensitive, whitespace normalized)
 * - Start date (YYYY-MM-DD)
 * - Normalized location
 * 
 * Usage:
 *   node scripts/firestore-dedupe-events.mjs [--dry-run] [--env preview|production]
 * 
 * Requires:
 *   - Firebase Admin SDK
 *   - Service account credentials in GOOGLE_APPLICATION_CREDENTIALS env var
 *     OR google-services.json in project root
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const envArg = args.find(a => a.startsWith('--env='));
const environment = envArg ? envArg.split('=')[1] : 'production';
const collectionName = environment === 'preview' ? 'events_preview' : 'events_production';

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔧 Firestore Event Deduplication Script');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(`Environment: ${environment}`);
console.log(`Collection: ${collectionName}`);
console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes)' : '✏️  LIVE (will modify Firestore)'}\n`);

// Initialize Firebase Admin
let serviceAccount;
try {
  // Try GOOGLE_APPLICATION_CREDENTIALS first
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'));
    console.log(`✓ Loaded credentials from: ${credPath}`);
  } else {
    // Fall back to google-services.json
    const fallbackPath = join(__dirname, '..', 'google-services.json');
    serviceAccount = JSON.parse(readFileSync(fallbackPath, 'utf8'));
    console.log(`✓ Loaded credentials from: google-services.json`);
  }
} catch (error) {
  console.error('❌ Failed to load service account credentials:', error.message);
  console.error('\nPlease set GOOGLE_APPLICATION_CREDENTIALS or place google-services.json in project root.');
  process.exit(1);
}

// Initialize Firestore
let db;
try {
  initializeApp({
    credential: cert(serviceAccount),
  });
  db = getFirestore();
  console.log('✓ Connected to Firestore\n');
} catch (error) {
  console.error('❌ Failed to initialize Firestore:', error.message);
  process.exit(1);
}

/**
 * Normalize a string for comparison (lowercase, trim, collapse whitespace)
 */
function normalize(str) {
  if (!str) return '';
  return str.toString().trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toISOString().slice(0, 10);
}

/**
 * Generate dedupe key from event data
 */
function getDedupeKey(event) {
  const title = normalize(event.title || '');
  const date = formatDate(event.date);
  const location = normalize(event.location || '');
  return `${title}|${date}|${location}`;
}

/**
 * Merge duplicate events, keeping the one with most complete data
 */
function selectCanonical(duplicates) {
  // Sort by: 1) earliest created, 2) most fields populated, 3) longest description
  return duplicates.sort((a, b) => {
    // Prefer events with more populated fields
    const aFields = Object.values(a.data).filter(v => v !== null && v !== undefined && v !== '').length;
    const bFields = Object.values(b.data).filter(v => v !== null && v !== undefined && v !== '').length;
    if (bFields !== aFields) return bFields - aFields;
    
    // Prefer longer descriptions
    const aDescLen = (a.data.description || '').length;
    const bDescLen = (b.data.description || '').length;
    if (bDescLen !== aDescLen) return bDescLen - aDescLen;
    
    // Fall back to document ID (lexicographic order)
    return a.id.localeCompare(b.id);
  })[0];
}

/**
 * Main deduplication logic
 */
async function deduplicateEvents() {
  console.log('📥 Fetching events from Firestore...\n');
  
  const snapshot = await db.collection(collectionName).get();
  
  if (snapshot.empty) {
    console.log('⚠️  No events found in collection.');
    return;
  }
  
  console.log(`✓ Fetched ${snapshot.size} events\n`);
  console.log('🔍 Analyzing for duplicates...\n');
  
  // Group events by dedupe key
  const groups = new Map();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const key = getDedupeKey(data);
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    
    groups.get(key).push({
      id: doc.id,
      ref: doc.ref,
      data,
    });
  }
  
  // Find duplicate groups
  const duplicateGroups = Array.from(groups.entries())
    .filter(([_, events]) => events.length > 1)
    .map(([key, events]) => ({ key, events }));
  
  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicates found! All events are unique.\n');
    return;
  }
  
  console.log(`⚠️  Found ${duplicateGroups.length} duplicate group(s):\n`);
  
  let totalDuplicates = 0;
  const deletions = [];
  
  for (const group of duplicateGroups) {
    const canonical = selectCanonical(group.events);
    const toDelete = group.events.filter(e => e.id !== canonical.id);
    
    totalDuplicates += toDelete.length;
    
    console.log(`─────────────────────────────────────────────────────────────────`);
    console.log(`📌 Duplicate Group (${group.events.length} instances):`);
    console.log(`   Title: ${canonical.data.title}`);
    console.log(`   Date: ${formatDate(canonical.data.date)}`);
    console.log(`   Location: ${canonical.data.location || '(no location)'}`);
    console.log(`\n   ✓ Keeping: ${canonical.id}`);
    console.log(`     Fields: ${Object.keys(canonical.data).length}`);
    console.log(`     Description length: ${(canonical.data.description || '').length} chars`);
    
    for (const dup of toDelete) {
      console.log(`\n   ✗ Deleting: ${dup.id}`);
      console.log(`     Fields: ${Object.keys(dup.data).length}`);
      console.log(`     Description length: ${(dup.data.description || '').length} chars`);
      deletions.push(dup.ref);
    }
    console.log('');
  }
  
  console.log(`─────────────────────────────────────────────────────────────────\n`);
  console.log(`📊 Summary:`);
  console.log(`   Total events: ${snapshot.size}`);
  console.log(`   Duplicate groups: ${duplicateGroups.length}`);
  console.log(`   Events to delete: ${totalDuplicates}`);
  console.log(`   Events after cleanup: ${snapshot.size - totalDuplicates}\n`);
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes made to Firestore.');
    console.log('   Run without --dry-run to apply these changes.\n');
    return;
  }
  
  // Confirm before deletion
  console.log('⚠️  WARNING: About to delete duplicate events from Firestore!');
  console.log('   Press Ctrl+C within 5 seconds to cancel...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('🗑️  Deleting duplicates...\n');
  
  const batch = db.batch();
  let batchCount = 0;
  
  for (const ref of deletions) {
    batch.delete(ref);
    batchCount++;
    
    // Firestore batch limit is 500 operations
    if (batchCount >= 500) {
      await batch.commit();
      console.log(`   Committed batch (${batchCount} deletions)`);
      batchCount = 0;
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
    console.log(`   Committed final batch (${batchCount} deletions)`);
  }
  
  console.log('\n✅ Deduplication complete!');
  console.log(`   Deleted ${totalDuplicates} duplicate event(s)\n`);
}

// Run the script
deduplicateEvents()
  .then(() => {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✓ Script completed successfully');
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
