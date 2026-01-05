/**
 * Celebration Toast Component
 * 
 * Beautiful animated toast for celebrating user achievements
 * with confetti effect and haptic feedback.
 * 
 * Accessibility Features:
 * - Respects user's reduce-motion preference
 * - Announcement before auto-dismiss (3 seconds remaining)
 * - Pauses on app focus loss
 * - Haptic feedback for non-visual awareness
 */

import { useCallback, useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Modal, StyleSheet, Text, View } from 'react-native';

import { MAX_FONT_SCALE } from '../constants/A11Y';
import { useReduceMotionEnabled } from '../hooks/useA11y';
import { useModalTimer } from '../hooks/useModalTimer';
import type { Celebration } from '../services/celebrations';
import { celebrateWithHaptics } from '../services/celebrations';
import { useAppPalette } from '../theme/usePalette';
import { logger } from '../utils/logger';
import { createShadow } from '../utils/shadow';

const { width, height } = Dimensions.get('window');

interface CelebrationToastProps {
  celebration: Celebration | null;
  onDismiss: () => void;
  duration?: number;
}

async function announceForAccessibility(message: string): Promise<void> {
  if (typeof AccessibilityInfo?.announceForAccessibility === 'function') {
    try {
      await AccessibilityInfo.announceForAccessibility(message);
    } catch (error) {
      logger.warn('CelebrationToast', 'Failed to announce', error);
    }
  }
}

export default function CelebrationToast({ 
  celebration, 
  onDismiss,
  duration = 5000  // Increased to 5s to match modal timing standard
}: CelebrationToastProps) {
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const slideAnim = useRef(new Animated.Value(reduceMotion ? 0 : -100)).current;
  const fadeAnim = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(reduceMotion ? 1 : 0.8)).current;
  
  const { startTimer, cancelTimer } = useModalTimer({
    duration,
    onDismiss,
    announceBeforeDismiss: true,
    announceAtSeconds: 3,
    onAccessibilityDismiss: (action) => {
      if (action === 'auto') {
        logger.info('CelebrationToast', 'Modal auto-dismissed after timeout');
      }
    },
  });
  
  useEffect(() => {
    if (celebration) {
      // Trigger haptic feedback
      celebrateWithHaptics();
      
      // Skip animations if reduce motion is enabled
      if (reduceMotion) {
        // Show content immediately
        slideAnim.setValue(0);
        fadeAnim.setValue(1);
        scaleAnim.setValue(1);
        
        // Announce to accessibility users
        announceForAccessibility(`${celebration.title}. ${celebration.message}`);
        
        // Start timer
        startTimer();
        return () => cancelTimer();
      }
      
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 7,
        }),
      ]).start(() => {
        // Announce after animation completes
        announceForAccessibility(`${celebration.title}. ${celebration.message}`);
        
        // Start timer after animation
        startTimer();
      });
      
      return () => cancelTimer();
    }
    return undefined;
  }, [celebration, reduceMotion, startTimer, cancelTimer]);
  
  
  const dismissAnimation = useCallback(() => {
    cancelTimer();
    
    if (reduceMotion) {
      onDismiss();
      return;
    }
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [cancelTimer, reduceMotion, onDismiss, slideAnim, fadeAnim]);
  
  if (!celebration) return null;
  
  // Determine background color based on type - using palette tokens
  const getBgColor = () => {
    switch (celebration.type) {
      case 'streak':
        return palette.warning || palette.primary; // Orange/warning theme
      case 'first-time':
        return palette.info || palette.primary; // Teal/info theme
      case 'milestone':
        return palette.success || palette.primary; // Gold/success theme
      case 'level-up':
        return palette.secondary || palette.primary; // Purple/secondary theme
      case 'community':
        return palette.primary; // Blue/primary theme
      default:
        return palette.primary;
    }
  };
  
  return (
    <Modal
      transparent
      visible={true}
      animationType="none"
      onRequestClose={dismissAnimation}
    >
      <View style={styles.overlay}>
        {/* Confetti particles - skip if reduce motion is enabled */}
        <ConfettiEffect show={!reduceMotion} />
        
        {/* Toast card */}
        <Animated.View
          style={[
            styles.toast,
            {
              backgroundColor: getBgColor(),
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
              opacity: fadeAnim,
            },
          ]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.icon} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {celebration.icon}
          </Text>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: palette.onPrimary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {celebration.title}
            </Text>
            <Text style={[styles.message, { color: palette.onPrimary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {celebration.message}
            </Text>
            {celebration.points && (
              <Text style={[styles.points, { color: palette.onPrimary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                +{celebration.points} points
              </Text>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Confetti effect component
 */
function ConfettiEffect({ show }: { show: boolean }) {
  const palette = useAppPalette();
  // Use palette colors for confetti
  const colors = [
    palette.warning || palette.primary,
    palette.info || palette.primary,
    palette.success || palette.primary,
    palette.secondary || palette.primary,
    palette.primary
  ];
  
  const confetti = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 500,
  }));
  
  if (!show) return null;
  
  return (
    <View style={[styles.confettiContainer, { pointerEvents: 'none' }]}>
      {confetti.map(item => (
        <ConfettiPiece key={item.id} {...item} />
      ))}
    </View>
  );
}

/**
 * Individual confetti piece
 */
function ConfettiPiece({ x, color, delay }: { x: number; color: string; delay: number }) {
  const reduceMotion = useReduceMotionEnabled();
  const fallAnim = useRef(new Animated.Value(reduceMotion ? height : 0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Skip animations if reduce motion is enabled
    if (reduceMotion) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fallAnim, {
          toValue: height,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ),
      ]).start();
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [reduceMotion]);
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          backgroundColor: color,
          left: x,
          transform: [
            { translateY: fallAnim },
            { rotate },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    ...createShadow({
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }),
    maxWidth: width - 40,
  },
  icon: {
    fontSize: 48,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    opacity: 0.95,
  },
  points: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.9,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  confettiPiece: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
