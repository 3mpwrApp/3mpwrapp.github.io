/**
 * Google Drive Storage Provider
 * Implements BYOC (Bring Your Own Cloud) storage using user's own Google Drive
 * 
 * This uses Google Drive REST API with OAuth2 authentication.
 * User authenticates with their Google account and files are stored in their Drive.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
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
 */
function getGoogleClientId(): string | null {
  // Use the web client ID for OAuth
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!clientId) {
    logger.warn('[GDrive] No EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID configured');
    return null;
  }
  return clientId;
}

/**
 * Authenticate user with Google and request Drive API access
 *
 * WEB: Uses implicit flow (token response type) - no client_secret needed
 * NATIVE: Currently uses implicit flow too (code flow needs backend token exchange)
 */
export async function authenticateGDrive(): Promise<GDriveAuthResult> {
  logger.log('[GDrive] === Starting authentication flow ===');
  const clientId = getGoogleClientId();
  if (!clientId) {
    logger.error('[GDrive] No client ID configured');
    return { success: false, error: 'Google client ID not configured' };
  }
  logger.log('[GDrive] Client ID found, proceeding with OAuth');

  try {
    // Create the OAuth discovery document
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: TOKEN_ENDPOINT,
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    // Use web redirect URI for ALL platforms (Google OAuth doesn't support custom schemes)
    const redirectUri = Platform.OS === 'web'
      ? AuthSession.makeRedirectUri({ path: 'gdrive-callback' })
      : 'https://3mpwrapp.pages.dev/gdrive-callback';

    logger.log('[GDrive] Platform:', Platform.OS);
    logger.log('[GDrive] Client ID:', clientId);
    logger.log('[GDrive] Redirect URI:', redirectUri);

    // Use implicit flow (token response type) to avoid needing client_secret
    // This is appropriate for client-side apps where client_secret cannot be secured
    const authRequest = new AuthSession.AuthRequest({
      clientId,
      scopes: [
        'https://www.googleapis.com/auth/drive.file', // Only files created by app
        'openid',
        'profile',
        'email',
      ],
      redirectUri,
      responseType: AuthSession.ResponseType.Token, // Changed from Code to Token
      usePKCE: false, // PKCE not used with implicit flow
    });

    // Prompt user for consent
    logger.log('[GDrive] Opening auth prompt...');
    logger.log('[GDrive] Auth request config:', {
      clientId: clientId.substring(0, 20) + '...',
      redirectUri,
      scopes: authRequest.scopes,
      responseType: authRequest.responseType,
      usePKCE: authRequest.usePKCE,
    });

    let result;
    try {
      result = await authRequest.promptAsync(discovery);
      logger.log('[GDrive] Prompt result type:', result.type);
      if ('params' in result) {
        logger.log('[GDrive] Prompt result params keys:', Object.keys(result.params));
      }
    } catch (promptError: any) {
      logger.error('[GDrive] Error during promptAsync:', promptError);
      return {
        success: false,
        error: `Failed to open Google sign-in: ${promptError.message || 'Unknown error'}. Make sure your browser/WebView is working.`
      };
    }

    if (result.type !== 'success') {
      logger.log('[GDrive] Auth cancelled or failed:', result.type);

      // Check for redirect URI mismatch error
      if (result.type === 'error' && 'params' in result) {
        if (result.params?.error === 'redirect_uri_mismatch' ||
            (result.params?.error_description && result.params.error_description.includes('redirect_uri'))) {
          return {
            success: false,
            error: `Authorization blocked: Redirect URI mismatch\n\nThe redirect URI "${redirectUri}" is not registered in Google Cloud Console.\n\nPlease add this URI to your OAuth 2.0 Client ID:\n• https://3mpwrapp.pages.dev/gdrive-callback\n\nGo to: Google Cloud Console → APIs & Services → Credentials → Your OAuth Client ID → Authorized redirect URIs`
          };
        }

        // Provide detailed error message
        const errorDetails = result.params?.error_description || result.params?.error || result.type;
        return {
          success: false,
          error: `Authentication failed: ${errorDetails}\n\nError type: ${result.params?.error || result.type}\nRedirect URI used: ${redirectUri}`
        };
      }

      // Provide user-friendly error messages
      let errorMessage: string;
      if (result.type === 'cancel') {
        errorMessage = 'You cancelled the Google sign-in. Please try again when ready.';
      } else if (result.type === 'dismiss') {
        errorMessage = 'The sign-in window was closed before completing. This can happen if:\n\n• You closed the browser window\n• The app couldn\'t redirect back properly\n• There was a network issue\n\nPlease try again and complete the sign-in process.';
      } else if (result.type === 'locked') {
        errorMessage = 'Another authentication is in progress. Please wait and try again.';
      } else {
        errorMessage = `Authentication failed: ${result.type}`;
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    // Type guard: at this point we know result.type === 'success'
    if (!('params' in result)) {
      return {
        success: false,
        error: 'Authentication succeeded but no parameters received'
      };
    }

    // For implicit flow, tokens are in the response params directly
    logger.log('[GDrive] Auth successful, extracting tokens...');
    const { access_token, expires_in } = result.params;

    if (!access_token) {
      logger.error('[GDrive] No access token in response');
      return {
        success: false,
        error: 'No access token received from Google'
      };
    }

    logger.log('[GDrive] Access token received, length:', access_token.length);

    const config: GDriveConfig = {
      kind: 'gdrive',
      accessToken: access_token,
      refreshToken: undefined, // Implicit flow doesn't provide refresh tokens
      expiresAt: expires_in
        ? Date.now() + parseInt(expires_in, 10) * 1000
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
    logger.log('[GDrive] Config saved:', { hasToken: !!config.accessToken, hasRefreshToken: !!config.refreshToken, hasFolderId: !!config.folderId });

    // Verify it was saved
    const verification = await AsyncStorage.getItem(GDRIVE_CONFIG_KEY);
    logger.log('[GDrive] Verification - config persisted:', !!verification);

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
