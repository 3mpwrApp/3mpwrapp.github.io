/**
 * Cloudflare Pages API Function - Submissions Endpoint
 * Receives event and campaign submissions from the 3mpwr mobile app
 * 
 * Deployment: This file is automatically deployed when pushed to Cloudflare Pages
 * Endpoint: https://3mpwrapp.pages.dev/api/submissions
 * 
 * Expected POST request body:
 * {
 *   type: 'event' | 'campaign',
 *   data: { ... event/campaign data ... },
 *   submittedBy: { uid: string, email?: string, displayName?: string },
 *   submittedAt: number
 * }
 */

// Cloudflare Workers type declarations
declare global {
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
  }
  
  interface D1Result {
    success: boolean;
    results?: any[];
  }
  
  interface R2Bucket {
    put(key: string, value: ReadableStream | ArrayBuffer | string): Promise<void>;
    get(key: string): Promise<R2Object | null>;
    delete(key: string): Promise<void>;
  }
  
  interface R2Object {
    body: ReadableStream;
    key: string;
  }
}

interface EventSubmission {
  type: 'event';
  data: {
    id: string;
    title: string;
    description: string;
    date: string;
    time?: string;
    duration?: number;
    location?: string;
    isVirtual?: boolean;
    virtualLink?: string;
    asl?: boolean;
    captions?: boolean;
    stepFree?: boolean;
    sensorySpace?: boolean;
    wheelchairAccessible?: boolean;
    quietRoom?: boolean;
    parkingAccessible?: boolean;
    assistiveListening?: boolean;
    braille?: boolean;
    serviceAnimalsWelcome?: boolean;
    energyCost?: 'low' | 'medium' | 'high';
    requiresRSVP?: boolean;
    rsvpDetails?: string;
    organizer?: string;
    organizerContact?: string;
    category?: string;
    tags?: string[];
  };
  submittedBy: {
    uid: string;
    email?: string;
    displayName?: string;
  };
  submittedAt: number;
}

interface CampaignSubmission {
  type: 'campaign';
  data: {
    id: string;
    title: string;
    summary: string;
    description: string;
    target: string;
    goalCount?: number;
    contactEmail?: string;
    websiteUrl?: string;
    petitionUrl?: string;
    category?: string;
    tags?: string[];
  };
  submittedBy: {
    uid: string;
    email?: string;
    displayName?: string;
  };
  submittedAt: number;
}

type Submission = EventSubmission | CampaignSubmission;

interface Env {
  // Add your environment bindings here
  // Example: KV namespace for storing submissions
  SUBMISSIONS_KV?: KVNamespace;
  // Example: D1 database for submissions
  SUBMISSIONS_DB?: D1Database;
  // Example: R2 bucket for attachments
  SUBMISSIONS_BUCKET?: R2Bucket;
  // Example: webhook URL for notifications (Discord, Slack, etc.)
  NOTIFICATION_WEBHOOK_URL?: string;
  // Example: Admin email for notifications
  ADMIN_EMAIL?: string;
}

/**
 * CORS headers for cross-origin requests from mobile app
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your app's origin
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Handle OPTIONS preflight requests
 */
function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Validate submission data
 */
function validateSubmission(submission: any): { valid: boolean; error?: string } {
  if (!submission || typeof submission !== 'object') {
    return { valid: false, error: 'Invalid submission format' };
  }

  const { type, data, submittedBy, submittedAt } = submission;

  // Validate type
  if (type !== 'event' && type !== 'campaign') {
    return { valid: false, error: 'Invalid submission type. Must be "event" or "campaign"' };
  }

  // Validate data
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Missing or invalid data object' };
  }

  // Validate common fields
  if (!data.id || !data.title) {
    return { valid: false, error: 'Missing required fields: id, title' };
  }

  // Validate event-specific fields
  if (type === 'event') {
    if (!data.description || !data.date) {
      return { valid: false, error: 'Missing required event fields: description, date' };
    }
  }

  // Validate campaign-specific fields
  if (type === 'campaign') {
    if (!data.summary || !data.target) {
      return { valid: false, error: 'Missing required campaign fields: summary, target' };
    }
  }

  // Validate submittedBy
  if (!submittedBy || !submittedBy.uid) {
    return { valid: false, error: 'Missing submitter information' };
  }

  // Validate timestamp
  if (!submittedAt || typeof submittedAt !== 'number') {
    return { valid: false, error: 'Missing or invalid submission timestamp' };
  }

  return { valid: true };
}

