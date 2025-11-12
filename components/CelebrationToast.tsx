/**
 * Celebration Toast Component
 * 
 * Beautiful animated toast for celebrating user achievements
 * with confetti effect and haptic feedback
 */

import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, View } from 'react-native';

import { MAX_FONT_SCALE } from '../constants/A11Y';
import type { Celebration } from '../services/celebrations';
import { celebrateWithHaptics } from '../services/celebrations';
import { useAppPalette } from '../theme/usePalette';

const { width, height } = Dimensions.get('window');

interface CelebrationToastProps {
  celebration: Celebration | null;
  onDismiss: () => void;
  duration?: number;
}

export default function CelebrationToast({ 
  celebration, 
  onDismiss,
  duration = 3000 
}: CelebrationToastProps) {
  const palette = useAppPalette();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    if (celebration) {
      // Trigger haptic feedback
      celebrateWithHaptics();
      
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
      ]).start();
      
      // Auto dismiss after duration
      const timer = setTimeout(() => {
        dismissAnimation();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [celebration]);
  
  const dismissAnimation = () => {
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
  };
  
  if (!celebration) return null;
  
  // Determine background color based on type
  const getBgColor = () => {
    switch (celebration.type) {
      case 'streak':
        return '#FF6B35'; // Orange
      case 'first-time':
        return '#4ECDC4'; // Teal
      case 'milestone':
        return '#FFD23F'; // Gold
      case 'level-up':
        return '#9B59B6'; // Purple
      case 'community':
        return '#3498DB'; // Blue
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
        {/* Confetti particles */}
        <ConfettiEffect show={true} />
        
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
            <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {celebration.title}
            </Text>
            <Text style={styles.message} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {celebration.message}
            </Text>
            {celebration.points && (
              <Text style={styles.points} maxFontSizeMultiplier={MAX_FONT_SCALE}>
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
  const confetti = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    color: ['#FF6B35', '#4ECDC4', '#FFD23F', '#9B59B6', '#3498DB'][Math.floor(Math.random() * 5)],
    delay: Math.random() * 500,
  }));
  
  if (!show) return null;
  
  return (
    <View style={styles.confettiContainer} pointerEvents="none">
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
  const fallAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    setTimeout(() => {
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
  }, []);
  
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.95,
  },
  points: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
