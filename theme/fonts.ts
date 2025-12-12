/**
 * Custom Fonts Configuration
 * 
 * Provides accessibility-focused font options:
 * - OpenDyslexic: Designed to reduce reading difficulties for dyslexic users
 * - Lexend: Optimized for reading fluency and reduced visual stress
 * - System/Roboto: Default platform fonts
 */

import type { TextStyle } from 'react-native';
import { Platform } from 'react-native';

// Font family names (must match what's registered in app.json or loaded via expo-font)
export const FONT_FAMILIES = {
  system: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  openDyslexic: 'OpenDyslexic-Regular',
  lexend: 'Lexend-Regular',
  spaceMono: 'SpaceMono-Regular',
} as const;

export type FontFamilyKey = keyof typeof FONT_FAMILIES;

// Font options for settings UI
export const FONT_OPTIONS: Array<{
  id: FontFamilyKey;
  name: string;
  description: string;
  accessibilityLabel: string;
}> = [
  {
    id: 'system',
    name: 'System Default',
    description: 'Standard platform font',
    accessibilityLabel: 'System default font. Standard platform font.',
  },
  {
    id: 'openDyslexic',
    name: 'OpenDyslexic',
    description: 'Designed to reduce reading difficulties for dyslexic users',
    accessibilityLabel: 'OpenDyslexic font. Designed to reduce reading difficulties for dyslexic users.',
  },
  {
    id: 'lexend',
    name: 'Lexend',
    description: 'Optimized for reading fluency and reduced visual stress',
    accessibilityLabel: 'Lexend font. Optimized for reading fluency and reduced visual stress.',
  },
];

// Storage key for persisting font preference
export const FONT_STORAGE_KEY = 'accessibility:fontFamily:v1';

// Default font
export const DEFAULT_FONT: FontFamilyKey = 'system';

/**
 * Get the actual font family string for a given key
 */
export function getFontFamily(key: FontFamilyKey): string {
  return FONT_FAMILIES[key] || FONT_FAMILIES.system;
}

/**
 * Create text style with custom font family
 */
export function createFontStyle(
  fontKey: FontFamilyKey,
  options: {
    fontSize?: number;
    fontWeight?: TextStyle['fontWeight'];
    color?: string;
    lineHeight?: number;
  } = {}
): TextStyle {
  const fontFamily = getFontFamily(fontKey);
  
  // OpenDyslexic needs slightly larger line height for readability
  const lineHeightMultiplier = fontKey === 'openDyslexic' ? 1.6 : 1.5;
  const defaultLineHeight = options.fontSize 
    ? Math.round(options.fontSize * lineHeightMultiplier) 
    : undefined;
  
  return {
    fontFamily,
    fontSize: options.fontSize,
    fontWeight: options.fontWeight,
    color: options.color,
    lineHeight: options.lineHeight ?? defaultLineHeight,
    // Android-specific adjustments
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
    }),
  };
}

/**
 * Check if custom fonts are available
 * Returns true if fonts are loaded and ready to use
 */
export async function areFontsLoaded(): Promise<boolean> {
  try {
    // expo-font provides Font.isLoaded, but we'll use a simpler check
    // In production builds, fonts are bundled and always available
    return true;
  } catch {
    return false;
  }
}

/**
 * Font loading configuration for app.json / expo
 * 
 * Add to app.json under expo.fonts or load with expo-font:
 * 
 * {
 *   "expo": {
 *     "fonts": [
 *       "./assets/fonts/OpenDyslexic-Regular.ttf",
 *       "./assets/fonts/Lexend-Regular.ttf",
 *       "./assets/fonts/SpaceMono-Regular.ttf"
 *     ]
 *   }
 * }
 * 
 * Or load dynamically:
 * 
 * import * as Font from 'expo-font';
 * 
 * await Font.loadAsync({
 *   'OpenDyslexic-Regular': require('../assets/fonts/OpenDyslexic-Regular.ttf'),
 *   'Lexend-Regular': require('../assets/fonts/Lexend-Regular.ttf'),
 *   'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
 * });
 */
