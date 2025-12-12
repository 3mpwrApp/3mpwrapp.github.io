/**
 * Health Management Hub - Power Tool
 * 
 * Consolidates 8 health management features into 5 tabs:
 * - Meds: Meds Tracker
 * - Doctor: Doctor Visit Prep
 * - Chronic: Chronic Tracker
 * - Rehab: Rehab Tracker
 * - Body: Body Mechanics Advisor
 */

/* eslint-disable no-restricted-syntax */ // Checkbox colors are intentional

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
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


// ============================================
// TAB 1: MEDS (Simple Mode)
// ============================================
function MedsTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  // router reserved for future navigation

  const todayMeds = [
    { id: '1', name: 'Pain Medication', dosage: '10mg', time: '8:00 AM', taken: true },
    { id: '2', name: 'Vitamin D', dosage: '1000 IU', time: '8:00 AM', taken: true },
    { id: '3', name: 'Anti-inflammatory', dosage: '200mg', time: '12:00 PM', taken: false },
    { id: '4', name: 'Evening Medication', dosage: '25mg', time: '8:00 PM', taken: false },
  ];

  const upcomingRefills = [
    { id: '1', name: 'Pain Medication', refillDate: 'Dec 18', daysLeft: 7 },
    { id: '2', name: 'Anti-inflammatory', refillDate: 'Dec 25', daysLeft: 14 },
  ];

  const takenCount = todayMeds.filter(m => m.taken).length;
  const totalCount = todayMeds.length;

  const styles = createMedsStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Today's Progress */}
      <View style={[styles.progressCard, { backgroundColor: palette.primary + '15' }]}>
        <Text style={[styles.progressTitle, { color: palette.text }]}>
          {t('meds.today.title', 'Today\'s Medications')}
        </Text>
        <View style={styles.progressCircle}>
          <Text style={[styles.progressNumber, { color: palette.primary }]}>
            {takenCount}/{totalCount}
          </Text>
          <Text style={[styles.progressLabel, { color: palette.secondaryText }]}>taken</Text>
        </View>
      </View>

      <GapView style={{ height: 16 }} />

      {/* Medication List */}
      <PowerToolSection title={t('meds.schedule.title', 'Schedule')}>
        {todayMeds.map((med) => (
          <A11yPressable
            key={med.id}
            onPress={() => {
              trackEvent('meds.toggle', { id: med.id, taken: !med.taken });
            }}
            accessibilityLabel={`${med.name}, ${med.dosage}, ${med.time}, ${med.taken ? 'taken' : 'not taken'}`}
            hitSlop={HIT_SLOP_8}
            style={[styles.medCard, { backgroundColor: palette.card }]}
          >
            <View style={[
              styles.checkbox,
              { 
                backgroundColor: med.taken ? palette.success : 'transparent',
                borderColor: med.taken ? palette.success : palette.border,
              },
            ]}>
              {med.taken && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <View style={styles.medInfo}>
              <Text style={[
                styles.medName, 
                { color: palette.text, opacity: med.taken ? 0.6 : 1 }
              ]}>
                {med.name}
              </Text>
              <Text style={[styles.medDosage, { color: palette.secondaryText }]}>
                {med.dosage} • {med.time}
              </Text>
            </View>
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Refills */}
      <PowerToolSection title={t('meds.refills.title', 'Upcoming Refills')}>
        {upcomingRefills.map((refill) => (
          <View key={refill.id} style={[styles.refillCard, { backgroundColor: palette.card }]}>
            <View style={styles.refillInfo}>
              <Text style={[styles.refillName, { color: palette.text }]}>{refill.name}</Text>
              <Text style={[styles.refillDate, { color: palette.secondaryText }]}>
                Refill by {refill.refillDate}
              </Text>
            </View>
            <View style={[
              styles.refillBadge, 
              { backgroundColor: refill.daysLeft <= 7 ? palette.warning + '20' : palette.primary + '20' }
            ]}>
              <Text style={[
                styles.refillDays, 
                { color: refill.daysLeft <= 7 ? palette.warning : palette.primary }
              ]}>
                {refill.daysLeft}d
              </Text>
            </View>
          </View>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('meds.doctor.explore', 'Doctor Visit Prep')}
        icon="medical"
        onPress={() => navigateToTab('doctor')}
      />
    </PowerToolTabContent>
  );
}

const createMedsStyles = (_palette: any) => StyleSheet.create({
  progressCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressCircle: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 36,
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: 14,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
  },
  medDosage: {
    fontSize: 12,
    marginTop: 2,
  },
  refillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  refillInfo: {
    flex: 1,
  },
  refillName: {
    fontSize: 16,
    fontWeight: '600',
  },
  refillDate: {
    fontSize: 12,
    marginTop: 2,
  },
  refillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  refillDays: {
    fontSize: 14,
    fontWeight: '700',
  },
});


// ============================================
// TAB 2: DOCTOR (Standard Mode)
// ============================================
function DoctorTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const upcomingAppts = [
    { id: '1', doctor: 'Dr. Smith', specialty: 'Primary Care', date: 'Dec 18, 2024', time: '10:00 AM' },
    { id: '2', doctor: 'Dr. Johnson', specialty: 'Rheumatology', date: 'Jan 5, 2025', time: '2:30 PM' },
  ];

  const prepTools = [
    { id: 'symptoms', emoji: '📝', name: 'Symptom Summary', desc: 'Prepare your symptom report' },
    { id: 'questions', emoji: '❓', name: 'Questions List', desc: 'Don\'t forget to ask' },
    { id: 'history', emoji: '📋', name: 'Medical History', desc: 'Your health timeline' },
    { id: 'meds', emoji: '💊', name: 'Medication List', desc: 'Current medications' },
  ];

  const styles = createDoctorStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Upcoming Appointments */}
      <PowerToolSection title={t('doctor.appts.title', 'Upcoming Appointments')}>
        {upcomingAppts.map((appt) => (
          <A11yPressable
            key={appt.id}
            onPress={() => {
              trackEvent('doctor.appt.view', { id: appt.id });
              router.push('/resources/doctor-visit-prep' as any);
            }}
            accessibilityLabel={`${appt.doctor}, ${appt.specialty}, ${appt.date}`}
            hitSlop={HIT_SLOP_8}
            style={[styles.apptCard, { backgroundColor: palette.card }]}
          >
            <View style={[styles.apptIcon, { backgroundColor: palette.primary + '20' }]}>
              <Ionicons name="person" size={24} color={palette.primary} />
            </View>
            <View style={styles.apptInfo}>
              <Text style={[styles.apptDoctor, { color: palette.text }]}>{appt.doctor}</Text>
              <Text style={[styles.apptSpecialty, { color: palette.secondaryText }]}>{appt.specialty}</Text>
              <Text style={[styles.apptDateTime, { color: palette.primary }]}>
                {appt.date} at {appt.time}
              </Text>
            </View>
            <View style={styles.prepButton}>
              <Text style={[styles.prepButtonText, { color: palette.primary }]}>Prep</Text>
            </View>
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Prep Tools */}
      <PowerToolSection title={t('doctor.prep.title', 'Visit Preparation')}>
        <View style={styles.prepGrid}>
          {prepTools.map((tool) => (
            <A11yPressable
              key={tool.id}
              onPress={() => {
                trackEvent('doctor.prep.tool', { tool: tool.id });
                router.push('/resources/doctor-visit-prep' as any);
              }}
              accessibilityLabel={tool.name}
              hitSlop={HIT_SLOP_8}
              style={[styles.prepCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.prepEmoji}>{tool.emoji}</Text>
              <Text style={[styles.prepName, { color: palette.text }]}>{tool.name}</Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('doctor.chronic.explore', 'Chronic Condition Tracker')}
        icon="pulse"
        onPress={() => navigateToTab('chronic')}
      />
    </PowerToolTabContent>
  );
}

const createDoctorStyles = (_palette: any) => StyleSheet.create({
  apptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  apptIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  apptInfo: {
    flex: 1,
  },
  apptDoctor: {
    fontSize: 16,
    fontWeight: '600',
  },
  apptSpecialty: {
    fontSize: 12,
    marginTop: 2,
  },
  apptDateTime: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  prepButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  prepButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  prepGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  prepCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  prepEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  prepName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});


// ============================================
// TAB 3: CHRONIC (Standard Mode)
// ============================================
function ChronicTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const conditions = [
    { id: 'fibro', emoji: '💜', name: 'Fibromyalgia', lastLog: 'Today' },
    { id: 'arthritis', emoji: '🦴', name: 'Arthritis', lastLog: 'Yesterday' },
    { id: 'fatigue', emoji: '😴', name: 'Chronic Fatigue', lastLog: 'Today' },
  ];

  const trackingOptions = [
    { id: 'flare', emoji: '🔥', name: 'Log Flare', desc: 'Record a symptom flare' },
    { id: 'baseline', emoji: '📊', name: 'Baseline Check', desc: 'Compare to your baseline' },
    { id: 'triggers', emoji: '🔍', name: 'Trigger Analysis', desc: 'Identify patterns' },
    { id: 'report', emoji: '📄', name: 'Generate Report', desc: 'For your doctor' },
  ];

  const styles = createChronicStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Your Conditions */}
      <PowerToolSection title={t('chronic.conditions.title', 'Your Conditions')}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.conditionsRow}>
            {conditions.map((condition) => (
              <A11yPressable
                key={condition.id}
                onPress={() => {
                  trackEvent('chronic.condition.select', { condition: condition.id });
                  router.push('/wellness/chronic-tracker' as any);
                }}
                accessibilityLabel={condition.name}
                hitSlop={HIT_SLOP_8}
                style={[styles.conditionCard, { backgroundColor: palette.card }]}
              >
                <Text style={styles.conditionEmoji}>{condition.emoji}</Text>
                <Text style={[styles.conditionName, { color: palette.text }]}>{condition.name}</Text>
                <Text style={[styles.conditionLog, { color: palette.secondaryText }]}>
                  {condition.lastLog}
                </Text>
              </A11yPressable>
            ))}
            <A11yPressable
              onPress={() => {
                trackEvent('chronic.condition.add');
                router.push('/wellness/chronic-tracker' as any);
              }}
              accessibilityLabel="Add condition"
              hitSlop={HIT_SLOP_8}
              style={[styles.addConditionCard, { backgroundColor: palette.primary + '15' }]}
            >
              <Ionicons name="add" size={32} color={palette.primary} />
              <Text style={[styles.addConditionText, { color: palette.primary }]}>Add</Text>
            </A11yPressable>
          </View>
        </ScrollView>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Tracking Options */}
      <PowerToolSection title={t('chronic.tracking.title', 'Tracking Tools')}>
        {trackingOptions.map((option) => (
          <A11yPressable
            key={option.id}
            onPress={() => {
              trackEvent('chronic.tool.open', { tool: option.id });
              router.push('/wellness/chronic-tracker' as any);
            }}
            accessibilityLabel={option.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.optionCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.optionEmoji}>{option.emoji}</Text>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionName, { color: palette.text }]}>{option.name}</Text>
              <Text style={[styles.optionDesc, { color: palette.secondaryText }]}>{option.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('chronic.rehab.explore', 'Rehabilitation Tracker')}
        icon="fitness"
        onPress={() => navigateToTab('rehab')}
      />
    </PowerToolTabContent>
  );
}

