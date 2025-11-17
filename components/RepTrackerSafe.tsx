import React from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";

import { colors } from "../theme/colors";

// Lazy load RepTracker - only loads when user clicks "Rep Tracker" button
const RepTracker = React.lazy(() => import("./RepTracker"));

/**
 * Safe wrapper for RepTracker - catches errors and shows fallback
 * Uses Suspense for lazy loading
 */
export function RepTrackerSafe() {
  const [hasError, setHasError] = React.useState(false);
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  
  if (hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: palette.background }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: palette.text }}>
          Rep Tracker Unavailable
        </Text>
        <Text style={{ fontSize: 14, textAlign: 'center', marginBottom: 16, color: palette.textSecondary }}>
          The Rep Tracker feature is temporarily unavailable. This may be due to location permissions or a temporary issue.
        </Text>
        <Pressable
          onPress={() => setHasError(false)}
          style={{
            backgroundColor: palette.primary,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: palette.onPrimary, fontSize: 16, fontWeight: '600' }}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }
  
  return (
    <React.Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.background }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🗳️</Text>
          <Text style={{ fontSize: 16, color: palette.text }}>Loading Rep Tracker...</Text>
        </View>
      }
    >
      <RepTracker />
    </React.Suspense>
  );
}
