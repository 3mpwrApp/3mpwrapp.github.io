import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import React from "react";
import { FlatList, StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";

import A11yPressable from '../../../../components/A11yPressable';
import { HIT_SLOP_8, touchTarget } from "../../../../constants/a11y";
import { useAuth } from "../../../../context/AuthContext";
import { db } from "../../../../firebase/config";
import { setLastRead, setTyping } from "../../../../services/community";
import { useNotificationDispatcher } from "../../../../services/notifications.dispatcher";
import { useBlocks } from "../../../../store/blocks";
import { CommunityProvider } from "../../../../store/community";
import { colors, type Palette } from "../../../../theme/colors";

function ThreadInner() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const [items, setItems] = React.useState<any[]>([]);
  const [text, setText] = React.useState('');
  const [othersTyping, setOthersTyping] = React.useState(false);
  const { user } = useAuth();
  const { dispatchDomainEvent } = useNotificationDispatcher();
  const { blockUser, isBlocked } = useBlocks();

  React.useEffect(() => {
    if (!id) return;
    const col = collection(db, 'comments');
    const q = query(col, where('threadId','==', String(id)), orderBy('createdAt','asc'));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))));
    const unsubTyping = onSnapshot(collection(db,'chats','thread_'+String(id),'typing'), (snap) => {
      try { const me = user?.uid; const any = snap.docs.some(d => (d.data() as any)?.typing && d.id !== me); setOthersTyping(any); } catch { setOthersTyping(false); }
    });
    setLastRead('thread_'+String(id));
    return () => { unsub(); unsubTyping(); };
  }, [id]);

  const send = async () => {
    if (!user || !text.trim()) return;
    try {
      await addDoc(collection(db,'comments'), { threadId: String(id), text: text.trim(), authorUid: user.uid, createdAt: serverTimestamp() });
      setText('');
      try {
        // Fetch thread title for personalization
        const tRef = doc(db, 'threads', String(id));
        const tSnap = await getDoc(tRef as any);
        const threadTitle = (tSnap.data() as any)?.title || 'Thread';
        await dispatchDomainEvent({
          event: 'community.comment.added',
          payload: {
            threadTitle,
            snippet: text.trim().slice(0, 80),
            route: `/(tabs)/community/threads/${String(id)}`,
            routeParams: { id: String(id) },
          },
        });
      } catch {}
    } catch {}
  };

  return (
    <View style={styles.container}>
      {othersTyping && <Text style={{ color: palette.text, opacity: 0.7, marginBottom: 4 }}>Someone is typing…</Text>}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text style={styles.commentAuthor}>{item.authorUid || "User"}</Text>
            <Text style={styles.commentText}>{item.text}</Text>
            <View style={{ flexDirection:'row', gap:8, marginTop: 4 }}>
              {!!item.authorUid && item.authorUid !== user?.uid && !isBlocked(item.authorUid) && (
                <A11yPressable accessibilityRole="button" accessibilityLabel="Start DM" onPress={() => {
                  const parts = [String(user?.uid||'anon'), String(item.authorUid)].sort();
                  const threadId = parts.join('__');
                  router.push(`/(tabs)/community/dms/${threadId}` as any);
                }} style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}>
                  <Text style={styles.chipText}>Start DM</Text>
                </A11yPressable>
              )}
              {!!item.authorUid && item.authorUid !== user?.uid && (
                <A11yPressable accessibilityRole="button" accessibilityLabel="Block user" onPress={() => blockUser(String(item.authorUid))} style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}>
                  <Text style={styles.chipText}>Block</Text>
                </A11yPressable>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingTop: 8 }}
      />
      <View style={styles.newBox}>
        <TextInput
          style={styles.input}
          placeholder="Write a comment"
          placeholderTextColor={palette.muted}
          value={text}
          onChangeText={(t)=>{ setText(t); setTyping('thread_'+String(id), t.length>0); }}
          onFocus={()=> setTyping('thread_'+String(id), true)}
          onBlur={()=> setTyping('thread_'+String(id), false)}
        />
        <A11yPressable
          onPress={send}
          accessibilityRole="button"
          accessibilityLabel="Post comment"
          hitSlop={HIT_SLOP_8}
          style={({ pressed }) => [styles.cta, touchTarget.min, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.ctaText}>Send</Text>
        </A11yPressable>
      </View>
    </View>
  );
}

export default function ThreadScreen() {
  return (
    <CommunityProvider>
      <ThreadInner />
    </CommunityProvider>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    comment: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    commentAuthor: { color: palette.text, fontWeight: '600', marginBottom: 4 },
    commentText: { color: palette.text },
    newBox: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12, paddingVertical: 8 },
    input: { flex: 1, borderWidth: 1, borderColor: palette.muted, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: palette.text },
    cta: { backgroundColor: palette.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
    ctaText: { color: palette.onPrimary, fontWeight: '700' },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    chipText: { color: palette.text, fontWeight: '700' },
  });
}
