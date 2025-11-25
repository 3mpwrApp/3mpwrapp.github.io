import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../../../i18n';
import { useAppPalette } from '../../../theme/usePalette';
import { createShadow } from '../../../utils/shadow';

interface RevolutionaryFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  badge?: string;
}

const REVOLUTIONARY_FEATURES: RevolutionaryFeature[] = [
  {
    id: 'energy-aware-ui',
    title: 'Energy-Aware UI',
    description: 'Interface adapts to your energy level automatically',
    icon: 'color-wand',
    route: '/wellness/energy-aware-ui',
    color: '#8B5CF6',
    badge: 'BETA',
  },
  {
    id: 'haptic-language',
    title: 'Haptic Language',
    description: 'Learn 14 vibration patterns with unique meanings',
    icon: 'phone-portrait',
    route: '/wellness/haptic-language',
    color: '#EC4899',
    badge: 'BETA',
  },
  {
    id: 'spoon-economist',
    title: 'Spoon Economist',
    description: 'Energy budgeting with debt & interest tracking',
    icon: 'restaurant',
    route: '/wellness/spoon-economist',
    color: '#F59E0B',
    badge: 'BETA',
  },
  {
    id: 'functional-capacity',
    title: 'Functional Capacity',
    description: 'WHO ICF assessment for disability claims',
    icon: 'clipboard',
    route: '/wellness/functional-capacity',
    color: '#3B82F6',
    badge: 'BETA',
  },
  {
    id: 'emotional-first-aid',
    title: 'Emotional First Aid',
    description: 'Crisis intervention with panic attack interrupter',
    icon: 'medical',
    route: '/wellness/emotional-first-aid',
    color: '#EF4444',
    badge: 'BETA',
  },
  {
    id: 'circadian-dj',
    title: 'Circadian Rhythm DJ',
    description: 'Sleep optimization with chronotype & debt tracking',
    icon: 'moon',
    route: '/wellness/circadian-dj',
    color: '#6366F1',
    badge: 'BETA',
  },
  {
    id: 'cognitive-scanner',
    title: 'Cognitive Distortion Scanner',
    description: 'Real-time thought pattern recognition',
    icon: 'brain',
    route: '/wellness/cognitive-scanner',
    color: '#10B981',
    badge: 'BETA',
  },
  {
    id: 'energy-mood',
    title: 'Energy & Mood Dashboard',
    description: 'Quantum energy states + 24hr mood forecasting combined',
    icon: 'speedometer',
    route: '/wellness/energy-mood-dashboard',
    color: '#14B8A6',
    badge: 'BETA',
  },
  {
    id: 'legal-dna',
    title: 'Legal DNA Sequencer',
    description: 'Case genome mapping for advocacy',
    icon: 'document-text',
    route: '/advocacy/legal-dna',
    color: '#8B5CF6',
    badge: 'BETA',
  },
];

export default function RevolutionaryFeaturesScreen() {
  const { t: _t } = useTranslation();
  const palette = useAppPalette();

  const navigateToFeature = (route: string) => {
    router.push(route as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Revolutionary Features',
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: palette.surface }]}>
          <View style={styles.headerContent}>
            <Ionicons name="rocket" size={48} color={palette.primary} />
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: palette.text }]}>
                World-First Beta Features
              </Text>
              <Text style={[styles.headerSubtitle, { color: palette.textSecondary }]}>
                10 revolutionary tools that don't exist anywhere else
              </Text>
            </View>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          {REVOLUTIONARY_FEATURES.map(feature => (
            <Pressable
              key={feature.id}
              style={[styles.featureCard, { backgroundColor: palette.surface }]}
              onPress={() => navigateToFeature(feature.route)}
            >
              {feature.badge && (
                <View style={[styles.badge, { backgroundColor: feature.color }]}>
                  <Text style={styles.badgeText}>{feature.badge}</Text>
                </View>
              )}

              <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
                <Ionicons name={feature.icon as any} size={32} color={feature.color} />
              </View>

              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: palette.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: palette.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>

              <View style={styles.arrow}>
                <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* About Revolutionary Features */}
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>
            What Makes These Revolutionary?
          </Text>

          <View style={styles.benefitRow}>
            <Ionicons name="shield-checkmark" size={24} color={palette.primary} />
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, { color: palette.text }]}>
                Privacy-First Design
              </Text>
              <Text style={[styles.benefitDescription, { color: palette.textSecondary }]}>
                All data stored locally on your device. No cloud uploads.
              </Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <Ionicons name="flash" size={24} color={palette.primary} />
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, { color: palette.text }]}>
                Science-Backed Innovation
              </Text>
              <Text style={[styles.benefitDescription, { color: palette.textSecondary }]}>
                Based on WHO frameworks, CBT/DBT principles, and disability research.
              </Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <Ionicons name="people" size={24} color={palette.primary} />
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, { color: palette.text }]}>
                Lived Experience Design
              </Text>
              <Text style={[styles.benefitDescription, { color: palette.textSecondary }]}>
                Created by and for people with disabilities and chronic illness.
              </Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <Ionicons name="analytics" size={24} color={palette.primary} />
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, { color: palette.text }]}>
                Quantifiable Evidence
              </Text>
              <Text style={[styles.benefitDescription, { color: palette.textSecondary }]}>
                Generate data for disability claims, medical providers, and legal cases.
              </Text>
            </View>
          </View>
        </View>

        {/* Feedback */}
        <View style={[styles.card, { backgroundColor: palette.primary + '20' }]}>
          <View style={styles.feedbackHeader}>
            <Ionicons name="chatbubbles" size={24} color={palette.primary} />
            <Text style={[styles.feedbackTitle, { color: palette.text }]}>Beta Feedback</Text>
          </View>
          <Text style={[styles.feedbackText, { color: palette.textSecondary }]}>
            These features are actively being developed. Your feedback shapes their evolution.
            Report bugs, suggest improvements, or share success stories through Settings → Support.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    ...createShadow({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  featuresContainer: {
    padding: 8,
  },
  featureCard: {
    margin: 8,
    padding: 16,
    borderRadius: 12,
    ...createShadow({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  arrow: {
    marginLeft: 8,
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    ...createShadow({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  benefitText: {
    marginLeft: 12,
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 32,
  },
});


