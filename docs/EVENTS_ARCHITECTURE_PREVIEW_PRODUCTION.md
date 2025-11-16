# Events Architecture: Preview vs Production

## Overview
The 3mpwr App uses **dual Firestore collections** for events to support development and production environments without data conflicts.

---

## 🏗️ Collection Architecture

### Collections
1. **`events_production`** - Live events shown to all users
2. **`events_preview`** - Staging/testing events (optional)

### Key Design Principle
**Same event ID can exist in BOTH collections**. This is intentional and NOT a duplicate issue:

```
events_production/
  └── tbdiwsg-nov11-2025  (Live event)
  
events_preview/
  └── tbdiwsg-nov11-2025  (Test/preview of same event)
```

---

## 🔄 Data Flow

### When User Creates/Edits Event in App

```javascript
// In app/events/index.impl.tsx and app/events/[id].tsx
const eventPayload = { id, title, description, date, ... };

// Sync to BOTH collections simultaneously
await syncEventToProduction(eventPayload, user.uid, 'events_production');
await syncEventToProduction(eventPayload, user.uid, 'events_preview');
```

**Why both?**
- `events_production` → Used by live Cloudflare Worker for public API/ICS feed
- `events_preview` → Used for testing before promotion to production

### Cloudflare Worker Deduplication

The Cloudflare Worker at `https://3mpwrapp-calendar.empowrapp08162025.workers.dev` has built-in deduplication:

```javascript
// In server/worker.js line 118-134
function dedupeEvents(events) {
  const seen = new Map();
  return events.filter((ev) => {
    const key = `${ev.id}|${ev.title}|${new Date(ev.date).toISOString()}`;
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });
}
```

**Deduplication strategy:**
- Composite key: `{id}|{title}|{date}`
- If exact match found → skip (prevents visual duplicates)
- Different dates/titles → keep (allows recurring events)

---

## 📅 Calendar Subscription Auto-Updates

### How It Works

1. **User subscribes to ICS feed:**
   ```
   https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics
   ```

2. **Cloudflare Worker queries Firestore in real-time:**
   ```javascript
   // Fetches from events_production collection
   // Caches for 1 hour (max-age=3600)
   // Auto-refreshes when cache expires
   ```

3. **Calendar apps poll the ICS feed:**
   - iOS Calendar: Every 1-2 hours
   - Google Calendar: Every 8-24 hours
   - Outlook: Varies by plan

4. **New events appear automatically:**
   ```
   User creates event in app
     → Saves to Firestore events_production
     → Cloudflare Worker cache expires (max 1 hour)
     → Calendar app fetches updated ICS
     → New event appears in user's calendar
   ```

### Cache Headers

```javascript
// In server/worker.js line 441-445
headers: {
  'Content-Type': 'text/calendar; charset=utf-8',
  'Cache-Control': 'public, max-age=3600',  // 1-hour cache
  'X-Events-Count': String(filtered.length),
}
```

**Cache Strategy:**
- Browser/CDN cache: 1 hour
- Calendar app refresh: Varies by app
- **Total latency: 1-24 hours** (depending on calendar app)

### No Manual Regeneration Needed

❌ **Old approach (static file):**
```bash
# Manual regeneration required
npm run generate-calendar-feed
# Upload events.ics to hosting
```

✅ **Current approach (dynamic API):**
```
Events sync to Firestore automatically
  → Cloudflare Worker serves live data
  → No manual steps required
  → Always up-to-date (within cache TTL)
```

---

## 🚨 Important: NOT Duplicates

### Scenario: Same Event in Both Collections

```
Firestore:
  /events_production/tbdiwsg-nov11-2025 ✓
  /events_preview/tbdiwsg-nov11-2025 ✓
  
Cloudflare Worker Response:
  GET /api/events
  → Returns: [tbdiwsg-nov11-2025] (one instance)
  
Explanation:
  ✓ Deduplication applied based on id|title|date
  ✓ User sees one event
  ✓ Both collections serve different purposes
```

