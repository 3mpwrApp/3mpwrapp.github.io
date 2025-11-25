import * as Linking from 'expo-linking';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useAppPalette } from '../theme/usePalette';
import { logger } from '../utils/logger';

// Deep link URL scheme
const scheme = 'empowrapp://';

// Global flag to prevent multiple simultaneous redirects (persists across component remounts)
let isRedirecting = false;

export default function Index() {
  const { user, loading } = useAuth();
  const palette = useAppPalette();
  const router = useRouter();
  const segments = useSegments();
  const [hasNavigated, setHasNavigated] = useState(false);

  // Debug: Log component lifecycle
  useEffect(() => {
    logger.log('[Index] Component mounted', { loading, hasUser: !!user, segments });
    return () => {
      logger.log('[Index] Component unmounting');
    };
  }, []);

  // Handle deep links (only set up once on mount)
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (isRedirecting || hasNavigated) {
        logger.log('[Index] Skipping deep link - already redirecting');
        return;
      }
      
      try {
        // Parse the deep link
        const path = url.replace(scheme, '');
        logger.log('[Index] Deep link detected', { path, currentUser: !!user });

        // If user is not authenticated, store the intended path and redirect to login
        if (!user && !loading) {
          // Save the deep link for later
          const encodedPath = encodeURIComponent(path);
          isRedirecting = true;
          setHasNavigated(true);
          router.replace(`/(auth)/signin?redirect=${encodedPath}` as any);
        } else if (user) {
          // User is authenticated, navigate to the deep linked path
          if (path && path !== '') {
            isRedirecting = true;
            setHasNavigated(true);
            router.push(path as any);
          } else {
            isRedirecting = true;
            setHasNavigated(true);
            router.replace('/(tabs)');
          }
        }
      } catch (error) {
        logger.error('[Index] Deep link handling error', { error: error instanceof Error ? error.message : 'Unknown' });
        // Default fallback
        if (!hasNavigated) {
          isRedirecting = true;
          setHasNavigated(true);
          if (user) {
            router.replace('/(tabs)');
          } else {
            router.replace('/(auth)/signin' as any);
          }
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Check for initial deep link
    Linking.getInitialURL()
      .then(url => {
        if (url != null) {
          handleDeepLink(url);
        }
      })
      .catch(error => {
        logger.error('[Index] Failed to get initial URL', { error: error instanceof Error ? error.message : 'Unknown' });
      });

    return () => {
      subscription.remove();
    };
  }, []); // Only run once on mount

  // Handle auth-based navigation (CRITICAL FIX: Prevent infinite loops)
  useEffect(() => {
    // Skip if already navigated or currently redirecting
    if (hasNavigated || isRedirecting) {
      logger.log('[Index] Skipping redirect - already navigated or redirecting');
      return;
    }
    
    // Wait for auth to finish loading
    if (loading) {
      logger.log('[Index] Waiting for auth to load...');
      return;
    }
    
    // CRITICAL: Check if we're already on a valid route to prevent loops
    const currentPath = segments.join('/');
    logger.log('[Index] Current path:', currentPath, 'User:', !!user);
    
    // If we're on auth screens and have a user, redirect to tabs
    if (user && (currentPath.includes('auth') || currentPath === '' || currentPath === 'index')) {
      logger.log('[Index] User logged in, navigating to home');
      isRedirecting = true;
      setHasNavigated(true);
      // Use setTimeout to avoid navigation during render
      setTimeout(() => {
        router.replace('/(tabs)');
        setTimeout(() => { isRedirecting = false; }, 1000);
      }, 100);
      return;
    }
    
    // If we're on tabs/protected routes without a user, redirect to signin
    if (!user && (currentPath === '' || currentPath === 'index')) {
      logger.log('[Index] No user, navigating to signin');
      isRedirecting = true;
      setHasNavigated(true);
      // Use setTimeout to avoid navigation during render
      setTimeout(() => {
        router.replace('/(auth)/signin' as any);
        setTimeout(() => { isRedirecting = false; }, 1000);
      }, 100);
      return;
    }
    
    // If we're already on the right screen, mark as navigated to prevent future loops
    if ((user && currentPath.includes('tabs')) || (!user && currentPath.includes('auth'))) {
      logger.log('[Index] Already on correct screen, marking as navigated');
      setHasNavigated(true);
    }
  }, [loading, user, segments, hasNavigated]);

  // Timeout detection for stuck loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        logger.error('[Index] Auth stuck loading for 10+ seconds. Check Firebase config and network.');
        console.error('[Index] Auth loading timeout - forcing navigation');
        // Force navigation even if loading
        if (!hasNavigated && !isRedirecting) {
          isRedirecting = true;
          setHasNavigated(true);
          router.replace('/(auth)/signin' as any);
        }
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [loading, hasNavigated]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background || '#fff' }}>
      <ActivityIndicator size="large" color={palette.primary || palette.primary} />
      <Text style={{ marginTop: 20, color: palette.text || '#000', fontSize: 16 }}>
        {loading ? 'Initializing auth...' : hasNavigated ? 'Navigating...' : 'Loading 3mpwr App...'}
      </Text>
      {Platform.OS === 'web' && (
        <Text style={{ marginTop: 10, color: palette.textSecondary || '#666', fontSize: 12 }}>
          If this takes more than a few seconds, check the browser console (F12)
        </Text>
      )}
    </View>
  );
}
