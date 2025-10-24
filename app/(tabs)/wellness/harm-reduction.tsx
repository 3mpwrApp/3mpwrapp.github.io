import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { DyslexiaText } from '../../../components/DyslexiaText';
import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function HarmReduction(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  React.useEffect(()=>{ logView('wellness/harm-reduction'); },[]);
  const items = [
    t('wellness.harm.plan','Make a safety plan and keep it visible.'),
    t('wellness.harm.delay','Delay + Distract: set a 10‑minute timer and switch tasks.'),
    t('wellness.harm.connection','Connection: text a friend or peer support.'),
    t('wellness.harm.crisis','Crisis: know local lines and emergency steps.'),
  ];
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.harm.title','Harm Reduction Guide')}</Text>
      <DisclaimerBanner type="crisis" compact />
      <DyslexiaText style={s.desc}>{t('wellness.harm.desc','Practical steps to reduce harm and increase safety.')}</DyslexiaText>
      {items.map((x,i)=>(<DyslexiaText key={i} style={s.line}>• {x}</DyslexiaText>))}
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
