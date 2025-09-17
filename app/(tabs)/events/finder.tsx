import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { events } from '../../../data/events';
import { useAppPalette } from '../../../theme/usePalette';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { Link } from 'expo-router';

export const options = { href: null };

export default function AccessibleEventFinder() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Accessible Event Finder');
  useFocusOnRefOnMount(titleRef);
  const [asl, setAsl] = React.useState(false);
  const [captions, setCaptions] = React.useState(false);
  const [stepFree, setStepFree] = React.useState(false);
  const [sensory, setSensory] = React.useState(false);
  const filtered = events.filter(e => (!asl || e.asl) && (!captions || e.captions) && (!stepFree || e.stepFree) && (!sensory || e.sensorySpace));
  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Accessible Event Finder</Text>
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 8 }}>
        <Pressable onPress={()=>setAsl(v=>!v)} style={[s.chip, asl && s.chipActive]}><Text style={{ color: asl? palette.onPrimary: palette.text, fontWeight:'700' }}>ASL</Text></Pressable>
        <Pressable onPress={()=>setCaptions(v=>!v)} style={[s.chip, captions && s.chipActive]}><Text style={{ color: captions? palette.onPrimary: palette.text, fontWeight:'700' }}>Captions</Text></Pressable>
        <Pressable onPress={()=>setStepFree(v=>!v)} style={[s.chip, stepFree && s.chipActive]}><Text style={{ color: stepFree? palette.onPrimary: palette.text, fontWeight:'700' }}>Step-free</Text></Pressable>
        <Pressable onPress={()=>setSensory(v=>!v)} style={[s.chip, sensory && s.chipActive]}><Text style={{ color: sensory? palette.onPrimary: palette.text, fontWeight:'700' }}>Sensory</Text></Pressable>
      </View>
      {filtered.map(e => (
        <View key={e.id} style={s.card}>
          <Text style={s.cardTitle}>{e.title} • {new Date(e.date).toLocaleString()}</Text>
          <Text style={s.cardText}>{e.isVirtual? 'Online': (e.location || '')}</Text>
          <Link href={`/(tabs)/events/${e.id}`} asChild>
            <Pressable style={s.btn}><Text style={s.btnText}>Details</Text></Pressable>
          </Link>
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

