# 🔄 Complete Event Sync Solution

## Current Situation

### ✅ What's Working
- Cloudflare Worker API: Running perfectly
- Firestore: 41 events (holidays, observances, health awareness)
- Calendar URL: `https://empowrapp-calendar.empowrapp08162025.workers.dev/events.ics`
- Real-time sync infrastructure: Ready

### ❌ What Needs Fixing
1. **2 Sample Events** blocking community category (no `createdBy` field)
   - `Yk1p4IJ66gGxkI0F8mCc` - Community Accessibility Workshop
   - `bYfSpZdmLv2o5Pfijv4V` - Community Accessibility Workshop

2. **Your 3 TBDIWSG Events** stuck in local AsyncStorage only
   - Created under: `empowrapp08162025@gmail.com`
   - Not synced to Firestore yet

---

## ⚡ IMMEDIATE FIX: Delete Sample Events

### Method 1: Firebase Console (Recommended - 2 minutes)
1. Visit: https://console.firebase.google.com/project/empowrapp/firestore
2. Navigate to: **Firestore Database** → **events_production** collection
3. Find and delete these 2 documents:
   - Click on `Yk1p4IJ66gGxkI0F8mCc` → Click trash icon → Confirm
   - Click on `bYfSpZdmLv2o5Pfijv4V` → Click trash icon → Confirm
4. Repeat for **events_preview** collection (if they exist there)

### Method 2: Firebase CLI (If you have it installed)
```bash
# Install if needed
npm install -g firebase-tools

# Login
firebase login

# Delete events
firebase firestore:delete events_production/Yk1p4IJ66gGxkI0F8mCc
firebase firestore:delete events_production/bYfSpZdmLv2o5Pfijv4V
```

---

## 🎯 SYNC YOUR 3 TBDIWSG EVENTS

### Option A: Provide Event Details (I'll sync them for you)

Please tell me:

**Event 1:**
- Title: ?
- Description: ?
- Date: ? (format: YYYY-MM-DD)
- Time: ? (format: HH:MM)
- Location: ? (or "Virtual")
- Accessibility features:
  - ASL interpreter: Yes/No
  - Captions: Yes/No
  - Wheelchair accessible: Yes/No
  - Sensory-friendly space: Yes/No

**Event 2:**
- (same fields)

**Event 3:**
- (same fields)

### Option B: Extract from App

1. **If app is running in development:**
   ```
   - Open React Native Debugger/Flipper
   - Go to AsyncStorage
   - Find key: "events:local:v1"
   - Copy the JSON array
   - Send it to me
   ```

2. **Run this in your app's terminal while app is open:**
   ```bash
   # If using React Native Debugger
   # Type in console:
   AsyncStorage.getItem('events:local:v1').then(data => console.log(JSON.parse(data)))
   ```

### Option C: Automated Sync Script (After you provide details)

Once you tell me your event details, I'll update `scripts/auto-sync-events.mjs` with YOUR actual data and run:

```bash
node scripts/auto-sync-events.mjs
```

This will:
- ✅ Sync to `events_production`
- ✅ Sync to `events_preview`  
- ✅ Setup real-time monitoring
- ✅ Verify events appear on Worker API
- ✅ Update calendar feed automatically

---

## 🔄 AUTOMATED REAL-TIME SYNC (Future)

To make this fully automated going forward:

### 1. Fix App Auth Issue
The app currently uses `user?.uid` but events created have empty `createdBy`. Need to ensure:
```typescript
// In app/events/index.impl.tsx line 241
createdBy: user?.uid || user?.email || 'anonymous',
```

### 2. Enable Auto-Sync on Event Creation
Already implemented! When you create events while **signed in**, they automatically sync to:
- Local AsyncStorage (immediate)
- Firestore `events_production` (2-5 seconds)
- Firestore `events_preview` (2-5 seconds)
- Cloudflare Worker API (5 minutes cache refresh)
- Website calendar (5 minutes)

### 3. Real-Time Bidirectional Sync
Run monitoring script to see live changes:
```bash
node scripts/auto-sync-events.mjs
```

Leave it running to monitor real-time changes across:
- App → Firestore → Worker → Website
- Website → Firestore → App (planned)

---

## 📊 Verify Everything Works

### 1. Check Firestore Console
https://console.firebase.google.com/project/empowrapp/firestore/databases/-default-/data/~2Fevents_production

Should see:
- ✅ Your 3 TBDIWSG events with `createdBy: empowrapp08162025@gmail.com`
- ✅ 39+ system events (holidays, observances, health)
- ❌ NO sample events without `createdBy`

### 2. Check Worker API
```bash
# PowerShell
$response = Invoke-WebRequest -Uri "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community" -UseBasicParsing
$json = $response.Content | ConvertFrom-Json
Write-Host "Community events: $($json.pagination.total)"
```

Should show: **3 events** (your TBDIWSG events)

### 3. Check Calendar Feed
```bash
# Should include your events
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics" | Select-String "TBDIWSG"
```

### 4. Check Website
Visit: https://3mpwrapp.pages.dev/events/
- Your 3 events should appear in the calendar

---

## 🚀 NEXT STEPS

1. ✅ Delete 2 sample events (Firebase Console)
2. ⏳ **PROVIDE YOUR 3 EVENT DETAILS** 
3. ✅ I'll sync them to Firestore immediately
4. ✅ Verify they appear on website within 5 minutes
5. ✅ Test calendar subscription in your calendar app

---

## 📝 Scripts Available

| Script | Purpose | Command |
|--------|---------|---------|
| `auto-sync-events.mjs` | Automated sync with real-time monitoring | `node scripts/auto-sync-events.mjs` |
| `delete-sample-events.mjs` | Delete sample events (requires admin) | `node scripts/delete-sample-events.mjs` |
| `sync-local-events-to-firestore.mjs` | Manual sync specific events | `node scripts/sync-local-events-to-firestore.mjs` |

---

## 🆘 Troubleshooting

### Events Not Syncing
- Make sure you're **signed in** when creating events in app
- Check `user?.uid` is not null/undefined
- Verify internet connection

### Events Not on Website
- Wait 5 minutes for Cloudflare cache to refresh
- Force refresh: `?cache=bust` parameter
- Check Firestore console to verify events exist

### Can't Delete Sample Events
- Use Firebase Console (requires project owner access)
- Or update Firestore rules temporarily to allow deletion

---

**Ready when you are!** Just provide your 3 event details and I'll sync them immediately. 🚀
