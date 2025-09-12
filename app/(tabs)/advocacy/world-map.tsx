import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';

type MapItem = { id: string; title: string; country: string; city?: string; kind: 'law'|'protest'|'update'; lat?: number; lng?: number };
const seed: MapItem[] = [
  { id:'m1', title:'Accessibility Act Update', country:'Canada', city:'Ottawa', kind:'law' },
  { id:'m2', title:'Protest for benefits reform', country:'UK', city:'London', kind:'protest' },
  { id:'m3', title:'Inclusive hiring pilot', country:'Germany', city:'Berlin', kind:'update' },
];

export const options = { href: null };

export default function WorldMap() {
  const palette = useAppPalette();
  const s = styles(palette);
  return (
    <View style={s.container}>
      <Text style={s.title}>World Disability Map</Text>
      <Text style={s.text}>Tap to open each location in Google Maps (sample data).</Text>
      {seed.map(i => (
        <Pressable key={i.id} onPress={()=> require('expo-linking').openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([i.title,i.city,i.country].filter(Boolean).join(' '))}`)} style={s.card}>
          <Text style={s.cardTitle}>{i.title}</Text>
          <Text style={s.cardText}>{[i.city, i.country].filter(Boolean).join(', ')} • {i.kind}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding:16 },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight:'700', marginBottom: 4 },
    cardText: { color: palette.text, opacity: 0.95 },
  });
}

