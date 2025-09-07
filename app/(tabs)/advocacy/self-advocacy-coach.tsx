import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";



const LESSONS = [
  { id: 'conf-1', title: 'Confidence Basics', bullets: ['Breathe low and slow (4-4-4-4)', 'Stand/sit grounded; soften shoulders', 'Prepare one sentence purpose statement'] },
  { id: 'speak-1', title: 'Speak Clearly', bullets: ['Short sentences; one point at a time', 'Ask to repeat/clarify questions', 'Pause before answering'] },
  { id: 'assert-1', title: 'Assertiveness in Medical/Work', bullets: ['Name your need: Ã¢â‚¬Å“I needÃ¢â‚¬Â¦Ã¢â‚¬Â', 'Explain impact briefly', 'Offer options, ask for collaboration'] },
  { id: 'docs-1', title: 'Documentation', bullets: ['Summarize call/meeting in email', 'Attach key evidence only', 'Track dates and deadlines'] },
];

export const options = { href: null };

export default function SelfAdvocacyCoach() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('SelfÃ¢â‚¬â€˜Advocacy Coach');
  useFocusOnRefOnMount(titleRef);

  const [active, setActive] = React.useState<string | null>(LESSONS[0].id);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>SelfÃ¢â‚¬â€˜Advocacy Coach</Text>
      <Text style={s.subtitle}>MicroÃ¢â‚¬â€˜lessons for confidence, public speaking, and assertiveness.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {LESSONS.map(l => (
          <Pressable key={l.id} onPress={() => setActive(l.id)} style={[s.chip, active===l.id && s.chipActive]} accessibilityRole="button">
            <Text style={[s.chipText, active===l.id && s.chipTextActive]}>{l.title}</Text>
          </Pressable>
        ))}
      </View>
      {LESSONS.filter(l=>l.id===active).map(l => (
        <View key={l.id} style={s.card}>
          <Text style={s.cardTitle}>{l.title}</Text>
          {l.bullets.map((b,i)=>(<Text key={i} style={s.cardText}>Ã¢â‚¬Â¢ {b}</Text>))}
        </View>
      ))}
      <Text style={[s.subtitle,{ marginTop: 12 }]}>Practice prompt: Explain your need in one sentence. Example: Ã¢â‚¬Å“I need a 10Ã¢â‚¬â€˜minute break every hour due to pain.Ã¢â‚¬Â</Text>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9 },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary, fontWeight: '700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, backgroundColor: palette.surface, marginTop: 8 },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95 },
  });
}

