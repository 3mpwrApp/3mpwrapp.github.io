import React from "react";
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { getCachedJSON, setCachedJSON } from "../../../services/cache";
import { fsAddViolationReport } from "../../../services/violations";

type Report = {
  id: string;
  type: string;
  province?: string;
  details?: string;
  createdAt: number;
};
const TYPES = [
  "denied modified duties",
  "refused accommodation",
  "retaliation",
  "benefit denial",
];

export const options = { href: null };

export default function CollectiveLegal() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Collective Legal Action Hub");
  useFocusOnRefOnMount(titleRef);
  const [type, setType] = React.useState<string>(TYPES[0]);
  const [province, setProvince] = React.useState<string>("");
  const [details, setDetails] = React.useState<string>("");
  const [reports, setReports] = React.useState<Report[]>([]);

  React.useEffect(() => {
    (async () => {
      const saved = await getCachedJSON<Report[]>("collective_reports");
      if (saved) setReports(saved);
    })();
  }, []);
  React.useEffect(() => {
    setCachedJSON("collective_reports", reports);
  }, [reports]);

  const submit = async () => {
    const r: Report = {
      id: String(Date.now()),
      type,
      province,
      details,
      createdAt: Date.now(),
    };
    setReports((prev) => [r, ...prev]);
    fsAddViolationReport?.(r).catch(() => {});
    setDetails("");
    Alert.alert(
      "Submitted",
      "Report added anonymously. Aggregated counts help build leverage.",
    );
  };

  const byType = reports.reduce((acc: Record<string, number>, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as any);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Collective Legal Action Hub
      </Text>
      <Text style={s.subtitle}>
        If multiple users report the same violation, Empowr groups cases for
        union/classÃ¢â‚¬â€˜action leverage.
      </Text>
      <Text style={s.label}>Violation type</Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {TYPES.map((t) => (
          <A11yPressable
            key={t}
            onPress={() => setType(t)}
            style={{
              borderWidth: 1,
              borderColor: palette.muted,
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: type === t ? palette.primary : "transparent",
            }}
          >
            <Text
              style={{ color: type === t ? palette.onPrimary : palette.text }}
            >
              {t}
            </Text>
          </A11yPressable>
        ))}
      </View>
      <Text style={s.label}>Province (optional)</Text>
      <TextInput
        style={s.input}
        value={province}
        onChangeText={setProvince}
        placeholder="ON, BC, ..."
      />
      <Text style={s.label}>Details (optional)</Text>
      <TextInput
        style={[s.input, { minHeight: 100 }]}
        value={details}
        onChangeText={setDetails}
        multiline
        placeholder="Short summary; do not include identifiers."
      />
      <A11yPressable onPress={submit} style={s.button}>
        <Text style={s.buttonText}>Submit report</Text>
      </A11yPressable>

      <Text style={[s.subtitle, { marginTop: 12 }]}>Aggregated reports</Text>
      {Object.keys(byType).length === 0 ? (
        <Text style={s.tip}>No reports yet.</Text>
      ) : (
        Object.entries(byType).map(([k, v]) => (
          <Text key={k} style={s.tip}>
            Ã¢â‚¬Â¢ {k}: {v}
          </Text>
        ))
      )}
      <Text style={[s.tip, { marginTop: 8 }]}>
        Note: Submissions are anonymous; contact details are not collected.
      </Text>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    label: { color: palette.text, opacity: 0.95, marginBottom: 4 },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 10,
      color: palette.text,
      marginBottom: 8,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    tip: { color: palette.text, opacity: 0.9 },
  });
}
