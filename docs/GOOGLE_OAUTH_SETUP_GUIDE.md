# Google OAuth Setup - Visual Guide

**Super Admin**: empowrapp08162025@gmail.com  
**Date**: November 10, 2025

---

## 🎯 Step-by-Step: Finding OAuth Configuration

### Step 1: Open Google Cloud Console

1. Go to: https://console.cloud.google.com
2. Login with: **empowrapp08162025@gmail.com**
3. Make sure you see **"empowrapp"** project name in the top blue bar

---

### Step 2: Navigate to Credentials

**Left Sidebar Navigation:**
```
☰ (Menu icon)
  └─ APIs & Services
       └─ Credentials  ← Click here
```

Or use direct link: https://console.cloud.google.com/apis/credentials?project=empowrapp

---

### Step 3: Find OAuth 2.0 Client IDs

On the Credentials page, you'll see several sections:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  API keys
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  OAuth 2.0 Client IDs  ← Look here
    - Web client (auto created by Google Service)
      733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs...
      [✏️ Edit icon]  [🗑️ Delete icon]
    
    - (You might see other clients for Android/iOS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Service Accounts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Click the ✏️ (pencil/edit) icon** next to the Web client

---

### Step 4: OAuth Client Configuration Page

After clicking edit, you'll see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Edit OAuth client
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Name: Web client (auto created by Google Service)
  
  Client ID: 733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs...
  
  Client secret: GOCSPX-...
  
  Application type: Web application
  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Authorized JavaScript origins
  For use with requests from a browser
  
  [+ ADD URI]
  
  1. https://empowrapp.firebaseapp.com
  2. https://auth.expo.io
  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Authorized redirect URIs
  For use with requests from a web server
  
  [+ ADD URI]
  
  1. https://empowrapp.firebaseapp.com/__/auth/handler
  2. https://auth.expo.io/@3mpwrapp/empowrapp
  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [DELETE]  [CANCEL]  [SAVE]
```

---

## ⚠️ Troubleshooting: Can't Find "Authorized JavaScript origins"?

### Scenario 1: Section is Missing Completely

**This is actually NORMAL for mobile apps!**

- If you only see **"Authorized redirect URIs"** section, that's okay
- Mobile apps using Expo primarily need redirect URIs, not JavaScript origins
- **Just add the redirect URIs and you're good to go**

**Add these redirect URIs:**
```
https://empowrapp.firebaseapp.com/__/auth/handler
https://auth.expo.io/@3mpwrapp/empowrapp
```

---

### Scenario 2: Wrong Client Type Selected

If the page looks completely different, you might have clicked the wrong client.

**Check the "Application type" field:**
- ✅ Should say: **"Web application"**
- ❌ If it says "Android" or "iOS" → Go back and find the Web client

**Go back to Credentials page and look for:**
- Client name containing "Web client" or "auto created by Google Service"
- Client ID starting with: `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs`

---

### Scenario 3: You Have Multiple OAuth Clients

You might see several clients:
```
OAuth 2.0 Client IDs:
  - Web client (auto created by Google Service)     ← Use this one
  - Android client                                  ← Don't edit this
  - iOS client                                       ← Don't edit this
```

**Always edit the "Web client" for Firebase Auth to work properly.**

---

## ✅ What You MUST Add (Minimum Required)

### Required Redirect URIs:
```
https://empowrapp.firebaseapp.com/__/auth/handler
https://auth.expo.io/@3mpwrapp/empowrapp
```

### Optional JavaScript Origins (if section exists):
```
https://empowrapp.firebaseapp.com
https://auth.expo.io
```

**If you don't see the JavaScript origins section, it's fine - the redirect URIs are the critical part!**

---

## 🧪 Verify Your Configuration

After saving, test Google Sign-In:

1. Open your app
2. Tap "Sign in with Google"
3. Select Google account
4. Should successfully authenticate

**If you get errors:**
- `redirect_uri_mismatch` → Check redirect URIs are exact (no typos, trailing slashes)
- `invalid_client` → Check you edited the correct Web client
- `access_denied` → Check Firebase Console has Google auth enabled

---

## 📸 Visual Reference - Where Things Are

```
Google Cloud Console
├── Top Bar
│   └── Project selector → "empowrapp"
│
├── Left Sidebar
│   └── ☰ Menu
│       └── APIs & Services
│           └── Credentials  ← YOU ARE HERE
│
└── Main Content Area
    ├── API keys section
    ├── OAuth 2.0 Client IDs section  ← FIND THIS
    │   └── Web client
    │       └── ✏️ Click this pencil icon
    │           └── Opens edit page with:
    │               ├── Authorized JavaScript origins (maybe)
    │               └── Authorized redirect URIs (required!)
    └── Service Accounts section
```

---

## 🆘 Still Can't Find It?

Try this direct link (after logging in):
```
https://console.cloud.google.com/apis/credentials/oauthclient/733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com?project=empowrapp
```

This should take you directly to the edit page for the correct OAuth client.

---

**Last Updated**: November 10, 2025  
**Status**: Active configuration guide
