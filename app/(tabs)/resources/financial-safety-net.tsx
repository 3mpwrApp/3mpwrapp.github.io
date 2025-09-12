import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { Alert } from "react-native";

async function copyToClipboard(text: string) {
  try {
    const mod = await import("expo-clipboard");
    await mod.setStringAsync(text);
  } catch (e) {
    Alert.alert(
      "Clipboard unavailable",
      "Copy failed because the dev client doesn’t include expo-clipboard. Rebuild the native app or open in Expo Go."
    );
  }
}

export default function FinancialSafetyNetNavigator() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Financial Safety Net Navigator");
  useFocusOnRefOnMount(titleRef);

  const [step, setStep] = React.useState(1);
  const [employed, setEmployed] = React.useState<"yes" | "no" | "casual" | "unknown">("unknown");
  const [workRelated, setWorkRelated] = React.useState<"yes" | "no" | "unknown">("unknown");
  const [province, setProvince] = React.useState<string>("");
  const [lastDay, setLastDay] = React.useState<string>("");
  const [hasBenefits, setHasBenefits] = React.useState<string>("");
  const [summary, setSummary] = React.useState<string>("");

  const parseDate = (s: string) => {
    const m = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(s);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d.getTime()) ? null : d;
  };
  const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86400000);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const computePlan = () => {
    const parts: string[] = [];
    const last = parseDate(lastDay);
    const bullets: string[] = [];
    if (workRelated === "yes") {
      bullets.push("File Workers’ Compensation claim immediately (work-related injury/illness).");
    } else if (workRelated === "no") {
      bullets.push("Consider EI Sickness for up to 26 weeks.");
    } else {
      bullets.push("Clarify if the condition is work-related; this affects first coverage.");
    }
    bullets.push("Evaluate CPP‑Disability if prolonged/severe disability is expected.");
    bullets.push("Check provincial disability supports (e.g., ODSP/AISH/SAID) for longer-term help.");
    if (hasBenefits.trim()) bullets.push(`Already receiving: ${hasBenefits}. Confirm how offsets apply.`);

    const dates: string[] = [];
    if (last) {
      const eiEnd = addDays(last, 26 * 7);
      dates.push(`EI Sickness potential end: ${fmt(eiEnd)}`);
      const wlReport = addDays(last, 3);
      dates.push(`Workers’ Comp incident reporting window target: ${fmt(wlReport)} (check province).`);
    }
    if (province) bullets.push(`Province: ${province} — verify local rules.`);

    parts.push("Recommended path:");
    parts.push(...bullets.map((b) => `• ${b}`));
    if (dates.length) {
      parts.push("Key dates:");
      parts.push(...dates.map((d) => `• ${d}`));
    }
    const out = parts.join("\n");
    setSummary(out);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Financial Safety Net Navigator
      </Text>
      <Text style={styles.subtitle}>
        Step-by-step guidance to combine Workers’ Comp, CPP‑D, ODSP/provincial supports, and EI without overlap penalties.
        This is a planning tool — verify specifics with official program rules.
      </Text>

      {step === 1 && (
        <Step n={1} title="Your situation">
          <Text style={styles.text}>Employment status</Text>
          <RowChips value={employed} onChange={setEmployed} options={["yes", "no", "casual", "unknown"]} />
          <Text style={styles.text}>Is it work-related?</Text>
          <RowChips value={workRelated} onChange={setWorkRelated} options={["yes", "no", "unknown"]} />
          <Text style={styles.text}>Province/Territory (e.g., ON, BC)</Text>
          <TextInput value={province} onChangeText={setProvince} placeholder="ON" style={styles.input} autoCapitalize="characters" />
          <Text style={styles.text}>Last day worked (YYYY-MM-DD)</Text>
          <TextInput value={lastDay} onChangeText={setLastDay} placeholder="2025-09-01" style={styles.input} />
          <Text style={styles.text}>Currently receiving benefits (optional)</Text>
          <TextInput value={hasBenefits} onChangeText={setHasBenefits} placeholder="e.g., EI Sickness" style={styles.input} />
          <NavButtons onNext={() => setStep(2)} />
        </Step>
      )}

      {step === 2 && (
        <Step n={2} title="Plan & dates">
          <Text style={styles.text}>We’ll draft a suggested order and dates from your info.</Text>
          <Pressable onPress={computePlan} accessibilityRole="button" accessibilityLabel="Compute plan" style={styles.cta}>
            <Text style={styles.ctaText}>Compute Plan</Text>
          </Pressable>
          {!!summary && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.text, { fontWeight: "700" }]}>Draft plan</Text>
              <Text style={styles.text}>{summary}</Text>
              <View style={{ height: 8 }} />
              <Pressable onPress={() => copyToClipboard(summary)} accessibilityRole="button" accessibilityLabel="Copy to clipboard" style={styles.secondary}>
                <Text style={{ color: palette.text, fontWeight: "700" }}>Copy to clipboard</Text>
              </Pressable>
            </View>
          )}
          <NavButtons onBack={() => setStep(1)} />
        </Step>
      )}
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
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 6,
      color: palette.text,
      marginBottom: 8,
    },
    cta: {
      backgroundColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    ctaText: { color: palette.onPrimary, fontWeight: "700" },
    secondary: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      alignItems: "center",
    },
  });
}

function RowChips({ value, onChange, options }: { value: string; onChange: (v: any) => void; options: string[] }) {
  const palette = useAppPalette();
  return (
    <View style={{ flexDirection: "row", gap: 8, marginVertical: 6, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt as any)}
            style={{
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: palette.muted,
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 14,
              backgroundColor: active ? palette.primary : "transparent",
            }}
          >
            <Text style={{ color: active ? palette.onPrimary : palette.text }}>{opt.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function NavButtons({ onBack, onNext }: { onBack?: () => void; onNext?: () => void }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
      {onBack && (
        <Pressable accessibilityRole="button" onPress={onBack} style={{ paddingVertical: 10, paddingHorizontal: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#aaa", borderRadius: 8 }}>
          <Text>Back</Text>
        </Pressable>
      )}
      {onNext && (
        <Pressable accessibilityRole="button" onPress={onNext} style={{ paddingVertical: 10, paddingHorizontal: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#aaa", borderRadius: 8 }}>
          <Text>Next</Text>
        </Pressable>
      )}
    </View>
  );
}
