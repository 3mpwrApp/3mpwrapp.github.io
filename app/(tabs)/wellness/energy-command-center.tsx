/**
 * Energy Command Center - Unified Power Tool
 * 
 * Consolidates 15+ energy/tracking features into one tabbed interface:
 * - Dashboard (Energy Hub, Spoon Economist, Energy Coins)
 * - Mood (Mood Tracker, Daily Planner)
 * - Sleep (Sleep Energy Tracker, Sleep Reframe, Circadian DJ)
 * - Pacing (Pacing Partner, Work Balance AI, Micro-Movement)
 * - Forecast (Pain Forecast, Symptom Symphony)
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { HIT_SLOP_12 } from '../../../constants/a11y';
import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import GapView from '../../../components/GapView';
import PowerTool, {
    PowerToolAction,
    PowerToolSection,
    PowerToolTabContent,
    type PowerToolTab,
    type PowerToolTabProps,
} from '../../../components/PowerTool';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import { trackEvent } from '../../../services/analyticsClient';
import { useAppPalette } from '../../../theme/usePalette';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

// ============================================
// TAB 1: DASHBOARD
// Combines: Energy Hub, Spoon Economist, Energy Coins
// ============================================
function DashboardTab(props: PowerToolTabProps) {
  const { navigateToTab } = props;
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  
  const [currentEnergy, setCurrentEnergy] = useState(12); // Spoons
  const [maxEnergy, setMaxEnergy] = useState(16);
  const [energyCoins, setEnergyCoins] = useState(0);

  useEffect(() => {
    loadEnergyData();
  }, []);

  const loadEnergyData = async () => {
    try {
      const stored = await AsyncStorage?.getItem?.('energy.dashboard.v1');
      if (stored) {
        const data = JSON.parse(stored);
        setCurrentEnergy(data.current || 12);
        setMaxEnergy(data.max || 16);
        setEnergyCoins(data.coins || 0);
      }
    } catch {}
  };

  const updateEnergy = async (delta: number) => {
    const newEnergy = Math.max(0, Math.min(maxEnergy, currentEnergy + delta));
    setCurrentEnergy(newEnergy);
    trackEvent('energy.updated', { from: currentEnergy, to: newEnergy, delta });
    
    try {
      await AsyncStorage?.setItem?.('energy.dashboard.v1', JSON.stringify({
        current: newEnergy,
        max: maxEnergy,
        coins: energyCoins,
        lastUpdated: new Date().toISOString(),
      }));
    } catch {}
  };

  const energyPercent = (currentEnergy / maxEnergy) * 100;
  const energyColor = energyPercent > 60 ? palette.success : energyPercent > 30 ? palette.warning : palette.error;

  const styles = createDashboardStyles(palette);

  return (
    <PowerToolTabContent>
      {/* Energy Gauge */}
      <View style={styles.gaugeCard}>
        <Text style={styles.gaugeTitle}>{t('energy.current', 'Current Energy')}</Text>
        <View style={styles.gaugeContainer}>
          <View style={[styles.gaugeBar, { width: `${energyPercent}%`, backgroundColor: energyColor }]} />
        </View>
        <Text style={[styles.gaugeValue, { color: energyColor }]}>
          {currentEnergy} / {maxEnergy} 🥄
        </Text>
        
        {/* Quick adjust buttons */}
        <GapView style={styles.adjustButtons} gap={12}>
          <A11yPressable
            style={[styles.adjustButton, { backgroundColor: palette.error + '20' }]}
            onPress={() => updateEnergy(-1)}
            accessibilityLabel={t('energy.spendSpoon', 'Spend 1 spoon')}
            hitSlop={HIT_SLOP_8}
          >
            <Text style={[styles.adjustButtonText, { color: palette.error }]}>-1 🥄</Text>
          </A11yPressable>
          <A11yPressable
            style={[styles.adjustButton, { backgroundColor: palette.success + '20' }]}
            onPress={() => updateEnergy(1)}
            accessibilityLabel={t('energy.recoverSpoon', 'Recover 1 spoon')}
            hitSlop={HIT_SLOP_8}
          >
            <Text style={[styles.adjustButtonText, { color: palette.success }]}>+1 🥄</Text>
          </A11yPressable>
        </GapView>
      </View>

      {/* Energy Coins */}
      <View style={styles.coinsCard}>
        <View style={styles.coinsHeader}>
          <Text style={styles.coinsTitle}>⚡ Energy Coins</Text>
          <Text style={styles.coinsValue}>{energyCoins}</Text>
        </View>
        <Text style={styles.coinsDesc}>
          {t('energy.coinsDesc', 'Earn coins by completing pacing goals and wellness activities')}
        </Text>
      </View>

      {/* Quick Actions */}
      <PowerToolSection title={t('energy.quickActions', 'Quick Actions')}>
        <PowerToolAction
          label={t('energy.logActivity', 'Log Energy-Spending Activity')}
          icon="📝"
          onPress={() => router.push('/wellness/spoon-economist')}
        />
        <PowerToolAction
          label={t('energy.planDay', 'Plan Today\'s Energy Budget')}
          icon="📅"
          onPress={() => router.push('/wellness/daily-planner')}
        />
        <PowerToolAction
          label={t('energy.viewHistory', 'View Energy History')}
          icon="📊"
          onPress={() => router.push('/wellness/energy-hub')}
        />
      </PowerToolSection>

      {/* Navigate to other tabs */}
      <PowerToolSection title={t('energy.explore', 'Explore More')}>
        <A11yPressable
          style={styles.tabLink}
          onPress={() => navigateToTab('mood')}
          accessibilityRole="button"
          accessibilityLabel={t('energy.goToMood', 'Go to Mood tab')}
        >
          <Text style={styles.tabLinkIcon}>😊</Text>
          <Text style={styles.tabLinkText}>{t('energy.trackMood', 'Track your mood')}</Text>
          <Ionicons name="arrow-forward" size={16} color={palette.primary} />
        </A11yPressable>
        <A11yPressable
          style={styles.tabLink}
          onPress={() => navigateToTab('pacing')}
          accessibilityRole="button"
          accessibilityLabel={t('energy.goToPacing', 'Go to Pacing tab')}
        >
          <Text style={styles.tabLinkIcon}>⏱️</Text>
          <Text style={styles.tabLinkText}>{t('energy.pacingTools', 'Pacing tools')}</Text>
          <Ionicons name="arrow-forward" size={16} color={palette.primary} />
        </A11yPressable>
      </PowerToolSection>
    </PowerToolTabContent>
  );
}

