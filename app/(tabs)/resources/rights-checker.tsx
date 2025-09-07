import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";

type Answer = "yes" | "no" | null;

export const options = { href: null };

export default function RightsChecker() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Automated Rights Checker");
  useFocusOnRefOnMount(titleRef);

  const [q1, setQ1] = React.useState<Answer>(null); // employed
  const [q2, setQ2] = React.useState<Answer>(null); // union
  const [q3, setQ3] = React.useState<Answer>(null); // disability
  const [q4, setQ4] = React.useState<Answer>(null); // denied benefits
  const [q5, setQ5] = React.useState<Answer>(null); // harassment

  const ready = [q1, q2, q3, q4, q5].every((x) => x !== null);

  const summary = React.useMemo(() => {
    if (!ready) return null;
    const lines: string[] = [];
    if (q3 === "yes") {
      lines.push(
        "You are protected under human rights law, including the duty to accommodate.",
      );
    }
    if (q1 === "yes") {
      lines.push(
        "You have workplace rights: safety, accommodation, and protection from discrimination.",
      );
      if (q2 === "yes") lines.push("Contact your union for representation.");
      else
        lines.push(
          "If no union, consider contacting a legal clinic or advocacy group.",
        );
    }
    if (q4 === "yes") {
      lines.push(
        "You may be eligible to appeal denied benefits. Gather medical evidence and file within deadlines.",
      );
      lines.push(
        "Use our letter templates in Resources to request reconsideration or appeal.",
      );
    }
    if (q5 === "yes") {
      lines.push(
        "Harassment is prohibited. Document incidents and report via proper channels.",
      );
    }
    if (lines.length === 0) {
      lines.push(
        "Based on your answers, you still maintain general human rights. Consider browsing Resources for guidance.",
      );
    }
    return lines.join("\n\n");
  }, [ready, q1, q2, q3, q4, q5]);

  const Choice = ({
    label,
    value,
    selected,
    onPress,
  }: {
    label: string;
    value: Answer;
    selected: Answer;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.choice, selected === value && styles.choiceActive]}
    >
      <Text
        style={[
          styles.choiceText,
          selected === value && styles.choiceTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Automated Rights Checker
      </Text>
      <Text style={styles.subtitle}>
        Answer a few questions to get a plain-language overview of your rights
        and options.
      </Text>

      <Question title="Are you currently employed?">
        <Choice
          label="Yes"
          value="yes"
          selected={q1}
          onPress={() => setQ1("yes")}
        />
        <Choice
          label="No"
          value="no"
          selected={q1}
          onPress={() => setQ1("no")}
        />
      </Question>
      <Question title="Are you a union member?">
        <Choice
          label="Yes"
          value="yes"
          selected={q2}
          onPress={() => setQ2("yes")}
        />
        <Choice
          label="No"
          value="no"
          selected={q2}
          onPress={() => setQ2("no")}
        />
      </Question>
      <Question title="Do you have a disability or health condition requiring accommodations?">
        <Choice
          label="Yes"
          value="yes"
          selected={q3}
          onPress={() => setQ3("yes")}
        />
        <Choice
          label="No"
          value="no"
          selected={q3}
          onPress={() => setQ3("no")}
        />
      </Question>
      <Question title="Have you been denied benefits (e.g., workers' compensation, LTD)?">
        <Choice
          label="Yes"
          value="yes"
          selected={q4}
          onPress={() => setQ4("yes")}
        />
        <Choice
          label="No"
          value="no"
          selected={q4}
          onPress={() => setQ4("no")}
        />
      </Question>
      <Question title="Are you experiencing harassment or discrimination?">
        <Choice
          label="Yes"
          value="yes"
          selected={q5}
          onPress={() => setQ5("yes")}
        />
        <Choice
          label="No"
          value="no"
          selected={q5}
          onPress={() => setQ5("no")}
        />
      </Question>

      {summary && (
        <View style={styles.box} accessibilityLabel="Summary" accessible>
          <Text style={styles.resultTitle}>Your summary</Text>
          <Text style={styles.result}>{summary}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Copy summary"
            onPress={async () => {
              try {
                const mod = await import("expo-clipboard");
                await mod.setStringAsync(summary);
                Alert.alert("Copied", "Summary copied to clipboard.");
              } catch {
                Alert.alert(
                  "Clipboard not available",
                  "Install expo-clipboard in a dev build to enable copy.",
                );
              }
            }}
            style={{
              marginTop: 8,
              alignSelf: "flex-start",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: palette.primary,
            }}
          >
            <Text style={{ color: palette.onPrimary, fontWeight: "700" }}>
              Copy
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Question({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const palette = useAppPalette();
  const s = StyleSheet.create({
    title: {
      color: palette.text,
      fontWeight: "700",
      marginTop: 10,
      marginBottom: 6,
    },
    row: { flexDirection: "row", gap: 8, marginBottom: 6, flexWrap: "wrap" },
  });
  return (
    <View>
      <Text style={s.title}>{title}</Text>
      <View style={s.row}>{children}</View>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 10 },
    choice: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    choiceActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    choiceText: { color: palette.text },
    choiceTextActive: { color: palette.onPrimary, fontWeight: "700" },
    box: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 10,
      padding: 12,
      marginTop: 12,
    },
    resultTitle: { color: palette.text, fontWeight: "700", marginBottom: 6 },
    result: { color: palette.text, opacity: 0.95 },
  });
}
