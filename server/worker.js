/**
 * Cloudflare Worker for 3mpwrApp Events Calendar Feed
 * Provides auto-updating calendar subscription via webcal://
 */

// Import event data generators (these need to be bundled)
// In production, you'd import from your data files or fetch from a database

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

    // Route: GET /events.ics - Calendar subscription feed
    if (url.pathname === '/events.ics' && request.method === 'GET') {
      try {
        const year = parseInt(url.searchParams.get('year')) || new Date().getFullYear();
        const includeObservances = url.searchParams.get('observances') !== 'false';
        const includeHolidays = url.searchParams.get('holidays') !== 'false';

        // For now, return a sample ICS feed
        // In production, you'd fetch actual events from your data source
        const ics = buildSampleICS(year, includeObservances, includeHolidays);

        return new Response(ics, {
          headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'inline; filename="3mpwrapp-events.ics"',
            'Cache-Control': 'public, max-age=3600',
            ...corsHeaders,
          },
        });
      } catch (error) {
        return new Response('Error generating calendar feed', { 
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // Route: GET /api/events - JSON events list
    if (url.pathname === '/api/events' && request.method === 'GET') {
      try {
        // Return sample events as JSON
        const events = [
          {
            id: '1',
            title: 'International Day of Persons with Disabilities',
            date: `${new Date().getFullYear()}-12-03T00:00:00Z`,
            description: 'UN observance promoting disability rights and awareness',
            location: 'Global',
            isVirtual: true,
          },
        ];

        return new Response(JSON.stringify(events), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
            ...corsHeaders,
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to load events' }), {
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
      return new Response(JSON.stringify({ ok: true, service: '3mpwrApp Calendar' }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Default route
    return new Response('3mpwrApp Calendar Server - Powered by 3mpwrApp\n\nUse /events.ics for calendar feed\nWebsite: https://3mpwrapp.pages.dev/\nCalendar: https://3mpwrapp.pages.dev/events/', {
      headers: corsHeaders,
    });
  },
};

/**
 * Build a sample ICS calendar feed
 * In production, import actual event generation functions
 */
function buildSampleICS(year, includeObservances, includeHolidays) {
  const events = [];

  // Add sample community event
  events.push({
    title: '3mpwrApp Community Meetup',
    description: 'Virtual community gathering for app users',
    startISO: `${year}-${String(new Date().getMonth() + 1).padStart(2, '0')}-15T19:00:00Z`,
    durationMinutes: 60,
  });

  // Add sample observance
  if (includeObservances) {
    events.push({
      title: 'International Day of Persons with Disabilities',
      description: 'UN observance promoting disability rights and awareness',
      startISO: `${year}-12-03T00:00:00Z`,
      durationMinutes: 1440, // All-day event
    });
  }

  // Add sample holiday
  if (includeHolidays) {
    events.push({
      title: 'Canada Day',
      description: 'National holiday celebrating Canadian confederation',
      startISO: `${year}-07-01T00:00:00Z`,
      durationMinutes: 1440, // All-day event
    });
  }

  // Build ICS format
  return buildICSMany(events, {
    calendarName: '3mpwrApp Events',
    refreshInterval: 1440,
    timezone: 'America/Toronto',
    subscribable: true,
  });
}

/**
 * Generate ICS calendar format with multiple events
 */
function buildICSMany(events, options = {}) {
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
    const start = dt(ev.startISO);
    const endDate = new Date(
      new Date(ev.startISO).getTime() + (ev.durationMinutes || 60) * 60000
    ).toISOString();
    const end = dt(endDate);
    
    lines.push('BEGIN:VEVENT');
    const uid = options.subscribable 
      ? `${ev.startISO}-${ev.title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@3mpwrapp.pages.dev`
      : `${Date.now()}_${Math.random().toString(36).slice(2)}@3mpwr`;
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${start}`);
    lines.push(`DTEND:${end}`);
    lines.push(`SUMMARY:${escapeICS(ev.title)}`);
    if (ev.description) lines.push(`DESCRIPTION:${escapeICS(ev.description)}`);
    lines.push(`URL:https://3mpwrapp.pages.dev/events/`);
    lines.push(`ORGANIZER;CN=3mpwrApp:MAILTO:empowrapp08162025@gmail.com`);
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
