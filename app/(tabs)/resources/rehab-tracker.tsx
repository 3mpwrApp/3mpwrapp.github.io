import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppPalette } from '../../../theme/usePalette';
import { auth, db } from '../../../firebase/config';
import { addDoc, collection, serverTimestamp, getDocs, query, where, orderBy, limit as ql, startAfter as fsStartAfter } from 'firebase/firestore';

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
  const [view, setView] = React.useState<'local'|'cloud'>('local');
  const [cloud, setCloud] = React.useState<any[]>([]);
  const [cursor, setCursor] = React.useState<any | null>(null);

  React.useEffect(()=>{ (async()=>{ try{ const raw = await AsyncStorage.getItem(KEY); if (raw) setItems(JSON.parse(raw)); } catch{} })(); },[]);
  const save = async (next: Entry[]) => { setItems(next); try { await AsyncStorage.setItem(KEY, JSON.stringify(next)); } catch{} };

  const add = async () => {
    const e: Entry = { id: String(Date.now()), date: new Date().toISOString().slice(0,10), walk, grip, painFree, note };
    await save([e, ...items]); setWalk(''); setGrip(''); setPainFree(''); setNote('');
    try {
      const uid = auth.currentUser?.uid;
      if (uid) await addDoc(collection(db,'rehab_progress'), { uid, createdAt: serverTimestamp(), ...e });
    } catch {}
  };
  const syncAll = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) { Alert.alert('Sign in required','Login to sync.'); return; }
      for (const e of items) {
        await addDoc(collection(db,'rehab_progress'), { uid, createdAt: serverTimestamp(), ...e });
      }
      Alert.alert('Synced','Uploaded your progress logs.');
    } catch { Alert.alert('Sync failed','Could not sync to cloud.'); }
  };
  const remove = async (id: string) => { await save(items.filter(i=>i.id!==id)); };
  const exportJSON = async () => {
    try { const FS = await import('expo-file-system'); const p = FS.cacheDirectory + `rehab_${Date.now()}.json`; await FS.writeAsStringAsync(p, JSON.stringify(items, null, 2)); const Share = await import('expo-sharing'); if (await Share.isAvailableAsync()) await Share.shareAsync(p); else Alert.alert('Saved','JSON saved to cache.'); } catch { Alert.alert('Export failed','Could not create JSON.'); }
  };
  const importTemplate = async () => {
    try { const DP = await import('expo-document-picker'); const res = await DP.getDocumentAsync({ type:'application/json' }); const a = res?.assets?.[0]; if (!a?.uri) return; const FS = await import('expo-file-system'); const raw = await FS.readAsStringAsync(a.uri); const arr = JSON.parse(raw) as Entry[]; await save(arr.concat(items).slice(0, 200)); Alert.alert('Imported','Template imported.'); } catch { Alert.alert('Import failed','Could not import.'); }
  };

  const loadCloud = async (more = false) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) { Alert.alert('Sign in required','Login to view cloud.'); return; }
      const base = query(collection(db,'rehab_progress'), where('uid','==', uid), orderBy('createdAt','desc'), ql(20));
      const q = more && cursor ? query(base, fsStartAfter(cursor)) : base;
      const snap = await getDocs(q);
      setCloud(more ? cloud.concat(snap.docs.map(d=>({ id: d.id, ...(d.data() as any) }))) : snap.docs.map(d=>({ id: d.id, ...(d.data() as any) })));
      setCursor(snap.docs[snap.docs.length-1] || null);
    } catch { Alert.alert('Load failed','Could not load cloud logs.'); }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Rehab Progress Tracker</Text>
      <Text style={s.text}>Log small wins to boost morale and share with providers.</Text>
      <View style={{ flexDirection:'row', gap:8, marginBottom: 6 }}>
        <Pressable onPress={()=> setView('local')} style={[s.chip, view==='local' && s.chipActive]}><Text style={{ color: view==='local'? palette.onPrimary: palette.text, fontWeight:'700' }}>Local</Text></Pressable>
        <Pressable onPress={()=> { setView('cloud'); loadCloud(false); }} style={[s.chip, view==='cloud' && s.chipActive]}><Text style={{ color: view==='cloud'? palette.onPrimary: palette.text, fontWeight:'700' }}>Cloud</Text></Pressable>
      </View>
      {view==='local' && (
      <>
      <TextInput placeholder="Walking distance (e.g., 300m)" placeholderTextColor={palette.text+'77'} value={walk} onChangeText={setWalk} style={s.input} />
      <TextInput placeholder="Grip strength (e.g., 20kg)" placeholderTextColor={palette.text+'77'} value={grip} onChangeText={setGrip} style={s.input} />
      <TextInput placeholder="Pain‑reduced days this week" placeholderTextColor={palette.text+'77'} value={painFree} onChangeText={setPainFree} style={s.input} />
      <TextInput placeholder="Notes" placeholderTextColor={palette.text+'77'} value={note} onChangeText={setNote} style={s.input} />
      <View style={{ flexDirection:'row', gap:8 }}>
        <Pressable onPress={add} style={[s.button,{ flex:1 }]}><Text style={s.buttonText}>Log Progress</Text></Pressable>
        <Pressable onPress={syncAll} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={[s.buttonText,{ color: palette.text }]}>Sync</Text></Pressable>
      </View>
      </>
      )}
      {view==='local' ? (
      <View>
      <View style={{ flexDirection:'row', gap:8 }}>
        <Pressable onPress={exportJSON} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={[s.buttonText,{ color: palette.text }]}>Export JSON</Text></Pressable>
        <Pressable onPress={importTemplate} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}><Text style={[s.buttonText,{ color: palette.text }]}>Import Template</Text></Pressable>
      </View>
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
      ) : (
        <>
          {cloud.map(c => (
            <View key={c.id} style={s.card}>
              <Text style={s.cardTitle}>{c.createdAt?.toDate?.()?.toLocaleString?.() || '-'}</Text>
              {!!c.walk && <Text style={s.text}>Walk: {c.walk}</Text>}
              {!!c.grip && <Text style={s.text}>Grip: {c.grip}</Text>}
              {!!c.painFree && <Text style={s.text}>Reduced pain days: {c.painFree}</Text>}
              {!!c.note && <Text style={s.text}>{c.note}</Text>}
            </View>
          ))}
          <Pressable onPress={()=> loadCloud(true)} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}>
            <Text style={[s.buttonText,{ color: palette.text }]}>Load more</Text>
          </Pressable>
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
