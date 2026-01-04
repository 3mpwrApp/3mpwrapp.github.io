/**
 * Peer Mentor Discovery Type Definitions
 * Interfaces for mentor profiles, matching, and related data structures
 */

export type ID = string;

/** Expertise area with details */
export interface MentorExpertise {
  category: string; // e.g., "workplace-advocacy", "healthcare-navigation"
  yearsOfExperience: number;
  description: string;
}

/** Availability slot with timezone */
export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00" (24-hour format)
  endTime: string; // "17:00"
  timezone: string; // "America/Toronto"
  isFlexible: boolean;
}

/** Communication method preference */
export type CommunicationMethod = 'video_call' | 'voice_call' | 'text_chat' | 'email' | 'phone';

/** Verification status level */
export type VerificationStatus = 'unverified' | 'email_verified' | 'reference_verified' | 'certified';

/** Main mentor profile interface */
export interface MentorProfile {
  // Identity
  id: ID; // Firestore doc ID (userId)
  displayName: string;
  photoUrl?: string;
  bio: string;

  // Expertise
  expertises: MentorExpertise[];
  disabilities: string[]; // indexed for filtering
  experiences: string[]; // indexed (e.g., "newly-diagnosed", "benefits-navigation")
  
  // Availability & Communication
  availability: AvailabilitySlot[];
  communicationMethods: CommunicationMethod[];
  languages: string[]; // e.g., ["English", "French", "Spanish"]
  
  // Cultural context
  culturalBackground?: string;
  pronouns?: string;
  
  // Status
  acceptingMentees: boolean; // indexed
  verificationStatus: VerificationStatus;
  
  // Ratings & Performance
  rating: number; // 1-5 average
  ratingCount: number;
  totalMatches: number;
  successfulMatches: number;
  averageResponseTime?: number; // minutes
  
  // Metadata
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  lastActive?: number; // timestamp
  
  // Optional
  certifications?: string[];
  badges?: string[]; // e.g., "verified", "top-mentor", "fast-responder"
}

/** Mentor rating/review */
export interface MentorRating {
  id: ID;
  mentorId: ID;
  menteeId: ID;
  rating: number; // 1-5
  review?: string;
  helpfulness: number; // 1-5
  createdAt: number;
  updatedAt?: number;
}

/** Mentorship request */
export interface MentorshipRequest {
  id: ID;
  mentorId: ID;
  menteeId: ID;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requestMessage?: string;
  requestedTopics?: string[];
  createdAt: number;
  respondedAt?: number;
  startedAt?: number;
  completedAt?: number;
}

/** Match between mentor and mentee */
export interface MentorMatch {
  id: ID;
  mentorId: ID;
  menteeId: ID;
  matchScore: number; // 0-100
  compatibilityFactors: {
    disabilityMatch: boolean;
    languageMatch: boolean;
    experienceMatch: boolean;
    availabilityMatch: boolean;
    communicationMatch: boolean;
  };
  createdAt: number;
  status: 'matched' | 'active' | 'completed' | 'declined';
}

/** Search/filter options */
export interface MentorFilterOptions {
  searchQuery?: string; // name search
  disabilities?: string[]; // OR filter
  experiences?: string[]; // OR filter
  languages?: string[]; // OR filter
  minRating?: number; // 1-5
  minAvailability?: 'immediately' | 'this-week' | 'flexible';
  communicationMethods?: CommunicationMethod[];
  verificationStatus?: VerificationStatus[];
  sortBy?: 'rating' | 'responseTime' | 'recentlyActive' | 'mostMatches';
  pageSize?: number;
}

/** Search results */
export interface MentorSearchResults {
  mentors: MentorProfile[];
  total: number;
  cursor?: any; // Firestore cursor for pagination
  hasMore: boolean;
}
