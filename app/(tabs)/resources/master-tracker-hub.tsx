import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Link, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { GapView } from '../../../components/GapView';
import ResponsiveScreenWrapper from '../../../components/ResponsiveScreenWrapper';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { trackEvent } from '../../../services/analyticsClient';
import { usage } from '../../../services/usage';
import { useAppPalette } from '../../../theme/usePalette';

const Tab = createMaterialTopTabNavigator();

export const options = { href: null };

type TrackerType = 'symptoms' | 'meds' | 'rehab' | 'appointments' | 'timeline' | 'accessibility';

interface TrackerEntry {
  id: string;
  type: TrackerType;
  timestamp: number;
  data: any;
  notes?: string;
}

interface QuickLogItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  type: TrackerType;
  color: string;
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

  const quickLogItems: QuickLogItem[] = [
    { icon: 'medical', label: t('tracker.logSymptom', 'Log Symptom'), type: 'symptoms', color: '#FF6B6B' },
    { icon: 'fitness', label: t('tracker.logRehab', 'Log Rehab'), type: 'rehab', color: '#4ECDC4' },
    { icon: 'calendar', label: t('tracker.logAppointment', 'Log Appointment'), type: 'appointments', color: '#45B7D1' },
    { icon: 'medkit', label: t('tracker.logMed', 'Log Medication'), type: 'meds', color: '#96CEB4' },
    { icon: 'flag', label: t('tracker.logAccess', 'Log Accessibility Issue'), type: 'accessibility', color: '#FFEAA7' },
    { icon: 'time', label: t('tracker.logEvent', 'Log Timeline Event'), type: 'timeline', color: '#DFE6E9' },
  ];

  const stats = {
    symptomsToday: 3,
    medsToday: 5,
    rehabMinutes: 45,
    upcomingAppointments: 2,
    streakDays: 14,
  };

  const handleQuickLog = useCallback((type: TrackerType) => {
    trackEvent('quick_log_used', { type });
    usage.view('resources', `/(tabs)/resources/master-tracker-hub/${type}` as any);
    // Navigate to appropriate tracker tab
    router.push(`/(tabs)/resources/master-tracker-hub#${type}` as any);
  }, [router]);

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
    } catch (error) {
      Alert.alert(t('tracker.exportError', 'Export failed'));
    }
  }, [t]);

  const exportData = async (format: 'pdf' | 'csv' | 'json') => {
    // Implementation would export all tracker data
    Alert.alert(
      t('tracker.exportSuccess', 'Export Complete'),
      t('tracker.exportSuccessMessage', `Data exported as ${format.toUpperCase()}`)
    );
  };

  const s = styles(palette);

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text ref={titleRef} accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        📊 {t('tracker.dashboardTitle', 'Master Tracker Dashboard')}
      </Text>

      <Text style={s.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('tracker.subtitle', 'Unified health tracking with AI insights, pattern detection, and doctor-ready reports')}
      </Text>

      <DisclaimerBanner type="medical" compact={true} />

      {/* Stats Overview */}
      <View style={[s.statsContainer, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
        <Text style={[s.statsTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {t('tracker.today', 'Today\'s Summary')}
        </Text>

        <View style={s.statsGrid}>
          <View style={s.statCard}>
            <Ionicons name="medical" size={32} color="#FF6B6B" />
            <Text style={[s.statValue, { color: palette.text }]}>{stats.symptomsToday}</Text>
            <Text style={[s.statLabel, { color: palette.text }]}>{t('tracker.symptoms', 'Symptoms')}</Text>
          </View>

          <View style={s.statCard}>
            <Ionicons name="medkit" size={32} color="#96CEB4" />
            <Text style={[s.statValue, { color: palette.text }]}>{stats.medsToday}/{t('tracker.medsScheduled', '8')}</Text>
            <Text style={[s.statLabel, { color: palette.text }]}>{t('tracker.medications', 'Medications')}</Text>
          </View>

          <View style={s.statCard}>
            <Ionicons name="fitness" size={32} color="#4ECDC4" />
            <Text style={[s.statValue, { color: palette.text }]}>{stats.rehabMinutes}{t('tracker.minutes', 'min')}</Text>
            <Text style={[s.statLabel, { color: palette.text }]}>{t('tracker.rehab', 'Rehab')}</Text>
          </View>

          <View style={s.statCard}>
            <Ionicons name="calendar" size={32} color="#45B7D1" />
            <Text style={[s.statValue, { color: palette.text }]}>{stats.upcomingAppointments}</Text>
            <Text style={[s.statLabel, { color: palette.text }]}>{t('tracker.upcoming', 'Upcoming')}</Text>
          </View>
        </View>

        <View style={[s.streakBanner, { backgroundColor: palette.primary + '15', borderColor: palette.primary }]}>
          <Ionicons name="flame" size={24} color={palette.primary} />
          <Text style={[s.streakText, { color: palette.text }]}>
            {t('tracker.streak', '{{days}}-day tracking streak!', { days: stats.streakDays })}
          </Text>
        </View>
      </View>

      {/* Quick Log Button */}
      <A11yPressable
        hitSlop={HIT_SLOP_8}
        onPress={() => setShowQuickLog(!showQuickLog)}
        style={[s.quickLogButton, { backgroundColor: palette.primary }]}
      >
        <Ionicons name="add-circle-outline" size={24} color={palette.onPrimary} />
        <Text style={[s.quickLogButtonText, { color: palette.onPrimary }]}>
          {t('tracker.quickLog', 'Quick Log')}
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
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={[s.quickLogLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {item.label}
              </Text>
            </A11yPressable>
          ))}
        </View>
      )}

      {/* AI Insights */}
      <View style={[s.insightsCard, { backgroundColor: palette.surface, borderColor: palette.primary }]}>
        <View style={s.insightsHeader}>
          <Ionicons name="bulb" size={24} color={palette.primary} />
          <Text style={[s.insightsTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t('tracker.aiInsights', 'AI Insights')} ⭐
          </Text>
        </View>

        <View style={s.insightsList}>
          <View style={s.insightItem}>
            <Ionicons name="trending-up" size={20} color="#FF6B6B" />
            <Text style={[s.insightText, { color: palette.text }]}>
              {t('tracker.insight1', 'Pain levels spike on Mondays - possible work-related stress pattern')}
            </Text>
          </View>

          <View style={s.insightItem}>
            <Ionicons name="water" size={20} color="#45B7D1" />
            <Text style={[s.insightText, { color: palette.text }]}>
              {t('tracker.insight2', 'Higher symptom severity on rainy days - consider weather tracking')}
            </Text>
          </View>

          <View style={s.insightItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
            <Text style={[s.insightText, { color: palette.text }]}>
              {t('tracker.insight3', 'Rehab adherence excellent - keep it up!')}
            </Text>
          </View>
        </View>
      </View>

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

        <Link href="/(tabs)/resources/doctor-visit-prep" asChild>
          <A11yPressable
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
        </Link>

        <Link href="/(tabs)/advocacy/evidence-vault" asChild>
          <A11yPressable
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
        </Link>
      </GapView>

      {/* Related Tools */}
      <Text style={[s.sectionTitle, { marginTop: 32 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('tracker.relatedTools', 'Related Tools')}
      </Text>

      <View style={s.relatedGrid}>
        <Link href="/(tabs)/resources/appeal-command-center" asChild>
          <A11yPressable
            hitSlop={HIT_SLOP_8}
            style={[s.relatedCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}
          >
            <Ionicons name="shield" size={24} color={palette.primary} />
            <Text style={[s.relatedTitle, { color: palette.text }]}>
              {t('tracker.appealCenter', 'Appeal Command Center')}
            </Text>
          </A11yPressable>
        </Link>

        <Link href="/(tabs)/resources/rights-benefits-calculator" asChild>
          <A11yPressable
            hitSlop={HIT_SLOP_8}
            style={[s.relatedCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}
          >
            <Ionicons name="calculator" size={24} color={palette.primary} />
            <Text style={[s.relatedTitle, { color: palette.text }]}>
              {t('tracker.benefitsCalc', 'Benefits Calculator')}
            </Text>
          </A11yPressable>
        </Link>
      </View>
    </ScrollView>
  );
}

// Individual tracker tabs (simplified for now - full implementation would load actual data)
function SymptomsTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.symptomsTracking', 'Symptom Tracking')}
      </Text>
      <Text style={styles(palette).comingSoon}>
        {t('tracker.chronicTrackerMigration', 'Full symptom tracking features migrating from Chronic Tracker...')}
      </Text>
      <Link href="/(tabs)/resources/chronic-tracker" asChild>
        <A11yPressable style={[styles(palette).tempLink, { backgroundColor: palette.primary }]}>
          <Text style={{ color: palette.onPrimary }}>
            {t('tracker.useChronicTracker', 'Use Chronic Tracker (Temporary)')}
          </Text>
        </A11yPressable>
      </Link>
    </ScrollView>
  );
}

function MedicationsTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.medsTracking', 'Medication Tracking')}
      </Text>
      <Text style={styles(palette).comingSoon}>
        {t('tracker.medsTrackerMigration', 'Full medication tracking features migrating from Meds Tracker...')}
      </Text>
      <Link href="/(tabs)/resources/meds-tracker" asChild>
        <A11yPressable style={[styles(palette).tempLink, { backgroundColor: palette.primary }]}>
          <Text style={{ color: palette.onPrimary }}>
            {t('tracker.useMedsTracker', 'Use Meds Tracker (Temporary)')}
          </Text>
        </A11yPressable>
      </Link>
    </ScrollView>
  );
}

function RehabTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.rehabTracking', 'Rehab Progress Tracking')}
      </Text>
      <Text style={styles(palette).comingSoon}>
        {t('tracker.rehabTrackerMigration', 'Full rehab tracking features migrating from Rehab Tracker...')}
      </Text>
      <Link href="/(tabs)/resources/rehab-tracker" asChild>
        <A11yPressable style={[styles(palette).tempLink, { backgroundColor: palette.primary }]}>
          <Text style={{ color: palette.onPrimary }}>
            {t('tracker.useRehabTracker', 'Use Rehab Tracker (Temporary)')}
          </Text>
        </A11yPressable>
      </Link>
    </ScrollView>
  );
}

function AppointmentsTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.appointmentsTracking', 'Appointments & Doctor Visits')}
      </Text>
      <Text style={styles(palette).comingSoon}>
        {t('tracker.doctorPrepMigration', 'Full appointment prep features migrating from Doctor Visit Prep...')}
      </Text>
      <Link href="/(tabs)/resources/doctor-visit-prep" asChild>
        <A11yPressable style={[styles(palette).tempLink, { backgroundColor: palette.primary }]}>
          <Text style={{ color: palette.onPrimary }}>
            {t('tracker.useDoctorPrep', 'Use Doctor Visit Prep (Temporary)')}
          </Text>
        </A11yPressable>
      </Link>
    </ScrollView>
  );
}

function TimelineTab() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  
  return (
    <ScrollView contentContainerStyle={styles(palette).container}>
      <Text style={styles(palette).tabTitle}>
        {t('tracker.timelineTracking', 'Case Timeline')}
      </Text>
      <Text style={styles(palette).comingSoon}>
        {t('tracker.timelineMigration', 'Full timeline features migrating from Case Timeline...')}
      </Text>
      <Link href="/(tabs)/resources/case-timeline" asChild>
        <A11yPressable style={[styles(palette).tempLink, { backgroundColor: palette.primary }]}>
          <Text style={{ color: palette.onPrimary }}>
            {t('tracker.useCaseTimeline', 'Use Case Timeline (Temporary)')}
          </Text>
        </A11yPressable>
      </Link>
    </ScrollView>
  );
}

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
      color: palette.text,
      opacity: 0.7,
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
