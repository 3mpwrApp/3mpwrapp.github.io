import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export default function FinancialSafetyNetNavigator() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Financial Safety Net Navigator");
  useFocusOnRefOnMount(titleRef);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Financial Safety Net Navigator
      </Text>
      <Text style={styles.subtitle}>
        Step-by-step guidance to combine Workers’ Comp, CPP‑D, ODSP/provincial supports, and EI without overlap penalties.
        This is a planning tool — verify specifics with official program rules.
      </Text>

      <Step n={1} title="Your situation">
        <Text style={styles.text}>• Are you currently employed? Receiving any benefits already?</Text>
        <Text style={styles.text}>• Province/territory and last day worked</Text>
        <Text style={styles.text}>• Doctor-provided restrictions and expected duration</Text>
      </Step>
      <Step n={2} title="Initial coverage window">
        <Text style={styles.text}>• Workplace injury/illness → start with Workers’ Compensation claim</Text>
        <Text style={styles.text}>• Non‑work injury/illness → consider EI Sickness (up to 26 weeks)</Text>
      </Step>
      <Step n={3} title="Longer-term supports">
        <Text style={styles.text}>• CPP‑Disability for prolonged/severe disability (federal)</Text>
        <Text style={styles.text}>• Provincial disability supports (e.g., ODSP/SAID/AISH/…)</Text>
      </Step>
      <Step n={4} title="Avoiding clawbacks">
        <Text style={styles.text}>• Some benefits offset others; track timelines to minimize overlaps</Text>
        <Text style={styles.text}>• Report changes promptly (return to work, new payments)</Text>
      </Step>
      <Step n={5} title="Documentation & appeals">
        <Text style={styles.text}>• Keep decision letters; note deadlines</Text>
        <Text style={styles.text}>• Use the Case Timeline Tracker and Letter Templates</Text>
      </Step>

      <View style={{ height: 12 }} />
      <Pressable style={styles.cta} accessibilityRole="button" accessibilityLabel="Start guided flow (coming soon)">
        <Text style={styles.ctaText}>Start Guided Flow (Coming Soon)</Text>
      </Pressable>
    </ScrollView>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  const palette = useAppPalette();
  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={{ color: palette.text, fontWeight: "700", marginBottom: 4 }}>{`Step ${n}: ${title}`}</Text>
      {children}
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text, marginBottom: 6 },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 12 },
    text: { color: palette.text, marginBottom: 4 },
    cta: {
      backgroundColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    ctaText: { color: palette.onPrimary, fontWeight: "700" },
  });
}

