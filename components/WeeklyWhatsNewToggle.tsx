/**
 * Weekly What's New Toggle Component
 * 
 * Settings toggle for weekly notification summaries
 */

import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import {
    getLastSummaryDate,
    isWeeklyWhatsNewEnabled,
    setWeeklyWhatsNewEnabled
} from '../services/weeklyWhatsNewNotification';
import { useAppPalette } from '../theme/usePalette';

export function WeeklyWhatsNewToggle() {
  const palette = useAppPalette();
  const [enabled, setEnabled] = React.useState(false);
  const [lastSummary, setLastSummary] = React.useState<Date | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    setLoading(true);
    const isEnabled = await isWeeklyWhatsNewEnabled();
    const lastDate = await getLastSummaryDate();
    setEnabled(isEnabled);
    setLastSummary(lastDate);
    setLoading(false);
  }

  async function handleToggle(value: boolean) {
    setEnabled(value);
    await setWeeklyWhatsNewEnabled(value);
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    const now = Date.now();
    const diff = now - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: palette.text }]}>
            Weekly What's New Summary
          </Text>
          <Text style={[styles.description, { color: palette.textSecondary }]}>
            Get a weekly notification every Monday at 9 AM summarizing recent app updates
          </Text>
          {lastSummary && (
            <Text style={[styles.lastSummary, { color: palette.textSecondary }]}>
              Last summary: {formatDate(lastSummary)}
            </Text>
          )}
        </View>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          disabled={loading}
          trackColor={{ 
            false: palette.muted, 
            true: palette.primary + '80' 
          }}
          thumbColor={enabled ? palette.primary : palette.background}
          ios_backgroundColor={palette.muted}
        />
      </View>
      
      {enabled && (
        <View style={[styles.info, { backgroundColor: palette.primary + '10' }]}>
          <Text style={[styles.infoText, { color: palette.primary }]}>
            💡 Notifications are silent and auto-expire after 7 days
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  lastSummary: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  info: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
