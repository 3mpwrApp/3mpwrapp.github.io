# 📚 Cloudflare Worker API Reference

> Complete API documentation for 3mpwrApp Events Calendar Worker

---

## Base URL

```
https://empowrapp-calendar.empowrapp08162025.workers.dev
```

---

## 📋 Endpoints

### 1. Get Calendar Feed (ICS)

**Endpoint**: `GET /events.ics`

**Purpose**: Download calendar subscription feed for importing into calendar apps

**Request**

```http
GET /events.ics?year=2025&month=12 HTTP/1.1
Host: empowrapp-calendar.empowrapp08162025.workers.dev
Accept: text/calendar
```

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `year` | number | Current year | Year for events (e.g., 2025) |
| `month` | number | All months | Month 1-12, omit for all months |

**Response**

```
Content-Type: text/calendar; charset=utf-8
Cache-Control: public, max-age=3600
X-Events-Count: 15

BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//3mpwr//Calendar 1.0//EN
X-WR-CALNAME:3mpwrApp Events
...
```

**Status Codes**

| Code | Meaning |
|------|---------|
| 200 | Success - ICS feed returned |
| 500 | Server error generating calendar |

**Examples**

```bash
# Get all 2025 events
curl https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics?year=2025

# Get December 2025 only
curl https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics?year=2025&month=12

# Save to file
curl -o events.ics https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics
```

**Use Cases**

- 📅 Subscribe in Google Calendar
- 📅 Subscribe in Outlook
- 📅 Subscribe in Apple Calendar
- 📅 Download for offline access
- 📱 Integrate with calendar apps

---

### 2. Get Events List (JSON)

**Endpoint**: `GET /api/events`

**Purpose**: Retrieve paginated list of events with filtering and sorting

**Request**

```http
GET /api/events?category=community&limit=10&page=1&sort=date&dir=asc HTTP/1.1
Host: empowrapp-calendar.empowrapp08162025.workers.dev
Accept: application/json
```

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | All | Filter by category (e.g., community, advocacy) |
| `limit` | number | 50 | Results per page (1-500) |
| `page` | number | 1 | Page number for pagination |
| `sort` | string | date | Sort field: date, title, attendeeCount |
| `dir` | string | asc | Sort direction: asc or desc |

**Response**

```json
{
  "events": [
    {
      "id": "evt-1234567890",
      "title": "Community Meetup",
      "description": "Virtual community gathering",
      "date": "2025-12-15T19:00:00Z",
      "endDate": "2025-12-15T20:00:00Z",
      "location": "Online",
      "category": "community",
      "isVirtual": true,
      "url": "https://example.com/join",
      "organizer": "3mpwrApp",
      "imageUrl": "https://example.com/image.jpg",
      "attendeeCount": 45,
      "tags": ["disability", "community", "virtual"],
      "createdAt": "2025-11-06T21:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  },
  "metadata": {
    "generatedAt": "2025-11-06T21:00:00Z",
    "cacheHint": "Results cached for 5 minutes",
    "source": "Firestore"
  }
}
```

**Status Codes**

| Code | Meaning |
|------|---------|
| 200 | Success - Events returned |
| 500 | Server error retrieving events |

**Examples**

```bash
# Get all events (default limit 50)
curl https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events

# Community events only
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community"

# Page 2 with 20 items per page
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=20&page=2"

# Sorted by date, newest first
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?sort=date&dir=desc"

# Combined query
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community&sort=date&dir=asc&limit=10&page=1"
```

**Use Cases**

- 🌐 Website homepage event list
- 📱 Mobile app events screen
- 🎯 Email newsletter digest
- 📊 Analytics dashboard
- 🔍 Search results page

---

### 3. Get Single Event

**Endpoint**: `GET /api/events/:id`

**Purpose**: Retrieve details for a specific event

**Request**

```http
GET /api/events/evt-1234567890 HTTP/1.1
Host: empowrapp-calendar.empowrapp08162025.workers.dev
Accept: application/json
```

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Event ID (required) |

**Response**

