/**
 * Google Drive Storage Provider
 * Implements BYOC (Bring Your Own Cloud) storage using user's own Google Drive
 * 
 * This uses Google Drive REST API with OAuth2 authentication.
 * User authenticates with their Google account and files are stored in their Drive.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { logger } from '../utils/logger';

// AsyncStorage key for persisting GDrive config
const GDRIVE_CONFIG_KEY = '@gdrive_config';

// Google Drive API endpoints
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

// App folder name in user's Google Drive
const APP_FOLDER_NAME = '3mpwr_App_Data';

// Types
export interface GDriveConfig {
  kind: 'gdrive';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  folderId?: string; // Cached app folder ID
}

export interface GDriveAuthResult {
  success: boolean;
  config?: GDriveConfig;
  error?: string;
}

// Session-only storage for GDrive config (not persisted for security)
let gdriveConfig: GDriveConfig | null = null;

/**
 * Get the current Google Drive configuration
 */
export function getGDriveConfig(): GDriveConfig | null {
  return gdriveConfig;
}

/**
 * Set the Google Drive configuration and persist to storage
 */
export async function setGDriveConfig(config: GDriveConfig | null): Promise<void> {
  gdriveConfig = config;

  try {
    if (config) {
      await AsyncStorage.setItem(GDRIVE_CONFIG_KEY, JSON.stringify(config));
      logger.log('[GDrive] Config persisted to storage');
    } else {
      await AsyncStorage.removeItem(GDRIVE_CONFIG_KEY);
      logger.log('[GDrive] Config removed from storage');
    }
  } catch (error) {
    logger.error('[GDrive] Failed to persist config:', error);
  }
}

/**
 * Load Google Drive configuration from storage
 * Call this on app startup to restore the session
 */
export async function loadGDriveConfig(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(GDRIVE_CONFIG_KEY);
    if (stored) {
      gdriveConfig = JSON.parse(stored);
      logger.log('[GDrive] Config loaded from storage');
    }
  } catch (error) {
    logger.error('[GDrive] Failed to load config:', error);
  }
}

/**
 * Check if Google Drive is configured and has valid tokens
 */
export function isGDriveConfigured(): boolean {
  if (!gdriveConfig) return false;
  // Check if token is expired (with 5 min buffer)
  if (gdriveConfig.expiresAt && Date.now() > gdriveConfig.expiresAt - 300000) {
    return false;
  }
  return !!gdriveConfig.accessToken;
}

/**
 * Get Google OAuth2 client ID from environment
 * Tries multiple sources to ensure it works in all environments
 */
