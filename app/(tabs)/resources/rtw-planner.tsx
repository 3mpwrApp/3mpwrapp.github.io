import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { addGoal, deleteGoal, listGoals, updateGoal, type RTWGoal } from '../../../services/rtw';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function RTWPlanner() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Return-to-Work Planner');
  useFocusOnRefOnMount(titleRef);
  const [title, setTitle] = React.useState('');
  const [supports, setSupports] = React.useState('');
  const [steps, setSteps] = React.useState('');
  const [items, setItems] = React.useState<RTWGoal[]>([]);

  const load = React.useCallback(async () => {
    try { setItems(await listGoals()); } catch { /* ignore */ }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Return-to-Work Planner</Text>
      <DisclaimerBanner type="legal" compact />
      <DisclaimerBanner type="medical" compact />
      <TextInput placeholder="Goal title (e.g., 4-hour shifts)" placeholderTextColor={palette.text+"77"} value={title} onChangeText={setTitle} style={s.input} />
      <TextInput placeholder="Supports (comma-separated)" placeholderTextColor={palette.text+"77"} value={supports} onChangeText={setSupports} style={s.input} />
      <TextInput placeholder="Steps (comma-separated)" placeholderTextColor={palette.text+"77"} value={steps} onChangeText={setSteps} style={s.input} />
      <A11yPressable onPress={async() => {
        try {
          await addGoal({ title: title.trim(), supports: supports? supports.split(',').map(s=>s.trim()):[], steps: steps? steps.split(',').map(s=>s.trim()):[] });
          setTitle(''); setSupports(''); setSteps(''); load();
        } catch { Alert.alert('Add failed','Unable to save goal'); }
      }} style={s.button}><Text style={s.buttonText}>Add Goal</Text></A11yPressable>
      <FlatList data={items} keyExtractor={(g)=>g.id!} renderItem={({item}) => (
        <View style={s.card}>
          <Text style={s.cardTitle}>{item.title}</Text>
          {!!item.supports?.length && <Text style={s.cardText}>Supports: {item.supports.join(', ')}</Text>}
          {!!item.steps?.length && <Text style={s.cardText}>Steps: {item.steps.join(' → ')}</Text>}
          <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
            <A11yPressable onPress={async()=>{ try{ await updateGoal(item.id!, { done: !item.done }); load(); } catch{} }} style={s.smallBtn}><Text style={s.smallBtnText}>{item.done? 'Mark not-done':'Mark done'}</Text></A11yPressable>
            <A11yPressable onPress={async()=>{ try{ await deleteGoal(item.id!); setItems(prev=>prev.filter(x=>x.id!==item.id)); } catch{} }} style={s.smallBtn}><Text style={s.smallBtnText}>Delete</Text></A11yPressable>
          </View>
        </View>
      )} />
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
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
    cardText: { color: palette.text, opacity: 0.95, marginBottom: 6 },
    smallBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    smallBtnText: { color: palette.text, fontWeight: '700' },
  });
}

