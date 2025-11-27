import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useAppPalette } from '../theme/usePalette';

export default function Index() {
  const { user, loading } = useAuth();
  const palette = useAppPalette();

  // Show loading state
  if (loading) {
    return <View style={{ flex: 1, backgroundColor: palette.background }} />;
  }

  // Redirect based on auth state
  if (!user) {
    return <Redirect href="/(auth)/signin" />;
  }

  return <Redirect href="/(tabs)" />;
}
