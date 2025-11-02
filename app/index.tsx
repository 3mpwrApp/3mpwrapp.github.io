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
  useEffect(() => {
    if (hasNavigated) return; // Prevent re-navigation
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        logger.warn('Auth loading timeout - forcing navigation to login');
        setHasNavigated(true);
        router.replace('/(auth)/login');
      }
    }, 5000);

    if (!loading) {
      clearTimeout(timeout);
      const inAuthFlow = (segments as string[]).includes('auth');
      const inTabsFlow = (segments as string[]).includes('tabs');
      
      logger.debug('Index navigation check', { 
        user: !!user, 
        inAuthFlow, 
        inTabsFlow,
        segments: segments.join('/'),
        hasNavigated
      });
      
      // Prevent navigation if we've already navigated or if we're already in the right place
      if (!inAuthFlow && !inTabsFlow) {
        setHasNavigated(true);
        if (!user) {
          logger.debug('Redirecting to login');
          router.replace('/(auth)/login');
        } else {
          logger.debug('Redirecting to tabs');
          router.replace('/(tabs)');
        }
      }
    }

    return () => clearTimeout(timeout);
  }, [loading, user, hasNavigated]); // Track hasNavigated to prevent loops

  // Show loading state while auth initializes or during redirect
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
