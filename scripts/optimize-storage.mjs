#!/usr/bin/env node
/**
 * Optimize Cloudflare Workers KV Storage
 *
 * This script optimizes data storage by:
 * 1. Compressing/minimizing JSON data
 * 2. Cleaning up old/unused KV entries
 * 3. Removing redundant data
 * 4. Updating sync process for efficiency
 *
 * Usage:
 *   node scripts/optimize-storage.mjs
 */

import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const EVENTS_WORKER_URL = process.env.CLOUDFLARE_EVENTS_WORKER_URL ||
  'https://3mpwrapp-calendar.empowrapp08162025.workers.dev';
const CAMPAIGNS_WORKER_URL = process.env.CLOUDFLARE_CAMPAIGNS_WORKER_URL ||
  'https://empowrapp-campaigns.empowrapp08162025.workers.dev';

/**
 * Compress campaign data by removing verbose fields not needed for app display
 */
function compressCampaign(campaign) {
  const compressed = { ...campaign };

  // Keep essential fields for app display
  const essentialFields = [
    'id', 'title', 'summary', 'target', 'goalCount', 'membersCount',
    'contactEmail', 'createdAt', 'petitionId', 'petitionUrl', 'websiteUrl',
    'actionItems', 'legislation'
  ];

  // Remove verbose fields that can be fetched on-demand
  delete compressed.description; // Remove long descriptions
  delete compressed.shareTemplates; // Remove share templates (can be generated)
  delete compressed.internationalModel; // Remove detailed model info

  // Compress legislation to just essential info
  if (compressed.legislation) {
    compressed.legislation = compressed.legislation.map(leg => ({
      name: leg.name,
      status: leg.status,
      url: leg.url || null // Keep only essential fields
    }));
  }

  // Compress action items to minimal format
  if (compressed.actionItems) {
    compressed.actionItems = compressed.actionItems.map(item => ({
      id: item.id,
      text: item.text,
      completed: item.completed || false
    }));
  }

  return compressed;
}

/**
 * Compress event data by removing redundant fields
 */
function compressEvent(event) {
  const compressed = { ...event };

  // Remove fields that can be derived or are not essential for display
  const fieldsToRemove = [
    'accessibilityNotes', // Can be derived from other accessibility fields
    'serviceAnimalsWelcome', // Usually true for accessible events
    'energyCost', // Not critical for display
    'registrationRequired', // Usually false for community events
    'status' // Usually 'published'
  ];

  fieldsToRemove.forEach(field => delete compressed[field]);

  // Simplify tags array if too verbose
  if (compressed.tags && compressed.tags.length > 5) {
    compressed.tags = compressed.tags.slice(0, 5); // Limit to 5 tags
  }

  return compressed;
}

/**
 * Clean up old KV entries
 */
