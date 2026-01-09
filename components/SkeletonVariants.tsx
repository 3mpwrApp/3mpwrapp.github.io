import React from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import { useReduceMotionEnabled } from '../hooks/useA11y';
import { useAppPalette } from '../theme/usePalette';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Basic skeleton placeholder - fully customizable
 * @example <SkeletonVariant width={120} height={40} borderRadius={8} />
 */
export const SkeletonVariant: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const animatedValue = React.useRef(new Animated.Value(reduceMotion ? 0.5 : 0)).current;

  React.useEffect(() => {
    if (reduceMotion) {
      animatedValue.setValue(0.5);
      return;
    }

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
  }, [animatedValue, reduceMotion]);

  const opacity = reduceMotion ? 0.5 : animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: palette.muted,
          opacity,
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    />
  );
};

/**
 * Card skeleton - 120px height for list/grid items
 * @example <SkeletonCard style={{ marginBottom: 12 }} />
 */
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const animatedValue = React.useRef(new Animated.Value(reduceMotion ? 0.5 : 0)).current;

  React.useEffect(() => {
    if (reduceMotion) {
      animatedValue.setValue(0.5);
      return;
    }

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
  }, [animatedValue, reduceMotion]);

  const opacity = reduceMotion ? 0.5 : animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[
        {
          backgroundColor: palette.surface,
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
          height: 120,
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading card"
    >
      {/* Image placeholder */}
      <Animated.View
        style={{
          backgroundColor: palette.muted,
          opacity,
          height: 60,
          borderRadius: 8,
          marginBottom: 8,
        }}
      />
      {/* Title placeholder */}
      <Animated.View
        style={{
          backgroundColor: palette.muted,
          opacity,
          height: 16,
          borderRadius: 4,
          marginBottom: 6,
          width: '70%',
        }}
      />
      {/* Subtitle placeholder */}
      <Animated.View
        style={{
          backgroundColor: palette.muted,
          opacity,
          height: 12,
          borderRadius: 4,
          width: '40%',
        }}
      />
    </View>
  );
};

/**
 * Row skeleton - 50px height for list items
 * @example <SkeletonRow style={{ marginBottom: 8 }} />
 */
export const SkeletonRowVariant: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const animatedValue = React.useRef(new Animated.Value(reduceMotion ? 0.5 : 0)).current;

  React.useEffect(() => {
    if (reduceMotion) {
      animatedValue.setValue(0.5);
      return;
    }

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
  }, [animatedValue, reduceMotion]);

  const opacity = reduceMotion ? 0.5 : animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[
        {
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: palette.muted,
          height: 50,
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading item"
    >
      {/* Title placeholder */}
      <Animated.View
        style={{
          backgroundColor: palette.muted,
          opacity,
          height: 14,
          borderRadius: 4,
          marginBottom: 8,
          width: '60%',
        }}
      />
      {/* Subtitle placeholder */}
      <Animated.View
        style={{
          backgroundColor: palette.muted,
          opacity,
          height: 12,
          borderRadius: 4,
          width: '40%',
        }}
      />
    </View>
  );
};

/**
 * Text skeleton - variable height for paragraphs
 * @example <SkeletonText lines={3} lineHeight={18} />
 */
export const SkeletonText: React.FC<{
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: number | `${number}%`;
  style?: ViewStyle;
}> = ({
  lines = 3,
  lineHeight = 20,
  lastLineWidth = '70%',
  style,
}) => {
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const animatedValue = React.useRef(new Animated.Value(reduceMotion ? 0.5 : 0)).current;

  React.useEffect(() => {
    if (reduceMotion) {
      animatedValue.setValue(0.5);
      return;
    }

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
  }, [animatedValue, reduceMotion]);

  const opacity = reduceMotion ? 0.5 : animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[{ gap: 8 }, style]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading text"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Animated.View
          key={i}
          style={{
            backgroundColor: palette.muted,
            opacity,
            height: lineHeight,
            borderRadius: 4,
            width: i === lines - 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </View>
  );
};

/**
 * Button skeleton - 40px height
 * @example <SkeletonButton />
 */
export const SkeletonButton: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const animatedValue = React.useRef(new Animated.Value(reduceMotion ? 0.5 : 0)).current;

  React.useEffect(() => {
    if (reduceMotion) {
      animatedValue.setValue(0.5);
      return;
    }

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
  }, [animatedValue, reduceMotion]);

  const opacity = reduceMotion ? 0.5 : animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: palette.muted,
          opacity,
          height: 40,
          borderRadius: 8,
          width: '100%',
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Loading button"
    />
  );
};

/**
 * Avatar skeleton - circular, for user profiles
 * @example <SkeletonAvatar size={48} style={{ marginRight: 12 }} />
 */
export const SkeletonAvatar: React.FC<{
  size?: number;
  style?: ViewStyle;
}> = ({ size = 48, style }) => {
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const animatedValue = React.useRef(new Animated.Value(reduceMotion ? 0.5 : 0)).current;

  React.useEffect(() => {
    if (reduceMotion) {
      animatedValue.setValue(0.5);
      return;
    }

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
  }, [animatedValue, reduceMotion]);

  const opacity = reduceMotion ? 0.5 : animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: palette.muted,
          opacity,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading avatar"
    />
  );
};

/**
 * Heading skeleton - for section headers
 * @example <SkeletonHeading />
 */
export const SkeletonHeading: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const animatedValue = React.useRef(new Animated.Value(reduceMotion ? 0.5 : 0)).current;

  React.useEffect(() => {
    if (reduceMotion) {
      animatedValue.setValue(0.5);
      return;
    }

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
  }, [animatedValue, reduceMotion]);

  const opacity = reduceMotion ? 0.5 : animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: palette.muted,
          opacity,
          height: 24,
          borderRadius: 4,
          width: '50%',
          marginBottom: 12,
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading heading"
    />
  );
};
