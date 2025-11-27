import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { useTranslation } from '../i18n';
import { computeMoodInsights, shouldShowMoodNudge } from '../services/moodInsights';
import { scoreTools, submitFeedback, useSuggestions } from '../services/personalization';
import { filterToolsByFlags, getToolMeta, resolveToolRoute } from '../services/toolRegistry';
import { usage } from '../services/usage';
import * as MoodStore from '../store/mood';
import { useSettings } from '../store/settings';
import { useAppPalette } from '../theme/usePalette';
import { announce } from '../utils/announce';

import GapView from './GapView';

export function HomeGuide() {
  const suggestions = useSuggestions() ?? [];
  const palette = useAppPalette();
  const { t } = useTranslation();
  const router = useRouter();
  // Placeholder for future feature flags (could be sourced from user settings or remote config)
  const enabledFlags: Set<string> | undefined = undefined;
  const filteredTools = (filterToolsByFlags(enabledFlags) ?? []) as Array<{ id: string }>;
  const allowedIds = new Set(filteredTools.map(m=> m.id));
  const top3 = (Array.isArray(suggestions) ? suggestions : []).filter(s=> allowedIds.has(s.toolId)).slice(0,3);
  let mood: { avg: number | null; count: number; insights?: ReturnType<typeof computeMoodInsights> } | null = null;
  let m: any = null;
  try {
    const hook = (MoodStore as any).useMoodOptional || (MoodStore as any).useMood;
    m = typeof hook === 'function' ? hook() : null;
  } catch {
    m = null;
  }
  if (m) {
    const entries = Array.isArray(m.entries) ? m.entries : [];
    const insights = computeMoodInsights(entries);
    const count = Array.isArray(m.todayEntries) ? m.todayEntries.length : 0;
    mood = { avg: m.recentAverage ?? null, count, insights };
  }
  const moodNudgesEnabled = useSettings().moodNudgesEnabled;
  const [nudgeEligible, setNudgeEligible] = React.useState(false);
  const nudgeLoggedRef = React.useRef(false);
  React.useEffect(()=> {
    (async () => {
      if (!moodNudgesEnabled || !mood) return setNudgeEligible(false);
      const lastKey = 'mood:nudge:lastShown';
      let lastShown: number | null = null;
      try { const raw = await AsyncStorage.getItem(lastKey); if (raw) lastShown = parseInt(raw,10); } catch {}
      const now = new Date();
      const sameDay = lastShown ? new Date(lastShown).toDateString() === now.toDateString() : false;
      if (sameDay) return setNudgeEligible(false);
      const should = shouldShowMoodNudge(now, mood.count, mood.insights?.lastEntryAgeHours!=null? Date.now() - mood.insights.lastEntryAgeHours*3600000 : null);
      setNudgeEligible(!!should);
      if (should) { try { await AsyncStorage.setItem(lastKey, Date.now().toString()); } catch {} }
    })();
  }, [moodNudgesEnabled, mood?.count, mood?.insights?.lastEntryAgeHours]);
  const showNudge = nudgeEligible;
  
  // Daily Feature Highlights - rotate through different features
  const dailyFeatures = React.useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const features = [
      { id: 'campaigns', title: t('home.guide.feature.campaigns', 'Join a Campaign'), route: '/(tabs)/campaigns' as Href, icon: '📢', desc: t('home.guide.feature.campaignsDesc', 'Make your voice heard') },
      { id: 'events', title: t('home.guide.feature.events', 'Upcoming Events'), route: '/(tabs)/events' as Href, icon: '📅', desc: t('home.guide.feature.eventsDesc', 'Connect with community') },
      { id: 'research', title: t('home.guide.feature.research', 'Research Hub'), route: '/(tabs)/research' as Href, icon: '🔬', desc: t('home.guide.feature.researchDesc', 'Evidence-based insights') },
      { id: 'resources', title: t('home.guide.feature.resources', 'Resources'), route: '/(tabs)/resources' as Href, icon: '💼', desc: t('home.guide.feature.resourcesDesc', 'Tools and support') },
      { id: 'community', title: t('home.guide.feature.community', 'Community'), route: '/(tabs)/community' as Href, icon: '👥', desc: t('home.guide.feature.communityDesc', 'Peer support network') },
    ];
    // Rotate based on day
    return features.slice(dayOfYear % features.length, (dayOfYear % features.length) + 2);
  }, [t]);
  
  return (
    <View style={[styles.container,{ backgroundColor: palette.surface, borderColor: palette.muted }]}>      
      <Text style={[styles.header,{ color: palette.primary }]}>{t('home.guide.header','Today\'s Guide')}</Text>
      
      {/* Daily Feature Highlights */}
      <View style={{ marginBottom: 12 }}>
        <Text style={[styles.snapshotLabel,{ color: palette.text }]}>{t('home.guide.dailyFeatures','Today\'s Features')}</Text>
        <GapView gap={8}>
          {dailyFeatures.map(feature => (
              <GapView key={feature.id} gap={10} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, backgroundColor: palette.background }}>
                <Pressable hitSlop={HIT_SLOP_8} accessibilityRole='button' style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={() => { usage.view('home_guide_daily_feature', '/', { feature: feature.id }); router.push(feature.route); }}>
                  <Text style={{ fontSize: 20 }}>{feature.icon}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: palette.text, fontWeight: '600', fontSize: 14 }}>{feature.title}</Text>
                    <Text style={{ color: palette.text, fontSize: 12, opacity: 0.7 }}>{feature.desc}</Text>
                  </View>
                  <Text style={{ color: palette.primary, fontSize: 20 }}>→</Text>
                </Pressable>
              </GapView>
          ))}
        </GapView>
      </View>
      
      <View style={{ marginBottom:8 }}>
        <Text style={[styles.snapshotLabel,{ color: palette.text }]}>{t('home.guide.snapshot','Snapshot')}</Text>
        {mood ? (
          <GapView gap={4}>
            <Text style={{ color: palette.text, fontSize:12 }}>
              {t('home.guide.moodSummary','Mood 7d avg: {{avg}} • Today entries: {{count}}',{ avg: mood.avg==null? '—' : mood.avg.toFixed(2), count: mood.count })}
            </Text>
            {mood.insights?.delta24h!=null && (
              <Text style={{ color: palette.text, fontSize:11 }}>
                {mood.insights.delta24h > 0
                  ? t('homeGuide.mood.deltaPositive','24h change: +{{delta}}',{ delta: mood.insights.delta24h.toFixed(2) })
                  : mood.insights.delta24h < 0
                    ? t('homeGuide.mood.deltaNegative','24h change: {{delta}}',{ delta: mood.insights.delta24h.toFixed(2) })
                    : t('homeGuide.mood.deltaNeutral','24h change: 0')}
              </Text>
            )}
            {mood.insights && (
              <GapView style={{ flexDirection:'row', flexWrap:'wrap' }} gap={6}>
                {mood.insights.trend !== 'none' && (
                  <Text style={trendStyle(palette, mood.insights.trend)}>
                    {t(`homeGuide.mood.trend${cap(mood.insights.trend)}`, mood.insights.trend)}
                  </Text>
                )}
                {mood.insights.streakDays > 1 && (
                  <Text style={badgeStyle(palette)}>
                    {t('homeGuide.mood.streak','Mood log streak: {{days}}d',{ days: mood.insights.streakDays })}
                  </Text>
                )}
              </GapView>
            )}
          </GapView>
        ) : (
          <Text style={{ color: palette.text, fontSize:12 }}>{t('home.guide.snapshotPlaceholder','(Mood tracking available on Wellness tab)')}</Text>
        )}
      </View>
  {showNudge && (()=> { if (!nudgeLoggedRef.current) { usage.view('home_mood_nudge_view','/',{}); nudgeLoggedRef.current = true; } return (
        <View style={{ marginBottom:12, padding:8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, backgroundColor: palette.surface }}>
          <Text style={{ color: palette.text, fontSize:12, marginBottom:6 }}>{t('homeGuide.mood.nudge','Evening check-in? Log how you feel.')}</Text>
            <Pressable hitSlop={HIT_SLOP_8} accessibilityRole='button' style={{ backgroundColor: palette.primary, paddingHorizontal:10, paddingVertical:6, alignSelf:'flex-start', borderRadius:6 }} onPress={()=> { usage.view('home_mood_nudge_tap','/',{}); router.push(resolveToolRoute('wellness_mood') as any); }}>
              <Text style={{ color: palette.onPrimary, fontWeight:'600', fontSize:12 }}>{t('homeGuide.mood.nudgeAction','Log Mood')}</Text>
            </Pressable>
        </View>
      ); })()}
      {top3.length ? (
        <GapView gap={12}>
          <Text style={[styles.suggestionTitle,{ color: palette.text }]}>{t('home.guide.suggested','Suggested')}</Text>
          {top3.map((sug, idx) => {
            const meta = getToolMeta(sug.toolId);
            return (
              <View key={sug.toolId} style={{ padding:8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8 }}>
                <Text style={{ color: palette.text, fontWeight:'600', flexWrap:'wrap' }}>
                  {idx===0 ? '⭐ ' : ''}{renderIcon(meta?.icon)} {t(meta?.i18nLabelKey || 'homeGuide.tool.default', meta?.id || sug.toolId)}
                </Text>
                <GapView style={{ flexDirection:'row', flexWrap:'wrap', marginTop:4 }} gap={4}>
                  {(sug.reason ?? []).map((r, rIdx) => {
                    const label = t(`homeGuide.reason.${r.key}`, t('homeGuide.reason.default','Suggested'));
                    return (
                      <Text key={`${r.key}-${rIdx}`} style={{ backgroundColor: palette.primary, color: palette.onPrimary, paddingHorizontal:6, paddingVertical:2, borderRadius:12, fontSize:11 }}>{label}</Text>
                    );
                  })}
                </GapView>
                <GapView style={{ flexDirection:'row', flexWrap:'wrap', alignItems:'center', marginTop:6 }} gap={8}>
                  <Pressable hitSlop={HIT_SLOP_8} accessibilityRole='button' accessibilityLabel={t('home.guide.feedback.up','Helpful suggestion')} onPress={()=>handleFeedback(sug.toolId,'up')} style={{ minWidth: 44, minHeight: 44, paddingHorizontal:10, paddingVertical:6, backgroundColor: palette.muted, borderRadius:6, alignItems:'center', justifyContent:'center' }}>
                    <Text style={{ color: palette.text, textAlign:'center' }}>👍</Text>
                  </Pressable>
                  <Pressable hitSlop={HIT_SLOP_8} accessibilityRole='button' accessibilityLabel={t('home.guide.feedback.down','Not relevant')} onPress={()=>handleFeedback(sug.toolId,'down')} style={{ minWidth: 44, minHeight: 44, paddingHorizontal:10, paddingVertical:6, backgroundColor: palette.muted, borderRadius:6, alignItems:'center', justifyContent:'center' }}>
                    <Text style={{ color: palette.text, textAlign:'center' }}>👎</Text>
                  </Pressable>
                    <Pressable hitSlop={HIT_SLOP_8} accessibilityRole='button' style={{ minWidth: 80, minHeight: 44, flex: 1, backgroundColor: palette.primary, paddingHorizontal:12, paddingVertical:6, borderRadius:6, alignItems:'center', justifyContent:'center' }} onPress={()=> {
                      usage.view('home_guide_select', '/', {
                        tool: sug.toolId,
                        category: meta?.category,
                        reasons: (sug.reason ?? []).map(r=> r.key),
                        reasonDetail: sug.reason ?? [],
                        rank: idx+1
                      });
                      router.push(resolveToolRoute(sug.toolId) as any);
                    }}>
                      <Text style={{ color: palette.onPrimary, fontWeight:'700', textAlign:'center' }}>{t('home.guide.open','Open')}</Text>
                    </Pressable>
                </GapView>
              </View>
            );
          })}
        </GapView>
      ) : (
        <Text style={{ color: palette.text }}>{t('home.guide.noSuggestions','No suggestions yet')}</Text>
      )}
    </View>
  );
}

