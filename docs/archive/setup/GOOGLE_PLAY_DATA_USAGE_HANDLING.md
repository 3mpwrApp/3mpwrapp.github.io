# Google Play Console - Data Usage and Handling (Detailed Answers)

**Date:** October 21, 2025  
**App:** 3mpwr App  
**Package:** com.empowrapp2.empowrapp

---

## 📋 Overview

You need to complete **11 data types** across 7 categories. For each data type, you'll answer 5-7 questions about how the data is collected, used, and handled.

---

## 1️⃣ LOCATION

### Approximate location

#### **Q1: Is this data collected, shared, or both?**
```
☑ Collected
☐ Shared
```

**Explanation:** Province/territory data is stored locally (AsyncStorage) or in user's own cloud (BYOC mode). NOT shared with third parties.

---

#### **Q2: Is this data processed ephemerally?**
```
☐ Yes
```

**Explanation:** Province selection is persisted in local storage (`empowr.province` key), not processed ephemerally.

**What is ephemeral processing?**
> Data processed only in memory and not persisted (e.g., temporary calculations). Your app saves province selection permanently.

---

#### **Q3: Is this data required for your app, or can users choose whether it's collected?**
```
☐ Data collection is required
☑ Users can choose whether this data is collected
```

**Explanation:** Province selection is **optional**. Users can skip or change it anytime via Settings or Jurisdiction Panel.

**Evidence:**
- `components/JurisdictionPanel.tsx` - optional selection
- App functions without province selection (shows generic legal info)

---

#### **Q4: Why is this user data collected? Select all that apply**
```
☑ App functionality
☐ Analytics
☐ Developer communications
☐ Advertising or marketing
☐ Fraud prevention, security, and compliance
☐ Personalization
☐ Account management
```

**Explanation:** Province data is used ONLY for providing jurisdiction-specific legal guidance (appeal deadlines, WCB rules, forms).

**Evidence:**
- `data/jurisdictions/*.json` - 14 Canadian jurisdictions
- `components/JurisdictionDeadlineCalculator.tsx` - deadline calculations
- `components/JurisdictionFormHelper.tsx` - province-specific forms

---

#### **Q5: Is this data shared with third parties?**
```
☐ Yes, this data is shared
☑ No, this data is not shared
```

**Explanation:** Province data stays on device (AsyncStorage) or user's chosen cloud storage. Never sent to app developer or third parties.

---

#### **Q6: Is this data encrypted in transit?**
```
☑ Yes
```

**Explanation:** 
- If stored locally: Not transmitted (N/A)
- If synced to Firebase (non-BYOC): TLS 1.3 encryption
- If synced to user's cloud (BYOC): HTTPS/TLS to their chosen provider

**Evidence:**
- `firebase/config.ts` - TLS 1.3 for Firebase connections
- `README.md` - "TLS 1.3 Network Security"

---

#### **Q7: Can users request that this data is deleted?**
```
☑ Yes
```

**Explanation:** Users can:
1. Delete via Settings → Privacy & Security → Clear All Data
2. Delete via Settings → Account → Delete Account (removes all data)
3. Change province selection anytime (overwrites previous)

---

## 2️⃣ PERSONAL INFO

### Name

#### **Q1: Is this data collected, shared, or both?**
```
☑ Collected
☐ Shared
```

**Explanation:** User name is stored locally or in Firebase Auth. Not shared with third parties beyond authentication provider (Google/Apple if using OAuth).

---

#### **Q2: Is this data processed ephemerally?**
```
☐ Yes
```

**Explanation:** Name is persisted in `AsyncStorage` (key: `empowr.user`) and potentially in Firebase Auth profile.

---

#### **Q3: Is this data required for your app, or can users choose whether it's collected?**
```
☐ Data collection is required
☑ Users can choose whether this data is collected
```

**Explanation:** Users can:
- Sign in with email/password (provides name)
- Sign in with Google/Apple (name auto-provided)
- Continue as guest (no name required)

**Evidence:**
- `app/(auth)/login.tsx` - guest mode available
- `store/auth.tsx` - supports anonymous mode

---

#### **Q4: Why is this user data collected?**
```
☑ App functionality
☐ Analytics
☐ Developer communications
☐ Advertising or marketing
☐ Fraud prevention, security, and compliance
☑ Personalization
☑ Account management
```

