import * as Linking from 'expo-linking';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

// Deep link URL scheme
const scheme = 'empowrapp://';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

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
      return; // Still loading, wait
    }
    
    // Auth is done loading - check where we are
    const segmentArray = segments as string[];
    const inAuthFlow = segmentArray.includes('auth') || segmentArray.includes('(auth)');
    const inTabsFlow = segmentArray.includes('tabs') || segmentArray.includes('(tabs)');
    const currentPath = segmentArray.join('/');
    
    logger.log('[Index] Navigation check', { 
      hasUser: !!user, 
      inAuthFlow, 
      inTabsFlow,
      segments: currentPath,
      segmentArray,
    });
    
    // Determine where user should be based on auth state
    const shouldBeInAuth = !user;
    const shouldBeInTabs = !!user;
    
    // If user is authenticated but in auth flow, navigate to tabs (HOME)
    if (shouldBeInTabs && inAuthFlow) {
      logger.log('[Index] ✅ User logged in - navigating to home/(tabs)');
      // Use a small delay to ensure Firebase auth state is fully settled
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
      return;
    }
    
    // If user is not authenticated but in tabs flow, navigate to login
    if (shouldBeInAuth && inTabsFlow) {
      logger.log('[Index] ❌ No user in tabs - navigating to login');
      router.replace('/(auth)/signin' as any);
      return;
    }
    
    // Initial navigation when not in any flow yet (index route)
    if (!inAuthFlow && !inTabsFlow) {
      if (!user) {
        logger.log('[Index] 🔄 Initial - no user, navigating to login');
        router.replace('/(auth)/signin' as any);
      } else {
        logger.log('[Index] 🔄 Initial - user exists, navigating to home/(tabs)');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      }
    }
  }, [loading, user, segments, router]); // React to loading, user, segments, and router changes

  // Show loading state while auth initializes or during redirect
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
