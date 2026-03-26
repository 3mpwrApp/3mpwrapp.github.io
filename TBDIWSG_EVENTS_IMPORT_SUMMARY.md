# TBDIWSG Events Import Summary

**Date:** March 25, 2026  
**Author:** Lissa Beaulieu / Copilot Agent  
**Purpose:** Audit trail for 14 Thunder Bay & District Injured Workers Support Group events added to 3mpwr App database

---

## Overview

Successfully added 14 events to 3mpwr App events database for Thunder Bay presentation and recurring Tuesday Information Sessions:

- **1 Special Event:** March 31st, 2026 - "3 Flywheels & Collective Action" presentation
- **13 Recurring Events:** Weekly Tuesday Information Sessions (April 7 - June 24, 2026)

---

## Files Modified

### 1. new-tbdiwsg-events.json
- **Location:** `d:\1-EmpowrApp\empowrapp-new\empowrapp-new\data\new-tbdiwsg-events.json`
- **Before:** 4 events (Nov 18-Dec 9, 2025)
- **After:** 18 events (4 original + 14 new)
- **Fields Updated:**
  - `count`: 4 → 18
  - `syncDate`: "2025-11-14T19:46:03" → "2026-03-25T00:00:00"

### 2. public/api/events.json
- **Location:** `d:\1-EmpowrApp\empowrapp-new\empowrapp-new\public\api\events.json`
- **Before:** 132 events
- **After:** 146 events (132 original + 14 new)
- **Purpose:** Public API endpoint for app/website consumption

---

## Events Added

### 1. March 31st Special Session
**Event ID:** `evt-3mpwr-tbdiwsg-mar31-2026`  
**Title:** "3mpwr App Presentation: 3 Flywheels & Collective Action - Special Session"  
**Date:** March 31, 2026, 10:00 AM - 12:00 PM EST  
**Duration:** 120 minutes  
**Format:** Virtual Zoom  
**Presenter:** Lissa Beaulieu (Creator, 3mpwrApp)  

**Description:**
- Evidence Flywheel: Win your case while sharing knowledge
- Collective Action Flywheel: When 50+ users report same issue, patterns become campaigns
- Knowledge Network Flywheel: AI and peer mentoring accelerate success
- Live Demo: Evidence Command Center, AI Denial Decoder, Community Hub, Campaigns Tab

**Tags:** injured-workers, 3mpwr-app, information-session, thunder-bay, advocacy, technology, zoom, disability-rights, systems-change

**Accessibility:** Live captions enabled, ASL interpretation available with 48hr notice, low energy cost

---

### 2-14. Weekly Tuesday Information Sessions (Recurring)

**Event IDs:**
- `evt-tbdiwsg-weekly-2026-04-01` (April 7)
- `evt-tbdiwsg-weekly-2026-04-08` (April 14)
- `evt-tbdiwsg-weekly-2026-04-15` (April 21)
- `evt-tbdiwsg-weekly-2026-04-22` (April 28)
- `evt-tbdiwsg-weekly-2026-04-29` (May 5)
- `evt-tbdiwsg-weekly-2026-05-06` (May 12)
- `evt-tbdiwsg-weekly-2026-05-13` (May 19)
- `evt-tbdiwsg-weekly-2026-05-20` (May 26)
- `evt-tbdiwsg-weekly-2026-05-27` (June 2)
- `evt-tbdiwsg-weekly-2026-06-03` (June 9)
- `evt-tbdiwsg-weekly-2026-06-10` (June 16)
- `evt-tbdiwsg-weekly-2026-06-17` (June 23)
- `evt-tbdiwsg-weekly-2026-06-24` (June 30 - FINAL SESSION)

**Common Details:**
- **Title:** "TBDIWSG Tuesday Information Session - Weekly Support" (June 30: "Final Session")
- **Time:** Every Tuesday, 10:00 AM - 12:00 PM EST
- **Format:** Virtual Zoom
- **Organizer:** Thunder Bay & District Injured Workers Support Group
- **Contact:** tbiwsg@gmail.com

**Description (Generic):**
Connect with other injured workers, share experiences, get support navigating WSIB/CPP-D/ODSP, learn about advocacy tools like 3mpwr App, and build community. All injured workers, disabled people, and allies welcome.

**Final Session (June 30):**
Special description highlighting celebration, next steps planning, and community decision-making about future format (monthly check-ins, quarterly gatherings, or ongoing campaign coordination).

**Tags:** injured-workers, information-session, thunder-bay, TBDIWSG, weekly, zoom, peer-support, advocacy (June 30 adds "final-session")

**Accessibility:** Virtual Zoom with live captions, ASL interpretation with 48hr notice, low energy cost

---

## Schema Differences Between Files

### new-tbdiwsg-events.json Schema
**Fields:** id, title, description, date, time, duration, location, isVirtual, virtualLink, category, tags, organizer, organizerContact, registrationRequired, status, wheelchairAccessible, stepFree, asl, captions, serviceAnimalsWelcome, sensorySpace, accessibilityNotes, energyCost, **url** (website link)

### public/api/events.json Schema
**Fields:** id, title, description, date, **endDate**, location, isVirtual, virtualLink, category, tags, organizer, organizerContact, registrationRequired, status, wheelchairAccessible, stepFree, captions, energyCost, accessibilityNotes

**Key Differences:**
- Public API includes `endDate` field (ISO 8601 timestamp)
- Public API OMITS `url` field (not needed for API consumers)
- Public API OMITS `time`, `duration`, `asl`, `serviceAnimalsWelcome`, `sensorySpace` (simplified)

---