const createChronicStyles = (_palette: any) => StyleSheet.create({
  conditionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  conditionCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 110,
  },
  conditionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  conditionName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  conditionLog: {
    fontSize: 10,
  },
  addConditionCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  addConditionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// TAB 4: REHAB (Power User Mode)
// ============================================
function RehabTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const activePrograms = [
    { id: '1', name: 'Physical Therapy', progress: 65, nextSession: 'Dec 15' },
    { id: '2', name: 'Occupational Therapy', progress: 40, nextSession: 'Dec 18' },
  ];

  const rehabMetrics = [
    { id: 'pain', emoji: '🩹', name: 'Pain Level', value: '4/10', trend: 'down' },
    { id: 'mobility', emoji: '🦿', name: 'Mobility', value: '7/10', trend: 'up' },
    { id: 'strength', emoji: '💪', name: 'Strength', value: '6/10', trend: 'stable' },
  ];

  const styles = createRehabStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Active Programs */}
      <PowerToolSection title={t('rehab.programs.title', 'Active Programs')}>
        {activePrograms.map((program) => (
          <A11yPressable
            key={program.id}
            onPress={() => {
              trackEvent('rehab.program.open', { id: program.id });
              router.push('/wellness/rehab-tracker' as any);
            }}
            accessibilityLabel={`${program.name}, ${program.progress}% complete`}
            hitSlop={HIT_SLOP_8}
            style={[styles.programCard, { backgroundColor: palette.card }]}
          >
            <View style={styles.programInfo}>
              <Text style={[styles.programName, { color: palette.text }]}>{program.name}</Text>
              <Text style={[styles.programNext, { color: palette.secondaryText }]}>
                Next: {program.nextSession}
              </Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: palette.border }]}>
                <View style={[
                  styles.progressFill, 
                  { backgroundColor: palette.primary, width: `${program.progress}%` }
                ]} />
              </View>
              <Text style={[styles.progressText, { color: palette.primary }]}>
                {program.progress}%
              </Text>
            </View>
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Metrics */}
      <PowerToolSection title={t('rehab.metrics.title', 'Recovery Metrics')}>
        <View style={styles.metricsGrid}>
          {rehabMetrics.map((metric) => (
            <View key={metric.id} style={[styles.metricCard, { backgroundColor: palette.card }]}>
              <Text style={styles.metricEmoji}>{metric.emoji}</Text>
              <Text style={[styles.metricName, { color: palette.secondaryText }]}>{metric.name}</Text>
              <Text style={[styles.metricValue, { color: palette.text }]}>{metric.value}</Text>
              <Ionicons 
                name={metric.trend === 'up' ? 'trending-up' : metric.trend === 'down' ? 'trending-down' : 'remove'} 
                size={16} 
                color={metric.trend === 'up' ? palette.success : metric.trend === 'down' ? palette.error : palette.secondaryText} 
              />
            </View>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('rehab.body.explore', 'Body Mechanics')}
        icon="body"
        onPress={() => navigateToTab('body')}
      />
    </PowerToolTabContent>
  );
}

