/**
 * Knowledge Base - Power Tool
 * 
 * Consolidates 10 educational/information features into 5 tabs:
 * - Rights: Know Your Rights, Legal Rights Library
 * - Tech: Tech Toolkit, Assistive Tools
 * - Myths: Myth Busters, Information Verification
 * - Tools: Power User Toolkit, Advanced Resources
 * - Emergency: Crisis Resources, Emergency Contacts
 */

/* eslint-disable no-restricted-syntax */ // Star rating and call button colors are intentional

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Alert,
    Linking,
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
import { trackEvent } from '../../../services/analyticsClient';
import { useJurisdiction } from '../../../store/jurisdiction';
import { useAppPalette } from '../../../theme/usePalette';


// ============================================
// TAB 1: RIGHTS (Simple Mode)
// ============================================
function RightsTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  const { code: jurisdictionCode } = useJurisdiction();

  const rightsCategories = [
    { id: 'disability', emoji: '♿', name: 'Disability Rights', count: 24 },
    { id: 'workplace', emoji: '🏢', name: 'Workplace Rights', count: 18 },
    { id: 'medical', emoji: '🏥', name: 'Medical Rights', count: 15 },
    { id: 'insurance', emoji: '📋', name: 'Insurance Rights', count: 12 },
    { id: 'housing', emoji: '🏠', name: 'Housing Rights', count: 9 },
    { id: 'benefits', emoji: '💰', name: 'Benefits Rights', count: 16 },
  ];

  const featuredRights = [
    { id: '1', title: 'Right to Reasonable Accommodation', category: 'Workplace' },
    { id: '2', title: 'Right to Medical Records', category: 'Medical' },
    { id: '3', title: 'Right to Appeal Denial', category: 'Insurance' },
  ];

  const styles = createRightsStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Jurisdiction Badge */}
      <View style={[styles.jurisdictionBadge, { backgroundColor: palette.primary + '15' }]}>
        <Text style={[styles.jurisdictionLabel, { color: palette.primary }]}>
          Showing rights for: {jurisdictionCode || 'Your Location'}
        </Text>
        <A11yPressable
          onPress={() => router.push('/settings' as any)}
          accessibilityLabel="Change jurisdiction"
          hitSlop={HIT_SLOP_8}
        >
          <Text style={[styles.jurisdictionChange, { color: palette.primary }]}>Change</Text>
        </A11yPressable>
      </View>

      <GapView style={{ height: 16 }} />

      {/* Featured Rights */}
      <PowerToolSection title={t('rights.featured.title', 'Must-Know Rights')}>
        {featuredRights.map((right) => (
          <A11yPressable
            key={right.id}
            onPress={() => {
              trackEvent('rights.featured.view', { id: right.id });
              router.push('/resources/know-your-rights' as any);
            }}
            accessibilityLabel={right.title}
            hitSlop={HIT_SLOP_8}
            style={[styles.featuredCard, { backgroundColor: palette.card }]}
          >
            <View style={styles.featuredInfo}>
              <Text style={[styles.featuredCategory, { color: palette.primary }]}>{right.category}</Text>
              <Text style={[styles.featuredTitle, { color: palette.text }]}>{right.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Categories */}
      <PowerToolSection title={t('rights.categories.title', 'Browse by Category')}>
        <View style={styles.categoryGrid}>
          {rightsCategories.map((category) => (
            <A11yPressable
              key={category.id}
              onPress={() => {
                trackEvent('rights.category.browse', { category: category.id });
                router.push('/resources/know-your-rights' as any);
              }}
              accessibilityLabel={`${category.name}, ${category.count} articles`}
              hitSlop={HIT_SLOP_8}
              style={[styles.categoryCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={[styles.categoryName, { color: palette.text }]}>{category.name}</Text>
              <Text style={[styles.categoryCount, { color: palette.secondaryText }]}>
                {category.count} articles
              </Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('rights.tech.explore', 'Tech Toolkit')}
        icon="hardware-chip"
        onPress={() => navigateToTab('tech')}
      />
    </PowerToolTabContent>
  );
}

const createRightsStyles = (_palette: any) => StyleSheet.create({
  jurisdictionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  jurisdictionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  jurisdictionChange: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredCategory: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 10,
  },
});


// ============================================
// TAB 2: TECH (Standard Mode)
// ============================================
function TechTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const techCategories = [
    { id: 'accessibility', emoji: '♿', name: 'Accessibility Tools', desc: 'Screen readers, voice control' },
    { id: 'productivity', emoji: '⚡', name: 'Productivity Apps', desc: 'Task management, reminders' },
    { id: 'health', emoji: '💊', name: 'Health Apps', desc: 'Tracking, monitoring' },
    { id: 'communication', emoji: '💬', name: 'Communication', desc: 'AAC, speech tools' },
  ];

  const featuredTools = [
    { id: '1', name: 'Dragon Dictation', category: 'Voice', rating: 4.5 },
    { id: '2', name: 'Be My Eyes', category: 'Vision', rating: 4.8 },
    { id: '3', name: 'Otter.ai', category: 'Transcription', rating: 4.3 },
  ];

  const styles = createTechStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Featured Tools */}
      <PowerToolSection title={t('tech.featured.title', 'Featured Tools')}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.featuredRow}>
            {featuredTools.map((tool) => (
              <A11yPressable
                key={tool.id}
                onPress={() => {
                  trackEvent('tech.tool.featured', { tool: tool.id });
                  router.push('/resources/assistive-tech' as any);
                }}
                accessibilityLabel={`${tool.name}, ${tool.category}, ${tool.rating} stars`}
                hitSlop={HIT_SLOP_8}
                style={[styles.featuredCard, { backgroundColor: palette.card }]}
              >
                <Text style={[styles.featuredName, { color: palette.text }]}>{tool.name}</Text>
                <Text style={[styles.featuredCategory, { color: palette.secondaryText }]}>{tool.category}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: palette.text }]}>{tool.rating}</Text>
                </View>
              </A11yPressable>
            ))}
          </View>
        </ScrollView>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Categories */}
      <PowerToolSection title={t('tech.categories.title', 'Browse by Category')}>
        {techCategories.map((category) => (
          <A11yPressable
            key={category.id}
            onPress={() => {
              trackEvent('tech.category.browse', { category: category.id });
              router.push('/resources/assistive-tech' as any);
            }}
            accessibilityLabel={category.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.categoryCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: palette.text }]}>{category.name}</Text>
              <Text style={[styles.categoryDesc, { color: palette.secondaryText }]}>{category.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('tech.myths.explore', 'Myth Busters')}
        icon="shield-checkmark"
        onPress={() => navigateToTab('myths')}
      />
    </PowerToolTabContent>
  );
}

