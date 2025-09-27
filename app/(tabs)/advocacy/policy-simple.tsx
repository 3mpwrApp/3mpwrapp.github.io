import { useLocalSearchParams } from 'expo-router';
import React from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
 
import AIDisclaimer from '../../../components/AIDisclaimer';
import { HIT_SLOP_8 } from '../../../constants/a11y';
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
      <View style={s.aiBox}>
        <Text style={s.sectionTitle}>{t('advocacy.policy.aiHeader')}</Text>
        <Text style={s.helper}>{t('advocacy.policy.aiHelp')}</Text>
        <TextInput
          style={s.input}
            multiline
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
            <Text style={s.resultText}>{summary}</Text>
            {points.length>0 && <Text style={[s.resultTitle,{marginTop:8}]}>{t('advocacy.policy.keyPoints')}</Text>}
            {points.map((p,i)=>(<Text key={i} style={s.resultText}>• {p}</Text>))}
            {obligations.length>0 && <Text style={[s.resultTitle,{marginTop:8}]}>{t('advocacy.policy.obligations','Obligations')}</Text>}
            {obligations.map((p,i)=>(<Text key={i} style={s.resultText}>• {p}</Text>))}
            {actions.length>0 && <Text style={[s.resultTitle,{marginTop:8}]}>{t('advocacy.policy.suggestedActions','Suggested Actions')}</Text>}
            {actions.map((p,i)=>(<Text key={i} style={s.resultText}>• {p}</Text>))}
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
