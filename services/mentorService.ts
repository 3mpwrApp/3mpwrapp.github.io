/**
 * Mentor Service
 * Firestore queries, caching, and business logic for mentor discovery
 */

import type {
    DocumentSnapshot,
    QueryConstraint
} from 'firebase/firestore';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    startAfter,
    where
} from 'firebase/firestore';

import { db } from '../firebase/config';
import type {
    AvailabilitySlot,
    MentorFilterOptions,
    MentorProfile,
    MentorRating,
    MentorSearchResults,
    MentorshipRequest
} from '../types/mentor';
import { logger } from '../utils/logger';

import { isCloudConsentEnabled } from './consent';

/**
 * Cache for mentor searches (in-memory)
 * Stores recently fetched results to reduce Firestore reads
 */
const mentorCache = new Map<string, { data: MentorProfile[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Build cache key from filter options
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getCacheKey(filters: MentorFilterOptions): string {
    return JSON.stringify({
        search: filters.searchQuery || '',
        disabilities: (filters.disabilities || []).sort().join(','),
        experiences: (filters.experiences || []).sort().join(','),
        languages: (filters.languages || []).sort().join(','),
        minRating: filters.minRating || 0,
        minAvailability: filters.minAvailability || '',
    });
}

/**
 * Check if cache entry is still valid
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Search for mentors with filters and pagination
 * Uses Firestore queries with proper indexing
 */
export async function searchMentors(
    filters: MentorFilterOptions,
    cursor?: DocumentSnapshot<any>
): Promise<MentorSearchResults> {
    if (!db) {
        logger.warn('[MentorService] Firestore not available, returning empty results');
        return { mentors: [], total: 0, hasMore: false };
    }

    if (!isCloudConsentEnabled()) {
        logger.warn('[MentorService] Cloud features disabled');
        return { mentors: [], total: 0, hasMore: false };
    }

    try {
        const pageSize = filters.pageSize || 20;
        const constraints: QueryConstraint[] = [];

        // Always filter by acceptingMentees
        constraints.push(where('acceptingMentees', '==', true));

        // Filter by minimum rating
        if (filters.minRating && filters.minRating > 0) {
            constraints.push(where('rating', '>=', filters.minRating));
        }

        // Filter by disabilities (OR logic - multiple queries needed for this)
        if (filters.disabilities && filters.disabilities.length > 0) {
            constraints.push(where('disabilities', 'array-contains-any', filters.disabilities));
        }

        // Filter by experiences (OR logic)
        if (filters.experiences && filters.experiences.length > 0) {
            constraints.push(where('experiences', 'array-contains-any', filters.experiences));
        }

        // Filter by languages (OR logic)
        if (filters.languages && filters.languages.length > 0) {
            constraints.push(where('languages', 'array-contains-any', filters.languages));
        }

        // Apply sorting
        const sortField = filters.sortBy || 'rating';
        switch (sortField) {
            case 'responseTime':
                constraints.push(orderBy('averageResponseTime', 'asc'));
                break;
            case 'recentlyActive':
                constraints.push(orderBy('lastActive', 'desc'));
                break;
            case 'mostMatches':
                constraints.push(orderBy('totalMatches', 'desc'));
                break;
            case 'rating':
            default:
                constraints.push(orderBy('rating', 'desc'));
                break;
        }

        // Add limit (fetch one extra to determine hasMore)
        constraints.push(limit(pageSize + 1));

        // Add cursor for pagination
        if (cursor) {
            constraints.push(startAfter(cursor));
        }

        // Build and execute query
        const mentorsRef = collection(db, 'mentors');
        const q = query(mentorsRef, ...constraints);
        const snapshot = await getDocs(q);

        // Extract results
        let mentors = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        } as MentorProfile));

        // Check if there are more results
        const hasMore = mentors.length > pageSize;
        if (hasMore) {
            mentors = mentors.slice(0, pageSize);
        }

        // Filter by search query (name) - client-side after Firestore query
        if (filters.searchQuery && filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            mentors = mentors.filter((m) =>
                m.displayName.toLowerCase().includes(query) ||
                (m.bio && m.bio.toLowerCase().includes(query))
            );
        }

        return {
            mentors,
            total: snapshot.docs.length,
            cursor: snapshot.docs[snapshot.docs.length - 1],
            hasMore,
        };
    } catch (error) {
        logger.error('[MentorService] Search failed:', error);
        throw error;
    }
}

/**
 * Get a single mentor profile by ID
 */
