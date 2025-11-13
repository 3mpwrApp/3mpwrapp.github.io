/**
 * Related Features Component
 * 
 * Shows intelligent suggestions for related features
 * to help users discover and navigate between interconnected tools
 */

import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { trackNavigation, useRelatedFeatures } from '../services/crossFeatureNav';
import { useAppPalette } from '../theme/usePalette';

import GapView from './GapView';

interface RelatedFeaturesProps {
  currentFeature: string;
  userAction?: string;
  title?: string;
  compact?: boolean;
  maxItems?: number;
}

export default function RelatedFeatures({
  currentFeature,
  userAction,
  title,
  compact = false,
  maxItems = 3,
}: RelatedFeaturesProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { related, smartSuggestion } = useRelatedFeatures(currentFeature, userAction);
  
  if (related.length === 0) return null;
  
  const displayTitle = title || t('relatedFeatures.title', 'You might also like');
  const itemsToShow = related.slice(0, maxItems);
  
  return (
    <View 
      style={[
        styles.container,
        { backgroundColor: palette.surface, borderColor: palette.muted }
      ]}
    >
      <Text 
        style={[styles.title, { color: palette.text }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        accessibilityRole="header"
      >
        {displayTitle}
      </Text>
      
      <GapView gap={compact ? 8 : 12}>
        {itemsToShow.map((feature) => {
          const isSmart = smartSuggestion?.id === feature.id;
          return (
            <Link asChild
              key={feature.id}
              href={feature.route}
              onPress={() => trackNavigation(currentFeature, feature.id, feature.reason)}
            >
              <Pressable
                style={[
                  compact ? styles.compactCard : styles.card,
                  {
                    backgroundColor: isSmart ? palette.primary + '10' : palette.card,
                    borderColor: isSmart ? palette.primary : palette.muted,
                    borderWidth: isSmart ? 2 : StyleSheet.hairlineWidth,
                  }
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${feature.title}. ${feature.reason}`}
                hitSlop={HIT_SLOP_8}
              >
                {isSmart && (
                  <View style={[styles.smartBadge, { backgroundColor: palette.primary }]}>
                    <Text 
                      style={[styles.smartBadgeText, { color: palette.onPrimary }]}
                      maxFontSizeMultiplier={MAX_FONT_SCALE}
                    >
                      ⭐ {t('relatedFeatures.recommended', 'Recommended')}
                    </Text>
                  </View>
                )}
                
                <View style={styles.cardContent}>
                  <View style={styles.iconContainer}>
                    <Text style={{ fontSize: compact ? 20 : 28 }}>{feature.icon}</Text>
                  </View>
                  
                  <View style={styles.textContainer}>
                    <Text 
                      style={[
                        compact ? styles.compactTitle : styles.cardTitle,
                        { color: palette.text }
                      ]}
                      maxFontSizeMultiplier={MAX_FONT_SCALE}
                    >
                      {feature.title}
                    </Text>
                    
                    {!compact && (
                      <Text 
                        style={[styles.cardReason, { color: palette.text }]}
                        maxFontSizeMultiplier={MAX_FONT_SCALE}
                      >
                        {feature.reason}
                      </Text>
                    )}
                    
                    <View 
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: palette.muted + '40' }
                      ]}
                    >
                      <Text 
                        style={[styles.categoryText, { color: palette.text }]}
                        maxFontSizeMultiplier={MAX_FONT_SCALE}
                      >
                        {feature.category}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={{ color: palette.primary, fontSize: 20 }}>→</Text>
                </View>
              </Pressable>
            </Link>
          );
        })}
      </GapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    borderRadius: 10,
    padding: 12,
    position: 'relative',
  },
  compactCard: {
    borderRadius: 8,
    padding: 10,
    position: 'relative',
  },
  smartBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  smartBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardReason: {
    fontSize: 13,
    opacity: 0.8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
    opacity: 0.9,
  },
});
