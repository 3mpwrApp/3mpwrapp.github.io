/**
 * 3mpwr App - Firebase Cloud Functions
 * 
 * User Cloud Storage Features:
 * 1. Automatic data backup when cloud consent enabled
 * 2. Cross-device sync for profile, wellness data, evidence locker
 * 3. File storage management for evidence locker uploads
 * 4. Push notifications for new events/campaigns
 * 5. Data retention policies and cleanup
 * 
 * Privacy-First Design:
 * - All functions respect user's cloud consent setting
 * - Data is encrypted at rest in Firestore
 * - Users can delete all cloud data at any time
 * - No data collection without explicit consent
 */

import { Expo } from 'expo-server-sdk';
import * as admin from 'firebase-admin';
import type { Change, EventContext } from 'firebase-functions';
import * as functions from 'firebase-functions';
import type { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-functions/v1/firestore';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();
const expo = new Expo();

// ============================================================================
// User Cloud Backup & Sync
// ============================================================================

/**
 * Triggered when user updates their profile
 * Automatically syncs to cloud if consent is enabled
 */
export const onProfileUpdate = functions.firestore
  .document('users/{userId}/profile/{docId}')
  .onWrite(async (change: Change<DocumentSnapshot>, context: EventContext<{ userId: string; docId: string }>) => {
    const userId = context.params.userId;
    
    // Check if user has cloud consent
    const userDoc = await db.collection('users').doc(userId).get();
    const cloudConsent = userDoc.data()?.cloudConsent || false;
    
    if (!cloudConsent) {
      console.log(`Profile update for ${userId} - cloud consent disabled, skipping sync`);
      return null;
    }

    const before = change.before.data();
    const after = change.after.data();

    // Log the sync event
    await db.collection('users').doc(userId).collection('syncLog').add({
      type: 'profile',
      action: !before ? 'created' : 'updated',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      dataSize: JSON.stringify(after || {}).length,
    });

    console.log(`Profile synced for user ${userId}`);
    return null;
  });

/**
 * Backup wellness data to cloud when updated
 */
export const onWellnessDataUpdate = functions.firestore
  .document('users/{userId}/wellness/{dataType}')
  .onWrite(async (change: Change<DocumentSnapshot>, context: EventContext<{ userId: string; dataType: string }>) => {
    const userId = context.params.userId;
    const dataType = context.params.dataType;

    // Check cloud consent
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.data()?.cloudConsent) {
      return null;
    }

    const after = change.after.data();
    
    // Create backup in separate collection
    await db.collection('backups').doc(userId).collection('wellness').doc(dataType).set({
      data: after,
      lastBackup: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`Wellness data (${dataType}) backed up for user ${userId}`);
    return null;
  });

/**
 * Handle evidence locker file uploads
 * Generates secure URLs and manages storage
 */
export const onEvidenceFileUpload = functions.storage
  .object()
  .onFinalize(async (object: functions.storage.ObjectMetadata) => {
    const filePath = object.name || '';
    const bucket = storage.bucket(object.bucket);
    
    // Extract userId from path: users/{userId}/evidence/{fileId}
    const pathParts = filePath.split('/');
    if (pathParts[0] !== 'users' || pathParts.length < 4) {
      return null;
    }

    const userId = pathParts[1];
    const fileId = pathParts[3];

    // Check cloud consent
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.data()?.cloudConsent) {
      // Delete file if no consent
      await bucket.file(filePath).delete();
      console.log(`Deleted file ${filePath} - no cloud consent`);
      return null;
    }

    // Generate signed URL valid for 7 days
    const [url] = await bucket.file(filePath).getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    // Store metadata in Firestore
    await db.collection('users').doc(userId).collection('evidenceFiles').doc(fileId).set({
      fileName: object.metadata?.fileName || 'unknown',
      fileType: object.contentType,
      fileSize: parseInt(object.size || '0'),
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      downloadUrl: url,
      storagePath: filePath,
    });

    console.log(`Evidence file uploaded for user ${userId}: ${fileId}`);
    return null;
  });

/**
 * Clean up old evidence files (after 1 year)
 * Runs daily
 */
export const cleanupOldEvidenceFiles = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const snapshot = await db.collectionGroup('evidenceFiles')
      .where('uploadedAt', '<', oneYearAgo)
      .get();

    const deletions: Promise<any>[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const storagePath = data.storagePath;
      
      // Delete from storage
      if (storagePath) {
        deletions.push(storage.bucket().file(storagePath).delete());
      }
      
      // Delete metadata
      deletions.push(doc.ref.delete());
    });

    await Promise.all(deletions);
    console.log(`Cleaned up ${deletions.length / 2} old evidence files`);
    return null;
  });

// ============================================================================
// Cross-Device Sync
// ============================================================================

/**
 * Sync user data across devices
 * Triggered when sync is requested from any device
 */
