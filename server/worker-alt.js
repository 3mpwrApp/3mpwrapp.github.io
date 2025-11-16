/**
 * Cloudflare Worker for 3mpwrApp Events Calendar Feed
 * Alternative implementation using direct Firestore REST API
 */

const PROJECT_ID = 'empowrapp';
const DATABASE_ID = '(default)';

async function getAccessToken(serviceAccount) {
  try {
    // Create JWT
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const headerEncoded = btoa(JSON.stringify(header));
    const payloadEncoded = btoa(JSON.stringify(payload));
    const signatureInput = `${headerEncoded}.${payloadEncoded}`;

    // For Cloudflare Workers, we'd need to sign this, but that requires crypto
    // For now, let's use a simpler approach - query Firestore via REST without auth
    // OR use the service account to get a token

    // Actually, let's just try to use the credentials directly for now
    return null;
  } catch (error) {
    console.error('Token generation failed:', error);
    return null;
  }
}

async function queryFirestoreREST(collectionName, accessToken) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/${collectionName}`;
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`Firestore query failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    
    // Parse documents
    const events = [];
    if (data.documents) {
      for (const doc of data.documents) {
        const fields = doc.fields;
        if (!fields) continue;

        // Convert Firestore timestamp format
        const parseTimestamp = (ts) => {
          if (!ts) return null;
          if (ts.timestampValue) return new Date(ts.timestampValue);
          return new Date(ts);
        };

        // Convert string value
        const getString = (val) => val?.stringValue || '';
        const getBoolean = (val) => val?.booleanValue || false;
        const getNumber = (val) => val?.integerValue ? parseInt(val.integerValue) : (val?.doubleValue || 0);
        const getArray = (val) => val?.arrayValue?.values || [];

        events.push({
          id: doc.name.split('/').pop(),
          title: getString(fields.title),
          description: getString(fields.description),
          date: parseTimestamp(fields.date),
          endDate: parseTimestamp(fields.endDate),
          location: getString(fields.location),
          category: getString(fields.category),
          isVirtual: getBoolean(fields.isVirtual),
          url: getString(fields.url),
          organizer: getString(fields.organizer),
          imageUrl: getString(fields.imageUrl),
          attendeeCount: getNumber(fields.attendeeCount),
          status: getString(fields.status),
          tags: getArray(fields.tags).map(t => t.stringValue || ''),
        });
      }
    }

    return events;
  } catch (error) {
    console.error('Firestore REST query error:', error);
    return [];
  }
}

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

function escapeICS(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

// pii-scan-ignore-file - Contains example email addresses in worker code
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const environment = url.searchParams.get('env') || 'production';
    const collectionName = environment === 'preview' ? 'events_preview' : 'events_production';

    // Route: GET /health
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        ok: true,
        service: '3mpwrApp Calendar Worker (ALT)',
        timestamp: new Date().toISOString(),
        environment,
        implementation: 'Firestore REST API',
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Route: GET /api/events
    if (url.pathname === '/api/events') {
      try {
        // For now, return empty since we need to handle auth properly
        // This is a placeholder showing the REST API approach
        return new Response(JSON.stringify({
          events: [],
          pagination: { page: 1, limit: 50, total: 0, pages: 0 },
          metadata: {
            generatedAt: new Date().toISOString(),
            note: 'Using REST API - auth needs to be implemented',
          },
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    return new Response(JSON.stringify({
      service: '3mpwrApp Calendar Worker (ALT)',
      version: '1.0-alt',
      implementation: 'Firestore REST API',
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
};
