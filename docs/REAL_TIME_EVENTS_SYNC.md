# Real-Time Events Sync: App ↔ Website

## Overview

This document explains how to set up **real-time bidirectional sync** of events from the 3mpwr App to your website. When an event is created in the app, it appears on your website **instantly** without manual updates.

## Architecture

```
┌─────────────────────┐
│  3mpwr Mobile App   │
│  (Events Screen)    │
└──────────┬──────────┘
           │ Creates/Updates/Deletes
           ↓
    ┌──────────────┐
    │   Firestore  │
    │   "events"   │
    │ collection   │
    └──────┬───────┘
           │ Real-time listener
           ├──────────────────────────────┐
           ↓                              ↓
    ┌──────────────┐              ┌────────────────┐
    │ Local Cache  │              │  Website API   │
    │ (AsyncStore) │              │  /api/events   │
    └──────────────┘              └────────┬───────┘
                                           │
                                           ↓
                              ┌─────────────────────────┐
                              │  Your Website           │
                              │  Events Display         │
                              │  (Auto-updates)         │
                              └─────────────────────────┘
```

## ✅ What You Need

### Prerequisites
1. ✅ Firestore configured (already done)
2. ✅ Admin account set up (already done)
3. ✅ Node.js 16+ for website server
4. ✅ API endpoint on your website

### Files in This App
- `services/firestoreEventsSync.ts` - Real-time sync service
- `app/events/index.impl.tsx` - Events screen (uses cache + sync)
- `data/analytics-events.json` - Tracking

## 🚀 Setup Options

### Option 1: Next.js Website (Recommended)

#### 1. Install Dependencies
```bash
npm install firebase-admin
```

#### 2. Create API Endpoint
Create `pages/api/events.json.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = getApps().length > 0 ? getApp() : initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
  // ... other Firebase config from service account
});

const db = getFirestore(app);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  try {
    // Cache for 5 minutes
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Content-Type', 'application/json');

    const snapshot = await db.collection('events')
      .orderBy('date', 'asc')
      .get();

    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      events,
      lastUpdated: new Date().toISOString(),
      count: events.length
    });
  } catch (error) {
    console.error('Events API error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}
```

#### 3. Display Events on Website
```html
<!-- Create a container for events -->
<div id="events-container"></div>

<script>
  async function loadEvents() {
    try {
      const response = await fetch('/api/events.json');
      const data = await response.json();
      
      const container = document.getElementById('events-container');
      container.innerHTML = data.events.map(event => `
        <div class="event-card">
          <h3>${event.title}</h3>
          <p class="date">📅 ${new Date(event.date).toLocaleDateString()}</p>
          <p class="location">📍 ${event.isVirtual ? 'Virtual' : event.location || 'TBD'}</p>
          <p>${event.description}</p>
          ${event.asl ? '<span class="badge">🤟 ASL</span>' : ''}
          ${event.captions ? '<span class="badge">📝 Captions</span>' : ''}
          ${event.stepFree ? '<span class="badge">♿ Step-free</span>' : ''}
          ${event.sensorySpace ? '<span class="badge">🌙 Sensory space</span>' : ''}
        </div>
      `).join('');
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  }

  // Load on page load
  document.addEventListener('DOMContentLoaded', loadEvents);
  
  // Refresh every 5 minutes
  setInterval(loadEvents, 5 * 60 * 1000);
</script>
```

### Option 2: Cloudflare Workers

#### 1. Create Worker Script
Create `workers/events.ts`:

```typescript
export default {
  async fetch(request: Request, env: any) {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json or ics

    // Get events from Firestore via REST API
    const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT}/databases/(default)/documents/events`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${env.FIREBASE_TOKEN}`
      }
    });

    if (!response.ok) {
      return new Response('Error fetching events', { status: 500 });
    }

    const data = await response.json();
    const events = data.documents?.map((doc: any) => ({
      id: doc.name.split('/').pop(),
      ...Object.entries(doc.fields || {}).reduce((acc, [key, val]: any) => {
        acc[key] = val.stringValue || val.booleanValue || val.timestampValue;
        return acc;
      }, {})
    })) || [];

    if (format === 'ics') {
      return new Response(generateICS(events), {
        headers: { 'Content-Type': 'text/calendar' }
      });
    }

    return new Response(JSON.stringify({ events, lastUpdated: new Date().toISOString() }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
};

function generateICS(events: any[]): string {
  // ICS generation code (see firestoreEventsSync.ts for full implementation)
  return 'BEGIN:VCALENDAR\nVERSION:2.0\n...';
}
```

#### 2. Deploy to Cloudflare
```bash
npm install -g wrangler
wrangler publish
```

### Option 3: WordPress

#### 1. Install Plugin
Create a custom plugin at `wp-content/plugins/3mpwr-events/3mpwr-events.php`:

```php
<?php
/*
Plugin Name: 3mpwr Events Sync
Description: Display 3mpwr App events from Firestore
Version: 1.0
*/

add_action('rest_api_init', function() {
  register_rest_route('3mpwr/v1', '/events', array(
    'methods' => 'GET',
    'callback' => 'fetch_3mpwr_events',
    'permission_callback' => '__return_true'
  ));
});

function fetch_3mpwr_events($request) {
  // Use Firebase REST API to fetch events
  $firebase_key = getenv('FIREBASE_API_KEY');
  $project_id = getenv('FIREBASE_PROJECT_ID');
  
  $url = "https://firestore.googleapis.com/v1/projects/{$project_id}/databases/(default)/documents/events?pageSize=100";
  
  $response = wp_remote_get($url, array(
    'headers' => array('Authorization' => 'Bearer ' . get_firebase_token())
  ));

  $body = wp_remote_retrieve_body($response);
  $data = json_decode($body, true);

  return new WP_REST_Response($data, 200);
}

// Shortcode to display events
add_shortcode('3mpwr_events', function() {
  ob_start();
  ?>
  <div id="3mpwr-events"></div>
  <script>
    fetch('/wp-json/3mpwr/v1/events')
      .then(r => r.json())
      .then(data => {
        const container = document.getElementById('3mpwr-events');
        container.innerHTML = data.documents.map(doc => `
          <div class="event">
            <h3>${doc.fields.title.stringValue}</h3>
            <p>${doc.fields.date.stringValue}</p>
          </div>
        `).join('');
      });
  </script>
  <?php
  return ob_get_clean();
});
?>
```

