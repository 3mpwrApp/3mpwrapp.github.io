# Verify Google OAuth Configuration

## What You Should Have Added:

### 1. Google Cloud Console - Redirect URIs
Go to: https://console.cloud.google.com/apis/credentials

Find: Web Client ID `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com`

**Authorized Redirect URIs** should include:
```
https://auth.expo.io/@3mpwrapp/empowrapp
```

### 2. Firebase Console - Authorized Domains
Go to: https://console.firebase.google.com/project/empowrapp/authentication/settings

**Authorized domains** should include:
```
auth.expo.io
```

## Current Configuration in App:

The app is configured to use:
- **Web Client ID**: `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com`
- **Redirect URI**: `https://auth.expo.io/@3mpwrapp/empowrapp`
- **Proxy**: Enabled (useProxy: true)

## Troubleshooting Steps:

### Step 1: Double-Check Google Cloud Console
1. Go to https://console.cloud.google.com/apis/credentials
2. Click on the Web Client ID (the one ending in `...o7ll73vs.apps.googleusercontent.com`)
3. Scroll to **Authorized redirect URIs**
4. **VERIFY** you see: `https://auth.expo.io/@3mpwrapp/empowrapp`
5. If it's not there or slightly different, add it EXACTLY as shown above
6. Click **SAVE**

### Step 2: Double-Check Firebase Console
1. Go to https://console.firebase.google.com/project/empowrapp/authentication/settings
2. Scroll to **Authorized domains**
3. **VERIFY** you see: `auth.expo.io`
4. If not there, click **Add domain** and add: `auth.expo.io`
5. Click **SAVE**

### Step 3: Wait for Configuration to Propagate
- Google Cloud changes can take **up to 5 minutes** to propagate
- Firebase changes are usually instant

### Step 4: Test with Fresh App Load
```powershell
# Stop any running Expo
# Then restart with cleared cache
npx expo start --clear
```

### Step 5: Check for Common Mistakes

❌ **Wrong Client ID**: Make sure you clicked on the **Web Client ID**, not Android
   - Look for: `733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com`

❌ **Typo in Redirect URI**: Must be EXACT:
   - ✅ `https://auth.expo.io/@3mpwrapp/empowrapp`
   - ❌ `https://auth.expo.io/@3mpwrapp/empowrapp/` (no trailing slash)
   - ❌ `http://auth.expo.io/@3mpwrapp/empowrapp` (must be https)

❌ **Wrong Firebase Project**: Make sure you're in the `empowrapp` project

❌ **Google Provider Disabled**: In Firebase Console → Authentication → Sign-in method
   - Google should be **Enabled**

## What Error Are You Seeing?

Please share:
1. The exact error message
2. Screenshot of the error if possible
3. Confirm you added the redirect URI to the **Web Client ID** (not Android)

## If Still Not Working:

Let me know the error and I can help debug further. Common issues:
- Still seeing "404 access blocked" = Redirect URI not added correctly
- "prohibited" = Google provider not enabled in Firebase
- "invalid_client" = Wrong client ID
- Blank screen or crash = Check Expo logs