/**
 * Store submission in KV (if available)
 */
async function storeInKV(env: Env, submission: Submission): Promise<boolean> {
  if (!env.SUBMISSIONS_KV) {
    return false;
  }

  try {
    const key = `submission:${submission.type}:${submission.data.id}:${submission.submittedAt}`;
    await env.SUBMISSIONS_KV.put(
      key,
      JSON.stringify(submission),
      {
        metadata: {
          type: submission.type,
          submittedBy: submission.submittedBy.uid,
          submittedAt: submission.submittedAt,
          status: 'pending', // pending, approved, rejected
        },
      }
    );
    return true;
  } catch (error) {
    console.error('Failed to store in KV:', error);
    return false;
  }
}

/**
 * Store submission in D1 database (if available)
 */
async function storeInD1(env: Env, submission: Submission): Promise<boolean> {
  if (!env.SUBMISSIONS_DB) {
    return false;
  }

  try {
    const stmt = env.SUBMISSIONS_DB.prepare(`
      INSERT INTO submissions (
        id, type, data, submitted_by_uid, submitted_by_email, 
        submitted_by_name, submitted_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.bind(
      `${submission.type}-${submission.data.id}-${submission.submittedAt}`,
      submission.type,
      JSON.stringify(submission.data),
      submission.submittedBy.uid,
      submission.submittedBy.email || null,
      submission.submittedBy.displayName || null,
      submission.submittedAt,
      'pending'
    ).run();

    return true;
  } catch (error) {
    console.error('Failed to store in D1:', error);
    return false;
  }
}

/**
 * Send notification to admin (Discord, Slack, email, etc.)
 */
async function sendNotification(env: Env, submission: Submission): Promise<void> {
  if (!env.NOTIFICATION_WEBHOOK_URL) {
    return;
  }

  try {
    const message = submission.type === 'event'
      ? `📅 New Event Submission: "${submission.data.title}" by ${submission.submittedBy.displayName || submission.submittedBy.email || 'User'}`
      : `📣 New Campaign Submission: "${submission.data.title}" by ${submission.submittedBy.displayName || submission.submittedBy.email || 'User'}`;

    await fetch(env.NOTIFICATION_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: message,
        embeds: [
          {
            title: submission.data.title,
            description: submission.type === 'event'
              ? (submission.data as EventSubmission['data']).description.substring(0, 200)
              : (submission.data as CampaignSubmission['data']).summary.substring(0, 200),
            fields: [
              {
                name: 'Type',
                value: submission.type.toUpperCase(),
                inline: true,
              },
              {
                name: 'Submitted By',
                value: submission.submittedBy.displayName || submission.submittedBy.email || submission.submittedBy.uid,
                inline: true,
              },
              {
                name: 'Submitted At',
                value: new Date(submission.submittedAt).toISOString(),
                inline: true,
              },
            ],
            color: submission.type === 'event' ? 0x3b82f6 : 0x8b5cf6, // Blue for events, purple for campaigns
          },
        ],
      }),
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * Main POST handler
 */
export async function onRequestPost(context: {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
}): Promise<Response> {
  const { request, env, waitUntil } = context;

  try {
    // Parse request body
    const submission: Submission = await request.json();

    // Validate submission
    const validation = validateSubmission(submission);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validation.error,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
          },
        }
      );
    }

    // Log submission (for debugging)
    // eslint-disable-next-line no-console
    console.log(`Received ${submission.type} submission:`, submission.data.id, 'from', submission.submittedBy.uid);

    // Store submission (run in parallel, don't wait)
    waitUntil(storeInKV(env, submission));
    waitUntil(storeInD1(env, submission));

    // Send notification (async, don't wait)
    waitUntil(sendNotification(env, submission));

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `${submission.type === 'event' ? 'Event' : 'Campaign'} "${submission.data.title}" has been submitted for review. Thank you!`,
        submissionId: `${submission.type}-${submission.data.id}-${submission.submittedAt}`,
        status: 'pending',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  } catch (error) {
    console.error('Error processing submission:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  }
}

/**
 * Handle OPTIONS (preflight) requests
 */
export async function onRequestOptions(): Promise<Response> {
  return handleOptions();
}
