/**
 * Case Tracker Pro - Power Tool
 * 
 * Consolidates 10 tracking/deadline features into 5 tabs:
 * - Deadlines: Deadlines, Deadlines List
 * - Master Hub: Master Tracker Hub
 * - Denial: Denial Decoder
 * - Claims: Claims Navigator
 * - RTW: RTW Planner
 */

/* eslint-disable no-restricted-syntax */ // Progress indicator colors are intentional

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
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
import { logEvent } from '../../../services/analytics';
import { useAppPalette } from '../../../theme/usePalette';


// ============================================
// TAB 1: DEADLINES (Simple Mode)
// ============================================
function DeadlinesTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const upcomingDeadlines = [
    { id: '1', title: 'Appeal submission', date: 'Dec 15, 2024', daysLeft: 4, priority: 'urgent' },
    { id: '2', title: 'Medical records request', date: 'Dec 20, 2024', daysLeft: 9, priority: 'high' },
    { id: '3', title: 'Quarterly review', date: 'Jan 5, 2025', daysLeft: 25, priority: 'normal' },
    { id: '4', title: 'Insurance renewal', date: 'Jan 15, 2025', daysLeft: 35, priority: 'normal' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return palette.error;
      case 'high': return palette.warning;
      default: return palette.primary;
    }
  };

  const styles = createDeadlinesStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Urgent Alert */}
      {upcomingDeadlines.some(d => d.priority === 'urgent') && (
        <>
          <View style={[styles.urgentBanner, { backgroundColor: palette.error + '20' }]}>
            <Ionicons name="warning" size={24} color={palette.error} />
            <Text style={[styles.urgentText, { color: palette.error }]}>
              {t('deadlines.urgent', 'You have urgent deadlines!')}
            </Text>
          </View>
          <GapView style={{ height: 16 }} />
        </>
      )}

      {/* Upcoming Deadlines */}
      <PowerToolSection title={t('deadlines.upcoming.title', 'Upcoming Deadlines')}>
        {upcomingDeadlines.map((deadline) => (
          <A11yPressable
            key={deadline.id}
            onPress={() => {
              logEvent('deadlines.open', { id: deadline.id });
              router.push('/resources/deadlines' as any);
            }}
            accessibilityLabel={`${deadline.title}, ${deadline.daysLeft} days left`}
            hitSlop={HIT_SLOP_8}
            style={[styles.deadlineCard, { backgroundColor: palette.card }]}
          >
            <View style={[
              styles.priorityIndicator, 
              { backgroundColor: getPriorityColor(deadline.priority) }
            ]} />
            <View style={styles.deadlineInfo}>
              <Text style={[styles.deadlineTitle, { color: palette.text }]}>{deadline.title}</Text>
              <Text style={[styles.deadlineDate, { color: palette.secondaryText }]}>{deadline.date}</Text>
            </View>
            <View style={[
              styles.daysLeftBadge, 
              { backgroundColor: getPriorityColor(deadline.priority) + '20' }
            ]}>
              <Text style={[
                styles.daysLeftText, 
                { color: getPriorityColor(deadline.priority) }
              ]}>
                {deadline.daysLeft}d
              </Text>
            </View>
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Add Deadline */}
      <PowerToolAction
        label={t('deadlines.add', 'Add New Deadline')}
        icon="add-circle"
        onPress={() => {
          logEvent('deadlines.add');
          router.push('/resources/deadlines' as any);
        }}
        variant="primary"
      />

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('deadlines.master.explore', 'Master Tracker')}
        icon="analytics"
        onPress={() => navigateToTab('master')}
      />
    </PowerToolTabContent>
  );
}

const createDeadlinesStyles = (_palette: any) => StyleSheet.create({
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  urgentText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deadlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
    minHeight: 40,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  deadlineDate: {
    fontSize: 12,
    marginTop: 2,
  },
  daysLeftBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  daysLeftText: {
    fontSize: 14,
    fontWeight: '700',
  },
});


