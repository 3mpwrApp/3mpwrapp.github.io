# Calendar Sync: App ↔ Website Events

## Overview
To sync events between the 3mpwr app and website in real-time, you have several integration options depending on your requirements:

## Option 1: ICS/iCal Feed (Simplest - One-way sync)

### What is ICS?
- **ICS (iCalendar)** is the standard format for calendar data
- Supported by Google Calendar, Apple Calendar, Outlook, etc.
- Best for **read-only** sync from website → app

### Implementation Steps:

#### 1. **Website Side: Generate ICS Feed**
Create an endpoint that generates ICS format from your events database:

```javascript
// Example: website/api/events.ics.js
export default function handler(req, res) {
  const events = getEventsFromDatabase(); // Your DB query
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//3mpwr App//Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events.map(event => `
BEGIN:VEVENT
UID:${event.id}@empowr.app
DTSTART:${formatDateTime(event.startDate)}
DTEND:${formatDateTime(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location || 'Online'}
URL:${event.url}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT`).join('')}
END:VCALENDAR`;

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="3mpwr-events.ics"');
  res.send(icsContent);
}

function formatDateTime(date) {
  // Convert to format: 20250115T140000Z
  return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
```

#### 2. **App Side: Fetch and Parse ICS**
In your app, fetch the ICS feed periodically:

```typescript
// services/eventSync.ts
import * as Calendar from 'expo-calendar';

export async function syncEventsFromWebsite() {
  try {
    // 1. Fetch ICS feed from website
    const response = await fetch('https://empowr.app/api/events.ics');
    const icsContent = await response.text();
    
    // 2. Parse ICS content
    const events = parseICS(icsContent);
    
    // 3. Store in local storage or state
    await AsyncStorage.setItem('empowr:events:v1', JSON.stringify(events));
    
    // 4. Optional: Add to device calendar
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      await syncToDeviceCalendar(events);
    }
    
    return events;
  } catch (error) {
    console.error('[EventSync] Failed to sync events:', error);
    throw error;
  }
}

function parseICS(ics: string) {
  const events: any[] = [];
  const eventBlocks = ics.split('BEGIN:VEVENT').slice(1);
  
  eventBlocks.forEach(block => {
    const event: any = {};
    
    // Extract UID
    const uidMatch = block.match(/UID:(.+)/);
    if (uidMatch) event.id = uidMatch[1].trim();
    
    // Extract DTSTART
    const startMatch = block.match(/DTSTART:(.+)/);
    if (startMatch) event.startDate = parseICalDateTime(startMatch[1].trim());
    
    // Extract DTEND
    const endMatch = block.match(/DTEND:(.+)/);
    if (endMatch) event.endDate = parseICalDateTime(endMatch[1].trim());
    
    // Extract SUMMARY (title)
    const summaryMatch = block.match(/SUMMARY:(.+)/);
    if (summaryMatch) event.title = summaryMatch[1].trim();
    
    // Extract DESCRIPTION
    const descMatch = block.match(/DESCRIPTION:(.+)/);
    if (descMatch) event.description = descMatch[1].trim();
    
    // Extract LOCATION
    const locMatch = block.match(/LOCATION:(.+)/);
    if (locMatch) event.location = locMatch[1].trim();
    
    // Extract URL
    const urlMatch = block.match(/URL:(.+)/);
    if (urlMatch) event.url = urlMatch[1].trim();
    
    events.push(event);
  });
  
  return events;
}

function parseICalDateTime(icalDate: string): Date {
  // Format: 20250115T140000Z
  const year = parseInt(icalDate.substring(0, 4));
  const month = parseInt(icalDate.substring(4, 6)) - 1;
  const day = parseInt(icalDate.substring(6, 8));
  const hour = parseInt(icalDate.substring(9, 11));
  const minute = parseInt(icalDate.substring(11, 13));
  const second = parseInt(icalDate.substring(13, 15));
  
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}
```

#### 3. **Display Events in App**
Update your events screen to use synced data:

```typescript
// app/(tabs)/events/index.tsx
import { useFocusEffect } from 'expo-router';
import { syncEventsFromWebsite } from '../../services/eventSync';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [syncing, setSyncing] = useState(false);
  
  // Auto-sync when screen is focused
  useFocusEffect(
    useCallback(() => {
      async function load() {
        setSyncing(true);
        try {
          const synced = await syncEventsFromWebsite();
          setEvents(synced);
        } catch (error) {
          // Fall back to cached data
          const cached = await AsyncStorage.getItem('empowr:events:v1');
          if (cached) setEvents(JSON.parse(cached));
        } finally {
          setSyncing(false);
        }
      }
      load();
    }, [])
  );
  
  return (
    <ScrollView>
      {syncing && <ActivityIndicator />}
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </ScrollView>
  );
}
```

---

## Option 2: REST API (Two-way sync, Real-time)

### Best for: Creating/editing events from the app

#### 1. **Website API Endpoints**

```javascript
// GET /api/events - List all events
export async function GET(req) {
  const events = await db.events.findMany({
    where: { published: true },
    orderBy: { startDate: 'asc' }
  });
  return Response.json(events);
}

// POST /api/events - Create new event (admin only)
export async function POST(req) {
  const { title, description, startDate, endDate, location } = await req.json();
  
  // Verify admin token
  const user = await verifyAuthToken(req.headers.get('Authorization'));
  if (!user.isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const event = await db.events.create({
    data: { title, description, startDate, endDate, location }
  });
  
  return Response.json(event);
}

// PUT /api/events/:id - Update event
// DELETE /api/events/:id - Delete event
```

#### 2. **App Integration**

```typescript
// services/eventAPI.ts
const API_BASE = 'https://empowr.app/api';

export async function fetchEvents() {
  const response = await fetch(`${API_BASE}/events`);
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
}

export async function createEvent(event: EventInput, token: string) {
  const response = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(event)
  });
  
  if (!response.ok) throw new Error('Failed to create event');
  return response.json();
}

