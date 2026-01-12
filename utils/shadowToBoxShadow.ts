/**
 * Convert React Native shadow properties to CSS boxShadow for web
 * Addresses deprecation warning: "shadow*" style props are deprecated. Use "boxShadow".
 */

import type { ViewStyle } from 'react-native';
import { Platform } from 'react-native';

export interface ShadowProps {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

/**
 * Create cross-platform shadow styles
 * On web: Uses boxShadow
 * On native: Uses shadowColor, shadowOffset, shadowOpacity, shadowRadius
 */
export function createShadow(props: ShadowProps): ViewStyle {
  if (Platform.OS === 'web') {
    const {
      shadowColor = '#000',
      shadowOffset = { width: 0, height: 2 },
      shadowOpacity = 0.25,
      shadowRadius = 3.84,
    } = props;

    // Convert to CSS boxShadow
    const offsetX = shadowOffset.width;
    const offsetY = shadowOffset.height;
    const blur = shadowRadius;
    const spread = 0; // React Native doesn't have spread
    
    // Convert shadowColor to rgba with opacity
    const alpha = shadowOpacity;
    let color = shadowColor;
    
    // Parse hex color and add alpha
    if (shadowColor.startsWith('#')) {
      const hex = shadowColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else {
      // Assume it's already rgba or rgb
      color = shadowColor.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }

    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`,
    } as ViewStyle;
  }

  // On native platforms, use native shadow properties
  return {
    shadowColor: props.shadowColor,
    shadowOffset: props.shadowOffset,
    shadowOpacity: props.shadowOpacity,
    shadowRadius: props.shadowRadius,
    elevation: props.elevation, // Android elevation
  };
}

/**
 * Common shadow presets for consistency
 */
export const shadows = {
  none: createShadow({}),
  
  sm: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  }),
  
  md: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }),
  
  lg: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  }),
  
  xl: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  }),
};
