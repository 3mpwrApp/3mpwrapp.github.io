#!/usr/bin/env node
/**
 * ADD INJURED WORKERS MOVEMENT EVENT - MAY 7, 2026
 * History and Future of the Injured Workers Movement
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EVENTS_FILE = path.join(__dirname, '../api/events.json');

console.log('📋 Adding Injured Workers Movement event...\n');

// Read existing events
const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));

// New event
const movementEvent = {
  id: 'evt-injured-workers-movement-may7-2026',
  title: 'The History and Future of the Injured Workers Movement',
  date: '2026-05-07',
  time: '14:00',
  endTime: '16:00',
  timezone: 'America/Toronto',
  location: 'IWC Toronto + Online',
  address: '815 Danforth Avenue, Toronto, ON',
  city: 'Toronto',
  province: 'ON',
  country: 'Canada',
  isVirtual: true,
  organizerName: 'Injured Workers Consultants',
  organizerEmail: '',
  organizerPhone: '',
  organizerWebsite: '',
  registrationRequired: true,
  registrationUrl: 'https://tinyurl.com/2jr8jhy8',
  description: 'Come join the conversation about the history and future of the injured workers movement.\n\nThis event brings together injured workers, advocates, and community members to reflect on our collective history and discuss the path forward.\n\nAvailable both online and in-person at IWC Toronto (815 Danforth Avenue).\n\nPre-register: https://tinyurl.com/2jr8jhy8',
  eventType: 'discussion',
  tags: ['injured-workers', 'workers-rights', 'history', 'movement', 'advocacy', 'toronto', 'hybrid'],
  accessibilityNotes: 'Hybrid event - join online or in-person',
  cost: 'Free',
  capacity: null,
  language: ['en'],
  targetAudience: ['injured-workers', 'labour-advocates', 'community', 'researchers'],
  status: 'confirmed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notes: 'Hybrid event: Online + In-person at IWC Toronto'
};

// Add to events array
events.push(movementEvent);

// Save updated events
fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));

console.log('✅ Added Injured Workers Movement event');
console.log('✅ Updated events.json');
console.log(`📊 Total events: ${events.length}`);
console.log('');
console.log('New event:');
console.log('- evt-injured-workers-movement-may7-2026 (May 7, 2-4 PM EST)');
console.log('- Hybrid: Online + IWC Toronto');
console.log('- Register: https://tinyurl.com/2jr8jhy8');
