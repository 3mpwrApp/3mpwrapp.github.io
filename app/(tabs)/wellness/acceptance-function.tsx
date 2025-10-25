import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { logView } from '../../../services/analytics';
import { getCachedJSON, setCachedJSON } from '../../../services/cache';
import { useAppPalette } from '../../../theme/usePalette';

type Entry = { id: string; date: string; acceptance: string; function: string; note?: string };

export const options = { href: null };

export default function AcceptanceFunction(){
  const { t } = useTranslation();
  const palette = useAppPalette();
  const s = styles(palette);
  const [entries, setEntries] = React.useState<Entry[]>([]);
  React.useEffect(()=>{ logView('wellness/acceptance-function'); },[]);
  const [date, setDate] = React.useState(new Date().toISOString().slice(0,10));
  const [acc, setAcc] = React.useState('');
  const [fn, setFn] = React.useState('');
  const [note, setNote] = React.useState('');
  React.useEffect(()=>{ (async()=>{ const saved=await getCachedJSON<Entry[]>("wellness_acceptance_fn"); if(saved) setEntries(saved);} )(); },[]);
  React.useEffect(()=>{ setCachedJSON("wellness_acceptance_fn", entries); },[entries]);
  const add = ()=>{ setEntries([{ id: Math.random().toString(36).slice(2), date, acceptance: acc, function: fn, note }, ...entries].slice(0,200)); setAcc(''); setFn(''); setNote(''); };
  return (
    <View style={s.container}>
      <Text accessibilityRole="header" style={s.header}>{t('wellness.acceptFn.title','Acceptance & Function')}</Text>
      <DisclaimerBanner type="medical" compact />
      <Text style={s.desc}>{t('wellness.acceptFn.desc','Track acceptance and daily functioning to notice supportive patterns.')}</Text>
      <TextInput value={date} onChangeText={setDate} placeholder={t('wellness.acceptFn.date','Date (YYYY-MM-DD)')} placeholderTextColor={palette.text+'77'} style={s.input}/>
      <TextInput value={acc} onChangeText={setAcc} placeholder={t('wellness.acceptFn.acceptance','Acceptance (0–10)')} placeholderTextColor={palette.text+'77'} style={s.input}/>
      <TextInput value={fn} onChangeText={setFn} placeholder={t('wellness.acceptFn.function','Function (0–10)')} placeholderTextColor={palette.text+'77'} style={s.input}/>
      <TextInput value={note} onChangeText={setNote} placeholder={t('wellness.acceptFn.note','Note (optional)')} placeholderTextColor={palette.text+'77'} style={s.input}/>
      <A11yPressable onPress={add} style={s.button} hitSlop={HIT_SLOP_8}><Text style={s.buttonText}>{t('common.add','Add')}</Text></A11yPressable>
      <Text style={[s.text,{ marginTop:12, fontWeight:'700' }]}>{t('wellness.acceptFn.recent','Recent')}</Text>
      {entries.slice(0,10).map(e => (<Text key={e.id} style={s.text}>• {e.date}: A {e.acceptance} / F {e.function}{e.note? ` — ${e.note}`:''}</Text>))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>){
  return StyleSheet.create({
    container:{ flex:1, backgroundColor: palette.background, padding:16 },
    header:{ color: palette.text, fontSize:20, fontWeight:'800', marginBottom:8 },
    desc:{ color: palette.text, opacity:0.9, marginBottom:8 },
    input:{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding:8, borderRadius:6, marginBottom:8 },
    text:{ color: palette.text, marginTop:6 },
    button:{ backgroundColor: palette.primary, padding:10, borderRadius:8, alignItems:'center' },
    buttonText:{ color: palette.onPrimary, fontWeight:'700' },
  });
}
