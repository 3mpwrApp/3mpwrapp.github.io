/**
 * Impact Score System
 * 
 * Gamified tracking of user's advocacy impact including:
 * - Letters sent
 * - Appeals won
 * - Benefits secured
 * - Community members helped
 * - Advocacy level progression
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ImpactMetrics {
  lettersSent: number;
  appealsWon: number;
  appealsInProgress: number;
  benefitsSecured: number; // Annual dollar amount
  communityHelped: number; // People helped
  daysAdvocating: number;
  evidenceItems: number;
  skillsUsed: number; // DBT/wellness skills
  moodLogsCompleted: number;
  pacingActivities: number;
}

export interface AdvocacyLevel {
  level: number;
  title: string;
  minPoints: number;
  icon: string;
  description: string;
}

export const ADVOCACY_LEVELS: AdvocacyLevel[] = [
  { level: 0, title: 'Getting Started', minPoints: 0, icon: '🌱', description: 'Beginning your advocacy journey' },
  { level: 1, title: 'Self-Advocate', minPoints: 50, icon: '💪', description: 'Standing up for yourself' },
  { level: 2, title: 'Advocate', minPoints: 150, icon: '📢', description: 'Making your voice heard' },
  { level: 3, title: 'Skilled Advocate', minPoints: 300, icon: '🎯', description: 'Mastering advocacy tools' },
  { level: 4, title: 'Community Supporter', minPoints: 500, icon: '🤝', description: 'Helping others succeed' },
  { level: 5, title: 'Community Leader', minPoints: 800, icon: '⭐', description: 'Leading by example' },
  { level: 6, title: 'Changemaker', minPoints: 1200, icon: '🔥', description: 'Creating systemic change' },
  { level: 7, title: 'Movement Builder', minPoints: 2000, icon: '👑', description: 'Building the movement' },
];

const IMPACT_KEY = 'impact:metrics:v1';
const MILESTONES_KEY = 'impact:milestones:v1';

/**
 * Calculate total impact points from metrics
 */
export function calculateImpactPoints(metrics: ImpactMetrics): number {
  let points = 0;
  
  // Letters: 10 points each
  points += metrics.lettersSent * 10;
  
  // Appeals won: 100 points each
  points += metrics.appealsWon * 100;
  
  // Appeals in progress: 25 points each
  points += metrics.appealsInProgress * 25;
  
  // Benefits secured: 1 point per $100/year
  points += Math.floor(metrics.benefitsSecured / 100);
  
  // Community help: 30 points per person
  points += metrics.communityHelped * 30;
  
  // Days advocating: 2 points per day (caps at 365 days = 730 points)
  points += Math.min(metrics.daysAdvocating * 2, 730);
  
  // Evidence items: 5 points each
  points += metrics.evidenceItems * 5;
  
  // Skills used: 3 points each
  points += metrics.skillsUsed * 3;
  
  // Mood logs: 2 points each (caps at 100 logs = 200 points)
  points += Math.min(metrics.moodLogsCompleted * 2, 200);
  
  // Pacing activities: 2 points each (caps at 100 = 200 points)
  points += Math.min(metrics.pacingActivities * 2, 200);
  
  return points;
}

/**
 * Get current advocacy level based on points
 */
export function getAdvocacyLevel(points: number): AdvocacyLevel {
  for (let i = ADVOCACY_LEVELS.length - 1; i >= 0; i--) {
    if (points >= ADVOCACY_LEVELS[i].minPoints) {
      return ADVOCACY_LEVELS[i];
    }
  }
  return ADVOCACY_LEVELS[0];
}

/**
 * Get next level and progress percentage
 */
export function getNextLevel(points: number): { 
  next: AdvocacyLevel | null; 
  progress: number;
  pointsNeeded: number;
} {
  const current = getAdvocacyLevel(points);
  const currentIndex = ADVOCACY_LEVELS.findIndex(l => l.level === current.level);
  
  if (currentIndex === ADVOCACY_LEVELS.length - 1) {
    return { next: null, progress: 100, pointsNeeded: 0 };
  }
  
  const next = ADVOCACY_LEVELS[currentIndex + 1];
  const pointsIntoLevel = points - current.minPoints;
  const pointsForNextLevel = next.minPoints - current.minPoints;
  const progress = (pointsIntoLevel / pointsForNextLevel) * 100;
  const pointsNeeded = next.minPoints - points;
  
  return { next, progress, pointsNeeded };
}

/**
 * Get impact metrics from storage
 */
