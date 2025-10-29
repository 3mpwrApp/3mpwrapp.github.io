/**
 * Enhanced ToolCard Component
 * Displays tool with Phase 6 metadata: badges, ML status, energy optimization
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ToolMetadata } from '../services/phase6ToolRegistry';
import { useAppPalette } from '../theme/usePalette';

import GapView from './GapView';

// Lightweight local TextV2 fallback used by ToolCard when a shared TextV2 module isn't available
// Keeps API small: variant, style, numberOfLines
interface TextV2Props {
  variant?: 'subtitle2' | 'body2' | 'caption' | string;
  style?: any;
  numberOfLines?: number;
  children?: React.ReactNode;
}

const TextV2: React.FC<TextV2Props> = ({ variant = 'body2', style, numberOfLines, children }) => {
  const variantStyles: Record<string, any> = {
    subtitle2: { fontSize: 16, fontWeight: '600' },
    body2: { fontSize: 14 },
    caption: { fontSize: 12 },
  };

  return (
    <Text style={[variantStyles[variant] || variantStyles.body2, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};

interface ToolCardProps {
  tool: ToolMetadata;
  onPress?: () => void;
  compact?: boolean;
  showMetadata?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onPress,
  compact = false,
  showMetadata = true,
}) => {
  const palette = useAppPalette();
  const router = useRouter();

  const styles = useMemo(() => createStyles(palette), [palette]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to tool detail screen using typed params to satisfy router typings
      router.push(`/(tabs)/wellness/${tool.id}` as any);
    }
  };

  const accessibilityLabel = useMemo(() => {
    const parts = [tool.name, tool.description];
    if (tool.isBeta) parts.push('Beta');
    if (tool.requiresFeedback) parts.push('Feedback enabled');
    if (tool.energyOptimal && tool.energyOptimal !== 'any') {
      parts.push(`Best for ${tool.energyOptimal} energy`);
    }
    return parts.join('. ');
  }, [tool]);

  if (compact) {
    return (
      <Pressable
        style={[styles.compactContainer, styles.pressable]}
        onPress={handlePress}
        accessible
        accessibilityLabel={tool.name}
        accessibilityHint={tool.description}
        accessibilityRole="button"
      >
        <Ionicons
          name={tool.icon as any}
          size={32}
          color={palette.primary}
        />
        <TextV2
          variant="caption"
          style={styles.compactText}
          numberOfLines={2}
        >
          {tool.name}
        </TextV2>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.container, styles.pressable]}
      onPress={handlePress}
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={tool.icon as any}
            size={24}
            color={palette.primary}
          />
        </View>
        <View style={styles.titleContainer}>
          <GapView style={styles.titleRow} gap={8}>
            <TextV2 variant="subtitle2" style={styles.title}>
              {tool.name}
            </TextV2>
            {tool.isBeta && (
              <View
                style={[styles.badge, styles.betaBadge]}
                accessible
                accessibilityLabel="Beta version"
              >
                <TextV2 variant="caption" style={styles.betaText}>
                  Beta
                </TextV2>
              </View>
            )}
          </GapView>
        </View>
      </View>

      <TextV2 variant="body2" style={styles.description} numberOfLines={2}>
        {tool.description}
      </TextV2>

      {showMetadata && (
        <GapView style={styles.metadataContainer} gap={8}>
          {/* Tool Type Badge */}
          <GapView
            style={[styles.badge, styles.categoryBadge]}
            gap={4}
            accessible
            accessibilityLabel={`Tool type: ${tool.category}`}
          >
            <Ionicons
              name="pricetag"
              size={12}
              color={palette.primary}
              style={styles.badgeIcon}
            />
            <TextV2 variant="caption" style={styles.categoryText}>
              {tool.category}
            </TextV2>
          </GapView>

          {/* ML Status Badge */}
          {tool.mlModels && tool.mlModels.length > 0 && (
            <GapView
              style={[styles.badge, styles.mlBadge]}
              gap={4}
              accessible
              accessibilityLabel={`AI-powered with ${tool.mlModels.length} model${tool.mlModels.length > 1 ? 's' : ''}`}
            >
              <Ionicons
                name="bulb"
                size={12}
                color={palette.success}
                style={styles.badgeIcon}
              />
              <TextV2 variant="caption" style={styles.mlText}>
                AI
              </TextV2>
            </GapView>
          )}

          {/* Energy Level Badge */}
          {tool.energyOptimal && tool.energyOptimal !== 'any' && (
            <GapView
              style={[styles.badge, styles.energyBadge]}
              gap={4}
              accessible
              accessibilityLabel={`Optimal for ${tool.energyOptimal} energy levels`}
            >
              <Ionicons
                name={getEnergyIcon(tool.energyOptimal)}
                size={12}
                color={palette.warning}
                style={styles.badgeIcon}
              />
              <TextV2 variant="caption" style={styles.energyText}>
                {tool.energyOptimal}
              </TextV2>
            </GapView>
          )}

          {/* Feedback Badge */}
          {tool.requiresFeedback && (
            <GapView
              style={[styles.badge, styles.feedbackBadge]}
              gap={4}
              accessible
              accessibilityLabel="Your feedback improves this tool"
            >
              <Ionicons
                name="thumbs-up"
                size={12}
                color={palette.info}
                style={styles.badgeIcon}
              />
              <TextV2 variant="caption" style={styles.feedbackText}>
                Learns
              </TextV2>
            </GapView>
          )}

          {/* Personalization Badge */}
          {tool.isPersonalizable && (
            <GapView
              style={[styles.badge, styles.personalizableBadge]}
              gap={4}
              accessible
              accessibilityLabel="Personalized to you"
            >
              <Ionicons
                name="person"
                size={12}
                color={palette.info}
                style={styles.badgeIcon}
              />
              <TextV2 variant="caption" style={styles.personalizableText}>
                Personalized
              </TextV2>
            </GapView>
          )}
        </GapView>
      )}

      {/* Accessibility Features */}
      {tool.a11yFeatures && tool.a11yFeatures.length > 0 && (
        <View style={styles.a11yContainer}>
          <TextV2 variant="caption" style={styles.a11yLabel}>
            Accessibility:{' '}
            {tool.a11yFeatures.map(f => f.replace(/-/g, ' ')).join(', ')}
          </TextV2>
        </View>
      )}
    </Pressable>
  );
};