**Explanation:**
- **App functionality:** Display user's name in UI
- **Personalization:** Greet user by name, personalize experience
- **Account management:** Identify account owner, profile management

**NOT for:**
- Analytics (name is not sent to analytics)
- Marketing (no marketing communications)
- Advertising (no ads)

---

#### **Q5: Is this data shared with third parties?**
```
☐ Yes, this data is shared
☑ No, this data is not shared
```

**Explanation:** Name stays within app or Firebase Auth (which is your own Firebase project, not a "third party" per Google's definition).

**Note:** If users sign in with Google/Apple OAuth, their name comes FROM those providers but is not shared TO them (they already have it).

---

#### **Q6: Is this data encrypted in transit?**
```
☑ Yes
```

**Evidence:**
- Local storage: Not transmitted
- Firebase Auth: TLS 1.3
- OAuth providers: HTTPS/TLS

---

#### **Q7: Can users request that this data is deleted?**
```
☑ Yes
```

**Explanation:**
- Delete account (Settings → Account → Delete Account)
- Clear all data (Settings → Privacy → Clear All Data)

---

### Email address

#### **Q1: Is this data collected, shared, or both?**
```
☑ Collected
☑ Shared
```

**Explanation:**
- **Collected:** For email/password authentication
- **Shared:** With Firebase (Google Cloud Platform) for authentication services

**Important:** Firebase is considered a "service provider" not a "third party" if you own the Firebase project.

**HOWEVER**, if you want to be conservative and transparent, select "Shared" and explain it's shared with Firebase/Google Cloud for authentication only.

---

#### **Q2: Is this data processed ephemerally?**
```
☐ Yes
```

**Explanation:** Email is persisted in Firebase Auth.

---

#### **Q3: Is this data required for your app, or can users choose whether it's collected?**
```
☐ Data collection is required
☑ Users can choose whether this data is collected
```

**Explanation:** Email is only required if user chooses email/password sign-in. Alternatives:
- Google Sign-In (OAuth, uses Google email)
- Apple Sign-In (OAuth, can hide email)
- Guest mode (no email required)

---

#### **Q4: Why is this user data collected?**
```
☐ App functionality
☐ Analytics
☐ Developer communications
☐ Advertising or marketing
☐ Fraud prevention, security, and compliance
☐ Personalization
☑ Account management
```

**Explanation:** Email is used ONLY for:
- Creating and managing user accounts
- Password reset/recovery
- Authentication

**NOT for:**
- Sending promotional emails (no marketing)
- Analytics (email not included in analytics events)
- App functionality beyond account management

---

#### **Q5: Is this data shared with third parties?**
```
☑ Yes, this data is shared with third parties
```

**If YES, select all that apply:**
```
☐ Data is shared for app functionality
☑ Data is shared for account management
☐ Data is shared for analytics
☐ Data is shared for developer communications
☐ Data is shared for advertising or marketing
☐ Data is shared for fraud prevention, security, and compliance
☐ Data is shared for personalization
☐ Data is shared for legal obligations
```

**Explanation:** Email is shared with **Firebase Authentication** (Google Cloud Platform) for account management purposes only.

**Third parties you share data with:**
- **Google LLC** (Firebase Authentication service provider)

---

#### **Q6: Is this data encrypted in transit?**
```
☑ Yes
```

**Evidence:** Firebase Auth uses TLS 1.3 for all authentication requests.

---

#### **Q7: Can users request that this data is deleted?**
```
☑ Yes
```

**Explanation:** 
- Delete account via Settings → Account → Delete Account
- Email is permanently deleted from Firebase Auth
- Retention: Immediate deletion (no backup retention)

---

## 3️⃣ HEALTH AND FITNESS

### Health info

#### **Q1: Is this data collected, shared, or both?**
```
☑ Collected
☐ Shared
```

**Explanation:** Wellness data (mood, energy, pain, sleep, reflections) is stored locally or in user's own cloud (BYOC). NOT shared with third parties.

---

#### **Q2: Is this data processed ephemerally?**
```
☐ Yes
```

**Explanation:** Wellness data is persisted for tracking trends, historical analysis, and weekly summaries.

**Storage:**
- `AsyncStorage` (local)
- Firestore (if cloud consent enabled - your Firebase project)
- User's cloud (BYOC mode - Dropbox, Google Drive, etc.)

---

#### **Q3: Is this data required for your app, or can users choose whether it's collected?**
```
☐ Data collection is required
☑ Users can choose whether this data is collected
```

**Explanation:** ALL wellness features are optional:
- Users can skip wellness tab entirely
- Each feature (mood, energy, reflections) is opt-in
- App functions fully without wellness data

---

#### **Q4: Why is this user data collected?**
```
☑ App functionality
☑ Analytics
☐ Developer communications
☐ Advertising or marketing
☐ Fraud prevention, security, and compliance
☑ Personalization
☐ Account management
```

**Explanation:**
- **App functionality:** Track wellness trends, generate weekly reports, energy predictions
- **Analytics:** Aggregate (anonymized) usage of wellness features to improve them
- **Personalization:** ML-driven energy forecasting, personalized wellness recommendations

**Evidence:**
- `services/weeklySummary.ts` - wellness analytics
- `store/mood.tsx` - mood tracking storage
- `app/(tabs)/wellness/*` - various wellness features

**NOT for:**
- Marketing (no promotional use of health data)
- Account management (wellness data not tied to account)

---

#### **Q5: Is this data shared with third parties?**
```
☐ Yes, this data is shared
☑ No, this data is not shared
```

**Explanation:** 
- Local storage: Never transmitted
- Firebase (if used): Your own project, not a third party
- BYOC mode: User's own cloud storage (they control it)

**Important:** Wellness data NEVER leaves user's control. Not sent to app developer, analytics services, or any third party.

---

#### **Q6: Is this data encrypted in transit?**
```
☑ Yes
```

**Explanation:**
- Local storage: Not transmitted (N/A)
- Firebase sync: TLS 1.3
- BYOC sync: HTTPS/TLS to user's chosen cloud

**At rest encryption:**
- AES-256 for local storage (per README.md)

**Evidence:**
- `SECURITY_COMPLETE.md` - "AES-256 Encryption for all sensitive data"

---

#### **Q7: Can users request that this data is deleted?**
```
☑ Yes
```

**Explanation:**
- Delete all wellness data via Settings → Privacy → Clear All Data
- Delete specific reflections via Wellness tab
- Delete account (removes all data including wellness)

**Retention:** Immediate deletion, no backup retention.

---

## 4️⃣ PHOTOS AND VIDEOS

### Photos

#### **Q1: Is this data collected, shared, or both?**
```
☑ Collected
☐ Shared
```

**Explanation:** Photos are uploaded for evidence documentation or profile pictures. Stored locally or in user's cloud. NOT shared with third parties.

---

#### **Q2: Is this data processed ephemerally?**
```
☐ Yes
```

**Explanation:** Photos are persisted as evidence attachments or profile pictures.

---

#### **Q3: Is this data required for your app, or can users choose whether it's collected?**
```
☐ Data collection is required
☑ Users can choose whether this data is collected
```

**Explanation:** 
- Photos are ONLY collected when user explicitly:
  - Selects "Add Photo" in Evidence Locker
  - Uploads profile picture in Settings
- User initiates all photo collection
- App functions fully without photos

---

#### **Q4: Why is this user data collected?**
```
☑ App functionality
☐ Analytics
☐ Developer communications
☐ Advertising or marketing
☐ Fraud prevention, security, and compliance
☑ Personalization
☐ Account management
```

**Explanation:**
- **App functionality:** Evidence documentation (workplace injuries, accessibility barriers, medical records)
- **Personalization:** Profile picture display

**Evidence:**
- `app.json` line 15: `"NSPhotoLibraryUsageDescription": "Used to import evidence from your photo library"`
- `services/evidence.ts` - photo upload for evidence
- `app/(tabs)/settings/index.tsx` - profile picture upload

---

#### **Q5: Is this data shared with third parties?**
```
☐ Yes, this data is shared
☑ No, this data is not shared
```

**Explanation:**
- Local storage: Never transmitted
- Firebase Storage (if used): Your own project
- BYOC mode: User's own cloud (Google Drive, Dropbox, etc.)

**Photos stay under user's control.** Not sent to app developer or third parties.

---

#### **Q6: Is this data encrypted in transit?**
```
☑ Yes
```

**Explanation:**
- Firebase Storage uploads: TLS 1.3
- BYOC uploads: HTTPS/TLS to user's cloud
- Local storage: Not transmitted

**Evidence:**
- `services/evidence.ts` line 32: `uploadBytes()` uses Firebase Storage with TLS

---

#### **Q7: Can users request that this data is deleted?**
```
☑ Yes
```

**Explanation:**
- Delete individual evidence photos via Evidence Locker
- Delete all photos via Settings → Privacy → Clear All Data
- Delete account (removes all photos)

---

### Videos

#### **Q1: Is this data collected, shared, or both?**
```
☑ Collected
☐ Shared
```

**Same as Photos** - videos are for evidence documentation, stored locally or in user's cloud.

---

#### **Q2: Is this data processed ephemerally?**
```
☐ Yes
```

**Same as Photos** - videos are persisted.

---

#### **Q3: Is this data required for your app, or can users choose whether it's collected?**
```
☐ Data collection is required
☑ Users can choose whether this data is collected
```

**Same as Photos** - user-initiated only.

---

#### **Q4: Why is this user data collected?**
```
☑ App functionality
☐ Analytics
☐ Developer communications
☐ Advertising or marketing
☐ Fraud prevention, security, and compliance
☐ Personalization
☐ Account management
```

**Explanation:**
- **App functionality:** Video evidence documentation (workplace incidents, accessibility barriers)

**Evidence:**
- `app.json` line 24: `"READ_MEDIA_VIDEO"` permission
- Evidence Locker supports video attachments

---

#### **Q5: Is this data shared with third parties?**
```
☐ Yes, this data is shared
☑ No, this data is not shared
```

**Same as Photos** - user's control only.

---

#### **Q6: Is this data encrypted in transit?**
```
☑ Yes
```

**Same as Photos** - TLS 1.3 for uploads.

---

#### **Q7: Can users request that this data is deleted?**
```
☑ Yes
```

**Same as Photos** - deletable via Evidence Locker or Clear All Data.

---

## 5️⃣ FILES AND DOCS

### Files and docs

#### **Q1: Is this data collected, shared, or both?**
```
☑ Collected
☐ Shared
```

**Explanation:** Documents (PDFs, medical records, legal forms) uploaded as evidence. Stored locally or in user's cloud.

---

#### **Q2: Is this data processed ephemerally?**
```
☐ Yes
```

**Explanation:** Files are persisted as evidence attachments.

---

#### **Q3: Is this data required for your app, or can users choose whether it's collected?**
```
☐ Data collection is required
☑ Users can choose whether this data is collected
```

**Explanation:** User explicitly uploads files via Evidence Locker. Optional feature.

---

#### **Q4: Why is this user data collected?**
```
☑ App functionality
☐ Analytics
☐ Developer communications
☐ Advertising or marketing
☐ Fraud prevention, security, and compliance
☐ Personalization
☐ Account management
```

**Explanation:**
- **App functionality:** Evidence documentation for disability appeals, workplace accommodation requests, legal proceedings

**Evidence:**
- `services/evidence.ts` - `EvidenceFile` type supports any file type
- PDF support for legal documents

---

#### **Q5: Is this data shared with third parties?**
```
☐ Yes, this data is shared
☑ No, this data is not shared
```

**Explanation:** Files stay on device or user's cloud. Not shared with app developer or third parties.

---

#### **Q6: Is this data encrypted in transit?**
```
☑ Yes
```

**Explanation:** TLS 1.3 for Firebase Storage uploads, HTTPS for BYOC uploads.

---

#### **Q7: Can users request that this data is deleted?**
```
☑ Yes
```

**Explanation:** Delete via Evidence Locker or Clear All Data.

---

## 6️⃣ APP ACTIVITY

### App interactions

#### **Q1: Is this data collected, shared, or both?**
```
☑ Collected
☑ Shared
```

**Explanation:**
- **Collected:** App tracks feature usage, screen views, button taps
- **Shared:** With Firebase Analytics (if enabled) for app improvement

---

#### **Q2: Is this data processed ephemerally?**
```
☐ Yes
```

**Explanation:** Analytics events are logged and sent to Firebase Analytics for persistent analysis.

---

#### **Q3: Is this data required for your app, or can users choose whether it's collected?**
```
☐ Data collection is required (cannot be turned off by the user)
☑ Users can choose whether this data is collected
```

**Explanation:** Users can disable analytics via **Settings → Privacy & Security → "Opt Out of Analytics"** toggle.

**Evidence:**
- `app/(tabs)/settings.sections/EnhancedPrivacySection.tsx` line 113 - "Opt Out of Analytics" toggle
- `docs/COMPREHENSIVE_BETA_TESTER_GUIDE.md` - "Can I opt out of analytics? Yes!"
- When enabled, calls `setTelemetryConsent(false)` to disable Firebase Analytics

---

#### **Q4: Why is this user data collected?**
```
☑ App functionality
☑ Analytics
☐ Developer communications
☐ Advertising or marketing
☐ Fraud prevention, security, and compliance
☐ Personalization
☐ Account management
```

**Explanation:**
- **App functionality:** Track feature usage to improve UX
- **Analytics:** Understand which features are used, identify issues

**Evidence:**
- `services/analyticsClient.ts` - event tracking
- `data/analytics-events.json` - 100+ event types

**NOT for:**
- Advertising (no ads)
- Marketing (no user targeting)

---

#### **Q5: Is this data shared with third parties?**
```
☑ Yes, this data is shared with third parties
```

**If YES, select all that apply:**
```
☑ Data is shared for app functionality
☑ Data is shared for analytics
☐ Data is shared for developer communications
☐ Data is shared for advertising or marketing
☐ Data is shared for fraud prevention, security, and compliance
☐ Data is shared for personalization
☐ Data is shared for account management
☐ Data is shared for legal obligations
```

**Explanation:** Analytics events are shared with **Firebase Analytics** (Google LLC) for app improvement and usage analysis.

**Third parties:**
- **Google LLC** (Firebase Analytics)

---

#### **Q6: Is this data encrypted in transit?**
```
☑ Yes
```

**Evidence:** Firebase Analytics uses HTTPS/TLS for all data transmission.

---

#### **Q7: Can users request that this data is deleted?**
```
☑ Yes
```

**Explanation:** 
- Analytics data retention can be configured in Firebase Console
- Users can request deletion via privacy policy contact (empowrapp08162025@gmail.com)
- Delete account removes association with analytics data

---

### In-app search history

#### **Q1: Is this data collected, shared, or both?**
```
☑ Collected
☐ Shared
```

**Explanation:** Search queries (advocate directory, resources) are stored locally for autocomplete/history. NOT shared.

---

#### **Q2: Is this data processed ephemerally?**
```
☐ Yes
```

**Explanation:** Search history may be cached locally for autocomplete suggestions.

**Note:** If your search is truly ephemeral (no persistence), select "Yes."

---

#### **Q3: Is this data required for your app, or can users choose whether it's collected?**
```
☑ Data collection is required (cannot be turned off by the user)
☐ Users can choose whether this data is collected
```

**Explanation:** Search queries are automatically recorded when user searches. Part of search functionality.

---

#### **Q4: Why is this user data collected?**
```
☑ App functionality
☐ Analytics
☐ Developer communications
☐ Advertising or marketing
☐ Fraud prevention, security, and compliance
☑ Personalization
☐ Account management
```

**Explanation:**
- **App functionality:** Enable search results
- **Personalization:** Autocomplete, search history for faster access

---

#### **Q5: Is this data shared with third parties?**
```
☐ Yes, this data is shared
☑ No, this data is not shared
```

**Explanation:** Search queries stay on device. Not sent to servers or analytics.

---

#### **Q6: Is this data encrypted in transit?**
```
☑ Yes
```

**Explanation:** If synced to Firebase (unlikely for search history), uses TLS. Mostly local-only.

---

#### **Q7: Can users request that this data is deleted?**
```
☑ Yes
```

**Explanation:** Clear via Settings → Privacy → Clear All Data.

---

## 7️⃣ APP INFO AND PERFORMANCE

### Crash logs

#### **Q1: Is this data collected, shared, or both?**
```
☑ Collected
☑ Shared
```

**Explanation:**
- **Collected:** App automatically captures crash reports
- **Shared:** Sent to Sentry for debugging (if SENTRY_DSN configured)

---

#### **Q2: Is this data processed ephemerally?**
```
☐ Yes
```

**Explanation:** Crash logs are sent to Sentry and retained for debugging.

---

#### **Q3: Is this data required for your app, or can users choose whether it's collected?**
```
☐ Data collection is required (cannot be turned off by the user)
☑ Users can choose whether this data is collected
```

**Explanation:** Users can disable crash reporting via **Settings → Privacy & Security → "Error Reporting"** toggle.

**Evidence:**
- `app/(tabs)/settings.sections/EnhancedPrivacySection.tsx` line 114 - "Error Reporting" toggle
- `docs/COMPREHENSIVE_BETA_TESTER_GUIDE.md` - "Can I opt out? Yes! Disable Crash Reporting"
- When disabled, Sentry error reporting stops

---

#### **Q4: Why is this user data collected?**
```
☑ App functionality
☐ Analytics
☐ Developer communications
☐ Advertising or marketing
☐ Fraud prevention, security, and compliance
☐ Personalization
☐ Account management
```

**Explanation:**
- **App functionality:** Identify and fix crashes to improve stability

**Evidence:**
- `app.json` line 77: Sentry plugin

---

#### **Q5: Is this data shared with third parties?**
```
☑ Yes, this data is shared with third parties
```

**If YES, select all that apply:**
```
☑ Data is shared for app functionality
☐ Data is shared for analytics
☐ Data is shared for developer communications
☐ Data is shared for advertising or marketing
☐ Data is shared for fraud prevention, security, and compliance
☐ Data is shared for personalization
☐ Data is shared for account management
☐ Data is shared for legal obligations
```

**Explanation:** Crash logs are shared with **Sentry** for error monitoring and debugging.

**Third parties:**
- **Functional Software, Inc.** (Sentry)

---

#### **Q6: Is this data encrypted in transit?**
```
☑ Yes
```

**Evidence:** Sentry uses HTTPS/TLS for all crash report submissions.

---

#### **Q7: Can users request that this data is deleted?**
```
☑ Yes
```

**Explanation:** 
- Contact developer to request Sentry data deletion
- Crash logs do NOT contain personally identifiable information (anonymized)

---

### Diagnostics

#### **Q1: Is this data collected, shared, or both?**
```
☑ Collected
☑ Shared
```

**Explanation:**
- **Collected:** Performance metrics, error logs
- **Shared:** With Firebase Analytics (if enabled)

---

#### **Q2: Is this data processed ephemerally?**
```
☐ Yes
```

**Explanation:** Diagnostics data is sent to Firebase Analytics for retention.

---

#### **Q3: Is this data required for your app, or can users choose whether it's collected?**
```
☐ Data collection is required (cannot be turned off by the user)
☑ Users can choose whether this data is collected
```

**Explanation:** Users can disable diagnostics via **Settings → Privacy & Security → "Opt Out of Analytics"** toggle (same as App Interactions).

**Evidence:**
- Same toggle controls both analytics events and performance diagnostics
- Firebase Analytics includes performance monitoring data

---

#### **Q4: Why is this user data collected?**
```
☑ App functionality
☑ Analytics
☐ Developer communications
☐ Advertising or marketing
☐ Fraud prevention, security, and compliance
☐ Personalization
☐ Account management
```

**Explanation:**
- **App functionality:** Monitor app performance, identify bottlenecks
- **Analytics:** Understand app health, error rates

---

#### **Q5: Is this data shared with third parties?**
```
☑ Yes, this data is shared with third parties
```

**If YES, select all that apply:**
```
☑ Data is shared for app functionality
☑ Data is shared for analytics
☐ Data is shared for developer communications
☐ Data is shared for advertising or marketing
☐ Data is shared for fraud prevention, security, and compliance
☐ Data is shared for personalization
☐ Data is shared for account management
☐ Data is shared for legal obligations
```

**Explanation:** Shared with **Firebase Analytics** (Google LLC).

**Third parties:**
- **Google LLC** (Firebase Analytics)

---

#### **Q6: Is this data encrypted in transit?**
```
☑ Yes
```

**Evidence:** Firebase Analytics uses HTTPS/TLS.

---

#### **Q7: Can users request that this data is deleted?**
```
☑ Yes
```

**Explanation:** Same as App Interactions - Firebase data retention settings, contact developer.

---

## 📊 Quick Reference Table

| Data Type | Collected | Shared | Required | Main Purpose | Third Parties |
|-----------|-----------|--------|----------|--------------|---------------|
| Approximate location | ✅ | ❌ | Optional | App functionality | None |
| Name | ✅ | ❌ | Optional | Personalization, Account mgmt | None |
| Email | ✅ | ✅ | Optional | Account management | Firebase/Google |
| Health info | ✅ | ❌ | Optional | App functionality | None |
| Photos | ✅ | ❌ | Optional | App functionality | None |
| Videos | ✅ | ❌ | Optional | App functionality | None |
| Files/docs | ✅ | ❌ | Optional | App functionality | None |
| App interactions | ✅ | ✅ | **Optional** | Analytics | Firebase/Google |
| Search history | ✅ | ❌ | **Optional** | App functionality | None |
| Crash logs | ✅ | ✅ | **Optional** | App functionality | Sentry |
| Diagnostics | ✅ | ✅ | **Optional** | Analytics | Firebase/Google |

---

## 🚨 Important Notes

### Third-Party Service Providers

When selecting "shared with third parties," Google will ask you to name them:

**Firebase/Google LLC** (for: Email, App interactions, Diagnostics)
- **Privacy Policy:** https://policies.google.com/privacy
- **Purpose:** Authentication, Analytics, Cloud Storage

**Functional Software, Inc. (Sentry)** (for: Crash logs)
- **Privacy Policy:** https://sentry.io/privacy/
- **Purpose:** Error monitoring, crash reporting

---

### Service Providers (Who Receives What)

- **Firebase / Google LLC**
  - Purpose: Authentication (Firebase Auth), Analytics (Firebase Analytics), optional Cloud Storage (Firestore/Storage)
  - Data: Email (Auth), App interactions & diagnostics (Analytics), crash/diagnostic metadata (if enabled)
  - Control: Users can opt out of analytics; BYOC mode bypasses Firebase entirely

- **Functional Software, Inc. (Sentry)**
  - Purpose: Crash reporting and error monitoring
  - Data: Crash logs, stack traces, device model, app version (no PII by default)
  - Control: Error reporting can be toggled off in Settings

- **Expo Notifications / Push Providers**
  - Purpose: Deliver push notifications (tokens only)
  - Data: Push token, notification metadata
  - Control: Users can disable notifications in Settings

### Encryption Summary

- **In transit:** YES — ALL user data transmitted by the app is encrypted using HTTPS/TLS (TLS 1.3 where supported).
- **At rest:** YES — Sensitive data stored locally or in our cloud is protected with AES-256 encryption (when stored by the app or when synced to our infrastructure).

---

### Data Retention

Google may ask about retention periods:

- **Location, Health, Photos, Videos, Files:** Retained until user deletes (indefinite)
- **Name, Email:** Retained until account deletion
- **Analytics data:** Per Firebase retention settings (default 14 months, configurable)
- **Crash logs:** Per Sentry retention (typically 90 days, configurable)

---

### BYOC Mode Clarification

If asked about cloud storage:
> "Users can optionally sync data to their own cloud storage (Google Drive, Dropbox, OneDrive, etc.). This is user-controlled storage, not third-party sharing."

---

## ✅ Completion Checklist

After filling out all 11 data types:

- [ ] Location > Approximate location (COMPLETED)
- [ ] Personal info > Name (COMPLETED)
- [ ] Personal info > Email address (COMPLETED)
- [ ] Health and fitness > Health info (COMPLETED)
- [ ] Photos and videos > Photos (COMPLETED)
- [ ] Photos and videos > Videos (COMPLETED)
- [ ] Files and docs > Files and docs (COMPLETED)
- [ ] App activity > App interactions (COMPLETED)
- [ ] App activity > In-app search history (COMPLETED)
- [ ] App info and performance > Crash logs (COMPLETED)
- [ ] App info and performance > Diagnostics (COMPLETED)

**Next step:** Review and submit Data Safety form!

---

**Last Updated:** October 21, 2025  
**Status:** ✅ Ready for completion

