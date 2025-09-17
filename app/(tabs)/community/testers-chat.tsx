import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import A11yPressable from '../../../components/A11yPressable';
import { useAppPalette } from '../../../theme/usePalette';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { db, auth } from '../../../firebase/config';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { setTyping, touchPresence, setLastRead } from '../../../services/community';

export const options = { href: null };

type Message = { id?: string; text: string; authorUid: string; createdAt?: any };

export default function TestersChat() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Testers Chat');
  useFocusOnRefOnMount(titleRef);
  const [items, setItems] = React.useState<Message[]>([]);
  const [text, setText] = React.useState('');

  React.useEffect(() => {
    const col = collection(db, 'chats', 'testers', 'messages');
    const q = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Message[]);
    });
    return unsub;
  }, []);

  // Presence heartbeat and mark as read when opening
  React.useEffect(() => {
    let mounted = true;
    const beat = async () => { if (mounted) await touchPresence('testers'); };
    beat();
    const id = setInterval(beat, 30000);
    setLastRead('testers');
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const send = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) { Alert.alert('Sign in required', 'Please sign in to chat.'); return; }
    if (!text.trim()) return;
    try {
      const col = collection(db, 'chats', 'testers', 'messages');
      await addDoc(col, { text: text.trim(), authorUid: uid, createdAt: serverTimestamp() });
      setText('');
    } catch (e: any) {
      Alert.alert('Not sent', e?.message || 'Unable to send.');
    }
  };

  return (
    <View style={s.container} accessibilityLabel="Testers chat" accessible>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Testers Chat</Text>
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
      <View style={s.inputRow}>
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
      </View>
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
    inputRow: { flexDirection: 'row', padding: 12, alignItems: 'center', gap: 8 },
    input: { flex: 1, borderWidth: 1, borderColor: palette.muted, borderRadius: 999, paddingHorizontal: 12, color: palette.text },
    sendBtn: { backgroundColor: palette.primary, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
    sendText: { color: palette.onPrimary, fontWeight: '700' },
  });
}
