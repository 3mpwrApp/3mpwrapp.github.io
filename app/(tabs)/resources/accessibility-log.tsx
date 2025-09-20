import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDoc, collection, startAfter as fsStartAfter, getDocs, orderBy, limit as ql, query, serverTimestamp, where } from 'firebase/firestore';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { auth, db } from '../../../firebase/config';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

type Entry = { id: string; ts: number; description: string; location?: string };
const KEY = 'work.access.log.v1';

export default function AccessibilityLog() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [items, setItems] = React.useState<Entry[]>([]);
  const [view, setView] = React.useState<'local'|'cloud'>('local');
  const [cloud, setCloud] = React.useState<any[]>([]);
  const [cursor, setCursor] = React.useState<any | null>(null);

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

  const loadCloud = async (more = false) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) { Alert.alert('Sign in required','Login to view cloud.'); return; }
      const base = query(collection(db,'work_access_logs'), where('uid','==', uid), orderBy('ts','desc'), ql(20));
      const q = more && cursor ? query(base, fsStartAfter(cursor)) : base;
      const snap = await getDocs(q);
      setCloud(more ? cloud.concat(snap.docs.map(d=>({ id: d.id, ...(d.data() as any) }))) : snap.docs.map(d=>({ id: d.id, ...(d.data() as any) })));
      setCursor(snap.docs[snap.docs.length-1] || null);
    } catch { Alert.alert('Load failed','Could not load cloud logs.'); }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Workplace Accessibility Log</Text>
      <Text style={s.text}>Log daily barriers with timestamps for future evidence.</Text>
      <View style={{ flexDirection:'row', gap:8, marginTop: 6 }}>
  <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> setView('local')} style={[s.chip, view==='local' && s.chipActive]}><Text style={{ color: view==='local'? palette.onPrimary: palette.text, fontWeight:'700' }}>Local</Text></A11yPressable>
  <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> { setView('cloud'); loadCloud(false); }} style={[s.chip, view==='cloud' && s.chipActive]}><Text style={{ color: view==='cloud'? palette.onPrimary: palette.text, fontWeight:'700' }}>Cloud</Text></A11yPressable>
      </View>
      <TextInput placeholder="Barrier or incident (e.g., no breaks, stairs)" placeholderTextColor={palette.text+'77'} value={description} onChangeText={setDescription} style={s.input} />
      <TextInput placeholder="Location / context (optional)" placeholderTextColor={palette.text+'77'} value={location} onChangeText={setLocation} style={s.input} />
      {view==='local' && (<View style={{ flexDirection:'row', gap:8 }}>
  <A11yPressable hitSlop={HIT_SLOP_8} onPress={add} style={[s.button,{ flex:1 }]}><Text style={s.buttonText}>Add Entry</Text></A11yPressable>
  <A11yPressable hitSlop={HIT_SLOP_8} onPress={syncAll} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={{ color: palette.text, fontWeight:'700' }}>Sync</Text></A11yPressable>
      </View>)}
      {view==='local' ? (
      <FlatList data={items} keyExtractor={i=>i.id} renderItem={({item:i})=> (
        <View style={s.card}>
          <Text style={s.cardTitle}>{new Date(i.ts).toLocaleString()}</Text>
          <Text style={s.text}>{i.description}</Text>
          {!!i.location && <Text style={s.text}>@ {i.location}</Text>}
          <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>remove(i.id)} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}> 
            <Text style={[s.buttonText,{ color: palette.text }]}>Delete</Text>
          </A11yPressable>
        </View>
      )} />
      ) : (
        <>
          {cloud.map(c => (
            <View key={c.id} style={s.card}>
              <Text style={s.cardTitle}>{c.ts?.toDate?.()?.toLocaleString?.() || '-'}</Text>
              <Text style={s.text}>{c.description}</Text>
              {!!c.location && <Text style={s.text}>@ {c.location}</Text>}
            </View>
          ))}
          <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> loadCloud(true)} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}> 
            <Text style={[s.buttonText,{ color: palette.text }]}>Load more</Text>
          </A11yPressable>
        </>
      )}
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
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  });
}
