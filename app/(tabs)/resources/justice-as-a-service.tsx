import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";

export default function JusticeAsAService() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Justice-as-a-Service");
  useFocusOnRefOnMount(titleRef);
  const [report, setReport] = React.useState<string>("");

  const generate = async () => {
    try {
      // Minimal local report using cached/local data
      let AsyncStorage: any; try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}
      const notesRaw = (await AsyncStorage?.getItem?.('evidence:notes:v1')) || '[]';
      const notes = JSON.parse(notesRaw) as any[];
      const noteCount = notes.length;
      const docCount = notes.reduce((s,n)=> s + ((n.files||[]).length), 0);
      // Add counts if store available (try/catch)
      let resourcesCount = 0; try { const { useCounts } = require('../../../store/counts'); resourcesCount = useCounts.getState?.()?.resources ?? 0; } catch {}
      const lines = [
        'Empowr — Local Advocacy Snapshot',
        new Date().toLocaleString(),
        '',
        `Evidence Locker: ${noteCount} notes, ${docCount} file(s)`,
        `Resources viewed this session: ~${resourcesCount}`,
        '',
        'Signals:',
        '- Increase access to plain-language decisions',
        '- Add navigators for tight appeal windows',
        '- Expand accommodations for sustained earnings',
      ];
      setReport(lines.join('\n'));
    } catch { setReport('Unable to generate a local report.'); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Justice-as-a-Service
      </Text>
      <Text style={styles.subtitle}>
        Generate anonymized, aggregate reports that highlight real barriers faced by disabled and injured people —
        tailored for advocacy groups, unions, journalists, and researchers.
      </Text>
      <View style={styles.block}>
        <Text style={styles.blockTitle}>How it works</Text>
        <Text style={styles.text}>• Privacy-first: data is anonymized and aggregated.</Text>
        <Text style={styles.text}>• Opt-in: only users who consent are included.</Text>
        <Text style={styles.text}>• Actionable outputs: heatmaps, timelines, and trends.</Text>
      </View>
      <Pressable onPress={generate} accessibilityRole="button" accessibilityLabel="Generate local snapshot" style={styles.cta}>
        <Text style={styles.ctaText}>Generate Local Snapshot</Text>
      </Pressable>
      {!!report && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.text}>{report}</Text>
          <Pressable onPress={async()=>{ try { const FS = await import('expo-file-system'); const p = FS.cacheDirectory+`snapshot_${Date.now()}.txt`; await FS.writeAsStringAsync(p, report); const Share = await import('expo-sharing'); if (await Share.isAvailableAsync()) await Share.shareAsync(p); } catch {} }} style={[styles.cta,{ marginTop: 8 }]}>
            <Text style={styles.ctaText}>Share report</Text>
          </Pressable>
        </View>
      )}
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
