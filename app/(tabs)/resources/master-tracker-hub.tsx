import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { DyslexiaText } from '../../../components/DyslexiaText';
import { GapView } from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { trackEvent } from '../../../services/analyticsClient';
import { usage } from '../../../services/usage';
import { useAppPalette } from '../../../theme/usePalette';
import { announce } from '../../../utils/announce';

const Tab = createMaterialTopTabNavigator();

export const options = { href: null };

type TrackerType = 'symptoms' | 'meds' | 'rehab' | 'appointments' | 'timeline' | 'accessibility' | 'flare' | 'energy' | 'pain';

// AsyncStorage for persistent data
let AsyncStorage: any;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

// Tracker Entry Interface
interface TrackerEntry {
  id: string;
  type: TrackerType;
  timestamp: number;
  data: Record<string, any>;
  notes?: string;
  severity?: number; // 1-10 scale
  triggers?: string[];
  location?: string; // For pain tracking
}

// Quick Log Item Interface
interface QuickLogItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  type: TrackerType;
  color: string;
  emoji?: string;
}

// Correlation Pattern Interface
interface CorrelationPattern {
  id: string;
  type: 'trigger' | 'improvement' | 'timing' | 'weather' | 'activity';
  title: string;
  description: string;
  confidence: number; // 0-100
  evidence: string[];
  recommendation: string;
}

// Flare-Up Prediction Interface
interface FlarePrediction {
  risk: 'low' | 'medium' | 'high';
  probability: number;
  factors: string[];
  preventiveActions: string[];
}

export default function MasterTrackerHub() {
  const palette = useAppPalette();
  const { t } = useTranslation();

  return (
    <ResponsiveScreenWrapper testID="master-tracker-hub-screen">
      <Tab.Navigator
        screenOptions={{
          tabBarScrollEnabled: true,
          tabBarStyle: { backgroundColor: palette.surface },
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.text + '80',
          tabBarIndicatorStyle: { backgroundColor: palette.primary },
          tabBarLabelStyle: { fontSize: 14, fontWeight: '600', textTransform: 'none' },
        }}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardTab} 
          options={{ title: t('tracker.dashboard', 'Dashboard') }}
        />
        <Tab.Screen 
          name="PainMap" 
          component={PainMapTab} 
          options={{ title: t('tracker.painMap', 'Pain Map') }}
        />
        <Tab.Screen 
          name="Symptoms" 
          component={SymptomsTab} 
          options={{ title: t('tracker.symptoms', 'Symptoms') }}
        />
        <Tab.Screen 
          name="Medications" 
          component={MedicationsTab} 
          options={{ title: t('tracker.meds', 'Medications') }}
        />
        <Tab.Screen 
          name="Energy" 
          component={EnergyTab} 
          options={{ title: t('tracker.energy', 'Energy') }}
        />
        <Tab.Screen 
          name="Flares" 
          component={FlareTab} 
          options={{ title: t('tracker.flares', 'Flare-Ups') }}
        />
        <Tab.Screen 
          name="Rehab" 
          component={RehabTab} 
          options={{ title: t('tracker.rehab', 'Rehab') }}
        />
        <Tab.Screen 
          name="Appointments" 
          component={AppointmentsTab} 
          options={{ title: t('tracker.appointments', 'Appointments') }}
        />
        <Tab.Screen 
          name="Timeline" 
          component={TimelineTab} 
          options={{ title: t('tracker.timeline', 'Timeline') }}
        />
        <Tab.Screen 
          name="Insights" 
          component={AIInsightsTab} 
          options={{ title: t('tracker.insights', 'AI Insights') }}
        />
      </Tab.Navigator>
    </ResponsiveScreenWrapper>
  );
}

