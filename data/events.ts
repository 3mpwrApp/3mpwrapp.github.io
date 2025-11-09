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

export const events: Event[] = [
  // Intentionally empty: sample events removed.
  // System holidays and disability observances are generated at runtime
  // by `data/holidays-ca.ts` and shown as system items in the Events screen.
  // If you want to add a sample/example event for reference, uncomment and
  // adapt the block below.
  /*
  {
    id: "evt-example",
    title: "Community Accessibility Workshop",
    description: "Join us for a workshop on accessibility rights and resources. ASL interpretation and closed captions provided.",
    date: "2025-11-15 18:00",
    location: "Community Centre - 123 Main St",
    isVirtual: false,
    asl: true,
    captions: true,
    stepFree: true,
  },
  */
];
