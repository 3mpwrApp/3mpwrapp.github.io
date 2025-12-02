/**
 * Firestore Event Sync Service
 * Enables bidirectional real-time sync between app and Firestore events_production collection
 * Events created/edited/deleted on app automatically sync to Firestore
 * Changes in Firestore are pushed to app via real-time listeners
 */

import { getApp, getApps, initializeApp } from "firebase/app";
import type * as Fire from "firebase/firestore";

import { logger } from "../utils/logger";

// Firebase config for events (public data, not subject to BYOC restrictions)
// Events are public community data that all users can read
const firebaseConfig = {
  apiKey: "AIzaSyBv4rtD3it2yoIIFpxckCEXC9haKIbVjA8",
  authDomain: "empowrapp.firebaseapp.com",
  projectId: "empowrapp",
  storageBucket: "empowrapp.firebasestorage.app",
  messagingSenderId: "733708119893",
  appId: "1:733708119893:web:fdfb57d1be572fb3ee89dc",
  measurementId: "G-LKEKHG4GQ6",
};

let mod: typeof Fire | null = null;
let eventsDb: Fire.Firestore | null = null;

async function ensure(): Promise<typeof Fire | null> {
  if (mod) return mod;
  try {
    mod = await import("firebase/firestore");
    return mod;
  } catch {
    return null;
  }
}

/**
 * Get or create a Firestore instance specifically for events.
 * This bypasses BYOC mode since events are public community data.
 */
export async function getDB(): Promise<Fire.Firestore | null> {
  // Return cached instance if available
  if (eventsDb) return eventsDb;

  const m = await ensure();
  if (!m) {
    logger.warn('[FirestoreSyncEvent] Firestore module not available');
    return null;
  }

  try {
    // Use existing Firebase app or create one
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    
    // Initialize Firestore for events (with long polling for React Native)
    const { initializeFirestore, getFirestore } = m;
    const platformOS = (await import('react-native')).Platform?.OS || 'web';
    
    if (platformOS === 'web') {
      eventsDb = getFirestore(app);
    } else {
      // Use long polling for React Native to avoid WebSocket issues
      eventsDb = initializeFirestore(app, { experimentalForceLongPolling: true });
    }
    
    logger.log('[FirestoreSyncEvent] Events Firestore initialized for platform:', platformOS);
    return eventsDb;
  } catch (error) {
    // If Firestore is already initialized, get the existing instance
    try {
      const app = getApp();
      eventsDb = m.getFirestore(app);
      return eventsDb;
    } catch {
      logger.error('[FirestoreSyncEvent] Failed to initialize Firestore for events:', error);
      return null;
    }
  }
}

/**
 * Convert UTC Date to EST timezone string
 * Firestore stores dates in UTC, we need to convert to EST for display
 */
