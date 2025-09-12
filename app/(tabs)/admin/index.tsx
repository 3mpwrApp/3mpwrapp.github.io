import React from "react";
import { Text, StyleSheet, ScrollView, View, TextInput, Pressable, Alert } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE } from "../../../hooks/useA11y";
import AdminGuard from "../../../components/AdminGuard";
import { db } from "../../../firebase/config";
import { collection, getDocs, limit, query, where, getCountFromServer, startAfter } from "firebase/firestore";

export const options = { href: null };

export default function AdminPanel() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [email, setEmail] = React.useState("");
  const [contains, setContains] = React.useState("");
  const [onlyVerified, setOnlyVerified] = React.useState(false);
  const [onlyBanned, setOnlyBanned] = React.useState(false);
  const [result, setResult] = React.useState<any | null>(null);
  const [counts, setCounts] = React.useState<{ users?: number; campaigns?: number; resources?: number }>({});
  const [users, setUsers] = React.useState<any[]>([]);
  const [cursor, setCursor] = React.useState<any | null>(null);
  const [flags, setFlags] = React.useState<any[]>([]);
  const [selectedFlags, setSelectedFlags] = React.useState<Record<string, boolean>>({});
  const loadFlags = async () => {
    try { const { listFlags } = await import('../../../services/moderation'); const rows = await listFlags(); setFlags(rows); } catch {}
  };
  React.useEffect(() => { loadFlags(); }, []);
  const filteredUsers = React.useMemo(() => {
    const term = (contains || '').toLowerCase().trim();
    return users
      .filter((u) => (onlyVerified ? u.verified === true : true) && (onlyBanned ? u.banned === true : true))
      .filter((u) => {
        if (!term) return true;
        const s = `${u.email || ''} ${u.displayName || ''}`.toLowerCase();
        return s.includes(term);
      });
  }, [users, contains, onlyVerified, onlyBanned]);
  const [sortKey, setSortKey] = React.useState<'email' | 'name' | 'id'>('email');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');
  const sortedUsers = React.useMemo(() => {
    const arr = [...filteredUsers];
    const keyFn = (u: any) => sortKey === 'email' ? (u.email || '') : sortKey === 'name' ? (u.displayName || '') : (u.id || '');
    arr.sort((a, b) => String(keyFn(a)).localeCompare(String(keyFn(b))));
    if (sortDir === 'desc') arr.reverse();
    return arr;
  }, [filteredUsers, sortKey, sortDir]);
  React.useEffect(() => {
    (async () => {
      try {
        const usersCol = collection(db, 'users');
        const campaignsCol = collection(db, 'campaigns');
        const resourcesCol = collection(db, 'resources');
        const [uc, cc, rc] = await Promise.all([
          getCountFromServer(usersCol).then((s) => s.data().count).catch(() => undefined),
          getCountFromServer(campaignsCol).then((s) => s.data().count).catch(() => undefined),
          getCountFromServer(resourcesCol).then((s) => s.data().count).catch(() => undefined),
        ]);
        setCounts({ users: uc, campaigns: cc, resources: rc });
      } catch {}
    })();
  }, []);
  return (
    <AdminGuard>
      <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
        <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Admin Panel
        </Text>
        <Text style={s.text}>Use this area for admin-only tools and metrics.</Text>
        <Text style={s.text}>To grant admin: set Firebase custom claim admin=true for your UID.</Text>
        <View style={{ marginTop: 8 }}>
          <Text style={s.text}>Counts â€” Users: {counts.users ?? '-'} | Campaigns: {counts.campaigns ?? '-'} | Resources: {counts.resources ?? '-'}</Text>
        </View>
        <View style={{ marginTop: 8 }}>
          <Text style={[s.text, { fontWeight: '700' }]}>Filters</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Pressable
              onPress={() => setOnlyVerified(v => !v)}
              style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: onlyVerified ? palette.primary : palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
            >
              <Text style={{ color: onlyVerified ? palette.onPrimary : palette.text, fontWeight: '700' }}>{onlyVerified ? 'Verified only' : 'Include unverified'}</Text>
            </Pressable>
            <Pressable
              onPress={() => setOnlyBanned(v => !v)}
              style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: onlyBanned ? palette.primary : palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
            >
              <Text style={{ color: onlyBanned ? palette.onPrimary : palette.text, fontWeight: '700' }}>{onlyBanned ? 'Banned only' : 'Include not-banned'}</Text>
            </Pressable>
            <TextInput
              value={contains}
              onChangeText={setContains}
              placeholder="contains... (email/name)"
              style={{ minWidth: 160, flexGrow: 1, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6 }}
              autoCapitalize="none"
            />
          </View>
        </View>

        <Text style={[s.text, { marginTop: 10, fontWeight: '700' }]}>User Lookup</Text>
        <Text style={s.text}>Search users collection by email (exact match).</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            style={{ flex: 1, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6 }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Pressable
            onPress={async () => {
              try {
                const col = collection(db, 'users');
                const q = query(col, where('email','==', email.trim()), limit(1));
                const snap = await getDocs(q);
                setResult(snap.docs[0] ? { id: snap.docs[0].id, ...(snap.docs[0].data() as any) } : null);
                if (!snap.docs[0]) Alert.alert('Not found','No user with that email.');
              } catch (e: any) {
                Alert.alert('Lookup failed', e?.message || 'Error');
              }
            }}
            style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: palette.primary, borderRadius: 6 }}
          >
            <Text style={{ color: palette.onPrimary, fontWeight: '700' }}>Search</Text>
          </Pressable>
        </View>
        {!!result && (
          <View style={{ marginTop: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 10 }}>
            <Text style={s.text}>UID: {result.id}</Text>
            <Text style={s.text}>Email: {result.email || '-'}</Text>
            <Text style={s.text}>Name: {result.displayName || '-'}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <Pressable
                onPress={async () => {
                  try {
                    const { doc, updateDoc } = await import('firebase/firestore');
                    await updateDoc(doc(db, 'users', result.id), { banned: !(result.banned === true) });
                    setResult({ ...result, banned: !(result.banned === true) });
                  } catch (e: any) { Alert.alert('Update failed', e?.message || 'Error'); }
                }}
                style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}
              >
                <Text style={{ color: palette.text, fontWeight: '700' }}>{result.banned ? 'Unban' : 'Ban'}</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  try {
                    const { doc, updateDoc } = await import('firebase/firestore');
                    await updateDoc(doc(db, 'users', result.id), { verified: !(result.verified === true) });
                    setResult({ ...result, verified: !(result.verified === true) });
                  } catch (e: any) { Alert.alert('Update failed', e?.message || 'Error'); }
                }}
                style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}
              >
                <Text style={{ color: palette.text, fontWeight: '700' }}>{result.verified ? 'Unverify' : 'Verify'}</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Text style={[s.text, { marginTop: 16, fontWeight: '700' }]}>Users (first 20)</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <Pressable
            onPress={async () => {
              try {
                const col = collection(db, 'users');
                const q = cursor ? query(col, limit(20), startAfter(cursor)) : query(col, limit(20));
                const snap = await getDocs(q);
                setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
                setCursor(snap.docs[snap.docs.length - 1] || null);
              } catch (e: any) {
                Alert.alert('Load failed', e?.message || 'Error');
              }
            }}
            style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: palette.primary, borderRadius: 6 }}
          >
            <Text style={{ color: palette.onPrimary, fontWeight: '700' }}>Load / Next</Text>
          </Pressable>
          <Pressable
            onPress={() => { setCursor(null); setUsers([]); }}
            style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
          >
            <Text style={{ color: palette.text, fontWeight: '700' }}>Reset</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              try {
                const term = (contains || '').toLowerCase().trim();
                const filtered = sortedUsers.filter((u) => {
                  if (!term) return true;
                  const s = `${u.email || ''} ${u.displayName || ''}`.toLowerCase();
                  return s.includes(term);
                });
                const rows = [['uid','email','name','banned','verified']].concat(
                  filtered.map((u) => [u.id, u.email || '', u.displayName || '', String(!!u.banned), String(!!u.verified)])
                );
                const csv = rows.map(r => r.map(x => '"' + String(x).replace(/"/g,'""') + '"').join(',')).join('\n');
                const FS = await import('expo-file-system');
                const path = FS.cacheDirectory + `users_${Date.now()}.csv`;
                await FS.writeAsStringAsync(path, csv, { encoding: FS.EncodingType.UTF8 });
                try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path); else Alert.alert('Saved','CSV saved to cache.'); }
                catch { Alert.alert('Saved','CSV saved to cache (sharing unavailable).'); }
              } catch (e: any) {
                Alert.alert('Export failed', e?.message || 'Error creating CSV');
              }
            }}
            style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
          >
            <Text style={{ color: palette.text, fontWeight: '700' }}>Export CSV</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              try {
                const rows = [['uid','email','name','banned','verified']].concat(
                  sortedUsers.map((u) => [u.id, u.email || '', u.displayName || '', String(!!u.banned), String(!!u.verified)])
                );
                const csv = rows.map(r => r.map(x => '"' + String(x).replace(/"/g,'""') + '"').join(',')).join('\n');
                const Clipboard = await import('expo-clipboard');
                await Clipboard.setStringAsync(csv);
                Alert.alert('Copied', 'CSV copied to clipboard');
              } catch (e: any) {
                Alert.alert('Copy failed', e?.message || 'Unable to copy CSV');
              }
            }}
            style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
          >
            <Text style={{ color: palette.text, fontWeight: '700' }}>Copy CSV</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              try {
                const col = collection(db, 'users');
                let acc: any[] = [];
                let cur = null as any;
                for (let i = 0; i < 20; i++) { // up to ~1000 users at 50/page
                  const pageQ = cur ? query(col, limit(50), startAfter(cur)) : query(col, limit(50));
                  const snap = await getDocs(pageQ);
                  if (!snap.docs.length) break;
                  acc = acc.concat(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
                  cur = snap.docs[snap.docs.length - 1];
                  if (acc.length >= 1000) break;
                }
                const rows = [['uid','email','name','banned','verified']].concat(
                  acc.map((u) => [u.id, u.email || '', u.displayName || '', String(!!u.banned), String(!!u.verified)])
                );
                const csv = rows.map(r => r.map(x => '"' + String(x).replace(/"/g,'""') + '"').join(',')).join('\n');
                const FS = await import('expo-file-system');
                const path = FS.cacheDirectory + `users_all_${Date.now()}.csv`;
                await FS.writeAsStringAsync(path, csv, { encoding: FS.EncodingType.UTF8 });
                try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path); else Alert.alert('Saved','CSV saved to cache.'); }
                catch { Alert.alert('Saved','CSV saved to cache (sharing unavailable).'); }
              } catch (e: any) {
                Alert.alert('Export failed', e?.message || 'Error exporting all');
              }
            }}
            style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
          >
            <Text style={{ color: palette.text, fontWeight: '700' }}>Export All CSV</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
  <Pressable onPress={() => setSortKey('email')} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: sortKey==='email'? palette.primary: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
    <Text style={{ color: sortKey==='email'? palette.onPrimary: palette.text, fontWeight: '700' }}>Sort: Email</Text>
  </Pressable>
  <Pressable onPress={() => setSortKey('name')} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: sortKey==='name'? palette.primary: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
    <Text style={{ color: sortKey==='name'? palette.onPrimary: palette.text, fontWeight: '700' }}>Sort: Name</Text>
  </Pressable>
  <Pressable onPress={() => setSortKey('id')} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: sortKey==='id'? palette.primary: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
    <Text style={{ color: sortKey==='id'? palette.onPrimary: palette.text, fontWeight: '700' }}>Sort: ID</Text>
  </Pressable>
  <Pressable onPress={() => setSortDir(d => d==='asc' ? 'desc' : 'asc')} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
    <Text style={{ color: palette.text, fontWeight: '700' }}>{sortDir === 'asc' ? 'Asc' : 'Desc'}</Text>
  </Pressable>
</View>
{sortedUsers.map((u) => (
  <View key={u.id} style={{ marginBottom: 6 }}>
    <Text style={s.text}>{u.email || u.id} — {u.displayName || '-'}</Text>
  </View>
        ))}
        <Text style={[s.text, { marginTop: 16, fontWeight: '700' }]}>Moderation Flags</Text>
        {flags.length === 0 ? <Text style={s.text}>No flags.</Text> : (
          <>
            <View style={{ flexDirection:'row', gap:8, marginBottom: 8, flexWrap:'wrap' }}>
              <Pressable onPress={()=> setSelectedFlags(Object.fromEntries(flags.map(f=>[f.id,true])))} style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}><Text style={{ color: palette.text, fontWeight:'700' }}>Select all</Text></Pressable>
              <Pressable onPress={()=> setSelectedFlags({})} style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}><Text style={{ color: palette.text, fontWeight:'700' }}>Clear</Text></Pressable>
              <Pressable onPress={async()=>{ try { const { resolveFlag } = await import('../../../services/moderation'); await Promise.all(Object.keys(selectedFlags).filter(id=>selectedFlags[id]).map(id=> resolveFlag(id))); setSelectedFlags({}); loadFlags(); } catch {} }} style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}><Text style={{ color: palette.text, fontWeight:'700' }}>Resolve selected</Text></Pressable>
              <Pressable onPress={async()=>{ try {
                const sel = flags.filter(f=> selectedFlags[f.id]);
                for (const f of sel) {
                  if (f.type === 'mutual') { const { deletePost } = await import('../../../services/mutual'); await deletePost(f.targetId); }
                  if (f.type === 'rating') { const { db } = await import('../../../firebase/config'); const { deleteDoc, doc } = await import('firebase/firestore'); await deleteDoc(doc(db,'ratings', f.targetId)); }
                }
                const { resolveFlag } = await import('../../../services/moderation'); await Promise.all(sel.map(f=> resolveFlag(f.id))); setSelectedFlags({}); loadFlags();
              } catch {} }} style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}><Text style={{ color: palette.text, fontWeight:'700' }}>Delete items</Text></Pressable>
              <Pressable onPress={async()=>{ try {
                const sel = flags.filter(f=> selectedFlags[f.id]);
                for (const f of sel) {
                  if (f.type === 'rating') { const { db } = await import('../../../firebase/config'); const { getDoc, doc, addDoc, collection } = await import('firebase/firestore'); const r = await getDoc(doc(db,'ratings', f.targetId)); const u = (r.data() as any)?.uid; if (u) await addDoc(collection(db,'sanctions'), { uid: u, reason: 'ratings abuse', createdAt: new Date() }); }
                  if (f.type === 'mutual') { const { db } = await import('../../../firebase/config'); const { getDoc, doc, addDoc, collection } = await import('firebase/firestore'); const p = await getDoc(doc(db,'mutual_aid_posts', f.targetId)); const u = (p.data() as any)?.uid; if (u) await addDoc(collection(db,'sanctions'), { uid: u, reason: 'mutual aid abuse', createdAt: new Date() }); }
                }
                const { resolveFlag } = await import('../../../services/moderation'); await Promise.all(sel.map(f=> resolveFlag(f.id))); setSelectedFlags({}); loadFlags();
              } catch {} }} style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}><Text style={{ color: palette.text, fontWeight:'700' }}>Sanction users</Text></Pressable>
            </View>
          {flags.map((f) => (
          <View key={f.id} style={{ marginBottom: 6 }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
              <Pressable onPress={()=> setSelectedFlags(prev=> ({ ...prev, [f.id]: !prev[f.id] }))} style={{ width: 18, height: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 4, alignItems:'center', justifyContent:'center', backgroundColor: selectedFlags[f.id]? palette.primary: 'transparent' }}>
                {selectedFlags[f.id] ? <View style={{ width: 10, height: 10, backgroundColor: palette.onPrimary, borderRadius: 2 }} /> : null}
              </Pressable>
              <Text style={s.text}>[{f.type}] {f.targetId} — {f.reason}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={async () => {
                  try { const { resolveFlag } = await import('../../../services/moderation'); await resolveFlag(f.id); loadFlags(); }
                  catch {}
                }}
                style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}
              >
                <Text style={{ color: palette.text, fontWeight: '700' }}>Resolve</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  try {
                    if (f.type === 'mutual') { const { deletePost } = await import('../../../services/mutual'); await deletePost(f.targetId); }
                    if (f.type === 'rating') { const { db } = await import('../../../firebase/config'); const { deleteDoc, doc } = await import('firebase/firestore'); await deleteDoc(doc(db,'ratings', f.targetId)); }
                    const { resolveFlag } = await import('../../../services/moderation'); await resolveFlag(f.id); loadFlags();
                  } catch {}
                }}
                style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}
              >
                <Text style={{ color: palette.text, fontWeight: '700' }}>Delete Item</Text>
              </Pressable>
            </View>
          </View>
        ))}
        </>) }
      </ScrollView>
    </AdminGuard>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text, marginBottom: 8 },
    text: { color: palette.text, opacity: 0.95, marginBottom: 6 },
  });
}

