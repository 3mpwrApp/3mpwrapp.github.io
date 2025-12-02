# OAuth Client IDs - Important Distinction

## Two Different Client IDs

When you enable Google Sign-In in Firebase, you get **two OAuth client IDs**:

### 1. Android Client ID
```
733708119893-vagikeh1bu36n9boma32ic2lbfvbff08.apps.googleusercontent.com
```
- Used for **native Android apps** (not Expo)
- Found in `google-services.json`
- Requires SHA-1 fingerprint

### 2. Web Client ID ✅ (Use This for Expo!)
```
733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com
```
- Used for **web-based OAuth flows** (includes Expo)
- Found in Firebase Console > Authentication > Sign-in method > Google > Web SDK configuration
- **This is what Expo needs!**

## Why Expo Uses Web Client ID

Even though you're building a mobile app, **Expo uses a web-based OAuth flow**:
- Expo opens a web browser for authentication
- Uses OAuth redirect URIs
- Works across iOS, Android, and Web
- **Does NOT require SHA-1 fingerprints for development**

## Your Current Configuration

### ✅ Updated `.env` file:
```properties
# Android Client ID (for native builds only)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=733708119893-vagikeh1bu36n9boma32ic2lbfvbff08.apps.googleusercontent.com

# Web Client ID (Required for Expo OAuth) ✅
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com
```

### ✅ Updated `oauth.ts`:
- Now uses Web Client ID for Expo projects
- Falls back to Android Client ID if Web Client ID not set
- Added logging to show which client ID is being used

## How to Get Your Web Client ID

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **empowrapp**
3. **Authentication** → **Sign-in method** → **Google**
4. Scroll to **Web SDK configuration**
5. Copy the **Web client ID**
6. Add to `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

## Testing

Now when you test Google Sign-In:

```powershell
npx expo start
```

Console will show:
```
Google Sign-In config: { 
  platform: 'android',
  usingWebClientId: true,
  clientIdPrefix: '733708119893-so14q85m...'
}
```

If `usingWebClientId: true`, you're using the correct Web Client ID! ✅

## Common Mistakes

❌ **Wrong**: Using Android Client ID for Expo
- Will fail with "invalid_client" or redirect errors
- SHA-1 fingerprint won't help

✅ **Correct**: Using Web Client ID for Expo
- Works immediately in Expo Go
- No SHA-1 needed for development
- Properly configured OAuth flow

## Summary

| Client ID Type | Used For | Requires SHA-1 | Works with Expo Go |
|---------------|----------|----------------|-------------------|
| Android Client ID | Native Android apps | ✅ Yes | ❌ No |
| **Web Client ID** | **Expo/Web OAuth** | ❌ No | **✅ Yes** |

**For Expo projects like yours**: Always use the **Web Client ID**!

---

Last Updated: November 7, 2025
Status: ✅ **Configured and Ready**