// Dashboard Tab - Overview of all trackers
function DashboardTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const titleRef = useRef<Text>(null);
  const router = useRouter();

  useAnnounceOnMount(t('tracker.dashboardTitle', 'Master Tracker Dashboard'));
  useFocusOnRefOnMount(titleRef);

  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickLogModal, setQuickLogModal] = useState<TrackerType | null>(null);
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationPattern[]>([]);
  const [flarePrediction, setFlarePrediction] = useState<FlarePrediction | null>(null);

  // Load saved entries
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage?.getItem?.('tracker:entries:v2');
        if (raw) setEntries(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  // Save entries when changed
  useEffect(() => {
    if (entries.length > 0) {
      AsyncStorage?.setItem?.('tracker:entries:v2', JSON.stringify(entries));
    }
  }, [entries]);

  // Run AI analysis when entries change
  useEffect(() => {
    if (entries.length >= 5) {
      analyzePatterns(entries);
      predictFlares(entries);
    }
  }, [entries]);

  const analyzePatterns = (data: TrackerEntry[]) => {
    const patterns: CorrelationPattern[] = [];
    
    // Analyze symptom-trigger correlations
    const symptomsWithTriggers = data.filter(e => e.type === 'symptoms' && e.triggers?.length);
    const triggerCounts: Record<string, number> = {};
    symptomsWithTriggers.forEach(e => {
      e.triggers?.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });
    });
    
    Object.entries(triggerCounts).forEach(([trigger, count]) => {
      if (count >= 3) {
        patterns.push({
          id: `trigger-${trigger}`,
          type: 'trigger',
          title: `${trigger} frequently triggers symptoms`,
          description: `${trigger} appeared in ${count} symptom entries`,
          confidence: Math.min(90, 50 + count * 10),
          evidence: [`Occurred ${count} times in your logs`],
          recommendation: `Consider strategies to minimize ${trigger} exposure`
        });
      }
    });
    
    // Analyze time-of-day patterns
    const hourCounts: Record<number, number[]> = {};
    data.filter(e => e.severity).forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      if (!hourCounts[hour]) hourCounts[hour] = [];
      hourCounts[hour].push(e.severity!);
    });
    
    const highSeverityHours = Object.entries(hourCounts)
      .filter(([_, severities]) => severities.length >= 3)
      .map(([hour, severities]) => ({
        hour: parseInt(hour),
        avg: severities.reduce((a, b) => a + b, 0) / severities.length
      }))
      .filter(h => h.avg >= 6)
      .sort((a, b) => b.avg - a.avg);
    
    if (highSeverityHours.length > 0) {
      const peak = highSeverityHours[0];
      patterns.push({
        id: 'timing-peak',
        type: 'timing',
        title: `Symptoms peak around ${peak.hour}:00`,
        description: `Average severity ${peak.avg.toFixed(1)}/10 at this time`,
        confidence: 75,
        evidence: [`Based on ${hourCounts[peak.hour].length} entries`],
        recommendation: 'Plan rest periods or medication timing around this peak'
      });
    }
    
    setCorrelations(patterns);
  };

  const predictFlares = (data: TrackerEntry[]) => {
    // Simple prediction based on recent trends
    const recentEntries = data
      .filter(e => Date.now() - e.timestamp < 7 * 24 * 60 * 60 * 1000)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (recentEntries.length < 3) {
      setFlarePrediction(null);
      return;
    }
    
    const recentSeverities = recentEntries
      .filter(e => e.severity)
      .slice(0, 5)
      .map(e => e.severity!);
    
    const avgSeverity = recentSeverities.length > 0
      ? recentSeverities.reduce((a, b) => a + b, 0) / recentSeverities.length
      : 0;
    
    const isIncreasing = recentSeverities.length >= 2 && recentSeverities[0] > recentSeverities[1];
    
    let risk: 'low' | 'medium' | 'high' = 'low';
    let probability = 20;
    const factors: string[] = [];
    const preventiveActions: string[] = [];
    
    if (avgSeverity >= 7) {
      risk = 'high';
      probability = 70;
      factors.push('Recent high severity symptoms');
    } else if (avgSeverity >= 5) {
      risk = 'medium';
      probability = 45;
      factors.push('Moderate symptom levels');
    }
    
    if (isIncreasing) {
      probability += 15;
      factors.push('Symptoms trending upward');
    }
    
    // Check for missed meds
    const recentMeds = data.filter(e => 
      e.type === 'meds' && 
      Date.now() - e.timestamp < 2 * 24 * 60 * 60 * 1000
    );
    if (recentMeds.length === 0) {
      probability += 10;
      factors.push('No medication logged recently');
      preventiveActions.push('Check if medications are on schedule');
    }
    
    if (probability >= 60) risk = 'high';
    else if (probability >= 35) risk = 'medium';
    
    preventiveActions.push(
      risk === 'high' ? 'Consider contacting your healthcare provider' :
      risk === 'medium' ? 'Focus on rest and self-care today' :
      'Maintain your current routine'
    );
    
    setFlarePrediction({ risk, probability, factors, preventiveActions });
  };

  const quickLogItems: QuickLogItem[] = [
    { icon: 'medical', label: t('tracker.logSymptom', 'Log Symptom'), type: 'symptoms', color: palette.error, emoji: '🩹' },
    { icon: 'flash', label: t('tracker.logPain', 'Log Pain'), type: 'pain', color: '#FF6B6B', emoji: '⚡' },
    { icon: 'battery-half', label: t('tracker.logEnergy', 'Log Energy'), type: 'energy', color: palette.warning, emoji: '🔋' },
    { icon: 'flame', label: t('tracker.logFlare', 'Log Flare-Up'), type: 'flare', color: '#FF4500', emoji: '🔥' },
    { icon: 'fitness', label: t('tracker.logRehab', 'Log Rehab'), type: 'rehab', color: palette.primary, emoji: '💪' },
    { icon: 'calendar', label: t('tracker.logAppointment', 'Log Appointment'), type: 'appointments', color: palette.primary, emoji: '📅' },
    { icon: 'medkit', label: t('tracker.logMed', 'Log Medication'), type: 'meds', color: palette.success, emoji: '💊' },
    { icon: 'flag', label: t('tracker.logAccess', 'Log Barrier'), type: 'accessibility', color: palette.warning, emoji: '🚧' },
    { icon: 'time', label: t('tracker.logEvent', 'Log Event'), type: 'timeline', color: palette.muted, emoji: '📝' },
  ];

  // Calculate today's stats from entries
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEntries = entries.filter(e => e.timestamp >= todayStart.getTime());
  
  const stats = useMemo(() => ({
    symptomsToday: todayEntries.filter(e => e.type === 'symptoms').length,
    medsToday: todayEntries.filter(e => e.type === 'meds').length,
    rehabMinutes: todayEntries
      .filter(e => e.type === 'rehab')
      .reduce((sum, e) => sum + (e.data?.minutes || 0), 0),
    upcomingAppointments: entries.filter(e => 
      e.type === 'appointments' && 
      e.timestamp > Date.now()
    ).length,
    streakDays: calculateStreak(entries),
    avgPainLevel: calculateAvgPain(todayEntries),
    energyLevel: getLatestEnergy(todayEntries),
  }), [entries, todayEntries]);

  const handleQuickLog = useCallback((type: TrackerType) => {
    trackEvent('quick_log_used', { type });
    usage.view('resources', `/(tabs)/resources/master-tracker-hub/${type}` as any);
    setQuickLogModal(type);
  }, []);

  const saveQuickLog = useCallback((type: TrackerType, data: Partial<TrackerEntry>) => {
    const newEntry: TrackerEntry = {
      id: String(Date.now()),
      type,
      timestamp: Date.now(),
      data: data.data || {},
      notes: data.notes,
      severity: data.severity,
      triggers: data.triggers,
      location: data.location,
    };
    setEntries(prev => [newEntry, ...prev]);
    setQuickLogModal(null);
    announce(t('tracker.logged', 'Entry logged successfully'));
  }, [t]);

  const handleExportAll = useCallback(async () => {
    try {
      Alert.alert(
        t('tracker.exportTitle', 'Export All Data'),
        t('tracker.exportMessage', 'Choose export format:'),
        [
          {
            text: t('tracker.exportPDF', 'PDF Report'),
            onPress: () => exportData('pdf'),
          },
          {
            text: t('tracker.exportCSV', 'CSV Spreadsheet'),
            onPress: () => exportData('csv'),
          },
          {
            text: t('tracker.exportJSON', 'JSON Data'),
            onPress: () => exportData('json'),
          },
          {
            text: t('common.cancel', 'Cancel'),
            style: 'cancel',
          },
        ]
      );
    } catch {
      Alert.alert(t('tracker.exportError', 'Export failed'));
    }
  }, [t]);

  const exportData = async (format: 'pdf' | 'csv' | 'json') => {
    try {
      let content = '';
      const filename = `health_tracker_${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (format === 'json') {
        content = JSON.stringify({ entries, correlations, exportedAt: new Date().toISOString() }, null, 2);
      } else if (format === 'csv') {
        content = 'Date,Type,Severity,Notes,Triggers\n';
        entries.forEach(e => {
          content += `${new Date(e.timestamp).toISOString()},${e.type},${e.severity || ''},${(e.notes || '').replace(/,/g, ';')},${(e.triggers || []).join(';')}\n`;
        });
      } else {
        // PDF - generate HTML
        const html = generateReportHTML(entries, correlations, stats);
        try {
          const Print = await import('expo-print');
          const { uri } = await Print.printToFileAsync({ html });
          await Share.share({ url: uri, title: 'Health Tracker Report' });
          return;
        } catch {
          Alert.alert(t('tracker.exportError', 'PDF export failed'));
          return;
        }
      }
      
      // Share text content
      await Share.share({ message: content, title: filename });
    } catch {
      Alert.alert(t('tracker.exportError', 'Export failed'));
    }
  };

  const s = styles(palette);

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        📊 {t('tracker.dashboardTitle', 'Master Tracker Dashboard')}
      </Text>

      <DyslexiaText style={s.subtitle}>
        {t('tracker.subtitle', 'Unified health tracking with AI insights, pattern detection, and doctor-ready reports')}
      </DyslexiaText>

      <DisclaimerBanner type="medical" compact={true} />

      {/* Flare Prediction Alert */}
      {flarePrediction && flarePrediction.risk !== 'low' && (
        <View style={[s.alertCard, { 
          backgroundColor: flarePrediction.risk === 'high' ? palette.error + '20' : palette.warning + '20',
          borderColor: flarePrediction.risk === 'high' ? palette.error : palette.warning 
        }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons 
              name="warning" 
              size={24} 
              color={flarePrediction.risk === 'high' ? palette.error : palette.warning} 
            />
            <Text style={[s.alertTitle, { color: palette.text, marginLeft: 8 }]}>
              {flarePrediction.risk === 'high' ? '🔴 High Flare-Up Risk' : '🟡 Moderate Flare-Up Risk'}
            </Text>
          </View>
          <Text style={[s.alertText, { color: palette.text }]}>
            {t('tracker.flareRisk', '{{probability}}% probability based on recent patterns', { probability: flarePrediction.probability })}
          </Text>
          {flarePrediction.factors.map((factor, i) => (
            <Text key={i} style={[s.alertText, { color: palette.text, opacity: 0.9 }]}>• {factor}</Text>
          ))}
          <Text style={[s.alertText, { color: palette.text, fontWeight: '700', marginTop: 8 }]}>
            💡 {flarePrediction.preventiveActions[0]}
          </Text>
        </View>
      )}

      {/* Stats Overview */}
      <View style={[s.statsContainer, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
        <Text style={[s.statsTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('tracker.today', 'Today\'s Summary')}
        </Text>

        <View style={s.statsGrid}>
          <View style={s.statCard}>
            <Text style={{ fontSize: 28 }}>🩹</Text>
            <Text style={[s.statValue, { color: palette.text }]}>{stats.symptomsToday}</Text>
            <Text style={[s.statLabel, { color: palette.text }]}>{t('tracker.symptoms', 'Symptoms')}</Text>
          </View>

          <View style={s.statCard}>
            <Text style={{ fontSize: 28 }}>⚡</Text>
            <Text style={[s.statValue, { color: palette.text }]}>{stats.avgPainLevel > 0 ? stats.avgPainLevel.toFixed(1) : '—'}</Text>
            <Text style={[s.statLabel, { color: palette.text }]}>{t('tracker.avgPain', 'Avg Pain')}</Text>
          </View>

          <View style={s.statCard}>
            <Text style={{ fontSize: 28 }}>🔋</Text>
            <Text style={[s.statValue, { color: palette.text }]}>{stats.energyLevel > 0 ? `${stats.energyLevel}/10` : '—'}</Text>
            <Text style={[s.statLabel, { color: palette.text }]}>{t('tracker.energy', 'Energy')}</Text>
          </View>

          <View style={s.statCard}>
            <Text style={{ fontSize: 28 }}>💊</Text>
            <Text style={[s.statValue, { color: palette.text }]}>{stats.medsToday}</Text>
            <Text style={[s.statLabel, { color: palette.text }]}>{t('tracker.medications', 'Medications')}</Text>
          </View>

          <View style={s.statCard}>
            <Text style={{ fontSize: 28 }}>💪</Text>
            <Text style={[s.statValue, { color: palette.text }]}>{stats.rehabMinutes}{t('tracker.min', 'm')}</Text>
            <Text style={[s.statLabel, { color: palette.text }]}>{t('tracker.rehab', 'Rehab')}</Text>
          </View>

          <View style={s.statCard}>
            <Text style={{ fontSize: 28 }}>📅</Text>
            <Text style={[s.statValue, { color: palette.text }]}>{stats.upcomingAppointments}</Text>
            <Text style={[s.statLabel, { color: palette.text }]}>{t('tracker.upcoming', 'Upcoming')}</Text>
          </View>
        </View>

        {stats.streakDays > 0 && (
          <View style={[s.streakBanner, { backgroundColor: palette.primary + '15', borderColor: palette.primary }]}>
            <Text style={{ fontSize: 24 }}>🔥</Text>
            <Text style={[s.streakText, { color: palette.text }]}>
              {t('tracker.streak', '{{days}}-day tracking streak!', { days: stats.streakDays })}
            </Text>
          </View>
        )}
      </View>

      {/* Quick Log Button */}
      <A11yPressable
        hitSlop={HIT_SLOP_8}
        onPress={() => setShowQuickLog(!showQuickLog)}
        style={[s.quickLogButton, { backgroundColor: palette.primary }]}
      >
        <Ionicons name={showQuickLog ? "close-circle-outline" : "add-circle-outline"} size={24} color={palette.onPrimary} />
        <Text style={[s.quickLogButtonText, { color: palette.onPrimary }]}>
          {showQuickLog ? t('tracker.hideQuickLog', 'Hide Quick Log') : t('tracker.quickLog', 'Quick Log')}
        </Text>
      </A11yPressable>

      {/* Quick Log Grid */}
      {showQuickLog && (
        <View style={s.quickLogGrid}>
          {quickLogItems.map((item) => (
            <A11yPressable
              key={item.type}
              hitSlop={HIT_SLOP_8}
              onPress={() => handleQuickLog(item.type)}
              style={[s.quickLogCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}
            >
              <View style={[s.quickLogIcon, { backgroundColor: item.color + '20' }]}>
                <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
              </View>
              <Text style={[s.quickLogLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {item.label}
              </Text>
            </A11yPressable>
          ))}
        </View>
      )}

      {/* AI Correlations */}
      {correlations.length > 0 && (
        <View style={[s.insightsCard, { backgroundColor: palette.surface, borderColor: palette.primary }]}>
          <View style={s.insightsHeader}>
            <Text style={{ fontSize: 24 }}>🧠</Text>
            <Text style={[s.insightsTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t('tracker.aiPatterns', 'AI Pattern Detection')}
            </Text>
          </View>

          <View style={s.insightsList}>
            {correlations.slice(0, 3).map((pattern) => (
              <View key={pattern.id} style={s.insightItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <MaterialCommunityIcons 
                    name={
                      pattern.type === 'trigger' ? 'lightning-bolt' :
                      pattern.type === 'timing' ? 'clock-outline' :
                      pattern.type === 'weather' ? 'weather-partly-cloudy' :
                      'chart-line'
                    } 
                    size={20} 
                    color={palette.primary} 
                  />
                  <Text style={[s.insightText, { color: palette.text, fontWeight: '700', marginLeft: 8 }]}>
                    {pattern.title}
                  </Text>
                </View>
                <Text style={[s.insightText, { color: palette.text, opacity: 0.85, marginLeft: 28 }]}>
                  {pattern.description}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 28, marginTop: 4 }}>
                  <View style={{ 
                    width: 60, 
                    height: 6, 
                    backgroundColor: palette.muted, 
                    borderRadius: 3,
                    marginRight: 8 
                  }}>
                    <View style={{ 
                      width: `${pattern.confidence}%`, 
                      height: '100%', 
                      backgroundColor: pattern.confidence >= 70 ? palette.success : palette.warning,
                      borderRadius: 3 
                    }} />
                  </View>
                  <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                    {pattern.confidence}% confidence
                  </Text>
                </View>
                <Text style={[s.insightText, { color: palette.primary, marginLeft: 28, marginTop: 4, fontStyle: 'italic' }]}>
                  💡 {pattern.recommendation}
                </Text>
              </View>
            ))}
          </View>
          
          <A11yPressable
            onPress={() => router.push('/(tabs)/resources/master-tracker-hub' as any)}
            style={{ marginTop: 12, alignItems: 'center' }}
          >
            <Text style={{ color: palette.primary, fontWeight: '600' }}>
              {t('tracker.viewAllInsights', 'View All Insights →')}
            </Text>
          </A11yPressable>
        </View>
      )}

      {/* Export & Share */}
      <Text style={[s.sectionTitle, { marginTop: 32 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('tracker.exportShare', 'Export & Share')}
      </Text>

      <GapView gap={12}>
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          onPress={handleExportAll}
          style={[s.exportButton, { backgroundColor: palette.surface, borderColor: palette.muted }]}
        >
          <Ionicons name="download-outline" size={24} color={palette.primary} />
          <View style={s.exportContent}>
            <Text style={[s.exportTitle, { color: palette.text }]}>
              {t('tracker.exportAll', 'Export All Data')}
            </Text>
            <Text style={[s.exportDesc, { color: palette.text }]}>
              {t('tracker.exportAllDesc', 'Generate doctor-ready reports (PDF, CSV, JSON)')}
            </Text>
          </View>
        </A11yPressable>

        <A11yPressable
          onPress={() => router.push('/(tabs)/resources/doctor-visit-prep')}
          hitSlop={HIT_SLOP_8}
          style={[s.exportButton, { backgroundColor: palette.surface, borderColor: palette.muted }]}
        >
          <Ionicons name="medical-outline" size={24} color={palette.primary} />
          <View style={s.exportContent}>
            <Text style={[s.exportTitle, { color: palette.text }]}>
              {t('tracker.doctorReport', 'Generate Doctor Report')}
            </Text>
            <Text style={[s.exportDesc, { color: palette.text }]}>
              {t('tracker.doctorReportDesc', 'Custom report for upcoming appointments')}
            </Text>
          </View>
        </A11yPressable>

        <A11yPressable
          onPress={() => router.push('/(tabs)/advocacy/evidence-vault')}
          hitSlop={HIT_SLOP_8}
          style={[s.exportButton, { backgroundColor: palette.surface, borderColor: palette.muted }]}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color={palette.primary} />
          <View style={s.exportContent}>
            <Text style={[s.exportTitle, { color: palette.text }]}>
              {t('tracker.saveEvidence', 'Save to Evidence Vault')}
            </Text>
            <Text style={[s.exportDesc, { color: palette.text }]}>
              {t('tracker.saveEvidenceDesc', 'Secure storage for legal/insurance purposes')}
            </Text>
          </View>
        </A11yPressable>
      </GapView>

      {/* Related Tools */}
      <Text style={[s.sectionTitle, { marginTop: 32 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('tracker.relatedTools', 'Related Tools')}
      </Text>

      <View style={s.relatedGrid}>
        <A11yPressable
          onPress={() => router.push('/(tabs)/resources/appeal-command-center')}
          hitSlop={HIT_SLOP_8}
          style={[s.relatedCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}
        >
          <Text style={{ fontSize: 28 }}>⚖️</Text>
          <Text style={[s.relatedTitle, { color: palette.text }]}>
            {t('tracker.appealCenter', 'Appeal Command Center')}
          </Text>
        </A11yPressable>

        <A11yPressable
          onPress={() => router.push('/(tabs)/resources/rights-benefits-calculator')}
          hitSlop={HIT_SLOP_8}
          style={[s.relatedCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}
        >
          <Text style={{ fontSize: 28 }}>🧮</Text>
          <Text style={[s.relatedTitle, { color: palette.text }]}>
            {t('tracker.benefitsCalc', 'Benefits Calculator')}
          </Text>
        </A11yPressable>
      </View>

      {/* Quick Log Modal */}
      {quickLogModal && (
        <QuickLogModal
          type={quickLogModal}
          onClose={() => setQuickLogModal(null)}
          onSave={(data) => saveQuickLog(quickLogModal, data)}
          palette={palette}
          t={t}
        />
      )}
    </ScrollView>
  );
}

// Individual tracker tabs (simplified for now - full implementation would load actual data)
function SymptomsTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.symptomsTracking', 'Symptom Tracking')}
      </Text>
      <Text style={styles(palette).comingSoon}>
        {t('tracker.chronicTrackerMigration', 'Full symptom tracking features migrating from Chronic Tracker...')}
      </Text>
      <A11yPressable onPress={() => router.push('/(tabs)/resources/chronic-tracker')} style={[styles(palette).tempLink, { backgroundColor: palette.primary }]}>
        <Text style={{ color: palette.onPrimary }}>
          {t('tracker.useChronicTracker', 'Use Chronic Tracker (Temporary)')}
        </Text>
      </A11yPressable>
    </ScrollView>
  );
}

function MedicationsTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.medsTracking', 'Medication Tracking')}
      </Text>
      <Text style={styles(palette).comingSoon}>
        {t('tracker.medsTrackerMigration', 'Full medication tracking features migrating from Meds Tracker...')}
      </Text>
      <A11yPressable onPress={() => router.push('/(tabs)/resources/meds-tracker')} style={[styles(palette).tempLink, { backgroundColor: palette.primary }]}>
        <Text style={{ color: palette.onPrimary }}>
          {t('tracker.useMedsTracker', 'Use Meds Tracker (Temporary)')}
        </Text>
      </A11yPressable>
    </ScrollView>
  );
}

function RehabTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.rehabTracking', 'Rehab Progress Tracking')}
      </Text>
      <Text style={styles(palette).comingSoon}>
        {t('tracker.rehabTrackerMigration', 'Full rehab tracking features migrating from Rehab Tracker...')}
      </Text>
      <A11yPressable onPress={() => router.push('/(tabs)/resources/rehab-tracker')} style={[styles(palette).tempLink, { backgroundColor: palette.primary }]}>
        <Text style={{ color: palette.onPrimary }}>
          {t('tracker.useRehabTracker', 'Use Rehab Tracker (Temporary)')}
        </Text>
      </A11yPressable>
    </ScrollView>
  );
}

function AppointmentsTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.appointmentsTracking', 'Appointments & Doctor Visits')}
      </Text>
      <Text style={styles(palette).comingSoon}>
        {t('tracker.doctorPrepMigration', 'Full appointment prep features migrating from Doctor Visit Prep...')}
      </Text>
      <A11yPressable onPress={() => router.push('/(tabs)/resources/doctor-visit-prep')} style={[styles(palette).tempLink, { backgroundColor: palette.primary }]}>
        <Text style={{ color: palette.onPrimary }}>
          {t('tracker.useDoctorPrep', 'Use Doctor Visit Prep (Temporary)')}
        </Text>
      </A11yPressable>
    </ScrollView>
  );
}

function TimelineTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.timelineTracking', 'Case Timeline')}
      </Text>
      <Text style={styles(palette).comingSoon}>
        {t('tracker.timelineMigration', 'Full timeline features migrating from Case Timeline...')}
      </Text>
      <A11yPressable onPress={() => router.push('/(tabs)/resources/case-timeline')} style={[styles(palette).tempLink, { backgroundColor: palette.primary }]}>
        <Text style={{ color: palette.onPrimary }}>
          {t('tracker.useCaseTimeline', 'Use Case Timeline (Temporary)')}
        </Text>
      </A11yPressable>
    </ScrollView>
  );
}

// Helper Functions
function calculateStreak(entries: TrackerEntry[]): number {
  if (entries.length === 0) return 0;
  
  const dates = new Set(entries.map(e => 
    new Date(e.timestamp).toISOString().split('T')[0]
  ));
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (dates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  
  return streak;
}

function calculateAvgPain(entries: TrackerEntry[]): number {
  const painEntries = entries.filter(e => 
    (e.type === 'pain' || e.type === 'symptoms') && e.severity
  );
  if (painEntries.length === 0) return 0;
  return painEntries.reduce((sum, e) => sum + (e.severity || 0), 0) / painEntries.length;
}

function getLatestEnergy(entries: TrackerEntry[]): number {
  const energyEntry = entries
    .filter(e => e.type === 'energy')
    .sort((a, b) => b.timestamp - a.timestamp)[0];
  return energyEntry?.severity || 0;
}

function generateReportHTML(
  entries: TrackerEntry[], 
  correlations: CorrelationPattern[], 
  stats: Record<string, any>
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 30px; }
        .summary { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .stat { display: inline-block; margin: 10px 20px 10px 0; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .stat-label { color: #6b7280; }
        .pattern { background: #eff6ff; padding: 12px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #2563eb; }
        .entry { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .severity-high { color: #dc2626; }
        .severity-medium { color: #f59e0b; }
        .severity-low { color: #10b981; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>📊 Health Tracker Report</h1>
      <p>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      
      <div class="summary">
        <h2>Today's Summary</h2>
        <div class="stat">
          <div class="stat-value">${stats.symptomsToday || 0}</div>
          <div class="stat-label">Symptoms Logged</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.avgPainLevel ? stats.avgPainLevel.toFixed(1) : '—'}</div>
          <div class="stat-label">Avg Pain Level</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.medsToday || 0}</div>
          <div class="stat-label">Medications</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.rehabMinutes || 0}min</div>
          <div class="stat-label">Rehab Time</div>
        </div>
      </div>
      
      ${correlations.length > 0 ? `
        <h2>🧠 AI-Detected Patterns</h2>
        ${correlations.map(p => `
          <div class="pattern">
            <strong>${p.title}</strong><br>
            ${p.description}<br>
            <em>Confidence: ${p.confidence}%</em><br>
            💡 ${p.recommendation}
          </div>
        `).join('')}
      ` : ''}
      
      <h2>📝 Recent Entries (Last 30 Days)</h2>
      ${entries.slice(0, 50).map(e => `
        <div class="entry">
          <strong>${e.type.toUpperCase()}</strong> - 
          ${new Date(e.timestamp).toLocaleDateString()} ${new Date(e.timestamp).toLocaleTimeString()}
          ${e.severity ? `<span class="${e.severity >= 7 ? 'severity-high' : e.severity >= 4 ? 'severity-medium' : 'severity-low'}"> (Severity: ${e.severity}/10)</span>` : ''}
          ${e.notes ? `<br><em>${e.notes}</em>` : ''}
          ${e.triggers?.length ? `<br>Triggers: ${e.triggers.join(', ')}` : ''}
        </div>
      `).join('')}
      
      <div class="footer">
        <p>This report was generated by 3MPWR App Master Tracker Hub.</p>
        <p><strong>Disclaimer:</strong> This data is for informational purposes only and is not a substitute for professional medical advice.</p>
      </div>
    </body>
    </html>
  `;
}

// Quick Log Modal Component
function QuickLogModal({ 
  type, 
  onClose, 
  onSave, 
  palette, 
  t 
}: { 
  type: TrackerType; 
  onClose: () => void; 
  onSave: (data: Partial<TrackerEntry>) => void;
  palette: ReturnType<typeof useAppPalette>;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [triggers, setTriggers] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [customData, setCustomData] = useState<Record<string, any>>({});

  const COMMON_TRIGGERS = [
    'Stress', 'Weather', 'Poor Sleep', 'Activity', 'Food', 
    'Work', 'Standing', 'Sitting', 'Walking', 'Lifting',
    'Cold', 'Heat', 'Noise', 'Light', 'Travel'
  ];

  const BODY_LOCATIONS = [
    'Head', 'Neck', 'Shoulder (L)', 'Shoulder (R)', 
    'Upper Back', 'Lower Back', 'Hip (L)', 'Hip (R)',
    'Knee (L)', 'Knee (R)', 'Ankle (L)', 'Ankle (R)',
    'Wrist (L)', 'Wrist (R)', 'Hand (L)', 'Hand (R)',
    'Full Body', 'Chest', 'Abdomen'
  ];

  const handleSave = () => {
    onSave({
      severity: type === 'energy' ? severity : (type === 'symptoms' || type === 'pain' || type === 'flare') ? severity : undefined,
      notes: notes.trim() || undefined,
      triggers: triggers.length > 0 ? triggers : undefined,
      location: location || undefined,
      data: customData,
    });
  };

  const toggleTrigger = (trigger: string) => {
    setTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const getTitle = () => {
    switch (type) {
      case 'symptoms': return '🩹 Log Symptom';
      case 'pain': return '⚡ Log Pain';
      case 'energy': return '🔋 Log Energy Level';
      case 'flare': return '🔥 Log Flare-Up';
      case 'meds': return '💊 Log Medication';
      case 'rehab': return '💪 Log Rehab Activity';
      case 'appointments': return '📅 Log Appointment';
      case 'accessibility': return '🚧 Log Accessibility Barrier';
      case 'timeline': return '📝 Log Event';
      default: return 'Quick Log';
    }
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ 
          backgroundColor: palette.surface, 
          borderTopLeftRadius: 20, 
          borderTopRightRadius: 20,
          maxHeight: '90%',
          padding: 20 
        }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: palette.text }}>{getTitle()}</Text>
              <Pressable onPress={onClose} hitSlop={HIT_SLOP_8}>
                <Ionicons name="close-circle" size={28} color={palette.muted} />
              </Pressable>
            </View>

            {/* Severity Slider */}
            {(type === 'symptoms' || type === 'pain' || type === 'flare' || type === 'energy') && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: palette.text, fontWeight: '600', marginBottom: 8 }}>
                  {type === 'energy' ? t('tracker.energyLevel', 'Energy Level') : t('tracker.severity', 'Severity')}: {severity}/10
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <Pressable
                      key={num}
                      onPress={() => setSeverity(num)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: severity >= num 
                          ? (type === 'energy' 
                              ? (num >= 7 ? palette.success : num >= 4 ? palette.warning : palette.error)
                              : (num >= 7 ? palette.error : num >= 4 ? palette.warning : palette.success))
                          : palette.muted + '40',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ 
                        color: severity >= num ? palette.onPrimary : palette.text, 
                        fontSize: 12, 
                        fontWeight: '600' 
                      }}>
                        {num}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                    {type === 'energy' ? t('tracker.lowEnergy', 'Low') : t('tracker.mild', 'Mild')}
                  </Text>
                  <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                    {type === 'energy' ? t('tracker.highEnergy', 'High') : t('tracker.severe', 'Severe')}
                  </Text>
                </View>
              </View>
            )}

            {/* Body Location (for pain) */}
            {type === 'pain' && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: palette.text, fontWeight: '600', marginBottom: 8 }}>
                  {t('tracker.location', 'Location')}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {BODY_LOCATIONS.map(loc => (
                    <Pressable
                      key={loc}
                      onPress={() => setLocation(loc)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        backgroundColor: location === loc ? palette.primary : palette.background,
                        borderWidth: 1,
                        borderColor: location === loc ? palette.primary : palette.muted,
                      }}
                    >
                      <Text style={{ 
                        color: location === loc ? palette.onPrimary : palette.text,
                        fontSize: 13,
                      }}>
                        {loc}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Triggers */}
            {(type === 'symptoms' || type === 'pain' || type === 'flare') && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: palette.text, fontWeight: '600', marginBottom: 8 }}>
                  {t('tracker.triggers', 'Possible Triggers')}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {COMMON_TRIGGERS.map(trigger => (
                    <Pressable
                      key={trigger}
                      onPress={() => toggleTrigger(trigger)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        backgroundColor: triggers.includes(trigger) ? palette.primary : palette.background,
                        borderWidth: 1,
                        borderColor: triggers.includes(trigger) ? palette.primary : palette.muted,
                      }}
                    >
                      <Text style={{ 
                        color: triggers.includes(trigger) ? palette.onPrimary : palette.text,
                        fontSize: 13,
                      }}>
                        {trigger}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Medication-specific fields */}
            {type === 'meds' && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: palette.text, fontWeight: '600', marginBottom: 8 }}>
                  {t('tracker.medName', 'Medication Name')}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: palette.muted,
                    borderRadius: 8,
                    padding: 12,
                    color: palette.text,
                    backgroundColor: palette.background,
                    marginBottom: 12,
                  }}
                  placeholder={t('tracker.medNamePlaceholder', 'Enter medication name')}
                  placeholderTextColor={palette.text + '77'}
                  value={customData.medName || ''}
                  onChangeText={(text) => setCustomData(prev => ({ ...prev, medName: text }))}
                />
                <Text style={{ color: palette.text, fontWeight: '600', marginBottom: 8 }}>
                  {t('tracker.dosage', 'Dosage')}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: palette.muted,
                    borderRadius: 8,
                    padding: 12,
                    color: palette.text,
                    backgroundColor: palette.background,
                  }}
                  placeholder={t('tracker.dosagePlaceholder', 'e.g., 500mg')}
                  placeholderTextColor={palette.text + '77'}
                  value={customData.dosage || ''}
                  onChangeText={(text) => setCustomData(prev => ({ ...prev, dosage: text }))}
                />
              </View>
            )}

            {/* Rehab-specific fields */}
            {type === 'rehab' && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: palette.text, fontWeight: '600', marginBottom: 8 }}>
                  {t('tracker.activityType', 'Activity Type')}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: palette.muted,
                    borderRadius: 8,
                    padding: 12,
                    color: palette.text,
                    backgroundColor: palette.background,
                    marginBottom: 12,
                  }}
                  placeholder={t('tracker.activityPlaceholder', 'e.g., Stretching, Walking, PT Exercises')}
                  placeholderTextColor={palette.text + '77'}
                  value={customData.activity || ''}
                  onChangeText={(text) => setCustomData(prev => ({ ...prev, activity: text }))}
                />
                <Text style={{ color: palette.text, fontWeight: '600', marginBottom: 8 }}>
                  {t('tracker.durationMinutes', 'Duration (minutes)')}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: palette.muted,
                    borderRadius: 8,
                    padding: 12,
                    color: palette.text,
                    backgroundColor: palette.background,
                  }}
                  placeholder="30"
                  placeholderTextColor={palette.text + '77'}
                  keyboardType="numeric"
                  value={customData.minutes?.toString() || ''}
                  onChangeText={(text) => setCustomData(prev => ({ ...prev, minutes: parseInt(text) || 0 }))}
                />
              </View>
            )}

            {/* Notes */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: palette.text, fontWeight: '600', marginBottom: 8 }}>
                {t('tracker.notes', 'Notes')} ({t('common.optional', 'optional')})
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: palette.muted,
                  borderRadius: 8,
                  padding: 12,
                  color: palette.text,
                  backgroundColor: palette.background,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
                placeholder={t('tracker.notesPlaceholder', 'Any additional details...')}
                placeholderTextColor={palette.text + '77'}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              style={{
                backgroundColor: palette.primary,
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ color: palette.onPrimary, fontWeight: '700', fontSize: 16 }}>
                {t('tracker.saveEntry', 'Save Entry')}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Pain Map Tab - Visual body pain tracker
function PainMapTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const router = useRouter();
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.painMapTitle', '🗺️ Interactive Pain Map')}
      </Text>
      <DyslexiaText style={styles(palette).comingSoon}>
        {t('tracker.painMapDesc', 'Tap body regions to log pain location and intensity. Track patterns over time.')}
      </DyslexiaText>
      
      <View style={{ 
        backgroundColor: palette.surface, 
        borderRadius: 12, 
        padding: 20, 
        alignItems: 'center',
        marginTop: 16 
      }}>
        {/* Simplified body outline with tappable regions */}
        <View style={{ width: 200, height: 350, position: 'relative' }}>
          {/* Head */}
          <Pressable style={[painMapStyles.bodyPart, { top: 0, left: 75, width: 50, height: 50, borderRadius: 25 }]}>
            <Text style={{ fontSize: 24 }}>🧠</Text>
          </Pressable>
          {/* Neck */}
          <Pressable style={[painMapStyles.bodyPart, { top: 55, left: 85, width: 30, height: 20 }]}>
            <Text style={{ fontSize: 12 }}>Neck</Text>
          </Pressable>
          {/* Shoulders */}
          <Pressable style={[painMapStyles.bodyPart, { top: 75, left: 40, width: 40, height: 30 }]}>
            <Text style={{ fontSize: 10 }}>L Shoulder</Text>
          </Pressable>
          <Pressable style={[painMapStyles.bodyPart, { top: 75, left: 120, width: 40, height: 30 }]}>
            <Text style={{ fontSize: 10 }}>R Shoulder</Text>
          </Pressable>
          {/* Upper Back / Chest */}
          <Pressable style={[painMapStyles.bodyPart, { top: 105, left: 60, width: 80, height: 50 }]}>
            <Text style={{ fontSize: 12 }}>Torso</Text>
          </Pressable>
          {/* Lower Back */}
          <Pressable style={[painMapStyles.bodyPart, { top: 160, left: 65, width: 70, height: 40 }]}>
            <Text style={{ fontSize: 12 }}>Lower Back</Text>
          </Pressable>
          {/* Hips */}
          <Pressable style={[painMapStyles.bodyPart, { top: 205, left: 50, width: 45, height: 35 }]}>
            <Text style={{ fontSize: 10 }}>L Hip</Text>
          </Pressable>
          <Pressable style={[painMapStyles.bodyPart, { top: 205, left: 105, width: 45, height: 35 }]}>
            <Text style={{ fontSize: 10 }}>R Hip</Text>
          </Pressable>
          {/* Knees */}
          <Pressable style={[painMapStyles.bodyPart, { top: 260, left: 55, width: 35, height: 30 }]}>
            <Text style={{ fontSize: 10 }}>L Knee</Text>
          </Pressable>
          <Pressable style={[painMapStyles.bodyPart, { top: 260, left: 110, width: 35, height: 30 }]}>
            <Text style={{ fontSize: 10 }}>R Knee</Text>
          </Pressable>
          {/* Ankles/Feet */}
          <Pressable style={[painMapStyles.bodyPart, { top: 310, left: 55, width: 35, height: 30 }]}>
            <Text style={{ fontSize: 10 }}>L Foot</Text>
          </Pressable>
          <Pressable style={[painMapStyles.bodyPart, { top: 310, left: 110, width: 35, height: 30 }]}>
            <Text style={{ fontSize: 10 }}>R Foot</Text>
          </Pressable>
        </View>
        <Text style={{ color: palette.textSecondary, marginTop: 16, textAlign: 'center' }}>
          {t('tracker.painMapHint', 'Tap a body region to log pain')}
        </Text>
      </View>
      
      <A11yPressable 
        onPress={() => router.push('/(tabs)/resources/chronic-tracker')} 
        style={[styles(palette).tempLink, { backgroundColor: palette.primary, marginTop: 20 }]}
      >
        <Text style={{ color: palette.onPrimary }}>
          {t('tracker.useChronicTracker', 'Use Full Chronic Tracker')}
        </Text>
      </A11yPressable>
    </ScrollView>
  );
}

