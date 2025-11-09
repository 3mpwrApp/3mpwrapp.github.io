/**
 * Cloudflare Worker for 3mpwrApp Events Calendar Feed
 * Uses Firestore REST API + WebCrypto for JWT authentication
 * No Admin SDK dependency - fully compatible with Cloudflare Workers
 */

const PROJECT_ID = 'empowrapp';
const DATABASE_ID = '(default)';

// Generate JWT token using WebCrypto
async function generateFirebaseToken(serviceAccount) {
  try {
    if (!serviceAccount.private_key || !serviceAccount.client_email) {
      console.error('[JWT] Missing private_key or client_email');
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600; // 1 hour expiry

    // Create JWT header and payload
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp,
      iat: now,
    };

    // Base64 encode header and payload
    const headerEncoded = btoa(JSON.stringify(header));
    const payloadEncoded = btoa(JSON.stringify(payload));
    const signatureInput = `${headerEncoded}.${payloadEncoded}`;

    // Import private key
    const keyData = serviceAccount.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/g, '')
      .replace(/-----END PRIVATE KEY-----/g, '')
      .replace(/\s/g, '');
    const binaryString = atob(keyData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      bytes.buffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Sign the JWT
    const signatureBuffer = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      new TextEncoder().encode(signatureInput)
    );

    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signatureEncoded = btoa(String.fromCharCode.apply(null, signatureArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return `${signatureInput}.${signatureEncoded}`;
  } catch (error) {
    console.error('[JWT] Generation failed:', error.message);
    return null;
  }
}

// Get access token from JWT
async function getAccessToken(serviceAccount) {
  try {
    const jwt = await generateFirebaseToken(serviceAccount);
    if (!jwt) return null;

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Token] Request failed:', error.error_description);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('[Token] Error:', error.message);
    return null;
  }
}

