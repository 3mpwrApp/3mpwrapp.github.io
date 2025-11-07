# 🔄 Sync Local Events to Firestore & Website Calendar

## Problem
You created 3 events in the app's Events tab, but they're only stored in **local AsyncStorage** and haven't synced to Firestore. This means they don't appear on the website calendar yet.

## Why This Happened
The app saves events locally first for immediate UI update, then attempts to sync to Firestore. The sync may have failed due to:
- User not authenticated at time of creation
- Firestore connection issues
- BYOC (Bring Your Own Cloud) mode enabled

## Solution: Manual Sync

### Option 1: Quick Fix - Use the Sync Script

1. **Find Your Events Data**:
   - Open the app in development mode
   - Use React Native Debugger or Flipper
   - Look for AsyncStorage key: `events:local:v1`
   - Copy the JSON array

2. **Update the Sync Script**:
   ```bash
   # Edit scripts/sync-local-events-to-firestore.mjs
   # Replace LOCAL_EVENTS array with your copied JSON
   ```

3. **Run the Sync**:
   ```bash
   cd d:\1-EmpowrApp\empowrapp-new\empowrapp-new
   node scripts/sync-local-events-to-firestore.mjs
   ```

4. **Verify**:
   ```bash
   # Check Worker API (wait 5 mins for cache to clear)
   curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community"
   ```

### Option 2: Manual Firestore Upload

1. **Go to Firebase Console**:
   - Visit: https://console.firebase.google.com/
   - Project: `empowrapp`
   - Navigate to Firestore Database

2. **Add to events_production Collection**:
   - Click "Start collection" or open `events_production`
   - For each event, click "Add document"
   - Use event ID as document ID (e.g., `evt-1731042000000`)
   - Add fields:

   ```
   id: "evt-XXXXXXXXXX" (string)
   title: "Your Event Title" (string)
   description: "Event description" (string)
   date: <Timestamp> (timestamp)
   location: "Toronto, ON" (string)
   isVirtual: false (boolean)
   asl: true (boolean)
   captions: true (boolean)
   stepFree: true (boolean)
   sensorySpace: false (boolean)
   category: "community" (string)
   createdBy: "your-uid" (string)
   createdAt: 1731042000000 (number)
   updatedAt: 1731042000000 (number)
   status: "published" (string)
   organizer: "3mpwrApp" (string)
   tags: [] (array)
   imageUrl: "" (string)
   attendeeCount: 0 (number)
   url: "" (string)
   ```

3. **Repeat for All 3 Events**

### Option 3: Re-create in App (with Auth)

1. **Sign in to the app** (if not already)
2. **Go to Events tab**
3. **Create each event again**
4. **Verify sync worked** by checking the success message

## Verification Steps

### 1. Check Firestore Console
- Go to Firestore > events_production
- Should see 3+ documents with `category: "community"`
- Check `createdBy` field matches your user ID

### 2. Check Cloudflare Worker API
```bash
# PowerShell
$response = Invoke-WebRequest -Uri "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community" -UseBasicParsing
$json = $response.Content | ConvertFrom-Json
Write-Host "Community events: $($json.pagination.total)"
$json.events | ForEach-Object { Write-Host "  - $($_.title)" }
```

### 3. Check ICS Calendar Feed
```bash
# Should include your events
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics"
```

### 4. Check Website
- Visit: https://3mpwrapp.pages.dev/events/
- Your events should appear in the calendar

## Current Status

### What's Working ✅
- Cloudflare Worker is running and healthy
- Worker API returning events (41 system events)
- ICS calendar feed generating correctly
- Calendar subscription URL configured
- Firestore rules allow user event creation

### What's Missing ❌
- Your 3 user-created events not in Firestore
- Only 2 sample "Community Accessibility Workshop" events exist
- These samples have no `createdBy` field (empty)

## Next Steps

1. **Choose one of the 3 options above** to sync your events
2. **Wait 5 minutes** for Worker cache to refresh (or force refresh with `?cache=bust`)
3. **Verify events appear** on website calendar
4. **Test calendar subscription** in your calendar app

## Troubleshooting

### Events Still Not Showing
- **Cache Issue**: Wait 5-10 minutes for Cloudflare cache to expire
- **Firestore Rules**: Make sure you're signed in when creating events
- **Check Logs**: Look at Firestore Security Rules logs for denials

### Sync Script Errors
- **Firebase Auth**: Script doesn't need auth (uses Admin API key)
- **Wrong Collection**: Make sure targeting `events_production`, not `events`
- **Date Format**: Dates must be valid ISO 8601 strings

### App Sync Not Working
- **Check Auth**: User must be signed in (`user?.uid` exists)
- **Check BYOC Mode**: If enabled, Firestore sync is disabled
- **Network**: Requires internet connection

## Future Prevention

### Automatic Sync
The app should automatically sync when you create events IF:
- ✅ User is signed in
- ✅ Internet connection available
- ✅ Firestore is reachable
- ✅ BYOC mode is not blocking cloud storage

### Manual Sync Button
Consider adding a "Sync Local Events" button in the Events screen to manually trigger sync of all local-only events.

## Support

If you continue having issues:
1. Check Firestore console for your events
2. Check Worker logs: `cd server && npx wrangler tail`
3. Verify Firestore rules are deployed: `firebase deploy --only firestore:rules`
4. Check app logs when creating events

---

**Last Updated**: November 7, 2025
**Status**: Awaiting manual sync of 3 user-created events
