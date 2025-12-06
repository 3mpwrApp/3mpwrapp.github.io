/**
 * Session Summary Component
 * 
 * Shows users what they did in their last session,
 * helping with continuity for those with memory challenges.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { HIT_SLOP_12 } from '../constants/A11Y';
import { useTranslation } from '../i18n';
import {
    formatRelativeTime,
    getSessionSummary,
    getTimeSinceLastSession,
    subscribe,
    type SessionSummaryEntry,
} from '../store/cognitiveComfort';
import { useAppPalette } from '../theme/usePalette';

interface SessionSummaryProps {
  autoShow?: boolean;
  minAwayMinutes?: number;
}

export function SessionSummary({ autoShow = true, minAwayMinutes = 30 }: SessionSummaryProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  
  const [isVisible, setIsVisible] = useState(false);
  const [summary, setSummary] = useState<SessionSummaryEntry[]>([]);
  const [timeSinceLastSession, setTimeSinceLastSession] = useState<{ minutes: number; hours: number; days: number } | null>(null);
  const [hasShownOnce, setHasShownOnce] = useState(false);
  
  // Check if we should auto-show
  useEffect(() => {
    if (!autoShow || hasShownOnce) return;
    
    const time = getTimeSinceLastSession();
    if (time) {
      const totalMinutes = time.days * 24 * 60 + time.hours * 60 + time.minutes;
      if (totalMinutes >= minAwayMinutes) {
        const entries = getSessionSummary();
        if (entries.length > 0) {
          setSummary(entries.slice(0, 10));
          setTimeSinceLastSession(time);
          setIsVisible(true);
          setHasShownOnce(true);
        }
      }
    }
  }, [autoShow, hasShownOnce, minAwayMinutes]);
  
  // Subscribe to summary changes
  useEffect(() => {
    return subscribe(() => {
      setSummary(getSessionSummary().slice(0, 10));
    });
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
  };
  
  const handleNavigateToScreen = (path: string) => {
    setIsVisible(false);
    router.push(path as any);
  };
  
  const formatTimeAway = () => {
    if (!timeSinceLastSession) return '';
    const { days, hours, minutes } = timeSinceLastSession;
    
    if (days > 0) {
      return t('cognitive.awayDays', '{{days}} day(s) ago', { days });
    }
    if (hours > 0) {
      return t('cognitive.awayHours', '{{hours}} hour(s) ago', { hours });
    }
    return t('cognitive.awayMinutes', '{{minutes}} minute(s) ago', { minutes });
  };
  
  const getActionIcon = (type: SessionSummaryEntry['type']): string => {
    switch (type) {
      case 'navigation': return 'navigate';
      case 'action': return 'checkmark-circle';
      case 'completion': return 'trophy';
      default: return 'ellipse';
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconBg, { backgroundColor: palette.primary + '20' }]}>
              <Ionicons name="time" size={28} color={palette.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: palette.text }]}>
                {t('cognitive.welcomeBack', 'Welcome Back!')}
              </Text>
              <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                {t('cognitive.lastHere', 'You were last here {{time}}', { time: formatTimeAway() })}
              </Text>
            </View>
            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close', 'Close')}
              hitSlop={HIT_SLOP_12}
            >
              <Ionicons name="close-circle" size={28} color={palette.muted} />
            </Pressable>
          </View>
          
          {/* Summary */}
          <View style={[styles.summarySection, { backgroundColor: palette.card }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              {t('cognitive.lastTimeYou', 'Last time you:')}
            </Text>
            
            <ScrollView style={styles.summaryList} showsVerticalScrollIndicator={false}>
              {summary.map((entry, index) => (
                <Pressable
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  key={`${entry.timestamp}-${index}`}
                  onPress={() => entry.path && handleNavigateToScreen(entry.path)}
                  disabled={!entry.path}
                  accessibilityRole={entry.path ? 'button' : 'text'}
                  style={styles.summaryItem}
                >
                  <View style={[styles.bullet, { backgroundColor: palette.primary }]}>
                    <Ionicons
                      name={getActionIcon(entry.type) as any}
                      size={12}
                      color={palette.onPrimary}
                    />
                  </View>
                  <View style={styles.summaryContent}>
                    <Text style={[styles.summaryText, { color: palette.text }]}>
                      {entry.description}
                    </Text>
                    <Text style={[styles.summaryTime, { color: palette.muted }]}>
                      {formatRelativeTime(entry.timestamp)}
                    </Text>
                  </View>
                  {entry.path && (
                    <Ionicons name="chevron-forward" size={16} color={palette.textSecondary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
          
          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel={t('cognitive.startFresh', 'Start fresh')}
              style={[styles.actionButton, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <Ionicons name="sparkles" size={20} color={palette.text} />
              <Text style={[styles.actionText, { color: palette.text }]}>
                {t('cognitive.startFresh', 'Start Fresh')}
              </Text>
            </Pressable>
            
            {summary.length > 0 && summary[0].path && (
              <Pressable
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => handleNavigateToScreen(summary[0].path!)}
                accessibilityRole="button"
                accessibilityLabel={t('cognitive.continueWhere', 'Continue where I left off')}
                style={[styles.actionButton, styles.primaryButton, { backgroundColor: palette.primary }]}
              >
                <Ionicons name="arrow-forward" size={20} color={palette.onPrimary} />
                <Text style={[styles.actionText, { color: palette.onPrimary }]}>
                  {t('cognitive.continueWhere', 'Continue')}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    shadowColor: undefined, // Handled by elevation on Android; iOS uses boxShadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  summarySection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryList: {
    maxHeight: 200,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  bullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  summaryTime: {
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  primaryButton: {
    borderWidth: 0,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SessionSummary;
