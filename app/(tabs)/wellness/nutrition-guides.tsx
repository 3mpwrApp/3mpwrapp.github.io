import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { recipes } from '../../../data/recipes';
import { useAppPalette } from '../../../theme/usePalette';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';

export const options = { href: null };

export default function NutritionGuides() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Diet & Nutrition Guides');
  useFocusOnRefOnMount(titleRef);
  const [tag, setTag] = React.useState('all');
  const tags = Array.from(new Set(recipes.flatMap(r=>r.tags)));
  const filtered = recipes.filter(r => tag==='all' || r.tags.includes(tag));
  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Diet & Nutrition Guides</Text>
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 8 }}>
        <Pressable onPress={()=>setTag('all')} style={[s.chip, tag==='all' && s.chipActive]}><Text style={{ color: tag==='all'? palette.onPrimary: palette.text, fontWeight:'700' }}>all</Text></Pressable>
        {tags.map(t => (
          <Pressable key={t} onPress={()=>setTag(t)} style={[s.chip, tag===t && s.chipActive]}><Text style={{ color: tag===t? palette.onPrimary: palette.text, fontWeight:'700' }}>{t}</Text></Pressable>
        ))}
      </View>
      {filtered.map(r => (
        <View key={r.id} style={s.card}>
          <Text style={s.cardTitle}>{r.title}</Text>
          <Text style={s.cardText}>Tags: {r.tags.join(', ')}</Text>
          {!!r.notes && <Text style={s.cardText}>{r.notes}</Text>}
          {!!r.url && <Pressable style={s.btn}><Text style={s.btnText}>Open</Text></Pressable>}
        </View>
      ))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 6 },
    btn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf:'flex-start' },
    btnText: { color: palette.text, fontWeight: '700' },
  });
}

