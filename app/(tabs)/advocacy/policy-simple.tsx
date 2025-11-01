import { useLocalSearchParams } from 'expo-router';
import React from "react";
import {
    Alert,
    Linking,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
 
import AIDisclaimer from '../../../components/AIDisclaimer';
import { DyslexiaText } from '../../../components/DyslexiaText';
import { GapView } from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from '../../../i18n';
import { aiPolicySimplify } from '../../../services/aiAdvocacy';
import { useAppPalette } from "../../../theme/usePalette";


const SECTIONS = [
  {
    title: 'advocacy.policy.sectionRights',
    items: [
      { label: 'advocacy.policy.linkDuty', url: 'https://www.chrc-ccdp.gc.ca/en/resources/what-duty-accommodate' },
      { label: 'advocacy.policy.linkOHRC', url: 'https://www.ohrc.on.ca/' },
    ],
  },
  {
    title: 'advocacy.policy.sectionAccessibility',
    items: [
      { label: 'advocacy.policy.linkAccessibleCanada', url: 'https://accessible.canada.ca/' },
      { label: 'advocacy.policy.linkAoda', url: 'https://www.ontario.ca/page/accessibility-laws' },
    ],
  },
  {
    title: 'advocacy.policy.sectionBenefits',
    items: [
      { label: 'advocacy.policy.linkCppd', url: 'https://www.canada.ca/en/services/benefits/publicpensions/cpp/cpp-disability-benefit.html' },
      { label: 'advocacy.policy.linkEmploymentStandards', url: 'https://www.ontario.ca/document/your-guide-employment-standards-act-0' },
    ],
  },
];

export const options = { href: null };

export default function PolicySimple() {
  // Router params (top-most to avoid conditional hooks)
  const { q } = useLocalSearchParams<{ q?: string }>();
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t('advocacy.tools.policy_simple'));
  useFocusOnRefOnMount(titleRef);
  const open = (url: string) => Linking.openURL(url).catch(() => {});
  const [raw, setRaw] = React.useState(t('advocacy.policy.placeholder','Paste or type a policy / decision excerpt here to simplify.'));
  const [loading, setLoading] = React.useState(false);
  // Seed via q param when present
  const [summary, setSummary] = React.useState('');
  const [points, setPoints] = React.useState<string[]>([]);
  const [obligations, setObligations] = React.useState<string[]>([]);
  const [actions, setActions] = React.useState<string[]>([]);
  React.useEffect(()=>{
    if (q && !raw) setRaw(String(q));
  }, [q, raw]);
  const buildPlain = React.useCallback(() => {
    const parts = [] as string[];
    if (summary) parts.push(summary.trim());
    if (points.length) parts.push(t('advocacy.policy.keyPoints','Key Points')+':\n' + points.map((p,i)=>`${i+1}. ${p}`).join('\n'));
    if (obligations.length) parts.push(t('advocacy.policy.obligations','Obligations')+':\n' + obligations.map((p,i)=>`${i+1}. ${p}`).join('\n'));
    if (actions.length) parts.push(t('advocacy.policy.suggestedActions','Suggested Actions')+':\n' + actions.map((p,i)=>`${i+1}. ${p}`).join('\n'));
    return parts.join('\n\n');
  }, [summary, points, obligations, actions, t]);
  const copySummary = async () => {
    if (!summary) return;
    try { const Clipboard = await import('expo-clipboard'); await Clipboard.setStringAsync(buildPlain()); Alert.alert(t('common.copied','Copied'), t('advocacy.policy.copiedBody','Summary copied to clipboard.')); }
    catch { Alert.alert(t('advocacy.policy.clipboardNA','Clipboard not available'), t('advocacy.policy.clipboardNABody','Install expo-clipboard in a dev build to enable copy.')); }
  };
  const shareSummary = async () => {
    const msg = buildPlain(); if (!msg) return;
    try { await Share.share({ message: msg, title: t('advocacy.tools.policy_simple') }); } catch {}
  };
  const exportPdf = async () => {
    const msg = buildPlain(); if (!msg) return;
    try { const Print = await import('expo-print'); const html = `<pre style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;\">${msg.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre>`; const { uri } = await Print.printToFileAsync({ html }); await Share.share({ url: uri, title: t('advocacy.tools.policy_simple') }); }
    catch { Alert.alert(t('templates.letters.common.pdfNA','PDF not available'), t('templates.letters.common.pdfNABody','Install expo-print in a dev build to export PDFs.')); }
  };
  const exportDoc = async () => {
    const msg = buildPlain(); if (!msg) return;
    try { const FS = await import('expo-file-system'); const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${msg.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre></body></html>`; const path = FS.cacheDirectory + `policy_simple_${Date.now()}.doc`; await FS.writeAsStringAsync(path, html, { encoding: FS.EncodingType.UTF8 }); await Share.share({ url: path, title: t('advocacy.tools.policy_simple') + ' (.doc)' }); }
    catch { Alert.alert(t('templates.letters.common.exportFailed','Export failed'), t('templates.letters.common.exportFailedBody','Could not create file.')); }
  };

  const runSimplify = async () => {
    if (!raw.trim()) return;
    setLoading(true);
    try {
      const { summary, keyPoints } = await aiPolicySimplify('policy', raw);
      setSummary(summary);
      setPoints(keyPoints);
      // Simple heuristic extraction: lines containing must/shall/required -> obligations; recommend/should/consider -> actions
      const lines = raw.split(/\n+/).map(l=>l.trim()).filter(Boolean).slice(0,200);
      const ob: string[] = []; const act: string[] = [];
      lines.forEach(l => {
        const lower = l.toLowerCase();
        if(/\b(must|shall|required|obliged)\b/.test(lower)) ob.push(l);
        else if(/\b(should|recommend|consider|encouraged)\b/.test(lower)) act.push(l);
      });
      setObligations(ob.slice(0,8));
      setActions(act.slice(0,8));
    } catch {
      Alert.alert('Error','Could not simplify.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('advocacy.tools.policy_simple')}
      </Text>
      <Text style={s.subtitle}>{t('advocacy.policy.subtitle','Easy-read guides to accessibility, human rights, and benefits.')}</Text>
      <Text style={[s.helper, { fontStyle: 'italic' }]}>
        Hint: prefill from Assistant quick prompts or deep-links using ?q=...
      </Text>
      <View style={s.aiBox}>
        <Text style={s.sectionTitle}>{t('advocacy.policy.aiHeader')}</Text>
        <Text style={s.helper}>{t('advocacy.policy.aiHelp')}</Text>
        <TextInput
          style={s.input}
            multiline={true}
            value={raw}
            onChangeText={setRaw}
            accessibilityLabel="Policy text input"
        />
  <Pressable onPress={runSimplify} style={[s.button, loading && { opacity:0.6 }]} accessibilityRole="button" accessibilityLabel={t('advocacy.policy.simplify')} disabled={loading} hitSlop={HIT_SLOP_8}>
          <Text style={s.buttonText}>{loading ? t('advocacy.policy.simplifying') : t('advocacy.policy.simplify')}</Text>
        </Pressable>
        {!!summary && (
          <View style={s.resultBox} accessibilityRole="summary" accessibilityLabel="Simplified summary and key points">
            <Text style={s.resultTitle}>{t('advocacy.policy.summary')}</Text>
            <DyslexiaText style={s.resultText}>{summary}</DyslexiaText>
            {points.length>0 && <Text style={[s.resultTitle,{marginTop:8}]}>{t('advocacy.policy.keyPoints')}</Text>}
            {points.map((p,i)=>(<DyslexiaText key={i} style={s.resultText}>• {p}</DyslexiaText>))}
            {obligations.length>0 && <Text style={[s.resultTitle,{marginTop:8}]}>{t('advocacy.policy.obligations','Obligations')}</Text>}
            {obligations.map((p,i)=>(<DyslexiaText key={i} style={s.resultText}>• {p}</DyslexiaText>))}
            {actions.length>0 && <Text style={[s.resultTitle,{marginTop:8}]}>{t('advocacy.policy.suggestedActions','Suggested Actions')}</Text>}
            {actions.map((p,i)=>(<DyslexiaText key={i} style={s.resultText}>• {p}</DyslexiaText>))}
            <GapView style={{ flexDirection:'row', flexWrap:'wrap', marginTop: 12 }} gap={8}>
              <Pressable onPress={copySummary} style={[s.button,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]} accessibilityRole="button" accessibilityLabel={t('advocacy.policy.copy','Copy summary')} hitSlop={HIT_SLOP_8}><Text style={[s.buttonText,{ color: palette.text }]}>{t('advocacy.policy.copy','Copy')}</Text></Pressable>
              <Pressable onPress={shareSummary} style={s.button} accessibilityRole="button" accessibilityLabel={t('advocacy.policy.share','Share summary')} hitSlop={HIT_SLOP_8}><Text style={s.buttonText}>{t('advocacy.policy.share','Share')}</Text></Pressable>
              <Pressable onPress={exportPdf} style={s.button} accessibilityRole="button" accessibilityLabel={t('advocacy.policy.exportPdf','Export as PDF')} hitSlop={HIT_SLOP_8}><Text style={s.buttonText}>{t('advocacy.policy.exportPdf','Export as PDF')}</Text></Pressable>
              <Pressable onPress={exportDoc} style={s.button} accessibilityRole="button" accessibilityLabel={t('advocacy.policy.exportDoc','Export as .doc')} hitSlop={HIT_SLOP_8}><Text style={s.buttonText}>{t('advocacy.policy.exportDoc','Export as .doc')}</Text></Pressable>
            </GapView>
          </View>
        )}
        <AIDisclaimer />
      </View>
      {SECTIONS.map((sec) => (
        <View key={sec.title} style={s.card}>
          <Text style={s.cardTitle}>{t(sec.title, sec.title)}</Text>
          {sec.items.map((it) => (
            <Pressable
              key={it.label}
              onPress={() => open(it.url)}
              accessibilityRole="link"
            >
              <Text style={s.link}>{t(it.label, it.label)}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      backgroundColor: palette.surface,
      marginTop: 8,
    },
    cardTitle: { color: palette.text, fontWeight: "700", marginBottom: 6 },
    link: { color: palette.primary, fontWeight: "700", marginBottom: 6 },
    aiBox: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface, padding:12, borderRadius:8, marginBottom:8 },
    sectionTitle: { color: palette.text, fontWeight:'700', marginBottom:4 },
    helper: { color: palette.text, opacity:0.9, marginBottom:6 },
    input: { borderWidth:1, borderColor: palette.muted, borderRadius:8, padding:10, color: palette.text, minHeight:100, textAlignVertical:'top' },
    button: { backgroundColor: palette.primary, paddingVertical:10, borderRadius:8, alignItems:'center', marginTop:8 },
    buttonText: { color: palette.onPrimary, fontWeight:'700' },
    resultBox: { marginTop:10 },
    resultTitle: { color: palette.text, fontWeight:'700' },
    resultText: { color: palette.text, opacity:0.95, marginTop:4 },
  });
}
