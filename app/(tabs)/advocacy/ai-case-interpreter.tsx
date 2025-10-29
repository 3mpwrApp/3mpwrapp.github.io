import React from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import AIDisclaimer from '../../../components/AIDisclaimer';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import OnlineStatusBadge from '../../../components/OnlineStatusBadge';
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { llmInterpret } from "../../../services/llm";
import { useAppPalette } from "../../../theme/usePalette";

function interpret(text: string): { summary: string; next: string[] } {
  const lower = text.toLowerCase();
  const next: string[] = [];
  if (lower.includes("deadline"))
    {next.push("Write down any deadlines and add a calendar reminder.");}
  if (lower.includes("appeal") || lower.includes("reconsideration"))
    {next.push(
      "Use Resources — Letter templates for reconsideration/appeal.",
    );}
  if (lower.includes("medical"))
    {next.push(
      "Gather medical notes focusing on functional limits, not diagnoses.",
    );}
  if (lower.includes("overpayment"))
    {next.push("Consider financial hardship and repayment plan options.");}
  const summary = text.split(/\n|\./).slice(0, 5).join(". ").trim();
  return {
    summary:
      summary || "Summary could not be generated; please provide more context.",
    next: next.length ? next : ["Document details and seek advice if unsure."],
  };
}

export const options = { href: null };

export default function AiCaseInterpreter() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("AI Case Interpreter");
  useFocusOnRefOnMount(titleRef);
  const [input, setInput] = React.useState("");
  const [out, setOut] = React.useState<{ summary: string; next: string[] } | null>(null);
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        AI Case Interpreter
      </Text>
      <OnlineStatusBadge />
      <DisclaimerBanner type="ai" compact />
      <DisclaimerBanner type="legal" compact />
      <Text
        style={[
          s.subtitle,
          { textDecorationLine: "underline", color: palette.primary },
        ]}
        onPress={() =>
          Alert.alert(
            "Tips",
            "Summaries are for guidance only. Confirm deadlines in original documents and seek advice when needed. Avoid sharing personal identifiers in pasted text.",
          )
        }
      >
        Help & tips
      </Text>
      <Text style={s.subtitle}>
        Paste tribunal/insurance/government letter text. Get a
        plain-language summary and next steps. ASL video/easy-read
        requires server integration.
      </Text>
      <TextInput
        style={[s.input, { minHeight: 120 }]}
        value={input}
        onChangeText={setInput}
        placeholder="Paste text here"
        multiline
      />
      <Pressable
        onPress={async () => {
          const remote = await llmInterpret(input);
          setOut(remote ?? interpret(input));
        }}
        style={s.button}
      >
        <Text style={s.buttonText}>Interpret</Text>
      </Pressable>
      {out && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Summary</Text>
          <Text style={s.cardText}>{out.summary}</Text>
          <Text style={[s.cardTitle, { marginTop: 8 }]}>Next steps</Text>
          {out.next.map((n, i) => (
            <Text key={i} style={s.cardText}>
              • {n}
            </Text>
          ))}
          <Pressable
            onPress={() =>
              Share.share({
                message: `${out.summary}\n\nNext steps:\n${out.next.map((n) => "- " + n).join("\n")}`,
                title: "Case Summary",
              }).catch(() => {})
            }
            style={[s.button, { marginTop: 8 }]}
          >
            <Text style={s.buttonText}>Share</Text>
          </Pressable>
          <GapView
            style={{
              flexDirection: "row",
              marginTop: 8,
              flexWrap: "wrap",
            }}
            gap={8}
          >
            <Pressable
              onPress={async () => {
                try {
                  const mod = await import("expo-clipboard");
                  await mod.setStringAsync(
                    `${out.summary}\n\nNext steps:\n${out.next.map((n) => "- " + n).join("\n")}`,
                  );
                  Alert.alert("Copied", "Summary copied.");
                } catch {}
              }}
              style={s.button}
            >
              <Text style={s.buttonText}>Copy</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                try {
                  const mod = await import("expo-print");
                  const text = `${out.summary}\n\nNext steps:\n${out.next.map((n) => "- " + n).join("\n")}`;
                  const html = `<pre style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;\">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
                  const { uri } = await mod.printToFileAsync({ html });
                  await Share.share({ url: uri, title: "Case Summary" });
                } catch {
                  Alert.alert(
                    "PDF not available",
                    "Install expo-print in a dev build.",
                  );
                }
              }}
              style={s.button}
            >
              <Text style={s.buttonText}>PDF</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                try {
                  const FS = await import("expo-file-system");
                  const text = `${out.summary}\n\nNext steps:\n${out.next.map((n) => "- " + n).join("\n")}`;
                  const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre></body></html>`;
                  const path = FS.cacheDirectory + `case_${Date.now()}.doc`;
                  await FS.writeAsStringAsync(path, html, {
                    encoding: FS.EncodingType.UTF8,
                  });
                  await Share.share({
                    url: path,
                    title: "Case Summary (.doc)",
                  });
                } catch {
                  Alert.alert("Export failed", "Could not create .doc file.");
                }
              }}
              style={s.button}
            >
              <Text style={s.buttonText}>DOC</Text>
            </Pressable>
          </GapView>
        </View>
      )}
      <AIDisclaimer />
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
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
  });
}
