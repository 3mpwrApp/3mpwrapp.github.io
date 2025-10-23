import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import { HIT_SLOP_8 } from "../../../constants/A11Y";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { useAppPalette } from "../../../theme/usePalette";
import { announce } from '../../../utils/announce';

export default function JusticeAsAService() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount("Justice-as-a-Service");
  useFocusOnRefOnMount(titleRef);
  const [report, setReport] = React.useState<string>("");
  const [generating, setGenerating] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(true);

  const generate = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      let AsyncStorage: any; try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}
      const notesRaw = (await AsyncStorage?.getItem?.('evidence:notes:v1')) || '[]';
      const notes = JSON.parse(notesRaw) as any[];
      const noteCount = notes.length;
      const docCount = notes.reduce((s,n)=> s + ((n.files||[]).length), 0);
      let resourcesCount = 0; try { const { useCounts } = require('../../../store/counts'); resourcesCount = useCounts.getState?.()?.resources ?? 0; } catch {}
      const now = new Date();
      const lines = [
  t('justiceService.header','3mpwr App — Local Advocacy Snapshot'),
        now.toLocaleString(),
        '',
        t('justiceService.evidenceLine',`Evidence Locker: ${noteCount} notes, ${docCount} file(s)`),
        t('justiceService.resourcesViewed',`Resources viewed this session: ~${resourcesCount}`),
        '',
        t('justiceService.signals','Signals:'),
        t('justiceService.signal1','- Increase access to plain-language decisions'),
        t('justiceService.signal2','- Add navigators for tight appeal windows'),
        t('justiceService.signal3','- Expand accommodations for sustained earnings'),
      ];
      const output = lines.join('\n');
      setReport(output);
  announce(t('justiceService.generatedAnnounce','Advocacy snapshot generated'));
    } catch {
      setReport(t('justiceService.generateError','Unable to generate a local report.'));
      Alert.alert(t('justiceService.errorTitle','Generation failed'), t('justiceService.errorBody','Could not build snapshot.'));
    } finally {
      setGenerating(false);
    }
  };

  const reset = () => {
    setReport("");
  announce(t('justiceService.resetAnnounce','Snapshot cleared'));
  };

  const copyReport = async () => {
    if (!report) return;
    try {
      const mod = await import('expo-clipboard');
      await mod.setStringAsync(report);
      Alert.alert(t('justiceService.copied','Copied'), t('justiceService.copiedBody','Snapshot copied to clipboard.'));
    } catch {
      Alert.alert(t('justiceService.clipboardMissingTitle','Clipboard not available'), t('justiceService.clipboardMissingMsg','Install expo-clipboard in a dev build to enable copy.'));
    }
  };

  const shareReport = async () => {
    if (!report) return;
    try {
      const FS = await import('expo-file-system');
      const Share = await import('expo-sharing');
      const path = FS.cacheDirectory + `advocacy_snapshot_${Date.now()}.txt`;
      await FS.writeAsStringAsync(path, report);
      if (await Share.isAvailableAsync()) await Share.shareAsync(path);
      else Alert.alert(t('justiceService.shareUnavailable','Share unavailable'), t('justiceService.shareUnavailableBody','System share sheet not available.'));
    } catch {
      Alert.alert(t('justiceService.shareError','Share failed'), t('justiceService.shareErrorBody','Could not share snapshot file.'));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }} accessibilityLabel={t('justiceService.screenLabel','Justice-as-a-Service screen')}>
      <View style={styles.infoCard} accessibilityRole="summary" accessible accessibilityLabel={t('justiceService.howToUse','How to use Justice-as-a-Service')}>
        <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setShowInfo(s=>!s)} accessibilityRole="button" accessibilityLabel={t('justiceService.toggleInfo', showInfo? 'Hide instructions':'Show instructions')} style={styles.infoHeader}>
          <Text style={styles.infoTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('justiceService.infoTitle','How to Use')}</Text>
          <Text style={styles.infoToggle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{showInfo? t('justiceService.hide','Hide'): t('justiceService.show','Show')}</Text>
        </A11yPressable>
        {showInfo && (
          <View>
            <Text style={styles.infoText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('justiceService.infoLine1','Generate a local advocacy snapshot using only on-device cached data (notes and counts).')}</Text>
            <Text style={styles.infoText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('justiceService.infoLine2','Use Generate to build a snapshot, Copy to reuse, Share to export a file, and Reset to clear it.')}</Text>
            <Text style={styles.infoText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('justiceService.infoLine3','Data stays local; no network calls are made.')}</Text>
          </View>
        )}
        <View style={styles.actionRow}>
          <A11yPressable hitSlop={HIT_SLOP_8} onPress={generate} disabled={generating} accessibilityRole="button" accessibilityLabel={t('justiceService.generateBtnLabel','Generate snapshot')} accessibilityHint={t('justiceService.generateHint','Builds a local advocacy snapshot from cached notes and counts.')} style={[styles.smallBtn, { opacity: generating?0.6:1 }]}> 
            <Text style={styles.smallBtnText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{generating? t('justiceService.generating','Generating...'): t('justiceService.generate','Generate')}</Text>
          </A11yPressable>
          <A11yPressable hitSlop={HIT_SLOP_8} onPress={copyReport} disabled={!report} accessibilityRole="button" accessibilityLabel={t('justiceService.copyLabel','Copy snapshot')} accessibilityHint={t('justiceService.copyHint','Copies the generated snapshot to the clipboard.')} style={[styles.smallBtn, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, opacity: !report?0.5:1 }]}> 
            <Text style={[styles.smallBtnText,{ color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('justiceService.copy','Copy')}</Text>
          </A11yPressable>
          <A11yPressable hitSlop={HIT_SLOP_8} onPress={shareReport} disabled={!report} accessibilityRole="button" accessibilityLabel={t('justiceService.shareLabel','Share snapshot file')} accessibilityHint={t('justiceService.shareHint','Opens the system share dialog with a snapshot text file.')} style={[styles.smallBtn, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, opacity: !report?0.5:1 }]}> 
            <Text style={[styles.smallBtnText,{ color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('justiceService.share','Share')}</Text>
          </A11yPressable>
          <A11yPressable hitSlop={HIT_SLOP_8} onPress={reset} disabled={!report} accessibilityRole="button" accessibilityLabel={t('justiceService.resetLabel','Reset snapshot')} accessibilityHint={t('justiceService.resetHint','Clears the generated snapshot text.')} style={[styles.smallBtn, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, opacity: !report?0.5:1 }]}> 
            <Text style={[styles.smallBtnText,{ color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('justiceService.reset','Reset')}</Text>
          </A11yPressable>
        </View>
      </View>
      <Text ref={titleRef} accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('justiceService.title','Justice-as-a-Service')}</Text>
      {!!report && (
        <View style={{ marginTop: 12 }} accessibilityLabel={t('justiceService.snapshotRegion','Generated snapshot')} accessible>
          <Text style={styles.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>{report}</Text>
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text, marginBottom: 6 },
    text: { color: palette.text, marginBottom: 4 },
    infoCard: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface, padding: 12, borderRadius: 10, marginBottom: 12 },
    infoHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: 4 },
    infoTitle: { color: palette.primary, fontWeight:'700', fontSize:16 },
    infoToggle: { color: palette.text, fontSize: 12 },
    infoText: { color: palette.text, marginTop: 4 },
    actionRow: { flexDirection:'row', flexWrap:'wrap', gap:8, marginTop: 8 },
    smallBtn: { backgroundColor: palette.primary, paddingHorizontal:14, paddingVertical:10, borderRadius:8 },
    smallBtnText: { color: palette.onPrimary, fontWeight:'700' },
  });
}
