import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export default function AIDecisionSimplifier() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("AI Decision Simplifier");
  useFocusOnRefOnMount(titleRef);

  const onPick = async () => {
    try {
      const mod = await import("expo-document-picker");
      const result = await mod.getDocumentAsync({ type: ["application/pdf", "image/*"], multiple: false });
      if (result.canceled) return;
      const file = result.assets?.[0];
      Alert.alert("Uploaded", `Selected: ${file?.name ?? "document"}.\nSummary coming soon.`);
    } catch (e: any) {
      Alert.alert("Unavailable", "Document picker not available. Try reinstalling the dev client.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        AI Decision Simplifier
      </Text>
      <Text style={styles.subtitle}>
        Upload a decision letter to get a plain-language summary of what it means, the next steps, and deadlines.
        Your document stays on your device unless you explicitly opt in to share.
      </Text>
      <Pressable onPress={onPick} accessibilityRole="button" accessibilityLabel="Upload decision letter" style={styles.cta}>
        <Text style={styles.ctaText}>Upload Decision Letter</Text>
      </Pressable>
      <Text style={{ color: palette.text, opacity: 0.8, marginTop: 8 }}>
        Note: Summaries require an on-device or remote model. This preview focuses on the upload flow.
      </Text>
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
      marginTop: 8,
    },
    ctaText: { color: palette.onPrimary, fontWeight: "700" },
  });
}

