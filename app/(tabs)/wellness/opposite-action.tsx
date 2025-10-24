import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function OppositeAction(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const [step, setStep] = React.useState(0);
  React.useEffect(()=>{ logView('wellness/opposite-action'); },[]);
  const steps = [
    t('wellness.opposite.what','Name the emotion and urge.'),
    t('wellness.opposite.check','Check the facts: Is the urge justified?'),
    t('wellness.opposite.choose','Choose a small opposite action.'),
    t('wellness.opposite.do','Do it briefly. Notice the effect.'),
  ];
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.opposite.title','Opposite Action Companion')}</Text>
      <DisclaimerBanner type="medical" compact />
      <Text style={s.desc}>{t('wellness.opposite.desc','When emotions suggest unhelpful actions, try the opposite in small, safe steps.')}</Text>
      <View style={s.card}><Text style={{ color: palette.text }}>{steps[step]}</Text></View>
  <A11yPressable onPress={()=> { require('../../../services/analyticsClient').trackEvent('wellness_opposite_next_step',{ step }); setStep((step+1)%steps.length);} } style={s.button} hitSlop={HIT_SLOP_8} accessibilityRole="button" accessibilityLabel="Next step">
        <Text style={s.buttonText}>{t('common.next','Next')}</Text>
      </A11yPressable>
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
