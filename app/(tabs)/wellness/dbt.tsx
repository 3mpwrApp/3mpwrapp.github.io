import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../../../constants/a11y';
import { useTranslation } from '../../../i18n';
import { matchDBTSkills } from '../../../services/wellness/dbtMatcher';
import { useAppPalette } from '../../../theme/usePalette';

export default function DBTMatcher() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { t } = useTranslation();
  const [state, setState] = React.useState<'sad'|'angry'|'anxious'|'overwhelmed'|'numb'>('anxious');
  const skills = matchDBTSkills(state);
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.dbt.title','DBT Skill Matcher')}</Text>
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:8 }}>
        {(['sad','angry','anxious','overwhelmed','numb'] as const).map(k => (
          <Pressable hitSlop={HIT_SLOP_8} accessibilityRole="button" key={k} onPress={()=> setState(k)} style={[s.chip, state===k && { backgroundColor: palette.primary }]}>
            <Text style={{ color: state===k? palette.onPrimary : palette.text }}>{t(`wellness.dbt.${k}`, k)}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ gap:8 }}>
        {skills.map((sug,i)=> (
          <View key={i} style={s.card}><Text style={{ color: palette.text }}>{sug}</Text></View>
        ))}
      </View>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container:{ flex:1, backgroundColor: palette.background, padding:16 },
    header:{ color: palette.text, fontSize:20, fontWeight:'800', marginBottom:8 },
    chip:{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:16, paddingHorizontal:10, paddingVertical:6 },
    card:{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, padding:12 }
  });
}
