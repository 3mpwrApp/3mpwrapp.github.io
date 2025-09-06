import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";

let AsyncStorage: any;
try { AsyncStorage = require("@react-native-async-storage/async-storage").default; } catch {}

export const options = { href: null };

export default function Achievements() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Achievements');
  useFocusOnRefOnMount(titleRef);
  const { t } = useTranslation();
  const [flags, setFlags] = React.useState<Record<string, boolean>>({});
  const [points, setPoints] = React.useState(0);

  React.useEffect(() => {
    (async () => {
      try {
        const keys = ['rehab_points','achieve_first_steps','achieve_calm_breather','achieve_chair_hero'];
        const vals = await AsyncStorage?.multiGet?.(keys);
        const map: Record<string, boolean> = {};
        vals?.forEach(([k,v]: any) => {
          if (k==='rehab_points') setPoints(Number(v)||0);
          else map[k] = v === '1';
        });
        if (points >= 50) map['achieve_consistency'] = true;
        setFlags(map);
      } catch {}
    })();
  }, [points]);

  const items = [
    { id: 'achieve_first_steps', title: 'First Steps', desc: 'Complete 10 reach & tap reps' },
    { id: 'achieve_calm_breather', title: 'Calm Breather', desc: 'Finish 3 breathing cycles' },
    { id: 'achieve_chair_hero', title: 'Chair Hero', desc: 'Do 5 sit‑to‑stand reps' },
    { id: 'achieve_consistency', title: 'Consistency', desc: 'Reach 50 total points' },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('wellness.achievements.title','Achievements')}</Text>
      <Text style={s.subtitle}>{t('wellness.achievements.subtitle','Earn badges as you build healthy routines.')}</Text>
      <Text style={s.points}>Points: {points}</Text>
      {items.map(it => (
        <View key={it.id} style={[s.card, !flags[it.id] && { opacity: 0.5 }]}>
          <Text style={s.cardTitle}>{flags[it.id] ? '🏅 ' : '🔲 '} {it.title}</Text>
          <Text style={s.cardText}>{it.desc}</Text>
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
    points: { color: palette.text, fontWeight: '700', marginBottom: 8 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, backgroundColor: palette.surface, marginBottom: 10 },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 4 },
    cardText: { color: palette.text, opacity: 0.95 },
  });
}

