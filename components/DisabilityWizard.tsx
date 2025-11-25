/**
 * DisabilityWizard - Main UI Component
 * 
 * Beautiful, accessible interface for the disability-aware recommendation system
 */

import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/A11Y';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import type { WizardSuggestion } from '../services/disabilityWizard';
import { findNextSteps, useDisabilityWizard } from '../services/disabilityWizard';
import { useTextScale } from '../theme/typography';
import { useAppPalette } from '../theme/usePalette';
import { createShadow } from '../utils/shadow';

import A11yPressable from './A11yPressable';
import { GapView } from './GapView';

interface DisabilityWizardProps {
  maxSuggestions?: number;
  showReasons?: boolean;
  title?: string;
  subtitle?: string;
}

export default function DisabilityWizard({
  maxSuggestions = 3,
  showReasons = true,
  title,
  subtitle,
}: DisabilityWizardProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  // Hook now handles errors internally
  const { suggestions, loading, error } = useDisabilityWizard();
  
  // Show error fallback if wizard failed to load
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {title || t('wizard.title', 'Disability Wizard')}
        </Text>
        <Text style={styles.subtitle}>
          {t('wizard.error', 'Unable to load personalized suggestions right now')}
        </Text>
      </View>
    );
  }
  
  const topSuggestions = suggestions.slice(0, maxSuggestions);
  const nextSteps = selectedTool ? findNextSteps(selectedTool) : [];
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>
          {t('wizard.loading', 'Personalizing suggestions...')}
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="color-wand" size={28} color={palette.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {title || t('wizard.title', 'Disability Wizard')}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      {/* Suggestions */}
      <ScrollView 
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsScroll}
        accessibilityLabel={t('wizard.suggestionsLabel', 'Personalized feature suggestions')}
      >
        {topSuggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.toolId}
            suggestion={suggestion}
            showReasons={showReasons}
            onPress={() => setSelectedTool(suggestion.toolId)}
            styles={styles}
            palette={palette}
          />
        ))}
      </ScrollView>
      
      {/* Next Steps (if a tool is selected) */}
      {nextSteps.length > 0 && (
        <View style={styles.nextStepsContainer}>
          <Text style={styles.nextStepsTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('wizard.nextSteps', 'What comes next?')}
          </Text>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.nextStepsScroll}
          >
            {nextSteps.map((step) => (
              <NextStepCard
                key={step.toolId}
                suggestion={step}
                styles={styles}
                palette={palette}
              />
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Customize Link */}
      <Link href="/(tabs)/settings" asChild={true}>
        <A11yPressable
          style={styles.customizeButton}
          accessibilityRole="button"
          accessibilityLabel={t('wizard.customize', 'Customize wizard preferences')}
          hitSlop={HIT_SLOP_8}
        >
          <GapView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} gap={6}>
            <Ionicons name="settings-outline" size={18} color={palette.primary} />
            <Text style={styles.customizeText}>
              {t('wizard.customize', 'Customize preferences')}
            </Text>
          </GapView>
        </A11yPressable>
      </Link>
    </View>
  );
}

// ============================================================================
// Suggestion Card Component
// ============================================================================

interface SuggestionCardProps {
  suggestion: WizardSuggestion;
  showReasons: boolean;
  onPress: () => void;
  styles: any;
  palette: any;
}

