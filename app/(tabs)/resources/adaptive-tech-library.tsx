import React from "react";
import { ScrollView, View, Text, StyleSheet, Linking } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import Card from "../../../components/Card";

export default function AdaptiveTechLibrary() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Adaptive Tech Library");
  useFocusOnRefOnMount(titleRef);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Adaptive Tech Library
      </Text>
      <Text style={styles.subtitle}>
        Tutorials and reviews of accessibility tools: screen readers, speech‑to‑text, mobility aids, captioning, and
        everyday apps that make life easier.
      </Text>
      <View>
        <Card title="Screen Readers 101" subtitle="TalkBack and VoiceOver basics" onPress={() => {}} />
        <Card title="Speech-to-Text" subtitle="Dictation on Android/iOS; accuracy tips" onPress={() => {}} />
        <Card title="Live Captions" subtitle="System features and third‑party apps" onPress={() => {}} />
        <Card title="Magnification & Contrast" subtitle="High contrast, zoom, color filters" onPress={() => {}} />
        <Card
          title="Mobility & Switch Access"
          subtitle="Switch Control, external keyboards, and input adapters"
          onPress={() => {}}
        />
      </View>
      <Text style={{ color: palette.text, opacity: 0.8, marginTop: 10 }}>
        Tip: Personalize your experience with the Accessibility button in the header.
      </Text>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text, marginBottom: 6 },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 12 },
  });
}

