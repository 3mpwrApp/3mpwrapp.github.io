import { StyleSheet, Text, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function SleepReframe(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const tips = [
    t('wellness.sleepReframe.tip1','Can’t sleep → It’s okay to rest quietly; rest still helps.'),
    t('wellness.sleepReframe.tip2','If awake >20m, reset: dim lights, gentle stretch, return.'),
    t('wellness.sleepReframe.tip3','Anchor wake time; short daytime rest if needed.'),
  ];
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.sleepReframe.title','Sleep Reframe')}</Text>
      <DisclaimerBanner type="medical" compact />
      <Text style={s.desc}>{t('wellness.sleepReframe.desc','Support better sleep with kind, practical reframes and routines.')}</Text>
      {tips.map((l,i)=>(<Text key={i} style={s.line}>• {l}</Text>))}
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
