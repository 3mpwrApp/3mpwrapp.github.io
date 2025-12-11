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

// Native Google Sign-In for mobile apps
let GoogleSignin: any = null;
let statusCodes: any = null;
let isGoogleSignInConfigured = false;

async function configureNativeGoogleSignIn(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  
  try {
    const googleSignInModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleSignInModule.GoogleSignin;
    statusCodes = googleSignInModule.statusCodes;
    
    if (!isGoogleSignInConfigured) {
      const webClientId = getEnvVar('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
      
      if (!webClientId) {
        logger.warn('[OAuth] No webClientId for native Google Sign-In');
        return false;
      }
      
      GoogleSignin.configure({
        webClientId,
        offlineAccess: true,
        scopes: ['profile', 'email'],
      });
      
      isGoogleSignInConfigured = true;
      logger.log('[OAuth] Native Google Sign-In configured');
    }
    return true;
  } catch (e) {
    logger.log('[OAuth] Native Google Sign-In not available:', e);
    return false;
  }
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

    // MOBILE: Try native Google Sign-In first (best experience)
    // Falls back to expo-auth-session if native module not available
    const nativeAvailable = await configureNativeGoogleSignIn();
    
    if (nativeAvailable && GoogleSignin) {
      try {
        logger.log('[OAuth] Using native Google Sign-In for mobile');
        
        // Check if user is already signed in
        const hasPreviousSignIn = GoogleSignin.hasPreviousSignIn();
        if (hasPreviousSignIn) {
          try {
            await GoogleSignin.signInSilently();
          } catch {
            // Silent sign-in failed, proceed with interactive
          }
        }
        
        // Sign in with Google
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const userInfo = await GoogleSignin.signIn();
        
        logger.log('[OAuth] Native Google Sign-In successful, user:', userInfo.user?.email);
        
        // Get the ID token for Firebase
        const tokens = await GoogleSignin.getTokens();
        const idToken = tokens.idToken;
        
        if (!idToken) {
          logger.error('[OAuth] No idToken from native Google Sign-In');
          Alert.alert('Sign-In Error', 'Could not get authentication token from Google.');
          return false;
        }
        
        // Sign in to Firebase with the Google credential
        const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        
        logger.log('[OAuth] Firebase sign-in with native Google credential successful');
        return true;
      } catch (nativeError: any) {
        logger.error('[OAuth] Native Google Sign-In error:', nativeError);
        
        if (nativeError.code === statusCodes?.SIGN_IN_CANCELLED) {
          logger.log('[OAuth] User cancelled native sign-in');
          return false;
        } else if (nativeError.code === statusCodes?.IN_PROGRESS) {
          logger.log('[OAuth] Sign-in already in progress');
          return false;
        } else if (nativeError.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
          logger.warn('[OAuth] Play Services not available, falling back to web OAuth');
          // Fall through to expo-auth-session fallback
        } else {
          // Show error but also fall through to try web OAuth
          logger.warn('[OAuth] Native sign-in failed, trying web OAuth fallback');
        }
      }
    }

    // FALLBACK: Use expo-auth-session for mobile (less reliable but works without native module)
    logger.log('[OAuth] Using expo-auth-session fallback for mobile');
    
    let WebBrowser: any; let AuthSession: any;
    try { WebBrowser = require('expo-web-browser'); } catch {}
    try { AuthSession = require('expo-auth-session'); } catch {}
    if (!WebBrowser || !AuthSession) {
      Alert.alert('Unavailable', 'OAuth libraries are not available in this build.');
      return false;
    }
    WebBrowser.maybeCompleteAuthSession?.();

    // For Google OAuth on mobile, we need to use the Expo auth proxy
    // The proxy handles the OAuth flow and redirects back to the app
    //
    // IMPORTANT: The redirect URI must be whitelisted in Google Cloud Console
    // Add: https://auth.expo.io/@3mpwrapp/empowrapp
    
    // Always use the Expo auth proxy for consistency
    const redirectUri = AuthSession.makeRedirectUri({
      // Use auth.expo.io proxy for Google OAuth
      useProxy: true,
    });

    logger.log('[OAuth] ====== GOOGLE SIGN-IN DEBUG (MOBILE) ======');
    logger.log('[OAuth] Platform:', Platform.OS);
    logger.log('[OAuth] Client ID:', clientId);
    logger.log('[OAuth] Redirect URI:', redirectUri);
    logger.log('[OAuth] App Ownership:', Constants.appOwnership);
    logger.log('[OAuth] ==============================================');

    // Use Google's discovery document for proper OAuth configuration
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    // Use Token response type with useProxy (gets id_token directly)
    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
    });

    // Prompt user for authentication
    const result = await request.promptAsync(discovery, { useProxy: true });
    
    logger.log('[OAuth] ====== GOOGLE RESPONSE ======');
    logger.log('[OAuth] Result type:', result.type);
    if (result.type === 'success') {
      logger.log('[OAuth] Success! Got params:', Object.keys(result.params || {}));
      logger.log('[OAuth] Has id_token:', !!result.params?.id_token);
      logger.log('[OAuth] Has access_token:', !!result.params?.access_token);
    } else if (result.type === 'error') {
      logger.error('[OAuth] Error:', result.error);
    }
    logger.log('[OAuth] ==================================');
    
    // Check if user completed the flow
    if (result.type !== 'success') {
      if (result.type === 'cancel') {
        logger.log('[OAuth] User cancelled sign-in');
        // Don't show alert for cancellation
        return false;
      } else if (result.type === 'error') {
        const errorMsg = result.error?.message || result.error?.code || 'Unknown error';
        logger.error('[OAuth] Google Sign-In error:', errorMsg);
        Alert.alert(
          'Sign-In Error',
          `${errorMsg}\n\nPlease ensure you have internet connectivity and try again.`
        );
      }
      return false;
    }
    
    // Extract id_token from the response
    const idToken = result.params?.id_token;
    
    if (!idToken) {
      // Try using access_token to get user info from Google
      const accessToken = result.params?.access_token;
      if (accessToken) {
        logger.log('[OAuth] No id_token, but have access_token. Attempting alternative sign-in...');
        try {
          // Get user info from Google using access token
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const userInfo = await userInfoResponse.json();
          logger.log('[OAuth] Got user info:', { email: userInfo.email, name: userInfo.name });
          
          // Use Google credential with access token
          const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
          const credential = GoogleAuthProvider.credential(null, accessToken);
          await signInWithCredential(auth, credential);
          logger.log('[OAuth] Signed in with access_token successfully');
          return true;
        } catch (altError: any) {
          logger.error('[OAuth] Alternative sign-in failed:', altError);
        }
      }
      
      logger.error('[OAuth] No id_token in response. Available params:', Object.keys(result.params || {}));
      Alert.alert('Sign-In incomplete', 'Did not receive authentication token from Google. Please try again.');
      return false;
    }
    
    logger.log('[OAuth] Got id_token, signing in with Firebase...');
    
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
