/**
 * Admin API for managing submissions
 * 
 * Endpoints:
 * GET  /api/admin/submissions - List all submissions (optional ?status=pending)
 * PUT  /api/admin/submissions - Approve or reject a submission
 * 
 * Authentication: Requires X-Admin-Key header matching ADMIN_API_KEY secret
 */

interface Env {
  SUBMISSIONS_KV: KVNamespace;
  SUBMISSIONS_DB: D1Database;
  ADMIN_API_KEY: string;
  NOTIFICATION_WEBHOOK_URL?: string;
}

interface KVNamespace {
  get(key: string, options?: { type: 'text' }): Promise<string | null>;
  put(key: string, value: string, options?: { metadata?: any }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string; metadata?: any }> }>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  run(): Promise<D1Result>;
  all(): Promise<D1Result>;
  first(): Promise<any>;
}

interface D1Result {
  success: boolean;
  results?: any[];
}

// CORS headers for admin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
};

/**
 * Verify admin authentication
 */
function verifyAdmin(request: Request, env: Env): boolean {
  const apiKey = request.headers.get('X-Admin-Key');
  return apiKey === env.ADMIN_API_KEY && !!env.ADMIN_API_KEY;
}

/**
 * Handle OPTIONS for CORS
 */
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { headers: corsHeaders });
}

/**
 * GET /api/admin/submissions - List submissions
 * Query params: ?status=pending|approved|rejected (optional)
 */
export async function onRequestGet(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  // Verify authentication
  if (!verifyAdmin(request, env)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let query = 'SELECT id, type, title, status, submitted_by_name, submitted_by_email, submitted_at, reviewed_at, review_notes FROM submissions';
    const params: string[] = [];

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY submitted_at DESC';

    const stmt = env.SUBMISSIONS_DB.prepare(query);
    const result = params.length > 0 
      ? await stmt.bind(...params).all()
      : await stmt.all();

    return new Response(
      JSON.stringify({
        success: true,
        count: result.results?.length || 0,
        submissions: result.results || [],
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error listing submissions:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to list submissions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * PUT /api/admin/submissions - Approve or reject a submission
 * Body: { id: string, action: 'approve' | 'reject', notes?: string }
 */
export async function onRequestPut(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  // Verify authentication
  if (!verifyAdmin(request, env)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json() as { id: string; action: 'approve' | 'reject'; notes?: string };

    if (!body.id || !body.action) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing id or action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['approve', 'reject'].includes(body.action)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Action must be "approve" or "reject"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newStatus = body.action === 'approve' ? 'approved' : 'rejected';
    const reviewedAt = Date.now();

    // Update in D1
    await env.SUBMISSIONS_DB.prepare(
      'UPDATE submissions SET status = ?, reviewed_at = ?, review_notes = ? WHERE id = ?'
    ).bind(newStatus, reviewedAt, body.notes || null, body.id).run();

    // Update in KV
    const kvData = await env.SUBMISSIONS_KV.get(body.id, { type: 'text' });
    if (kvData) {
      const submission = JSON.parse(kvData);
      submission.status = newStatus;
      submission.reviewedAt = reviewedAt;
      submission.reviewNotes = body.notes;
      await env.SUBMISSIONS_KV.put(body.id, JSON.stringify(submission));
    }

    // Send Discord notification about the review
    if (env.NOTIFICATION_WEBHOOK_URL) {
      const emoji = body.action === 'approve' ? '✅' : '❌';
      const color = body.action === 'approve' ? 0x22c55e : 0xef4444;
      
      await fetch(env.NOTIFICATION_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `${emoji} Submission ${body.id} has been **${newStatus}**`,
          embeds: body.notes ? [{
            title: 'Review Notes',
            description: body.notes,
            color,
          }] : undefined,
        }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Submission ${body.id} has been ${newStatus}`,
        status: newStatus,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating submission:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to update submission' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * GET /api/admin/submissions/:id - Get a single submission with full data
 */
export async function onRequestGetById(context: {
  request: Request;
  env: Env;
  params: { id: string };
}): Promise<Response> {
  const { request, env, params } = context;

  if (!verifyAdmin(request, env)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get from KV for full data
    const kvData = await env.SUBMISSIONS_KV.get(params.id, { type: 'text' });
    
    if (!kvData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Submission not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, submission: JSON.parse(kvData) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting submission:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to get submission' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
