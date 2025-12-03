import { useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { Animated, StyleSheet, View } from 'react-native';

import { useReduceMotionEnabled } from '../hooks/useA11y';
import { useAppPalette } from '../theme/usePalette';

interface SkeletonLoaderProps {
  lines?: number;
  lineHeight?: number;
  style?: ViewStyle;
}

export default function SkeletonLoader({
  lines = 3,
  lineHeight = 16,
  style,
}: SkeletonLoaderProps) {
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const shimmerAnim = useRef(new Animated.Value(reduceMotion ? 0.5 : 0)).current;

  useEffect(() => {
    // Skip animation if reduce motion is enabled
    if (reduceMotion) {
      shimmerAnim.setValue(0.5);
      return;
    }
    
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim, reduceMotion]);

  const opacity = reduceMotion ? 0.5 : shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
      accessibilityLiveRegion="polite"
    >
      {Array.from({ length: lines }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.skeletonLine,
            {
              backgroundColor: palette.surfaceVariant || palette.surface,
              opacity,
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

export function CardSkeletonLoader({ style }: { style?: ViewStyle }) {
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const shimmerAnim = useRef(new Animated.Value(reduceMotion ? 0.5 : 0)).current;

  useEffect(() => {
    // Skip animation if reduce motion is enabled
    if (reduceMotion) {
      shimmerAnim.setValue(0.5);
      return;
    }
    
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim, reduceMotion]);

  const opacity = reduceMotion ? 0.5 : shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface },
        style,
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading card"
    >
      <Animated.View
        style={[
          styles.skeletonLine,
          {
            backgroundColor: palette.surfaceVariant || palette.surface,
            opacity,
            height: 20,
            width: '60%',
            marginBottom: 8,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonLine,
          {
            backgroundColor: palette.surfaceVariant || palette.surface,
            opacity,
            height: 16,
            marginBottom: 8,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonLine,
          {
            backgroundColor: palette.surfaceVariant || palette.surface,
            opacity,
            height: 16,
            width: '80%',
          },
        ]}
      />
    </View>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeletonLoader key={index} />
      ))}
    </>
  );
}

export function SkeletonGrid({ columns = 2, count = 6 }: { columns?: number; count?: number }) {
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const shimmerAnim = useRef(new Animated.Value(reduceMotion ? 0.5 : 0)).current;

  useEffect(() => {
    // Skip animation if reduce motion is enabled
    if (reduceMotion) {
      shimmerAnim.setValue(0.5);
      return;
    }
    
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim, reduceMotion]);

  const opacity = reduceMotion ? 0.5 : shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.gridItem, { width: `${100 / columns - 2}%` }]}>
          <Animated.View
            style={[
              styles.gridImage,
              {
                backgroundColor: palette.surfaceVariant || palette.surface,
                opacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonLine,
              {
                backgroundColor: palette.surfaceVariant || palette.surface,
                opacity,
                height: 12,
                width: '80%',
                marginTop: 8,
              },
            ]}
          />
        </View>
      ))}
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 12,
  },
  gridItem: {
    marginBottom: 12,
  },
  gridImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
});
