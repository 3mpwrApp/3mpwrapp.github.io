# Event Creation & Real-Time Sync Architecture

## ✅ System Status: FULLY OPERATIONAL

**Last Verified**: November 14, 2025  
**Firestore Status**: ✅ 76 events restored (38 preview + 38 production)  
**Cloudflare Worker**: ✅ Serving events from Firestore  
**Real-Time Sync**: ✅ Automatic bidirectional sync active

---

## 📊 Complete Event Flow

### 1️⃣ **App → Firestore (Auto-Sync)**

**Location**: `app/events/index.impl.tsx`

```typescript
// User creates event in app
handleCreate(eventData) → {
  // 1. Generate unique ID
  const id = `evt-${Date.now()}`;
  
  // 2. Optimistic UI update
  setBaseItems(prev => [newEvent, ...prev]);
  
  // 3. Save to local storage (offline persistence)
  AsyncStorage.setItem('events:local:v1', updated);
  
  // 4. Auto-sync to Firestore (NO user action required)
  autoSyncEvent(newEvent) → {
    syncEventToProduction(event, uid, 'events_production');
    syncEventToProduction(event, uid, 'events_preview');
  }
  
  // 5. Send push notification if synced
  sendEventNotification(newEvent);
}
```

**Service**: `services/firestoreEventSync.ts`
- `syncEventToProduction()` - Writes to Firestore
- Syncs to BOTH `events_production` AND `events_preview` collections
- Retry queue via `eventAutoSync.ts` if network unavailable

---

### 2️⃣ **Firestore → Cloudflare Worker**

**Location**: `server/worker.js`

```javascript
// Worker fetches from Firestore every 5 minutes (cache TTL)
fetchEventsFromFirestore(serviceAccount, 'events_production') → {
  // 1. Authenticate with Firebase using service account
  getAccessToken(serviceAccount);
  
  // 2. Query Firestore REST API
  GET https://firestore.googleapis.com/v1/.../events_production
  
  // 3. Parse Firestore documents → JSON
  // 4. Filter: status === 'published'
  // 5. Dedupe by title + date + location
  dedupeEvents(events);
  
  // 6. Cache for 5 minutes
  cache.put('events:json:all:production', events, { ttl: 300 });
}
```

**Endpoints**:
- `GET /api/events` - JSON feed (5 min cache)
- `GET /api/events?category=community` - Filtered by category
- `GET /events.ics` - iCalendar subscription feed (1 hour cache)

---

### 3️⃣ **Cloudflare Worker → Website**

**Website URL**: https://3mpwrapp.pages.dev

```javascript
// Website fetches events from Worker
fetch('https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events')
  .then(res => res.json())
  .then(data => {
    // Events appear on website calendar
    // Includes all events from events_production collection
  });
```

**Calendar Subscription**:
```
webcal://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics
```
- Apple Calendar, Google Calendar, Outlook compatible
- Auto-refreshes daily (TTL: 1440 minutes)

---

## 🔄 Bidirectional Real-Time Sync

### App Receives Firestore Updates

**Location**: `services/firestoreEventsSync.ts`

```typescript
// Real-time listener for Firestore changes
subscribeToFirestoreEvents((newEvents) => {
  // 1. Firestore triggers onSnapshot callback
  // 2. Events parsed and sorted
  // 3. Cached locally (AsyncStorage)
  // 4. UI updates automatically
});
```

**Use Case**: Admin adds event in Firebase Console → App shows it immediately

---

## 🛡️ Duplicate Prevention

### Cloudflare Worker Deduplication

**Function**: `dedupeEvents(events)` in `server/worker.js`

```javascript
function dedupeEvents(events) {
  const seen = new Set();
  for (const event of events) {
    // Generate unique key from:
    const key = `${title.toLowerCase()}|${date}|${location.toLowerCase()}`;
    
    if (seen.has(key)) continue; // Skip duplicate
    seen.add(key);
    out.push(event);
  }
  return out;
}
```

**Logic**:
- Deduplicates by: `title + date + location`
- Case-insensitive matching
- Keeps FIRST occurrence (events sorted by date)

