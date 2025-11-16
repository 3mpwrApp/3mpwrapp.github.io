# Firebase Web Client ID Setup - CRITICAL FIX

## The Problem
Firebase Console needs to know about your Web Client ID from Google Cloud. Currently it's not configured, which causes the OAuth flow to fail.

## Solution: Add Web Client ID to Firebase

### Step 1: Get Your Web Client Secret from Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on the **Web Client ID**: `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com`
3. You'll see:
   - **Client ID**: `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxx` (copy this!)

### Step 2: Add Web Client ID to Firebase Console

1. Go to: https://console.firebase.google.com/project/empowrapp/authentication/providers
2. Click on **Google** provider
3. Scroll down to **Web SDK configuration** section
4. Click "Add" or "Configure" next to "Web client ID and secret"
5. Enter:
   - **Web Client ID**: `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com`
   - **Web Client Secret**: (paste the secret from Step 1)
6. Click **Save**

### Step 3: Add Redirect URI to Google Cloud Console

While you're in Google Cloud Console:
1. In the same Web Client ID page
2. Scroll to **Authorized redirect URIs**
3. Add: `https://auth.expo.io/@3mpwrapp/empowrapp`
4. Also add: `https://empowrapp.firebaseapp.com/__/auth/handler`
5. Click **Save**

### Step 4: Add Authorized Domains in Firebase

1. Go to: https://console.firebase.google.com/project/empowrapp/authentication/settings
2. Scroll to **Authorized domains**
3. Make sure these are added:
   - `auth.expo.io`
   - `empowrapp.firebaseapp.com`
4. Click **Save** if you added any

### Step 5: Test

Wait 2-3 minutes for changes to propagate, then:
1. Close and reopen your app
2. Try Google Sign-In
3. Should work now!

## Why This Is Needed

Firebase and Expo use different OAuth flows:
- **Expo** uses the Web Client ID with `auth.expo.io` proxy
- **Firebase** needs to be told about this Web Client ID
- Without configuring it in Firebase, the OAuth token validation fails

## Current Configuration

✅ Web Client ID in `.env`: `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com`
❌ Web Client ID NOT configured in Firebase Console (this is why it's failing)

## After Setup

Once configured, the flow will be:
1. User clicks "Sign in with Google"
2. Expo opens Google login via `auth.expo.io`
3. Google redirects to `https://auth.expo.io/@3mpwrapp/empowrapp`
4. Firebase validates the token using your Web Client ID
5. User is signed in ✅
