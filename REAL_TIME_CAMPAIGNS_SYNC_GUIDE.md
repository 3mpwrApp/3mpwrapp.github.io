# Real-Time Campaign Auto-Sync Implementation Guide

**Date:** January 2025  
**Status:** 🚀 Ready for Implementation

## Overview

This guide provides complete details for implementing real-time, automated campaign synchronization from the 3mpwr mobile app to your website campaigns page at `https://3mpwrapp.pages.dev/campaigns/`.

## Architecture

```
┌─────────────────────────┐
│   3mpwr Mobile App      │
│   (React Native/Expo)   │
└───────────┬─────────────┘
            │
            │ 1. User creates/joins campaign
            │
            ↓
┌─────────────────────────┐
│   Firestore Database    │
│   campaigns_production  │
└───────────┬─────────────┘
            │
            │ 2. Firestore trigger or polling
            │
            ↓
┌─────────────────────────┐
│  Cloudflare Worker API  │
│  empowrapp-campaigns    │
└───────────┬─────────────┘
            │
            │ 3. Store in KV or serve directly
            │
            ↓
┌─────────────────────────┐
│  Website Campaigns Page │
│  3mpwrapp.pages.dev     │
└─────────────────────────┘
```

## Current Implementation Status

### ✅ Already Implemented

1. **App-side sync service:** `services/campaignSync.ts`
2. **Firestore integration:** `services/firestore.ts`
3. **Auto-sync on create:** `app/campaigns/index.tsx` (lines 247-259)
4. **Cloudflare Worker template:** `CAMPAIGNS_SYNC_CLOUDFLARE_WORKER.md`
5. **Events sync pattern:** `AUTOMATED_EVENTS_SYNC_COMPLETE.md` (reference implementation)

### 🔄 Needs Setup

1. Deploy Cloudflare Worker
2. Configure KV namespace
3. Update website to fetch from API
4. Test end-to-end sync

---

## Implementation Methods

### Method 1: Direct Firestore Query (Recommended for Static Sites)

**Best for:** Static site generators, Pages deployments, low traffic

#### Website Code (campaigns/index.html or equivalent)

```javascript
// Real-time campaigns sync - fetches directly from Firestore REST API
const FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects/empowrapp/databases/(default)/documents/campaigns_production';

async function loadCampaigns() {
  try {
    const response = await fetch(FIRESTORE_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const campaigns = [];

    if (data.documents) {
      for (const doc of data.documents) {
        const fields = doc.fields;
        const campaign = {
          id: doc.name.split('/').pop(),
          title: fields.title?.stringValue || '',
          summary: fields.summary?.stringValue || '',
          target: fields.target?.stringValue || '',
          goalCount: parseInt(fields.goalCount?.integerValue || 0),
          membersCount: parseInt(fields.membersCount?.integerValue || 0),
          contactEmail: fields.contactEmail?.stringValue || '',
          createdAt: fields.createdAt?.timestampValue ? 
            new Date(fields.createdAt.timestampValue).getTime() : 
            Date.now(),
        };
        campaigns.push(campaign);
      }
    }

    // Sort by newest first
    campaigns.sort((a, b) => b.createdAt - a.createdAt);
    
    displayCampaigns(campaigns);
    updateLastSync();
    
  } catch (error) {
    console.error('[Campaigns] Load failed:', error);
    showErrorMessage('Failed to load campaigns. Please refresh.');
  }
}

function displayCampaigns(campaigns) {
  const container = document.getElementById('campaigns-list');
  
  if (campaigns.length === 0) {
    container.innerHTML = '<p class="no-campaigns">No campaigns yet. Create one in the app!</p>';
    return;
  }
  
  container.innerHTML = campaigns.map(campaign => `
    <div class="campaign-card" data-id="${campaign.id}">
      <h3>${escapeHtml(campaign.title)}</h3>
      ${campaign.target ? `<p class="target">→ ${escapeHtml(campaign.target)}</p>` : ''}
      <p class="summary">${escapeHtml(campaign.summary)}</p>
      
      ${campaign.goalCount > 0 ? `
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min((campaign.membersCount / campaign.goalCount) * 100, 100)}%"></div>
        </div>
        <p class="stats">
          ${campaign.membersCount.toLocaleString()} / ${campaign.goalCount.toLocaleString()} supporters
          (${Math.round((campaign.membersCount / campaign.goalCount) * 100)}%)
        </p>
      ` : `
        <p class="stats">👥 ${campaign.membersCount.toLocaleString()} supporters</p>
      `}
      
      <button class="join-btn" onclick="showJoinInfo('${campaign.id}')">
        🚀 Join Campaign
      </button>
    </div>
  `).join('');
}

function updateLastSync() {
  const timestamp = document.getElementById('last-sync');
  if (timestamp) {
    timestamp.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Auto-refresh every 30 seconds
setInterval(loadCampaigns, 30 * 1000);

// Initial load
document.addEventListener('DOMContentLoaded', loadCampaigns);
```

