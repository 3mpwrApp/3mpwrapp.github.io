import React from "react";
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

let AsyncStorage: any;
try { AsyncStorage = require("@react-native-async-storage/async-storage").default; } catch {}

export const options = { href: null };

function usePoints() {
  const [points, setPoints] = React.useState(0);
  React.useEffect(() => { (async () => { const raw = await AsyncStorage?.getItem?.('rehab_points'); if (raw) setPoints(Number(raw)||0); })(); }, []);
  React.useEffect(() => { AsyncStorage?.setItem?.('rehab_points', String(points)); }, [points]);
  return { points, add: (n: number) => setPoints((p)=>p+n), reset: () => setPoints(0) };
}

export default function RehabGames() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Virtual Rehab Games');
  useFocusOnRefOnMount(titleRef);
  const { points, add, reset } = usePoints();

  const [taps, setTaps] = React.useState(0);
  const [breaths, setBreaths] = React.useState(0);
  const [round, setRound] = React.useState(0);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Virtual Rehab Games</Text>
      <Text style={s.subtitle}>Fun, accessible mini‑games to encourage gentle movement and physio‑style exercises. Always adapt to comfort and stop if pain increases.</Text>
      <Text style={s.points}>Points: {points}</Text>

      <View style={s.card}>
        <Text style={s.cardTitle}>Reach & Tap</Text>
        <Text style={s.cardText}>Gently raise your arm and tap the button. Aim for 10 slow taps.</Text>
        <Text style={s.cardText}>Taps: {taps}</Text>
        <Pressable onPress={() => { const np = taps+1; setTaps(np); add(1); if (np === 10) Alert.alert('Great job','You completed 10 taps!'); }} accessibilityRole="button" style={s.button}><Text style={s.buttonText}>Tap</Text></Pressable>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Breath Pacing</Text>
        <Text style={s.cardText}>Box breathing: inhale 4, hold 4, exhale 4, hold 4. Do 3 cycles.</Text>
        <Text style={s.cardText}>Cycles: {breaths}</Text>
        <Pressable onPress={() => { const nb = breaths+1; setBreaths(nb); add(2); if (nb === 3) Alert.alert('Nice pacing','Three breathing cycles complete.'); }} accessibilityRole="button" style={s.button}><Text style={s.buttonText}>Complete cycle</Text></Pressable>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Gentle Sit‑to‑Stand</Text>
        <Text style={s.cardText}>Stand up from a chair slowly and sit back down. 5 repetitions. Use supports as needed.</Text>
        <Text style={s.cardText}>Round: {round}/5</Text>
        <Pressable onPress={() => { if (round<5) { const nr = round+1; setRound(nr); add(3); if (nr===5) Alert.alert('Milestone','Completed 5 sit‑to‑stand reps!'); } }} accessibilityRole="button" style={s.button}><Text style={s.buttonText}>Mark rep</Text></Pressable>
      </View>

      <Pressable onPress={() => { reset(); setTaps(0); setBreaths(0); setRound(0); }} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={[s.buttonText,{ color: palette.text }]}>Reset</Text></Pressable>
      <Text style={[s.tip,{ marginTop: 8 }]}>Tip: Celebrate small wins. Consistency beats intensity.</Text>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    points: { color: palette.text, fontWeight: '700', marginBottom: 8 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, backgroundColor: palette.surface, marginBottom: 10 },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 4 },
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 6 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
    tip: { color: palette.text, opacity: 0.9 },
  });
}
