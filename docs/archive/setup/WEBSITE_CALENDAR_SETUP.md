# Calendar Sync Implementation Guide

## Overview
This guide shows how to implement real-time calendar sync between the 3mpwr app and your website.

## ✅ App-Side Implementation (COMPLETED)

The app now has full calendar sync support via `services/eventSync.ts`:

- **ICS Parser**: Parses standard iCalendar format
- **Auto-sync**: Fetches events every hour or on-demand
- **Caching**: Stores events locally for offline access
- **Accessibility Detection**: Auto-detects ASL, captions, step-free, sensory features

### Usage in App

```typescript
import { syncEventsFromWebsite, getCachedSyncedEvents } from '../services/eventSync';

// Sync events from website
const { success, events } = await syncEventsFromWebsite('https://yoursite.com/api/events.ics');

// Get cached events (no network call)
const cachedEvents = await getCachedSyncedEvents();
```

## 🌐 Website-Side Setup (REQUIRED)

### Option 1: Static ICS File (Simplest)

Create a static `events.ics` file and update it manually or via script:

**File: `/public/events.ics`**

```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//3mpwr App//Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:event-001@empowr.app
DTSTART:20250220T140000Z
DTEND:20250220T160000Z
SUMMARY:Community Support Workshop
DESCRIPTION:Join us for an empowering workshop focused on community support and advocacy. ASL interpretation and captions provided.
LOCATION:Toronto, ON
URL:https://empowr.app/events/workshop-001
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:event-002@empowr.app
DTSTART:20250225T180000Z
DTEND:20250225T200000Z
SUMMARY:Virtual Town Hall
DESCRIPTION:Monthly town hall meeting with Q&A. Virtual event with live captions.
LOCATION:Virtual
URL:https://empowr.app/events/townhall-002
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR
```

**Serve it:**
- Next.js: Place in `/public/events.ics` (auto-served)
- WordPress: Upload to media library or use FTP
- Static site: Add to root directory

**In app config:**
```typescript
// Configure in app or .env
const ICS_FEED_URL = 'https://yoursite.com/events.ics';
```

### Option 2: Dynamic API Endpoint (Recommended)

Create an API endpoint that generates ICS from your database:

**Next.js Example: `/pages/api/events.ics.ts`**

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { getEventsFromDatabase } from '@/lib/events';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const events = await getEventsFromDatabase();
    
    const icsEvents = events.map(event => {
      const startDate = formatICalDateTime(new Date(event.startDate));
      const endDate = formatICalDateTime(new Date(event.endDate || event.startDate));
      
      return `BEGIN:VEVENT
UID:${event.id}@empowr.app
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${escapeICalText(event.description || '')}
LOCATION:${event.isVirtual ? 'Virtual' : event.location || 'TBD'}
URL:https://empowr.app/events/${event.id}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT`;
    }).join('\n');
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//3mpwr App//Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${icsEvents}
END:VCALENDAR`;
    
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="3mpwr-events.ics"');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(200).send(icsContent);
  } catch (error) {
    console.error('Failed to generate ICS feed:', error);
    res.status(500).json({ error: 'Failed to generate calendar feed' });
  }
}

function formatICalDateTime(date: Date): string {
  // Format: 20250115T140000Z
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}
```

**WordPress Example:**

```php
<?php
// Add to functions.php or custom plugin

add_action('init', 'register_ics_feed');

function register_ics_feed() {
    add_rewrite_rule('^events\.ics$', 'index.php?events_ics=1', 'top');
}

add_filter('query_vars', 'add_ics_query_var');

function add_ics_query_var($vars) {
    $vars[] = 'events_ics';
    return $vars;
}

add_action('template_redirect', 'handle_ics_feed');

function handle_ics_feed() {
    if (get_query_var('events_ics')) {
        $args = array(
            'post_type' => 'event',
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'orderby' => 'meta_value',
            'meta_key' => 'event_date',
            'order' => 'ASC'
        );
        
        $events = get_posts($args);
        
        header('Content-Type: text/calendar; charset=utf-8');
        header('Content-Disposition: inline; filename="3mpwr-events.ics"');
        
        echo "BEGIN:VCALENDAR\r\n";
        echo "VERSION:2.0\r\n";
        echo "PRODID:-//3mpwr App//Events//EN\r\n";
        echo "CALSCALE:GREGORIAN\r\n";
        echo "METHOD:PUBLISH\r\n";
        
        foreach ($events as $event) {
            $event_id = $event->ID;
            $title = get_the_title($event_id);
            $description = get_post_field('post_content', $event_id);
            $date = get_post_meta($event_id, 'event_date', true);
            $location = get_post_meta($event_id, 'event_location', true);
            
            $start_date = date('Ymd\THis\Z', strtotime($date));
            $end_date = date('Ymd\THis\Z', strtotime($date . ' +2 hours'));
            
            echo "BEGIN:VEVENT\r\n";
            echo "UID:event-{$event_id}@empowr.app\r\n";
            echo "DTSTART:{$start_date}\r\n";
            echo "DTEND:{$end_date}\r\n";
            echo "SUMMARY:" . esc_ical($title) . "\r\n";
            echo "DESCRIPTION:" . esc_ical($description) . "\r\n";
            echo "LOCATION:" . esc_ical($location) . "\r\n";
            echo "URL:" . get_permalink($event_id) . "\r\n";
            echo "STATUS:CONFIRMED\r\n";
            echo "END:VEVENT\r\n";
        }
        
        echo "END:VCALENDAR\r\n";
        exit;
    }
}

function esc_ical($text) {
    return str_replace(array("\n", ",", ";"), array("\\n", "\\,", "\\;"), strip_tags($text));
}
```

