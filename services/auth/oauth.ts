import type { AuthCredential } from 'firebase/auth';
import { Alert, Platform } from 'react-native';

// internal modules
import { auth } from '../../firebase/config';

export async function signInWithGoogleAsync(): Promise<boolean> {
  try {
    // Check if Firebase auth is available
    if (!auth) {
      Alert.alert('Not available', 'Authentication is not available in this mode.');
      return false;
    }
    
    // Dynamically import to avoid bundling when not configured
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      Alert.alert('Not configured', 'Google Sign-In is not configured for this build.');
      return false;
    }
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
    const request = new AuthSession.AuthRequest({
      clientId,
      responseType: AuthSession.ResponseType.IdToken,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({ useProxy: Platform.select({ web: false, default: true }) }),
    });
    
    const result = await request.promptAsync(discovery as any);
    
    // Check if user completed the flow
    if (result.type !== 'success') {
      return false; // User cancelled or error occurred
    }
    
    if (!result.params?.id_token) {
      Alert.alert('Sign-In incomplete', 'Did not receive authentication token from Google.');
      return false;
    }
    
    const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
    const credential: AuthCredential = GoogleAuthProvider.credential(result.params.id_token);
    await signInWithCredential(auth, credential);
    return true;
  } catch (e: any) {
    Alert.alert('Google Sign-In failed', e?.message || 'Could not sign in with Google');
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
