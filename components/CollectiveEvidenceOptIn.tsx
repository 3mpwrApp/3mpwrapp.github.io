/**
 * Collective Evidence Opt-In Banner
 *
 * Privacy-first onboarding for collective evidence participation
 * Triggers after user has saved 3+ evidence notes
 *
 * PRIVACY COMMITMENTS:
 * - 50-user threshold before showing any patterns
 * - PII removal (names, dates, locations)
 * - Easy opt-out with data deletion
 * - Full transparency about what's shared
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

// Firebase Analytics (handled by metro.config.js - empty module on web)
let analytics: any;
try {
  analytics = require('@react-native-firebase/analytics').default;
  if (typeof analytics === 'function') {
    analytics = analytics(); // Call if it's a function
  }
} catch {
  // Fallback if module not available
  analytics = { logEvent: async () => {} };
}
if (!analytics || typeof analytics.logEvent !== 'function') {
  // Ensure analytics has logEvent method
  analytics = { logEvent: async () => {} };
}

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { useTextScale } from '../theme/typography';
import { useAppPalette } from '../theme/usePalette';
import { createShadow } from '../utils/shadow';
import { logError } from '../utils/errorLogger';

import GapView from './GapView';
import A11yPressable from './A11yPressable';

type CollectiveEvidenceOptInProps = {
  onOptIn: () => void;
  onDismiss: () => void;
  evidenceCount: number;
};

export default function CollectiveEvidenceOptIn({
  onOptIn,
  onDismiss,
  evidenceCount,
}: CollectiveEvidenceOptInProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette);

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Track when banner is shown
  useEffect(() => {
    const trackBannerShown = async () => {
      try {
        await analytics().logEvent('collective_opt_in_banner_shown', {
          evidence_count: evidenceCount,
          trigger_reason: evidenceCount >= 3 ? 'threshold_met' : 'manual',
        });
      } catch (error) {
        logError('CollectiveEvidenceOptIn', 'Banner shown analytics', error as Error);
      }
    };
    trackBannerShown();
  }, [evidenceCount]);

  const handleOptIn = async () => {
    try {
      await analytics().logEvent('collective_opt_in_accepted', {
        evidence_count: evidenceCount,
        source: 'banner',
      });
    } catch (error) {
      logError('CollectiveEvidenceOptIn', 'Opt-in analytics', error as Error);
    }
    onOptIn();
  };

  const handleLearnMore = async () => {
    try {
      await analytics().logEvent('collective_opt_in_learn_more', {
        evidence_count: evidenceCount,
      });
    } catch (error) {
      logError('CollectiveEvidenceOptIn', 'Learn more analytics', error as Error);
    }
    setShowPrivacyModal(true);
  };

  const handleDismiss = async () => {
    try {
      await analytics().logEvent('collective_opt_in_declined', {
        evidence_count: evidenceCount,
        reason: 'not_now',
      });
    } catch (error) {
      logError('CollectiveEvidenceOptIn', 'Declined analytics', error as Error);
    }
    onDismiss();
  };

  const handleCloseModal = () => {
    setShowPrivacyModal(false);
  };

  return (
    <>
      {/* Main Opt-In Banner */}
      <View style={styles.banner}>
        {/* Icon and Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: palette.primary + '20' }]}>
            <Ionicons name="people" size={24} color={palette.primary} />
          </View>
          <View style={styles.headerText}>
            <Text
              style={[styles.title, { fontSize: Math.round(16 * factor), color: palette.text }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('collective.optIn.title', 'You\'re Building Something Powerful')}
            </Text>
            <Text
              style={[styles.subtitle, { fontSize: Math.round(14 * factor), color: palette.textSecondary }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('collective.optIn.subtitle', '{{count}} evidence notes saved', { count: evidenceCount })}
            </Text>
          </View>
        </View>

        {/* Main Message */}
        <Text
          style={[styles.message, { fontSize: Math.round(14 * factor), color: palette.text }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t(
            'collective.optIn.message',
            'Your evidence could help others facing similar barriers. Join our collective evidence vault to detect patterns and strengthen cases together.'
          )}
        </Text>

        {/* Privacy Highlights */}
        <GapView style={styles.privacyHighlights} gap={8}>
          <View style={styles.privacyItem}>
            <Ionicons name="shield-checkmark" size={16} color={palette.success} />
            <Text
              style={[styles.privacyText, { fontSize: Math.round(12 * factor), color: palette.textSecondary }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('collective.optIn.privacy1', 'Names, dates & locations removed')}
            </Text>
          </View>
          <View style={styles.privacyItem}>
            <Ionicons name="lock-closed" size={16} color={palette.success} />
            <Text
              style={[styles.privacyText, { fontSize: Math.round(12 * factor), color: palette.textSecondary }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('collective.optIn.privacy2', 'Only shown when 50+ users contribute')}
            </Text>
          </View>
          <View style={styles.privacyItem}>
            <Ionicons name="hand-right" size={16} color={palette.success} />
            <Text
              style={[styles.privacyText, { fontSize: Math.round(12 * factor), color: palette.textSecondary }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('collective.optIn.privacy3', 'Opt out anytime & delete your data')}
            </Text>
          </View>
        </GapView>

        {/* Action Buttons */}
        <GapView style={styles.actions} gap={8}>
          <A11yPressable
            onPress={handleOptIn}
            style={[styles.primaryButton, { backgroundColor: palette.primary }]}
            accessibilityRole="button"
            accessibilityLabel={t('collective.optIn.joinButton', 'Yes, count me in')}
            accessibilityHint={t('collective.optIn.joinHint', 'Join the collective evidence vault')}
            hitSlop={HIT_SLOP_8}
          >
            <Text
              style={[styles.primaryButtonText, { fontSize: Math.round(14 * factor), color: palette.onPrimary }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('collective.optIn.joinButton', 'Yes, Count Me In')} ✊
            </Text>
          </A11yPressable>

          <View style={styles.secondaryActions}>
            <A11yPressable
              onPress={handleLearnMore}
              style={styles.secondaryButton}
              accessibilityRole="button"
              accessibilityLabel={t('collective.optIn.learnMore', 'Learn more about privacy')}
              hitSlop={HIT_SLOP_8}
            >
              <Text
                style={[styles.secondaryButtonText, { fontSize: Math.round(14 * factor), color: palette.primary }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {t('collective.optIn.learnMore', 'Learn More')}
              </Text>
            </A11yPressable>

            <A11yPressable
              onPress={handleDismiss}
              style={styles.secondaryButton}
              accessibilityRole="button"
              accessibilityLabel={t('collective.optIn.notNow', 'Not now')}
              hitSlop={HIT_SLOP_8}
            >
              <Text
                style={[styles.secondaryButtonText, { fontSize: Math.round(14 * factor), color: palette.textSecondary }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {t('collective.optIn.notNow', 'Not Now')}
              </Text>
            </A11yPressable>
          </View>
        </GapView>
      </View>

      {/* Privacy Details Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: palette.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: palette.muted }]}>
            <Text
              style={[styles.modalTitle, { fontSize: Math.round(20 * factor), color: palette.text }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {t('collective.privacy.title', 'How Collective Evidence Works')}
            </Text>
            <A11yPressable
              onPress={handleCloseModal}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('collective.privacy.close', 'Close')}
              hitSlop={HIT_SLOP_8}
            >
              <Ionicons name="close" size={28} color={palette.text} />
            </A11yPressable>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentInner}>
            {/* The Vision */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { fontSize: Math.round(18 * factor), color: palette.text }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {t('collective.privacy.visionTitle', 'The Vision')}
              </Text>
              <Text
                style={[styles.sectionText, { fontSize: Math.round(14 * factor), color: palette.text }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {t(
                  'collective.privacy.visionText',
                  'When we pool our evidence anonymously, we can detect systemic patterns that strengthen everyone\'s cases. "They denied me for X" becomes "They\'ve denied 847 of us for X." That\'s solidarity with data.'
                )}
              </Text>
            </View>

            {/* Privacy-First Principles */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { fontSize: Math.round(18 * factor), color: palette.text }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {t('collective.privacy.principlesTitle', 'Privacy-First Principles')}
              </Text>

              <GapView gap={16}>
                <View style={styles.principleCard}>
                  <View style={[styles.principleIcon, { backgroundColor: palette.success + '20' }]}>
                    <Ionicons name="shield-checkmark" size={24} color={palette.success} />
                  </View>
                  <View style={styles.principleContent}>
                    <Text
                      style={[styles.principleTitle, { fontSize: Math.round(14 * factor), color: palette.text }]}
                      maxFontSizeMultiplier={MAX_FONT_SCALE}
                    >
                      {t('collective.privacy.principle1Title', 'PII Removal')}
                    </Text>
                    <Text
                      style={[styles.principleText, { fontSize: Math.round(13 * factor), color: palette.textSecondary }]}
                      maxFontSizeMultiplier={MAX_FONT_SCALE}
                    >
                      {t(
                        'collective.privacy.principle1Text',
                        'Names, exact dates, addresses, and identifying details are automatically removed before aggregation.'
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.principleCard}>
                  <View style={[styles.principleIcon, { backgroundColor: palette.success + '20' }]}>
                    <Ionicons name="people" size={24} color={palette.success} />
                  </View>
                  <View style={styles.principleContent}>
                    <Text
                      style={[styles.principleTitle, { fontSize: Math.round(14 * factor), color: palette.text }]}
                      maxFontSizeMultiplier={MAX_FONT_SCALE}
                    >
                      {t('collective.privacy.principle2Title', '50-User Threshold')}
                    </Text>
                    <Text
                      style={[styles.principleText, { fontSize: Math.round(13 * factor), color: palette.textSecondary }]}
                      maxFontSizeMultiplier={MAX_FONT_SCALE}
                    >
                      {t(
                        'collective.privacy.principle2Text',
                        'Patterns are only shown when at least 50 users have contributed. This prevents re-identification from small sample sizes.'
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.principleCard}>
                  <View style={[styles.principleIcon, { backgroundColor: palette.success + '20' }]}>
                    <Ionicons name="hand-right" size={24} color={palette.success} />
                  </View>
                  <View style={styles.principleContent}>
                    <Text
                      style={[styles.principleTitle, { fontSize: Math.round(14 * factor), color: palette.text }]}
                      maxFontSizeMultiplier={MAX_FONT_SCALE}
                    >
                      {t('collective.privacy.principle3Title', 'Easy Opt-Out')}
                    </Text>
                    <Text
                      style={[styles.principleText, { fontSize: Math.round(13 * factor), color: palette.textSecondary }]}
                      maxFontSizeMultiplier={MAX_FONT_SCALE}
                    >
                      {t(
                        'collective.privacy.principle3Text',
                        'You can opt out anytime from Settings. When you opt out, your contributions are immediately deleted from the collective pool.'
                      )}
                    </Text>
                  </View>
                </View>
              </GapView>
            </View>

            {/* Before/After Example */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { fontSize: Math.round(18 * factor), color: palette.text }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {t('collective.privacy.exampleTitle', 'Example: Before & After')}
              </Text>

              <View style={[styles.exampleCard, { backgroundColor: palette.surface }]}>
                <Text
                  style={[styles.exampleLabel, { fontSize: Math.round(12 * factor), color: palette.textSecondary }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {t('collective.privacy.beforeLabel', 'BEFORE (Your Private Notes)')}
                </Text>
                <Text
                  style={[styles.exampleText, { fontSize: Math.round(13 * factor), color: palette.text }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {t(
                    'collective.privacy.beforeExample',
                    '"Dr. Sarah Johnson denied my SSDI appeal on 3/15/2024. She said my fibromyalgia isn\'t disabling enough. I live at 1234 Main St, Portland OR 97201."'
                  )}
                </Text>
              </View>

              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-down" size={24} color={palette.primary} />
              </View>

              <View style={[styles.exampleCard, { backgroundColor: palette.surface }]}>
                <Text
                  style={[styles.exampleLabel, { fontSize: Math.round(12 * factor), color: palette.success }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {t('collective.privacy.afterLabel', 'AFTER (Anonymized Contribution)')}
                </Text>
                <Text
                  style={[styles.exampleText, { fontSize: Math.round(13 * factor), color: palette.text }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {t(
                    'collective.privacy.afterExample',
                    '"[PROVIDER REDACTED] denied my SSDI appeal [DATE REDACTED]. Denial reason: condition not disabling enough. Condition category: fibromyalgia. Region: Pacific Northwest."'
                  )}
                </Text>
              </View>

              <View style={[styles.privacyNote, { backgroundColor: palette.success + '10', borderLeftColor: palette.success }]}>
                <Ionicons name="checkmark-circle" size={20} color={palette.success} />
                <Text
                  style={[styles.privacyNoteText, { fontSize: Math.round(12 * factor), color: palette.text }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {t(
                    'collective.privacy.noteText',
                    'Only the anonymized version is shared. Your original notes stay private and encrypted on your device.'
                  )}
                </Text>
              </View>
            </View>

            {/* What Gets Shared */}
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { fontSize: Math.round(18 * factor), color: palette.text }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {t('collective.privacy.sharedTitle', 'What Gets Shared')}
              </Text>
              <GapView gap={8}>
                <View style={styles.listItem}>
                  <Ionicons name="checkmark" size={16} color={palette.success} />
                  <Text
                    style={[styles.listText, { fontSize: Math.round(13 * factor), color: palette.text }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {t('collective.privacy.shared1', 'Denial reasons (categories, not specifics)')}
                  </Text>
                </View>
                <View style={styles.listItem}>
                  <Ionicons name="checkmark" size={16} color={palette.success} />
                  <Text
                    style={[styles.listText, { fontSize: Math.round(13 * factor), color: palette.text }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {t('collective.privacy.shared2', 'General condition categories (e.g., "chronic pain")')}
                  </Text>
                </View>
                <View style={styles.listItem}>
                  <Ionicons name="checkmark" size={16} color={palette.success} />
                  <Text
                    style={[styles.listText, { fontSize: Math.round(13 * factor), color: palette.text }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {t('collective.privacy.shared3', 'Broad regions (e.g., "Southwest", not cities)')}
                  </Text>
                </View>
                <View style={styles.listItem}>
                  <Ionicons name="checkmark" size={16} color={palette.success} />
                  <Text
                    style={[styles.listText, { fontSize: Math.round(13 * factor), color: palette.text }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {t('collective.privacy.shared4', 'Timeline delays (days/weeks, not exact dates)')}
                  </Text>
                </View>
                <View style={styles.listItem}>
                  <Ionicons name="checkmark" size={16} color={palette.success} />
                  <Text
                    style={[styles.listText, { fontSize: Math.round(13 * factor), color: palette.text }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {t('collective.privacy.shared5', 'Insurance types (public/private, not company names)')}
                  </Text>
                </View>
              </GapView>
            </View>

            {/* Join Button */}
            <A11yPressable
              onPress={() => {
                handleCloseModal();
                handleOptIn();
              }}
              style={[styles.modalJoinButton, { backgroundColor: palette.primary }]}
              accessibilityRole="button"
              accessibilityLabel={t('collective.privacy.joinButton', 'Join the collective')}
              hitSlop={HIT_SLOP_8}
            >
              <Text
                style={[styles.modalJoinButtonText, { fontSize: Math.round(16 * factor), color: palette.onPrimary }]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {t('collective.privacy.joinButton', 'Yes, Count Me In')} ✊
              </Text>
            </A11yPressable>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    banner: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      ...createShadow({
        shadowColor: palette.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontWeight: '700',
      marginBottom: 4,
      lineHeight: 22,
    },
    subtitle: {
      fontWeight: '500',
      lineHeight: 18,
    },
    message: {
      lineHeight: 20,
      marginBottom: 12,
    },
    privacyHighlights: {
      marginBottom: 16,
    },
    privacyItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    privacyText: {
      marginLeft: 8,
      lineHeight: 18,
    },
    actions: {
      marginTop: 4,
    },
    primaryButton: {
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    primaryButtonText: {
      fontWeight: '600',
    },
    secondaryActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    secondaryButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      minHeight: 44,
      justifyContent: 'center',
    },
    secondaryButtonText: {
      fontWeight: '500',
    },
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
    },
    modalTitle: {
      fontWeight: '700',
      flex: 1,
    },
    closeButton: {
      padding: 4,
      marginLeft: 8,
    },
    modalContent: {
      flex: 1,
    },
    modalContentInner: {
      padding: 16,
      paddingBottom: 32,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontWeight: '700',
      marginBottom: 12,
      lineHeight: 24,
    },
    sectionText: {
      lineHeight: 22,
    },
    principleCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    principleIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    principleContent: {
      flex: 1,
    },
    principleTitle: {
      fontWeight: '600',
      marginBottom: 4,
      lineHeight: 20,
    },
    principleText: {
      lineHeight: 20,
    },
    exampleCard: {
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    exampleLabel: {
      fontWeight: '700',
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    exampleText: {
      lineHeight: 20,
      fontStyle: 'italic',
    },
    arrowContainer: {
      alignItems: 'center',
      marginBottom: 12,
    },
    privacyNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderLeftWidth: 3,
      borderRadius: 6,
      padding: 12,
      marginTop: 12,
    },
    privacyNoteText: {
      flex: 1,
      marginLeft: 8,
      lineHeight: 18,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    listText: {
      flex: 1,
      marginLeft: 8,
      lineHeight: 20,
    },
    modalJoinButton: {
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      minHeight: 52,
    },
    modalJoinButtonText: {
      fontWeight: '700',
    },
  });
}
