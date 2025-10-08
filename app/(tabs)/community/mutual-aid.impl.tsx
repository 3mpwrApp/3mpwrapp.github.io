import { Link, router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { useAuth } from '../../../context/AuthContext';
import { flagItem } from '../../../services/moderation';
import { addAidPost, listAidPosts, respondToPost, softDeletePost } from '../../../services/mutual';
import { useAppPalette } from '../../../theme/usePalette';

export default function MutualAidImpl() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { isAdmin } = useAuth();
  const [type, setType] = React.useState('rides');
  const [desc, setDesc] = React.useState('');
  const [city, setCity] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [items, setItems] = React.useState<any[]>([]);
  const [reply, setReply] = React.useState('');
  const [filter, setFilter] = React.useState<'all'|'approved'|'pending'|'trash'>(isAdmin? 'all':'approved');
  const load = React.useCallback(async()=>{ try{ setItems(await listAidPosts()); } catch{} },[]);
  React.useEffect(()=>{ load(); },[load]);
  return (
    <View style={s.container}>
  <Text style={s.title}>Mutual Aid Engine (Beta)</Text>
      {isAdmin && (
        <View style={{ gap:8 }}>
          <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setFilter('all')} style={[s.chip, filter==='all'&&s.chipActive]}><Text style={{ color: filter==='all'? palette.onPrimary: palette.text, fontWeight:'700' }}>All</Text></A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setFilter('approved')} style={[s.chip, filter==='approved'&&s.chipActive]}><Text style={{ color: filter==='approved'? palette.onPrimary: palette.text, fontWeight:'700' }}>Approved</Text></A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setFilter('pending')} style={[s.chip, filter==='pending'&&s.chipActive]}><Text style={{ color: filter==='pending'? palette.onPrimary: palette.text, fontWeight:'700' }}>Pending</Text></A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setFilter('trash')} style={[s.chip, filter==='trash'&&s.chipActive]}><Text style={{ color: filter==='trash'? palette.onPrimary: palette.text, fontWeight:'700' }}>Trash</Text></A11yPressable>
          </View>
          <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> router.push('/(tabs)/admin?tab=pending' as any)} style={s.button}><Text style={s.buttonText}>Admin Pending</Text></A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> router.push('/(tabs)/admin?tab=approved' as any)} style={s.button}><Text style={s.buttonText}>Admin Approved</Text></A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> router.push('/(tabs)/admin?tab=trash' as any)} style={s.button}><Text style={s.buttonText}>Admin Trash</Text></A11yPressable>
          </View>
        </View>
      )}
      <TextInput placeholder="Type (rides, groceries, tutoring...)" placeholderTextColor={palette.text+'77'} value={type} onChangeText={setType} style={s.input} />
      <TextInput placeholder="Description" placeholderTextColor={palette.text+'77'} value={desc} onChangeText={setDesc} style={s.input} />
      <TextInput placeholder="City (optional)" placeholderTextColor={palette.text+'77'} value={city} onChangeText={setCity} style={s.input} />
      <TextInput placeholder="Contact (email/phone) (optional)" placeholderTextColor={palette.text+'77'} value={contact} onChangeText={setContact} style={s.input} />
  <A11yPressable hitSlop={HIT_SLOP_8} onPress={async()=>{ try{ await addAidPost({ type, description: desc, city, contact }); setType('rides'); setDesc(''); setCity(''); setContact(''); load(); } catch { Alert.alert('Failed','Could not post'); } }} style={s.button}><Text style={s.buttonText}>Post Need</Text></A11yPressable>
      <Text style={[s.title,{ fontSize: 18, marginTop: 12 }]}>Recent posts</Text>
      {items.filter(p => {
        const approved = p.approved === true;
        const pending = p.approved === false && p.deleted !== true;
        const trash = p.deleted === true;
        if (!isAdmin) return approved;
        if (filter === 'approved') return approved && !trash;
        if (filter === 'pending') return pending;
        if (filter === 'trash') return trash;
        return !trash;
      }).map(p => (
        <View key={p.id} style={s.card}>
          <Text style={s.cardTitle}>{p.type} {p.city? `• ${p.city}`:''}</Text>
          <Text style={s.cardText}>{p.description}</Text>
          {!!p.contact && <Text style={s.cardText}>Contact: {p.contact}</Text>}
          <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop: 6 }}>
            <TextInput placeholder="Reply..." placeholderTextColor={palette.text+'77'} value={reply} onChangeText={setReply} style={[s.input,{ flex:1 }]} />
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={async()=>{ try{ await respondToPost(p.id, reply); setReply(''); Alert.alert('Sent','Your response was sent.'); } catch {} }} style={s.smallBtn}><Text style={s.smallBtnText}>Send</Text></A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={async()=>{ try{ await softDeletePost(p.id); setItems(prev=>prev.map(x=> x.id===p.id? { ...x, deleted: true }: x)); } catch{} }} style={s.smallBtn}><Text style={s.smallBtnText}>Delete</Text></A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={async()=>{ try { await flagItem('mutual', p.id, 'inappropriate'); Alert.alert('Flagged','Thanks for reporting.'); } catch {} }} style={s.smallBtn}><Text style={s.smallBtnText}>Flag</Text></A11yPressable>
            <Link href={{ pathname: '/(tabs)/community/mutual-chat', params: { id: p.id } }} asChild>
              <A11yPressable hitSlop={HIT_SLOP_8} style={s.smallBtn}><Text style={s.smallBtnText}>Open chat</Text></A11yPressable>
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
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  });
}
