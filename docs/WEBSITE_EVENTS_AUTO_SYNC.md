# Website Events Calendar Auto-Sync Setup Guide

This guide provides step-by-step instructions for integrating the auto-updating events calendar from the 3mpwr app to your website.

## Architecture Overview

The events sync system uses:
- **Firestore Collections**: `events_production` (live events) and `events_preview` (testing)
- **Cloudflare Worker**: Serves events data via REST API and ICS format
- **App Integration**: Mobile app syncs events to Firestore in real-time

## API Endpoints

Your Cloudflare Worker provides three endpoints:

### 1. **Events API** (JSON format)
```
https://your-worker.workers.dev/api/events?env=production
https://your-worker.workers.dev/api/events?env=preview
```

Returns:
```json
{
  "events": [
    {
      "id": "evt-12345",
      "title": "Community Meeting",
      "description": "Join us for our monthly meeting",
      "date": "2025-01-15T10:00:00.000Z",
      "location": "123 Main St",
      "isVirtual": false,
      "asl": true,
      "captions": true,
      "stepFree": true,
      "sensorySpace": false,
      "createdAt": "2025-01-01T12:00:00.000Z",
      "updatedAt": "2025-01-01T12:00:00.000Z",
      "createdBy": "user-uid-123"
    }
  ],
  "lastFetch": 1704110400000
}
```

### 2. **ICS Calendar Feed** (iCalendar format)
```
https://your-worker.workers.dev/events.ics?env=production
https://your-worker.workers.dev/events.ics?env=preview
```

Returns standard ICS format that can be subscribed to in calendar apps:
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//3mpwr App//Events Calendar//EN
BEGIN:VEVENT
UID:evt-12345
DTSTAMP:20250101T120000Z
DTSTART:20250115T100000Z
SUMMARY:Community Meeting
DESCRIPTION:Join us for our monthly meeting
LOCATION:123 Main St
END:VEVENT
END:VCALENDAR
```

### 3. **Health Check**
```
https://your-worker.workers.dev/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": 1704110400000
}
```

## Firestore Collections Structure

### Production Collection: `events_production`

```javascript
{
  id: "evt-12345",           // Auto-generated or custom ID
  title: "Event Name",       // String, required
  description: "Details...", // String, optional
  date: Timestamp,           // Firestore Timestamp, required
  location: "Address",       // String, optional
  isVirtual: false,          // Boolean, default false
  
  // Accessibility features (all boolean, default false)
  asl: true,                 // ASL interpretation available
  captions: true,            // Captions/subtitles available
  stepFree: true,            // Wheelchair accessible
  sensorySpace: false,       // Quiet/sensory-friendly space available
  
  // Metadata
  createdAt: Timestamp,      // Auto-generated on create
  updatedAt: Timestamp,      // Auto-updated on edit
  createdBy: "user-uid"      // User ID who created the event
}
```

### Preview Collection: `events_preview`
Same structure as production, used for testing before going live.

## Website Integration Steps

### Step 1: Choose Your Integration Method

#### Option A: Direct API Integration (Dynamic Updates)

**For:** React, Vue, Angular, or any modern JS framework

1. **Fetch events on page load:**
```javascript
async function loadEvents() {
  try {
    const response = await fetch('https://your-worker.workers.dev/api/events?env=production');
    const data = await response.json();
    
    // Sort by date
    const events = data.events.sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Render events on your page
    displayEvents(events);
  } catch (error) {
    console.error('Failed to load events:', error);
  }
}
```

2. **Auto-refresh every 5 minutes:**
```javascript
// Initial load
loadEvents();

// Refresh periodically
setInterval(loadEvents, 5 * 60 * 1000); // 5 minutes
```

3. **Display events with accessibility badges:**
```javascript
function displayEvents(events) {
  const container = document.getElementById('events-calendar');
  
  events.forEach(event => {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    
    // Format date
    const eventDate = new Date(event.date);
    const dateString = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Build accessibility badges
    const a11yBadges = [];
    if (event.asl) a11yBadges.push('🤟 ASL Available');
    if (event.captions) a11yBadges.push('📝 Captions');
    if (event.stepFree) a11yBadges.push('♿ Wheelchair Accessible');
    if (event.sensorySpace) a11yBadges.push('🤫 Sensory-Friendly');
    
    eventCard.innerHTML = `
      <h3>${event.title}</h3>
      <p class="event-date">${dateString}</p>
      ${event.location ? `<p class="event-location">📍 ${event.location}</p>` : ''}
      ${event.isVirtual ? `<p class="event-virtual">🌐 Virtual Event</p>` : ''}
      ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
      ${a11yBadges.length > 0 ? `<div class="a11y-badges">${a11yBadges.join(' • ')}</div>` : ''}
    `;
    
    container.appendChild(eventCard);
  });
}
```

#### Option B: ICS Calendar Subscription (No Code Required)

**For:** Static sites, WordPress, Squarespace, or any platform with calendar widget

1. **Get your ICS feed URL:**
```
https://your-worker.workers.dev/events.ics?env=production
```

2. **Add to your website using calendar plugins:**

**WordPress Example (using Simple Calendar plugin):**
- Install "Simple Calendar" plugin
- Go to Calendar → Add Calendar
- Select "Google Calendar" source type
- Paste ICS URL: `https://your-worker.workers.dev/events.ics?env=production`
- Save and embed shortcode: `[calendar id="123"]`

