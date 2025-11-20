/**
 * Cloudflare Pages Function - GET /api/events.json
 * Returns events data from local file
 */

// Import events data - Cloudflare Pages Functions support TypeScript
import eventsData from '../../../data/events';

export async function onRequest(context: any) {
  const { events } = eventsData;
  
  return new Response(
    JSON.stringify({
      events,
      count: events.length,
      lastUpdated: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    }
  );
}
