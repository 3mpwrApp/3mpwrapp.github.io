import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../i18n';
import { useSuggestions } from '../services/personalization';
import { usage } from '../services/usage';
import { useMood } from '../store/mood';
import { useAppPalette } from '../theme/usePalette';

export function HomeGuide() {
  const suggestions = useSuggestions();
  const palette = useAppPalette();
  const { t } = useTranslation();
  const top = suggestions[0];
  let mood: { avg: number | null; count: number } | null = null;
  try {
    const m = useMood();
    mood = { avg: m.recentAverage, count: m.todayEntries.length };
  } catch {}
  return (
    <View style={[styles.container,{ backgroundColor: palette.surface, borderColor: palette.muted }]}>      
      <Text style={[styles.header,{ color: palette.primary }]}>{t('home.guide.header','Today\'s Guide')}</Text>
      <View style={{ marginBottom:8 }}>
        <Text style={[styles.snapshotLabel,{ color: palette.text }]}>{t('home.guide.snapshot','Snapshot')}</Text>
        {mood ? (
          <Text style={{ color: palette.text, fontSize:12 }}>
            {t('home.guide.moodSummary','Mood 7d avg: {{avg}} • Today entries: {{count}}',{ avg: mood.avg==null? '—' : mood.avg.toFixed(2), count: mood.count })}
          </Text>
        ) : (
          <Text style={{ color: palette.text, fontSize:12 }}>{t('home.guide.snapshotPlaceholder','(Mood tracking available on Wellness tab)')}</Text>
        )}
      </View>
      {top ? (
        <View style={{ marginBottom:8 }}>
          <Text style={[styles.suggestionTitle,{ color: palette.text }]}>{t('home.guide.suggested','Suggested')}</Text>
          <Text style={{ color: palette.text, fontWeight:'600' }}>{top.toolId}</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:4, marginTop:4 }}>
            {top.reason.map(r => (
              <Text key={r.key} style={{ backgroundColor: palette.primary, color: palette.onPrimary, paddingHorizontal:6, paddingVertical:2, borderRadius:12, fontSize:11 }}>{r.key}</Text>
            ))}
          </View>
          <Link
            href={toolToRoute(top.toolId)}
            asChild
            onPress={()=> { usage.view('home_guide_select', '/', { tool: top.toolId }); }}
          >
            <Pressable accessibilityRole='button' style={{ marginTop:8, backgroundColor: palette.primary, paddingVertical:8, borderRadius:6, alignItems:'center' }}>
              <Text style={{ color: palette.onPrimary, fontWeight:'700' }}>{t('home.guide.open','Open')}</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <Text style={{ color: palette.text }}>{t('home.guide.noSuggestions','No suggestions yet')}</Text>
      )}
    </View>
  );
}

function toolToRoute(id: string) {
  switch(id) {
    case 'coach': return '/(tabs)/advocacy/self-advocacy-coach';
    case 'translator': return '/(tabs)/advocacy/ai-advocate-translator';
    case 'policy_simplifier': return '/(tabs)/advocacy/policy-simple';
    case 'wellness_mood': return '/(tabs)/wellness.mood';
    case 'resources_search': return '/(tabs)/resources';
    default: return '/';
  }
}

const styles = StyleSheet.create({
  container: { borderWidth: StyleSheet.hairlineWidth, padding:12, borderRadius:12, marginBottom:16 },
  header: { fontSize:16, fontWeight:'700', marginBottom:8 },
  snapshotLabel: { fontSize:13, fontWeight:'600' },
  suggestionTitle: { fontSize:13, fontWeight:'600', marginBottom:4 }
});
