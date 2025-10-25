import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import DisclaimerBanner from "../../../components/DisclaimerBanner";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { useAppPalette } from "../../../theme/usePalette";

export const options = { href: null };

export default function ClaimsNavigator() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t("claimsNavigator.title", "Guided Claims Navigator"));
  useFocusOnRefOnMount(titleRef);

  const [incident, setIncident] = React.useState("");
  const [limitations, setLimitations] = React.useState("");
  const [employer, setEmployer] = React.useState("");
  const [nextSteps, setNextSteps] = React.useState<string[]>([]);

  const generate = React.useCallback(() => {
    const steps: string[] = [];
    if (incident) steps.push(t("claimsNavigator.step.report", "Write a detailed incident report (date/time/location/witnesses)"));
    if (employer) steps.push(t("claimsNavigator.step.notify", "Notify {{employer}} in writing; request acknowledgement").replace("{{employer}}", employer));
    if (limitations) steps.push(t("claimsNavigator.step.faf", "Ask your clinician for a functional abilities form"));
    steps.push(t("claimsNavigator.step.file", "File or update your claim; keep copies of all documents"));
    steps.push(t("claimsNavigator.step.track", "Track communications (dates, names, summaries) in Evidence Locker"));
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
        {t("claimsNavigator.title", "Guided Claims Navigator")}
      </Text>
      <DisclaimerBanner type="legal" compact />
      <Text style={styles.subtitle}>
        {t("claimsNavigator.subtitle", "Turn your situation into a clear plan.")}
      </Text>
      <TextInput
        value={incident}
        onChangeText={setIncident}
        placeholder={t("claimsNavigator.incidentPh", "Describe what happened")}
        placeholderTextColor={palette.text + "77"}
        style={styles.input}
      />
      <TextInput
        value={limitations}
        onChangeText={setLimitations}
        placeholder={t("claimsNavigator.limitationsPh", "Describe work limitations")}
        placeholderTextColor={palette.text + "77"}
        style={styles.input}
      />
      <TextInput
        value={employer}
        onChangeText={setEmployer}
        placeholder={t("claimsNavigator.employerPh", "Employer / contact")}
        placeholderTextColor={palette.text + "77"}
        style={styles.input}
      />
      <Pressable
        onPress={generate}
        accessibilityRole="button"
        accessibilityLabel={t("claimsNavigator.generateA11y", "Generate steps")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{t("claimsNavigator.generateBtn", "Generate Steps")}</Text>
      </Pressable>
      {nextSteps.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionTitle}>{t("claimsNavigator.suggested", "Suggested next steps")}</Text>
          {nextSteps.map((s, i) => (
            <Text key={i} style={styles.step}>
              • {s}
            </Text>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("claimsNavigator.exportPdfA11y", "Export to PDF")}
            onPress={async () => {
              const html = `<!DOCTYPE html><html><body><h1>Guided Claims Navigator</h1><p><b>Incident:</b> ${incident}</p><p><b>Employer:</b> ${employer}</p><p><b>Limitations:</b> ${limitations}</p><h2>Steps</h2><ol>${nextSteps.map((s) => `<li>${s}</li>`).join("")}</ol></body></html>`;
              try {
                const Print = await import("expo-print");
                await Print.printAsync({ html });
              } catch {}
            }}
            style={[styles.button, { marginTop: 8 }]}
          >
            <Text style={styles.buttonText}>{t("claimsNavigator.exportPdfBtn", "Export PDF")}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("claimsNavigator.shareA11y", "Share steps")}
            onPress={async () => {
              try {
                const body = `Guided Claims Navigator\n\nIncident: ${incident}\nEmployer: ${employer}\nLimitations: ${limitations}\n\nSteps:\n- ${nextSteps.join("\n- ")}`;
                const FS = await import("expo-file-system");
                const path = FS.cacheDirectory + `claims_${Date.now()}.txt`;
                await FS.writeAsStringAsync(path, body);
                try { const Sharing = await import("expo-sharing"); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path); else Alert.alert(t("common.saved","Saved"), t("claimsNavigator.sharedToCache","Saved to cache as .txt")); }
                catch { Alert.alert(t("common.saved","Saved"), t("claimsNavigator.sharedToCache","Saved to cache as .txt")); }
              } catch { Alert.alert(t("common.error","Error"), t("claimsNavigator.shareFail","Could not share.")); }
            }}
            style={[styles.button, { marginTop: 8 }]}
          >
            <Text style={styles.buttonText}>{t("common.share","Share")}</Text>
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
