import React from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { useAppPalette } from '../theme/usePalette';

import { Skeleton, SkeletonList, SkeletonText } from './Skeleton';

interface LoadingWrapperProps {
  isLoading: boolean;
  skeletonType?: 'text' | 'card' | 'list' | 'custom';
  skeletonCount?: number;
  children: React.ReactNode;
  style?: ViewStyle;
  fallback?: React.ReactNode;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  skeletonType = 'text',
  skeletonCount = 3,
  children,
  style,
  fallback,
}) => {
  const palette = useAppPalette();

  if (!isLoading) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const renderSkeleton = () => {
    switch (skeletonType) {
      case 'text':
        return <SkeletonText lines={skeletonCount} />;
      case 'card':
        return <Skeleton height={120} borderRadius={8} />;
      case 'list':
        return <SkeletonList count={skeletonCount} />;
      case 'custom':
        return null; // Custom skeleton should be provided via fallback
      default:
        return <SkeletonText lines={skeletonCount} />;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderSkeleton()}
    </View>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  children,
  style,
}) => {
  const palette = useAppPalette();

  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <View style={styles.overlayContainer}>
      {children}
      <View style={[styles.overlay, { backgroundColor: palette.background }, style]}>
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayContainer: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
});