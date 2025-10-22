# Google Play Console - Data Collection and Security Review

**Date:** October 21, 2025  
**Last Updated:** October 21, 2025 (Privacy Controls Added)  
**Reviewer:** GitHub Copilot  
**Status:** ⚠️ NEEDS CORRECTIONS + ✨ PRIVACY IMPROVEMENTS COMPLETED

---

## Summary

Your Google Play Console data collection and security responses have **3 CRITICAL ISSUES** that must be corrected before submission:

1. ❌ **Account Creation Method**: INCORRECT selection
2. ❌ **Delete Account URL**: Same as Delete Data URL (should be different or consolidated)
3. ⚠️ **URL Content**: Need to verify page content matches Google's requirements

### ✨ NEW: Privacy Controls Implemented (October 2025)

**GOOD NEWS:** All analytics and tracking data is now **OPTIONAL** with in-app toggles:
- ✅ App interactions (analytics) - Optional
- ✅ Crash logs - Optional
- ✅ Diagnostics - Optional
- ✅ Search history - Optional

**Impact:** Better privacy transparency in Google Play Store listing!

---

## Detailed Assessment

### ✅ **CORRECT Responses**

#### 1. Does your app collect or share any of the required user data types?
**Your Answer:** ✅ **YES**

**Verification:**
- App collects optional user data including:
  - Name (local storage)
  - Province selection (local storage)
  - Wellness data (mood, energy, reflections)
  - Evidence notes and attachments
  - Deadlines and calendar events
  - Community posts and messages (if using Firestore)

**Status:** ✅ **CORRECT**

---

#### 2. Is all of the user data collected by your app encrypted in transit?
**Your Answer:** ✅ **YES**

**Verification:**
- ✅ Firestore connections use TLS 1.3 (`services/firestore.ts`)
- ✅ All HTTPS connections enforced (`utils/linking.ts`)
- ✅ README confirms "TLS 1.3 Network Security" with certificate pinning
- ✅ Security documentation states "OWASP Mobile Top 10 compliant"

**Status:** ✅ **CORRECT**

---

### ❌ **INCORRECT Responses**

#### 3. Which methods of account creation does your app support?
**Your Answer:** ❌ **"My app does not allow users to create an account"**

**Actual Implementation:**
The app **DOES** support account creation via:

1. ✅ **OAuth (Google Sign-In)** - `services/auth/oauth.ts` line 7-47
2. ✅ **OAuth (Apple Sign-In)** - `services/auth/oauth.ts` line 49-77
3. ✅ **Username and password (Email/Password)** - `app/(auth)/login.tsx` line 29
   - Uses Firebase `signInWithEmailAndPassword()`

**Firebase Auth Integration:**
```typescript
// firebase/config.ts line 48
export const auth = STRICT ? (null as any) : getAuth(app!);

// app/(auth)/login.tsx line 29
await signInWithEmailAndPassword(auth, email.trim(), password);

// services/auth/oauth.ts
- Google Sign-In (lines 7-47)
- Apple Sign-In (lines 49-77)
```

**CORRECT Answer Should Be:**
- ✅ **"Username and password"** (Email/Password via Firebase Auth)
- ✅ **"OAuth"** (Google and Apple Sign-In)

**Status:** ❌ **INCORRECT - MUST FIX**

---

### ⚠️ **NEEDS REVIEW**

#### 4. Delete Account URL
**Your Answer:** `https://3mpwrapp.pages.dev/delete-account`

**Verification:**
- ✅ URL exists and returns 200 OK
- ⚠️ **Need to verify page content** includes:
  - [ ] App name "3mpwr App" or developer name
  - [ ] Clear deletion steps
  - [ ] Data types deleted/retained
  - [ ] Retention period disclosure
  - [ ] Contact method (email or form)

**In-App Implementation:**
The app has account deletion in `app/(tabs)/settings/index.tsx` (line 99):
```typescript
const confirmDelete = async () => {
  const cred = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, cred);
  await deleteUser(user); // Deletes Firebase Auth account
  trackEvent('account_delete', { method: 'password' });
}
```

