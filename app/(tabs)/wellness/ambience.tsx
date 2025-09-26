import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../../../constants/a11y';
import { useTranslation } from '../../../i18n';
import { computeAmbience } from '../../../services/ambience';
import { logView } from '../../../services/analytics';
import { computeMoodInsights } from '../../../services/moodInsights';
import { useMood } from '../../../store/mood';
import { useAppPalette } from '../../../theme/usePalette';

export default function AmbienceSync(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  React.useEffect(()=>{ logView('wellness/ambience'); },[]);
  let avg: number | null = null; let trend: 'improving'|'declining'|'stable'|'none' = 'none';
  try { const m = useMood(); const ins = computeMoodInsights(m.entries); avg = m.recentAverage; trend = ins.trend; } catch {}
  const amb = computeAmbience(avg, trend);
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.ambience.title','Ambience Sync AI')}</Text>
      <Text style={s.sub}>{t('wellness.ambience.desc','Match background, color, soundscape to your mood.')}</Text>
      <View style={[s.card,{ borderColor: amb.color }]}> 
        <Text style={{ color: palette.text }}>{t('wellness.ambience.current','Suggestion: {{palette}}, {{soundscape}}, {{brightness}}',{ palette: amb.palette, soundscape: amb.soundscape, brightness: amb.brightness })}</Text>
      </View>
  <Pressable hitSlop={HIT_SLOP_8} accessibilityRole="button" style={s.button} onPress={()=> {/* in future: set in-app theme variant, play soundscape */} }>
        <Text style={s.buttonText}>{t('wellness.ambience.apply','Apply in app')}</Text>
      </Pressable>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>){
  return StyleSheet.create({
    container:{ flex:1, backgroundColor: palette.background, padding:16 },
    header:{ color: palette.text, fontSize:20, fontWeight:'800', marginBottom:8 },
    sub:{ color: palette.text, opacity:0.9, marginBottom:8 },
    card:{ borderWidth: StyleSheet.hairlineWidth, borderRadius:8, padding:12, marginBottom:12 },
    button:{ backgroundColor: palette.primary, padding:10, borderRadius:8, alignItems:'center' },
    buttonText:{ color: palette.onPrimary, fontWeight:'700' }
  });
}
