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
    // Build target URL with tab if provided
    const targetUrl = tab ? `${to}?tab=${tab}` : to;

    // Perform redirect
    const timer = setTimeout(() => {
      router.replace(targetUrl);
    }, 100);

    return () => clearTimeout(timer);
  }, [router, to, tab]);

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