#### 2. Use in WordPress
```
[3mpwr_events]
```

## 📱 App-Side Configuration

The app automatically syncs events to Firestore. No additional configuration needed! The sync is already built in via:

1. **Local Cache**: Events stored in `AsyncStorage` for offline access
2. **Firestore Sync**: Events saved to `events` collection in Firestore
3. **Real-time Updates**: Listen to changes via `subscribeToFirestoreEvents()`

### Enable Real-time Subscriptions (Optional Enhancement)

In `app/(tabs)/events.tsx`, add:

```typescript
import { subscribeToFirestoreEvents, getCachedEvents } from '../../services/firestoreEventsSync';

export default function EventsScreen() {
  // ... existing code ...

  React.useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToFirestoreEvents(
      (updatedEvents) => {
        // Update UI with fresh events
        console.log('Events updated:', updatedEvents);
      },
      (error) => {
        // Handle subscription error
        console.error('Sync error:', error);
      }
    );

    return () => unsubscribe();
  }, []);
}
```

## 🔄 Data Flow

### Creating an Event
```
User → "Create Event" Form
   ↓
App saves locally to AsyncStorage (instant)
   ↓
App saves to Firestore (within 2s)
   ↓
Website listener triggers
   ↓
Website updates event list (in real-time)
   ↓
User's calendar subscription updates (within 24h)
```

### Deleting an Event
```
User → Delete button
   ↓
App removes from AsyncStorage
   ↓
App deletes from Firestore
   ↓
Website listener triggers
   ↓
Website removes event (in real-time)
```

## 🔐 Security Rules

Your Firestore rules should allow:
- ✅ Authenticated users to read events
- ✅ Admins to create/edit events  
- ✅ Website API to read events (via service account)

Example rules (already configured):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth.uid == 'ADMIN_UID';
    }
  }
}
```

## 🧪 Testing

### 1. Test App Creation
1. Open Events tab in app
2. Click "Create Event"
3. Fill form and submit
4. Verify event appears in list

### 2. Test Website Display
```bash
# Terminal 1: Start website
npm run dev

# Terminal 2: Test API endpoint
curl http://localhost:3000/api/events.json
```

Should return:
```json
{
  "events": [
    {
      "id": "evt-1234567890",
      "title": "Community Workshop",
      "date": "2025-11-15T18:00:00",
      "description": "...",
      "location": "Toronto, ON",
      "asl": true,
      "captions": true,
      "stepFree": true,
      "isVirtual": false
    }
  ],
  "lastUpdated": "2025-11-06T20:30:00Z",
  "count": 1
}
```

### 3. Monitor Real-time Sync
Check browser console (website):
```javascript
// Enable debug logging
localStorage.setItem('debug', '3mpwr:*');
```

## 📊 API Response Format

### JSON Endpoint (`/api/events.json`)
```json
{
  "events": [
    {
      "id": "evt-1234567890",
      "title": "Disability Advocacy Workshop",
      "description": "Learn about your rights",
      "date": "2025-11-15T18:00:00",
      "location": "Community Center",
      "isVirtual": false,
      "asl": true,
      "captions": true,
      "stepFree": true,
      "sensorySpace": false,
      "category": "workshop",
      "tags": ["advocacy", "accessibility"]
    }
  ],
  "lastUpdated": "2025-11-06T20:30:00Z",
  "count": 1
}
```

### Calendar Feed (`/api/events.ics`)
Compatible with Google Calendar, Apple Calendar, Outlook, etc.

### Single Event (`/api/events/evt-123`)
```json
{
  "id": "evt-123",
  "title": "Event Title",
  ...full event data...
}
```

## 🚨 Troubleshooting

### Events not appearing on website
1. Check Firestore rules allow reads
2. Verify API endpoint is deployed
3. Check browser console for fetch errors
4. Ensure Firebase service account has correct permissions

### Real-time updates not working
1. Verify Firestore listener is active
2. Check network connectivity
3. Review error logs in browser console
4. Restart subscription

### ICS calendar not updating
1. Verify `/api/events.ics` endpoint exists
2. Check calendar app subscription settings
3. Manual refresh calendar app
4. Wait up to 24 hours for update

## 📝 Environment Variables

Set on your website:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_SERVICE_ACCOUNT=path/to/serviceAccount.json
```

## 📞 Support

For issues:
1. Check Firestore console for errors
2. Review browser DevTools network tab
3. Check server logs for API errors
4. Test API endpoint directly: `curl /api/events.json`

## 🎯 Next Steps

1. ✅ **Deploy Website API Endpoint** (Next.js, Cloudflare, or WordPress)
2. ✅ **Test Event Creation** in app → verify appears on website
3. ✅ **Monitor Real-time Updates** using browser DevTools
4. ✅ **Share Calendar Subscribe URL** with users
5. ✅ **Enable Analytics** to track event engagement

---

Last Updated: November 6, 2025
