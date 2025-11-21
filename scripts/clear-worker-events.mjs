#!/usr/bin/env node
/**
 * Clear all events from Cloudflare Workers KV storage
 * WARNING: This will delete ALL events from both production and preview
 * 
 * Usage:
 *   node scripts/clear-worker-events.mjs
 */

const EVENTS_WORKER_URL = process.env.CLOUDFLARE_EVENTS_WORKER_URL || 
  'https://3mpwrapp-calendar.empowrapp08162025.workers.dev';

async function clearAllEvents() {
  console.log('🗑️  Clearing all events from Cloudflare Workers...\n');
  
  try {
    // Fetch all events from preview environment
    console.log('📥 Fetching all events from preview...');
    const previewResponse = await fetch(`${EVENTS_WORKER_URL}/api/events?env=preview`);
    const previewData = await previewResponse.json();
    const events = previewData.events || [];
    
    console.log(`   Found ${events.length} events to delete`);
    
    if (events.length === 0) {
      console.log('✅ No events to delete');
      return;
    }
    
    // Delete all events
    console.log('\n🗑️  Deleting events...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const event of events) {
      try {
        const deleteResponse = await fetch(`${EVENTS_WORKER_URL}/api/events/${event.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`   Deleted ${successCount}/${events.length} events...`);
          }
        } else {
          console.error(`   Failed to delete ${event.id}: ${deleteResponse.status}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`   Error deleting ${event.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n✅ Deletion complete:`);
    console.log(`   Succeeded: ${successCount}`);
    console.log(`   Failed: ${errorCount}`);
    
    // Verify deletion
    console.log('\n🔍 Verifying deletion...');
    const verifyResponse = await fetch(`${EVENTS_WORKER_URL}/api/events?env=preview`);
    const verifyData = await verifyResponse.json();
    console.log(`   Events remaining: ${verifyData.events?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Clear failed:', error.message);
    process.exit(1);
  }
}

clearAllEvents();
