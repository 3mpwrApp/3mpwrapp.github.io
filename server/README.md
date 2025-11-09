# 3mpwrApp Cloudflare Workers

This directory contains two separate Cloudflare Workers for the 3mpwrApp infrastructure:

## 📅 Events Worker (`events-worker.js`)

**Deployed at:** `https://3mpwrapp-calendar.empowrapp08162025.workers.dev`

Handles all event-related API endpoints and calendar feeds.

### Endpoints:

- `GET /events.ics` - iCalendar subscription feed (subscribable)
  - Query params: `year`, `month`, `env` (production/preview)
  - Returns RFC 5545 compliant ICS file
  - Cached for 1 hour
  
- `GET /api/events` - JSON events list
  - Query params: `category`, `limit`, `page`, `sort`, `dir`, `env`
  - Returns paginated events with metadata
  - Cached for 5 minutes
  
- `GET /api/events/:id` - Single event details
  - Returns full event object
  
- `GET /health` - Health check status

### Environment Variables:
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON (secret)
- `CALENDAR_CACHE` - KV namespace for caching (binding)

### Collections Used:
- `events_production` - Live events
- `events_preview` - Preview/staging events

---

## 📣 Campaigns Worker (`campaigns-worker.js`)

**Deployed at:** `https://3mpwrapp-campaigns.empowrapp08162025.workers.dev`

Handles all campaign-related API endpoints.

### Endpoints:

- `GET /api/campaigns` - JSON campaigns list
  - Query params: `limit`, `page`, `env` (production/preview)
  - Returns paginated campaigns with metadata
  - Cached for 5 minutes
  
- `GET /api/campaigns/:id` - Single campaign details
  - Returns full campaign object
  
- `GET /health` - Health check status

### Environment Variables:
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON (secret)
- `CAMPAIGNS_CACHE` - KV namespace for caching (binding)

### Collections Used:
- `campaigns_production` - Live campaigns
- `campaigns_preview` - Preview/staging campaigns

---

## 🚀 Deployment

### Deploy Events Worker:
```bash
cd server
wrangler deploy events-worker.js --name 3mpwrapp-calendar
```

### Deploy Campaigns Worker:
```bash
cd server
wrangler deploy campaigns-worker.js --name 3mpwrapp-campaigns
```

### Set Secrets:
```bash
# Events worker
wrangler secret put FIREBASE_SERVICE_ACCOUNT --name 3mpwrapp-calendar

# Campaigns worker
wrangler secret put FIREBASE_SERVICE_ACCOUNT --name 3mpwrapp-campaigns
```

### Create KV Namespaces:
```bash
# Events cache
wrangler kv:namespace create "CALENDAR_CACHE" --preview
wrangler kv:namespace create "CALENDAR_CACHE"

# Campaigns cache
wrangler kv:namespace create "CAMPAIGNS_CACHE" --preview
wrangler kv:namespace create "CAMPAIGNS_CACHE"
```

---

## 🔧 Configuration in App

Update your `.env` file:

```env
# Events API
EXPO_PUBLIC_EVENTS_API_BASE=https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api
EXPO_PUBLIC_CALENDAR_FEED_URL=https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics

# Campaigns API
EXPO_PUBLIC_CAMPAIGNS_API_BASE=https://3mpwrapp-campaigns.empowrapp08162025.workers.dev/api

# Legacy (backwards compatibility - points to events)
EXPO_PUBLIC_API_BASE=https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api
```

---

## 📊 Monitoring

### Check Health:
- Events: `https://3mpwrapp-calendar.empowrapp08162025.workers.dev/health`
- Campaigns: `https://3mpwrapp-campaigns.empowrapp08162025.workers.dev/health`

### View Logs:
```bash
# Events worker
wrangler tail 3mpwrapp-calendar

# Campaigns worker
wrangler tail 3mpwrapp-campaigns
```

---

## 🏗️ Architecture

Both workers use:
- **Firestore REST API** for data access (no Admin SDK needed)
- **WebCrypto** for JWT generation
- **KV storage** for caching responses
- **CORS** enabled for all origins
- **TTL caching**: 1 hour for ICS, 5 minutes for JSON

### Why Separate Workers?

1. **Clear separation of concerns** - Events and campaigns are distinct features
2. **Independent scaling** - Different traffic patterns can be handled separately
3. **Isolated caching** - Each worker has its own KV namespace
4. **Easier debugging** - Logs and metrics are separate
5. **Flexible deployment** - Can update one without affecting the other

---

## 🔒 Security

- Service account credentials stored as encrypted secrets
- CORS headers restrict access appropriately
- Firestore security rules control data access
- Rate limiting via Cloudflare (plan dependent)

---

## 📝 Notes

- Both workers support `env=preview` query parameter for staging data
- Caching uses KV storage with configurable TTL
- All endpoints return CORS headers for browser access
- Automatic deduplication for events (by title + date + location)
- Firestore authentication via JWT (generated with WebCrypto)
