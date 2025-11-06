# 🚀 Cloudflare Worker Setup Guide - 3mpwrApp Events Calendar

> Production-ready Cloudflare Worker with real-time Firestore integration, KV caching, and full event filtering/pagination

---

## 📋 Overview

This Worker provides 3 main endpoints:

| Endpoint | Format | Purpose | Cache |
|----------|--------|---------|-------|
| **`/events.ics`** | iCalendar (.ics) | Calendar subscription | 1 hour |
| **`/api/events`** | JSON | Paginated event list | 5 mins |
| **`/api/events/:id`** | JSON | Single event details | 5 mins |

### Features
- ✅ Real-time Firestore integration
- ✅ KV Namespace caching with TTL
- ✅ Date range filtering
- ✅ Category filtering
- ✅ Pagination & sorting
- ✅ CORS-enabled
- ✅ Health check endpoint
- ✅ Error handling & logging

---

## 🔧 Prerequisites

1. **Cloudflare Account** with Workers enabled
2. **Wrangler CLI** installed: `npm install -g wrangler`
3. **Firebase Service Account** key (JSON file)
4. **Node.js 16+** for local development

---

## 📝 Setup Instructions

### Step 1: Authenticate with Cloudflare

```powershell
# Login to Cloudflare
wrangler login

# This opens your browser to authorize Cloudflare access
```

### Step 2: Create KV Namespace

Create 2 KV namespaces (one for production, one for preview):

```powershell
cd server

# Production namespace
wrangler kv:namespace create "calendar_cache_prod"

# Development/preview namespace  
wrangler kv:namespace create "calendar_cache_prod" --preview
```

**Copy the output IDs** - you'll see something like:
```
✓ Created namespace with id: abc123...
```

### Step 3: Update wrangler.toml

Replace the KV namespace IDs in `server/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CALENDAR_CACHE"
id = "YOUR_PROD_ID_HERE"           # Paste production ID
preview_id = "YOUR_PREVIEW_ID_HERE" # Paste preview ID
```

### Step 4: Store Firebase Credentials

Get your Firebase service account key from Firebase Console:

1. Go to **Firebase Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Save the JSON file safely

Store it as a Wrangler secret:

```powershell
# Option A: Interactive prompt
wrangler secret put FIREBASE_SERVICE_ACCOUNT

# Paste your entire JSON content, then press Ctrl+D (Windows) or Cmd+D (Mac)

# Option B: Pipe from file
wrangler secret put FIREBASE_SERVICE_ACCOUNT < path/to/firebase-key.json
```

### Step 5: Set Firebase Database URL

Add to your `wrangler.toml`:

```toml
[vars]
FIREBASE_DATABASE_URL = "https://your-project.firebaseio.com"
```

Or set as secret:

```powershell
wrangler secret put FIREBASE_DATABASE_URL
# Enter: https://your-project.firebaseio.com
```

### Step 6: Deploy Worker

```powershell
cd server
wrangler publish
```

**You'll see:**
```
✓ Uploaded 1 script to your.name.workers.dev
```

Your Worker is now live! 🎉

---

## 🧪 Testing the Worker

### Health Check

```powershell
# Check if Worker is running
curl https://empowrapp-calendar.empowrapp08162025.workers.dev/health

# Response:
# {
#   "ok": true,
#   "service": "3mpwrApp Calendar Worker",
#   "timestamp": "2025-11-06T21:00:00Z",
#   "firebaseConnected": true,
#   "cacheAvailable": true
# }
```

### Get Events List (JSON)

```powershell
# All events, default limit (50)
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events"

# With category filter
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community"

# Paginated
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=10&page=2"

# Sorted by date, descending
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?sort=date&dir=desc"

# Combined filters
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community&limit=20&sort=date&dir=asc"
```

### Get Calendar Feed (ICS)

```powershell
# Current month
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics" -o calendar.ics

# Specific month
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics?year=2025&month=12"

# Then import calendar.ics into:
# - Google Calendar: Settings → Import & Export → Upload from file
# - Outlook: File → Open & Export → Import Calendar
# - Apple Calendar: File → Import → Select file
```

### Get Single Event

