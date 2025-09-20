import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";

export const options = { href: null };

export default function ClaimsNavigator() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Guided Claims Navigator");
  useFocusOnRefOnMount(titleRef);

  const [incident, setIncident] = React.useState("");
  const [limitations, setLimitations] = React.useState("");
  const [employer, setEmployer] = React.useState("");
  const [nextSteps, setNextSteps] = React.useState<string[]>([]);

  const generate = React.useCallback(() => {
    const steps: string[] = [];
    if (incident)
      {steps.push(
        "Write a detailed incident report (date/time/location/witnesses)",
      );}
    if (employer)
      {steps.push(`Notify ${employer} in writing; request acknowledgement`);}
    if (limitations)
      {steps.push("Ask your clinician for a functional abilities form");}
    steps.push("File or update your claim; keep copies of all documents");
    steps.push(
      "Track communications (dates, names, summaries) in Evidence Locker",
    );
    setNextSteps(steps);
  }, [incident, employer, limitations]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Guided Claims Navigator
      </Text>
      <Text style={styles.subtitle}>
        Turn your situation into a clear plan.
      </Text>
      <TextInput
        value={incident}
        onChangeText={setIncident}
        placeholder="Describe what happened"
        placeholderTextColor={palette.text + "77"}
        style={styles.input}
      />
      <TextInput
        value={limitations}
        onChangeText={setLimitations}
        placeholder="Describe work limitations"
        placeholderTextColor={palette.text + "77"}
        style={styles.input}
      />
      <TextInput
        value={employer}
        onChangeText={setEmployer}
        placeholder="Employer / contact"
        placeholderTextColor={palette.text + "77"}
        style={styles.input}
      />
      <Pressable
        onPress={generate}
        accessibilityRole="button"
        accessibilityLabel="Generate steps"
        style={styles.button}
      >
        <Text style={styles.buttonText}>Generate Steps</Text>
      </Pressable>
      {nextSteps.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionTitle}>Suggested next steps</Text>
          {nextSteps.map((s, i) => (
            <Text key={i} style={styles.step}>
              Ã¢â‚¬Â¢ {s}
            </Text>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Export to PDF"
            onPress={async () => {
              const html = `<!DOCTYPE html><html><body><h1>Guided Claims Navigator</h1><p><b>Incident:</b> ${incident}</p><p><b>Employer:</b> ${employer}</p><p><b>Limitations:</b> ${limitations}</p><h2>Steps</h2><ol>${nextSteps.map((s) => `<li>${s}</li>`).join("")}</ol></body></html>`;
              try {
                const Print = await import("expo-print");
                await Print.printAsync({ html });
              } catch {}
            }}
            style={[styles.button, { marginTop: 8 }]}
          >
            <Text style={styles.buttonText}>Export PDF</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginVertical: 8 },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
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
    sectionTitle: {
      color: palette.text,
      fontWeight: "700",
      marginTop: 8,
      marginBottom: 6,
    },
    step: { color: palette.text, marginBottom: 4 },
  });
}
