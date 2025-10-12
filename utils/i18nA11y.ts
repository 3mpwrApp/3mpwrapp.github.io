/**
 * Internationalized Accessibility Utilities
 * 
 * This module provides enhanced accessibility features that work seamlessly 
 * across all supported languages while ensuring proper screen reader support.
 */

import { AccessibilityInfo } from 'react-native';

import { useTranslation } from '../i18n';

/**
 * Enhanced announcement system with language-aware formatting
 */
export function useAccessibilityAnnouncements() {
  const { t, lang, isRTL } = useTranslation();

  /**
   * Announce content with language-appropriate formatting and timing
   */
  const announce = (
    key: string, 
    fallback: string, 
    vars?: Record<string, string | number>,
    options?: {
      priority?: 'polite' | 'assertive';
      delay?: number;
      formatForLanguage?: boolean;
    }
  ) => {
    const { delay = 300, formatForLanguage = true } = options || {};
    
    try {
      let message = t(key, fallback, vars);
      
      // Language-specific formatting for screen readers
      if (formatForLanguage) {
        message = formatMessageForLanguage(message, lang, isRTL);
      }
      
      // Delay announcement to avoid interrupting other screen reader content
      setTimeout(() => {
        if (typeof AccessibilityInfo?.announceForAccessibility === 'function') {
          AccessibilityInfo.announceForAccessibility(message);
        }
      }, delay);
      
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to announce accessibility message:', error);
      }
    }
  };

  /**
   * Announce form validation errors with appropriate language context
   */
  const announceFormError = (
    fieldLabel: string,
    errorKey: string,
    errorFallback: string,
    vars?: Record<string, string | number>
  ) => {
    const errorMessage = t(errorKey, errorFallback, vars);
    const formattedMessage = t('a11y.input.errorWithField', 
      'Error in {{field}}: {{error}}', 
      { field: fieldLabel, error: errorMessage }
    );
    
    announce('', formattedMessage, undefined, { 
      priority: 'assertive', 
      delay: 100 
    });
  };

  /**
   * Announce navigation changes with context
   */
  const announceNavigation = (
    screenKey: string,
    screenFallback: string,
    additionalContext?: string
  ) => {
    const screenName = t(screenKey, screenFallback);
    const navMessage = additionalContext 
      ? t('a11y.navigation.screenWithContext', 
          'Navigated to {{screen}}. {{context}}', 
          { screen: screenName, context: additionalContext })
      : t('a11y.navigation.screen', 
          'Navigated to {{screen}}', 
          { screen: screenName });
    
    announce('', navMessage, undefined, { delay: 500 });
  };

  /**
   * Announce dynamic content changes
   */
  const announceContentChange = (
    changeKey: string,
    changeFallback: string,
    vars?: Record<string, string | number>
  ) => {
    announce(changeKey, changeFallback, vars, { 
      priority: 'polite', 
      delay: 200 
    });
  };

  return {
    announce,
    announceFormError,
    announceNavigation,
    announceContentChange,
  };
}

/**
 * Format messages appropriately for different languages and RTL support
 */
function formatMessageForLanguage(message: string, lang: string, _isRTL: boolean): string {
  // Language-specific formatting rules for screen readers
  switch (lang) {
    case 'fr':
      // French screen readers prefer certain punctuation patterns
      return message
        .replace(/\s*:\s*/g, ' : ') // Add spaces around colons
        .replace(/\s*;\s*/g, ' ; ') // Add spaces around semicolons
        .replace(/([0-9]+)\s*-\s*([0-9]+)/g, '$1 à $2'); // Format number ranges
    
    case 'es':
      // Spanish screen readers benefit from explicit number formatting
      return message
        .replace(/([0-9]+)\s*-\s*([0-9]+)/g, '$1 a $2') // Format number ranges
        .replace(/\b([0-9]+)\/([0-9]+)\b/g, '$1 de $2'); // Format fractions
    
    case 'en':
    default:
      // English formatting (also used as fallback)
      return message
        .replace(/([0-9]+)\s*-\s*([0-9]+)/g, '$1 to $2') // Format number ranges
        .replace(/\b([0-9]+)\/([0-9]+)\b/g, '$1 of $2'); // Format fractions
  }
}

