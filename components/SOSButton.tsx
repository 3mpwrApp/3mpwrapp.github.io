/**
 * Global SOS/Crisis Button
 * Always visible emergency access to crisis resources
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppPalette } from '../theme/usePalette';
import { createShadow } from '../utils/shadow';

interface SOSButtonProps {
  position?: 'top-right' | 'bottom-right' | 'bottom-left';
  compact?: boolean; // Show just icon vs icon + text
}

export default function SOSButton({ position = 'bottom-right', compact = false }: SOSButtonProps) {
  const palette = useAppPalette();
  const router = useRouter();
  const [tapCount, setTapCount] = useState(0);
  const [tapTimeout, setTapTimeoutState] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = () => {
    // Single tap: Show crisis menu
    showCrisisMenu();
  };

  const handleTripleTap = () => {
    // Triple tap detection (within 2 seconds)
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (tapTimeout) clearTimeout(tapTimeout);

    if (newCount >= 3) {
      // Triple tap triggered - emergency contact
      triggerEmergencyContact();
      setTapCount(0);
      return;
    }

    const timeout = setTimeout(() => {
      setTapCount(0);
    }, 2000);
    setTapTimeoutState(timeout);
  };

  const showCrisisMenu = () => {
    Alert.alert(
      '🆘 Crisis Support',
      'Choose immediate support:',
      [
        {
          text: '📞 Call 988 (Suicide & Crisis)',
          onPress: () => Linking.openURL('tel:988'),
        },
        {
          text: '💬 Crisis Text Line',
          onPress: () => Linking.openURL('sms:741741&body=HOME'),
        },
        {
          text: '🧘 Safe Landing (Breathing)',
          onPress: () => router.push('/safe-landing'),
        },
        {
          text: '🛟 Emotional First Aid',
          onPress: () => router.push('/(tabs)/wellness/emotional-first-aid'),
        },
        {
          text: '⚡ Quick Exit',
          onPress: () => {
            // Quick escape to innocuous screen
            Linking.openURL('https://weather.com').catch(() => {});
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const triggerEmergencyContact = async () => {
    Alert.alert(
      '🚨 Emergency Protocol',
      'Triple-tap detected. This would send emergency SMS to your crisis contacts with location.\n\nTo set up emergency contacts: Settings → Crisis Contacts',
      [
        {
          text: 'Go to Settings',
          onPress: () => router.push('/(tabs)/settings'),
        },
        {
          text: 'Show Crisis Resources',
          onPress: showCrisisMenu,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      ...(position === 'top-right' && { top: 60, right: 16 }),
      ...(position === 'bottom-right' && { bottom: 24, right: 16 }),
      ...(position === 'bottom-left' && { bottom: 24, left: 16 }),
      zIndex: 9999,
      elevation: 10,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: palette.error, // Crimson red for emergency visibility
      paddingVertical: compact ? 12 : 14,
      paddingHorizontal: compact ? 12 : 16,
      borderRadius: 50,
      ...createShadow({
        shadowColor: palette.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
      }),
    },
    buttonText: {
      color: palette.onPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    hint: {
      position: 'absolute',
      top: -32,
      right: 0,
      backgroundColor: palette.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      ...createShadow({
        shadowColor: palette.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      }),
    },
    hintText: {
      color: palette.text,
      fontSize: 11,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={handlePress}
        onLongPress={handleTripleTap}
        accessibilityRole="button"
        accessibilityLabel="SOS Crisis Support Button - Tap for crisis resources, triple-tap for emergency contact"
        accessibilityHint="Opens crisis support menu with hotlines and resources"
      >
        <Ionicons name="warning" size={compact ? 20 : 24} color={palette.onPrimary} />
        {!compact && <Text style={styles.buttonText}>SOS</Text>}
      </Pressable>
    </View>
  );
}
