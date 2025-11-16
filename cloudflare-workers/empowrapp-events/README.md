# 3mpwr App Events Calendar Worker

Cloudflare Worker for syncing events from the app to the website calendar.

## Features

- ✅ Real-time event sync from app to website
- ✅ Automatic timezone conversion to EST
- ✅ Separate production and preview environments
- ✅ ICS calendar feed generation
- ✅ CORS enabled for cross-origin requests
- ✅ 30-day automatic event expiration

## Endpoints

### GET /api/events
List all events (production or preview based on `env` query param).

**Query Parameters:**
- `env` - Environment to query (`production` or `preview`). Default: `production`

**Example:**
```bash
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events"
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?env=preview"
```

### POST /api/events
Create or update an event.

**Body:**
```json
{
  "id": "evt-123",
  "title": "Community Workshop",
  "description": "Learn about disability rights",
  "date": "2025-12-01T18:00:00Z",
  "location": "Toronto Community Center",
  "isVirtual": false
}
```

**Example:**
```bash
curl -X POST "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events" \
  -H "Content-Type: application/json" \
  -d '{"id":"evt-123","title":"Test Event","date":"2025-12-01T18:00:00Z"}'
```

### POST /api/events/bulk
Bulk sync multiple events.

**Body:**
```json
{
  "events": [
    {"id": "evt-1", "title": "Event 1", "date": "2025-12-01T18:00:00Z"},
    {"id": "evt-2", "title": "Event 2", "date": "2025-12-05T19:00:00Z"}
  ]
}
```

### DELETE /api/events/:id
Delete an event from production and preview.

**Example:**
```bash
curl -X DELETE "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events/evt-123"
```

### GET /events.ics
ICS calendar feed (production events only).

**Example:**
```bash
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics"
```

### GET /health
Health check endpoint.

## Setup

1. Create a KV namespace:
```bash
wrangler kv:namespace create "EVENTS_KV"
```

2. Update `wrangler.toml` with your KV namespace ID

3. Deploy:
```bash
npm run deploy
```

## Local Development

```bash
npm run dev
```

## Deployment

```bash
npm run deploy
```

## Timezone Handling

All event dates are automatically converted to EST (America/New_York) when synced to the worker. This ensures consistent timezone display across the app and website.
