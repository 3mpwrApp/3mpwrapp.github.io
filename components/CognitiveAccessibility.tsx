/**
 * Cognitive Accessibility UI Components
 * 
 * Reusable components for simplified, ADHD-friendly, and cognitive-accessible interfaces.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { TaskComplexity } from '../constants/Cognitive';
import { BREADCRUMB_CONFIG, COGNITIVE_MODES, COMPLEXITY_INDICATORS, PROGRESS_STYLES } from '../constants/Cognitive';
import { useCognitiveAccessibility } from '../context/CognitiveAccessibilityContext';
import { MAX_FONT_SCALE } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

// ============================================================================
// Progress Indicator Components
// ============================================================================

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ current, total, label, showPercentage = false }: ProgressBarProps) {
  const palette = useAppPalette();
  const percentage = Math.round((current / total) * 100);
  
  return (
    <View style={styles.progressContainer} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: current }}>
      {label && (
        <Text style={[styles.progressLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {label}
          {showPercentage && ` (${percentage}%)`}
        </Text>
      )}
      <View style={[styles.progressBar, { backgroundColor: palette.muted }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: palette.primary,
              width: `${percentage}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  onStepPress?: (step: number) => void;
}

export function StepIndicator({ currentStep, totalSteps, stepLabels, onStepPress }: StepIndicatorProps) {
  const palette = useAppPalette();
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  
  return (
    <View style={styles.stepContainer} accessibilityRole="tablist">
      {steps.map((step) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const color = isCompleted
          ? PROGRESS_STYLES.step.completedColor
          : isCurrent
            ? PROGRESS_STYLES.step.activeColor
            : PROGRESS_STYLES.step.inactiveColor;
        
        return (
          <React.Fragment key={step}>
            <A11yPressable
              onPress={() => onStepPress?.(step)}
              disabled={!onStepPress}
              style={[styles.step, { backgroundColor: color }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isCurrent, disabled: !onStepPress }}
              accessibilityLabel={stepLabels?.[step - 1] || `Step ${step} of ${totalSteps}`}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={16} color="white" />
              ) : (
                <Text style={styles.stepNumber}>{step}</Text>
              )}
            </A11yPressable>
            {step < totalSteps && <View style={[styles.stepConnector, { backgroundColor: palette.muted }]} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ============================================================================
// Breadcrumb Navigation
// ============================================================================

interface BreadcrumbItem {
  label: string;
  screen?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (screen: string) => void;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  const palette = useAppPalette();
  
  // Show only last N items if too many
  const visibleItems = items.slice(-BREADCRUMB_CONFIG.maxVisible);
  const hasMore = items.length > BREADCRUMB_CONFIG.maxVisible;
  
  return (
    <View style={styles.breadcrumbContainer} accessibilityRole="menu" accessibilityLabel="Breadcrumb navigation">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breadcrumbScroll}>
        {hasMore && (
          <>
            <Text style={[styles.breadcrumbText, { color: palette.textSecondary }]}>...</Text>
            <Text style={[styles.breadcrumbSeparator, { color: palette.textSecondary }]}>{BREADCRUMB_CONFIG.separator}</Text>
          </>
        )}
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          return (
            <React.Fragment key={index}>
              {item.screen && onNavigate ? (
                <A11yPressable
                  onPress={() => onNavigate(item.screen!)}
                  accessibilityRole="link"
                  accessibilityLabel={`Navigate to ${item.label}`}
                >
                  <Text style={[styles.breadcrumbLink, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {item.label}
                  </Text>
                </A11yPressable>
              ) : (
                <Text
                  style={[styles.breadcrumbText, { color: isLast ? palette.text : palette.textSecondary }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {item.label}
                </Text>
              )}
              {!isLast && (
                <Text style={[styles.breadcrumbSeparator, { color: palette.textSecondary }]}>
                  {BREADCRUMB_CONFIG.separator}
                </Text>
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// Task Complexity Indicator
// ============================================================================

interface ComplexityBadgeProps {
  complexity: TaskComplexity;
  showDetails?: boolean;
}

export function ComplexityBadge({ complexity, showDetails = false }: ComplexityBadgeProps) {
  const palette = useAppPalette();
  const indicator = COMPLEXITY_INDICATORS[complexity.level];
  
  return (
    <View style={styles.complexityContainer} accessibilityRole="text">
      <View style={[styles.complexityBadge, { backgroundColor: indicator.color }]}>
        <Text style={styles.complexityIcon}>{indicator.icon}</Text>
        <Text style={styles.complexityLabel}>{indicator.label}</Text>
      </View>
      {showDetails && (
        <View style={styles.complexityDetails}>
          <Text style={[styles.complexityDescription, { color: palette.textSecondary }]}>{indicator.description}</Text>
          <Text style={[styles.complexityInfo, { color: palette.textSecondary }]}>
            {complexity.steps} steps • {complexity.estimatedMinutes} minutes
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Auto-Save Indicator
// ============================================================================

interface AutoSaveIndicatorProps {
  lastSaved: number | null;
  isSaving?: boolean;
}

export function AutoSaveIndicator({ lastSaved, isSaving = false }: AutoSaveIndicatorProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const [relativeTime, setRelativeTime] = useState('');
  
  useEffect(() => {
    if (!lastSaved) return;
    
    const updateTime = () => {
      const seconds = Math.floor((Date.now() - lastSaved) / 1000);
      if (seconds < 60) {
        setRelativeTime(t('cognitive.savedJustNow', 'Saved just now'));
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setRelativeTime(t('cognitive.savedMinutesAgo', 'Saved {{count}} minute ago', { count: minutes }));
      } else {
        const hours = Math.floor(seconds / 3600);
        setRelativeTime(t('cognitive.savedHoursAgo', 'Saved {{count}} hour ago', { count: hours }));
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [lastSaved, t]);
  
  if (!lastSaved && !isSaving) return null;
  
  return (
    <View style={styles.autoSaveContainer} accessibilityRole="text" accessibilityLiveRegion="polite">
      {isSaving ? (
        <>
          <ActivityIndicator size="small" color={palette.primary} />
          <Text style={[styles.autoSaveText, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.saving', 'Saving...')}
          </Text>
        </>
      ) : (
        <>
          <Ionicons name="checkmark-circle" size={16} color={palette.success} />
          <Text style={[styles.autoSaveText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {relativeTime}
          </Text>
        </>
      )}
    </View>
  );
}

// ============================================================================
// "Back to Where I Was" Button
// ============================================================================

interface BackToLocationProps {
  locationName: string;
  onPress: () => void;
}

export function BackToLocationButton({ locationName, onPress }: BackToLocationProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  
  return (
    <A11yPressable
      onPress={onPress}
      style={[styles.backToLocationButton, { backgroundColor: palette.primary + '20', borderColor: palette.primary }]}
      accessibilityRole="button"
      accessibilityLabel={t('cognitive.backToWhereYouWere', 'Go back to {{location}}', { location: locationName })}
    >
      <Ionicons name="arrow-back-circle" size={24} color={palette.primary} />
      <View style={styles.backToLocationText}>
        <Text style={[styles.backToLocationLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('cognitive.youWereHere', 'You were here last:')}
        </Text>
        <Text style={[styles.backToLocationName, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {locationName}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={palette.primary} />
    </A11yPressable>
  );
}

// ============================================================================
// Simplified View Wrapper
// ============================================================================

interface SimplifiedViewProps {
  children: React.ReactNode;
  maxItems?: number;
  showAll?: boolean;
  onToggleShowAll?: () => void;
}

export function SimplifiedView({ children, maxItems = 5, showAll = false, onToggleShowAll }: SimplifiedViewProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  
  let limit = maxItems;
  try {
    const cognitive = useCognitiveAccessibility();
    limit = COGNITIVE_MODES[cognitive.preferences.mode].maxItemsPerScreen;
  } catch {
    // Context not available, use default
  }
  
  const childArray = React.Children.toArray(children);
  const visibleChildren = showAll ? childArray : childArray.slice(0, limit);
  const hasMore = childArray.length > limit;
  
  return (
    <View style={styles.simplifiedViewContainer}>
      {visibleChildren}
      {hasMore && !showAll && onToggleShowAll && (
        <A11yPressable
          onPress={onToggleShowAll}
          style={[styles.showMoreButton, { borderColor: palette.primary }]}
          accessibilityRole="button"
          accessibilityLabel={t('cognitive.showMoreItems', 'Show {{count}} more items', { count: childArray.length - limit })}
        >
          <Text style={[styles.showMoreText, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.showMore', 'Show {{count}} more', { count: childArray.length - limit })}
          </Text>
          <Ionicons name="chevron-down" size={20} color={palette.primary} />
        </A11yPressable>
      )}
      {showAll && onToggleShowAll && (
        <A11yPressable
          onPress={onToggleShowAll}
          style={[styles.showMoreButton, { borderColor: palette.primary }]}
          accessibilityRole="button"
          accessibilityLabel={t('cognitive.showLess', 'Show less')}
        >
          <Text style={[styles.showMoreText, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('cognitive.showLess', 'Show less')}
          </Text>
          <Ionicons name="chevron-up" size={20} color={palette.primary} />
        </A11yPressable>
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Progress Bar
  progressContainer: {
    marginVertical: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  progressBar: {
    height: PROGRESS_STYLES.bar.height,
    borderRadius: PROGRESS_STYLES.bar.borderRadius,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: PROGRESS_STYLES.bar.borderRadius,
  },
  
  // Step Indicator
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  step: {
    width: PROGRESS_STYLES.step.size,
    height: PROGRESS_STYLES.step.size,
    borderRadius: PROGRESS_STYLES.step.size / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  stepConnector: {
    width: PROGRESS_STYLES.step.spacing,
    height: 2,
  },
  
  // Breadcrumbs
  breadcrumbContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  breadcrumbScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 14,
  },
  breadcrumbLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  breadcrumbSeparator: {
    fontSize: 14,
    marginHorizontal: 6,
  },
  
  // Complexity Badge
  complexityContainer: {
    marginVertical: 8,
  },
  complexityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  complexityIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  complexityLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  complexityDetails: {
    marginTop: 6,
  },
  complexityDescription: {
    fontSize: 14,
    // Uses palette.textSecondary dynamically in component
  },
  complexityInfo: {
    fontSize: 12,
    // Uses palette.textSecondary dynamically in component
    marginTop: 2,
  },
  
  // Auto-Save Indicator
  autoSaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  autoSaveText: {
    fontSize: 12,
    marginLeft: 6,
  },
  
  // Back to Location
  backToLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  backToLocationText: {
    flex: 1,
    marginLeft: 12,
  },
  backToLocationLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  backToLocationName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  
  // Simplified View
  simplifiedViewContainer: {
    width: '100%',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
});
