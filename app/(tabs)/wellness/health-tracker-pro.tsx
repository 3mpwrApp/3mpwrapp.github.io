/**
 * Health Tracker Pro - Power Tool
 * 
 * Consolidates 12 tracking/monitoring features into 5 tabs:
 * - Symptoms: Symptom Tracker, Chronic Tracker, Trigger Detector
 * - Body: Health Tracker, Cognitive Scanner
 * - Environment: Environmental Adaptation, Sensory Overload
 * - Nutrition: Nutrition Guides, Harm Reduction
 * - Self-Care: Self-Care Library
 */

/* eslint-disable no-restricted-syntax */ // Severity level colors are intentional

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
// TAB 1: SYMPTOMS (Simple Mode)
// ============================================
function SymptomsTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();
  
  const [todaySeverity, setTodaySeverity] = useState<number | null>(null);

  const commonSymptoms = [
    { id: 'pain', emoji: '🩹', name: 'Pain Level' },
    { id: 'fatigue', emoji: '😴', name: 'Fatigue' },
    { id: 'brain-fog', emoji: '🌫️', name: 'Brain Fog' },
    { id: 'mobility', emoji: '🦿', name: 'Mobility' },
    { id: 'mood', emoji: '😊', name: 'Mood' },
  ];

  const severityLevels = [
    { value: 1, color: '#22C55E', label: 'Minimal' },
    { value: 2, color: '#84CC16', label: 'Mild' },
    { value: 3, color: '#EAB308', label: 'Moderate' },
    { value: 4, color: '#F97316', label: 'Significant' },
    { value: 5, color: '#EF4444', label: 'Severe' },
  ];

  const styles = createSymptomsStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Quick Log */}
      <PowerToolSection title={t('symptoms.quick.title', 'Quick Symptom Log')}>
        <Text style={[styles.hint, { color: palette.secondaryText }]}>
          {t('symptoms.quick.hint', 'How are you feeling overall today?')}
        </Text>
        <View style={styles.severityRow}>
          {severityLevels.map((level) => (
            <A11yPressable
              key={level.value}
              onPress={() => {
                setTodaySeverity(level.value);
                logEvent('symptoms.quick.severity', { level: level.value });
              }}
              accessibilityLabel={`${level.label}, level ${level.value} of 5`}
              accessibilityState={{ selected: todaySeverity === level.value }}
              hitSlop={HIT_SLOP_8}
              style={[
                styles.severityButton,
                { 
                  backgroundColor: todaySeverity === level.value ? level.color : palette.card,
                  borderColor: level.color,
                },
              ]}
            >
              <Text style={[
                styles.severityNumber,
                { color: todaySeverity === level.value ? '#FFFFFF' : level.color },
              ]}>
                {level.value}
              </Text>
            </A11yPressable>
          ))}
        </View>
        {todaySeverity && (
          <Text style={[styles.selectedSeverity, { color: palette.text }]}>
            {severityLevels.find(l => l.value === todaySeverity)?.label}
          </Text>
        )}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Individual Symptoms */}
      <PowerToolSection title={t('symptoms.individual.title', 'Track Individual Symptoms')}>
        <View style={styles.symptomGrid}>
          {commonSymptoms.map((symptom) => (
            <A11yPressable
              key={symptom.id}
              onPress={() => {
                logEvent('symptoms.individual.open', { symptom: symptom.id });
                router.push({
                  pathname: '/wellness/symptom-tracker',
                  params: { symptom: symptom.id },
                } as any);
              }}
              accessibilityLabel={symptom.name}
              hitSlop={HIT_SLOP_8}
              style={[styles.symptomCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
              <Text style={[styles.symptomName, { color: palette.text }]}>{symptom.name}</Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Trigger Detection */}
      <View style={[styles.featureCard, { backgroundColor: palette.primary + '15' }]}>
        <Text style={styles.featureEmoji}>🔍</Text>
        <View style={styles.featureInfo}>
          <Text style={[styles.featureName, { color: palette.text }]}>
            {t('symptoms.triggers.title', 'Trigger Detector')}
          </Text>
          <Text style={[styles.featureDesc, { color: palette.secondaryText }]}>
            {t('symptoms.triggers.desc', 'AI helps identify patterns and triggers')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={palette.primary} />
      </View>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('symptoms.body.explore', 'Body & Cognitive Tracking')}
        icon="body"
        onPress={() => navigateToTab('body')}
      />
    </PowerToolTabContent>
  );
}

const createSymptomsStyles = (_palette: any) => StyleSheet.create({
  hint: {
    fontSize: 14,
    marginBottom: 12,
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  severityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  severityNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  selectedSeverity: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  symptomCard: {
    width: '30%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  symptomEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  symptomName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
  },
  featureDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// TAB 2: BODY (Standard Mode)
// ============================================
function BodyTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const bodyTrackers = [
    { id: 'vitals', emoji: '❤️', name: 'Vitals', desc: 'Heart rate, BP, temp', hasData: true },
    { id: 'sleep', emoji: '😴', name: 'Sleep Quality', desc: 'Sleep patterns and quality', hasData: true },
    { id: 'weight', emoji: '⚖️', name: 'Weight', desc: 'Weight tracking', hasData: false },
    { id: 'hydration', emoji: '💧', name: 'Hydration', desc: 'Water intake', hasData: false },
  ];

  const cognitiveTools = [
    { id: 'brain-fog', emoji: '🌫️', name: 'Brain Fog Tracker', desc: 'Track cognitive difficulties' },
    { id: 'memory', emoji: '🧠', name: 'Memory Check', desc: 'Quick memory exercises' },
    { id: 'focus', emoji: '🎯', name: 'Focus Timer', desc: 'Track attention span' },
  ];

  const styles = createBodyStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Body Trackers */}
      <PowerToolSection title={t('body.trackers.title', 'Body Metrics')}>
        {bodyTrackers.map((tracker) => (
          <A11yPressable
            key={tracker.id}
            onPress={() => {
              logEvent('body.tracker.open', { tracker: tracker.id });
              router.push('/wellness/health-tracker' as any);
            }}
            accessibilityLabel={tracker.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.trackerCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.trackerEmoji}>{tracker.emoji}</Text>
            <View style={styles.trackerInfo}>
              <Text style={[styles.trackerName, { color: palette.text }]}>{tracker.name}</Text>
              <Text style={[styles.trackerDesc, { color: palette.secondaryText }]}>{tracker.desc}</Text>
            </View>
            {tracker.hasData && (
              <View style={[styles.dataBadge, { backgroundColor: palette.success + '20' }]}>
                <Text style={[styles.dataText, { color: palette.success }]}>Data</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Cognitive Tools */}
      <PowerToolSection title={t('body.cognitive.title', 'Cognitive Health')}>
        {cognitiveTools.map((tool) => (
          <A11yPressable
            key={tool.id}
            onPress={() => {
              logEvent('body.cognitive.open', { tool: tool.id });
              router.push('/wellness/cognitive-scanner' as any);
            }}
            accessibilityLabel={tool.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.cognitiveCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.cognitiveEmoji}>{tool.emoji}</Text>
            <View style={styles.cognitiveInfo}>
              <Text style={[styles.cognitiveName, { color: palette.text }]}>{tool.name}</Text>
              <Text style={[styles.cognitiveDesc, { color: palette.secondaryText }]}>{tool.desc}</Text>
            </View>
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('body.environment.explore', 'Environment Tracking')}
        icon="leaf"
        onPress={() => navigateToTab('environment')}
      />
    </PowerToolTabContent>
  );
}

const createBodyStyles = (_palette: any) => StyleSheet.create({
  trackerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  trackerEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  trackerInfo: {
    flex: 1,
  },
  trackerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackerDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  dataBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  dataText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cognitiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  cognitiveEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  cognitiveInfo: {
    flex: 1,
  },
  cognitiveName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cognitiveDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// TAB 3: ENVIRONMENT (Standard Mode)
// ============================================
function EnvironmentTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const environmentFactors = [
    { id: 'weather', emoji: '🌤️', name: 'Weather Sensitivity', desc: 'Track weather-related symptoms' },
    { id: 'air', emoji: '💨', name: 'Air Quality', desc: 'Monitor air quality impact' },
    { id: 'noise', emoji: '🔊', name: 'Noise Levels', desc: 'Track noise sensitivity' },
    { id: 'light', emoji: '💡', name: 'Light Sensitivity', desc: 'Monitor light triggers' },
  ];

  const sensoryTools = [
    { id: 'overload', emoji: '⚠️', name: 'Sensory Overload Alert', desc: 'Track overload warning signs' },
    { id: 'safe-space', emoji: '🏠', name: 'Safe Space Finder', desc: 'Find quiet, accessible spaces' },
    { id: 'accommodations', emoji: '♿', name: 'Environment Accommodations', desc: 'Track what helps' },
  ];

  const styles = createEnvironmentStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Environment Factors */}
      <PowerToolSection title={t('environment.factors.title', 'Environmental Factors')}>
        <View style={styles.factorGrid}>
          {environmentFactors.map((factor) => (
            <A11yPressable
              key={factor.id}
              onPress={() => {
                logEvent('environment.factor.open', { factor: factor.id });
                router.push('/wellness/environmental-adaptation' as any);
              }}
              accessibilityLabel={factor.name}
              hitSlop={HIT_SLOP_8}
              style={[styles.factorCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.factorEmoji}>{factor.emoji}</Text>
              <Text style={[styles.factorName, { color: palette.text }]}>{factor.name}</Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Sensory Tools */}
      <PowerToolSection title={t('environment.sensory.title', 'Sensory Management')}>
        {sensoryTools.map((tool) => (
          <A11yPressable
            key={tool.id}
            onPress={() => {
              logEvent('environment.sensory.open', { tool: tool.id });
              router.push('/wellness/sensory-overload' as any);
            }}
            accessibilityLabel={tool.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.sensoryCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.sensoryEmoji}>{tool.emoji}</Text>
            <View style={styles.sensoryInfo}>
              <Text style={[styles.sensoryName, { color: palette.text }]}>{tool.name}</Text>
              <Text style={[styles.sensoryDesc, { color: palette.secondaryText }]}>{tool.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('environment.nutrition.explore', 'Nutrition & Self-Care')}
        icon="nutrition"
        onPress={() => navigateToTab('nutrition')}
      />
    </PowerToolTabContent>
  );
}

const createEnvironmentStyles = (_palette: any) => StyleSheet.create({
  factorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  factorCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  factorEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  factorName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sensoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sensoryEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  sensoryInfo: {
    flex: 1,
  },
  sensoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  sensoryDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});


// ============================================
// TAB 4: NUTRITION (Power User Mode)
// ============================================
function NutritionTab({ navigateToTab }: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const nutritionGuides = [
    { id: 'anti-inflammatory', emoji: '🥗', name: 'Anti-Inflammatory Diet', desc: 'Foods that reduce inflammation' },
    { id: 'energy', emoji: '⚡', name: 'Energy-Boosting Foods', desc: 'Foods for chronic fatigue' },
    { id: 'gut', emoji: '🦠', name: 'Gut Health', desc: 'Digestive wellness' },
    { id: 'supplements', emoji: '💊', name: 'Supplement Guide', desc: 'Evidence-based supplements' },
  ];

  const harmReduction = [
    { id: 'alcohol', emoji: '🍷', name: 'Alcohol Awareness', desc: 'Impact on symptoms' },
    { id: 'caffeine', emoji: '☕', name: 'Caffeine Tracker', desc: 'Monitor caffeine effects' },
    { id: 'sugar', emoji: '🍬', name: 'Sugar Awareness', desc: 'Track sugar impact' },
  ];

  const styles = createNutritionStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Nutrition Guides */}
      <PowerToolSection title={t('nutrition.guides.title', 'Nutrition Guides')}>
        {nutritionGuides.map((guide) => (
          <A11yPressable
            key={guide.id}
            onPress={() => {
              logEvent('nutrition.guide.open', { guide: guide.id });
              router.push('/wellness/nutrition-guides' as any);
            }}
            accessibilityLabel={guide.name}
            hitSlop={HIT_SLOP_8}
            style={[styles.guideCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.guideEmoji}>{guide.emoji}</Text>
            <View style={styles.guideInfo}>
              <Text style={[styles.guideName, { color: palette.text }]}>{guide.name}</Text>
              <Text style={[styles.guideDesc, { color: palette.secondaryText }]}>{guide.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Harm Reduction */}
      <PowerToolSection title={t('nutrition.harm.title', 'Harm Reduction')}>
        <View style={styles.harmGrid}>
          {harmReduction.map((item) => (
            <A11yPressable
              key={item.id}
              onPress={() => {
                logEvent('nutrition.harm.open', { item: item.id });
                router.push('/wellness/harm-reduction' as any);
              }}
              accessibilityLabel={item.name}
              hitSlop={HIT_SLOP_8}
              style={[styles.harmCard, { backgroundColor: palette.card }]}
            >
              <Text style={styles.harmEmoji}>{item.emoji}</Text>
              <Text style={[styles.harmName, { color: palette.text }]}>{item.name}</Text>
            </A11yPressable>
          ))}
        </View>
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      <PowerToolAction
        label={t('nutrition.selfcare.explore', 'Self-Care Library')}
        icon="library"
        onPress={() => navigateToTab('selfcare')}
      />
    </PowerToolTabContent>
  );
}

const createNutritionStyles = (_palette: any) => StyleSheet.create({
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  guideEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  guideInfo: {
    flex: 1,
  },
  guideName: {
    fontSize: 16,
    fontWeight: '600',
  },
  guideDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  harmGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  harmCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  harmEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  harmName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});


// ============================================
// TAB 5: SELF-CARE (Power User Mode)
// ============================================
function SelfCareTab(_props: PowerToolTabProps) {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const router = useRouter();

  const selfCareCategories = [
    { id: 'physical', emoji: '🧘', name: 'Physical Care', items: 12 },
    { id: 'emotional', emoji: '❤️', name: 'Emotional Care', items: 15 },
    { id: 'social', emoji: '👥', name: 'Social Care', items: 8 },
    { id: 'spiritual', emoji: '✨', name: 'Spiritual Care', items: 10 },
    { id: 'professional', emoji: '💼', name: 'Professional Care', items: 6 },
  ];

  const dailyChecklist = [
    { id: 'hydrate', emoji: '💧', name: 'Hydrate', done: true },
    { id: 'move', emoji: '🚶', name: 'Move body', done: false },
    { id: 'rest', emoji: '😴', name: 'Rest break', done: true },
    { id: 'connect', emoji: '💬', name: 'Connect with someone', done: false },
  ];

  const styles = createSelfCareStyles(palette);

  return (
    <PowerToolTabContent scrollable>
      {/* Daily Self-Care Checklist */}
      <PowerToolSection title={t('selfcare.daily.title', 'Today\'s Self-Care')}>
        {dailyChecklist.map((item) => (
          <A11yPressable
            key={item.id}
            onPress={() => {
              logEvent('selfcare.checklist.toggle', { item: item.id, done: !item.done });
            }}
            accessibilityLabel={`${item.name}, ${item.done ? 'completed' : 'not completed'}`}
            hitSlop={HIT_SLOP_8}
            style={[styles.checklistItem, { backgroundColor: palette.card }]}
          >
            <Text style={styles.checklistEmoji}>{item.emoji}</Text>
            <Text style={[
              styles.checklistName, 
              { color: palette.text, textDecorationLine: item.done ? 'line-through' : 'none' },
            ]}>
              {item.name}
            </Text>
            <View style={[
              styles.checkbox,
              { 
                backgroundColor: item.done ? palette.success : 'transparent',
                borderColor: item.done ? palette.success : palette.border,
              },
            ]}>
              {item.done && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
          </A11yPressable>
        ))}
      </PowerToolSection>

      <GapView style={{ height: 16 }} />

      {/* Self-Care Library */}
      <PowerToolSection title={t('selfcare.library.title', 'Self-Care Library')}>
        {selfCareCategories.map((cat) => (
          <A11yPressable
            key={cat.id}
            onPress={() => {
              logEvent('selfcare.library.open', { category: cat.id });
              router.push({
                pathname: '/wellness/self-care-library',
                params: { category: cat.id },
              } as any);
            }}
            accessibilityLabel={`${cat.name}, ${cat.items} activities`}
            hitSlop={HIT_SLOP_8}
            style={[styles.categoryCard, { backgroundColor: palette.card }]}
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: palette.text }]}>{cat.name}</Text>
            </View>
            <Text style={[styles.categoryCount, { color: palette.secondaryText }]}>
              {cat.items}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={palette.secondaryText} />
          </A11yPressable>
        ))}
      </PowerToolSection>
    </PowerToolTabContent>
  );
}

const createSelfCareStyles = (_palette: any) => StyleSheet.create({
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  checklistEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  checklistName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 14,
    marginRight: 8,
  },
});


// ============================================
// MAIN EXPORT
// ============================================
export default function HealthTrackerPro() {
  const { t } = useTranslation();

  const tabs: PowerToolTab[] = [
    {
      id: 'symptoms',
      label: t('health.tabs.symptoms', 'Symptoms'),
      icon: '🩹',
      component: SymptomsTab,
      complexity: 'simple',
      keywords: ['symptom', 'pain', 'fatigue', 'track', 'log'],
    },
    {
      id: 'body',
      label: t('health.tabs.body', 'Body'),
      icon: '❤️',
      component: BodyTab,
      complexity: 'standard',
      keywords: ['vitals', 'sleep', 'weight', 'cognitive', 'body'],
    },
    {
      id: 'environment',
      label: t('health.tabs.environment', 'Environment'),
      icon: '🌤️',
      component: EnvironmentTab,
      complexity: 'standard',
      keywords: ['weather', 'air', 'sensory', 'noise', 'light'],
    },
    {
      id: 'nutrition',
      label: t('health.tabs.nutrition', 'Nutrition'),
      icon: '🥗',
      component: NutritionTab,
      complexity: 'power_user',
      keywords: ['food', 'diet', 'supplement', 'nutrition'],
    },
    {
      id: 'selfcare',
      label: t('health.tabs.selfcare', 'Self-Care'),
      icon: '✨',
      component: SelfCareTab,
      complexity: 'power_user',
      badge: 'beta',
      keywords: ['selfcare', 'routine', 'wellness', 'checklist'],
    },
  ];

  return (
    <ResponsiveScreenWrapper>
      <PowerTool
        title={t('health.title', 'Health Tracker Pro')}
        subtitle={t('health.subtitle', 'Comprehensive health & wellness monitoring')}
        icon="📊"
        tabs={tabs}
        defaultTab="symptoms"
        showSearch
        searchPlaceholder={t('health.search', 'Search health tools...')}
        analyticsPrefix="health_tracker"
      />
    </ResponsiveScreenWrapper>
  );
}

