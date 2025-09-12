import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { exercises } from '../../../data/exercises';
import { fetchExercisePlaylist } from '../../../services/youtube';
import { useAppPalette } from '../../../theme/usePalette';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';

export const options = { href: null };

export default function ExerciseHub() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Accessible Exercise Hub');
  useFocusOnRefOnMount(titleRef);
  const [aud, setAud] = React.useState<'all'|'wheelchair'|'limited-mobility'|'sensory-friendly'>('all');
  const [remote, setRemote] = React.useState([] as { id: string; title: string; url: string }[]);
  React.useEffect(() => {
    (async () => {
      try {
        const q = aud==='wheelchair'? 'wheelchair exercise': aud==='limited-mobility'? 'chair exercise': 'sensory friendly stretching';
        const vids = await fetchExercisePlaylist(q, 6);
        setRemote(vids);
      } catch { setRemote([]); }
    })();
  }, [aud]);
  const filtered = exercises.filter(e => aud==='all' || e.audience===aud);
  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Accessible Exercise Hub</Text>
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 8 }}>
        {(['all','wheelchair','limited-mobility','sensory-friendly'] as const).map(k => (
          <Pressable key={k} onPress={()=>setAud(k)} style={[s.chip, aud===k && s.chipActive]}><Text style={{ color: aud===k? palette.onPrimary: palette.text, fontWeight:'700' }}>{k}</Text></Pressable>
        ))}
      </View>
      {(remote.length? remote: filtered).map((e: any) => (
        <View key={e.id} style={s.card}>
          <Text style={s.cardTitle}>{e.title} • {e.minutes} min</Text>
          <Pressable onPress={()=>Linking.openURL(e.url)} style={s.btn}><Text style={s.btnText}>Open Video</Text></Pressable>
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
    btn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf:'flex-start' },
    btnText: { color: palette.text, fontWeight: '700' },
  });
}