function SuggestionCard({ suggestion, showReasons, onPress, styles, palette }: SuggestionCardProps) {
  const { t } = useTranslation();
  
  // Get energy level icon and color
  const energyConfig = {
    low: { icon: 'battery-half', color: palette.success || palette.primary, label: t('wizard.energy.low', 'Low energy') },
    medium: { icon: 'battery-charging', color: palette.warning || palette.primary, label: t('wizard.energy.medium', 'Medium energy') },
    high: { icon: 'battery-full', color: palette.error || palette.primary, label: t('wizard.energy.high', 'High energy') },
  };
  
  const energy = energyConfig[suggestion.energyLevel];
  
  // Cognitive load indicator
  const cognitiveConfig = {
    light: { icon: 'bulb-outline', label: t('wizard.cognitive.light', 'Light focus') },
    moderate: { icon: 'bulb', label: t('wizard.cognitive.moderate', 'Moderate focus') },
    heavy: { icon: 'flash', label: t('wizard.cognitive.heavy', 'Deep focus') },
  };
  
  const cognitive = cognitiveConfig[suggestion.cognitiveLoad];
  
  return (
    <Link href={suggestion.route as any} asChild={true}>
      <A11yPressable
        style={[styles.suggestionCard, suggestion.dayOfRotation !== undefined && styles.featuredCard]}
        accessibilityRole="button"
        accessibilityLabel={`${suggestion.title}. ${suggestion.description}. ${energy.label}. ${cognitive.label}. ${suggestion.estimatedTime} minutes.`}
        accessibilityHint={t('wizard.cardHint', 'Double tap to open this feature')}
        hitSlop={HIT_SLOP_8}
        onPress={onPress}
      >
        {/* Featured Badge */}
        {suggestion.dayOfRotation !== undefined && (
          <GapView style={styles.featuredBadge} gap={4}>
            <Ionicons name="star" size={14} color={palette.warning || palette.primary} />
            <Text style={styles.featuredText}>
              {t('wizard.featured', "Today's Pick")}
            </Text>
          </GapView>
        )}
        
        {/* Icon */}
        <View style={[styles.cardIcon, { backgroundColor: palette.surface }]}>
          <Ionicons name={suggestion.icon as any} size={32} color={palette.primary} />
        </View>
        
        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
            {suggestion.title}
          </Text>
          <Text style={styles.cardDescription} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={3}>
            {suggestion.description}
          </Text>
          
          {/* Metadata */}
          <GapView style={styles.cardMetadata} gap={12}>
            <GapView style={styles.metadataItem} gap={4}>
              <Ionicons name="time-outline" size={14} color={palette.text} style={{ opacity: 0.7 }} />
              <Text style={styles.metadataText}>{suggestion.estimatedTime}min</Text>
            </GapView>
            <GapView style={styles.metadataItem} gap={4}>
              <Ionicons name={energy.icon as any} size={14} color={energy.color} />
              <Text style={[styles.metadataText, { color: energy.color }]}>{energy.label}</Text>
            </GapView>
            <GapView style={styles.metadataItem} gap={4}>
              <Ionicons name={cognitive.icon as any} size={14} color={palette.text} style={{ opacity: 0.7 }} />
              <Text style={styles.metadataText}>{cognitive.label}</Text>
            </GapView>
          </GapView>
          
          {/* Reasons */}
          {showReasons && suggestion.reasoning.length > 0 && (
            <GapView style={styles.reasonsContainer} gap={6}>
              {suggestion.reasoning.slice(0, 2).map((reason, idx) => (
                <ReasonChip key={idx} reason={reason} palette={palette} styles={styles} />
              ))}
            </GapView>
          )}
        </View>
      </A11yPressable>
    </Link>
  );
}

// ============================================================================
// Next Step Card Component (Smaller, simpler)
// ============================================================================

interface NextStepCardProps {
  suggestion: WizardSuggestion;
  styles: any;
  palette: any;
}

function NextStepCard({ suggestion, styles, palette }: NextStepCardProps) {
  return (
    <Link href={suggestion.route as any} asChild={true}>
      <A11yPressable
        style={styles.nextStepCard}
        accessibilityRole="button"
        accessibilityLabel={`${suggestion.title}. ${suggestion.reasoning[0]?.label || ''}`}
        hitSlop={HIT_SLOP_8}
      >
        <View style={[styles.nextStepIcon, { backgroundColor: palette.surface }]}>
          <Ionicons name={suggestion.icon as any} size={24} color={palette.primary} />
        </View>
        <Text style={styles.nextStepTitle} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={2}>
          {suggestion.title}
        </Text>
        {suggestion.reasoning[0] && (
          <Text style={styles.nextStepReason} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
            {suggestion.reasoning[0].label}
          </Text>
        )}
      </A11yPressable>
    </Link>
  );
}

