import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';
import { addRating, listRatings } from '../../../services/ratings';
import { flagItem } from '../../../services/moderation';

export const options = { href: null };

export default function Ratings() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [target, setTarget] = React.useState('Hospital X');
  const [kind, setKind] = React.useState('hospital');
  const [score, setScore] = React.useState('5');
  const [comment, setComment] = React.useState('');
  const [items, setItems] = React.useState<any[]>([]);
  const load = React.useCallback(async()=>{ try{ setItems(await listRatings(target)); } catch{} },[target]);
  React.useEffect(()=>{ load(); },[load]);
  const avg = items.length ? (items.reduce((s,i)=>s+(i.score||0),0)/items.length).toFixed(1) : '-';
  return (
    <View style={s.container}>
      <Text style={s.title}>Disability Justice Ratings</Text>
      <TextInput placeholder="Target (name)" placeholderTextColor={palette.text+'77'} value={target} onChangeText={setTarget} style={s.input} />
      <TextInput placeholder="Type (hospital, clinic, law, employer, union)" placeholderTextColor={palette.text+'77'} value={kind} onChangeText={setKind} style={s.input} />
      <Text style={s.text}>Average rating: {avg} ({items.length})</Text>
      <TextInput placeholder="Score 1-5" placeholderTextColor={palette.text+'77'} value={score} onChangeText={setScore} style={s.input} />
      <TextInput placeholder="Comment (optional)" placeholderTextColor={palette.text+'77'} value={comment} onChangeText={setComment} style={s.input} />
      <Pressable onPress={async()=>{ try{ await addRating({ target, kind: kind as any, score: Number(score)||0, comment }); setComment(''); setScore('5'); load(); } catch { Alert.alert('Failed','Could not submit'); } }} style={s.button}><Text style={s.buttonText}>Submit Rating</Text></Pressable>
      {items.map(i => (
        <View key={i.id} style={s.card}>
          <Text style={s.cardTitle}>{i.score} ★</Text>
          {!!i.comment && <Text style={s.text}>{i.comment}</Text>}
          <Pressable onPress={async()=>{ try{ await flagItem('rating', i.id, 'inaccurate'); Alert.alert('Flagged','Thanks for reporting.'); } catch {} }} style={s.button}><Text style={s.buttonText}>Flag</Text></Pressable>
        </View>
      ))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding:16 },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight:'700' },
  });
}
