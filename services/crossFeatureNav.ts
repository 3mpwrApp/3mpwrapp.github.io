/**
 * Cross-Feature Navigation Service
 * 
 * Provides intelligent navigation suggestions between related features
 * to create a seamless, interconnected user experience
 */

import type { Href } from 'expo-router';

export interface RelatedFeature {
  id: string;
  title: string;
  route: Href;
  icon: string;
  category: string;
  reason: string; // Why this feature is related
}

export interface FeatureContext {
  currentFeature: string;
  userAction?: string; // e.g., 'completed_mood', 'viewed_resource', 'joined_campaign'
  metadata?: Record<string, any>;
}

/**
 * Feature relationship map - defines how features connect to each other
 */
const FEATURE_RELATIONSHIPS: Record<string, RelatedFeature[]> = {
  // Wellness features
  'wellness_mood': [
    { id: 'wellness_cbt', title: 'CBT Coach', route: '/wellness/cbt-coach' as Href, icon: '🧠', category: 'wellness', reason: 'Process difficult thoughts' },
    { id: 'wellness_meditation', title: 'Meditation', route: '/wellness/adaptive-meditation' as Href, icon: '🧘', category: 'wellness', reason: 'Calm and center yourself' },
    { id: 'community', title: 'Community Support', route: '/(tabs)/community' as Href, icon: '👥', category: 'community', reason: 'Connect with peers' },
  ],
  'wellness_symptom_tracker': [
    { id: 'wellness_pacing', title: 'Pacing Partner', route: '/wellness/pacing-partner' as Href, icon: '⚖️', category: 'wellness', reason: 'Manage your energy' },
    { id: 'advocacy_ask', title: 'Ask an Advocate', route: '/(tabs)/advocacy/ask' as Href, icon: '💬', category: 'advocacy', reason: 'Get advice about symptoms' },
    { id: 'resources_letter', title: 'Letter Builder', route: '/resources/letter-builder' as Href, icon: '📝', category: 'resources', reason: 'Document for claims' },
  ],
  'wellness_daily_planner': [
    { id: 'wellness_energy', title: 'Energy Coins', route: '/wellness/energy-coins' as Href, icon: '🪙', category: 'wellness', reason: 'Budget your energy' },
    { id: 'events', title: 'Events Calendar', route: '/(tabs)/events' as Href, icon: '📅', category: 'events', reason: 'Plan community activities' },
    { id: 'wellness_pacing', title: 'Pacing Partner', route: '/wellness/pacing-partner' as Href, icon: '⚖️', category: 'wellness', reason: 'Avoid overexertion' },
  ],
  
  // Advocacy features
  'advocacy_ask': [
    { id: 'advocacy_lawyer', title: 'Lawyer Finder', route: '/(tabs)/advocacy/lawyer-finder' as Href, icon: '⚖️', category: 'advocacy', reason: 'Find legal help' },
    { id: 'community', title: 'Community Forum', route: '/(tabs)/community' as Href, icon: '👥', category: 'community', reason: 'Ask the community' },
    { id: 'resources', title: 'Resources Hub', route: '/(tabs)/resources' as Href, icon: '💼', category: 'resources', reason: 'Browse helpful tools' },
  ],
  'advocacy_lawyer': [
    { id: 'advocacy_accountability', title: 'Accountability Network', route: '/advocacy/accountability-network' as Href, icon: '🔍', category: 'advocacy', reason: 'Review lawyers' },
    { id: 'resources_evidence', title: 'Evidence Locker', route: '/resources/evidence-locker' as Href, icon: '🔒', category: 'resources', reason: 'Organize your case' },
    { id: 'campaigns', title: 'Join a Campaign', route: '/(tabs)/campaigns' as Href, icon: '📢', category: 'campaigns', reason: 'Advocate for change' },
  ],
  
  // Community features
  'community_chat': [
    { id: 'community_mutual_aid', title: 'Mutual Aid', route: '/(tabs)/community/mutual-aid' as Href, icon: '🤝', category: 'community', reason: 'Give or receive help' },
    { id: 'events', title: 'Community Events', route: '/(tabs)/events' as Href, icon: '📅', category: 'events', reason: 'Meet in person' },
    { id: 'campaigns', title: 'Campaigns', route: '/(tabs)/campaigns' as Href, icon: '📢', category: 'campaigns', reason: 'Take collective action' },
  ],
  
  // Resources features
  'resources_letter': [
    { id: 'resources_evidence', title: 'Evidence Locker', route: '/resources/evidence-locker' as Href, icon: '🔒', category: 'resources', reason: 'Attach documentation' },
    { id: 'advocacy_ask', title: 'Ask an Advocate', route: '/(tabs)/advocacy/ask' as Href, icon: '💬', category: 'advocacy', reason: 'Get letter reviewed' },
    { id: 'research', title: 'Research Hub', route: '/(tabs)/research' as Href, icon: '🔬', category: 'research', reason: 'Find supporting evidence' },
  ],
  
  // Campaign features
  'campaigns_detail': [
    { id: 'community', title: 'Community Discussion', route: '/(tabs)/community' as Href, icon: '👥', category: 'community', reason: 'Discuss with others' },
    { id: 'events', title: 'Related Events', route: '/(tabs)/events' as Href, icon: '📅', category: 'events', reason: 'Find campaign events' },
    { id: 'advocacy_rep', title: 'Contact Your Rep', route: '/advocacy/rep-tracker' as Href, icon: '🗳️', category: 'advocacy', reason: 'Make your voice heard' },
  ],
  
  // Events features
  'events_detail': [
    { id: 'community', title: 'Community Chat', route: '/(tabs)/community' as Href, icon: '👥', category: 'community', reason: 'Connect with attendees' },
    { id: 'campaigns', title: 'Related Campaigns', route: '/(tabs)/campaigns' as Href, icon: '📢', category: 'campaigns', reason: 'Take action' },
    { id: 'wellness_daily_planner', title: 'Add to Planner', route: '/wellness/daily-planner' as Href, icon: '📅', category: 'wellness', reason: 'Schedule it' },
  ],
  
  // Research features
  'research_article': [
    { id: 'saved', title: 'Save for Later', route: '/(tabs)/saved' as Href, icon: '⭐', category: 'tools', reason: 'Bookmark this article' },
    { id: 'community', title: 'Discuss Findings', route: '/(tabs)/community' as Href, icon: '👥', category: 'community', reason: 'Share with community' },
    { id: 'resources_letter', title: 'Use in Letter', route: '/resources/letter-builder' as Href, icon: '📝', category: 'resources', reason: 'Cite this research' },
  ],
};

