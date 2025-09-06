import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { llmSimplify } from "../../../services/llm";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export const options = { href: null };

function simplify(text: string): string {
  const rules: [RegExp, string][] = [
    [/herewith|herein|thereof|aforementioned/gi, ''],
    [/pursuant to/gi, 'under'],
    [/notwithstanding/gi, 'despite'],
    [/shall/gi, 'will'],
    [/in the event that/gi, 'if'],
  ];
  let out = text;
  rules.forEach(([re, rep]) => { out = out.replace(re, rep); });
  // short sentences
  out = out.replace(/([.;:])(\s+)/g, '$1\n');
  return out.trim();
}

export default function AiAdvocateTranslator() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('AI Advocate Translator');
  useFocusOnRefOnMount(titleRef);
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>AI Advocate Translator</Text>
      <Text style={s.subtitle}>Paste a bureaucratic letter to simplify into plain language. ASL video summary requires server integration.</Text>
      <TextInput style={[s.input,{ minHeight: 120 }]} value={input} onChangeText={setInput} placeholder="Paste text here" multiline />
      <Pressable onPress={async () => { const remote = await llmSimplify(input); setOutput(remote ?? simplify(input)); }} style={s.button}><Text style={s.buttonText}>Simplify</Text></Pressable>
      {!!output && <View style={s.card}><Text style={{ color: palette.text }}>{output}</Text></View>}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    input: { borderWidth: 1, borderColor: palette.muted, borderRadius: 8, padding: 10, color: palette.text, marginBottom: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, backgroundColor: palette.surface, marginTop: 8 },
  });
}