### Option 3: Firebase Firestore (Real-time)

If your website uses Firebase, you can sync directly:

**Website (Node.js/Next.js):**

```typescript
import admin from 'firebase-admin';

// Initialize Firebase Admin
const db = admin.firestore();

// Add event to Firestore
export async function createEvent(event: any) {
  const eventRef = await db.collection('events').add({
    title: event.title,
    description: event.description,
    date: event.date,
    location: event.location,
    isVirtual: event.isVirtual || false,
    asl: event.asl || false,
    captions: event.captions || false,
    stepFree: event.stepFree || false,
    sensorySpace: event.sensorySpace || false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    published: true,
  });
  
  return eventRef.id;
}
```

**App automatically syncs** via Firestore real-time listeners (already implemented in `services/firestore.ts`).

## 🔗 Connecting App to Website

### Step 1: Configure Feed URL

**In app code:**

```typescript
// app/(tabs)/events/index.tsx
import { useEffect } from 'react';
import { syncEventsFromWebsite } from '../../../services/eventSync';

// Your website ICS feed URL
const WEBSITE_ICS_URL = 'https://empowr.app/api/events.ics';

export default function EventsScreen() {
  useEffect(() => {
    // Auto-sync on mount
    syncEventsFromWebsite(WEBSITE_ICS_URL, false);
  }, []);
  
  // ... rest of component
}
```

**Or use environment variable:**

```bash
# .env
EXPO_PUBLIC_EVENTS_ICS_URL=https://empowr.app/api/events.ics
```

```typescript
const ICS_URL = process.env.EXPO_PUBLIC_EVENTS_ICS_URL || 'https://empowr.app/api/events.ics';
```

### Step 2: Test Sync

```typescript
// Test in app
import { syncEventsFromWebsite } from '../services/eventSync';

const result = await syncEventsFromWebsite('https://empowr.app/events.ics', true);
if (result.success) {
  console.log('Synced events:', result.events);
} else {
  console.error('Sync failed:', result.error);
}
```

### Step 3: Display Synced Events

```typescript
import { getCachedSyncedEvents } from '../services/eventSync';
import { events as localEvents } from '../data/events';

// Combine local and synced events
const syncedEvents = await getCachedSyncedEvents();
const allEvents = [...localEvents, ...syncedEvents];
```

## 📊 Monitoring

Track sync status in app:

```typescript
import { getLastSyncTime } from '../services/eventSync';

const lastSync = await getLastSyncTime();
console.log('Last synced:', lastSync?.toLocaleString());
```

## 🔄 Manual Refresh

Add a refresh button for users:

```typescript
import { useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await syncEventsFromWebsite(ICS_URL, true); // Force sync
  setRefreshing(false);
};

<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
  {/* Events list */}
</ScrollView>
```

## 🚀 Next Steps

1. **Choose your option** (Static ICS, Dynamic API, or Firestore)
2. **Set up endpoint** on your website following examples above
3. **Configure app** with your ICS feed URL
4. **Test sync** using manual refresh or automatic interval
5. **Monitor** sync status and errors

## 🛠️ Troubleshooting

**Sync not working:**
- Check CORS headers on website endpoint
- Verify ICS format is valid (use online validator)
- Check app logs for sync errors
- Test endpoint directly in browser

**Events not appearing:**
- Verify UID format: `event-id@empowr.app`
- Check required fields: `SUMMARY`, `DTSTART`, `UID`
- Ensure dates are in correct format: `20250115T140000Z`

**CORS issues:**

```typescript
// Next.js: Add CORS headers
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET');
```

## 📝 ICS Format Reference

**Required Fields:**
- `UID`: Unique identifier (e.g., `event-001@empowr.app`)
- `DTSTART`: Start date/time (`20250115T140000Z`)
- `SUMMARY`: Event title

**Optional Fields:**
- `DTEND`: End date/time
- `DESCRIPTION`: Event description
- `LOCATION`: Physical or virtual location
- `URL`: Event webpage
- `STATUS`: `CONFIRMED`, `TENTATIVE`, `CANCELLED`

**Accessibility Markers** (in DESCRIPTION):
- Include "ASL" or "sign language" → Sets `asl: true`
- Include "captions" or "subtitles" → Sets `captions: true`
- Include "step-free" or "accessible" → Sets `stepFree: true`
- Include "sensory" or "quiet space" → Sets `sensorySpace: true`

## ✅ Deployment Checklist

- [ ] Website ICS endpoint created and tested
- [ ] ICS feed URL configured in app
- [ ] CORS headers enabled (if needed)
- [ ] Test manual sync from app
- [ ] Verify auto-sync interval (1 hour default)
- [ ] Monitor sync logs for errors
- [ ] Test offline caching
- [ ] Verify accessibility features are detected

---

**Need help?** Check the full implementation in `services/eventSync.ts` or see `docs/CALENDAR_SYNC.md` for API integration options.