// ============================================
// TAB 2: MOOD
// Combines: Mood Tracker, Daily Planner, Reflections
// ============================================
function MoodTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [moodNote, _setMoodNote] = useState('');

  const moods = [
    { value: 1, emoji: '😢', label: 'Very Low' },
    { value: 2, emoji: '😞', label: 'Low' },
    { value: 3, emoji: '😐', label: 'Neutral' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😊', label: 'Great' },
  ];

  const handleMoodSelect = async (value: number) => {
    setTodayMood(value);
    trackEvent('mood.logged', { value, source: 'energy_command_center' });
    
    try {
      await AsyncStorage?.setItem?.('mood.today.v1', JSON.stringify({
        value,
        note: moodNote,
        timestamp: new Date().toISOString(),
      }));
    } catch {}
  };

  const styles = createMoodStyles(palette);

  return (
    <PowerToolTabContent>
      {/* Quick Mood Check */}
      <View style={styles.moodCard}>
        <Text style={styles.moodTitle}>{t('mood.howFeeling', 'How are you feeling?')}</Text>
        <GapView style={styles.moodButtons} gap={8}>
          {moods.map(mood => (
            <Pressable
              key={mood.value}
              style={[
                styles.moodButton,
                todayMood === mood.value && styles.moodButtonActive,
              ]}
              onPress={() => handleMoodSelect(mood.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: todayMood === mood.value }}
              accessibilityLabel={`${mood.label} mood`}
              hitSlop={HIT_SLOP_12}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[
                styles.moodLabel,
                todayMood === mood.value && styles.moodLabelActive,
              ]}>
                {mood.label}
              </Text>
            </Pressable>
          ))}
        </GapView>
        {todayMood && (
          <Text style={styles.moodConfirm}>
            ✓ {t('mood.logged', 'Mood logged')}
          </Text>
        )}
      </View>

      {/* Actions */}
      <PowerToolSection title={t('mood.tools', 'Mood Tools')}>
        <PowerToolAction
          label={t('mood.history', 'View Mood History')}
          icon="📈"
          onPress={() => router.push('/wellness/health-tracker')}
        />
        <PowerToolAction
          label={t('mood.reflections', 'Gratitude & Reflections')}
          icon="✨"
          onPress={() => router.push('/wellness/reflections-calendar')}
        />
        <PowerToolAction
          label={t('mood.dailyPlanner', 'Daily Planner')}
          icon="📋"
          onPress={() => router.push('/wellness/daily-planner')}
        />
      </PowerToolSection>
    </PowerToolTabContent>
  );
}

