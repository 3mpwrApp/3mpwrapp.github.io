import { Link } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import Card from "../../../components/Card";
import DisclaimerBanner from "../../../components/DisclaimerBanner";
import { DyslexiaText } from "../../../components/DyslexiaText";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useAppPalette } from "../../../theme/usePalette";

export default function MythBustingHub() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Myth-Busting Knowledge Hub");
  useFocusOnRefOnMount(titleRef);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Myth-Busting Knowledge Hub
      </Text>
      <DisclaimerBanner type="general" compact={true} />
      <DyslexiaText style={styles.subtitle}>
        Break down complex policies in plain language — with interactive explainers for Workers' Comp, Canada-wide and
        provincial programs, CPP-D, EI Sickness, and more.
      </DyslexiaText>
      <View>
        <Text style={styles.blockTitle}>Popular explainers</Text>
        <Link href={("/(tabs)/advocacy/policy-simple" as any)} asChild={true}>
          <Card title="Policy Made Simple" subtitle="Clear guides to accessibility and benefits" />
        </Link>
        <Card title="CPP-Disability" subtitle="Eligibility, timelines, appeals — in plain language" />
        <Card title="EI Sickness" subtitle="Qualifying hours, duration, how to apply" />
        <Card title="Workers’ Compensation" subtitle="Claims, medical evidence, and common pitfalls" />
      </View>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text, marginBottom: 6 },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 12 },
    blockTitle: { color: palette.text, fontWeight: "700", marginBottom: 8 },
  });
}