function convertUTCtoEST(date: Date): string {
  // Convert to EST (America/New_York)
  return date.toLocaleString('en-US', { 
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Event data interface for Firestore sync operations
 */
export interface FirestoreSyncEvent {
  id: string;
  title: string;
  description: string;
  date: Date | string;
  time?: string;
  duration?: string;
  location?: string;
  isVirtual?: boolean;
  asl?: boolean;
  captions?: boolean;
  stepFree?: boolean;
  sensorySpace?: boolean;
  energyLevel?: 'low' | 'medium' | 'high';
  requiresRSVP?: boolean;
  rsvpDetails?: string;
  category?: string;
  tags?: string[];
  organizer?: string;
  imageUrl?: string;
  attendeeCount?: number;
  url?: string;
  createdBy: string;
  createdAt?: number;
  updatedAt?: number;
  status?: 'published' | 'draft';
}

/**
 * Create or update event in events_production collection
 * This collection is read by the Cloudflare Worker and displayed on the website
 * @param event Event data
 * @param uid User ID (creator)
 * @param collection Which collection to sync to ('events_production' or 'events_preview')
 * @returns True if successful
 */
export async function syncEventToProduction(event: FirestoreSyncEvent, uid: string, collection: 'events_production' | 'events_preview' = 'events_production'): Promise<boolean> {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) {
    logger.warn('[FirestoreSyncEvent] Firestore not available for production sync');
    return false;
  }

  try {
    const eventData = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date instanceof Date ? m.Timestamp.fromDate(event.date) : m.Timestamp.fromDate(new Date(event.date)),
      time: event.time || '',
      duration: event.duration || '',
      location: event.location || '',
      isVirtual: event.isVirtual || false,
      asl: event.asl || false,
      captions: event.captions || false,
      stepFree: event.stepFree || false,
      sensorySpace: event.sensorySpace || false,
      energyLevel: event.energyLevel || 'medium',
      requiresRSVP: event.requiresRSVP || false,
      rsvpDetails: event.rsvpDetails || '',
      tags: event.tags || [],
      organizer: event.organizer || '3mpwrApp',
      imageUrl: event.imageUrl || '',
      attendeeCount: event.attendeeCount || 0,
      url: event.url || '',
      category: 'community',
      createdBy: uid,
      createdAt: event.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      status: 'published', // Always publish user-created events
    };

    await m.setDoc(
      m.doc(db, collection, event.id),
      eventData,
      { merge: true }
    );

    logger.log('[FirestoreSyncEvent] Event synced to', collection, ':', event.id);
    return true;
  } catch (error) {
    logger.error('[FirestoreSyncEvent] Failed to sync event to', collection, ':', error);
    return false;
  }
}

/**
 * Update event in events_production or events_preview collection
 * @param id Event ID
 * @param updates Partial event data to update
 * @param _uid User ID (must match creator or be admin - validated by Firestore rules)
 * @param collection Which collection to update ('events_production' or 'events_preview')
 * @returns True if successful
 */
export async function updateEventInProduction(id: string, updates: Partial<FirestoreSyncEvent>, _uid: string, collection: 'events_production' | 'events_preview' = 'events_production'): Promise<boolean> {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) {
    logger.warn('[FirestoreSyncEvent] Firestore not available for update');
    return false;
  }

  try {
    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date !== undefined) {
      updateData.date = updates.date instanceof Date 
        ? m.Timestamp.fromDate(updates.date)
        : m.Timestamp.fromDate(new Date(updates.date));
    }
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.isVirtual !== undefined) updateData.isVirtual = updates.isVirtual;
    if (updates.asl !== undefined) updateData.asl = updates.asl;
    if (updates.captions !== undefined) updateData.captions = updates.captions;
    if (updates.stepFree !== undefined) updateData.stepFree = updates.stepFree;
    if (updates.sensorySpace !== undefined) updateData.sensorySpace = updates.sensorySpace;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.organizer !== undefined) updateData.organizer = updates.organizer;
    if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;
    if (updates.attendeeCount !== undefined) updateData.attendeeCount = updates.attendeeCount;
    if (updates.url !== undefined) updateData.url = updates.url;

    await m.updateDoc(
      m.doc(db, collection, id),
      updateData
    );

    logger.log('[FirestoreSyncEvent] Event updated in', collection, ':', id);
    return true;
  } catch (error) {
    logger.error('[FirestoreSyncEvent] Failed to update event in', collection, ':', error);
    return false;
  }
}

/**
 * Delete event from events_production or events_preview collection
 * @param id Event ID
 * @param collection Which collection to delete from ('events_production' or 'events_preview')
 * @returns True if successful
 */
export async function deleteEventFromProduction(id: string, collection: 'events_production' | 'events_preview' = 'events_production'): Promise<boolean> {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) {
    logger.warn('[FirestoreSyncEvent] Firestore not available for delete');
    return false;
  }

  try {
    await m.deleteDoc(m.doc(db, collection, id));
    logger.log('[FirestoreSyncEvent] Event deleted from', collection, ':', id);
    return true;
  } catch (error) {
    logger.error('[FirestoreSyncEvent] Failed to delete event from', collection, ':', error);
    return false;
  }
}

/**
 * Subscribe to real-time updates of events collections
 * Used to show live updates when events are created/edited/deleted on other devices or website
 * @param callback Function called with updated events list
 * @param onError Error callback
 * @param collection Which collection to subscribe to ('events_production' or 'events_preview')
 * @returns Unsubscribe function
 */
