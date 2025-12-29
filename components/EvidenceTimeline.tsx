/**
 * Evidence Timeline Widget
 *
 * Shows user's evidence collection progress and latest entries
 * Crisis-first design: Build confidence through evidence count
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { useTextScale } from '../theme/typography';
import { useAppPalette } from '../theme/usePalette';
import { createShadow } from '../utils/shadow';

import GapView from './GapView';
import A11yPressable from './A11yPressable';

export type EvidenceEntry = {
  id: string;
  text: string;
  createdAt: Date | { seconds: number };
  tags?: string[];
};

type EvidenceTimelineProps = {
  evidenceCount: number;
  recentEvidence: EvidenceEntry[];
  onViewAll: () => void;
  isLoading?: boolean;
};

export default function EvidenceTimeline({
  evidenceCount,
  recentEvidence,
  onViewAll,
  isLoading = false,
}: EvidenceTimelineProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette);
  const router = useRouter();

  // Determine progress message based on count
  const getProgressMessage = () => {
    if (evidenceCount === 0) {
      return t('home.evidence.empty', 'Get started - save your first note');
    }
    if (evidenceCount <= 2) {
      return t('home.evidence.building', 'Building your case - add 2-3 more for strength');
    }
    return t('home.evidence.strong', 'Strong case! Ready to generate letters?');
  };

  const getProgressIcon = () => {
    if (evidenceCount === 0) return '📝';
    if (evidenceCount <= 2) return '📋';
    return '✅';
  };

  const getProgressColor = () => {
    if (evidenceCount === 0) return palette.textSecondary;
    if (evidenceCount <= 2) return palette.warning;
    return palette.success;
  };

  const formatDate = (date: Date | { seconds: number }): string => {
    const d = date instanceof Date ? date : new Date(date.seconds * 1000);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('home.evidence.justNow', 'Just now');
    if (diffMins < 60) return t('home.evidence.minsAgo', '{{count}} min ago', { count: diffMins });
    if (diffHours < 24) return t('home.evidence.hoursAgo', '{{count}}h ago', { count: diffHours });
    if (diffDays < 7) return t('home.evidence.daysAgo', '{{count}}d ago', { count: diffDays });

    return d.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number = 80): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (isLoading) {
    return (
      <View style={styles.container} accessibilityLabel={t('home.evidence.loading', 'Loading evidence')}>
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: Math.round(18 * factor) }]}>
            {t('home.evidence.title', 'Evidence Timeline')}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: palette.textSecondary }]}>
            {t('home.evidence.loading', 'Loading evidence...')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      accessibilityRole="region"
      accessibilityLabel={t('home.evidence.section', 'Evidence timeline section')}
    >
      {/* Progress Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: Math.round(18 * factor) }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('home.evidence.title', 'Evidence Timeline')}
        </Text>
        <View style={[styles.countBadge, { backgroundColor: palette.primary + '20' }]}>
          <Text style={[styles.countText, { color: palette.primary, fontSize: Math.round(16 * factor) }]}>
            {evidenceCount}
          </Text>
        </View>
      </View>

      {/* Progress Message */}
      <View
        style={[styles.progressCard, { borderLeftColor: getProgressColor() }]}
        accessibilityRole="status"
        accessibilityLabel={getProgressMessage()}
      >
        <Text style={styles.progressIcon}>{getProgressIcon()}</Text>
        <Text
          style={[styles.progressText, { fontSize: Math.round(14 * factor), color: palette.text }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {getProgressMessage()}
        </Text>
      </View>

      {/* Recent Evidence List */}
      {evidenceCount > 0 && recentEvidence.length > 0 && (
        <GapView style={styles.evidenceList} gap={8}>
          <Text
            style={[styles.sectionLabel, { fontSize: Math.round(14 * factor), color: palette.textSecondary }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {t('home.evidence.recent', 'Recent Evidence')}
          </Text>
          {recentEvidence.slice(0, 3).map((entry) => (
            <A11yPressable
              key={entry.id}
              onPress={onViewAll}
              style={styles.evidenceCard}
              accessibilityLabel={`Evidence: ${truncateText(entry.text, 50)}, ${formatDate(entry.createdAt)}`}
              accessibilityHint={t('home.evidence.viewHint', 'Double tap to view all evidence')}
              hitSlop={HIT_SLOP_8}
            >
              <View style={[styles.evidenceDot, { backgroundColor: palette.primary }]} />
              <View style={styles.evidenceContent}>
                <Text
                  style={[styles.evidenceText, { fontSize: Math.round(14 * factor), color: palette.text }]}
                  numberOfLines={2}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {truncateText(entry.text)}
                </Text>
                <Text
                  style={[styles.evidenceDate, { fontSize: Math.round(12 * factor), color: palette.textSecondary }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {formatDate(entry.createdAt)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={palette.textSecondary} />
            </A11yPressable>
          ))}
        </GapView>
      )}

      {/* View All Button */}
      <A11yPressable
        onPress={onViewAll}
        style={[styles.viewAllButton, { borderColor: palette.muted }]}
        accessibilityRole="button"
        accessibilityLabel={t('home.evidence.viewAll', 'View all evidence')}
        accessibilityHint={t('home.evidence.viewAllHint', 'Navigate to Evidence Command Center')}
        hitSlop={HIT_SLOP_8}
      >
        <Text
          style={[styles.viewAllText, { fontSize: Math.round(14 * factor), color: palette.primary }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t('home.evidence.viewAll', 'View All Evidence')} →
        </Text>
      </A11yPressable>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
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
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      fontWeight: '700',
      color: palette.text,
    },
    countBadge: {
      minWidth: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    countText: {
      fontWeight: '700',
    },
    progressCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.surface,
      borderLeftWidth: 4,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    progressIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    progressText: {
      flex: 1,
      fontWeight: '600',
      lineHeight: 20,
    },
    loadingContainer: {
      paddingVertical: 24,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 14,
    },
    evidenceList: {
      marginBottom: 12,
    },
    sectionLabel: {
      fontWeight: '600',
      marginBottom: 4,
    },
    evidenceCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: palette.surface,
      borderRadius: 8,
      padding: 12,
      minHeight: 56,
    },
    evidenceDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 6,
      marginRight: 12,
    },
    evidenceContent: {
      flex: 1,
    },
    evidenceText: {
      fontWeight: '500',
      marginBottom: 4,
      lineHeight: 20,
    },
    evidenceDate: {
      opacity: 0.8,
    },
    viewAllButton: {
      borderWidth: 1.5,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    viewAllText: {
      fontWeight: '600',
    },
  });
}
