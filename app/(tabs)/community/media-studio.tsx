import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';
import { auth, db, storage } from '../../../firebase/config';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../../context/AuthContext';
import { router } from 'expo-router';

export const options = { href: null };

export default function MediaStudio() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { isAdmin } = useAuth();
  const [title, setTitle] = React.useState('');
  const [text, setText] = React.useState('');
  const [items, setItems] = React.useState<any[]>([]);
  const load = React.useCallback(async()=>{ try { const snap = await getDocs(query(collection(db,'media_posts'), orderBy('createdAt','desc'))); setItems(snap.docs.map(d=>({ id:d.id, ...(d.data() as any) }))); } catch {} },[]);
  React.useEffect(()=>{ load(); },[load]);

  const upload = async () => {
    try {
      const DP = await import('expo-document-picker');
      const res = await DP.getDocumentAsync({ type: ['image/*','audio/*','video/*','application/pdf'] as any });
      const f = res?.assets?.[0]; if (!f?.uri) return;
      const uid = auth.currentUser?.uid || 'anon';
      const path = `media/${uid}/${Date.now()}_${(f.name||'file').replace(/[^a-zA-Z0-9._-]/g,'_')}`;
      const r = ref(storage, path);
      const resp = await fetch(f.uri); const blob = await resp.blob();
      await uploadBytes(r, blob as any);
      const url = await getDownloadURL(r);
      await addDoc(collection(db,'media_posts'), { title, text, url, createdAt: serverTimestamp(), uid });
      setTitle(''); setText(''); load();
    } catch { Alert.alert('Failed','Could not upload'); }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Disability + Worker Media Studio</Text>
      {isAdmin && (
        <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
          <Pressable onPress={()=> router.push('/(tabs)/admin?tab=pending' as any)} style={s.chip}><Text style={s.chipText}>Pending</Text></Pressable>
          <Pressable onPress={()=> router.push('/(tabs)/admin?tab=trash' as any)} style={s.chip}><Text style={s.chipText}>Trash</Text></Pressable>
        </View>
      )}
      <TextInput placeholder="Title" placeholderTextColor={palette.text+'77'} value={title} onChangeText={setTitle} style={s.input} />
      <TextInput placeholder="Caption / text" placeholderTextColor={palette.text+'77'} value={text} onChangeText={setText} style={s.input} />
      <Pressable onPress={upload} style={s.button}><Text style={s.buttonText}>Upload media</Text></Pressable>
      {items.map(it => (
        <View key={it.id} style={s.card}>
          <Text style={s.cardTitle}>{it.title || '(untitled)'}</Text>
          {!!it.text && <Text style={s.cardText}>{it.text}</Text>}
          {!!it.url && <Text style={[s.cardText,{ color: palette.primary }]} onPress={()=>require('expo-linking').openURL(it.url)}>Open</Text>}
        </View>
      ))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight:'700', marginBottom: 4 },
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 4 },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    chipText: { color: palette.text, fontWeight:'700' },
  });
}
