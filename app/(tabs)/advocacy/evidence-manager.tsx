import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { s } from '../../../theme/spacing';
import { useAppPalette } from '../../../theme/usePalette';
import EvidenceLocker from '../resources/(tools)/evidence-locker';
import EvidenceQueue from '../resources/evidence-queue';

const Tab = createMaterialTopTabNavigator();

export const options = { href: null };

export default function EvidenceManager() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const { t } = useTranslation();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('evidence.manager.title', 'Evidence Manager'));
  useFocusOnRefOnMount(titleRef);

  return (
    <View style={styles.container}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('evidence.manager.title', 'Evidence Manager')}
      </Text>
      <Text style={styles.subtitle}>
        {t('evidence.manager.subtitle', 'Securely store evidence, manage uploads, and organize documentation for advocacy.')}
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
          name="Locker"
          component={EvidenceLocker}
          options={{ title: t('evidence.manager.locker', 'Evidence Locker') }}
        />
        <Tab.Screen
          name="Queue"
          component={EvidenceQueue}
          options={{ title: t('evidence.manager.queue', 'Upload Queue') }}
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