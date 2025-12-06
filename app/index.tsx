import { Redirect, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useAppPalette } from '../theme/usePalette';
import { logger } from '../utils/logger';

export default function Index() {
  const { user, loading } = useAuth();
  const palette = useAppPalette();
  const router = useRouter();
  // Track the last auth state we navigated for, not just "has navigated"
  const lastAuthState = useRef<'authenticated' | 'unauthenticated' | null>(null);

  // React to auth state changes and navigate accordingly
  useEffect(() => {
    if (loading) return;
    
    const currentAuthState = user ? 'authenticated' : 'unauthenticated';
    
    // Only navigate if auth state actually changed
    if (lastAuthState.current === currentAuthState) return;
    
    lastAuthState.current = currentAuthState;
    
    if (user) {
      logger.log('[Index] User authenticated, navigating to tabs');
      router.replace('/(tabs)');
    } else {
      logger.log('[Index] No user, navigating to sign in');
      router.replace('/(auth)/signin');
    }
  }, [user, loading, router]);

  // Show loading state while auth is being determined
  if (loading) {
    return <View style={{ flex: 1, backgroundColor: palette.background }} />;
  }

  // Fallback redirects (in case useEffect doesn't fire fast enough)
  if (!user) {
    return <Redirect href="/(auth)/signin" />;
  }

  return <Redirect href="/(tabs)" />;
}
