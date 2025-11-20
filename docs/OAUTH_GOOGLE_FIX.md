# Google OAuth "code_challenge_method" Error Fix

## Problem
Google OAuth was failing with error:
```
Access blocked: Authorization Error
Parameter not allowed for this message type: code_challenge_method
Error 400: invalid_request
```

## Root Cause
The error occurs when using **PKCE (Proof Key for Code Exchange)** with the **OAuth 2.0 Implicit Flow** (requesting `id_token` directly). 

- **PKCE** is designed for the **Authorization Code Flow** (requesting `code` then exchanging for tokens)
- **Implicit Flow** (requesting `id_token` directly) does NOT support PKCE parameters
- `expo-auth-session` by default tries to use PKCE, which conflicts with `responseType: IdToken`

## Solution Applied

### 1. Disabled PKCE in OAuth Request
**File:** `services/auth/oauth.ts`

**Changed:**
```typescript
const request = new AuthSession.AuthRequest({
  clientId,
  responseType: AuthSession.ResponseType.IdToken,
  scopes: ['openid', 'profile', 'email'],
  redirectUri,
  usePKCE: false, // ← ADDED: Disable PKCE for Implicit Flow
});
```

### 2. Google Cloud Console Configuration
Make sure your Google OAuth client is configured correctly:

1. **Go to:** [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. **Find your OAuth 2.0 Client ID** (Web application type)
3. **Add Authorized Redirect URIs:**
   - For Expo Go: `https://auth.expo.io/@3mpwrapp/empowrapp`
   - For production: `https://auth.expo.io/@YOUR_EXPO_USERNAME/YOUR_APP_SLUG`
   - For web: `http://localhost:8081` (development)
   - For web: `https://yourdomain.com` (production)

4. **Add Authorized JavaScript Origins:**
   - `http://localhost:8081` (development)
   - `https://auth.expo.io` (Expo proxy)
   - `https://yourdomain.com` (production)

### 3. Firebase Console Configuration

1. **Go to:** [Firebase Console](https://console.firebase.google.com)
2. **Select your project** → Authentication → Sign-in method
3. **Enable Google Sign-In**
4. **Add your Web Client ID** from Google Cloud Console
5. **Add Authorized Domains:**
   - `localhost` (for development)
   - `auth.expo.io` (for Expo Go)
   - Your production domain

### 4. Environment Variables

Make sure your `.env` file has:
```env
# Use Web Client ID (not Android Client ID) for Expo
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com
```

**Important:** Use the **Web Client ID** from Google Cloud Console, not the Android or iOS client ID.

## Why This Works

1. **Implicit Flow** (`responseType: IdToken`):
   - Returns `id_token` directly in URL fragment
   - Does NOT support PKCE
   - Simpler, suitable for client-side apps
   - Works well with Expo's OAuth proxy

2. **Authorization Code Flow** (`responseType: Code`):
   - Returns `code` that must be exchanged for tokens
   - Supports PKCE for enhanced security
   - Requires server-side token exchange
   - More complex for mobile apps

For Expo apps, **Implicit Flow without PKCE** is the recommended approach for Google Sign-In.

## Testing

1. Refresh your browser (Ctrl+R or F5)
2. Go to Sign In page
3. Click "Sign in with Google"
4. Should redirect to Google auth page without errors
5. After successful auth, should redirect back to app

## Troubleshooting

If you still get errors:

1. **Check redirect URI match:**
   - Console log shows: `[OAuth] Redirect URI: ...`
   - This MUST exactly match what's in Google Cloud Console

2. **Check client ID:**
   - Console log shows: `[OAuth] Client ID: ...` (truncated)
   - Verify this matches your Web Client ID from Google Cloud Console

3. **Check Firebase Authorized Domains:**
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add `auth.expo.io` and `localhost`

4. **Clear browser cache:**
   - Google may cache old OAuth settings
   - Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## References

- [Expo AuthSession Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth/web/google-signin)
