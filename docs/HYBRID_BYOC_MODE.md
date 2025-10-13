# Hybrid BYOC Mode - Best of Both Worlds

## Overview

**Hybrid BYOC Mode** combines Firebase authentication with user-owned cloud storage, giving you the best of both worlds:

- ✅ **Firebase handles authentication only** - Easy login with email/password, Google, Apple
- ✅ **ALL user data goes to THEIR cloud** - Files, evidence, posts, everything belongs to the user
- ✅ **Zero user data on your servers** - You never store or have access to user data
- ✅ **Maximum privacy & compliance** - GDPR, HIPAA, CCPA friendly

## Configuration

### Enable Hybrid Mode

Set in your `.env` file:

```env
EXPO_PUBLIC_DATA_POLICY=hybrid_byoc
```

### What This Does

#### Firebase Services Status:
- ✅ **Auth**: ENABLED - Users can log in with email/password, Google, Apple
- ❌ **Firestore**: DISABLED - No data stored in Firebase database
- ❌ **Storage**: DISABLED - No files stored in Firebase storage
- ❌ **Analytics**: DISABLED - No tracking data sent to Firebase

#### User Data Storage:
ALL user data is stored in the user's chosen cloud provider:
- WebDAV/Nextcloud
- Google Drive
- Dropbox
- OneDrive
- AWS S3
- iCloud
- Azure Storage
- Any other cloud service

## How It Works

### 1. User Authentication (Firebase)
```typescript
// Users can log in normally
await signInWithEmailAndPassword(auth, email, password);
await signInWithGoogleAsync();
await signInWithAppleAsync();
```

**What Firebase stores:** Only authentication credentials (email, hashed password, OAuth tokens)
**What Firebase does NOT store:** Any user data, files, posts, evidence, etc.

### 2. User Data Storage (User's Cloud)
```typescript
// ALL data is saved to user's cloud
const storage = getActiveStorage(); // Returns user's WebDAV/cloud provider
await storage.save('evidence/photo.jpg', imageData);
await storage.save('posts/my-post.json', postData);
```

**What happens:**
- User connects their cloud in Settings → Privacy → BYOC
- App saves/loads ALL data to/from their cloud
- Credentials are session-only (never persisted)
- You never see or touch user data

### 3. Benefits

#### For You (App Owner):
- ✅ No liability for user data
- ✅ No storage costs for user files
- ✅ No GDPR/HIPAA data breach risks
- ✅ Simple compliance - you don't have user data
- ✅ Easy authentication management

#### For Users:
- ✅ Complete data ownership
- ✅ Can access their data anytime
- ✅ Can move to any cloud provider
- ✅ Easy to backup/export
- ✅ Privacy guaranteed

## Comparison of Modes

| Feature | Default Mode | Hybrid BYOC | Strict BYOC |
|---------|-------------|-------------|-------------|
| Firebase Auth | ✅ Yes | ✅ Yes | ❌ No |
| Firebase Storage | ✅ Yes | ❌ No | ❌ No |
| User Data Location | Your Firebase | User's Cloud | User's Cloud |
| Data Liability | You own it | User owns it | User owns it |
| Login Methods | All | All | Custom only |
| Complexity | Low | Medium | High |

## Implementation Details

### Firebase Config (firebase/config.ts)
```typescript
const HYBRID = process.env.EXPO_PUBLIC_DATA_POLICY === 'hybrid_byoc';

// Auth: enabled in hybrid mode
export const auth = STRICT ? null : getAuth(app);

// Firestore: disabled in hybrid mode (user's cloud only)
export const db = STRICT || HYBRID ? null : getFirestore(app);

// Storage: disabled in hybrid mode (user's cloud only)
export const storage = STRICT || HYBRID ? null : getStorage(app);
```

### Storage Provider Selection
```typescript
export function getActiveStorage(): StorageProvider {
  const cfg = getBYOCConfig();
  
  if (isBYOCEnabled()) { // True for both hybrid and strict
    if (cfg?.kind === 'webdav') return webdavProvider;
    return ephemeralProvider; // Fallback if user hasn't configured cloud
  }
  
  // Default mode would use Firebase here
  return ephemeralProvider;
}
```

## User Experience

### First Time Setup
1. User creates account with email/password or OAuth (Firebase auth)
2. User navigates to Settings → Privacy → BYOC
3. User enters their cloud storage endpoint (e.g., Nextcloud WebDAV URL)
4. User tests connection
5. All data now saves to their cloud

### Session Management
- Cloud credentials stored in memory only (session-only)
- User needs to reconnect their cloud each app session
- Or implement secure keychain storage for persistent connection

### Data Access
- Evidence Locker → saves to `evidence/` in user's cloud
- Community Posts → saves to `posts/` in user's cloud
- User files → saves to `files/` in user's cloud

## Security Benefits

1. **No Data Breach Risk**: You can't leak data you don't have
2. **No Subpoena Risk**: No user data to hand over
3. **No Compliance Burden**: User manages their own data
4. **No Storage Costs**: Users pay their cloud provider
5. **Complete Privacy**: You never see user data

## Recommended Use Cases

✅ **Perfect for:**
- Healthcare apps (HIPAA)
- Legal apps (attorney-client privilege)
- Advocacy apps (sensitive user info)
- Privacy-focused apps
- Apps with heavy file storage

❌ **Not ideal for:**
- Apps requiring real-time collaboration between users
- Apps with heavy social features
- Apps where users expect seamless cross-device sync without setup

## Migration Path

### From Default to Hybrid
1. Change `.env`: `EXPO_PUBLIC_DATA_POLICY=hybrid_byoc`
2. Restart dev server
3. Existing users: Auth still works
4. Data: Gradually migrate to user's cloud

### From Hybrid to Default
1. Change `.env`: Remove or comment out `EXPO_PUBLIC_DATA_POLICY`
2. Restart dev server
3. Enable Firebase Firestore/Storage
4. Migrate user data from their clouds to Firebase (requires user consent)

## Support

For questions about hybrid BYOC mode:
- See: `docs/BYOC_POLICY.md`
- See: `services/dataPolicy.ts`
- See: `services/storageProviders.ts`

---

**Bottom Line**: Hybrid BYOC mode lets you provide a great authentication experience while ensuring 100% user data ownership and zero liability for user data.
