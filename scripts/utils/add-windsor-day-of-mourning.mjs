#!/usr/bin/env node
/**
 * ADD WINDSOR NATIONAL DAY OF MOURNING EVENT
 * April 28, 2026 - Windsor & District Labour Council
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EVENTS_FILE = path.join(__dirname, '../api/events.json');

console.log('📋 Adding Windsor Day of Mourning event...\n');

// Read existing events
const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));

// New Windsor Day of Mourning event
const windsorEvent = {
  id: 'evt-windsor-day-of-mourning-april28-2026',
  title: 'National Day of Mourning - Windsor',
  date: '2026-04-28',
  time: '17:00',
  endTime: '18:00',
  timezone: 'America/Toronto',
  location: 'Reaume Park at The Injured Workers Monument, Windsor, ON',
  address: 'Reaume Park, Windsor, Ontario',
  city: 'Windsor',
  province: 'ON',
  country: 'Canada',
  isVirtual: false,
  organizerName: 'Windsor & District Labour Council',
  organizerEmail: '',
  organizerPhone: '',
  organizerWebsite: '',
  registrationRequired: false,
  registrationUrl: '',
  description: 'Join us at Reaume Park\'s Injured Workers Monument for the National Day of Mourning. We will lay flowers at the riverfront to remember those killed or injured in the workplace and renew our commitment to worker health, safety, and well-being.\n\nRefreshments will follow at 6 PM at Hook and Ladder (3690 Seminole Street, Windsor).',
  eventType: 'commemoration',
  tags: ['day-of-mourning', 'workers-rights', 'workplace-safety', 'windsor', 'injured-workers', 'memorial'],
  accessibilityNotes: 'Outdoor event at riverfront monument',
  cost: 'Free',
  capacity: null,
  language: ['en'],
  targetAudience: ['injured-workers', 'labour-advocates', 'community'],
  status: 'confirmed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notes: 'Ceremony at monument 5 PM, refreshments at Hook and Ladder 6 PM (3690 Seminole Street)'
};

// Add to events array
events.push(windsorEvent);

// Save updated events
fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));

console.log('✅ Added Windsor Day of Mourning event');
console.log('✅ Updated events.json');
console.log(`📊 Total events: ${events.length}`);
console.log('');
console.log('New event:');
console.log(`- ${windsorEvent.id} (April 28, 5 PM at Reaume Park, Windsor)`);
