import { StyleSheet, View } from 'react-native';

import { useThemeColor } from '../hooks/useThemeColor';

interface SkeletonLoaderProps {
  lines?: number;
  lineHeight?: number;
  _width?: string | number;
  _height?: number;
  style?: any;
}

export default function SkeletonLoader({
  lines = 3,
  lineHeight = 16,
  _width = '100%',
  _height = 200,
  style,
}: SkeletonLoaderProps) {
  const textColor = useThemeColor({}, 'text');
  const skeletonColor = `${textColor}15`; // 15% opacity

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content skeleton"
      accessibilityLiveRegion="polite"
    >
      {Array.from({ length: lines }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.skeletonLine,
            {
              backgroundColor: skeletonColor,
              height: lineHeight,
              width: index === lines - 1 ? '70%' : '100%',
              marginBottom: index < lines - 1 ? 8 : 0,
            },
          ]}
        />
      ))}
    </View>
  );
}

export function CardSkeletonLoader({
  style,
}: {
  style?: any;
}) {
  const textColor = useThemeColor({}, 'text');
  const skeletonColor = `${textColor}15`;
  const borderColor = `${textColor}10`;

  return (
    <View
      style={[
        styles.card,
        {
          borderColor,
          backgroundColor: skeletonColor,
        },
        style,
      ]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading card skeleton"
    >
      <View
        style={[
          styles.skeletonLine,
          {
            backgroundColor: skeletonColor,
            height: 20,
            width: '60%',
            marginBottom: 8,
          },
        ]}
      />
      <View
        style={[
          styles.skeletonLine,
          {
            backgroundColor: skeletonColor,
            height: 16,
            marginBottom: 8,
          },
        ]}
      />
      <View
        style={[
          styles.skeletonLine,
          {
            backgroundColor: skeletonColor,
            height: 16,
            width: '80%',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  skeletonLine: {
    borderRadius: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
});
