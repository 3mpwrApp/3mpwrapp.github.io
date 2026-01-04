/**
 * Redirect Component
 * 
 * A reusable component that redirects users from legacy routes to new destinations
 * Supports navigation with optional tab parameters
 */

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAppPalette } from '../theme/usePalette';
import { logger } from '../utils/logger';

interface RedirectScreenProps {
  to: string;
  tab?: string;
  reason?: string;
}

/**
 * RedirectScreen Component
 * 
 * Displays a loading indicator while redirecting to a new route
 * Logs analytics event for redirect tracking
 */
export default function RedirectScreen({
  to,
  tab,
}: RedirectScreenProps) {
  const router = useRouter();
  const palette = useAppPalette();

  useEffect(() => {
    // Perform redirect - router.replace expects a valid route string
    const timer = setTimeout(() => {
      try {
        // Type-cast to handle dynamic route strings
        router.replace(to as any);
      } catch (error) {
        logger.warn('[RedirectScreen] Navigation failed:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router, to]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: palette.background,
      }}
    >
      <ActivityIndicator size="large" color={palette.primary} />
    </View>
  );
}
