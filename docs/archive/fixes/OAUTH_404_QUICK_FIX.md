# 🔴 URGENT: Fix Google OAuth 404 Error

## ⚠️ The Problem
```
Error 404: access blocked authorization error
invalid_request, flowName=GeneralOAuthFlow
```

## ✅ The Solution (5 minutes)

### 1. Add Redirect URI to Google Cloud Console

**Go here**: https://console.cloud.google.com/apis/credentials

**Steps:**
1. Select project: **empowrapp**
2. Find OAuth 2.0 Client ID: `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs`
3. Click on it to edit
4. Scroll to **Authorized redirect URIs**
5. Click **+ ADD URI**
6. Paste this EXACT URI:
   ```
   https://auth.expo.io/@3mpwrapp/empowrapp
   ```
7. Click **SAVE**

### 2. Add Domain to Firebase

**Go here**: https://console.firebase.google.com/project/empowrapp/authentication/providers

**Steps:**
1. Click **Google** provider
2. Scroll to bottom: **Authorized domains**
3. Click **Add domain**
4. Add: `auth.expo.io`
5. Click **Add**

### 3. Test

```powershell
npx expo start --clear
```

Scan QR → Tap "Sign in with Google" → Should work! ✅

---

## 📋 Copy-Paste Values

**Redirect URI to add:**
```
https://auth.expo.io/@3mpwrapp/empowrapp
```

**Domain to authorize:**
```
auth.expo.io
```

**Your Web Client ID:**
```
733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com
```

---

## Why This Happens

Expo uses a **proxy service** (`auth.expo.io`) for OAuth redirects in Expo Go. Google needs to whitelist this redirect URI to allow the OAuth flow to complete.

Without whitelisting → Google blocks with 404 error ❌  
With whitelisting → OAuth flow completes successfully ✅

---

## Need More Help?

See detailed guide: `GOOGLE_OAUTH_REDIRECT_FIX.md`

---

**Status**: Code updated ✅ | Google Cloud needs configuration ⏳
