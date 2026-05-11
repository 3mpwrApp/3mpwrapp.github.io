#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsPath = path.join(__dirname, '../api/events.json');

// Read events
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

// New London event
const londonEvent = {
  "id": "evt-injured-workers-day-london-june1-2026",
  "title": "Injured Workers Day - London",
  "date": "2026-06-01",
  "time": "13:00",
  "endTime": "15:00",
  "timezone": "America/Toronto",
  "location": "Victoria Park - NW Corner",
  "address": "NW Corner of Victoria Park, London, ON",
  "city": "London",
  "province": "ON",
  "country": "Canada",
  "isVirtual": false,
  "organizerName": "Justice for Injured Workers",
  "organizerEmail": "",
  "organizerPhone": "",
  "organizerWebsite": "",
  "registrationRequired": false,
  "registrationUrl": "",
  "description": "Injured Workers Day rally at Victoria Park in London, Ontario. Stand with injured workers demanding justice and an end to cuts to workers compensation.\n\nStop the Cuts to Workers Comp - Justice for Injured Workers!\n\nMeet at the NW (northwest) corner of Victoria Park.",
  "eventType": "rally",
  "tags": [
    "injured-workers-day",
    "workers-rights",
    "london",
    "workers-comp",
    "justice",
    "rally"
  ],
  "accessibilityNotes": "Outdoor event at Victoria Park",
  "cost": "Free",
  "capacity": null,
  "language": ["en"],
  "targetAudience": [
    "injured-workers",
    "labour-advocates",
    "community"
  ],
  "status": "confirmed",
  "createdAt": new Date().toISOString(),
  "updatedAt": new Date().toISOString(),
  "notes": "Rally at NW corner of Victoria Park, London"
};

// Add event
events.push(londonEvent);

// Write back
fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));

console.log('✅ Added London Injured Workers Day event');
console.log(`📊 Total events: ${events.length}`);
