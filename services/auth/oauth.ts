import Constants from 'expo-constants';
import type { AuthCredential } from 'firebase/auth';
import { Alert, Platform } from 'react-native';

// internal modules
import { auth } from '../../firebase/config';
import { logger } from '../../utils/logger';

// Helper to get environment variable from process.env or Constants.expoConfig.extra
function getEnvVar(key: string): string | undefined {
  // First check process.env (works in development and some EAS builds)
  const processEnvValue = process.env[key];
  if (processEnvValue) return processEnvValue;
  
  // Fallback to Constants.expoConfig.extra (works in EAS builds)
  const extra = Constants.expoConfig?.extra;
  if (extra && key in extra) {
    return extra[key] as string;
  }
  
  return undefined;
}

export async function signInWithGoogleAsync(): Promise<boolean> {
  try {
    // Check if Firebase auth is available
    if (!auth) {
      Alert.alert('Not available', 'Authentication is not available in this mode.');
      return false;
    }
    
    // For Expo, we need to use the Web Client ID (not Android client ID)
    // Expo's OAuth flow uses web-based authentication even on mobile
    // Check both process.env and Constants.expoConfig.extra for EAS build compatibility
    const webClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
    const androidClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_CLIENT_ID');
    
    // Prefer Web Client ID for Expo projects, fallback to Android ID
    const clientId = webClientId || androidClientId;
    
    // Debug logging for environment variable sources
    logger.log('[OAuth] Environment variable sources:', {
      processEnvWeb: !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      processEnvAndroid: !!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      constantsExtra: !!Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      resolvedWebId: !!webClientId,
      resolvedAndroidId: !!androidClientId,
    });
    
    if (!clientId) {
      const debugInfo = `
process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: ${process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ? 'SET' : 'NOT SET'}
Constants.expoConfig.extra: ${JSON.stringify(Object.keys(Constants.expoConfig?.extra || {}))}
      `.trim();
      Alert.alert('Not configured', `Google Sign-In is not configured for this build.\n\nDebug:\n${debugInfo}`);
      return false;
    }
    
    // Log configuration for debugging
    logger.log('[OAuth] Google Sign-In config', { 
      platform: Platform.OS,
      usingWebClientId: !!webClientId,
      clientIdPrefix: clientId.substring(0, 20) + '...'
    });
    
    let WebBrowser: any; let AuthSession: any;
    try { WebBrowser = require('expo-web-browser'); } catch {}
    try { AuthSession = require('expo-auth-session'); } catch {}
    if (!WebBrowser || !AuthSession) {
      Alert.alert('Unavailable', 'OAuth libraries are not available in this build.');
      return false;
    }
    WebBrowser.maybeCompleteAuthSession?.();
    
    // Check if running on web
    const isWeb = Platform.OS === 'web';

    // On WEB: Use Firebase's signInWithPopup which handles everything automatically
    // This is much simpler and more reliable than manual OAuth on web
    if (isWeb) {
      try {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        logger.log('[OAuth] Using Firebase signInWithPopup for web');
        await signInWithPopup(auth, provider);
        logger.log('[OAuth] Firebase signInWithPopup successful');
        return true;
      } catch (webError: any) {
        logger.error('[OAuth] Firebase signInWithPopup failed:', webError);
        if (webError.code === 'auth/popup-closed-by-user') {
          // User closed popup, not an error
          return false;
        }
        Alert.alert('Sign-In Error', webError.message || 'Failed to sign in with Google');
        return false;
      }
    }

    // For Google OAuth on mobile, we use the Expo auth proxy
    // because Google doesn't accept custom schemes like empowrapp://
    //
    // The proxy URL format is: https://auth.expo.io/@{owner}/{slug}
    // For this app: https://auth.expo.io/@3mpwrapp/empowrapp
    const redirectUri = 'https://auth.expo.io/@3mpwrapp/empowrapp';

    // Generate a random nonce for security (required for id_token response type)
    const generateNonce = () => {
      const array = new Uint8Array(32);
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    };
    const nonce = generateNonce();

    logger.log('[OAuth] ====== GOOGLE SIGN-IN DEBUG (MOBILE) ======');
    logger.log('[OAuth] Platform:', Platform.OS);
    logger.log('[OAuth] Client ID:', clientId);
    logger.log('[OAuth] Redirect URI:', redirectUri);
    logger.log('[OAuth] App Ownership:', Constants.appOwnership);
    logger.log('[OAuth] Using implicit flow with id_token');
    logger.log('[OAuth] ==============================================');

    // Use implicit flow with id_token response type
    // This doesn't require a client secret and works better for mobile apps
    // Google returns the id_token directly in the redirect URL fragment
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=id_token` +
      `&scope=${encodeURIComponent('openid profile email')}` +
      `&nonce=${nonce}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    
    logger.log('[OAuth] ====== GOOGLE RESPONSE ======');
    logger.log('[OAuth] Result type:', result.type);
    if (result.type === 'success') {
      logger.log('[OAuth] Success! Got URL:', result.url?.substring(0, 100) + '...');
    }
    logger.log('[OAuth] ==================================');
    
    // Check if user completed the flow
    if (result.type !== 'success' || !result.url) {
      if (result.type === 'cancel') {
        logger.log('[OAuth] User cancelled sign-in');
      } else {
        logger.error('[OAuth] Google Sign-In failed:', result.type);
      }
      return false; // User cancelled or error occurred
    }
    
    // Extract id_token from the URL fragment
    // The URL looks like: https://auth.expo.io/@3mpwrapp/empowrapp#id_token=xxx&...
    const urlFragment = result.url.split('#')[1];
    if (!urlFragment) {
      logger.error('[OAuth] No fragment in redirect URL');
      Alert.alert('Sign-In incomplete', 'Did not receive authentication token from Google.');
      return false;
    }
    
    const params = new URLSearchParams(urlFragment);
    const idToken = params.get('id_token');
    
    if (!idToken) {
      // Check for error in response
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      if (error) {
        logger.error('[OAuth] Google returned error:', error, errorDescription);
        Alert.alert('Sign-In Error', errorDescription || error);
      } else {
        logger.error('[OAuth] No id_token in response. Params:', urlFragment.substring(0, 100));
        Alert.alert('Sign-In incomplete', 'Did not receive authentication token from Google.');
      }
      return false;
    }
    
    logger.log('[OAuth] Got id_token from implicit flow');
    
    const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
    const credential: AuthCredential = GoogleAuthProvider.credential(idToken);
    logger.log('[OAuth] ===== SIGNING IN WITH GOOGLE =====');
    await signInWithCredential(auth, credential);
    logger.log('[OAuth] ===== GOOGLE SIGN-IN SUCCESSFUL =====');
    logger.log('[OAuth] Firebase auth state updated');
    logger.log('[OAuth] AuthContext will detect this change');
    logger.log('[OAuth] app/index.tsx will handle navigation to /(tabs)');
    logger.log('[OAuth] =============================================');
    return true;
  } catch (e: any) {
    logger.error('[OAuth] Google Sign-In exception:', e);
    logger.error('[OAuth] Error code:', e?.code);
    logger.error('[OAuth] Error message:', e?.message);
    const errorMessage = e?.message || 'Could not sign in with Google';
    
    // Provide more helpful error messages
    if (errorMessage.includes('prohibited') || errorMessage.includes('not enabled')) {
      Alert.alert(
        'Sign-In Not Enabled',
        'Google Sign-In is not enabled in Firebase Console. Please enable it in Authentication → Sign-in method → Google.'
      );
    } else if (errorMessage.includes('invalid_client')) {
      Alert.alert(
        'Configuration Error',
        'The Google Sign-In client ID is invalid. Make sure you are using the Web Client ID from Firebase Console in your .env file.'
      );
    } else if (e?.code === 'auth/unauthorized-domain' || e?.code === 'auth/operation-not-allowed' || errorMessage.includes('unauthorized-domain')) {
      Alert.alert(
        'Authorization Error',
        'This domain is not authorized for Firebase Authentication.\n\n' +
        'SOLUTION:\n' +
        '1. Firebase Console → Authentication → Settings → Authorized domains\n' +
        '2. Add: auth.expo.io and your app domain\n' +
        '3. Google Cloud Console → Add redirect URI: https://auth.expo.io/@3mpwrapp/empowrapp\n\n' +
        'See FIREBASE_AUTH_BLOCKED_FIX.md for full instructions.'
      );
    } else if (e?.code === 'auth/popup-blocked') {
      Alert.alert(
        'Pop-up Blocked',
        'The authentication popup was blocked. Please allow popups for this site and try again.'
      );
    } else {
      Alert.alert('Google Sign-In failed', errorMessage);
    }
    return false;
  }
}

