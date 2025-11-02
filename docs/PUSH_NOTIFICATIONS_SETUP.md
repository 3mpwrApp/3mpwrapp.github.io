# Push Notifications Setup Guide

## Overview

This guide explains how to implement push notifications for new events and campaigns. When an admin creates a new event or campaign, all users will receive a push notification.

## 🎯 What's Already Done

✅ **Local Notifications**: `services/notifications.ts` has functions for:
- `scheduleLocal()` - Send immediate local notifications
- `scheduleDailyAt()` - Schedule recurring daily notifications  
- `scheduleAt()` - Schedule notifications at specific times
- `getExpoPushToken()` - Get user's push token

✅ **Push Functions Added**: New functions in `services/notifications.ts`:
- `notifyAllUsers()` - Send push to all users
- `sendEventNotification()` - Notify about new events
- `sendCampaignNotification()` - Notify about new campaigns
- `registerUserPushToken()` - Store user tokens

## 📋 Implementation Options

### Option 1: Firebase Cloud Functions (Recommended)

**Best for**: Production apps, automatic notifications, scalability

**How it works**:
1. Admin creates event/campaign in Firestore
2. Cloud Function automatically triggers
3. Function fetches all user tokens from Firestore
4. Sends push notifications via Expo Push API
5. Users receive notifications

**Pros**:
- ✅ Fully automatic
- ✅ Reliable and scalable
- ✅ No app code changes needed
- ✅ Works even if app is closed

**Implementation**:

#### Step 1: Create Firebase Cloud Functions

Create `firebase/functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Expo } from 'expo-server-sdk';

admin.initializeApp();
const expo = new Expo();

// Helper: Send push notification to all users
async function sendPushToAllUsers(
  title: string,
  body: string,
  data: Record<string, any>
) {
  try {
    // Get all user push tokens from Firestore
    const tokensSnapshot = await admin
      .firestore()
      .collection('userTokens')
      .get();

    const pushTokens: string[] = [];
    tokensSnapshot.forEach((doc) => {
      const token = doc.data().token;
      if (token && Expo.isExpoPushToken(token)) {
        pushTokens.push(token);
      }
    });

    if (pushTokens.length === 0) {
      console.log('No valid push tokens found');
      return;
    }

    // Create messages
    const messages = pushTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

    // Send in chunks (Expo recommends chunks of 100)
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        console.log('Sent chunk:', ticketChunk.length);
      } catch (error) {
        console.error('Error sending chunk:', error);
      }
    }

    console.log(`Sent ${tickets.length} notifications`);
    return tickets;
  } catch (error) {
    console.error('Error sending push notifications:', error);
    throw error;
  }
}

// Trigger when new event is created
export const onEventCreated = functions.firestore
  .document('events/{eventId}')
  .onCreate(async (snap, context) => {
    const event = snap.data();
    const eventId = context.params.eventId;

    console.log('New event created:', event.title);

    await sendPushToAllUsers(
      '📅 New Event Added!',
      `${event.title} - ${event.date}`,
      {
        type: 'event',
        eventId,
        screen: `/events/${eventId}`,
      }
    );

    console.log('Event notification sent:', event.title);
  });

// Trigger when new campaign is created
export const onCampaignCreated = functions.firestore
  .document('campaigns/{campaignId}')
  .onCreate(async (snap, context) => {
    const campaign = snap.data();
    const campaignId = context.params.campaignId;

    console.log('New campaign created:', campaign.title);

    await sendPushToAllUsers(
      '📢 New Campaign!',
      campaign.summary || campaign.title,
      {
        type: 'campaign',
        campaignId,
        screen: `/campaigns/${campaignId}`,
      }
    );

    console.log('Campaign notification sent:', campaign.title);
  });

// Optional: Clean up old push receipts (run daily)
export const cleanupPushReceipts = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    await admin
      .firestore()
      .collection('pushReceipts')
      .where('createdAt', '<', cutoff.toISOString())
      .get()
      .then((snapshot) => {
        const batch = admin.firestore().batch();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        return batch.commit();
      });

    console.log('Cleaned up old push receipts');
  });
```

#### Step 2: Install Dependencies

```bash
cd firebase/functions
npm install expo-server-sdk firebase-admin firebase-functions
```

