import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { DyslexiaText } from '../../../components/DyslexiaText';
import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function RadicalAcceptance(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  React.useEffect(()=>{ logView('wellness/radical-acceptance'); },[]);
  const lines = [
    t('wellness.acceptance.line1','This moment is as it is (not approval).'),
    t('wellness.acceptance.line2','Name what’s in your control and what isn’t.'),
    t('wellness.acceptance.line3','Take the next kind action within your control.'),
  ];
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.acceptance.title','Radical Acceptance')}</Text>
      <DisclaimerBanner type="medical" compact />
      <DyslexiaText style={s.desc}>{t('wellness.acceptance.desc','A brief guide to reduce suffering by accepting reality as it is, while taking wise action.')}</DyslexiaText>
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
