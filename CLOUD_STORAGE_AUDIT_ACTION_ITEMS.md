# 🔧 CLOUD STORAGE AUDIT - ACTION ITEMS & FIX GUIDE
**Date:** January 9, 2026  
**For:** Development Team

---

## PRIORITY 1: CRITICAL (Must Fix Before Production)

### 1.1 Firebase Project Configuration for Users ⚠️

**Issue:** App currently uses 3mpwr's demo Firebase project  
**Impact:** All user data stored on 3mpwr's project (not user-controlled)  
**Risk Level:** CRITICAL for production use  

#### Implementation Steps:

**Step 1: Create Firebase Setup Wizard Component**

```typescript
// components/onboarding/FirebaseSetupWizard.tsx
// Add to: app/(tabs)/settings/byoc.tsx

export function FirebaseSetupWizard() {
  return (
    <ScrollView>
      <Text style={styles.title}>Set Up Your Firebase Project</Text>
      
      {/* Step 1: Create Firebase Project */}
      <SetupStep
        number={1}
        title="Create Firebase Project"
        description="Visit firebase.google.com and create a new project"
        action={() => open('https://firebase.google.com')}
      />
      
      {/* Step 2: Get Firebase Config */}
      <SetupStep
        number={2}
        title="Copy Firebase Config"
        description="Get your config from Project Settings"
        action={() => open('https://console.firebase.google.com/project/_/settings/general')}
      />
      
      {/* Step 3: Replace Config */}
      <SetupStep
        number={3}
        title="Update firebase/config.ts"
        code={`const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... paste your config here
};`}
      />
      
      {/* Step 4: Deploy Cloud Functions */}
      <SetupStep
        number={4}
        title="Deploy Cloud Functions"
        command="npm run functions:deploy"
      />
    </ScrollView>
  );
}
```

**Step 2: Update README.md**

Add section in Firebase Setup:
```markdown
## For Production Deployment

You MUST create your own Firebase project:

1. Visit [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Copy config from Project Settings
4. Replace firebaseConfig in [firebase/config.ts](firebase/config.ts#L30)
5. Deploy Cloud Functions: npm run functions:deploy
6. Update Firestore rules: npm run rules:deploy

See [Firebase Setup Guide](docs/FIREBASE_SETUP.md) for detailed steps.
```

**Step 3: Create docs/FIREBASE_SETUP.md**

```markdown
# Setting Up Your Own Firebase Project

## Why?
By default, 3mpwr uses a demo Firebase project. For production, 
your users' data should be stored in YOUR Firebase project.

## Steps

### 1. Create Firebase Project
- Go to https://firebase.google.com
- Click "Go to console"
- Click "Create project"
- Enter project name (e.g., "empowrapp-production")
- Click Create

### 2. Get Your Firebase Config
- In Firebase Console: Project Settings
- Copy the config object
- Should contain: apiKey, authDomain, projectId, storageBucket

### 3. Update App Config
Edit [firebase/config.ts](../firebase/config.ts):

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",  // Replace
  authDomain: "YOUR_AUTH_DOMAIN",  // Replace
  projectId: "YOUR_PROJECT_ID",  // Replace
  storageBucket: "YOUR_BUCKET",  // Replace
  // ... etc
};
```

### 4. Deploy Cloud Functions
```bash
npm install -g firebase-tools
firebase login
firebase deploy --project YOUR_PROJECT_ID
```

### 5. Update Firestore Rules
```bash
firebase deploy --only firestore:rules --project YOUR_PROJECT_ID
```

### 6. Enable Auth Methods
In Firebase Console:
- Authentication → Enable "Email/Password"
- Authentication → Enable "Anonymous"

## Verification

