/**
 * Enhanced Focus Management Hook for WCAG 2.2 Compliance
 * 
 * Implements:
 * - 2.4.11 Focus Not Obscured (Minimum) - Level A
 * - 2.4.12 Focus Not Obscured (Enhanced) - Level AA
 * - 2.4.13 Focus Appearance - Level AA
 * - 2.4.7 Focus Visible - Level AA
 */

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform } from 'react-native';

import { FOCUS_INDICATOR, FOCUS_VISIBILITY, KEYBOARD_NAV } from '../constants/FocusManagement';
import { logger } from '../utils/logger';

export type InteractionMode = 'keyboard' | 'mouse' | 'touch';

interface UseFocusManagementOptions {
  // Whether to show focus indicator
  showFocusIndicator?: boolean;
  
  // Whether to auto-focus on mount
  autoFocus?: boolean;
  
  // Delay before auto-focus (ms)
  autoFocusDelay?: number;
  
  // Whether to restore focus when component unmounts
  restoreFocus?: boolean;
  
  // Callback when focus changes
  onFocusChange?: (isFocused: boolean) => void;
  
  // Custom focus indicator style
  focusStyle?: object;
}

interface UseFocusManagementReturn {
  // Whether element is currently focused
  isFocused: boolean;
  
  // Current interaction mode
  interactionMode: InteractionMode;
  
  // Whether to show focus indicator based on interaction mode
  shouldShowFocus: boolean;
  
  // Focus indicator style
  focusIndicatorStyle: object | null;
  
  // Focus handler
  handleFocus: () => void;
  
  // Blur handler
  handleBlur: () => void;
  
  // Programmatically set focus
  setFocus: () => void;
  
  // Check if focus is visible (not obscured)
  isFocusVisible: boolean;
}

/**
 * Hook for managing focus with WCAG 2.2 compliance
 * 
 * @param ref - React ref to the element to manage focus for
 * @param options - Configuration options for focus management
 * @returns Focus state and handlers
 * 
 * @example
 * const ref = useRef(null);
 * const { isFocused, handleFocus, handleBlur } = useFocusManagement(ref, {
 *   showFocusIndicator: true,
 *   autoFocus: true
 * });
 */
