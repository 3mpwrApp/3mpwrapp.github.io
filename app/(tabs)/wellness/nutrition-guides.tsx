import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
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
  
  // Hydration tracking
  const [hydrationGoal, setHydrationGoal] = React.useState(8); // cups/day
  const [hydrationLog, setHydrationLog] = React.useState<{date: string, cups: number}[]>([]);
  const HYDRATION_KEY = 'nutrition.hydration.v1';
  const HYDRATION_GOAL_KEY = 'nutrition.hydrationGoal.v1';
  const today = new Date().toISOString().split('T')[0];
  const todayCups = hydrationLog.find(l => l.date === today)?.cups || 0;
  
  React.useEffect(()=>{ (async()=>{ try { const a = require('@react-native-async-storage/async-storage').default; const raw = await a.getItem(FAVS_KEY); if (raw) setFavs(new Set(JSON.parse(raw))); } catch {} })(); },[]);
  React.useEffect(()=>{ (async()=>{ try { const a = require('@react-native-async-storage/async-storage').default; const raw = await a.getItem(HYDRATION_KEY); if (raw) setHydrationLog(JSON.parse(raw)); const goalRaw = await a.getItem(HYDRATION_GOAL_KEY); if (goalRaw) setHydrationGoal(parseInt(goalRaw, 10)); } catch {} })(); },[]);
  
  const saveFavs = async (next: Set<string>) => { setFavs(new Set(next)); try { const a = require('@react-native-async-storage/async-storage').default; await a.setItem(FAVS_KEY, JSON.stringify(Array.from(next))); } catch {} };
  
  const addWater = async (cups: number) => {
    const updated = [...hydrationLog];
    const todayEntry = updated.find(l => l.date === today);
    if (todayEntry) {
      todayEntry.cups += cups;
    } else {
      updated.push({ date: today, cups });
    }
    setHydrationLog(updated);
    try { const a = require('@react-native-async-storage/async-storage').default; await a.setItem(HYDRATION_KEY, JSON.stringify(updated)); } catch {}
  };
  
  const resetToday = async () => {
    const updated = hydrationLog.filter(l => l.date !== today);
    setHydrationLog(updated);
    try { const a = require('@react-native-async-storage/async-storage').default; await a.setItem(HYDRATION_KEY, JSON.stringify(updated)); } catch {}
  };
  
  const saveGoal = async (newGoal: number) => {
    setHydrationGoal(newGoal);
    try { const a = require('@react-native-async-storage/async-storage').default; await a.setItem(HYDRATION_GOAL_KEY, newGoal.toString()); } catch {}
  };
  
  const exportFavorites = async () => {
    try {
      const favList = recipes.filter(r => favs.has(r.id));
      const rows = [["title", "tags", "notes", "url"], ...favList.map(r => [r.title, r.tags.join(', '), r.notes || '', r.url || ''])];
      const csv = rows.map(r => r.map(x => `"${(x || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const FileSystem = await import('expo-file-system');
      const Sharing = await import('expo-sharing');
      const baseDir: any = (FileSystem as any).default?.cacheDirectory || (FileSystem as any).cacheDirectory || (FileSystem as any).default?.documentDirectory;
      if (!baseDir) return;
      const path = `${baseDir}nutrition_favorites_${Date.now()}.csv`;
      await (FileSystem as any).writeAsStringAsync(path, csv, { encoding: (FileSystem as any).EncodingType?.UTF8 });
      if (Sharing?.isAvailableAsync && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Nutrition Favorites CSV' });
      } else {
        Alert.alert('Export ready', 'CSV saved to cache directory.');
      }
    } catch {
      Alert.alert("Export failed", "Could not share favorites.");
    }
  };
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE} accessibilityLabel="Diet & Nutrition Guides screen">Diet & Nutrition Guides</Text>
      <DisclaimerBanner type="medical" compact />
      
      {/* Hydration Tracker */}
      <View style={[s.card, { marginTop: 12, backgroundColor: palette.primary + '15' }]}>
        <Text style={[s.cardTitle, { fontSize: 18 }]}>💧 Daily Hydration</Text>
        <Text style={s.cardText}>Goal: {hydrationGoal} cups/day</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
          <View style={{ flex: 1, height: 12, backgroundColor: palette.muted, borderRadius: 6, overflow: 'hidden' }}>
            <View style={{ width: `${Math.min(100, (todayCups / hydrationGoal) * 100)}%`, height: '100%', backgroundColor: palette.primary }} />
          </View>
          <Text style={[s.cardText, { marginLeft: 8, marginBottom: 0 }]}>{todayCups}/{hydrationGoal}</Text>
        </View>
        <GapView style={{ flexDirection: 'row', marginTop: 6 }} gap={6}>
          <A11yPressable onPress={() => addWater(1)} style={s.btn} accessibilityRole="button" accessibilityLabel="Add 1 cup of water" hitSlop={HIT_SLOP_8}>
            <Text style={s.btnText}>+1 cup</Text>
          </A11yPressable>
          <A11yPressable onPress={() => addWater(0.5)} style={s.btn} accessibilityRole="button" accessibilityLabel="Add half cup of water" hitSlop={HIT_SLOP_8}>
            <Text style={s.btnText}>+½ cup</Text>
          </A11yPressable>
          <A11yPressable onPress={resetToday} style={[s.btn, { backgroundColor: palette.error + '20' }]} accessibilityRole="button" accessibilityLabel="Reset today's water intake" hitSlop={HIT_SLOP_8}>
            <Text style={[s.btnText, { color: palette.error }]}>Reset</Text>
          </A11yPressable>
        </GapView>
        <GapView style={{ flexDirection: 'row', marginTop: 8 }} gap={6}>
          <Text style={[s.cardText, { marginBottom: 0 }]}>Daily goal:</Text>
          {[6, 8, 10, 12].map(g => (
            <A11yPressable key={g} onPress={() => saveGoal(g)} style={[s.btn, hydrationGoal === g && { backgroundColor: palette.primary, borderColor: palette.primary }]} accessibilityRole="button" accessibilityLabel={`Set goal to ${g} cups`} hitSlop={HIT_SLOP_8}>
              <Text style={[s.btnText, hydrationGoal === g && { color: palette.onPrimary }]}>{g}</Text>
            </A11yPressable>
          ))}
        </GapView>
      </View>
      
      <A11yPressable
        onPress={exportFavorites}
        style={[s.btn,{ alignSelf:'flex-start', marginTop: 6 }]}
        accessibilityRole="button"
        accessibilityLabel="Export nutrition favorites as CSV"
        hitSlop={HIT_SLOP_8}
      >
        <Text style={s.btnText}>Export Favorites (CSV)</Text>
      </A11yPressable>
      <GapView style={{ flexDirection:'row', flexWrap:'wrap', marginTop: 8 }} gap={8}>
        <A11yPressable onPress={()=>setTag('all')} style={[s.chip, tag==='all' && s.chipActive]} accessibilityRole="button" accessibilityLabel="Show all recipes" hitSlop={HIT_SLOP_8}><Text style={{ color: tag==='all'? palette.onPrimary: palette.text, fontWeight:'700' }}>all</Text></A11yPressable>
        {tags.map(t => (
          <A11yPressable key={t} onPress={()=>setTag(t)} style={[s.chip, tag===t && s.chipActive]} accessibilityRole="button" accessibilityLabel={`Filter recipes by tag: ${t}`} hitSlop={HIT_SLOP_8}><Text style={{ color: tag===t? palette.onPrimary: palette.text, fontWeight:'700' }}>{t}</Text></A11yPressable>
        ))}
      </GapView>
      {filtered.map(r => (
        <View key={r.id} style={s.card}>
          <Text style={s.cardTitle} accessibilityLabel={`Recipe: ${r.title}`}>{r.title}</Text>
          <Text style={s.cardText}>Tags: {r.tags.join(', ')}</Text>
          {!!r.notes && <Text style={s.cardText}>{r.notes}</Text>}
          {!!r.url && <A11yPressable style={s.btn} accessibilityRole="button" accessibilityLabel={`Open recipe link for ${r.title}`} hitSlop={HIT_SLOP_8}><Text style={s.btnText}>Open</Text></A11yPressable>}
          <A11yPressable
            onPress={()=>{ const next = new Set(favs); if (next.has(r.id)) next.delete(r.id); else next.add(r.id); saveFavs(next); }}
            style={[s.btn,{ marginLeft: 8 }]}
            accessibilityRole="button"
            accessibilityLabel={favs.has(r.id)? `Remove ${r.title} from favorites`:`Add ${r.title} to favorites`}
            hitSlop={HIT_SLOP_8}
          >
            <Text style={s.btnText}>{favs.has(r.id)? '★ Favorited':'☆ Favorite'}</Text>
          </A11yPressable>
        </View>
      ))}
      {favs.size>0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Favorites</Text>
          {recipes.filter(r=> favs.has(r.id)).map(r=> (
            <View key={`f-${r.id}`} style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop: 6 }}>
              <Text style={{ color: palette.text, flex:1 }}>{r.title}</Text>
              {!!r.url && typeof r.url === 'string' && (
                <A11yPressable
                  onPress={() => Linking.openURL(r.url as string)}
                  style={s.btn}
                  accessibilityRole="button"
                  accessibilityLabel={`Open favorite recipe link for ${r.title}`}
                  hitSlop={HIT_SLOP_8}
                >
                  <Text style={s.btnText}>Open</Text>
                </A11yPressable>
              )}
              <A11yPressable onPress={()=>{ const next = new Set(favs); next.delete(r.id); saveFavs(next); }} style={[s.btn,{ marginLeft: 6 }]} accessibilityRole="button" accessibilityLabel={`Remove ${r.title} from favorites`} hitSlop={HIT_SLOP_8}><Text style={s.btnText}>Remove</Text></A11yPressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
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

