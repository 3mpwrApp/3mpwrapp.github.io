import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { GapView } from '../../../components/GapView';
import { auth, db } from '../../../firebase/config';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { setLastRead, setTyping, touchPresence } from '../../../services/community';
import { isCloudConsentEnabled } from '../../../services/consent';
import { useAppPalette } from '../../../theme/usePalette';

export type Message = { id?: string; text: string; authorUid: string; createdAt?: any };

export default function TestersChatImpl() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Testers Chat');
  useFocusOnRefOnMount(titleRef);
  const [items, setItems] = React.useState<Message[]>([]);
  const [text, setText] = React.useState('');
  const [present, setPresent] = React.useState<number>(0);
  const [typing, setTypingUsers] = React.useState<number>(0);
  const [unread, setUnread] = React.useState<number>(0);
  const roomId = 'testers';

  React.useEffect(() => {
    if (!isCloudConsentEnabled()) return;
    const col = collection(db, 'chats', roomId, 'messages');
    const q = query(col, orderBy('createdAt', 'desc'));
    let lastReadTs = 0;
    const loadLastRead = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return 0;
        const d = await getDoc(doc(db, 'chats', roomId, 'last_read', uid));
        const ts = (d.data() as any)?.ts?.toDate?.()?.getTime?.() || 0;
        return ts as number;
      } catch { return 0; }
    };
    let unsubMessages: any;
    loadLastRead().then((ts) => {
      lastReadTs = ts;
      unsubMessages = onSnapshot(q, (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Message[]);
        // compute unread
        try {
          const count = snap.docs.filter((d) => {
            const t = (d.data() as any)?.createdAt?.toDate?.()?.getTime?.() || 0;
            return t > lastReadTs;
          }).length;
          setUnread(count);
        } catch {}
      });
    });
    // presence/typing listeners
    const unsubPresence = onSnapshot(collection(db, 'chats', roomId, 'presence'), (snap) => setPresent(snap.size));
    const unsubTyping = onSnapshot(collection(db, 'chats', roomId, 'typing'), (snap) => {
      try {
        const me = auth.currentUser?.uid;
        const n = snap.docs.filter((d) => (d.data() as any)?.typing && d.id !== me).length;
        setTypingUsers(n);
      } catch { setTypingUsers(0); }
    });
    return () => { unsubMessages?.(); unsubPresence(); unsubTyping(); };
  }, []);

  // Presence heartbeat and mark as read when opening
  React.useEffect(() => {
    let mounted = true;
    const beat = async () => { if (mounted) await touchPresence('testers'); };
    if (isCloudConsentEnabled()) beat();
  const id = setInterval(beat, 30000);
  try { (id as any)?.unref?.(); } catch {}
  if (isCloudConsentEnabled()) setLastRead('testers');
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const send = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) { Alert.alert('Sign in required', 'Please sign in to chat.'); return; }
    if (!text.trim()) return;
    try {
      if (!isCloudConsentEnabled()) { Alert.alert('Cloud disabled','Enable cloud features in Settings → Privacy to use chat.'); return; }
      const col = collection(db, 'chats', 'testers', 'messages');
      await addDoc(col, { text: text.trim(), authorUid: uid, createdAt: serverTimestamp() });
      setText('');
    } catch (e: any) {
      Alert.alert('Not sent', e?.message || 'Unable to send.');
    }
  };

  return (
    <View style={s.container} accessibilityLabel="Testers chat" accessible>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Testers Chat {unread > 0 ? `(${unread} new)` : ''}
      </Text>
      <DisclaimerBanner type="general" compact />
      <Text style={s.meta}>Online: {present}{typing > 0 ? ` — typing…` : ''}</Text>
      <FlatList
        inverted
        data={items}
        keyExtractor={(m) => m.id!}
        renderItem={({ item }) => (
          <View style={s.msgRow}>
            <Text style={s.msgText}>{item.text}</Text>
            <Text style={s.msgMeta}>{new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleTimeString()}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
        style={{ flex: 1 }}
      />
      <GapView style={s.inputRow} gap={8}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor={palette.text}
          style={s.input}
          onFocus={() => setTyping('testers', true)}
          onBlur={() => setTyping('testers', false)}
          onChange={() => setTyping('testers', text.length > 0)}
        />
        <A11yPressable onPress={send} style={s.sendBtn}>
          <Text style={s.sendText}>Send</Text>
        </A11yPressable>
      </GapView>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { color: palette.text, fontSize: 18, fontWeight: '700', padding: 16, paddingBottom: 0 },
    msgRow: { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    msgText: { color: palette.text },
    msgMeta: { color: palette.text, opacity: 0.6, fontSize: 12 },
    meta: { color: palette.text, opacity: 0.7, paddingHorizontal: 16, marginBottom: 4 },
    inputRow: { flexDirection: 'row', padding: 12, alignItems: 'center' },
    input: { flex: 1, borderWidth: 1, borderColor: palette.muted, borderRadius: 999, paddingHorizontal: 12, color: palette.text },
    sendBtn: { backgroundColor: palette.primary, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
    sendText: { color: palette.onPrimary, fontWeight: '700' },
  });
}
