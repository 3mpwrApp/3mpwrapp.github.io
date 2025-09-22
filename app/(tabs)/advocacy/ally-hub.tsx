import React from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Alert } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../constants/a11y';
import { useAppPalette } from '../../../theme/usePalette';
import { useTranslation } from '../../../i18n';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { aiCoachPrompt } from '../../../services/aiAdvocacy';

const links = [
  { title:'Climate Justice x Disability', url:'https://www.climatedisability.org' },
  { title:'Gender Justice + Accessibility', url:'https://example.org/gender-disability' },
  { title:'Labour + Injury Solidarity', url:'https://example.org/labour-injury' },
];

export const options = { href: null };

export default function AllyHub() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Ally Hub');
  useFocusOnRefOnMount(titleRef);
  const [prompt, setPrompt] = React.useState('Help a friend appeal a denied benefit');
  const [coaching, setCoaching] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const runCoach = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const out = await aiCoachPrompt(prompt);
      setCoaching(out);
    } catch {
      Alert.alert('Error','Could not generate coaching prompt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding:16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('advocacy.tools.ally_hub')}</Text>
      <Text style={s.text}>Cross‑movement solidarity resources and quick coaching prompts for allies supporting disabled / injured workers.</Text>
      <Text style={[s.sectionLabel,{marginTop:12}]}>Movement Links</Text>
      {links.map(l => (
        <A11yPressable key={l.title} hitSlop={HIT_SLOP_8} onPress={()=> require('expo-linking').openURL(l.url)} style={s.card} accessibilityRole="link" accessibilityLabel={l.title}>
          <Text style={s.cardTitle}>{l.title}</Text>
          <Text style={[s.text,{ color: palette.primary, marginTop:2 }]}>{l.url}</Text>
        </A11yPressable>
      ))}
      <Text style={[s.sectionLabel,{marginTop:20}]}>Coaching Prompt</Text>
      <Text style={s.text}>Describe what you want to help with (e.g., support letter, preparing for meeting, reducing overwhelm).</Text>
      <TextInput
        style={s.input}
        value={prompt}
        onChangeText={setPrompt}
        multiline
        accessibilityLabel="Ally coaching prompt"
      />
      <A11yPressable onPress={runCoach} style={[s.button, loading && { opacity:0.6 }]} disabled={loading} accessibilityRole="button" accessibilityLabel="Generate coaching steps">
        <Text style={s.buttonText}>{loading ? 'Generating...' : 'Generate Steps'}</Text>
      </A11yPressable>
      {!!coaching && (
        <View style={s.resultBox} accessibilityRole="summary" accessibilityLabel="Coaching output">
          {coaching.split(/\n+/).map((ln,i)=>(<Text key={i} style={s.resultText}>• {ln}</Text>))}
        </View>
      )}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background },
    title: { fontSize:22, fontWeight:'700', color: palette.text, marginBottom:8 },
    text: { color: palette.text, opacity: 0.95 },
    sectionLabel: { color: palette.text, fontWeight:'700', marginTop:4 },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight:'700' },
    input: { borderWidth:1, borderColor: palette.muted, borderRadius:8, padding:10, color: palette.text, marginTop:8, minHeight:70 },
    button: { marginTop:10, backgroundColor: palette.primary, paddingVertical:10, borderRadius:8, alignItems:'center' },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    resultBox: { marginTop:12, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface, borderRadius:8, padding:12 },
    resultText: { color: palette.text, opacity:0.95, marginBottom:4 },
  });
}
