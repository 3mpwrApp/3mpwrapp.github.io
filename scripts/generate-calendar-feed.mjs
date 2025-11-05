#!/usr/bin/env node
/**
 * Generate ICS calendar feed from all events (community + observances)
 * Output: public/events.ics for hosting on website
 * 
 * Run: node scripts/generate-calendar-feed.mjs
 */

import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Import event data (simplified versions)
const events = [
  // Sample community events - add more from data/events.ts
  {
    id: 'evt-1',
    title: '3mpwr Community Meetup',
    date: '2025-11-15T18:00:00',
    description: 'Monthly community gathering for peer support and networking',
    location: 'Virtual',
    isVirtual: true,
  },
];

// Generate disability observances for current year
function generateDisabilityObservances(year) {
  return [
    {
      id: `obs-${year}-01-04-braille`,
      title: 'World Braille Day',
      date: `${year}-01-04`,
      description: 'Celebrating the birth of Louis Braille and raising awareness about the importance of Braille literacy',
    },
    {
      id: `obs-${year}-02-04-cancer`,
      title: 'World Cancer Day',
      date: `${year}-02-04`,
      description: 'Raising awareness about cancer and encouraging prevention, detection, and treatment',
    },
    {
      id: `obs-${year}-03-21-down`,
      title: 'World Down Syndrome Day',
      date: `${year}-03-21`,
      description: 'Raising awareness and creating a single global voice for advocating for the rights of people with Down syndrome',
    },
    {
      id: `obs-${year}-04-02-autism`,
      title: 'World Autism Awareness Day',
      date: `${year}-04-02`,
      description: 'Promoting acceptance and inclusion of people with autism spectrum disorder',
    },
    {
      id: `obs-${year}-05-05-celiac`,
      title: 'World Celiac Disease Day',
      date: `${year}-05-05`,
      description: 'Raising awareness about celiac disease and gluten sensitivity',
    },
    {
      id: `obs-${year}-06-27-hiv`,
      title: 'National HIV Testing Day',
      date: `${year}-06-27`,
      description: 'Encouraging people to get tested for HIV and know their status',
    },
    {
      id: `obs-${year}-10-10-mental-health`,
      title: 'World Mental Health Day',
      date: `${year}-10-10`,
      description: 'Raising awareness about mental health issues and mobilizing efforts in support of mental health',
    },
    {
      id: `obs-${year}-12-03-disability`,
      title: 'International Day of Persons with Disabilities',
      date: `${year}-12-03`,
      description: 'Promoting the rights and well-being of persons with disabilities',
    },
  ];
}

// Generate Canadian holidays
function generateCanadianHolidays(year) {
  return [
    { id: `hol-${year}-01-01`, title: 'New Year\'s Day', date: `${year}-01-01`, description: 'National statutory holiday' },
    { id: `hol-${year}-07-01`, title: 'Canada Day', date: `${year}-07-01`, description: 'National statutory holiday' },
    { id: `hol-${year}-09-02`, title: 'Labour Day', date: `${year}-09-02`, description: 'National statutory holiday' },
    { id: `hol-${year}-10-14`, title: 'Thanksgiving', date: `${year}-10-14`, description: 'National statutory holiday' },
    { id: `hol-${year}-12-25`, title: 'Christmas Day', date: `${year}-12-25`, description: 'National statutory holiday' },
    { id: `hol-${year}-12-26`, title: 'Boxing Day', date: `${year}-12-26`, description: 'National statutory holiday' },
  ];
}

// Format date for ICS (YYYYMMDDTHHMMSSZ)
function formatICSDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // If invalid, try as date-only string
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
    }
    return '20250101'; // Fallback
  }
  
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hour = String(d.getUTCHours()).padStart(2, '0');
  const minute = String(d.getUTCMinutes()).padStart(2, '0');
  const second = String(d.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

// Escape ICS text (replace newlines, commas, semicolons)
function escapeICS(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

// Generate single event ICS entry
function generateEvent(event) {
  const startDate = formatICSDate(event.date);
  const endDate = startDate; // All-day events or 1-hour duration
  const uid = `${event.id}@3mpwrapp.pages.dev`;
  const dtstamp = formatICSDate(new Date().toISOString());
  
  const location = event.isVirtual ? 'Virtual Event' : (event.location || '');
  
  return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${escapeICS(event.title)}
DESCRIPTION:${escapeICS(event.description || '')}
LOCATION:${escapeICS(location)}
STATUS:CONFIRMED
TRANSP:OPAQUE
URL:https://3mpwrapp.pages.dev/events/
ORGANIZER;CN=3mpwr App:mailto:empowrapp08162025@gmail.com
END:VEVENT`;
}

// Generate full ICS calendar
function generateICSFeed(allEvents) {
  const header = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//3mpwr App//Events Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:3mpwr App Events
X-WR-CALDESC:Community events, disability awareness days, and health observances
X-WR-TIMEZONE:America/Toronto
REFRESH-INTERVAL;VALUE=DURATION:PT24H
X-PUBLISHED-TTL:PT24H`;

  const events = allEvents.map(evt => generateEvent(evt)).join('\n');
  
  const footer = 'END:VCALENDAR';
  
  return `${header}\n${events}\n${footer}`;
}

// Main execution
async function main() {
  console.log('🗓️  Generating calendar feed...');
  
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  // Gather all events
  const allEvents = [
    ...events,
    ...generateDisabilityObservances(currentYear),
    ...generateDisabilityObservances(nextYear),
    ...generateCanadianHolidays(currentYear),
    ...generateCanadianHolidays(nextYear),
  ];
  
  console.log(`📅 Total events: ${allEvents.length}`);
  console.log(`   - Current year (${currentYear}): ${allEvents.filter(e => e.date.startsWith(String(currentYear))).length}`);
  console.log(`   - Next year (${nextYear}): ${allEvents.filter(e => e.date.startsWith(String(nextYear))).length}`);
  
  // Generate ICS content
  const icsContent = generateICSFeed(allEvents);
  
  // Ensure public directory exists
  const publicDir = join(rootDir, 'public');
  try {
    mkdirSync(publicDir, { recursive: true });
  } catch (err) {
    // Directory already exists
  }
  
  // Write to public/events.ics
  const outputPath = join(publicDir, 'events.ics');
  writeFileSync(outputPath, icsContent, 'utf8');
  
  console.log(`✅ Calendar feed generated: ${outputPath}`);
  console.log(`📍 Size: ${(icsContent.length / 1024).toFixed(2)} KB`);
  console.log('');
  console.log('📤 Next steps:');
  console.log('   1. Host this file on your website at: https://3mpwrapp.pages.dev/events.ics');
  console.log('   2. Or update EXPO_PUBLIC_CALENDAR_FEED_URL to point to the hosted location');
  console.log('   3. Run this script regularly (e.g., daily via GitHub Actions) to keep feed updated');
}

main().catch(err => {
  console.error('❌ Error generating calendar feed:', err);
  process.exit(1);
});
