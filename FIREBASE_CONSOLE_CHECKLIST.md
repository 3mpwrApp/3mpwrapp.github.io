# Firebase Console Configuration Checklist - SUPER ADMIN

**Super Admin**: `empowrapp08162025@gmail.com`  
**Date**: November 10, 2025  
**Status**: ⚠️ ACTION REQUIRED - Must configure Firebase Console

---

## 🚨 CRITICAL: Complete These Steps NOW

### Step 1: Login to Firebase Console

1. Go to https://console.firebase.google.com
2. Login with **empowrapp08162025@gmail.com**
3. Select project: **empowrapp**

---

### Step 2: Add Authorized Domains (HIGH PRIORITY)

Navigate to: **Authentication** → **Settings** → **Authorized domains**

Click **"Add domain"** for EACH of these:

#### ✅ Domains to Add (Firebase Console Accepts These):
```
localhost
empowrapp.firebaseapp.com
auth.expo.io
```

#### ❌ Domains Firebase Console Rejects (Don't Add These):
```
*.expo.dev          → Firebase doesn't support wildcards
empowrapp://        → Firebase doesn't support custom URL schemes  
exp://localhost:8081 → Firebase doesn't support exp:// protocol
127.0.0.1           → Optional, localhost covers this
```

**Note**: Firebase Console only accepts standard web domains (HTTP/HTTPS). Custom URL schemes like `empowrapp://` and `exp://` are handled automatically by Expo and don't need to be added to Firebase.

#### Optional (if you deploy web):
```
https://empowrapp.com
https://www.empowrapp.com
```

**Why this matters**: Without these domains, users get "access blocked" errors on ALL authentication methods.

---

### Step 3: Enable Sign-In Methods

Navigate to: **Authentication** → **Sign-in method** → **Sign-in providers**

Enable these providers:

#### ✅ Email/Password
- Status: **Enabled**
- No additional config needed

#### ✅ Google
- Status: **Enabled**
- **Web SDK configuration**:
  - Web Client ID: `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com`
  - Web Client Secret: (from Google Cloud Console)

#### ✅ Apple (iOS only)
- Status: **Enabled**
- No additional config needed (handled by Expo)

#### ✅ Anonymous
- Status: **Enabled**
- Allows guest mode

---

### Step 4: Configure Google OAuth (CRITICAL)

**⚠️ IMPORTANT: This is done in Google Cloud Console, NOT Firebase Console**

1. Go to https://console.cloud.google.com
2. Login with **empowrapp08162025@gmail.com**
3. Select project: **empowrapp** (top left dropdown)
4. Navigate to: **APIs & Services** → **Credentials** (left sidebar)
5. Look for **"OAuth 2.0 Client IDs"** section
6. Find the Web client with ID starting with `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs`
7. Click the **pencil/edit icon** (✏️) on the right side

**You'll see a configuration page with TWO sections:**

#### Section 1: Authorized JavaScript origins (at the top)
- Look for heading: **"Authorized JavaScript origins"**
- If you DON'T see this section, your client type might be wrong
- Click **"+ ADD URI"** button and add these one by one:

```
https://empowrapp.firebaseapp.com
https://auth.expo.io
```

**Note**: Only add HTTPS origins. Don't add `http://localhost` here - it's not needed for mobile OAuth.

#### Section 2: Authorized redirect URIs (below JavaScript origins)
- Look for heading: **"Authorized redirect URIs"**
- Click **"+ ADD URI"** button and add these one by one:

```
https://empowrapp.firebaseapp.com/__/auth/handler
https://auth.expo.io/@3mpwrapp/empowrapp
```

8. Scroll to bottom and click **"SAVE"** button
9. Wait for confirmation message: "Client ID updated"

**Why this matters**: Without these URIs, Google OAuth sign-in will fail with "redirect_uri_mismatch" error.

**Can't find "Authorized JavaScript origins"?**
- This section only appears for **Web application** type OAuth clients
- If you only see "Authorized redirect URIs", your client is correct - just add the redirect URIs above
- For mobile apps using Expo, the redirect URIs are the most important part

---

### Step 5: Deploy Firestore Security Rules

**SUPER ADMIN HAS GOD-MODE ACCESS** - Already configured in code!

