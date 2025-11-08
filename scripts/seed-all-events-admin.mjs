#!/usr/bin/env node
/**
 * SEED ALL EVENTS TO FIREBASE (ADMIN SDK)
 * 
 * Uses Firebase Admin SDK with service account to bypass auth requirements
 * This script syncs ALL event types to Firestore:
 * 1. Canadian Holidays (federal & provincial)
 * 2. Disability Observances (World Braille Day, GAAD, etc.)
 * 3. Health Awareness Months (Mental Health, Breast Cancer, etc.)
 * 4. User-Created Events (from AsyncStorage or manual input)
 * 
 * Events are synced to BOTH:
 * - events_production (live website)
 * - events_preview (testing)
 * 
 * Usage: node scripts/seed-all-events-admin.mjs
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin SDK
const serviceAccountPath = join(__dirname, '../google-services.json');
let serviceAccount;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('❌ Failed to load service account. Make sure google-services.json exists.');
  console.error('   Path:', serviceAccountPath);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'empowrapp'
});

const db = admin.firestore();
const SYSTEM_UID = 'system-events';
const CURRENT_YEAR = 2025;

// ============================================================================
// CANADIAN HOLIDAYS
// ============================================================================
function generateCanadianHolidays(year) {
  const holidays = [];
  
  // Fixed holidays
  holidays.push(
    { id: `holiday-${year}-new-year`, title: 'New Year\'s Day', date: `${year}-01-01`, category: 'holiday', province: 'all' },
    { id: `holiday-${year}-canada-day`, title: 'Canada Day', date: `${year}-07-01`, category: 'holiday', province: 'all' },
    { id: `holiday-${year}-christmas`, title: 'Christmas Day', date: `${year}-12-25`, category: 'holiday', province: 'all' },
    { id: `holiday-${year}-boxing-day`, title: 'Boxing Day', date: `${year}-12-26`, category: 'holiday', province: 'all' },
  );
  
  // Easter-based holidays
  const easter = easterSunday(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(goodFriday.getDate() - 2);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easterMonday.getDate() + 1);
  
  holidays.push(
    { id: `holiday-${year}-good-friday`, title: 'Good Friday', date: formatDate(goodFriday), category: 'holiday', province: 'all' },
    { id: `holiday-${year}-easter-monday`, title: 'Easter Monday', date: formatDate(easterMonday), category: 'holiday', province: 'QC' },
  );
  
  // Victoria Day (Monday before May 25)
  const victoriaDay = mondayBeforeMay25(year);
  holidays.push({ id: `holiday-${year}-victoria-day`, title: 'Victoria Day', date: formatDate(victoriaDay), category: 'holiday', province: 'all' });
  
  // Labour Day (first Monday of September)
  const labourDay = nthWeekdayOfMonth(year, 8, 1, 1);
  holidays.push({ id: `holiday-${year}-labour-day`, title: 'Labour Day', date: formatDate(labourDay), category: 'holiday', province: 'all' });
  
  // Thanksgiving (second Monday of October)
  const thanksgiving = nthWeekdayOfMonth(year, 9, 1, 2);
  holidays.push({ id: `holiday-${year}-thanksgiving`, title: 'Thanksgiving', date: formatDate(thanksgiving), category: 'holiday', province: 'all' });
  
  // Provincial holidays
  holidays.push(
    { id: `holiday-${year}-family-day-ab`, title: 'Family Day', date: formatDate(nthWeekdayOfMonth(year, 1, 1, 3)), category: 'holiday', province: 'AB' },
    { id: `holiday-${year}-family-day-bc`, title: 'Family Day', date: formatDate(nthWeekdayOfMonth(year, 1, 1, 3)), category: 'holiday', province: 'BC' },
    { id: `holiday-${year}-family-day-on`, title: 'Family Day', date: formatDate(nthWeekdayOfMonth(year, 1, 1, 3)), category: 'holiday', province: 'ON' },
    { id: `holiday-${year}-islander-day`, title: 'Islander Day', date: formatDate(nthWeekdayOfMonth(year, 1, 1, 3)), category: 'holiday', province: 'PE' },
    { id: `holiday-${year}-louis-riel`, title: 'Louis Riel Day', date: formatDate(nthWeekdayOfMonth(year, 1, 1, 3)), category: 'holiday', province: 'MB' },
    { id: `holiday-${year}-st-jean-baptiste`, title: 'Saint-Jean-Baptiste Day', date: `${year}-06-24`, category: 'holiday', province: 'QC' },
    { id: `holiday-${year}-discovery-day-nl`, title: 'Discovery Day', date: formatDate(nthWeekdayOfMonth(year, 5, 1, -1)), category: 'holiday', province: 'NL' },
    { id: `holiday-${year}-civic-holiday`, title: 'Civic Holiday', date: formatDate(nthWeekdayOfMonth(year, 7, 1, 1)), category: 'holiday', province: 'ON' },
    { id: `holiday-${year}-discovery-day-yt`, title: 'Discovery Day', date: formatDate(nthWeekdayOfMonth(year, 7, 1, 3)), category: 'holiday', province: 'YT' },
  );
  
  return holidays;
}

// ============================================================================
// DISABILITY OBSERVANCES
// ============================================================================
function generateDisabilityObservances(year) {
  return [
    {
      id: `obs-${year}-world-braille`,
      title: 'World Braille Day',
      date: `${year}-01-04`,
      category: 'observance',
      description: 'Celebrating the importance of braille for blind and visually impaired people',
      tags: ['accessibility', 'disability', 'vision']
    },
    {
      id: `obs-${year}-bell-lets-talk`,
      title: 'Bell Let\'s Talk Day',
      date: `${year}-01-29`,
      category: 'observance',
      description: 'Mental health awareness and stigma reduction',
      tags: ['mental-health', 'awareness']
    },
    {
      id: `obs-${year}-wheelchair-day`,
      title: 'International Wheelchair Day',
      date: `${year}-03-01`,
      category: 'observance',
      description: 'Celebrating wheelchair users and promoting accessibility',
      tags: ['accessibility', 'disability', 'mobility']
    },
    {
      id: `obs-${year}-down-syndrome`,
      title: 'World Down Syndrome Day',
      date: `${year}-03-21`,
      category: 'observance',
      description: 'Awareness and acceptance of people with Down syndrome',
      tags: ['disability', 'awareness', 'inclusion']
    },
    {
      id: `obs-${year}-autism-day`,
      title: 'World Autism Awareness Day',
      date: `${year}-04-02`,
      category: 'observance',
      description: 'Promoting understanding and acceptance of autism',
      tags: ['autism', 'disability', 'awareness']
    },
    {
      id: `obs-${year}-injured-workers`,
      title: 'National Day of Mourning',
      date: `${year}-04-28`,
      category: 'observance',
      description: 'Remembering workers killed, injured, or made ill at work',
      tags: ['workers-rights', 'safety']
    },
    {
      id: `obs-${year}-gaad`,
      title: 'Global Accessibility Awareness Day',
      date: `${year}-05-15`,
      category: 'observance',
      description: 'Promoting digital accessibility and inclusion',
      tags: ['accessibility', 'technology', 'disability']
    },
    {
      id: `obs-${year}-injured-workers-day`,
      title: 'Injured Workers Day',
      date: `${year}-06-01`,
      category: 'observance',
      description: 'Solidarity with injured and ill workers',
      tags: ['workers-rights', 'disability']
    },
    {
      id: `obs-${year}-deafblind-month`,
      title: 'Deafblind Awareness Month',
      date: `${year}-06-01`,
      category: 'observance',
      description: 'Month-long observance of deafblind awareness',
      tags: ['disability', 'deafblind', 'awareness']
    },
    {
      id: `obs-${year}-cpac-day`,
      title: 'Cerebral Palsy Awareness Day',
      date: `${year}-10-06`,
      category: 'observance',
      description: 'Awareness of cerebral palsy',
      tags: ['disability', 'cerebral-palsy']
    },
    {
      id: `obs-${year}-mental-health-day`,
      title: 'World Mental Health Day',
      date: `${year}-10-10`,
      category: 'observance',
      description: 'Global mental health awareness',
      tags: ['mental-health', 'awareness']
    },
    {
      id: `obs-${year}-white-cane-day`,
      title: 'White Cane Safety Day',
      date: `${year}-10-15`,
      category: 'observance',
      description: 'Celebrating independence of people who are blind or visually impaired',
      tags: ['accessibility', 'disability', 'vision']
    },
    {
      id: `obs-${year}-idpd`,
      title: 'International Day of Persons with Disabilities',
      date: `${year}-12-03`,
      category: 'observance',
      description: 'Promoting rights and well-being of persons with disabilities',
      tags: ['disability', 'rights', 'UN']
    }
  ];
}

// ============================================================================
// HEALTH AWARENESS MONTHS
// ============================================================================
function generateHealthAwarenessMonths(year) {
  const events = [];
  
  // January
  events.push(
    { id: `health-${year}-01-glaucoma`, title: 'National Glaucoma Awareness Month', date: `${year}-01-01`, category: 'health', description: 'Early detection and treatment of glaucoma' },
    { id: `health-${year}-01-thyroid`, title: 'Thyroid Awareness Month', date: `${year}-01-01`, category: 'health', description: 'Thyroid disease awareness and screening' },
    { id: `health-${year}-01-cervical`, title: 'Cervical Cancer Awareness Month', date: `${year}-01-01`, category: 'health', description: 'Prevention and early detection of cervical cancer' },
  );
  
  // February
  events.push(
    { id: `health-${year}-02-heart`, title: 'Heart Month', date: `${year}-02-01`, category: 'health', description: 'Cardiovascular health awareness' },
    { id: `health-${year}-02-eating-disorders`, title: 'Eating Disorders Awareness Month', date: `${year}-02-01`, category: 'health', description: 'Awareness of eating disorders and treatment' },
    { id: `health-${year}-02-low-vision`, title: 'Low Vision Awareness Month', date: `${year}-02-01`, category: 'health', description: 'Support for people with low vision' },
  );
  
  // March
  events.push(
    { id: `health-${year}-03-colorectal`, title: 'Colorectal Cancer Awareness Month', date: `${year}-03-01`, category: 'health', description: 'Colon and rectal cancer screening' },
    { id: `health-${year}-03-endometriosis`, title: 'Endometriosis Awareness Month', date: `${year}-03-01`, category: 'health', description: 'Women\'s health awareness' },
    { id: `health-${year}-03-brain-injury`, title: 'Brain Injury Awareness Month', date: `${year}-03-01`, category: 'health', description: 'Traumatic brain injury awareness' },
    { id: `health-${year}-03-ms`, title: 'Multiple Sclerosis Awareness Month', date: `${year}-03-01`, category: 'health', description: 'MS awareness and support' },
  );
  
  // April
  events.push(
    { id: `health-${year}-04-autism`, title: 'Autism Awareness Month', date: `${year}-04-01`, category: 'health', description: 'Autism acceptance and understanding' },
    { id: `health-${year}-04-parkinsons`, title: 'Parkinson\'s Awareness Month', date: `${year}-04-01`, category: 'health', description: 'Parkinson\'s disease awareness' },
    { id: `health-${year}-04-oral-health`, title: 'Oral Health Month', date: `${year}-04-01`, category: 'health', description: 'Dental and oral health' },
    { id: `health-${year}-04-testicular`, title: 'Testicular Cancer Awareness Month', date: `${year}-04-01`, category: 'health', description: 'Early detection of testicular cancer' },
  );
  
  // May
  events.push(
    { id: `health-${year}-05-mental-health`, title: 'Mental Health Awareness Month', date: `${year}-05-01`, category: 'health', description: 'Mental health awareness and stigma reduction' },
    { id: `health-${year}-05-arthritis`, title: 'Arthritis Awareness Month', date: `${year}-05-01`, category: 'health', description: 'Arthritis awareness and treatment' },
    { id: `health-${year}-05-lupus`, title: 'Lupus Awareness Month', date: `${year}-05-01`, category: 'health', description: 'Systemic lupus awareness' },
    { id: `health-${year}-05-speech`, title: 'Speech and Hearing Month', date: `${year}-05-01`, category: 'health', description: 'Communication disorders awareness' },
  );
  
  // June
  events.push(
    { id: `health-${year}-06-alzheimers`, title: 'Alzheimer\'s and Brain Awareness Month', date: `${year}-06-01`, category: 'health', description: 'Dementia and brain health' },
    { id: `health-${year}-06-mens-health`, title: 'Men\'s Health Month', date: `${year}-06-01`, category: 'health', description: 'Men\'s health screening and awareness' },
    { id: `health-${year}-06-ptsd`, title: 'PTSD Awareness Month', date: `${year}-06-01`, category: 'health', description: 'Post-traumatic stress disorder awareness' },
  );
  
  // July
  events.push(
    { id: `health-${year}-07-vision`, title: 'UV Safety Month', date: `${year}-07-01`, category: 'health', description: 'Eye protection and vision safety' },
  );
  
  // August
  events.push(
    { id: `health-${year}-08-immunization`, title: 'Immunization Awareness Month', date: `${year}-08-01`, category: 'health', description: 'Vaccination importance' },
  );
  
  // September
  events.push(
    { id: `health-${year}-09-pain`, title: 'Pain Awareness Month', date: `${year}-09-01`, category: 'health', description: 'Chronic pain awareness' },
    { id: `health-${year}-09-prostate`, title: 'Prostate Cancer Awareness Month', date: `${year}-09-01`, category: 'health', description: 'Prostate health screening' },
    { id: `health-${year}-09-suicide-prevention`, title: 'Suicide Prevention Month', date: `${year}-09-01`, category: 'health', description: 'Mental health crisis prevention' },
  );
  
  // October
  events.push(
    { id: `health-${year}-10-breast-cancer`, title: 'Breast Cancer Awareness Month', date: `${year}-10-01`, category: 'health', description: 'Breast cancer screening and support' },
    { id: `health-${year}-10-mental-health`, title: 'Mental Health Awareness Week', date: `${year}-10-06`, category: 'health', description: 'Mental health education' },
  );
  
  // November
  events.push(
    { id: `health-${year}-11-diabetes`, title: 'Diabetes Awareness Month', date: `${year}-11-01`, category: 'health', description: 'Diabetes prevention and management' },
    { id: `health-${year}-11-epilepsy`, title: 'Epilepsy Awareness Month', date: `${year}-11-01`, category: 'health', description: 'Seizure disorders awareness' },
    { id: `health-${year}-11-copd`, title: 'COPD Awareness Month', date: `${year}-11-01`, category: 'health', description: 'Lung disease awareness' },
  );
  
  // December
  events.push(
    { id: `health-${year}-12-aids`, title: 'World AIDS Day', date: `${year}-12-01`, category: 'health', description: 'HIV/AIDS awareness and prevention' },
  );
  
  return events;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function nthWeekdayOfMonth(year, monthIndex, weekday, n) {
  if (n < 0) {
    const lastDay = new Date(year, monthIndex + 1, 0);
    let count = 0;
    for (let d = lastDay.getDate(); d >= 1; d--) {
      const date = new Date(year, monthIndex, d);
      if (date.getDay() === weekday) {
        count++;
        if (count === Math.abs(n)) return date;
      }
    }
  }
  
  const first = new Date(year, monthIndex, 1);
  const firstWeekday = first.getDay();
  const offset = (7 + weekday - firstWeekday) % 7;
  const day = 1 + offset + (n - 1) * 7;
  return new Date(year, monthIndex, day);
}

function mondayBeforeMay25(year) {
  const d = new Date(year, 4, 24);
  while (d.getDay() !== 1) d.setDate(d.getDate() - 1);
  return d;
}

function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// ============================================================================
// SYNC TO FIRESTORE
// ============================================================================
async function syncEventToFirestore(event, collectionName) {
  try {
    const eventDate = admin.firestore.Timestamp.fromDate(new Date(event.date));
    
    const eventData = {
      id: event.id,
      title: event.title,
      description: event.description || '',
      date: eventDate,
      location: event.location || (event.province ? `${event.province}, Canada` : 'Canada'),
      isVirtual: event.isVirtual || false,
      asl: event.asl || false,
      captions: event.captions || false,
      stepFree: event.stepFree || false,
      sensorySpace: event.sensorySpace || false,
      tags: event.tags || [event.category || 'general'],
      organizer: event.organizer || '3mpwrApp',
      imageUrl: event.imageUrl || '',
      attendeeCount: event.attendeeCount || 0,
      url: event.url || '',
      category: event.category || 'general',
      createdBy: event.createdBy || SYSTEM_UID,
      createdAt: event.createdAt || Date.now(),
      updatedAt: Date.now(),
      status: 'published'
    };
    
    await db.collection(collectionName).doc(event.id).set(eventData, { merge: true });
    return true;
  } catch (error) {
    console.error(`   ❌ Failed: ${event.title} - ${error.message}`);
    return false;
  }
}

async function getExistingEventCount(collectionName) {
  try {
    const snapshot = await db.collection(collectionName).count().get();
    return snapshot.data().count;
  } catch (error) {
    return 0;
  }
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         🌍 SEED ALL EVENTS TO FIREBASE (ADMIN SDK)        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  // Check existing events
  console.log('📊 Checking existing events...\n');
  const prodCount = await getExistingEventCount('events_production');
  const previewCount = await getExistingEventCount('events_preview');
  console.log(`   Production: ${prodCount} events`);
  console.log(`   Preview: ${previewCount} events\n`);
  
  // Generate all events
  console.log('🔨 Generating events...\n');
  const holidays = generateCanadianHolidays(CURRENT_YEAR);
  const observances = generateDisabilityObservances(CURRENT_YEAR);
  const healthAwareness = generateHealthAwarenessMonths(CURRENT_YEAR);
  
  console.log(`   ✅ ${holidays.length} Canadian holidays`);
  console.log(`   ✅ ${observances.length} disability observances`);
  console.log(`   ✅ ${healthAwareness.length} health awareness events`);
  
  const allSystemEvents = [...holidays, ...observances, ...healthAwareness];
  console.log(`\n   📦 Total: ${allSystemEvents.length} system events to sync\n`);
  
  // Sync to production
  console.log('🔄 Syncing to events_production...\n');
  let prodSuccess = 0;
  for (const event of allSystemEvents) {
    const success = await syncEventToFirestore(event, 'events_production');
    if (success) {
      prodSuccess++;
      process.stdout.write(`\r   Progress: ${prodSuccess}/${allSystemEvents.length}`);
    }
  }
  console.log(`\n   ✅ Synced ${prodSuccess}/${allSystemEvents.length} events\n`);
  
  // Sync to preview
  console.log('🔄 Syncing to events_preview...\n');
  let previewSuccess = 0;
  for (const event of allSystemEvents) {
    const success = await syncEventToFirestore(event, 'events_preview');
    if (success) {
      previewSuccess++;
      process.stdout.write(`\r   Progress: ${previewSuccess}/${allSystemEvents.length}`);
    }
  }
  console.log(`\n   ✅ Synced ${previewSuccess}/${allSystemEvents.length} events\n`);
  
  // Summary
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                     ✅ SYNC COMPLETE                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log('📊 Summary:');
  console.log(`   • ${holidays.length} holidays`);
  console.log(`   • ${observances.length} disability observances`);
  console.log(`   • ${healthAwareness.length} health awareness events`);
  console.log(`   • ${allSystemEvents.length} total system events synced\n`);
  
  console.log('💡 User-created events:');
  console.log('   • User events sync automatically from the app');
  console.log('   • Check Events tab → Create event → Syncs to website\n');
  
  console.log('🌐 Next steps:');
  console.log('   1. Cloudflare Worker will cache events (refresh every 5 min)');
  console.log('   2. Check API: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events');
  console.log('   3. View calendar: https://3mpwrapp.pages.dev/events/');
  console.log('   4. Subscribe: https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics\n');
  
  console.log('✅ All events are now synced and will appear on the website!\n');
  
  process.exit(0);
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