### Preview vs Production Collections

**Strategy**: Write to BOTH collections simultaneously

```typescript
// In app event creation
const productionSuccess = await syncEventToProduction(event, uid, 'events_production');
const previewSuccess = await syncEventToProduction(event, uid, 'events_preview');
```

**Why Both?**
- `events_production` → Live website/API
- `events_preview` → Testing/staging environment
- Same data, different environments
- Worker reads from production by default

**Switch Environment**:
```javascript
// In worker.js - controlled by environment variable
const collectionName = environment === 'preview' 
  ? 'events_preview' 
  : 'events_production';
```

---

## 📱 Event Creation in App

### UI Component

**File**: `app/events/index.impl.tsx`

**User Flow**:
1. User taps "+" button in Events tab
2. Fills form:
   - Title ✅
   - Description ✅
   - Date & Time ✅
   - Location / Virtual ✅
   - Accessibility features (ASL, captions, wheelchair, etc.) ✅
3. Taps "Create Event"
4. **Automatic sync happens in background**
5. Success alert: "Event Published! Now live on 3mpwr website"

### Offline Support

**Storage**: AsyncStorage `events:local:v1`

```typescript
// Events created offline are queued
addToSyncQueue(eventId, eventData, userId);

// Background sync retries every 60 seconds
startBackgroundSync() → {
  setInterval(() => {
    processSyncQueue(); // Retry failed syncs
  }, 60000);
}
```

**Sync Queue Status**:
- Displayed in UI: "🔄 2 events pending sync"
- Auto-retries up to 5 attempts
- Manual retry button available

---

## 🔐 Authentication & Permissions

### Firebase Service Account

**Location**: `serviceAccountKey.json` (project root, .gitignored)

**Usage**:
1. **Cloudflare Worker**: Stored as Wrangler secret `FIREBASE_SERVICE_ACCOUNT`
2. **Local Scripts**: Read from `serviceAccountKey.json`
3. **App**: Uses Firebase Client SDK (user auth, not service account)

### Firestore Security Rules

**File**: `firebase/firestore.rules`

```javascript
// events_production collection
match /events_production/{eventId} {
  allow read: if true; // Public read
  allow create: if request.auth != null; // Authenticated users can create
  allow update, delete: if request.auth.uid == resource.data.createdBy; // Only creator can edit
}

// events_preview collection (same rules)
match /events_preview/{eventId} {
  // Same as production
}
```

---

## 🧪 Testing the Complete Flow

### 1. Create Event in App

```bash
# Open app in Expo
npx expo start

# Navigate to Events tab → Tap "+" → Create event
# Verify: "Event Published!" alert appears
```

### 2. Verify Firestore Sync

```bash
# Check events_production collection
node -e "
const admin = require('firebase-admin');
const sa = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(sa) });
admin.firestore().collection('events_production')
  .where('category', '==', 'community')
  .orderBy('createdAt', 'desc')
  .limit(5)
  .get()
  .then(snap => snap.forEach(doc => console.log(doc.id, doc.data().title)));
"
```

### 3. Verify Cloudflare Worker

```powershell
# Check API endpoint
Invoke-WebRequest -Uri "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community&limit=5" | 
  Select-Object -ExpandProperty Content | 
  ConvertFrom-Json | 
  Select-Object -ExpandProperty events | 
  Format-Table id, title, date
```

### 4. Verify Website Display

```bash
# Open in browser
open https://3mpwrapp.pages.dev/events

# Or check calendar subscription
open "webcal://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics"
```

---

## 🐛 Troubleshooting

### Event Not Appearing on Website

**Wait 5 Minutes**: Cloudflare Worker cache TTL

```bash
# Force cache refresh by waiting or deploying worker
cd server
wrangler publish
```

### Event Stuck in Sync Queue

```typescript
// Check sync queue status in app
import { getSyncQueue } from '../services/eventAutoSync';
const queue = await getSyncQueue();
console.log('Pending syncs:', queue);

// Manual retry
import { processSyncQueue } from '../services/eventAutoSync';
await processSyncQueue();
```

