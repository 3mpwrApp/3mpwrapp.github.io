# Quick Fix Guide - Firebase Console Setup

**Date**: November 10, 2025  
**Issue**: Firebase Console rejected some domains, unclear where to put OAuth URIs

---

## ✅ SOLUTION 1: Firebase Console - Authorized Domains

**Location**: Firebase Console → Authentication → Settings → Authorized domains

### ✅ ADD ONLY THESE 3 DOMAINS:

```
localhost
empowrapp.firebaseapp.com
auth.expo.io
```

### ❌ DO NOT ADD (Firebase rejects these):

- `*.expo.dev` ❌ No wildcards allowed
- `empowrapp://` ❌ No custom URL schemes allowed
- `exp://localhost:8081` ❌ No exp:// protocol allowed
- `127.0.0.1` ❌ Optional (localhost covers this)

**Why Firebase rejects them**: Firebase Console only accepts standard HTTP/HTTPS web domains. Custom URL schemes and wildcards are not supported.

**Don't worry**: Expo handles `empowrapp://` and `exp://` automatically - you don't need to add them anywhere!

---

## ✅ SOLUTION 2: Google Cloud Console - OAuth Redirect URIs

**⚠️ DIFFERENT CONSOLE - This is Google Cloud, NOT Firebase!**

**Location**: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID (Web client)

### Step-by-step:

1. **Go to**: https://console.cloud.google.com
2. **Login with**: empowrapp08162025@gmail.com
3. **Select project**: empowrapp (from dropdown at top)
4. **Left sidebar**: Click "APIs & Services" → "Credentials"
5. **Find**: OAuth 2.0 Client IDs section
6. **Click on**: Web client (ID starts with `733708119893-`)

### Section 1: Authorized redirect URIs

Scroll down and click **"+ ADD URI"** for each:

```
https://empowrapp.firebaseapp.com/__/auth/handler
https://auth.expo.io/@3mpwrapp/empowrapp
```

### Section 2: Authorized JavaScript origins

Scroll up and click **"+ ADD URI"** for each:

```
http://localhost
http://localhost:8081
https://empowrapp.firebaseapp.com
https://auth.expo.io
```

### ⚠️ IMPORTANT: Click **"SAVE"** at the bottom!

---

## 📋 Summary - Two Different Consoles

| What | Where | How Many |
|------|-------|----------|
| **Authorized Domains** | Firebase Console → Authentication → Settings | 3 domains |
| **OAuth Redirect URIs** | Google Cloud Console → APIs & Services → Credentials | 2 URIs |
| **JavaScript Origins** | Google Cloud Console → APIs & Services → Credentials | 4 URIs |

---

## 🧪 How to Verify Setup is Correct

### Test 1: Firebase Console
Navigate to: Firebase Console → Authentication → Settings → Authorized domains

**Should see exactly**:
- localhost
- empowrapp.firebaseapp.com  
- auth.expo.io

### Test 2: Google Cloud Console
Navigate to: Google Cloud Console → APIs & Services → Credentials → (click Web client)

**Authorized redirect URIs should show**:
- https://empowrapp.firebaseapp.com/__/auth/handler
- https://auth.expo.io/@3mpwrapp/empowrapp

**Authorized JavaScript origins should show**:
- http://localhost
- http://localhost:8081
- https://empowrapp.firebaseapp.com
- https://auth.expo.io

---

## 🚨 Common Mistakes to Avoid

❌ **WRONG**: Adding OAuth URIs to Firebase Console  
✅ **CORRECT**: OAuth URIs go in Google Cloud Console

❌ **WRONG**: Adding `*.expo.dev` to Firebase authorized domains  
✅ **CORRECT**: Only add `auth.expo.io` (no wildcard)

❌ **WRONG**: Adding `empowrapp://` to Firebase  
✅ **CORRECT**: Expo handles custom URL schemes automatically

❌ **WRONG**: Forgetting to click "SAVE" in Google Cloud Console  
✅ **CORRECT**: Always click "SAVE" after adding URIs

---

## 🎯 After Setup, Test Authentication

1. Open your app
2. Try **Email/Password login** → Should work
3. Try **Guest mode** → Should work
4. Try **Google sign-in** → Should redirect and work
5. Try **Apple sign-in** (iOS only) → Should work

If Google sign-in fails with "redirect_uri_mismatch", double-check Step 2 (Google Cloud Console).

---

**Last Updated**: November 10, 2025  
**Status**: ✅ Ready to configure