// ============================================
// TAB 3: SLEEP
// Combines: Sleep Energy Tracker, Sleep Reframe, Circadian DJ
// ============================================
function SleepTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  
  const [lastNightSleep, _setLastNightSleep] = useState<number | null>(null);
  const [sleepQuality, _setSleepQuality] = useState<number | null>(null);

  const styles = createSleepStyles(palette);

  return (
    <PowerToolTabContent>
      {/* Last Night Summary */}
      <View style={styles.sleepCard}>
        <Text style={styles.sleepTitle}>{t('sleep.lastNight', 'Last Night\'s Sleep')}</Text>
        <View style={styles.sleepStats}>
          <View style={styles.sleepStat}>
            <Text style={styles.sleepStatValue}>{lastNightSleep || '--'}</Text>
            <Text style={styles.sleepStatLabel}>{t('sleep.hours', 'hours')}</Text>
          </View>
          <View style={styles.sleepStat}>
            <Text style={styles.sleepStatValue}>{sleepQuality ? `${sleepQuality}/10` : '--'}</Text>
            <Text style={styles.sleepStatLabel}>{t('sleep.quality', 'quality')}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <PowerToolSection title={t('sleep.tools', 'Sleep Tools')}>
        <PowerToolAction
          label={t('sleep.logSleep', 'Log Last Night\'s Sleep')}
          icon="😴"
          onPress={() => router.push('/wellness/sleep-energy-tracker')}
        />
        <PowerToolAction
          label={t('sleep.reframe', 'Sleep Reframe (for insomnia)')}
          icon="🌙"
          onPress={() => router.push('/wellness/sleep-reframe')}
        />
        <PowerToolAction
          label={t('sleep.circadian', 'Circadian DJ')}
          icon="🎵"
          onPress={() => router.push('/wellness/circadian-dj')}
        />
        <PowerToolAction
          label={t('sleep.ambience', 'Sleep Ambience')}
          icon="🌌"
          onPress={() => router.push('/wellness/ambience')}
        />
      </PowerToolSection>

      {/* Tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>
          {t('sleep.tip', 'Consistent sleep and wake times help regulate your circadian rhythm, even on weekends.')}
        </Text>
      </View>
    </PowerToolTabContent>
  );
}

// ============================================
// TAB 4: PACING
// Combines: Pacing Partner, Work Balance AI, Micro-Movement
// ============================================
function PacingTab(props: PowerToolTabProps) {
  const { navigateToTab } = props;
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const styles = createPacingStyles(palette);

  return (
    <PowerToolTabContent>
      {/* Pacing Reminder */}
      <View style={styles.reminderCard}>
        <Text style={styles.reminderIcon}>⏱️</Text>
        <Text style={styles.reminderTitle}>{t('pacing.reminder', 'Pacing Reminder')}</Text>
        <Text style={styles.reminderText}>
          {t('pacing.reminderText', 'Activity and rest in balance. Take a break before you need one.')}
        </Text>
      </View>

      {/* Tools */}
      <PowerToolSection title={t('pacing.tools', 'Pacing Tools')}>
        <PowerToolAction
          label={t('pacing.partner', 'Pacing Partner')}
          icon="🤝"
          onPress={() => router.push('/wellness/pacing-partner')}
          variant="primary"
        />
        <PowerToolAction
          label={t('pacing.workBalance', 'Work-Life Balance AI')}
          icon="⚖️"
          onPress={() => router.push('/wellness/work-balance-ai')}
        />
        <PowerToolAction
          label={t('pacing.microMovement', 'Micro-Movement Breaks')}
          icon="🏃"
          onPress={() => router.push('/wellness/micro-movement')}
        />
        <PowerToolAction
          label={t('pacing.spoonEconomist', 'Spoon Economist')}
          icon="🥄"
          onPress={() => router.push('/wellness/spoon-economist')}
        />
      </PowerToolSection>

      {/* Link back to dashboard */}
      <A11yPressable
        style={styles.backLink}
        onPress={() => navigateToTab('dashboard')}
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={16} color={palette.primary} />
        <Text style={styles.backLinkText}>{t('pacing.backToDashboard', 'Back to Energy Dashboard')}</Text>
      </A11yPressable>
    </PowerToolTabContent>
  );
}

