import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppPalette } from '../../../theme/usePalette';
import { db } from '../../../firebase/config';
import { addDoc, collection, orderBy, query, serverTimestamp, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { registerExpoPushToken } from '../../../services/tokens';
import { auth } from '../../../firebase/config';

export const options = { href: null };

export default function MutualChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useAppPalette();
  const s = styles(palette);
  const [msg, setMsg] = React.useState('');
  const [items, setItems] = React.useState<any[]>([]);
  const [roster, setRoster] = React.useState<any[]>([]);
  const lastRef = React.useRef<number>(0);
  React.useEffect(()=>{
    let cleanup: (()=>void) | undefined;
    try {
      const q = query(collection(db,'mutual_aid_posts', String(id), 'chat'), orderBy('createdAt','asc'));
      const unsub = onSnapshot(q, async (snap) => {
        const rows = snap.docs.map(d=>({ id:d.id, ...(d.data() as any) }));
        setItems(rows);
        const me = auth.currentUser?.uid || 'anon';
        const latest = rows[rows.length-1];
        const ts = latest?.createdAt?.toDate?.()?.getTime?.() || 0;
        if (latest && ts && ts > lastRef.current && latest.author && latest.author !== me) {
          try { const Notifications = await import('expo-notifications'); await Notifications.scheduleNotificationAsync({ content: { title: 'New message', body: String(latest.message||'') }, trigger: null }); } catch {}
        }
        if (ts) lastRef.current = ts;
      });
      cleanup = () => unsub();
    } catch {}
    return () => { if (cleanup) cleanup(); };
  },[id]);
  // Presence + typing
  React.useEffect(() => {
    const uid = auth.currentUser?.uid || 'anon';
    const ref = doc(db, 'mutual_aid_posts', String(id), 'presence', uid);
    (async () => {
      try {
        await setDoc(ref, { lastSeen: serverTimestamp(), typing: false }, { merge: true });
        // add to participants index for server-based push notifications
        await setDoc(doc(db, 'mutual_aid_posts', String(id), 'participants', uid), { joinedAt: serverTimestamp(), lastSeen: serverTimestamp() }, { merge: true });
      } catch {}
    })();
    const i = setInterval(async()=>{ try { await setDoc(ref, { lastSeen: serverTimestamp() }, { merge: true }); } catch {} }, 30000);
    // Register device token for server-based push (Expo token)
    registerExpoPushToken();
    return () => { clearInterval(i); };
  }, [id]);
  // Roster snapshot
  React.useEffect(() => {
    let cleanup: (()=>void) | undefined;
    try {
      const q = collection(db, 'mutual_aid_posts', String(id), 'presence');
      const unsub = onSnapshot(q, (snap) => {
        const now = Date.now();
        setRoster(snap.docs.map(d=>({ id: d.id, ...(d.data() as any) })).filter(u => (now - (u.lastSeen?.toDate?.()?.getTime?.()||0)) < 2*60*1000));
      });
      cleanup = () => unsub();
    } catch {}
    return () => { if (cleanup) cleanup(); };
  }, [id]);
  return (
    <View style={s.container}>
      <Text style={s.title}>Mutual Aid Chat</Text>
      <View style={{ marginBottom: 8 }}>
        <Text style={s.text}>Present: {roster.map(r => r.id).join(', ') || '—'}</Text>
        {!!roster.some(r => r.typing) && <Text style={s.text}>Someone is typing…</Text>}
      </View>
      {items.map(i => (<Text key={i.id} style={s.text}>• {new Date(i.createdAt?.toDate?.()||Date.now()).toLocaleTimeString()} — {i.message}</Text>))}
      <View style={{ flexDirection:'row', gap:8, marginTop: 8 }}>
        <TextInput placeholder="Message" placeholderTextColor={palette.text+'77'} value={msg} onChangeText={async (t)=>{ setMsg(t); try { const uid = auth.currentUser?.uid || 'anon'; await setDoc(doc(db,'mutual_aid_posts', String(id), 'presence', uid), { typing: !!t }, { merge: true }); } catch {} }} style={[s.input,{ flex:1 }]} />
        <Pressable onPress={async()=>{ try{ const postId = String(id); const author = auth.currentUser?.uid || 'anon'; await setDoc(doc(db,'mutual_aid_posts', postId, 'participants', author), { joinedAt: serverTimestamp(), lastSeen: serverTimestamp() }, { merge: true }); await addDoc(collection(db,'mutual_aid_posts', postId, 'chat'), { message: msg, createdAt: serverTimestamp(), author }); setMsg(''); try { const base = process.env.EXPO_PUBLIC_LLM_BASE; if (base) { await fetch(`${base.replace(/\/$/,'')}/notify-chat-post`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ postId, fromUid: author, message: msg }) }); } } catch {} } catch { Alert.alert('Failed','Could not send'); } }} style={s.button}><Text style={s.buttonText}>Send</Text></Pressable>
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