function getGoogleClientId(): string | null {
  // Try process.env first (works in most Expo environments)
  let clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  
  // If not found in process.env, try Constants.expoConfig?.extra (works in all Expo environments)
  if (!clientId && typeof Constants !== 'undefined' && Constants.expoConfig?.extra) {
    clientId = Constants.expoConfig.extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID as string | undefined;
  }
  
  if (!clientId) {
    logger.warn('[GDrive] No EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID configured');
    logger.warn('[GDrive] Checked process.env and Constants.expoConfig.extra');
    return null;
  }
  
  logger.log('[GDrive] Successfully loaded EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  return clientId;
}

/**
 * Authenticate user with Google and request Drive API access
 *
 * WEB: Uses implicit flow (token response type) - no client_secret needed
 * NATIVE: Currently uses implicit flow too (code flow needs backend token exchange)
 */
/**
 * Web-specific OAuth flow: Open popup and listen for postMessage from callback
 */
function webOAuthFlow(
  clientId: string,
  redirectUri: string,
): Promise<{ code?: string; error?: string }> {
  return new Promise((resolve) => {
    logger.log('[GDrive] Web OAuth: Opening popup to OAuth endpoint');

    // Build the OAuth URL
    const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    oauthUrl.searchParams.set('client_id', clientId);
    oauthUrl.searchParams.set('redirect_uri', redirectUri);
    oauthUrl.searchParams.set('response_type', 'code');
    oauthUrl.searchParams.set(
      'scope',
      'https://www.googleapis.com/auth/drive.file openid profile email'
    );
    oauthUrl.searchParams.set('access_type', 'offline'); // Get refresh token

    logger.log('[GDrive] OAuth URL:', oauthUrl.toString());

    // Open popup to OAuth endpoint
    const popup = window.open(oauthUrl.toString(), 'gdrive-oauth', 'width=500,height=600');
    if (!popup) {
      logger.error('[GDrive] Could not open popup - blocked by browser');
      resolve({ error: 'Browser blocked popup. Please allow popups and try again.' });
      return;
    }

    // Set up listener for postMessage from callback page
    const handleMessage = (event: MessageEvent) => {
      logger.warn('[GDrive] Web OAuth: Received message event');
      logger.warn('[GDrive] Message origin:', event.origin);
      logger.warn('[GDrive] Message type:', event.data?.type);

      // Check message is from our callback page
      if (event.data?.type === 'expo-auth-session') {
        logger.log('[GDrive] Web OAuth: Received expo-auth-session message');
        
        // Parse the URL from the message
        const url = event.data.url;
        if (url) {
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get('code');
          const error = urlObj.searchParams.get('error');

          logger.warn('[GDrive] Web OAuth: Parsed from callback URL');
          logger.warn('[GDrive] - code present:', !!code);
          logger.warn('[GDrive] - error:', error || 'none');

          if (code) {
            logger.log('[GDrive] Web OAuth: Authorization code received, closing popup');
            // Close popup immediately after receiving code
            popup.close();
            resolve({ code });
          } else if (error) {
            const errorDesc = urlObj.searchParams.get('error_description');
            logger.log('[GDrive] Web OAuth: Error received, closing popup');
            popup.close();
            resolve({ error: `${error}: ${errorDesc}` });
          } else {
            resolve({ error: 'No code or error in callback' });
          }
        } else {
          resolve({ error: 'No URL in message' });
        }

        // Clean up listener
        window.removeEventListener('message', handleMessage);
        clearTimeout(timeout);
        clearInterval(popupCheckInterval);
      }
    };

    // Listen for messages from callback page
    window.addEventListener('message', handleMessage);

    // Timeout after 5 minutes
    const timeout = setTimeout(() => {
      logger.error('[GDrive] Web OAuth: Timeout waiting for callback');
      popup.close();
      window.removeEventListener('message', handleMessage);
      resolve({ error: 'OAuth timeout - took too long to authorize' });
    }, 5 * 60 * 1000);

    // If popup closes before we get a message, timeout
    const popupCheckInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupCheckInterval);
        clearTimeout(timeout);
        window.removeEventListener('message', handleMessage);
        logger.log('[GDrive] Web OAuth: Popup closed');
        resolve({ error: 'OAuth window was closed' });
      }
    }, 500);
  });
}

