/**
 * Google Drive OAuth Callback Page
 *
 * This page handles the OAuth redirect from Google and passes the auth code
 * back to the app (either web app or native app via deep link).
 *
 * Flow:
 * 1. User clicks "Connect Google Drive" in app
 * 2. App opens browser to Google OAuth consent screen
 * 3. User grants permissions
 * 4. Google redirects to this page: https://3mpwrapp.pages.dev/gdrive-callback?code=...
 * 5. This page:
 *    - On web: Sends code back to parent window (web app)
 *    - On native: Deep-links back to app with code (empowrapp://gdrive-callback?code=...)
 */

import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAppPalette } from '../theme/usePalette';

export default function GDriveCallbackScreen() {
  const palette = useAppPalette();
  const params = useLocalSearchParams();
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState('Processing OAuth callback...');

  useEffect(() => {
    // Get the full URL with hash (for implicit flow tokens)
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    console.warn('[GDrive Callback] ===== OAUTH CALLBACK RECEIVED =====');
    console.warn('[GDrive Callback] Platform:', Platform.OS);
    console.warn('[GDrive Callback] Full URL:', url);
    console.warn('[GDrive Callback] Hash fragment:', hash);
    console.warn('[GDrive Callback] Params:', params);
    console.warn('[GDrive Callback] window.opener exists:', typeof window !== 'undefined' && !!window.opener);

    // Parse the hash to see what we got
    if (hash) {
      const hashParams = new URLSearchParams(hash.replace('#', ''));
      const accessToken = hashParams.get('access_token');
      const error = hashParams.get('error');
      const errorDesc = hashParams.get('error_description');

      console.warn('[GDrive Callback] Parsed hash params:');
      console.warn('  - access_token present:', !!accessToken);
      console.warn('  - access_token length:', accessToken?.length || 0);
      console.warn('  - error:', error || 'none');
      console.warn('  - error_description:', errorDesc || 'none');
    }

    // Check if we're on web or native
    if (Platform.OS === 'web') {
      // On web: Close the OAuth popup and send token to parent window
      if (typeof window !== 'undefined' && window.opener) {
        console.warn('[GDrive Callback] Sending auth result to parent window');
        setStatusMessage('Sending authentication result to app...');

        // For implicit flow, tokens are in the hash fragment
        // Convert hash fragment to query string format for expo-auth-session
        let messageUrl = url;
        if (hash && hash.includes('access_token')) {
          // Convert hash to query params: #access_token=... -> ?access_token=...
          messageUrl = url.replace('#', '?');
          console.warn('[GDrive Callback] Converted hash to query format:', messageUrl);
          setStatusMessage('✓ Access token received! Sending to app...');
        } else if (hash && hash.includes('error')) {
          const hashParams = new URLSearchParams(hash.replace('#', ''));
          const error = hashParams.get('error');
          const errorDesc = hashParams.get('error_description');
          setStatusMessage(`❌ OAuth error: ${error}\n${errorDesc}`);
        }

        console.warn('[GDrive Callback] Message payload:', { type: 'expo-auth-session', url: messageUrl });

        // Send the URL back to the parent window
        try {
          // Use '*' origin for cross-origin communication (OAuth callback scenario)
          // This is safe because we're only sending the OAuth result back
          window.opener.postMessage(
            {
              type: 'expo-auth-session',
              url: messageUrl,
            },
            '*' // Allow cross-origin for OAuth callback
          );
          console.warn('[GDrive Callback] Message sent successfully');
          setStatusMessage('✓ Success! Closing window...');
        } catch (error) {
          console.error('[GDrive Callback] Error sending message:', error);
          setStatusMessage(`❌ Error sending result: ${error}`);
        }

        // Close the popup after a longer delay to ensure message is received
        setTimeout(() => {
          console.warn('[GDrive Callback] Closing popup window');
          window.close();
        }, 3000);
      } else {
        // Not in a popup - might be direct navigation
        console.warn('[GDrive Callback] Not in popup, redirecting to home');

        // Extract token from hash or code from query params
        const urlObj = new URL(url);
        const hashParams = new URLSearchParams(hash.replace('#', ''));
        const accessToken = hashParams.get('access_token');
        const code = urlObj.searchParams.get('code');
        const error = urlObj.searchParams.get('error') || hashParams.get('error');

        if (accessToken) {
          console.warn('[GDrive Callback] Access token present, redirecting to home');
          // Store the token temporarily
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem('gdrive_access_token', accessToken);
            const expiresIn = hashParams.get('expires_in');
            if (expiresIn) {
              window.sessionStorage.setItem('gdrive_expires_in', expiresIn);
            }
          }
        } else if (code) {
          console.warn('[GDrive Callback] Auth code present, redirecting to home');
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem('gdrive_auth_code', code);
          }
        } else if (error) {
          console.error('[GDrive Callback] OAuth error:', error);
        }

        router.replace('/');
      }
    } else {
      // On native: Deep-link back to the app
      const deepLinkUrl = `empowrapp://gdrive-callback${url.split('gdrive-callback')[1] || ''}`;
      console.warn('[GDrive Callback] Deep-linking to:', deepLinkUrl);

      if (typeof window !== 'undefined') {
        window.location.href = deepLinkUrl;
      }
    }
  }, [params, router]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.background,
      padding: 20,
    },
    text: {
      color: palette.text,
      fontSize: 16,
      marginTop: 16,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={palette.primary} />
      <Text style={styles.text}>{statusMessage}</Text>
      <Text style={[styles.text, { fontSize: 12, marginTop: 8, opacity: 0.6 }]}>
        Check console for detailed logs
      </Text>
    </View>
  );
}

