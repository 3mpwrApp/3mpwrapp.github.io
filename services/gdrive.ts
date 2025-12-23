/**
 * Google Drive Storage Provider
 * Implements BYOC (Bring Your Own Cloud) storage using user's own Google Drive
 * 
 * This uses Google Drive REST API with OAuth2 authentication.
 * User authenticates with their Google account and files are stored in their Drive.
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { logger } from '../utils/logger';

// Ensure WebBrowser is ready for auth redirects
WebBrowser.maybeCompleteAuthSession();

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
 * Set the Google Drive configuration
 */
export function setGDriveConfig(config: GDriveConfig | null): void {
  gdriveConfig = config;
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
 */
export async function authenticateGDrive(): Promise<GDriveAuthResult> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    return { success: false, error: 'Google client ID not configured' };
  }

  try {
    // Create the OAuth discovery document
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: TOKEN_ENDPOINT,
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    // Get redirect URI based on platform
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'empowrapp',
      path: 'gdrive-callback',
    });

    logger.log('[GDrive] Redirect URI:', redirectUri);

    // Create auth request with Drive file scope
    const authRequest = new AuthSession.AuthRequest({
      clientId,
      scopes: [
        'https://www.googleapis.com/auth/drive.file', // Only files created by app
        'openid',
        'profile',
        'email',
      ],
      redirectUri,
      usePKCE: true,
    });

    // Prompt user for consent
    const result = await authRequest.promptAsync(discovery);

    if (result.type !== 'success' || !result.params.code) {
      logger.log('[GDrive] Auth cancelled or failed:', result.type, result.params);

      // Check for redirect URI mismatch error
      if (result.params?.error === 'redirect_uri_mismatch' ||
          (result.params?.error_description && result.params.error_description.includes('redirect_uri'))) {
        return {
          success: false,
          error: `Authorization blocked: The redirect URI (${redirectUri}) is not registered in your Google Cloud Console. Please add it to your OAuth 2.0 Client ID's authorized redirect URIs.`
        };
      }

      return {
        success: false,
        error: result.type === 'cancel' ? 'Authentication cancelled' : `Authentication failed: ${result.params?.error || result.type}`
      };
    }

    // Exchange code for tokens
    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId,
        code: result.params.code,
        redirectUri,
        extraParams: {
          code_verifier: authRequest.codeVerifier || '',
        },
      },
      discovery
    );

    if (!tokenResult.accessToken) {
      return { success: false, error: 'Failed to get access token' };
    }

    const config: GDriveConfig = {
      kind: 'gdrive',
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken || undefined,
      expiresAt: tokenResult.expiresIn 
        ? Date.now() + tokenResult.expiresIn * 1000 
        : undefined,
    };

    // Try to get/create the app folder
    try {
      const folderId = await getOrCreateAppFolder(config.accessToken);
      config.folderId = folderId;
    } catch (e) {
      logger.warn('[GDrive] Could not get/create app folder:', e);
    }

    setGDriveConfig(config);
    logger.log('[GDrive] Authentication successful');
    
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
    
    setGDriveConfig({
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
export function disconnectGDrive(): void {
  setGDriveConfig(null);
  logger.log('[GDrive] Disconnected');
}