export function useFocusManagement(
  ref: React.RefObject<any>,
  options: UseFocusManagementOptions = {}
): UseFocusManagementReturn {
  const {
    showFocusIndicator = true,
    autoFocus = false,
    autoFocusDelay = 100,
    restoreFocus = false,
    onFocusChange,
    focusStyle,
  } = options;

  const [isFocused, setIsFocused] = useState(false);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('keyboard');
  const [isFocusVisible, setIsFocusVisible] = useState(true);
  const lastFocusedElement = useRef<any>(null);

  // Detect interaction mode
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = () => setInteractionMode('keyboard');
      const handleMouseDown = () => setInteractionMode('mouse');
      const handleTouchStart = () => setInteractionMode('touch');

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('touchstart', handleTouchStart);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('touchstart', handleTouchStart);
      };
    }
    return undefined;
  }, []);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (!autoFocus) return;

    const timer = setTimeout(() => {
      setFocus();
    }, autoFocusDelay);

    return () => clearTimeout(timer);
  }, [autoFocus, autoFocusDelay]);

  // Store focus for restoration
  useEffect(() => {
    if (restoreFocus && isFocused && Platform.OS === 'web') {
      lastFocusedElement.current = document.activeElement;
    }
  }, [isFocused, restoreFocus]);

  // Restore focus on unmount if requested
  useEffect(() => {
    return () => {
      if (restoreFocus && lastFocusedElement.current && Platform.OS === 'web') {
        try {
          (lastFocusedElement.current as HTMLElement)?.focus?.();
        } catch (error) {
          if (__DEV__) {
            logger.warn('Failed to restore focus:', error);
          }
        }
      }
    };
  }, [restoreFocus]);

  // Check if focused element is visible (WCAG 2.4.11, 2.4.12)
  const checkFocusVisibility = useCallback(() => {
    if (!ref.current || Platform.OS !== 'web') {
      setIsFocusVisible(true);
      return;
    }

    try {
      const element = ref.current as HTMLElement;
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Check if element is in viewport
      const isInViewport = (
        rect.top >= -FOCUS_VISIBILITY.scrollPadding.top &&
        rect.left >= -FOCUS_VISIBILITY.scrollPadding.left &&
        rect.bottom <= viewportHeight + FOCUS_VISIBILITY.scrollPadding.bottom &&
        rect.right <= viewportWidth + FOCUS_VISIBILITY.scrollPadding.right
      );

      // Check if element is partially visible (Level A)
      const isPartiallyVisible = (
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < viewportHeight &&
        rect.left < viewportWidth
      );

      // For Level AA, we want the element to be fully visible or have
      // at least a 2px perimeter visible
      const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      const visibleWidth = Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0);
      const hasMinimumVisibleArea = (
        visibleHeight >= FOCUS_VISIBILITY.minVisibleArea.levelAA &&
        visibleWidth >= FOCUS_VISIBILITY.minVisibleArea.levelAA
      );

      setIsFocusVisible(isInViewport || (isPartiallyVisible && hasMinimumVisibleArea));

      // Scroll into view if not visible
      if (!isInViewport && isFocused) {
        element.scrollIntoView({
          behavior: FOCUS_VISIBILITY.scrollBehavior.behavior,
          block: FOCUS_VISIBILITY.scrollBehavior.block,
          inline: FOCUS_VISIBILITY.scrollBehavior.inline,
        });
      }
    } catch (error) {
      if (__DEV__) {
        logger.warn('Failed to check focus visibility:', error);
      }
      setIsFocusVisible(true);
    }
  }, [ref, isFocused]);

  // Update focus visibility when focused
  useEffect(() => {
    if (isFocused) {
      checkFocusVisibility();
    }
  }, [isFocused, checkFocusVisibility]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocusChange?.(true);
    checkFocusVisibility();
  }, [onFocusChange, checkFocusVisibility]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onFocusChange?.(false);
  }, [onFocusChange]);

  const setFocus = useCallback(() => {
    if (!ref.current) return;

    try {
      if (Platform.OS === 'web') {
        // Web: Use standard HTMLElement.focus() method
        (ref.current as HTMLElement)?.focus?.();
      } else {
        // React Native (iOS/Android): Use AccessibilityInfo API
        // This sets accessibility focus for screen readers like VoiceOver/TalkBack
        const handle = findNodeHandle(ref.current);
        if (handle && typeof AccessibilityInfo?.setAccessibilityFocus === 'function') {
          AccessibilityInfo.setAccessibilityFocus(handle);
        }
      }
    } catch (error) {
      // Log warning using app's logger utility (imported from utils/logger)
      // This prevents focus errors from breaking the app but alerts developers
      if (__DEV__) {
        logger.warn('Failed to set focus:', error);
      }
    }
  }, [ref]);

  // Determine if focus indicator should be shown
  const shouldShowFocus = showFocusIndicator && isFocused && (
    interactionMode === 'keyboard' ||
    (interactionMode === 'mouse' && KEYBOARD_NAV.showFocusOnMouseClick) ||
    (interactionMode === 'touch' && KEYBOARD_NAV.showFocusOnTouch)
  );

  // Get focus indicator style (WCAG 2.4.13)
  const focusIndicatorStyle = shouldShowFocus
    ? focusStyle || {
        borderWidth: FOCUS_INDICATOR.enhancedThickness,
        borderColor: FOCUS_INDICATOR.colors.light.primary,
        borderStyle: 'solid',
        outlineWidth: 0, // Prevent double outline on web
      }
    : null;

  return {
    isFocused,
    interactionMode,
    shouldShowFocus,
    focusIndicatorStyle,
    handleFocus,
    handleBlur,
    setFocus,
    isFocusVisible,
  };
}

/**
 * Hook for managing focus trap in modals and dialogs
 */
export function useFocusTrap(
  containerRef: React.RefObject<any>,
  isActive: boolean = true
) {
  const firstFocusableRef = useRef<any>(null);
  const lastFocusableRef = useRef<any>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current || Platform.OS !== 'web') return;

    const container = containerRef.current as HTMLElement;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    firstFocusableRef.current = focusableElements[0];
    lastFocusableRef.current = focusableElements[focusableElements.length - 1];

    // Auto-focus first element
    (firstFocusableRef.current as HTMLElement)?.focus?.();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableRef.current) {
          (lastFocusableRef.current as HTMLElement)?.focus?.();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableRef.current) {
          (firstFocusableRef.current as HTMLElement)?.focus?.();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey as any);

    return () => {
      container.removeEventListener('keydown', handleTabKey as any);
    };
  }, [isActive, containerRef]);
}

/**
 * Hook for skip links (WCAG 2.4.1)
 */
export function useSkipLink(targetId: string) {
  const skipToContent = useCallback(() => {
    if (Platform.OS !== 'web') return;

    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [targetId]);

  return { skipToContent };
}