```powershell
# Replace EVENT_ID with actual event ID
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events/EVENT_ID"
```

---

## 📊 Query Parameters Reference

### `/events.ics` Parameters
| Parameter | Type | Default | Example |
|-----------|------|---------|---------|
| `year` | number | Current year | `2025` |
| `month` | number | All months | `12` |
| `observances` | boolean | `true` | `false` |
| `holidays` | boolean | `true` | `false` |

Example: `/events.ics?year=2025&month=12`

### `/api/events` Parameters
| Parameter | Type | Default | Example |
|-----------|------|---------|---------|
| `category` | string | All | `community` |
| `limit` | number | `50` | `20` |
| `page` | number | `1` | `2` |
| `sort` | string | `date` | `date`, `title`, `attendeeCount` |
| `dir` | string | `asc` | `asc`, `desc` |

Examples:
- `/api/events?category=community&limit=10`
- `/api/events?sort=date&dir=desc`
- `/api/events?limit=20&page=2`

### `/api/events/:id` Parameters
No query parameters - just replace `:id` with event ID.

Example: `/api/events/evt-1234567890`

---

## 🔐 Firestore Security Rules

Add these rules to your `firebase/firestore.rules` to allow Worker read access:

```javascript
// Allow Worker to read all published events
match /events/{eventId} {
  allow read: if request.auth != null || request.headers['user-agent'].contains('Cloudflare');
}

// More specific - only published events visible to anonymous
match /events/{eventId} {
  allow read: if resource.data.status == 'published';
  allow write: if request.auth.uid != null;
}
```

Deploy with: `npm run rules:deploy`

---

## 📈 Performance & Caching

### Cache Strategy

**`/events.ics` (ICS Feed)**
- Cache Duration: **1 hour** (3600s)
- KV Namespace: Yes
- Use Case: Calendar app subscriptions

**`/api/events` (List)**
- Cache Duration: **5 minutes** (300s)
- KV Namespace: Yes
- Use Case: Website homepage, dashboards

**`/api/events/:id` (Single)**
- Cache Duration: **5 minutes** (300s)
- Cache Key: Event ID
- Use Case: Event detail pages

### Cache Keys

The Worker generates cache keys automatically:
- `events:ics:2025:12` → December 2025 ICS feed
- `events:ics:2025:all` → All of 2025 ICS feed
- `events:json:community:50` → Community events, limit 50

### Invalidation

To invalidate cache and force refresh:

```powershell
# Option 1: Wrangler CLI
wrangler kv:key delete --namespace-id abc123 events:ics:2025:12

# Option 2: Purge all
wrangler kv:namespace delete --namespace-id abc123 --force
```

Or from the app when creating/updating events (via API call).

---

## 🌍 Custom Domain Setup

To use a custom domain (e.g., `api.3mpwrapp.com`):

### 1. Add to `wrangler.toml`:

```toml
routes = [
  { pattern = "api.3mpwrapp.com/*", zone_name = "3mpwrapp.com" }
]
```

### 2. Update DNS in Cloudflare:

- Go to DNS settings for your domain
- Add CNAME: `api.3mpwrapp.com` → `empowrapp-calendar.empowrapp08162025.workers.dev`

### 3. Redeploy:

```powershell
wrangler publish
```

Now use: `https://api.3mpwrapp.com/events.ics`

---

## 🐛 Troubleshooting

### Worker Not Running

```powershell
# Check deployment status
wrangler deployments list

# View logs
wrangler tail

# Re-deploy
wrangler publish
```

### Firebase Connection Failed

```powershell
# Verify secret is set
wrangler secret list

# Check logs for error
wrangler tail --status all

# Re-set credentials
wrangler secret put FIREBASE_SERVICE_ACCOUNT < firebase-key.json
```

### Cache Not Working

```powershell
# Clear all cache
wrangler kv:namespace delete --namespace-id abc123 --force

# Check KV is bound
# View: wrangler.toml [[kv_namespaces]] section
```

### Events Not Showing

1. ✅ Check Firestore has documents with `status: "published"`
2. ✅ Verify Firestore rules allow read access
3. ✅ Check event dates are in the query range
4. ✅ View Worker logs: `wrangler tail`

