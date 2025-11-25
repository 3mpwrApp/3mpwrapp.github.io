import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from 'react-native';

import { useAppPalette } from '../theme/usePalette';
import { createShadow } from '../utils/shadow';

// Lazy load Haptics only on native platforms
let Haptics: any = null;
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch {
    // Haptics not available
  }
}

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
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  const [pressed, setPressed] = React.useState(false);

  const handlePress = async () => {
    setPressed(true);
    
    // Haptic feedback (vibration) for confirmation - native only
    if (Haptics && Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        // Haptics not available on all devices
      }
    }

    // Screen reader announcement
    AccessibilityInfo.announceForAccessibility(
      'Emergency exit activated. You are safe. Navigating to calm space.'
    );

    // Navigate to safe landing page immediately
    // Use replace to prevent back navigation
    router.replace('/safe-landing' as any);
  };

  return (
    <View 
      style={styles.container}
      style={{ pointerEvents: 'box-none' }} // Allow touches to pass through container
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
          accessibilityElementsHidden={true} 
        />
      </Pressable>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
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
      ...createShadow({
        shadowColor: palette.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }),
    },
  });
}
