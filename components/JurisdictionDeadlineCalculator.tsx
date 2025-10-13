import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { HIT_SLOP_8 } from '../constants/a11y';
import { useTranslation } from '../i18n';
import { logEvent } from '../services/analytics';
import { ANALYTICS_EVENTS } from '../services/analyticsEvents';
import { useJurisdiction } from '../store/jurisdiction';
import { useTextScale } from '../theme/typography';
import { useAppPalette } from '../theme/usePalette';

import A11yPressable from './A11yPressable';

interface DeadlineInfo {
  level: string;
  deadline: string;
  daysRemaining: number;
  urgency: 'critical' | 'warning' | 'normal';
}

/**
 * JurisdictionDeadlineCalculator
 * 
 * Calculates days remaining for workplace injury board appeals based on
 * decision date and jurisdiction-specific deadlines.
 * 
 * Features:
 * - Auto-detects appeal levels from selected jurisdiction
 * - Calculates days remaining for each appeal tier
 * - Color-coded urgency indicators (red < 30 days, yellow < 60 days)
 * - Accessible date picker with clear labels
 */
export default function JurisdictionDeadlineCalculator() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const factor = useTextScale();
  const { data: jurisdiction } = useJurisdiction();

  const [decisionDate, setDecisionDate] = useState('');
  const [calculatedDeadlines, setCalculatedDeadlines] = useState<DeadlineInfo[]>([]);

  const calculateDeadlines = (dateString: string) => {
    if (!dateString || !jurisdiction?.workplaceInjury?.appealLevels) {
      setCalculatedDeadlines([]);
      return;
    }

    try {
      const decision = new Date(dateString);
      if (isNaN(decision.getTime())) {
        setCalculatedDeadlines([]);
        return;
      }

      const today = new Date();
      const deadlines: DeadlineInfo[] = jurisdiction.workplaceInjury.appealLevels.map((level) => {
        const deadlineDate = new Date(decision);
        deadlineDate.setDate(deadlineDate.getDate() + level.typicalDeadlineDays);
        
        const msPerDay = 24 * 60 * 60 * 1000;
        const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / msPerDay);
        
        let urgency: 'critical' | 'warning' | 'normal' = 'normal';
        if (daysRemaining < 30) urgency = 'critical';
        else if (daysRemaining < 60) urgency = 'warning';

        return {
          level: level.name,
          deadline: deadlineDate.toLocaleDateString(),
          daysRemaining,
          urgency,
        };
      });

      setCalculatedDeadlines(deadlines);
      
      // Track deadline calculation usage
      logEvent(ANALYTICS_EVENTS.JURISDICTION_DEADLINE_CALCULATED, {
        jurisdiction_code: jurisdiction.code,
        appeal_levels_count: deadlines.length,
        has_critical_deadline: deadlines.some(d => d.urgency === 'critical'),
      });
    } catch (error) {
      console.error('Date calculation error:', error);
      setCalculatedDeadlines([]);
    }
  };

  const handleDateChange = (text: string) => {
    setDecisionDate(text);
    calculateDeadlines(text);
  };

  const clearCalculation = () => {
    setDecisionDate('');
    setCalculatedDeadlines([]);
  };

  const styles = makeStyles(palette, factor);

  if (!jurisdiction?.workplaceInjury?.appealLevels) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>
          {t('jurisdiction.deadline.noAppealLevels', 'No appeal levels available for this jurisdiction.')}
        </Text>
      </View>
    );
  }

  const getUrgencyColor = (urgency: 'critical' | 'warning' | 'normal') => {
    switch (urgency) {
      case 'critical':
        return palette.error;
      case 'warning':
        return palette.warning;
      default:
        return palette.success;
    }
  };

  const getUrgencyIcon = (urgency: 'critical' | 'warning' | 'normal') => {
    switch (urgency) {
      case 'critical':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      default:
        return 'checkmark-circle';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={24} color={palette.primary} />
        <Text style={styles.title}>
          {t('jurisdiction.deadline.calculator', 'Appeal Deadline Calculator')}
        </Text>
      </View>

      <Text style={styles.description}>
        {t('jurisdiction.deadline.description', 
          'Enter the date you received the decision to calculate appeal deadlines for {{jurisdiction}}.',
          { jurisdiction: jurisdiction.name }
        )}
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {t('jurisdiction.deadline.decisionDate', 'Decision Date')}
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={decisionDate}
            onChangeText={handleDateChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={palette.muted}
            accessibilityLabel={t('jurisdiction.deadline.decisionDateLabel', 'Enter decision date in YYYY-MM-DD format')}
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
          />
          {decisionDate && (
            <A11yPressable
              onPress={clearCalculation}
              hitSlop={HIT_SLOP_8}
              accessibilityLabel={t('jurisdiction.deadline.clear', 'Clear date')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={24} color={palette.muted} />
            </A11yPressable>
          )}
        </View>
        <Text style={styles.hint}>
          {t('jurisdiction.deadline.hint', 'Example: 2025-10-01 for October 1, 2025')}
        </Text>
      </View>

      {calculatedDeadlines.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            {t('jurisdiction.deadline.results', 'Appeal Deadlines')}
          </Text>
          {calculatedDeadlines.map((item, index) => (
            <View key={index} style={styles.deadlineCard}>
              <View style={styles.deadlineHeader}>
                <Ionicons
                  name={getUrgencyIcon(item.urgency)}
                  size={20}
                  color={getUrgencyColor(item.urgency)}
                />
                <Text style={styles.levelName}>{item.level}</Text>
              </View>
              <View style={styles.deadlineDetails}>
                <Text style={styles.deadlineLabel}>
                  {t('jurisdiction.deadline.appealBy', 'Appeal by:')}
                </Text>
                <Text style={styles.deadlineDate}>{item.deadline}</Text>
              </View>
              <View style={[styles.daysRemainingBadge, { backgroundColor: getUrgencyColor(item.urgency) + '20' }]}>
                <Text style={[styles.daysRemainingText, { color: getUrgencyColor(item.urgency) }]}>
                  {item.daysRemaining > 0
                    ? t('jurisdiction.deadline.daysRemaining', '{{days}} days remaining', { days: item.daysRemaining })
                    : t('jurisdiction.deadline.overdue', 'OVERDUE by {{days}} days', { days: Math.abs(item.daysRemaining) })
                  }
                </Text>
              </View>
            </View>
          ))}
          
          <View style={styles.disclaimerBox}>
            <Ionicons name="information-circle-outline" size={16} color={palette.muted} />
            <Text style={styles.disclaimerText}>
              {t('jurisdiction.deadline.disclaimer', 
                'These are typical deadlines. Always verify specific deadlines with the board or tribunal. Some jurisdictions may accept late appeals in certain circumstances.'
              )}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function makeStyles(palette: any, factor: number) {
  return StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: palette.surface,
      borderRadius: 12,
      marginVertical: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    title: {
      fontSize: Math.round(18 * factor),
      fontWeight: '600',
      color: palette.text,
    },
    description: {
      fontSize: Math.round(14 * factor),
      color: palette.muted,
      marginBottom: 16,
      lineHeight: Math.round(20 * factor),
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: Math.round(14 * factor),
      fontWeight: '500',
      color: palette.text,
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: palette.muted + '40',
      borderRadius: 8,
      padding: 12,
      fontSize: Math.round(16 * factor),
      color: palette.text,
      backgroundColor: palette.background,
    },
    clearButton: {
      padding: 4,
    },
    hint: {
      fontSize: Math.round(12 * factor),
      color: palette.muted,
      marginTop: 4,
      fontStyle: 'italic',
    },
    resultsContainer: {
      marginTop: 8,
    },
    resultsTitle: {
      fontSize: Math.round(16 * factor),
      fontWeight: '600',
      color: palette.text,
      marginBottom: 12,
    },
    deadlineCard: {
      backgroundColor: palette.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: palette.primary,
    },
    deadlineHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    levelName: {
      fontSize: Math.round(15 * factor),
      fontWeight: '600',
      color: palette.text,
      flex: 1,
    },
    deadlineDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    deadlineLabel: {
      fontSize: Math.round(13 * factor),
      color: palette.muted,
    },
    deadlineDate: {
      fontSize: Math.round(14 * factor),
      fontWeight: '500',
      color: palette.text,
    },
    daysRemainingBadge: {
      padding: 8,
      borderRadius: 6,
      alignItems: 'center',
    },
    daysRemainingText: {
      fontSize: Math.round(13 * factor),
      fontWeight: '600',
    },
    disclaimerBox: {
      flexDirection: 'row',
      gap: 8,
      padding: 12,
      backgroundColor: palette.warning + '10',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.warning + '30',
    },
    disclaimerText: {
      flex: 1,
      fontSize: Math.round(12 * factor),
      color: palette.muted,
      lineHeight: Math.round(18 * factor),
    },
    noDataText: {
      fontSize: Math.round(14 * factor),
      color: palette.muted,
      textAlign: 'center',
      padding: 16,
    },
  });
}
