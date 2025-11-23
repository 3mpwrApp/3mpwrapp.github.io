/**
 * Unified Energy & Mood Hub
 * 
 * Consolidates:
 * - Spoon Economist (energy budgeting)
 * - Energy Quantum Mechanics (energy states)
 * - Mood Tracker (AI companion)
 * - Sleep-Energy Tracker
 * - Pacing Partner (activity pacing)
 * - Spoon Marketplace (community energy trading)
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { addDoc, collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8, MAX_FONT_SCALE } from '../../../constants/A11Y';
import { auth, db } from '../../../firebase/config';
import { useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { clearCache, getCachedJSON, setCachedJSON } from '../../../services/cache';
import { useCircadianRhythmDJ } from '../../../services/circadianRhythmDJ';
import { addMood, listMoods } from '../../../services/companion';
import { useEnergyQuantumMechanics, type QuantumEnergyState } from '../../../services/energyQuantumMechanics';
import { computeMoodInsights } from '../../../services/moodInsights';
import { forecastEnergyLevels, generateAdaptiveSuggestions, type ActivityLog, type AdaptiveSuggestion, type EnergyForecast } from '../../../services/pacingAi';
import { useSpoonEconomist } from '../../../services/spoonEconomist';
import { useAppPalette } from '../../../theme/usePalette';
import { showContextualError } from '../../../utils/userFriendlyErrors';

type TabView = 'dashboard' | 'track' | 'analyze' | 'community';

// Cache keys for performance optimization
const CACHE_KEYS = {
  MOODS: 'energy-hub:moods:v1',
  ACTIVITIES: 'energy-hub:activities:v1',
  FORECASTS: 'energy-hub:forecasts:v1',
  SUGGESTIONS: 'energy-hub:suggestions:v1',
  MONTHLY_REPORT: 'energy-hub:monthly-report:v1',
} as const;

export default function EnergyMoodHub() {
  const palette = useAppPalette();
  const titleRef = React.useRef<Text>(null);
  
  useAnnounceOnMount('Energy and Mood Hub');
  useFocusOnRefOnMount(titleRef);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');

  // Advanced mode toggle
  const [advancedMode, setAdvancedMode] = useState(false);

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Spoon Economist state
  const spoons = useSpoonEconomist();
  const { account } = spoons;
  const [showCustomTaskModal, setShowCustomTaskModal] = useState(false);
  const [customTaskName, setCustomTaskName] = useState('');
  const [customTaskCost, setCustomTaskCost] = useState('');
  const [monthlyReport, setMonthlyReport] = useState<any>(null);

  // Energy Quantum Mechanics state (advanced mode)
  const quantum = useEnergyQuantumMechanics();

  // Circadian Rhythm / Sleep Tracker state
  const circadian = useCircadianRhythmDJ();
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [isSavingSleep, setIsSavingSleep] = useState(false);

  // Pacing Partner state
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activityMinutes, setActivityMinutes] = useState('');
  const [activityType, setActivityType] = useState('moderate');
  const [painLevel, setPainLevel] = useState('');
  const [fatigueLevel, setFatigueLevel] = useState('');
  const [isSavingActivity, setIsSavingActivity] = useState(false);
  const [energyForecasts, setEnergyForecasts] = useState<EnergyForecast[]>([]);
  const [pacingSuggestions, setPacingSuggestions] = useState<AdaptiveSuggestion[]>([]);

  // Mood Tracker state
  const [moods, setMoods] = useState<any[]>([]);
  const [moodNotes, setMoodNotes] = useState('');
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [moodInsights, setMoodInsights] = useState<any>(null);

  // Load data with caching
  useEffect(() => {
    const now = new Date();
    
    // Load from cache first for instant display
    (async () => {
      const cachedMoods = await getCachedJSON<any[]>(CACHE_KEYS.MOODS);
      if (cachedMoods) setMoods(cachedMoods);
      
      const cachedActivities = await getCachedJSON<ActivityLog[]>(CACHE_KEYS.ACTIVITIES);
      if (cachedActivities) setActivities(cachedActivities);
      
      const cachedForecasts = await getCachedJSON<EnergyForecast[]>(CACHE_KEYS.FORECASTS);
      if (cachedForecasts) setEnergyForecasts(cachedForecasts);
      
      const cachedSuggestions = await getCachedJSON<AdaptiveSuggestion[]>(CACHE_KEYS.SUGGESTIONS);
      if (cachedSuggestions) setPacingSuggestions(cachedSuggestions);
      
      const cachedReport = await getCachedJSON<any>(CACHE_KEYS.MONTHLY_REPORT);
      if (cachedReport) setMonthlyReport(cachedReport);
    })();
    
    // Then fetch fresh data in background
    spoons.getMonthlyReport(now.getFullYear(), now.getMonth() + 1).then((report) => {
      setMonthlyReport(report);
      setCachedJSON(CACHE_KEYS.MONTHLY_REPORT, report);
    });
    
    loadMoods();
    loadActivities();
  }, []);

  const loadActivities = useCallback(async () => {
    try {
      const uid = auth.currentUser?.uid || 'anon';
      const snap = await getDocs(
        query(collection(db, 'users', uid, 'activity_logs'), orderBy('createdAt', 'desc'))
      );
      const activityData = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as ActivityLog[];
      setActivities(activityData);
      
      // Calculate forecasts and suggestions
      const forecasts = forecastEnergyLevels(activityData);
      setEnergyForecasts(forecasts);
      
      const pain = painLevel ? parseFloat(painLevel) : undefined;
      const fatigue = fatigueLevel ? parseFloat(fatigueLevel) : undefined;
      const suggestions = generateAdaptiveSuggestions(activityData.slice(0, 10), pain, fatigue);
      setPacingSuggestions(suggestions);
      
      // Cache for instant loading next time
      setCachedJSON(CACHE_KEYS.ACTIVITIES, activityData);
      setCachedJSON(CACHE_KEYS.FORECASTS, forecasts);
      setCachedJSON(CACHE_KEYS.SUGGESTIONS, suggestions);
    } catch (err) {
      console.error('Error loading activities:', err);
    }
  }, [painLevel, fatigueLevel]);

  const loadMoods = useCallback(async () => {
    try {
      const moodData = await listMoods();
      setMoods(moodData);
      
      // Compute insights
      const entries = moodData.map((m: any, index: number) => ({
        id: m.id || `mood-${index}`,
        ts: m.createdAt?.toDate?.()?.getTime() || Date.now(),
        score: moodToScore(m.mood),
      }));
      const insights = computeMoodInsights(entries as any);
      setMoodInsights(insights);
      
      // Cache for instant loading
      setCachedJSON(CACHE_KEYS.MOODS, moodData);
    } catch (err) {
      console.error('Error loading moods:', err);
    }
  }, []);

  const moodToScore = (mood: string): number => {
    const moodMap: Record<string, number> = {
      'terrible': -2,
      'bad': -1,
      'okay': 0,
      'good': 1,
      'great': 2,
    };
    return moodMap[mood.toLowerCase()] || 0;
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Clear energy hub cache
      await clearCache('energy-hub:');
      
      // Reload all data
      await loadMoods();
      await loadActivities();
      
      const now = new Date();
      const report = await spoons.getMonthlyReport(now.getFullYear(), now.getMonth() + 1);
      setMonthlyReport(report);
      await setCachedJSON(CACHE_KEYS.MONTHLY_REPORT, report);
    } catch (err) {
      console.error('Error refreshing data:', err);
      showContextualError(err, 'refresh-data');
    } finally {
      setRefreshing(false);
    }
  }, [loadMoods, loadActivities, spoons]);

  const QUICK_TASKS = [
    { name: 'Shower', cost: 2 },
    { name: 'Get Dressed', cost: 1 },
    { name: 'Cook Meal', cost: 4 },
    { name: 'Groceries', cost: 6 },
    { name: 'Laundry', cost: 3 },
    { name: 'Dishes', cost: 2 },
    { name: 'Doctor Appointment', cost: 8 },
    { name: 'Social Event', cost: 7 },
  ];

  const MOOD_OPTIONS = [
    { emoji: '😄', label: 'Great', value: 'great', color: '#10B981' },
    { emoji: '🙂', label: 'Good', value: 'good', color: '#3B82F6' },
    { emoji: '😐', label: 'Okay', value: 'okay', color: '#6B7280' },
    { emoji: '😔', label: 'Bad', value: 'bad', color: '#F59E0B' },
    { emoji: '😢', label: 'Terrible', value: 'terrible', color: '#EF4444' },
  ];

  const spendTask = useCallback(async (taskName: string, cost: number) => {
    await spoons.spendSpoons(taskName, cost);
  }, [spoons]);

  const borrowSpoons = useCallback(async (amount: number) => {
    await spoons.borrowSpoons(amount);
  }, [spoons]);

  const addCustomTask = useCallback(async () => {
    const cost = parseInt(customTaskCost);
    if (customTaskName && !isNaN(cost)) {
      await spendTask(customTaskName, cost);
      setShowCustomTaskModal(false);
      setCustomTaskName('');
      setCustomTaskCost('');
    }
  }, [customTaskCost, customTaskName, spendTask]);

  const handleMoodLog = useCallback(async (mood: string) => {
    try {
      setIsSavingMood(true);
      await addMood(mood as any, moodNotes);
      setMoodNotes('');
      await loadMoods();
      setTimeout(() => setIsSavingMood(false), 300);
    } catch (err) {
      console.error('Error saving mood:', err);
      showContextualError({ context: 'storage', error: err instanceof Error ? err : new Error('Failed to save mood') });
      setIsSavingMood(false);
    }
  }, [loadMoods, moodNotes]);

  const handleSleepLog = useCallback(async () => {
    try {
      const hours = parseFloat(sleepHours);
      const quality = parseInt(sleepQuality);
      
      if (isNaN(hours) || hours <= 0 || hours > 24) {
        alert('Please enter valid sleep hours (0-24)');
        return;
      }
      
      if (isNaN(quality) || quality < 1 || quality > 5) {
        alert('Please enter sleep quality (1-5)');
        return;
      }

      setIsSavingSleep(true);
      
      // Log to Circadian Rhythm DJ
      const today = new Date().toISOString().split('T')[0];
      await circadian.logSleep({
        date: today,
        bedtime: -8, // Estimate 8 hours before wake
        wakeTime: 0, // Midnight reference
        totalSleep: hours,
        sleepQuality: quality as 1 | 2 | 3 | 4 | 5,
        nightmares: false,
      });
      
      setSleepHours('');
      setSleepQuality('');
      setTimeout(() => setIsSavingSleep(false), 300);
    } catch (err) {
      console.error('Error saving sleep:', err);
      showContextualError({ context: 'storage', error: err instanceof Error ? err : new Error('Failed to save sleep') });
      setIsSavingSleep(false);
    }
  }, [circadian, sleepHours, sleepQuality]);

  const handleActivityLog = useCallback(async () => {
    try {
      const minutes = parseFloat(activityMinutes);
      const pain = painLevel ? parseFloat(painLevel) : undefined;
      const fatigue = fatigueLevel ? parseFloat(fatigueLevel) : undefined;
      
      if (isNaN(minutes) || minutes <= 0 || minutes > 480) {
        alert('Please enter valid minutes (0-480)');
        return;
      }
      
      if (pain !== undefined && (isNaN(pain) || pain < 0 || pain > 10)) {
        alert('Pain level must be between 0 and 10');
        return;
      }
      
      if (fatigue !== undefined && (isNaN(fatigue) || fatigue < 0 || fatigue > 10)) {
        alert('Fatigue level must be between 0 and 10');
        return;
      }

      setIsSavingActivity(true);
      
      // Save activity to Firestore
      const uid = auth.currentUser?.uid || 'anon';
      await addDoc(collection(db, 'users', uid, 'activity_logs'), {
        minutes,
        type: activityType,
        intensity: activityType as 'low' | 'moderate' | 'high',
        painLevel: pain,
        fatigueLevel: fatigue,
        createdAt: Timestamp.now(),
      });
      
      setActivityMinutes('');
      setPainLevel('');
      setFatigueLevel('');
      await loadActivities(); // Reload to update forecasts
      setTimeout(() => setIsSavingActivity(false), 300);
    } catch (err) {
      console.error('Error saving activity:', err);
      showContextualError({ context: 'storage', error: err instanceof Error ? err : new Error('Failed to save activity') });
      setIsSavingActivity(false);
    }
  }, [activityMinutes, activityType, painLevel, fatigueLevel, loadActivities]);

  // Calculate sleep-energy correlation
  const getSleepEnergyCorrelation = useCallback(async () => {
    const sleepData = circadian.getSleepHistory(14); // Last 14 days
    const moodData = await listMoods();

    // Filter to last 14 days
    const now = Date.now();
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
    const recentMoods = moodData.filter((m: any) => {
      const moodTime = m.createdAt?.toDate?.()?.getTime() || 0;
      return moodTime >= fourteenDaysAgo;
    });

    if (sleepData.length < 3 || recentMoods.length < 3) {
      return null; // Need at least 3 data points
    }

    // Match sleep and mood by date
    const matchedData: Array<{ sleep: number; quality: number; mood: number }> = [];
    sleepData.forEach((sleep: any) => {
      const matchingMood = recentMoods.find((m: any) => {
        const moodDate = new Date(m.createdAt?.toDate?.() || 0).toISOString().split('T')[0];
        return moodDate === sleep.date;
      });
      if (matchingMood) {
        matchedData.push({
          sleep: sleep.totalSleep,
          quality: sleep.sleepQuality,
          mood: moodToScore(matchingMood.mood),
        });
      }
    });

    if (matchedData.length < 3) return null;

    // Calculate correlation coefficient (Pearson's r)
    const meanSleep = matchedData.reduce((sum, d) => sum + d.sleep, 0) / matchedData.length;
    const meanMood = matchedData.reduce((sum, d) => sum + d.mood, 0) / matchedData.length;

    let numerator = 0;
    let denomSleep = 0;
    let denomMood = 0;

    matchedData.forEach((d) => {
      const sleepDiff = d.sleep - meanSleep;
      const moodDiff = d.mood - meanMood;
      numerator += sleepDiff * moodDiff;
      denomSleep += sleepDiff * sleepDiff;
      denomMood += moodDiff * moodDiff;
    });

    const correlation = numerator / Math.sqrt(denomSleep * denomMood);

    // Average sleep hours and quality
    const avgSleep = meanSleep;
    const avgQuality = matchedData.reduce((sum, d) => sum + d.quality, 0) / matchedData.length;

    return {
      correlation: isNaN(correlation) ? 0 : correlation,
      avgSleep,
      avgQuality,
      dataPoints: matchedData.length,
    };
  }, [circadian, moods]);

  const [sleepEnergyStats, setSleepEnergyStats] = useState<{
    correlation: number;
    avgSleep: number;
    avgQuality: number;
    dataPoints: number;
  } | null>(null);

  // Load sleep-energy correlation on mount
  useEffect(() => {
    getSleepEnergyCorrelation().then(setSleepEnergyStats);
  }, [getSleepEnergyCorrelation]);

  // Memoize expensive calculations
  const sleepHistory = useMemo(() => circadian.getSleepHistory(3), [circadian]);
  const recentMoods = useMemo(() => moods.slice(0, 3), [moods]);
  const recentActivities = useMemo(() => activities.slice(0, 3), [activities]);


  const renderDashboard = () => (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} />
      }
    >
      {/* Advanced Mode Toggle */}
      <View style={[styles.card, { backgroundColor: palette.surface }]}>
        <Pressable
          style={styles.advancedToggle}
          onPress={() => setAdvancedMode(!advancedMode)}
        >
          <View style={styles.toggleLeft}>
            <Ionicons 
              name={advancedMode ? "flash" : "flash-outline"} 
              size={24} 
              color={palette.primary} 
            />
            <View style={styles.toggleText}>
              <Text style={[styles.toggleTitle, { color: palette.text }]}>
                Advanced Energy Mode
              </Text>
              <Text style={[styles.toggleDescription, { color: palette.textSecondary }]}>
                Quantum states, energy debt, forecasting
              </Text>
            </View>
          </View>
          <View style={[
            styles.toggleSwitch,
            { backgroundColor: advancedMode ? palette.primary : palette.border }
          ]}>
            <View style={[
              styles.toggleKnob,
              { transform: [{ translateX: advancedMode ? 20 : 2 }] }
            ]} />
          </View>
        </Pressable>
      </View>

      {/* Quantum Energy State (Advanced Mode Only) */}
      {advancedMode && (
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: palette.text }]}>Quantum Energy State</Text>
              <Text style={[styles.cardSubtitle, { color: palette.textSecondary }]}>
                {quantum.metrics.quantumState.replace(/_/g, ' ')}
              </Text>
            </View>
            <View style={[styles.quantumBadge, { backgroundColor: getQuantumColor(quantum.metrics.quantumState) }]}>
              <Ionicons name="flash" size={20} color="#FFF" />
            </View>
          </View>

          <View style={styles.quantumMetrics}>
            <View style={styles.quantumMetricItem}>
              <Text style={[styles.quantumMetricLabel, { color: palette.textSecondary }]}>
                Energy Level
              </Text>
              <Text style={[styles.quantumMetricValue, { color: palette.text }]}>
                {quantum.metrics.currentEnergy}/100
              </Text>
            </View>
            <View style={styles.quantumMetricItem}>
              <Text style={[styles.quantumMetricLabel, { color: palette.textSecondary }]}>
                Volatility
              </Text>
              <Text style={[styles.quantumMetricValue, { color: palette.text }]}>
                {quantum.metrics.volatility}%
              </Text>
            </View>
            <View style={styles.quantumMetricItem}>
              <Text style={[styles.quantumMetricLabel, { color: palette.textSecondary }]}>
                Sustainability
              </Text>
              <Text style={[styles.quantumMetricValue, { color: getSustainabilityColor(quantum.metrics.sustainabilityScore) }]}>
                {quantum.metrics.sustainabilityScore}/100
              </Text>
            </View>
          </View>

          {quantum.metrics.debt.currentBalance > 0 && (
            <View style={[styles.alertBanner, { backgroundColor: '#F8D7DA', marginTop: 12 }]}>
              <Ionicons name="warning" size={20} color="#721C24" />
              <Text style={[styles.alertText, { color: '#721C24' }]}>
                Energy debt: {quantum.metrics.debt.currentBalance.toFixed(1)} units
                {' '}({(quantum.metrics.debt.interestRate * 100).toFixed(1)}% compound interest)
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Energy Overview Card */}
      <View style={[styles.card, { backgroundColor: palette.surface }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: palette.text }]}>Energy Status</Text>
            <Text style={[styles.cardSubtitle, { color: palette.textSecondary }]}>Today's Spoon Budget</Text>
          </View>
          <Text style={[styles.largeStat, { color: palette.primary }]}>
            {account?.currentSpoons || 0}/{account?.todayAllocated || 12} 🥄
          </Text>
        </View>

        <View style={styles.spoonVisual}>
          {Array.from({ length: account?.todayAllocated || 12 }).map((_, index) => (
            <Text key={index} style={[styles.spoonIcon, { opacity: index < (account?.currentSpoons || 0) ? 1 : 0.3 }]}>
              🥄
            </Text>
          ))}
        </View>

        {account && account.currentSpoons < 3 && account.currentSpoons > 0 && (
          <View style={[styles.alertBanner, { backgroundColor: '#FFF3CD' }]}>
            <Ionicons name="warning" size={20} color="#856404" />
            <Text style={[styles.alertText, { color: '#856404' }]}>
              Low energy! Only {account.currentSpoons} spoons left today.
            </Text>
          </View>
        )}

        {account && account.debtSpoons > 0 && (
          <View style={[styles.alertBanner, { backgroundColor: '#F8D7DA', marginTop: 8 }]}>
            <Ionicons name="alert-circle" size={20} color="#721C24" />
            <Text style={[styles.alertText, { color: '#721C24' }]}>
              Energy debt: {account.debtSpoons.toFixed(1)} spoons owed
            </Text>
          </View>
        )}
      </View>

      {/* Mood Overview Card */}
      <View style={[styles.card, { backgroundColor: palette.surface }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: palette.text }]}>Mood Tracking</Text>
            <Text style={[styles.cardSubtitle, { color: palette.textSecondary }]}>7-Day Average</Text>
          </View>
          {moodInsights && (
            <Text style={[styles.largeStat, { color: getMoodColor(moodInsights.avg7d) }]}>
              {moodInsights.avg7d !== null ? moodInsights.avg7d.toFixed(1) : '--'}
            </Text>
          )}
        </View>

        {moodInsights && (
          <View style={styles.insightsRow}>
            <View style={styles.insightItem}>
              <Text style={[styles.insightLabel, { color: palette.textSecondary }]}>Trend</Text>
              <Text style={[styles.insightValue, { color: getTrendColor(moodInsights.trend) }]}>
                {getTrendIcon(moodInsights.trend)} {capitalize(moodInsights.trend)}
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={[styles.insightLabel, { color: palette.textSecondary }]}>Streak</Text>
              <Text style={[styles.insightValue, { color: palette.text }]}>
                {moodInsights.streakDays} days
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={[styles.card, { backgroundColor: palette.surface }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Quick Actions</Text>
        
        <A11yPressable
          onPress={() => setActiveTab('track')}
          style={[styles.actionButton, { backgroundColor: palette.primary }]}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="add-circle" size={24} color="#FFF" />
          <Text style={styles.actionButtonText}>Log Energy & Mood</Text>
        </A11yPressable>

        <A11yPressable
          onPress={() => setActiveTab('analyze')}
          style={[styles.actionButton, { backgroundColor: palette.secondary, marginTop: 8 }]}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="analytics" size={24} color="#FFF" />
          <Text style={styles.actionButtonText}>View Insights</Text>
        </A11yPressable>
      </View>

      {/* Recent Activity */}
      {recentMoods.length > 0 && (
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Recent Mood Entries</Text>
          {recentMoods.map((mood, index) => (
            <View key={index} style={[styles.moodHistoryItem, { borderBottomColor: palette.border }]}>
              <Text style={[styles.moodHistoryEmoji]}>
                {MOOD_OPTIONS.find(m => m.value === mood.mood)?.emoji || '😐'}
              </Text>
              <View style={styles.moodHistoryContent}>
                <Text style={[styles.moodHistoryLabel, { color: palette.text }]}>
                  {capitalize(mood.mood)}
                </Text>
                {mood.notes && (
                  <Text style={[styles.moodHistoryNotes, { color: palette.textSecondary }]} numberOfLines={1}>
                    {mood.notes}
                  </Text>
                )}
              </View>
              <Text style={[styles.moodHistoryTime, { color: palette.textSecondary }]}>
                {formatTimeAgo(mood.createdAt?.toDate?.() || new Date())}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );

  const renderTrack = () => (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} />
      }
    >
      {/* Energy Tracking */}
      <View style={[styles.card, { backgroundColor: palette.surface }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Log Energy Spent</Text>
        <Text style={[styles.sectionDescription, { color: palette.textSecondary }]}>
          Current balance: {account?.currentSpoons || 0}/{account?.todayAllocated || 12} 🥄
        </Text>

        <View style={styles.taskGrid}>
          {QUICK_TASKS.map((task) => (
            <Pressable
              key={task.name}
              style={[styles.taskButton, { backgroundColor: palette.primary + '20', borderColor: palette.primary }]}
              onPress={() => spendTask(task.name, task.cost)}
            >
              <Text style={[styles.taskName, { color: palette.text }]}>{task.name}</Text>
              <Text style={[styles.taskCost, { color: palette.primary }]}>{task.cost} 🥄</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.customButton, { backgroundColor: palette.surface, borderColor: palette.border }]}
          onPress={() => setShowCustomTaskModal(true)}
        >
          <Ionicons name="add-circle" size={20} color={palette.primary} />
          <Text style={[styles.customButtonText, { color: palette.primary }]}>Custom Task</Text>
        </Pressable>
      </View>

      {/* Mood Tracking */}
      <View style={[styles.card, { backgroundColor: palette.surface }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Log Your Mood</Text>
        
        <View style={styles.moodGrid}>
          {MOOD_OPTIONS.map((mood) => (
            <Pressable
              key={mood.value}
              style={[styles.moodButton, { backgroundColor: mood.color + '20', borderColor: mood.color }]}
              onPress={() => handleMoodLog(mood.value)}
              disabled={isSavingMood}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={[styles.notesInput, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
          placeholder="Optional notes about your mood..."
          placeholderTextColor={palette.textSecondary}
          multiline
          numberOfLines={3}
          value={moodNotes}
          onChangeText={setMoodNotes}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />

        {isSavingMood && (
          <View style={styles.savingIndicator}>
            <ActivityIndicator size="small" color={palette.primary} />
            <Text style={[styles.savingText, { color: palette.textSecondary }]}>Saving...</Text>
          </View>
        )}
      </View>

      {/* Sleep Logging */}
      <View style={[styles.card, { backgroundColor: palette.surface }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Log Sleep</Text>
        <Text style={[styles.sectionDescription, { color: palette.textSecondary }]}>
          Track sleep to see energy correlations
        </Text>

        <View style={styles.sleepInputRow}>
          <View style={styles.sleepInputGroup}>
            <Text style={[styles.inputLabel, { color: palette.text }]}>Hours</Text>
            <TextInput
              style={[styles.sleepInput, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
              placeholder="7.5"
              placeholderTextColor={palette.textSecondary}
              keyboardType="decimal-pad"
              value={sleepHours}
              onChangeText={setSleepHours}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />
          </View>
          
          <View style={styles.sleepInputGroup}>
            <Text style={[styles.inputLabel, { color: palette.text }]}>Quality (1-5)</Text>
            <TextInput
              style={[styles.sleepInput, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
              placeholder="4"
              placeholderTextColor={palette.textSecondary}
              keyboardType="number-pad"
              value={sleepQuality}
              onChangeText={setSleepQuality}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />
          </View>

          <Pressable
            style={[styles.sleepLogButton, { backgroundColor: palette.primary }]}
            onPress={handleSleepLog}
            disabled={isSavingSleep}
          >
            {isSavingSleep ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="moon" size={24} color="#FFF" />
            )}
          </Pressable>
        </View>

        {sleepHistory.length > 0 && (
          <View style={styles.recentSleepContainer}>
            <Text style={[styles.recentSleepTitle, { color: palette.textSecondary }]}>Recent sleep:</Text>
            {sleepHistory.map((log: any) => (
              <Text key={log.id} style={[styles.recentSleepText, { color: palette.text }]}>
                {log.date}: {log.totalSleep.toFixed(1)}h (quality: {log.sleepQuality}/5)
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Activity Pacing */}
      <View style={[styles.card, { backgroundColor: palette.surface }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Log Activity</Text>
        <Text style={[styles.sectionDescription, { color: palette.textSecondary }]}>
          Track activities to optimize pacing and energy
        </Text>

        <View style={styles.activityTypeRow}>
          {['low', 'moderate', 'high'].map((type) => (
            <Pressable
              key={type}
              style={[
                styles.activityTypeButton,
                { borderColor: palette.border },
                activityType === type && { backgroundColor: palette.primary + '20', borderColor: palette.primary }
              ]}
              onPress={() => setActivityType(type)}
            >
              <Text style={[styles.activityTypeText, { color: activityType === type ? palette.primary : palette.text }]}>
                {type === 'low' ? '🌱 Light' : type === 'moderate' ? '⚡ Moderate' : '🔥 Heavy'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sleepInputRow}>
          <View style={styles.sleepInputGroup}>
            <Text style={[styles.inputLabel, { color: palette.text }]}>Minutes</Text>
            <TextInput
              style={[styles.sleepInput, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
              placeholder="30"
              placeholderTextColor={palette.textSecondary}
              keyboardType="number-pad"
              value={activityMinutes}
              onChangeText={setActivityMinutes}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />
          </View>
          
          <View style={styles.sleepInputGroup}>
            <Text style={[styles.inputLabel, { color: palette.text }]}>Pain (0-10)</Text>
            <TextInput
              style={[styles.sleepInput, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
              placeholder="0"
              placeholderTextColor={palette.textSecondary}
              keyboardType="number-pad"
              value={painLevel}
              onChangeText={setPainLevel}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />
          </View>

          <View style={styles.sleepInputGroup}>
            <Text style={[styles.inputLabel, { color: palette.text }]}>Fatigue (0-10)</Text>
            <TextInput
              style={[styles.sleepInput, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
              placeholder="0"
              placeholderTextColor={palette.textSecondary}
              keyboardType="number-pad"
              value={fatigueLevel}
              onChangeText={setFatigueLevel}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />
          </View>

          <Pressable
            style={[styles.sleepLogButton, { backgroundColor: palette.primary }]}
            onPress={handleActivityLog}
            disabled={isSavingActivity}
          >
            {isSavingActivity ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="fitness" size={24} color="#FFF" />
            )}
          </Pressable>
        </View>

        {recentActivities.length > 0 && (
          <View style={styles.recentSleepContainer}>
            <Text style={[styles.recentSleepTitle, { color: palette.textSecondary }]}>Recent activities:</Text>
            {recentActivities.map((activity: ActivityLog) => (
              <Text key={activity.id} style={[styles.recentSleepText, { color: palette.text }]}>
                {activity.type}: {activity.minutes}min
                {activity.fatigueLevel ? ` (fatigue: ${activity.fatigueLevel}/10)` : ''}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Borrow Energy (Emergency) */}
      <View style={[styles.card, { backgroundColor: palette.surface }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Borrow Energy</Text>
        <Text style={[styles.warningDescription, { color: palette.textSecondary }]}>
          ⚠️ Borrow from tomorrow at 50% interest (compounds daily)
        </Text>

        <View style={styles.borrowButtons}>
          <Pressable
            style={[styles.borrowButton, { backgroundColor: '#DC143C' }]}
            onPress={() => borrowSpoons(2)}
          >
            <Text style={styles.borrowButtonText}>+2 🥄</Text>
          </Pressable>
          <Pressable
            style={[styles.borrowButton, { backgroundColor: '#DC143C' }]}
            onPress={() => borrowSpoons(5)}
          >
            <Text style={styles.borrowButtonText}>+5 🥄</Text>
          </Pressable>
          <Pressable
            style={[styles.borrowButton, { backgroundColor: '#DC143C' }]}
            onPress={() => borrowSpoons(10)}
          >
            <Text style={styles.borrowButtonText}>+10 🥄</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );

  const renderAnalyze = () => (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} />
      }
    >
      {/* Monthly Energy Report */}
      {monthlyReport && (
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Monthly Energy Report</Text>

          <View style={styles.reportRow}>
            <Text style={[styles.reportLabel, { color: palette.textSecondary }]}>Top Task</Text>
            <Text style={[styles.reportValue, { color: palette.text }]}>
              {monthlyReport.topTasks[0]?.name || 'N/A'}
            </Text>
          </View>

          <View style={styles.reportRow}>
            <Text style={[styles.reportLabel, { color: palette.textSecondary }]}>Total Spent</Text>
            <Text style={[styles.reportValue, { color: palette.text }]}>
              {monthlyReport.totalSpent || 0} spoons
            </Text>
          </View>

          <View style={styles.reportRow}>
            <Text style={[styles.reportLabel, { color: palette.textSecondary }]}>Rest Days</Text>
            <Text style={[styles.reportValue, { color: palette.text }]}>
              {monthlyReport.restDays || 0}
            </Text>
          </View>

          <View style={styles.reportRow}>
            <Text style={[styles.reportLabel, { color: palette.textSecondary }]}>Debt Days</Text>
            <Text style={[styles.reportValue, { color: palette.text }]}>
              {monthlyReport.debtDays || 0}
            </Text>
          </View>

          <View style={styles.reportRow}>
            <Text style={[styles.reportLabel, { color: palette.textSecondary }]}>Average Daily Spend</Text>
            <Text style={[styles.reportValue, { color: palette.text }]}>
              {monthlyReport.averageDailySpend?.toFixed(1) || 0} spoons
            </Text>
          </View>
        </View>
      )}

      {/* Mood Insights */}
      {moodInsights && moodInsights.avg7d !== null && (
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Mood Insights</Text>

          <View style={styles.insightCard}>
            <Text style={[styles.insightCardTitle, { color: palette.text }]}>7-Day Average</Text>
            <Text style={[styles.insightCardValue, { color: getMoodColor(moodInsights.avg7d) }]}>
              {moodInsights.avg7d.toFixed(1)}
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={[styles.insightCardTitle, { color: palette.text }]}>Current Trend</Text>
            <Text style={[styles.insightCardValue, { color: getTrendColor(moodInsights.trend) }]}>
              {getTrendIcon(moodInsights.trend)} {capitalize(moodInsights.trend)}
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={[styles.insightCardTitle, { color: palette.text }]}>Tracking Streak</Text>
            <Text style={[styles.insightCardValue, { color: palette.primary }]}>
              {moodInsights.streakDays} days
            </Text>
          </View>

          {moodInsights.delta24h !== null && (
            <View style={styles.insightCard}>
              <Text style={[styles.insightCardTitle, { color: palette.text }]}>24h Change</Text>
              <Text style={[styles.insightCardValue, { color: moodInsights.delta24h >= 0 ? '#10B981' : '#EF4444' }]}>
                {moodInsights.delta24h >= 0 ? '+' : ''}{moodInsights.delta24h.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Correlation Insights (Future) */}
      {sleepEnergyStats && (
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Sleep-Energy Correlation</Text>
          
          <View style={styles.insightCard}>
            <Text style={[styles.insightCardTitle, { color: palette.text }]}>Correlation Strength</Text>
            <Text style={[styles.insightCardValue, { color: getCorrelationColor(sleepEnergyStats.correlation) }]}>
              {getCorrelationLabel(sleepEnergyStats.correlation)}
            </Text>
            <Text style={[styles.insightCardSubtext, { color: palette.textSecondary }]}>
              r = {sleepEnergyStats.correlation.toFixed(2)}
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={[styles.insightCardTitle, { color: palette.text }]}>Average Sleep</Text>
            <Text style={[styles.insightCardValue, { color: palette.primary }]}>
              {sleepEnergyStats.avgSleep.toFixed(1)}h
            </Text>
            <Text style={[styles.insightCardSubtext, { color: palette.textSecondary }]}>
              Quality: {sleepEnergyStats.avgQuality.toFixed(1)}/5
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={[styles.insightCardTitle, { color: palette.text }]}>Data Points</Text>
            <Text style={[styles.insightCardValue, { color: palette.text }]}>
              {sleepEnergyStats.dataPoints}
            </Text>
            <Text style={[styles.insightCardSubtext, { color: palette.textSecondary }]}>
              Last 14 days
            </Text>
          </View>

          {sleepEnergyStats.correlation > 0.3 && (
            <View style={[styles.insightHighlight, { backgroundColor: palette.primary + '20' }]}>
              <Ionicons name="bulb" size={16} color={palette.primary} />
              <Text style={[styles.insightHighlightText, { color: palette.primary }]}>
                Your sleep quality shows a positive correlation with energy levels. Prioritizing rest may boost your energy!
              </Text>
            </View>
          )}

          {sleepEnergyStats.correlation < -0.3 && (
            <View style={[styles.insightHighlight, { backgroundColor: '#EF4444' + '20' }]}>
              <Ionicons name="warning" size={16} color="#EF4444" />
              <Text style={[styles.insightHighlightText, { color: '#EF4444' }]}>
                Negative correlation detected. Consider reviewing sleep patterns or other factors affecting energy.
              </Text>
            </View>
          )}

          {Math.abs(sleepEnergyStats.correlation) <= 0.3 && (
            <View style={[styles.insightHighlight, { backgroundColor: palette.textSecondary + '20' }]}>
              <Ionicons name="information-circle" size={16} color={palette.textSecondary} />
              <Text style={[styles.insightHighlightText, { color: palette.textSecondary }]}>
                Weak correlation. Other factors may be influencing your energy more than sleep duration.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Energy Forecast from Activity Pacing */}
      {energyForecasts.length > 0 && (
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Energy Forecast</Text>
          <Text style={[styles.sectionDescription, { color: palette.textSecondary }]}>
            Based on your activity patterns
          </Text>
          
          {energyForecasts.map((forecast, index) => (
            <View key={index} style={styles.insightCard}>
              <Text style={[styles.insightCardTitle, { color: palette.text }]}>
                {forecast.hour}:00 - {getEnergyLevelEmoji(forecast.energyLevel)} {capitalize(forecast.energyLevel)}
              </Text>
              <Text style={[styles.insightCardSubtext, { color: palette.textSecondary }]}>
                {forecast.suggestion}
              </Text>
              <Text style={[styles.insightCardSubtext, { color: palette.textSecondary }]}>
                Confidence: {(forecast.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Adaptive Pacing Suggestions */}
      {pacingSuggestions.length > 0 && (
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Pacing Recommendations</Text>
          <Text style={[styles.sectionDescription, { color: palette.textSecondary }]}>
            Personalized based on your current state
          </Text>
          
          {pacingSuggestions.map((suggestion) => (
            <View key={suggestion.id} style={[styles.insightHighlight, { backgroundColor: palette.primary + '10', borderColor: palette.primary, borderWidth: 1 }]}>
              <Ionicons name={getPacingIcon(suggestion.category)} size={20} color={palette.primary} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.insightCardTitle, { color: palette.text, marginBottom: 4 }]}>
                  {suggestion.title}
                </Text>
                <Text style={[styles.insightHighlightText, { color: palette.textSecondary }]}>
                  {suggestion.description}
                </Text>
                <Text style={[styles.insightCardSubtext, { color: palette.textSecondary, marginTop: 4 }]}>
                  ⏱ {suggestion.estimatedMinutes} min • {suggestion.energyCost} energy
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.card, { backgroundColor: palette.surface }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Pattern Detection</Text>
        <Text style={[styles.placeholderText, { color: palette.textSecondary }]}>
          🔮 Coming soon: AI-powered pattern detection to identify correlations between your energy levels and mood.
        </Text>
      </View>

      {/* Quantum Energy Forecast (Advanced Mode) */}
      {advancedMode && (
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>7-Day Energy Forecast</Text>
          <Text style={[styles.sectionDescription, { color: palette.textSecondary }]}>
            Quantum mechanics-based prediction
          </Text>
          
          {quantum.forecastEnergy(7).map((forecast, index) => (
            <View key={index} style={[styles.forecastItem, { borderBottomColor: palette.border }]}>
              <View style={styles.forecastHeader}>
                <Text style={[styles.forecastDate, { color: palette.text }]}>
                  {new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
                <Text style={[styles.forecastLevel, { color: getForecastColor(forecast.predictedLevel) }]}>
                  {forecast.predictedLevel}%
                </Text>
              </View>
              
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceFill, 
                    { 
                      width: `${forecast.confidence}%`,
                      backgroundColor: palette.primary 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.confidenceText, { color: palette.textSecondary }]}>
                {forecast.confidence}% confidence
              </Text>
              
              {forecast.recommendations.length > 0 && (
                <View style={styles.recommendationsBox}>
                  {forecast.recommendations.map((rec, recIndex) => (
                    <Text key={recIndex} style={[styles.recommendationText, { color: palette.text }]}>
                      • {rec}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );

  const renderCommunity = () => (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} />
      }
    >
      <View style={[styles.card, { backgroundColor: palette.surface }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Spoon Marketplace</Text>
        <Text style={[styles.placeholderText, { color: palette.textSecondary }]}>
          🌐 Coming soon: Trade spoons with your community, offer help, and request support.
        </Text>
        
        <A11yPressable
          onPress={() => {/* Navigate to full marketplace */}}
          style={[styles.actionButton, { backgroundColor: palette.primary, marginTop: 16 }]}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="people" size={24} color="#FFF" />
          <Text style={styles.actionButtonText}>Open Spoon Marketplace</Text>
        </A11yPressable>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Energy & Mood Hub',
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />

      <View style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Tab Navigation */}
        <View style={[styles.tabBar, { backgroundColor: palette.surface, borderBottomColor: palette.border }]}>
          <Pressable
            style={[styles.tab, activeTab === 'dashboard' && styles.tabActive]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Ionicons
              name="speedometer"
              size={20}
              color={activeTab === 'dashboard' ? palette.primary : palette.textSecondary}
            />
            <Text style={[styles.tabText, { color: activeTab === 'dashboard' ? palette.primary : palette.textSecondary }]}>
              Dashboard
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === 'track' && styles.tabActive]}
            onPress={() => setActiveTab('track')}
          >
            <Ionicons
              name="add-circle"
              size={20}
              color={activeTab === 'track' ? palette.primary : palette.textSecondary}
            />
            <Text style={[styles.tabText, { color: activeTab === 'track' ? palette.primary : palette.textSecondary }]}>
              Track
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === 'analyze' && styles.tabActive]}
            onPress={() => setActiveTab('analyze')}
          >
            <Ionicons
              name="analytics"
              size={20}
              color={activeTab === 'analyze' ? palette.primary : palette.textSecondary}
            />
            <Text style={[styles.tabText, { color: activeTab === 'analyze' ? palette.primary : palette.textSecondary }]}>
              Analyze
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === 'community' && styles.tabActive]}
            onPress={() => setActiveTab('community')}
          >
            <Ionicons
              name="people"
              size={20}
              color={activeTab === 'community' ? palette.primary : palette.textSecondary}
            />
            <Text style={[styles.tabText, { color: activeTab === 'community' ? palette.primary : palette.textSecondary }]}>
              Community
            </Text>
          </Pressable>
        </View>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'track' && renderTrack()}
        {activeTab === 'analyze' && renderAnalyze()}
        {activeTab === 'community' && renderCommunity()}

        {/* Custom Task Modal */}
        <Modal visible={showCustomTaskModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>Custom Task</Text>

              <TextInput
                style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
                placeholder="Task name"
                placeholderTextColor={palette.textSecondary}
                value={customTaskName}
                onChangeText={setCustomTaskName}
              />

              <TextInput
                style={[styles.input, { backgroundColor: palette.background, color: palette.text, borderColor: palette.border }]}
                placeholder="Spoon cost (1-12)"
                placeholderTextColor={palette.textSecondary}
                keyboardType="numeric"
                value={customTaskCost}
                onChangeText={setCustomTaskCost}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: palette.border }]}
                  onPress={() => setShowCustomTaskModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: palette.primary }]}
                  onPress={addCustomTask}
                >
                  <Text style={styles.modalButtonText}>Add</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

// Helper functions
function getMoodColor(score: number | null): string {
  if (score === null) return '#6B7280';
  if (score >= 1.5) return '#10B981';
  if (score >= 0.5) return '#3B82F6';
  if (score >= -0.5) return '#6B7280';
  if (score >= -1.5) return '#F59E0B';
  return '#EF4444';
}

function getTrendColor(trend: string): string {
  if (trend === 'improving') return '#10B981';
  if (trend === 'declining') return '#EF4444';
  return '#6B7280';
}

function getTrendIcon(trend: string): string {
  if (trend === 'improving') return '📈';
  if (trend === 'declining') return '📉';
  return '➡️';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getQuantumColor(state: QuantumEnergyState): string {
  const colors: Record<QuantumEnergyState, string> = {
    quantum_superposition: '#9370DB',
    energy_entanglement: '#20B2AA',
    wave_collapse: '#DC143C',
    tunneling: '#FF8C00',
    zero_point: '#4169E1',
    excited_state: '#FFD700',
    ground_state: '#28A745',
  };
  return colors[state] || '#6B7280';
}

function getSustainabilityColor(score: number): string {
  if (score >= 70) return '#10B981';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

function getForecastColor(level: number): string {
  if (level >= 70) return '#10B981';
  if (level >= 40) return '#F59E0B';
  return '#EF4444';
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getCorrelationColor(r: number): string {
  const absR = Math.abs(r);
  if (absR >= 0.7) return r > 0 ? '#10B981' : '#EF4444';
  if (absR >= 0.3) return r > 0 ? '#3B82F6' : '#F59E0B';
  return '#6B7280';
}

function getCorrelationLabel(r: number): string {
  const absR = Math.abs(r);
  if (absR >= 0.7) return r > 0 ? 'Strong Positive' : 'Strong Negative';
  if (absR >= 0.3) return r > 0 ? 'Moderate Positive' : 'Moderate Negative';
  return 'Weak';
}

function getEnergyLevelEmoji(level: 'low' | 'moderate' | 'high'): string {
  if (level === 'high') return '⚡';
  if (level === 'moderate') return '🌟';
  return '🌙';
}

function getPacingIcon(category: string): any {
  const icons: Record<string, any> = {
    'rest': 'bed-outline',
    'gentle-movement': 'walk-outline',
    'breathing': 'leaf-outline',
    'adjustment': 'settings-outline',
  };
  return icons[category] || 'bulb-outline';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  largeStat: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  spoonVisual: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  spoonIcon: {
    fontSize: 24,
    marginRight: 4,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  alertText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  warningDescription: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  insightsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  insightItem: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  taskGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  taskButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskCost: {
    fontSize: 13,
  },
  customButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  moodButton: {
    width: '30%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  savingText: {
    fontSize: 14,
  },
  borrowButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  borrowButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  borrowButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  reportLabel: {
    fontSize: 14,
  },
  reportValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  insightCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  insightCardTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  insightCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  insightCardSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  insightHighlight: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
    gap: 8,
  },
  insightHighlightText: {
    fontSize: 13,
    flex: 1,
  },
  sleepInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  sleepInputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  sleepInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    height: 48,
  },
  sleepLogButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentSleepContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  recentSleepTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  recentSleepText: {
    fontSize: 13,
    marginBottom: 4,
  },
  activityTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  activityTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  activityTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  moodHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  moodHistoryEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  moodHistoryContent: {
    flex: 1,
  },
  moodHistoryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  moodHistoryNotes: {
    fontSize: 12,
    marginTop: 2,
  },
  moodHistoryTime: {
    fontSize: 12,
  },
  placeholderText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    marginLeft: 12,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  quantumBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantumMetrics: {
    flexDirection: 'row',
    marginTop: 12,
  },
  quantumMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  quantumMetricLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  quantumMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forecastItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forecastDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  forecastLevel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
  },
  confidenceText: {
    fontSize: 11,
    marginBottom: 8,
  },
  recommendationsBox: {
    marginTop: 4,
    paddingLeft: 8,
  },
  recommendationText: {
    fontSize: 12,
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
});