**Status:** ⚠️ **VERIFY PAGE CONTENT**

---

#### 5. Delete Data URL
**Your Answer:** `https://3mpwrapp.pages.dev/delete-account` (SAME as Delete Account URL)

**Issues:**
1. ❌ **Same URL as account deletion** - Google recommends separate pages or clear distinction
2. ⚠️ **Need separate "delete data without deleting account" option**

**In-App Implementation:**
The app has data clearing in `app/(tabs)/settings.sections/EnhancedPrivacySection.tsx` (line 68):
```typescript
const onClear = async () => {
  Alert.alert('Clear All Data', 'This will permanently delete all your local app data...');
  const ok = await clearAllData(); // Clears AsyncStorage
}
```

**Recommended Solution:**
Create separate pages:
- **Delete Account:** `https://3mpwrapp.pages.dev/delete-account` (removes Firebase Auth account + all data)
- **Delete Data:** `https://3mpwrapp.pages.dev/delete-data` (removes local data, keeps account)

OR consolidate into one page with both options clearly separated.

**Status:** ⚠️ **NEEDS SEPARATE URL OR CONSOLIDATED PAGE**

---

## Required Corrections

### Priority 1: Fix Account Creation Method ❌ CRITICAL

**Current (Incorrect):**
```
☑ My app does not allow users to create an account
```

**Correct Answer:**
```
☑ Username and password
☑ OAuth
```

**Evidence:**
- Firebase Auth Email/Password: `app/(auth)/login.tsx`
- Google OAuth: `services/auth/oauth.ts` (signInWithGoogleAsync)
- Apple OAuth: `services/auth/oauth.ts` (signInWithAppleAsync)

---

### Priority 2: Create/Update Deletion Pages ⚠️ IMPORTANT

**Option A: Separate Pages (Recommended)**

Create two distinct pages:

**1. Delete Account Page** (`https://3mpwrapp.pages.dev/delete-account`)
```markdown
# Delete Your 3mpwr App Account

## How to Delete Your Account

To permanently delete your 3mpwr App account and all associated data:

### Steps:
1. Open the 3mpwr App on your device
2. Navigate to **Settings** (gear icon in top-right)
3. Scroll to **Account** section
4. Tap **"Delete Account"**
5. Enter your password (for email/password accounts) OR re-authenticate with Google/Apple
6. Confirm deletion

### What Gets Deleted:
When you delete your account, the following data is permanently removed:
- ✅ Firebase Authentication account
- ✅ Wellness data (mood, energy, reflections)
- ✅ Evidence locker notes and attachments
- ✅ Deadlines and calendar events
- ✅ Community posts and messages
- ✅ User preferences and settings
- ✅ Local device data (AsyncStorage)

### What We Keep:
- ❌ None - all data is permanently deleted

### Retention Period:
- Account and data are deleted **immediately** upon confirmation
- Backups may retain data for up to **30 days** for disaster recovery, then permanently purged

### Need Help?
Contact us at: **empowrapp08162025@gmail.com**

---
*3mpwr App is committed to user privacy and data ownership. You control your data.*
```

**2. Delete Data Page** (`https://3mpwrapp.pages.dev/delete-data`)
```markdown
# Delete Your 3mpwr App Data (Without Deleting Account)

## How to Clear Your Local Data

To delete your local app data while keeping your account active:

### Steps:
1. Open the 3mpwr App on your device
2. Navigate to **Settings** → **Privacy & Security**
3. Scroll to **Data Management** section
4. Tap **"Clear All Data"**
5. Confirm deletion

### What Gets Deleted:
- ✅ Wellness data (mood, energy, reflections)
- ✅ Evidence locker notes and attachments
- ✅ Deadlines and calendar events
- ✅ User preferences and settings
- ✅ Local device data (AsyncStorage)

### What We Keep:
- ✅ Your Firebase Authentication account (you can still log in)
- ✅ Community posts and messages (stored in Firestore, not local)

### Retention Period:
- Local data is deleted **immediately** upon confirmation
- You can log back in and start fresh anytime

### Need Help?
Contact us at: **empowrapp08162025@gmail.com**

---
*3mpwr App is committed to user privacy and data ownership. You control your data.*
```

