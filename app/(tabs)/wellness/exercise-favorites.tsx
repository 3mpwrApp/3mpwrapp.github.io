import React from 'react';
import { FlatList, Linking, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function ExerciseFavorites() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Exercise Favorites');
  useFocusOnRefOnMount(titleRef);
  const [items, setItems] = React.useState<{ id: string; title: string; url: string }[]>([]);

  const load = React.useCallback(async () => {
    try {
      const a = require('@react-native-async-storage/async-storage').default;
      const rawFavs = (await a.getItem('exercise.favs.v1')) || '[]';
      const favs: string[] = JSON.parse(rawFavs);
      // Try to read cached lists for all audiences and merge
      const cacheRaw = (await a.getItem('exercise.cache.v1')) || '{}';
      const cache = JSON.parse(cacheRaw);
      const map = new Map<string, { id:string; title:string; url:string }>();
      Object.values(cache).forEach((arr: any) => {
        (arr||[]).forEach((v: any) => { const id = v.id || v.title; map.set(id, { id, title: v.title, url: v.url }); });
      });
      // Also include local static list if present
      try { const { exercises } = require('../../../data/exercises'); (exercises||[]).forEach((v:any)=> { const id = v.id || v.title; if (!map.has(id)) map.set(id, { id, title:v.title, url:v.url }); }); } catch {}
      const out: { id:string; title:string; url:string }[] = [];
      favs.forEach(fid => { const v = map.get(fid); if (v) out.push(v); });
      setItems(out);
    } catch {
      setItems([]);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    try { const a = require('@react-native-async-storage/async-storage').default; const raw = (await a.getItem('exercise.favs.v1')) || '[]'; const favs: string[] = JSON.parse(raw); const next = favs.filter(x=> x!==id); await a.setItem('exercise.favs.v1', JSON.stringify(next)); load(); } catch {}
  };

  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Exercise Favorites</Text>
      <FlatList
        data={items}
        keyExtractor={i=>i.id}
        renderItem={({ item }) => (
          <View style={s.row}>
            <Text style={s.rowText}>{item.title}</Text>
            <View style={{ flexDirection:'row', gap:8 }}>
              <A11yPressable onPress={()=> Linking.openURL(item.url)} style={s.btn} accessibilityRole="button" accessibilityLabel={`Open exercise link for ${item.title}`} hitSlop={HIT_SLOP_8}><Text style={s.btnText}>Open</Text></A11yPressable>
              <A11yPressable onPress={()=> remove(item.id)} style={s.btn} accessibilityRole="button" accessibilityLabel={`Remove ${item.title} from favorites`} hitSlop={HIT_SLOP_8}><Text style={s.btnText}>Remove</Text></A11yPressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: palette.text, opacity: 0.9 }}>No favorites yet.</Text>}
      />
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    row: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
    rowText: { color: palette.text, flex: 1, marginRight: 8 },
    btn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    btnText: { color: palette.text, fontWeight: '700' },
  });
}

