import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";



const EXAMPLES = [
  { title: 'Accommodation Request (Sample)', body: 'Re: Workplace Accommodation Request\n\nDear Employer,\n\nI am requesting reasonable accommodations...' },
  { title: 'Appeal Letter (Sample)', body: 'Re: Appeal of Decision (Claim [number])\n\nDear Appeals Officer,\n\nI am appealing the decision dated [date]...' },
  { title: 'Reconsideration Letter (Sample)', body: 'Re: Request for Reconsideration (Claim [ID])\n\nDear Claims Officer,\n\nI am requesting reconsideration...' },
  { title: 'Union Request (Sample)', body: 'Re: Request for Union Support and Representation\n\nDear Union Representative/Steward,\n\nMy name is [Your Name], employed as...' },
];

export const options = { href: null };

export default function TemplatesGallery() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Template Gallery');
  useFocusOnRefOnMount(titleRef);

  const copy = async (text: string) => {
    try { const mod = await import('expo-clipboard'); await mod.setStringAsync(text); } catch {}
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Template Gallery</Text>
      <Text style={s.subtitle}>Example outputs to help you get started.</Text>
      {EXAMPLES.map((ex) => (
        <View key={ex.title} style={s.card}>
          <Text style={s.cardTitle}>{ex.title}</Text>
          <Text style={s.cardText}>{ex.body}</Text>
          <Pressable onPress={() => copy(ex.body)} style={s.button}><Text style={s.buttonText}>Copy example</Text></Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
  });
}

