# Google Play Console - Quick Reference Card

**Date:** October 21, 2025  
**Status:** ✅ READY (with corrections needed)

---

## 🚨 CRITICAL: Fix These Before Submission

### 1. Account Creation Method ❌ MUST FIX IN CONSOLE

**In Google Play Console → Data Safety → Account Creation:**

**UNCHECK THIS:**
- ☐ My app does not allow users to create an account

**CHECK THESE:**
- ☑ Username and password
- ☑ OAuth

**Why:**
- Your app uses Firebase Authentication
- Email/Password sign-in = "Username and password"
- Google Sign-In + Apple Sign-In = "OAuth"
- Also supports Guest mode (optional, not account creation)

**Evidence:**
- `app/(auth)/login.tsx` - Email/password form
- `services/auth/oauth.ts` - Google and Apple Sign-In
- `firebase/config.ts` - Firebase Auth integration

---

## ✅ Data Types to Select (11 total)

### Location (1)
- ☑ Approximate location - **Optional**

### Personal Info (2)
- ☑ Name - **Optional**
- ☑ Email address - **Optional**

### Health & Fitness (1)
- ☑ Health info - **Optional**

### Photos & Videos (2)
- ☑ Photos - **Optional**
- ☑ Videos - **Optional**

### Files & Docs (1)
- ☑ Files and docs - **Optional**

### App Activity (2)
- ☑ App interactions - **✨ Optional** (toggle in Settings)
- ☑ In-app search history - **✨ Optional** (toggle in Settings)

### App Info & Performance (2)
- ☑ Crash logs - **✨ Optional** (toggle in Settings)
- ☑ Diagnostics - **✨ Optional** (toggle in Settings)

---

## 🎯 Privacy Controls (NEW!)

All users can control tracking via **Settings → Privacy & Security**:

1. **"Opt Out of Analytics"** toggle
   - Controls: App interactions + Diagnostics
   - Default: OFF (analytics enabled)

2. **"Error Reporting"** toggle
   - Controls: Crash logs
   - Default: ON (enabled)

3. **"Save Search History"** toggle
   - Controls: In-app search history
   - Default: ON (enabled)

**Mark all 4 as OPTIONAL in Google Play Console!**

---

## 📝 Key Answers for Each Data Type

### For ALL Optional Data Types:
```
Q: Is this data required or can users choose?
A: ☑ Users can choose whether this data is collected
```

### For Shared Data Types (Email, Analytics, Crash logs, Diagnostics):
```
Q: Why is this data shared?
A: Select the appropriate reasons:
   - Email → Account management
   - Analytics → App functionality + Analytics
   - Crash logs → App functionality + Analytics
   - Diagnostics → App functionality + Analytics
```

### Third Parties:
```
Email: Google LLC (Firebase Authentication)
App interactions: Google LLC (Firebase Analytics)
Diagnostics: Google LLC (Firebase Analytics)
Crash logs: Functional Software, Inc. (Sentry)
```

---

## 🔗 Important URLs

**Delete Account:** https://3mpwrapp.pages.dev/delete-account
**Delete Data:** https://3mpwrapp.pages.dev/delete-data (or same as above)
**Privacy Policy:** https://3mpwrapp.pages.dev/privacy

⚠️ Verify these pages exist and contain required information!

---

## ✅ Quick Checklist

Before submitting:

- [ ] Fix account creation method (Username/password + OAuth)
- [ ] Select all 11 data types
- [ ] Mark 11 data types as "Optional"
- [ ] Add explanations for optional toggles
- [ ] List third parties (Google, Sentry)
- [ ] Verify delete-account and delete-data URLs work
- [ ] Test all privacy toggles in app
- [ ] Review Data Safety form one final time

---

## 📚 Detailed Documentation

For complete answers:
- **Data Types:** `docs/GOOGLE_PLAY_DATA_TYPES_GUIDE.md`
- **Detailed Answers:** `docs/GOOGLE_PLAY_DATA_USAGE_HANDLING.md`
- **Privacy Controls:** `docs/GOOGLE_PLAY_PRIVACY_CONTROLS_SUMMARY.md`
- **Search History:** `docs/SEARCH_HISTORY_OPT_OUT_FEATURE.md`
- **Review:** `docs/GOOGLE_PLAY_DATA_SECURITY_REVIEW.md`

---

**Print this card and keep it handy while filling out the form!** 📋

**Last Updated:** October 21, 2025
