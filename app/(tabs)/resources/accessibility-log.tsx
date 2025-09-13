import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppPalette } from '../../../theme/usePalette';
import { auth, db } from '../../../firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export const options = { href: null };

type Entry = { id: string; ts: number; description: string; location?: string };
const KEY = 'work.access.log.v1';

export default function AccessibilityLog() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [items, setItems] = React.useState<Entry[]>([]);

  React.useEffect(()=>{ (async()=>{ try{ const raw = await AsyncStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw)); } catch{} })(); },[]);
  const save = async (next: Entry[]) => { setItems(next); try{ await AsyncStorage.setItem(KEY, JSON.stringify(next)); } catch{} };

  const add = async () => {
    const e: Entry = { id: String(Date.now()), ts: Date.now(), description, location };
    await save([e, ...items]); setDescription(''); setLocation('');
    try {
      const uid = auth.currentUser?.uid;
      if (uid) await addDoc(collection(db,'work_access_logs'), { uid, ts: serverTimestamp(), description: e.description, location: e.location||null });
    } catch {}
  };
  const remove = async (id: string) => save(items.filter(i=>i.id!==id));

  const syncAll = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) { Alert.alert('Sign in required','Login to sync.'); return; }
      for (const e of items) {
        await addDoc(collection(db,'work_access_logs'), { uid, ts: serverTimestamp(), description: e.description, location: e.location||null });
      }
      Alert.alert('Synced','Uploaded your log entries.');
    } catch { Alert.alert('Sync failed','Could not sync to cloud.'); }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Workplace Accessibility Log</Text>
      <Text style={s.text}>Log daily barriers with timestamps for future evidence.</Text>
      <TextInput placeholder="Barrier or incident (e.g., no breaks, stairs)" placeholderTextColor={palette.text+'77'} value={description} onChangeText={setDescription} style={s.input} />
      <TextInput placeholder="Location / context (optional)" placeholderTextColor={palette.text+'77'} value={location} onChangeText={setLocation} style={s.input} />
      <View style={{ flexDirection:'row', gap:8 }}>
        <Pressable onPress={add} style={[s.button,{ flex:1 }]}><Text style={s.buttonText}>Add Entry</Text></Pressable>
        <Pressable onPress={syncAll} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={{ color: palette.text, fontWeight:'700' }}>Sync</Text></Pressable>
      </View>
      <FlatList data={items} keyExtractor={i=>i.id} renderItem={({item:i})=> (
        <View style={s.card}>
          <Text style={s.cardTitle}>{new Date(i.ts).toLocaleString()}</Text>
          <Text style={s.text}>{i.description}</Text>
          {!!i.location && <Text style={s.text}>@ {i.location}</Text>}
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
