import React from 'react';
import { Pressable, StyleSheet, View, AccessibilityInfo } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppPalette } from '../theme/usePalette';
import * as Haptics from 'expo-haptics';

/**
 * PanicButton - Trauma-informed emergency exit
 * 
 * Always visible floating button that immediately navigates to a calming
 * safe landing page when user is overwhelmed. No questions asked.
 * 
 * Accessibility: Screen reader announces "Emergency exit activated. You are safe."
 * Privacy: Does not log usage for user privacy
 */
export function PanicButton() {
  const router = useRouter();
  const palette = useAppPalette();
  const [pressed, setPressed] = React.useState(false);

  const handlePress = async () => {
    setPressed(true);
    
    // Haptic feedback (vibration) for confirmation
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (e) {
      // Haptics not available on all devices
    }

    // Screen reader announcement
    AccessibilityInfo.announceForAccessibility(
      'Emergency exit activated. You are safe. Navigating to calm space.'
    );

    // Navigate to safe landing page immediately
    // Use replace to prevent back navigation
    router.replace('/safe-landing');
  };

  return (
    <View 
      style={styles.container}
      pointerEvents="box-none" // Allow touches to pass through container
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Emergency exit - Safe word"
        accessibilityHint="Tap to immediately exit to a calm, safe space"
        style={[
          styles.button,
          { backgroundColor: pressed ? palette.error : palette.primary },
        ]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons 
          name="exit-outline" 
          size={28} 
          color={palette.onPrimary}
          accessibilityElementsHidden 
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 9999,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8, // Android shadow
  },
});
