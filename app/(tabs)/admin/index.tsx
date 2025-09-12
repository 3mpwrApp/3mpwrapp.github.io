import React from "react";
import { Text, StyleSheet, ScrollView, View, TextInput, Pressable, Alert } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE } from "../../../hooks/useA11y";
import AdminGuard from "../../../components/AdminGuard";
import { db } from "../../../firebase/config";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

export const options = { href: null };

export default function AdminPanel() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [email, setEmail] = React.useState("");
  const [result, setResult] = React.useState<any | null>(null);
  return (
    <AdminGuard>
      <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
        <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Admin Panel
        </Text>
        <Text style={s.text}>Use this area for admin-only tools and metrics.</Text>
        <Text style={s.text}>To grant admin: set Firebase custom claim admin=true for your UID.</Text>

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
