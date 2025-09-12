import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppPalette } from '../../../theme/usePalette';
import { db } from '../../../firebase/config';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { auth } from '../../../firebase/config';

export const options = { href: null };

export default function MutualChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useAppPalette();
  const s = styles(palette);
  const [msg, setMsg] = React.useState('');
  const [items, setItems] = React.useState<any[]>([]);
  React.useEffect(()=>{
    try {
      const q = query(collection(db,'mutual_aid_posts', String(id), 'chat'), orderBy('createdAt','asc'));
      const unsub = onSnapshot(q, (snap) => { setItems(snap.docs.map(d=>({ id:d.id, ...(d.data() as any) }))); });
      return () => unsub();
    } catch {}
  },[id]);
  // Presence + typing
  React.useEffect(() => {
    const uid = auth.currentUser?.uid || 'anon';
    const ref = doc(db, 'mutual_aid_posts', String(id), 'presence', uid);
    (async () => { try { await setDoc(ref, { lastSeen: serverTimestamp(), typing: false }, { merge: true }); } catch {} })();
    const i = setInterval(async()=>{ try { await setDoc(ref, { lastSeen: serverTimestamp() }, { merge: true }); } catch {} }, 30000);
    return () => { clearInterval(i); };
  }, [id]);
  return (
    <View style={s.container}>
      <Text style={s.title}>Mutual Aid Chat</Text>
      {items.map(i => (<Text key={i.id} style={s.text}>• {new Date(i.createdAt?.toDate?.()||Date.now()).toLocaleTimeString()} — {i.message}</Text>))}
      <View style={{ flexDirection:'row', gap:8, marginTop: 8 }}>
        <TextInput placeholder="Message" placeholderTextColor={palette.text+'77'} value={msg} onChangeText={async (t)=>{ setMsg(t); try { const uid = auth.currentUser?.uid || 'anon'; await setDoc(doc(db,'mutual_aid_posts', String(id), 'presence', uid), { typing: !!t }, { merge: true }); } catch {} }} style={[s.input,{ flex:1 }]} />
        <Pressable onPress={async()=>{ try{ await addDoc(collection(db,'mutual_aid_posts', String(id), 'chat'), { message: msg, createdAt: serverTimestamp() }); setMsg(''); } catch { Alert.alert('Failed','Could not send'); } }} style={s.button}><Text style={s.buttonText}>Send</Text></Pressable>
      </View>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center' },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
  });
}
