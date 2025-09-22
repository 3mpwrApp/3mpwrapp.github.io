import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert } from "react-native";

import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";

const LESSONS = [
  {
    id: "conf-1",
    title: "Confidence Basics",
    bullets: [
      "Breathe low and slow (4-4-4-4)",
      "Stand/sit grounded; soften shoulders",
      "Prepare one sentence purpose statement",
    ],
  },
  {
    id: "speak-1",
    title: "Speak Clearly",
    bullets: [
      "Short sentences; one point at a time",
      "Ask to repeat/clarify questions",
      "Pause before answering",
    ],
  },
  {
    id: "assert-1",
    title: "Assertiveness in Medical/Work",
    bullets: [
  "Name your need: 'I need...'",
      "Explain impact briefly",
      "Offer options, ask for collaboration",
    ],
  },
  {
    id: "docs-1",
    title: "Documentation",
    bullets: [
      "Summarize call/meeting in email",
      "Attach key evidence only",
      "Track dates and deadlines",
    ],
  },
];

export const options = { href: null };

export default function SelfAdvocacyCoach() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Self-Advocacy Coach");
  useFocusOnRefOnMount(titleRef);

  const [active, setActive] = React.useState<string | null>(LESSONS[0].id);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Self-Advocacy Coach
      </Text>
      <Text style={s.subtitle}>
        Micro-lessons for confidence, public speaking, and assertiveness.
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {LESSONS.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => setActive(l.id)}
            style={[s.chip, active === l.id && s.chipActive]}
            accessibilityRole="button"
          >
            <Text style={[s.chipText, active === l.id && s.chipTextActive]}>
              {l.title}
            </Text>
          </Pressable>
        ))}
      </View>
      {LESSONS.filter((l) => l.id === active).map((l) => (
        <View key={l.id} style={s.card}>
          <Text style={s.cardTitle}>{l.title}</Text>
          {l.bullets.map((b, i) => (
            <Text key={i} style={s.cardText}>
              • {b}
            </Text>
          ))}
        </View>
      ))}
      <PracticeCoach />
    </ScrollView>
  );
}

import { aiCoachPrompt } from '../../../services/aiAdvocacy';

function PracticeCoach() {
  const [prompt, setPrompt] = React.useState('Request a 10-minute break each hour due to pain');
  const [output, setOutput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const run = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try { setOutput(await aiCoachPrompt(prompt)); } catch { Alert.alert('Error','Could not generate practice steps.'); } finally { setLoading(false); }
  };
  return (
    <View style={{ marginTop:16 }}>
      <Text style={{ fontWeight:'700', color:'#888', marginBottom:4 }}>Practice Prompt</Text>
      <Text style={{ color:'#888', marginBottom:6 }}>Describe a need or goal. The coach returns structured steps.</Text>
      <TextInput style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, minHeight:70, textAlignVertical:'top' }} multiline value={prompt} onChangeText={setPrompt} accessibilityLabel="Practice prompt input" />
      <Pressable onPress={run} style={{ backgroundColor:'#333', paddingVertical:10, borderRadius:8, alignItems:'center', marginTop:8 }} accessibilityRole="button" accessibilityLabel="Generate practice coaching" disabled={loading}>
        <Text style={{ color:'#fff', fontWeight:'700' }}>{loading ? 'Generating...' : 'Generate Practice'}</Text>
      </Pressable>
      {!!output && (
        <View style={{ marginTop:10 }} accessibilityRole="summary" accessibilityLabel="Practice coaching output">
          {output.split(/\n+/).map((ln,i)=>(<Text key={i} style={{ color:'#444', marginBottom:4 }}>• {ln}</Text>))}
        </View>
      )}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9 },
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
