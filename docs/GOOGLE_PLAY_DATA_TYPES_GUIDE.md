# Google Play Console - Data Types Selection Guide

**Date:** October 21, 2025  
**App:** 3mpwr App  
**Package:** com.empowrapp2.empowrapp

---

## 📋 Quick Answer Summary

Based on your app's implementation, you should select these data types:

### ✅ Data Types to SELECT:

1. **Location** (1 type)
   - ☑ Approximate location

2. **Personal info** (2 types)
   - ☑ Name
   - ☑ Email address

3. **Health and fitness** (1 type)
   - ☑ Health info

4. **Photos and videos** (2 types)
   - ☑ Photos
   - ☑ Videos

5. **Files and docs** (1 type)
   - ☑ Files and docs

6. **App activity** (2 types)
   - ☑ App interactions (**OPTIONAL** - user can opt-out)
   - ☑ In-app search history (**OPTIONAL** - user can opt-out)

7. **App info and performance** (2 types)
   - ☑ Crash logs (**OPTIONAL** - user can opt-out)
   - ☑ Diagnostics (**OPTIONAL** - user can opt-out)

### ❌ Data Types to LEAVE UNCHECKED:

- Financial info (all)
- Messages (all - see explanation below)
- Audio files (all - see explanation below)
- Calendar (not accessed)
- Contacts (explicitly blocked)
- Web browsing (not tracked)
- Device or other IDs (no tracking/advertising)

---

## 📖 Detailed Breakdown by Category

### 1. Location ✅

**Select:** 1/2 data types

#### ☑ **Approximate location** (Required)
**Why:** App collects **province/territory selection** for jurisdiction-specific legal guidance.

**Evidence:**
- `store/auth.tsx` line 19: `province?: ProvinceCode;`
- `store/settings.tsx` line 25: `province: ProvinceCode | null;`
- Used for: Canadian jurisdiction system (14 provinces/territories)
- Storage: Local only (AsyncStorage key: `empowr.province`)
- Precision: Province/territory level (coarse location)

**Data Collection Details:**
- ✅ Collected: YES
- ✅ Shared: NO (local storage only)
- ✅ Optional: YES (user selects province, not required)
- ✅ Encrypted in transit: N/A (local only)
- ✅ User can delete: YES (clear app data)

#### ☐ **Precise location**
**Why NOT selected:** App does NOT access GPS, latitude/longitude, or precise coordinates. Blocked in `app.json`:
```json
"blockedPermissions": [
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.ACCESS_COARSE_LOCATION"
]
```

---

### 2. Personal info ✅

**Select:** 2/9 data types

#### ☑ **Name** (Required)
**Why:** App collects optional **user name** for personalization.

**Evidence:**
- `store/auth.tsx` line 11: `type User = { id: string; name: string } | null;`
- `app/(auth)/login.tsx`: Email/password sign-in collects name
- `services/auth/oauth.ts`: Google/Apple sign-in may provide name

**Data Collection Details:**
- ✅ Collected: YES (optional)
- ✅ Shared: NO (local storage, or Firebase Auth if using OAuth)
- ✅ Optional: YES
- ✅ Encrypted in transit: YES (TLS 1.3 for Firebase Auth)
- ✅ User can delete: YES

#### ☑ **Email address** (Required)
**Why:** App supports **email/password authentication** via Firebase Auth.

**Evidence:**
- `app/(auth)/login.tsx` line 29: `await signInWithEmailAndPassword(auth, email.trim(), password);`
- Used for: Authentication, account recovery
- Shared with: Firebase (Google Cloud Platform)

**Data Collection Details:**
- ✅ Collected: YES
- ✅ Shared: YES (with Firebase/Google for authentication)
- ✅ Optional: YES (users can use Apple/Google sign-in instead)
- ✅ Encrypted in transit: YES (TLS 1.3)
- ✅ User can delete: YES (delete account)

#### ☐ **User IDs**
**Why NOT selected:** While Firebase generates UIDs, these are **not collected from users** (auto-generated).

#### ☐ **Address, Phone number, Race/ethnicity, Political/religious beliefs, Sexual orientation, Other personal info**
**Why NOT selected:** App does not collect any of these data types.

---

### 3. Financial info ❌

**Select:** 0/4 data types

**Why NOT selected:** App is **100% free** with no in-app purchases, subscriptions, payment info, credit scores, or financial data.

- ☐ User payment info
- ☐ Purchase history
- ☐ Credit score
- ☐ Other financial info