```json
{
  "id": "evt-1234567890",
  "title": "International Day of Persons with Disabilities",
  "description": "UN observance promoting disability rights and awareness",
  "date": "2025-12-03T00:00:00Z",
  "endDate": "2025-12-03T23:59:59Z",
  "location": "Global",
  "category": "observance",
  "isVirtual": true,
  "url": "https://www.un.org/en/events/disabilityday/",
  "organizer": "3mpwrApp",
  "imageUrl": "https://example.com/idpd.jpg",
  "attendeeCount": 0,
  "tags": ["disability", "international", "awareness"],
  "createdAt": "2025-11-01T00:00:00Z"
}
```

**Status Codes**

| Code | Meaning |
|------|---------|
| 200 | Success - Event found |
| 404 | Event not found |
| 500 | Server error |

**Examples**

```bash
# Get specific event
curl https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events/evt-1234567890

# Save to file
curl https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events/evt-1234567890 -o event.json
```

**Use Cases**

- 📄 Event detail page
- 📝 Event sharing
- 📧 Email invitations
- 🎫 Event registration
- 📱 Push notifications

---

### 4. Health Check

**Endpoint**: `GET /health`

**Purpose**: Check Worker status and service connectivity

**Request**

```http
GET /health HTTP/1.1
Host: empowrapp-calendar.empowrapp08162025.workers.dev
Accept: application/json
```

**Response**

```json
{
  "ok": true,
  "service": "3mpwrApp Calendar Worker",
  "timestamp": "2025-11-06T21:00:00Z",
  "firebaseConnected": true,
  "cacheAvailable": true
}
```

**Status Codes**

| Code | Meaning |
|------|---------|
| 200 | Worker healthy |
| 500 | Worker error |

**Examples**

```bash
# Check health
curl https://empowrapp-calendar.empowrapp08162025.workers.dev/health

# Using jq for formatted output
curl https://empowrapp-calendar.empowrapp08162025.workers.dev/health | jq .
```

**Use Cases**

- 🔔 Uptime monitoring
- 🤖 Status page
- 🔄 Health check for alerts
- 📊 Service dependency checks

---

## 🔄 Query Examples

### Example 1: Upcoming Community Events

**Request**:
```bash
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community&sort=date&dir=asc&limit=10"
```

**Response**:
```json
{
  "events": [
    {
      "id": "evt-001",
      "title": "Community Kickoff",
      "date": "2025-11-15T18:00:00Z",
      "organizer": "3mpwrApp Community"
    },
    {
      "id": "evt-002", 
      "title": "Peer Support Circle",
      "date": "2025-11-22T19:00:00Z",
      "organizer": "Community Advocates"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}
```

### Example 2: Advocacy Events with Pagination

**Request**:
```bash
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?category=advocacy&limit=5&page=2"
```

**Response**:
```json
{
  "events": [
    {
      "id": "evt-015",
      "title": "Policy Advocacy Workshop",
      "date": "2025-12-01T14:00:00Z"
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 5,
    "total": 8,
    "pages": 2
  }
}
```

### Example 3: Sort by Attendance (Most Popular)

**Request**:
```bash
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?sort=attendeeCount&dir=desc&limit=5"
```

**Response**:
```json
{
  "events": [
    {
      "id": "evt-042",
      "title": "Annual Gala",
      "attendeeCount": 250,
      "date": "2025-12-10T19:00:00Z"
    },
    {
      "id": "evt-041",
      "title": "Community Forum",
      "attendeeCount": 180,
      "date": "2025-11-20T18:00:00Z"
    }
  ]
}
```

---

## 🔐 Error Handling

### Error Response Format

All errors return JSON with status code and message:

```json
{
  "error": "Failed to load events",
  "message": "Detailed error information"
}
```

### Common Errors

**404 - Not Found**
```json
{
  "error": "Event not found"
}
```

**500 - Server Error**
```json
{
  "error": "Failed to load events",
  "message": "Firebase connection timeout"
}
```

---

## 📊 Response Headers

All responses include useful headers:

| Header | Example | Meaning |
|--------|---------|---------|
| `Content-Type` | `application/json` | Response format |
| `Cache-Control` | `public, max-age=300` | Cache duration (5 min) |
| `X-Events-Count` | `42` | Number of events in response |
| `Access-Control-Allow-Origin` | `*` | CORS enabled for all origins |

**Reading Headers**:

```bash
# Show response headers
curl -i https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events

# Extract specific header
curl -s -I https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events \
  | grep X-Events-Count
```

---

## 🔄 Rate Limiting & Caching

### Cache Durations

| Endpoint | TTL | Strategy |
|----------|-----|----------|
| `/events.ics` | 1 hour | Regenerated hourly |
| `/api/events` | 5 minutes | Regenerated every 5 min |
| `/api/events/:id` | 5 minutes | Regenerated every 5 min |

### Cache Invalidation

Cache automatically invalidates after TTL expires. To force refresh, add timestamp:

```bash
# Force fresh data (bypasses cache)
curl "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?t=$(date +%s)"
```

---

## 🌐 CORS Headers

Worker supports CORS for all origins:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**Browser Usage Example**:

```javascript
// This works from any website
fetch('https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events')
  .then(r => r.json())
  .then(data => console.log(data.events));
```

---

## 📱 Integration Code Examples

### JavaScript/React

```javascript
// Fetch events with error handling
async function getEvents(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.page) params.append('page', filters.page);

  try {
    const response = await fetch(
      `https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?${params}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return { events: [], error: error.message };
  }
}

// Usage
const { events } = await getEvents({ category: 'community', limit: 10 });
```

### Python

```python
import requests

def get_events(category=None, limit=50, page=1):
    base_url = "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events"
    params = {
        'category': category,
        'limit': limit,
        'page': page
    }
    
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Failed to fetch events: {e}")
        return {'events': [], 'error': str(e)}

# Usage
data = get_events(category='community', limit=10)
for event in data['events']:
    print(f"{event['title']} on {event['date']}")
```

### PowerShell

```powershell
function Get-CalendarEvents {
  param(
    [string]$Category,
    [int]$Limit = 50
  )
  
  $baseUrl = "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events"
  $params = @{}
  if ($Category) { $params['category'] = $Category }
  if ($Limit) { $params['limit'] = $Limit }
  
  try {
    $response = Invoke-RestMethod -Uri $baseUrl -Body $params
    return $response.events
  }
  catch {
    Write-Error "Failed to fetch events: $_"
  }
}

# Usage
Get-CalendarEvents -Category community -Limit 10
```

---

## 🎯 Use Case Scenarios

### Scenario 1: Website Homepage

```javascript
// Show upcoming events on homepage
fetch('https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?sort=date&limit=5')
  .then(r => r.json())
  .then(data => {
    const html = data.events.map(e => `
      <div class="event-card">
        <h3>${e.title}</h3>
        <p>${new Date(e.date).toLocaleDateString()}</p>
      </div>
    `).join('');
    document.getElementById('events').innerHTML = html;
  });
```

### Scenario 2: Calendar App Integration

```bash
# Subscribe to calendar feed
# Google Calendar: Settings → Add other calendars → Subscribe to calendar
# URL: https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics
```

### Scenario 3: Email Newsletter

```javascript
// Generate email with upcoming events
const response = await fetch(
  'https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=5'
);
const { events } = await response.json();

const emailBody = events
  .map(e => `${e.title} - ${e.date}`)
  .join('\n');
// Send email...
```

---

## 🚀 Performance Tips

1. **Use Pagination**: Fetch only needed data
   ```bash
   curl "...?limit=10&page=1"  # Good
   curl "...?limit=1000"        # Bad
   ```

2. **Filter by Category**: Reduce data size
   ```bash
   curl "...?category=community"  # Faster
   curl "...?category=all"        # Slower
   ```

3. **Cache Results Locally**: Reduce API calls
   ```javascript
   const cache = localStorage;
   if (!cache.getItem('events')) {
     const data = await fetch('...');
     cache.setItem('events', JSON.stringify(data));
   }
   ```

4. **Subscribe to ICS**: For calendar apps (automated updates)
   ```
   https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics
   ```

---

## 📞 Support

**Issues with API?**
- Check Health: `GET /health`
- View Logs: `wrangler tail`
- Check Firestore: Verify documents exist and are published

**Need Help?**
- Read: `server/CLOUDFLARE_WORKER_SETUP.md`
- Docs: https://developers.cloudflare.com/workers/
- Discord: Connect with team

---

**API Version**: 2.0 | **Last Updated**: November 6, 2025 | **Status**: Live ✅