// ============================================
// TAB 2: MASTER HUB (Standard Mode)
// ============================================
function MasterTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const activeCases = [
    { id: '1', name: 'Disability Claim', status: 'In Review', progress: 65, lastUpdate: 'Dec 10' },
    { id: '2', name: 'Accommodation Request', status: 'Submitted', progress: 30, lastUpdate: 'Dec 8' },
    { id: '3', name: 'Insurance Appeal', status: 'Preparing', progress: 15, lastUpdate: 'Dec 5' },
  ];

  const caseStats = [
    { id: 'active', label: 'Active', value: 3, color: palette.primary },
    { id: 'pending', label: 'Pending', value: 2, color: palette.warning },
    { id: 'completed', label: 'Completed', value: 5, color: palette.success },
  ];

  const styles = createMasterStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Stats Overview */}
      <View style={styles.statsRow}>
        {caseStats.map((stat) => (
          <View key={stat.id} style={[styles.statCard, { backgroundColor: palette.card }]}>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: palette.secondaryText }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <GapView style={{ height: 16 }} />

      {/* Active Cases */}
      <PowerToolSection title={t('master.cases.title', 'Active Cases')}>
        {activeCases.map((caseItem) => (
          <A11yPressable
            key={caseItem.id}
            onPress={() => {
              logEvent('master.case.open', { id: caseItem.id });
              router.push('/resources/master-tracker-hub' as any);
            }}
            accessibilityLabel={`${caseItem.name}, ${caseItem.status}, ${caseItem.progress}% complete`}
            hitSlop={HIT_SLOP_8}
            style={[styles.caseCard, { backgroundColor: palette.card }]}
          >
            <View style={styles.caseHeader}>
              <Text style={[styles.caseName, { color: palette.text }]}>{caseItem.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: palette.primary + '20' }]}>
                <Text style={[styles.statusText, { color: palette.primary }]}>{caseItem.status}</Text>
              </View>
            </View>
            <View style={styles.progressRow}>
              <View style={[styles.progressBar, { backgroundColor: palette.border }]}>
                <View style={[
                  styles.progressFill, 
                  { backgroundColor: palette.primary, width: `${caseItem.progress}%` }
                ]} />
              </View>
              <Text style={[styles.progressText, { color: palette.secondaryText }]}>
                {caseItem.progress}%
              </Text>
            </View>
            <Text style={[styles.lastUpdate, { color: palette.secondaryText }]}>
              Updated: {caseItem.lastUpdate}
            </Text>
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('master.denial.explore', 'Denial Decoder')}
        icon="search"
        onPress={() => navigateToTab('denial')}
      />
    </PowerToolTabContent>
  );
}

const createMasterStyles = (_palette: any) => StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  caseCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  caseName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
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
  lastUpdate: {
    fontSize: 12,
  },
});


// ============================================
// TAB 3: DENIAL (Standard Mode)
// ============================================
function DenialTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const commonDenialReasons = [
    { id: 'insufficient-evidence', emoji: '📄', name: 'Insufficient Evidence', frequency: 'Very Common' },
    { id: 'pre-existing', emoji: '⏰', name: 'Pre-existing Condition', frequency: 'Common' },
    { id: 'not-covered', emoji: '❌', name: 'Not Covered by Policy', frequency: 'Common' },
    { id: 'missed-deadline', emoji: '📅', name: 'Missed Deadline', frequency: 'Moderate' },
    { id: 'paperwork-error', emoji: '📝', name: 'Paperwork Error', frequency: 'Moderate' },
  ];

  const styles = createDenialStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Analyze Your Denial */}
      <View style={[styles.analyzeCard, { backgroundColor: palette.primary + '15' }]}>
        <Text style={styles.analyzeEmoji}>🔍</Text>
        <Text style={[styles.analyzeTitle, { color: palette.text }]}>
          {t('denial.analyze.title', 'Analyze Your Denial Letter')}
        </Text>
        <Text style={[styles.analyzeDesc, { color: palette.secondaryText }]}>
          {t('denial.analyze.desc', 'Upload or paste your denial letter for AI analysis')}
        </Text>
        <PowerToolAction
          label={t('denial.analyze.button', 'Start Analysis')}
          icon="scan"
          onPress={() => {
            logEvent('denial.analyze.start');
            router.push('/resources/denial-decoder' as any);
          }}
          variant="primary"
        />
      </View>

      <GapView style={{ height: 16 }} />

      {/* Common Denial Reasons */}
      <PowerToolSection title={t('denial.reasons.title', 'Common Denial Reasons')}>
        {commonDenialReasons.map((reason) => (
          <A11yPressable
            key={reason.id}
            onPress={() => {
              logEvent('denial.reason.view', { reason: reason.id });
              router.push('/resources/denial-decoder' as any);
            }}
            accessibilityLabel={reason.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.reasonCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.reasonEmoji}>{reason.emoji}</Text>
            <View style={styles.reasonInfo}>
              <Text style={[styles.reasonName, { color: palette.text }]}>{reason.name}</Text>
              <Text style={[styles.reasonFreq, { color: palette.secondaryText }]}>{reason.frequency}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('denial.claims.explore', 'Claims Navigator')}
        icon="navigate"
        onPress={() => navigateToTab('claims')}
      />
    </PowerToolTabContent>
  );
}

