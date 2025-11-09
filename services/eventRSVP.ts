import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, increment, setDoc, updateDoc } from 'firebase/firestore';

import type { Event } from '../data/events';
import { db } from '../firebase/config';

const RSVP_STORAGE_KEY = 'events:rsvps:v1';

export interface EventRSVP {
  eventId: string;
  userId?: string;
  name?: string;
  email?: string;
  timestamp: number;
  status: 'confirmed' | 'cancelled';
}

/**
 * Get all RSVPs from local storage
 */
export async function getLocalRSVPs(): Promise<EventRSVP[]> {
  try {
    const stored = await AsyncStorage.getItem(RSVP_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.warn('[EventRSVP] Failed to get local RSVPs:', error);
    return [];
  }
}

/**
 * Check if user has RSVPed to an event
 */
export async function hasRSVPed(eventId: string): Promise<boolean> {
  try {
    const rsvps = await getLocalRSVPs();
    return rsvps.some((r) => r.eventId === eventId && r.status === 'confirmed');
  } catch {
    return false;
  }
}

/**
 * RSVP to an event (local + Firestore sync)
 */
export async function rsvpToEvent(
  event: Event,
  userId?: string,
  name?: string,
  email?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check capacity
    if (event.capacity && event.attendeeCount !== undefined) {
      if (event.attendeeCount >= event.capacity) {
        return { success: false, error: 'Event is at full capacity' };
      }
    }

    // Check registration deadline
    if (event.registrationDeadline) {
      const deadline = new Date(event.registrationDeadline);
      if (new Date() > deadline) {
        return { success: false, error: 'Registration deadline has passed' };
      }
    }

    // Save to local storage
    const rsvp: EventRSVP = {
      eventId: event.id,
      userId,
      name,
      email,
      timestamp: Date.now(),
      status: 'confirmed',
    };

    const rsvps = await getLocalRSVPs();
    const existingIndex = rsvps.findIndex((r) => r.eventId === event.id);
    
    if (existingIndex >= 0) {
      rsvps[existingIndex] = rsvp;
    } else {
      rsvps.push(rsvp);
    }

    await AsyncStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(rsvps));

    // Sync to Firestore (increment attendeeCount)
    try {
      if (db) {
        // Update both production and preview collections
        for (const collection of ['events_production', 'events_preview']) {
          const eventRef = doc(db, collection, event.id);
          const eventSnap = await getDoc(eventRef);
          
          if (eventSnap.exists()) {
            await updateDoc(eventRef, {
              attendeeCount: increment(1),
              updatedAt: new Date(),
            });
          }
        }

        // Store RSVP in a separate collection for tracking
        if (userId) {
          const rsvpRef = doc(db, 'event_rsvps', `${event.id}_${userId}`);
          await setDoc(rsvpRef, {
            eventId: event.id,
            userId,
            name: name || null,
            email: email || null,
            timestamp: new Date(),
            status: 'confirmed',
          });
        }
      }
    } catch (firestoreError) {
      console.warn('[EventRSVP] Firestore sync failed:', firestoreError);
      // Don't fail the whole operation if Firestore sync fails
    }

    return { success: true };
  } catch (error) {
    console.error('[EventRSVP] Failed to RSVP:', error);
    return { success: false, error: 'Failed to save RSVP' };
  }
}

/**
 * Cancel RSVP to an event
 */
export async function cancelRSVP(eventId: string, userId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Update local storage
    const rsvps = await getLocalRSVPs();
    const updatedRSVPs = rsvps.map((r) =>
      r.eventId === eventId ? { ...r, status: 'cancelled' as const } : r
    );

    await AsyncStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(updatedRSVPs));

    // Sync to Firestore (decrement attendeeCount)
    try {
      if (db) {
        // Update both production and preview collections
        for (const collection of ['events_production', 'events_preview']) {
          const eventRef = doc(db, collection, eventId);
          const eventSnap = await getDoc(eventRef);
          
          if (eventSnap.exists()) {
            await updateDoc(eventRef, {
              attendeeCount: increment(-1),
              updatedAt: new Date(),
            });
          }
        }

        // Update RSVP record
        if (userId) {
          const rsvpRef = doc(db, 'event_rsvps', `${eventId}_${userId}`);
          await updateDoc(rsvpRef, {
            status: 'cancelled',
            cancelledAt: new Date(),
          });
        }
      }
    } catch (firestoreError) {
      console.warn('[EventRSVP] Firestore sync failed:', firestoreError);
    }

    return { success: true };
  } catch (error) {
    console.error('[EventRSVP] Failed to cancel RSVP:', error);
    return { success: false, error: 'Failed to cancel RSVP' };
  }
}

/**
 * Get RSVP count for an event from Firestore
 */
export async function getEventAttendeeCount(eventId: string): Promise<number> {
  try {
    if (!db) return 0;
    
    const eventRef = doc(db, 'events_production', eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (eventSnap.exists()) {
      const data = eventSnap.data();
      return data.attendeeCount || 0;
    }
    
    return 0;
  } catch (error) {
    console.warn('[EventRSVP] Failed to get attendee count:', error);
    return 0;
  }
}

/**
 * Check if event is at capacity
 */
export async function isEventFull(event: Event): Promise<boolean> {
  if (!event.capacity) return false;
  
  const count = await getEventAttendeeCount(event.id);
  return count >= event.capacity;
}