### CORS Issues

The Worker includes full CORS headers:

```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type'
```

These work for:
- ✅ Web requests from any origin
- ✅ AJAX/Fetch calls
- ✅ Calendar app subscriptions

---

## 📱 Integration Examples

### Use in React/Web

```javascript
// Fetch events
const response = await fetch(
  'https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=20'
);
const { events, pagination } = await response.json();

// Display events
events.forEach(event => {
  console.log(`${event.title} on ${event.date}`);
});
```

### Subscribe in Calendar App

1. **Google Calendar**: Add calendar → Subscribe to calendar → URL:
   ```
   https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics
   ```

2. **Outlook**: Calendar → Add Calendar → Subscribe from web:
   ```
   https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics
   ```

3. **Apple Calendar**: File → Subscribe → Enter URL:
   ```
   webcal://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics
   ```

### Use in Your Website

```html
<!-- Show calendar feed -->
<iframe src="https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events"></iframe>

<!-- Or embed in Next.js -->
<script>
  fetch('https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=5')
    .then(r => r.json())
    .then(data => {
      // Render events
      console.log(data.events);
    });
</script>
```

---

## 📊 Monitoring

### View Worker Logs

```powershell
# Real-time logs
wrangler tail

# Filter by status
wrangler tail --status error

# Filter by path
wrangler tail --search /api/events
```

### Cloudflare Dashboard

1. Go to **Cloudflare Dashboard**
2. Select your account
3. **Workers** → **3mpwrapp-calendar**
4. View **Metrics** tab:
   - Requests/minute
   - Error rate
   - CPU time
   - Duration

### Health Monitoring

```powershell
# Check Worker health every 5 minutes
while ($true) {
  $health = curl -s "https://empowrapp-calendar.empowrapp08162025.workers.dev/health"
  Write-Host "$(Get-Date): $health"
  Start-Sleep -Seconds 300
}
```

---

## 🔄 Updates & Maintenance

### Update Worker Code

```powershell
# Make changes to server/worker.js
# Then redeploy
cd server
wrangler publish
```

### Update Dependencies

```powershell
cd server
npm update

# If adding new packages
npm install new-package
wrangler publish
```

### Database Migrations

When Firestore schema changes, the Worker automatically adapts since it reads all fields from documents.

---

## 📈 Next Steps

1. ✅ **Deploy Worker** (see Setup section)
2. ✅ **Test Endpoints** (see Testing section)
3. ✅ **Add to Calendar Apps** (see Integration section)
4. ✅ **Monitor Performance** (see Monitoring section)
5. ✅ **Enable Cache Warming** (optional, for production)

---

## ✨ Advanced: Cache Warming

To pre-populate cache every 6 hours, add cron trigger to `wrangler.toml`:

```toml
[triggers]
crons = ["0 */6 * * *"]
```

Then handle cron requests in `worker.js`:

```javascript
// In fetch handler, before routes:
if (request.method === 'POST' && url.pathname === '/cron') {
  // Refresh all cache
  const years = [2024, 2025, 2026];
  years.forEach(year => {
    fetchEventsFromFirestore(firestore, { year });
  });
  return new Response('Cache warming triggered', { status: 200 });
}
```

---

## 🎉 Success Checklist

- ✅ Worker deployed to Cloudflare
- ✅ Firestore connected and returning events
- ✅ KV Cache working (check headers: `Cache-Control`)
- ✅ Health endpoint responding
- ✅ Endpoints tested with curl/Postman
- ✅ CORS headers present
- ✅ Calendar apps can subscribe
- ✅ Logs viewable via `wrangler tail`

---

## 📞 Support

**Common Issues:**
- [Firebase connection failed](#firebase-connection-failed)
- [Cache not working](#cache-not-working)
- [Events not showing](#events-not-showing)
- [CORS issues](#cors-issues)

**More Help:**
- Cloudflare Docs: https://developers.cloudflare.com/workers/
- Firebase Docs: https://firebase.google.com/docs/firestore
- Wrangler Docs: https://developers.cloudflare.com/wrangler/

---

**Version**: 2.0 | **Last Updated**: November 6, 2025 | **Status**: Production Ready ✅
