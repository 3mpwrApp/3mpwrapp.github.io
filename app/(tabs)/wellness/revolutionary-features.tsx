/* eslint-disable no-restricted-syntax */
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
  aiPowered?: boolean;
  aiFeatures?: string[];
}

const REVOLUTIONARY_FEATURES: RevolutionaryFeature[] = [
  {
    id: 'energy-aware-ui',
    title: 'Energy-Aware UI',
    description: 'AI-powered interface that learns from biometrics & wearables',
    icon: 'color-wand',
    route: '/wellness/energy-aware-ui',
    color: 'primary',
    badge: 'AI',
    aiPowered: true,
    aiFeatures: ['Wearable sync (Apple Watch, Fitbit, Garmin)', 'Biometric learning', 'Predictive energy model', '7-day energy forecast'],
  },
  {
    id: 'haptic-language',
    title: 'Haptic Language',
    description: 'Adaptive vibrations that learn your perception patterns',
    icon: 'phone-portrait',
    route: '/wellness/haptic-language',
    color: 'secondary',
    badge: 'AI',
    aiPowered: true,
    aiFeatures: ['Adaptive intensity learning', 'Context-aware playback', 'Personal haptic profiles', 'Perception pattern analysis'],
  },
  {
    id: 'spoon-economist',
    title: 'Spoon Economist',
    description: 'ML-powered crash prediction with 7-day forecasting',
    icon: 'restaurant',
    route: '/wellness/spoon-economist',
    color: 'warning',
    badge: 'AI',
    aiPowered: true,
    aiFeatures: ['Crash risk prediction', 'ML task cost learning', 'Weekly energy forecast', 'Personalized recommendations'],
  },
  {
    id: 'functional-capacity',
    title: 'Functional Capacity AI',
    description: 'AI claim optimization with appeal data generation',
    icon: 'clipboard',
    route: '/wellness/functional-capacity',
    color: 'info',
    badge: 'AI',
    aiPowered: true,
    aiFeatures: ['Claim strength scoring', 'Denial prediction', 'Appeal data generation', 'Medical evidence linking'],
  },
  {
    id: 'emotional-first-aid',
    title: 'Emotional First Aid AI',
    description: 'AI crisis prediction with biofeedback integration',
    icon: 'medical',
    route: '/wellness/emotional-first-aid',
    color: 'error',
    badge: 'AI',
    aiPowered: true,
    aiFeatures: ['Crisis risk prediction', 'Biofeedback sessions', 'Personalized interventions', 'Breathing pattern coaching'],
  },
  {
    id: 'circadian-dj',
    title: 'Circadian Rhythm DJ',
    description: 'AI sleep optimization with dream pattern analysis',
    icon: 'moon',
    route: '/wellness/circadian-dj',
    color: 'info',
    badge: 'AI',
    aiPowered: true,
    aiFeatures: ['Dream journal AI', 'Sleep stage prediction', 'Optimal wake time', 'Light therapy scheduling'],
  },
  {
    id: 'cognitive-scanner',
    title: 'Cognitive Scanner AI',
    description: 'AI CBT coaching with belief network mapping',
    icon: 'bulb',
    route: '/wellness/cognitive-scanner',
    color: 'success',
    badge: 'AI',
    aiPowered: true,
    aiFeatures: ['Core belief excavation', 'Thought prediction', 'Belief network visualization', 'Restructuring sessions'],
  },
  {
    id: 'energy-mood',
    title: 'Quantum Energy Dashboard',
    description: 'Wave function modeling of energy states',
    icon: 'speedometer',
    route: '/wellness/energy-mood-dashboard',
    color: 'info',
    badge: 'AI',
    aiPowered: true,
    aiFeatures: ['Quantum state superposition', 'Probability distributions', 'Observer effect tracking', 'Entanglement patterns'],
  },
  {
    id: 'legal-dna',
    title: 'Legal DNA Sequencer',
    description: 'Case genome mapping with AI analysis',
    icon: 'document-text',
    route: '/advocacy/legal-dna',
    color: 'primary',
    badge: 'AI',
    aiPowered: true,
    aiFeatures: ['Legal precedent matching', 'Case strength scoring', 'Evidence chain mapping', 'Outcome prediction'],
  },
  {
    id: 'sensory-overload',
    title: 'Sensory Overload Detector',
    description: 'AI that predicts sensory meltdowns before they happen',
    icon: 'ear',
    route: '/wellness/sensory-overload',
    color: 'warning',
    badge: 'NEW',
    aiPowered: true,
    aiFeatures: ['Multi-sensory tracking', 'Overload prediction', 'Safe space finder', 'Decompression protocols'],
  },
  {
    id: 'symptom-symphony',
    title: 'Symptom Symphony',
    description: 'Multi-modal symptom tracking with pattern orchestra',
    icon: 'musical-notes',
    route: '/wellness/symptom-symphony',
    color: 'secondary',
    badge: 'NEW',
    aiPowered: true,
    aiFeatures: ['Symptom correlation AI', 'Flare prediction', 'Trigger identification', 'Medical timeline export'],
  },
  {
    id: 'grounding-companion',
    title: 'AI Grounding Companion',
    description: 'Personalized grounding with adaptive learning',
    icon: 'leaf',
    route: '/wellness/grounding-companion',
    color: 'success',
    badge: 'NEW',
    aiPowered: true,
    aiFeatures: ['Learns what works for you', 'Context-aware techniques', 'Progressive difficulty', 'Biometric feedback'],
  },
  {
    id: 'environmental-adaptation',
    title: 'Environmental Adaptation',
    description: 'AI that adjusts to your environment automatically',
    icon: 'globe',
    route: '/wellness/environmental-adaptation',
    color: 'info',
    badge: 'NEW',
    aiPowered: true,
    aiFeatures: ['Weather sensitivity tracking', 'Barometric pressure alerts', 'Light/sound adaptation', 'Location-based triggers'],
  },
];

