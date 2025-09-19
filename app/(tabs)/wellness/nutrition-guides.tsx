import React from 'react';
import { Pressable, StyleSheet, Text, View, Alert, Linking } from 'react-native';
import { recipes } from '../../../data/recipes';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useAppPalette } from '../../../theme/usePalette';

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
  const [favs, setFavs] = React.useState<Set<string>>(new Set());
  const FAVS_KEY = 'nutrition.favs.v1';
  React.useEffect(()=>{ (async()=>{ try { const a = require('@react-native-async-storage/async-storage').default; const raw = await a.getItem(FAVS_KEY); if (raw) setFavs(new Set(JSON.parse(raw))); } catch {} })(); },[]);
  const saveFavs = async (next: Set<string>) => { setFavs(new Set(next)); try { const a = require('@react-native-async-storage/async-storage').default; await a.setItem(FAVS_KEY, JSON.stringify(Array.from(next))); } catch {} };
  const exportFavorites = async () => {
    try {
      const favList = recipes.filter(r => favs.has(r.id));
      const rows = [["title", "tags", "notes", "url"], ...favList.map(r => [r.title, r.tags.join(', '), r.notes || '', r.url || ''])];
      const csv = rows.map(r => r.map(x => `"${(x || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      await require("react-native-share").default.open({ message: csv, title: "Nutrition Favorites CSV" });
    } catch {
      Alert.alert("Export failed", "Could not share favorites.");
    }
  };
  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityLabel="Diet & Nutrition Guides screen">Diet & Nutrition Guides</Text>
      <Pressable
        onPress={exportFavorites}
        style={[s.btn,{ alignSelf:'flex-start', marginTop: 6 }]}
        accessibilityRole="button"
        accessibilityLabel="Export nutrition favorites as CSV"
      >
        <Text style={s.btnText}>Export Favorites (CSV)</Text>
      </Pressable>
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 8 }}>
        <Pressable onPress={()=>setTag('all')} style={[s.chip, tag==='all' && s.chipActive]} accessibilityRole="button" accessibilityLabel="Show all recipes"><Text style={{ color: tag==='all'? palette.onPrimary: palette.text, fontWeight:'700' }}>all</Text></Pressable>
        {tags.map(t => (
          <Pressable key={t} onPress={()=>setTag(t)} style={[s.chip, tag===t && s.chipActive]} accessibilityRole="button" accessibilityLabel={`Filter recipes by tag: ${t}`}><Text style={{ color: tag===t? palette.onPrimary: palette.text, fontWeight:'700' }}>{t}</Text></Pressable>
        ))}
      </View>
      {filtered.map(r => (
        <View key={r.id} style={s.card}>
          <Text style={s.cardTitle} accessibilityLabel={`Recipe: ${r.title}`}>{r.title}</Text>
          <Text style={s.cardText}>Tags: {r.tags.join(', ')}</Text>
          {!!r.notes && <Text style={s.cardText}>{r.notes}</Text>}
          {!!r.url && <Pressable style={s.btn} accessibilityRole="button" accessibilityLabel={`Open recipe link for ${r.title}`}><Text style={s.btnText}>Open</Text></Pressable>}
          <Pressable
            onPress={()=>{ const next = new Set(favs); if (next.has(r.id)) next.delete(r.id); else next.add(r.id); saveFavs(next); }}
            style={[s.btn,{ marginLeft: 8 }]}
            accessibilityRole="button"
            accessibilityLabel={favs.has(r.id)? `Remove ${r.title} from favorites`:`Add ${r.title} to favorites`}
          >
            <Text style={s.btnText}>{favs.has(r.id)? '★ Favorited':'☆ Favorite'}</Text>
          </Pressable>
        </View>
      ))}
      {favs.size>0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Favorites</Text>
          {recipes.filter(r=> favs.has(r.id)).map(r=> (
            <View key={`f-${r.id}`} style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop: 6 }}>
              <Text style={{ color: palette.text, flex:1 }}>{r.title}</Text>
              {!!r.url && typeof r.url === 'string' && (
                <Pressable
                  onPress={() => Linking.openURL(r.url as string)}
                  style={s.btn}
                  accessibilityRole="button"
                  accessibilityLabel={`Open favorite recipe link for ${r.title}`}
                >
                  <Text style={s.btnText}>Open</Text>
                </Pressable>
              )}
              <Pressable onPress={()=>{ const next = new Set(favs); next.delete(r.id); saveFavs(next); }} style={[s.btn,{ marginLeft: 6 }]} accessibilityRole="button" accessibilityLabel={`Remove ${r.title} from favorites`}><Text style={s.btnText}>Remove</Text></Pressable>
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
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 6 },
    btn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf:'flex-start' },
    btnText: { color: palette.text, fontWeight: '700' },
  });
}

