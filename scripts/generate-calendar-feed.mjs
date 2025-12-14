#!/usr/bin/env node
/**
 * Generate ICS calendar feed from all events (community + observances + Firestore)
 * Output: public/events.ics for hosting on website
 * 
 * Run: node scripts/generate-calendar-feed.mjs
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Firebase Admin SDK setup
let admin = null;
let db = null;

async function initializeFirebase() {
  try {
    // Dynamic import for firebase-admin
    const firebaseAdmin = await import('firebase-admin');
    admin = firebaseAdmin.default || firebaseAdmin;
    
    // Find service account
    let saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!saPath) {
      const fallback = join(rootDir, 'firebase', 'serviceAccount.json');
      if (existsSync(fallback)) saPath = fallback;
    }
    
    if (!saPath || !existsSync(saPath)) {
      console.warn('⚠️  Service account not found. Skipping Firestore events.');
      console.warn('   Set GOOGLE_APPLICATION_CREDENTIALS or add firebase/serviceAccount.json');
      return false;
    }
    
    // Initialize Firebase Admin
    if (!admin.apps?.length) {
      const { readFileSync } = await import('fs');
      const serviceAccount = JSON.parse(readFileSync(saPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    
    db = admin.firestore();
    return true;
  } catch (error) {
    console.warn('⚠️  Firebase Admin initialization failed:', error.message);
    console.warn('   Continuing without Firestore events...');
    return false;
  }
}

// Fetch all events from Firestore
async function fetchFirestoreEvents() {
  if (!db) return [];
  
  try {
    const snapshot = await db.collection('events').get();
    const events = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title || 'Untitled Event',
        date: data.date || data.startDate || new Date().toISOString(),
        description: data.description || '',
        location: data.location || '',
        isVirtual: data.isVirtual || false,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
      });
    });
    
    console.log(`📦 Fetched ${events.length} events from Firestore`);
    return events;
  } catch (error) {
    console.warn('⚠️  Error fetching Firestore events:', error.message);
    return [];
  }
}

// Sample static events (fallback if Firestore is unavailable)
const staticEvents = [
  {
    id: 'evt-sample-1',
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

// Generate comprehensive health awareness months and days
function generateHealthAwareness(year) {
  return [
    // January
    { id: `health-${year}-01-birth-defects`, title: 'National Birth Defects Prevention Month', date: `${year}-01-01`, description: 'Awareness of birth defects prevention and healthy pregnancy' },
    { id: `health-${year}-01-glaucoma`, title: 'National Glaucoma Awareness Month', date: `${year}-01-01`, description: 'Early detection and treatment of glaucoma' },
    { id: `health-${year}-01-thyroid`, title: 'Thyroid Awareness Month', date: `${year}-01-01`, description: 'Thyroid disease awareness and screening' },
    { id: `health-${year}-01-cervical`, title: 'Cervical Cancer Awareness Month', date: `${year}-01-01`, description: 'Prevention and early detection of cervical cancer' },
    
    // February
    { id: `health-${year}-02-heart`, title: 'American Heart Month', date: `${year}-02-01`, description: 'Heart disease awareness and cardiovascular health' },
    { id: `health-${year}-02-cancer-prev`, title: 'National Cancer Prevention Month', date: `${year}-02-01`, description: 'Cancer prevention strategies and healthy living' },
    { id: `health-${year}-02-eating-disorders`, title: 'Eating Disorders Awareness Month', date: `${year}-02-01`, description: 'Awareness of eating disorders and treatment' },
    { id: `health-${year}-02-low-vision`, title: 'Low Vision Awareness Month', date: `${year}-02-01`, description: 'Support for people with low vision' },
    
    // March
    { id: `health-${year}-03-kidney`, title: 'National Kidney Month', date: `${year}-03-01`, description: 'Kidney disease awareness and prevention' },
    { id: `health-${year}-03-colorectal`, title: 'Colorectal Cancer Awareness Month', date: `${year}-03-01`, description: 'Colon and rectal cancer screening and prevention' },
    { id: `health-${year}-03-endometriosis`, title: 'Endometriosis Awareness Month', date: `${year}-03-01`, description: 'Awareness of endometriosis and women\'s health' },
    { id: `health-${year}-03-brain-injury`, title: 'Brain Injury Awareness Month', date: `${year}-03-01`, description: 'Traumatic brain injury awareness and prevention' },
    { id: `health-${year}-03-ms`, title: 'Multiple Sclerosis Awareness Month', date: `${year}-03-01`, description: 'MS awareness and support' },
    
    // April
    { id: `health-${year}-04-autism`, title: 'Autism Acceptance Month', date: `${year}-04-01`, description: 'Autism awareness and acceptance' },
    { id: `health-${year}-04-parkinsons`, title: 'Parkinson\'s Awareness Month', date: `${year}-04-01`, description: 'Parkinson\'s disease awareness' },
    { id: `health-${year}-04-donate-life`, title: 'National Donate Life Month', date: `${year}-04-01`, description: 'Organ and tissue donation awareness' },
    { id: `health-${year}-04-testicular`, title: 'Testicular Cancer Awareness Month', date: `${year}-04-01`, description: 'Early detection of testicular cancer' },
    { id: `health-${year}-04-ibs`, title: 'IBS Awareness Month', date: `${year}-04-01`, description: 'Irritable bowel syndrome awareness' },
    
    // May
    { id: `health-${year}-05-mental-health`, title: 'Mental Health Awareness Month', date: `${year}-05-01`, description: 'Mental health awareness and stigma reduction' },
    { id: `health-${year}-05-arthritis`, title: 'Arthritis Awareness Month', date: `${year}-05-01`, description: 'Arthritis awareness and treatment' },
    { id: `health-${year}-05-lupus`, title: 'Lupus Awareness Month', date: `${year}-05-01`, description: 'Systemic lupus awareness' },
    { id: `health-${year}-05-skin-cancer`, title: 'Skin Cancer Awareness Month', date: `${year}-05-01`, description: 'Skin cancer prevention and detection' },
    { id: `health-${year}-05-eds`, title: 'Ehlers-Danlos Syndrome Awareness Month', date: `${year}-05-01`, description: 'EDS and hypermobility disorders awareness' },
    { id: `health-${year}-05-celiac`, title: 'Celiac Disease Awareness Month', date: `${year}-05-01`, description: 'Celiac disease and gluten sensitivity' },
    
    // June
    { id: `health-${year}-06-ptsd`, title: 'PTSD Awareness Month', date: `${year}-06-01`, description: 'Post-traumatic stress disorder awareness' },
    { id: `health-${year}-06-alzheimers`, title: 'Alzheimer\'s & Brain Awareness Month', date: `${year}-06-01`, description: 'Alzheimer\'s disease and dementia awareness' },
    { id: `health-${year}-06-scleroderma`, title: 'Scleroderma Awareness Month', date: `${year}-06-01`, description: 'Scleroderma and autoimmune disease awareness' },
    { id: `health-${year}-06-mg`, title: 'Myasthenia Gravis Awareness Month', date: `${year}-06-01`, description: 'MG awareness and support' },
    
    // July
    { id: `health-${year}-07-disability-pride`, title: 'Disability Pride Month', date: `${year}-07-01`, description: 'Celebrating disability identity and rights' },
    { id: `health-${year}-07-juvenile-arthritis`, title: 'Juvenile Arthritis Awareness Month', date: `${year}-07-01`, description: 'Arthritis in children and youth' },
    
    // August
    { id: `health-${year}-08-immunization`, title: 'National Immunization Awareness Month', date: `${year}-08-01`, description: 'Vaccination and disease prevention' },
    { id: `health-${year}-08-psoriasis`, title: 'Psoriasis Awareness Month', date: `${year}-08-01`, description: 'Psoriasis and psoriatic arthritis awareness' },
    
    // September
    { id: `health-${year}-09-pain`, title: 'Pain Awareness Month', date: `${year}-09-01`, description: 'Chronic pain awareness and management' },
    { id: `health-${year}-09-blood-cancer`, title: 'Blood Cancer Awareness Month', date: `${year}-09-01`, description: 'Leukemia, lymphoma, and myeloma awareness' },
    { id: `health-${year}-09-childhood-cancer`, title: 'Childhood Cancer Awareness Month', date: `${year}-09-01`, description: 'Pediatric cancer awareness and research' },
    { id: `health-${year}-09-ovarian`, title: 'Ovarian Cancer Awareness Month', date: `${year}-09-01`, description: 'Ovarian cancer detection and treatment' },
    { id: `health-${year}-09-pcos`, title: 'Polycystic Ovary Syndrome Awareness Month', date: `${year}-09-01`, description: 'PCOS awareness and women\'s health' },
    { id: `health-${year}-09-suicide-prev`, title: 'Suicide Prevention Month', date: `${year}-09-01`, description: 'Suicide prevention and mental health support' },
    
    // October
    { id: `health-${year}-10-breast-cancer`, title: 'Breast Cancer Awareness Month', date: `${year}-10-01`, description: 'Breast cancer awareness and early detection' },
    { id: `health-${year}-10-depression`, title: 'National Depression Screening Month', date: `${year}-10-01`, description: 'Depression awareness and screening' },
    { id: `health-${year}-10-down-syndrome`, title: 'Down Syndrome Awareness Month', date: `${year}-10-01`, description: 'Down syndrome awareness and inclusion' },
    { id: `health-${year}-10-adhd`, title: 'ADHD Awareness Month', date: `${year}-10-01`, description: 'Attention deficit hyperactivity disorder awareness' },
    { id: `health-${year}-10-domestic-violence`, title: 'Domestic Violence Awareness Month', date: `${year}-10-01`, description: 'Domestic violence awareness and prevention' },
    { id: `health-${year}-10-sids`, title: 'Sudden Infant Death Syndrome Awareness Month', date: `${year}-10-01`, description: 'SIDS prevention and safe sleep' },
    
    // November
    { id: `health-${year}-11-diabetes`, title: 'American Diabetes Month', date: `${year}-11-01`, description: 'Diabetes awareness and prevention' },
    { id: `health-${year}-11-lung-cancer`, title: 'Lung Cancer Awareness Month', date: `${year}-11-01`, description: 'Lung cancer awareness and screening' },
    { id: `health-${year}-11-pancreatic`, title: 'National Pancreatic Cancer Awareness Month', date: `${year}-11-01`, description: 'Pancreatic cancer awareness and research' },
    { id: `health-${year}-11-copd`, title: 'Chronic Obstructive Pulmonary Disease Month', date: `${year}-11-01`, description: 'COPD awareness and lung health' },
    { id: `health-${year}-11-epilepsy`, title: 'Epilepsy Awareness Month', date: `${year}-11-01`, description: 'Epilepsy awareness and seizure disorders' },
    
    // December
    { id: `health-${year}-12-01-aids`, title: 'World AIDS Day', date: `${year}-12-01`, description: 'HIV/AIDS awareness and prevention' },
    { id: `health-${year}-12-safe-toys`, title: 'Safe Toys and Gifts Month', date: `${year}-12-01`, description: 'Child safety and injury prevention' },
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

// Format date for ICS all-day events (YYYYMMDD format, no time)
// For date-only strings, we extract YYYYMMDD directly to avoid timezone issues
function formatICSDateOnly(dateStr) {
  // For date-only strings like "2025-01-04", extract just YYYYMMDD directly
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr.replace(/-/g, '');
  }
  // For ISO strings with time, extract just the date part
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    return dateStr.split('T')[0].replace(/-/g, '');
  }
  // For Date objects, use local date to avoid timezone shift
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// Get next day for all-day event end date (ICS uses exclusive end date)
function getNextDayDateOnly(dateStr) {
  // For date-only strings, parse and add one day
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day + 1); // month is 0-indexed
    const nextYear = d.getFullYear();
    const nextMonth = String(d.getMonth() + 1).padStart(2, '0');
    const nextDay = String(d.getDate()).padStart(2, '0');
    return `${nextYear}${nextMonth}${nextDay}`;
  }
  // For ISO strings with time, extract date and add one day
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const d = new Date(year, month - 1, day + 1);
    const nextYear = d.getFullYear();
    const nextMonth = String(d.getMonth() + 1).padStart(2, '0');
    const nextDay = String(d.getDate()).padStart(2, '0');
    return `${nextYear}${nextMonth}${nextDay}`;
  }
  // Fallback
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// Check if an event is an all-day event based on ID prefix or date format
function isAllDayEvent(event) {
  // All-day events: holidays, observances, health awareness, provincial
  const allDayPrefixes = ['holiday-', 'obs-', 'health-', 'hol-', 'prov-'];
  if (allDayPrefixes.some(prefix => event.id.startsWith(prefix))) {
    return true;
  }
  // Also check if date is date-only (no time component)
  if (typeof event.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
    return true;
  }
  return false;
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
  const uid = `${event.id}@3mpwrapp.pages.dev`;
  const dtstamp = formatICSDate(new Date().toISOString());
  const location = event.isVirtual ? 'Virtual Event' : (event.location || '');
  const allDay = isAllDayEvent(event);
  
  let dateLines;
  if (allDay) {
    // All-day event: use VALUE=DATE format (no time)
    const dateOnly = formatICSDateOnly(event.date);
    // For all-day events, DTEND is the next day (exclusive end date in ICS)
    const endDateOnly = getNextDayDateOnly(event.date);
    dateLines = `DTSTART;VALUE=DATE:${dateOnly}
DTEND;VALUE=DATE:${endDateOnly}`;
  } else {
    // Timed event
    const startDate = formatICSDate(event.date);
    const endDate = startDate; // Default same end time (1-hour default handled by calendar apps)
    dateLines = `DTSTART:${startDate}
DTEND:${endDate}`;
  }
  
  return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
${dateLines}
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
X-WR-CALDESC:Community events, user-created events, disability awareness days, and health observances
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
  
  // Initialize Firebase and fetch Firestore events
  const firebaseInitialized = await initializeFirebase();
  const firestoreEvents = firebaseInitialized ? await fetchFirestoreEvents() : [];
  
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  // Gather all events: static + Firestore + observances + holidays + health awareness
  const allEvents = [
    ...staticEvents,
    ...firestoreEvents,
    ...generateDisabilityObservances(currentYear),
    ...generateDisabilityObservances(nextYear),
    ...generateCanadianHolidays(currentYear),
    ...generateCanadianHolidays(nextYear),
    ...generateHealthAwareness(currentYear),
    ...generateHealthAwareness(nextYear),
  ];
  
  console.log(`📅 Total events: ${allEvents.length}`);
  console.log(`   - Static events: ${staticEvents.length}`);
  console.log(`   - Firestore events: ${firestoreEvents.length}`);
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
  console.log('   2. Calendar includes: user-created events, health observances, disability awareness, holidays');
  console.log('   3. Run this script regularly (e.g., daily via GitHub Actions) to keep feed updated with new user events');
  
  // Close Firebase connection if initialized
  if (admin && db) {
    try {
      await admin.app().delete();
      console.log('🔌 Firebase connection closed');
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

main().catch(err => {
  console.error('❌ Error generating calendar feed:', err);
  process.exit(1);
});
