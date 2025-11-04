/**
 * Cross-Feature Integration Service
 * 
 * Provides intelligent recommendations and navigation between related features
 * based on user context, mood, energy levels, and activity patterns.
 */

import { router } from 'expo-router';

export interface FeatureRecommendation {
  id: string;
  title: string;
  description: string;
  targetScreen: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  triggers: string[];
}

/**
 * Get contextual recommendations based on mood score
 */
export function getMoodBasedRecommendations(moodScore: number): FeatureRecommendation[] {
  const recommendations: FeatureRecommendation[] = [];

  if (moodScore <= -1) {
    // Low mood - suggest wellness tools and crisis resources
    recommendations.push({
      id: 'mood-low-dbt',
      title: 'Try DBT Skills',
      description: 'Dialectical Behavior Therapy techniques for emotional regulation',
      targetScreen: '/(tabs)/wellness/dbt',
      icon: '🧘',
      priority: 'high',
      triggers: ['low_mood', 'emotional_distress'],
    });
    recommendations.push({
      id: 'mood-low-distress',
      title: 'Distress Tolerance Tools',
      description: 'Immediate coping strategies for difficult emotions',
      targetScreen: '/(tabs)/wellness/distress-tolerance',
      icon: '🛡️',
      priority: 'high',
      triggers: ['low_mood', 'crisis_prevention'],
    });
    recommendations.push({
      id: 'mood-low-crisis',
      title: 'Crisis Resources',
      description: 'Access immediate support and helplines',
      targetScreen: '/(tabs)/resources',
      icon: '🆘',
      priority: 'high',
      triggers: ['low_mood', 'emergency'],
    });
    recommendations.push({
      id: 'mood-low-grief',
      title: 'Grief Support',
      description: 'Tools and resources for processing grief and loss',
      targetScreen: '/(tabs)/wellness/grief-support',
      icon: '💙',
      priority: 'medium',
      triggers: ['low_mood', 'loss'],
    });
  }

  if (moodScore === 0) {
    // Neutral mood - suggest pacing and self-care
    recommendations.push({
      id: 'mood-neutral-pacing',
      title: 'Check Your Energy',
      description: 'Use Pacing Partner to manage your energy levels',
      targetScreen: '/(tabs)/wellness/pacing-partner',
      icon: '⚡',
      priority: 'medium',
      triggers: ['neutral_mood', 'energy_management'],
    });
    recommendations.push({
      id: 'mood-neutral-selfcare',
      title: 'Self-Care Library',
      description: 'Browse personalized self-care activities',
      targetScreen: '/(tabs)/wellness/self-care-library',
      icon: '💆',
      priority: 'medium',
      triggers: ['neutral_mood', 'self_care'],
    });
  }

  if (moodScore >= 1) {
    // Good mood - suggest community engagement and goal-setting
    recommendations.push({
      id: 'mood-high-community',
      title: 'Join Community',
      description: 'Connect with others and share positive experiences',
      targetScreen: '/(tabs)/community',
      icon: '👥',
      priority: 'medium',
      triggers: ['good_mood', 'social_connection'],
    });
    recommendations.push({
      id: 'mood-high-advocacy',
      title: 'Advocacy Hub',
      description: 'Use your energy to make a difference',
      targetScreen: '/(tabs)/advocacy',
      icon: '📢',
      priority: 'low',
      triggers: ['good_mood', 'advocacy'],
    });
    recommendations.push({
      id: 'mood-high-exercise',
      title: 'Gentle Movement',
      description: 'Try adaptive exercises while feeling good',
      targetScreen: '/(tabs)/wellness/adaptive-exercise',
      icon: '🤸',
      priority: 'low',
      triggers: ['good_mood', 'physical_activity'],
    });
  }

  return recommendations;
}

/**
 * Get recommendations based on energy level
 */
