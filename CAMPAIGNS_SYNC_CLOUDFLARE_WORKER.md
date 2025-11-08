# Campaigns Sync - Cloudflare Worker Setup

This document explains how to set up the Cloudflare Worker for syncing campaigns from the app to https://3mpwrapp.pages.dev/campaigns/

## Overview

The app syncs campaigns in real-time using a Cloudflare Worker API endpoint that stores campaign data in Cloudflare KV (Key-Value storage).

### Architecture

```
3mpwr App (React Native)
    ↓ (POST /api/campaigns)
Cloudflare Worker
    ↓ (Store in KV)
Cloudflare KV Storage
    ↓ (Read from KV)
3mpwrapp.pages.dev website
```

## Cloudflare Worker Code

Create a new worker at: https://dash.cloudflare.com/

**Worker Name:** `empowrapp-campaigns`

**Worker Code:**

```javascript
// Cloudflare Worker for Campaigns Sync
// Handles: Create, Update, Delete, List campaigns

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /api/campaigns - List all campaigns
      if (request.method === 'GET' && url.pathname === '/api/campaigns') {
        const keys = await env.CAMPAIGNS_KV.list({ prefix: 'campaign:' });
        const campaigns = await Promise.all(
          keys.keys.map(async (key) => {
            const data = await env.CAMPAIGNS_KV.get(key.name, 'json');
            return data;
          })
        );
        
        return new Response(JSON.stringify({
          campaigns: campaigns.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt),
          count: campaigns.length,
          lastUpdated: new Date().toISOString(),
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // POST /api/campaigns - Create or update campaign
      if (request.method === 'POST' && url.pathname === '/api/campaigns') {
        const campaign = await request.json();
        
        if (!campaign.id || !campaign.title) {
          return new Response(JSON.stringify({ error: 'Missing id or title' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // Store in KV with 90-day expiration (campaigns auto-expire after 3 months)
        await env.CAMPAIGNS_KV.put(
          `campaign:${campaign.id}`,
          JSON.stringify(campaign),
          { expirationTtl: 60 * 60 * 24 * 90 }
        );

        return new Response(JSON.stringify({
          success: true,
          id: campaign.id,
          message: 'Campaign synced successfully',
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // POST /api/campaigns/bulk - Bulk sync
      if (request.method === 'POST' && url.pathname === '/api/campaigns/bulk') {
        const { campaigns } = await request.json();
        
        if (!Array.isArray(campaigns)) {
          return new Response(JSON.stringify({ error: 'Invalid campaigns array' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        await Promise.all(
          campaigns.map(campaign => 
            env.CAMPAIGNS_KV.put(
              `campaign:${campaign.id}`,
              JSON.stringify(campaign),
              { expirationTtl: 60 * 60 * 24 * 90 }
            )
          )
        );

        return new Response(JSON.stringify({
          success: true,
          count: campaigns.length,
          message: 'Campaigns synced successfully',
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // DELETE /api/campaigns/:id - Delete campaign
      if (request.method === 'DELETE' && url.pathname.startsWith('/api/campaigns/')) {
        const id = url.pathname.split('/').pop();
        await env.CAMPAIGNS_KV.delete(`campaign:${id}`);

        return new Response(JSON.stringify({
          success: true,
          id,
          message: 'Campaign removed successfully',
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 404 Not Found
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }
};
```

## KV Namespace Setup

1. Go to **Workers & Pages** → **KV** → **Create namespace**
2. Name: `CAMPAIGNS_KV`
3. Bind it to your worker:
   - Go to worker settings → **Variables** → **KV Namespace Bindings**
   - Variable name: `CAMPAIGNS_KV`
   - KV namespace: Select the one you created

## Custom Domain

1. Go to worker → **Settings** → **Triggers**
2. Add custom domain: `empowrapp-campaigns.empowrapp08162025.workers.dev`
3. Or use your own domain

## Testing

### Test Campaign Creation
```bash
curl -X POST https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-123",
    "title": "Test Campaign",
    "summary": "Testing sync",
    "createdBy": "admin",
    "createdAt": 1699344000000,
    "membersCount": 0
  }'
```

### Test Campaign List
```bash
curl https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns
```

### Test Campaign Delete
```bash
curl -X DELETE https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns/test-123
```

## Website Integration

Update your website (`3mpwrapp.pages.dev/campaigns/`) to fetch from the API:

```javascript
// In your website's campaigns page
async function loadCampaigns() {
  try {
    const response = await fetch('https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns');
    const data = await response.json();
    
    // Display campaigns
    displayCampaigns(data.campaigns);
  } catch (error) {
    console.error('Failed to load campaigns:', error);
  }
}

// Auto-refresh every 5 minutes
setInterval(loadCampaigns, 5 * 60 * 1000);
loadCampaigns(); // Initial load
```

## App Configuration

The app is already configured to sync to:
`https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns`

See: `services/campaignSync.ts`

## Security Considerations

### Current Setup (Open API)
- No authentication required
- CORS allows all origins
- Suitable for public campaigns

### Future Enhancements
If you want to add authentication:

1. Add API key validation:
```javascript
const apiKey = request.headers.get('X-API-Key');
if (apiKey !== env.API_KEY) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
```

2. Add to worker secrets:
   - Go to worker → **Settings** → **Variables**
   - Add secret: `API_KEY` = `your-secure-key`

3. Update app to send API key:
```typescript
const response = await fetch(CAMPAIGN_SYNC_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.EXPO_PUBLIC_CAMPAIGN_API_KEY,
  },
  // ...
});
```

## Monitoring

1. **Worker Metrics:** https://dash.cloudflare.com → Your Worker → **Metrics**
2. **KV Storage:** Check key count and storage size
3. **Logs:** Use `wrangler tail` for real-time logs

## Cost

- **Workers:** 100,000 requests/day free
- **KV:** 100,000 reads/day free, 1,000 writes/day free
- Campaigns expire after 90 days to save storage

## Deployment Checklist

- [ ] Create Cloudflare Worker
- [ ] Create KV namespace `CAMPAIGNS_KV`
- [ ] Bind KV to worker
- [ ] Deploy worker code
- [ ] Test API endpoints
- [ ] Update website to fetch from API
- [ ] Test campaign creation from app
- [ ] Verify sync on website

## Support

For issues, check:
1. Worker logs in Cloudflare dashboard
2. App logs: `logger.log('[CampaignSync] ...')`
3. Network tab in browser dev tools

---

**Status:** Ready for deployment
**Last Updated:** November 7, 2025