1. Test authentication: Try signing up in app
2. Test storage: Try uploading evidence file
3. Test sync: Check Firestore for app_data collection
4. Monitor: Check Firebase console for activity
```

**Files to Create/Modify:**
- [ ] Create `components/onboarding/FirebaseSetupWizard.tsx`
- [ ] Create `docs/FIREBASE_SETUP.md`
- [ ] Update `README.md` Firebase section
- [ ] Add link to setup wizard in Settings

---

### 1.2 Web Implicit Flow Token Refresh ⚠️

**Issue:** Web OAuth implicit flow tokens expire in 1 hour and cannot be refreshed  
**Impact:** Users must re-authenticate after 1 hour on web  
**Current Behavior:** No automatic refresh, no silent refresh  

#### Three Solutions (Choose One):

**Option A: Accept Current Limitation (Easiest)**
- Document: "Google Drive connections valid for 1 hour, then must re-authenticate"
- User experience: "Re-authenticate to continue" dialog after 1 hour
- Timeline: No work needed, acceptable for MVP

**Option B: Implement Code Flow with Backend Exchange (Recommended)**

```typescript
// services/gdrive.ts - Update webOAuthFlow()

// Instead of implicit flow (response_type=token)
// Use code flow (response_type=code)
// Exchange code on backend to get refresh token

function webOAuthFlow(...) {
  const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  oauthUrl.searchParams.set('response_type', 'code');  // Change: implicit → code
  oauthUrl.searchParams.set('access_type', 'offline');  // Add: get refresh token
  // ... rest of auth flow
}

// Backend exchange at https://3mpwrapp.pages.dev/gdrive-token-exchange
// Already implemented, just needs code flow instead of implicit
```

**Option C: Implement Silent Refresh with Hidden iFrame**

```typescript
// services/gdrive.ts - Add silent refresh

function silentRefreshToken() {
  // Create hidden iframe
  // Redirect to OAuth endpoint with prompt=none
  // Automatically get new token if user still has session
  // Use postMessage to communicate token back
}

// Triggers before token expires (5 min buffer)
```

**Recommendation:** Option B (Code Flow)
- Uses refresh tokens (standard OAuth practice)
- Works on all platforms consistently
- Better user experience (no re-auth required)

**Implementation Effort:** 2-3 days

---

## PRIORITY 2: HIGH (Should Fix Before Release)

### 2.1 WebDAV Real-World Testing ⚡

**Issue:** WebDAV implementation tested with code review, not with real servers  
**Risk:** May have edge cases with Nextcloud/OwnCloud versions  

#### Testing Checklist:

**Setup Test Environment:**
```bash
# Install Nextcloud via Docker
docker run -d \
  --name nextcloud \
  -p 8080:80 \
  -e NEXTCLOUD_ADMIN_USER=admin \
  -e NEXTCLOUD_ADMIN_PASSWORD=password \
  nextcloud

# Access at http://localhost:8080
```

**Test Cases:**

```typescript
// Test 1: Connection Test
const config: BYOCConfig = {
  kind: 'webdav',
  endpoint: 'http://localhost:8080/remote.php/dav/files/admin/',
  username: 'admin',
  password: 'password'
};

const result = await testBYOCConnection(config);
assert(result.ok === true);

// Test 2: Save File
await saveToGDrive('/settings.json', '{}', 'application/json');
// Verify file appears in Nextcloud UI

// Test 3: Load File
const data = await loadFromGDrive('/settings.json');
assert(data !== null);

// Test 4: Update File
await saveToGDrive('/settings.json', '{"updated": true}', 'application/json');
// Verify overwrites existing file

// Test 5: Delete File
const removed = await removeFromGDrive('/settings.json');
assert(removed === true);

// Test 6: Large File
const largeData = new Uint8Array(10 * 1024 * 1024); // 10MB
const result = await saveToGDrive('/large.bin', largeData);
assert(result === true);

// Test 7: Offline Then Online
await goOffline();
await saveToGDrive('/offline.json', '{}');
await goOnline();
// Verify sync catches up

