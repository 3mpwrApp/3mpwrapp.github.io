/**
 * Mental Wellness Toolkit
 * 
 * Consolidates all CBT/DBT cognitive tools:
 * - CBT Virtual Coach (thought reframing)
 * - CBT Mini-Games (grounding)
 * - DBT Skill Matcher (emotion regulation)
 * - Opposite Action Companion
 * - Radical Acceptance
 * - Acceptance & Function Tracker
 * - Distress Tolerance
 * - Belief Strength Meter
 */

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';

const Tab = createMaterialTopTabNavigator();

// Lazy load tab components
const LazyCBTCoach = React.lazy(() => import('./cbt-coach'));
const LazyCBTMiniGames = React.lazy(() => import('./cbt-mini-games'));
const LazyDBTSkills = React.lazy(() => import('./dbt'));
const LazyOppositeAction = React.lazy(() => import('./opposite-action'));
const LazyRadicalAcceptance = React.lazy(() => import('./radical-acceptance'));
const LazyAcceptanceFunction = React.lazy(() => import('./acceptance-function'));
const LazyDistressTolerance = React.lazy(() => import('./distress-tolerance'));
const LazyBeliefMeter = React.lazy(() => import('./belief-meter'));

export const options = { href: null };

export default function MentalWellnessToolkit() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const titleRef = React.useRef<Text>(null);

  useAnnounceOnMount('Mental Wellness Toolkit');
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
          {t('wellness.mentalToolkit.title', '🧠 Mental Wellness Toolkit')}
        </Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('wellness.mentalToolkit.subtitle', 'CBT, DBT, and cognitive tools in one place')}
        </Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: palette.surface },
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.muted,
          tabBarIndicatorStyle: { backgroundColor: palette.primary },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarScrollEnabled: true,
          lazy: true,
        }}
      >
        <Tab.Screen
          name="CBT"
          component={LazyCBTCoach}
          options={{ title: t('wellness.mentalToolkit.cbt', 'CBT Coach') }}
        />
        <Tab.Screen
          name="DBT"
          component={LazyDBTSkills}
          options={{ title: t('wellness.mentalToolkit.dbt', 'DBT Skills') }}
        />
        <Tab.Screen
          name="Games"
          component={LazyCBTMiniGames}
          options={{ title: t('wellness.mentalToolkit.games', 'Grounding') }}
        />
        <Tab.Screen
          name="OppositeAction"
          component={LazyOppositeAction}
          options={{ title: t('wellness.mentalToolkit.opposite', 'Opposite Action') }}
        />
        <Tab.Screen
          name="Acceptance"
          component={LazyRadicalAcceptance}
          options={{ title: t('wellness.mentalToolkit.acceptance', 'Acceptance') }}
        />
        <Tab.Screen
          name="Distress"
          component={LazyDistressTolerance}
          options={{ title: t('wellness.mentalToolkit.distress', 'Crisis Skills') }}
        />
        <Tab.Screen
          name="Belief"
          component={LazyBeliefMeter}
          options={{ title: t('wellness.mentalToolkit.belief', 'Beliefs') }}
        />
        <Tab.Screen
          name="Function"
          component={LazyAcceptanceFunction}
          options={{ title: t('wellness.mentalToolkit.function', 'Function') }}
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
