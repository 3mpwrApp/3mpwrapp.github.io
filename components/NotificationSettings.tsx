/**
 * Notification Settings Component
 * 
 * Comprehensive notification settings with frequency control for all categories
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../i18n';
import { getNotificationFrequencyPrefs } from '../services/notificationFrequency';
import { useAppPalette } from '../theme/usePalette';
import type { NotificationCategory, NotificationPreferences } from '../types/notifications';

import { NotificationFrequencyPicker } from './NotificationFrequencyPicker';

export function NotificationSettings() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const [prefs, setPrefs] = React.useState<NotificationPreferences | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    loadPrefs();
  }, [refreshKey]);

  async function loadPrefs() {
    const loaded = await getNotificationFrequencyPrefs();
    setPrefs(loaded);
  }

  const handleUpdate = () => {
    setRefreshKey(k => k + 1);
  };

  const categories: NotificationCategory[] = [
    'whatsnew',
    'wellness',
    'advocacy',
    'resources',
    'community',
    'evidence',
    'system',
    'admin',
  ];

  const styles = createStyles(palette);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="notifications-outline" size={24} color={palette.primary} />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: palette.text }]}>
            {t('settings.notifications.title', 'Notification Settings')}
          </Text>
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
            {t('settings.notifications.subtitle', 'Control how and when you receive notifications')}
          </Text>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: palette.primary + '15' }]}>
        <Ionicons name="information-circle-outline" size={20} color={palette.primary} />
        <Text style={[styles.infoText, { color: palette.text }]}>
          Choose "Daily digest" or "Weekly digest" to batch notifications instead of receiving them immediately.
        </Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <View 
            key={category} 
            style={[styles.categoryItem, { borderBottomColor: palette.border }]}
          >
            <NotificationFrequencyPicker
              category={category}
              onUpdate={handleUpdate}
            />
          </View>
        ))}
      </ScrollView>

      {prefs && (
        <View style={[styles.footer, { borderTopColor: palette.border }]}>
          <Text style={[styles.footerText, { color: palette.textSecondary }]}>
            Last updated: {new Date(prefs.lastUpdated).toLocaleDateString()}
          </Text>
        </View>
      )}
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 16,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 12,
      borderRadius: 10,
      marginBottom: 16,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
    },
    list: {
      flex: 1,
    },
    categoryItem: {
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    footer: {
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    footerText: {
      fontSize: 12,
      textAlign: 'center',
    },
  });
}

export default NotificationSettings;