/**
 * Get related features for the current context
 */
export function getRelatedFeatures(context: FeatureContext): RelatedFeature[] {
  const baseFeatures = FEATURE_RELATIONSHIPS[context.currentFeature] || [];
  
  // Could enhance this with user history, preferences, or AI recommendations
  // For now, return the predefined relationships
  return baseFeatures;
}

/**
 * Get smart navigation suggestion based on user action
 */
export function getSmartSuggestion(context: FeatureContext): RelatedFeature | null {
  const related = getRelatedFeatures(context);
  if (related.length === 0) return null;
  
  // Action-based suggestions
  switch (context.userAction) {
    case 'completed_mood':
      return related.find(f => f.id === 'wellness_cbt') || related[0];
    case 'completed_symptom':
      return related.find(f => f.id === 'advocacy_ask') || related[0];
    case 'saved_resource':
      return related.find(f => f.id === 'community') || related[0];
    case 'joined_campaign':
      return related.find(f => f.id === 'community') || related[0];
    default:
      // Return the first suggestion
      return related[0];
  }
}

/**
 * Track navigation flow for analytics (optional)
 */
export function trackNavigation(from: string, to: string, reason: string) {
  // Could integrate with analytics service
  console.log('[CrossFeatureNav]', { from, to, reason });
}

/**
 * React hook for related features
 */
import { useMemo } from 'react';

export function useRelatedFeatures(featureId: string, action?: string) {
  return useMemo(() => {
    const context: FeatureContext = {
      currentFeature: featureId,
      userAction: action,
    };
    
    return {
      related: getRelatedFeatures(context),
      smartSuggestion: getSmartSuggestion(context),
    };
  }, [featureId, action]);
}
