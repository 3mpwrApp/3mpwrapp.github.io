/**
 * Optimized Notification Item Component
 * Memoized for notification list rendering
 */

import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppPalette } from '../theme/usePalette';
import { memoWithComparison, useRenderPerformance } from '../utils/optimization';

import A11yPressable from './A11yPressable';

interface NotificationItemProps {
  icon: string;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  onPress?: () => void;
  onDismiss?: () => void;
}

function NotificationItemImpl({
  icon,
  title,
  message,
  timestamp,
  isRead,
  onPress,
  onDismiss,
}: NotificationItemProps) {
  const palette = useAppPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);

  useRenderPerformance('NotificationItem', 50);

  const formattedTime = useMemo(() => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(timestamp).toLocaleDateString();
  }, [timestamp]);

  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  const handleDismiss = useCallback(
    (e: any) => {
      e.stopPropagation?.();
      onDismiss?.();
    },
    [onDismiss]
  );

  return (
    <A11yPressable
      onPress={handlePress}
      style={[
        styles.container,
        {
          backgroundColor: isRead ? palette.card : palette.primary + '11',
          borderLeftColor: isRead ? 'transparent' : palette.primary,
        },
      ]}
      accessibilityLabel={`${title}: ${message}`}
      accessibilityHint="Tap to view details"
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
        {!isRead && <View style={[styles.badge, { backgroundColor: palette.primary }]} />}
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: palette.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.message, { color: palette.textSecondary }]} numberOfLines={2}>
          {message}
        </Text>
        <Text style={[styles.time, { color: palette.textSecondary }]}>{formattedTime}</Text>
      </View>

      {onDismiss && (
        <A11yPressable
          onPress={handleDismiss}
          style={styles.dismissButton}
          accessibilityLabel="Dismiss notification"
          accessibilityRole="button"
        >
          <Text style={[styles.dismissIcon, { color: palette.textSecondary }]}>✕</Text>
        </A11yPressable>
      )}
    </A11yPressable>
  );
}

export const NotificationItem = memoWithComparison(NotificationItemImpl, (prev, next) => {
  return (
    prev.title === next.title &&
    prev.message === next.message &&
    prev.isRead === next.isRead &&
    prev.timestamp === next.timestamp
  );
});

const createStyles = (palette: ReturnType<typeof useAppPalette>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginHorizontal: 8,
      marginVertical: 4,
      borderRadius: 10,
      borderLeftWidth: 3,
    },
    iconContainer: {
      position: 'relative',
      marginRight: 12,
    },
    icon: {
      fontSize: 24,
    },
    badge: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      top: 0,
      right: 0,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    },
    message: {
      fontSize: 12,
      lineHeight: 16,
      marginBottom: 4,
    },
    time: {
      fontSize: 10,
    },
    dismissButton: {
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dismissIcon: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