// Test 8: Invalid Credentials
config.password = 'wrong';
const badResult = await testBYOCConnection(config);
assert(badResult.ok === false);
assert(badResult.error?.includes('401'));
```

**Document Compatibility:**
Create [docs/WEBDAV_COMPATIBILITY.md](docs/WEBDAV_COMPATIBILITY.md):

```markdown
# WebDAV Compatibility Matrix

## Tested & Verified
- [ ] Nextcloud 27 (latest stable)
- [ ] OwnCloud 10.x
- [ ] Seafile (if available)
- [ ] Standard WebDAV servers

## Known Issues
- Nextcloud 26: [Issue] Rate limiting on file ops
  - Workaround: Add delay between operations
- OwnCloud 10: [Issue] Special characters in filenames
  - Workaround: URL-encode filenames

## Configuration Examples

### Nextcloud
Endpoint: https://your-nextcloud.com/remote.php/dav/files/username/
Verify: File appears in Nextcloud Files app

### OwnCloud
Endpoint: https://your-owncloud.com/remote.php/dav/files/username/
Verify: File appears in OwnCloud Files app
```

**Timeline:** 1 week of testing

---

### 2.2 Enhance Error Messages for Cloud Providers ⚡

**Issue:** Generic error messages don't guide users to solutions  
**Impact:** Users struggle with troubleshooting  

#### Implementation:

```typescript
// services/cloudErrorGuide.ts (new file)

type CloudError = {
  code: string;
  userMessage: string;
  technicalMessage: string;
  suggestions: string[];
  learnMore: string;
};

const errorGuides: Record<string, CloudError> = {
  'gdrive_popup_blocked': {
    code: 'GDRIVE_POPUP_BLOCKED',
    userMessage: 'Browser blocked the Google sign-in popup',
    technicalMessage: 'window.open() returned null',
    suggestions: [
      'Allow popups for 3mpwrapp.pages.dev in browser settings',
      'Disable ad blockers that might block popups',
      'Try a different browser if popup blocker persists'
    ],
    learnMore: 'https://docs.3mpwr.com/google-drive-setup'
  },
  
  'gdrive_quota_exceeded': {
    code: 'GDRIVE_QUOTA_EXCEEDED',
    userMessage: 'Your Google Drive is full',
    technicalMessage: '413 Payload Too Large or quota exceeded',
    suggestions: [
      'Delete old files from Google Drive',
      'Reduce file size or image quality',
      'Upgrade Google One plan for more storage'
    ],
    learnMore: 'https://support.google.com/drive/answer/37603'
  },
  
  'webdav_401': {
    code: 'WEBDAV_AUTH_FAILED',
    userMessage: 'Invalid WebDAV username or password',
    technicalMessage: '401 Unauthorized',
    suggestions: [
      'Check username spelling (case-sensitive)',
      'Verify password is correct',
      'Reset password on Nextcloud admin panel',
      'Ensure WebDAV endpoint URL is correct'
    ],
    learnMore: 'https://docs.3mpwr.com/webdav-setup'
  },
  
  'firebase_quota_exceeded': {
    code: 'FIREBASE_QUOTA_EXCEEDED',
    userMessage: 'Firebase storage quota exceeded',
    technicalMessage: 'Firebase Storage quota exceeded',
    suggestions: [
      'Delete old evidence files',
      'Upgrade Firebase plan',
      'Use compressed file formats',
      'Set up file retention policy'
    ],
    learnMore: 'https://firebase.google.com/docs/storage/quotas'
  },
  
  'sync_offline': {
    code: 'SYNC_OFFLINE',
    userMessage: 'No internet connection - data will sync when online',
    technicalMessage: 'Network unreachable',
    suggestions: [
      'Check internet connection',
      'Verify WiFi or cellular is enabled',
      'Try moving closer to WiFi router',
      'Data will automatically sync when online'
    ],
    learnMore: null
  }
};

