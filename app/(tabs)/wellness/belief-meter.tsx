import React from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function BeliefMeter(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const [belief, setBelief] = React.useState('');
  const [rating, setRating] = React.useState('70');
  const [after, setAfter] = React.useState<string | null>(null);
  React.useEffect(()=>{ logView('wellness/belief-meter'); },[]);
  const measure = () => {
    const n = Math.max(0, Math.min(100, parseInt(rating||'0')));
    const next = Math.max(0, Math.round(n - 10));
    setAfter(`${t('wellness.belief.after','After a reframe, consider if strength shifts')} (${n}→${next}).`);
  };
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.belief.title','Belief Strength Meter')}</Text>
      <DisclaimerBanner type="medical" compact />
      <Text style={s.desc}>{t('wellness.belief.desc','Rate how strongly you believe a thought (0–100). Track change after a reframe.')}</Text>
      <TextInput value={belief} onChangeText={setBelief} placeholder={t('wellness.belief.thought','Thought')} placeholderTextColor={palette.text+'77'} style={s.input}/>
  <TextInput value={rating} onChangeText={setRating} {...(Platform.OS==='web'? {} : { keyboardType: 'numeric' })} placeholder={t('wellness.belief.rating','Belief strength (0–100)')} placeholderTextColor={palette.text+'77'} style={s.input}/>
      <Text style={s.text}>{t('wellness.belief.now','Now: {{n}}',{ n: rating || '0' })}</Text>
      <Text style={s.text}>{after || ''}</Text>
      <View style={{ height: 1, backgroundColor: palette.muted, marginVertical: 8 }} />
      <Text style={s.text}>{t('wellness.belief.hint','Tip: pair with CBT Coach to generate reframes.')}</Text>
      <Text accessibilityRole="button" onPress={measure} style={[s.text,{ color: palette.primary, fontWeight:'700', marginTop: 8 }]}>{t('wellness.belief.measure','Measure')}</Text>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>){
  return StyleSheet.create({
    container:{ flex:1, backgroundColor: palette.background, padding:16 },
    header:{ color: palette.text, fontSize:20, fontWeight:'800', marginBottom:8 },
    desc:{ color: palette.text, opacity:0.9, marginBottom:8 },
    input:{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding:8, borderRadius:6, marginBottom:8 },
    text:{ color: palette.text, marginTop:6 }
  });
}