export async function signInWithAppleAsync(): Promise<boolean> {
  try {
    // Check if Firebase auth is available
    if (!auth) {
      Alert.alert('Not available', 'Authentication is not available in this mode.');
      return false;
    }
    
    let AppleAuth: any;
    try { AppleAuth = require('expo-apple-authentication'); } catch {}
    // On web or unsupported platforms, provide a friendly hint
    if (!AppleAuth || !AppleAuth.isAvailableAsync || !(await AppleAuth.isAvailableAsync())) {
      const platformHint = Platform.OS === 'web'
        ? 'Apple Sign‑In is not supported in web builds. Please use another method.'
        : 'Apple Sign‑In is not available on this device.';
      Alert.alert('Not available', platformHint);
      return false;
    }
    const res = await AppleAuth.signInAsync({ requestedScopes: [AppleAuth.AppleAuthenticationScope.FULL_NAME, AppleAuth.AppleAuthenticationScope.EMAIL] });
    if (!res.identityToken) {
      return false;
    }
    const { OAuthProvider, signInWithCredential } = await import('firebase/auth');
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({ idToken: res.identityToken });
    logger.log('[OAuth] ===== SIGNING IN WITH APPLE =====');
    await signInWithCredential(auth, credential);
    logger.log('[OAuth] ===== APPLE SIGN-IN SUCCESSFUL =====');
    logger.log('[OAuth] Firebase auth state updated');
    logger.log('[OAuth] AuthContext will detect this change');
    logger.log('[OAuth] app/index.tsx will handle navigation to /(tabs)');
    logger.log('[OAuth] ============================================');
    return true;
  } catch (e: any) {
    logger.error('[OAuth] Apple Sign-In exception:', e);
    logger.error('[OAuth] Error code:', e?.code);
    logger.error('[OAuth] Error message:', e?.message);
    const errorMessage = e?.message || 'Could not sign in with Apple';
    
    // Handle specific Apple Sign-In errors
    if (e?.code === 'auth/unauthorized-domain' || e?.code === 'auth/operation-not-allowed' || errorMessage.includes('unauthorized-domain')) {
      Alert.alert(
        'Authorization Error',
        'This domain is not authorized for Firebase Authentication.\n\n' +
        'SOLUTION:\n' +
        '1. Firebase Console → Authentication → Settings → Authorized domains\n' +
        '2. Enable Apple Sign-In in Authentication → Sign-in method\n' +
        '3. Configure Apple Developer Console with Service ID\n\n' +
        'See FIREBASE_AUTH_BLOCKED_FIX.md for full instructions.'
      );
    } else if (errorMessage.includes('not enabled') || errorMessage.includes('prohibited')) {
      Alert.alert(
        'Apple Sign-In Not Enabled',
        'Apple Sign-In is not enabled in Firebase Console. Please enable it in Authentication → Sign-in method → Apple.'
      );
    } else {
      Alert.alert('Apple Sign-In failed', errorMessage);
    }
    return false;
  }
}
