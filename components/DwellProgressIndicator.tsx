import { StyleSheet, View } from 'react-native';

import { useAppPalette } from '../theme/usePalette';

interface DwellProgressIndicatorProps {
  progress: number; // 0-100
  size?: number;
}

/**
 * Circular progress indicator for dwell-click.
 * Shows visual feedback as user holds press.
 */
export function DwellProgressIndicator({ progress, size = 40 }: DwellProgressIndicatorProps) {
  const palette = useAppPalette();
  // For future SVG implementation with proper arc drawing:
  // const radius = size / 2 - 4;
  // const circumference = 2 * Math.PI * radius;
  // const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size,
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: -size / 2,
          marginLeft: -size / 2,
          pointerEvents: 'none',
        }
      ]}
      accessibilityElementsHidden={true}
      collapsable={false}
    >
      {/* Background circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 3,
            borderColor: palette.muted,
          },
        ]}
      />
      {/* Progress circle (overlay) */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 3,
            borderColor: palette.primary,
            // Simple approximation - for production, use SVG or react-native-svg
            opacity: progress / 100,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderStyle: 'solid',
  },
});
