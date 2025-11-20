/**
 * Daily Win Micro-Celebrations System
 * 
 * Provides instant gratification and positive reinforcement for user actions.
 * Celebrates achievements like mood logging streaks, first letters, peer connections.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Lazy-load Haptics only on native platforms
let Haptics: any = null;
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch {
    // Haptics not available
  }
}

export interface Celebration {
  id: string;
  title: string;
  message: string;
  icon: string;
  type: 'streak' | 'first-time' | 'milestone' | 'level-up' | 'community';
  points?: number;
  timestamp: number;
  isNew: boolean;
}

export interface CelebrationTrigger {
  id: string;
  condition: () => Promise<boolean>;
  celebration: Omit<Celebration, 'timestamp' | 'isNew'>;
  onceOnly?: boolean; // Only trigger once ever
}

const CELEBRATIONS_KEY = 'celebrations:history:v1';
const TRIGGERED_KEY = 'celebrations:triggered:v1';

/**
 * Predefined celebration triggers
 */
export const CELEBRATION_TRIGGERS: CelebrationTrigger[] = [
  // Mood Tracking Streaks
  {
    id: 'mood_streak_3',
    condition: async () => {
      // TODO: Implement with context access to mood entries
      return false;
    },
    celebration: {
      id: 'mood_streak_3',
      title: '3-Day Streak! 🔥',
      message: 'You\'re building a healthy habit!',
      icon: '🔥',
      type: 'streak',
      points: 10,
    },
  },
  {
    id: 'mood_streak_7',
    condition: async () => {
      // TODO: Implement with context access to mood entries
      return false;
    },
    celebration: {
      id: 'mood_streak_7',
      title: 'Week Warrior! 🏆',
      message: '7 days of consistent mood tracking - you\'re crushing it!',
      icon: '🏆',
      type: 'streak',
      points: 25,
    },
  },
  {
    id: 'mood_streak_30',
    condition: async () => {
      // TODO: Implement with context access to mood entries
      return false;
    },
    celebration: {
      id: 'mood_streak_30',
      title: 'Month Master! 🌟',
      message: '30 days straight! Your dedication is inspiring!',
      icon: '🌟',
      type: 'milestone',
      points: 100,
    },
  },
  
  // First-Time Achievements
  {
    id: 'first_mood_entry',
    condition: async () => {
      // TODO: Implement with context access to mood entries
      return false;
    },
    celebration: {
      id: 'first_mood_entry',
      title: 'First Entry! 🎉',
      message: 'Welcome to mood tracking! Every journey starts with a single step.',
      icon: '🎉',
      type: 'first-time',
      points: 5,
    },
    onceOnly: true,
  },
  {
    id: 'first_letter_generated',
    condition: async () => {
      // Check if user has generated their first letter
      try {
        const history = await AsyncStorage.getItem('letter:history:v1');
        if (!history) return false;
        const letters = JSON.parse(history);
        return Array.isArray(letters) && letters.length === 1;
      } catch {
        return false;
      }
    },
    celebration: {
      id: 'first_letter_generated',
      title: 'You\'re an Advocate! 📝',
      message: 'First letter sent! You\'re officially standing up for yourself!',
      icon: '📝',
      type: 'first-time',
      points: 20,
    },
    onceOnly: true,
  },
  {
    id: 'first_evidence_upload',
    condition: async () => {
      try {
        const queue = await AsyncStorage.getItem('evidence:uploadQueue:v1');
        if (!queue) return false;
        const items = JSON.parse(queue);
        return Array.isArray(items) && items.length === 1;
      } catch {
        return false;
      }
    },
    celebration: {
      id: 'first_evidence_upload',
      title: 'Evidence Secured! 🔒',
      message: 'First document uploaded! Building your case like a pro!',
      icon: '🔒',
      type: 'first-time',
      points: 15,
    },
    onceOnly: true,
  },
  {
    id: 'first_community_post',
    condition: async () => {
      // This would check Firestore for first post
      // For now, return false - implement when community features are ready
      return false;
    },
    celebration: {
      id: 'first_community_post',
      title: 'You\'re Not Alone! 🤝',
      message: 'First community post! Welcome to your support network!',
      icon: '🤝',
      type: 'community',
      points: 15,
    },
    onceOnly: true,
  },
  
  // Pacing & Energy Milestones
  {
    id: 'pacing_consistent_week',
    condition: async () => {
      // TODO: Implement with context access to pacing data
      return false;
    },
    celebration: {
      id: 'pacing_consistent_week',
      title: 'Pacing Pro! ⚡',
      message: 'A week of consistent pacing - your body thanks you!',
      icon: '⚡',
      type: 'streak',
      points: 30,
    },
  },
  
  // DBT Skills Usage
  {
    id: 'dbt_first_use',
    condition: async () => {
      try {
        const used = await AsyncStorage.getItem('dbt:skills:used:v1');
        if (!used) return false;
        const skills = JSON.parse(used);
        return Array.isArray(skills) && skills.length === 1;
      } catch {
        return false;
      }
    },
    celebration: {
      id: 'dbt_first_use',
      title: 'Skill Builder! 💪',
      message: 'First DBT skill used! You\'re building your emotional toolkit!',
      icon: '💪',
      type: 'first-time',
      points: 15,
    },
    onceOnly: true,
  },
  
  // Advocacy Milestones
  {
    id: 'letters_milestone_5',
    condition: async () => {
      try {
        const history = await AsyncStorage.getItem('letter:history:v1');
        if (!history) return false;
        const letters = JSON.parse(history);
        return Array.isArray(letters) && letters.length >= 5;
      } catch {
        return false;
      }
    },
    celebration: {
      id: 'letters_milestone_5',
      title: 'Advocacy Champion! 🎖️',
      message: '5 letters sent! You\'re making real change!',
      icon: '🎖️',
      type: 'milestone',
      points: 50,
    },
  },
  {
    id: 'letters_milestone_10',
    condition: async () => {
      try {
        const history = await AsyncStorage.getItem('letter:history:v1');
        if (!history) return false;
        const letters = JSON.parse(history);
        return Array.isArray(letters) && letters.length >= 10;
      } catch {
        return false;
      }
    },
    celebration: {
      id: 'letters_milestone_10',
      title: 'Advocacy Leader! 👑',
      message: '10 letters! You\'re unstoppable!',
      icon: '👑',
      type: 'milestone',
      points: 100,
    },
  },
];

