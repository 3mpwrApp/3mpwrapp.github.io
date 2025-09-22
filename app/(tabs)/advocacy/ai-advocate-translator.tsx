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
import OnlineStatusBadge from '../../../components/OnlineStatusBadge';
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { llmSimplify } from "../../../services/llm";
import { useAppPalette } from "../../../theme/usePalette";

function simplify(text: string): string {
  const rules: [RegExp, string][] = [
    [/herewith|herein|thereof|aforementioned/gi, ""],
    [/pursuant to/gi, "under"],
    [/notwithstanding/gi, "despite"],
    [/shall/gi, "will"],
    [/in the event that/gi, "if"],
  ];
  let out = text;
  rules.forEach(([re, rep]) => {
    out = out.replace(re, rep);
  });
  // short sentences
  out = out.replace(/([.;:])(\s+)/g, "$1\n");
  return out.trim();
}

export const options = { href: null };
export default function AiAdvocateTranslator() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("AI Advocate Translator");
  useFocusOnRefOnMount(titleRef);
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        AI Advocate Translator
      </Text>
      <OnlineStatusBadge />
      <Text style={s.subtitle}>
        Paste a bureaucratic letter to simplify into plain language. ASL video
        summary requires server integration.
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
          const remote = await llmSimplify(input);
          setOutput(remote ?? simplify(input));
        }}
        style={s.button}
      >
        <Text style={s.buttonText}>Simplify</Text>
      </Pressable>
      {!!output && (
        <View style={s.card}>
          <Text style={{ color: palette.text }}>{output}</Text>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 8,
              flexWrap: "wrap",
            }}
          >
            <Pressable
              onPress={async () => {
                try {
                  const mod = await import("expo-clipboard");
                  await mod.setStringAsync(output);
                  Alert.alert("Copied", "Summary copied.");
                } catch {}
              }}
              style={s.button}
            >
              <Text style={s.buttonText}>Copy</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                Share.share({
                  message: output,
                  title: "Plain-language Summary",
                }).catch(() => {})
              }
              style={s.button}
            >
              <Text style={s.buttonText}>Share</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                try {
                  const mod = await import("expo-print");
                  const html = `<pre style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;\">${output.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
                  const { uri } = await mod.printToFileAsync({ html });
                  await Share.share({
                    url: uri,
                    title: "Plain-language Summary",
                  });
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
                  const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${output.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre></body></html>`;
                  const path =
                    FS.cacheDirectory + `translator_${Date.now()}.doc`;
                  await FS.writeAsStringAsync(path, html, {
                    encoding: FS.EncodingType.UTF8,
                  });
                  await Share.share({
                    url: path,
                    title: "Plain-language Summary (.doc)",
                  });
                } catch {
                  Alert.alert("Export failed", "Could not create .doc file.");
                }
              }}
              style={s.button}
            >
              <Text style={s.buttonText}>DOC</Text>
            </Pressable>
          </View>
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
  });
}
