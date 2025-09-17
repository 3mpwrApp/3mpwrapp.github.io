import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Share,
  Alert,
} from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { getCachedJSON, setCachedJSON } from "../../../services/cache";

type Flow = "CPP-D" | "WCB" | "EI-Sickness";

const STEPS: Record<Flow, string[]> = {
  "CPP-D": [
    "Confirm CPP contributions and severe/prolonged disability criteria",
    "Gather medical letters with functional limits",
    "Complete forms: Applicant + Medical Report",
    "Create timeline of work history and daily impact",
  ],
  WCB: [
    "Report injury/illness and notify employer",
    "Medical documentation: diagnosis and functional restrictions",
    "Request modified duties; track responses",
    "Submit claim; note deadlines for appeal/reconsideration",
  ],
  "EI-Sickness": [
    "Confirm insurable hours and records of employment",
    "Obtain medical certificate",
    "Apply online; create CRA account access",
    "Track payments and report changes",
  ],
};

export const options = { href: null };

export default function AiGovNavigator() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("AI Government Navigator");
  useFocusOnRefOnMount(titleRef);
  const [flow, setFlow] = React.useState<Flow>("CPP-D");
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    (async () => {
      const s = await getCachedJSON<{ flow: Flow; step: number }>(
        "gov_nav_state",
      );
      if (s) {
        setFlow(s.flow);
        setStep(s.step || 0);
      }
    })();
  }, []);
  React.useEffect(() => {
    setCachedJSON("gov_nav_state", { flow, step });
  }, [flow, step]);
  const list = STEPS[flow];
  const next = () => setStep((prev) => Math.min(prev + 1, list.length - 1));
  const prev = () => setStep((prev) => Math.max(prev - 1, 0));
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        AI Government Navigator
      </Text>
      <Text
        style={[
          s.subtitle,
          { textDecorationLine: "underline", color: palette.primary },
        ]}
        onPress={() =>
          Alert.alert(
            "Tips",
            "Keep copies of all forms, note deadlines, and request accommodations for accessibility (extended time, alternate formats).",
          )
        }
      >
        Help & tips
      </Text>
      <Text style={s.subtitle}>
        Conversational, stepÃ¢â‚¬â€˜byÃ¢â‚¬â€˜step guidance through forms with
        accessibility in mind.
      </Text>
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 8,
        }}
      >
        {(Object.keys(STEPS) as Flow[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => {
              setFlow(f);
              setStep(0);
            }}
            style={{
              borderWidth: 1,
              borderColor: palette.muted,
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: flow === f ? palette.primary : "transparent",
            }}
          >
            <Text
              style={{ color: flow === f ? palette.onPrimary : palette.text }}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>
          Step {step + 1} of {list.length}
        </Text>
        <Text style={s.cardText}>{list[step]}</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <Pressable
            onPress={prev}
            style={[s.button, { opacity: step === 0 ? 0.6 : 1 }]}
            disabled={step === 0}
          >
            <Text style={s.buttonText}>Back</Text>
          </Pressable>
          <Pressable
            onPress={next}
            style={[s.button, { opacity: step === list.length - 1 ? 0.6 : 1 }]}
            disabled={step === list.length - 1}
          >
            <Text style={s.buttonText}>Next</Text>
          </Pressable>
        </View>
        <View style={{ height: 8 }} />
        <Pressable
          onPress={() =>
            Share.share({
              title: `Navigator ${flow}`,
              message: `Flow: ${flow}\nStep ${step + 1}/${list.length}: ${list[step]}\n\nAll steps:\n${list.map((x, i) => `${i + 1}. ${x}`).join("\n")}`,
            }).catch(() => {})
          }
          style={s.button}
        >
          <Text style={s.buttonText}>Share progress</Text>
        </Pressable>
        <View style={{ height: 8 }} />
        <Pressable
          onPress={async () => {
            try {
              const mod = await import("expo-print");
              const html = `<pre style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;\">Flow: ${flow}\nStep ${step + 1}/${list.length}: ${list[step]}\n\nAll steps:\n${list.map((x, i) => `${i + 1}. ${x}`).join("\n")}</pre>`;
              const { uri } = await mod.printToFileAsync({ html });
              await Share.share({ url: uri, title: `Navigator ${flow}` });
            } catch {
              Alert.alert(
                "PDF not available",
                "Install expo-print in a dev build to export PDFs.",
              );
            }
          }}
          style={s.button}
        >
          <Text style={s.buttonText}>Export as PDF</Text>
        </Pressable>
        <View style={{ height: 8 }} />
        <Pressable
          onPress={async () => {
            try {
              const FS = await import("expo-file-system");
              const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">Flow: ${flow}\nStep ${step + 1}/${list.length}: ${list[step]}\n\nAll steps:\n${list.map((x, i) => `${i + 1}. ${x}`).join("\n")}</pre></body></html>`;
              const path = FS.cacheDirectory + `gov_nav_${Date.now()}.doc`;
              await FS.writeAsStringAsync(path, html, {
                encoding: FS.EncodingType.UTF8,
              });
              await Share.share({
                url: path,
                title: `Navigator ${flow} (.doc)`,
              });
            } catch {
              Alert.alert("Export failed", "Could not create .doc file.");
            }
          }}
          style={s.button}
        >
          <Text style={s.buttonText}>Export as .doc</Text>
        </Pressable>
      </View>
      <Text style={[s.subtitle, { marginTop: 8 }]}>
        Tip: Save copies of all forms and keep a timeline of key dates.
      </Text>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9 },
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      backgroundColor: palette.surface,
      marginTop: 8,
    },
    cardTitle: { color: palette.text, fontWeight: "700", marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95 },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
      minWidth: 100,
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
  });
}
