import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

const MOVES = ['Ankle circles','Neck side tilt','Shoulder rolls','Wrist flex/extend','Seated march'];

export default function MicroMovement(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const [idx, setIdx] = React.useState(0);
  React.useEffect(()=>{ logView('wellness/micro-movement'); },[]);
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.micro.title','Micro‑Movement Coach')}</Text>
      <Text style={s.desc}>{t('wellness.micro.desc','Gentle, chair‑friendly movements. Stop if uncomfortable.')}</Text>
      <View style={s.card}><Text style={{ color: palette.text }}>{MOVES[idx]}</Text></View>
      <A11yPressable onPress={()=> setIdx((idx+1)%MOVES.length)} style={s.button} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Next movement"><Text style={s.buttonText}>{t('common.next','Next')}</Text></A11yPressable>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>){
  return StyleSheet.create({
    container:{ flex:1, backgroundColor: palette.background, padding:16 },
    header:{ color: palette.text, fontSize:20, fontWeight:'800', marginBottom:8 },
    desc:{ color: palette.text, opacity:0.9, marginBottom:8 },
    card:{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, padding:12, marginBottom:12 },
    button:{ backgroundColor: palette.primary, padding:10, borderRadius:8, alignItems:'center' },
    buttonText:{ color: palette.onPrimary, fontWeight:'700' }
  });
}