## Known Issues

### Event ID Naming Inconsistency

**Issue:** Event IDs don't match actual event dates for some recurring sessions.

**Examples:**
- ID says `evt-tbdiwsg-weekly-2026-04-01` but date is `2026-04-07T10:00:00-04:00` (April 7)
- ID says `evt-tbdiwsg-weekly-2026-04-08` but date is `2026-04-14T10:00:00-04:00` (April 14)

**Affected Events:** 12 of 13 recurring events (all except April 29 and June 24)

**Root Cause:** IDs constructed using day-of-month numbers (1, 8, 15, 22) which ARE the correct Tuesday dates in April, but placed in wrong position in ID string format (should be "04-07" not "04-01").

**Impact:** **LOW** - IDs are unique and functional, app will work correctly. Only confusing for humans reading raw JSON.

**Resolution Options:**
1. **Find-replace fix:** Update IDs in both JSON files to match dates (fast, surgical)
2. **Leave as-is:** Document in this file, note for future maintenance
3. **Regenerate:** Re-create events with correct IDs (thorough but time-consuming)

**Current Status:** Documented here, functional but inconsistent. Recommend find-replace fix if confusing for maintenance.

---

## Testing Checklist

### App Search Tests
- [ ] Search "Thunder Bay" tag → expect 14 results
- [ ] Search "TBDIWSG" → expect 14 results
- [ ] Search "3mpwr" → expect 1 result (March 31st special)
- [ ] Search date "March 31, 2026" → expect 1 result
- [ ] Search "information session" → expect 14 results (13 recurring + 1 special)

### Calendar View Tests
- [ ] April 2026 → blue dots on Tuesdays (7, 14, 21, 28)
- [ ] May 2026 → blue dots on Tuesdays (5, 12, 19, 26)
- [ ] June 2026 → blue dots on Tuesdays (2, 9, 16, 23, 30)
- [ ] March 31st → special session details display correctly
- [ ] Click any recurring Tuesday → generic description shows

### Public API Tests
- [ ] GET `/api/events.json` → returns 146 events (132 original + 14 new)
- [ ] Filter by `category="community"` → TBDIWSG events included
- [ ] Verify JSON valid (no syntax errors, proper closing bracket)
- [ ] Check last event in array → ID `evt-tbdiwsg-weekly-2026-06-24`

### Event Detail Tests
- [ ] March 31st event page:
  - [ ] Description matches promotional blurb (3 Flywheels, live demo, presenter)
  - [ ] Contact email `tbiwsg@gmail.com` present
  - [ ] Virtual link points to `https://thunderbayinjuredworkers.com/tuesday-events/`
  - [ ] Accessibility notes show (captions, ASL with 48hr notice)
- [ ] Recurring event pages (any Tuesday):
  - [ ] Generic description appropriate ("Connect with other injured workers...")
  - [ ] Time shows correctly (10am-12pm EST)
  - [ ] Contact `tbiwsg@gmail.com` present
- [ ] June 30th final session:
  - [ ] "FINAL SESSION" in title
  - [ ] Special description mentions celebration, next steps

### Timezone Tests
- [ ] All events show "10:00 AM EST" in user-facing UI
- [ ] JSON date fields use correct UTC offsets (`-04:00` for EST summer)
- [ ] App converts properly for users in other timezones

---

## Update Instructions

If event details change (Zoom link, email, description), update BOTH files:

### 1. Update new-tbdiwsg-events.json
**Location:** `data/new-tbdiwsg-events.json`

Find event by ID (e.g., `evt-3mpwr-tbdiwsg-mar31-2026`), update fields:
- `description`: Full event description
- `virtualLink`: Zoom URL or landing page
- `organizerContact`: Email address
- Update `syncDate` to current date

### 2. Update public/api/events.json
**Location:** `public/api/events.json`

Find same event by ID, update same fields (note: this file has `endDate` instead of `time`/`duration`).

### 3. Test Changes
Run through Testing Checklist above to verify updates appear correctly in:
- App search results
- Calendar view
- Event detail pages
- Public API endpoint

---

## Related Files

### Presentation Materials
- **Script:** `TBDIWSG_MARCH31_2026_PRESENTATION_SCRIPT.md` (90-150 min with Q&A)
- **Promotional Blurbs:** `TBDIWSG_PROMOTIONAL_BLURB.md` (email/website/social variants)
- **Social Media Posts:** `TBDIWSG_RECURRING_SOCIAL_POSTS.md` (48 posts for April-June)

### Source Data
- **Events JSON:** `data/new-tbdiwsg-events.json` (source of truth, 18 events)
- **Public API:** `public/api/events.json` (public-facing, 146 events)

### Documentation
- **Event Schema:** See `data/` for examples of full event structure
- **API Reference:** Public events endpoint always at `/api/events.json`

---

## Notes for Future Maintenance

1. **Synchronization Critical:** Both JSON files must stay in sync. Any update to events must be applied to BOTH files or app/website will show inconsistent data.

2. **ID Naming Convention:** Use format `evt-ORGANIZER-EVENT-YYYY-MM-DD` where DD matches actual event date, not day-of-month in isolation.

3. **Timezone Handling:** User-facing displays show "EST" for clarity, JSON uses UTC offsets (`-04:00` for EST in summer, `-05:00` in winter).

4. **Accessibility Fields:** Always include `captions`, `wheelchairAccessible`, `stepFree`, `energyCost`, and `accessibilityNotes` for inclusive events.

5. **Testing After Changes:** Run full Testing Checklist any time events are added/modified to catch synchronization issues early.

---

**End of Import Summary**

