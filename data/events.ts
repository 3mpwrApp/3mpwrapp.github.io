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
  {
    id: "evt-3mpwr-intro-dec9-2025",
    title: "Introduction to 3mpwr App - Website & App Demo",
    description: "Join us for an engaging introduction to the 3mpwr App - a new accessibility-driven platform created by and for Injured Workers, Persons with Disabilities, and their Allies across Canada. Built with Accessibility, Inclusion, and Connection at its core, 3mpwr App will feature a walkthrough of the 3mpwr App Website and a Live Demo of the app currently in Closed Beta Testing.\n\nDiscover how 3mpwr App will empower communities through technology that makes connection, coordination, accessibility easier for everyone.\n\nTuesday Information Session with The Thunder Bay & District Injured Workers Support Group and 3mpwr App\n\nLearn more: https://3mpwrapp.pages.dev\nContact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions",
    date: "2025-12-09T15:00:00.000Z", // 10am EST (UTC-5) = 15:00 UTC
    endDate: "2025-12-09T17:00:00.000Z", // 12pm EST = 17:00 UTC
    location: "Thunder Bay & District Injured Workers Support Group",
    isVirtual: true,
    virtualLink: "https://thunderbayinjuredworkers.com/tuesday-events/",
    organizer: "Thunder Bay & District Injured Workers Support Group & 3mpwr App",
    organizerContact: "tbiwsg@gmail.com",
    category: "community",
    tags: ["accessibility", "injured workers", "app demo", "information session", "technology", "inclusion"],
    asl: false, // Can be updated if ASL is confirmed
    captions: false, // Can be updated if captions are confirmed
    stepFree: true, // Virtual event
    wheelchairAccessible: true, // Virtual event
    serviceAnimalsWelcome: true, // Virtual event
    energyCost: "low", // Virtual event, low energy requirement
    registrationRequired: false, // Check event page for details
    status: "published",
    accessibilityNotes: "Virtual event accessible from any device with internet connection. Contact organizers for accessibility accommodations.",
  },
  {
    id: "evt-usw-westray-dec16-2025",
    title: "Guest Kevon Stewart, District 6 Director, USW - Westray Law Enforcement",
    description: "Tuesday Information Session with The Thunder Bay & District Injured Workers Support Group featuring Kevon Stewart, District 6 Director, United Steelworkers (USW).\n\nKevon will discuss in the presentation:\n\n• The criminal liability and prosecution of organizations who do not follow the Westray law\n• Why enforcement of the Westray law is not currently happening\n• The actions USW District 6 is taking for more dedicated investigators, prosecutors, and training for legal and police officials\n\nThe Westray law (Bill C-45) holds organizations and their representatives criminally liable for failing to ensure workplace health and safety. This critical session will explore the current state of enforcement and advocacy efforts to strengthen worker protections.\n\nContact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!\n\nEvent page: https://facebook.com/events/s/guest-kevon-stewart-district-6/1144594477804128/",
    date: "2025-12-16T15:00:00.000Z", // 10am EST (UTC-5) = 15:00 UTC
    endDate: "2025-12-16T17:00:00.000Z", // 12pm EST = 17:00 UTC
    location: "Thunder Bay & District Injured Workers Support Group",
    isVirtual: true,
    virtualLink: "https://thunderbayinjuredworkers.com/tuesday-events/",
    organizer: "Thunder Bay & District Injured Workers Support Group",
    organizerContact: "tbiwsg@gmail.com",
    category: "community",
    tags: ["injured workers", "workplace safety", "Westray law", "USW", "workers rights", "legal advocacy", "occupational health"],
    asl: false, // Can be updated if ASL is confirmed
    captions: false, // Can be updated if captions are confirmed
    stepFree: true, // Virtual event
    wheelchairAccessible: true, // Virtual event
    serviceAnimalsWelcome: true, // Virtual event
    energyCost: "low", // Virtual event, low energy requirement
    registrationRequired: false, // Check event page for details
    status: "published",
    accessibilityNotes: "Virtual event accessible from any device with internet connection. Contact organizers for accessibility accommodations.",
  },
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
