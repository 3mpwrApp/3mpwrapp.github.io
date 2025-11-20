import * as Linking from 'expo-linking';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useAppPalette } from '../theme/usePalette';
import { logger } from '../utils/logger';

// Deep link URL scheme
const scheme = 'empowrapp://';

export default function Index() {
  // EMERGENCY DEBUG
  console.log('🚨 [Index] Component mounted');
  
  const { user, loading } = useAuth();
  const palette = useAppPalette();
  const router = useRouter();
  const segments = useSegments();

  // Web-specific: Add console logging for debugging
  useEffect(() => {
    console.log('[Index WEB] Component mounted', { loading, hasUser: !!user });
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-console
      console.log('[Index WEB] Component mounted', { loading, hasUser: !!user });
    }
  }, []);
  
  useEffect(() => {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-console
      console.log('[Index WEB] Auth state changed', { loading, hasUser: !!user, segments });
    }
  }, [loading, user, segments]);

  // Store the deep link path for resuming after login
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      try {
        // Parse the deep link
        const path = url.replace(scheme, '');
        logger.log('Deep link detected', { path, currentUser: !!user });

        // If user is not authenticated, store the intended path and redirect to login
        if (!user && !loading) {
          // Save the deep link for later
          const encodedPath = encodeURIComponent(path);
          router.replace(`/(auth)/signin?redirect=${encodedPath}` as any);
        } else if (user) {
          // User is authenticated, navigate to the deep linked path
          if (path && path !== '') {
            router.push(path as any);
          } else {
            router.replace('/(tabs)');
          }
        }
      } catch (error) {
        logger.error('Deep link handling error', { error: error instanceof Error ? error.message : 'Unknown' });
        // Default fallback
        if (user) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/signin' as any);
        }
      }
    };

    // Listen for initial deep link when app is cold started
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Check if app was opened from a deep link when it's mounted
    Linking.getInitialURL()
      .then(url => {
        if (url != null) {
          handleDeepLink(url);
        }
      })
      .catch(error => {
        logger.error('Failed to get initial URL', { error: error instanceof Error ? error.message : 'Unknown' });
      });

    return () => {
      subscription.remove();
    };
  }, [user, loading, router]);

  // Handle redirect using useEffect to avoid middleware issues
  useEffect(() => {
    if (loading) {
      logger.log('[Index] Still loading auth state...');
      if (Platform.OS === 'web') {
        console.log('[Index WEB] Waiting for auth to load...');
      }
      return; // Still loading, wait
    }
    
    // Auth is done loading - immediately redirect based on user state
    console.log('[Index WEB] Auth loaded, user:', !!user);
    
    // Simple redirect: if no user, go to signin; if user, go to tabs
    if (!user) {
      logger.log('[Index] No user - navigating to signin');
      console.log('[Index WEB] Redirecting to /(auth)/signin');
      router.replace('/(auth)/signin' as any);
    } else {
      logger.log('[Index] User authenticated - navigating to tabs');
      console.log('[Index WEB] Redirecting to /(tabs)');
      router.replace('/(tabs)');
    }
  }, [loading, user, router]); // React to loading, user, and router changes only

  // Show loading state while auth initializes or during redirect
  // Add timeout to detect stuck loading state
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && Platform.OS === 'web') {
         
        console.error('[Index] Auth stuck loading for 10+ seconds. Check Firebase config and network.');
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background || '#fff' }}>
      <ActivityIndicator size="large" color={palette.primary || '#007AFF'} />
      <Text style={{ marginTop: 20, color: palette.text || '#000', fontSize: 16 }}>
        Loading 3mpwr App... {loading ? '(Initializing auth)' : '(Redirecting)'}
      </Text>
      {Platform.OS === 'web' && (
        <Text style={{ marginTop: 10, color: palette.textSecondary || '#666', fontSize: 12 }}>
          If this takes more than a few seconds, check the browser console (F12)
        </Text>
      )}
    </View>
  );
}
