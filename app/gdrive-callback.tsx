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

import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAppPalette } from '../theme/usePalette';

export default function GDriveCallbackScreen() {
  const palette = useAppPalette();
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Get the full URL with query parameters
    const url = typeof window !== 'undefined' ? window.location.href : '';

    console.log('[GDrive Callback] Platform:', Platform.OS);
    console.log('[GDrive Callback] URL:', url);
    console.log('[GDrive Callback] Params:', params);
    console.log('[GDrive Callback] window.opener exists:', typeof window !== 'undefined' && !!window.opener);

    // Check if we're on web or native
    if (Platform.OS === 'web') {
      // On web: Close the OAuth popup and send code to parent window
      if (typeof window !== 'undefined' && window.opener) {
        console.log('[GDrive Callback] Sending auth result to parent window');
        console.log('[GDrive Callback] Message payload:', { type: 'expo-auth-session', url });

        // Send the full URL back to the parent window
        // This is the format expo-auth-session expects
        try {
          window.opener.postMessage(
            {
              type: 'expo-auth-session',
              url: url,
            },
            window.location.origin // Use same origin for security
          );
          console.log('[GDrive Callback] Message sent successfully');
        } catch (error) {
          console.error('[GDrive Callback] Error sending message:', error);
        }

        // Close the popup after a short delay
        setTimeout(() => {
          console.log('[GDrive Callback] Closing popup window');
          window.close();
        }, 1500);
      } else {
        // Not in a popup - might be direct navigation
        console.log('[GDrive Callback] Not in popup, redirecting to home');

        // Extract auth code from URL and redirect to home with it
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        const error = urlObj.searchParams.get('error');

        if (code) {
          console.log('[GDrive Callback] Auth code present, redirecting to home');
          // Store the auth result temporarily
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem('gdrive_auth_code', code);
          }
        } else if (error) {
          console.error('[GDrive Callback] OAuth error:', error);
        }

        router.replace('/');
      }
    } else {
      // On native: Deep-link back to the app with the auth code
      const deepLinkUrl = `empowrapp://gdrive-callback${url.split('gdrive-callback')[1] || ''}`;
      console.log('[GDrive Callback] Deep-linking to:', deepLinkUrl);

      // This will be handled by expo-auth-session automatically
      // The URL scheme (empowrapp://) will trigger the app to open
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
      <Text style={styles.text}>
        {Platform.OS === 'web'
          ? 'Completing authentication...'
          : 'Returning to app...'}
      </Text>
    </View>
  );
}