/**
 * Generate accessibility labels with proper language context
 */
export function useAccessibilityLabels() {
  const { t } = useTranslation();

  const generateLabel = (
    baseKey: string,
    baseFallback: string,
    context?: {
      role?: string;
      state?: string;
      value?: string | number;
      index?: number;
      total?: number;
    }
  ): string => {
    let label = t(baseKey, baseFallback);
    
    if (context) {
      // Add role information
      if (context.role) {
        const roleLabel = t(`a11y.roles.${context.role}`, context.role);
        label = t('a11y.labelWithRole', '{{label}}, {{role}}', {
          label,
          role: roleLabel
        });
      }
      
      // Add state information
      if (context.state) {
        const stateLabel = t(`a11y.states.${context.state}`, context.state);
        label = t('a11y.labelWithState', '{{label}}, {{state}}', {
          label,
          state: stateLabel
        });
      }
      
      // Add position information for lists
      if (context.index !== undefined && context.total !== undefined) {
        const positionLabel = t('a11y.position', '{{index}} of {{total}}', {
          index: context.index + 1, // Convert 0-based to 1-based
          total: context.total
        });
        label = t('a11y.labelWithPosition', '{{label}}, {{position}}', {
          label,
          position: positionLabel
        });
      }
      
      // Add value information
      if (context.value !== undefined) {
        label = t('a11y.labelWithValue', '{{label}}, value {{value}}', {
          label,
          value: context.value
        });
      }
    }
    
    return label;
  };

  return { generateLabel };
}

/**
 * Hook for managing focus announcements across languages
 */
export function useFocusAnnouncements() {
  const { announce } = useAccessibilityAnnouncements();

  const announceFocusChange = (
    elementKey: string,
    elementFallback: string,
    vars?: Record<string, string | number>
  ) => {
    announce(
      `a11y.focus.${elementKey}`,
      `Focused on ${elementFallback}`,
      vars,
      { delay: 100 }
    );
  };

  return { announceFocusChange };
}

/**
 * Generate culturally appropriate accessibility hints
 */
export function useAccessibilityHints() {
  const { t, lang } = useTranslation();

  const generateHint = (
    action: 'tap' | 'swipe' | 'hold' | 'navigate',
    target?: string,
    context?: string
  ): string => {
    const actionKey = `a11y.hints.${action}`;
    
    // Base action hints with language-specific variations
    const baseHints = {
      tap: {
        en: 'Double tap to activate',
        fr: 'Appuyez deux fois pour activer',
        es: 'Toque dos veces para activar'
      },
      swipe: {
        en: 'Swipe right or left to navigate',
        fr: 'Balayez vers la droite ou la gauche pour naviguer',
        es: 'Deslice hacia la derecha o izquierda para navegar'
      },
      hold: {
        en: 'Double tap and hold',
        fr: 'Appuyez deux fois et maintenez',
        es: 'Toque dos veces y mantenga presionado'
      },
      navigate: {
        en: 'Use swipe gestures to navigate',
        fr: 'Utilisez les gestes de balayage pour naviguer',
        es: 'Use gestos de deslizamiento para navegar'
      }
    };

    let hint = t(actionKey, baseHints[action][lang] || baseHints[action].en);

    if (target) {
      hint = t('a11y.hints.withTarget', '{{hint}} {{target}}', {
        hint,
        target: t(target, target)
      });
    }

    if (context) {
      hint = t('a11y.hints.withContext', '{{hint}}. {{context}}', {
        hint,
        context: t(context, context)
      });
    }

    return hint;
  };

  return { generateHint };
}