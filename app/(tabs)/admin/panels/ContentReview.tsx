import { collection, deleteDoc, doc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../../constants/a11y';
import { db } from '../../../../firebase/config';
import { useAppPalette } from '../../../../theme/usePalette';

 type ReviewKind = 'pending' | 'approved' | 'trash';
 type ReviewItem = { id: string; type: 'mutual' | 'rating' } & Record<string, any>;

export default function ContentReview() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [reviewTab, setReviewTab] = React.useState<ReviewKind>('pending');
  const [reviewItems, setReviewItems] = React.useState<ReviewItem[]>([]);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const loadReview = React.useCallback(async () => {
    try {
      const condPending = where('approved', '!=', true);
      const condApproved = where('approved', '==', true);
      const condTrash = where('deleted', '==', true);
      const cond = reviewTab === 'approved' ? condApproved : reviewTab === 'trash' ? condTrash : condPending;

      const qMut = query(collection(db, 'mutual_aid_posts'), cond, limit(50));
      const qRat = query(collection(db, 'ratings'), cond, limit(50));
      const [mutSnap, ratSnap] = await Promise.all([ getDocs(qMut), getDocs(qRat) ]);
      const items: ReviewItem[] = [
        ...mutSnap.docs.map((d) => ({ id: d.id, type: 'mutual', ...(d.data() as any) })),
        ...ratSnap.docs.map((d) => ({ id: d.id, type: 'rating', ...(d.data() as any) })),
      ];
      setReviewItems(items);
    } catch {}
  }, [reviewTab]);

  React.useEffect(() => { loadReview(); }, [loadReview]);

  const counts = React.useMemo(() => {
    const byType: Record<string, number> = {};
    for (const it of reviewItems) byType[it.type] = (byType[it.type]||0) + 1;
    return byType;
  }, [reviewItems]);

  const anySelected = React.useMemo(() => Object.values(selected).some(Boolean), [selected]);

  async function bulk(action: 'approve'|'restore'|'trash'|'purge') {
    try {
      const ids = reviewItems.filter(x => selected[`${x.type}:${x.id}`]).map(x => ({ id: x.id, col: x.type==='mutual'?'mutual_aid_posts':'ratings' }));
      if (!ids.length) return;
      const verb = action === 'approve' ? 'Approve' : action === 'restore' ? 'Restore' : action === 'trash' ? 'Trash' : 'Purge';
      const ok = await new Promise<boolean>(res => Alert.alert(`${verb} selected?`, `Apply '${verb}' to ${ids.length} item(s)?`, [ { text:'Cancel', style:'cancel', onPress: ()=> res(false) }, { text: verb, style: action==='purge'?'destructive':'default', onPress: ()=> res(true) } ]));
      if (!ok) return;
      for (const { id, col } of ids) {
        if (action === 'purge') await deleteDoc(doc(db, col, id));
        else if (action === 'approve') await updateDoc(doc(db, col, id), { approved: true, deleted: false });
        else if (action === 'restore') await updateDoc(doc(db, col, id), { approved: false, deleted: false });
        else if (action === 'trash') await updateDoc(doc(db, col, id), { deleted: true });
      }
      setSelected({});
      await loadReview();
      Alert.alert('Done', `${verb}d ${ids.length} item(s).`);
    } catch {}
  }

  return (
    <View>
      <Text style={[s.text, { marginTop: 16, fontWeight: '700' }]}>Content Review</Text>
      <Text style={[s.text, { marginBottom: 6 }]}>Summary: mutual {counts['mutual']||0} | ratings {counts['rating']||0}</Text>
      <View style={{ flexDirection:'row', gap:8, marginBottom: 8 }}>
        {(['pending','approved','trash'] as ReviewKind[]).map(k => (
          <A11yPressable
            key={k}
            accessibilityLabel={`Show ${k} items`}
            hitSlop={HIT_SLOP_8}
            onPress={()=> { setReviewTab(k); }}
            style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: k===reviewTab? palette.primary: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
            <Text style={{ color: k===reviewTab? palette.onPrimary: palette.text, fontWeight: '700' }}>{k}</Text>
          </A11yPressable>
        ))}
        <A11yPressable
          accessibilityLabel="Refresh content review"
          hitSlop={HIT_SLOP_8}
          onPress={loadReview}
          style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
          <Text style={{ color: palette.text, fontWeight: '700' }}>Refresh</Text>
        </A11yPressable>
        <A11yPressable accessibilityLabel="Select all" hitSlop={HIT_SLOP_8} onPress={()=> setSelected(Object.fromEntries(reviewItems.map(x => [[x.type, x.id].join(':'), true])))} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
          <Text style={{ color: palette.text, fontWeight: '700' }}>Select all</Text>
        </A11yPressable>
        <A11yPressable accessibilityLabel="Clear selection" hitSlop={HIT_SLOP_8} onPress={()=> setSelected({})} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
          <Text style={{ color: palette.text, fontWeight: '700' }}>Clear</Text>
        </A11yPressable>
      </View>
      {anySelected && (
        <View style={{ flexDirection:'row', gap:8, marginBottom: 8, flexWrap:'wrap' }}>
          <A11yPressable accessibilityLabel="Approve selected" hitSlop={HIT_SLOP_8} onPress={()=> bulk('approve')} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
            <Text style={{ color: palette.text, fontWeight: '700' }}>Approve selected</Text>
          </A11yPressable>
          <A11yPressable accessibilityLabel="Restore selected" hitSlop={HIT_SLOP_8} onPress={()=> bulk('restore')} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
            <Text style={{ color: palette.text, fontWeight: '700' }}>Restore selected</Text>
          </A11yPressable>
          <A11yPressable accessibilityLabel="Trash selected" hitSlop={HIT_SLOP_8} onPress={()=> bulk('trash')} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
            <Text style={{ color: palette.text, fontWeight: '700' }}>Trash selected</Text>
          </A11yPressable>
          {reviewTab==='trash' && (
            <A11yPressable accessibilityLabel="Purge selected" hitSlop={HIT_SLOP_8} onPress={()=> bulk('purge')} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
              <Text style={{ color: palette.text, fontWeight: '700' }}>Purge selected</Text>
            </A11yPressable>
          )}
        </View>
      )}
      {reviewItems.map((x) => (
        <View key={`${x.type}:${x.id}`} style={{ marginBottom: 8, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <A11yPressable accessibilityRole="checkbox" accessibilityLabel="Select item" accessibilityState={{ checked: !!selected[`${x.type}:${x.id}`] }} onPress={()=> setSelected(prev => ({ ...prev, [`${x.type}:${x.id}`]: !prev[`${x.type}:${x.id}`] }))} style={{ width: 18, height: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 4, alignItems:'center', justifyContent:'center', backgroundColor: selected[`${x.type}:${x.id}`]? palette.primary: 'transparent' }}>
              {selected[`${x.type}:${x.id}`] ? <View style={{ width: 10, height: 10, backgroundColor: palette.onPrimary, borderRadius: 2 }} /> : null}
            </A11yPressable>
          <Text style={s.text}>[{x.type}] {x.type==='mutual' ? `${x.type} • ${x.city||''} — ${x.description||''}` : `${x.target||''} • ${x.score||''}★ — ${x.comment||''}`}</Text>
          </View>
          <View style={{ flexDirection:'row', gap:8, marginTop: 6 }}>
            <A11yPressable
              accessibilityRole="button"
              accessibilityLabel="Approve item"
              hitSlop={HIT_SLOP_8}
              onPress={async()=>{ try { await updateDoc(doc(db, x.type==='mutual'?'mutual_aid_posts':'ratings', x.id), { approved: true, deleted: false }); Alert.alert('Done','Approved'); loadReview(); } catch {} }}
              style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}>
              <Text style={{ color: palette.text, fontWeight:'700' }}>Approve</Text>
            </A11yPressable>
            <A11yPressable
              accessibilityRole="button"
              accessibilityLabel="Restore item"
              hitSlop={HIT_SLOP_8}
              onPress={async()=>{ try { await updateDoc(doc(db, x.type==='mutual'?'mutual_aid_posts':'ratings', x.id), { approved: false, deleted: false }); Alert.alert('Done','Restored'); loadReview(); } catch {} }}
              style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}>
              <Text style={{ color: palette.text, fontWeight:'700' }}>Restore</Text>
            </A11yPressable>
            <A11yPressable
              accessibilityRole="button"
              accessibilityLabel={reviewTab==='trash' ? 'Purge item' : 'Move item to trash'}
              hitSlop={HIT_SLOP_8}
              onPress={async()=>{ try { if (reviewTab==='trash') { await deleteDoc(doc(db, x.type==='mutual'?'mutual_aid_posts':'ratings', x.id)); Alert.alert('Done','Purged'); } else { await updateDoc(doc(db, x.type==='mutual'?'mutual_aid_posts':'ratings', x.id), { deleted: true }); Alert.alert('Done','Trashed'); } loadReview(); } catch {} }}
              style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}>
              <Text style={{ color: palette.text, fontWeight:'700' }}>{reviewTab==='trash' ? 'Purge' : 'Trash'}</Text>
            </A11yPressable>
          </View>
        </View>
      ))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    text: { color: palette.text, opacity: 0.95, marginBottom: 6 },
  });
}
