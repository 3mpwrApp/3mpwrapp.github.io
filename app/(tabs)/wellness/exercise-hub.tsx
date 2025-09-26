import React from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { exercises } from '../../../data/exercises';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { fetchExercisePlaylist } from '../../../services/youtube';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function ExerciseHub() {
  const exportFavorites = async () => {
    try {
      const favList = combined.filter(e => favs.has(e.id));
      const rows = [["title", "minutes", "url"], ...favList.map(e => [e.title, e.minutes, e.url])];
      const csv = rows.map(r => r.map(x => `"${(x || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const FileSystem = await import('expo-file-system');
      const Sharing = await import('expo-sharing');
      const baseDir: any = (FileSystem as any).default?.cacheDirectory || (FileSystem as any).cacheDirectory || (FileSystem as any).default?.documentDirectory;
      if (!baseDir) throw new Error('No writable directory');
      const path = `${baseDir}exercise_favorites_${Date.now()}.csv`;
      await (FileSystem as any).writeAsStringAsync(path, csv, { encoding: (FileSystem as any).EncodingType?.UTF8 });
      if (Sharing?.isAvailableAsync && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Exercise Favorites CSV' });
      } else {
        Alert.alert('Export ready', 'CSV saved to cache directory.');
      }
    } catch {
      Alert.alert("Export failed", "Could not share favorites.");
    }
  };
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Accessible Exercise Hub');
  useFocusOnRefOnMount(titleRef);
  const [aud, setAud] = React.useState<'all'|'wheelchair'|'limited-mobility'|'sensory-friendly'>('all');
  const [remote, setRemote] = React.useState([] as { id: string; title: string; url: string }[]);
  const [favs, setFavs] = React.useState<Set<string>>(new Set());
  const CACHE_KEY = 'exercise.cache.v1';
  const FAVS_KEY = 'exercise.favs.v1';
  React.useEffect(()=>{ (async()=>{ try { const a = require('@react-native-async-storage/async-storage').default; const raw = await a.getItem(FAVS_KEY); if (raw) setFavs(new Set(JSON.parse(raw))); } catch {} })(); },[]);
  const saveFavs = async (next: Set<string>) => { setFavs(new Set(next)); try { const a = require('@react-native-async-storage/async-storage').default; await a.setItem(FAVS_KEY, JSON.stringify(Array.from(next))); } catch {} };
  React.useEffect(() => {
    (async () => {
      try {
        const envQ = aud==='wheelchair' ? process.env.EXPO_PUBLIC_EXERCISE_WHEELCHAIR_QUERY
                    : aud==='limited-mobility' ? process.env.EXPO_PUBLIC_EXERCISE_LIMITED_QUERY
                    : process.env.EXPO_PUBLIC_EXERCISE_SENSORY_QUERY;
        const q = envQ || (aud==='wheelchair'? 'wheelchair exercise': aud==='limited-mobility'? 'chair exercise': 'sensory friendly stretching');
        const vids = await fetchExercisePlaylist(q, Number(process.env.EXPO_PUBLIC_EXERCISE_MAX || 6));
        setRemote(vids);
        try { const a = require('@react-native-async-storage/async-storage').default; const cacheRaw = (await a.getItem(CACHE_KEY)) || '{}'; const cache = JSON.parse(cacheRaw); cache[aud] = vids; await a.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {}
      } catch { 
        try { const a = require('@react-native-async-storage/async-storage').default; const cacheRaw = (await a.getItem(CACHE_KEY)) || '{}'; const cache = JSON.parse(cacheRaw); setRemote(cache[aud] || []); }
        catch { setRemote([]); }
      }
    })();
  }, [aud]);
  const filtered = exercises.filter(e => aud==='all' || e.audience===aud);
  const combined = (remote.length? remote: filtered).map((e:any)=> ({ ...e, id: e.id || e.title }));
  return (
    <View style={s.container}>
      <View style={[s.card, { backgroundColor: palette.surface, borderRadius: 10, marginBottom: 12 }]}> 
        <Text style={[s.cardTitle, { color: palette.primary }]}>How to Use Exercise Hub</Text>
        <Text style={{ color: palette.text, opacity: 0.95 }}>
          Browse accessible exercise videos and guides. Filter by audience, favorite exercises, and export your favorites as a CSV for sharing or tracking. Tap &quot;Open Video&quot; to watch, &quot;☆ Favorite&quot; to save, and &quot;Export Favorites&quot; to share your list.
        </Text>
      </View>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityLabel="Accessible Exercise Hub screen">Accessible Exercise Hub</Text>
      <A11yPressable
        onPress={()=>{ try { const { router } = require('expo-router'); router.push('/(tabs)/wellness/exercise-favorites'); } catch {} }}
        style={[s.btn,{ alignSelf:'flex-start', marginTop: 6 }]
        }
        hitSlop={HIT_SLOP_8}
        accessibilityRole="button"
        accessibilityLabel="Open exercise favorites"
        accessibilityHint="Shows your list of favorited exercises."
      >
        <Text style={s.btnText}>Open Favorites</Text>
      </A11yPressable>
      <A11yPressable
        onPress={exportFavorites}
        style={[s.btn,{ alignSelf:'flex-start', marginTop: 6 }]}
        hitSlop={HIT_SLOP_8}
        accessibilityRole="button"
        accessibilityLabel="Export exercise favorites as CSV"
        accessibilityHint="Exports your favorited exercises as a CSV file for sharing or tracking."
      >
        <Text style={s.btnText}>Export Favorites (CSV)</Text>
      </A11yPressable>
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 8 }}>
        {(['all','wheelchair','limited-mobility','sensory-friendly'] as const).map(k => (
          <A11yPressable
            key={k}
            onPress={()=>setAud(k)}
            style={[s.chip, aud===k && s.chipActive]}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel={`Filter exercises for: ${k}`}
            accessibilityState={{ selected: aud===k }}
          >
            <Text style={{ color: aud===k? palette.onPrimary: palette.text, fontWeight:'700' }}>{k}</Text>
          </A11yPressable>
        ))}
      </View>
      {combined.map((e: any) => (
        <View key={e.id} style={s.card}>
          <Text style={s.cardTitle} accessibilityLabel={`Exercise: ${e.title}, ${e.minutes} minutes`}>{e.title} • {e.minutes} min</Text>
          <A11yPressable
            onPress={()=>Linking.openURL(e.url)}
            style={s.btn}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel={`Open exercise video for ${e.title}`}
          >
            <Text style={s.btnText}>Open Video</Text>
          </A11yPressable>
          <A11yPressable
            onPress={()=>{ const next = new Set(favs); if (next.has(e.id)) next.delete(e.id); else next.add(e.id); saveFavs(next); }}
            style={[s.btn,{ marginLeft: 8 }]}
            hitSlop={HIT_SLOP_8}
            accessibilityRole="button"
            accessibilityLabel={favs.has(e.id)? `Remove ${e.title} from favorites`:`Add ${e.title} to favorites`}
            accessibilityState={{ selected: favs.has(e.id) }}
          >
            <Text style={s.btnText}>{favs.has(e.id)? '★ Favorited':'☆ Favorite'}</Text>
          </A11yPressable>
        </View>
      ))}
      {favs.size>0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Favorites</Text>
          {combined.filter(e=> favs.has(e.id)).map(e=> (
            <View key={`f-${e.id}`} style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop: 6 }}>
              <Text style={{ color: palette.text, flex:1 }}>{e.title}</Text>
              <A11yPressable
                onPress={()=> Linking.openURL(e.url)}
                style={s.btn}
                hitSlop={HIT_SLOP_8}
                accessibilityRole="button"
                accessibilityLabel={`Open favorite exercise video for ${e.title}`}
              >
                <Text style={s.btnText}>Open</Text>
              </A11yPressable>
              <A11yPressable
                onPress={()=>{ const next = new Set(favs); next.delete(e.id); saveFavs(next); }}
                style={[s.btn,{ marginLeft: 6 }]}
                hitSlop={HIT_SLOP_8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${e.title} from favorites`}
              >
                <Text style={s.btnText}>Remove</Text>
              </A11yPressable>
            </View>
          ))}
        </View>
      )}
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