// Fetch events from Firestore REST API
async function fetchEventsFromFirestore(serviceAccount, collectionName = 'events_production', filters = {}) {
  try {
    const accessToken = await getAccessToken(serviceAccount);
    if (!accessToken) {
      console.error('[Firestore] No access token');
      return [];
    }

    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/${collectionName}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      console.error(`[Firestore] Query failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const events = [];

    if (data.documents) {
      for (const doc of data.documents) {
        const fields = doc.fields;
        if (!fields) continue;

        // Parse Firestore field values
        const getString = (val) => val?.stringValue || '';
        const getBoolean = (val) => val?.booleanValue || false;
        const getNumber = (val) => val?.integerValue ? parseInt(val.integerValue) : (val?.doubleValue || 0);
        const getArray = (val) => (val?.arrayValue?.values || []).map(v => v.stringValue || '');
        const getTimestamp = (val) => {
          if (!val?.timestampValue) return new Date();
          return new Date(val.timestampValue);
        };

        const event = {
          id: doc.name.split('/').pop(),
          title: getString(fields.title),
          description: getString(fields.description),
          date: getTimestamp(fields.date),
          endDate: getTimestamp(fields.endDate),
          location: getString(fields.location),
          category: getString(fields.category),
          isVirtual: getBoolean(fields.isVirtual),
          url: getString(fields.url),
          organizer: getString(fields.organizer),
          imageUrl: getString(fields.imageUrl),
          attendeeCount: getNumber(fields.attendeeCount),
          tags: getArray(fields.tags),
          status: getString(fields.status),
        };

        // Apply filters
        if (filters.category && event.category !== filters.category) continue;
        if (filters.status && event.status !== filters.status) continue;
        if (event.status !== 'published') continue;

        events.push(event);
      }
    }

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return events;
  } catch (error) {
    console.error('[Firestore] Fetch error:', error.message);
    return [];
  }
}

/**
 * Generate ICS calendar format with multiple events
 */
function buildICS(events, options = {}) {
  const dt = (iso) => {
    if (!iso) return '';
    return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const lines = [];

  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//3mpwr//Calendar 1.0//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');

  if (options.subscribable) {
    lines.push(`X-WR-CALNAME:${escapeICS(options.calendarName || '3mpwrApp Events')}`);
    lines.push(`X-WR-CALDESC:${escapeICS('Community events, disability observances, and awareness days')}`);
    lines.push(`X-WR-TIMEZONE:${options.timezone || 'America/Toronto'}`);
    if (options.refreshInterval) {
      lines.push(`X-PUBLISHED-TTL:PT${options.refreshInterval}M`);
    }
  }

  const now = dt(new Date().toISOString());
  events.forEach((ev) => {
    const eventDate = new Date(ev.date);
    const endDateObj = ev.endDate ? new Date(ev.endDate) : new Date(eventDate.getTime() + 60 * 60000);

    const start = dt(eventDate.toISOString());
    const end = dt(endDateObj.toISOString());

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.id}@3mpwrapp.pages.dev`);
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
function escapeICS(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

/**
 * Remove obvious duplicates from events array.
 * Dedupe key: normalized title + start date (YYYY-MM-DD) + normalized location
 * Keeps the first occurrence (events are sorted by date earlier)
 */
function dedupeEvents(events) {
  if (!Array.isArray(events) || events.length === 0) return events;
  const seen = new Set();
  const out = [];

  for (const ev of events) {
    const title = (ev.title || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
    const date = ev.date ? new Date(ev.date).toISOString().slice(0, 10) : '';
    const location = (ev.location || '') .toString().trim().toLowerCase();
    const key = `${title}|${date}|${location}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ev);
  }

  return out;
}

/**
 * Get from cache or fetch fresh data
 */
async function getCachedOrFresh(cache, key, fetchFn, ttlSeconds = 300) {
  // Try to get from KV cache first
  if (cache) {
    try {
      const cached = await cache.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('[Cache] Read failed:', e.message);
    }
  }

  // Fetch fresh data
  const fresh = await fetchFn();

  // Store in cache
  if (cache && fresh && fresh.length > 0) {
    try {
      await cache.put(key, JSON.stringify(fresh), { expirationTtl: ttlSeconds });
    } catch (e) {
      console.warn('[Cache] Write failed:', e.message);
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

    // Parse service account from secret
    let serviceAccount = null;
    try {
      const rawSecret = env.FIREBASE_SERVICE_ACCOUNT;
      if (rawSecret) {
        serviceAccount = typeof rawSecret === 'string' ? JSON.parse(rawSecret) : rawSecret;
      }
    } catch (e) {
      console.error('[Init] Failed to parse service account:', e.message);
    }

    // Get parameters
    const environment = url.searchParams.get('env') || 'production';
    const collectionName = environment === 'preview' ? 'events_preview' : 'events_production';
    const cache = env.CALENDAR_CACHE;

    // Route: GET /events.ics - Calendar subscription feed
    if (url.pathname === '/events.ics' && request.method === 'GET') {
      try {
        const year = parseInt(url.searchParams.get('year')) || new Date().getFullYear();
        const month = url.searchParams.get('month');

        // Build date range
        const startDate = new Date(year, month ? parseInt(month) - 1 : 0, 1);
        const endDate = new Date(year, month ? parseInt(month) : 12, 0);

        // Fetch events from Firestore with caching
        let events = await getCachedOrFresh(
          cache,
          `events:ics:${year}:${month || 'all'}:${environment}`,
          async () => {
            return await fetchEventsFromFirestore(serviceAccount, collectionName, {
              status: 'published',
            });
          },
          3600 // 1 hour cache
        );

        // Dedupe obvious duplicates (same title + date + location)
        events = dedupeEvents(events || []);

        // Filter by year/month if specified
        let filtered = events;
        if (month && year) {
          filtered = events.filter((ev) => {
            const d = new Date(ev.date);
            return d.getFullYear() === year && d.getMonth() + 1 === month;
          });
        } else if (year) {
          filtered = events.filter((ev) => {
            const d = new Date(ev.date);
            return d.getFullYear() === year;
          });
        }

        const ics = buildICS(filtered, {
          subscribable: true,
          calendarName: '3mpwrApp Events',
          timezone: 'America/Toronto',
          refreshInterval: 60,
        });

        return new Response(ics, {
          headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'inline; filename="3mpwrapp-events.ics"',
            'Cache-Control': 'public, max-age=3600',
            'X-Events-Count': String(filtered.length),
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error('[/events.ics] Error:', error.message);
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

        const events = await getCachedOrFresh(
          cache,
          `events:json:${category || 'all'}:${environment}`,
          async () => {
            return await fetchEventsFromFirestore(serviceAccount, collectionName, {
              category: category || undefined,
              status: 'published',
            });
          },
          300 // 5 minute cache
        );

        // Dedupe obvious duplicates before sorting/pagination
        const dedupedEvents = dedupeEvents(events || []);

        // Apply sorting
  const sorted = dedupedEvents.sort((a, b) => {
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
            source: 'Firestore REST API',
            environment,
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
        console.error('[/api/events] Error:', error.message);
        return new Response(JSON.stringify({
          error: 'Failed to load events',
          message: error.message,
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

        const allEvents = await getCachedOrFresh(
          cache,
          `events:all:${environment}`,
          async () => {
            return await fetchEventsFromFirestore(serviceAccount, collectionName, {
              status: 'published',
            });
          },
          300
        );

        // Dedupe here as well
        const dedupedAll = dedupeEvents(allEvents || []);

        const event = dedupedAll.find((e) => e.id === eventId);

        if (!event) {
          return new Response(JSON.stringify({ error: 'Event not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        return new Response(JSON.stringify(event), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error('[/api/events/:id] Error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Route: GET /health - Health check
    if (url.pathname === '/health') {
      const health = {
        ok: true,
        service: '3mpwrApp Events Worker',
        timestamp: new Date().toISOString(),
        environment,
        implementation: 'Firestore REST API + WebCrypto JWT',
        firebaseConnected: !!serviceAccount,
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
        service: '3mpwrApp Events Worker',
        version: '2.0-rest-api',
        endpoints: {
          'GET /events.ics': 'Calendar subscription feed (iCalendar format)',
          'GET /api/events': 'JSON events list with filtering and pagination',
          'GET /api/events/:id': 'Single event details',
          'GET /health': 'Health check status',
        },
        usage: {
          '/events.ics?year=2025&month=6': 'Get June 2025 events',
          '/events.ics?env=preview': 'Get events from preview collection',
          '/api/events?category=holiday&limit=10': 'Get holidays (paginated)',
          '/api/events?sort=date&dir=asc': 'Get events sorted by date',
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
