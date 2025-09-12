import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import A11yPressable from "../../../components/A11yPressable";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { Link } from "expo-router";

export default function CaseTimelineTracker() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Case Timeline Tracker");
  useFocusOnRefOnMount(titleRef);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Case Timeline Tracker
      </Text>
      <Text style={styles.subtitle}>
        Organize documents, deadlines, hearings, and appointments. Get automated reminders and export timelines for
        your case file or representative.
      </Text>
      <View style={{ gap: 8 }}>
        <Link href={("/(tabs)/resources/deadlines" as any)} asChild>
          <A11yPressable style={styles.cta} accessibilityLabel="Open Deadline Calculator">
            <Text style={styles.ctaText}>Open Deadline Calculator</Text>
          </A11yPressable>
        </Link>
        <A11yPressable style={styles.ctaSecondary} accessibilityLabel="Add documents (coming soon)">
          <Text style={styles.ctaSecondaryText}>Add Documents (coming soon)</Text>
        </A11yPressable>
      </View>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text, marginBottom: 6 },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 12 },
    cta: {
      backgroundColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    ctaText: { color: palette.onPrimary, fontWeight: "700" },
    ctaSecondary: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    ctaSecondaryText: { color: palette.text, fontWeight: "600" },
  });
}
