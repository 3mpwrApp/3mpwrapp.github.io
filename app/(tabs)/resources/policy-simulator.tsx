import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

type Step = { id: string; text: string; choices: { id: string; label: string; next: string; effect?: string }[] };

const FLOW: Record<string, Step> = {
  start: { id: 'start', text: 'What do you want to explore?', choices: [
    { id: 'c1', label: 'File a claim', next: 'claim' },
    { id: 'c2', label: 'Appeal a decision', next: 'appeal' },
    { id: 'c3', label: 'Take sick leave', next: 'leave' },
  ] },
  claim: { id: 'claim', text: 'Filing a claim: timeline 1-4 weeks for initial decision; gather medical evidence and report promptly.', choices: [
    { id: 'c1', label: 'Missing documents', next: 'claim_docs', effect: 'Delays decision; risk of denial.' },
    { id: 'c2', label: 'Strong medical notes', next: 'claim_notes', effect: 'Higher chance of approval.' },
  ] },
  claim_docs: { id: 'claim_docs', text: 'Missing forms can pause your claim. Ask your provider and employer for timely documents.', choices: [ { id: 'b', label: 'Back', next: 'start' } ] },
  claim_notes: { id: 'claim_notes', text: 'Clear, specific medical limitations help align modified duties at work.', choices: [ { id: 'b', label: 'Back', next: 'start' } ] },
  appeal: { id: 'appeal', text: 'Appeal: strict deadlines (e.g., 30-90 days). Request your file and submit new evidence.', choices: [ { id: 'b', label: 'Back', next: 'start' } ] },
  leave: { id: 'leave', text: 'Sick leave: check employer policy; consider short-term disability; request accommodations in writing.', choices: [ { id: 'b', label: 'Back', next: 'start' } ] },
};

export default function PolicySimulator() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Policy Simulator');
  useFocusOnRefOnMount(titleRef);
  const [step, setStep] = React.useState<Step>(FLOW.start);
  const [log, setLog] = React.useState<string[]>([]);

  const choose = (c: Step['choices'][number]) => {
    if (c.effect) setLog((prev) => [...prev, c.effect!]);
    setStep(FLOW[c.next]);
  };

  return (
    <View style={s.container}>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>Interactive Policy Simulator</Text>
      <Text style={s.text}>{step.text}</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {step.choices.map((c) => (
          <A11yPressable hitSlop={HIT_SLOP_8} key={c.id} onPress={() => choose(c)} accessibilityRole='button' accessibilityLabel={c.label} style={s.chip}><Text style={s.chipText}>{c.label}</Text></A11yPressable>
        ))}
      </View>
      {!!log.length && (
        <View style={{ marginTop: 12 }}>
          <Text style={s.cardTitle}>Impacts</Text>
          {log.map((l, i) => (<Text key={i} style={s.text}>• {l}</Text>))}
        </View>
      )}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 8 },
    chip: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    chipText: { color: palette.text, fontWeight: '700' },
    cardTitle: { color: palette.text, fontWeight: '700', marginTop: 8 },
  });
}

