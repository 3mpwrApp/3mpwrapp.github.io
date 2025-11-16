/**
 * Cloudflare Worker for 3mpwr App Events Sync
 * Syncs events from the app to https://3mpwrapp.pages.dev/events/
 * 
 * Endpoints:
 * - GET /api/events - List all events (production or preview based on query param)
 * - POST /api/events - Create or update an event
 * - POST /api/events/bulk - Bulk sync events
 * - DELETE /api/events/:id - Delete an event
 * - GET /events.ics - ICS calendar feed (production events)
 * - GET /health - Health check
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers for cross-origin requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {
      // GET /api/events - List all events
      if (request.method === 'GET' && url.pathname === '/api/events') {
        const envParam = url.searchParams.get('env') || 'production';
        return await handleListEvents(env, corsHeaders, envParam);
      }

      // POST /api/events - Create or update event
      if (request.method === 'POST' && url.pathname === '/api/events') {
        return await handleCreateEvent(request, env, corsHeaders);
      }

      // POST /api/events/bulk - Bulk sync events
      if (request.method === 'POST' && url.pathname === '/api/events/bulk') {
        return await handleBulkSync(request, env, corsHeaders);
      }

      // DELETE /api/events/:id - Delete event
      if (request.method === 'DELETE' && url.pathname.startsWith('/api/events/')) {
        const id = url.pathname.split('/').pop();
        return await handleDeleteEvent(id, env, corsHeaders);
      }

      // GET /events.ics - ICS calendar feed
      if (request.method === 'GET' && url.pathname === '/events.ics') {
        return await handleICSFeed(env);
      }

      // GET /health - Health check
      if (request.method === 'GET' && url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          worker: '3mpwrapp-calendar'
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // 404 Not Found
      return new Response(JSON.stringify({
        error: 'Not found',
        path: url.pathname,
        method: request.method
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

/**
 * Convert date to EST timezone
 */
function toEST(date) {
  const estDate = new Date(date);
  // EST is UTC-5
  const offset = estDate.getTimezoneOffset() / 60;
  estDate.setHours(estDate.getHours() - (5 + offset));
  return estDate;
}

/**
 * Format date for ICS (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date) {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * List all events from KV storage
 */
