/**
 * Legal Action Hub - Power Tool
 * 
 * Consolidates 10 legal/accountability features into 5 tabs:
 * - Track: Accountability Hub, Cases, Network
 * - Coach: Accountability Coach + scripts
 * - Legal: Lawyer Finder, Collective Legal, Legal DNA
 * - Automation: Legal Automation, Justice as a Service
 * - Policy: Policy Simple
 */

/* eslint-disable no-restricted-syntax */ // Status colors are intentional

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
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
import type { AccCase } from '../../../services/accountabilityTracker';
import { listCases } from '../../../services/accountabilityTracker';
import { trackEvent } from '../../../services/analyticsClient';
import { useAppPalette } from '../../../theme/usePalette';


// ============================================
// TAB 1: ACCOUNTABILITY (Simple Mode)
// ============================================
function AccountabilityTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const [cases, setCases] = useState<AccCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const all = await listCases();
        if (on) setCases(all);
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, []);

  const quickActions = [
    { id: 'new-case', emoji: '📋', name: 'Start New Case', desc: 'Track a new accountability case', route: '/(tabs)/advocacy/accountability-case' },
    { id: 'cases', emoji: '📑', name: 'View All Cases', desc: 'See every active matter', route: '/(tabs)/advocacy/accountability-cases' },
    { id: 'coach', emoji: '🧑‍🏫', name: 'Accountability Coach', desc: 'Get guidance on your case', route: '/(tabs)/advocacy/accountability-coach' },
    { id: 'network', emoji: '🤝', name: 'Support Network', desc: 'Connect with others', route: '/(tabs)/advocacy/accountability-network' },
  ];

  const styles = createAccountabilityStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Active Cases */}
      <PowerToolSection title={t('legal.cases.active', 'Active Cases')}>
        {loading && (
          <View style={[styles.emptyState, { backgroundColor: palette.card }]}
          >
            <Text style={styles.emptyEmoji}>⏳</Text>
            <Text style={[styles.emptyText, { color: palette.secondaryText }]}>
              {t('legal.cases.loading', 'Loading your cases...')}
            </Text>
          </View>
        )}
        {!loading && cases.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: palette.card }]}
          >
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={[styles.emptyText, { color: palette.secondaryText }]}>
              {t('legal.cases.empty', 'No active cases. Start tracking to hold entities accountable.')}
            </Text>
          </View>
        )}
        {!loading && cases.length > 0 && (
          cases.map((caseItem) => (
            <A11yPressable
              key={caseItem.id}
              onPress={() => {
                trackEvent('legal.track.case.open', { id: caseItem.id });
                router.push({ pathname: '/(tabs)/advocacy/accountability-case', params: { id: caseItem.id } } as any);
              }}
              accessibilityLabel={`${caseItem.target || t('legal.cases.unknownTarget', 'Unknown target')}: ${caseItem.issue}`}
              hitSlop={HIT_SLOP_8}
              style={[styles.caseCard, { backgroundColor: palette.card }]}
            >
              <View style={styles.caseHeader}>
                <Text style={[styles.caseEntity, { color: palette.text }]}>{caseItem.target || t('legal.cases.unknownTarget', 'Unknown target')}</Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: palette.primary + '20' }
                ]}>
                  <Text style={[
                    styles.statusText, 
                    { color: palette.primary }
                  ]}>
                    {t('legal.cases.activeStatus', 'Active')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.caseType, { color: palette.secondaryText }]}>{caseItem.issue}</Text>
              <Text style={[styles.caseDays, { color: palette.secondaryText }]}>
                {t('legal.cases.updated', 'Updated')} {new Date(caseItem.updatedAt).toLocaleDateString()}
              </Text>
            </A11yPressable>
          ))
        )}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Quick Actions */}
      <PowerToolSection title={t('legal.actions.title', 'Quick Actions')}>
        {quickActions.map((action) => (
          <A11yPressable
            key={action.id}
            onPress={() => {
                trackEvent('legal.track.action', { action: action.id });
                router.push(action.route as any);
            }}
            accessibilityLabel={action.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.actionCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.actionEmoji}>{action.emoji}</Text>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionName, { color: palette.text }]}>{action.name}</Text>
              <Text style={[styles.actionDesc, { color: palette.secondaryText }]}>{action.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('legal.find.explore', 'Find Legal Help')}
        icon="search"
        onPress={() => navigateToTab('legal')}
      />
    </PowerToolTabContent>
  );
}