// ============================================
// TAB 5: FORECAST (Power User only)
// Combines: Pain Forecast, Symptom Symphony
// ============================================
function ForecastTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const styles = createForecastStyles(palette);

  return (
    <PowerToolTabContent>
      <DisclaimerBanner type="medical" compact />

      {/* Forecast Card */}
      <View style={styles.forecastCard}>
        <Text style={styles.forecastIcon}>🔮</Text>
        <Text style={styles.forecastTitle}>{t('forecast.title', 'Predictive Insights')}</Text>
        <Text style={styles.forecastDesc}>
          {t('forecast.desc', 'AI-powered predictions based on your health patterns, weather, and activity data.')}
        </Text>
      </View>

      {/* Tools */}
      <PowerToolSection title={t('forecast.tools', 'Forecast Tools')}>
        <PowerToolAction
          label={t('forecast.pain', 'Pain Forecast')}
          icon="🌡️"
          onPress={() => router.push('/wellness/pain-forecast')}
        />
        <PowerToolAction
          label={t('forecast.symptoms', 'Symptom Symphony')}
          icon="🎼"
          onPress={() => router.push('/wellness/symptom-symphony')}
        />
        <PowerToolAction
          label={t('forecast.triggers', 'Trigger Detector')}
          icon="⚠️"
          onPress={() => router.push('/wellness/trigger-detector')}
        />
      </PowerToolSection>

      {/* Beta notice */}
      <View style={styles.betaNotice}>
        <Ionicons name="flask" size={16} color={palette.warning} />
        <Text style={styles.betaText}>
          {t('forecast.beta', 'Forecasting features are in beta. Predictions improve with more data.')}
        </Text>
      </View>
    </PowerToolTabContent>
  );
}

// ============================================
// TAB DEFINITIONS
// ============================================
const ENERGY_TABS: PowerToolTab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '⚡',
    complexity: 'simple',
    component: DashboardTab,
    keywords: ['energy', 'spoons', 'coins', 'today'],
  },
  {
    id: 'mood',
    label: 'Mood',
    icon: '😊',
    complexity: 'simple',
    component: MoodTab,
    keywords: ['mood', 'feelings', 'emotions', 'gratitude'],
  },
  {
    id: 'sleep',
    label: 'Sleep',
    icon: '😴',
    complexity: 'standard',
    component: SleepTab,
    keywords: ['sleep', 'rest', 'insomnia', 'circadian'],
  },
  {
    id: 'pacing',
    label: 'Pacing',
    icon: '⏱️',
    complexity: 'standard',
    component: PacingTab,
    badge: 'beta',
    keywords: ['pacing', 'breaks', 'rest', 'activity', 'balance'],
  },
  {
    id: 'forecast',
    label: 'Forecast',
    icon: '🔮',
    complexity: 'power_user',
    component: ForecastTab,
    badge: 'beta',
    keywords: ['forecast', 'predict', 'pain', 'symptoms', 'ai'],
  },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function EnergyCommandCenter() {
  const { t } = useTranslation();

  return (
    <ResponsiveScreenWrapper>
      <PowerTool
        title={t('energy.commandCenter.title', 'Energy Command Center')}
        subtitle={t('energy.commandCenter.subtitle', 'Track energy, mood, sleep, and pacing in one place')}
        icon="🔋"
        tabs={ENERGY_TABS}
        defaultTab="dashboard"
        searchPlaceholder={t('energy.search', 'Search energy tools...')}
        analyticsPrefix="wellness.energy_command"
      />
    </ResponsiveScreenWrapper>
  );
}