export async function authenticateGDrive(): Promise<GDriveAuthResult> {
  logger.log('[GDrive] === Starting authentication flow ===');
  const clientId = getGoogleClientId();
  if (!clientId) {
    logger.error('[GDrive] No client ID configured');
    return { success: false, error: 'Google client ID not configured' };
  }
  logger.log('[GDrive] Client ID found, proceeding with OAuth');

  try {
    const redirectUri = 'https://3mpwrapp.pages.dev/gdrive-callback';
    logger.log('[GDrive] Platform:', Platform.OS);
    logger.log('[GDrive] Redirect URI:', redirectUri);

    let code: string | undefined;
    let authError: string | undefined;

    // For web, use popup + postMessage approach
    if (Platform.OS === 'web') {
      logger.log('[GDrive] Using web OAuth flow (popup + postMessage)');
      const webResult = await webOAuthFlow(clientId, redirectUri);
      code = webResult.code;
      authError = webResult.error;

      if (authError) {
        return { success: false, error: authError };
      }
    } else {
      // For native, use expo-auth-session promptAsync
      logger.log('[GDrive] Using native OAuth flow (expo-auth-session)');

      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: TOKEN_ENDPOINT,
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      };

      const authRequest = new AuthSession.AuthRequest({
        clientId,
        scopes: [
          'https://www.googleapis.com/auth/drive.file',
          'openid',
          'profile',
          'email',
        ],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: false,
      });

      logger.log('[GDrive] Opening native auth prompt...');
      let result;
      try {
        result = await authRequest.promptAsync(discovery);
        logger.log('[GDrive] Native prompt result type:', result.type);
      } catch (promptError: any) {
        logger.error('[GDrive] Error during promptAsync:', promptError);
        return {
          success: false,
          error: `Failed to open Google sign-in: ${promptError.message || 'Unknown error'}`
        };
      }

      if (result.type !== 'success') {
        logger.log('[GDrive] Native auth failed:', result.type);
        let errorMessage = `Authentication failed: ${result.type}`;
        
        if (result.type === 'cancel') {
          errorMessage = 'You cancelled the Google sign-in. Please try again when ready.';
        } else if (result.type === 'dismiss') {
          errorMessage = 'The sign-in window was closed before completing. Please try again.';
        }

        return { success: false, error: errorMessage };
      }

      if (!('params' in result) || !result.params) {
        return { success: false, error: 'No parameters received from native auth' };
      }

      code = result.params.code;
    }

    if (!code) {
      logger.error('[GDrive] No authorization code received');
      return { success: false, error: 'No authorization code received from Google' };
    }

    logger.log('[GDrive] Authorization code received, exchanging for access token...');

    // For web, use backend endpoint to exchange code (CORS-safe)
    // For native, use direct exchange (Expo handles CORS)
    let tokenData: any;
    let tokenResponse: Response;

    if (Platform.OS === 'web') {
      // Web: Use backend endpoint for token exchange (avoids CORS issues)
      logger.log('[GDrive] Using backend token exchange endpoint (web)');
      logger.warn('[GDrive] Token exchange URL:', 'https://3mpwrapp.pages.dev/gdrive-token-exchange');
      logger.warn('[GDrive] Request body:', { code: code?.substring(0, 20) + '...', redirectUri });
      
      try {
        tokenResponse = await fetch('https://3mpwrapp.pages.dev/gdrive-token-exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            redirectUri,
          }),
        });

        logger.warn('[GDrive] Backend response status:', tokenResponse.status);
        logger.warn('[GDrive] Backend response headers:', {
          'content-type': tokenResponse.headers.get('content-type'),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          logger.error('[GDrive] Backend returned error status:', tokenResponse.status);
          logger.error('[GDrive] Backend error response:', errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            return {
              success: false,
              error: `Token exchange failed (${tokenResponse.status}): ${(errorData as any).error || errorText}`
            };
          } catch {
            return {
              success: false,
              error: `Token exchange failed (${tokenResponse.status}): ${errorText}`
            };
          }
        }

        tokenData = await tokenResponse.json();
        logger.warn('[GDrive] Backend response data:', { 
          success: tokenData.success, 
          hasAccessToken: !!tokenData.accessToken,
          expiresIn: tokenData.expiresIn,
          error: tokenData.error 
        });
        
        if (!tokenData.success) {
          logger.error('[GDrive] Backend token exchange returned error:', tokenData.error);
          return {
            success: false,
            error: tokenData.error || 'Token exchange failed'
          };
        }
      } catch (fetchError: any) {
        logger.error('[GDrive] Backend fetch error:', fetchError.message);
        logger.error('[GDrive] Stack:', fetchError.stack);
        return {
          success: false,
          error: `Failed to reach token exchange endpoint: ${fetchError.message}`
        };
      }
    } else {
      // Native: Use direct Google token endpoint
      logger.log('[GDrive] Using direct Google token endpoint (native)');
      tokenResponse = await fetch(TOKEN_ENDPOINT, {
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
        const errorData = await tokenResponse.json().catch(() => ({}));
        logger.error('[GDrive] Token exchange failed:', errorData);
        return {
          success: false,
          error: `Failed to exchange code for token: ${(errorData as any).error_description || (errorData as any).error || 'Unknown error'}`
        };
      }

      tokenData = await tokenResponse.json();
    }

    const { access_token, expires_in, refresh_token } = tokenData;

    if (!access_token && !tokenData.accessToken) {
      logger.error('[GDrive] No access token in response');
      logger.error('[GDrive] Response keys:', Object.keys(tokenData));
      return { success: false, error: 'No access token received from Google' };
    }

    // Handle both backend response format and direct Google response format
    const finalAccessToken = access_token || tokenData.accessToken;
    const finalExpiresIn = expires_in || tokenData.expiresIn;
    const finalRefreshToken = refresh_token || tokenData.refreshToken;

    logger.log('[GDrive] Access token received, length:', finalAccessToken.length);

    const config: GDriveConfig = {
      kind: 'gdrive',
      accessToken: finalAccessToken,
      refreshToken: finalRefreshToken || undefined,
      expiresAt: finalExpiresIn
        ? Date.now() + parseInt(finalExpiresIn.toString(), 10) * 1000
        : undefined,
    };

    // Try to get/create the app folder
    try {
      const folderId = await getOrCreateAppFolder(config.accessToken);
      config.folderId = folderId;
    } catch (e) {
      logger.warn('[GDrive] Could not get/create app folder:', e);
    }

    await setGDriveConfig(config);
    logger.log('[GDrive] Authentication successful');
    logger.log('[GDrive] Config saved:', { 
      hasToken: !!config.accessToken, 
      hasRefreshToken: !!config.refreshToken, 
      hasFolderId: !!config.folderId 
    });

    return { success: true, config };
  } catch (error: any) {
    logger.error('[GDrive] Authentication error:', error);
    return { 
      success: false, 
      error: error?.message || 'Authentication failed' 
    };
  }
}

