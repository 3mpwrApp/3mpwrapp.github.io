#!/usr/bin/env node
/**
 * ADD INJURED WORKERS DAY 2026 EVENTS
 * Stop the Cuts to Workers Comp - Justice for Injured Workers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EVENTS_FILE = path.join(__dirname, '../api/events.json');

console.log('📋 Adding Injured Workers Day 2026 events...\n');

// Read existing events
const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));

// Event 1: Thunder Bay - May 29
const thunderBayEvent = {
  id: 'evt-injured-workers-day-thunder-bay-may29-2026',
  title: 'Injured Workers Day - Thunder Bay',
  date: '2026-05-29',
  time: '10:00',
  endTime: '12:00',
  timezone: 'America/Toronto',
  location: 'Thunder Bay City Hall',
  address: 'City Hall, Thunder Bay, ON',
  city: 'Thunder Bay',
  province: 'ON',
  country: 'Canada',
  isVirtual: false,
  organizerName: 'Thunder Bay Injured Workers',
  organizerEmail: '',
  organizerPhone: '',
  organizerWebsite: 'https://thunderbayinjuredworkers.com',
  registrationRequired: false,
  registrationUrl: '',
  description: 'Join us for Injured Workers Day at Thunder Bay City Hall. Stand with injured workers demanding justice and an end to cuts to workers compensation.\n\nStop the Cuts to Workers Comp - Justice for Injured Workers!',
  eventType: 'rally',
  tags: ['injured-workers-day', 'workers-rights', 'thunder-bay', 'workers-comp', 'justice', 'rally'],
  accessibilityNotes: 'Event at City Hall',
  cost: 'Free',
  capacity: null,
  language: ['en'],
  targetAudience: ['injured-workers', 'labour-advocates', 'community'],
  status: 'confirmed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notes: 'More info: thunderbayinjuredworkers.com'
};

// Event 2: Toronto Queens Park - June 1
const torontoEvent = {
  id: 'evt-injured-workers-day-toronto-june1-2026',
  title: 'Injured Workers Day - Toronto',
  date: '2026-06-01',
  time: '11:00',
  endTime: '13:00',
  timezone: 'America/Toronto',
  location: 'Queens Park',
  address: 'Queens Park, Toronto, ON',
  city: 'Toronto',
  province: 'ON',
  country: 'Canada',
  isVirtual: false,
  organizerName: 'Justice for Injured Workers',
  organizerEmail: '',
  organizerPhone: '',
  organizerWebsite: '',
  registrationRequired: false,
  registrationUrl: '',
  description: 'Injured Workers Day rally at Queens Park. Join injured workers and allies demanding justice and an end to cuts to workers compensation.\n\nStop the Cuts to Workers Comp - Justice for Injured Workers!',
  eventType: 'rally',
  tags: ['injured-workers-day', 'workers-rights', 'toronto', 'queens-park', 'workers-comp', 'justice', 'rally'],
  accessibilityNotes: 'Outdoor event at Queens Park',
  cost: 'Free',
  capacity: null,
  language: ['en'],
  targetAudience: ['injured-workers', 'labour-advocates', 'community'],
  status: 'confirmed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notes: 'Rally at Queens Park, Toronto'
};

// Event 3: Hamilton City Hall - June 1
const hamiltonEvent = {
  id: 'evt-injured-workers-day-hamilton-june1-2026',
  title: 'Injured Workers Day - Hamilton',
  date: '2026-06-01',
  time: '11:00',
  endTime: '13:00',
  timezone: 'America/Toronto',
  location: 'Hamilton City Hall',
  address: 'City Hall, Hamilton, ON',
  city: 'Hamilton',
  province: 'ON',
  country: 'Canada',
  isVirtual: false,
  organizerName: 'Justice for Injured Workers',
  organizerEmail: '',
  organizerPhone: '',
  organizerWebsite: '',
  registrationRequired: false,
  registrationUrl: '',
  description: 'Injured Workers Day rally at Hamilton City Hall. Stand with injured workers demanding justice and an end to cuts to workers compensation.\n\nStop the Cuts to Workers Comp - Justice for Injured Workers!',
  eventType: 'rally',
  tags: ['injured-workers-day', 'workers-rights', 'hamilton', 'workers-comp', 'justice', 'rally'],
  accessibilityNotes: 'Event at City Hall',
  cost: 'Free',
  capacity: null,
  language: ['en'],
  targetAudience: ['injured-workers', 'labour-advocates', 'community'],
  status: 'confirmed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notes: 'Rally at Hamilton City Hall'
};

// Add to events array
events.push(thunderBayEvent, torontoEvent, hamiltonEvent);

// Save updated events
fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));

console.log('✅ Added Thunder Bay event (May 29)');
console.log('✅ Added Toronto Queens Park event (June 1)');
console.log('✅ Added Hamilton City Hall event (June 1)');
console.log('✅ Updated events.json');
console.log(`📊 Total events: ${events.length}`);
console.log('');
console.log('New events:');
console.log('- evt-injured-workers-day-thunder-bay-may29-2026 (May 29, 10 AM)');
console.log('- evt-injured-workers-day-toronto-june1-2026 (June 1, 11 AM)');
console.log('- evt-injured-workers-day-hamilton-june1-2026 (June 1, 11 AM)');
