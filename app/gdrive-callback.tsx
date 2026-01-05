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

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

import { useAppPalette } from '../theme/usePalette';

export default function GDriveCallbackScreen() {
  const palette = useAppPalette();
  const params = useLocalSearchParams();
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState('Processing OAuth callback...');

  useEffect(() => {
    // Get the full URL
    const url = typeof window !== 'undefined' ? window.location.href : '';

    console.warn('[GDrive Callback] ===== OAUTH CALLBACK RECEIVED =====');
    console.warn('[GDrive Callback] Platform:', Platform.OS);
    console.warn('[GDrive Callback] Full URL:', url);
    console.warn('[GDrive Callback] Params:', params);
    console.warn('[GDrive Callback] window.opener exists:', typeof window !== 'undefined' && !!window.opener);

    // Parse query parameters (authorization code flow)
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    const error = urlObj.searchParams.get('error');
    const errorDesc = urlObj.searchParams.get('error_description');

    console.warn('[GDrive Callback] Parsed query params:');
    console.warn('  - code present:', !!code);
    console.warn('  - error:', error || 'none');
    console.warn('  - error_description:', errorDesc || 'none');

    // Check if we're on web or native
    if (Platform.OS === 'web') {
      // On web: Send the authorization code to parent window
      if (typeof window !== 'undefined' && window.opener) {
        console.warn('[GDrive Callback] Sending auth result to parent window');

        if (code) {
          setStatusMessage('✓ Authorization successful! Sending to app...');
          console.warn('[GDrive Callback] Sending authorization code to parent window');
          console.warn('[GDrive Callback] Code:', code.substring(0, 20) + '...');
          
          // Send the code back to the parent window (the app)
          // Multiple retries to ensure message gets through
          for (let i = 0; i < 3; i++) {
            window.opener.postMessage(
              {
                type: 'expo-auth-session',
                url: url, // Send full URL with code
              },
              '*' // Allow cross-origin for OAuth callback
            );
          }
        } else if (error) {
          setStatusMessage(`❌ OAuth error: ${error}\n${errorDesc || ''}`);
          console.warn('[GDrive Callback] Error:', error);
          
          // Send error to parent
          window.opener.postMessage(
            {
              type: 'expo-auth-session',
              url: url, // Send URL with error params
            },
            '*'
          );
        } else {
          setStatusMessage('❌ No authorization code or error found');
          console.warn('[GDrive Callback] Neither code nor error found');
          
          window.opener.postMessage(
            {
              type: 'expo-auth-session',
              url: url,
            },
            '*'
          );
        }

        // Close the popup after a delay to ensure message is received
        setTimeout(() => {
          console.warn('[GDrive Callback] Closing popup window');
          window.close();
        }, 2000);
      } else {
        // Not in a popup - might be direct navigation
        console.warn('[GDrive Callback] Not in popup, redirecting to home');
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

