# Firebase Auth "Access Blocked" Authorization Error Fix

## 🚨 Problem
Getting "access blocked" or "authorization error" when trying to register or sign in.

## 🔍 Root Cause
Firebase Authentication requires authorized domains to be configured in the Firebase Console. Your app's domain/scheme isn't in the authorized list.

## ✅ Solution

### Step 1: Add Authorized Domains in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **empowrapp**
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains/schemes:

```
localhost
empowrapp.firebaseapp.com
auth.expo.io
expo.dev
*.expo.dev
empowrapp://
```

For Expo Go (development):
```
https://auth.expo.io/@3mpwrapp/empowrapp
exp://localhost:8081
```

For standalone builds:
```
empowrapp://
com.3mpwrapp.empowrapp://
```

### Step 2: Configure OAuth Redirect URIs

If using Google/Apple Sign-In, also update:

#### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: **empowrapp**
3. Navigate to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add Authorized redirect URIs:

```
https://empowrapp.firebaseapp.com/__/auth/handler
https://auth.expo.io/@3mpwrapp/empowrapp
```

#### Apple Developer Console (iOS)
1. Go to [Apple Developer](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select your App ID
4. Add Associated Domains:
```
applinks:empowrapp.firebaseapp.com
```

### Step 3: Verify Firebase Auth is Enabled

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Ensure these are **enabled**:
   - ✅ Email/Password
   - ✅ Google (if using OAuth)
   - ✅ Apple (if using OAuth)
   - ✅ Anonymous (for guest mode)

### Step 4: Check CORS Settings (Web Only)

If deploying to web, ensure your domain is in Firebase hosting or add CORS headers.

## 🔧 Quick Fix for Development

For **immediate local testing** without Firebase Console access:

1. Switch to strict BYOC mode (no Firebase):

```bash
# In .env file
EXPO_PUBLIC_DATA_POLICY=strict_byoc
```

2. Or use guest mode only (anonymous auth doesn't require domains):
   - Click "Continue as Guest" on login screen

## 📝 Detailed Error Messages

### "access-blocked" or "unauthorized-domain"
**Cause**: Current domain not in Firebase authorized domains list  
**Fix**: Add domain to Firebase Console → Authentication → Authorized domains

### "auth/invalid-api-key"
**Cause**: Firebase API key incorrect or project mismatch  
**Fix**: Verify `firebaseConfig.apiKey` in `firebase/config.ts`

### "auth/network-request-failed"
**Cause**: Network connectivity or CORS issue  
**Fix**: Check internet connection, verify CORS settings

### "auth/operation-not-allowed"
**Cause**: Sign-in method (Email/Password, Google, Apple) not enabled in Firebase  
**Fix**: Enable in Firebase Console → Authentication → Sign-in method

## 🧪 Testing

After making changes:

1. **Clear app cache**:
```bash
npx expo start -c
```

2. **Test each auth method**:
   - Email/Password Registration
   - Email/Password Login
   - Google Sign-In
   - Apple Sign-In
   - Guest Mode

3. **Check console logs** for detailed error messages:
```
[Login] Starting login process...
[AuthContext] Auth state changed...
```

## 🚀 For Production Deployment

Before deploying to production:

1. **Create your own Firebase project** (don't use demo config)
2. Replace `firebaseConfig` in `firebase/config.ts` with YOUR credentials
3. Add ALL production domains to authorized domains:
   - Your custom domain
   - App schemes (iOS/Android)
   - Any web hosting domains

4. Deploy Firestore security rules:
```bash
npm run rules:deploy
```

## 📞 Still Having Issues?

1. Check Firebase Console → **Authentication** → **Users** tab
   - Are users being created? (Indicates auth is working)
   - Any error messages in the logs?

2. Open browser console (web) or React Native debugger
   - Look for specific Firebase error codes
   - Check network tab for failed requests

3. Verify environment:
```bash
# Check data policy
cat .env | grep DATA_POLICY

# Verify Firebase config
cat firebase/config.ts | grep apiKey
```

## 🔗 Resources

- [Firebase Auth Authorized Domains](https://firebase.google.com/docs/auth/web/redirect-best-practices)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign-In Setup](https://developer.apple.com/sign-in-with-apple/)

---

**Last Updated**: November 10, 2025  
**Status**: Ready for deployment