/**
 * Refresh the access token using refresh token
 */
export async function refreshGDriveToken(): Promise<boolean> {
  if (!gdriveConfig?.refreshToken) {
    logger.warn('[GDrive] No refresh token available');
    return false;
  }

  const clientId = getGoogleClientId();
  if (!clientId) return false;

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        refresh_token: gdriveConfig.refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!response.ok) {
      logger.error('[GDrive] Token refresh failed:', response.status);
      return false;
    }

    const data = await response.json();

    await setGDriveConfig({
      ...gdriveConfig,
      accessToken: data.access_token,
      expiresAt: data.expires_in
        ? Date.now() + data.expires_in * 1000
        : undefined,
    });

    logger.log('[GDrive] Token refreshed successfully');
    return true;
  } catch (error) {
    logger.error('[GDrive] Token refresh error:', error);
    return false;
  }
}

/**
 * Get a valid access token, refreshing if needed
 */
async function getValidToken(): Promise<string | null> {
  if (!gdriveConfig) return null;

  // Check if token is expired or about to expire (5 min buffer)
  if (gdriveConfig.expiresAt && Date.now() > gdriveConfig.expiresAt - 300000) {
    const refreshed = await refreshGDriveToken();
    if (!refreshed) return null;
  }

  return gdriveConfig.accessToken;
}

/**
 * Get or create the app's folder in user's Google Drive
 */
async function getOrCreateAppFolder(accessToken: string): Promise<string> {
  // First, try to find existing folder
  const searchUrl = `${DRIVE_API_BASE}/files?q=name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`;
  
  const searchResponse = await fetch(searchUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (searchResponse.ok) {
    const data = await searchResponse.json();
    if (data.files && data.files.length > 0) {
      logger.log('[GDrive] Found existing app folder:', data.files[0].id);
      return data.files[0].id;
    }
  }

  // Create new folder
  const createResponse = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: APP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createResponse.ok) {
    throw new Error(`Failed to create folder: ${createResponse.status}`);
  }

  const folder = await createResponse.json();
  logger.log('[GDrive] Created app folder:', folder.id);
  return folder.id;
}

