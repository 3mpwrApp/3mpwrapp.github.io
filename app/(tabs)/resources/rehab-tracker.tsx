import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

type Entry = { id: string; date: string; walk?: string; grip?: string; painFree?: string; note?: string };

const KEY = 'rehab.tracker.v1';

export default function RehabTracker() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [walk, setWalk] = React.useState('');
  const [grip, setGrip] = React.useState('');
  const [painFree, setPainFree] = React.useState('');
  const [note, setNote] = React.useState('');
  const [items, setItems] = React.useState<Entry[]>([]);

  React.useEffect(()=>{ (async()=>{ try{ const raw = await AsyncStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw)); } catch{} })(); },[]);
  const save = async (next: Entry[]) => { setItems(next); try { await AsyncStorage.setItem(KEY, JSON.stringify(next)); } catch{} };

  const add = async () => {
    const e: Entry = { id: String(Date.now()), date: new Date().toISOString().slice(0,10), walk, grip, painFree, note };
    await save([e, ...items]); setWalk(''); setGrip(''); setPainFree(''); setNote('');
  };
  const remove = async (id: string) => { await save(items.filter(i=>i.id!==id)); };

  return (
    <View style={s.container}>
      <Text style={s.title}>Rehab Progress Tracker</Text>
      <Text style={s.text}>Log small wins to boost morale and share with providers.</Text>
      <TextInput placeholder="Walking distance (e.g., 300m)" placeholderTextColor={palette.text+'77'} value={walk} onChangeText={setWalk} style={s.input} />
      <TextInput placeholder="Grip strength (e.g., 20kg)" placeholderTextColor={palette.text+'77'} value={grip} onChangeText={setGrip} style={s.input} />
      <TextInput placeholder="Pain‑reduced days this week" placeholderTextColor={palette.text+'77'} value={painFree} onChangeText={setPainFree} style={s.input} />
      <TextInput placeholder="Notes" placeholderTextColor={palette.text+'77'} value={note} onChangeText={setNote} style={s.input} />
      <Pressable onPress={add} style={s.button}><Text style={s.buttonText}>Log Progress</Text></Pressable>
      <FlatList data={items} keyExtractor={i=>i.id} renderItem={({item:i})=> (
        <View style={s.card}>
          <Text style={s.cardTitle}>{i.date}</Text>
          {!!i.walk && <Text style={s.text}>Walk: {i.walk}</Text>}
          {!!i.grip && <Text style={s.text}>Grip: {i.grip}</Text>}
          {!!i.painFree && <Text style={s.text}>Reduced pain days: {i.painFree}</Text>}
          {!!i.note && <Text style={s.text}>{i.note}</Text>}
          <Pressable onPress={()=>remove(i.id)} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}>
            <Text style={[s.buttonText,{ color: palette.text }]}>Delete</Text>
          </Pressable>
        </View>
      )} />
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
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight:'700' },
  });
}
