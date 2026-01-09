/**
 * Optimized Message Card Component
 * Memoized to prevent re-renders in chat lists
 * 
 * BEFORE: All messages re-render when new message arrives
 * AFTER: Only new/changed messages re-render
 */

import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useAppPalette } from '../theme/usePalette';
import { memoWithComparison, useRenderPerformance } from '../utils/optimization';

import A11yPressable from './A11yPressable';

export type Message = {
  id: string;
  text: string;
  authorUid: string;
  createdAt: any;
  authorName?: string;
  isCurrentUser?: boolean;
};

interface MessageCardProps {
  message: Message;
  onPress?: () => void;
  compact?: boolean;
}

function MessageCardImpl({ message, onPress, compact = false }: MessageCardProps) {
  const palette = useAppPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);

  useRenderPerformance('MessageCard', 50);

  const formattedTime = useMemo(() => {
    try {
      const date = message.createdAt?.toDate?.() || new Date(message.createdAt);
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, [message.createdAt]);

  const messageContent = useMemo(() => {
    return message.text.substring(0, 200);
  }, [message.text]);

  return (
    <A11yPressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: message.isCurrentUser ? palette.primary : palette.card,
          marginLeft: message.isCurrentUser ? 60 : 0,
          marginRight: message.isCurrentUser ? 0 : 60,
        },
      ]}
      accessibilityLabel={`Message from ${message.authorName || 'user'}: ${messageContent}`}
    >
      {!compact && message.authorName && (
        <Text style={[styles.author, { color: message.isCurrentUser ? palette.onPrimary : palette.textSecondary }]}>
          {message.authorName}
        </Text>
      )}
      <Text style={[styles.text, { color: message.isCurrentUser ? palette.onPrimary : palette.text }]}>
        {messageContent}
      </Text>
      <Text style={[styles.time, { color: message.isCurrentUser ? palette.onPrimary + 'BB' : palette.textSecondary }]}>
        {formattedTime}
      </Text>
    </A11yPressable>
  );
}

export const MessageCard = memoWithComparison(MessageCardImpl, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.text === next.message.text &&
    prev.compact === next.compact
  );
});

const createStyles = (palette: ReturnType<typeof useAppPalette>) =>
  StyleSheet.create({
    container: {
      marginVertical: 4,
      marginHorizontal: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      maxWidth: '80%',
    },
    author: {
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 2,
    },
    text: {
      fontSize: 14,
      lineHeight: 19,
    },
    time: {
      fontSize: 10,
      marginTop: 4,
    },
  });
