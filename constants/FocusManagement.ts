/**
 * Focus Management Constants for WCAG 2.2 Compliance
 * 
 * Implements:
 * - 2.4.11 Focus Not Obscured (Minimum) - Level A
 * - 2.4.12 Focus Not Obscured (Enhanced) - Level AA
 * - 2.4.13 Focus Appearance - Level AA
 */

import { StyleSheet } from 'react-native';

import { createShadow } from '../utils/shadow';

/**
 * WCAG 2.4.13 Focus Appearance Requirements
 * - Focus indicator must have minimum area of 2px
 * - Contrast ratio of at least 3:1 against adjacent colors
 * - Must be visible and not fully obscured by other content
 */
export const FOCUS_INDICATOR = {
  // Minimum thickness for focus indicators (WCAG 2.4.13)
  minThickness: 2,
  
  // Enhanced thickness for better visibility
  enhancedThickness: 3,
  
  // Offset to ensure focus doesn't overlap with element edges
  offset: 2,
  
  // Border radius for smooth corners
  borderRadius: 4,
  
  // Colors with 3:1 minimum contrast ratio
  colors: {
    light: {
      // Dark focus ring on light backgrounds: 8.61:1 contrast
      primary: '#004A99',
      // Alternative focus color: 10.50:1 contrast
      secondary: '#003E80',
    },
    dark: {
      // Light focus ring on dark backgrounds: 7.99:1 contrast
      primary: '#4DA3FF',
      // Alternative focus color: 10.25:1 contrast
      secondary: '#B0B6BB',
    },
  },
  
  // Animation duration (or 0 if reduce motion is enabled)
  animationDuration: 150,
} as const;

/**
 * Focus indicator styles for different component types
 * All styles ensure WCAG 2.4.13 compliance
 */
