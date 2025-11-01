# Events & Campaigns Improvements

## ✅ Completed

### 1. Fixed Event Detail 404 Error
**Problem**: Created events showed 404 when clicked because detail page only checked static `data/events.ts`

**Solution**: Updated `app/events/[id].tsx` to:
- Fetch from Firestore first using `fsGetEvent(id)`
- Fall back to local events if not found
- Show loading indicator while fetching
- Show "Not Found" message if event doesn't exist

### 2. Added Firestore CRUD Functions

**Events** (`services/firestore.ts`):
- ✅ `fsGetEvent(id)` - Fetch single event from Firestore
- ✅ `fsUpdateEvent(id, updates)` - Update event (admin only)
- ✅ `fsDeleteEvent(id)` - Delete event (admin only)

**Campaigns** (`services/firestore.ts`):
- ✅ `fsGetCampaign(id)` - Fetch single campaign
- ✅ `fsUpdateCampaign(id, updates)` - Update campaign (admin only)
- ✅ `fsDeleteCampaign(id)` - Delete campaign (admin only)

### 3. Added Edit/Delete/Share Functionality to Events

**Features Added** (`app/events/[id].tsx`):
- ✅ **Edit Button** (Admin only) - Opens modal with form to edit event details
- ✅ **Delete Button** (Admin only) - Confirmation dialog then deletes from Firestore
- ✅ **Share to Socials Button** - Enhanced share with formatted message including emoji
- ✅ Loading states and error handling
- ✅ Automatic redirect after delete

**Admin Controls**:
```tsx
{isAdmin && (
  <>
    <Button onPress={handleEdit}>✏️ Edit</Button>
    <Button onPress={handleDelete}>🗑️ Delete</Button>
  </>
)}
```

**Share Format**:
```
📅 [Event Title]

[Description]

📍 [Location/Virtual]
🗓️ [Date/Time]

Shared from 3mpwr App
```

---

## 🔄 Remaining Tasks

### 1. Update Campaigns Detail Page

Need to update `app/campaigns/[id].tsx` similar to events:
1. Fetch from Firestore using `fsGetCampaign(id)`
2. Add Edit button for admins
3. Add Delete button for admins
4. Enhance "Share" button with formatted message

**Implementation**:
```typescript
// Add to campaigns/[id].tsx
import { fsGetCampaign, fsUpdateCampaign, fsDeleteCampaign } from '../../services/firestore';

// Load campaign from Firestore
React.useEffect(() => {
  async function load() {
    const fsCampaign = await fsGetCampaign(id);
    if (fsCampaign) setCampaign(fsCampaign);
  }
  load();
}, [id]);

// Add admin buttons
{isAdmin && (
  <>
    <Button onPress={handleEdit}>✏️ Edit Campaign</Button>
    <Button onPress={handleDelete}>🗑️ Delete Campaign</Button>
  </>
)}

// Enhanced share
const shareToSocials = async () => {
  const message = `📢 ${campaign.title}\n\n${campaign.summary}\n\nJoin: https://empowr.app/campaigns/${campaign.id}\n\nShared from 3mpwr App`;
  await Share.share({ message, title: campaign.title });
};
```

### 2. Set Up Push Notifications for New Events/Campaigns

**Goal**: Notify all users when admin creates a new event or campaign

**Implementation Steps**:

#### A. Create Notification Service Functions

Add to `services/notifications.ts`:

```typescript
export async function notifyAllUsers(notification: {
  title: string;
  body: string;
  data?: Record<string, any>;
}) {
  // Option 1: Expo Push Notifications (recommended)
  // Send to topic "all-users" that everyone auto-subscribes to
  
  const messages = [{
    to: 'ExponentPushToken[all-users]',
    sound: 'default',
    title: notification.title,
    body: notification.body,
    data: notification.data,
  }];

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  return response.json();
}

export async function sendEventNotification(event: any) {
  return notifyAllUsers({
    title: '📅 New Event Added!',
    body: `${event.title} - ${event.date}`,
    data: {
      type: 'event',
      eventId: event.id,
      screen: '/events/[id]',
    },
  });
}

