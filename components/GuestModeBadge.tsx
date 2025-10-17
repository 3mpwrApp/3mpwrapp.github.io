import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useThemeColor } from '../hooks/useThemeColor';

import A11yPressable from './A11yPressable';

/**
 * Guest Mode Badge Component
 * Displays a visual indicator when user is in guest mode
 * with option to sign in or create an account
 * 
 * Accessibility: Uses aria-live announcements and proper labeling
 */
export default function GuestModeBadge() {
  const { isGuest, user } = useAuth();
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const colors = {
    text: textColor,
    background: backgroundColor,
    warning: textColor,
    border: `${textColor}20`,
  };

  // Only show if user is in guest mode
  if (!isGuest || !user) {
    return null;
  }

  const handleSignIn = async () => {
    await AccessibilityInfo.announceForAccessibility?.('Navigating to login screen');
    router.push('/(auth)/login' as any);
  };

  const handleCreateAccount = async () => {
    await AccessibilityInfo.announceForAccessibility?.('Navigating to registration screen');
    router.push('/(auth)/register' as any);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel="Guest mode active"
    >
      <View style={styles.content}>
        <Ionicons
          name="person-circle-outline"
          size={24}
          color={colors.warning}
          accessible={false}
        />
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, { color: colors.warning }]}
            accessibilityRole="header"
          >
            Guest Mode
          </Text>
          <Text
            style={[styles.description, { color: colors.text }]}
            accessibilityRole="text"
          >
            Your data will be kept private
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <A11yPressable
          onPress={handleSignIn}
          accessibilityRole="button"
          accessibilityLabel="Sign in to your account"
          accessibilityHint="Tap to navigate to login screen"
          style={[styles.button, { backgroundColor: colors.text }]}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </A11yPressable>

        <A11yPressable
          onPress={handleCreateAccount}
          accessibilityRole="button"
          accessibilityLabel="Create a new account"
          accessibilityHint="Tap to navigate to registration screen"
          style={[styles.button, { backgroundColor: colors.warning }]}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </A11yPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
});
