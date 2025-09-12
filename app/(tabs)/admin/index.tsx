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
          <Text style={s.text}>Counts — Users: {counts.users ?? '-'} | Campaigns: {counts.campaigns ?? '-'} | Resources: {counts.resources ?? '-'}</Text>
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
                const filtered = users
                  .filter((u) => (onlyVerified ? u.verified === true : true) && (onlyBanned ? u.banned === true : true))
                  .filter((u) => {
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
        </View>
        {users.map((u) => (
          <View key={u.id} style={{ marginBottom: 6 }}>
            <Text style={s.text}>{u.email || u.id} — {u.displayName || '-'}</Text>
          </View>
        ))}
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
