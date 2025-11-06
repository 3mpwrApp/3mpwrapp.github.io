/**
 * Cloudflare Worker for 3mpwrApp Events Calendar Feed
 * Provides real-time auto-updating calendar subscription via webcal://
 * Integrates with Firestore for live event data
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK with credentials from environment
let db = null;

function initializeFirebase(env) {
  if (db) return db;
  
  try {
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT || '{}');
    
    if (Object.keys(serviceAccount).length === 0) {
      console.warn('No Firebase credentials found, falling back to sample data');
      return null;
    }

    const app = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: env.FIREBASE_DATABASE_URL,
    });

    db = getFirestore(app);
    return db;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return null;
  }
}

async function fetchEventsFromFirestore(db, filters = {}) {
  if (!db) return [];

  try {
    let query = db.collection('events');

    // Apply date range filter
    if (filters.startDate) {
      query = query.where('date', '>=', new Date(filters.startDate));
    }
    if (filters.endDate) {
      query = query.where('date', '<=', new Date(filters.endDate));
    }

    // Apply category filter
    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }

    // Apply status filter (published only)
    query = query.where('status', '==', 'published');

    // Sort by date
    query = query.orderBy('date', 'asc');

    // Apply limit
    query = query.limit(filters.limit || 500);

    const snapshot = await query.get();
    const events = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        date: data.date?.toDate?.() || new Date(data.date),
        endDate: data.endDate?.toDate?.() || null,
        location: data.location || '',
        category: data.category || 'community',
        isVirtual: data.isVirtual || false,
        url: data.url || '',
        organizer: data.organizer || '3mpwrApp',
        imageUrl: data.imageUrl || '',
        attendeeCount: data.attendeeCount || 0,
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate?.() || new Date(),
      });
    });

    return events;
  } catch (error) {
    console.error('Error fetching events from Firestore:', error);
    return [];
  }
}

async function getCachedOrFresh(cache, key, fetchFn, ttlSeconds = 3600) {
  // Try to get from KV cache first
  if (cache) {
    const cached = await cache.get(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Cache was corrupted, fetch fresh
      }
    }
  }

  // Fetch fresh data
  const fresh = await fetchFn();

  // Store in cache
  if (cache) {
    try {
      await cache.put(key, JSON.stringify(fresh), {
        expirationTtl: ttlSeconds,
      });
    } catch (e) {
      console.warn('Cache storage failed:', e);
    }
  }

  return fresh;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Initialize Firebase
    const firestore = initializeFirebase(env);

    // Get KV cache namespace
    const cache = env.CALENDAR_CACHE;

    // Route: GET /events.ics - Calendar subscription feed
    if (url.pathname === '/events.ics' && request.method === 'GET') {
      try {
        const year = parseInt(url.searchParams.get('year')) || new Date().getFullYear();
        const month = url.searchParams.get('month');
        const includeObservances = url.searchParams.get('observances') !== 'false';
        const includeHolidays = url.searchParams.get('holidays') !== 'false';

        // Build date range
        const startDate = new Date(year, month ? parseInt(month) - 1 : 0, 1);
        const endDate = new Date(year, month ? parseInt(month) : 12, 0);

        // Fetch events from Firestore with caching
        const events = await getCachedOrFresh(
          cache,
          `events:ics:${year}:${month || 'all'}`,
          async () => {
            const firestoreEvents = await fetchEventsFromFirestore(firestore, {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            });
            return firestoreEvents;
          },
          3600 // 1 hour cache
        );

        // Generate ICS
        const ics = buildICS(events, {
          calendarName: '3mpwrApp Events',
          refreshInterval: 60,
          timezone: 'America/Toronto',
          subscribable: true,
        });

        return new Response(ics, {
          headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'inline; filename="3mpwrapp-events.ics"',
            'Cache-Control': 'public, max-age=3600',
            'X-Events-Count': String(events.length),
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error('Error in /events.ics:', error);
        return new Response('Error generating calendar feed', { 
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // Route: GET /api/events - JSON events list
    if (url.pathname === '/api/events' && request.method === 'GET') {
      try {
        const category = url.searchParams.get('category');
        const limit = parseInt(url.searchParams.get('limit')) || 50;
        const page = parseInt(url.searchParams.get('page')) || 1;
        const sortBy = url.searchParams.get('sort') || 'date';
        const sortDir = url.searchParams.get('dir') || 'asc';

        // Fetch events from Firestore with caching
        const events = await getCachedOrFresh(
          cache,
          `events:json:${category || 'all'}:${limit}`,
          async () => {
            const firestoreEvents = await fetchEventsFromFirestore(firestore, {
              category: category || undefined,
              limit: limit * 2, // Fetch more for potential filtering
            });
            return firestoreEvents;
          },
          300 // 5 minute cache
        );

        // Apply sorting
        const sorted = events.sort((a, b) => {
          let aVal = a[sortBy];
          let bVal = b[sortBy];

          if (sortBy === 'date') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
          }

          if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
          return 0;
        });

        // Apply pagination
        const start = (page - 1) * limit;
        const paginated = sorted.slice(start, start + limit);

        const response = {
          events: paginated,
          pagination: {
            page,
            limit,
            total: events.length,
            pages: Math.ceil(events.length / limit),
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            cacheHint: 'Results cached for 5 minutes',
            source: 'Firestore',
          },
        };

        return new Response(JSON.stringify(response), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
            'X-Events-Count': String(events.length),
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error('Error in /api/events:', error);
        return new Response(JSON.stringify({ 
          error: 'Failed to load events',
          message: error.message 
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Route: GET /api/events/:id - Single event detail
    if (url.pathname.match(/^\/api\/events\/[^/]+$/) && request.method === 'GET') {
      try {
        const eventId = url.pathname.split('/').pop();

        if (!firestore) {
          throw new Error('Firestore not initialized');
        }

        const doc = await firestore.collection('events').doc(eventId).get();

        if (!doc.exists) {
          return new Response(JSON.stringify({ error: 'Event not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        const data = doc.data();
        const event = {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          date: data.date?.toDate?.() || new Date(data.date),
          endDate: data.endDate?.toDate?.() || null,
          location: data.location || '',
          category: data.category || 'community',
          isVirtual: data.isVirtual || false,
          url: data.url || '',
          organizer: data.organizer || '3mpwrApp',
          imageUrl: data.imageUrl || '',
          attendeeCount: data.attendeeCount || 0,
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };

        return new Response(JSON.stringify(event), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error('Error fetching event:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch event' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Route: GET /health - Health check
    if (url.pathname === '/health') {
      const health = {
        ok: true,
        service: '3mpwrApp Calendar Worker',
        timestamp: new Date().toISOString(),
        firebaseConnected: !!firestore,
        cacheAvailable: !!cache,
      };

      return new Response(JSON.stringify(health), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Default route
    return new Response(
      JSON.stringify({
        service: '3mpwrApp Calendar Worker',
        version: '2.0',
        endpoints: {
          'GET /events.ics': 'Calendar subscription feed (iCalendar format)',
          'GET /api/events': 'JSON events list with filtering and pagination',
          'GET /api/events/:id': 'Single event details',
          'GET /health': 'Health check status',
        },
        usage: {
          '/events.ics?year=2025&month=12': 'Get December 2025 events',
          '/api/events?category=community&limit=10&page=1': 'Get paginated events',
          '/api/events?sort=date&dir=desc': 'Get events sorted by date descending',
        },
      }, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  },
};

/**
 * Generate ICS calendar format with multiple events
 */
