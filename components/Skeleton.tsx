import React from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import { useAppPalette } from '../theme/usePalette';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const palette = useAppPalette();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: palette.muted,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: number | `${number}%`;
  style?: ViewStyle;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lineHeight = 20,
  lastLineWidth = '60%',
  style,
}) => {
  return (
    <View style={style}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          style={index > 0 ? { marginTop: 8 } : undefined}
        />
      ))}
    </View>
  );
};

interface SkeletonCardProps {
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <Skeleton height={24} width="80%" style={{ marginBottom: 12 }} />
      <SkeletonText lines={2} />
    </View>
  );
};

interface SkeletonListProps {
  count?: number;
  style?: ViewStyle;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  style,
}) => {
  return (
    <View style={style}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} style={{ marginBottom: 16 }} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    // Styles defined in component
  },
  card: {
    padding: 16,
    borderRadius: 8,
  },
});