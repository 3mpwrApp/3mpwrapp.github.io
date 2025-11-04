import * as Linking from 'expo-linking';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

// Deep link URL scheme
const scheme = 'empowrapp://';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasNavigated = useRef(false);

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
    if (loading) {
      return; // Still loading, wait
    }
    
    // Prevent multiple navigation attempts
    if (hasNavigated.current) {
      return;
    }
    
    // Auth is done loading - check where we are
    const inAuthFlow = (segments as string[]).includes('auth');
    const inTabsFlow = (segments as string[]).includes('tabs');
    
    logger.log('Index navigation check', { 
      user: !!user, 
      inAuthFlow, 
      inTabsFlow,
      segments: segments.join('/'),
    });
    
    // Determine where user should be based on auth state
    const shouldBeInAuth = !user;
    const shouldBeInTabs = !!user;
    
    // If user is authenticated but in auth flow, navigate to tabs
    if (shouldBeInTabs && inAuthFlow) {
      logger.log('User logged in - navigating to tabs');
      hasNavigated.current = true;
      router.replace('/(tabs)');
      return;
    }
    
    // If user is not authenticated but in tabs flow, navigate to login
    if (shouldBeInAuth && inTabsFlow) {
      logger.log('No user in tabs - navigating to login');
      hasNavigated.current = true;
      router.replace('/(auth)/login');
      return;
    }
    
    // Initial navigation when not in any flow yet
    if (!inAuthFlow && !inTabsFlow) {
      if (!user) {
        logger.log('Initial - no user, navigating to login');
        hasNavigated.current = true;
        router.replace('/(auth)/login');
      } else {
        logger.log('Initial - user exists, navigating to tabs');
        hasNavigated.current = true;
        router.replace('/(tabs)');
      }
    }
  }, [loading, user]); // Only react to loading and user changes, not segments
  
  // Reset navigation flag when user changes
  useEffect(() => {
    hasNavigated.current = false;
  }, [user]);

  // Show loading state while auth initializes or during redirect
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
