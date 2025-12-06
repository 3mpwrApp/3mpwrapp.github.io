/**
 * Where Was I? Component
 * 
 * A floating button/panel that shows recent navigation history,
 * allowing users with brain fog to quickly retrace their steps.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Animated,
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
    getRecentHistory,
    subscribe,
    type NavigationHistoryEntry,
} from '../store/cognitiveComfort';
import { useAppPalette } from '../theme/usePalette';
import { announce } from '../utils/announce';

interface WhereWasIProps {
  visible?: boolean;
  position?: 'bottom-left' | 'bottom-right';
  maxItems?: number;
}

const TAB_ICONS: Record<string, string> = {
  home: 'home',
  wellness: 'heart',
  community: 'people',
  resources: 'folder',
  advocacy: 'megaphone',
  settings: 'settings',
  campaigns: 'flag',
};

export function WhereWasI({ 
  visible = true, 
  position = 'bottom-left',
  maxItems = 5,
}: WhereWasIProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<NavigationHistoryEntry[]>([]);
  const [bounceAnim] = useState(new Animated.Value(1));
  
  // Subscribe to history changes
  useEffect(() => {
    const updateHistory = () => {
      setHistory(getRecentHistory(maxItems));
    };
    
    updateHistory();
    return subscribe(updateHistory);
  }, [maxItems]);
  
  // Bounce animation when history updates
  useEffect(() => {
    if (history.length > 0) {
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [history.length, bounceAnim]);
  
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    announce(t('cognitive.whereWasIOpened', 'Navigation history opened'));
  }, [t]);
  
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  const handleNavigate = useCallback((entry: NavigationHistoryEntry) => {
    setIsOpen(false);
    router.push(entry.path as any);
    announce(t('cognitive.navigatingTo', 'Navigating to {{screen}}', { screen: entry.screenName }));
  }, [router, t]);
  
  if (!visible || history.length === 0) return null;
  
  return (
    <>
      {/* Floating Button */}
      <Animated.View
        style={[
          styles.floatingButton,
          position === 'bottom-left' ? styles.bottomLeft : styles.bottomRight,
          { transform: [{ scale: bounceAnim }] },
        ]}
      >
        <Pressable
          onPress={handleOpen}
          accessibilityRole="button"
          accessibilityLabel={t('cognitive.whereWasI', 'Where was I? View recent pages')}
          accessibilityHint={t('cognitive.whereWasIHint', 'Opens a list of pages you recently visited')}
          hitSlop={HIT_SLOP_12}
          style={[styles.button, { backgroundColor: palette.primary }]}
        >
          <Ionicons name="footsteps" size={24} color={palette.onPrimary} />
          {history.length > 0 && (
            <View style={[styles.badge, { backgroundColor: palette.warning }]}>
              <Text style={[styles.badgeText, { color: palette.text }]}>{history.length}</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
      
      {/* History Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.backdrop} onPress={handleClose} />
          
          <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <Ionicons name="footsteps" size={24} color={palette.primary} />
                <Text style={[styles.modalTitle, { color: palette.text }]}>
                  {t('cognitive.whereWasITitle', 'Where Was I?')}
                </Text>
              </View>
              <Pressable
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel={t('common.close', 'Close')}
                hitSlop={HIT_SLOP_12}
              >
                <Ionicons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>
            
            <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
              {t('cognitive.whereWasISubtitle', 'Your recent pages — tap to go back')}
            </Text>
            
            <ScrollView style={styles.historyList}>
              {history.map((entry, index) => {
                const tabKey = entry.tabName?.toLowerCase() || entry.path.split('/')[1] || 'home';
                const iconName = TAB_ICONS[tabKey] || 'document';
                
                return (
                  <Pressable
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    key={`${entry.path}-${entry.timestamp}`}
                    onPress={() => handleNavigate(entry)}
                    accessibilityRole="button"
                    accessibilityLabel={`${entry.screenName}, ${formatRelativeTime(entry.timestamp)}`}
                    style={[
                      styles.historyItem,
                      { backgroundColor: palette.card, borderColor: palette.border },
                      index === 0 && styles.firstItem,
                    ]}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: palette.primary + '20' }]}>
                      <Ionicons name={iconName as any} size={20} color={palette.primary} />
                    </View>
                    
                    <View style={styles.itemContent}>
                      <Text style={[styles.screenName, { color: palette.text }]} numberOfLines={1}>
                        {entry.screenName}
                      </Text>
                      <Text style={[styles.timestamp, { color: palette.textSecondary }]}>
                        {formatRelativeTime(entry.timestamp)}
                      </Text>
                      {entry.action && (
                        <Text style={[styles.action, { color: palette.muted }]} numberOfLines={1}>
                          {entry.action}
                        </Text>
                      )}
                    </View>
                    
                    <Ionicons name="chevron-forward" size={16} color={palette.textSecondary} />
                  </Pressable>
                );
              })}
            </ScrollView>
            
            {history.length >= maxItems && (
              <Text style={[styles.moreNote, { color: palette.muted }]}>
                {t('cognitive.showingRecent', 'Showing {{count}} most recent', { count: maxItems })}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    zIndex: 1000,
  },
  bottomLeft: {
    left: 16,
    bottom: 100,
  },
  bottomRight: {
    right: 16,
    bottom: 100,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: undefined, // Handled by elevation on Android; iOS uses boxShadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  historyList: {
    maxHeight: 400,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  firstItem: {
    borderWidth: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  screenName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  action: {
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  moreNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default WhereWasI;
