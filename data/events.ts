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
  {
    id: 'evt-tmu-surviving-to-thriving-dec3-2025',
    title: 'From Surviving to Thriving - Every Canadian Counts',
    description: 'Join Hubert Van Niekerk Sr., alongside researchers Dr. Christine Sheppard and Dr. Nadia Carvalho at this free hybrid event.\n\nHosted by Toronto Metropolitan University\'s Centre for Excellence in Research on Community (CERC), this event explores pathways from surviving to thriving for people with disabilities.\n\nHybrid Event:\n• In-Person: Toronto Metropolitan University\n• Virtual: Zoom (link provided upon registration)\n\nRegister: https://buff.ly/OTYRZg0r\n\nLearn more: everycanadiancounts.com',
    date: '2025-12-03T14:30:00-05:00', // December 3, 2025 at 2:30 PM EST
    location: 'Toronto Metropolitan University, Toronto, ON',
    isVirtual: true, // Hybrid event
    virtualLink: 'https://buff.ly/OTYRZg0r',
    category: 'educational',
    tags: ['disability-rights', 'research', 'toronto', 'tmu', 'cerc', 'every-canadian-counts', 'hybrid-event'],
    organizer: 'Toronto Metropolitan University - CERC & Every Canadian Counts',
    organizerContact: 'everycanadiancounts.com',
    status: 'published',
    registrationRequired: true,
    registrationLink: 'https://buff.ly/OTYRZg0r',
    wheelchairAccessible: true,
    stepFree: true,
    energyCost: 'low',
    accessibilityNotes: 'Free hybrid event with both in-person and virtual attendance options.',
  },
  {
    id: 'evt-disability-poverty-canada-dec3-2025',
    title: 'Disability Poverty in Canada: Learning from Today to Make Tomorrow Better',
    description: 'Join us for the launch of the 3rd Annual Disability Poverty Report Card!\n\nHear from lived experts, advocates, and researchers as people with disabilities, service providers, and policy researchers come together to share knowledge and lived experiences on equal footing.\n\nDiscover where we can partner to effect systemic change and work toward ending disability poverty in Canada.\n\nTwo Streams Available:\n• Stream A: https://plan-9.hubspotpagebuilder.com/dec-3-research-symposium-stream-a\n• Stream B: https://plan-9.hubspotpagebuilder.com/2025-dec-3-research-symposium-stream-b\n\nFor more information: https://www.disabilitywithoutpoverty.ca\n\n#IDPD2025 #DisabilityWithoutPoverty #EndDisabilityPoverty',
    date: '2025-12-03T10:00:00-05:00', // December 3, 2025 at 10:00 AM EST (assumed start time)
    location: 'Virtual Event',
    isVirtual: true,
    virtualLink: 'https://www.disabilitywithoutpoverty.ca',
    category: 'advocacy',
    tags: ['disability-poverty', 'advocacy', 'research', 'idpd2025', 'disability-without-poverty', 'report-card', 'symposium'],
    organizer: 'Disability Without Poverty',
    organizerContact: 'https://www.disabilitywithoutpoverty.ca',
    status: 'published',
    registrationRequired: true,
    registrationLink: 'https://plan-9.hubspotpagebuilder.com/dec-3-research-symposium-stream-a',
    captions: true,
    asl: true,
    energyCost: 'low',
    accessibilityNotes: 'Two streams available for registration. Virtual event with captions and ASL interpretation.',
  },
  {
    id: 'evt-intl-migrants-day-vigil-dec18-2025',
    title: 'International Migrants Day - Vigil and Community Action',
    description: 'Vigil and Community Action at the Chinese Railroad Workers Memorial in Toronto for International Migrants Day.\n\nInjured Workers and Migrant Workers United Call for:\n• Fair Compensation\n• Health Care Access\n• Elimination of Age Discrimination\n• End to Racist Policies and Practices\n\nOpen Letter from Injured Workers and Injured Migrant Workers:\nhttps://docs.google.com/document/d/15sTqqSsqLiqkj/edit\n\nWe call on the Federal Government, the Government of Ontario, and the WSIB to uphold the rights of injured workers and migrant workers in Canada without delay. Every worker deserves the right to live and work in safe and fair conditions. No worker should face discrimination or barriers to essential healthcare, fair compensation, or equal treatment.\n\nWe demand justice for injured workers and migrant workers!\nAn injury to one is an injury to all!\n\nIn Solidarity,\nMembers of the Injured Workers Action for Justice & Justice for Migrant Workers\n\nMore info: https://www.facebook.com/justiceforinjuredworkers',
    date: '2025-12-18T18:00:00-05:00', // December 18, 2025 at 6:00 PM EST
    location: 'Chinese Railroad Workers Memorial, 9 Blue Jays Way, Toronto, ON M5V 3S2 (near Spadina Ave & Front St W)',
    isVirtual: false,
    category: 'vigil',
    tags: ['injured-workers', 'migrant-workers', 'international-migrants-day', 'toronto', 'wsib', 'advocacy', 'workers-rights', 'vigil', 'community-action'],
    organizer: 'Injured Workers Action for Justice & Justice for Migrant Workers',
    organizerContact: 'https://www.facebook.com/justiceforinjuredworkers',
    status: 'published',
    registrationRequired: false,
    wheelchairAccessible: true,
    stepFree: true,
    energyCost: 'medium',
    accessibilityNotes: 'Outdoor vigil at the Chinese Railroad Workers Memorial. Near Spadina Ave & Front St W. Map: https://maps.app.goo.gl/VcC5Ggxvc1Sn2kAXA',
  },
  {
    id: 'evt-tbdiwsg-dec16-2025',
    title: 'TBDIWSG Tuesday Information Session ZOOM',
    description: 'Thunder Bay & District Injured Workers Support Group\nDec 16 – Guest Kevon Stewart, District 6 Director, USW\n\nKevon will discuss in the presentation:\n• The criminal liability and prosecution of organizations who do not follow the Westray law.\n• Why enforcement of the Westray law is not currently happening.\n• The actions USW District 6 is taking for more dedicated investigators, prosecutors, and training for legal and police officials.\n\nContact us at tbiwsg@gmail.com if you want to join us for these Zoom Sessions!\nhttps://thunderbayinjuredworkers.com/tuesday-events/',
    date: '2025-12-16T10:00:00-05:00', // December 16, 2025 at 10:00 AM EST
    endDate: '2025-12-16T12:00:00-05:00',
    location: 'Virtual - Zoom',
    isVirtual: true,
    category: 'community',
    tags: ['injured-workers', 'thunder-bay', 'zoom', 'information-session', 'westray-law', 'usw', 'workers-rights'],
    organizer: 'Thunder Bay & District Injured Workers Support Group',
    organizerContact: 'tbiwsg@gmail.com',
    status: 'published',
    registrationRequired: true,
    registrationLink: 'https://thunderbayinjuredworkers.com/tuesday-events/',
    captions: false,
    asl: false,
    energyCost: 'low',
    accessibilityNotes: 'Virtual Zoom event. Contact tbiwsg@gmail.com to receive the Zoom link.',
  },
  {
    id: 'evt-ecc-x-spaces-jan7-2026',
    title: 'X Spaces: EveryCanadianCounts Petition Education',
    description: 'Join 3mpwr App & Every Canadian Counts for an educational X Spaces discussion on petition e-6746 about Canada\'s commitment to accessible, inclusive democracy.\n\nGuest: @HubertVan\n\nTopic: Education on petition e-6746 about Canada\'s commitment to accessible, inclusive democracy\n\nDeadline Alert: Petition ends January 9th!\n\nPetition Details: https://www.ourcommons.ca/petitions/en/Petition/Details?Petition=e-6746\n\nAlso available on Facebook: https://www.facebook.com/share/1aqvdEuATC/',
    date: '2026-01-07T19:00:00-05:00', // January 7, 2026 at 7:00 PM EST
    location: 'Virtual - X Spaces',
    isVirtual: true,
    virtualLink: 'https://x.com/i/spaces/1mnGeNlkXzAJX?s=20',
    category: 'advocacy',
    tags: ['every-canadian-counts', '3mpwr-app', 'petition-e-6746', 'accessible-democracy', 'civic-engagement', 'x-spaces', 'advocacy'],
    organizer: '3mpwr App & Every Canadian Counts',
    organizerContact: 'everycanadiancounts.com',
    status: 'published',
    registrationRequired: false,
    captions: false,
    asl: false,
    energyCost: 'low',
    accessibilityNotes: 'Virtual X Spaces event. Also available on Facebook: https://www.facebook.com/share/1aqvdEuATC/',
  },
  {
    id: 'evt-ecc-x-spaces-jan8-2026',
    title: 'X Spaces: EveryCanadianCounts Petition Education (Day 2)',
    description: 'Join 3mpwr App & Every Canadian Counts for Day 2 of the educational X Spaces discussion on petition e-6746 about Canada\'s commitment to accessible, inclusive democracy.\n\nGuest: @HubertVan\n\nTopic: Continued discussion on petition e-6746\n\n⚠️ Deadline Alert: Petition ends January 9th!\n\nPetition Details: https://www.ourcommons.ca/petitions/en/Petition/Details?Petition=e-6746\n\nAlso available on Facebook: https://www.facebook.com/share/1aTbEERmm1/',
    date: '2026-01-08T16:00:00-05:00', // January 8, 2026 at 4:00 PM EST
    location: 'Virtual - X Spaces',
    isVirtual: true,
    virtualLink: 'https://x.com/i/spaces/1kvKpMepaqOGE?s=20',
    category: 'advocacy',
    tags: ['every-canadian-counts', '3mpwr-app', 'petition-e-6746', 'accessible-democracy', 'civic-engagement', 'x-spaces', 'advocacy'],
    organizer: '3mpwr App & Every Canadian Counts',
    organizerContact: 'everycanadiancounts.com',
    status: 'published',
    registrationRequired: false,
    captions: false,
    asl: false,
    energyCost: 'low',
    accessibilityNotes: 'Virtual X Spaces event. Day 2 of petition education series. Also available on Facebook: https://www.facebook.com/share/1aTbEERmm1/',
  },
];