**Squarespace Example:**
- Add Calendar block to page
- Click "Settings" → "Calendar Sources"
- Click "Add Calendar by URL"
- Paste ICS URL
- Save

**HTML/JavaScript Widget Example:**
```html
<!-- Include FullCalendar library -->
<link href='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/main.min.css' rel='stylesheet' />
<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/main.min.js'></script>

<!-- Calendar container -->
<div id='calendar'></div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      events: {
        url: 'https://your-worker.workers.dev/api/events?env=production',
        format: 'json',
        extraParams: function() {
          return {};
        }
      },
      eventDisplay: 'block',
      eventClick: function(info) {
        alert('Event: ' + info.event.title);
        info.el.style.borderColor = 'red';
      }
    });
    calendar.render();
  });
</script>
```

### Step 2: Configure Environment

**For Production:** Use `env=production` parameter
```
https://your-worker.workers.dev/api/events?env=production
https://your-worker.workers.dev/events.ics?env=production
```

**For Testing:** Use `env=preview` parameter
```
https://your-worker.workers.dev/api/events?env=preview
https://your-worker.workers.dev/events.ics?env=preview
```

### Step 3: Style Your Events Calendar (Optional)

Add custom CSS to match your website branding:

```css
.event-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.event-card h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 24px;
}

.event-date {
  color: #666;
  font-weight: 600;
  margin: 8px 0;
}

.event-location, .event-virtual {
  color: #555;
  margin: 6px 0;
}

.event-description {
  color: #444;
  line-height: 1.6;
  margin: 12px 0;
}

.a11y-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
  font-size: 14px;
  color: #666;
}
```

### Step 4: Test Your Integration

1. **Create a test event in the app:**
   - Open 3mpwr app
   - Go to Events tab
   - Tap "Add Event" button
   - Fill in event details
   - Save

2. **Verify sync to preview:**
   - Open `https://your-worker.workers.dev/api/events?env=preview`
   - Confirm your test event appears in the JSON response

3. **Test website display:**
   - Refresh your website
   - Confirm event appears in your calendar widget
   - Verify all details display correctly (date, location, accessibility badges)

4. **Promote to production:**
   - Events created in the app automatically sync to BOTH `events_preview` and `events_production`
   - Switch your website to use `env=production` when ready to go live

## Troubleshooting

### Events Not Appearing on Website

**Check 1: Verify Worker is running**
```bash
curl https://your-worker.workers.dev/health
# Expected: {"status":"healthy","timestamp":1704110400000}
```

**Check 2: Verify events exist in Firestore**
- Open Firebase Console
- Navigate to Firestore Database
- Check `events_production` collection
- Confirm events have valid `date` field (Timestamp type)

**Check 3: Check Worker logs**
- Go to Cloudflare Dashboard
- Select your Worker
- Click "Logs" tab
- Look for errors or fetch failures

**Check 4: Verify CORS settings**
If using direct API calls from browser, ensure Worker has CORS headers:
```javascript
// In your Cloudflare Worker
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};
```

### Events Appear Delayed

**Caching:** Cloudflare Worker uses KV storage for caching. Cache TTL is 5 minutes.
- New events may take up to 5 minutes to appear on website
- To force refresh, add cache-busting parameter: `?env=production&t=timestamp`

**Reduce cache time (optional):**
Edit your Worker to reduce KV cache TTL from 300 seconds to 60 seconds:
```javascript
await env.EVENTS_KV.put(cacheKey, JSON.stringify(data), {
  expirationTtl: 60  // Changed from 300 to 60 seconds
});
```

### ICS Feed Not Working in Calendar Apps

**Check 1: Verify ICS format**
```bash
curl https://your-worker.workers.dev/events.ics?env=production
```

Expected output should start with:
```
BEGIN:VCALENDAR
VERSION:2.0
```

