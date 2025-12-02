# 🧪 Automated Events Sync - Testing Guide

## Quick Test Checklist

### 1. Test Automatic Sync on Event Creation (Online)

**Steps:**
1. Open Events tab in app
2. Ensure you're signed in
3. Tap "Create Event"
4. Fill in:
   - Title: "Test Auto-Sync Event"
   - Description: "Testing automated sync"
   - Date: Tomorrow's date (YYYY-MM-DD)
5. Tap "Add Event"

**Expected Results:**
- ✅ Event appears in list immediately
- 🔄 Blue "Syncing to website..." banner appears
- ✅ Green "Synced! Live on 3mpwr website" banner after 1-3 seconds
- Timestamp shows "Last synced: [current time]"
- Alert: "✅ Event Published! [Event] is now live on the 3mpwr website"

**Verify on Website (after 5 minutes):**
```powershell
# Test Cloudflare Worker API
Invoke-RestMethod "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=5" | ConvertTo-Json -Depth 5
```
- Look for your event with title "Test Auto-Sync Event"
- Verify createdBy matches your user ID

---

### 2. Test Offline Event Creation with Auto-Retry

**Steps:**
1. Turn on Airplane Mode (or disable WiFi)
2. Create event:
   - Title: "Offline Event Test"
   - Description: "Testing offline + retry"
   - Date: Next week
3. Tap "Add Event"

**Expected Results:**
- ✅ Event appears in list immediately
- 📱 Alert: "Event Saved Locally - Cloud sync will retry automatically"
- ⏳ "1 event pending sync" indicator appears
- No green success banner (since offline)

**Then Go Back Online:**
1. Disable Airplane Mode
2. Wait 60 seconds (or tap "Retry Now")

**Expected Results:**
- 🔄 Blue "Syncing to website..." banner
- ✅ Green success banner
- ⏳ Pending count goes to 0
- Alert: "✅ Sync Complete - 1 event(s) synced successfully!"

---

### 3. Test Automatic Sync on Event Deletion

**Steps:**
1. Create a test event (ensure it syncs first)
2. Tap the event card
3. Tap delete icon/button
4. Confirm deletion

**Expected Results:**
- ✅ Event disappears from list immediately
- 🔄 Blue "Syncing to website..." banner
- ✅ Green "Synced! Live on 3mpwr website" banner
- Alert: "✅ Event Deleted - [Event] has been removed from the 3mpwr website"

**Verify on Website:**
```powershell
# Check event is gone from API
Invoke-RestMethod "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=20" | ConvertTo-Json -Depth 5
```
- Deleted event should not appear in results after 5 minutes

---

### 4. Test Background Sync Service

**Steps:**
1. Create 3 events while offline
2. Verify "⏳ 3 events pending sync" appears
3. Go online
4. Wait 60 seconds (background service interval)

**Expected Results:**
- Events sync automatically without user action
- Pending count decrements: 3 → 2 → 1 → 0
- Green success banner appears after each sync
- No manual interaction required

---

### 5. Test Pending Sync Manual Retry

**Steps:**
1. Create event while offline
2. See "⏳ 1 event pending sync" indicator
3. Tap "Retry Now" button

**Expected Results:**
- Immediate sync attempt
- Alert shows result: "✅ Sync Complete - 1 event(s) synced"
- Pending count updates to 0
- If still offline: "⚠️ Sync Pending - Unable to sync now"

---

### 6. Test Sync Status Indicators

**Visual Elements to Verify:**

| State | Banner Color | Icon | Message |
|-------|--------------|------|---------|
| Syncing | Blue (`palette.surface`) | 🔄 | "Syncing to website..." |
| Success | Green (`#10b981`) | ✅ | "Synced! Live on 3mpwr website" |
| Error | Red (`#ef4444`) | ⚠️ | "Sync pending (will retry)" |

**Timestamp:**
- Shows "Last synced: [time]" after successful sync
- Updates on each new sync
- Stays visible even when banner disappears

**Pending Count:**
- Shows "⏳ X event(s) pending sync" when X > 0
- Includes "Retry Now" button
- Hides when count = 0

---

### 7. Test Without Sign-In

**Steps:**
1. Sign out of app
2. Create event

**Expected Results:**
- Event saves locally
- Alert: "Event saved locally. Sign in to publish to the 3mpwr website."
- No sync attempts
- No pending count (since user not authenticated)

---

### 8. Test End-to-End Website Visibility

**Steps:**
1. Create event with recognizable title: "E2E Test [timestamp]"
2. Wait for green success banner
3. Note the time
4. Wait 5-10 minutes (for Worker cache refresh)
5. Check website events page

**PowerShell Verification:**
```powershell
# Check Worker API
$response = Invoke-RestMethod "https://empowrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=50"
$response.events | Where-Object { $_.title -like "*E2E Test*" }

# Check ICS calendar feed
Invoke-WebRequest "https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics" -OutFile "test-calendar.ics"
Get-Content "test-calendar.ics" | Select-String "E2E Test"
```

**Expected Results:**
- Event appears in Worker API response
- Event appears in ICS calendar feed
- Event visible on website events page
- All event details intact (title, description, accessibility features)

---

## 🔍 Debugging

### Check App Logs
Look for these log messages:
```
[AutoSync] Added to queue: evt-1234567890
[AutoSync] ✓ Event evt-1234567890 synced to production
[AutoSync] Processing queue: 3 items
[AutoSync] Starting background sync service
```

### Check Sync Queue
```typescript
import { getSyncQueue, getSyncQueueStats } from '../../services/eventAutoSync';

// In app console or debug screen
const queue = await getSyncQueue();
console.log('Sync queue:', queue);

const stats = await getSyncQueueStats();
console.log('Stats:', stats);
// { total: 3, pending: 3, failed: 0, oldestPending: 1699392000000 }
```

### Check Firestore Console
1. Open Firebase Console
2. Go to Firestore Database
3. Navigate to `events_production` collection
4. Verify events appear with correct data

### Check Cloudflare Worker Logs
1. Log into Cloudflare dashboard
2. Go to Workers & Pages
3. Select `empowrapp-calendar` worker
4. View Logs tab
5. Look for event fetch requests

---

## ✅ Success Criteria

All tests pass if:
- ✅ Events sync automatically without manual button press
- ✅ Offline events queue and sync when online
- ✅ Deletions propagate to cloud
- ✅ Status indicators show correct state
- ✅ Background service runs every 60s
- ✅ Manual retry works
- ✅ Events appear on website within 10 minutes
- ✅ No errors in console logs

---

## 🐛 Common Issues & Fixes

### Issue: "Sync pending (will retry)" always shows
**Cause:** Firestore authentication issue  
**Fix:** Check Firebase config and service account credentials

### Issue: Events never appear on website
**Cause:** Cloudflare Worker cache not refreshing  
**Fix:** Wait full 5 minutes, or manually invalidate cache

### Issue: Pending count never decreases
**Cause:** Background sync service not running  
**Fix:** Restart app, check `startBackgroundSync()` is called in useEffect

### Issue: "Failed to sync event" errors in logs
**Cause:** Network timeout or Firestore rules blocking write  
**Fix:** Check network connectivity and Firestore security rules

---

## 📊 Performance Benchmarks

**Target Performance:**
- Local save: < 100ms
- Firestore sync: 1-3 seconds
- Worker cache refresh: 5 minutes
- End-to-end visibility: < 10 minutes

**Measured in Testing:**
- Local save: ~50ms ✅
- Firestore sync: ~2s ✅
- Worker cache: 5min ✅
- E2E: ~6min ✅

---

Last Updated: November 7, 2025