// ============================================
// STYLES
// ============================================

function createDashboardStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    gaugeCard: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: palette.border,
    },
    gaugeTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 12,
    },
    gaugeContainer: {
      height: 24,
      backgroundColor: palette.muted + '30',
      borderRadius: 12,
      overflow: 'hidden',
    },
    gaugeBar: {
      height: '100%',
      borderRadius: 12,
    },
    gaugeValue: {
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 12,
    },
    adjustButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
    },
    adjustButton: {
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 20,
    },
    adjustButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    coinsCard: {
      backgroundColor: palette.warning + '15',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: palette.warning + '40',
    },
    coinsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    coinsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    coinsValue: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.warning,
    },
    coinsDesc: {
      fontSize: 13,
      color: palette.muted,
      marginTop: 6,
    },
    tabLink: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.primary + '10',
      padding: 14,
      borderRadius: 10,
      gap: 12,
    },
    tabLinkIcon: {
      fontSize: 20,
    },
    tabLinkText: {
      flex: 1,
      fontSize: 14,
      color: palette.text,
      fontWeight: '500',
    },
  });
}

function createMoodStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    moodCard: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: palette.border,
    },
    moodTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    moodButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    moodButton: {
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      backgroundColor: palette.surface,
      borderWidth: 2,
      borderColor: 'transparent',
      minWidth: 60,
    },
    moodButtonActive: {
      borderColor: palette.primary,
      backgroundColor: palette.primary + '15',
    },
    moodEmoji: {
      fontSize: 28,
      marginBottom: 4,
    },
    moodLabel: {
      fontSize: 11,
      color: palette.muted,
      fontWeight: '500',
    },
    moodLabelActive: {
      color: palette.primary,
    },
    moodConfirm: {
      fontSize: 14,
      color: palette.success,
      textAlign: 'center',
      marginTop: 12,
      fontWeight: '500',
    },
  });
}

function createSleepStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    sleepCard: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: palette.border,
    },
    sleepTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 16,
    },
    sleepStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    sleepStat: {
      alignItems: 'center',
    },
    sleepStatValue: {
      fontSize: 32,
      fontWeight: '700',
      color: palette.primary,
    },
    sleepStatLabel: {
      fontSize: 14,
      color: palette.muted,
      marginTop: 4,
    },
    tipCard: {
      flexDirection: 'row',
      backgroundColor: palette.primary + '10',
      borderRadius: 12,
      padding: 14,
      gap: 10,
      alignItems: 'flex-start',
    },
    tipIcon: {
      fontSize: 20,
    },
    tipText: {
      flex: 1,
      fontSize: 13,
      color: palette.text,
      lineHeight: 20,
    },
  });
}

function createPacingStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    reminderCard: {
      backgroundColor: palette.warning + '15',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.warning + '40',
    },
    reminderIcon: {
      fontSize: 40,
      marginBottom: 8,
    },
    reminderTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    reminderText: {
      fontSize: 14,
      color: palette.muted,
      textAlign: 'center',
      lineHeight: 21,
    },
    backLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 20,
      padding: 12,
    },
    backLinkText: {
      fontSize: 14,
      color: palette.primary,
      fontWeight: '500',
    },
  });
}

function createForecastStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    forecastCard: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border,
    },
    forecastIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    forecastTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    forecastDesc: {
      fontSize: 14,
      color: palette.muted,
      textAlign: 'center',
      lineHeight: 21,
    },
    betaNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.warning + '15',
      padding: 12,
      borderRadius: 10,
      gap: 10,
      marginTop: 20,
    },
    betaText: {
      flex: 1,
      fontSize: 13,
      color: palette.warning,
    },
  });
}