export function getEnergyBasedRecommendations(energyLevel: 'low' | 'medium' | 'high'): FeatureRecommendation[] {
  const recommendations: FeatureRecommendation[] = [];

  if (energyLevel === 'low') {
    recommendations.push({
      id: 'energy-low-rest',
      title: 'Pacing Partner',
      description: 'Get personalized rest and activity suggestions',
      targetScreen: '/(tabs)/wellness/pacing-partner',
      icon: '⚡',
      priority: 'high',
      triggers: ['low_energy', 'fatigue'],
    });
    recommendations.push({
      id: 'energy-low-meditation',
      title: 'Adaptive Meditation',
      description: 'Gentle mindfulness practices for low energy',
      targetScreen: '/(tabs)/wellness/adaptive-meditation',
      icon: '🧘',
      priority: 'high',
      triggers: ['low_energy', 'rest'],
    });
    recommendations.push({
      id: 'energy-low-ambience',
      title: 'Calming Ambience',
      description: 'Soothing sounds and visuals for rest',
      targetScreen: '/(tabs)/wellness/ambience',
      icon: '🎵',
      priority: 'medium',
      triggers: ['low_energy', 'relaxation'],
    });
  }

  if (energyLevel === 'medium') {
    recommendations.push({
      id: 'energy-medium-micromovement',
      title: 'Micro-Movement',
      description: 'Quick, gentle exercises for limited energy',
      targetScreen: '/(tabs)/wellness/micro-movement',
      icon: '🤏',
      priority: 'medium',
      triggers: ['medium_energy', 'gentle_activity'],
    });
    recommendations.push({
      id: 'energy-medium-resources',
      title: 'Browse Resources',
      description: 'Explore helpful information at your own pace',
      targetScreen: '/(tabs)/resources',
      icon: '📚',
      priority: 'medium',
      triggers: ['medium_energy', 'learning'],
    });
  }

  if (energyLevel === 'high') {
    recommendations.push({
      id: 'energy-high-exercise',
      title: 'Adaptive Exercise',
      description: 'Full exercise routines tailored to your needs',
      targetScreen: '/(tabs)/wellness/adaptive-exercise',
      icon: '🏃',
      priority: 'high',
      triggers: ['high_energy', 'exercise'],
    });
    recommendations.push({
      id: 'energy-high-advocacy',
      title: 'Advocacy Tools',
      description: 'Work on letters, petitions, and campaigns',
      targetScreen: '/(tabs)/advocacy',
      icon: '✍️',
      priority: 'medium',
      triggers: ['high_energy', 'advocacy'],
    });
    recommendations.push({
      id: 'energy-high-community',
      title: 'Community Engagement',
      description: 'Connect with others and join discussions',
      targetScreen: '/(tabs)/community',
      icon: '💬',
      priority: 'medium',
      triggers: ['high_energy', 'social'],
    });
  }

  return recommendations;
}

/**
 * Get recommendations for wellness tools based on current tool usage
 */
export function getWellnessFlowRecommendations(currentTool: string): FeatureRecommendation[] {
  const toolFlows: Record<string, FeatureRecommendation[]> = {
    'dbt': [
      {
        id: 'dbt-to-distress',
        title: 'Distress Tolerance',
        description: 'Immediate coping strategies for crisis moments',
        targetScreen: '/(tabs)/wellness/distress-tolerance',
        icon: '🛡️',
        priority: 'high',
        triggers: ['dbt_completion', 'emotional_skills'],
      },
      {
        id: 'dbt-to-mood',
        title: 'Track Your Progress',
        description: 'Log your mood to see how DBT skills help',
        targetScreen: '/(tabs)/wellness/mood',
        icon: '📊',
        priority: 'medium',
        triggers: ['dbt_completion', 'tracking'],
      },
    ],
    'mood': [
      {
        id: 'mood-to-insights',
        title: 'View Insights',
        description: 'See patterns and get AI-powered suggestions',
        targetScreen: '/(tabs)/wellness/mood',
        icon: '💡',
        priority: 'high',
        triggers: ['mood_logged', 'insights'],
      },
      {
        id: 'mood-to-pacing',
        title: 'Energy Management',
        description: 'Connect mood with energy levels in Pacing Partner',
        targetScreen: '/(tabs)/wellness/pacing-partner',
        icon: '⚡',
        priority: 'medium',
        triggers: ['mood_logged', 'energy'],
      },
    ],
    'pacing': [
      {
        id: 'pacing-to-micromovement',
        title: 'Micro-Movement',
        description: 'Gentle exercises for your current energy level',
        targetScreen: '/(tabs)/wellness/micro-movement',
        icon: '🤏',
        priority: 'high',
        triggers: ['pacing_check', 'movement'],
      },
      {
        id: 'pacing-to-mood',
        title: 'Check Your Mood',
        description: 'Log how your energy level affects your mood',
        targetScreen: '/(tabs)/wellness/mood',
        icon: '😊',
        priority: 'medium',
        triggers: ['pacing_check', 'mood_tracking'],
      },
    ],
    'meditation': [
      {
        id: 'meditation-to-ambience',
        title: 'Extend Relaxation',
        description: 'Continue with calming ambience sounds',
        targetScreen: '/(tabs)/wellness/ambience',
        icon: '🎵',
        priority: 'high',
        triggers: ['meditation_complete', 'relaxation'],
      },
      {
        id: 'meditation-to-sleep',
        title: 'Sleep Support',
        description: 'Reframe sleep anxiety with cognitive tools',
        targetScreen: '/(tabs)/wellness/sleep-reframe',
        icon: '😴',
        priority: 'medium',
        triggers: ['meditation_complete', 'sleep'],
      },
    ],
  };

  return toolFlows[currentTool] || [];
}

