/**
 * Ally & Support Network - Power Tool
 * 
 * Consolidates 5 support/network features into 5 tabs:
 * - Directory: Support Directory
 * - Allies: Ally Hub
 * - Self-Coach: Self-Advocacy Coach
 * - Ratings: Provider reviews
 * - World: World Map (global advocacy)
 */

/* eslint-disable no-restricted-syntax */ // Star rating colors are intentional

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { logEvent } from '../../../services/analytics';
import { useAppPalette } from '../../../theme/usePalette';


// ============================================
// TAB 1: DIRECTORY (Simple Mode)
// ============================================
function DirectoryTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const categories = [
    { id: 'disability-orgs', emoji: '♿', name: 'Disability Organizations', count: 45 },
    { id: 'advocacy-groups', emoji: '📣', name: 'Advocacy Groups', count: 28 },
    { id: 'peer-support', emoji: '🤝', name: 'Peer Support', count: 15 },
    { id: 'crisis-lines', emoji: '📞', name: 'Crisis Lines', count: 12 },
    { id: 'legal-services', emoji: '⚖️', name: 'Legal Services', count: 20 },
    { id: 'healthcare', emoji: '🏥', name: 'Healthcare', count: 35 },
  ];

  const featuredResources = [
    { id: '1', name: 'Provincial Disability Support', type: 'Government', verified: true },
    { id: '2', name: 'Disability Rights Canada', type: 'Non-profit', verified: true },
    { id: '3', name: 'Peer Support Network', type: 'Community', verified: false },
  ];

  const styles = createDirectoryStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Categories */}
      <PowerToolSection title={t('support.categories.title', 'Browse by Category')}>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <A11yPressable
              key={cat.id}
              onPress={() => {
                logEvent('support.category.select', { category: cat.id });
                router.push('/advocacy/support-directory' as any);
              }}
              accessibilityLabel={`${cat.name}, ${cat.count} resources`}
              hitSlop={HIT_SLOP_8}
              style={[styles.categoryCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryName, { color: palette.text }]}>{cat.name}</Text>
              <Text style={[styles.categoryCount, { color: palette.secondaryText }]}>
                {cat.count}
              </Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Featured Resources */}
      <PowerToolSection title={t('support.featured.title', 'Featured Resources')}>
        {featuredResources.map((resource) => (
          <A11yPressable
            key={resource.id}
            onPress={() => {
              logEvent('support.resource.view', { id: resource.id });
              router.push('/advocacy/support-directory' as any);
            }}
            accessibilityLabel={`${resource.name}, ${resource.type}`}
            hitSlop={HIT_SLOP_8}
            style={[styles.resourceCard, { backgroundColor: palette.card }]}
          >
            <View style={styles.resourceInfo}>
              <View style={styles.resourceHeader}>
                <Text style={[styles.resourceName, { color: palette.text }]}>{resource.name}</Text>
                {resource.verified && (
                  <Ionicons name="checkmark-circle" size={16} color={palette.success} />
                )}
              </View>
              <Text style={[styles.resourceType, { color: palette.secondaryText }]}>{resource.type}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('support.allies.explore', 'Find Allies')}
        icon="people"
        onPress={() => navigateToTab('allies')}
      />
    </PowerToolTabContent>
  );
}

