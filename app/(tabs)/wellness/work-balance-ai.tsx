import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import DisclaimerBanner from "../../../components/DisclaimerBanner";
import GapView from "../../../components/GapView";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { getCachedJSON } from "../../../services/cache";
import { useAppPalette } from "../../../theme/usePalette";

type Mood = "low" | "ok" | "high";

export const options = { href: null };

export default function WorkBalanceAI() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Wellness + Work Balance AI");
  useFocusOnRefOnMount(titleRef);

  const [mood, setMood] = React.useState<Mood>("ok");
  const [notes, setNotes] = React.useState("");
  const [plan, setPlan] = React.useState<string>("");

  const generate = async () => {
    const sym = (await getCachedJSON<any[]>("wellness_symptom_entries")) || [];
    const slp = (await getCachedJSON<any[]>("wellness_sleep_entries")) || [];
    const lastPain = parseFloat(sym[0]?.pain || "0");
    const avgSleep = (() => {
      const hours = slp
        .slice(0, 7)
        .map((e) => parseFloat(e.sleepHours || "0"))
        .filter((n) => !isNaN(n));
      return hours.length ? hours.reduce((a, b) => a + b, 0) / hours.length : 0;
    })();
    const fatigue = slp[0] ? parseFloat(slp[0].energy || "0") : 3;
    const parts: string[] = [];
    parts.push("TodayÃ¢â‚¬â„¢s balance plan:");
    // Heuristics
    if (lastPain >= 7 || avgSleep < 5 || fatigue <= 2 || mood === "low") {
      parts.push(
        "- Prioritize REST blocks (20Ã¢â‚¬â€œ30 min) every 2Ã¢â‚¬â€œ3 hours.",
      );
      parts.push("- Keep work to lowÃ¢â‚¬â€˜cognitive tasks if needed.");
    } else if (lastPain >= 4 || avgSleep < 6 || fatigue <= 3 || mood === "ok") {
      parts.push("- Alternate 50 min work / 10 min rest (pacing).");
      parts.push("- One focused admin or work task in the morning.");
    } else {
      parts.push("- Two focused work blocks (morning/early afternoon).");
      parts.push("- Insert brief mobility or breath breaks.");
    }
    if (sym.length >= 3 && lastPain >= 6) {
      parts.push(
        "- Consider ADVOCACY: log a symptom flare and request accommodations if needed.",
      );
    }
    parts.push(
      "- SelfÃ¢â‚¬â€˜check at midday: if pain rises >2 points, reduce workload.",
    );
    if (notes.trim()) parts.push(`- Personal note: ${notes.trim()}`);
    setPlan(parts.join("\n"));
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Wellness + Work Balance AI
      </Text>
      <DisclaimerBanner type="medical" compact />
      <DisclaimerBanner type="ai" compact />
      <Text style={s.subtitle}>
        Tracks pain, sleep/energy, and mood to suggest when to rest, when to
        work, and when to advocate.
      </Text>
      <Text style={s.label}>Mood</Text>
      <GapView style={{ flexDirection: "row", marginBottom: 8 }} gap={8}>
        {(["low", "ok", "high"] as Mood[]).map((m) => (
          <A11yPressable
            key={m}
            onPress={() => setMood(m)}
            style={[s.chip, mood === m && s.chipActive]}
          >
            <Text style={[s.chipText, mood === m && s.chipTextActive]}>
              {m}
            </Text>
          </A11yPressable>
        ))}
      </GapView>
      <Text style={s.label}>Notes (optional)</Text>
      <TextInput
        style={s.input}
        value={notes}
        onChangeText={setNotes}
        placeholder="Important errands, appointments, deadlines"
      />
      <A11yPressable onPress={generate} style={s.button}>
        <Text style={s.buttonText}>Plan my day</Text>
      </A11yPressable>
      {!!plan && (
        <View style={s.box}>
          <Text style={{ color: palette.text }}>{plan}</Text>
          <View style={{ height: 8 }} />
          <A11yPressable
            onPress={async () => {
              try {
                const mod = await import("expo-clipboard");
                await mod.setStringAsync(plan);
                Alert.alert("Copied", "Plan copied to clipboard.");
              } catch {}
            }}
            style={s.button}
          >
            <Text style={s.buttonText}>Copy</Text>
          </A11yPressable>
        </View>
      )}
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
    chip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary, fontWeight: "700" },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    box: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      marginTop: 12,
    },
  });
}