export async function subscribeToEventUpdates(
  callback: (events: any[]) => void,
  onError?: (error: any) => void,
  collection: 'events_production' | 'events_preview' = 'events_production'
): Promise<(() => void) | null> {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) {
    logger.warn('[FirestoreSyncEvent] Firestore not available for subscription');
    return null;
  }

  try {
    // Subscribe to ALL published events (not just 'community' category)
    // User-created events can have categories like 'advocacy', 'social', 'rally', 'community', etc.
    const q = m.query(
      m.collection(db, collection),
      m.where('status', '==', 'published'),
      m.orderBy('date', 'asc')
    );

    const unsubscribe = m.onSnapshot(
      q,
      (snapshot) => {
        const events = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate?.() || data.date,
          };
        });
        callback(events);
        logger.log('[FirestoreSyncEvent] Received live update from', collection, ':', events.length, 'events');
      },
      (error) => {
        logger.error('[FirestoreSyncEvent] Subscription error:', error);
        onError?.(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    logger.error('[FirestoreSyncEvent] Failed to subscribe to events:', error);
    onError?.(error);
    return null;
  }
}

/**
 * Fetch all published community events from events collections
 * Fetches ALL published events (not just 'community' category) because users can create events with various categories
 * @param collection Which collection to fetch from ('events_production' or 'events_preview')
 * @returns Array of events
 */
export async function fetchEventUpdates(collection: 'events_production' | 'events_preview' = 'events_production'): Promise<any[]> {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) {
    logger.warn('[FirestoreSyncEvent] Firestore not available for fetch');
    return [];
  }

  try {
    // Fetch ALL published events (not just 'community' category)
    // User-created events can have categories like 'advocacy', 'social', 'rally', 'community', etc.
    const q = m.query(
      m.collection(db, collection),
      m.where('status', '==', 'published'),
      m.orderBy('date', 'asc')
    );

    const snapshot = await m.getDocs(q);
    const events = snapshot.docs.map((doc) => {
      const data = doc.data();
      
      // Convert Firestore Timestamp to Date object
      // Firestore stores dates in UTC, convert to EST for proper display
      let date = data.date;
      let endDate = data.endDate;
      
      if (data.date?.toDate) {
        const utcDate = data.date.toDate();
        // Store as ISO string in EST timezone
        date = convertUTCtoEST(utcDate);
      } else if (typeof data.date === 'string') {
        date = data.date; // Already a string, keep as is
      }
      
      if (data.endDate?.toDate) {
        const utcEndDate = data.endDate.toDate();
        endDate = convertUTCtoEST(utcEndDate);
      } else if (typeof data.endDate === 'string') {
        endDate = data.endDate;
      }
      
      return {
        id: doc.id,
        ...data,
        date,
        endDate,
      };
    });

    logger.log('[FirestoreSyncEvent] Fetched events from', collection, ':', events.length);
    return events;
  } catch (error) {
    logger.error('[FirestoreSyncEvent] Failed to fetch events:', error);
    return [];
  }
}

/**
 * Get a single event from events collections by ID
 * @param id Event ID
 * @param collection Which collection to query ('events_production' or 'events_preview')
 * @returns Event data or null
 */
export async function getEventFromProduction(id: string, collection: 'events_production' | 'events_preview' = 'events_production'): Promise<any | null> {
  const m = await ensure();
  const db = await getDB();
  if (!m || !db) {
    logger.warn('[FirestoreSyncEvent] Firestore not available for get');
    return null;
  }

  try {
    const docSnapshot = await m.getDoc(m.doc(db, collection, id));
    if (!docSnapshot.exists()) {
      return null;
    }

    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      ...data,
      date: data.date?.toDate?.() || data.date,
    };
  } catch (error) {
    logger.error('[FirestoreSyncEvent] Failed to get event:', error);
    return null;
  }
}

/**
 * Check if Firestore sync is available
 * @returns True if Firestore is properly configured
 */
export async function isFirestoreSyncAvailable(): Promise<boolean> {
  const m = await ensure();
  const db = await getDB();
  return !!(m && db);
}