/**
 * Get file ID by path within app folder
 */
async function getFileId(path: string, accessToken: string, folderId: string): Promise<string | null> {
  const fileName = path.replace(/^\//, '').replace(/\//g, '_'); // Flatten path to filename
  const searchUrl = `${DRIVE_API_BASE}/files?q=name='${fileName}' and '${folderId}' in parents and trashed=false&fields=files(id)`;
  
  const response = await fetch(searchUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.files?.[0]?.id || null;
}

/**
 * Save data to Google Drive
 */
export async function saveToGDrive(
  path: string, 
  data: string | Uint8Array, 
  contentType: string = 'application/octet-stream'
): Promise<boolean> {
  const accessToken = await getValidToken();
  if (!accessToken || !gdriveConfig?.folderId) {
    logger.warn('[GDrive] Not configured or no folder ID');
    return false;
  }

  try {
    const fileName = path.replace(/^\//, '').replace(/\//g, '_');
    const existingFileId = await getFileId(path, accessToken, gdriveConfig.folderId);

    const metadata = {
      name: fileName,
      parents: existingFileId ? undefined : [gdriveConfig.folderId],
    };

    // Create multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = '\r\n--' + boundary + '\r\n';
    const closeDelimiter = '\r\n--' + boundary + '--';

    const body = typeof data === 'string' ? data : new TextDecoder().decode(data);
    
    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n\r\n' +
      body +
      closeDelimiter;

    const url = existingFileId
      ? `${DRIVE_UPLOAD_BASE}/files/${existingFileId}?uploadType=multipart`
      : `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`;

    const response = await fetch(url, {
      method: existingFileId ? 'PATCH' : 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body: multipartRequestBody,
    });

    if (!response.ok) {
      logger.error('[GDrive] Save failed:', response.status, await response.text());
      return false;
    }

    logger.log('[GDrive] Saved file:', fileName);
    return true;
  } catch (error) {
    logger.error('[GDrive] Save error:', error);
    return false;
  }
}

/**
 * Load data from Google Drive
 */
export async function loadFromGDrive(path: string): Promise<string | Uint8Array | null> {
  const accessToken = await getValidToken();
  if (!accessToken || !gdriveConfig?.folderId) {
    return null;
  }

  try {
    const fileId = await getFileId(path, accessToken, gdriveConfig.folderId);
    if (!fileId) {
      return null;
    }

    const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (error) {
    logger.error('[GDrive] Load error:', error);
    return null;
  }
}

/**
 * Remove data from Google Drive
 */
export async function removeFromGDrive(path: string): Promise<boolean> {
  const accessToken = await getValidToken();
  if (!accessToken || !gdriveConfig?.folderId) {
    return false;
  }

  try {
    const fileId = await getFileId(path, accessToken, gdriveConfig.folderId);
    if (!fileId) {
      return true; // Already doesn't exist
    }

    const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.ok || response.status === 404;
  } catch (error) {
    logger.error('[GDrive] Remove error:', error);
    return false;
  }
}

/**
 * Test Google Drive connection
 */
export async function testGDriveConnection(): Promise<{ ok: boolean; error?: string }> {
  const accessToken = await getValidToken();
  if (!accessToken) {
    return { ok: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${DRIVE_API_BASE}/about?fields=user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      logger.log('[GDrive] Connected as:', data.user?.emailAddress);
      return { ok: true };
    }

    return { ok: false, error: `API error: ${response.status}` };
  } catch (error: any) {
    return { ok: false, error: error?.message || 'Connection failed' };
  }
}

/**
 * Disconnect Google Drive (clear tokens)
 */
export async function disconnectGDrive(): Promise<void> {
  await setGDriveConfig(null);
  logger.log('[GDrive] Disconnected');
}
