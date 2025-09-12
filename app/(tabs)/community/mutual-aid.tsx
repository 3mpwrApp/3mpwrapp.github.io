import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';
import { useAuth } from '../../../context/AuthContext';
import { addAidPost, listAidPosts, respondToPost, deletePost, softDeletePost } from '../../../services/mutual';
import { flagItem } from '../../../services/moderation';
import { Link } from 'expo-router';

export const options = { href: null };

export default function MutualAid() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { isAdmin } = useAuth();
  const [type, setType] = React.useState('rides');
  const [desc, setDesc] = React.useState('');
  const [city, setCity] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [items, setItems] = React.useState<any[]>([]);
  const [reply, setReply] = React.useState('');
  const [showAll, setShowAll] = React.useState(false);
  const load = React.useCallback(async()=>{ try{ setItems(await listAidPosts()); } catch{} },[]);
  React.useEffect(()=>{ load(); },[load]);
  return (
    <View style={s.container}>
      <Text style={s.title}>Mutual Aid Engine</Text>
      {isAdmin && (
        <Pressable onPress={()=> setShowAll(v=>!v)} style={s.button}><Text style={s.buttonText}>{showAll? 'Showing all (incl. unapproved)':'Showing approved only'}</Text></Pressable>
      )}
      <TextInput placeholder="Type (rides, groceries, tutoring...)" placeholderTextColor={palette.text+'77'} value={type} onChangeText={setType} style={s.input} />
      <TextInput placeholder="Description" placeholderTextColor={palette.text+'77'} value={desc} onChangeText={setDesc} style={s.input} />
      <TextInput placeholder="City (optional)" placeholderTextColor={palette.text+'77'} value={city} onChangeText={setCity} style={s.input} />
      <TextInput placeholder="Contact (email/phone) (optional)" placeholderTextColor={palette.text+'77'} value={contact} onChangeText={setContact} style={s.input} />
      <Pressable onPress={async()=>{ try{ await addAidPost({ type, description: desc, city, contact }); setType('rides'); setDesc(''); setCity(''); setContact(''); load(); } catch { Alert.alert('Failed','Could not post'); } }} style={s.button}><Text style={s.buttonText}>Post Need</Text></Pressable>
      <Text style={[s.title,{ fontSize: 18, marginTop: 12 }]}>Recent posts</Text>
      {items.filter(p => isAdmin ? (showAll || p.approved) : !!p.approved).map(p => (
        <View key={p.id} style={s.card}>
          <Text style={s.cardTitle}>{p.type} {p.city? `• ${p.city}`:''}</Text>
          <Text style={s.cardText}>{p.description}</Text>
          {!!p.contact && <Text style={s.cardText}>Contact: {p.contact}</Text>}
          <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 6 }}>
            <TextInput placeholder="Reply..." placeholderTextColor={palette.text+'77'} value={reply} onChangeText={setReply} style={[s.input,{ flex:1 }]} />
            <Pressable onPress={async()=>{ try{ await respondToPost(p.id, reply); setReply(''); Alert.alert('Sent','Your response was sent.'); } catch {} }} style={s.smallBtn}><Text style={s.smallBtnText}>Send</Text></Pressable>
            <Pressable onPress={async()=>{ try{ await softDeletePost(p.id); setItems(prev=>prev.map(x=> x.id===p.id? { ...x, deleted: true }: x)); } catch{} }} style={s.smallBtn}><Text style={s.smallBtnText}>Delete</Text></Pressable>
            <Pressable onPress={async()=>{ try { await flagItem('mutual', p.id, 'inappropriate'); Alert.alert('Flagged','Thanks for reporting.'); } catch {} }} style={s.smallBtn}><Text style={s.smallBtnText}>Flag</Text></Pressable>
            <Link href={{ pathname: '/(tabs)/community/mutual-chat', params: { id: p.id } }} asChild>
              <Pressable style={s.smallBtn}><Text style={s.smallBtnText}>Open chat</Text></Pressable>
            </Link>
          </View>
        </View>
      ))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight:'700', marginBottom: 4 },
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 4 },
    smallBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    smallBtnText: { color: palette.text, fontWeight:'700' },
  });
}
