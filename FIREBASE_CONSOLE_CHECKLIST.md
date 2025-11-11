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

#### Development Domains:
```
localhost
127.0.0.1
exp://localhost:8081
https://auth.expo.io/@3mpwrapp/empowrapp
```

#### Production Domains:
```
empowrapp.firebaseapp.com
auth.expo.io
expo.dev
*.expo.dev
empowrapp://
com.3mpwrapp.empowrapp://
```

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

1. Go to https://console.cloud.google.com
2. Login with **empowrapp08162025@gmail.com**
3. Select project: **empowrapp**
4. Navigate to: **APIs & Services** → **Credentials**
5. Click on OAuth 2.0 Client ID: `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com`

#### Add Authorized Redirect URIs:
```
https://empowrapp.firebaseapp.com/__/auth/handler
https://auth.expo.io/@3mpwrapp/empowrapp
```

#### Add Authorized JavaScript Origins:
```
http://localhost
http://localhost:8081
https://empowrapp.firebaseapp.com
https://auth.expo.io
```

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