const createDirectoryStyles = (_palette: any) => StyleSheet.create({
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
    fontSize: 12,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  resourceType: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// TAB 2: ALLIES (Standard Mode)
// ============================================
function AlliesTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const allyTypes = [
    { id: 'family', emoji: '👨‍👩‍👧', name: 'Family Allies', desc: 'Resources for supportive family members' },
    { id: 'friends', emoji: '👥', name: 'Friend Allies', desc: 'How friends can help' },
    { id: 'coworkers', emoji: '💼', name: 'Workplace Allies', desc: 'Colleague support resources' },
    { id: 'healthcare', emoji: '👨‍⚕️', name: 'Healthcare Allies', desc: 'Medical professional allies' },
  ];

  const allyshipResources = [
    { id: 'playbook', emoji: '📖', name: 'Allyship Playbook', desc: 'Guide for allies' },
    { id: 'language', emoji: '💬', name: 'Language Guide', desc: 'Respectful communication' },
    { id: 'boundaries', emoji: '🛑', name: 'Boundaries', desc: 'Healthy support boundaries' },
  ];

  const styles = createAlliesStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Ally Types */}
      <PowerToolSection title={t('allies.types.title', 'Types of Allies')}>
        {allyTypes.map((ally) => (
          <A11yPressable
            key={ally.id}
            onPress={() => {
              logEvent('allies.type.select', { type: ally.id });
              router.push('/advocacy/ally-hub' as any);
            }}
            accessibilityLabel={ally.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.allyCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.allyEmoji}>{ally.emoji}</Text>
            <View style={styles.allyInfo}>
              <Text style={[styles.allyName, { color: palette.text }]}>{ally.name}</Text>
              <Text style={[styles.allyDesc, { color: palette.secondaryText }]}>{ally.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Allyship Resources */}
      <PowerToolSection title={t('allies.resources.title', 'For Your Allies')}>
        <Text style={[styles.resourcesHint, { color: palette.secondaryText }]}>
          {t('allies.resources.hint', 'Share these resources with people who want to support you')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.resourcesRow}>
            {allyshipResources.map((resource) => (
              <A11yPressable
                key={resource.id}
                onPress={() => {
                  logEvent('allies.resource.view', { resource: resource.id });
                  router.push('/advocacy/ally-hub' as any);
                }}
                accessibilityLabel={resource.name}
                hitSlop={HIT_SLOP_8}
                style={[styles.resourceCard, { backgroundColor: palette.primary + '15' }]}
              >
                <Text style={styles.resourceEmoji}>{resource.emoji}</Text>
                <Text style={[styles.resourceName, { color: palette.text }]}>{resource.name}</Text>
                <Text style={[styles.resourceDesc, { color: palette.secondaryText }]}>{resource.desc}</Text>
              </A11yPressable>
            ))}
          </View>
        </ScrollView>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('allies.coach.explore', 'Self-Advocacy Coach')}
        icon="school"
        onPress={() => navigateToTab('coach')}
      />
    </PowerToolTabContent>
  );
}

const createAlliesStyles = (_palette: any) => StyleSheet.create({
  allyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  allyEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  allyInfo: {
    flex: 1,
  },
  allyName: {
    fontSize: 16,
    fontWeight: '600',
  },
  allyDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  resourcesHint: {
    fontSize: 14,
    marginBottom: 12,
  },
  resourcesRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  resourceCard: {
    padding: 16,
    borderRadius: 12,
    minWidth: 140,
  },
  resourceEmoji: {
    fontSize: 32,
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
});


// ============================================
// TAB 3: SELF-COACH (Standard Mode)
// ============================================
function CoachTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const coachingModules = [
    { id: 'know-rights', emoji: '📜', name: 'Know Your Rights', progress: 75 },
    { id: 'speak-up', emoji: '🗣️', name: 'Speaking Up', progress: 50 },
    { id: 'documentation', emoji: '📝', name: 'Documentation Skills', progress: 25 },
    { id: 'negotiation', emoji: '🤝', name: 'Negotiation', progress: 0 },
    { id: 'self-care', emoji: '💆', name: 'Self-Care in Advocacy', progress: 100 },
  ];

  const quickLessons = [
    { id: 'elevator-pitch', emoji: '🛗', name: 'Your Elevator Pitch', time: '5 min' },
    { id: 'saying-no', emoji: '🛑', name: 'Saying No', time: '3 min' },
    { id: 'asking-help', emoji: '🙋', name: 'Asking for Help', time: '4 min' },
  ];

  const styles = createCoachStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Coaching Progress */}
      <PowerToolSection title={t('coach.modules.title', 'Self-Advocacy Modules')}>
        {coachingModules.map((mod) => (
          <A11yPressable
            key={mod.id}
            onPress={() => {
              logEvent('coach.module.open', { module: mod.id });
              router.push('/advocacy/self-advocacy-coach' as any);
            }}
            accessibilityLabel={`${mod.name}, ${mod.progress}% complete`}
            hitSlop={HIT_SLOP_8}
            style={[styles.moduleCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.moduleEmoji}>{mod.emoji}</Text>
            <View style={styles.moduleInfo}>
              <Text style={[styles.moduleName, { color: palette.text }]}>{mod.name}</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: palette.border }]}>
                  <View style={[
                    styles.progressFill, 
                    { backgroundColor: mod.progress === 100 ? palette.success : palette.primary, width: `${mod.progress}%` }
                  ]} />
                </View>
                <Text style={[styles.progressText, { color: palette.secondaryText }]}>
                  {mod.progress}%
                </Text>
              </View>
            </View>
            {mod.progress === 100 ? (
              <Ionicons name="checkmark-circle" size={24} color={palette.success} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
            )}
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Quick Lessons */}
      <PowerToolSection title={t('coach.quick.title', 'Quick Lessons')}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.lessonsRow}>
            {quickLessons.map((lesson) => (
              <A11yPressable
                key={lesson.id}
                onPress={() => {
                  logEvent('coach.lesson.start', { lesson: lesson.id });
                  router.push('/advocacy/self-advocacy-coach' as any);
                }}
                accessibilityLabel={`${lesson.name}, ${lesson.time}`}
                hitSlop={HIT_SLOP_8}
                style={[styles.lessonCard, { backgroundColor: palette.primary + '15' }]}
              >
                <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
                <Text style={[styles.lessonName, { color: palette.text }]}>{lesson.name}</Text>
                <Text style={[styles.lessonTime, { color: palette.primary }]}>{lesson.time}</Text>
              </A11yPressable>
            ))}
          </View>
        </ScrollView>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('coach.ratings.explore', 'Provider Ratings')}
        icon="star"
        onPress={() => navigateToTab('ratings')}
      />
    </PowerToolTabContent>
  );
}