**Check 2: Test in multiple calendar apps**
- Google Calendar: Settings → Import & Export → From URL
- Apple Calendar: File → New Calendar Subscription
- Outlook: Add Calendar → Subscribe from web

**Check 3: Ensure HTTPS**
Most calendar apps require HTTPS URLs. Cloudflare Workers provide HTTPS by default.

## Advanced: Custom Event Filtering

Filter events by date range or category on your website:

```javascript
async function loadEventsFiltered(startDate, endDate) {
  const response = await fetch('https://your-worker.workers.dev/api/events?env=production');
  const data = await response.json();
  
  // Filter by date range
  const filtered = data.events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= startDate && eventDate <= endDate;
  });
  
  // Filter by accessibility features
  const accessibleOnly = filtered.filter(event => 
    event.asl || event.captions || event.stepFree
  );
  
  return accessibleOnly;
}

// Example: Load next 30 days of accessible events
const today = new Date();
const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
loadEventsFiltered(today, futureDate);
```

## Security Considerations

### Data Privacy
- Events are PUBLIC by default (visible to all website visitors)
- Do NOT include sensitive information in event descriptions
- Consider adding authentication if you need private events

### Rate Limiting
- Cloudflare Workers have rate limits (100,000 requests/day on free plan)
- Implement client-side caching to reduce API calls
- Use `If-Modified-Since` headers for conditional requests

### Firestore Security Rules
Current rules allow:
- ✅ Public read access to `events_production` and `events_preview`
- ✅ Authenticated app users can create/update/delete events
- ❌ Anonymous website visitors CANNOT modify events

Rules are defined in `firebase/firestore.rules`.

## Support

### Getting Your Worker URL

Your Cloudflare Worker URL format:
```
https://<worker-name>.<account-subdomain>.workers.dev
```

Find it in: Cloudflare Dashboard → Workers & Pages → Select your worker → View deployment

### Firestore Collections Access

Firestore collections are accessible via:
- **Firebase Console:** https://console.firebase.google.com/ → Select project → Firestore Database
- **Direct URL:** `https://console.firebase.google.com/project/<your-project-id>/firestore`

### Testing Checklist

- [ ] Worker health check returns 200 OK
- [ ] API endpoint returns valid JSON with events array
- [ ] ICS endpoint returns valid iCalendar format
- [ ] Events created in app appear in Firestore within 5 seconds
- [ ] Events appear on website within 5 minutes
- [ ] Accessibility badges display correctly
- [ ] Date/time formatting is correct for your timezone
- [ ] Mobile responsive design works on phones/tablets

## Example Websites

### Minimal HTML Page
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3mpwr Events Calendar</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .event { border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .event h3 { margin: 0 0 8px 0; }
    .badges { margin-top: 8px; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <h1>Upcoming Events</h1>
  <div id="events-container">Loading events...</div>

  <script>
    async function loadEvents() {
      try {
        const response = await fetch('https://your-worker.workers.dev/api/events?env=production');
        const data = await response.json();
        
        const container = document.getElementById('events-container');
        container.innerHTML = '';
        
        data.events
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .forEach(event => {
            const div = document.createElement('div');
            div.className = 'event';
            
            const badges = [];
            if (event.asl) badges.push('🤟 ASL');
            if (event.captions) badges.push('📝 Captions');
            if (event.stepFree) badges.push('♿ Accessible');
            
            div.innerHTML = `
              <h3>${event.title}</h3>
              <p>${new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}</p>
              ${event.description ? `<p>${event.description}</p>` : ''}
              ${badges.length > 0 ? `<div class="badges">${badges.join(' • ')}</div>` : ''}
            `;
            
            container.appendChild(div);
          });
      } catch (error) {
        document.getElementById('events-container').innerHTML = 
          '<p>Failed to load events. Please try again later.</p>';
        console.error(error);
      }
    }
    
    loadEvents();
    setInterval(loadEvents, 5 * 60 * 1000); // Refresh every 5 minutes
  </script>
</body>
</html>
```

---

## Quick Reference

| Feature | Endpoint | Format |
|---------|----------|--------|
| Production Events (JSON) | `/api/events?env=production` | JSON |
| Preview Events (JSON) | `/api/events?env=preview` | JSON |
| Production Calendar (ICS) | `/events.ics?env=production` | iCalendar |
| Preview Calendar (ICS) | `/events.ics?env=preview` | iCalendar |
| Health Check | `/health` | JSON |

**Default Cache TTL:** 5 minutes  
**Update Frequency:** Real-time from app → Up to 5 min delay on website  
**Supported Platforms:** All modern browsers, WordPress, Squarespace, calendar apps

---

Last updated: January 2025