// Energy Tab - Spoon theory / energy budgeting
function EnergyTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const [spoons, setSpoons] = useState(10);
  const [usedSpoons, setUsedSpoons] = useState(0);
  
  const activities = [
    { name: 'Shower', cost: 2, emoji: '🚿' },
    { name: 'Cooking', cost: 2, emoji: '🍳' },
    { name: 'Work Meeting', cost: 3, emoji: '💼' },
    { name: 'Exercise', cost: 4, emoji: '🏃' },
    { name: 'Socializing', cost: 3, emoji: '👥' },
    { name: 'Chores', cost: 2, emoji: '🧹' },
    { name: 'Medical Appt', cost: 4, emoji: '🏥' },
    { name: 'Commute', cost: 2, emoji: '🚗' },
  ];

  const logActivity = (cost: number) => {
    if (usedSpoons + cost <= spoons) {
      setUsedSpoons(prev => prev + cost);
      announce(t('tracker.spoonUsed', 'Activity logged'));
    } else {
      Alert.alert(
        t('tracker.outOfSpoons', 'Out of Spoons'),
        t('tracker.outOfSpoonsDesc', 'This activity would exceed your energy budget. Consider resting or adjusting your plans.')
      );
    }
  };

  const remaining = spoons - usedSpoons;
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.energyTitle', '🥄 Energy Budget (Spoon Theory)')}
      </Text>
      
      <DyslexiaText style={{ color: palette.text, marginBottom: 16 }}>
        {t('tracker.energyDesc', 'Track your daily energy using spoon theory. Plan activities to avoid overdoing it.')}
      </DyslexiaText>

      {/* Spoon Counter */}
      <View style={{ 
        backgroundColor: palette.surface, 
        borderRadius: 12, 
        padding: 20,
        marginBottom: 16 
      }}>
        <Text style={{ color: palette.text, fontWeight: '700', fontSize: 18, marginBottom: 12 }}>
          {t('tracker.dailySpoons', 'Daily Spoons')}
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 48, fontWeight: '700', color: remaining <= 2 ? palette.error : remaining <= 5 ? palette.warning : palette.success }}>
              {remaining}
            </Text>
            <Text style={{ color: palette.textSecondary }}>
              {t('tracker.spoonsRemaining', 'remaining of {{total}}', { total: spoons })}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', maxWidth: 150 }}>
            {Array.from({ length: spoons }).map((_, i) => (
              <Text key={i} style={{ fontSize: 20, opacity: i < remaining ? 1 : 0.3 }}>
                🥄
              </Text>
            ))}
          </View>
        </View>

        {/* Adjust daily spoons */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
          <Text style={{ color: palette.text, marginRight: 12 }}>
            {t('tracker.adjustSpoons', 'Set daily spoons:')}
          </Text>
          <Pressable 
            onPress={() => setSpoons(s => Math.max(1, s - 1))}
            style={{ padding: 8, backgroundColor: palette.muted, borderRadius: 8, marginRight: 8 }}
          >
            <Text style={{ color: palette.text, fontWeight: '700' }}>−</Text>
          </Pressable>
          <Text style={{ color: palette.text, fontWeight: '700', fontSize: 18 }}>{spoons}</Text>
          <Pressable 
            onPress={() => setSpoons(s => Math.min(20, s + 1))}
            style={{ padding: 8, backgroundColor: palette.muted, borderRadius: 8, marginLeft: 8 }}
          >
            <Text style={{ color: palette.text, fontWeight: '700' }}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Activity Buttons */}
      <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>
        {t('tracker.logActivity', 'Log Activity')}
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {activities.map(activity => (
          <Pressable
            key={activity.name}
            onPress={() => logActivity(activity.cost)}
            style={{
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.muted,
              borderRadius: 12,
              padding: 12,
              minWidth: 100,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 24 }}>{activity.emoji}</Text>
            <Text style={{ color: palette.text, fontWeight: '600', marginTop: 4 }}>
              {activity.name}
            </Text>
            <Text style={{ color: palette.error, fontSize: 12 }}>
              −{activity.cost} 🥄
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Reset Button */}
      <Pressable
        onPress={() => setUsedSpoons(0)}
        style={{
          backgroundColor: palette.primary,
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
          marginTop: 24,
        }}
      >
        <Text style={{ color: palette.onPrimary, fontWeight: '700' }}>
          {t('tracker.resetDay', 'Reset Day')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

// Flare-Up Tab
function FlareTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const [inFlare, setInFlare] = useState(false);
  const [flareStart, setFlareStart] = useState<Date | null>(null);
  
  const startFlare = () => {
    setInFlare(true);
    setFlareStart(new Date());
    announce(t('tracker.flareStarted', 'Flare-up tracking started'));
  };
  
  const endFlare = () => {
    if (flareStart) {
      const duration = Math.round((Date.now() - flareStart.getTime()) / (1000 * 60 * 60));
      Alert.alert(
        t('tracker.flareEnded', 'Flare-Up Ended'),
        t('tracker.flareDuration', 'Duration: {{hours}} hours', { hours: duration })
      );
    }
    setInFlare(false);
    setFlareStart(null);
  };
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.flaresTitle', '🔥 Flare-Up Tracker')}
      </Text>
      
      <DyslexiaText style={{ color: palette.text, marginBottom: 16 }}>
        {t('tracker.flaresDesc', 'Track flare-ups, their duration, and triggers to identify patterns.')}
      </DyslexiaText>

      <View style={{ 
        backgroundColor: inFlare ? palette.error + '20' : palette.surface,
        borderWidth: 2,
        borderColor: inFlare ? palette.error : palette.muted,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
      }}>
        {inFlare ? (
          <>
            <Text style={{ fontSize: 48 }}>🔥</Text>
            <Text style={{ color: palette.error, fontWeight: '700', fontSize: 24, marginTop: 8 }}>
              {t('tracker.inFlare', 'Flare-Up Active')}
            </Text>
            {flareStart && (
              <Text style={{ color: palette.text, marginTop: 8 }}>
                {t('tracker.startedAt', 'Started: {{time}}', { time: flareStart.toLocaleString() })}
              </Text>
            )}
            <Pressable
              onPress={endFlare}
              style={{
                backgroundColor: palette.success,
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 12,
                marginTop: 20,
              }}
            >
              <Text style={{ color: palette.onPrimary, fontWeight: '700', fontSize: 16 }}>
                {t('tracker.endFlare', 'End Flare-Up')}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 48 }}>✨</Text>
            <Text style={{ color: palette.success, fontWeight: '700', fontSize: 20, marginTop: 8 }}>
              {t('tracker.noFlare', 'No Active Flare-Up')}
            </Text>
            <Pressable
              onPress={startFlare}
              style={{
                backgroundColor: palette.error,
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 12,
                marginTop: 20,
              }}
            >
              <Text style={{ color: palette.onPrimary, fontWeight: '700', fontSize: 16 }}>
                {t('tracker.startFlare', 'Start Flare-Up Tracking')}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Flare Tips */}
      <View style={{ 
        backgroundColor: palette.surface, 
        borderRadius: 12, 
        padding: 16, 
        marginTop: 20 
      }}>
        <Text style={{ color: palette.text, fontWeight: '700', marginBottom: 12 }}>
          💡 {t('tracker.flareTips', 'Flare-Up Management Tips')}
        </Text>
        <Text style={{ color: palette.text, lineHeight: 22 }}>
          • Rest when needed - don't push through{'\n'}
          • Stay hydrated and eat regularly{'\n'}
          • Use ice/heat as appropriate{'\n'}
          • Track triggers to prevent future flares{'\n'}
          • Contact healthcare provider if severe
        </Text>
      </View>
    </ScrollView>
  );
}