const getEnergyIcon = (level: string): any => {
  switch (level) {
    case 'low':
      return 'battery';
    case 'medium':
      return 'battery-half';
    case 'high':
      return 'battery-full';
    default:
      return 'flash';
  }
};

const createStyles = (palette: any) =>
  StyleSheet.create({
    pressable: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    container: {
      backgroundColor: palette.background.elevated,
      borderWidth: 1,
      borderColor: palette.divider,
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
    },
    compactContainer: {
      backgroundColor: palette.background.elevated,
      borderWidth: 1,
      borderColor: palette.divider,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 100,
    },
    compactText: {
      marginTop: 8,
      textAlign: 'center',
      color: palette.text.secondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: palette.primary.light,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    titleContainer: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      color: palette.text.primary,
      flex: 1,
    },
    description: {
      color: palette.text.secondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    metadataContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 8,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeIcon: {
      marginRight: 2,
    },
    betaBadge: {
      backgroundColor: palette.warning.light,
    },
    betaText: {
      color: palette.warning.main,
      fontWeight: '600',
    },
    categoryBadge: {
      backgroundColor: palette.primary.light,
    },
    categoryText: {
      color: palette.primary.main,
      fontWeight: '500',
    },
    mlBadge: {
      backgroundColor: palette.success.light,
    },
    mlText: {
      color: palette.success.main,
      fontWeight: '600',
    },
    energyBadge: {
      backgroundColor: palette.warning.light,
    },
    energyText: {
      color: palette.warning.main,
      fontWeight: '500',
    },
    feedbackBadge: {
      backgroundColor: palette.info.light,
    },
    feedbackText: {
      color: palette.info.main,
      fontWeight: '500',
    },
    personalizableBadge: {
      backgroundColor: palette.info.light,
    },
    personalizableText: {
      color: palette.info.main,
      fontWeight: '500',
    },
    a11yContainer: {
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: palette.divider,
      marginTop: 8,
    },
    a11yLabel: {
      color: palette.text.secondary,
      fontStyle: 'italic',
    },
  });

export default ToolCard;