// Usage in error handlers:
function handleCloudError(error: Error, provider: string) {
  const guide = errorGuides[error.code] || errorGuides['generic'];
  
  return {
    title: guide.userMessage,
    subtitle: guide.technicalMessage,
    suggestions: guide.suggestions,
    primaryAction: {
      label: 'Learn More',
      onPress: () => openURL(guide.learnMore)
    },
    secondaryAction: {
      label: 'Retry',
      onPress: () => retryOperation()
    }
  };
}
```

**Update Error Handlers:**
```typescript
// In components/settings/BYOCCloudProviderSection.tsx

catch (error) {
  const guide = getCloudErrorGuide(error);
  Alert.alert(
    guide.userMessage,  // "Google Drive won't connect"
    guide.suggestions.join('\n'),  // Actionable tips
    [
      {
        text: 'Learn More',
        onPress: () => openURL(guide.learnMore)
      },
      {
        text: 'Retry',
        onPress: () => retryConnection()
      }
    ]
  );
}
```

**Timeline:** 3-5 days

---

## PRIORITY 3: MEDIUM (Should Do In Next Sprint)

### 3.1 Cloud Provider Status Dashboard 📋

**Feature:** Show user connection status and last sync time for all providers

**Create:** `components/settings/CloudProviderStatus.tsx`

```typescript
export function CloudProviderStatus() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cloud Storage Status</Text>
      
      <ProviderStatusCard
        provider="gdrive"
        status={gdriveStatus}
        lastSync={lastSyncTime}
        quota={quotaUsed}
        onAction={handleGDriveAction}
      />
      
      <ProviderStatusCard
        provider="webdav"
        status={webdavStatus}
        lastSync={lastSyncTime}
        quota={quotaUsed}
        onAction={handleWebDAVAction}
      />
    </View>
  );
}

// Status indicators:
// ✅ Connected, last sync 2 hours ago
// 🔄 Syncing... (show progress)
// ⚠️ Connection error - tap to retry
// 🔌 Not connected - tap to configure
```

**Timeline:** 1 week

---

### 3.2 Storage Quota Tracking 📋

**Feature:** Display storage usage and quota for each provider

```typescript
// services/quotaTracking.ts (new file)

export interface StorageQuota {
  provider: 'gdrive' | 'webdav' | 'firebase';
  used: number;       // bytes
  total: number;      // bytes
  percentage: number; // 0-100
  lastUpdated: number;
}

export async function getStorageQuota(provider: string): Promise<StorageQuota | null> {
  if (provider === 'gdrive') {
    return getGDriveQuota();
  } else if (provider === 'webdav') {
    return getWebDAVQuota();
  } else if (provider === 'firebase') {
    return getFirebaseQuota();
  }
  return null;
}

async function getGDriveQuota(): Promise<StorageQuota | null> {
  const accessToken = await getValidToken();
  if (!accessToken) return null;
  
  const response = await fetch(
    'https://www.googleapis.com/drive/v3/about?fields=storageQuota',
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  );
  
  const data = await response.json();
  return {
    provider: 'gdrive',
    used: data.storageQuota.usageInDrive,
    total: data.storageQuota.limit,
    percentage: Math.round((data.storageQuota.usageInDrive / data.storageQuota.limit) * 100),
    lastUpdated: Date.now()
  };
}
```

**UI Component:**
```typescript
// components/settings/StorageQuotaBar.tsx

