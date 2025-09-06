import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export const options = { href: null };

export default function AdaptiveMeditation() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Adaptive Meditation & Relaxation");
  useFocusOnRefOnMount(titleRef);

  const play = async (kind: "breath" | "body" | "calm") => {
    try {
      // Optional: add expo-av playback of bundled audio in a dev build
      Alert.alert(
        kind === 'breath' ? 'Breathing' : kind === 'body' ? 'Body Scan' : 'Calm Reset',
        kind === 'breath' ? 'Box breathing: inhale 4, hold 4, exhale 4, hold 4 (x4).' :
        kind === 'body' ? 'Gentle scan toes to head. Stop if discomfort rises.' :
        'Soften eyes, lengthen exhale, relax jaw/shoulders.'
      );
    } catch {}
  };

  return (
    <View style={s.container}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Adaptive Meditation & Relaxation</Text>
      <Text style={s.subtitle}>Gentle guidance for chronic pain and limited mobility.</Text>
      <Pressable onPress={() => play('breath')} style={s.button}><Text style={s.buttonText}>Breathing – 1 min</Text></Pressable>
      <Pressable onPress={() => play('body')} style={[s.button,{ marginTop: 8 }]}><Text style={s.buttonText}>Body Scan – 2 min</Text></Pressable>
      <Pressable onPress={() => play('calm')} style={[s.button,{ marginTop: 8 }]}><Text style={s.buttonText}>Calm Reset – 30 sec</Text></Pressable>
      <Text style={[s.subtitle,{ marginTop: 12 }]}>Note: For full audio programs, curate links in Self‑Care Library.</Text>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
  });
}
