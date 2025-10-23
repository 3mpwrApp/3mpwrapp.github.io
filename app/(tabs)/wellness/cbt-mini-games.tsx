import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function CBTMiniGames(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  React.useEffect(()=>{ logView('wellness/cbt-mini-games'); },[]);
  const items = [
    t('wellness.mini.fiveSenses','5‑4‑3‑2‑1 grounding (senses).'),
    t('wellness.mini.nameColors','Name colors in the room.'),
    t('wellness.mini.countBack','Count backwards by 7s from 100.'),
  ];
  const [idx, setIdx] = React.useState(0);
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.mini.title','CBT Mini‑Games')}</Text>
      <Text style={s.desc}>{t('wellness.mini.desc','Quick grounding games to shift attention and calm.')}</Text>
      <View style={s.card}><Text style={{ color: palette.text }}>{items[idx]}</Text></View>
      <A11yPressable onPress={()=> setIdx((idx+1)%items.length)} style={s.button} hitSlop={HIT_SLOP_8}><Text style={s.buttonText}>{t('common.next','Next')}</Text></A11yPressable>
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