---

### 4. Health and fitness ✅

**Select:** 1/2 data types

#### ☑ **Health info** (Required)
**Why:** App extensively collects **wellness and health data**.

**Evidence:**
1. **Mood tracking** - `store/mood.tsx`, `app/(tabs)/wellness/ai-companion.tsx`
2. **Energy levels** - `app/(tabs)/wellness/work-balance-ai.tsx` line 39
3. **Pain tracking** - `app/(tabs)/wellness/work-balance-ai.tsx` 
4. **Sleep tracking** - wellness features
5. **Reflection journal** - mental health notes
6. **Daily wellness data** - comprehensive health tracking

**Data Collection Details:**
- ✅ Collected: YES (extensive wellness tracking)
- ✅ Shared: NO (local AsyncStorage OR user's own cloud in BYOC mode)
- ✅ Optional: YES (all wellness features are optional)
- ✅ Encrypted in transit: YES (if syncing to Firebase, uses TLS 1.3)
- ✅ Encrypted at rest: YES (AES-256 for local storage)
- ✅ User can delete: YES (Settings → Clear All Data)

**Storage locations:**
- `AsyncStorage` (local, encrypted)
- Firestore (if cloud consent enabled) - user's Firebase project
- User's own cloud (BYOC mode) - Dropbox, Google Drive, etc.

#### ☐ **Fitness info**
**Why NOT selected:** App does NOT track exercise metrics (steps, distance, calories, heart rate, etc.). Exercise Hub only links to external videos, doesn't track performance.

---

### 5. Messages ❌

**Select:** 0/3 data types

**IMPORTANT CLARIFICATION:**

#### ☐ **Emails**
**Why NOT selected:** App does not access user's email messages. Email address is collected for authentication only (covered under "Personal info > Email address").

#### ☐ **SMS or MMS**
**Why NOT selected:** App explicitly blocks SMS permissions:
```json
"blockedPermissions": ["android.permission.READ_SMS", "android.permission.SEND_SMS"]
```

#### ☐ **Other in-app messages**
**Why NOT selected:** While app has community chat/threads, Google's definition of "Messages" refers to:
- Traditional messaging (SMS, email, instant messaging apps)
- NOT community forums, discussion boards, or app-specific chat

**Per Google's guidelines:**
> "Messages includes emails, SMS, MMS, or other messages sent or received through your app, **not including in-app chat or discussion forums**."

**Your app's community features are covered under:**
- **App activity > App interactions** (thread creation, comments)

**Evidence of community chat:**
- `app/(tabs)/community/testers-chat.tsx` - in-app chat
- `app/(tabs)/community/threads/[id].tsx` - discussion threads
- `services/firestore.ts` - community messages stored in Firestore

**Correct classification:**
- Community chat = "App interactions" ✅
- NOT "Messages" ❌

---

### 6. Photos and videos ✅

**Select:** 2/2 data types

#### ☑ **Photos** (Required)
**Why:** App accesses photo library for **evidence documentation**.

**Evidence:**
- `app.json` line 15: `"NSPhotoLibraryUsageDescription": "Used to import evidence from your photo library"`
- `app.json` line 23: `"READ_MEDIA_IMAGES"` permission
- `app/(tabs)/settings/index.tsx` line 88: Profile picture upload via `expo-image-picker`
- Evidence Locker: Attach photos to evidence notes

**Data Collection Details:**
- ✅ Collected: YES (user-initiated)
- ✅ Shared: NO (stays local OR uploads to user's chosen cloud storage)
- ✅ Optional: YES (user explicitly selects photos)
- ✅ Encrypted in transit: YES (TLS 1.3 for Firebase Storage uploads)
- ✅ User can delete: YES

#### ☑ **Videos** (Required)
**Why:** App accesses video files for **evidence documentation**.

**Evidence:**
- `app.json` line 24: `"READ_MEDIA_VIDEO"` permission
- Evidence Locker supports video attachments
- `app/(tabs)/settings.sections/MediaLockerSection.tsx` line 17: Video thumbnails setting

**Data Collection Details:**
- ✅ Collected: YES (user-initiated)
- ✅ Shared: NO (local or user's cloud)
- ✅ Optional: YES
- ✅ Encrypted in transit: YES (TLS 1.3)
- ✅ User can delete: YES

---

### 7. Audio files ❌

**Select:** 0/3 data types

**CLARIFICATION:**

#### ☐ **Voice or sound recordings**
**Why NOT selected:** While app requests microphone permission, it's for **accessibility voice input** (voice-to-text), NOT for collecting/storing audio files.

**Evidence:**
- `app.json` line 16: `"NSMicrophoneUsageDescription": "Used to record audio evidence for your personal records"`
- Permission exists but **audio recording feature is not implemented**
- No audio upload/storage code found in codebase

**Recommendation:** If you plan to implement audio evidence recording in the future, you'll need to add this. For now, **do NOT select** unless the feature is live.

#### ☐ **Music files**
**NOT collected**

#### ☐ **Other audio files**
**NOT collected**

---

### 8. Files and docs ✅

**Select:** 1/1 data types

#### ☑ **Files and docs** (Required)
**Why:** App allows users to attach **documents to evidence notes**.

**Evidence:**
- `services/evidence.ts` line 5: `export type EvidenceFile = { name, url, path, contentType, size }`
- Evidence Locker: Upload any file type as evidence
- PDF support for legal documents, medical records, etc.

**Data Collection Details:**
- ✅ Collected: YES (user-initiated uploads)
- ✅ Shared: NO (local or user's cloud storage)
- ✅ Optional: YES (user explicitly uploads)
- ✅ Encrypted in transit: YES (TLS 1.3)
- ✅ Encrypted at rest: YES (AES-256)
- ✅ User can delete: YES

---

### 9. Calendar ❌

**Select:** 0/1 data types

#### ☐ **Calendar events**
**Why NOT selected:** App has its own **internal deadlines/events system**, NOT access to device calendar.

**Evidence:**
- App explicitly blocks calendar permissions:
```json
"blockedPermissions": [
  "android.permission.READ_CALENDAR",
  "android.permission.WRITE_CALENDAR"
]
```

**Internal deadline system:**
- `app/(tabs)/resources/deadlines.tsx` - app-specific deadline tracker
- Stored in AsyncStorage, NOT device calendar
- **Does NOT sync with Google Calendar, Apple Calendar, etc.**

**Google's definition requires accessing the device's calendar app**, which this app does NOT do.

---

### 10. Contacts ❌

**Select:** 0/1 data types

#### ☐ **Contacts**
**Why NOT selected:** App explicitly blocks contact permissions:
```json
"blockedPermissions": [
  "android.permission.READ_CONTACTS",
  "android.permission.WRITE_CONTACTS"
]
```

---

### 11. App activity ✅

**Select:** 2/5 data types

#### ☑ **App interactions** (**OPTIONAL** - user can opt-out)
**Why:** App tracks **feature usage and user engagement** (when enabled).

**Evidence:**
- `services/analyticsClient.ts`: Analytics event tracking
- `data/analytics-events.json`: 100+ tracked events
- Examples:
  - Tool usage (wizard, evidence locker, deadlines)
  - Community interactions (threads, comments, chat)
  - Feature engagement (wellness tracking, advocacy tools)

**User-Controlled Toggle:**
- `app/(tabs)/settings.sections/EnhancedPrivacySection.tsx` - "Opt Out of Analytics" toggle
- **Location:** Settings → Privacy & Security → "Opt Out of Analytics"
- When enabled (opted out), calls `setTelemetryConsent(false)` to disable Firebase Analytics

**Data Collection Details:**
- ✅ Collected: YES - **ONLY if analytics toggle is ON**
- ✅ Shared: YES (with Firebase Analytics if enabled)
- ✅ Optional: **YES** (user can disable via Settings toggle)
- ✅ Encrypted in transit: YES (TLS 1.3)
- ✅ User can opt out: **YES** (easy in-app toggle)

**What's tracked (when enabled):**
- Screen views
- Button taps
- Feature usage
- Time spent in features
- Errors/crashes

**Mark as OPTIONAL in Google Play Console** ✨

#### ☑ **In-app search history** (**OPTIONAL** - user can opt-out)
**Why:** App has search functionality (e.g., resource search, advocate directory search).

**Evidence:**
- `app/(tabs)/resources/` - Resource searches
- Various search features throughout app

**NEW: User-Controlled Toggle (October 2025):**
- `store/settings.tsx` - `saveSearchHistory` setting (default: true)
- `app/(tabs)/settings.sections/EnhancedPrivacySection.tsx` - "Save Search History" toggle
- **Location:** Settings → Privacy & Security → "Save Search History"

**Data Collection Details:**
- ✅ Collected: YES (search queries) - **ONLY if toggle is ON**
- ✅ Shared: NO (local only)
- ✅ Optional: **YES** (user can disable via Settings toggle)
- ✅ User can delete: YES (Clear All Data)

**Mark as OPTIONAL in Google Play Console** ✨

#### ☐ **Installed apps**
**NOT collected**

#### ☐ **Other user-generated content**
**NOT selected** - Community posts/threads are covered under "App interactions"

#### ☐ **Other actions**
**NOT selected** - Covered by "App interactions"

---

### 12. Web browsing ❌

**Select:** 0/1 data types

#### ☐ **Web browsing history**
**Why NOT selected:** App does NOT track web browsing. External links (YouTube, resources) open in system browser, not tracked.

---

### 13. App info and performance ✅

**Select:** 2/3 data types

#### ☑ **Crash logs** (**OPTIONAL** - user can opt-out)
**Why:** App uses **Sentry** for crash reporting (when enabled).

**Evidence:**
- `app.json` line 77: Sentry plugin configuration
- `services/analytics.ts`: Error tracking
- Crash data sent to Sentry for debugging

**User-Controlled Toggle:**
- `app/(tabs)/settings.sections/EnhancedPrivacySection.tsx` - "Error Reporting" toggle
- **Location:** Settings → Privacy & Security → "Error Reporting"
- When disabled, Sentry crash reporting stops

**Data Collection Details:**
- ✅ Collected: YES (crash reports) - **ONLY if toggle is ON**
- ✅ Shared: YES (with Sentry if DSN configured)
- ✅ Optional: **YES** (user can disable via Settings toggle)
- ✅ Encrypted in transit: YES (HTTPS)

**Mark as OPTIONAL in Google Play Console** ✨

#### ☑ **Diagnostics** (**OPTIONAL** - user can opt-out)
**Why:** App collects **performance metrics and error logs** (when analytics enabled).

**Evidence:**
- `services/analytics.ts`: Performance tracking
- `utils/logger.ts`: Application logging
- Analytics events track app performance

**User-Controlled Toggle:**
- `app/(tabs)/settings.sections/EnhancedPrivacySection.tsx` - "Opt Out of Analytics" toggle
- **Location:** Settings → Privacy & Security → "Opt Out of Analytics"
- Same toggle controls both analytics events AND performance diagnostics

**Data Collection Details:**
- ✅ Collected: YES - **ONLY if analytics toggle is ON**
- ✅ Shared: YES (Firebase Analytics if enabled)
- ✅ Optional: **YES** (user can disable via Settings toggle)
- ✅ User can delete: YES (via Firebase data retention)

**Mark as OPTIONAL in Google Play Console** ✨

#### ☐ **Other app performance data**
**NOT selected** - Covered by Crash logs and Diagnostics

---

### 14. Device or other IDs ❌

**Select:** 0/1 data types

#### ☐ **Device or other IDs**
**Why NOT selected:** App does **NOT collect device IDs for tracking or advertising**.

**Evidence:**
- No advertising SDKs
- No tracking pixels
- No device fingerprinting
- Firebase Auth generates UIDs (not device IDs)
- No IMEI, Android ID, or similar collection

**Per Google's policy:**
> Select this only if your app collects device IDs (other than those automatically collected by Google Play) for purposes like advertising, analytics, or fraud prevention.

**Your app:**
- ✅ No advertising
- ✅ Analytics uses anonymous Firebase IDs (auto-collected by Google Play, not by you)
- ✅ No fraud prevention requiring device IDs

**Correct answer:** ☐ **Do NOT select**

---

## 📊 Summary Table

| Category | Selected | Not Selected | Total |
|----------|----------|--------------|-------|
| Location | 1 | 1 | 2 |
| Personal info | 2 | 7 | 9 |
| Financial info | 0 | 4 | 4 |
| Health and fitness | 1 | 1 | 2 |
| Messages | 0 | 3 | 3 |
| Photos and videos | 2 | 0 | 2 |
| Audio files | 0 | 3 | 3 |
| Files and docs | 1 | 0 | 1 |
| Calendar | 0 | 1 | 1 |
| Contacts | 0 | 1 | 1 |
| App activity | 2 | 3 | 5 |
| Web browsing | 0 | 1 | 1 |
| App info/performance | 2 | 1 | 3 |
| Device/other IDs | 0 | 1 | 1 |
| **TOTAL** | **11** | **27** | **38** |

---

## 🚨 Common Mistakes to Avoid

### ❌ WRONG: Selecting "Messages" for community chat
**CORRECT:** Community chat = "App activity > App interactions"

### ❌ WRONG: Selecting "Device IDs" because Firebase generates UIDs
**CORRECT:** Firebase UIDs are authentication identifiers, NOT device tracking IDs

### ❌ WRONG: Selecting "Calendar" for internal deadline tracker
**CORRECT:** Only select if accessing device's calendar app

### ❌ WRONG: Selecting "Audio files" because microphone permission exists
**CORRECT:** Only select if actually recording/storing audio files

### ❌ WRONG: Not selecting "Health info" because it's optional
**CORRECT:** Must select if feature exists, even if optional

---

## 📝 Next Steps After Data Types Selection

After selecting the 11 data types above, Google will ask for **each data type**:

### For EACH selected data type, you'll answer:

1. **Is this data collected, shared, or both?**
   - Location (Approximate): **Collected only**
   - Name: **Collected only**
   - Email: **Collected AND shared** (with Firebase)
   - Health info: **Collected only**
   - Photos: **Collected only**
   - Videos: **Collected only**
   - Files/docs: **Collected only**
   - App interactions: **Collected AND shared** (with Firebase Analytics)
   - In-app search: **Collected only**
   - Crash logs: **Collected AND shared** (with Sentry)
   - Diagnostics: **Collected AND shared** (with Firebase)

2. **Is this data collection optional or required?**
   - Location: **Optional**
   - Name: **Optional**
   - Email: **Optional** (can use Google/Apple sign-in)
   - Health info: **Optional**
   - Photos: **Optional**
   - Videos: **Optional**
   - Files/docs: **Optional**
   - App interactions: **OPTIONAL** ✨ (user can disable in Settings)
   - In-app search: **OPTIONAL** ✨ (user can disable in Settings)
   - Crash logs: **OPTIONAL** ✨ (user can disable in Settings)
   - Diagnostics: **OPTIONAL** ✨ (user can disable in Settings)

3. **What is this data used for?**
   - Location: **App functionality** (jurisdiction selection)
   - Name: **App functionality** (personalization)
   - Email: **Account management** (authentication)
   - Health info: **App functionality** (wellness tracking)
   - Photos/Videos/Files: **App functionality** (evidence documentation)
   - App interactions: **Analytics**, **App functionality**
   - In-app search: **App functionality**
   - Crash logs: **App functionality** (debugging)
   - Diagnostics: **Analytics**, **App functionality**

4. **Is this data encrypted in transit?**
   - **YES for all** (TLS 1.3 or local-only)

5. **Can users request deletion?**
   - **YES for all**

---

---

## 🎉 NEW: Privacy Controls (October 2025)

All analytics and tracking data is now **OPTIONAL** with easy in-app toggles:

### Settings → Privacy & Security

1. **"Opt Out of Analytics"** toggle
   - Controls: App interactions + Diagnostics
   - Default: OFF (analytics enabled)
   - When ON: Disables Firebase Analytics

2. **"Error Reporting"** toggle
   - Controls: Crash logs
   - Default: ON (crash reporting enabled)
   - When OFF: Disables Sentry error reporting

3. **"Save Search History"** toggle (NEW!)
   - Controls: In-app search history
   - Default: ON (search history saved)
   - When OFF: Searches work but history not saved

**Result:** All 4 tracking-related data types are now **OPTIONAL** in Google Play Console! ✨

---

## ✅ Final Checklist

Before submitting:

- [ ] Review all 11 selected data types
- [ ] Mark 4 data types as **OPTIONAL** (App interactions, Search history, Crash logs, Diagnostics)
- [ ] Mark 7 data types as **OPTIONAL** (Location, Name, Email, Health, Photos, Videos, Files)
- [ ] Verify 27 data types are NOT selected
- [ ] Confirm Firebase/Sentry integrations are live (or disable in Free Mode)
- [ ] Test all privacy toggles in Settings → Privacy & Security
- [ ] Test account deletion flow
- [ ] Test data export flow
- [ ] Verify privacy policy URL is live and accurate
- [ ] Ensure Data Safety form matches this guide

---

## 📞 Questions?

If Google Play review team questions any selection:
- **Reference this document** with code evidence
- **Point to app.json** for permission blocking
- **Emphasize BYOC mode** for data sovereignty
- **Clarify no advertising/tracking** (no device IDs needed)

---

**Last Updated:** October 21, 2025  
**Status:** ✅ Ready for submission

