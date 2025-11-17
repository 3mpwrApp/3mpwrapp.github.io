import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { s } from '../../../theme/spacing';
import { useAppPalette } from '../../../theme/usePalette';

// Import existing accountability components (will be refactored)
import AccountabilityCases from './accountability-cases';
import AccountabilityCoach from './accountability-coach';
import Ratings from './ratings';

const Tab = createMaterialTopTabNavigator();

export const options = { href: null };

export default function AccountabilityHub() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('accountability.hub.title', 'Accountability Hub'));
  useFocusOnRefOnMount(titleRef);

  return (
    <View style={styles.container}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('accountability.hub.title', 'Accountability Hub')}
      </Text>
      <Text style={styles.subtitle}>
        {t('accountability.hub.subtitle', 'Track personal accountability cases, get AI coaching, and contribute to community ratings.')}
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
          name="Personal"
          component={AccountabilityCases}
          options={{ title: t('accountability.hub.personal', 'Personal Cases') }}
        />
        <Tab.Screen
          name="Coach"
          component={AccountabilityCoach}
          options={{ title: t('accountability.hub.coach', 'AI Coach') }}
        />
        <Tab.Screen
          name="Community"
          component={Ratings}
          options={{ title: t('accountability.hub.community', 'Community Ratings') }}
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