import React from "react";
import { ScrollView, View, Text, StyleSheet, Alert, TextInput } from "react-native";
import A11yPressable from "../../../components/A11yPressable";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
 

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

async function pasteFromClipboard(): Promise<string> {
  try {
    const mod = await import("expo-clipboard");
    return await mod.getStringAsync();
  } catch (e) {
    Alert.alert(
      "Clipboard unavailable",
      "Paste failed because the dev client doesn’t include expo-clipboard. Rebuild the native app or open in Expo Go."
    );
    return "";
  }
}

export default function AIDecisionSimplifier() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("AI Decision Simplifier");
  useFocusOnRefOnMount(titleRef);
  const [text, setText] = React.useState("");
  const [summary, setSummary] = React.useState("");

  React.useEffect(() => {
    if (!text.trim()) {
      setSummary("");
      return;
    }
    const lines: string[] = [];
    // Basic detection of appeal windows and dates
    const dateRE = /(20\d{2})[-\/.](\d{1,2})[-\/.](\d{1,2})/g;
    const dates: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = dateRE.exec(text))) {
      const y = m[1], mo = m[2].padStart(2, "0"), d = m[3].padStart(2, "0");
      dates.push(`${y}-${mo}-${d}`);
    }
    const hasAppeal = /appeal|reconsideration|review/i.test(text);
    const daysMatch = /(\d{1,2})\s*(calendar|business)?\s*day/i.exec(text);
    if (hasAppeal) {
      lines.push("This appears to be a decision with a possible right to appeal or reconsideration.");
    }
    if (daysMatch) {
      lines.push(`Look for an appeal window of about ${daysMatch[1]} ${daysMatch[2] ?? "days"}.`);
    }
    if (dates.length) {
      lines.push("Detected dates:");
      dates.slice(0, 5).forEach((d) => lines.push(`• ${d}`));
    }
    lines.push("Next steps (general):\n• Note any appeal deadline in your Case Timeline\n• Gather supporting medical documents\n• Consider a short reconsideration letter if errors exist");
    setSummary(lines.join("\n"));
  }, [text]);

  const onPick = async () => {
    try {
      const mod = await import("expo-document-picker");
      const result = await mod.getDocumentAsync({ type: ["application/pdf", "image/*"], multiple: false });
      if (result.canceled) return;
      const file = result.assets?.[0];
      Alert.alert("Uploaded", `Selected: ${file?.name ?? "document"}.\nSummary coming soon.`);
    } catch (e: any) {
      Alert.alert("Unavailable", "Document picker not available. Try reinstalling the dev client.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        AI Decision Simplifier
      </Text>
      <Text style={styles.subtitle}>
        Upload a decision letter to get a plain-language summary of what it means, the next steps, and deadlines.
        Your document stays on your device unless you explicitly opt in to share.
      </Text>
      <A11yPressable onPress={onPick} accessibilityLabel="Upload decision letter" style={styles.cta}>
        <Text style={styles.ctaText}>Upload Decision Letter</Text>
      </A11yPressable>
      <Text style={{ color: palette.text, opacity: 0.8, marginTop: 8 }}>
        Or paste the text of a decision letter below for a quick, plain-language summary preview.
      </Text>

      <Text style={[styles.subtitle, { marginTop: 8 }]}>Paste decision text</Text>
      <TextInput
        style={styles.input}
        placeholder="Paste decision text here"
        multiline
        numberOfLines={6}
        onChangeText={(t) => setText(t)}
      />
      <A11yPressable onPress={() => pasteFromClipboard().then(setText)} style={styles.secondary}>
        <Text style={{ color: palette.text, fontWeight: "700" }}>Paste from clipboard</Text>
      </A11yPressable>

      {!!summary && (
        <View style={{ marginTop: 12 }}>
          <Text style={[styles.subtitle, { fontWeight: "700" }]}>Summary & deadlines</Text>
          <Text style={{ color: palette.text }}>{summary}</Text>
          <View style={{ height: 8 }} />
          <A11yPressable onPress={() => copyToClipboard(summary)} style={styles.secondary}>
            <Text style={{ color: palette.text, fontWeight: "700" }}>Copy summary</Text>
          </A11yPressable>
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text, marginBottom: 6 },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 12 },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      padding: 10,
      borderRadius: 8,
      color: palette.text,
      minHeight: 120,
    },
    cta: {
      backgroundColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 8,
    },
    ctaText: { color: palette.onPrimary, fontWeight: "700" },
    secondary: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 8,
    },
  });
}
