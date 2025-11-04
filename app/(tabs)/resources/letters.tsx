import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTextScale } from '../../../theme/typography';
import { useAppPalette } from '../../../theme/usePalette';

// 22 Letter Templates organized by category
const LETTER_TEMPLATES = [
  {
    category: 'CPP Disability & Benefits',
    templates: [
      { id: 'cpp-reconsideration', title: 'CPP-D Reconsideration Request', description: 'Request reconsideration of denied CPP Disability application' },
      { id: 'cpp-appeal', title: 'CPP-D Appeal to SST', description: 'Appeal denial to Social Security Tribunal' },
      { id: 'cpp-new-medical', title: 'Submit New Medical Evidence', description: 'Provide updated medical documentation' },
      { id: 'ei-sickness', title: 'EI Sickness Benefits Request', description: 'Apply for Employment Insurance sickness benefits' },
    ]
  },
  {
    category: 'Workplace & WSIB',
    templates: [
      { id: 'wsib-claim', title: 'WSIB Initial Claim', description: 'File workplace injury claim with WSIB' },
      { id: 'wsib-appeal', title: 'WSIB Decision Appeal', description: 'Appeal WSIB claim decision' },
      { id: 'accommodation-request', title: 'Workplace Accommodation Request', description: 'Request disability accommodations from employer' },
      { id: 'accommodation-follow', title: 'Accommodation Follow-up', description: 'Follow up on pending accommodation request' },
      { id: 'disability-leave', title: 'Disability Leave Request', description: 'Request extended medical leave' },
    ]
  },
  {
    category: 'ODSP & Social Assistance',
    templates: [
      { id: 'odsp-application', title: 'ODSP Initial Application', description: 'Apply for Ontario Disability Support Program' },
      { id: 'odsp-reconsideration', title: 'ODSP Reconsideration', description: 'Request reconsideration of ODSP denial' },
      { id: 'odsp-appeal', title: 'ODSP Appeal to Tribunal', description: 'Appeal to Social Benefits Tribunal' },
      { id: 'income-change', title: 'Report Income Change', description: 'Notify ODSP of income/asset changes' },
    ]
  },
  {
    category: 'Medical & Documentation',
    templates: [
      { id: 'medical-records-request', title: 'Request Medical Records', description: 'Formally request your medical records' },
      { id: 'functional-assessment', title: 'Request Functional Assessment', description: 'Request comprehensive functional abilities assessment' },
      { id: 'specialist-referral', title: 'Request Specialist Referral', description: 'Ask for referral to specialist' },
      { id: 'treatment-approval', title: 'Insurance Treatment Pre-Approval', description: 'Request insurance pre-approval for treatment' },
    ]
  },
  {
    category: 'Human Rights & Discrimination',
    templates: [
      { id: 'hrto-complaint', title: 'HRTO Complaint (Human Rights)', description: 'File complaint with Human Rights Tribunal of Ontario' },
      { id: 'accommodation-denial', title: 'Challenge Accommodation Denial', description: 'Challenge denied accommodation request' },
      { id: 'discrimination-complaint', title: 'Formal Discrimination Complaint', description: 'Document workplace/service discrimination' },
    ]
  },
  {
    category: 'Housing & Utilities',
    templates: [
      { id: 'rent-arrears', title: 'Rent Arrears Explanation', description: 'Explain rent arrears due to disability' },
      { id: 'utility-assistance', title: 'Utility Assistance Request', description: 'Request utility bill assistance' },
    ]
  }
];

export default function LetterTemplatesScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  
  useAnnounceOnMount('Letter Templates');
  useFocusOnRefOnMount(titleRef);

  return (
    <ResponsiveScreenWrapper scrollable={true}>
      <View style={styles.container}>
        <Text
          ref={titleRef}
          accessibilityRole="header"
          style={styles.title}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          Letter Templates
        </Text>
        <Text style={styles.subtitle}>
          Professional letter templates for CPP-D, WSIB, ODSP, workplace accommodations, and human rights complaints. Each template includes guidance and required elements.
        </Text>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ <Text style={{ fontWeight: '700' }}>Legal Disclaimer:</Text> These templates are for informational purposes only and do not constitute legal advice. Consult with a lawyer or advocate for your specific situation.
          </Text>
        </View>

        {LETTER_TEMPLATES.map((category, idx) => (
          <View key={idx} style={styles.category}>
            <Text style={styles.categoryTitle}>{category.category}</Text>
            {category.templates.map((template) => (
              <Link 
                key={template.id}
                href={`/(tabs)/resources/letter-wizard?template=${template.id}` as any}
                asChild={true}
              >
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Open ${template.title} template`}
                  hitSlop={HIT_SLOP_8}
                  style={({ pressed }) => [
                    styles.templateCard,
                    pressed && { opacity: 0.7 }
                  ]}
                >
                  <Text style={styles.templateTitle}>{template.title}</Text>
                  <Text style={styles.templateDesc}>{template.description}</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        ))}

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            • All templates include step-by-step guidance{'\n'}
            • Include relevant dates, case numbers, and medical evidence{'\n'}
            • Keep copies of all submitted letters{'\n'}
            • Follow up within 7-14 days if no response{'\n'}
            • Consult Support Directory for professional advocates
          </Text>
        </View>
      </View>
    </ResponsiveScreenWrapper>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: palette.background,
    },
    title: {
      fontSize: Math.round(24 * factor),
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      marginBottom: 16,
      lineHeight: Math.round(22 * factor),
    },
    disclaimer: {
      padding: 12,
      backgroundColor: palette.warning + '15',
      borderLeftWidth: 4,
      borderLeftColor: palette.warning || palette.primary,
      borderRadius: 8,
      marginBottom: 20,
    },
    disclaimerText: {
      color: palette.text,
      fontSize: Math.round(14 * factor),
      lineHeight: Math.round(20 * factor),
    },
    category: {
      marginBottom: 24,
    },
    categoryTitle: {
      fontSize: Math.round(18 * factor),
      fontWeight: '700',
      color: palette.primary,
      marginBottom: 12,
    },
    templateCard: {
      padding: 16,
      backgroundColor: palette.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.muted,
      marginBottom: 12,
      minHeight: 44,
    },
    templateTitle: {
      fontSize: Math.round(16 * factor),
      fontWeight: '600',
      color: palette.text,
      marginBottom: 4,
    },
    templateDesc: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      opacity: 0.8,
      lineHeight: Math.round(20 * factor),
    },
    helpBox: {
      padding: 16,
      backgroundColor: palette.success + '15',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.success || palette.primary,
      marginTop: 8,
    },
    helpTitle: {
      fontSize: Math.round(16 * factor),
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    helpText: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      lineHeight: Math.round(22 * factor),
    },
  });
}
