/**
 * Document Factory - Unified Power Tool
 * 
 * Consolidates 8 letter/document features into one tabbed interface:
 * - Quick (Top 3 letter templates for Simple mode)
 * - Letters (Full Letter Factory, all templates)
 * - Appeals (Appeal Coach, Appeal Command Center)
 * - Accommodation (Accommodation Request Builder)
 * - Templates (Template Gallery)
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
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
import { useJurisdiction } from '../../../store/jurisdiction';
import { useAppPalette } from '../../../theme/usePalette';

let _AsyncStorage: any;
try {
  _AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

// Template definitions
const TOP_TEMPLATES = [
  { id: 'appeal', icon: '⚖️', label: 'Appeal Letter', desc: 'Appeal a denial decision', popular: true },
  { id: 'accommodation', icon: '♿', label: 'Accommodation Request', desc: 'Request workplace accommodations', popular: true },
  { id: 'complaint', icon: '📢', label: 'Formal Complaint', desc: 'File a complaint about treatment', popular: true },
];

const ALL_TEMPLATES = [
  ...TOP_TEMPLATES,
  { id: 'medical', icon: '🏥', label: 'Medical Documentation Request', desc: 'Request records from providers' },
  { id: 'employer', icon: '💼', label: 'Employer Communication', desc: 'Communicate with your employer' },
  { id: 'insurance', icon: '📋', label: 'Insurance Claim Letter', desc: 'Submit or follow up on claims' },
  { id: 'extension', icon: '⏰', label: 'Deadline Extension Request', desc: 'Request more time' },
  { id: 'reconsideration', icon: '🔄', label: 'Reconsideration Request', desc: 'Ask for a second look' },
  { id: 'information', icon: '📄', label: 'Information Request (FOIA)', desc: 'Request government information' },
  { id: 'support', icon: '🤝', label: 'Support Letter Template', desc: 'Letter from supporters' },
  { id: 'mp', icon: '🏛️', label: 'Letter to MP/MPP', desc: 'Contact elected officials' },
  { id: 'media', icon: '📰', label: 'Media Statement', desc: 'Public statement template' },
];

// ============================================
// TAB 1: QUICK LETTERS (Simple Mode)
// Top 3 most-used templates
// ============================================
function QuickTab(props: PowerToolTabProps) {
  const { navigateToTab } = props;
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  const { code: jurisdictionCode } = useJurisdiction();

  const styles = createQuickStyles(palette);

  const handleTemplateSelect = (template: typeof TOP_TEMPLATES[0]) => {
    trackEvent('document.template.selected', { 
      template: template.id, 
      source: 'quick_tab',
      jurisdiction: jurisdictionCode,
    });
    router.push({
      pathname: '/resources/letter-factory',
      params: { template: template.id },
    } as any);
  };

  return (
    <PowerToolTabContent>
      <DisclaimerBanner type="legal" compact />

      {/* Intro */}
      <View style={styles.introCard}>
        <Text style={styles.introTitle}>{t('docs.quickTitle', '📝 Quick Letters')}</Text>
        <Text style={styles.introDesc}>
          {t('docs.quickDesc', 'Choose a template to create a professional letter. AI will help you customize it for your situation.')}
        </Text>
      </View>

      {/* Top 3 Templates */}
      <PowerToolSection title={t('docs.mostUsed', 'Most Used Templates')}>
        {TOP_TEMPLATES.map(template => (
          <A11yPressable
            key={template.id}
            style={styles.templateCard}
            onPress={() => handleTemplateSelect(template)}
            accessibilityRole="button"
            accessibilityLabel={`${template.label}: ${template.desc}`}
            hitSlop={HIT_SLOP_8}
          >
            <Text style={styles.templateIcon}>{template.icon}</Text>
            <View style={styles.templateText}>
              <Text style={styles.templateLabel}>{template.label}</Text>
              <Text style={styles.templateDesc}>{template.desc}</Text>
            </View>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>⭐</Text>
            </View>
          </A11yPressable>
        ))}
      </PowerToolSection>

      {/* Need more? */}
      <View style={styles.moreCard}>
        <Text style={styles.moreTitle}>{t('docs.needMore', 'Need a different template?')}</Text>
        <A11yPressable
          style={styles.moreButton}
          onPress={() => navigateToTab('letters')}
          accessibilityRole="button"
        >
          <Text style={styles.moreButtonText}>{t('docs.viewAll', 'View All Templates')}</Text>
          <Ionicons name="arrow-forward" size={16} color={palette.primary} />
        </A11yPressable>
      </View>

      {/* Recent Drafts */}
      <PowerToolSection title={t('docs.recentDrafts', 'Recent Drafts')}>
        <View style={styles.emptyDrafts}>
          <Ionicons name="document-text-outline" size={32} color={palette.muted} />
          <Text style={styles.emptyDraftsText}>
            {t('docs.noDrafts', 'No recent drafts. Start a letter above!')}
          </Text>
        </View>
      </PowerToolSection>
    </PowerToolTabContent>
  );
}