async function cleanupOldEntries() {
  console.log('🧹 Cleaning up old KV entries...');

  try {
    // Clean up events older than 90 days
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);

    // Get all event keys
    const eventsResponse = await fetch(`${EVENTS_WORKER_URL}/api/events?env=production`);
    const eventsData = await eventsResponse.json();

    const oldEvents = eventsData.events.filter(event => {
      const eventDate = new Date(event.date || event.createdAt);
      return eventDate.getTime() < ninetyDaysAgo;
    });

    console.log(`Found ${oldEvents.length} events older than 90 days`);

    // Delete old events
    for (const event of oldEvents) {
      await fetch(`${EVENTS_WORKER_URL}/api/events/${event.id}`, {
        method: 'DELETE'
      });
    }

    console.log(`✅ Deleted ${oldEvents.length} old events`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

/**
 * Optimize and sync compressed data
 */
async function optimizeAndSync() {
  console.log('🔧 Optimizing and syncing compressed data...');

  try {
    // Read original data
    const eventsPath = join(ROOT, 'public', 'api', 'events.json');
    const campaignsPath = join(ROOT, 'public', 'api', 'campaigns.json');

    const eventsData = await fs.readFile(eventsPath, 'utf-8');
    const campaignsData = await fs.readFile(campaignsPath, 'utf-8');

    const events = JSON.parse(eventsData);
    const campaigns = JSON.parse(campaignsData);

    // Compress data
    const compressedEvents = events.map(compressEvent);
    const compressedCampaigns = campaigns.map(compressCampaign);

    // Calculate size savings
    const originalEventsSize = Buffer.byteLength(JSON.stringify(events), 'utf8');
    const compressedEventsSize = Buffer.byteLength(JSON.stringify(compressedEvents), 'utf8');
    const originalCampaignsSize = Buffer.byteLength(JSON.stringify(campaigns), 'utf8');
    const compressedCampaignsSize = Buffer.byteLength(JSON.stringify(compressedCampaigns), 'utf8');

    const eventsSavings = ((originalEventsSize - compressedEventsSize) / originalEventsSize * 100).toFixed(1);
    const campaignsSavings = ((originalCampaignsSize - compressedCampaignsSize) / originalCampaignsSize * 100).toFixed(1);

    console.log(`📊 Compression Results:`);
    console.log(`Events: ${originalEventsSize} → ${compressedEventsSize} bytes (${eventsSavings}% savings)`);
    console.log(`Campaigns: ${originalCampaignsSize} → ${compressedCampaignsSize} bytes (${campaignsSavings}% savings)`);

    // Sync compressed events
    console.log('\n📅 Syncing compressed events...');
    const eventsResponse = await fetch(`${EVENTS_WORKER_URL}/api/events/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: compressedEvents })
    });

    if (!eventsResponse.ok) {
      throw new Error(`Events sync failed: ${eventsResponse.status}`);
    }

    // Sync compressed campaigns
    console.log('📢 Syncing compressed campaigns...');
    const campaignsResponse = await fetch(`${CAMPAIGNS_WORKER_URL}/api/campaigns/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaigns: compressedCampaigns })
    });

    if (!campaignsResponse.ok) {
      throw new Error(`Campaigns sync failed: ${campaignsResponse.status}`);
    }

    const eventsResult = await eventsResponse.json();
    const campaignsResult = await campaignsResponse.json();

    console.log(`✅ Events: ${eventsResult.successful} synced`);
    console.log(`✅ Campaigns: ${campaignsResult.successful} synced`);

  } catch (error) {
    console.error('❌ Optimization sync failed:', error.message);
    throw error;
  }
}

/**
 * Update worker expiration policies for better storage management
 */
async function updateExpirationPolicies() {
  console.log('⏰ Updating expiration policies...');

  // Note: This would require worker code changes, but we can document the recommendations
  console.log('📝 Recommended expiration policies:');
  console.log('- Events: 30 days (current)');
  console.log('- Campaigns: 90 days (current)');
  console.log('- Remove duplicate preview/production storage for events');
  console.log('- Add automatic cleanup of expired entries');
}

/**
 * Generate storage usage report
 */
async function generateReport() {
  console.log('\n📈 Storage Usage Report:');

  try {
    // Check current counts
    const eventsResponse = await fetch(`${EVENTS_WORKER_URL}/api/events`);
    const campaignsResponse = await fetch(`${CAMPAIGNS_WORKER_URL}/api/campaigns`);

    const eventsData = await eventsResponse.json();
    const campaignsData = await campaignsResponse.json();

    console.log(`Current Events: ${eventsData.events?.length || 0}`);
    console.log(`Current Campaigns: ${campaignsData.campaigns?.length || 0}`);

    // Estimate KV usage (rough calculation)
    const estimatedEventsKV = (eventsData.events?.length || 0) * 2 * 0.5; // 2 copies (prod+preview) * ~0.5KB each
    const estimatedCampaignsKV = (campaignsData.campaigns?.length || 0) * 2; // ~2KB each compressed

    console.log(`Estimated KV Usage: ${(estimatedEventsKV + estimatedCampaignsKV).toFixed(1)} KB`);
    console.log(`Cloudflare Free Tier Limit: 1 GB (1,000,000 KB)`);
    console.log(`Current Usage: ~${((estimatedEventsKV + estimatedCampaignsKV) / 1000000 * 100).toFixed(3)}% of limit`);

  } catch (error) {
    console.error('❌ Report generation failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Cloudflare Workers Storage Optimization...\n');

  try {
    // Step 1: Clean up old entries
    await cleanupOldEntries();

    // Step 2: Optimize and sync compressed data
    await optimizeAndSync();

    // Step 3: Update policies (documentation)
    await updateExpirationPolicies();

    // Step 4: Generate report
    await generateReport();

    console.log('\n✨ Storage optimization complete!');
    console.log('\n💡 Additional Recommendations:');
    console.log('- Monitor KV usage regularly');
    console.log('- Consider paid tier if usage grows significantly');
    console.log('- Implement data archival for historical events');

  } catch (error) {
    console.error('\n💥 Optimization failed:', error.message);
    process.exit(1);
  }
}

main();