export async function getImpactMetrics(): Promise<ImpactMetrics> {
  try {
    const raw = await AsyncStorage.getItem(IMPACT_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error('Error loading impact metrics:', error);
  }
  
  // Default metrics
  return {
    lettersSent: 0,
    appealsWon: 0,
    appealsInProgress: 0,
    benefitsSecured: 0,
    communityHelped: 0,
    daysAdvocating: 0,
    evidenceItems: 0,
    skillsUsed: 0,
    moodLogsCompleted: 0,
    pacingActivities: 0,
  };
}

/**
 * Save impact metrics
 */
export async function saveImpactMetrics(metrics: ImpactMetrics): Promise<void> {
  try {
    await AsyncStorage.setItem(IMPACT_KEY, JSON.stringify(metrics));
  } catch (error) {
    console.error('Error saving impact metrics:', error);
  }
}

/**
 * Update a specific metric
 */
export async function updateMetric(
  key: keyof ImpactMetrics, 
  value: number
): Promise<ImpactMetrics> {
  const metrics = await getImpactMetrics();
  metrics[key] = value;
  await saveImpactMetrics(metrics);
  return metrics;
}

/**
 * Increment a metric by 1
 */
export async function incrementMetric(key: keyof ImpactMetrics): Promise<ImpactMetrics> {
  const metrics = await getImpactMetrics();
  metrics[key] = (metrics[key] || 0) + 1;
  await saveImpactMetrics(metrics);
  return metrics;
}

/**
 * Sync metrics from various app data sources
 */
export async function syncImpactMetrics(): Promise<ImpactMetrics> {
  const metrics = await getImpactMetrics();
  
  // Sync letters sent
  try {
    const lettersRaw = await AsyncStorage.getItem('letter:history:v1');
    if (lettersRaw) {
      const letters = JSON.parse(lettersRaw);
      metrics.lettersSent = Array.isArray(letters) ? letters.length : 0;
    }
  } catch {}
  
  // Sync evidence items
  try {
    const evidenceRaw = await AsyncStorage.getItem('evidence:uploadQueue:v1');
    if (evidenceRaw) {
      const items = JSON.parse(evidenceRaw);
      metrics.evidenceItems = Array.isArray(items) ? items.length : 0;
    }
  } catch {}
  
  // Sync mood logs
  try {
    const { getEntries } = await import('../store/mood');
    const entries = await getEntries();
    metrics.moodLogsCompleted = entries.length;
  } catch {}
  
  // Sync pacing activities
  try {
    const { getActivities } = await import('../store/pacing');
    const activities = await getActivities();
    metrics.pacingActivities = activities.length;
  } catch {}
  
  // Calculate days advocating (days since first letter or evidence)
  try {
    const firstActionDate = await getFirstActionDate();
    if (firstActionDate) {
      const days = Math.floor((Date.now() - firstActionDate) / (1000 * 60 * 60 * 24));
      metrics.daysAdvocating = days;
    }
  } catch {}
  
  await saveImpactMetrics(metrics);
  return metrics;
}

/**
 * Get date of first advocacy action
 */
async function getFirstActionDate(): Promise<number | null> {
  const dates: number[] = [];
  
  // Check first letter
  try {
    const lettersRaw = await AsyncStorage.getItem('letter:history:v1');
    if (lettersRaw) {
      const letters = JSON.parse(lettersRaw);
      if (Array.isArray(letters) && letters.length > 0) {
        const sorted = letters.sort((a: any, b: any) => a.timestamp - b.timestamp);
        if (sorted[0]?.timestamp) dates.push(sorted[0].timestamp);
      }
    }
  } catch {}
  
  // Check first evidence
  try {
    const evidenceRaw = await AsyncStorage.getItem('evidence:uploadQueue:v1');
    if (evidenceRaw) {
      const items = JSON.parse(evidenceRaw);
      if (Array.isArray(items) && items.length > 0) {
        const sorted = items.sort((a: any, b: any) => a.uploadedAt - b.uploadedAt);
        if (sorted[0]?.uploadedAt) dates.push(sorted[0].uploadedAt);
      }
    }
  } catch {}
  
  // Check first mood entry
  try {
    const { getEntries } = await import('../store/mood');
    const entries = await getEntries();
    if (entries.length > 0) {
      const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
      dates.push(sorted[0].timestamp);
    }
  } catch {}
  
  return dates.length > 0 ? Math.min(...dates) : null;
}

/**
 * Generate shareable impact card data
 */
export interface ImpactCard {
  title: string;
  stats: Array<{ label: string; value: string }>;
  level: AdvocacyLevel;
  totalPoints: number;
}

export async function generateImpactCard(): Promise<ImpactCard> {
  await syncImpactMetrics();
  const metrics = await getImpactMetrics();
  const points = calculateImpactPoints(metrics);
  const level = getAdvocacyLevel(points);
  
  const stats: Array<{ label: string; value: string }> = [];
  
  if (metrics.lettersSent > 0) {
    stats.push({ label: 'Letters Sent', value: metrics.lettersSent.toString() });
  }
  
  if (metrics.appealsWon > 0) {
    stats.push({ label: 'Appeals Won', value: metrics.appealsWon.toString() });
  }
  
  if (metrics.benefitsSecured > 0) {
    stats.push({ 
      label: 'Benefits Secured', 
      value: `$${metrics.benefitsSecured.toLocaleString()}/year` 
    });
  }
  
  if (metrics.communityHelped > 0) {
    stats.push({ label: 'People Helped', value: metrics.communityHelped.toString() });
  }
  
  if (metrics.daysAdvocating > 0) {
    stats.push({ label: 'Days Advocating', value: metrics.daysAdvocating.toString() });
  }
  
  // Fill with other metrics if we have less than 4 stats
  if (stats.length < 4) {
    if (metrics.evidenceItems > 0) {
      stats.push({ label: 'Evidence Items', value: metrics.evidenceItems.toString() });
    }
    if (metrics.moodLogsCompleted > 0) {
      stats.push({ label: 'Mood Logs', value: metrics.moodLogsCompleted.toString() });
    }
  }
  
  return {
    title: `${level.title} ${level.icon}`,
    stats: stats.slice(0, 4), // Top 4 stats
    level,
    totalPoints: points,
  };
}

/**
 * Clear all impact data (for testing)
 */
export async function clearImpactData(): Promise<void> {
  await AsyncStorage.removeItem(IMPACT_KEY);
  await AsyncStorage.removeItem(MILESTONES_KEY);
}