/**
 * Check all triggers and return new celebrations
 */
export async function checkCelebrations(): Promise<Celebration[]> {
  const triggered = await getTriggeredIds();
  const newCelebrations: Celebration[] = [];
  
  for (const trigger of CELEBRATION_TRIGGERS) {
    // Skip if already triggered and set to once only
    if (trigger.onceOnly && triggered.includes(trigger.id)) {
      continue;
    }
    
    try {
      const shouldTrigger = await trigger.condition();
      
      if (shouldTrigger && !triggered.includes(trigger.id)) {
        const celebration: Celebration = {
          ...trigger.celebration,
          timestamp: Date.now(),
          isNew: true,
        };
        
        newCelebrations.push(celebration);
        await markTriggered(trigger.id);
        await saveCelebration(celebration);
      }
    } catch (error) {
      console.error(`Error checking celebration trigger ${trigger.id}:`, error);
    }
  }
  
  return newCelebrations;
}

/**
 * Trigger haptic feedback for celebration
 */
export async function celebrateWithHaptics() {
  if (Haptics && Platform.OS !== 'web') {
    if (Platform.OS === 'ios') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (Platform.OS === 'android') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }
}

/**
 * Get celebration history
 */
export async function getCelebrationHistory(): Promise<Celebration[]> {
  try {
    const raw = await AsyncStorage.getItem(CELEBRATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save celebration to history
 */
async function saveCelebration(celebration: Celebration): Promise<void> {
  try {
    const history = await getCelebrationHistory();
    history.unshift(celebration);
    // Keep last 100 celebrations
    const trimmed = history.slice(0, 100);
    await AsyncStorage.setItem(CELEBRATIONS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving celebration:', error);
  }
}

/**
 * Mark celebration as seen
 */
export async function markCelebrationSeen(celebrationId: string): Promise<void> {
  try {
    const history = await getCelebrationHistory();
    const updated = history.map(c => 
      c.id === celebrationId ? { ...c, isNew: false } : c
    );
    await AsyncStorage.setItem(CELEBRATIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking celebration seen:', error);
  }
}

/**
 * Get IDs of triggered celebrations
 */
async function getTriggeredIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(TRIGGERED_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Mark trigger as triggered
 */
async function markTriggered(triggerId: string): Promise<void> {
  try {
    const triggered = await getTriggeredIds();
    if (!triggered.includes(triggerId)) {
      triggered.push(triggerId);
      await AsyncStorage.setItem(TRIGGERED_KEY, JSON.stringify(triggered));
    }
  } catch (error) {
    console.error('Error marking triggered:', error);
  }
}

/**
 * Get total celebration points earned
 */
export async function getTotalPoints(): Promise<number> {
  const history = await getCelebrationHistory();
  return history.reduce((sum, c) => sum + (c.points || 0), 0);
}

/**
 * Clear celebration history (for testing)
 */
export async function clearCelebrations(): Promise<void> {
  await AsyncStorage.removeItem(CELEBRATIONS_KEY);
  await AsyncStorage.removeItem(TRIGGERED_KEY);
}