const createRehabStyles = (_palette: any) => StyleSheet.create({
  programCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  programInfo: {
    marginBottom: 12,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
  },
  programNext: {
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  metricName: {
    fontSize: 10,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
});


// ============================================
// TAB 5: BODY (Power User Mode)
// ============================================
function BodyTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const bodyAreas = [
    { id: 'posture', emoji: '🧍', name: 'Posture', status: 'Needs attention' },
    { id: 'ergonomics', emoji: '💺', name: 'Ergonomics', status: 'Good' },
    { id: 'movement', emoji: '🚶', name: 'Movement Patterns', status: 'Improving' },
    { id: 'pain-points', emoji: '📍', name: 'Pain Points', status: '3 active' },
  ];

  const bodyTools = [
    { id: 'pain-map', emoji: '🗺️', name: 'Pain Map', desc: 'Visual pain tracking' },
    { id: 'posture-check', emoji: '📐', name: 'Posture Assessment', desc: 'Check your alignment' },
    { id: 'ergo-guide', emoji: '📚', name: 'Ergonomics Guide', desc: 'Workspace setup' },
    { id: 'movement-log', emoji: '📝', name: 'Movement Log', desc: 'Track daily movement' },
  ];

  const styles = createBodyStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Body Overview */}
      <PowerToolSection title={t('body.overview.title', 'Body Mechanics Overview')}>
        <View style={styles.areaGrid}>
          {bodyAreas.map((area) => (
            <A11yPressable
              key={area.id}
              onPress={() => {
                trackEvent('body.area.view', { area: area.id });
                router.push('/wellness/body-mechanics-advisor' as any);
              }}
              accessibilityLabel={`${area.name}: ${area.status}`}
              hitSlop={HIT_SLOP_8}
              style={[styles.areaCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.areaEmoji}>{area.emoji}</Text>
              <Text style={[styles.areaName, { color: palette.text }]}>{area.name}</Text>
              <Text style={[styles.areaStatus, { color: palette.secondaryText }]}>{area.status}</Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Body Tools */}
      <PowerToolSection title={t('body.tools.title', 'Body Mechanics Tools')}>
        {bodyTools.map((tool) => (
          <A11yPressable
            key={tool.id}
            onPress={() => {
              trackEvent('body.tool.open', { tool: tool.id });
              router.push('/wellness/body-mechanics-advisor' as any);
            }}
            accessibilityLabel={tool.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.toolCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.toolEmoji}>{tool.emoji}</Text>
            <View style={styles.toolInfo}>
              <Text style={[styles.toolName, { color: palette.text }]}>{tool.name}</Text>
              <Text style={[styles.toolDesc, { color: palette.secondaryText }]}>{tool.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>
    </PowerToolTabContent>
  );
}

const createBodyStyles = (_palette: any) => StyleSheet.create({
  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  areaCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  areaEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  areaName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  areaStatus: {
    fontSize: 11,
    textAlign: 'center',
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  toolEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
  },
  toolDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// MAIN EXPORT
// ============================================
export default function HealthManagementHub() {
  const { t } = useTranslation();

  const tabs: PowerToolTab[] = [
    {
      id: 'meds',
      label: t('health-mgmt.tabs.meds', 'Meds'),
      icon: '💊',
      component: MedsTab,
      complexity: 'simple',
      keywords: ['medication', 'pills', 'prescription', 'refill'],
    },
    {
      id: 'doctor',
      label: t('health-mgmt.tabs.doctor', 'Doctor'),
      icon: '👨‍⚕️',
      component: DoctorTab,
      complexity: 'standard',
      keywords: ['doctor', 'appointment', 'visit', 'prep'],
    },
    {
      id: 'chronic',
      label: t('health-mgmt.tabs.chronic', 'Chronic'),
      icon: '💜',
      component: ChronicTab,
      complexity: 'standard',
      keywords: ['chronic', 'condition', 'flare', 'baseline'],
    },
    {
      id: 'rehab',
      label: t('health-mgmt.tabs.rehab', 'Rehab'),
      icon: '🏥',
      component: RehabTab,
      complexity: 'power_user',
      keywords: ['rehab', 'therapy', 'recovery', 'physical'],
    },
    {
      id: 'body',
      label: t('health-mgmt.tabs.body', 'Body'),
      icon: '🧍',
      component: BodyTab,
      complexity: 'power_user',
      badge: 'beta',
      keywords: ['body', 'posture', 'ergonomics', 'pain'],
    },
  ];

  return (
    <ResponsiveScreenWrapper>
      <PowerTool
        title={t('health-mgmt.title', 'Health Management Hub')}
        subtitle={t('health-mgmt.subtitle', 'Medications, appointments & health tracking')}
        icon="🏥"
        tabs={tabs}
        defaultTab="meds"
        showSearch
        searchPlaceholder={t('health-mgmt.search', 'Search health tools...')}
        analyticsPrefix="health_management"
      />
    </ResponsiveScreenWrapper>
  );
}


