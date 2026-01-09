import { Redirect, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { useAuth } from '../hooks/useAppStore';
import { useAppPalette } from '../theme/usePalette';

export default function Index() {
  const { user, loading } = useAuth();
  const palette = useAppPalette();
  const router = useRouter();
  const lastAuthState = useRef<'authenticated' | 'unauthenticated' | null>(null);

  useEffect(() => {
    if (loading) return;
    
    const currentAuthState = user ? 'authenticated' : 'unauthenticated';
    
    if (lastAuthState.current === currentAuthState) return;
    
    lastAuthState.current = currentAuthState;
    
    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: palette.background }} />;
  }

  if (!user) {
    return <Redirect href="/(auth)/signin" />;
  }

  return <Redirect href="/(tabs)" />;
}
