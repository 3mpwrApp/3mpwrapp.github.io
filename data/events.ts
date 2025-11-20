// pii-scan-ignore-file - Contains example organizer email addresses in mock data
export type Event = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO or friendly
  endDate?: string; // For multi-day or timed events
  location?: string;
  isVirtual?: boolean;
  virtualLink?: string; // Zoom/Teams/Meet link
  
  // Accessibility features
  asl?: boolean; // ASL interpretation
  captions?: boolean; // Closed captions
  stepFree?: boolean; // Wheelchair accessible entrance
  sensorySpace?: boolean; // Quiet/sensory-friendly space
  wheelchairAccessible?: boolean; // Full wheelchair accessibility
  quietRoom?: boolean; // Designated quiet room
  parkingAccessible?: boolean; // Accessible parking available
  assistiveListening?: boolean; // Assistive listening devices
  braille?: boolean; // Braille materials available
  serviceAnimalsWelcome?: boolean; // Service animals permitted
  accessibilityNotes?: string; // Additional accessibility details
  
  // Event logistics
  energyCost?: 'low' | 'medium' | 'high'; // Spoon/energy cost indicator
  registrationRequired?: boolean; // RSVP required
  registrationLink?: string; // Registration URL
  registrationDeadline?: string; // Last date to register
  capacity?: number; // Max attendees
  attendeeCount?: number; // Current registrations
  
  // Event metadata
  category?: string;
  tags?: string[];
  organizer?: string; // Organization/person running event
  organizerContact?: string; // Email or phone
  imageUrl?: string; // Event banner/image
  
  // Status and reminders
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  reminderSent?: boolean; // For local reminder tracking
  iCalUID?: string; // For calendar sync
};

// Empty array: Only live events from Firestore will be shown.
// Local sample events removed to show only real community events.
// System holidays and disability observances are generated at runtime
// by `data/holidays-ca.ts` and shown as system items in the Events screen.
export const events: Event[] = [];