const createCoachStyles = (_palette: any) => StyleSheet.create({
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  moduleEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    width: 32,
  },
  lessonsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  lessonCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  lessonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  lessonName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  lessonTime: {
    fontSize: 11,
    fontWeight: '600',
  },
});


// ============================================
// TAB 4: RATINGS (Power User Mode)
// ============================================
function RatingsTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const ratingCategories = [
    { id: 'doctors', emoji: '👨‍⚕️', name: 'Doctors', ratings: 234 },
    { id: 'specialists', emoji: '🏥', name: 'Specialists', ratings: 156 },
    { id: 'insurers', emoji: '📋', name: 'Insurance Companies', ratings: 89 },
    { id: 'employers', emoji: '💼', name: 'Employers', ratings: 67 },
  ];

  const recentReviews = [
    { id: '1', provider: 'Dr. Smith', rating: 5, snippet: 'Actually listens to disabled patients...' },
    { id: '2', provider: 'ABC Insurance', rating: 2, snippet: 'Denied my claim three times...' },
  ];

  const styles = createRatingsStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Rating Categories */}
      <PowerToolSection title={t('ratings.categories.title', 'Rate & Review')}>
        <View style={styles.categoryGrid}>
          {ratingCategories.map((cat) => (
            <A11yPressable
              key={cat.id}
              onPress={() => {
                logEvent('ratings.category.select', { category: cat.id });
                router.push('/advocacy/ratings' as any);
              }}
              accessibilityLabel={`${cat.name}, ${cat.ratings} ratings`}
              hitSlop={HIT_SLOP_8}
              style={[styles.categoryCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryName, { color: palette.text }]}>{cat.name}</Text>
              <Text style={[styles.categoryRatings, { color: palette.secondaryText }]}>
                {cat.ratings} ratings
              </Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Recent Reviews */}
      <PowerToolSection title={t('ratings.recent.title', 'Recent Community Reviews')}>
        {recentReviews.map((review) => (
          <A11yPressable
            key={review.id}
            onPress={() => {
              logEvent('ratings.review.view', { id: review.id });
              router.push('/advocacy/ratings' as any);
            }}
            accessibilityLabel={`${review.provider}, ${review.rating} stars`}
            hitSlop={HIT_SLOP_8}
            style={[styles.reviewCard, { backgroundColor: palette.card }]}
          >
            <View style={styles.reviewHeader}>
              <Text style={[styles.reviewProvider, { color: palette.text }]}>{review.provider}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star}
                    name={star <= review.rating ? 'star' : 'star-outline'} 
                    size={14} 
                    color="#F59E0B" 
                  />
                ))}
              </View>
            </View>
            <Text style={[styles.reviewSnippet, { color: palette.secondaryText }]} numberOfLines={2}>
              "{review.snippet}"
            </Text>
          </A11yPressable>
        ))}
        
        <PowerToolAction
          label={t('ratings.add.button', 'Add a Review')}
          icon="create"
          onPress={() => {
            logEvent('ratings.add.start');
            router.push('/advocacy/ratings' as any);
          }}
          variant="primary"
        />
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('ratings.world.explore', 'World Advocacy Map')}
        icon="globe"
        onPress={() => navigateToTab('world')}
      />
    </PowerToolTabContent>
  );
}