export const focusIndicatorStyles = StyleSheet.create({
  // Standard focus outline for buttons and interactive elements
  standard: {
    borderWidth: FOCUS_INDICATOR.enhancedThickness,
    borderStyle: 'solid',
    borderColor: FOCUS_INDICATOR.colors.light.primary,
    borderRadius: FOCUS_INDICATOR.borderRadius,
  },
  
  // Enhanced focus for primary actions
  enhanced: {
    borderWidth: FOCUS_INDICATOR.enhancedThickness,
    borderStyle: 'solid',
    borderColor: FOCUS_INDICATOR.colors.light.secondary,
    borderRadius: FOCUS_INDICATOR.borderRadius,
    ...createShadow({
      shadowColor: FOCUS_INDICATOR.colors.light.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  
  // Inner focus ring for elements with existing borders
  inner: {
    borderWidth: FOCUS_INDICATOR.minThickness,
    borderStyle: 'solid',
    borderColor: FOCUS_INDICATOR.colors.light.primary,
    margin: FOCUS_INDICATOR.offset,
  },
  
  // Dark theme variants
  darkStandard: {
    borderWidth: FOCUS_INDICATOR.enhancedThickness,
    borderStyle: 'solid',
    borderColor: FOCUS_INDICATOR.colors.dark.primary,
    borderRadius: FOCUS_INDICATOR.borderRadius,
  },
  
  darkEnhanced: {
    borderWidth: FOCUS_INDICATOR.enhancedThickness,
    borderStyle: 'solid',
    borderColor: FOCUS_INDICATOR.colors.dark.secondary,
    borderRadius: FOCUS_INDICATOR.borderRadius,
    ...createShadow({
      shadowColor: FOCUS_INDICATOR.colors.dark.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
});

/**
 * Focus order priorities for screen reader navigation
 * Lower numbers = higher priority
 */
export const FOCUS_ORDER = {
  critical: 1,      // Emergency actions, skip links
  primary: 10,      // Main navigation, primary actions
  secondary: 20,    // Secondary actions, common tasks
  content: 30,      // Main content area
  tertiary: 40,     // Supporting content, less important actions
  footer: 50,       // Footer links, legal information
} as const;

/**
 * Focus trap configuration for modals and dialogs
 * Ensures keyboard users can't accidentally leave modal
 */
export const FOCUS_TRAP = {
  // Whether to return focus to trigger element on close
  returnFocus: true,
  
  // Whether to auto-focus first focusable element
  autoFocus: true,
  
  // Elements that should be focusable even if disabled
  allowDisabled: false,
  
  // Delay before setting focus (allows for animations)
  focusDelay: 100,
} as const;

/**
 * Skip link configuration for keyboard navigation
 * Allows keyboard users to bypass repetitive content (WCAG 2.4.1)
 */
export const SKIP_LINKS = {
  // Show skip links on focus
  showOnFocus: true,
  
  // Target IDs for skip links
  targets: {
    mainContent: 'main-content',
    navigation: 'main-navigation',
    search: 'search-input',
    footer: 'footer-content',
  },
  
  // Skip link position
  position: {
    top: 0,
    left: 0,
    zIndex: 9999,
  },
} as const;

/**
 * Focus visibility configuration
 * Ensures focus is never completely obscured (WCAG 2.4.11, 2.4.12)
 */
export const FOCUS_VISIBILITY = {
  // Minimum visible area of focused element (pixels)
  minVisibleArea: {
    // Level A (2.4.11): Element must not be fully obscured
    levelA: 1,
    
    // Level AA (2.4.12): Element must be fully visible, or
    // area equal to 1 CSS pixel thick perimeter is visible
    levelAA: 2,
  },
  
  // Scroll behavior when focusing off-screen elements
  scrollBehavior: {
    // Scroll to make element fully visible
    block: 'nearest' as const,
    inline: 'nearest' as const,
    
    // Smooth scrolling (respects reduce motion)
    behavior: 'smooth' as const,
  },
  
  // Padding around focused element when scrolling into view
  scrollPadding: {
    top: 16,
    bottom: 16,
    left: 8,
    right: 8,
  },
} as const;

/**
 * Keyboard navigation configuration
 */
export const KEYBOARD_NAV = {
  // Key codes for navigation
  keys: {
    tab: 'Tab',
    shiftTab: 'Shift+Tab',
    enter: 'Enter',
    space: 'Space',
    escape: 'Escape',
    arrowUp: 'ArrowUp',
    arrowDown: 'ArrowDown',
    arrowLeft: 'ArrowLeft',
    arrowRight: 'ArrowRight',
    home: 'Home',
    end: 'End',
    pageUp: 'PageUp',
    pageDown: 'PageDown',
  },
  
  // Whether to show focus indicators for mouse users
  showFocusOnMouseClick: false,
  
  // Whether to show focus indicators for touch users
  showFocusOnTouch: false,
  
  // Always show focus for keyboard users
  alwaysShowKeyboardFocus: true,
} as const;

/**
 * Focus restoration configuration
 * Maintains focus position when returning from overlays
 */
export const FOCUS_RESTORATION = {
  // Store focus before opening modal/overlay
  storeFocus: true,
  
  // Restore focus when closing modal/overlay
  restoreFocus: true,
  
  // Maximum time to wait before giving up on restoration (ms)
  timeout: 3000,
  
  // Fallback element to focus if restoration fails
  fallbackSelector: '[role="main"]',
} as const;

/**
 * Helper function to get focus indicator style based on theme
 */
export function getFocusIndicatorStyle(theme: 'light' | 'dark', enhanced: boolean = false) {
  if (theme === 'dark') {
    return enhanced ? focusIndicatorStyles.darkEnhanced : focusIndicatorStyles.darkStandard;
  }
  return enhanced ? focusIndicatorStyles.enhanced : focusIndicatorStyles.standard;
}

/**
 * Helper function to check if element should show focus indicator
 * 
 * WCAG 2.2 Context:
 * - 2.4.7 Focus Visible (Level AA): Focus indicator must be visible for keyboard users
 * - Keyboard interaction always shows focus (accessibility requirement)
 * - Mouse/touch interaction typically doesn't show focus (user preference)
 * 
 * @param interactionMode - How the user is interacting (keyboard/mouse/touch)
 * @returns Whether focus indicator should be displayed
 */
export function shouldShowFocusIndicator(
  interactionMode: 'keyboard' | 'mouse' | 'touch'
): boolean {
  switch (interactionMode) {
    case 'keyboard':
      return KEYBOARD_NAV.alwaysShowKeyboardFocus;
    case 'mouse':
      return KEYBOARD_NAV.showFocusOnMouseClick;
    case 'touch':
      return KEYBOARD_NAV.showFocusOnTouch;
    default:
      return false;
  }
}