function buildICS(events, options = {}) {
  const dt = (iso) => iso.replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines = [];
  
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//3mpwr//Calendar 1.0//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  
  if (options.subscribable) {
    lines.push(`X-WR-CALNAME:${escapeICS(options.calendarName || '3mpwrApp Events')}`);
    lines.push(`X-WR-CALDESC:${escapeICS('Community events, disability observances, and awareness days - Powered by 3mpwrApp (https://3mpwrapp.pages.dev/events/)')}`);
    lines.push(`X-WR-TIMEZONE:${options.timezone || 'America/Toronto'}`);
    if (options.refreshInterval) {
      lines.push(`X-PUBLISHED-TTL:PT${options.refreshInterval}M`);
      lines.push(`REFRESH-INTERVAL;VALUE=DURATION:PT${options.refreshInterval}M`);
    }
  }
  
  const now = dt(new Date().toISOString());
  events.forEach((ev) => {
    const eventDate = ev.date instanceof Date ? ev.date : new Date(ev.date);
    const endDateObj = ev.endDate 
      ? (ev.endDate instanceof Date ? ev.endDate : new Date(ev.endDate))
      : new Date(eventDate.getTime() + 60 * 60000); // Default 1 hour
    
    const start = dt(eventDate.toISOString());
    const end = dt(endDateObj.toISOString());
    
    lines.push('BEGIN:VEVENT');
    const uid = options.subscribable 
      ? `${ev.id}@3mpwrapp.pages.dev`
      : `${Date.now()}_${Math.random().toString(36).slice(2)}@3mpwr`;
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${start}`);
    lines.push(`DTEND:${end}`);
    lines.push(`SUMMARY:${escapeICS(ev.title)}`);
    if (ev.description) lines.push(`DESCRIPTION:${escapeICS(ev.description)}`);
    if (ev.location && !ev.isVirtual) lines.push(`LOCATION:${escapeICS(ev.location)}`);
    if (ev.url) lines.push(`URL:${ev.url}`);
    lines.push(`ORGANIZER;CN=${escapeICS(ev.organizer || '3mpwrApp')}:MAILTO:empowrapp08162025@gmail.com`);
    if (ev.category) lines.push(`CATEGORIES:${ev.category}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('SEQUENCE:0');
    lines.push('END:VEVENT');
  });
  
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Escape special characters in ICS format
 */
function escapeICS(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}
