import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../../constants/a11y';
import { useAuth } from '../../../../context/AuthContext';
import { useBlocks } from '../../../../store/blocks';
import { useAppPalette } from '../../../../theme/usePalette';

let fs: any, db: any;
async function ensure() {
  if (!fs) {
    fs = await import('firebase/firestore');
    db = (await import('../../../../firebase/config')).db;
  }
}

export const options = { href: null };

export default function DmThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useAppPalette();
  const s = styles(palette);
  const { user } = useAuth();
  const { isBlocked } = useBlocks();
  const [msgs, setMsgs] = React.useState<any[]>([]);
  const [text, setText] = React.useState('');
  const [participants, setParticipants] = React.useState<string[]>([]);

  React.useEffect(() => {
    let unsub1: any = null, unsub2: any = null;
    (async () => {
      if (!id) return;
      try {
        await ensure();
        unsub1 = fs.onSnapshot(fs.doc(db, 'dm_threads', String(id)), (d: any) => {
          const data = (d.data() || {}) as any; setParticipants(data.participants || []);
        });
        const q = fs.query(fs.collection(db, 'dm_threads', String(id), 'messages'), fs.orderBy('createdAt','asc'));
        unsub2 = fs.onSnapshot(q, (snap: any) => {
          const list = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }))
            .filter((m: any) => !isBlocked(m.authorUid));
          setMsgs(list);
        });
      } catch {}
    })();
    return () => { try { unsub1?.(); unsub2?.(); } catch {} };
  }, [id]);

  const send = async () => {
    if (!text.trim() || !user?.uid || !id) return;
    try {
      await ensure();
      await fs.addDoc(fs.collection(db, 'dm_threads', String(id), 'messages'), { text: text.trim(), authorUid: user.uid, createdAt: fs.serverTimestamp() });
      await fs.setDoc(fs.doc(db, 'dm_threads', String(id)), { last: text.trim(), updatedAt: fs.serverTimestamp() }, { merge: true });
      // Fire-and-forget server push notify (if server configured)
      try {
        const base = process.env.EXPO_PUBLIC_LLM_BASE || process.env.EXPO_PUBLIC_API_BASE;
        if (base) {
          await fetch(`${String(base).replace(/\/$/,'')}/notify-dm`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ threadId: String(id), fromUid: user.uid, message: text.trim() }) });
        }
      } catch {}
      setText('');
    } catch {}
  };

  const other = participants.filter((p) => p !== user?.uid)[0] || 'User';

  return (
    <View style={s.container}>
      <Text style={s.title}>DM with {other}</Text>
      <FlatList
        data={msgs}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={s.msg}>
            <Text style={s.msgMeta}>{item.authorUid}</Text>
            <Text style={s.msgText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingTop: 8 }}
      />
      <View style={{ flexDirection:'row', gap:8, marginTop: 8 }}>
        <TextInput style={[s.input,{ flex:1 }]} placeholder="Message" placeholderTextColor={palette.text+'77'} value={text} onChangeText={setText} />
        <A11yPressable accessibilityRole="button" accessibilityLabel="Send" hitSlop={HIT_SLOP_8} onPress={send} style={s.button}>
          <Text style={s.buttonText}>Send</Text>
        </A11yPressable>
      </View>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 18, fontWeight:'700', color: palette.text },
    msg: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    msgMeta: { color: palette.text, opacity: 0.7, marginBottom: 2 },
    msgText: { color: palette.text },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 8 },
    button: { backgroundColor: palette.primary, borderRadius: 8, paddingHorizontal: 12, justifyContent:'center' },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
  });
}
