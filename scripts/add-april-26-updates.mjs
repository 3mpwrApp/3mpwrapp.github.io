#!/usr/bin/env node
/**
 * ADD-APRIL-26-UPDATES.MJS
 * Updates IWC event link and adds 2 new critical events
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsFile = path.join(__dirname, '../api/events.json');
const events = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));

console.log('📋 Updating events...\n');

// 1. Fix IWC April 29 event link
const iwcEventIndex = events.findIndex(e => e.id === 'evt-iwc-wsib-changes-april29-2026');
if (iwcEventIndex !== -1) {
  events[iwcEventIndex].registrationUrl = 'https://iwclc.org/community-meeting-apr-29-on-proposed-changes/';
  events[iwcEventIndex].organizerWebsite = 'https://iwclc.org';
  events[iwcEventIndex].notes = 'Hybrid event: Limited in-person spots at 815 Danforth, Suite 411. Register at iwclc.org/community-meeting-apr-29-on-proposed-changes/';
  console.log('✅ Updated IWC event link');
}

// 2. Add IAVGO Day of Mourning event
const iavgoEvent = {
  id: 'evt-iavgo-day-of-mourning-april28-2026',
  title: 'IAVGO Day of Mourning - Day of Action',
  date: '2026-04-28',
  startTime: '14:00',
  location: 'WSIB, 200 Front Street West, Toronto, ON',
  address: '200 Front Street West, Toronto, ON',
  description: 'Join IAVGO Community Legal Clinic for a Day of Action on the National Day of Mourning. We mourn for the dead and fight for the living. This action brings together injured workers, advocates, and community members to honor those lost to workplace injuries and illness, and to demand justice and fair treatment for injured workers.',
  category: 'advocacy',
  organizer: 'IAVGO Community Legal Clinic',
  contactEmail: 'iwaction4j@gmail.com',
  contactPhone: '647-832-1514',
  registrationRequired: false,
  tags: [
    'day-of-mourning',
    'april-28',
    'advocacy',
    'direct-action',
    'wsib',
    'toronto',
    'iavgo'
  ],
  isVirtual: false,
  promotionEndDate: '2026-04-28',
  notes: 'Mourn for the dead, fight for the living. Contact: iwaction4j@gmail.com or 647-832-1514'
};

// Check if IAVGO event already exists
if (!events.find(e => e.id === iavgoEvent.id)) {
  events.push(iavgoEvent);
  console.log('✅ Added IAVGO Day of Mourning event');
}

// 3. Add Bill 105 advocacy campaign
const bill105Event = {
  id: 'evt-bill105-72month-lockin-campaign-2026',
  title: 'URGENT: Stop Bill 105 - Protect the 72-Month Lock-In',
  date: '2026-04-28',
  startTime: '09:00',
  endTime: '17:00',
  location: 'Ontario-wide / Phone Campaign',
  description: `🚨 INJURED WORKERS ARE UNDER ATTACK 🚨

A poison pill is hidden in Ontario Bill 105, Schedule 9. The Ontario government is trying to remove the 72-month lock-in for injured workers who have permanent injuries and can't return to work, putting us on perpetual probation.

WHY THIS MATTERS:
• The 72-month lock-in provides crucial income security for permanently injured workers
• Removal will re-traumatize injured workers with ongoing insecurity
• Perpetual threat of surveillance and reassessment
• Risks mental breakdown and financial ruin
• Disproportionate impact on injured workers, refugees, and undocumented workers

CALL TO ACTION - MAKE CALLS NOW:
📞 Minister of Labour David Piccini: 416-326-7600
📞 Premier Doug Ford: 416-325-1941
📞 WSIB CEO & President Jeffrey Lang: 416-344-1000
📞 Call your Local MPP

DEMAND: Withdraw Schedule 9 from Bill 105 and protect the 72-month lock-in!`,
  category: 'advocacy',
  organizer: 'Injured Workers Community',
  registrationRequired: false,
  tags: [
    'bill-105',
    '72-month-lockin',
    'urgent',
    'advocacy',
    'phone-campaign',
    'income-security',
    'permanent-injury'
  ],
  isVirtual: true,
  isFeatured: true,
  importance: 'critical',
  promotionEndDate: '2026-05-15',
  notes: 'URGENT advocacy campaign. Call daily until Schedule 9 is withdrawn. This affects all permanently injured workers in Ontario.',
  callToAction: {
    primary: 'Call Minister Piccini: 416-326-7600',
    secondary: [
      'Call Premier Ford: 416-325-1941',
      'Call WSIB CEO Lang: 416-344-1000',
      'Call your Local MPP'
    ],
    message: 'Demand withdrawal of Schedule 9 from Bill 105. Protect the 72-month lock-in for injured workers!'
  }
};

// Check if Bill 105 event already exists
if (!events.find(e => e.id === bill105Event.id)) {
  events.push(bill105Event);
  console.log('✅ Added Bill 105 advocacy campaign');
}

// Save updated events
fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));

console.log(`\n✅ Updated events.json`);
console.log(`📊 Total events: ${events.length}`);
console.log('\nNew events:');
console.log('- evt-iavgo-day-of-mourning-april28-2026 (April 28, 2 PM at WSIB Toronto)');
console.log('- evt-bill105-72month-lockin-campaign-2026 (Urgent phone campaign)');
console.log('- evt-iwc-wsib-changes-april29-2026 (Link updated to iwclc.org)');
