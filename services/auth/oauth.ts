import type { AuthCredential } from 'firebase/auth';
import { Alert, Platform } from 'react-native';

// internal modules
import { auth } from '../../firebase/config';
import { logger } from '../../utils/logger';

export async function signInWithGoogleAsync(): Promise<boolean> {
  try {
    // Check if Firebase auth is available
    if (!auth) {
      Alert.alert('Not available', 'Authentication is not available in this mode.');
      return false;
    }
    
    // For Expo, we need to use the Web Client ID (not Android client ID)
    // Expo's OAuth flow uses web-based authentication even on mobile
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    
    // Prefer Web Client ID for Expo projects, fallback to Android ID
    const clientId = webClientId || androidClientId;
    
    if (!clientId) {
      Alert.alert('Not configured', 'Google Sign-In is not configured for this build. Please check your .env file.');
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
    
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };
    
    // For Expo Go, use the proxy redirect URI
    // For standalone builds, use the native scheme
    const redirectUri = AuthSession.makeRedirectUri({ 
      useProxy: true, // Always use proxy for Expo Go compatibility
      scheme: 'empowrapp'
    });
    
    logger.log('[OAuth] ====== GOOGLE SIGN-IN DEBUG ======');
    logger.log('[OAuth] Client ID:', clientId);
    logger.log('[OAuth] Redirect URI:', redirectUri);
    logger.log('[OAuth] Expected: https://auth.expo.io/@3mpwrapp/empowrapp');
    logger.log('[OAuth] Match:', redirectUri === 'https://auth.expo.io/@3mpwrapp/empowrapp');
    logger.log('[OAuth] =====================================');
    
    const request = new AuthSession.AuthRequest({
      clientId,
      responseType: AuthSession.ResponseType.IdToken,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
    });
    
    const result = await request.promptAsync(discovery as any);
    
    logger.log('[OAuth] ====== GOOGLE RESPONSE ======');
    logger.log('[OAuth] Result type:', result.type);
    if (result.type === 'error') {
      logger.error('[OAuth] Error code:', result.error?.code);
      logger.error('[OAuth] Error message:', result.error?.message);
      logger.error('[OAuth] Full error:', JSON.stringify(result.error, null, 2));
    } else if (result.type === 'success') {
      logger.log('[OAuth] Success! Got params:', Object.keys(result.params || {}));
    }
    logger.log('[OAuth] ==================================');
    
    // Check if user completed the flow
    if (result.type !== 'success') {
      if (result.type === 'error') {
        logger.error('[OAuth] Google Sign-In error:', result.error);
        
        // Show detailed error to help debug
        const errorDetails = result.error?.message || result.error?.code || 'Unknown error';
        Alert.alert(
          'Sign-In Error', 
          `${errorDetails}\n\nRedirect URI: ${redirectUri}\n\nMake sure this exact URI is added to Google Cloud Console.`
        );
      }
      return false; // User cancelled or error occurred
    }
    
    if (!result.params?.id_token) {
      Alert.alert('Sign-In incomplete', 'Did not receive authentication token from Google.');
      return false;
    }
    
    const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
    const credential: AuthCredential = GoogleAuthProvider.credential(result.params.id_token);
    await signInWithCredential(auth, credential);
    logger.log('[OAuth] Google Sign-In successful!');
    return true;
  } catch (e: any) {
    logger.error('[OAuth] Google Sign-In exception:', e);
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
    await signInWithCredential(auth, credential);
    return true;
  } catch (e: any) {
    Alert.alert('Apple Sign-In failed', e?.message || 'Could not sign in with Apple');
    return false;
  }
}