/**
 * Get advocacy-related recommendations based on user context
 */
export function getAdvocacyRecommendations(context?: {
  hasEvidence?: boolean;
  hasLetters?: boolean;
  inDisagreement?: boolean;
}): FeatureRecommendation[] {
  const recommendations: FeatureRecommendation[] = [];

  if (context?.inDisagreement) {
    recommendations.push({
      id: 'advocacy-evidence',
      title: 'Evidence Locker',
      description: 'Securely store documents for your case',
      targetScreen: '/(tabs)/advocacy/evidence-locker',
      icon: '🔒',
      priority: 'high',
      triggers: ['disagreement', 'evidence_needed'],
    });
    recommendations.push({
      id: 'advocacy-letter',
      title: 'Letter Wizard',
      description: 'Generate professional appeal letters',
      targetScreen: '/(tabs)/advocacy/letter-wizard',
      icon: '✍️',
      priority: 'high',
      triggers: ['disagreement', 'letter_needed'],
    });
    recommendations.push({
      id: 'advocacy-lawyer',
      title: 'Find Legal Help',
      description: 'Connect with disability lawyers and advocates',
      targetScreen: '/(tabs)/advocacy/lawyer-finder',
      icon: '⚖️',
      priority: 'high',
      triggers: ['disagreement', 'legal_help'],
    });
  }

  if (context?.hasEvidence && !context?.hasLetters) {
    recommendations.push({
      id: 'evidence-to-letter',
      title: 'Create Appeal Letter',
      description: 'Use your evidence to build a strong case',
      targetScreen: '/(tabs)/advocacy/letter-wizard',
      icon: '📝',
      priority: 'high',
      triggers: ['evidence_ready', 'next_step'],
    });
  }

  recommendations.push({
    id: 'advocacy-community',
    title: 'Community Support',
    description: 'Connect with others navigating similar challenges',
    targetScreen: '/(tabs)/community',
    icon: '🤝',
    priority: 'medium',
    triggers: ['advocacy_active', 'support'],
  });

  return recommendations;
}

/**
 * Navigate to a recommended feature
 */
export function navigateToRecommendation(recommendation: FeatureRecommendation) {
  try {
    router.push(recommendation.targetScreen as any);
  } catch (error) {
    console.error('Navigation error:', error);
  }
}

/**
 * Get all contextual recommendations for the current user state
 */
export function getContextualRecommendations(context: {
  moodScore?: number;
  energyLevel?: 'low' | 'medium' | 'high';
  currentTool?: string;
  advocacyContext?: {
    hasEvidence?: boolean;
    hasLetters?: boolean;
    inDisagreement?: boolean;
  };
}): FeatureRecommendation[] {
  const recommendations: FeatureRecommendation[] = [];

  if (context.moodScore !== undefined) {
    recommendations.push(...getMoodBasedRecommendations(context.moodScore));
  }

  if (context.energyLevel) {
    recommendations.push(...getEnergyBasedRecommendations(context.energyLevel));
  }

  if (context.currentTool) {
    recommendations.push(...getWellnessFlowRecommendations(context.currentTool));
  }

  if (context.advocacyContext) {
    recommendations.push(...getAdvocacyRecommendations(context.advocacyContext));
  }

  // Remove duplicates and sort by priority
  const uniqueRecommendations = Array.from(
    new Map(recommendations.map(r => [r.id, r])).values()
  );

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return uniqueRecommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
