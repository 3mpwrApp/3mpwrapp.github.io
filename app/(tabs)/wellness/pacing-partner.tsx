import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';
import { auth, db } from '../../../firebase/config';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import * as Notifier from '../../../services/notifications';

export const options = { href: null };

type Activity = { id?: string; minutes: number; type?: string; createdAt?: any };

export default function PacingPartner() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [minutes, setMinutes] = React.useState('');
  const [type, setType] = React.useState('walk');
  const [items, setItems] = React.useState<Activity[]>([]);
  const load = React.useCallback(async()=>{
    try { const uid = auth.currentUser?.uid || 'anon'; const snap = await getDocs(query(collection(db,'users',uid,'activity_logs'), orderBy('createdAt','desc'))); setItems(snap.docs.map(d=>({ id:d.id, ...(d.data() as any) }))); } catch {}
  },[]);
  React.useEffect(()=>{ load(); },[load]);
  const add = async () => {
    try { const uid = auth.currentUser?.uid || 'anon'; await addDoc(collection(db,'users',uid,'activity_logs'), { minutes: Number(minutes)||0, type, createdAt: serverTimestamp() }); setMinutes(''); load(); checkOverexertion(); } catch { Alert.alert('Failed','Could not save'); }
  };
  const checkOverexertion = async () => {
    const week = items.filter(i => (Date.now() - (i.createdAt?.toDate?.()?.getTime?.()||0)) < 7*86400000);
    const total = week.reduce((s,i)=> s + (i.minutes||0), 0);
    const limit = 60 * 7; // basic 1h/day baseline
    if (total > limit) {
      try { const d = new Date(); d.setMinutes(d.getMinutes()+5); await Notifier.scheduleAt(d, 'Pacing Partner', 'You may be overexerting. Consider a rest.'); } catch {}
    }
  };
  return (
    <View style={s.container}>
      <Text style={s.title}>AI Pacing Partner</Text>
      <TextInput placeholder="Minutes" placeholderTextColor={palette.text+'77'} value={minutes} onChangeText={setMinutes} style={s.input} />
      <TextInput placeholder="Type (walk, work, chores...)" placeholderTextColor={palette.text+'77'} value={type} onChangeText={setType} style={s.input} />
      <Pressable onPress={add} style={s.button}><Text style={s.buttonText}>Log Activity</Text></Pressable>
      <Text style={[s.text,{ marginTop: 12, fontWeight:'700' }]}>Recent</Text>
      {items.slice(0,10).map(i=> (<Text key={i.id} style={s.text}>• {new Date(i.createdAt?.toDate?.()||Date.now()).toLocaleString()} — {i.type||'activity'}: {i.minutes} min</Text>))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
  });
}

