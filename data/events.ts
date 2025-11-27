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
export const events: Event[] = [
  {
    id: 'evt-hdiwg-iwh-persistent-pain-presentation',
    title: 'HDIWG - Institute for Work & Health: Persistent Pain Research Presentation',
    description: 'Hamilton & District Injured Workers Group (HDIWG) is hosting the Institute for Work and Health for a presentation about their research on Persistent Pain following a work-related injury or illness.\n\nA Q & A session will follow the presentation.\n\nIn-Person: 709 Barton Street E, Hamilton\n• Please arrive at least 15 minutes early to settle in\n\nNot feeling well? Can\'t make it in-person?\n• Register to receive the Zoom link: https://us06web.zoom.us/meeting/register/OD1_phD8QtmdjE0M97KsHg#/registration\n\nWe are looking forward to this educational opportunity!\n\nMore info: hdiwg.net',
    date: '2025-12-01T13:00:00-05:00', // December 1, 2025 at 1:00 PM EST
    location: '709 Barton Street E, Hamilton, ON',
    isVirtual: true, // Hybrid event - both in-person and virtual
    virtualLink: 'https://us06web.zoom.us/meeting/register/OD1_phD8QtmdjE0M97KsHg#/registration',
    category: 'educational',
    tags: ['injured-workers', 'hamilton', 'persistent-pain', 'research', 'health', 'iwh', 'hdiwg'],
    organizer: 'Hamilton & District Injured Workers Group (HDIWG)',
    organizerContact: 'hdiwg.net',
    status: 'published',
    registrationRequired: true,
    registrationLink: 'https://us06web.zoom.us/meeting/register/OD1_phD8QtmdjE0M97KsHg#/registration',
    wheelchairAccessible: true,
    stepFree: true,
    energyCost: 'low',
    accessibilityNotes: 'Hybrid event with both in-person and virtual attendance options. Please arrive 15 minutes early if attending in-person.',
  },
  {
    id: 'evt-oniwg-rally-dec8-2025',
    title: 'ONIWG - Support Injured Workers Rally',
    description: 'Join the Ontario Network of Injured Workers Groups (ONIWG) as we rally to support injured workers and demand justice for those who have been harmed on the job.\n\nStand with injured workers as we advocate for:\n• Fair treatment and adequate support for injured workers\n• Proper workplace safety enforcement\n• Access to necessary medical care and rehabilitation\n• Dignity and respect for all injured workers\n\nYour presence matters. Together we can make a difference for injured workers across Ontario.',
    date: '2025-12-08T11:00:00-05:00', // December 8, 2025 at 11:00 AM EST
    location: 'Ministry of Labour, 400 University Ave, Toronto, ON',
    isVirtual: false,
    category: 'rally',
    tags: ['injured-workers', 'ontario', 'advocacy', 'oniwg', 'workers-rights'],
    organizer: 'Ontario Network of Injured Workers Groups (ONIWG)',
    status: 'published',
    wheelchairAccessible: true,
    stepFree: true,
    energyCost: 'medium',
  },
];
