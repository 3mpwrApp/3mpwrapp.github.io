import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useAppPalette } from '../../../theme/usePalette';
import { useAuth } from '../../../context/AuthContext';
import { addRating, listRatings, upsertRating, ensureTarget, listTargets } from '../../../services/ratings';
import { flagItem } from '../../../services/moderation';
import SimpleBarChart from '../../../components/SimpleBarChart';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const options = { href: null };

export default function Ratings() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { isAdmin } = useAuth();
  const [target, setTarget] = React.useState('Hospital X');
  const [kind, setKind] = React.useState('hospital');
  const [score, setScore] = React.useState('5');
  const [comment, setComment] = React.useState('');
  const [items, setItems] = React.useState<any[]>([]);
  const [sort, setSort] = React.useState<'latest'|'score'>('latest');
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState<'all'|'approved'|'pending'|'trash'>(isAdmin? 'all':'approved');
  const pageSize = 20;
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSug, setShowSug] = React.useState(false);
  const load = React.useCallback(async()=>{ try{ setItems(await listRatings(target)); } catch{} },[target]);
  React.useEffect(()=>{ load(); },[load]);
  const avg = items.length ? (items.reduce((s,i)=>s+(i.score||0),0)/items.length).toFixed(1) : '-';
  const visible = items.filter(i => {
    const approved = i.approved === true;
    const pending = i.approved === false && i.deleted !== true;
    const trash = i.deleted === true;
    if (!isAdmin) return approved;
    if (filter === 'approved') return approved && !trash;
    if (filter === 'pending') return pending;
    if (filter === 'trash') return trash;
    return !trash; // all non-deleted
  });
  const dist = [1,2,3,4,5].map(n => ({ n, c: items.filter(i => i.score===n).length }));
  return (
    <View style={s.container}>
      <Text style={s.title}>Disability Justice Ratings</Text>
      {isAdmin && (
        <View style={{ gap:8, marginBottom: 8 }}>
          <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
            <Pressable onPress={()=>setFilter('all')} style={[s.chip, filter==='all'&&s.chipActive]}><Text style={{ color: filter==='all'? palette.onPrimary: palette.text, fontWeight:'700' }}>All</Text></Pressable>
            <Pressable onPress={()=>setFilter('approved')} style={[s.chip, filter==='approved'&&s.chipActive]}><Text style={{ color: filter==='approved'? palette.onPrimary: palette.text, fontWeight:'700' }}>Approved</Text></Pressable>
            <Pressable onPress={()=>setFilter('pending')} style={[s.chip, filter==='pending'&&s.chipActive]}><Text style={{ color: filter==='pending'? palette.onPrimary: palette.text, fontWeight:'700' }}>Pending</Text></Pressable>
            <Pressable onPress={()=>setFilter('trash')} style={[s.chip, filter==='trash'&&s.chipActive]}><Text style={{ color: filter==='trash'? palette.onPrimary: palette.text, fontWeight:'700' }}>Trash</Text></Pressable>
          </View>
          <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
            <Pressable onPress={()=> router.push('/(tabs)/admin?tab=pending' as any)} style={s.button}><Text style={s.buttonText}>Admin Pending</Text></Pressable>
            <Pressable onPress={()=> router.push('/(tabs)/admin?tab=approved' as any)} style={s.button}><Text style={s.buttonText}>Admin Approved</Text></Pressable>
            <Pressable onPress={()=> router.push('/(tabs)/admin?tab=trash' as any)} style={s.button}><Text style={s.buttonText}>Admin Trash</Text></Pressable>
          </View>
        </View>
      )}
      <View>
        <TextInput
          placeholder="Target (name)"
          placeholderTextColor={palette.text+'77'}
          value={target}
          onChangeText={async (t)=>{ setTarget(t); try { const sug = await listTargets(t || ''); setSuggestions(sug); setShowSug(!!t); } catch {} }}
          style={s.input}
        />
        {showSug && suggestions.length>0 && (
          <View style={s.suggestBox}>
            {suggestions.map(sug => (
              <Pressable key={sug} onPress={()=> { setTarget(sug); setShowSug(false); }} style={s.suggestRow}>
                <Text style={{ color: palette.text }}>{sug}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      <TextInput placeholder="Type (hospital, clinic, law, employer, union)" placeholderTextColor={palette.text+'77'} value={kind} onChangeText={setKind} style={s.input} />
      <View style={{ flexDirection:'row', gap:8, marginTop: 8 }}>
        <Pressable onPress={()=>setSort('latest')} style={[s.chip, sort==='latest'&&s.chipActive]}><Text style={{ color: sort==='latest'? palette.onPrimary: palette.text, fontWeight:'700' }}>Latest</Text></Pressable>
        <Pressable onPress={()=>setSort('score')} style={[s.chip, sort==='score'&&s.chipActive]}><Text style={{ color: sort==='score'? palette.onPrimary: palette.text, fontWeight:'700' }}>Top</Text></Pressable>
      </View>
      <Text style={s.text}>Average rating: {avg} ({items.length})</Text>
      <View style={{ marginTop: 8 }}>
        <SimpleBarChart data={dist} labelKey="n" valueKey="c" />
      </View>
      <TextInput placeholder="Score 1-5" placeholderTextColor={palette.text+'77'} value={score} onChangeText={setScore} style={s.input} />
      <TextInput placeholder="Comment (optional)" placeholderTextColor={palette.text+'77'} value={comment} onChangeText={setComment} style={s.input} />
      <Pressable onPress={async()=>{ try{ const key = `rate:${target}`; const last = await AsyncStorage.getItem(key); if (last && (Date.now() - Number(last) < 5*60*1000)) { Alert.alert('Slow down','Please wait before submitting again.'); return; } await ensureTarget(target); await upsertRating({ target, kind: kind as any, score: Number(score)||0, comment }); await AsyncStorage.setItem(key, String(Date.now())); setComment(''); setScore('5'); load(); } catch (e:any) { Alert.alert('Failed', e?.message || 'Could not submit'); } }} style={s.button}><Text style={s.buttonText}>Submit Rating</Text></Pressable>
      <FlatList data={[...visible].sort((a,b)=> sort==='latest'? ((b.createdAt?.toDate?.()?.getTime?.()||0) - (a.createdAt?.toDate?.()?.getTime?.()||0)) : ((b.score||0)-(a.score||0)))} keyExtractor={i=>i.id} renderItem={({item:i}) => (
        <View style={s.card}>
          <Text style={s.cardTitle}>{i.score} ★</Text>
          {!!i.comment && <Text style={s.text}>{i.comment}</Text>}
          <Pressable onPress={async()=>{ try{ await flagItem('rating', i.id, 'inaccurate'); Alert.alert('Flagged','Thanks for reporting.'); } catch {} }} style={s.button}><Text style={s.buttonText}>Flag</Text></Pressable>
        </View>
      )} />
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding:16 },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight:'700' },
    suggestBox: { position:'absolute', left: 0, right: 0, top: 46, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6, zIndex: 10 },
    suggestRow: { padding: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
  });
}
