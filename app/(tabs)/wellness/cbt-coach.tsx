import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function CBTCoach(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  React.useEffect(()=>{ logView('wellness/cbt-coach'); },[]);
  const [thought, setThought] = React.useState('');
  const [evidenceFor, setEvidenceFor] = React.useState('');
  const [evidenceAgainst, setEvidenceAgainst] = React.useState('');
  const [reframe, setReframe] = React.useState('');
  const generate = () => {
    const rf = `${t('wellness.cbt.alt','Alternate view')}: ${t('wellness.cbt.prompt','Given')} "${thought}", ${t('wellness.cbt.consider','consider evidence')} (${evidenceFor || '-'} / ${evidenceAgainst || '-'}). ${t('wellness.cbt.try','Try a balanced statement.')}`;
    setReframe(rf);
  };
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.cbt.title','CBT Virtual Coach')}</Text>
      <DisclaimerBanner type="medical" compact />
      <TextInput value={thought} onChangeText={setThought} placeholder={t('wellness.cbt.thought','Automatic thought')} placeholderTextColor={palette.text+'77'} style={s.input}/>
      <TextInput value={evidenceFor} onChangeText={setEvidenceFor} placeholder={t('wellness.cbt.evidenceFor','Evidence supporting')} placeholderTextColor={palette.text+'77'} style={s.input}/>
      <TextInput value={evidenceAgainst} onChangeText={setEvidenceAgainst} placeholder={t('wellness.cbt.evidenceAgainst','Evidence against')} placeholderTextColor={palette.text+'77'} style={s.input}/>
      <A11yPressable onPress={generate} style={s.button} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Generate reframe"><Text style={s.buttonText}>{t('wellness.cbt.generate','Generate')}</Text></A11yPressable>
      {reframe? (<View style={s.card}><Text style={{ color: palette.text }}>{reframe}</Text></View>): null}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>){
  return StyleSheet.create({
    container:{ flex:1, backgroundColor: palette.background, padding:16 },
    header:{ color: palette.text, fontSize:20, fontWeight:'800', marginBottom:8 },
    input:{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding:8, borderRadius:6, marginBottom:8 },
    button:{ backgroundColor: palette.primary, padding:10, borderRadius:8, alignItems:'center' },
    buttonText:{ color: palette.onPrimary, fontWeight:'700' },
    card:{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius:8, padding:12, marginTop:12 },
  });
}
