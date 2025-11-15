# Quick Reference: TBDIWSG Events Added

## ✅ What Was Done

**4 New Events Added** to 3mpwr App:
1. Nov 18 - Open Discussion (10am-12pm EST)
2. Nov 25 - Duty to Accommodate (10am-12pm EST)
3. Dec 2 - Guest Speaker IWC (10am-12pm EST)
4. Dec 9 - 3mpwr App Demo (10am-12pm EST)

**Files Updated:**
- ✅ `data/events.ts` (local app data)
- ✅ `public/api/events.json` (38 events total)
- ✅ `new-tbdiwsg-events.json` (Firestore import ready)

## 🚀 To Complete Setup

**Sync to Firestore** (5 minutes):
1. Go to https://console.firebase.google.com/project/empowrapp/firestore
2. Open `events_production` collection
3. Add 4 documents using data from `new-tbdiwsg-events.json`
4. Repeat for `events_preview` collection

**Verify in App:**
```bash
npx expo start
# → Events tab → Filter: Community
# → Look for 4 new Tuesday sessions
```

**Test API:**
```bash
curl "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?category=community" | jq '.events[] | select(.id | contains("tbdiwsg"))'
```

## 📚 Full Documentation

- **Sync Guide:** `NEW_EVENTS_SYNC_GUIDE.md`
- **Implementation:** `EVENTS_IMPLEMENTATION_COMPLETE.md`
- **Scripts:** `scripts/add-new-tbdiwsg-events.ps1`

## 🔄 Auto-Sync Info

- **Worker:** https://3mpwrapp-calendar.empowrapp08162025.workers.dev
- **Cache:** 5 minutes (events appear within 5 min of Firestore update)
- **Deduplication:** Automatic by title + date + location
- **Real-time:** Yes, via Firestore → Worker → App

## 📞 Contact

**Event Registration:** tbiwsg@gmail.com  
**Event Page:** https://thunderbayinjuredworkers.com/tuesday-events/

---

**Status:** ✅ Ready for Firestore sync  
**Date:** November 14, 2025