async function handleFeedback(toolId: string, kind: 'up'|'down') {
  try {
    await submitFeedback(toolId, kind);
    // Re-score in background to reflect new feedback next render cycle (no direct state access here, hook will refresh on next mount or we could force an event bus)
    scoreTools();
    announce(kind === 'up' ? 'Thanks, we\'ll show more like this.' : 'Got it, we\'ll show fewer like this.');
  } catch {}
}

function renderIcon(name?: string) {
  switch(name) {
    case 'coach': return '🎯';
    case 'translate': return '🗣️';
    case 'policy': return '📜';
    case 'mood': return '🫀';
    case 'search': return '🔍';
    default: return '•';
  }
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function badgeStyle(palette: any) {
  return { backgroundColor: palette.primary, color: palette.onPrimary, paddingHorizontal:6, paddingVertical:2, borderRadius:12, fontSize:11 };
}

function trendStyle(palette: any, trend: string) {
  let bg = palette.primary;
  if (trend === 'improving') bg = palette.success;
  else if (trend === 'declining') bg = palette.error;
  else if (trend === 'stable') bg = palette.muted;
  const fg = bg === palette.muted ? palette.text : palette.onPrimary;
  return { backgroundColor: bg, color: fg, paddingHorizontal:6, paddingVertical:2, borderRadius:12, fontSize:11 };
}

// legacy helper removed; route resolution handled by registry

const styles = StyleSheet.create({
  container: { borderWidth: StyleSheet.hairlineWidth, padding:12, borderRadius:12, marginBottom:16, marginTop:12 },
  header: { fontSize:16, fontWeight:'700', marginBottom:12 },
  snapshotLabel: { fontSize:13, fontWeight:'600', marginBottom:6 },
  suggestionTitle: { fontSize:13, fontWeight:'600', marginBottom:8 }
});