#### Step 3: Deploy Functions

```bash
cd firebase/functions
npm run build
firebase deploy --only functions
```

#### Step 4: Register User Tokens in App

Update your auth flow (e.g., `store/auth.tsx` or `_layout.tsx`):

```typescript
import { registerUserPushToken } from '../services/notifications';

// After user logs in
React.useEffect(() => {
  async function setupPush() {
    if (user?.uid) {
      await registerUserPushToken(user.uid);
    }
  }
  setupPush();
}, [user?.uid]);
```

---

### Option 2: Manual Trigger (Quick Start)

**Best for**: Testing, simple setups, immediate implementation

**How it works**:
1. Admin creates event/campaign in app
2. App code manually calls notification function
3. Function sends to all stored tokens
4. Users receive notifications

**Pros**:
- ✅ Quick to implement
- ✅ No backend setup needed
- ✅ Good for testing

**Cons**:
- ❌ Only works when admin's app is open
- ❌ Less reliable than Cloud Functions
- ❌ Requires app to have all user tokens

**Implementation**:

#### Update Event Creation

In `app/events/index.impl.tsx` (or wherever events are created):

```typescript
import { sendEventNotification } from '../../services/notifications';
import { Alert } from 'react-native';

const handleCreateEvent = async (newEvent) => {
  try {
    // Create event in Firestore
    const eventId = await fsAddEvent(newEvent);
    
    // Send notification to all users
    const result = await sendEventNotification({
      id: eventId,
      title: newEvent.title,
      date: newEvent.date,
      location: newEvent.location,
    });

    if (result.success) {
      Alert.alert('Success', 'Event created and users notified!');
    } else {
      Alert.alert('Success', 'Event created (notification pending)');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to create event');
    console.error(error);
  }
};
```

#### Update Campaign Creation

Similar pattern for campaigns:

```typescript
import { sendCampaignNotification } from '../../services/notifications';

const handleCreateCampaign = async (newCampaign) => {
  try {
    const campaignId = await fsAddCampaign(newCampaign);
    
    await sendCampaignNotification({
      id: campaignId,
      title: newCampaign.title,
      summary: newCampaign.summary,
    });

    Alert.alert('Success', 'Campaign created and users notified!');
  } catch (error) {
    Alert.alert('Error', 'Failed to create campaign');
  }
};
```

---

### Option 3: Backend API (Custom)

**Best for**: Apps with existing backend, more control

**How it works**:
1. Admin creates event/campaign
2. App sends request to your backend API
3. Backend fetches user tokens from database
4. Backend sends push via Expo Push API
5. Users receive notifications

**Implementation**:

Create API endpoint (Node.js/Express example):

```javascript
// server/routes/notifications.js
const { Expo } = require('expo-server-sdk');
const admin = require('firebase-admin');

const expo = new Expo();

app.post('/api/notify/event', async (req, res) => {
  const { eventId, title, date } = req.body;

  try {
    // Get all user tokens from Firestore
    const tokensSnapshot = await admin
      .firestore()
      .collection('userTokens')
      .get();

    const messages = [];
    tokensSnapshot.forEach((doc) => {
      const token = doc.data().token;
      if (Expo.isExpoPushToken(token)) {
        messages.push({
          to: token,
          sound: 'default',
          title: '📅 New Event Added!',
          body: `${title} - ${date}`,
          data: { type: 'event', eventId },
        });
      }
    });

    // Send notifications
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    res.json({ success: true, sent: tickets.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🔧 Additional Setup

### 1. Store User Push Tokens

Update your authentication flow to store tokens:

```typescript
// In store/auth.tsx or _layout.tsx after login
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getExpoPushToken } from '../services/notifications';

async function storeUserPushToken(userId: string) {
  const token = await getExpoPushToken();
  if (!token) return;

  const db = getFirestore();
  await setDoc(doc(db, 'userTokens', userId), {
    token,
    platform: Platform.OS,
    updatedAt: new Date().toISOString(),
  });
}

// Call after successful login
await storeUserPushToken(user.uid);
```

### 2. Handle Notification Taps

Update `_layout.tsx` to handle notification taps:

```typescript
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

