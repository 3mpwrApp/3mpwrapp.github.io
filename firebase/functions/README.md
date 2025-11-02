# 3mpwr App - Firebase Cloud Functions

Firebase Cloud Functions for user cloud storage, data sync, and push notifications.

## Features

### 🔐 Privacy-First Design
- **Consent-Based**: All functions respect user's cloud consent setting
- **User Control**: Users can delete all cloud data anytime
- **Encrypted Storage**: Data encrypted at rest in Firestore
- **GDPR Compliant**: Data export and deletion capabilities

### ☁️ Cloud Storage & Sync
- **Automatic Backup**: Profile and wellness data backed up when updated
- **Cross-Device Sync**: Sync data across all user's devices
- **Evidence Locker**: Secure file storage for legal documents/photos
- **Data Retention**: Auto-cleanup of old files (1 year retention)

### 🔔 Push Notifications
- **Event Notifications**: Notify all users when admin creates events
- **Campaign Notifications**: Notify all users about new campaigns
- **Smart Delivery**: Batched sending for efficiency
- **Receipt Tracking**: Monitor notification delivery

### 📊 Data Management
- **Sync Logging**: Track all sync operations
- **Storage Monitoring**: Monitor file uploads and sizes
- **Cleanup Jobs**: Daily cleanup of old data
- **Export Feature**: GDPR-compliant data export

## Setup

### 1. Install Dependencies

```bash
cd firebase/functions
npm install
```

### 2. Configure Firebase

Make sure you have Firebase CLI installed:

```bash
npm install -g firebase-tools
firebase login
```

### 3. Initialize Firebase Project

If not already initialized:

```bash
firebase init
```

Select:
- ✅ Functions
- ✅ Firestore
- ✅ Storage

### 4. Deploy Functions

```bash
# Build TypeScript
npm run build

# Deploy all functions
npm run deploy

# Or deploy specific function
firebase deploy --only functions:onEventCreated
```

## Functions Reference

### Cloud Backup & Sync

#### `onProfileUpdate`
- **Trigger**: Firestore write to `users/{userId}/profile/{docId}`
- **Purpose**: Auto-sync profile changes to cloud
- **Privacy**: Checks cloud consent before syncing

#### `onWellnessDataUpdate`
- **Trigger**: Firestore write to `users/{userId}/wellness/{dataType}`
- **Purpose**: Backup wellness data (mood, energy, symptoms)
- **Storage**: Creates backup in separate collection

#### `onEvidenceFileUpload`
- **Trigger**: Storage file upload to `users/{userId}/evidence/*`
- **Purpose**: Process evidence locker uploads
- **Features**: 
  - Generates signed URLs (7-day expiry)
  - Stores metadata in Firestore
  - Deletes file if no consent

#### `cleanupOldEvidenceFiles`
- **Schedule**: Daily at midnight
- **Purpose**: Delete files older than 1 year
- **Scope**: All users' old evidence files

### Cross-Device Sync

#### `syncUserData` (Callable)
- **Auth**: Required
- **Purpose**: Sync all user data to current device
- **Returns**: Complete user data snapshot
- **Usage**:
  ```typescript
  import { getFunctions, httpsCallable } from 'firebase/functions';
  
  const functions = getFunctions();
  const syncData = httpsCallable(functions, 'syncUserData');
  const result = await syncData();
  ```

#### `deleteUserCloudData` (Callable)
- **Auth**: Required
- **Purpose**: Delete all user's cloud data
- **Scope**: Deletes all Firestore docs and Storage files
- **Usage**:
  ```typescript
  const deleteData = httpsCallable(functions, 'deleteUserCloudData');
  const result = await deleteData();
  ```

### Push Notifications

#### `onEventCreated`
- **Trigger**: Firestore create in `events/{eventId}`
- **Purpose**: Notify all users about new event
- **Message**: "📅 New Event Added! {title} - {date}"

#### `onCampaignCreated`
- **Trigger**: Firestore create in `campaigns/{campaignId}`
- **Purpose**: Notify all users about new campaign
- **Message**: "📢 New Campaign! {summary}"

