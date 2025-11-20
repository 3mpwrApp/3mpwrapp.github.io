/**
 * Cloudflare Pages Function - GET /api/campaigns.json
 * Returns campaigns data from local file
 */

// Import campaigns data - Cloudflare Pages Functions support TypeScript
import campaignsData from '../../../data/campaigns';

export async function onRequest(context: any) {
  const { campaigns } = campaignsData;
  
  return new Response(
    JSON.stringify({
      campaigns,
      count: campaigns.length,
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