export async function getMentorProfile(mentorId: string): Promise<MentorProfile | null> {
    if (!db) {
        logger.warn('[MentorService] Firestore not available');
        return null;
    }

    if (!isCloudConsentEnabled()) {
        logger.warn('[MentorService] Cloud features disabled');
        return null;
    }

    try {
        const docRef = doc(db, 'mentors', mentorId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return {
            id: docSnap.id,
            ...docSnap.data(),
        } as MentorProfile;
    } catch (error) {
        logger.error('[MentorService] Get mentor profile failed:', error);
        throw error;
    }
}

/**
 * Get mentors recommended for current user
 * Based on user's disabilities and experiences
 */
export async function getRecommendedMentors(
    userDisabilities: string[],
    userExperiences: string[],
    limit_count: number = 10
): Promise<MentorProfile[]> {
    if (!db || !isCloudConsentEnabled()) {
        return [];
    }

    try {
        const mentorsRef = collection(db, 'mentors');
        const constraints: QueryConstraint[] = [
            where('acceptingMentees', '==', true),
            orderBy('rating', 'desc'),
            limit(limit_count),
        ];

        // Match by disabilities or experiences
        if (userDisabilities.length > 0) {
            constraints.push(
                where('disabilities', 'array-contains-any', userDisabilities)
            );
        } else if (userExperiences.length > 0) {
            constraints.push(
                where('experiences', 'array-contains-any', userExperiences)
            );
        }

        const q = query(mentorsRef, ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map(
            (doc) =>
                ({
                    id: doc.id,
                    ...doc.data(),
                } as MentorProfile)
        );
    } catch (error) {
        logger.error('[MentorService] Get recommended mentors failed:', error);
        return [];
    }
}

/**
 * Get ratings for a mentor
 */
export async function getMentorRatings(mentorId: string): Promise<MentorRating[]> {
    if (!db || !isCloudConsentEnabled()) {
        return [];
    }

    try {
        const ratingsRef = collection(db, 'mentor_ratings');
        const q = query(ratingsRef, where('mentorId', '==', mentorId));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(
            (doc) =>
                ({
                    id: doc.id,
                    ...doc.data(),
                } as MentorRating)
        );
    } catch (error) {
        logger.error('[MentorService] Get mentor ratings failed:', error);
        return [];
    }
}

/**
 * Create a mentorship request
 */
export async function createMentorshipRequest(
    mentorId: string,
    menteeId: string,
    message?: string,
    topics?: string[]
): Promise<string | null> {
    if (!db || !isCloudConsentEnabled()) {
        logger.warn('[MentorService] Cloud features disabled');
        return null;
    }

    try {
        const requestRef = doc(collection(db, 'mentorship_requests'));
        const requestData: MentorshipRequest = {
            id: requestRef.id,
            mentorId,
            menteeId,
            status: 'pending',
            requestMessage: message,
            requestedTopics: topics,
            createdAt: Date.now(),
        };

        await setDoc(requestRef, requestData);
        return requestRef.id;
    } catch (error) {
        logger.error('[MentorService] Create mentorship request failed:', error);
        throw error;
    }
}

/**
 * Get pending mentorship requests for a mentor
 */
export async function getMentorshipRequests(
    mentorId: string,
    status: 'pending' | 'accepted' | 'rejected' | 'completed' = 'pending'
): Promise<MentorshipRequest[]> {
    if (!db || !isCloudConsentEnabled()) {
        return [];
    }

    try {
        const requestsRef = collection(db, 'mentorship_requests');
        const q = query(
            requestsRef,
            where('mentorId', '==', mentorId),
            where('status', '==', status)
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(
            (doc) =>
                ({
                    id: doc.id,
                    ...doc.data(),
                } as MentorshipRequest)
        );
    } catch (error) {
        logger.error('[MentorService] Get mentorship requests failed:', error);
        return [];
    }
}

/**
 * Accept a mentorship request
 */
export async function acceptMentorshipRequest(requestId: string): Promise<boolean> {
    if (!db || !isCloudConsentEnabled()) {
        return false;
    }

    try {
        const requestRef = doc(db, 'mentorship_requests', requestId);
        await setDoc(
            requestRef,
            {
                status: 'accepted',
                respondedAt: Date.now(),
            },
            { merge: true }
        );
        return true;
    } catch (error) {
        logger.error('[MentorService] Accept mentorship request failed:', error);
        return false;
    }
}

/**
 * Reject a mentorship request
 */
export async function rejectMentorshipRequest(requestId: string): Promise<boolean> {
    if (!db || !isCloudConsentEnabled()) {
        return false;
    }

    try {
        const requestRef = doc(db, 'mentorship_requests', requestId);
        await setDoc(
            requestRef,
            {
                status: 'rejected',
                respondedAt: Date.now(),
            },
            { merge: true }
        );
        return true;
    } catch (error) {
        logger.error('[MentorService] Reject mentorship request failed:', error);
        return false;
    }
}

/**
 * Submit a rating for a mentor
 */
export async function rateMentor(
    mentorId: string,
    menteeId: string,
    rating: number,
    helpfulness: number,
    review?: string
): Promise<boolean> {
    if (!db || !isCloudConsentEnabled()) {
        return false;
    }

    try {
        const ratingRef = doc(collection(db, 'mentor_ratings'));
        const ratingData: MentorRating = {
            id: ratingRef.id,
            mentorId,
            menteeId,
            rating: Math.max(1, Math.min(5, rating)), // Clamp 1-5
            helpfulness: Math.max(1, Math.min(5, helpfulness)),
            review,
            createdAt: Date.now(),
        };

        await setDoc(ratingRef, ratingData);

        // Update mentor's average rating
        await updateMentorRating(mentorId);

        return true;
    } catch (error) {
        logger.error('[MentorService] Rate mentor failed:', error);
        return false;
    }
}

/**
 * Update mentor's average rating based on all ratings
 * Called after new rating is submitted
 */
async function updateMentorRating(mentorId: string): Promise<void> {
    if (!db || !isCloudConsentEnabled()) {
        return;
    }

    try {
        const ratings = await getMentorRatings(mentorId);
        if (ratings.length === 0) return;

        const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

        const mentorRef = doc(db, 'mentors', mentorId);
        await setDoc(
            mentorRef,
            {
                rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
                ratingCount: ratings.length,
            },
            { merge: true }
        );
    } catch (error) {
        logger.error('[MentorService] Update mentor rating failed:', error);
    }
}

/**
 * Get mentors in a specific expertise area
 */
export async function getMentorsByExpertise(
    category: string,
    limit_count: number = 15
): Promise<MentorProfile[]> {
    if (!db || !isCloudConsentEnabled()) {
        return [];
    }

    try {
        // Note: This requires compound index on expertises.category and rating
        const mentorsRef = collection(db, 'mentors');
        const q = query(
            mentorsRef,
            where('acceptingMentees', '==', true),
            orderBy('rating', 'desc'),
            limit(limit_count)
        );

        const snapshot = await getDocs(q);
        const mentors = snapshot.docs.map(
            (doc) =>
                ({
                    id: doc.id,
                    ...doc.data(),
                } as MentorProfile)
        );

        // Filter by expertise category (client-side since we can't query array fields)
        return mentors.filter((m) =>
            m.expertises.some((e) => e.category === category)
        );
    } catch (error) {
        logger.error('[MentorService] Get mentors by expertise failed:', error);
        return [];
    }
}

/**
 * Check if user is available at a specific time
 */
export function isAvailableAtTime(
    availability: AvailabilitySlot[],
    dayOfWeek: number,
    time: string
): boolean {
    const slot = availability.find((s) => s.dayOfWeek === dayOfWeek);
    if (!slot) return false;

    if (slot.isFlexible) return true;

    // Compare times as HH:MM strings
    return time >= slot.startTime && time <= slot.endTime;
}

/**
 * Calculate compatibility score between user and mentor (0-100)
 */
export function calculateCompatibilityScore(
    mentor: MentorProfile,
    userDisabilities: string[],
    userLanguages: string[],
    userExperiences: string[]
): number {
    let score = 50; // Base score

    // Disability match (+20)
    if (userDisabilities.some((d) => mentor.disabilities.includes(d))) {
        score += 20;
    }

    // Language match (+15)
    if (userLanguages.some((l) => mentor.languages.includes(l))) {
        score += 15;
    }

    // Experience match (+10)
    if (userExperiences.some((e) => mentor.experiences.includes(e))) {
        score += 10;
    }

    // Rating bonus (+5 for high-rated)
    if (mentor.rating >= 4.5) {
        score += 5;
    }

    return Math.min(100, score);
}

/**
 * Clear in-memory cache
 */
export function clearMentorCache(): void {
    mentorCache.clear();
    logger.info('[MentorService] Cache cleared');
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats(): { size: number; entries: number } {
    let totalSize = 0;
    mentorCache.forEach((entry) => {
        totalSize += entry.data.length;
    });
    return { size: totalSize, entries: mentorCache.size };
}
