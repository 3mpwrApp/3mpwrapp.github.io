import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import AdminGuard from '../../../components/AdminGuard';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { db } from '../../../firebase/config';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function ModerationQueue() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Moderation');
  useFocusOnRefOnMount(titleRef);
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const col = collection(db, 'threads');
      const snap = await getDocs(query(col, where('flagged','==', true), orderBy('createdAt','desc')));
      const hiddenSnap = await getDocs(query(col, where('hidden','==', true), orderBy('createdAt','desc')));
      const list = [...snap.docs, ...hiddenSnap.docs].map(d => ({ id: d.id, ...(d.data() as any) }));
      // dedupe by id
      const map = new Map(list.map(i => [i.id, i]));
      setItems(Array.from(map.values()));
    } catch { Alert.alert('Error','Unable to load moderation items'); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  return (
    <AdminGuard>
      <View style={s.container} accessibilityLabel="Moderation queue" accessible>
        <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Moderation {loading ? '(loading...)' : ''}</Text>
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={s.row}>
              <Text style={s.text}>{item.title || '(no title)'} {item.flagged ? '— flagged' : ''} {item.hidden ? '— hidden' : ''}</Text>
              <View style={{ flexDirection:'row', gap:8, marginTop:6 }}>
                <A11yPressable
                  onPress={async()=>{ try { await updateDoc(doc(db,'threads', item.id), { flagged: !(item.flagged===true) }); load(); } catch {} }}
                  style={s.btn}
                  hitSlop={HIT_SLOP_8}
                  accessibilityRole="button"
                  accessibilityLabel={item.flagged ? 'Unflag thread' : 'Flag thread'}
                >
                  <Text style={s.btnText}>{item.flagged ? 'Unflag' : 'Flag'}</Text>
                </A11yPressable>
                <A11yPressable
                  onPress={async()=>{ try { await updateDoc(doc(db,'threads', item.id), { hidden: !(item.hidden===true) }); load(); } catch {} }}
                  style={s.btn}
                  hitSlop={HIT_SLOP_8}
                  accessibilityRole="button"
                  accessibilityLabel={item.hidden ? 'Unhide thread' : 'Hide thread'}
                >
                  <Text style={s.btnText}>{item.hidden ? 'Unhide' : 'Hide'}</Text>
                </A11yPressable>
                <A11yPressable
                  onPress={async()=>{ try { await deleteDoc(doc(db,'threads', item.id)); load(); } catch {} }}
                  style={s.btn}
                  hitSlop={HIT_SLOP_8}
                  accessibilityRole="button"
                  accessibilityLabel="Delete thread"
                >
                  <Text style={s.btnText}>Delete</Text>
                </A11yPressable>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={s.text}>No items.</Text>}
          contentContainerStyle={{ padding: 16 }}
        />
      </View>
    </AdminGuard>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background },
    title: { color: palette.text, fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 0 },
    row: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted, paddingVertical: 8 },
    text: { color: palette.text },
    btn: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    btnText: { color: palette.text },
  });
}

