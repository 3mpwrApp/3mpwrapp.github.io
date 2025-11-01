import React from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { EnergyCoinsProvider, useEnergyCoins } from '../../../store/energyCoins';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function EnergyCoinsScreen(){
  return (
    <EnergyCoinsProvider>
      <Inner />
    </EnergyCoinsProvider>
  );
}

function Inner(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const { date, coins, spent, setDaily, spend, resetDay } = useEnergyCoins();
  const [daily, setDailyInput] = React.useState('10');
  const [label, setLabel] = React.useState('Task');
  const [cost, setCost] = React.useState('2');
  React.useEffect(()=>{ logView('wellness/energy-coins'); },[]);
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.energy.title','Daily Energy Coins')}</Text>
      <DisclaimerBanner type="medical" compact={true} />
      <Text style={s.desc}>{t('wellness.energy.desc','Set a daily budget and spend coins on tasks. Pace kindly.')}</Text>
      <Text style={s.text}>{t('wellness.energy.today','Today: {{date}}',{ date })}</Text>
      <Text style={s.text}>{t('wellness.energy.remaining','Remaining coins: {{n}}',{ n: coins })}</Text>
      <GapView style={{ flexDirection:'row', marginTop:8 }} gap={8}>
  <TextInput value={daily} onChangeText={setDailyInput} {...(Platform.OS==='web'? {} : { keyboardType: 'numeric' })} placeholder={t('wellness.energy.daily','Daily coins')} placeholderTextColor={palette.text+'77'} style={s.input}/>
  <A11yPressable onPress={()=> { const v=parseInt(daily||'0')||0; require('../../../services/analyticsClient').trackEvent('energy_set_daily',{ value:v }); setDaily(v);} } style={s.button} hitSlop={HIT_SLOP_8}><Text style={s.buttonText}>{t('wellness.energy.set','Set')}</Text></A11yPressable>
      </GapView>
      <GapView style={{ flexDirection:'row', marginTop:8 }} gap={8}>
        <TextInput value={label} onChangeText={setLabel} placeholder={t('wellness.energy.label','Task label')} placeholderTextColor={palette.text+'77'} style={[s.input,{ flex:1 }]}/>
  <TextInput value={cost} onChangeText={setCost} {...(Platform.OS==='web'? {} : { keyboardType: 'numeric' })} placeholder={t('wellness.energy.cost','Cost')} placeholderTextColor={palette.text+'77'} style={[s.input,{ width:80 }]}/>
  <A11yPressable onPress={()=> { const c=parseInt(cost||'0')||0; require('../../../services/analyticsClient').trackEvent('energy_spend',{ label, cost: c }); spend(label, c); } } style={s.button} hitSlop={HIT_SLOP_8}><Text style={s.buttonText}>{t('wellness.energy.spend','Spend')}</Text></A11yPressable>
      </GapView>
  <A11yPressable onPress={()=> { require('../../../services/analyticsClient').trackEvent('energy_reset_day'); resetDay(); } } style={[s.button,{ marginTop:8 }]} hitSlop={HIT_SLOP_8}><Text style={s.buttonText}>{t('wellness.energy.reset','Reset day')}</Text></A11yPressable>
      <Text style={[s.text,{ marginTop:12, fontWeight:'700' }]}>{t('wellness.energy.history','History')}</Text>
      {spent.slice(0,10).map(x => (<Text key={x.id} style={s.text}>• {new Date(x.ts).toLocaleTimeString()} — {x.label} (-{x.cost})</Text>))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>){
  return StyleSheet.create({
    container:{ flex:1, backgroundColor: palette.background, padding:16 },
    header:{ color: palette.text, fontSize:20, fontWeight:'800', marginBottom:8 },
    desc:{ color: palette.text, opacity:0.9, marginBottom:8 },
    text:{ color: palette.text, marginTop:6 },
    input:{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding:8, borderRadius:6 },
    button:{ backgroundColor: palette.primary, padding:10, borderRadius:8, alignItems:'center' },
    buttonText:{ color: palette.onPrimary, fontWeight:'700' },
  });
}
