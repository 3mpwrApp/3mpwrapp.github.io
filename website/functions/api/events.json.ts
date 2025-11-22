/**
 * Cloudflare Pages Function - GET /api/events.json
 * Returns events data
 * Note: Events are managed via Firestore, so this returns empty array
 * Live events are synced from app to Firestore collections
 */

const events = [];

export async function onRequest(_context) {
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