const createAccountabilityStyles = (_palette: any) => StyleSheet.create({
  caseCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  caseEntity: {
    fontSize: 16,
    fontWeight: '600',
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
  caseType: {
    fontSize: 14,
    marginBottom: 4,
  },
  caseDays: {
    fontSize: 12,
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// TAB 2: COACH (Simple Mode)
function CoachTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const scripts = [
    { id: 'evidence', emoji: '🧾', title: 'Evidence ask', desc: 'Ask for documents politely but firmly' },
    { id: 'timeline', emoji: '⏱️', title: 'Timeline demand', desc: 'Request clear timelines and escalation path' },
    { id: 'accommodation', emoji: '🛟', title: 'Accommodation script', desc: 'State needs + reference policy' },
    { id: 'appeal', emoji: '🧭', title: 'Appeal prep', desc: 'Checklist before filing' },
  ];

  const coachActions = [
    { id: 'coach', emoji: '🧑‍🏫', name: 'Open Accountability Coach', desc: 'Guided steps + scripts', route: '/advocacy/accountability-coach' },
    { id: 'network', emoji: '🤝', name: 'Ask Allies for Support', desc: 'Share context with trusted people', route: '/advocacy/accountability-network' },
    { id: 'evidence', emoji: '📂', name: 'Attach Evidence', desc: 'Jump to Evidence Command Center', route: '/advocacy/evidence-command-center' },
  ];

  const styles = createCoachStyles(palette);

    return (
      <PowerToolTabContent scrollable>
        <PowerToolSection title={t('legal.coach.topScripts', 'Top Coach Scripts')}>
          {scripts.map((script) => (
            <A11yPressable
              key={script.id}
              onPress={() => {
                trackEvent('legal.coach.script', { script: script.id });
                router.push('/advocacy/accountability-coach' as any);
              }}
              accessibilityLabel={script.title}
              hitSlop={HIT_SLOP_8}
              style={[styles.scriptCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.scriptEmoji}>{script.emoji}</Text>
              <View style={styles.scriptInfo}>
                <Text style={[styles.scriptTitle, { color: palette.text }]}>{script.title}</Text>
                <Text style={[styles.scriptDesc, { color: palette.secondaryText }]}>{script.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
            </A11yPressable>
          ))}
        </PowerToolSection>

        <GapView style={{ height: 16 }} />

        <PowerToolSection title={t('legal.coach.actions', 'Do This Next')}>
          {coachActions.map((action) => (
            <A11yPressable
              key={action.id}
              onPress={() => {
                trackEvent('legal.coach.action', { action: action.id });
                router.push(action.route as any);
              }}
              accessibilityLabel={action.name}
              hitSlop={HIT_SLOP_8}
              style={[styles.actionCard, { backgroundColor: palette.primary + '12' }]}
            >
              <Text style={styles.actionEmoji}>{action.emoji}</Text>
              <View style={styles.actionInfo}>
                <Text style={[styles.actionName, { color: palette.text }]}>{action.name}</Text>
                <Text style={[styles.actionDesc, { color: palette.secondaryText }]}>{action.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={palette.primary} />
            </A11yPressable>
          ))}
        </PowerToolSection>

        <GapView style={{ height: 16 }} />

        <PowerToolAction
          label={t('legal.coach.goToLegal', 'Find Legal Help')}
          icon="search"
          onPress={() => navigateToTab('legal')}
        />
      </PowerToolTabContent>
    );
  }

  const createCoachStyles = (_palette: any) => StyleSheet.create({
    scriptCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    scriptEmoji: {
      fontSize: 28,
      marginRight: 12,
    },
    scriptInfo: {
      flex: 1,
    },
    scriptTitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    scriptDesc: {
      fontSize: 12,
      marginTop: 2,
    },
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    actionEmoji: {
      fontSize: 28,
      marginRight: 12,
    },
    actionInfo: {
      flex: 1,
    },
    actionName: {
      fontSize: 16,
      fontWeight: '600',
    },
    actionDesc: {
      fontSize: 12,
      marginTop: 2,
    },
  });


  // ============================================
  // TAB 3: LEGAL (Standard Mode)
// ============================================
function LegalTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const legalResources = [
    { id: 'lawyer', emoji: '👨‍⚖️', name: 'Find a Lawyer', desc: 'Disability law specialists', featured: true, route: '/advocacy/lawyer-finder' },
    { id: 'collective', emoji: '👥', name: 'Collective Legal Action', desc: 'Join or start class actions', route: '/advocacy/collective-legal' },
    { id: 'legal-aid', emoji: '🆓', name: 'Legal Aid Services', desc: 'Free legal help', route: '/advocacy/lawyer-finder' },
    { id: 'dna', emoji: '🧬', name: 'Legal DNA', desc: 'Your case strength analysis', route: '/advocacy/legal-dna' },
  ];

  const recentMatches = [
    { id: '1', name: 'Jane Smith, Esq.', specialty: 'Disability Rights', rating: 4.8 },
    { id: '2', name: 'Disability Law Center', specialty: 'Appeals', rating: 4.9 },
  ];

  const styles = createLegalStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Legal Resources */}
      <PowerToolSection title={t('legal.resources.title', 'Legal Resources')}>
        {legalResources.map((resource) => (
          <A11yPressable
            key={resource.id}
            onPress={() => {
              trackEvent('legal.resource', { resource: resource.id });
              router.push(resource.route as any);
            }}
            accessibilityLabel={resource.name}
            hitSlop={HIT_SLOP_8}
            style={[
              styles.resourceCard, 
              { 
                backgroundColor: resource.featured ? palette.primary + '15' : palette.card,
                borderColor: resource.featured ? palette.primary : 'transparent',
                borderWidth: resource.featured ? 1 : 0,
              }
            ]}
          >
            <Text style={styles.resourceEmoji}>{resource.emoji}</Text>
            <View style={styles.resourceInfo}>
              <Text style={[styles.resourceName, { color: palette.text }]}>{resource.name}</Text>
              <Text style={[styles.resourceDesc, { color: palette.secondaryText }]}>{resource.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Recent Matches */}
      <PowerToolSection title={t('legal.matches.title', 'Recommended Lawyers')}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.matchesRow}>
            {recentMatches.map((match) => (
              <A11yPressable
                key={match.id}
                onPress={() => {
                  trackEvent('legal.match.view', { id: match.id });
                  router.push('/advocacy/lawyer-finder' as any);
                }}
                accessibilityLabel={`${match.name}, ${match.specialty}, ${match.rating} stars`}
                hitSlop={HIT_SLOP_8}
                style={[styles.matchCard, { backgroundColor: palette.card }]}
              >
                <View style={[styles.matchAvatar, { backgroundColor: palette.primary + '20' }]}>
                  <Text style={styles.matchInitial}>{match.name[0]}</Text>
                </View>
                <Text style={[styles.matchName, { color: palette.text }]} numberOfLines={1}>
                  {match.name}
                </Text>
                <Text style={[styles.matchSpecialty, { color: palette.secondaryText }]}>
                  {match.specialty}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={[styles.ratingText, { color: palette.text }]}>{match.rating}</Text>
                </View>
              </A11yPressable>
            ))}
          </View>
        </ScrollView>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('legal.automation.explore', 'Legal Automation')}
        icon="flash"
        onPress={() => navigateToTab('automation')}
      />
    </PowerToolTabContent>
  );
}

const createLegalStyles = (_palette: any) => StyleSheet.create({
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
  matchesRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  matchCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 140,
  },
  matchAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  matchInitial: {
    fontSize: 20,
    fontWeight: '600',
  },
  matchName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  matchSpecialty: {
    fontSize: 12,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
});


// ============================================
// TAB 3: AUTOMATION (Power User Mode)
// ============================================
function AutomationTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const automationTools = [
    { id: 'deadline', emoji: '⏰', name: 'Deadline Automation', desc: 'Auto-reminders for legal deadlines', active: true },
    { id: 'template', emoji: '📝', name: 'Legal Templates', desc: 'Pre-filled legal documents', active: true },
    { id: 'foia', emoji: '📄', name: 'FOIA Request Generator', desc: 'Auto-generate information requests', active: false },
    { id: 'complaint', emoji: '⚠️', name: 'Complaint Filing', desc: 'Guided complaint submissions', active: false },
  ];

  const justiceServices = [
    { id: 'review', emoji: '🔍', name: 'Case Review', desc: 'AI analysis of your case strength' },
    { id: 'strategy', emoji: '🎯', name: 'Strategy Builder', desc: 'Personalized action plans' },
    { id: 'simulate', emoji: '🎮', name: 'Outcome Simulator', desc: 'Predict possible outcomes' },
  ];

  const styles = createAutomationStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Automation Tools */}
      <PowerToolSection title={t('legal.automation.title', 'Automation Tools')}>
        {automationTools.map((tool) => (
          <A11yPressable
            key={tool.id}
            onPress={() => {
              trackEvent('legal.automation.tool', { tool: tool.id });
              router.push('/advocacy/legal-automation' as any);
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
            <View style={[
              styles.activeBadge, 
              { backgroundColor: tool.active ? palette.success + '20' : palette.secondaryText + '20' }
            ]}>
              <Text style={[
                styles.activeText, 
                { color: tool.active ? palette.success : palette.secondaryText }
              ]}>
                {tool.active ? 'Active' : 'Setup'}
              </Text>
            </View>
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Justice as a Service */}
      <PowerToolSection title={t('legal.jaas.title', 'Justice as a Service')}>
        <View style={[styles.jaasCard, { backgroundColor: palette.primary + '15' }]}>
          <Text style={styles.jaasEmoji}>⚖️</Text>
          <Text style={[styles.jaasTitle, { color: palette.text }]}>
            {t('legal.jaas.subtitle', 'AI-Powered Legal Intelligence')}
          </Text>
          <Text style={[styles.jaasDesc, { color: palette.secondaryText }]}>
            {t('legal.jaas.desc', 'Advanced tools to level the playing field against well-funded opponents')}
          </Text>
        </View>
        
        {justiceServices.map((service) => (
          <A11yPressable
            key={service.id}
            onPress={() => {
              trackEvent('legal.jaas.service', { service: service.id });
              Alert.alert(t('common.comingSoon', 'Coming Soon'), service.name);
            }}
            accessibilityLabel={service.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.serviceCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.serviceEmoji}>{service.emoji}</Text>
            <View style={styles.serviceInfo}>
              <Text style={[styles.serviceName, { color: palette.text }]}>{service.name}</Text>
              <Text style={[styles.serviceDesc, { color: palette.secondaryText }]}>{service.desc}</Text>
            </View>
            <View style={[styles.betaBadge, { backgroundColor: palette.warning + '20' }]}>
              <Text style={[styles.betaText, { color: palette.warning }]}>Beta</Text>
            </View>
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('legal.policy.explore', 'Policy & Advocacy')}
        icon="document-text"
        onPress={() => navigateToTab('policy')}
      />
    </PowerToolTabContent>
  );
}

const createAutomationStyles = (_palette: any) => StyleSheet.create({
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
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  jaasCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  jaasEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  jaasTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  jaasDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  serviceEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  betaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  betaText: {
    fontSize: 10,
    fontWeight: '600',
  },
});


// ============================================
// TAB 4: POLICY (Power User Mode)
// ============================================
function PolicyTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const policyAreas = [
    { id: 'disability', emoji: '♿', name: 'Disability Policy', desc: 'Laws affecting disabled people' },
    { id: 'healthcare', emoji: '🏥', name: 'Healthcare Policy', desc: 'Medical and insurance laws' },
    { id: 'employment', emoji: '💼', name: 'Employment Law', desc: 'Workplace rights and protections' },
    { id: 'housing', emoji: '🏠', name: 'Housing Rights', desc: 'Accessible housing laws' },
  ];

  const advocacyActions = [
    { id: 'letter-mp', emoji: '📝', name: 'Write to Your MP', action: 'Template letter to elected officials' },
    { id: 'petition', emoji: '✍️', name: 'Sign Petitions', action: 'Active disability rights petitions' },
    { id: 'campaign', emoji: '📣', name: 'Join Campaigns', action: 'Ongoing advocacy campaigns' },
  ];

  const styles = createPolicyStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Policy Areas */}
      <PowerToolSection title={t('policy.areas.title', 'Policy Areas')}>
        <View style={styles.policyGrid}>
          {policyAreas.map((area) => (
            <A11yPressable
              key={area.id}
              onPress={() => {
                trackEvent('policy.area', { area: area.id });
                router.push('/advocacy/policy-simple' as any);
              }}
              accessibilityLabel={area.name}
              hitSlop={HIT_SLOP_8}
              style={[styles.policyCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.policyEmoji}>{area.emoji}</Text>
              <Text style={[styles.policyName, { color: palette.text }]}>{area.name}</Text>
              <Text style={[styles.policyDesc, { color: palette.secondaryText }]} numberOfLines={2}>
                {area.desc}
              </Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Take Action */}
      <PowerToolSection title={t('policy.action.title', 'Take Action')}>
        {advocacyActions.map((action) => (
          <A11yPressable
            key={action.id}
            onPress={() => {
              trackEvent('policy.action', { action: action.id });
              router.push('/advocacy/policy-simple' as any);
            }}
            accessibilityLabel={action.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.actionCard, { backgroundColor: palette.primary + '15' }]}
          >
            <Text style={styles.actionEmoji}>{action.emoji}</Text>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionName, { color: palette.text }]}>{action.name}</Text>
              <Text style={[styles.actionDesc, { color: palette.secondaryText }]}>{action.action}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={palette.primary} />
          </A11yPressable>
        ))}
      </PowerToolSection>
    </PowerToolTabContent>
  );
}

const createPolicyStyles = (_palette: any) => StyleSheet.create({
  policyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  policyCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
  },
  policyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  policyName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  policyDesc: {
    fontSize: 11,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// MAIN EXPORT
// ============================================
export default function LegalActionHub() {
  const { t } = useTranslation();

  const tabs: PowerToolTab[] = [
    {
      id: 'accountability',
      label: t('legal.tabs.accountability', 'Accountability'),
      icon: '📋',
      component: AccountabilityTab,
      complexity: 'simple',
      keywords: ['case', 'accountability', 'track', 'entity'],
    },
    {
      id: 'coach',
      label: t('legal.tabs.coach', 'Coach'),
      icon: '🧑‍🏫',
      component: CoachTab,
      complexity: 'simple',
      keywords: ['coach', 'script', 'support', 'network'],
    },
    {
      id: 'legal',
      label: t('legal.tabs.legal', 'Legal Help'),
      icon: '⚖️',
      component: LegalTab,
      complexity: 'standard',
      keywords: ['lawyer', 'attorney', 'legal aid', 'collective'],
    },
    {
      id: 'automation',
      label: t('legal.tabs.automation', 'Automation'),
      icon: '⚡',
      component: AutomationTab,
      complexity: 'power_user',
      badge: 'beta',
      keywords: ['automate', 'deadline', 'template', 'FOIA'],
    },
    {
      id: 'policy',
      label: t('legal.tabs.policy', 'Policy'),
      icon: '📜',
      component: PolicyTab,
      complexity: 'power_user',
      keywords: ['policy', 'law', 'advocacy', 'campaign'],
    },
  ];

  return (
    <ResponsiveScreenWrapper>
      <PowerTool
        title={t('legal.title', 'Legal Action Hub')}
        subtitle={t('legal.subtitle', 'Accountability, legal help & advocacy tools')}
        icon="⚖️"
        tabs={tabs}
        defaultTab="accountability"
        showSearch
        searchPlaceholder={t('legal.search', 'Search legal tools...')}
        analyticsPrefix="legal_action"
      />
    </ResponsiveScreenWrapper>
  );
}


