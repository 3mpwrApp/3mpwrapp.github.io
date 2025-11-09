/**
 * Cloudflare Worker for 3mpwrApp Campaigns API
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

// Fetch campaigns from Firestore REST API
async function fetchCampaignsFromFirestore(serviceAccount, collectionName = 'campaigns_production', filters = {}) {
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
    const campaigns = [];

    if (data.documents) {
      for (const doc of data.documents) {
        const fields = doc.fields;
        if (!fields) continue;

        // Parse Firestore field values
        const getString = (val) => val?.stringValue || '';
        const getNumber = (val) => val?.integerValue ? parseInt(val.integerValue) : (val?.doubleValue || 0);
        const getTimestamp = (val) => {
          if (!val?.timestampValue) return Date.now();
          return new Date(val.timestampValue).getTime();
        };

        const campaign = {
          id: doc.name.split('/').pop(),
          title: getString(fields.title),
          summary: getString(fields.summary),
          target: getString(fields.target),
          goalCount: getNumber(fields.goalCount),
          membersCount: getNumber(fields.membersCount),
          contactEmail: getString(fields.contactEmail),
          createdAt: getTimestamp(fields.createdAt),
        };

        campaigns.push(campaign);
      }
    }

    // Sort by createdAt descending (newest first)
    campaigns.sort((a, b) => b.createdAt - a.createdAt);

    return campaigns;
  } catch (error) {
    console.error('[Firestore] Campaigns fetch error:', error.message);
    return [];
  }
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
    const campaignsCollection = environment === 'preview' ? 'campaigns_preview' : 'campaigns_production';
    const cache = env.CAMPAIGNS_CACHE;

    // Route: GET /api/campaigns - JSON campaigns list
    if (url.pathname === '/api/campaigns' && request.method === 'GET') {
      try {
        const limit = parseInt(url.searchParams.get('limit')) || 50;
        const page = parseInt(url.searchParams.get('page')) || 1;

        const campaigns = await getCachedOrFresh(
          cache,
          `campaigns:json:all:${environment}`,
          async () => {
            return await fetchCampaignsFromFirestore(serviceAccount, campaignsCollection);
          },
          300 // 5 minute cache
        );

        // Apply pagination
        const start = (page - 1) * limit;
        const paginated = (campaigns || []).slice(start, start + limit);

        const response = {
          campaigns: paginated,
          pagination: {
            page,
            limit,
            total: campaigns?.length || 0,
            pages: Math.ceil((campaigns?.length || 0) / limit),
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
            'X-Campaigns-Count': String(campaigns?.length || 0),
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error('[/api/campaigns] Error:', error.message);
        return new Response(JSON.stringify({
          error: 'Failed to load campaigns',
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

    // Route: GET /api/campaigns/:id - Single campaign detail
    if (url.pathname.match(/^\/api\/campaigns\/[^/]+$/) && request.method === 'GET') {
      try {
        const campaignId = url.pathname.split('/').pop();

        const allCampaigns = await getCachedOrFresh(
          cache,
          `campaigns:all:${environment}`,
          async () => {
            return await fetchCampaignsFromFirestore(serviceAccount, campaignsCollection);
          },
          300
        );

        const campaign = (allCampaigns || []).find((c) => c.id === campaignId);

        if (!campaign) {
          return new Response(JSON.stringify({ error: 'Campaign not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        return new Response(JSON.stringify(campaign), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error('[/api/campaigns/:id] Error:', error.message);
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
        service: '3mpwrApp Campaigns Worker',
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
        service: '3mpwrApp Campaigns Worker',
        version: '1.0-rest-api',
        endpoints: {
          'GET /api/campaigns': 'JSON campaigns list with pagination',
          'GET /api/campaigns/:id': 'Single campaign details',
          'GET /health': 'Health check status',
        },
        usage: {
          '/api/campaigns?limit=20&page=1': 'Get campaigns (paginated)',
          '/api/campaigns?env=preview': 'Get campaigns from preview collection',
          '/api/campaigns/every-canadian-counts': 'Get specific campaign',
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
