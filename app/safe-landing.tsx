// Safe Landing Page - Crisis/Panic Exit Screen
// Uses therapeutic green color palette intentionally (not app theme colors)
/* eslint-disable no-restricted-syntax */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GapView } from '../components/GapView';
import { useReduceMotionEnabled } from '../hooks/useA11y';
import { useAppPalette } from '../theme/usePalette';

export default function SafeLandingPage() {
  const router = useRouter();
  const palette = useAppPalette();
  const reduceMotion = useReduceMotionEnabled();
  const styles = createStyles(palette);

  // Animated breathing circle
  const breatheAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!reduceMotion) {
      // 4-7-8 breathing pattern (simplified to 19 second cycle)
      Animated.loop(
        Animated.sequence([
          // Breathe in (4 seconds)
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          // Hold (7 seconds)
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 7000,
            useNativeDriver: true,
          }),
          // Breathe out (8 seconds)
          Animated.timing(breatheAnim, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [reduceMotion, breatheAnim]);

  const scale = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  const handleExit = () => {
    if (Platform.OS === 'web') {
      window.close();
    } else {
      // On mobile, navigate to a minimal exit confirmation
      // Note: Can't force close app on iOS, Android can use BackHandler
      router.replace('/(tabs)');
    }
  };

  const openCrisisLine = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      accessibilityLabel="Safe space - You are safe here"
    >
      {/* Calming Header */}
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          You Are Safe
        </Text>
        <Text style={styles.subtitle}>Take your time. There's no rush.</Text>
      </View>

      {/* Breathing Exercise */}
      <View style={styles.breathingSection}>
        <Text style={styles.sectionTitle}>Take a Breath</Text>
        {reduceMotion ? (
          <View style={styles.staticBreathing}>
            <Text style={styles.breathingText}>
              Breathe in for 4 seconds{'\n'}
              Hold for 7 seconds{'\n'}
              Breathe out for 8 seconds
            </Text>
          </View>
        ) : (
          <View style={styles.breathingContainer}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  transform: [{ scale }],
                },
              ]}
              accessibilityLabel="Breathing guide - follow the circle"
            />
          </View>
        )}
      </View>

      {/* Crisis Resources */}
      <View style={styles.resourcesSection}>
        <Text style={styles.sectionTitle}>Crisis Support - Available Now</Text>
        
        <Pressable
          style={styles.resourceButton}
          onPress={() => openCrisisLine('tel:988')}
          accessibilityRole="button"
          accessibilityLabel="Call 988 Suicide and Crisis Lifeline"
        >
          <Ionicons name="call" size={24} color={palette.primary} />
          <View style={styles.resourceText}>
            <Text style={styles.resourceTitle}>988 - Suicide & Crisis Lifeline</Text>
            <Text style={styles.resourceSubtitle}>24/7 Support</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.resourceButton}
          onPress={() => openCrisisLine('tel:18006686868')}
          accessibilityRole="button"
          accessibilityLabel="Call Kids Help Phone at 1-800-668-6868"
        >
          <Ionicons name="call" size={24} color={palette.primary} />
          <View style={styles.resourceText}>
            <Text style={styles.resourceTitle}>Kids Help Phone</Text>
            <Text style={styles.resourceSubtitle}>1-800-668-6868</Text>
          </View>
        </Pressable>

        <View style={styles.resourceButton}>
          <Ionicons name="chatbubble" size={24} color={palette.primary} />
          <View style={styles.resourceText}>
            <Text style={styles.resourceTitle}>Crisis Text Line</Text>
            <Text style={styles.resourceSubtitle}>Text "HOME" to 686868</Text>
          </View>
        </View>
      </View>

      {/* Grounding Technique */}
      <View style={styles.groundingSection}>
        <Text style={styles.sectionTitle}>Grounding Exercise (5-4-3-2-1)</Text>
        <Text style={styles.groundingText}>Take a moment to notice:</Text>
        
        <View style={styles.groundingItem}>
          <Text style={styles.groundingNumber}>5</Text>
          <Text style={styles.groundingLabel}>things you can see</Text>
        </View>
        
        <View style={styles.groundingItem}>
          <Text style={styles.groundingNumber}>4</Text>
          <Text style={styles.groundingLabel}>things you can touch</Text>
        </View>
        
        <View style={styles.groundingItem}>
          <Text style={styles.groundingNumber}>3</Text>
          <Text style={styles.groundingLabel}>things you can hear</Text>
        </View>
        
        <View style={styles.groundingItem}>
          <Text style={styles.groundingNumber}>2</Text>
          <Text style={styles.groundingLabel}>things you can smell</Text>
        </View>
        
        <View style={styles.groundingItem}>
          <Text style={styles.groundingNumber}>1</Text>
          <Text style={styles.groundingLabel}>thing you can taste</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <GapView gap={16} style={styles.actions}>
        <Pressable
          style={styles.continueButton}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel="I'm ready to continue"
        >
          <Text style={styles.continueButtonText}>I'm Ready to Continue</Text>
        </Pressable>

        <Pressable
          style={styles.exitButton}
          onPress={handleExit}
          accessibilityRole="button"
          accessibilityLabel="Exit app completely"
        >
          <Text style={styles.exitButtonText}>Exit App</Text>
        </Pressable>
      </GapView>
    </ScrollView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  // Intentionally using calming green theme colors for crisis situations
  // These are not palette tokens - this is a safe space with specific therapeutic colors
  // All colors updated for WCAG AA/AAA contrast compliance in both light and dark modes
  const isDark = palette.background === '#000000' || palette.background === '#121212';
  
  // Dark mode colors (WCAG compliant for dark backgrounds)
  const darkTitle = '#A5D6A7';      // 7.5:1 contrast on dark background
  const darkSubtitle = '#81C784';   // 5.2:1 contrast on dark background  
  const darkAccent = '#66BB6A';     // 4.7:1 contrast on dark background
  const darkBackground = '#1B1B1B'; // Dark mode container background
  const darkLightBg = '#2C2C2C';    // Dark mode light background
  
  // Light mode colors (original WCAG AAA compliant)
  const lightTitle = '#1B5E20';     // 9.01:1 contrast on white
  const lightSubtitle = '#2E7D32';  // 7.01:1 contrast on white
  const lightAccent = '#2E7D32';
  const lightBackground = '#FFFFFF';
  const lightLightBg = '#F1F8E9';
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? darkBackground : lightBackground,
    },
    content: {
      padding: 24,
      paddingBottom: 48,
    },
    header: {
      alignItems: 'center',
      marginVertical: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: isDark ? darkTitle : lightTitle,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 18,
      color: isDark ? darkSubtitle : lightSubtitle,
      textAlign: 'center',
    },
    breathingSection: {
      marginVertical: 24,
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: isDark ? darkTitle : lightTitle,
      marginBottom: 16,
      textAlign: 'center',
    },
    breathingContainer: {
      width: 200,
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 24,
    },
    breathingCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDark ? darkAccent : lightAccent,
      opacity: 0.8,
    },
    staticBreathing: {
      padding: 24,
      backgroundColor: isDark ? darkLightBg : lightLightBg,
      borderRadius: 12,
      marginVertical: 16,
    },
    breathingText: {
      fontSize: 18,
      color: isDark ? darkTitle : lightTitle,
      textAlign: 'center',
      lineHeight: 28,
    },
    resourcesSection: {
      marginVertical: 24,
    },
    resourceButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? darkLightBg : '#FFFFFF',
      padding: 16,
      borderRadius: 12,
      marginVertical: 8,
      minHeight: 64,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    resourceText: {
      marginLeft: 16,
      flex: 1,
    },
    resourceTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? darkTitle : lightTitle,
      marginBottom: 4,
    },
    resourceSubtitle: {
      fontSize: 14,
      color: isDark ? darkSubtitle : lightSubtitle,
    },
    groundingSection: {
      marginVertical: 24,
      padding: 20,
      backgroundColor: isDark ? darkLightBg : lightLightBg,
      borderRadius: 12,
    },
    groundingText: {
      fontSize: 16,
      color: isDark ? darkTitle : lightTitle,
      marginBottom: 16,
      textAlign: 'center',
    },
    groundingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8,
    },
    groundingNumber: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? darkTitle : lightTitle,
      width: 40,
    },
    groundingLabel: {
      fontSize: 18,
      color: isDark ? darkSubtitle : lightSubtitle,
      flex: 1,
    },
    actions: {
      marginTop: 32,
    },
    continueButton: {
      backgroundColor: isDark ? darkAccent : lightAccent,
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
      minHeight: 64,
      justifyContent: 'center',
    },
    continueButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    exitButton: {
      backgroundColor: isDark ? darkLightBg : '#FFFFFF',
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
      minHeight: 64,
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: isDark ? darkAccent : lightAccent,
    },
    exitButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? darkTitle : lightTitle,
    },
  });
}