import * as Linking from 'expo-linking';
import { useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

// Deep link URL scheme
const scheme = 'empowrapp://';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  
  const [hasNavigated, setHasNavigated] = React.useState(false);

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
          router.replace(`/(auth)/login?redirect=${encodedPath}` as any);
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
          router.replace('/(auth)/login');
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
  // CRITICAL: Only run once when loading completes, don't track segments
  useEffect(() => {
    if (hasNavigated) {
      return; // Already navigated, don't run again
    }
    
    // Safety timeout: if loading takes too long, force navigation
    const timeout = setTimeout(() => {
      if (!hasNavigated && loading) {
        logger.warn('Auth loading timeout - forcing navigation to login');
        setHasNavigated(true);
        router.replace('/(auth)/login');
      }
    }, 8000); // 8 second timeout
    
    if (loading) {
      return () => clearTimeout(timeout); // Still loading, wait
    }
    
    clearTimeout(timeout);
    
    // Auth is done loading - check where we are
    const inAuthFlow = (segments as string[]).includes('auth');
    const inTabsFlow = (segments as string[]).includes('tabs');
    
    logger.log('Index initial navigation', { 
      user: !!user, 
      inAuthFlow, 
      inTabsFlow,
      segments: segments.join('/')
    });
    
    // If already in auth or tabs, we're good
    if (inAuthFlow || inTabsFlow) {
      setHasNavigated(true);
      return () => clearTimeout(timeout);
    }
    
    // Navigate based on auth state
    setHasNavigated(true);
    if (!user) {
      logger.log('No user - navigating to login');
      router.replace('/(auth)/login');
    } else {
      logger.log('User authenticated - navigating to tabs');
      router.replace('/(tabs)');
    }
    
    return () => clearTimeout(timeout);
  }, [loading, user]); // REMOVED: hasNavigated and segments from deps to prevent loop

  // Show loading state while auth initializes or during redirect
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
