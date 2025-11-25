/**
 * Shadow utility for cross-platform shadow styling
 * Converts React Native shadow props to web-compatible boxShadow
 */

import type { ViewStyle } from 'react-native';
import { Platform } from 'react-native';

export interface ShadowConfig {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

/**
 * Creates cross-platform shadow styles
 * On web: uses boxShadow
 * On native: uses shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation
 */
export function createShadow(config: ShadowConfig): ViewStyle {
  const {
    shadowColor = '#000',
    shadowOffset = { width: 0, height: 2 },
    shadowOpacity = 0.1,
    shadowRadius = 4,
    elevation = 2,
  } = config;

  if (Platform.OS === 'web') {
    // Convert to CSS boxShadow
    const offsetX = shadowOffset.width;
    const offsetY = shadowOffset.height;
    const blur = shadowRadius;
    
    // Convert shadowColor with opacity to rgba if needed
    const alpha = shadowOpacity;
    const color = shadowColor.startsWith('#') 
      ? hexToRgba(shadowColor, alpha)
      : `rgba(0, 0, 0, ${alpha})`;
    
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${color}`,
    } as any;
  }

  // Native platforms
  return {
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    elevation,
  };
}

/**
 * Convert hex color to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Common shadow presets
 */
export const shadows = {
  sm: createShadow({
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  }),
  md: createShadow({
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }),
  lg: createShadow({
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  }),
  xl: createShadow({
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  }),
};
