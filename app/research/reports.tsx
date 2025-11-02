import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { GapView } from '../../components/GapView';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

const reports = [
  {
    id: 'disability-canada-2024',
    title: 'Canadian Survey on Disability 2024',
    description: 'Statistics Canada\'s comprehensive report on disability prevalence, barriers, and supports across Canada.',
    link: 'https://www.statcan.gc.ca/disability-survey',
    source: 'Statistics Canada',
    year: '2024',
    tags: ['National', 'Data', 'Government']
  },
  {
    id: 'wsib-annual-2023',
    title: 'WSIB Annual Report 2023',
    description: 'Workplace Safety and Insurance Board annual statistics on workplace injuries, claims, and return-to-work outcomes.',
    link: 'https://www.wsib.ca/en/annualreport',
    source: 'WSIB Ontario',
    year: '2023',
    tags: ['Ontario', 'Workplace', 'Statistics']
  },
  {
    id: 'poverty-disability-2024',
    title: 'Disability and Poverty in Canada',
    description: 'Community report examining the intersection of disability and poverty, with policy recommendations.',
    link: 'https://cwp-csp.ca/poverty-disability',
    source: 'Canada Without Poverty',
    year: '2024',
    tags: ['Poverty', 'Advocacy', 'Community']
  },
  {
    id: 'mental-health-work-2023',
    title: 'Mental Health in the Workplace',
    description: 'Report on mental health accommodations, stigma, and workplace supports across Canadian industries.',
    link: 'https://www.mentalhealthcommission.ca/workplace-report',
    source: 'Mental Health Commission',
    year: '2023',
    tags: ['Mental Health', 'Workplace', 'National']
  },
  {
    id: 'uncrpd-canada-review',
    title: 'UN CRPD Canada Review 2023',
    description: 'United Nations review of Canada\'s implementation of the Convention on the Rights of Persons with Disabilities.',
    link: 'https://www.ohchr.org/EN/HRBodies/CRPD/Pages/CountryReports.aspx',
    source: 'UN Human Rights',
    year: '2023',
    tags: ['International', 'Rights', 'Government']
  },
  {
    id: 'accessibility-progress-2024',
    title: 'Accessible Canada Act Progress Report',
    description: 'Federal government report on progress implementing the Accessible Canada Act and removing barriers.',
    link: 'https://www.canada.ca/en/employment-social-development/programs/accessible-canada.html',
    source: 'ESDC Canada',
    year: '2024',
    tags: ['Accessibility', 'National', 'Legislation']
  }
];

export default function ReportsScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = styles(palette, factor);
  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Reports</Text>
      <Text style={s.intro}>Community and government reports on disability, workplace safety, and social policy.</Text>
      
      <GapView gap={16} style={{ marginTop: 16 }}>
        {reports.map(report => (
          <View key={report.id} style={s.card}>
            <Text style={s.reportTitle}>{report.title}</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <Text style={s.meta}>{report.source} • {report.year}</Text>
            </View>
            <Text style={s.reportDesc}>{report.description}</Text>
            <GapView gap={6} style={s.tagRow}>
              {report.tags.map(tag => (
                <View key={tag} style={s.tag}>
                  <Text style={s.tagText}>{tag}</Text>
                </View>
              ))}
            </GapView>
            <A11yPressable
              accessibilityRole="link"
              accessibilityLabel={`Open ${report.title}`}
              onPress={() => Linking.openURL(report.link).catch(() => {})}
              style={s.linkButton}
              hitSlop={HIT_SLOP_8}
            >
              <Text style={s.linkText}>View Report →</Text>
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
    reportTitle: { fontSize: Math.round(18 * factor), fontWeight: '600', color: palette.text, marginBottom: 6 },
    meta: { fontSize: Math.round(13 * factor), color: palette.text, opacity: 0.7, fontWeight: '500' },
    reportDesc: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.85, lineHeight: 20, marginBottom: 12 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
    tag: { backgroundColor: palette.card, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    tagText: { fontSize: 11, color: palette.text, opacity: 0.8, fontWeight: '600' },
    linkButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, backgroundColor: palette.primary, borderRadius: 8 },
    linkText: { color: palette.onPrimary, fontWeight: '700', fontSize: Math.round(14 * factor) },
  });
}