export async function updateEvent(id: string, event: Partial<EventInput>, token: string) {
  const response = await fetch(`${API_BASE}/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(event)
  });
  
  if (!response.ok) throw new Error('Failed to update event');
  return response.json();
}
```

---

## Option 3: Firebase Firestore (Real-time, Automatic sync)

### Best for: Instant updates, offline support

#### 1. **Setup Firestore Collection**

```typescript
// firebase/events.ts
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from './config';

const eventsCollection = collection(db, 'events');

// Subscribe to real-time updates
export function subscribeToEvents(callback: (events: Event[]) => void) {
  const q = query(eventsCollection, where('published', '==', true));
  
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(events);
  });
}

// Create event (admin only)
export async function createEvent(event: EventInput, userId: string) {
  // Check admin status via custom claims
  const user = auth.currentUser;
  const token = await user?.getIdTokenResult();
  
  if (!token?.claims.admin) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return addDoc(eventsCollection, {
    ...event,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    published: true
  });
}
```

#### 2. **App Screen with Real-time Updates**

```typescript
// app/(tabs)/events/index.tsx
import { subscribeToEvents } from '../../firebase/events';

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  
  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToEvents((updatedEvents) => {
      setEvents(updatedEvents);
      console.log('Events updated in real-time!');
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);
  
  return (
    <FlatList
      data={events}
      renderItem={({ item }) => <EventCard event={item} />}
      keyExtractor={item => item.id}
    />
  );
}
```

#### 3. **Website Integration**

```javascript
// website/lib/events.js
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function getEvents() {
  const snapshot = await getDocs(collection(db, 'events'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

---

## Option 4: CSV Export/Import (Manual sync)

### Use Case: Bulk import/export for migrations

#### 1. **Export to CSV**

```typescript
// services/eventExport.ts
export function exportEventsToCSV(events: Event[]): string {
  const headers = ['ID', 'Title', 'Description', 'Start Date', 'End Date', 'Location', 'URL'];
  const rows = events.map(e => [
    e.id,
    `"${e.title}"`,
    `"${e.description}"`,
    new Date(e.startDate).toISOString(),
    new Date(e.endDate).toISOString(),
    `"${e.location || ''}"`,
    e.url || ''
  ]);
  
  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  return csv;
}

// Usage: Download CSV file
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function downloadEventsCSV(events: Event[]) {
  const csv = exportEventsToCSV(events);
  const path = `${FileSystem.documentDirectory}3mpwr-events.csv`;
  
  await FileSystem.writeAsStringAsync(path, csv);
  await Sharing.shareAsync(path);
}
```

#### 2. **Import from CSV**

```typescript
export function parseCSV(csv: string): Event[] {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      id: values[0],
      title: values[1].replace(/"/g, ''),
      description: values[2].replace(/"/g, ''),
      startDate: new Date(values[3]),
      endDate: new Date(values[4]),
      location: values[5].replace(/"/g, ''),
      url: values[6]
    };
  });
}
```

---

## Recommended Approach

For **3mpwr App**, I recommend:

### **Primary: Firebase Firestore** (Option 3)
- ✅ Real-time sync automatically
- ✅ Offline support built-in
- ✅ No additional server needed
- ✅ Works on both app and website
- ✅ Security rules already in place

### **Fallback: ICS Feed** (Option 1)
- ✅ Standard format, widely compatible
- ✅ Users can add to personal calendars
- ✅ Good for public calendar subscriptions
- ✅ Simple to implement

---

## Implementation Checklist

- [ ] **Website**: Create ICS endpoint at `/api/events.ics`
- [ ] **Website**: Implement REST API for CRUD operations
- [ ] **App**: Add `syncEventsFromWebsite()` function
- [ ] **App**: Update events screen to use synced data
- [ ] **App**: Add "Sync Events" button in events tab
- [ ] **App**: Show last sync timestamp
- [ ] **Both**: Use Firebase Firestore for real-time sync
- [ ] **Both**: Add "Subscribe to Calendar" button (ICS)
- [ ] **Testing**: Verify events appear in both places
- [ ] **Security**: Ensure only admins can create/edit events

---

## Code Examples in Your Codebase

### Current Events Implementation
- Events data: `data/events.ts`
- Events screen: `app/(tabs)/events.tsx` (if exists) or `app/events/index.tsx`
- Event detail: `app/events/[id].tsx`

### Files to Create/Modify
1. **Create**: `services/eventSync.ts` - Sync logic
2. **Create**: `services/eventAPI.ts` - REST API client
3. **Modify**: `app/events/index.tsx` - Add sync functionality
4. **Create**: `firebase/events.ts` - Firestore integration (if using Firebase)

---

## Testing Real-time Sync

```typescript
// Test script: scripts/test-event-sync.ts
import { syncEventsFromWebsite } from '../services/eventSync';

async function test() {
  console.log('Testing event sync...');
  
  try {
    const events = await syncEventsFromWebsite();
    console.log(`✅ Synced ${events.length} events`);
    events.forEach(e => console.log(`  - ${e.title} (${e.startDate})`));
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

test();
```

Run with: `npx ts-node scripts/test-event-sync.ts`

---

## Questions?

- **How often to sync?** Every time the events screen is opened (on focus) + background sync every 30 minutes
- **What if offline?** Use cached data from AsyncStorage
- **Two-way sync?** Use Firebase Firestore for automatic bidirectional sync
- **User submissions?** Add form in app that calls website API or writes to Firestore
- **Notifications?** Send push notification when new event is added

Need help implementing? Let me know which option you prefer!