const createRatingsStyles = (_palette: any) => StyleSheet.create({
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
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryRatings: {
    fontSize: 12,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewProvider: {
    fontSize: 16,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewSnippet: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});


// ============================================
// TAB 5: WORLD (Power User Mode)
// ============================================
function WorldTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const regions = [
    { id: 'na', emoji: '🌎', name: 'North America', orgs: 45 },
    { id: 'eu', emoji: '🌍', name: 'Europe', orgs: 52 },
    { id: 'asia', emoji: '🌏', name: 'Asia Pacific', orgs: 38 },
    { id: 'other', emoji: '🌐', name: 'Other Regions', orgs: 23 },
  ];

  const globalCampaigns = [
    { id: '1', name: 'Accessibility Standards 2025', supporters: 12500 },
    { id: '2', name: 'Medical Access Rights', supporters: 8900 },
    { id: '3', name: 'Employment Protection', supporters: 6700 },
  ];

  const styles = createWorldStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* World Map Preview */}
      <View style={[styles.mapPreview, { backgroundColor: palette.card }]}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={[styles.mapTitle, { color: palette.text }]}>
          {t('world.map.title', 'Global Disability Advocacy')}
        </Text>
        <Text style={[styles.mapSubtitle, { color: palette.secondaryText }]}>
          {t('world.map.subtitle', '158 organizations in 45 countries')}
        </Text>
        <PowerToolAction
          label={t('world.map.explore', 'Explore Interactive Map')}
          icon="map"
          onPress={() => {
            logEvent('world.map.open');
            router.push('/advocacy/world-map' as any);
          }}
          variant="primary"
        />
      </View>

      <GapView style={{ height: 16 }} />

      {/* Regions */}
      <PowerToolSection title={t('world.regions.title', 'Browse by Region')}>
        <View style={styles.regionGrid}>
          {regions.map((region) => (
            <A11yPressable
              key={region.id}
              onPress={() => {
                logEvent('world.region.select', { region: region.id });
                router.push('/advocacy/world-map' as any);
              }}
              accessibilityLabel={`${region.name}, ${region.orgs} organizations`}
              hitSlop={HIT_SLOP_8}
              style={[styles.regionCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.regionEmoji}>{region.emoji}</Text>
              <Text style={[styles.regionName, { color: palette.text }]}>{region.name}</Text>
              <Text style={[styles.regionCount, { color: palette.secondaryText }]}>
                {region.orgs} orgs
              </Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Global Campaigns */}
      <PowerToolSection title={t('world.campaigns.title', 'Global Campaigns')}>
        {globalCampaigns.map((campaign) => (
          <A11yPressable
            key={campaign.id}
            onPress={() => {
              logEvent('world.campaign.view', { id: campaign.id });
              Alert.alert(campaign.name, `${campaign.supporters.toLocaleString()} supporters`);
            }}
            accessibilityLabel={campaign.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.campaignCard, { backgroundColor: palette.primary + '15' }]}
          >
            <View style={styles.campaignInfo}>
              <Text style={[styles.campaignName, { color: palette.text }]}>{campaign.name}</Text>
              <Text style={[styles.campaignSupporters, { color: palette.secondaryText }]}>
                {campaign.supporters.toLocaleString()} supporters
              </Text>
            </View>
            <View style={[styles.joinButton, { backgroundColor: palette.primary }]}>
              <Text style={styles.joinText}>Join</Text>
            </View>
          </A11yPressable>
        ))}
      </PowerToolSection>
    </PowerToolTabContent>
  );
}

const createWorldStyles = (_palette: any) => StyleSheet.create({
  mapPreview: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  mapEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  regionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  regionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  regionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  regionName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  regionCount: {
    fontSize: 12,
  },
  campaignCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '600',
  },
  campaignSupporters: {
    fontSize: 12,
    marginTop: 2,
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  joinText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});


// ============================================
// MAIN EXPORT
// ============================================
export default function AllySupportNetwork() {
  const { t } = useTranslation();

  const tabs: PowerToolTab[] = [
    {
      id: 'directory',
      label: t('support.tabs.directory', 'Directory'),
      icon: '📋',
      component: DirectoryTab,
      complexity: 'simple',
      keywords: ['support', 'directory', 'organizations', 'resources'],
    },
    {
      id: 'allies',
      label: t('support.tabs.allies', 'Allies'),
      icon: '🤝',
      component: AlliesTab,
      complexity: 'standard',
      keywords: ['allies', 'family', 'friends', 'support'],
    },
    {
      id: 'coach',
      label: t('support.tabs.coach', 'Self-Coach'),
      icon: '🎓',
      component: CoachTab,
      complexity: 'standard',
      keywords: ['coach', 'advocacy', 'skills', 'training'],
    },
    {
      id: 'ratings',
      label: t('support.tabs.ratings', 'Ratings'),
      icon: '⭐',
      component: RatingsTab,
      complexity: 'power_user',
      keywords: ['ratings', 'reviews', 'doctors', 'providers'],
    },
    {
      id: 'world',
      label: t('support.tabs.world', 'World'),
      icon: '🌍',
      component: WorldTab,
      complexity: 'power_user',
      badge: 'beta',
      keywords: ['global', 'world', 'map', 'international'],
    },
  ];

  return (
    <ResponsiveScreenWrapper>
      <PowerTool
        title={t('support.title', 'Ally & Support Network')}
        subtitle={t('support.subtitle', 'Find support, allies & resources')}
        icon="🤝"
        tabs={tabs}
        defaultTab="directory"
        showSearch
        searchPlaceholder={t('support.search', 'Search support resources...')}
        analyticsPrefix="ally_support"
      />
    </ResponsiveScreenWrapper>
  );
}


