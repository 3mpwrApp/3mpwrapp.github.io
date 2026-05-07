#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const eventsPath = path.join(__dirname, '../api/events.json');

// Read events
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

// Remove all May 7 injured workers movement events (cancelled until fall)
const originalCount = events.length;
const filtered = events.filter(e => e.id !== 'evt-injured-workers-movement-may7-2026');
const removedCount = originalCount - filtered.length;

// Write back
fs.writeFileSync(eventsPath, JSON.stringify(filtered, null, 2));

console.log(`✅ Removed ${removedCount} May 7 event(s) (cancelled until fall)`);
console.log(`📊 Total events: ${filtered.length}`);
