/**
 * Cloudflare Worker for 3mpwr App Campaigns Sync
 * Syncs campaigns from the app to https://3mpwrapp.pages.dev/campaigns/
 * 
 * Endpoints:
 * - GET /api/campaigns - List all campaigns
 * - POST /api/campaigns - Create or update a campaign
 * - POST /api/campaigns/bulk - Bulk sync campaigns
 * - DELETE /api/campaigns/:id - Delete a campaign
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers for cross-origin requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {
      // GET /api/campaigns - List all campaigns
      if (request.method === 'GET' && url.pathname === '/api/campaigns') {
        return await handleListCampaigns(env, corsHeaders);
      }

      // POST /api/campaigns - Create or update campaign
      if (request.method === 'POST' && url.pathname === '/api/campaigns') {
        return await handleCreateCampaign(request, env, corsHeaders);
      }

      // POST /api/campaigns/bulk - Bulk sync campaigns
      if (request.method === 'POST' && url.pathname === '/api/campaigns/bulk') {
        return await handleBulkSync(request, env, corsHeaders);
      }

      // DELETE /api/campaigns/:id - Delete campaign
      if (request.method === 'DELETE' && url.pathname.startsWith('/api/campaigns/')) {
        const id = url.pathname.split('/').pop();
        return await handleDeleteCampaign(id, env, corsHeaders);
      }

      // GET /health - Health check
      if (request.method === 'GET' && url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // 404 Not Found
      return new Response(JSON.stringify({
        error: 'Not found',
        path: url.pathname,
        method: request.method
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

/**
 * List all campaigns from KV storage
 */
async function handleListCampaigns(env, corsHeaders) {
  try {
    // List all keys with 'campaign:' prefix
    const { keys } = await env.CAMPAIGNS_KV.list({ prefix: 'campaign:' });
    
    // Fetch all campaigns in parallel
    const campaigns = await Promise.all(
      keys.map(async (key) => {
        const data = await env.CAMPAIGNS_KV.get(key.name, 'json');
        return data;
      })
    );

    // Filter out null values and sort by creation date (newest first)
    const validCampaigns = campaigns
      .filter(Boolean)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return new Response(JSON.stringify({
      success: true,
      campaigns: validCampaigns,
      count: validCampaigns.length,
      lastUpdated: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('List campaigns error:', error);
    throw error;
  }
}

/**
 * Create or update a campaign
 */
async function handleCreateCampaign(request, env, corsHeaders) {
  try {
    const campaign = await request.json();

    // Validate required fields
    if (!campaign.id || !campaign.title) {
      return new Response(JSON.stringify({
        error: 'Validation error',
        message: 'Missing required fields: id and title are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Ensure campaign has required metadata
    const campaignData = {
      ...campaign,
      updatedAt: Date.now(),
      syncedAt: Date.now()
    };

    // Store in KV with 90-day expiration (campaigns auto-expire after 3 months)
    const expirationTtl = 60 * 60 * 24 * 90; // 90 days in seconds
    await env.CAMPAIGNS_KV.put(
      `campaign:${campaign.id}`,
      JSON.stringify(campaignData),
      { expirationTtl }
    );

    return new Response(JSON.stringify({
      success: true,
      id: campaign.id,
      message: 'Campaign synced successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    throw error;
  }
}

/**
 * Bulk sync multiple campaigns
 */
async function handleBulkSync(request, env, corsHeaders) {
  try {
    const { campaigns } = await request.json();

    // Validate campaigns array
    if (!Array.isArray(campaigns)) {
      return new Response(JSON.stringify({
        error: 'Validation error',
        message: 'campaigns must be an array'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Sync all campaigns in parallel
    const expirationTtl = 60 * 60 * 24 * 90; // 90 days
    const results = await Promise.allSettled(
      campaigns.map(campaign => {
        if (!campaign.id || !campaign.title) {
          return Promise.reject(new Error(`Invalid campaign: missing id or title`));
        }
        
        const campaignData = {
          ...campaign,
          updatedAt: Date.now(),
          syncedAt: Date.now()
        };
        
        return env.CAMPAIGNS_KV.put(
          `campaign:${campaign.id}`,
          JSON.stringify(campaignData),
          { expirationTtl }
        );
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return new Response(JSON.stringify({
      success: true,
      totalCampaigns: campaigns.length,
      successful,
      failed,
      message: `Bulk sync completed: ${successful} succeeded, ${failed} failed`,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Bulk sync error:', error);
    throw error;
  }
}

/**
 * Delete a campaign
 */
async function handleDeleteCampaign(id, env, corsHeaders) {
  try {
    if (!id) {
      return new Response(JSON.stringify({
        error: 'Validation error',
        message: 'Campaign ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Delete from KV
    await env.CAMPAIGNS_KV.delete(`campaign:${id}`);

    return new Response(JSON.stringify({
      success: true,
      id,
      message: 'Campaign deleted successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    throw error;
  }
}
