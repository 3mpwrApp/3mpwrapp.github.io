import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export default function ImpactSimulator() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Impact Simulator");
  useFocusOnRefOnMount(titleRef);
  const [rate, setRate] = React.useState(80); // benefit rate %
  const [wait, setWait] = React.useState(5); // waiting period days
  const [accom, setAccom] = React.useState<'none'|'basic'|'robust'>('basic');

  const score = React.useMemo(() => {
    // toy model: higher rate + robust accommodations reduce harm
    const rateTerm = (100 - rate) / 100; // less benefit => higher harm
    const waitTerm = Math.min(wait, 30) / 30; // more waiting => more harm
    const accomTerm = accom === 'robust' ? 0.1 : accom === 'basic' ? 0.25 : 0.5;
    const raw = 0.5*rateTerm + 0.3*waitTerm + 0.2*accomTerm; // 0..1
    return Math.round(raw * 100);
  }, [rate, wait, accom]);

  const summary = React.useMemo(() => {
    const harms = score;
    const tier = harms > 66 ? 'High risk of hardship' : harms > 33 ? 'Moderate risk' : 'Lower risk';
    const lines = [
      `Benefit rate: ${rate}%`,
      `Waiting period: ${wait} day(s)`,
      `Accommodations: ${accom}`,
      `Estimated hardship index: ${harms}/100 (${tier})`,
      '',
      'Considerations:',
      '- Increase benefit rates for low-income workers',
      '- Reduce waiting periods for acute injuries',
      '- Strengthen accommodations for sustained earnings'
    ];
    return lines.join('\n');
  }, [rate, wait, accom, score]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Impact Simulator
      </Text>
      <Text style={styles.subtitle}>
        Data-driven empathy: simulate how changes in law or workplace policy could affect real disabled/injured people.
        Configure scenarios, then view estimated impacts across income, timelines, appeals, and health outcomes.
      </Text>
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Sample Scenarios</Text>
        <Text style={styles.text}>• Adjust benefit rates or waiting periods</Text>
        <Text style={styles.text}>• Introduce/withdraw accommodations</Text>
        <Text style={styles.text}>• Change documentation or appeal thresholds</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Configure</Text>
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 6 }}>
          <Text style={styles.text}>Benefit rate</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <Pressable onPress={()=> setRate(r=> Math.max(50, r-5))} style={styles.tiny}><Text style={styles.tinyText}>-</Text></Pressable>
            <Text style={styles.text}>{rate}%</Text>
            <Pressable onPress={()=> setRate(r=> Math.min(100, r+5))} style={styles.tiny}><Text style={styles.tinyText}>+</Text></Pressable>
          </View>
        </View>
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 6 }}>
          <Text style={styles.text}>Waiting period</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <Pressable onPress={()=> setWait(w=> Math.max(0, w-1))} style={styles.tiny}><Text style={styles.tinyText}>-</Text></Pressable>
            <Text style={styles.text}>{wait}d</Text>
            <Pressable onPress={()=> setWait(w=> Math.min(30, w+1))} style={styles.tiny}><Text style={styles.tinyText}>+</Text></Pressable>
          </View>
        </View>
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
          <Text style={styles.text}>Accommodations</Text>
          <View style={{ flexDirection:'row', gap:8 }}>
            {(['none','basic','robust'] as const).map(v => (
              <Pressable key={v} onPress={()=> setAccom(v)} style={[styles.chip, accom===v && { backgroundColor: palette.primary, borderColor: palette.primary }]}>
                <Text style={[styles.text, accom===v && { color: palette.onPrimary, fontWeight:'700' }]}>{v}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Estimate</Text>
        <Text style={styles.text}>{summary}</Text>
        <Pressable onPress={async()=>{ try { const FS = await import('expo-file-system'); const p = FS.cacheDirectory+`impact_${Date.now()}.txt`; await FS.writeAsStringAsync(p, summary); const Share = await import('expo-sharing'); if (await Share.isAvailableAsync()) await Share.shareAsync(p); } catch {} }} style={[styles.cta,{ marginTop: 8 }]}>
          <Text style={styles.ctaText}>Share estimate</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text, marginBottom: 6 },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 12 },
    block: { marginTop: 6, marginBottom: 12 },
    blockTitle: { color: palette.text, fontWeight: "700", marginBottom: 6 },
    text: { color: palette.text, marginBottom: 4 },
    cta: {
      backgroundColor: palette.primary,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 8,
    },
    ctaText: { color: palette.onPrimary, fontWeight: "700" },
  });
}