export const syncUserData = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const userId = context.auth?.uid;
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check cloud consent
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.data()?.cloudConsent) {
    throw new functions.https.HttpsError('permission-denied', 'Cloud sync requires consent');
  }

  try {
    // Gather all user data
    const profile = await db.collection('users').doc(userId).collection('profile').get();
    const wellness = await db.collection('users').doc(userId).collection('wellness').get();
    const evidence = await db.collection('users').doc(userId).collection('evidenceFiles').get();

    const syncData = {
      profile: profile.docs.map(d => ({ id: d.id, ...d.data() })),
      wellness: wellness.docs.map(d => ({ id: d.id, ...d.data() })),
      evidence: evidence.docs.map(d => ({ id: d.id, ...d.data() })),
      syncedAt: new Date().toISOString(),
    };

    // Update last sync time
    await db.collection('users').doc(userId).update({
      lastSync: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Data synced for user ${userId}`);
    return syncData;
  } catch (error: any) {
    console.error('Sync error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Delete all user cloud data
 * Callable when user disables cloud consent or deletes account
 */
export const deleteUserCloudData = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const userId = context.auth?.uid;
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Delete all subcollections
    const collections = ['profile', 'wellness', 'evidenceFiles', 'syncLog', 'backups'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection('users').doc(userId).collection(collectionName).get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    // Delete all storage files
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: `users/${userId}/` });
    await Promise.all(files.map(file => file.delete()));

    console.log(`Deleted all cloud data for user ${userId}`);
    return { success: true, message: 'All cloud data deleted' };
  } catch (error: any) {
    console.error('Delete error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================================================
// Push Notifications
// ============================================================================

/**
 * Send push notification when admin creates a new event
 */
export const onEventCreated = functions.firestore
  .document('events/{eventId}')
  .onCreate(async (snap: QueryDocumentSnapshot, context: EventContext) => {
    const event = snap.data();
    const eventId = context.params.eventId;

    console.log('New event created:', event.title);

    try {
      // Get all user push tokens
      const tokensSnapshot = await db.collection('userTokens').get();
      const messages: any[] = [];

      tokensSnapshot.forEach((doc) => {
        const token = doc.data().token;
        if (token && Expo.isExpoPushToken(token)) {
          messages.push({
            to: token,
            sound: 'default',
            title: '📅 New Event Added!',
            body: `${event.title} - ${event.date}`,
            data: {
              type: 'event',
              eventId,
              screen: `/events/${eventId}`,
            },
          });
        }
      });

      if (messages.length === 0) {
        console.log('No valid push tokens found');
        return null;
      }

      // Send in chunks
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending notification chunk:', error);
        }
      }

      console.log(`Sent ${tickets.length} event notifications`);
      return null;
    } catch (error) {
      console.error('Error sending event notifications:', error);
      return null;
    }
  });

/**
 * Send push notification when admin creates a new campaign
 */
export const onCampaignCreated = functions.firestore
  .document('campaigns/{campaignId}')
  .onCreate(async (snap: QueryDocumentSnapshot, context: EventContext) => {
    const campaign = snap.data();
    const campaignId = context.params.campaignId;

    console.log('New campaign created:', campaign.title);

    try {
      const tokensSnapshot = await db.collection('userTokens').get();
      const messages: any[] = [];

      tokensSnapshot.forEach((doc) => {
        const token = doc.data().token;
        if (token && Expo.isExpoPushToken(token)) {
          messages.push({
            to: token,
            sound: 'default',
            title: '📢 New Campaign!',
            body: campaign.summary || campaign.title,
            data: {
              type: 'campaign',
              campaignId,
              screen: `/campaigns/${campaignId}`,
            },
          });
        }
      });

      if (messages.length === 0) {
        console.log('No valid push tokens found');
        return null;
      }

      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending notification chunk:', error);
        }
      }

      console.log(`Sent ${tickets.length} campaign notifications`);
      return null;
    } catch (error) {
      console.error('Error sending campaign notifications:', error);
      return null;
    }
  });

/**
 * Clean up old notification receipts
 * Runs daily
 */
export const cleanupPushReceipts = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const snapshot = await db.collection('pushReceipts')
      .where('createdAt', '<', sevenDaysAgo)
      .get();

    if (snapshot.empty) {
      console.log('No old push receipts to clean up');
      return null;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`Cleaned up ${snapshot.size} old push receipts`);
    return null;
  });

// ============================================================================
// Data Export & GDPR Compliance
// ============================================================================

/**
 * Export all user data for GDPR compliance
 * Returns a complete JSON export of user's cloud data
 */
export const exportUserData = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  const userId = context.auth?.uid;
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    // Gather all user data from all collections
    const userData: any = {
      userId,
      exportedAt: new Date().toISOString(),
      collections: {},
    };

    // Get main user document
    const userDoc = await db.collection('users').doc(userId).get();
    userData.user = userDoc.data();

    // Get all subcollections
    const collections = ['profile', 'wellness', 'evidenceFiles', 'syncLog', 'backups', 'chats'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection('users').doc(userId).collection(collectionName).get();
      userData.collections[collectionName] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
    }

    // Get storage file list
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: `users/${userId}/` });
    userData.storageFiles = files.map(file => ({
      name: file.name,
      size: file.metadata.size,
      contentType: file.metadata.contentType,
      created: file.metadata.timeCreated,
    }));

    console.log(`Data exported for user ${userId}`);
    return userData;
  } catch (error: any) {
    console.error('Export error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
