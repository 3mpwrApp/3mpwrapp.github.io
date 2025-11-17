import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { s } from '../../../theme/spacing';
import { useAppPalette } from '../../../theme/usePalette';
import ChronicTracker from '../resources/chronic-tracker';
import RehabTracker from '../resources/rehab-tracker';

import PacingPartner from './pacing-partner';
import PainForecast from './pain-forecast';
import SymptomTracker from './symptom-tracker';

const Tab = createMaterialTopTabNavigator();

export const options = { href: null };

export default function HealthTracker() {
  const palette = useAppPalette();
  const s = createStyles(palette);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('wellness.healthTracker.title', 'Unified Health Tracker'));
  useFocusOnRefOnMount(titleRef);

  return (
    <View style={s.container}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('wellness.healthTracker.title', 'Health Tracker')}
      </Text>
      <Text style={s.subtitle}>
        {t('wellness.healthTracker.subtitle', 'Track symptoms, pain, chronic conditions, rehab progress, and pacing in one place.')}
      </Text>

      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: palette.surface },
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.muted,
          tabBarIndicatorStyle: { backgroundColor: palette.primary },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="Symptoms"
          component={SymptomTracker}
          options={{ title: t('wellness.healthTracker.symptoms', 'Symptoms') }}
        />
        <Tab.Screen
          name="PainForecast"
          component={PainForecast}
          options={{ title: t('wellness.healthTracker.painForecast', 'Pain Forecast') }}
        />
        <Tab.Screen
          name="Chronic"
          component={ChronicTracker}
          options={{ title: t('wellness.healthTracker.chronic', 'Chronic') }}
        />
        <Tab.Screen
          name="Rehab"
          component={RehabTracker}
          options={{ title: t('wellness.healthTracker.rehab', 'Rehab') }}
        />
        <Tab.Screen
          name="Pacing"
          component={PacingPartner}
          options={{ title: t('wellness.healthTracker.pacing', 'Pacing') }}
        />
      </Tab.Navigator>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: palette.primary,
      padding: s('md'),
      paddingBottom: s('sm'),
    },
    subtitle: {
      fontSize: 16,
      color: palette.text,
      paddingHorizontal: s('md'),
      paddingBottom: s('md'),
    },
  });
}