// ============================================================================
// Reason Chip Component
// ============================================================================

interface ReasonChipProps {
  reason: { type: string; label: string; confidence: number };
  palette: any;
  styles: any;
}

function ReasonChip({ reason, palette, styles }: ReasonChipProps) {
  // Icon mapping for reason types
  const iconMap: Record<string, string> = {
    disability_match: 'accessibility',
    energy_level: 'battery-charging',
    time_of_day: 'time',
    continuation: 'play-forward',
    new_feature: 'star',
    daily_rotation: 'calendar',
    user_pattern: 'trending-up',
    stress_relief: 'heart',
    accessibility_fit: 'checkmark-circle',
  };
  
  const icon = iconMap[reason.type] || 'information-circle';
  
  return (
    <GapView style={[styles.reasonChip, { borderColor: palette.primary + '40' }]} gap={4}>
      <Ionicons name={icon as any} size={12} color={palette.primary} />
      <Text style={styles.reasonText} maxFontSizeMultiplier={MAX_FONT_SCALE} numberOfLines={1}>
        {reason.label}
      </Text>
    </GapView>
  );
}

// ============================================================================
// Styles
// ============================================================================

function createStyles(palette: any, factor: number) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      padding: 16,
      marginVertical: 12,
      ...createShadow({
        shadowColor: palette.shadow || palette.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }),
    },
    
    // Loading
    loadingContainer: {
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 12,
      color: palette.text,
      opacity: 0.7,
      fontSize: Math.round(14 * factor),
    },
    
    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: palette.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: Math.round(20 * factor),
      fontWeight: '700',
      color: palette.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      opacity: 0.7,
    },
    
    // Suggestions
    suggestionsScroll: {
      paddingRight: 16,
    },
    suggestionCard: {
      width: 280,
      backgroundColor: palette.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.muted,
      padding: 16,
      marginRight: 12,
    },
    featuredCard: {
      borderColor: palette.primary,
      borderWidth: 2,
    },
    featuredBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: palette.warningBg || palette.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 12,
    },
    featuredText: {
      fontSize: Math.round(12 * factor),
      fontWeight: '600',
      color: palette.warning || palette.primary,
    },
    cardIcon: {
      width: 56,
      height: 56,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      fontSize: Math.round(18 * factor),
      fontWeight: '600',
      color: palette.text,
      marginBottom: 6,
    },
    cardDescription: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      opacity: 0.8,
      marginBottom: 12,
      lineHeight: Math.round(20 * factor),
    },
    cardMetadata: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 12,
    },
    metadataItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metadataText: {
      fontSize: Math.round(12 * factor),
      color: palette.text,
      opacity: 0.7,
    },
    reasonsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    reasonChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: palette.primary + '10',
    },
    reasonText: {
      fontSize: Math.round(11 * factor),
      color: palette.primary,
      fontWeight: '500',
    },
    
    // Next Steps
    nextStepsContainer: {
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: palette.muted,
    },
    nextStepsTitle: {
      fontSize: Math.round(16 * factor),
      fontWeight: '600',
      color: palette.text,
      marginBottom: 12,
    },
    nextStepsScroll: {
      paddingRight: 16,
    },
    nextStepCard: {
      width: 140,
      backgroundColor: palette.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.muted,
      padding: 12,
      alignItems: 'center',
      marginRight: 12,
    },
    nextStepIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    nextStepTitle: {
      fontSize: Math.round(13 * factor),
      fontWeight: '600',
      color: palette.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    nextStepReason: {
      fontSize: Math.round(11 * factor),
      color: palette.text,
      opacity: 0.6,
      textAlign: 'center',
    },
    
    // Customize Button
    customizeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      paddingVertical: 10,
    },
    customizeText: {
      fontSize: Math.round(14 * factor),
      color: palette.primary,
      fontWeight: '500',
    },
  });
}

// Re-export for convenience
export { useDisabilityProfile, useDisabilityWizard } from '../services/disabilityWizard';

