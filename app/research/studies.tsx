import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { GapView } from '../../components/GapView';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

const studies = [
  {
    id: 'wsib-cptsd',
    title: 'CPTSD in Injured Workers',
    description: 'Research on Complex Post-Traumatic Stress Disorder prevalence and impacts in workplace injury cases.',
    link: 'https://pubmed.ncbi.nlm.nih.gov/topics/workplace-ptsd',
    tags: ['Mental Health', 'WSIB', 'Trauma']
  },
  {
    id: 'rtw-barriers',
    title: 'Return-to-Work Barriers Study',
    description: 'Comprehensive study on systemic barriers preventing successful return-to-work outcomes for injured workers.',
    link: 'https://www.iwh.on.ca/scientific-reports',
    tags: ['Return to Work', 'Barriers', 'Policy']
  },
  {
    id: 'chronic-pain',
    title: 'Chronic Pain in Disability Claims',
    description: 'Evidence-based research on chronic pain management and its recognition in disability benefit adjudication.',
    link: 'https://www.ncbi.nlm.nih.gov/pmc/articles/chronic-pain-disability',
    tags: ['Chronic Pain', 'Benefits', 'Medical']
  },
  {
    id: 'mental-health-stigma',
    title: 'Mental Health Stigma in Workplace',
    description: 'Study examining how mental health stigma affects disability claims and workplace accommodation.',
    link: 'https://www.mentalhealthcommission.ca/research',
    tags: ['Mental Health', 'Stigma', 'Workplace']
  },
  {
    id: 'appeals-success',
    title: 'Appeals Process Success Rates',
    description: 'Data analysis of appeals success rates across Canadian disability benefit systems.',
    link: 'https://www.canada.ca/disability-appeals-data',
    tags: ['Appeals', 'Data', 'Statistics']
  },
  {
    id: 'accommodation-effectiveness',
    title: 'Workplace Accommodation Effectiveness',
    description: 'Research on the effectiveness of various workplace accommodation strategies for disabled workers.',
    link: 'https://www.chrc-ccdp.gc.ca/eng/content/accommodation-research',
    tags: ['Accommodation', 'Workplace', 'Effectiveness']
  }
];

export default function StudiesScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = styles(palette, factor);
  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Studies</Text>
      <Text style={s.intro}>Clinical and workplace research studies on disability, injury, and return-to-work outcomes.</Text>
      
      <GapView gap={16} style={{ marginTop: 16 }}>
        {studies.map(study => (
          <View key={study.id} style={s.card}>
            <Text style={s.studyTitle}>{study.title}</Text>
            <Text style={s.studyDesc}>{study.description}</Text>
            <GapView gap={6} style={s.tagRow}>
              {study.tags.map(tag => (
                <View key={tag} style={s.tag}>
                  <Text style={s.tagText}>{tag}</Text>
                </View>
              ))}
            </GapView>
            <A11yPressable
              accessibilityRole="link"
              accessibilityLabel={`Open ${study.title}`}
              onPress={() => Linking.openURL(study.link).catch(() => {})}
              style={s.linkButton}
              hitSlop={HIT_SLOP_8}
            >
              <Text style={s.linkText}>Read Study →</Text>
            </A11yPressable>
          </View>
        ))}
      </GapView>
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 20 },
    title: { fontSize: Math.round(24 * factor), fontWeight:'700', color: palette.text, marginBottom: 12 },
    intro: { fontSize: Math.round(16 * factor), color: palette.text, opacity: 0.85, lineHeight: 22, marginBottom: 8 },
    card: { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, padding: 16, borderRadius: 12 },
    studyTitle: { fontSize: Math.round(18 * factor), fontWeight: '600', color: palette.text, marginBottom: 8 },
    studyDesc: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.85, lineHeight: 20, marginBottom: 12 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
    tag: { backgroundColor: palette.card, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    tagText: { fontSize: 11, color: palette.text, opacity: 0.8, fontWeight: '600' },
    linkButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, backgroundColor: palette.primary, borderRadius: 8 },
    linkText: { color: palette.onPrimary, fontWeight: '700', fontSize: Math.round(14 * factor) },
  });
}