export async function sendCampaignNotification(campaign: any) {
  return notifyAllUsers({
    title: '📢 New Campaign!',
    body: campaign.title,
    data: {
      type: 'campaign',
      campaignId: campaign.id,
      screen: '/campaigns/[id]',
    },
  });
}
```

#### B. Add Firebase Cloud Function (Alternative/Better approach)

Create `firebase/functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Trigger when new event is added to Firestore
export const onEventCreated = functions.firestore
  .document('events/{eventId}')
  .onCreate(async (snap, context) => {
    const event = snap.data();
    
    // Send to FCM topic "all-users"
    const message = {
      notification: {
        title: '📅 New Event!',
        body: `${event.title} - ${event.date}`,
      },
      data: {
        type: 'event',
        eventId: context.params.eventId,
      },
      topic: 'all-users',
    };

    await admin.messaging().send(message);
    console.log('Event notification sent:', event.title);
  });

// Trigger when new campaign is added
export const onCampaignCreated = functions.firestore
  .document('campaigns/{campaignId}')
  .onCreate(async (snap, context) => {
    const campaign = snap.data();
    
    const message = {
      notification: {
        title: '📢 New Campaign!',
        body: campaign.title,
      },
      data: {
        type: 'campaign',
        campaignId: context.params.campaignId,
      },
      topic: 'all-users',
    };

    await admin.messaging().send(message);
    console.log('Campaign notification sent:', campaign.title);
  });
```

#### C. Update App to Subscribe to "all-users" Topic

Add to your notification setup (likely in `_layout.tsx` or `AuthContext`):

```typescript
import * as Notifications from 'expo-notifications';
import { subscribeToTopic } from './services/notifications';

// In useEffect after user signs in
React.useEffect(() => {
  async function setup() {
    const token = await Notifications.getExpoPushTokenAsync();
    
    // Subscribe to all-users topic
    await subscribeToTopic(token.data, 'all-users');
    
    console.log('Subscribed to all-users notifications');
  }
  
  if (user) setup();
}, [user]);
```

#### D. Manual Notification Option (Immediate)

Until Cloud Functions are deployed, add manual notification trigger after event/campaign creation:

```typescript
// In app/events/index.impl.tsx after fsAddEvent
const handleCreate = async (newEvent) => {
  const success = await fsAddEvent(newEvent);
  
  if (success) {
    // Send notification to all users
    await sendEventNotification(newEvent);
    Alert.alert('Success', 'Event created and users notified!');
  }
};
```

### 3. Update Firestore Security Rules

Add to `firebase/firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Events: Read public, Write admin only
    match /events/{eventId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Campaigns: Read public, Write admin only
    match /campaigns/{campaignId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

Deploy rules:
```bash
npm run rules:deploy
```

---

## Testing Checklist

### Events
- [ ] Create event in app as admin
- [ ] Event appears in list
- [ ] Click event to view details (no 404)
- [ ] Edit button visible for admin
- [ ] Edit event successfully
- [ ] Delete event with confirmation
- [ ] Share to socials button works
- [ ] Non-admin users cannot edit/delete

### Campaigns
- [ ] Create campaign as admin
- [ ] Campaign appears in list
- [ ] Click campaign to view details
- [ ] Edit button visible for admin
- [ ] Edit campaign successfully
- [ ] Delete campaign with confirmation
- [ ] Share to socials works
- [ ] Non-admin cannot edit/delete

### Notifications
- [ ] Create event → all users get notification
- [ ] Create campaign → all users get notification
- [ ] Notification opens correct detail screen
- [ ] Notification sound/badge works

---

## Quick Implementation Guide

### Priority 1: Fix Campaigns Detail Page (5 min)
Update `app/campaigns/[id].tsx` similar to events implementation above.

### Priority 2: Add Notification Triggers (10 min)
Add manual notification calls after create operations in:
- `app/events/index.impl.tsx`
- `app/campaigns/index.tsx`

### Priority 3: Deploy Firebase Functions (15 min)
Set up Cloud Functions for automatic notifications on Firestore writes.

### Priority 4: Update Security Rules (2 min)
Deploy updated Firestore rules to enforce admin-only writes.

---

## Files Modified

### Completed
- ✅ `services/firestore.ts` - Added CRUD functions
- ✅ `app/events/[id].tsx` - Fixed 404, added edit/delete/share

### Pending
- ⏳ `app/campaigns/[id].tsx` - Need edit/delete/share
- ⏳ `services/notifications.ts` - Need notification functions
- ⏳ `firebase/functions/` - Need Cloud Functions
- ⏳ `firebase/firestore.rules` - Need security rules update

---

## Questions?

- **How do I test notifications?** Use `scripts/send-expo-push.mjs` to send test notifications
- **What if Cloud Functions fail?** Use manual notification triggers until fixed
- **Can users create events?** No, only admins (checked via `isAdmin` from `useAuth()`)
- **What about offline mode?** Events/campaigns cache locally and sync when online

Need help? Check `README.md` or ask me!