const createTechStyles = (_palette: any) => StyleSheet.create({
  featuredRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  featuredCard: {
    padding: 16,
    borderRadius: 12,
    minWidth: 140,
  },
  featuredName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  featuredCategory: {
    fontSize: 12,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// TAB 3: MYTHS (Standard Mode)
// ============================================
function MythsTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const mythCategories = [
    { id: 'disability', emoji: '♿', name: 'Disability Myths', count: 15 },
    { id: 'insurance', emoji: '📋', name: 'Insurance Myths', count: 12 },
    { id: 'workplace', emoji: '🏢', name: 'Workplace Myths', count: 10 },
    { id: 'medical', emoji: '🏥', name: 'Medical Myths', count: 8 },
  ];

  const featuredMyths = [
    { 
      id: '1', 
      myth: 'You can\'t work at all if you receive disability benefits',
      fact: 'Many programs allow part-time work within limits',
      busted: true,
    },
    { 
      id: '2', 
      myth: 'Employers can\'t ask about your disability',
      fact: 'They can ask about ability to perform job functions',
      busted: true,
    },
  ];

  const styles = createMythsStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Featured Myths */}
      <PowerToolSection title={t('myths.featured.title', 'Top Myths Busted')}>
        {featuredMyths.map((item) => (
          <View key={item.id} style={[styles.mythCard, { backgroundColor: palette.card }]}>
            <View style={[styles.mythHeader, { backgroundColor: palette.error + '15' }]}>
              <Text style={[styles.mythLabel, { color: palette.error }]}>❌ MYTH</Text>
            </View>
            <Text style={[styles.mythText, { color: palette.text }]}>{item.myth}</Text>
            <View style={[styles.factHeader, { backgroundColor: palette.success + '15' }]}>
              <Text style={[styles.factLabel, { color: palette.success }]}>✓ FACT</Text>
            </View>
            <Text style={[styles.factText, { color: palette.text }]}>{item.fact}</Text>
          </View>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Categories */}
      <PowerToolSection title={t('myths.categories.title', 'Browse Categories')}>
        <View style={styles.categoryGrid}>
          {mythCategories.map((category) => (
            <A11yPressable
              key={category.id}
              onPress={() => {
                trackEvent('myths.category.browse', { category: category.id });
                router.push('/resources/myth-busters' as any);
              }}
              accessibilityLabel={`${category.name}, ${category.count} myths busted`}
              hitSlop={HIT_SLOP_8}
              style={[styles.categoryCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={[styles.categoryName, { color: palette.text }]}>{category.name}</Text>
              <Text style={[styles.categoryCount, { color: palette.secondaryText }]}>
                {category.count} busted
              </Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('myths.tools.explore', 'Power Tools')}
        icon="construct"
        onPress={() => navigateToTab('tools')}
      />
    </PowerToolTabContent>
  );
}

const createMythsStyles = (_palette: any) => StyleSheet.create({
  mythCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  mythHeader: {
    padding: 8,
    paddingHorizontal: 12,
  },
  mythLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  mythText: {
    fontSize: 14,
    fontWeight: '500',
    padding: 12,
    fontStyle: 'italic',
  },
  factHeader: {
    padding: 8,
    paddingHorizontal: 12,
  },
  factLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  factText: {
    fontSize: 14,
    padding: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 10,
  },
});


// ============================================
// TAB 4: TOOLS (Power User Mode)
// ============================================
function ToolsTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const powerTools = [
    { id: 'timeline', emoji: '📅', name: 'Case Timeline Builder', desc: 'Visualize your entire case' },
    { id: 'letter-gen', emoji: '✉️', name: 'Letter Generator', desc: 'Appeals, complaints, requests' },
    { id: 'checklist', emoji: '✓', name: 'Evidence Checklist', desc: 'What you need to prove' },
    { id: 'calculator', emoji: '🧮', name: 'Benefits Calculator', desc: 'Estimate your benefits' },
    { id: 'deadline', emoji: '⏰', name: 'Deadline Tracker', desc: 'Never miss a deadline' },
    { id: 'document', emoji: '📄', name: 'Document Organizer', desc: 'All files in one place' },
  ];

  const advancedResources = [
    { id: 'legal', name: 'Legal Research Database', locked: false },
    { id: 'case-law', name: 'Case Law Library', locked: true },
    { id: 'templates', name: 'Professional Templates', locked: false },
  ];

  const styles = createToolsStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Power Tools */}
      <PowerToolSection title={t('tools.power.title', 'Power Tools')}>
        <View style={styles.toolsGrid}>
          {powerTools.map((tool) => (
            <A11yPressable
              key={tool.id}
              onPress={() => {
                trackEvent('tools.power.open', { tool: tool.id });
                router.push('/resources/power-toolkit' as any);
              }}
              accessibilityLabel={tool.name}
              hitSlop={HIT_SLOP_8}
              style={[styles.toolCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.toolEmoji}>{tool.emoji}</Text>
              <Text style={[styles.toolName, { color: palette.text }]}>{tool.name}</Text>
              <Text style={[styles.toolDesc, { color: palette.secondaryText }]}>{tool.desc}</Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Advanced Resources */}
      <PowerToolSection title={t('tools.advanced.title', 'Advanced Resources')}>
        {advancedResources.map((resource) => (
          <A11yPressable
            key={resource.id}
            onPress={() => {
              if (resource.locked) {
                Alert.alert('Pro Feature', 'This feature requires a pro subscription.');
              } else {
                trackEvent('tools.advanced.open', { resource: resource.id });
                router.push('/resources' as any);
              }
            }}
            accessibilityLabel={resource.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.resourceCard, { backgroundColor: palette.card }]}
          >
            <Text style={[styles.resourceName, { color: palette.text }]}>{resource.name}</Text>
            {resource.locked ? (
              <Ionicons name="lock-closed" size={20} color={palette.secondaryText} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
            )}
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('tools.emergency.explore', 'Emergency Resources')}
        icon="alert-circle"
        variant="destructive"
        onPress={() => navigateToTab('emergency')}
      />
    </PowerToolTabContent>
  );
}

const createToolsStyles = (_palette: any) => StyleSheet.create({
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
  },
  toolEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  toolDesc: {
    fontSize: 11,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '500',
  },
});


// ============================================
// TAB 5: EMERGENCY (Power User Mode)
// ============================================
function EmergencyTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();

  const emergencyContacts = [
    { id: 'crisis', emoji: '🆘', name: 'Crisis Line', number: '988', available: '24/7' },
    { id: 'dv', emoji: '🏠', name: 'DV Hotline', number: '1-800-799-7233', available: '24/7' },
    { id: 'legal', emoji: '⚖️', name: 'Legal Aid', number: 'Find Local', available: 'Business hours' },
  ];

  const crisisResources = [
    { id: 'safety', emoji: '🛡️', name: 'Safety Planning', desc: 'Create your safety plan' },
    { id: 'evidence', emoji: '📸', name: 'Quick Evidence Capture', desc: 'Document quickly & securely' },
    { id: 'contacts', emoji: '📞', name: 'Emergency Contacts', desc: 'Your trusted network' },
    { id: 'location', emoji: '📍', name: 'Share Location', desc: 'Send to trusted contacts' },
  ];

  const styles = createEmergencyStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Emergency Warning */}
      <View style={[styles.warningBanner, { backgroundColor: palette.error + '20' }]}>
        <Ionicons name="alert-circle" size={24} color={palette.error} />
        <Text style={[styles.warningText, { color: palette.error }]}>
          If you're in immediate danger, call 911
        </Text>
      </View>

      <GapView style={{ height: 16 }} />

      {/* Quick Contacts */}
      <PowerToolSection title={t('emergency.contacts.title', 'Quick Contacts')}>
        {emergencyContacts.map((contact) => (
          <A11yPressable
            key={contact.id}
            onPress={() => {
              if (contact.number.includes('-') || contact.number === '988') {
                Linking.openURL(`tel:${contact.number.replace(/-/g, '')}`);
              } else {
                trackEvent('emergency.contact.find', { type: contact.id });
              }
            }}
            accessibilityLabel={`${contact.name}, ${contact.number}`}
            hitSlop={HIT_SLOP_8}
            style={[styles.contactCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.contactEmoji}>{contact.emoji}</Text>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, { color: palette.text }]}>{contact.name}</Text>
              <Text style={[styles.contactAvailable, { color: palette.secondaryText }]}>
                {contact.available}
              </Text>
            </View>
            <View style={[styles.callButton, { backgroundColor: palette.success }]}>
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={styles.callButtonText}>{contact.number}</Text>
            </View>
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Crisis Resources */}
      <PowerToolSection title={t('emergency.resources.title', 'Crisis Resources')}>
        <View style={styles.resourcesGrid}>
          {crisisResources.map((resource) => (
            <A11yPressable
              key={resource.id}
              onPress={() => {
                trackEvent('emergency.resource.open', { resource: resource.id });
              }}
              accessibilityLabel={resource.name}
              hitSlop={HIT_SLOP_8}
              style={[styles.resourceCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.resourceEmoji}>{resource.emoji}</Text>
              <Text style={[styles.resourceName, { color: palette.text }]}>{resource.name}</Text>
              <Text style={[styles.resourceDesc, { color: palette.secondaryText }]}>{resource.desc}</Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Quick Exit Info */}
      <View style={[styles.exitInfo, { backgroundColor: palette.warning + '15' }]}>
        <Ionicons name="information-circle" size={20} color={palette.warning} />
        <Text style={[styles.exitInfoText, { color: palette.text }]}>
          Tap the {' '}
          <Text style={{ fontWeight: '700' }}>Quick Exit</Text>
          {' '} button in the header to leave this app quickly
        </Text>
      </View>
    </PowerToolTabContent>
  );
}

const createEmergencyStyles = (_palette: any) => StyleSheet.create({
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  warningText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  contactEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactAvailable: {
    fontSize: 12,
    marginTop: 2,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resourceCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
  },
  resourceEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  resourceName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceDesc: {
    fontSize: 11,
  },
  exitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  exitInfoText: {
    fontSize: 14,
    flex: 1,
  },
});


// ============================================
// MAIN EXPORT
// ============================================
export default function KnowledgeBase() {
  const { t } = useTranslation();

  const tabs: PowerToolTab[] = [
    {
      id: 'rights',
      label: t('knowledge.tabs.rights', 'Rights'),
      icon: '⚖️',
      component: RightsTab,
      complexity: 'simple',
      keywords: ['rights', 'legal', 'law', 'disability', 'workplace'],
    },
    {
      id: 'tech',
      label: t('knowledge.tabs.tech', 'Tech'),
      icon: '💻',
      component: TechTab,
      complexity: 'standard',
      keywords: ['tech', 'tools', 'apps', 'accessibility', 'assistive'],
    },
    {
      id: 'myths',
      label: t('knowledge.tabs.myths', 'Myths'),
      icon: '🔍',
      component: MythsTab,
      complexity: 'standard',
      keywords: ['myth', 'fact', 'truth', 'misconception', 'busted'],
    },
    {
      id: 'tools',
      label: t('knowledge.tabs.tools', 'Tools'),
      icon: '🧰',
      component: ToolsTab,
      complexity: 'power_user',
      keywords: ['power', 'advanced', 'toolkit', 'professional'],
    },
    {
      id: 'emergency',
      label: t('knowledge.tabs.emergency', 'Emergency'),
      icon: '🆘',
      component: EmergencyTab,
      complexity: 'power_user',
      badge: 'beta',
      keywords: ['emergency', 'crisis', 'help', 'hotline', 'safety'],
    },
  ];

  return (
    <ResponsiveScreenWrapper>
      <PowerTool
        title={t('knowledge.title', 'Knowledge Base')}
        subtitle={t('knowledge.subtitle', 'Rights, resources & emergency information')}
        icon="📚"
        tabs={tabs}
        defaultTab="rights"
        showSearch
        searchPlaceholder={t('knowledge.search', 'Search knowledge base...')}
        analyticsPrefix="knowledge_base"
      />
    </ResponsiveScreenWrapper>
  );
}


