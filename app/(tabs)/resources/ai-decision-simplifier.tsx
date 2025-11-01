import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import DisclaimerBanner from "../../../components/DisclaimerBanner";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useAppPalette } from "../../../theme/usePalette";
 

async function copyToClipboard(text: string) {
  try {
    const mod = await import("expo-clipboard");
    await mod.setStringAsync(text);
  } catch {
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
  } catch {
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
      const name = file?.name ?? 'document';
      const base = `You selected ${name}. This appears to be a decision or related evidence. Look for:\n• Decision date and issue\n• Outcome (approved/denied/partial)\n• Appeal or reconsideration instructions (and deadline)`;
      setSummary(base + "\n\nNext steps:\n• Log key dates in Case Timeline\n• Add the file to Evidence Locker\n• Consider a short reconsideration/appeal letter if errors exist");
      // Offer quick insert to Evidence Locker
      try {
        let AsyncStorage: any; try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}
        const note = { id: String(Date.now()), text: name, date: new Date().toISOString(), tags: ['decision','document'], files: [{ name, uri: file?.uri }] } as any;
        const raw = (await AsyncStorage?.getItem?.('evidence:notes:v1')) || '[]';
        const arr = JSON.parse(raw); arr.unshift(note);
        await AsyncStorage?.setItem?.('evidence:notes:v1', JSON.stringify(arr));
      } catch {}
  } catch {
      Alert.alert("Unavailable", "Document picker not available. Try reinstalling the dev client.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        AI Decision Simplifier
      </Text>
      <DisclaimerBanner type="legal" compact={true} />
      <DisclaimerBanner type="ai" compact={true} />
      <Text style={styles.subtitle}>
        Upload a decision letter to get a plain-language summary of what it means, the next steps, and deadlines.
        Your document stays on your device unless you explicitly opt in to share.
      </Text>
      <A11yPressable onPress={onPick} accessibilityLabel="Upload decision letter" style={styles.cta}>
          <View style={[styles.card, { backgroundColor: palette.surface, borderRadius: 10, marginBottom: 12 }]}> 
            <Text style={[styles.title, { color: palette.primary }]}>How to Use AI Decision Simplifier</Text>
            <Text style={styles.previewText}>
              Paste or upload a decision letter. The tool will highlight key dates, deadlines, and next steps for appeals or reconsideration. Use the summary to update your Case Timeline or prepare an appeal.
            </Text>
          </View>
      </A11yPressable>
          <Text
            ref={titleRef}
            accessibilityRole="header"
            style={styles.title}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            accessibilityLabel="AI Decision Simplifier screen"
          >
            AI Decision Simplifier
          </Text>
          <Text style={styles.subtitle}>
            Paste or upload a decision letter to get a simplified summary and next steps.
          </Text>
      <TextInput
        style={styles.input}
        placeholder="Paste decision text here"
        multiline={true}
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
    card: {
      padding: 16,
      elevation: 2, // native
      boxShadow: '0 2px 4px rgba(0,0,0,0.12)', // web
    },
    previewText: {
      color: palette.text,
      opacity: 0.85,
      fontSize: 16,
      marginTop: 8,
      marginBottom: 4,
    },
  });
}
