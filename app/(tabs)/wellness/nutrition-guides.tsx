import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

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
  const [cupSize, setCupSize] = React.useState(250); // ml
  const [reminderEnabled, setReminderEnabled] = React.useState(false);
  const [reminderInterval, setReminderInterval] = React.useState(120); // minutes
  const [showHydrationSettings, setShowHydrationSettings] = React.useState(false);
  const HYDRATION_KEY = 'nutrition.hydration.v1';
  const HYDRATION_GOAL_KEY = 'nutrition.hydrationGoal.v1';
  const CUP_SIZE_KEY = 'nutrition.cupSize.v1';
  const REMINDER_ENABLED_KEY = 'nutrition.reminderEnabled.v1';
  const REMINDER_INTERVAL_KEY = 'nutrition.reminderInterval.v1';
  
  React.useEffect(()=>{ (async()=>{ try { const a = require('@react-native-async-storage/async-storage').default; const raw = await a.getItem(FAVS_KEY); if (raw) setFavs(new Set(JSON.parse(raw))); } catch {} })(); },[]);
  React.useEffect(()=>{ (async()=>{ 
    try { 
      const a = require('@react-native-async-storage/async-storage').default; 
      const raw = await a.getItem(HYDRATION_KEY); 
      if (raw) setHydrationLog(JSON.parse(raw)); 
      const goalRaw = await a.getItem(HYDRATION_GOAL_KEY); 
      if (goalRaw) setHydrationGoal(parseInt(goalRaw, 10));
      const cupRaw = await a.getItem(CUP_SIZE_KEY);
      if (cupRaw) setCupSize(parseInt(cupRaw, 10));
      const reminderRaw = await a.getItem(REMINDER_ENABLED_KEY);
      if (reminderRaw) setReminderEnabled(reminderRaw === '1');
      const intervalRaw = await a.getItem(REMINDER_INTERVAL_KEY);
      if (intervalRaw) setReminderInterval(parseInt(intervalRaw, 10));
    } catch {} 
  })(); },[]);
  
  const today = new Date().toISOString().split('T')[0];
  const todayCups = hydrationLog.find(l => l.date === today)?.cups || 0;
  const dailyMl = todayCups * cupSize;
  const goalMl = hydrationGoal * cupSize;
  
  const saveGoal = async (newGoal: number) => {
    setHydrationGoal(newGoal);
    try { const a = require('@react-native-async-storage/async-storage').default; await a.setItem(HYDRATION_GOAL_KEY, newGoal.toString()); } catch {}
  };
  
  const saveCupSize = async (size: number) => {
    setCupSize(size);
    try { const a = require('@react-native-async-storage/async-storage').default; await a.setItem(CUP_SIZE_KEY, size.toString()); } catch {}
  };
  
  const saveReminderEnabled = async (enabled: boolean) => {
    setReminderEnabled(enabled);
    try { 
      const a = require('@react-native-async-storage/async-storage').default; 
      await a.setItem(REMINDER_ENABLED_KEY, enabled ? '1' : '0');
      if (enabled) {
        Alert.alert('Reminder Enabled', `You'll get a reminder every ${reminderInterval} minutes to drink water.`);
      }
    } catch {}
  };
  
  const saveReminderInterval = async (interval: number) => {
    setReminderInterval(interval);
    try { const a = require('@react-native-async-storage/async-storage').default; await a.setItem(REMINDER_INTERVAL_KEY, interval.toString()); } catch {}
  };
  
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
      <DisclaimerBanner type="medical" compact={true} />
      
      {/* Hydration Tracker */}
      <View style={[s.card, { marginTop: 12, backgroundColor: palette.primary + '15' }]}>
        <GapView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} gap={8}>
          <Text style={[s.cardTitle, { fontSize: 18, marginBottom: 0 }]}>💧 Daily Hydration</Text>
          <A11yPressable 
            onPress={() => setShowHydrationSettings(!showHydrationSettings)} 
            style={{ padding: 8 }} 
            accessibilityRole="button" 
            accessibilityLabel={showHydrationSettings ? "Hide hydration settings" : "Show hydration settings"}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name={showHydrationSettings ? "chevron-up" : "settings-outline"} size={20} color={palette.primary} />
          </A11yPressable>
        </GapView>
        
        <Text style={s.cardText}>Goal: {hydrationGoal} cups/day ({goalMl}ml)</Text>
        <Text style={[s.cardText, { fontSize: 12, opacity: 0.8 }]}>Today: {dailyMl}ml / {goalMl}ml</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
          <View style={{ flex: 1, height: 16, backgroundColor: palette.muted, borderRadius: 8, overflow: 'hidden' }}>
            <View style={{ width: `${Math.min(100, (todayCups / hydrationGoal) * 100)}%`, height: '100%', backgroundColor: palette.primary }} />
          </View>
          <Text style={[s.cardText, { marginLeft: 8, marginBottom: 0, fontWeight: '700' }]}>{todayCups}/{hydrationGoal}</Text>
        </View>
        
        {todayCups >= hydrationGoal && (
          <View style={{ backgroundColor: palette.success + '20', padding: 8, borderRadius: 6, marginBottom: 8 }}>
            <Text style={{ color: palette.success, fontWeight: '700', textAlign: 'center' }}>🎉 Goal reached! Great job staying hydrated!</Text>
          </View>
        )}
        
        <GapView style={{ flexDirection: 'row', marginTop: 6, flexWrap: 'wrap' }} gap={6}>
          <A11yPressable onPress={() => addWater(1)} style={s.btn} accessibilityRole="button" accessibilityLabel={`Add 1 cup of water (${cupSize}ml)`} hitSlop={HIT_SLOP_8}>
            <Text style={s.btnText}>+1 cup ({cupSize}ml)</Text>
          </A11yPressable>
          <A11yPressable onPress={() => addWater(0.5)} style={s.btn} accessibilityRole="button" accessibilityLabel={`Add half cup of water (${cupSize/2}ml)`} hitSlop={HIT_SLOP_8}>
            <Text style={s.btnText}>+½ cup ({cupSize/2}ml)</Text>
          </A11yPressable>
          <A11yPressable onPress={resetToday} style={[s.btn, { backgroundColor: palette.error + '20' }]} accessibilityRole="button" accessibilityLabel="Reset today's water intake" hitSlop={HIT_SLOP_8}>
            <Text style={[s.btnText, { color: palette.error }]}>Reset</Text>
          </A11yPressable>
        </GapView>
        
        {showHydrationSettings && (
          <View style={{ marginTop: 12, padding: 12, backgroundColor: palette.surface, borderRadius: 8, borderWidth: 1, borderColor: palette.muted }}>
            <Text style={[s.cardTitle, { fontSize: 16 }]}>⚙️ Hydration Settings</Text>
            
            {/* Daily Goal */}
            <Text style={[s.cardText, { marginTop: 8, fontWeight: '600' }]}>Daily goal (cups):</Text>
            <GapView style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }} gap={6}>
              {[6, 8, 10, 12, 14, 16].map(g => (
                <A11yPressable key={g} onPress={() => saveGoal(g)} style={[s.btn, hydrationGoal === g && { backgroundColor: palette.primary, borderColor: palette.primary }]} accessibilityRole="button" accessibilityLabel={`Set goal to ${g} cups`} hitSlop={HIT_SLOP_8}>
                  <Text style={[s.btnText, hydrationGoal === g && { color: palette.onPrimary }]}>{g}</Text>
                </A11yPressable>
              ))}
            </GapView>
            
            {/* Cup Size */}
            <Text style={[s.cardText, { marginTop: 12, fontWeight: '600' }]}>Cup size (ml):</Text>
            <GapView style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }} gap={6}>
              {[200, 250, 300, 350, 500].map(size => (
                <A11yPressable key={size} onPress={() => saveCupSize(size)} style={[s.btn, cupSize === size && { backgroundColor: palette.primary, borderColor: palette.primary }]} accessibilityRole="button" accessibilityLabel={`Set cup size to ${size} milliliters`} hitSlop={HIT_SLOP_8}>
                  <Text style={[s.btnText, cupSize === size && { color: palette.onPrimary }]}>{size}ml</Text>
                </A11yPressable>
              ))}
            </GapView>
            
            {/* Reminders */}
            <View style={{ marginTop: 12 }}>
              <GapView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} gap={8}>
                <Text style={[s.cardText, { fontWeight: '600', flex: 1 }]}>Enable reminders:</Text>
                <Switch 
                  value={reminderEnabled} 
                  onValueChange={saveReminderEnabled}
                  trackColor={{ false: palette.muted, true: palette.primary }}
                  thumbColor={palette.onPrimary}
                />
              </GapView>
              
              {reminderEnabled && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[s.cardText, { fontWeight: '600' }]}>Remind me every:</Text>
                  <GapView style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }} gap={6}>
                    {[60, 90, 120, 180, 240].map(interval => (
                      <A11yPressable key={interval} onPress={() => saveReminderInterval(interval)} style={[s.btn, reminderInterval === interval && { backgroundColor: palette.primary, borderColor: palette.primary }]} accessibilityRole="button" accessibilityLabel={`Set reminder interval to ${interval} minutes`} hitSlop={HIT_SLOP_8}>
                        <Text style={[s.btnText, reminderInterval === interval && { color: palette.onPrimary }]}>{interval < 120 ? `${interval}m` : `${interval/60}h`}</Text>
                      </A11yPressable>
                    ))}
                  </GapView>
                  <Text style={[s.cardText, { fontSize: 12, opacity: 0.7, marginTop: 4 }]}>
                    💡 Tip: Set up wellness reminders in Settings for automatic hydration notifications
                  </Text>
                </View>
              )}
            </View>
            
            {/* Weekly Progress */}
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: palette.muted }}>
              <Text style={[s.cardText, { fontWeight: '600' }]}>Last 7 days:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8, height: 60 }}>
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  const dayCups = hydrationLog.find(l => l.date === dateStr)?.cups || 0;
                  const percentage = (dayCups / hydrationGoal) * 100;
                  const dayLabel = i === 6 ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' });
                  return (
                    <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                      <View style={{ width: '80%', backgroundColor: dayCups >= hydrationGoal ? palette.success : palette.primary, height: `${Math.max(10, Math.min(100, percentage))}%`, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                      <Text style={{ color: palette.text, fontSize: 10, marginTop: 4 }}>{dayLabel}</Text>
                      <Text style={{ color: palette.text, fontSize: 9, opacity: 0.7 }}>{dayCups}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}
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

