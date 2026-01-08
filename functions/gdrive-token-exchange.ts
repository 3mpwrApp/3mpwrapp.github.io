/**
 * Cloudflare Pages Function for Google Drive Token Exchange
 * 
 * This function handles the secure token exchange on the server side.
 * The browser cannot directly exchange the authorization code for an access token
 * due to CORS restrictions on Google's OAuth token endpoint.
 * 
 * Flow:
 * 1. Browser receives authorization code in callback
 * 2. Browser calls this function with the code
 * 3. This function (server-side) exchanges code for access token
 * 4. Token is returned to browser and stored securely
 */

interface TokenExchangeRequest {
  code: string;
  redirectUri: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TokenExchangeResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}

export const onRequest = async (context: any): Promise<Response> => {
  const { request } = context;

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Parse request body
    const body = await request.json() as TokenExchangeRequest;
    const { code, redirectUri } = body;

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization code' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!redirectUri) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing redirect URI' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get client ID from environment
    // Try multiple sources: context.env (Cloudflare Workers), env object, or hardcoded fallback
    const clientId = 
      context.env?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      '733708119893-so14q85mmnrtt5ulnan3qjs2o7ll73vs.apps.googleusercontent.com';
    
    if (!clientId || clientId.length < 10) {
      console.error('[Token Exchange] Invalid or missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in environment');
      console.error('[Token Exchange] clientId value:', clientId);
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error - missing client ID' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Exchange code for token with Google
    console.warn('[Token Exchange] Exchanging code for token...');
    console.warn('[Token Exchange] Client ID:', clientId.substring(0, 20) + '...');
    console.warn('[Token Exchange] Redirect URI:', redirectUri);

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({})) as any;
      console.error('[Token Exchange] Google token exchange failed:', {
        status: tokenResponse.status,
        error: errorData.error,
        description: errorData.error_description,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: `Token exchange failed: ${errorData.error_description || errorData.error || 'Unknown error'}`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const tokenData = await tokenResponse.json() as any;
    const { access_token, refresh_token, expires_in } = tokenData;

    if (!access_token) {
      console.error('[Token Exchange] No access token in response');
      return new Response(
        JSON.stringify({ success: false, error: 'No access token received from Google' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.warn('[Token Exchange] Token exchange successful');
    console.warn('[Token Exchange] Token length:', access_token.length);
    console.warn('[Token Exchange] Expires in:', expires_in, 'seconds');
    console.warn('[Token Exchange] Refresh token present:', !!refresh_token);

    // Return tokens to browser
    return new Response(
      JSON.stringify({
        success: true,
        accessToken: access_token,
        refreshToken: refresh_token || undefined,
        expiresIn: expires_in,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error: any) {
    console.error('[Token Exchange] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
