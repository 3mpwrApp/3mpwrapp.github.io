# 3mpwr App - Campaigns Cloudflare Worker

This Cloudflare Worker syncs campaigns from the 3mpwr App to the website at https://3mpwrapp.pages.dev/campaigns/

## Quick Start

### Prerequisites
- Cloudflare account
- Node.js installed (for local development)
- Wrangler CLI installed: `npm install -g wrangler`

### Step 1: Login to Cloudflare
```bash
wrangler login
```

### Step 2: Create KV Namespace
```bash
wrangler kv:namespace create "CAMPAIGNS_KV"
```

This will output an ID like:
```
Created namespace with ID: abc123def456
```

### Step 3: Update wrangler.toml
Replace `YOUR_KV_NAMESPACE_ID` in `wrangler.toml` with the ID from Step 2.

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Test Locally
```bash
npm run dev
```

This starts the worker at http://localhost:8787

### Step 6: Deploy to Cloudflare
```bash
npm run deploy
```

Your worker will be available at: `https://empowrapp-campaigns.YOUR_SUBDOMAIN.workers.dev`

## API Endpoints

### GET /api/campaigns
List all campaigns
```bash
curl https://empowrapp-campaigns.YOUR_SUBDOMAIN.workers.dev/api/campaigns
```

### POST /api/campaigns
Create or update a campaign
```bash
curl -X POST https://empowrapp-campaigns.YOUR_SUBDOMAIN.workers.dev/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "id": "camp-001",
    "title": "Accessible Transit Now",
    "summary": "Campaign for fully accessible public transit",
    "createdBy": "user123",
    "createdAt": 1699344000000,
    "membersCount": 42
  }'
```

### POST /api/campaigns/bulk
Bulk sync multiple campaigns
```bash
curl -X POST https://empowrapp-campaigns.YOUR_SUBDOMAIN.workers.dev/api/campaigns/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "campaigns": [
      { "id": "camp-001", "title": "Campaign 1", "summary": "...", "createdAt": 123 },
      { "id": "camp-002", "title": "Campaign 2", "summary": "...", "createdAt": 456 }
    ]
  }'
```

### DELETE /api/campaigns/:id
Delete a campaign
```bash
curl -X DELETE https://empowrapp-campaigns.YOUR_SUBDOMAIN.workers.dev/api/campaigns/camp-001
```

### GET /health
Health check
```bash
curl https://empowrapp-campaigns.YOUR_SUBDOMAIN.workers.dev/health
```

## Configuration

### Environment Variables (wrangler.toml)
```toml
[vars]
ENVIRONMENT = "production"
```

### Custom Domain (Optional)
Uncomment and configure the routes section in `wrangler.toml`:
```toml
routes = [
  { pattern = "empowrapp-campaigns.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

## Update App Configuration

After deployment, update the app's sync endpoint in:
`services/campaignSync.ts`

```typescript
const CAMPAIGN_SYNC_ENDPOINT = 'https://empowrapp-campaigns.YOUR_SUBDOMAIN.workers.dev/api/campaigns';
```

## Monitoring

### View Logs
```bash
npm run tail
```

### Dashboard
View metrics at: https://dash.cloudflare.com → Workers & Pages → empowrapp-campaigns

## Security

Current setup allows public access (suitable for public campaigns).

To add authentication:
1. Add API key to worker secrets:
   ```bash
   wrangler secret put API_KEY
   ```
2. Update worker to check `request.headers.get('X-API-Key')`
3. Update app to send API key in headers

## Troubleshooting

### Worker not found
- Ensure deployment was successful: `npm run deploy`
- Check worker name in dashboard matches `wrangler.toml`

### KV namespace errors
- Verify KV namespace ID in `wrangler.toml`
- Ensure namespace is bound to worker in dashboard

### CORS errors
- Worker includes CORS headers for all origins
- Check browser console for specific CORS issues

## Cost
- **Workers:** 100,000 requests/day free
- **KV Storage:** 100,000 reads/day free, 1,000 writes/day free
- Campaigns auto-expire after 90 days

## Support
Contact: empowrapp08162025@gmail.com
