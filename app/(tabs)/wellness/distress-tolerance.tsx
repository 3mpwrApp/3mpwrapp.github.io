import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { DyslexiaText } from '../../../components/DyslexiaText';
import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function DistressTolerance(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  React.useEffect(()=>{ logView('wellness/distress-tolerance'); },[]);
  const lines = [
    t('wellness.distress.tipp1','T: Temperature — cool face/neck (safe cold pack).'),
    t('wellness.distress.tipp2','I: Intense (gentle) exercise — brief walk, arm circles.'),
    t('wellness.distress.tipp3','P: Paced breathing — 4 in, 6 out, 2–3 minutes.'),
    t('wellness.distress.tipp4','P: Progressive relax — tense/release muscle groups.'),
  ];
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.distress.title','Distress Tolerance')}</Text>
      <DisclaimerBanner type="medical" compact />
      <DyslexiaText style={s.desc}>{t('wellness.distress.desc','Reduce crisis intensity with brief, practical skills. Adapt to your body.')}</DyslexiaText>
      {lines.map((l,i)=>(<DyslexiaText key={i} style={s.line}>• {l}</DyslexiaText>))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>){
  return StyleSheet.create({
    container:{ flex:1, backgroundColor: palette.background, padding:16 },
    header:{ color: palette.text, fontSize:20, fontWeight:'800', marginBottom:8 },
    desc:{ color: palette.text, opacity:0.9, marginBottom:8 },
    line:{ color: palette.text, marginTop:6 }
  });
}