// ============================================
// TAB 2: LETTERS (Standard Mode)
// Full letter factory with all templates
// ============================================
function LettersTab(props: PowerToolTabProps) {
  const { searchQuery } = props;
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  
  const [filter, setFilter] = useState('all');

  const styles = createLettersStyles(palette);

  const filteredTemplates = ALL_TEMPLATES.filter(template => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return template.label.toLowerCase().includes(q) || template.desc.toLowerCase().includes(q);
  });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'appeals', label: 'Appeals' },
    { id: 'workplace', label: 'Workplace' },
    { id: 'government', label: 'Government' },
  ];

  return (
    <PowerToolTabContent>
      <DisclaimerBanner type="legal" compact />

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        {categories.map(cat => (
          <Pressable
            key={cat.id}
            style={[styles.filterButton, filter === cat.id && styles.filterButtonActive]}
            onPress={() => setFilter(cat.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === cat.id }}
          >
            <Text style={[styles.filterText, filter === cat.id && styles.filterTextActive]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Templates Grid */}
      <PowerToolSection title={t('docs.allTemplates', 'All Templates ({{count}})', { count: filteredTemplates.length })}>
        {filteredTemplates.map(template => (
          <A11yPressable
            key={template.id}
            style={styles.templateCard}
            onPress={() => router.push({
              pathname: '/resources/letter-factory',
              params: { template: template.id },
            } as any)}
            accessibilityRole="button"
            accessibilityLabel={`${template.label}: ${template.desc}`}
          >
            <Text style={styles.templateIcon}>{template.icon}</Text>
            <View style={styles.templateText}>
              <Text style={styles.templateLabel}>{template.label}</Text>
              <Text style={styles.templateDesc}>{template.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      {/* Saved Letters */}
      <PowerToolAction
        label={t('docs.viewSaved', 'View Saved Letters')}
        icon="💾"
        onPress={() => router.push('/resources/letters')}
      />
    </PowerToolTabContent>
  );
}

// ============================================
// TAB 3: APPEALS (Standard Mode)
// Appeal-specific tools
// ============================================
function AppealsTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  const { data: jurisdiction } = useJurisdiction();

  const styles = createAppealsStyles(palette);

  return (
    <PowerToolTabContent>
      <DisclaimerBanner type="legal" compact />

      {/* Appeal Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusIcon}>⚖️</Text>
        <Text style={styles.statusTitle}>{t('appeals.title', 'Appeal Hub')}</Text>
        <Text style={styles.statusDesc}>
          {t('appeals.desc', 'Tools to help you prepare and track your appeal. Works with WSIB, ODSP, CPP-D, and more.')}
        </Text>
        {jurisdiction && (
          <View style={styles.jurisdictionBadge}>
            <Ionicons name="location" size={14} color={palette.primary} />
            <Text style={styles.jurisdictionText}>{jurisdiction.name}</Text>
          </View>
        )}
      </View>

      {/* Appeal Tools */}
      <PowerToolSection title={t('appeals.tools', 'Appeal Tools')}>
        <PowerToolAction
          label={t('appeals.commandCenter', 'Appeal Command Center')}
          icon="🎯"
          onPress={() => router.push('/resources/appeal-command-center')}
          variant="primary"
        />
        <PowerToolAction
          label={t('appeals.coach', 'Appeal Coach')}
          icon="🧑‍🏫"
          onPress={() => router.push('/resources/appeal-coach')}
        />
        <PowerToolAction
          label={t('appeals.denialDecoder', 'Denial Decoder')}
          icon="🔍"
          onPress={() => router.push('/resources/denial-decoder')}
        />
        <PowerToolAction
          label={t('appeals.deadlines', 'Appeal Deadlines')}
          icon="⏰"
          onPress={() => router.push('/resources/deadlines')}
        />
      </PowerToolSection>

      {/* Write Appeal Letter */}
      <PowerToolSection title={t('appeals.writeLetter', 'Write Appeal Letter')}>
        <A11yPressable
          style={styles.writeCard}
          onPress={() => router.push({
            pathname: '/resources/letter-factory',
            params: { template: 'appeal' },
          } as any)}
          accessibilityRole="button"
        >
          <View style={styles.writeContent}>
            <Text style={styles.writeIcon}>✍️</Text>
            <View>
              <Text style={styles.writeTitle}>{t('appeals.startLetter', 'Start Appeal Letter')}</Text>
              <Text style={styles.writeDesc}>{t('appeals.startLetterDesc', 'AI-assisted appeal letter generator')}</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color={palette.primary} />
        </A11yPressable>
      </PowerToolSection>

      {/* Evidence Checklist */}
      <PowerToolAction
        label={t('appeals.evidenceChecklist', 'Appeal Evidence Checklist')}
        icon="✅"
        onPress={() => router.push('/resources/evidence-checklist')}
      />
    </PowerToolTabContent>
  );
}

// ============================================
// TAB 4: ACCOMMODATION (Standard Mode)
// Workplace accommodation requests
// ============================================
function AccommodationTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const styles = createAccommodationStyles(palette);

  const accommodationTypes = [
    { id: 'physical', icon: '🏢', label: 'Physical Workspace', desc: 'Desk, chair, equipment modifications' },
    { id: 'schedule', icon: '🕐', label: 'Schedule/Hours', desc: 'Flexible hours, remote work, breaks' },
    { id: 'duties', icon: '📋', label: 'Job Duties', desc: 'Task modifications, reassignment' },
    { id: 'communication', icon: '💬', label: 'Communication', desc: 'Meeting accommodations, written instructions' },
    { id: 'technology', icon: '💻', label: 'Technology', desc: 'Software, devices, assistive tech' },
    { id: 'medical', icon: '🏥', label: 'Medical Leave', desc: 'Time off, return-to-work plans' },
  ];

  return (
    <PowerToolTabContent>
      <DisclaimerBanner type="legal" compact />

      {/* Intro */}
      <View style={styles.introCard}>
        <Text style={styles.introIcon}>♿</Text>
        <Text style={styles.introTitle}>{t('accommodation.title', 'Accommodation Requests')}</Text>
        <Text style={styles.introDesc}>
          {t('accommodation.desc', 'Create professional accommodation request letters. Employers have a duty to accommodate to the point of undue hardship.')}
        </Text>
      </View>

      {/* Accommodation Types */}
      <PowerToolSection title={t('accommodation.types', 'Type of Accommodation')}>
        {accommodationTypes.map(type => (
          <A11yPressable
            key={type.id}
            style={styles.typeCard}
            onPress={() => router.push({
              pathname: '/resources/letter-factory',
              params: { template: 'accommodation', subtype: type.id },
            } as any)}
            accessibilityRole="button"
            accessibilityLabel={`${type.label}: ${type.desc}`}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <View style={styles.typeText}>
              <Text style={styles.typeLabel}>{type.label}</Text>
              <Text style={styles.typeDesc}>{type.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      {/* Know Your Rights */}
      <View style={styles.rightsCard}>
        <Ionicons name="shield-checkmark" size={24} color={palette.success} />
        <View style={styles.rightsText}>
          <Text style={styles.rightsTitle}>{t('accommodation.rights', 'Know Your Rights')}</Text>
          <Text style={styles.rightsDesc}>
            {t('accommodation.rightsDesc', 'In Canada, employers must accommodate disabilities unless it causes undue hardship.')}
          </Text>
        </View>
        <A11yPressable
          onPress={() => router.push('/resources/rights-checker')}
          accessibilityLabel={t('accommodation.learnMore', 'Learn more about your rights')}
        >
          <Text style={styles.rightsLink}>{t('common.learnMore', 'Learn More')}</Text>
        </A11yPressable>
      </View>
    </PowerToolTabContent>
  );
}

// ============================================
// TAB 5: TEMPLATES (Power User)
// Full template gallery and management
// ============================================
function TemplatesTab(props: PowerToolTabProps) {
  const { navigateToTab } = props;
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const styles = createTemplatesStyles(palette);

  const templateCategories = [
    { category: 'Appeals & Complaints', count: 4, icon: '⚖️' },
    { category: 'Workplace', count: 3, icon: '💼' },
    { category: 'Medical & Insurance', count: 3, icon: '🏥' },
    { category: 'Government & Officials', count: 2, icon: '🏛️' },
  ];

  return (
    <PowerToolTabContent>
      <DisclaimerBanner type="legal" compact />

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{ALL_TEMPLATES.length}</Text>
          <Text style={styles.statLabel}>{t('templates.total', 'Templates')}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>{t('templates.created', 'Created')}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>{t('templates.saved', 'Saved')}</Text>
        </View>
      </View>

      {/* Categories */}
      <PowerToolSection title={t('templates.categories', 'Categories')}>
        {templateCategories.map((cat, i) => (
          <A11yPressable
            key={i}
            style={styles.categoryCard}
            onPress={() => navigateToTab('letters')}
            accessibilityRole="button"
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={styles.categoryLabel}>{cat.category}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryCount}>{cat.count}</Text>
            </View>
          </A11yPressable>
        ))}
      </PowerToolSection>

      {/* Actions */}
      <PowerToolSection title={t('templates.actions', 'Actions')}>
        <PowerToolAction
          label={t('templates.customTemplate', 'Create Custom Template')}
          icon="➕"
          onPress={() => router.push('/resources/letter-factory')}
          variant="primary"
        />
        <PowerToolAction
          label={t('templates.importTemplate', 'Import Template')}
          icon="📥"
          onPress={() => Alert.alert(t('common.comingSoon', 'Coming Soon'))}
        />
        <PowerToolAction
          label={t('templates.exportAll', 'Export All Letters')}
          icon="📤"
          onPress={() => Alert.alert(t('common.comingSoon', 'Coming Soon'))}
        />
      </PowerToolSection>
    </PowerToolTabContent>
  );
}

// ============================================
// TAB DEFINITIONS
// ============================================
const DOCUMENT_TABS: PowerToolTab[] = [
  {
    id: 'quick',
    label: 'Quick',
    icon: '⚡',
    complexity: 'simple',
    component: QuickTab,
    keywords: ['quick', 'simple', 'start', 'popular'],
  },
  {
    id: 'letters',
    label: 'Letters',
    icon: '📝',
    complexity: 'standard',
    component: LettersTab,
    keywords: ['letter', 'template', 'write', 'create'],
  },
  {
    id: 'appeals',
    label: 'Appeals',
    icon: '⚖️',
    complexity: 'standard',
    component: AppealsTab,
    badge: 'beta',
    keywords: ['appeal', 'denial', 'fight', 'overturn'],
  },
  {
    id: 'accommodation',
    label: 'Accommodation',
    icon: '♿',
    complexity: 'standard',
    component: AccommodationTab,
    keywords: ['accommodation', 'workplace', 'employer', 'request'],
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: '📁',
    complexity: 'power_user',
    component: TemplatesTab,
    keywords: ['template', 'gallery', 'all', 'manage', 'custom'],
  },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function DocumentFactory() {
  const { t } = useTranslation();

  return (
    <ResponsiveScreenWrapper>
      <PowerTool
        title={t('docFactory.title', 'Document Factory')}
        subtitle={t('docFactory.subtitle', 'Letters, appeals, and accommodation requests')}
        icon="📝"
        tabs={DOCUMENT_TABS}
        defaultTab="quick"
        searchPlaceholder={t('docFactory.search', 'Search templates...')}
        analyticsPrefix="resources.doc_factory"
      />
    </ResponsiveScreenWrapper>
  );
}

// ============================================
// STYLES
// ============================================

function createQuickStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    introCard: {
      backgroundColor: palette.primary + '10',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: palette.primary + '30',
    },
    introTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8,
    },
    introDesc: {
      fontSize: 14,
      color: palette.muted,
      lineHeight: 21,
    },
    templateCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.card,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      gap: 12,
    },
    templateIcon: {
      fontSize: 28,
    },
    templateText: {
      flex: 1,
    },
    templateLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    templateDesc: {
      fontSize: 13,
      color: palette.muted,
      marginTop: 2,
    },
    popularBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: palette.warning + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    popularText: {
      fontSize: 14,
    },
    moreCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: palette.border,
    },
    moreTitle: {
      fontSize: 14,
      color: palette.muted,
      marginBottom: 10,
    },
    moreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    moreButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.primary,
    },
    emptyDrafts: {
      alignItems: 'center',
      padding: 24,
      backgroundColor: palette.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
    },
    emptyDraftsText: {
      fontSize: 14,
      color: palette.muted,
      marginTop: 8,
      textAlign: 'center',
    },
  });
}

function createLettersStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    filterContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    filterButton: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.border,
    },
    filterButtonActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    filterText: {
      fontSize: 13,
      fontWeight: '500',
      color: palette.text,
    },
    filterTextActive: {
      color: palette.onPrimary,
    },
    templateCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.card,
      padding: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      gap: 12,
    },
    templateIcon: {
      fontSize: 24,
    },
    templateText: {
      flex: 1,
    },
    templateLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.text,
    },
    templateDesc: {
      fontSize: 12,
      color: palette.muted,
      marginTop: 2,
    },
  });
}

function createAppealsStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    statusCard: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border,
    },
    statusIcon: {
      fontSize: 40,
      marginBottom: 8,
    },
    statusTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 6,
    },
    statusDesc: {
      fontSize: 14,
      color: palette.muted,
      textAlign: 'center',
      lineHeight: 21,
    },
    jurisdictionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.primary + '15',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      marginTop: 12,
      gap: 6,
    },
    jurisdictionText: {
      fontSize: 13,
      fontWeight: '500',
      color: palette.primary,
    },
    writeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: palette.primary + '10',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.primary + '30',
    },
    writeContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    writeIcon: {
      fontSize: 28,
    },
    writeTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    writeDesc: {
      fontSize: 12,
      color: palette.muted,
      marginTop: 2,
    },
  });
}

function createAccommodationStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    introCard: {
      backgroundColor: palette.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border,
    },
    introIcon: {
      fontSize: 40,
      marginBottom: 8,
    },
    introTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 6,
    },
    introDesc: {
      fontSize: 14,
      color: palette.muted,
      textAlign: 'center',
      lineHeight: 21,
    },
    typeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.card,
      padding: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      gap: 12,
    },
    typeIcon: {
      fontSize: 24,
    },
    typeText: {
      flex: 1,
    },
    typeLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.text,
    },
    typeDesc: {
      fontSize: 12,
      color: palette.muted,
      marginTop: 2,
    },
    rightsCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: palette.success + '10',
      padding: 16,
      borderRadius: 12,
      gap: 12,
      marginTop: 8,
    },
    rightsText: {
      flex: 1,
    },
    rightsTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: palette.text,
    },
    rightsDesc: {
      fontSize: 13,
      color: palette.muted,
      marginTop: 4,
      lineHeight: 20,
    },
    rightsLink: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.primary,
    },
  });
}

function createTemplatesStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    statsCard: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: palette.border,
    },
    stat: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 28,
      fontWeight: '700',
      color: palette.primary,
    },
    statLabel: {
      fontSize: 12,
      color: palette.muted,
      marginTop: 4,
    },
    categoryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.card,
      padding: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      gap: 12,
    },
    categoryIcon: {
      fontSize: 24,
    },
    categoryLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: palette.text,
    },
    categoryBadge: {
      backgroundColor: palette.primary + '20',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    categoryCount: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.primary,
    },
  });
}