#### `cleanupPushReceipts`
- **Schedule**: Daily
- **Purpose**: Delete notification receipts older than 7 days

### GDPR Compliance

#### `exportUserData` (Callable)
- **Auth**: Required
- **Purpose**: Export all user data as JSON
- **Returns**: Complete data export including:
  - Profile data
  - Wellness data
  - Evidence files metadata
  - Sync logs
  - Storage file list
- **Usage**:
  ```typescript
  const exportData = httpsCallable(functions, 'exportUserData');
  const result = await exportData();
  const json = JSON.stringify(result.data, null, 2);
  ```

## App Integration

### Register Push Token

Add to your app after user logs in:

```typescript
// In app/store/auth.tsx or _layout.tsx
import { getExpoPushToken } from '../services/notifications';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

React.useEffect(() => {
  async function registerToken() {
    if (user?.uid) {
      const token = await getExpoPushToken();
      if (token) {
        await setDoc(doc(db, 'userTokens', user.uid), {
          token,
          platform: Platform.OS,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }
  registerToken();
}, [user?.uid]);
```

### Sync User Data

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const syncData = httpsCallable(functions, 'syncUserData');

async function syncToCloud() {
  try {
    const result = await syncData();
    console.log('Synced:', result.data);
  } catch (error) {
    console.error('Sync failed:', error);
  }
}
```

### Delete Cloud Data

```typescript
const deleteData = httpsCallable(functions, 'deleteUserCloudData');

async function clearCloudData() {
  const confirmed = await Alert.alert(
    'Delete Cloud Data',
    'This will permanently delete all your cloud data.',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          await deleteData();
          // Update local consent setting
          await setCloudConsent(false);
        }
      }
    ]
  );
}
```

## Monitoring

### View Logs

```bash
# Real-time logs
firebase functions:log

# Filter by function
firebase functions:log --only onEventCreated

# Last 100 lines
firebase functions:log --limit 100
```

### Firebase Console

Monitor functions in Firebase Console:
- https://console.firebase.google.com/
- Navigate to: Functions → Dashboard
- View: Invocations, execution time, errors

## Cost Optimization

### Free Tier Limits
- 2M invocations/month
- 400,000 GB-seconds compute time
- 200,000 CPU-seconds
- 5GB network egress

### Optimization Tips
1. **Batch Operations**: Use batched writes for multiple docs
2. **Cleanup Jobs**: Schedule during low-traffic hours
3. **Caching**: Cache frequently accessed data
4. **Indexes**: Add Firestore indexes for queries

## Security

### Firestore Rules

Ensure proper security rules in `firebase/firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // User tokens for push notifications
    match /userTokens/{userId} {
      allow write: if request.auth.uid == userId;
      allow read: if request.auth.token.admin == true;
    }
    
    // Events and campaigns readable by all, writable by admins
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    match /campaigns/{campaignId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

### Storage Rules

Ensure proper security rules in `firebase/storage.rules`:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### Function Won't Deploy

```bash
# Check for errors
npm run build

# Ensure correct Node version
node --version  # Should be 18.x

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Function Not Triggering

1. Check Firebase Console logs
2. Verify Firestore/Storage path matches trigger
3. Ensure user has cloud consent enabled
4. Check function deployment status

### Push Notifications Not Sending

1. Verify user has valid push token
2. Check `userTokens` collection in Firestore
3. View function logs for errors
4. Test with `expo-push-tool`

## Development

### Local Testing

```bash
# Start emulators
npm run serve

# Test callable functions
npm run shell
> syncUserData({})
```

### Build & Watch

```bash
npm run build:watch
```

## Resources

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage](https://firebase.google.com/docs/storage)

## Support

For issues or questions:
1. Check Firebase Console logs
2. Review function code in `src/index.ts`
3. Test with Firebase emulators
4. Check app logs for client-side errors

---

**Privacy First**: All functions respect user consent and GDPR requirements.
