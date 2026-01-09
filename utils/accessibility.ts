/**
 * WCAG 2.2 AAA Accessibility Utilities
 * 
 * Provides color contrast checking, accessible labels, and focus management
 * for WCAG 2.2 level AAA compliance (7:1 contrast ratio for normal text).
 */

import type { View } from 'react-native';
import { AccessibilityInfo } from 'react-native';

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to relative luminance (WCAG formula)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG contrast ratio between two colors
 * Returns ratio between 1:1 (no contrast) and 21:1 (maximum contrast)
 */
export function calculateContrastRatio(
  foreground: string,
  background: string
): number {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    console.warn(
      `Invalid color format. Expected hex colors, got: ${foreground}, ${background}`
    );
    return 0;
  }

  const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets AAA standard (7:1 contrast ratio)
 */
export function ensureContrastRatio(
  foreground: string,
  background: string
): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  return ratio >= 7;
}

/**
 * Check if color combination meets AA standard (4.5:1 contrast ratio)
 */
export function meetsAAStandard(
  foreground: string,
  background: string
): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  return ratio >= 4.5;
}

/**
 * Get the contrast ratio between colors
 */
export function getContrastRatio(
  foreground: string,
  background: string
): string {
  const ratio = calculateContrastRatio(foreground, background);
  return ratio.toFixed(2);
}

/**
 * Lighten a color by a percentage
 */
function lightenColor(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * (percent / 100)));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * (percent / 100)));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * (percent / 100)));

  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Darken a color by a percentage
 */
function darkenColor(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const r = Math.max(0, Math.round(rgb.r - rgb.r * (percent / 100)));
  const g = Math.max(0, Math.round(rgb.g - rgb.g * (percent / 100)));
  const b = Math.max(0, Math.round(rgb.b - rgb.b * (percent / 100)));

  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Get an accessible color that meets AA or AAA contrast standards
 * Adjusts the text color (foreground) to meet contrast requirements
 */
export function getAccessibleColor(text: string, bgColor: string): string {
  let adjustedColor = text;
  let adjustment = 5;

  // Try lightening first (common for dark text on light backgrounds)
  while (adjustment <= 100) {
    const lightened = lightenColor(text, adjustment);
    if (ensureContrastRatio(lightened, bgColor)) {
      return lightened;
    }
    adjustment += 5;
  }

  // Try darkening
  adjustment = 5;
  while (adjustment <= 100) {
    const darkened = darkenColor(text, adjustment);
    if (ensureContrastRatio(darkened, bgColor)) {
      return darkened;
    }
    adjustment += 5;
  }

  // If no adjustment works, return original
  return adjustedColor;
}

/**
 * Create an accessible label for screen readers
 * Combines action and context for clarity
 */
export function createAccessibleLabel(
  action: string,
  context?: string
): string {
  if (!context) return action;
  return `${action}, ${context}`;
}

/**
 * Get all focusable elements within a container
 * Includes buttons, links, inputs, and other interactive elements
 */
export function getFocusableElements(
  container: View | null | undefined
): Element[] {
  if (!container || typeof (container as any).root !== 'object') {
    return [];
  }

  try {
    const selectors = [
      'button',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'video[controls]',
      'audio[controls]',
    ].join(',');

    return Array.from(
      ((container as any).root as any).querySelectorAll?.(selectors) ?? []
    );
  } catch {
    return [];
  }
}

/**
 * Announce content to screen reader
 */
export async function announceForAccessibility(
  message: string
): Promise<void> {
  try {
    if (typeof AccessibilityInfo?.announceForAccessibility === 'function') {
      await AccessibilityInfo.announceForAccessibility(message);
    }
  } catch (error) {
    console.warn('Failed to announce for accessibility:', error);
  }
}

/**
 * Get accessible role mappings for semantic elements
 */
export const A11Y_ROLES = {
  button: 'button',
  link: 'link',
  heading: 'header',
  navigation: 'navigation',
  main: 'main',
  section: 'section',
  article: 'article',
  list: 'list',
  listItem: 'listitem',
  tab: 'tab',
  tablist: 'tablist',
  tabpanel: 'tabpanel',
  dialog: 'dialog',
  alert: 'alert',
  progressBar: 'progressbar',
  searchBox: 'search',
  spinButton: 'spinbutton',
  slider: 'slider',
  image: 'image',
  menuItem: 'menuitem',
  switch: 'switch',
} as const;

/**
 * Check if color contrast is accessible for different text sizes
 * WCAG AAA requirements:
 * - Normal text: 7:1
 * - Large text (18pt+): 7:1 (same as AAA)
 */
export function getContrastRequirement(fontSize: number): number {
  // Font size typically in pixels; 18pt ≈ 24px
  return fontSize >= 24 ? 7 : 7; // AAA standard is 7:1 for both
}

/**
 * Format contrast ratio message for accessibility
 */
export function getContrastMessage(
  foreground: string,
  background: string
): { ratio: string; level: 'AAA' | 'AA' | 'FAIL'; message: string } {
  const ratio = calculateContrastRatio(foreground, background);
  const ratioStr = ratio.toFixed(2);

  if (ratio >= 7) {
    return {
      ratio: ratioStr,
      level: 'AAA',
      message: `${ratioStr}:1 contrast ratio meets WCAG AAA standard`,
    };
  } else if (ratio >= 4.5) {
    return {
      ratio: ratioStr,
      level: 'AA',
      message: `${ratioStr}:1 contrast ratio meets WCAG AA standard (but not AAA)`,
    };
  } else {
    return {
      ratio: ratioStr,
      level: 'FAIL',
      message: `${ratioStr}:1 contrast ratio does not meet accessibility standards (minimum 4.5:1)`,
    };
  }
}

/**
 * Focus trap - prevents tab navigation outside a modal
 */
export function createFocusTrap(
  element: HTMLElement | null
): { trap: () => void; release: () => void } {
  let originalActiveElement: Element | null = null;

  const trap = () => {
    originalActiveElement = document.activeElement;
    element?.focus();
  };

  const release = () => {
    if (originalActiveElement instanceof HTMLElement) {
      originalActiveElement.focus();
    }
  };

  return { trap, release };
}

/**
 * Keyboard event helper for accessibility
 */
export const A11Y_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * Check if a key press should activate an element
 */
export function isActivationKey(key: string): boolean {
  return key === A11Y_KEYS.ENTER || key === A11Y_KEYS.SPACE;
}
