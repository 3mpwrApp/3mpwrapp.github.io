import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { LoadingWrapper } from '../../../components/LoadingWrapper';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { s } from '../../../theme/spacing';
import { useAppPalette } from '../../../theme/usePalette';


const Tab = createMaterialTopTabNavigator();

// Lazy load tab components for better performance
const LazySymptomTracker = React.lazy(() => import('./symptom-tracker'));
const LazyPainForecast = React.lazy(() => import('./pain-forecast'));
const LazyChronicTracker = React.lazy(() => import('../resources/chronic-tracker'));
const LazyRehabTracker = React.lazy(() => import('../resources/rehab-tracker'));
const LazyPacingPartner = React.lazy(() => import('./pacing-partner'));

export const options = { href: null };

export default function HealthTracker() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  useAnnounceOnMount(t('wellness.healthTracker.title', 'Unified Health Tracker'));
  useFocusOnRefOnMount(titleRef);

  // Simulate initial loading for better UX
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingWrapper
      isLoading={isLoading}
      skeletonType="card"
      style={styles.container}
    >
      <View style={styles.container}>
        <Text
          ref={titleRef}
          accessibilityRole="header"
          style={styles.title}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t('wellness.healthTracker.title', 'Health Tracker')}
        </Text>
        <Text style={styles.subtitle}>
          {t('wellness.healthTracker.subtitle', 'Track symptoms, pain, chronic conditions, rehab progress, and pacing in one place.')}
        </Text>

        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { backgroundColor: palette.surface },
            tabBarActiveTintColor: palette.primary,
            tabBarInactiveTintColor: palette.muted,
            tabBarIndicatorStyle: { backgroundColor: palette.primary },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
            lazy: true, // Enable lazy loading for tabs
          }}
        >
          <Tab.Screen
            name="Symptoms"
            component={LazySymptomTracker}
            options={{ title: t('wellness.healthTracker.symptoms', 'Symptoms') }}
          />
          <Tab.Screen
            name="PainForecast"
            component={LazyPainForecast}
            options={{ title: t('wellness.healthTracker.painForecast', 'Pain Forecast') }}
          />
          <Tab.Screen
            name="Chronic"
            component={LazyChronicTracker}
            options={{ title: t('wellness.healthTracker.chronic', 'Chronic') }}
          />
          <Tab.Screen
            name="Rehab"
            component={LazyRehabTracker}
            options={{ title: t('wellness.healthTracker.rehab', 'Rehab') }}
          />
          <Tab.Screen
            name="Pacing"
            component={LazyPacingPartner}
            options={{ title: t('wellness.healthTracker.pacing', 'Pacing') }}
          />
        </Tab.Navigator>
      </View>
    </LoadingWrapper>
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