### Duplicate Events Appearing

**Deduplication runs automatically**, but if duplicates persist:

1. Check Firestore for duplicate IDs:
```bash
# Query both collections
firebase firestore:query events_production
firebase firestore:query events_preview
```

2. Remove duplicates manually or via script:
```javascript
// Remove duplicate from preview if exists in production
const prodEvents = await db.collection('events_production').get();
const previewEvents = await db.collection('events_preview').get();
const prodIds = new Set(prodEvents.docs.map(d => d.id));

for (const doc of previewEvents.docs) {
  if (prodIds.has(doc.id)) {
    console.log('Duplicate found:', doc.id);
    // Keep in both or remove from preview as needed
  }
}
```

---

## 📈 Monitoring & Analytics

### Cloudflare Worker Analytics

**Dashboard**: https://dash.cloudflare.com/

- **Requests**: Track API endpoint usage
- **Cache Hit Rate**: Monitor 5-minute cache effectiveness
- **Errors**: Alert on Firestore connection failures

### Firebase Analytics

**Console**: https://console.firebase.google.com/project/empowrapp

- **Firestore Reads**: Monitor document read quota
- **Auth Events**: Track user signups/logins
- **Crashlytics**: App error reporting

### App Analytics

**Service**: `services/analytics.ts`

```typescript
// Track event creation
trackEvent(ANALYTICS_EVENTS.EVENTS_CREATE, {
  id: event.id,
  synced: true,
  autoSync: true
});
```

---

## 🚀 Deployment Checklist

### Before Deploying New Events Feature

- [ ] Firebase service account key in place (`serviceAccountKey.json`)
- [ ] Wrangler secret configured: `wrangler secret put FIREBASE_SERVICE_ACCOUNT`
- [ ] Firestore security rules deployed: `npm run rules:deploy`
- [ ] Cloudflare Worker deployed: `cd server && wrangler publish`
- [ ] EAS preview update: `eas update --channel preview`
- [ ] Test end-to-end: Create event → Verify on website

### After Deployment

- [ ] Monitor Cloudflare Worker logs for errors
- [ ] Check Firebase console for unexpected document growth
- [ ] Verify website calendar displays new events
- [ ] Test calendar subscription in Apple Calendar / Google Calendar
- [ ] Confirm push notifications sent to users

---

## 📚 Key Files Reference

### App Code
- `app/events/index.impl.tsx` - Event creation UI and auto-sync logic
- `services/firestoreEventSync.ts` - Firestore write operations
- `services/firestoreEventsSync.ts` - Real-time Firestore listener
- `services/eventAutoSync.ts` - Background sync retry queue
- `data/events.ts` - Local event data (fallback)

### Server Code
- `server/worker.js` - Cloudflare Worker (Firestore → API)
- `server/wrangler.toml` - Worker configuration
- `scripts/restore-all-events.js` - Bulk Firestore restore script

### Configuration
- `firebase/firestore.rules` - Security rules
- `serviceAccountKey.json` - Firebase Admin credentials (not in git)
- `.dev.vars` (server) - Local development secrets

---

## 🎯 Summary

✅ **Event Creation**: Users create events in app → Auto-syncs to Firestore  
✅ **Real-Time Sync**: Firestore → Cloudflare Worker → Website (5 min delay)  
✅ **Duplicate Prevention**: Deduplication by title + date + location  
✅ **Preview/Production**: Events written to BOTH collections simultaneously  
✅ **Offline Support**: Events queued and synced when online  
✅ **Calendar Feeds**: iCal subscription for Apple/Google/Outlook calendars  

**Latency**: App → Website display in **~5 minutes** (cache TTL)

**Data Flow**:
```
User Creates Event (App)
    ↓ (Auto-sync, <1 sec)
Firestore events_production
    ↓ (Cache refresh, 5 min)
Cloudflare Worker API
    ↓ (Real-time fetch)
Website Calendar Display
```

---

**Need Help?** Check logs:
- App: React Native debugger console
- Cloudflare: `wrangler tail` in `server/` directory
- Firebase: Console → Firestore → events_production collection