async function handleListEvents(env, corsHeaders, envParam) {
  try {
    const prefix = envParam === 'preview' ? 'event:preview:' : 'event:production:';
    
    // List all keys with appropriate prefix
    const { keys } = await env.EVENTS_KV.list({ prefix });
    
    // Fetch all events in parallel
    const events = await Promise.all(
      keys.map(async (key) => {
        const data = await env.EVENTS_KV.get(key.name, 'json');
        return data;
      })
    );

    // Filter out null values and sort by date (earliest first)
    const validEvents = events
      .filter(Boolean)
      .sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return dateA - dateB;
      });

    return new Response(JSON.stringify({
      success: true,
      events: validEvents,
      count: validEvents.length,
      environment: envParam,
      lastUpdated: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('List events error:', error);
    throw error;
  }
}

/**
 * Create or update an event
 */
async function handleCreateEvent(request, env, corsHeaders) {
  try {
    const event = await request.json();

    // Validate required fields
    if (!event.id || !event.title || !event.date) {
      return new Response(JSON.stringify({
        error: 'Validation error',
        message: 'Missing required fields: id, title, and date are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Normalize date to EST
    const estDate = toEST(new Date(event.date));
    
    // Ensure event has required metadata
    const eventData = {
      ...event,
      date: estDate.toISOString(),
      updatedAt: Date.now(),
      syncedAt: Date.now(),
      timezone: 'America/New_York' // EST
    };

    // Store in both production and preview KV (30-day expiration for events)
    const expirationTtl = 60 * 60 * 24 * 30; // 30 days in seconds
    
    await env.EVENTS_KV.put(
      `event:production:${event.id}`,
      JSON.stringify(eventData),
      { expirationTtl }
    );

    await env.EVENTS_KV.put(
      `event:preview:${event.id}`,
      JSON.stringify(eventData),
      { expirationTtl }
    );

    return new Response(JSON.stringify({
      success: true,
      id: event.id,
      message: 'Event synced successfully to production and preview',
      date: estDate.toISOString(),
      timezone: 'EST',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Create event error:', error);
    
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    throw error;
  }
}

/**
 * Bulk sync multiple events
 */
async function handleBulkSync(request, env, corsHeaders) {
  try {
    const { events } = await request.json();

    // Validate events array
    if (!Array.isArray(events)) {
      return new Response(JSON.stringify({
        error: 'Validation error',
        message: 'events must be an array'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Sync all events in parallel
    const expirationTtl = 60 * 60 * 24 * 30; // 30 days
    const results = await Promise.allSettled(
      events.flatMap(event => {
        if (!event.id || !event.title || !event.date) {
          return Promise.reject(new Error(`Invalid event: missing id, title, or date`));
        }
        
        const estDate = toEST(new Date(event.date));
        const eventData = {
          ...event,
          date: estDate.toISOString(),
          updatedAt: Date.now(),
          syncedAt: Date.now(),
          timezone: 'America/New_York'
        };
        
        // Store to both production and preview
        return [
          env.EVENTS_KV.put(
            `event:production:${event.id}`,
            JSON.stringify(eventData),
            { expirationTtl }
          ),
          env.EVENTS_KV.put(
            `event:preview:${event.id}`,
            JSON.stringify(eventData),
            { expirationTtl }
          )
        ];
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return new Response(JSON.stringify({
      success: true,
      totalEvents: events.length,
      successful: successful / 2, // Divide by 2 since we write to both prod and preview
      failed: failed / 2,
      message: `Bulk sync completed: ${successful / 2} succeeded, ${failed / 2} failed`,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Bulk sync error:', error);
    throw error;
  }
}

/**
 * Delete an event
 */
async function handleDeleteEvent(id, env, corsHeaders) {
  try {
    if (!id) {
      return new Response(JSON.stringify({
        error: 'Validation error',
        message: 'Event ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Delete from both production and preview KV
    await env.EVENTS_KV.delete(`event:production:${id}`);
    await env.EVENTS_KV.delete(`event:preview:${id}`);

    return new Response(JSON.stringify({
      success: true,
      id,
      message: 'Event deleted successfully from production and preview',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Delete event error:', error);
    throw error;
  }
}

/**
 * Generate ICS calendar feed
 */
async function handleICSFeed(env) {
  try {
    // Fetch all production events
    const { keys } = await env.EVENTS_KV.list({ prefix: 'event:production:' });
    const events = await Promise.all(
      keys.map(async (key) => {
        const data = await env.EVENTS_KV.get(key.name, 'json');
        return data;
      })
    );

    const validEvents = events
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Build ICS file
    let ics = 'BEGIN:VCALENDAR\r\n';
    ics += 'VERSION:2.0\r\n';
    ics += 'PRODID:-//3mpwr App//Events Calendar//EN\r\n';
    ics += 'CALSCALE:GREGORIAN\r\n';
    ics += 'METHOD:PUBLISH\r\n';
    ics += 'X-WR-CALNAME:3mpwr Community Events\r\n';
    ics += 'X-WR-TIMEZONE:America/New_York\r\n';
    ics += 'X-WR-CALDESC:Community events, workshops, and meetups from 3mpwr App\r\n';

    for (const event of validEvents) {
      const eventDate = new Date(event.date);
      const dtstart = formatICSDate(eventDate);
      const dtend = event.duration 
        ? formatICSDate(new Date(eventDate.getTime() + (event.duration * 60000)))
        : formatICSDate(new Date(eventDate.getTime() + 3600000)); // Default 1 hour

      ics += 'BEGIN:VEVENT\r\n';
      ics += `UID:${event.id}@3mpwrapp.pages.dev\r\n`;
      ics += `DTSTAMP:${formatICSDate(new Date())}\r\n`;
      ics += `DTSTART:${dtstart}\r\n`;
      ics += `DTEND:${dtend}\r\n`;
      ics += `SUMMARY:${event.title.replace(/\n/g, '\\n')}\r\n`;
      
      if (event.description) {
        ics += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\r\n`;
      }
      
      if (event.location) {
        ics += `LOCATION:${event.location.replace(/\n/g, '\\n')}\r\n`;
      }
      
      ics += 'ORGANIZER;CN=3mpwr App:mailto:empowrapp08162025@gmail.com\r\n';
      ics += 'STATUS:CONFIRMED\r\n';
      ics += 'SEQUENCE:0\r\n';
      ics += 'END:VEVENT\r\n';
    }

    ics += 'END:VCALENDAR\r\n';

    return new Response(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="3mpwr-events.ics"',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('ICS feed error:', error);
    return new Response('Error generating calendar feed', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
