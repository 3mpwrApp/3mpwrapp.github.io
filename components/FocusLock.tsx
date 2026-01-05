/**
 * Focus Lock Component
 * 
 * Prevents accidental navigation away from the current screen.
 * Helps users who get distracted stay on task.
 */

import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Animated,
    Pressable,
    StyleSheet,
    Text
} from 'react-native';

import { HIT_SLOP_12 } from '../constants/A11Y';
import { useReduceMotionEnabled } from '../hooks/useA11y';
import { useTranslation } from '../i18n';
import {
    getFocusLock,
    getPreferences,
    setFocusLock,
    subscribe
} from '../store/cognitiveComfort';
import { useAppPalette } from '../theme/usePalette';
import { announce } from '../utils/announce';

export interface FocusLockProps {
  visible?: boolean;
}

export default function FocusLock({ visible = true }: FocusLockProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const pathname = usePathname();
  
  // Get readable screen name from path
  const screenName = useMemo(() => {
    if (!pathname || pathname === '/') return 'Home';
    return pathname
      .replace(/^\/(tabs)?\//, '')
      .replace(/[/()-]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim() || 'Home';
  }, [pathname]);
  
  const [isLocked, setIsLocked] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const prefs = getPreferences();
  
  // Check if this screen is locked
  useEffect(() => {
    const checkLock = () => {
      const locked = getFocusLock() === pathname;
      setIsLocked(locked);
    };
    
    checkLock();
    return subscribe(checkLock);
  }, [pathname]);
  
  // Pulse animation when locked
  useEffect(() => {
    if (isLocked) {
      if (!reduceMotion) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          ])
        ).start();
      } else {
        // Snap to base scale without animation for users with motion sensitivity
        pulseAnim.setValue(1);
      }
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLocked, pulseAnim, reduceMotion]);
  
  const handleToggleLock = useCallback(async () => {
    if (isLocked) {
      if (prefs.focusLockConfirmExit) {
        Alert.alert(
          t('cognitive.unlockFocusTitle', 'Unlock Focus?'),
          t('cognitive.unlockFocusMessage', 'You\'ve been focusing on "{{screen}}". Are you ready to move on?', { screen: screenName }),
          [
            {
              text: t('cognitive.keepFocused', 'Stay Focused'),
              style: 'cancel',
            },
            {
              text: t('cognitive.unlockNow', 'Unlock'),
              onPress: async () => {
                await setFocusLock(null);
                setIsLocked(false);
                announce(t('cognitive.focusUnlocked', 'Focus lock disabled'));
              },
            },
          ]
        );
      } else {
        await setFocusLock(null);
        setIsLocked(false);
        announce(t('cognitive.focusUnlocked', 'Focus lock disabled'));
      }
    } else {
      await setFocusLock(pathname);
      setIsLocked(true);
      announce(t('cognitive.focusLocked', 'Focus lock enabled for {{screen}}', { screen: screenName }));
      
      Alert.alert(
        t('cognitive.focusLockedTitle', 'Focus Lock Enabled'),
        t('cognitive.focusLockedMessage', 'You\'ll be reminded to stay on this screen. When you\'re done, tap the lock to unlock.'),
        [{ text: t('common.ok', 'OK') }]
      );
    }
  }, [isLocked, prefs.focusLockConfirmExit, screenName, pathname, t]);
  
  if (!visible || !prefs.focusLockEnabled) return null;
  
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <Pressable
        onPress={handleToggleLock}
        accessibilityRole="button"
        accessibilityLabel={
          isLocked
            ? t('cognitive.focusLockOn', 'Focus lock is on. Tap to unlock.')
            : t('cognitive.focusLockOff', 'Focus lock is off. Tap to lock and stay focused.')
        }
        accessibilityState={{ selected: isLocked }}
        hitSlop={HIT_SLOP_12}
        style={[
          styles.button,
          { 
            backgroundColor: isLocked ? palette.warning : palette.card,
            borderColor: isLocked ? palette.warning : palette.border,
          },
        ]}
      >
        <Ionicons 
          name={isLocked ? 'lock-closed' : 'lock-open-outline'} 
          size={18} 
          color={palette.text} 
        />
        <Text 
          style={[
            styles.label, 
            { color: palette.text }
          ]}
        >
          {isLocked 
            ? t('cognitive.focused', 'Focused') 
            : t('cognitive.lockFocus', 'Lock Focus')
          }
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Hook to check if navigation should be blocked by focus lock
 */
export function useFocusLockGuard() {
  const { t } = useTranslation();
  
  const shouldBlockNavigation = useCallback((targetPath: string): boolean => {
    const lockedPath = getFocusLock();
    if (!lockedPath) return false;
    
    // Allow navigation within the same screen/section
    if (targetPath.startsWith(lockedPath)) return false;
    
    return true;
  }, []);
  
  const showBlockedAlert = useCallback(() => {
    const prefs = getPreferences();
    
    if (!prefs.focusLockConfirmExit) return false;
    
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        t('cognitive.focusLockActiveTitle', 'Focus Lock Active'),
        t('cognitive.focusLockActiveMessage', 'You have focus lock enabled. Are you sure you want to navigate away?'),
        [
          {
            text: t('cognitive.stayHere', 'Stay Here'),
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: t('cognitive.leaveAnyway', 'Leave Anyway'),
            style: 'destructive',
            onPress: async () => {
              await setFocusLock(null);
              resolve(true);
            },
          },
        ]
      );
    });
  }, [t]);
  
  return { shouldBlockNavigation, showBlockedAlert };
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