#### Firestore Security Rules (REQUIRED)

Update `firebase/firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow public READ access to campaigns (for website)
    match /campaigns_production/{campaignId} {
      allow read: if true; // Public campaigns
      allow write: if request.auth != null; // Only authenticated users can create/update
    }
    
    // Campaign memberships
    match /campaign_memberships/{membershipId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

### Method 2: Cloudflare Worker with KV Cache (Recommended for High Traffic)

**Best for:** High traffic websites, better performance, analytics

#### Step 1: Create Cloudflare Worker

1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages**
3. Click **Create Worker**
4. Name: `empowrapp-campaigns`
5. Paste this code:

```javascript
/**
 * Cloudflare Worker for Campaign Sync
 * Caches Firestore data in KV for fast reads
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /api/campaigns - Serve campaigns from cache
      if (request.method === 'GET' && url.pathname === '/api/campaigns') {
        // Try cache first (KV)
        let cached = await env.CAMPAIGNS_KV.get('campaigns:latest', 'json');
        
        if (cached) {
          console.log('[Cache] Serving from KV');
          return new Response(JSON.stringify(cached), {
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=30',
              ...corsHeaders 
            },
          });
        }

        // Fetch from Firestore if cache miss
        console.log('[Cache] Miss - fetching from Firestore');
        const campaigns = await fetchFromFirestore(env.FIRESTORE_URL);
        
        // Cache for 5 minutes
        await env.CAMPAIGNS_KV.put(
          'campaigns:latest',
          JSON.stringify({
            campaigns,
            count: campaigns.length,
            lastUpdated: new Date().toISOString(),
          }),
          { expirationTtl: 300 } // 5 minutes
        );

        return new Response(JSON.stringify({
          campaigns,
          count: campaigns.length,
          lastUpdated: new Date().toISOString(),
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=30',
            ...corsHeaders 
          },
        });
      }

      // POST /api/campaigns/invalidate - Trigger cache refresh
      if (request.method === 'POST' && url.pathname === '/api/campaigns/invalidate') {
        await env.CAMPAIGNS_KV.delete('campaigns:latest');
        console.log('[Cache] Invalidated');
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Cache invalidated',
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });

    } catch (error) {
      console.error('[Worker] Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }
};

async function fetchFromFirestore(firestoreUrl) {
  const response = await fetch(firestoreUrl);
  
  if (!response.ok) {
    throw new Error(`Firestore returned ${response.status}`);
  }

  const data = await response.json();
  const campaigns = [];

  if (data.documents) {
    for (const doc of data.documents) {
      const fields = doc.fields;
      campaigns.push({
        id: doc.name.split('/').pop(),
        title: fields.title?.stringValue || '',
        summary: fields.summary?.stringValue || '',
        target: fields.target?.stringValue || '',
        goalCount: parseInt(fields.goalCount?.integerValue || 0),
        membersCount: parseInt(fields.membersCount?.integerValue || 0),
        contactEmail: fields.contactEmail?.stringValue || '',
        createdAt: fields.createdAt?.timestampValue ? 
          new Date(fields.createdAt.timestampValue).getTime() : 
          Date.now(),
      });
    }
  }

  return campaigns.sort((a, b) => b.createdAt - a.createdAt);
}
```

#### Step 2: Create KV Namespace

1. Go to **Workers & Pages** → **KV**
2. Click **Create namespace**
3. Name: `CAMPAIGNS_KV`
4. Click **Add**

#### Step 3: Bind KV to Worker

1. Go to your worker → **Settings** → **Variables**
2. Under **KV Namespace Bindings**, click **Add binding**
3. Variable name: `CAMPAIGNS_KV`
4. KV namespace: Select `CAMPAIGNS_KV`
5. Click **Save**

#### Step 4: Add Environment Variables

1. In worker **Settings** → **Variables**
2. Add these variables:

```
FIRESTORE_URL = https://firestore.googleapis.com/v1/projects/empowrapp/databases/(default)/documents/campaigns_production
```

#### Step 5: Deploy Worker

Click **Deploy** in the worker editor.

#### Step 6: Get Worker URL

Your worker will be available at:
```
https://empowrapp-campaigns.empowrapp08162025.workers.dev
```

Or set up a custom domain.

---

### Method 3: Webhook-Based Real-Time Sync (Most Advanced)

**Best for:** Instant updates, no polling needed

#### App Integration (Already Implemented)

In `app/campaigns/index.tsx`, the sync happens automatically on campaign creation (line 256):

```typescript
// Sync to website (fire and forget, don't block UI)
syncCampaignToWebsite(campaignData).catch(err => {
  logger.error('[Campaigns] Sync failed:', err);
});
```

#### Add Cache Invalidation

Update `services/campaignSync.ts`:

```typescript
/**
 * Invalidate website cache after campaign update
 */
