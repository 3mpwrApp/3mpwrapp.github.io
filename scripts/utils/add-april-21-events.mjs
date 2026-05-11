#!/usr/bin/env node
/**
 * Add April 2026 Events from Family Matters poster and IWC announcements
 */

import fs from 'fs';

const eventsFile = './api/events.json';
const events = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));

const newEvents = [
  // Family Matters Focus Groups (TBDIWSG)
  {
    id: 'evt-tbdiwsg-family-matters-april15-2026',
    title: 'Family Matters: Focus Group on Workplace Injury Impacts',
    date: '2026-04-15',
    startTime: '18:00',
    endTime: '20:00',
    location: 'Online (Zoom)',
    description: 'Research project exploring the impacts of workplace injuries on family members. 2-hour focus group or interview. Participants receive a $50 gift card. All information collected is confidential.',
    category: 'research',
    organizer: 'Thunder Bay & District Injured Workers Support Group (TB&DIWSG)',
    contact: 'Eugene Lefrancois',
    phone: '(807) 622-8897',
    registrationRequired: true,
    registrationUrl: 'https://thunderbayinjuredworkers.com',
    tags: ['research', 'family-support', 'focus-group', 'zoom'],
    isVirtual: true,
    promotionEndDate: '2026-04-15'
  },
  {
    id: 'evt-tbdiwsg-family-matters-april21-2026',
    title: 'Family Matters: Focus Group on Workplace Injury Impacts',
    date: '2026-04-21',
    startTime: '18:00',
    endTime: '20:00',
    location: 'Online (Zoom)',
    description: 'Research project exploring the impacts of workplace injuries on family members. 2-hour focus group or interview. Participants receive a $50 gift card. All information collected is confidential.',
    category: 'research',
    organizer: 'Thunder Bay & District Injured Workers Support Group (TB&DIWSG)',
    contact: 'Eugene Lefrancois',
    phone: '(807) 622-8897',
    registrationRequired: true,
    registrationUrl: 'https://thunderbayinjuredworkers.com',
    tags: ['research', 'family-support', 'focus-group', 'zoom'],
    isVirtual: true,
    promotionEndDate: '2026-04-21'
  },
  {
    id: 'evt-tbdiwsg-family-matters-april25-2026',
    title: 'Family Matters: Focus Group on Workplace Injury Impacts (In-Person)',
    date: '2026-04-25',
    startTime: '12:00',
    endTime: '15:00',
    location: 'OPSEU Member Centre Thunder Bay (beside Merla Mae)',
    address: 'Thunder Bay, ON',
    description: 'Research project exploring the impacts of workplace injuries on family members. 2-hour focus group or interview, in person with lunch provided. Participants receive a $50 gift card. All information collected is confidential.',
    category: 'research',
    organizer: 'Thunder Bay & District Injured Workers Support Group (TB&DIWSG)',
    contact: 'Eugene Lefrancois',
    phone: '(807) 622-8897',
    registrationRequired: true,
    registrationUrl: 'https://thunderbayinjuredworkers.com',
    tags: ['research', 'family-support', 'focus-group', 'in-person', 'thunder-bay'],
    isVirtual: false,
    promotionEndDate: '2026-04-25',
    notes: 'Lunch provided at OPSEU Member Centre'
  },
  // National Day of Mourning (Canada-wide)
  {
    id: 'evt-national-day-of-mourning-2026',
    title: 'National Day of Mourning for Workers Killed or Injured on the Job',
    date: '2026-04-28',
    location: 'Multiple Locations Across Canada',
    description: 'The National Day of Mourning is observed in Canada on April 28. It commemorates workers who have been killed, injured or suffered illness due to workplace related hazards and occupational exposures. Events are taking place in many communities throughout Ontario and Canada.',
    category: 'memorial',
    organizer: 'National (Canada-wide)',
    tags: ['day-of-mourning', 'memorial', 'workplace-safety', 'national', 'canada-wide'],
    isVirtual: false,
    registrationRequired: false,
    promotionEndDate: '2026-04-28',
    notes: 'Multiple events across Canada - check local listings for times and locations'
  },
  // IWC Community Meeting on WSIB Changes
  {
    id: 'evt-iwc-wsib-changes-april29-2026',
    title: 'Community Meeting: Proposed Changes to WSIB Legislation',
    date: '2026-04-29',
    startTime: '13:00',
    location: '815 Danforth Ave, Suite 411, Toronto + Online (Hybrid)',
    address: '815 Danforth Ave, Suite 411, Toronto, ON',
    description: 'Ontario government has proposed significant changes to the Workplace Safety and Insurance Act, including: raising loss of earnings benefits from 85% to 90%, ending the Age 65 benefit cut-off, and extending coverage to healthcare workers in retirement/group homes. Join us to discuss the details, how they apply to injured workers, and what we can do to ensure proper implementation.',
    category: 'advocacy',
    organizer: 'Injured Workers Consultants (IWC)',
    registrationRequired: true,
    registrationUrl: 'https://us02web.zoom.us/meeting/register/tZEtde6rrT0jGdDGbPz8tF4m8JhKf5cdvnw2',
    tags: ['wsib-reform', 'legislation', 'advocacy', 'community-meeting', 'hybrid', 'toronto'],
    isVirtual: true,
    promotionEndDate: '2026-04-29',
    notes: 'Hybrid event: Limited in-person spots at 815 Danforth, Suite 411. Register for either in-person or online attendance at tinyurl.com/IWApril29'
  },
  // Injured Workers Day (June 1) - Strategic promotion
  {
    id: 'evt-injured-workers-day-2026',
    title: 'Injured Workers Day - Recognition & Advocacy',
    date: '2026-06-01',
    location: 'Ontario-wide / Queen\'s Park',
    description: 'June 1st is Injured Workers Day in Ontario, officially recognized since 2024. This day honours injured workers and their families, recognizes the struggles they face, and advocates for fair treatment and compensation. Events typically include rallies at Queen\'s Park and local community gatherings.',
    category: 'advocacy',
    organizer: 'Various Organizations (Unifor, IWO, Justice 4 Workers, etc.)',
    tags: ['injured-workers-day', 'june-1', 'advocacy', 'recognition', 'queens-park', 'legislative'],
    isVirtual: false,
    registrationRequired: false,
    registrationUrl: 'https://injuredworkersonline.org/june1st2025/',
    promotionEndDate: '2026-06-01',
    isFeatured: true,
    importance: 'high',
    notes: 'Relatively new recognition (legislated in 2024 via Bill 31). Strategic promotion needed. Historic context: Injured workers have long fought for recognition and fair compensation. Resources: Unifor, Injured Workers Online, OHCOW, Justice 4 Workers.',
    resources: [
      {
        title: 'Unifor: Recognize Injured Workers Day',
        url: 'https://www.unifor.org/news/events/recognize-injured-workers-day-june-1'
      },
      {
        title: 'Injured Workers Online: June 1st Events',
        url: 'https://injuredworkersonline.org/june1st2025/'
      },
      {
        title: 'IWO: Injured Workers Day Information',
        url: 'https://injuredworkersonline.org/events/injured-workers-day/'
      },
      {
        title: 'Ontario Legislation: Bill 31',
        url: 'https://www.ontario.ca/laws/statute/s24031'
      },
      {
        title: 'OHCOW: The Fight for Injured Workers Day',
        url: 'https://www.ohcow.on.ca/posts/the-fight-for-injured-workers-day/'
      },
      {
        title: 'Justice 4 Workers: 2025 Injured Workers Day',
        url: 'https://www.justice4workers.org/2025-06-01_injured_workers_day'
      }
    ]
  }
];

// Add events
events.push(...newEvents);

// Write back
fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));

console.log(`✅ Added ${newEvents.length} events to events.json`);
console.log('Events added:');
newEvents.forEach(e => {
  console.log(`  - ${e.date}: ${e.title}`);
});
console.log(`\nTotal events: ${events.length}`);
