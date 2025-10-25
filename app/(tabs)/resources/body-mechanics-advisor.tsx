import React from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { analyzeBodyVideo } from '../../../services/body';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';

export const options = { href: null };

export default function BodyMechanicsAdvisor() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('AI Body Mechanics Advisor');
  useFocusOnRefOnMount(titleRef);
  const [videoName, setVideoName] = React.useState('');
  const [advice, setAdvice] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { t } = useTranslation();

  const analyze = async (uri: string, name?: string) => {
    try {
      setLoading(true);
      setAdvice([]);
      const backend = await analyzeBodyVideo(uri, name || 'video.mp4');
      if (backend?.suggestions?.length) {
        setAdvice(backend.suggestions);
      } else {
        setAdvice([
          t('bodyMechanics.tipWrists','Keep wrists neutral; avoid prolonged flexion when typing.'),
          t('bodyMechanics.tipHinge','Use hip hinge and keep load close when lifting.'),
          t('bodyMechanics.tipPacing','Consider pacing: activity blocks of 20–30 minutes with breaks.'),
        ]);
      }
  setTimeout(()=> announce(t('bodyMechanics.analysisComplete','Analysis complete. Suggestions ready.')), 50);
    } catch {
      Alert.alert(t('bodyMechanics.analysisFailTitle','Analysis failed'), t('bodyMechanics.analysisFailMsg','Could not analyze the video. Using default guidance.'));
      setAdvice([
        t('bodyMechanics.tipWrists','Keep wrists neutral; avoid prolonged flexion when typing.'),
        t('bodyMechanics.tipHinge','Use hip hinge and keep load close when lifting.'),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const shareAdvice = async () => {
    if (!advice.length) return;
    const content = `Body Mechanics Suggestions\n\n` + advice.map(a=>`• ${a}`).join('\n');
    try {
      const FS: any = await import('expo-file-system');
      const cacheDir: string | undefined = FS?.cacheDirectory || FS?.default?.cacheDirectory;
      const write = FS?.writeAsStringAsync || FS?.default?.writeAsStringAsync;
      const enc = FS?.EncodingType?.UTF8 || FS?.default?.EncodingType?.UTF8;
      if (!cacheDir || !write) throw new Error('fs-missing');
      const path = cacheDir + `body_mechanics_${Date.now()}.txt`;
      await write(path, content, enc ? { encoding: enc } : undefined);
      await Share.share({ url: path, message: content, title: t('bodyMechanics.shareTitle','Body Mechanics Suggestions') });
    } catch { Alert.alert(t('bodyMechanics.shareFailTitle','Share failed'), t('bodyMechanics.shareFailMsg','Could not share suggestions.')); }
  };

  const copyAdvice = async () => {
    if (!advice.length) return;
    try {
      const mod = await import('expo-clipboard');
      await mod.setStringAsync(advice.map(a=>`• ${a}`).join('\n'));
      Alert.alert(t('bodyMechanics.copiedTitle','Copied'), t('bodyMechanics.copiedMsg','Suggestions copied to clipboard.'));
    } catch {
      Alert.alert(t('bodyMechanics.clipboardFailTitle','Clipboard unavailable'), t('bodyMechanics.clipboardFailMsg','Install expo-clipboard to enable copying.'));
    }
  };

  return (
    <View style={s.container} accessibilityLabel={t('bodyMechanics.screenLabel','AI Body Mechanics Advisor screen')} accessible>
      <View style={s.infoCard} accessibilityLabel={t('bodyMechanics.howToUse','How to use Body Mechanics Advisor')} accessibilityRole="summary">
        <Text style={[s.cardTitle,{ color: palette.primary }]}>{t('bodyMechanics.howToUseTitle','How to Use')}</Text>
        <Text style={s.text}>{t('bodyMechanics.instructions','Pick a short video of a daily task (typing, lifting, posture). The tool offers accessibility-first ergonomic suggestions. Not medical advice.')}</Text>
        <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap', marginTop:8 }}>
          <A11yPressable onPress={shareAdvice} disabled={!advice.length} style={[s.smallBtn, !advice.length && { opacity:0.5 }]} accessibilityLabel={t('bodyMechanics.export','Export suggestions')} accessibilityHint={t('bodyMechanics.exportHint','Shares current suggestions as a text file.')} accessibilityRole="button">
            <Text style={s.smallBtnText}>{t('bodyMechanics.exportBtn','Share')}</Text>
          </A11yPressable>
          <A11yPressable onPress={copyAdvice} disabled={!advice.length} style={[s.smallBtn, !advice.length && { opacity:0.5 }]} accessibilityLabel={t('bodyMechanics.copy','Copy suggestions')} accessibilityHint={t('bodyMechanics.copyHint','Copies current suggestions to clipboard.')} accessibilityRole="button">
            <Text style={s.smallBtnText}>{t('bodyMechanics.copyBtn','Copy')}</Text>
          </A11yPressable>
          <A11yPressable onPress={()=>{ setAdvice([]); setVideoName(''); }} style={s.smallBtn} accessibilityLabel={t('bodyMechanics.reset','Reset advisor')} accessibilityHint={t('bodyMechanics.resetHint','Clears selected video and suggestions.')} accessibilityRole="button">
            <Text style={s.smallBtnText}>{t('bodyMechanics.resetBtn','Reset')}</Text>
          </A11yPressable>
        </View>
      </View>
      <Text ref={titleRef} style={s.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>AI Body Mechanics Advisor</Text>
      <DisclaimerBanner type="medical" compact />
      <DisclaimerBanner type="ai" compact />
      <Text style={s.text}>{t('bodyMechanics.subtitle','Upload a short video of a daily task to receive accessibility-focused movement suggestions. Not medical advice.')}</Text>
      <A11yPressable onPress={async()=>{
        try {
          const DP = await import('expo-document-picker');
          const res = await DP.getDocumentAsync({ type: 'video/*' });
          const asset = res?.assets?.[0];
          if (!asset?.uri) return;
          setVideoName(asset.name || 'video');
          await analyze(asset.uri, asset.name);
        } catch { Alert.alert(t('bodyMechanics.pickFailTitle','Pick failed'), t('bodyMechanics.pickFailMsg','Could not select video.')); }
      }} style={s.button} accessibilityRole="button" accessibilityLabel={t('bodyMechanics.pick','Pick video')} accessibilityHint={t('bodyMechanics.pickHint','Opens a file picker to select a short movement video.')}> <Text style={s.buttonText}>{t('bodyMechanics.pickBtn','Pick Video')}</Text></A11yPressable>

      {!!videoName && <Text style={s.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('bodyMechanics.selectedLabel','Selected video')}: {videoName}</Text>}
      {loading && (
        <Text style={[s.text, { opacity:0.8 }]} accessibilityRole="alert" maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('bodyMechanics.analyzing','Analyzing video...')}</Text>
      )}
      {!!advice.length && (
        <View style={s.card}>
          <Text style={s.cardTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('bodyMechanics.suggestions','Suggestions')}</Text>
          {advice.map((a,i)=>(<Text key={i} style={s.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>• {a}</Text>))}
        </View>
      )}
      {!loading && !advice.length && !!videoName && (
        <Text style={[s.text,{ opacity:0.8 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('bodyMechanics.noSuggestionsYet','No suggestions yet. Complete analysis to view guidance.')}</Text>
      )}
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: palette.text },
    text: { color: palette.text, opacity: 0.95, marginTop: 8 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, borderRadius: 8, alignItems:'center', marginTop: 8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    card: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: palette.surface },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
    infoCard: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 10, padding: 12, backgroundColor: palette.surface, marginBottom: 12 },
    smallBtn: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    smallBtnText: { color: palette.text, fontWeight:'700' },
  });
}