function RootLayout() {
  const router = useRouter();

  React.useEffect(() => {
    // Handle notification tap when app is foregrounded
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        
        if (data.screen) {
          router.push(data.screen as any);
        } else if (data.type === 'event' && data.eventId) {
          router.push(`/events/${data.eventId}`);
        } else if (data.type === 'campaign' && data.campaignId) {
          router.push(`/campaigns/${data.campaignId}`);
        }
      }
    );

    return () => subscription.remove();
  }, []);

  // ... rest of layout
}
```

### 3. Request Permissions on App Start

```typescript
// In _layout.tsx or App entry point
import { setupAsync } from './services/notifications';

React.useEffect(() => {
  async function setup() {
    const granted = await setupAsync();
    if (!granted) {
      console.log('Push notifications permission denied');
    }
  }
  setup();
}, []);
```

---

## 🧪 Testing

### Test Local Notifications

```typescript
import { sendTestLocal } from '../services/notifications';

// In any component
<Button onPress={sendTestLocal} title="Send Test Notification" />
```

### Test Push Notifications

Use the script in `scripts/send-expo-push.mjs`:

```bash
node scripts/send-expo-push.mjs
```

Or test via Profile screen (already has test button).

### Test Notification Tap

1. Send a test notification
2. Tap the notification
3. App should navigate to correct screen

---

## 📊 Monitoring & Analytics

### Track Notification Delivery

```typescript
// In Cloud Functions
export const trackNotificationReceipts = functions.pubsub
  .schedule('every 30 minutes')
  .onRun(async () => {
    // Check receipts from Expo
    const tickets = []; // Get from your storage
    const receiptIds = tickets.map(t => t.id);
    
    const receipts = await expo.getPushNotificationReceiptsAsync(receiptIds);
    
    // Store or log results
    console.log('Notification receipts:', receipts);
  });
```

### Add Analytics

```typescript
import { track } from './services/analytics';

// After sending notification
await sendEventNotification(event);
track('notification_sent', {
  type: 'event',
  eventId: event.id,
});
```

---

## 🔒 Security Considerations

1. **Admin-Only Creation**: Ensure only admins can create events/campaigns
   ```typescript
   if (!isAdmin) {
     throw new Error('Unauthorized');
   }
   ```

2. **Rate Limiting**: Prevent spam by limiting notification frequency
   ```typescript
   // In Cloud Functions
   const lastNotification = await admin.firestore()
     .collection('notificationMetadata')
     .doc('lastSent')
     .get();
   
   const lastTime = lastNotification.data()?.timestamp;
   if (lastTime && Date.now() - lastTime < 60000) {
     console.log('Rate limit: too soon since last notification');
     return;
   }
   ```

3. **Token Validation**: Always validate tokens before sending
   ```typescript
   if (!Expo.isExpoPushToken(token)) {
     console.warn('Invalid token:', token);
     continue;
   }
   ```

---

## 🎯 Quick Start Checklist

- [ ] Choose implementation option (Cloud Functions recommended)
- [ ] Add token storage on user login
- [ ] Deploy Cloud Functions OR add manual triggers
- [ ] Test with local notifications first
- [ ] Test push notifications with script
- [ ] Add notification tap handling
- [ ] Monitor notification delivery
- [ ] Deploy to production

---

## 📚 Resources

- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [expo-server-sdk](https://github.com/expo/expo-server-sdk-node)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

## ❓ FAQ

**Q: Do notifications work in Expo Go?**  
A: No, push notifications require a development build or production build. Use `eas build` to create a build.

**Q: How many notifications can I send?**  
A: Expo has rate limits. For production, consider batching and pacing notifications.

**Q: What if a user denies permission?**  
A: Store in Firestore and don't send to that user. Prompt them to enable in Settings.

**Q: Can I test without a device?**  
A: Use iOS Simulator or Android Emulator with `expo-notifications` for local notifications. Push requires physical device.

**Q: Do I need an Apple Developer account?**  
A: For production iOS push notifications, yes. For testing, no.

---

## 🚀 Next Steps

After implementing push notifications:

1. Add user preferences for notification types
2. Implement quiet hours
3. Add notification history
4. Create notification templates
5. Add A/B testing for notification content

Need help? Check the implementation in `services/notifications.ts` or ask!