Open PowerShell terminal in project root:

```powershell
npm run rules:deploy
```

This deploys rules with:
- ✅ Super admin (`empowrapp08162025@gmail.com`) gets full read/write access to ALL collections
- ✅ Regular users follow hybrid BYOC model (Firebase auth + own cloud storage)

---

### Step 6: Verify Super Admin Access

#### Test Login:
1. Open app in Expo Go or standalone build
2. Tap "Sign In"
3. Enter:
   - Email: `empowrapp08162025@gmail.com`
   - Password: [Your password]
4. Tap "Sign In"

#### Expected Result:
- ✅ Login successful
- ✅ `isAdmin` flag set to true in app
- ✅ Can access admin features
- ✅ Full Firestore read/write access

---

## 📋 Verification Checklist

After completing all steps above, verify:

- [ ] Can login to Firebase Console with `empowrapp08162025@gmail.com`
- [ ] All authorized domains added (at least 8 domains)
- [ ] Email/Password authentication enabled
- [ ] Google authentication enabled with Web Client ID
- [ ] Apple authentication enabled
- [ ] Anonymous authentication enabled
- [ ] Google OAuth redirect URIs configured in Google Cloud Console
- [ ] Firestore security rules deployed with super admin access
- [ ] Can login to app with super admin email
- [ ] Admin features accessible in app
- [ ] Regular users still use hybrid BYOC mode

---

## 🔒 Security Architecture

### Super Admin (empowrapp08162025@gmail.com):
- ✅ **Firebase Console**: Full project management access
- ✅ **Firestore Rules**: God-mode read/write access to ALL collections
- ✅ **App Access**: Automatic admin flag set to true
- ✅ **Claims**: Admin even if Firebase claims fail to load
- ✅ **Privileges**: Can manage users, deploy functions, view analytics

### Regular Users:
- ✅ **Authentication**: Firebase Auth (email/password, Google, Apple, guest)
- ✅ **Data Storage**: User's own cloud (hybrid BYOC mode)
- ✅ **Privacy**: Data never stored on Firebase (except auth credentials)
- ✅ **Access**: Standard user permissions, no admin features

---

## 🧪 Testing Instructions

### Test Super Admin:
```
1. Login with: empowrapp08162025@gmail.com
2. Check console logs: Should see "isAdmin: true"
3. Try admin features: Should have full access
4. Try Firestore write: Should succeed on all collections
```

### Test Regular User:
```
1. Create new account: testuser@example.com
2. Check console logs: Should see "isAdmin: false"
3. Try admin features: Should be denied
4. Check data: Should be stored on user's cloud (not Firebase)
```

---

## 🚨 Troubleshooting

### "Access Blocked" Error
**Cause**: Domain not in Firebase authorized domains  
**Fix**: Add domain to Firebase Console → Authentication → Authorized domains

### "Operation Not Allowed" Error
**Cause**: Sign-in method not enabled  
**Fix**: Enable in Firebase Console → Authentication → Sign-in method

### "Invalid API Key" Error
**Cause**: Wrong Firebase config  
**Fix**: Verify `firebase/config.ts` has correct credentials

### Super Admin Not Recognized
**Cause**: Email mismatch or claims not set  
**Fix**: 
1. Verify email is exactly `empowrapp08162025@gmail.com`
2. Sign out and sign in again to refresh token
3. Check `context/AuthContext.tsx` for hardcoded super admin check

---

## 📞 Support

**Super Admin Email**: empowrapp08162025@gmail.com  
**Firebase Project**: empowrapp  
**Firebase Console**: https://console.firebase.google.com/project/empowrapp  
**Google Cloud Console**: https://console.cloud.google.com

---

## ✅ Next Steps

After completing this checklist:

1. ✅ **Test authentication** - Try all sign-in methods
2. ✅ **Verify admin access** - Login as super admin and check permissions
3. ✅ **Test hybrid BYOC** - Create regular user and verify data stays on their cloud
4. ✅ **Deploy to production** - Push changes and publish OTA update

---

**Last Updated**: November 10, 2025  
**Configuration Status**: ⚠️ Awaiting Firebase Console setup  
**Code Status**: ✅ All code configured correctly