// AI Insights Tab
function AIInsightsTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.insightsTitle', '🧠 AI Health Insights')}
      </Text>
      
      <DisclaimerBanner type="ai" compact={true} />
      
      <DyslexiaText style={{ color: palette.text, marginBottom: 16 }}>
        {t('tracker.insightsDesc', 'AI analyzes your tracking data to find patterns, correlations, and provide personalized recommendations.')}
      </DyslexiaText>

      <View style={{ backgroundColor: palette.surface, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>
          📊 {t('tracker.patternAnalysis', 'Pattern Analysis')}
        </Text>
        <Text style={{ color: palette.textSecondary, fontStyle: 'italic' }}>
          {t('tracker.needMoreData', 'Log more entries to see AI-generated insights and patterns.')}
        </Text>
      </View>

      <View style={{ backgroundColor: palette.surface, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>
          🎯 {t('tracker.recommendations', 'Personalized Recommendations')}
        </Text>
        <Text style={{ color: palette.textSecondary, fontStyle: 'italic' }}>
          {t('tracker.recommendationsDesc', 'Based on your data, AI will suggest lifestyle adjustments, medication timing, and activity modifications.')}
        </Text>
      </View>

      <View style={{ backgroundColor: palette.surface, borderRadius: 12, padding: 16 }}>
        <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>
          📈 {t('tracker.trendPrediction', 'Trend Prediction')}
        </Text>
        <Text style={{ color: palette.textSecondary, fontStyle: 'italic' }}>
          {t('tracker.trendDesc', 'AI will predict symptom trends and potential flare-ups based on historical patterns.')}
        </Text>
      </View>
    </ScrollView>
  );
}

const painMapStyles = StyleSheet.create({
  bodyPart: {
    position: 'absolute',
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: {
      padding: 16,
      paddingBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: palette.text,
      opacity: 0.9,
      marginBottom: 16,
      lineHeight: 24,
    },
    statsContainer: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 16,
    },
    statsTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      minWidth: 120,
      alignItems: 'center',
      padding: 12,
      gap: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
    },
    statLabel: {
      fontSize: 12,
      opacity: 0.85,
    },
    streakBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      gap: 12,
    },
    streakText: {
      fontSize: 16,
      fontWeight: '600',
    },
    quickLogButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      gap: 12,
      marginBottom: 16,
    },
    quickLogButtonText: {
      fontSize: 18,
      fontWeight: '700',
    },
    quickLogGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16,
    },
    quickLogCard: {
      flex: 1,
      minWidth: 150,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      gap: 12,
    },
    quickLogIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickLogLabel: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    insightsCard: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      marginBottom: 16,
    },
    insightsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    insightsTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    insightsList: {
      gap: 12,
    },
    insightItem: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
    },
    insightText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 12,
    },
    exportButton: {
      flexDirection: 'row',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      gap: 16,
      alignItems: 'center',
    },
    exportContent: {
      flex: 1,
    },
    exportTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    exportDesc: {
      fontSize: 14,
      opacity: 0.85,
    },
    relatedGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    relatedCard: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      gap: 12,
    },
    relatedTitle: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    tabTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 16,
    },
    comingSoon: {
      fontSize: 16,
      color: palette.textSecondary,
      marginBottom: 16,
      fontStyle: 'italic',
    },
    tempLink: {
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
  });
}
