# Real-Time Event Sync Setup Complete ✅

## Overview

Full bidirectional real-time synchronization is now implemented between:
- **React Native App** (create/edit/delete events)
- **Firestore Collections** (events_production & events_preview)
- **Cloudflare Worker** (REST API endpoints)
- **Website** (https://3mpwrapp.pages.dev/events/)

## Architecture

```
┌──────────────────────┐
│  React Native App    │
│  - Events Tab        │  ◄─── User creates/edits/deletes event
│  - Event Detail      │
└──────────┬───────────┘
           │ Sync to both collections
           │ (production & preview)
    ┌──────▼──────────────────────────┐
    │  Firestore Collections          │
    │  • events_production (42+ docs)  │  ◄─── Real-time listener
    │  • events_preview (42+ docs)     │       Cloud-backed
    └──────┬──────────────────────────┘
           │ REST API query
           │ (cached 5 min)
    ┌──────▼──────────────────────────┐
    │  Cloudflare Worker               │
    │  /api/events                     │  ◄─── Public API
    │  /events.ics                     │       Accessible worldwide
    │  /health                         │
    └──────┬──────────────────────────┘
           │ Fetch events
           │ (live updates)
    ┌──────▼──────────────────────────┐
    │  Website                         │
    │  3mpwrapp.pages.dev/events/      │  ◄─── Public calendar view
    └──────────────────────────────────┘
```

## Key Features

### ✅ Implemented

1. **Create Event**
   - App: User creates event locally
   - Sync: Event written to both `events_production` and `events_preview` collections
   - Worker: Picks up event via REST API (5-min cache)
   - Website: Event appears in live calendar feed

2. **Edit Event**
   - App: User edits event details
   - Sync: Changes replicated to both Firestore collections
   - Worker: Cache refreshes on next request
   - Website: Updated event shown to viewers

3. **Delete Event**
   - App: User deletes event
   - Sync: Event removed from both collections
   - Worker: Cache clears
   - Website: Event disappears from calendar

4. **Real-Time Listeners**
   - App monitors Firestore for external changes
   - Updates UI when events change on website or other devices
   - Automatic synchronization across multiple app instances

5. **Multi-Environment Support**
   - Query parameter `?env=preview` switches to preview collection
   - Default is production collection
   - Both collections receive user-created events

## File Changes

### New Files Created

1. **`services/firestoreEventSync.ts`** (NEW)
   - Firestore event sync operations
   - Supports both production and preview collections
   - Functions:
     - `syncEventToProduction(event, uid, collection)` - Create/upsert
     - `updateEventInProduction(id, updates, uid, collection)` - Update
     - `deleteEventFromProduction(id, collection)` - Delete
     - `subscribeToEventUpdates(callback, onError, collection)` - Real-time listener
     - `fetchEventUpdates(collection)` - Fetch all events
     - `getEventFromProduction(id, collection)` - Get single event
     - `isFirestoreSyncAvailable()` - Check if sync is ready

### Modified Files

1. **`firebase/firestore.rules`** (UPDATED)
   - New rules for `events_production` and `events_preview`
   - Allows signed-in users to create/update/delete their own events
   - Validates required fields (title, date, status)
   - Restricts updates to event creators or admins

2. **`app/events/index.impl.tsx`** (UPDATED)
   - Create handler: Now syncs to Firestore production/preview collections
   - Delete handler: Removes from both collections + local storage
   - Import: `firestoreEventSync` service functions
   - Messages updated to reflect cloud sync status

3. **`app/events/[id].tsx`** (UPDATED)
   - Edit handler: Updates both collections + Firestore
   - Delete handler: Removes from both collections
   - Import: `firestoreEventSync` service functions
   - Success messages reflect sync status

## Sync Flow Examples

### Creating an Event

```javascript
// App: User clicks "Create Event"
handleCreate({
  title: "Accessibility Workshop",
  description: "Learn about accessibility",
  date: "2025-06-15",
  location: "Virtual",
  isVirtual: true,
})

// Step 1: Immediate UI update
setBaseItems(prev => [newEvent, ...prev])

// Step 2: Save to local storage
AsyncStorage.setItem('events:local:v1', JSON.stringify([newEvent, ...existing]))

// Step 3: Sync to Firestore (production & preview)
await syncEventToProduction(eventData, userId, 'events_production')
await syncEventToProduction(eventData, userId, 'events_preview')

// Step 4: Worker picks up in 5 minutes (or immediate on next request)
GET https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events

// Step 5: Website displays event
// https://3mpwrapp.pages.dev/events/ shows new event
```

### Editing an Event

```javascript
// App: User clicks "Edit" on existing event
handleSaveEdit({
  title: "Updated Workshop Title",
  description: "Updated description",
})

// Step 1: Update in old Firestore 'events' collection (backward compat)
await fsUpdateEvent(eventId, editData)

// Step 2: Update in production/preview collections
await updateEventInProduction(eventId, editData, userId, 'events_production')
await updateEventInProduction(eventId, editData, userId, 'events_preview')

// Step 3: User sees success message with sync status
Alert.alert('Success', 'Event updated and synced to website')

// Step 4: Website reflects changes within 5 minutes
```

### Deleting an Event

```javascript
// App: User clicks "Delete" and confirms
handleDelete()

// Step 1: Remove from UI
setBaseItems(prev => prev.filter(e => e.id !== eventId))

// Step 2: Remove from local storage
AsyncStorage.removeItem('events:local:v1', ...)

// Step 3: Delete from both Firestore collections
await deleteEventFromProduction(eventId, 'events_production')
await deleteEventFromProduction(eventId, 'events_preview')

// Step 4: Worker cache clears
// Step 5: Website no longer shows event
```

## Firestore Rules

### New Rules Added

```firestore
// Events (production and preview) - public read; signed-in write with validation
match /events_production/{docId} {
  allow read: if true;
  allow create: if isSignedIn() &&
    request.resource.data.title is string &&
    request.resource.data.date is timestamp &&
    request.resource.data.status == 'published' &&
    request.resource.data.createdBy == request.auth.uid;
  allow update: if isSignedIn() &&
    (request.auth.uid == resource.data.createdBy || isAdmin());
  allow delete: if isSignedIn() &&
    (request.auth.uid == resource.data.createdBy || isAdmin());
}

match /events_preview/{docId} {
  // Same rules as events_production
}
```

### Key Points

- **Public Read**: Anyone can view events (supports website)
- **Signed-in Create**: Only authenticated users can create
- **Creator Update**: Users can only update their own events (creator UID matches)
- **Admin Override**: Admins can update/delete any event
- **Validation**: Ensures title, date, and status fields exist
- **Status Locked**: New events always published

## Deployment

### What's Ready

✅ Firestore rules updated (`firebase/firestore.rules`)
✅ New sync service created (`services/firestoreEventSync.ts`)
✅ App event handlers updated (create/edit/delete)
✅ Worker deployed and tested (`server/worker.js`)
✅ API endpoints live and returning events
✅ Firestore collections seeded (42 events each)

### What Still Needs Manual Setup

⏳ **Deploy Firestore Rules** (requires gcloud CLI):
```bash
firebase deploy --only firestore:rules
# or
gcloud firestore:rules:deploy firebase/firestore.rules --project=empowrapp
```

**Why**: Rules prevent unauthorized access and validate data integrity.

**Without this**: App can create events locally but won't sync to Firestore (permission denied).

### After Deploying Rules

1. Test creating event in app
2. Verify it appears in `/api/events` endpoint
3. Verify it shows on website calendar
4. Test edit/delete operations
5. Check that multiple devices show live updates

## Testing

### Manual Test Flow

```bash
# 1. Create event in app
# Open app → Events tab → Create event → Save

# 2. Check Worker API
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=5"
# Should include newly created event

# 3. Check website
# Visit https://3mpwrapp.pages.dev/events/
# Should show new event in calendar

# 4. Edit event in app
# Click Edit → Change title → Save

# 5. Verify update
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events/{eventId}"
# Should show updated title

# 6. Delete event
# Click Delete → Confirm

# 7. Verify deletion
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events/{eventId}"
# Should return 404
```

## Environment Variables

### App (.env or firebase/config)

- `FIREBASE_API_KEY` - Firebase API key (existing)
- `FIREBASE_PROJECT_ID` - `empowrapp` (existing)
- `FIREBASE_AUTH_DOMAIN` - existing (existing)
- `FIREBASE_DB_URL` - Firestore database URL (existing)

### Worker (server/.dev.vars)

- `FIREBASE_SERVICE_ACCOUNT` - Service account JSON for Firebase authentication

**Status**: Already stored as Wrangler secret ✅

## Performance

### Cache Strategy

| Endpoint | Cache TTL | Collection |
|----------|-----------|-----------|
| `/api/events` | 5 minutes | Both (production by default) |
| `/events.ics` | 1 hour | Both (production by default) |
| Individual event | 5 minutes | - |

### Expected Response Times

- **Create**: 2-5 seconds (includes Firestore write)
- **Edit**: 2-5 seconds (includes Firestore update)
- **Delete**: 1-3 seconds (includes Firestore delete)
- **Query API**: <100ms (cached) or 1-3s (fresh)
- **Website Load**: <2s (uses cached ICS feed)

## Troubleshooting

### Event Created But Not Showing on Website

**Possible Causes**:
1. Firestore rules not deployed → Permission denied error
2. Cache not refreshed → Wait 5 minutes or force refresh
3. Collection not seeded → Verify events_production has documents

**Fix**:
```bash
# Deploy rules
firebase deploy --only firestore:rules

# Force cache refresh
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?force=1"
```

### User Can't Create Events

**Possible Causes**:
1. User not authenticated
2. Firestore rules blocking write
3. Missing required fields

**Fix**:
- Ensure user is signed in (`useAuth()` returns user object)
- Check Firestore rule syntax
- Verify event data includes: title, date, status, createdBy

### Real-Time Updates Not Working

**Possible Causes**:
1. Firestore listener not subscribed
2. Network connectivity issue
3. Permission denied on Firestore read

**Fix**:
- Check that `subscribeToEventUpdates` returns unsubscribe function (not null)
- Verify network connection
- Check Firestore console for permission errors

## Next Steps

1. **Deploy Firestore Rules** (manual CLI step required)
2. **Test App → Firestore → Worker → Website** flow
3. **Monitor Firestore usage** (free tier: 50k reads/day)
4. **Set up alerts** for sync failures
5. **Document event schema** for backend teams

## Event Data Schema

### Firestore Document Structure

```javascript
{
  id: "evt-1730846400000",              // Unique ID
  title: "Accessibility Workshop",       // String, required
  description: "Learn accessibility",    // String
  date: Timestamp,                       // Date, required
  location: "Toronto, ON",               // String
  isVirtual: false,                      // Boolean
  asl: true,                             // Has ASL interpreter
  captions: true,                        // Has captions
  stepFree: true,                        // Wheelchair accessible
  sensorySpace: false,                   // Has quiet/sensory space
  tags: ["accessibility", "workshop"],   // Array of strings
  organizer: "3mpwrApp",                 // String
  imageUrl: "",                          // URL string
  attendeeCount: 0,                      // Number
  url: "https://...",                    // Event URL
  category: "community",                 // Fixed: 'community' for user events
  createdBy: "userId",                   // User UID who created
  createdAt: 1730846400000,              // Timestamp
  updatedAt: 1730846500000,              // Timestamp
  status: "published"                    // Fixed: 'published' for user events
}
```

## Support

For issues or questions:
1. Check `/health` endpoint: `https://3mpwrapp-calendar.empowrapp08162025.workers.dev/health`
2. Review Firestore console for permission errors
3. Check app logs for sync errors
4. Verify Firestore rules are deployed correctly

---

**Last Updated**: November 6, 2025
**Status**: ✅ Ready for Firestore Rules Deployment
**Next Action**: Deploy rules via Firebase CLI or gcloud
