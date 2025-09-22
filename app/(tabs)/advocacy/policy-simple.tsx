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
    title: "Human Rights & Duty to Accommodate",
    items: [
      {
        label: "What is the duty to accommodate?",
        url: "https://www.chrc-ccdp.gc.ca/en/resources/what-duty-accommodate",
      },
      {
        label: "Ontario Human Rights Commission",
        url: "https://www.ohrc.on.ca/",
      },
    ],
  },
  {
    title: "Accessibility Laws",
    items: [
      { label: "Accessibility (Canada)", url: "https://accessible.canada.ca/" },
      {
        label: "AODA (Ontario)",
        url: "https://www.ontario.ca/page/accessibility-laws",
      },
    ],
  },
  {
    title: "Disability Benefits",
    items: [
      {
        label: "CPPÃ¢â‚¬â€˜D",
        url: "https://www.canada.ca/en/services/benefits/publicpensions/cpp/cpp-disability-benefit.html",
      },
      {
        label: "Employment Standards (ON)",
        url: "https://www.ontario.ca/document/your-guide-employment-standards-act-0",
      },
    ],
  },
];

export const options = { href: null };

export default function PolicySimple() {
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Policy Made Simple");
  useFocusOnRefOnMount(titleRef);
  const { t } = useTranslation();
  const open = (url: string) => Linking.openURL(url).catch(() => {});
  const [raw, setRaw] = React.useState('Paste or type a policy / decision excerpt here to simplify.');
  const [loading, setLoading] = React.useState(false);
  const [summary, setSummary] = React.useState('');
  const [points, setPoints] = React.useState<string[]>([]);

  const runSimplify = async () => {
    if (!raw.trim()) return;
    setLoading(true);
    try {
      const { summary, keyPoints } = await aiPolicySimplify('policy', raw);
      setSummary(summary);
      setPoints(keyPoints);
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
      <Text style={s.subtitle}>
        Easy-read guides to accessibility, human rights, and benefits.
      </Text>
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
        <Pressable onPress={runSimplify} style={[s.button, loading && { opacity:0.6 }]} accessibilityRole="button" accessibilityLabel={t('advocacy.policy.simplify')} disabled={loading}>
          <Text style={s.buttonText}>{loading ? t('advocacy.policy.simplifying') : t('advocacy.policy.simplify')}</Text>
        </Pressable>
        {!!summary && (
          <View style={s.resultBox} accessibilityRole="summary" accessibilityLabel="Simplified summary and key points">
            <Text style={s.resultTitle}>{t('advocacy.policy.summary')}</Text>
            <Text style={s.resultText}>{summary}</Text>
            {points.length>0 && <Text style={[s.resultTitle,{marginTop:8}]}>{t('advocacy.policy.keyPoints')}</Text>}
            {points.map((p,i)=>(<Text key={i} style={s.resultText}>• {p}</Text>))}
          </View>
        )}
        <AIDisclaimer />
      </View>
      {SECTIONS.map((sec) => (
        <View key={sec.title} style={s.card}>
          <Text style={s.cardTitle}>{sec.title}</Text>
          {sec.items.map((it) => (
            <Pressable
              key={it.label}
              onPress={() => open(it.url)}
              accessibilityRole="link"
            >
              <Text style={s.link}>{it.label}</Text>
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
