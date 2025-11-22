/**
 * Redirect: Spoon Economist → Energy & Mood Hub
 * This screen has been consolidated into the unified Energy & Mood Hub
 */

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAppPalette } from '../../../theme/usePalette';

export default function SpoonEconomistRedirect() {
  const router = useRouter();
  const palette = useAppPalette();

  useEffect(() => {
    // Redirect to Energy Hub with Track tab active
    const timer = setTimeout(() => {
      router.replace('/wellness/energy-hub?tab=track');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.card, { backgroundColor: palette.surface }]}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={[styles.title, { color: palette.text }]}>
          Redirecting to Energy & Mood Hub...
        </Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          💡 Spoon Economist is now part of the unified Energy & Mood Hub!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