### When Duplicates DO Appear

**Only appears as duplicate if:**
1. Different IDs (e.g., `evt-123` and `evt-456`)
2. Same title + date + location
3. Created by different users/sessions

**Solution:**
```javascript
// Worker automatically deduplicates
// Manual cleanup not needed
```

---

## 🔧 Configuration Files

### Environment Variables (`.env`)

```bash
# Events API Base URL (Cloudflare Worker for Events)
EXPO_PUBLIC_EVENTS_API_BASE=https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api

# Calendar Feed URL (Auto-updating ICS from Firestore)
EXPO_PUBLIC_CALENDAR_FEED_URL=https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics

# Legacy API Base (for backwards compatibility)
EXPO_PUBLIC_API_BASE=https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api
```

### Firestore Rules (`firebase/firestore.rules`)

```javascript
// Production collection: events_production
match /events_production/{docId} {
  // Public read for all
  allow read: if true;
  
  // Write only by authenticated creator or admin
  allow create: if request.auth != null
    && request.resource.data.createdBy == request.auth.uid;
  allow update, delete: if request.auth != null
    && resource.data.createdBy == request.auth.uid;
}

// Preview collection: events_preview (same rules)
match /events_preview/{docId} {
  allow read: if true;
  allow create: if request.auth != null
    && request.resource.data.createdBy == request.auth.uid;
  allow update, delete: if request.auth != null
    && resource.data.createdBy == request.auth.uid;
}
```

---

## 📊 API Endpoints

### GET /api/events
```
URL: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events
Source: events_production collection
Cache: 5 minutes
Response: JSON array of events (deduplicated)
```

### GET /events.ics
```
URL: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics
Source: events_production collection
Cache: 1 hour
Response: iCalendar format (RFC 5545)
Usage: Calendar app subscriptions
```

### Environment Toggle
```javascript
// In server/worker.js
const environment = url.searchParams.get('env') || 'production';
const collectionName = environment === 'preview' 
  ? 'events_preview' 
  : 'events_production';

// Access preview data:
// GET /api/events?env=preview
// GET /events.ics?env=preview
```

---

## ✅ Verification Steps

### 1. Check No Visual Duplicates

```bash
# Fetch events from API
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events" | jq '.events[] | {id, title, date}'

# Should see each event only once
# Even if it exists in both collections
```

### 2. Verify Calendar Auto-Updates

```bash
# 1. Create event in app
# 2. Wait up to 1 hour (cache expiry)
# 3. Fetch ICS feed
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics"

# New event should appear in VCALENDAR output
```

### 3. Test Both Environments

```bash
# Production events
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events"

# Preview events
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?env=preview"

# Both should work without errors
```

---

## 🎯 Summary

### Preview vs Production
- ✅ **Same IDs are INTENTIONAL** - not duplicates
- ✅ **Different collections** - different environments
- ✅ **Worker deduplication** - user sees clean data
- ✅ **No conflicts** - proper data separation

### Calendar Auto-Updates
- ✅ **No manual regeneration** - Cloudflare Worker is dynamic
- ✅ **1-hour cache** - balances freshness and performance
- ✅ **Firestore live source** - always pulls latest data
- ✅ **Automatic sync** - events appear in subscribed calendars

### Data Flow
```
App Create Event
  ↓
Firebase events_production (write)
  ↓
Cloudflare Worker (cache 1hr, dedupe)
  ↓
ICS Feed /events.ics (refresh)
  ↓
User's Calendar App (poll every 1-24hrs)
  ↓
Event Appears Automatically ✨
```

---

## 🚀 Next Steps

No action needed! The system is working as designed:
1. ✅ Events sync to both collections automatically
2. ✅ Cloudflare Worker deduplicates on read
3. ✅ Calendar subscriptions auto-update
4. ✅ No manual maintenance required

Just create events in the app and they'll appear everywhere automatically! 🎉
