/**
 * Movement & Rehab Hub
 * 
 * Consolidates all movement/exercise tools:
 * - Micro-Movement Coach (gentle chair-friendly movements)
 * - Exercise Hub (video routines)
 * - Rehab Games (recovery-friendly activities)
 * - Nutrition Guides
 */

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';

const Tab = createMaterialTopTabNavigator();

// Lazy load tab components
const LazyMicroMovement = React.lazy(() => import('./micro-movement'));
const LazyExerciseHub = React.lazy(() => import('./exercise-hub'));
const LazyRehabGames = React.lazy(() => import('./rehab-games'));
const LazyNutrition = React.lazy(() => import('./nutrition-guides'));

export const options = { href: null };

export default function MovementRehabHub() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const titleRef = React.useRef<Text>(null);

  useAnnounceOnMount('Movement and Rehab Hub');
  useFocusOnRefOnMount(titleRef);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: palette.background, paddingHorizontal: 16 }]}>
        <Text
          ref={titleRef}
          accessibilityRole="header"
          style={[styles.title, { color: palette.text }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t('wellness.movementHub.title', '💪 Movement & Rehab Hub')}
        </Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('wellness.movementHub.subtitle', 'Gentle exercises, rehab activities, and nutrition guidance')}
        </Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: palette.surface },
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.muted,
          tabBarIndicatorStyle: { backgroundColor: palette.primary },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          lazy: true,
        }}
      >
        <Tab.Screen
          name="MicroMovement"
          component={LazyMicroMovement}
          options={{ title: t('wellness.movementHub.micro', 'Micro-Movement') }}
        />
        <Tab.Screen
          name="Exercises"
          component={LazyExerciseHub}
          options={{ title: t('wellness.movementHub.exercises', 'Exercise Videos') }}
        />
        <Tab.Screen
          name="Rehab"
          component={LazyRehabGames}
          options={{ title: t('wellness.movementHub.rehab', 'Rehab Activities') }}
        />
        <Tab.Screen
          name="Nutrition"
          component={LazyNutrition}
          options={{ title: t('wellness.movementHub.nutrition', 'Nutrition') }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
