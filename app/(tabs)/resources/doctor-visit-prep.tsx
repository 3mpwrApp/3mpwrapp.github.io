import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function DoctorVisitPrep() {
  const palette = useAppPalette();
  const s = styles(palette);
  const [name, setName] = React.useState('');
  const [condition, setCondition] = React.useState('');
  const [meds, setMeds] = React.useState('');
  const [questions, setQuestions] = React.useState('');

  const generate = async () => {
    try {
      const html = `
        <html><body style="font-family: sans-serif;">
          <h2>Doctor Visit Summary</h2>
          <p><b>Name:</b> ${escapeHtml(name)}</p>
          <p><b>Condition:</b> ${escapeHtml(condition)}</p>
          <p><b>Current medications:</b><br/>${escapeHtml(meds).replace(/\n/g,'<br/>')}</p>
          <p><b>Key questions:</b><br/>${escapeHtml(questions).replace(/\n/g,'<br/>')}</p>
        </body></html>
      `;
      const { printAsync } = await import('expo-print');
      await printAsync({ html });
    } catch {
      Alert.alert('Failed','Could not generate summary');
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding:16 }}>
      <Text style={s.title}>Doctor Visit Prep</Text>
      <DisclaimerBanner type="medical" compact={true} />
      <Text style={s.text}>Generate a one‑page summary to bring to appointments.</Text>
      <TextInput placeholder="Your name" placeholderTextColor={palette.text+'77'} value={name} onChangeText={setName} style={s.input} />
      <TextInput placeholder="Condition(s)" placeholderTextColor={palette.text+'77'} value={condition} onChangeText={setCondition} style={s.input} />
      <TextInput placeholder="Current medications (one per line)" multiline={true} placeholderTextColor={palette.text+'77'} value={meds} onChangeText={setMeds} style={[s.input,{ height: 120 }]} />
      <TextInput placeholder="Key questions for your provider (one per line)" multiline={true} placeholderTextColor={palette.text+'77'} value={questions} onChangeText={setQuestions} style={[s.input,{ height: 140 }]} />
  <A11yPressable hitSlop={HIT_SLOP_8} onPress={generate} style={s.button}><Text style={s.buttonText}>Generate Summary</Text></A11yPressable>
    </ScrollView>
  );
}

function escapeHtml(s: string) {
  return (s||'').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' } as any)[c]);
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 6 },
    input: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 12 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
  });
}
