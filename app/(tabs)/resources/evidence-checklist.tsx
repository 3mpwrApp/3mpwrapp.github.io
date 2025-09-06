import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export const options = { href: null };

type Kind = "WCB" | "LTD" | "CPP-D" | "Accommodation";

const ITEMS: Record<Kind, string[]> = {
  WCB: [
    "Accident/incident report and dates",
    "Employer submission and response",
    "Medical notes emphasizing functional limits",
    "Return-to-work discussions and outcomes",
    "Prior decisions and reasons",
  ],
  LTD: [
    "Policy booklet and definition of disability",
    "Claim forms (own physician and insurer)",
    "Specialist letters with functional limits",
    "Employment description and essential duties",
    "Insurer decision and correspondence",
  ],
  "CPP-D": [
    "MSDPR/Service Canada forms",
    "Longitudinal medical records",
    "Work history and education",
    "Daily living impact statements",
    "Prior decisions and reconsideration letter",
  ],
  Accommodation: [
    "Job description and essential duties",
    "Accommodation requests and responses",
    "Medical notes with restrictions (no diagnosis required)",
    "Proposed accommodations and feasibility",
    "Union/HR correspondence (if applicable)",
  ],
};

export default function EvidenceChecklist() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Evidence Checklist");
  useFocusOnRefOnMount(titleRef);

  const [kind, setKind] = React.useState<Kind>("WCB");

  return (
    <View style={styles.container}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Evidence Checklist</Text>
      <Text style={styles.subtitle}>Pick a process to view a tailored checklist.</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {(["WCB","LTD","CPP-D","Accommodation"] as Kind[]).map((k) => (
          <Pressable key={k} onPress={() => setKind(k)} style={[styles.chip, kind===k && styles.chipActive]} accessibilityRole="button">
            <Text style={[styles.chipText, kind===k && styles.chipTextActive]}>{k}</Text>
          </Pressable>
        ))}
      </View>
      {ITEMS[kind].map((line, idx) => (
        <Text key={idx} style={styles.item}>• {line}</Text>
      ))}
      <Text style={[styles.subtitle, { marginTop: 12 }]}>Tip: Summaries from Wellness trackers can support your evidence.</Text>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary, fontWeight: '700' },
    item: { color: palette.text, marginBottom: 6 },
  });
}

