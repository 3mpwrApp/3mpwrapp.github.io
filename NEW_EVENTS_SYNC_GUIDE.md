# New TBDIWSG Events - Sync Complete Guide
**Date:** November 14, 2025  
**Status:** ✅ Events Added to Local Data & Public JSON

## 📋 Events Added

### 1. Tuesday Information Sessions ZOOM - Open Discussion
- **Date:** November 18, 2025, 10am-12pm EST
- **ID:** `evt-tbdiwsg-nov18-2025`
- **Description:** Open discussion on how to talk to friends and neighbours about system failures
- **Format:** Virtual (Zoom)
- **Link:** https://thunderbayinjuredworkers.com/tuesday-events/

### 2. Tuesday Information Sessions ZOOM - Duty to Accommodate
- **Date:** November 25, 2025, 10am-12pm EST
- **ID:** `evt-tbdiwsg-nov25-2025`
- **Speaker:** Sandra Goodicks, PSAC OH&S Staff representative
- **Format:** Virtual (Zoom)
- **Link:** https://thunderbayinjuredworkers.com/tuesday-events/

### 3. Tuesday Information Session ZOOM - Guest Speaker IWC
- **Date:** December 2, 2025, 10am-12pm EST
- **ID:** `evt-tbdiwsg-dec2-2025`
- **Topic:** November 25th MPP lobby report and December 8 day of action
- **Format:** Virtual (Zoom)
- **Link:** https://thunderbayinjuredworkers.com/tuesday-events/

### 4. Introduction to 3mpwr App - Website & App Demo
- **Date:** December 9, 2025, 10am-12pm EST
- **ID:** `evt-3mpwr-intro-dec9-2025`
- **Presenter:** Lissa Beaulieu (Creator)
- **Topic:** Live demo of 3mpwr App and website walkthrough
- **Format:** Virtual (Zoom)
- **Link:** https://thunderbayinjuredworkers.com/tuesday-events/

## ✅ Completed Steps

1. **Local Data Files Updated**
   - ✅ `data/events.ts` - All 4 events added with full accessibility metadata
   - ✅ `public/api/events.json` - Public JSON updated (38 total events)
   - ✅ Events formatted with proper UTC timestamps (EST -5 hours)

2. **Generated Sync Files**
   - ✅ `new-tbdiwsg-events.json` - Ready for Firestore import
   - ✅ `scripts/add-new-tbdiwsg-events.ps1` - Event generation script
   - ✅ `scripts/update-public-events.ps1` - Public JSON updater

## 🔄 Next Steps: Firestore Sync

The events are now in the local app data but need to be synced to Firestore for the Cloudflare Worker to serve them.

### Option 1: Manual Firebase Console (Easiest)

1. Go to [Firebase Firestore Console](https://console.firebase.google.com/project/empowrapp/firestore)
2. Navigate to `events_production` collection
3. For each event in `new-tbdiwsg-events.json`:
   - Click "Add document"
   - Set Document ID to the event's `id` field
   - Add fields from the JSON (Firestore will auto-detect types)
4. Repeat for `events_preview` collection

### Option 2: Using Firebase CLI

```powershell
# Install Firebase CLI if needed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Import events (requires converting JSON to Firestore format)
firebase firestore:import ./new-tbdiwsg-events.json
```

### Option 3: Using the App (Automatic)

The app will automatically sync events from `data/events.ts` when:
- You restart the app
- Navigate to the Events tab
- The app has write permissions to Firestore

## 🌐 Cloudflare Worker - Automated Real-Time Sync

### How It Works

The Cloudflare Worker at `https://3mpwrapp-calendar.empowrapp08162025.workers.dev` automatically:

1. **Reads from Firestore** using REST API + WebCrypto JWT authentication
2. **Caches results** in Cloudflare KV for 5 minutes (300 seconds)
3. **Deduplicates events** by title + date + location
4. **Serves via API** at `/api/events` and `/events.ics` endpoints
5. **Auto-updates** within 5 minutes when Firestore changes

### Worker Configuration

**File:** `server/worker.js`  
**Wrangler Config:** `server/wrangler.toml`  
**Deployment:** `wrangler publish` (or auto-deploy via GitHub Actions)

### API Endpoints

```bash
# Get all events (JSON)
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events"

# Filter by category
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community"

# Get calendar feed (ICS)
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics"

# Health check
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/health"
```

## 🔍 Verification Steps

### 1. Check Local Data
```powershell
# Verify events are in TypeScript data file
Get-Content data/events.ts | Select-String "evt-tbdiwsg"

# Check public JSON
Get-Content public/api/events.json | ConvertFrom-Json | Where-Object { $_.id -like "evt-tbdiwsg*" }
```

### 2. Verify Firestore (After Sync)
```bash
# Using Firebase CLI
firebase firestore:get events_production/evt-tbdiwsg-nov18-2025

# Using REST API
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://firestore.googleapis.com/v1/projects/empowrapp/databases/(default)/documents/events_production/evt-tbdiwsg-nov18-2025"
```

### 3. Verify Cloudflare Worker
```bash
# Check health
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/health"

# Get community events
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community" | jq '.events[] | select(.id | contains("tbdiwsg"))'

# Check calendar feed
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics" | grep "TBDIWSG"
```

### 4. Verify in App
1. Open 3mpwr App
2. Navigate to **Events** tab
3. Filter by **Category: Community**
4. Look for the 4 new Tuesday Information Sessions

## 🎯 Environment Variables

Ensure these are set in your `.env` file:

```bash
# Events API (Cloudflare Worker)
EXPO_PUBLIC_EVENTS_API_BASE=https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api
EXPO_PUBLIC_API_BASE=https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api

# Calendar Feed
EXPO_PUBLIC_CALENDAR_FEED_URL=https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics
```

## 📊 Sync Status Summary

| Component | Status | Location |
|-----------|--------|----------|
| Local TypeScript Data | ✅ Updated | `data/events.ts` |
| Public JSON API | ✅ Updated | `public/api/events.json` |
| Firestore Preview | ⏳ Pending Sync | `events_preview` collection |
| Firestore Production | ⏳ Pending Sync | `events_production` collection |
| Cloudflare Worker | ✅ Ready | Auto-syncs from Firestore |
| App Display | ✅ Ready | Reads from local + API |

## 🚀 Deployment Checklist

- [x] Events added to `data/events.ts`
- [x] Events added to `public/api/events.json`
- [x] Sync scripts created
- [ ] Events synced to Firestore Preview
- [ ] Events synced to Firestore Production
- [ ] Verified in Cloudflare Worker API
- [ ] Verified in app Events tab
- [ ] Calendar feed tested
- [ ] ICS subscription verified

## 📝 Notes

- **Timezone:** All dates are in UTC. Events are 10am-12pm EST (15:00-17:00 UTC)
- **Contact:** tbiwsg@gmail.com for event registration
- **Accessibility:** All events are virtual with low energy cost
- **Deduplication:** Worker automatically removes duplicates by title+date+location
- **Cache TTL:** 5 minutes - allow this time for new events to appear after Firestore sync

## 🔗 Useful Links

- **Firestore Console:** https://console.firebase.google.com/project/empowrapp/firestore
- **Cloudflare Worker Dashboard:** https://dash.cloudflare.com/
- **Worker API:** https://3mpwrapp-calendar.empowrapp08162025.workers.dev
- **Event Page:** https://thunderbayinjuredworkers.com/tuesday-events/
- **3mpwr App:** https://3mpwrapp.pages.dev

---

**Last Updated:** November 14, 2025  
**Created By:** GitHub Copilot (Claude Sonnet 4.5)
