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
  const [result, setResult] = React.useState<any | null>(null);
  const [counts, setCounts] = React.useState<{ users?: number; campaigns?: number; resources?: number }>({});
  const [users, setUsers] = React.useState<any[]>([]);
  const [cursor, setCursor] = React.useState<any | null>(null);
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
          </View>
        )}

        <Text style={[s.text, { marginTop: 16, fontWeight: '700' }]}>Users (first 20)</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
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