export async function invalidateCampaignCache(): Promise<boolean> {
  try {
    const response = await fetch(`${CAMPAIGN_SYNC_ENDPOINT}/invalidate`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    logger.error('[CampaignSync] Cache invalidation failed:', error);
    return false;
  }
}
```

Then in `app/campaigns/index.tsx`, after syncing:

```typescript
// After line 259
syncCampaignToWebsite(campaignData)
  .then(() => invalidateCampaignCache())
  .catch(err => logger.error('[Campaigns] Sync failed:', err));
```

---

## Website HTML/CSS Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3mpwr Campaigns - Join the Movement</title>
  <style>
    :root {
      --primary: #3b82f6;
      --success: #22c55e;
      --warning: #f59e0b;
      --text: #1f2937;
      --bg: #f9fafb;
      --surface: #ffffff;
      --border: #e5e7eb;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }

    .header {
      background: var(--primary);
      color: white;
      padding: 2rem;
      text-align: center;
    }

    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .header p {
      opacity: 0.9;
    }

    .sync-status {
      background: var(--surface);
      padding: 1rem;
      text-align: center;
      border-bottom: 1px solid var(--border);
      font-size: 0.875rem;
      color: #6b7280;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .campaigns-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .campaign-card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid var(--border);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .campaign-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .campaign-card h3 {
      color: var(--text);
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
    }

    .target {
      color: var(--primary);
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .summary {
      color: #6b7280;
      margin-bottom: 1rem;
    }

    .progress-bar {
      background: #e5e7eb;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--success));
      transition: width 0.3s ease;
    }

    .stats {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 1rem;
    }

    .join-btn {
      width: 100%;
      padding: 0.75rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .join-btn:hover {
      background: #2563eb;
    }

    .no-campaigns {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
      font-size: 1.125rem;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>📣 3mpwr Campaigns</h1>
    <p>Join campaigns for disability justice and workers' rights</p>
  </header>

  <div class="sync-status">
    <span id="last-sync">Loading campaigns...</span>
  </div>

  <main class="container">
    <div id="campaigns-list" class="campaigns-grid">
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading campaigns...</p>
      </div>
    </div>
  </main>

  <script>
    // Insert the loadCampaigns() JavaScript from Method 1 or Method 2 above
    // depending on your chosen implementation
  </script>
</body>
</html>
```

---

## Testing Checklist

### Pre-Deployment Testing

- [ ] **Firestore rules updated** - Public read access enabled
- [ ] **Rules deployed** - `firebase deploy --only firestore:rules`
- [ ] **Test Firestore API** - `curl` the REST endpoint
- [ ] **Worker deployed** (if using Method 2)
- [ ] **KV namespace created and bound** (if using Method 2)
- [ ] **Website code updated** with fetch logic

### Post-Deployment Testing

1. **Create Campaign in App:**
   - Open 3mpwr app
   - Go to Campaigns tab
   - Click "Create New Campaign"
   - Fill in: Title, Summary, Target, Goal Count
   - Click "Create Campaign"

2. **Verify Firestore:**
   - Open Firebase Console
   - Go to Firestore Database
   - Check `campaigns_production` collection
   - Verify new campaign document exists

3. **Verify Website:**
   - Open `https://3mpwrapp.pages.dev/campaigns/`
   - Wait 30 seconds (or refresh)
   - Verify campaign appears in list
   - Check progress bar (if goal count set)
   - Click "Join Campaign" button

4. **Test Auto-Refresh:**
   - Keep website open
   - Create another campaign in app
   - Wait for auto-refresh (30-60 seconds)
   - Verify new campaign appears without manual refresh

5. **Test Join Campaign:**
   - Join a campaign in the app
   - Verify `membersCount` increments
   - Refresh website
   - Verify supporter count updated

---

## Performance Optimization

### Caching Strategy

```javascript
// Add to website JavaScript

const CACHE_KEY = '3mpwr_campaigns_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function loadCampaigns() {
  // Try localStorage cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      console.log('[Cache] Using local storage');
      displayCampaigns(data);
      updateLastSync('Cached');
      // Still fetch in background to update
      fetchAndUpdateCache();
      return;
    }
  }

  // Fetch fresh data
  await fetchAndUpdateCache();
}

async function fetchAndUpdateCache() {
  try {
    const response = await fetch(FIRESTORE_URL);
    const data = await response.json();
    const campaigns = parseFirestoreCampaigns(data);
    
    // Update localStorage cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: campaigns,
      timestamp: Date.now(),
    }));
    
    displayCampaigns(campaigns);
    updateLastSync();
  } catch (error) {
    console.error('[Campaigns] Fetch failed:', error);
  }
}
```

### CDN Caching (Cloudflare Pages)

Add `_headers` file to your Pages deployment:

```
/campaigns/*
  Cache-Control: public, max-age=300, s-maxage=600
```

---

## Monitoring & Analytics

### Worker Analytics (Method 2)

```javascript
// Add to Cloudflare Worker

export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    
    // ... existing code ...
    
    // Log analytics
    ctx.waitUntil(
      env.CAMPAIGNS_KV.put(
        `analytics:${Date.now()}`,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          path: url.pathname,
          duration: Date.now() - startTime,
          userAgent: request.headers.get('User-Agent'),
        }),
        { expirationTtl: 86400 } // 24 hours
      )
    );
    
    return response;
  }
};
```

### Website Analytics

```javascript
// Add Google Analytics or custom tracking

function trackCampaignView(campaignId) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'campaign_view', {
      campaign_id: campaignId,
    });
  }
}

function trackCampaignJoin(campaignId) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'campaign_join_click', {
      campaign_id: campaignId,
    });
  }
}
```

---

## Troubleshooting

### Issue: Campaigns not appearing on website

**Check:**
1. Firestore rules allow public read
2. Campaign exists in `campaigns_production` collection
3. Browser console for errors
4. Network tab shows successful API call

**Fix:**
```bash
# Verify Firestore API directly
curl "https://firestore.googleapis.com/v1/projects/empowrapp/databases/(default)/documents/campaigns_production"
```

### Issue: Old data showing on website

**Check:**
1. Browser cache (Ctrl+Shift+R to hard refresh)
2. KV cache TTL (if using Method 2)
3. localStorage cache

**Fix:**
```javascript
// Clear cache manually
localStorage.removeItem('3mpwr_campaigns_cache');
location.reload();
```

### Issue: Sync failing from app

**Check:**
1. Network connectivity
2. Cloudflare Worker logs
3. App console logs: `logger.log('[CampaignSync] ...')`

**Fix:**
```bash
# Test worker endpoint
curl -X POST https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{"id":"test","title":"Test","summary":"Test","createdAt":1699344000000}'
```

---

## Cost Estimate

### Method 1 (Direct Firestore)
- **Firestore Reads:** 50K/day free, then $0.06 per 100K reads
- **Bandwidth:** Generous free tier
- **Estimated Cost:** $0-5/month for most sites

### Method 2 (Cloudflare Worker + KV)
- **Worker Requests:** 100K/day free, then $0.50 per million
- **KV Reads:** 100K/day free, then $0.50 per million
- **KV Writes:** 1K/day free, then $5.00 per million
- **KV Storage:** 1 GB free
- **Estimated Cost:** $0/month for most sites

---

## Security Considerations

### Current Setup ✅
- Public read access to campaigns (intended)
- Authentication required for writes
- No sensitive data exposed

### Future Enhancements 🔒

If you need to restrict access:

1. **Add API Key:**
```javascript
// In Cloudflare Worker
if (request.headers.get('X-API-Key') !== env.API_KEY) {
  return new Response('Unauthorized', { status: 401 });
}
```

2. **Rate Limiting:**
```javascript
// In Cloudflare Worker
const ip = request.headers.get('CF-Connecting-IP');
const rateKey = `rate:${ip}`;
const count = await env.CAMPAIGNS_KV.get(rateKey);

if (count && parseInt(count) > 100) {
  return new Response('Rate limit exceeded', { status: 429 });
}

await env.CAMPAIGNS_KV.put(rateKey, String(parseInt(count || 0) + 1), { expirationTtl: 60 });
```

---

## Quick Start Summary

**Fastest path to production:**

1. ✅ **Update Firestore rules** (allow public read)
2. ✅ **Deploy rules:** `firebase deploy --only firestore:rules`
3. ✅ **Add website code** (Method 1 - Direct Firestore)
4. ✅ **Test:** Create campaign in app, verify on website
5. ✅ **Monitor:** Check console logs

**Estimated setup time:** 15-30 minutes

---

## Support & Resources

- **Firebase Console:** https://console.firebase.google.com/project/empowrapp
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **App Logs:** Check `logger.log('[CampaignSync] ...')` in React Native debugger
- **Worker Logs:** `wrangler tail empowrapp-campaigns`

---

**Status:** 📚 Complete implementation guide  
**Next Steps:** Choose Method 1 (easiest) or Method 2 (best performance) and follow the steps