export function StorageQuotaBar({ quota }: { quota: StorageQuota }) {
  const percentage = quota.percentage;
  const statusColor = percentage < 80 ? 'green' : percentage < 95 ? 'orange' : 'red';
  
  return (
    <View>
      <ProgressBar
        value={percentage}
        color={statusColor}
      />
      <Text>{formatBytes(quota.used)} / {formatBytes(quota.total)}</Text>
      {percentage > 90 && (
        <Text style={styles.warning}>
          Storage nearly full - consider deleting old files
        </Text>
      )}
    </View>
  );
}
```

**Timeline:** 1 week

---

### 3.3 Add Provider-Specific Documentation 📋

**Create documentation for each provider:**

- [ ] [docs/GOOGLE_DRIVE_SETUP.md](docs/GOOGLE_DRIVE_SETUP.md)
  - How to create OAuth app
  - How to get client ID
  - Troubleshooting connection issues
  - FAQ

- [ ] [docs/WEBDAV_SETUP.md](docs/WEBDAV_SETUP.md)
  - Nextcloud setup instructions
  - OwnCloud setup instructions
  - Finding your DAV endpoint
  - Creating app-specific password
  - Troubleshooting

- [ ] [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)
  - Create Firebase project
  - Enable Auth methods
  - Deploy Cloud Functions
  - Firestore rules setup

**Timeline:** 1 week

---

## PRIORITY 4: LOW (Nice to Have)

### 4.1 Implement Remaining Cloud Providers 🎯

**When ready, implement:**

**iCloud Drive**
- Requires Apple Developer account
- Use `react-native-icloud-sync`
- Implementation time: 2 weeks

**Dropbox**
- OAuth integration
- Dropbox API v2
- Implementation time: 1 week

**OneDrive**
- Microsoft OAuth
- Microsoft Graph API
- Implementation time: 1 week

**Box**
- Enterprise OAuth
- Box API
- Implementation time: 2 weeks

---

## IMPLEMENTATION ROADMAP

### Week 1-2: CRITICAL FIXES
- [ ] Create Firebase setup wizard (5 days)
- [ ] Test WebDAV with real Nextcloud (7 days)
- [ ] Document findings (2 days)

### Week 3-4: HIGH PRIORITY
- [ ] Implement web token refresh (10 days)
- [ ] Enhance error messages (5 days)
- [ ] Security audit improvements (3 days)

### Week 5-6: MEDIUM PRIORITY
- [ ] Cloud provider status dashboard (5 days)
- [ ] Storage quota tracking (5 days)
- [ ] Provider documentation (5 days)

### Week 7+: LOW PRIORITY
- [ ] Implement iCloud Drive (10 days)
- [ ] Implement Dropbox (7 days)
- [ ] Implement OneDrive (7 days)
- [ ] Implement Box (10 days)

---

## TESTING CHECKLIST

Before each release:

### Google Drive
- [ ] Connect with valid credentials
- [ ] Verify folder created in Drive
- [ ] Save test file
- [ ] Load test file
- [ ] Delete test file
- [ ] Disconnect and verify no access
- [ ] Test popup blocked error
- [ ] Test network timeout
- [ ] Test quota exceeded
- [ ] Test invalid token

### WebDAV
- [ ] Connect with valid Nextcloud
- [ ] Save test file to DAV
- [ ] Load test file from DAV
- [ ] Update test file
- [ ] Delete test file
- [ ] Test invalid credentials
- [ ] Test endpoint down
- [ ] Test large file (>10MB)
- [ ] Test special characters in filename
- [ ] Test offline then online

### Firebase
- [ ] Upload evidence file
- [ ] Download evidence file
- [ ] Verify Firestore sync
- [ ] Test offline queue
- [ ] Test quota exceeded
- [ ] Test network error

### Cross-Provider
- [ ] Switch between providers
- [ ] Sync with Provider A
- [ ] Switch to Provider B
- [ ] Verify data available in Provider B
- [ ] Test background sync
- [ ] Test multiple devices syncing

---

## SIGN-OFF

All action items documented and prioritized.

**Next Steps:**
1. Review with team
2. Add to sprint planning
3. Assign ownership
4. Set deadlines
5. Schedule reviews

**Questions?** Refer to [CLOUD_STORAGE_AUDIT_JAN2026.md](CLOUD_STORAGE_AUDIT_JAN2026.md) for full audit details.

---

**Prepared by:** AI Code Review Agent  
**Date:** January 9, 2026  
**Status:** READY FOR IMPLEMENTATION
