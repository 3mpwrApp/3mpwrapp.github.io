import { Link, router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../../constants/A11Y';
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

export default function DMListScreenImpl() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { user } = useAuth();
  const { isBlocked } = useBlocks();
  const [items, setItems] = React.useState<any[]>([]);
  const [target, setTarget] = React.useState('');

  React.useEffect(() => {
    let unsub: any = null;
    (async () => {
      try {
        await ensure();
        if (!user?.uid) return;
        const q = fs.query(
          fs.collection(db, 'dm_threads'),
          fs.where('participants', 'array-contains', user.uid),
          fs.orderBy('updatedAt', 'desc')
        );
        unsub = fs.onSnapshot(q, (snap: any) => {
          const list = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }))
            .filter((t: any) => !t.participants.some((p: string) => isBlocked(p)));
          setItems(list);
        });
      } catch {}
    })();
    return () => { try { unsub?.(); } catch {} };
  }, [user?.uid]);

  const startDM = async () => {
    const other = target.trim();
    if (!user?.uid || !other) return;
    if (isBlocked(other) || other === user.uid) return;
    try {
      await ensure();
      const participants = [user.uid, other].sort();
      const threadId = participants.join('__');
      await fs.setDoc(fs.doc(db, 'dm_threads', threadId), {
        participants,
        createdAt: fs.serverTimestamp(),
        updatedAt: fs.serverTimestamp(),
        last: '',
      }, { merge: true });
  router.push(`/(tabs)/community/dms/${threadId}` as any);
    } catch {}
  };

  return (
    <View style={s.container} accessibilityLabel="Direct Messages list" accessible>
      <Text style={s.title} accessibilityRole='header'>Direct Messages</Text>
      <View style={{ flexDirection:'row', gap:8 }}>
        <TextInput
          accessibilityLabel="Enter user ID to start a direct message"
          style={[s.input, { flex:1 }]} placeholder="Enter exact user ID (prototype)"
          placeholderTextColor={palette.text+'77'} value={target} onChangeText={setTarget} />
        <A11yPressable accessibilityRole="button" accessibilityLabel="Start direct message" hitSlop={HIT_SLOP_8} onPress={startDM} style={s.button}>
          <Text style={s.buttonText}>Start</Text>
        </A11yPressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <A11yPressable accessibilityRole="button" accessibilityLabel={`Open DM ${item.id}`} onPress={() => router.push(`/(tabs)/community/dms/${item.id}` as any)} style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]}>
            <Text style={s.rowText}>{item.participants.filter((p: string) => p !== user?.uid).join(', ')}</Text>
            <Text style={[s.rowSub, { marginTop: 2 }]} numberOfLines={1}>{item.last || 'No messages yet'}</Text>
          </A11yPressable>
        )}
        contentContainerStyle={{ paddingTop: 8 }}
      />
      <Text style={[s.rowSub, { marginTop: 12 }]}>Note: This is a minimal DM prototype using user IDs for discovery.</Text>
      <Link accessibilityRole="link" href="/(tabs)/community" style={{ color: palette.primary, marginTop: 8 }}>Back to Community</Link>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight:'700', color: palette.text, marginBottom: 8 },
    row: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    rowText: { color: palette.text, fontWeight:'700' },
    rowSub: { color: palette.text, opacity: 0.8 },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 8 },
    button: { backgroundColor: palette.primary, borderRadius: 8, paddingHorizontal: 12, justifyContent:'center' },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
  });
}
