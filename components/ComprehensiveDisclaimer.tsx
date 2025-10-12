import { StyleSheet, Text, View } from 'react-native';

import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';

export type DisclaimerType = 
  | 'legal' 
  | 'medical' 
  | 'wellness' 
  | 'emergency' 
  | 'ai-tools' 
  | 'community' 
  | 'data-export'
  | 'cultural-safety'
  | 'crisis';

interface Props {
  type: DisclaimerType;
  style?: any;
  compact?: boolean;
}

export default function ComprehensiveDisclaimer({ type, style, compact = false }: Props) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const styles = createStyles(palette);

  const getDisclaimerContent = () => {
    switch (type) {
      case 'legal':
        return {
          icon: '⚖️',
          title: t('disclaimers.legal.title', 'Legal Disclaimer'),
          text: compact 
            ? t('disclaimers.legal.compact', 'Educational only — not legal advice. Consult official sources and qualified legal professionals.')
            : t('disclaimers.legal.full', 'This information is for educational purposes only and does not constitute legal advice. Laws vary by jurisdiction and change over time. Always verify information with official sources and consult qualified legal professionals for your specific situation.')
        };

      case 'medical':
        return {
          icon: '🏥',
          title: t('disclaimers.medical.title', 'Medical Disclaimer'),
          text: compact
            ? t('disclaimers.medical.compact', 'Not medical advice. Consult healthcare providers for medical decisions.')
            : t('disclaimers.medical.full', 'This app does not provide medical advice, diagnosis, or treatment. Information is for educational purposes only. Always consult qualified healthcare providers for medical decisions. In medical emergencies, call 911 or your local emergency number immediately.')
        };

      case 'wellness':
        return {
          icon: '💚',
          title: t('disclaimers.wellness.title', 'Wellness Disclaimer'),
          text: compact
            ? t('disclaimers.wellness.compact', 'Adapt activities to your abilities. Stop if experiencing pain or distress.')
            : t('disclaimers.wellness.full', 'Wellness tools are suggestions only. Always adapt activities to your current abilities and stop immediately if you experience pain, distress, or worsening symptoms. These tools do not replace professional healthcare or crisis intervention services.')
        };

      case 'emergency':
        return {
          icon: '🚨',
          title: t('disclaimers.emergency.title', 'Emergency Services'),
          text: compact
            ? t('disclaimers.emergency.compact', 'For emergencies, call 911 or your local emergency number immediately.')
            : t('disclaimers.emergency.full', 'This app is not for emergency situations. If you are in immediate danger or experiencing a medical emergency, call 911 (Canada) or your local emergency number immediately. For mental health crisis, go to your nearest emergency department or call a crisis line.')
        };

      case 'ai-tools':
        return {
          icon: '🤖',
          title: t('disclaimers.ai.title', 'AI Tools Disclaimer'),
          text: compact
            ? t('disclaimers.ai.compact', 'AI suggestions are not professional advice. Review and verify all outputs.')
            : t('disclaimers.ai.full', 'AI-generated content is for informational purposes only and may contain errors. AI suggestions are not professional legal, medical, or other advice. Always review, verify, and adapt AI outputs for your specific situation. Human professional judgment supersedes AI recommendations.')
        };

      case 'community':
        return {
          icon: '👥',
          title: t('disclaimers.community.title', 'Community Disclaimer'),
          text: compact
            ? t('disclaimers.community.compact', 'Community content reflects individual experiences, not professional advice.')
            : t('disclaimers.community.full', 'Community discussions reflect individual experiences and opinions, not professional advice. The app does not endorse user-generated content. Use community information as starting points for your own research and professional consultation.')
        };

      case 'data-export':
        return {
          icon: '📤',
          title: t('disclaimers.data.title', 'Data Export Disclaimer'),
          text: compact
            ? t('disclaimers.data.compact', 'Protect exported data. Remove personal identifiers before sharing.')
            : t('disclaimers.data.full', 'Exported data may contain sensitive personal information. Protect files with strong passwords, store securely, and remove personal identifiers before sharing. You are responsible for data security after export.')
        };

      case 'cultural-safety':
        return {
          icon: '🌍',
          title: t('disclaimers.cultural.title', 'Cultural Safety'),
          text: compact
            ? t('disclaimers.cultural.compact', 'Approach cultural information with respect and consult community-specific resources.')
            : t('disclaimers.cultural.full', 'Cultural information is provided for general awareness. Approach with respect, recognize diversity within communities, and consult community-specific resources and leaders for culturally appropriate guidance.')
        };

      case 'crisis':
        return {
          icon: '🆘',
          title: t('disclaimers.crisis.title', 'Crisis Support'),
          text: compact
            ? t('disclaimers.crisis.compact', 'Crisis tools are not emergency services. Get immediate help if in danger.')
            : t('disclaimers.crisis.full', 'Crisis support tools are supplementary only and not emergency intervention services. If you are in immediate danger, having thoughts of self-harm, or experiencing a mental health crisis, seek immediate professional help through emergency services or crisis lines.')
        };

      default:
        return {
          icon: 'ℹ️',
          title: t('disclaimers.general.title', 'Important Information'),
          text: t('disclaimers.general.text', 'This information is provided for educational purposes. Consult appropriate professionals for your specific situation.')
        };
    }
  };

  const { icon, title, text } = getDisclaimerContent();

  return (
    <View style={[styles.container, style]} accessibilityRole="complementary">
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {title}
        </Text>
      </View>
      <Text style={styles.text} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {text}
      </Text>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.surface,
      borderLeftWidth: 3,
      borderLeftColor: palette.primary,
      padding: 12,
      marginVertical: 8,
      borderRadius: 6,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    icon: {
      fontSize: 16,
      marginRight: 8,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
      flex: 1,
    },
    text: {
      fontSize: 13,
      color: palette.text,
      opacity: 0.8,
      lineHeight: 18,
    },
  });
}