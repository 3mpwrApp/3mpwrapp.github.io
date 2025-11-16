/**
 * Feature Recommendations Component
 * 
 * Displays contextual recommendations to guide users between related features
 * for a smooth, integrated user experience.
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import type { FeatureRecommendation } from '../services/featureIntegration';
import { navigateToRecommendation } from '../services/featureIntegration';
import { useTextScale } from '../theme/typography';
import { useAppPalette } from '../theme/usePalette';

interface FeatureRecommendationsProps {
  recommendations: FeatureRecommendation[];
  title?: string;
  maxVisible?: number;
  style?: any;
}

export default function FeatureRecommendations({
  recommendations,
  title,
  maxVisible = 3,
  style,
}: FeatureRecommendationsProps) {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const { t } = useTranslation();
  const [expanded, setExpanded] = React.useState(false);

  if (recommendations.length === 0) {
    return null;
  }

  const visibleRecommendations = expanded ? recommendations : recommendations.slice(0, maxVisible);
  const hasMore = recommendations.length > maxVisible;

  return (
    <View style={[styles.container, { backgroundColor: palette.surface, borderColor: palette.muted }, style]}>
      <Text
        style={[
          styles.title,
          { color: palette.text, fontSize: Math.round(16 * factor) },
        ]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        accessibilityRole="header"
      >
        {title || t('recommendations.title', '💡 Suggested for You')}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel={t('recommendations.scroll', 'Scroll through recommendations')}
      >
        {visibleRecommendations.map((rec) => (
          <Pressable
            key={rec.id}
            hitSlop={HIT_SLOP_8}
            style={[
              styles.card,
              {
                backgroundColor: palette.background,
                borderColor: rec.priority === 'high' ? palette.primary : palette.muted,
              },
            ]}
            onPress={() => navigateToRecommendation(rec)}
            accessibilityRole="button"
            accessibilityLabel={`${rec.icon} ${rec.title}. ${rec.description}`}
            accessibilityHint={t('recommendations.tapHint', 'Double tap to navigate')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.icon}>{rec.icon}</Text>
              {rec.priority === 'high' && (
                <View style={[styles.badge, { backgroundColor: palette.primary }]}>
                  <Text style={[styles.badgeText, { color: palette.onPrimary }]}>
                    {t('recommendations.recommended', 'Recommended')}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.cardTitle,
                { color: palette.text, fontSize: Math.round(14 * factor) },
              ]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              numberOfLines={2}
            >
              {rec.title}
            </Text>
            <Text
              style={[
                styles.cardDescription,
                { color: palette.text, fontSize: Math.round(12 * factor) },
              ]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              numberOfLines={3}
            >
              {rec.description}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {hasMore && (
        <Pressable
          hitSlop={HIT_SLOP_8}
          style={[styles.expandButton, { borderTopColor: palette.muted }]}
          onPress={() => setExpanded(!expanded)}
          accessibilityRole="button"
          accessibilityLabel={expanded ? t('recommendations.showLess', 'Show less') : t('recommendations.showMore', 'Show more recommendations')}
        >
          <Text style={[styles.expandText, { color: palette.primary }]}>
            {expanded
              ? t('recommendations.showLess', '▲ Show Less')
              : t('recommendations.showMore', `▼ Show ${recommendations.length - maxVisible} More`)}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 12,
  },
  title: {
    fontWeight: '700',
    marginBottom: 12,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 4,
  },
  card: {
    width: 200,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    fontSize: 32,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 6,
  },
  cardDescription: {
    opacity: 0.8,
    lineHeight: 16,
  },
  expandButton: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  expandText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