const createDenialStyles = (_palette: any) => StyleSheet.create({
  analyzeCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  analyzeEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  analyzeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  analyzeDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  reasonEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  reasonInfo: {
    flex: 1,
  },
  reasonName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reasonFreq: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// TAB 4: CLAIMS (Power User Mode)
// ============================================
function ClaimsTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const claimTypes = [
    { id: 'disability', emoji: '♿', name: 'Disability Benefits', guides: 5 },
    { id: 'insurance', emoji: '📋', name: 'Insurance Claims', guides: 8 },
    { id: 'workplace', emoji: '💼', name: 'Workplace Injury', guides: 4 },
    { id: 'veterans', emoji: '🎖️', name: 'Veterans Benefits', guides: 3 },
  ];

  const claimTools = [
    { id: 'calculator', emoji: '🧮', name: 'Benefits Calculator', desc: 'Estimate your benefits' },
    { id: 'checklist', emoji: '✅', name: 'Claim Checklist', desc: 'Required documents' },
    { id: 'timeline', emoji: '📅', name: 'Claim Timeline', desc: 'Expected wait times' },
  ];

  const styles = createClaimsStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Claim Types */}
      <PowerToolSection title={t('claims.types.title', 'Claim Types')}>
        <View style={styles.typeGrid}>
          {claimTypes.map((type) => (
            <A11yPressable
              key={type.id}
              onPress={() => {
                logEvent('claims.type.select', { type: type.id });
                router.push('/resources/claims-navigator' as any);
              }}
              accessibilityLabel={`${type.name}, ${type.guides} guides`}
              hitSlop={HIT_SLOP_8}
              style={[styles.typeCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.typeEmoji}>{type.emoji}</Text>
              <Text style={[styles.typeName, { color: palette.text }]}>{type.name}</Text>
              <Text style={[styles.typeGuides, { color: palette.secondaryText }]}>
                {type.guides} guides
              </Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Claim Tools */}
      <PowerToolSection title={t('claims.tools.title', 'Claim Tools')}>
        {claimTools.map((tool) => (
          <A11yPressable
            key={tool.id}
            onPress={() => {
              logEvent('claims.tool.open', { tool: tool.id });
              router.push('/resources/claims-navigator' as any);
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

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('claims.rtw.explore', 'Return to Work Planning')}
        icon="briefcase"
        onPress={() => navigateToTab('rtw')}
      />
    </PowerToolTabContent>
  );
}

const createClaimsStyles = (_palette: any) => StyleSheet.create({
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  typeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  typeGuides: {
    fontSize: 12,
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
// TAB 5: RTW (Power User Mode)
// ============================================
function RTWTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const rtwStages = [
    { id: 'assessment', emoji: '📋', name: 'Self-Assessment', status: 'completed' },
    { id: 'medical', emoji: '👨‍⚕️', name: 'Medical Clearance', status: 'in-progress' },
    { id: 'accommodations', emoji: '♿', name: 'Accommodations Planning', status: 'pending' },
    { id: 'gradual', emoji: '📈', name: 'Gradual Return Plan', status: 'pending' },
    { id: 'support', emoji: '🤝', name: 'Ongoing Support', status: 'pending' },
  ];

  const rtwResources = [
    { id: 'rights', emoji: '⚖️', name: 'Your RTW Rights', desc: 'Legal protections' },
    { id: 'template', emoji: '📝', name: 'RTW Agreement Template', desc: 'Customize for your situation' },
    { id: 'conversation', emoji: '💬', name: 'Conversation Guide', desc: 'Talking to your employer' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return palette.success;
      case 'in-progress': return palette.primary;
      default: return palette.secondaryText;
    }
  };

  const styles = createRTWStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* RTW Journey */}
      <PowerToolSection title={t('rtw.journey.title', 'Your RTW Journey')}>
        {rtwStages.map((stage, index) => (
          <View key={stage.id} style={styles.stageItem}>
            {index < rtwStages.length - 1 && (
              <View style={[
                styles.stageLine, 
                { backgroundColor: stage.status === 'completed' ? palette.success : palette.border }
              ]} />
            )}
            <View style={[
              styles.stageDot,
              { 
                backgroundColor: stage.status === 'completed' ? palette.success : palette.card,
                borderColor: getStatusColor(stage.status),
              },
            ]}>
              {stage.status === 'completed' && (
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              )}
            </View>
            <A11yPressable
              onPress={() => {
                logEvent('rtw.stage.open', { stage: stage.id });
                router.push('/resources/rtw-planner' as any);
              }}
              accessibilityLabel={`${stage.name}, ${stage.status}`}
              hitSlop={HIT_SLOP_8}
              style={[styles.stageContent, { backgroundColor: palette.card }]}
            >
              <Text style={styles.stageEmoji}>{stage.emoji}</Text>
              <Text style={[styles.stageName, { color: palette.text }]}>{stage.name}</Text>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(stage.status) + '20' }
              ]}>
                <Text style={[
                  styles.statusText, 
                  { color: getStatusColor(stage.status) }
                ]}>
                  {stage.status.replace('-', ' ')}
                </Text>
              </View>
            </A11yPressable>
          </View>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* RTW Resources */}
      <PowerToolSection title={t('rtw.resources.title', 'RTW Resources')}>
        {rtwResources.map((resource) => (
          <A11yPressable
            key={resource.id}
            onPress={() => {
              logEvent('rtw.resource.open', { resource: resource.id });
              router.push('/resources/rtw-planner' as any);
            }}
            accessibilityLabel={resource.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.resourceCard, { backgroundColor: palette.primary + '15' }]}
          >
            <Text style={styles.resourceEmoji}>{resource.emoji}</Text>
            <View style={styles.resourceInfo}>
              <Text style={[styles.resourceName, { color: palette.text }]}>{resource.name}</Text>
              <Text style={[styles.resourceDesc, { color: palette.secondaryText }]}>{resource.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.primary} />
          </A11yPressable>
        ))}
      </PowerToolSection>
    </PowerToolTabContent>
  );
}

const createRTWStyles = (_palette: any) => StyleSheet.create({
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    minHeight: 60,
  },
  stageLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    width: 2,
    height: 50,
  },
  stageDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stageContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  stageEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  stageName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  resourceEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  resourceDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// MAIN EXPORT
// ============================================
export default function CaseTrackerPro() {
  const { t } = useTranslation();

  const tabs: PowerToolTab[] = [
    {
      id: 'deadlines',
      label: t('case.tabs.deadlines', 'Deadlines'),
      icon: '⏰',
      component: DeadlinesTab,
      complexity: 'simple',
      keywords: ['deadline', 'due date', 'reminder', 'urgent'],
    },
    {
      id: 'master',
      label: t('case.tabs.master', 'Master Hub'),
      icon: '📊',
      component: MasterTab,
      complexity: 'standard',
      keywords: ['cases', 'tracker', 'progress', 'status'],
    },
    {
      id: 'denial',
      label: t('case.tabs.denial', 'Denial'),
      icon: '🔍',
      component: DenialTab,
      complexity: 'standard',
      keywords: ['denial', 'decode', 'analyze', 'reason'],
    },
    {
      id: 'claims',
      label: t('case.tabs.claims', 'Claims'),
      icon: '📋',
      component: ClaimsTab,
      complexity: 'power_user',
      keywords: ['claim', 'benefits', 'insurance', 'disability'],
    },
    {
      id: 'rtw',
      label: t('case.tabs.rtw', 'RTW'),
      icon: '💼',
      component: RTWTab,
      complexity: 'power_user',
      badge: 'beta',
      keywords: ['return', 'work', 'employment', 'accommodation'],
    },
  ];

  return (
    <ResponsiveScreenWrapper>
      <PowerTool
        title={t('case.title', 'Case Tracker Pro')}
        subtitle={t('case.subtitle', 'Deadlines, claims & case management')}
        icon="📊"
        tabs={tabs}
        defaultTab="deadlines"
        showSearch
        searchPlaceholder={t('case.search', 'Search cases and deadlines...')}
        analyticsPrefix="case_tracker"
      />
    </ResponsiveScreenWrapper>
  );
}


