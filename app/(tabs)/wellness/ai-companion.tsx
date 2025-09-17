import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { useAppPalette } from '../../../theme/usePalette';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import * as Notifier from '../../../services/notifications';
import { addMood, listMoods } from '../../../services/companion';

export const options = { href: null };

export default function AICompanion() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Adaptive AI Companion');
  useFocusOnRefOnMount(titleRef);
  const [notes, setNotes] = React.useState('');
  const [moods, setMoods] = React.useState<any[]>([]);

  React.useEffect(() => { (async () => { try { setMoods(await listMoods()); } catch {} })(); }, []);

  const scheduleChecks = async () => {
    try {
      const now = new Date();
      const times = [9, 12, 15, 18]; // morning, lunch, afternoon, evening
      for (const h of times) { const d = new Date(now); d.setHours(h, 0, 0, 0); if (d.getTime() < now.getTime()) d.setDate(d.getDate()+1); await Notifier.scheduleAt(d, 'Check-in', 'How are you feeling? Time to rest, stretch, hydrate.'); }
      Alert.alert('Scheduled','Daily check-ins set.');
    } catch { Alert.alert('Failed','Unable to schedule.'); }
  };

  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Adaptive AI Companion</Text>
      <Text style={s.text}>Quick check-in: How are you today?</Text>
      <View style={{ flexDirection:'row', gap:8, marginTop: 8 }}>
        {[['good','😊'],['ok','😐'],['bad','😔']].map(([m, emoji]) => (
          <Pressable key={m} onPress={async()=>{ try { await addMood(m as any, notes); setNotes(''); setMoods(await listMoods()); } catch {} }} style={[s.chip]}> 
            <Text style={{ color: palette.text, fontWeight:'700' }}>{emoji} {m}</Text>
          </Pressable>
        ))}
      </View>
      <TextInput placeholder="Notes (optional)" placeholderTextColor={palette.text+'77'} value={notes} onChangeText={setNotes} style={s.input} />
      <View style={{ flexDirection:'row', gap:8, marginTop: 8, flexWrap:'wrap' }}>
        <Pressable onPress={scheduleChecks} style={s.button}><Text style={s.buttonText}>Schedule daily check-ins</Text></Pressable>
        <Pressable onPress={async()=>{ try { const d=new Date(); d.setMinutes(d.getMinutes()+1); await Notifier.scheduleAt(d, 'Hydrate', 'Sip water and stretch.'); Alert.alert('Scheduled','Hydration reminder in 1 min.'); } catch {} }} style={s.secondary}><Text style={{ color: palette.text, fontWeight:'700' }}>Hydration in 1 min</Text></Pressable>
      </View>
      <Text style={[s.text,{ marginTop: 12, fontWeight:'700' }]}>Recent moods</Text>
      {moods.slice(0,10).map(m => (
        <Text key={m.id} style={s.text}>• {new Date(m.createdAt?.toDate?.()||Date.now()).toLocaleString()} — {m.mood}{m.notes? `: ${m.notes}`:''}</Text>
      ))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    secondary: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 10, alignItems:'center', marginTop: 8 },
  });
}

