/**
 * Optimized Campaign Card Component
 * Memoized for FlatList rendering
 * 
 * BEFORE: All campaigns re-render when filter changes
 * AFTER: Only visible campaigns re-render
 */

import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppPalette } from '../theme/usePalette';
import { memoWithComparison, useRenderPerformance } from '../utils/optimization';

import A11yPressable from './A11yPressable';

export interface Campaign {
  id: string;
  title: string;
  summary: string;
  target?: string;
  goalCount?: number;
  progressCount?: number;
  contactEmail?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  onPress?: () => void;
}

function CampaignCardImpl({ campaign, onPress }: CampaignCardProps) {
  const palette = useAppPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);

  useRenderPerformance('CampaignCard', 80);

  const progress = useMemo(() => {
    if (!campaign.goalCount || !campaign.progressCount) return 0;
    return Math.round((campaign.progressCount / campaign.goalCount) * 100);
  }, [campaign.goalCount, campaign.progressCount]);

  const progressColor = useMemo(() => {
    if (progress >= 75) return palette.success;
    if (progress >= 50) return palette.warning;
    return palette.primary;
  }, [progress, palette]);

  return (
    <A11yPressable
      onPress={onPress}
      style={[styles.container, { backgroundColor: palette.card }]}
      accessibilityLabel={`Campaign: ${campaign.title}. ${progress}% complete`}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]} numberOfLines={2}>
          {campaign.title}
        </Text>
        {progress > 0 && (
          <View style={[styles.progressBadge, { backgroundColor: progressColor + '22' }]}>
            <Text style={[styles.progressText, { color: progressColor }]}>
              {progress}%
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.summary, { color: palette.textSecondary }]} numberOfLines={2}>
        {campaign.summary}
      </Text>

      {campaign.target && (
        <Text style={[styles.target, { color: palette.textSecondary }]} numberOfLines={1}>
          🎯 {campaign.target}
        </Text>
      )}

      {progress > 0 && (
        <View style={[styles.progressBar, { backgroundColor: palette.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: progressColor,
                width: `${progress}%`,
              },
            ]}
          />
        </View>
      )}
    </A11yPressable>
  );
}

export const CampaignCard = memoWithComparison(CampaignCardImpl, (prev, next) => {
  return (
    prev.campaign.id === next.campaign.id &&
    prev.campaign.progressCount === next.campaign.progressCount &&
    prev.campaign.title === next.campaign.title
  );
});

const createStyles = (_palette: ReturnType<typeof useAppPalette>) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 12,
      marginVertical: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
      marginRight: 8,
    },
    progressBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    progressText: {
      fontSize: 12,
      fontWeight: '600',
    },
    summary: {
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 8,
    },
    target: {
      fontSize: 12,
      marginBottom: 8,
    },
    progressBar: {
      height: 4,
      borderRadius: 2,
      marginTop: 8,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
    },
  });