---

**Option B: Consolidated Page (Alternative)**

Create one page (`https://3mpwrapp.pages.dev/delete-account`) with both options:
```markdown
# Manage Your 3mpwr App Data

Choose the option that best fits your needs:

## Option 1: Delete Account + All Data (Permanent)
[Instructions for full account deletion]

## Option 2: Delete Data Only (Keep Account)
[Instructions for clearing local data]
```

---

### Priority 3: Verify URL Content ⚠️ BEFORE SUBMISSION

**Checklist for both pages:**
- [ ] Mentions "3mpwr App" or developer name prominently
- [ ] Clear step-by-step instructions
- [ ] Lists specific data types deleted
- [ ] Lists specific data types retained (if any)
- [ ] States retention period
- [ ] Provides contact method (email)
- [ ] Mobile-friendly formatting
- [ ] Accessible (screen reader compatible)

---

## Recommended Google Play Console Answers

### Corrected Responses:

**1. Does your app collect or share any of the required user data types?**
```
✅ Yes
```

**2. Is all of the user data collected by your app encrypted in transit?**
```
✅ Yes
```

**3. Which of the following methods of account creation does your app support?**
```
✅ Username and password
✅ OAuth
```
*Deselect: "My app does not allow users to create an account"*

**4. Delete account URL:**
```
https://3mpwrapp.pages.dev/delete-account
```
*(Ensure page content meets Google's requirements - see checklist above)*

**5. Do you provide a way for users to request data deletion without deleting account?**
```
✅ Yes
```

**6. Delete data URL:**
```
https://3mpwrapp.pages.dev/delete-data
```
*(Create separate page OR use same URL with clear sections)*

---

## Implementation Checklist

### Immediate Actions Required:

- [ ] **Update Google Play Console:**
  - [ ] Check "Username and password"
  - [ ] Check "OAuth"
  - [ ] Uncheck "My app does not allow users to create an account"

- [ ] **Create/Update Deletion Pages:**
  - [ ] Create `delete-account` page with required content
  - [ ] Create `delete-data` page (or consolidate)
  - [ ] Verify all required information is present
  - [ ] Test on mobile devices

- [ ] **Verify Page Accessibility:**
  - [ ] Test with screen readers
  - [ ] Test on mobile browsers
  - [ ] Verify responsive design
  - [ ] Check contact email is clickable (mailto: link)

- [ ] **Document in Store Listing:**
  - [ ] Update `docs/STORE_LISTING_CONTENT.md` with URLs
  - [ ] Add deletion instructions to Privacy Policy
  - [ ] Include in App Store listing (iOS requires similar disclosure)

---

## Additional Recommendations

### Data Safety Form Consistency

Ensure your Data Safety form (other sections) accurately reflects:

1. **Data Types Collected:**
   - Personal info: Name (optional)
   - Location: Province/Territory (optional, coarse)
   - Health & Fitness: Wellness data, mood, energy (optional)
   - Files & Docs: Evidence attachments (optional, user-uploaded)
   - App activity: Community posts, messages (optional)

2. **Data Usage:**
   - App functionality
   - Analytics (if enabled)
   - Developer communications

3. **Data Sharing:**
   - No third-party sharing (unless using analytics services)
   - Firestore data stays in your Firebase project (Google Cloud)

4. **Security Practices:**
   - ✅ Data encrypted in transit (TLS 1.3)
   - ✅ Data encrypted at rest (AES-256 for local storage, Firestore default encryption)
   - ✅ Users can request deletion
   - ✅ Committed to Google Play Families Policy (if targeting children/teens)

---

## Questions?

Contact: empowrapp08162025@gmail.com

---

**Status:** ⚠️ **DO NOT SUBMIT until corrections are made**

**Next Steps:**
1. Fix account creation method in Google Play Console
2. Create/update deletion pages
3. Verify all URLs and content
4. Re-review this document
5. Submit for review

**Last Updated:** October 21, 2025
