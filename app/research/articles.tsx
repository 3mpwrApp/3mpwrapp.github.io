import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { GapView } from '../../components/GapView';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

const articles = [
  {
    id: 'know-your-rights',
    title: 'Know Your Rights as a Disabled Worker',
    description: 'Comprehensive guide to workplace rights, accommodations, and legal protections under Canadian human rights law.',
    link: 'https://www.chrc-ccdp.gc.ca/en/resources/duty-accommodate',
    category: 'Rights',
    readTime: '8 min read'
  },
  {
    id: 'navigating-appeals',
    title: 'Navigating the Appeals Process',
    description: 'Step-by-step guide to appealing disability benefit denials, including timelines, evidence requirements, and hearing preparation.',
    link: 'https://www.canada.ca/disability-appeals-guide',
    category: 'Advocacy',
    readTime: '12 min read'
  },
  {
    id: 'chronic-pain-validation',
    title: 'Chronic Pain: Fighting for Validation',
    description: 'Strategies for documenting and advocating for chronic pain recognition in disability claims and workplace settings.',
    link: 'https://painbc.ca/resources/chronic-pain-advocacy',
    category: 'Health',
    readTime: '10 min read'
  },
  {
    id: 'mental-health-stigma',
    title: 'Breaking Mental Health Stigma at Work',
    description: 'How to advocate for mental health accommodations and combat stigma in workplace and claims processes.',
    link: 'https://www.mentalhealthcommission.ca/workplace-stigma',
    category: 'Mental Health',
    readTime: '7 min read'
  },
  {
    id: 'evidence-collection',
    title: 'Building Your Evidence File',
    description: 'What documentation to collect, how to organize it, and strategies for strengthening your disability claim.',
    link: 'https://www.disabilityalliancebc.org/evidence-guide',
    category: 'Advocacy',
    readTime: '15 min read'
  },
  {
    id: 'uncrpd-explained',
    title: 'The UN CRPD and Your Rights',
    description: 'Understanding the UN Convention on the Rights of Persons with Disabilities and how it applies in Canada.',
    link: 'https://www.ohchr.org/en/instruments-mechanisms/instruments/convention-rights-persons-disabilities',
    category: 'International Rights',
    readTime: '11 min read'
  },
  {
    id: 'intersectionality',
    title: 'Disability and Intersectionality',
    description: 'Examining how race, gender, class, and other identities intersect with disability experiences and advocacy.',
    link: 'https://www.crwdp.ca/intersectionality-disability',
    category: 'Justice',
    readTime: '9 min read'
  },
  {
    id: 'accommodations-work',
    title: 'Effective Workplace Accommodations',
    description: 'Real-world examples of workplace accommodations, how to request them, and your employer\'s duties.',
    link: 'https://www.canada.ca/en/employment-social-development/services/disability/accommodations.html',
    category: 'Workplace',
    readTime: '10 min read'
  }
];

export default function ArticlesScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = styles(palette, factor);
  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>Articles</Text>
      <Text style={s.intro}>Insights on disability rights, workplace advocacy, and navigating support systems.</Text>
      
      <GapView gap={16} style={{ marginTop: 16 }}>
        {articles.map(article => (
          <View key={article.id} style={s.card}>
            <View style={s.categoryBadge}>
              <Text style={s.categoryText}>{article.category}</Text>
            </View>
            <Text style={s.articleTitle}>{article.title}</Text>
            <Text style={s.articleDesc}>{article.description}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <Text style={s.readTime}>{article.readTime}</Text>
              <A11yPressable
                accessibilityRole="link"
                accessibilityLabel={`Read ${article.title}`}
                onPress={() => Linking.openURL(article.link).catch(() => {})}
                style={s.linkButton}
                hitSlop={HIT_SLOP_8}
              >
                <Text style={s.linkText}>Read Article →</Text>
              </A11yPressable>
            </View>
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
    categoryBadge: { backgroundColor: palette.primary, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
    categoryText: { fontSize: 11, color: palette.onPrimary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    articleTitle: { fontSize: Math.round(18 * factor), fontWeight: '600', color: palette.text, marginBottom: 8 },
    articleDesc: { fontSize: Math.round(14 * factor), color: palette.text, opacity: 0.85, lineHeight: 20 },
    readTime: { fontSize: 12, color: palette.text, opacity: 0.6, fontStyle: 'italic' },
    linkButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: palette.card, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.primary },
    linkText: { color: palette.primary, fontWeight: '700', fontSize: Math.round(14 * factor) },
  });
}
