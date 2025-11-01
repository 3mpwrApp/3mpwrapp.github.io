import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { auth, db } from '../../../firebase/config';
import * as Notifier from '../../../services/notifications';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

type Activity = { id?: string; minutes: number; type?: string; createdAt?: any };

export default function PacingPartner() {
  // Info card for discoverability
  const openLearnMore = () => {
    require('react-native').Linking.openURL('https://empowrapp.com/pacing-partner-info');
  };
  // Export/share activities
  const exportActivities = async () => {
    try {
      const rows = [
        ["Date", "Type", "Minutes"],
        ...items.slice(0,10).map(i => [new Date(i.createdAt?.toDate?.()||Date.now()).toLocaleString(), i.type||'activity', String(i.minutes)]),
      ];
      const csv = rows.map(r => r.map(x => `"${(x || "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const FileSystem = await import('expo-file-system');
      const Sharing = await import('expo-sharing');
      const baseDir: any = (FileSystem as any).default?.cacheDirectory || (FileSystem as any).cacheDirectory || (FileSystem as any).default?.documentDirectory;
      if (!baseDir) return;
      const path = `${baseDir}pacing_activities_${Date.now()}.csv`;
      await (FileSystem as any).writeAsStringAsync(path, csv, { encoding: (FileSystem as any).EncodingType?.UTF8 });
      if (Sharing?.isAvailableAsync && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Pacing Partner Activities CSV' });
      }
    } catch {
      // Optionally show error
    }
  };
  const palette = useAppPalette();
  const s = styles(palette);
  const [minutes, setMinutes] = React.useState('');
  const [type, setType] = React.useState('walk');
  const [items, setItems] = React.useState<Activity[]>([]);
  const load = React.useCallback(async()=>{
    try { const uid = auth.currentUser?.uid || 'anon'; const snap = await getDocs(query(collection(db,'users',uid,'activity_logs'), orderBy('createdAt','desc'))); setItems(snap.docs.map(d=>({ id:d.id, ...(d.data() as any) }))); } catch {}
  },[]);
  React.useEffect(()=>{ load(); },[load]);
  const add = async () => {
    try { const uid = auth.currentUser?.uid || 'anon'; await addDoc(collection(db,'users',uid,'activity_logs'), { minutes: Number(minutes)||0, type, createdAt: serverTimestamp() }); setMinutes(''); load(); checkOverexertion(); } catch { Alert.alert('Failed','Could not save'); }
  };
  const checkOverexertion = async () => {
    const week = items.filter(i => (Date.now() - (i.createdAt?.toDate?.()?.getTime?.()||0)) < 7*86400000);
    const total = week.reduce((s,i)=> s + (i.minutes||0), 0);
    const limit = 60 * 7; // basic 1h/day baseline
    if (total > limit) {
      try { const d = new Date(); d.setMinutes(d.getMinutes()+5); await Notifier.scheduleAt(d, 'Pacing Partner', 'You may be overexerting. Consider a rest.'); } catch {}
    }
  };
  return (
    <View style={s.container}>
      <View style={[s.input, { backgroundColor: palette.surface, borderRadius: 10, marginBottom: 12, padding: 12 }]}> 
        <Text style={[s.title, { color: palette.primary }]}>How to Use Pacing Partner</Text>
        <Text style={s.text}>
          Log your daily activities and minutes spent. The AI will help you avoid overexertion and suggest rest breaks. You can export your recent logs or learn more about pacing.
        </Text>
        <A11yPressable
          onPress={exportActivities}
          style={[s.button, { backgroundColor: palette.primary, marginBottom: 6 }]}
          accessibilityRole="button"
          accessibilityLabel="Export pacing activities as CSV"
          accessibilityHint="Shares your recent activity logs as a CSV file for tracking or sharing."
          hitSlop={HIT_SLOP_8}
        >
          <Text style={[s.buttonText, { color: palette.onPrimary }]}>Export Activities (CSV)</Text>
        </A11yPressable>
        <A11yPressable
          onPress={openLearnMore}
          style={[s.button, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}
          accessibilityRole="link"
          accessibilityLabel="Learn more about pacing partner"
          accessibilityHint="Opens a page with more information about pacing and rest."
          hitSlop={HIT_SLOP_8}
        >
          <Text style={[s.buttonText, { color: palette.primary }]}>Learn More</Text>
        </A11yPressable>
      </View>
      <Text style={s.title} accessibilityRole="header" maxFontSizeMultiplier={1.3}>AI Pacing Partner</Text>
      <DisclaimerBanner type="ai" compact={true} />
      <TextInput
        placeholder="Minutes"
        placeholderTextColor={palette.text+'77'}
        value={minutes}
        onChangeText={setMinutes}
        style={s.input}
        accessibilityLabel="Minutes input"
        accessibilityHint="Enter the number of minutes spent on the activity."
      />
      <TextInput
        placeholder="Type (walk, work, chores...)"
        placeholderTextColor={palette.text+'77'}
        value={type}
        onChangeText={setType}
        style={s.input}
        accessibilityLabel="Activity type input"
        accessibilityHint="Enter the type of activity you are logging."
      />
      <A11yPressable
        onPress={add}
        style={s.button}
        accessibilityRole="button"
        accessibilityLabel="Log activity"
        accessibilityHint="Logs the activity and minutes to your pacing history."
        hitSlop={HIT_SLOP_8}
      >
        <Text style={s.buttonText}>Log Activity</Text>
      </A11yPressable>
      <Text style={[s.text,{ marginTop: 12, fontWeight:'700' }]}>Recent</Text>
      {items.slice(0,10).map(i=> (
        <Text key={i.id} style={s.text} accessibilityLabel={`Activity: ${i.type||'activity'}, Minutes: ${i.minutes}, Date: ${new Date(i.createdAt?.toDate?.()||Date.now()).toLocaleString()}`}>{`• ${new Date(i.createdAt?.toDate?.()||Date.now()).toLocaleString()} — ${i.type||'activity'}: ${i.minutes} min`}</Text>
      ))}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
  });
}