export default function RevolutionaryFeaturesScreen() {
  const { t: _t } = useTranslation();
  const palette = useAppPalette();

  const navigateToFeature = (route: string) => {
    router.push(route as any);
  };

  const getFeatureColor = (colorKey: string): string => {
    const colorMap: Record<string, string> = {
      primary: palette.primary,
      secondary: palette.secondary,
      info: palette.info,
      success: palette.success,
      warning: palette.warning,
      error: palette.error,
    };
    return colorMap[colorKey] || palette.primary;
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
            <View style={styles.headerIconContainer}>
              <Ionicons name="rocket" size={48} color={palette.primary} />
              <View style={[styles.aiSparkle, { backgroundColor: palette.primary }]}>
                <Ionicons name="sparkles" size={16} color="#fff" />
              </View>
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: palette.text }]}>
                AI-Powered Revolutionary Features
              </Text>
              <Text style={[styles.headerSubtitle, { color: palette.textSecondary }]}>
                13 world-first tools powered by on-device AI/ML
              </Text>
            </View>
          </View>
          <View style={[styles.aiStatsBar, { backgroundColor: palette.primary + '15' }]}>
            <View style={styles.aiStat}>
              <Ionicons name="hardware-chip" size={18} color={palette.primary} />
              <Text style={[styles.aiStatText, { color: palette.primary }]}>On-Device AI</Text>
            </View>
            <View style={styles.aiStat}>
              <Ionicons name="shield-checkmark" size={18} color={palette.primary} />
              <Text style={[styles.aiStatText, { color: palette.primary }]}>100% Private</Text>
            </View>
            <View style={styles.aiStat}>
              <Ionicons name="flash" size={18} color={palette.primary} />
              <Text style={[styles.aiStatText, { color: palette.primary }]}>Real-time</Text>
            </View>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          {REVOLUTIONARY_FEATURES.map(feature => {
            const featureColor = getFeatureColor(feature.color);
            return (
            <Pressable
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              key={feature.id}
              style={[styles.featureCard, { backgroundColor: palette.surface }]}
              onPress={() => navigateToFeature(feature.route)}
            >
              {feature.badge && (
                <View style={[
                  styles.badge, 
                  { backgroundColor: feature.badge === 'AI' ? palette.primary : feature.badge === 'NEW' ? palette.success : featureColor }
                ]}>
                  <Text style={styles.badgeText}>{feature.badge}</Text>
                </View>
              )}

              <View style={[styles.iconContainer, { backgroundColor: featureColor + '20' }]}>
                <Ionicons name={feature.icon as any} size={32} color={featureColor} />
                {feature.aiPowered && (
                  <View style={[styles.aiIndicator, { backgroundColor: palette.primary }]}>
                    <Ionicons name="sparkles" size={12} color="#fff" />
                  </View>
                )}
              </View>

              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: palette.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: palette.textSecondary }]}>
                  {feature.description}
                </Text>
                {feature.aiFeatures && feature.aiFeatures.length > 0 && (
                  <View style={styles.aiFeaturesList}>
                    {feature.aiFeatures.slice(0, 2).map((aiFeature, idx) => (
                      <View key={idx} style={[styles.aiFeatureTag, { backgroundColor: palette.primary + '15' }]}>
                        <Text style={[styles.aiFeatureText, { color: palette.primary }]}>
                          {aiFeature}
                        </Text>
                      </View>
                    ))}
                    {feature.aiFeatures.length > 2 && (
                      <Text style={[styles.moreFeatures, { color: palette.textSecondary }]}>
                        +{feature.aiFeatures.length - 2} more
                      </Text>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.arrow}>
                <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
              </View>
            </Pressable>
          );})}
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
  headerIconContainer: {
    position: 'relative',
  },
  aiSparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  aiStatsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  aiStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiStatText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  aiIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
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
  aiFeaturesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    alignItems: 'center',
  },
  aiFeatureTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  aiFeatureText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreFeatures: {
    fontSize: 10,
    fontStyle: 'italic',
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


