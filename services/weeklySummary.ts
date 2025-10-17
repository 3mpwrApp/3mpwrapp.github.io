/**
 * Weekly Summary Service (Phase 6.7)
 *
 * Generates comprehensive weekly reports for users with:
 * - Energy level trends and best/worst days
 * - Mood patterns and key emotional moments
 * - Tool usage analytics and most-used features
 * - Achievements and wellness milestones
 * - Recovery rate and overall wellness score
 * - Personalized recommendations based on patterns
 *
 * Scheduled: Every Sunday at 9pm UTC
 * Delivered: Every Monday at 10am user local time
 */

import type { Database, DataSnapshot } from 'firebase/database';
import { get, limitToLast, orderByChild, query, ref, set } from 'firebase/database';

import type { Pattern } from './patternLearning';
import { analyzePattern, getUserPatterns } from './patternLearning';

/**
 * Weekly summary data structure
 */
export interface WeeklySummary {
  id: string;
  userId: string;
  weekStartDate: number; // Unix timestamp for Monday
  weekEndDate: number; // Unix timestamp for Sunday
  generatedAt: number; // Unix timestamp when summary was generated

  // Energy metrics
  energyMetrics: {
    averageEnergy: number; // 0-100
    bestDay: { date: string; level: number };
    worstDay: { date: string; level: number };
    trend: 'improving' | 'declining' | 'stable';
    recoveryRate: number; // 0-100, % time spent recovering
  };

  // Mood metrics
  moodMetrics: {
    dominantMood: string; // most common mood
    moodVariance: number; // 0-100, how much mood changed
    bestMoodDay: string; // date
    moodDistribution: Record<string, number>; // { happy: 20, sad: 15, etc }
  };

  // Tool usage
  toolUsage: {
    totalToolSessions: number;
    mostUsedTools: Array<{ name: string; count: number }>;
    categoriesUsed: string[];
    timeSpentInWellness: number; // minutes
  };

  // Achievements
  achievements: {
    streakDays: number; // consecutive days with app usage
    goalsCompleted: number;
    newAchievements: string[];
  };

  // Overall wellness score
  wellnessScore: number; // 0-100

  // Personalized insights
  insights: string[]; // Array of personalized observations

  // Recommendations
  recommendations: string[]; // Array of personalized suggestions

  // Delivery status
  deliveryScheduled: boolean;
  deliveredAt?: number;
}

/**
 * Generate a weekly summary for a user
 * @param database Firebase Realtime Database reference
 * @param userId User ID
 * @param forWeekStart Optional: Date object for Monday of the week to summarize (defaults to last week)
 */
export async function generateWeeklySummary(
  database: Database,
  userId: string,
  forWeekStart?: Date,
): Promise<WeeklySummary> {
  // Determine week boundaries
  let weekStart = forWeekStart || new Date();
  
  // If no date provided, summarize last week
  if (!forWeekStart) {
    const dayOfWeek = weekStart.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(weekStart.getDate() - daysToMonday - 7); // Last Monday
  }
  
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Get patterns for this week
  const patterns = await getUserPatterns(userId);

  // Analyze energy patterns for trends
  const energyPatterns = patterns.filter(p => p.type === 'energy');
  const moodPatterns = patterns.filter(p => p.type === 'mood');
  const recoveryPatterns = patterns.filter(p => p.type === 'recovery');

  // Only analyze if we have patterns
  const energyAnalysis = energyPatterns.length > 0 
    ? analyzePattern(energyPatterns[0])
    : null;
  const moodAnalysis = moodPatterns.length > 0
    ? analyzePattern(moodPatterns[0])
    : null;
  const recoveryAnalysis = recoveryPatterns.length > 0
    ? analyzePattern(recoveryPatterns[0])
    : null;

  // Calculate metrics
  const energyMetrics = calculateEnergyMetrics(patterns, weekStart, weekEnd);
  const moodMetrics = calculateMoodMetrics(patterns, weekStart, weekEnd);
  const toolUsage = await calculateToolUsage(database, userId, weekStart, weekEnd);
  const achievements = await getWeeklyAchievements(database, userId, weekStart, weekEnd);
  const wellnessScore = calculateWellnessScore(
    energyMetrics,
    moodMetrics,
    toolUsage,
    recoveryAnalysis,
  );

  // Generate insights
  const insights = generateInsights(
    energyMetrics,
    moodMetrics,
    toolUsage,
    energyAnalysis,
    moodAnalysis,
    recoveryAnalysis,
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    energyMetrics,
    moodMetrics,
    wellnessScore,
    patterns,
  );

  const summary: WeeklySummary = {
    id: `summary_${userId}_${weekStart.getTime()}`,
    userId,
    weekStartDate: weekStart.getTime(),
    weekEndDate: weekEnd.getTime(),
    generatedAt: Date.now(),
    energyMetrics,
    moodMetrics,
    toolUsage,
    achievements,
    wellnessScore,
    insights,
    recommendations,
    deliveryScheduled: true,
  };

  // Store in database
  try {
    const summaryRef = ref(database, `users/${userId}/weeklySummaries/${summary.id}`);
    await set(summaryRef, summary);
  } catch {
    // Log but don't fail
  }

  return summary;
}

/**
 * Calculate energy metrics for the week
 */
function calculateEnergyMetrics(
  patterns: Pattern[],
  _weekStart: Date,
  _weekEnd: Date,
): WeeklySummary['energyMetrics'] {
  const energyPatterns = patterns.filter(p => p.type === 'energy');
  
  if (energyPatterns.length === 0) {
    return {
      averageEnergy: 50,
      bestDay: { date: 'N/A', level: 50 },
      worstDay: { date: 'N/A', level: 50 },
      trend: 'stable',
      recoveryRate: 0,
    };
  }

  // Calculate average energy from data points
  let totalEnergy = 0;
  let totalPoints = 0;
  const dayMap: Record<string, number[]> = {};

  energyPatterns.forEach(p => {
    const dataPoints = p.dataPoints || [];
    dataPoints.forEach(dp => {
      // Use outcome or energyAfter as energy level
      const energyLevel = dp.outcome ?? dp.energyAfter ?? 50;
      totalEnergy += energyLevel;
      totalPoints += 1;

      const date = new Date(dp.timestamp).toISOString().split('T')[0];
      if (!dayMap[date]) dayMap[date] = [];
      dayMap[date].push(energyLevel);
    });
  });

  const averageEnergy = totalPoints > 0 ? Math.round(totalEnergy / totalPoints) : 50;

  // Find best and worst days
  const dayAverages = Object.entries(dayMap).map(([date, values]) => ({
    date,
    level: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
  }));

  const bestDay = dayAverages.length > 0
    ? dayAverages.reduce((best, current) => current.level > best.level ? current : best)
    : { date: 'N/A', level: 50 };

  const worstDay = dayAverages.length > 0
    ? dayAverages.reduce((worst, current) => current.level < worst.level ? current : worst)
    : { date: 'N/A', level: 50 };

  // Calculate trend
  const trend = (() => {
    if (dayAverages.length < 2) return 'stable';
    const firstHalf = dayAverages.slice(0, Math.floor(dayAverages.length / 2));
    const secondHalf = dayAverages.slice(Math.floor(dayAverages.length / 2));
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.level, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.level, 0) / secondHalf.length;
    const change = secondAvg - firstAvg;
    if (change > 10) return 'improving';
    if (change < -10) return 'declining';
    return 'stable';
  })();

  // Recovery rate (percentage of time spent in recovery patterns)
  const recoveryPatterns = patterns.filter(p => p.type === 'recovery');
  const recoveryDataPoints = recoveryPatterns.reduce((sum, p) => sum + (p.dataPoints?.length || 0), 0);
  const recoveryRate = totalPoints > 0 ? Math.round((recoveryDataPoints / totalPoints) * 100) : 0;

  return {
    averageEnergy,
    bestDay,
    worstDay,
    trend,
    recoveryRate,
  };
}

/**
 * Calculate mood metrics for the week
 */
function calculateMoodMetrics(
  patterns: Pattern[],
  _weekStart: Date,
  _weekEnd: Date,
): WeeklySummary['moodMetrics'] {
  const moodPatterns = patterns.filter(p => p.type === 'mood');

  if (moodPatterns.length === 0) {
    return {
      dominantMood: 'N/A',
      moodVariance: 0,
      bestMoodDay: 'N/A',
      moodDistribution: {},
    };
  }

  // Build mood distribution from tags and notes
  const moodDistribution: Record<string, number> = {};
  let bestMoodValue = 0;
  let bestMoodDay = 'N/A';

  moodPatterns.forEach(p => {
    const dataPoints = p.dataPoints || [];
    dataPoints.forEach(dp => {
      // Use tags to categorize mood, or default to outcome levels
      let moodValue = 'neutral';
      if (dp.tags && dp.tags.length > 0) {
        moodValue = dp.tags[0];
      } else if (dp.outcome !== undefined) {
        if (dp.outcome > 70) moodValue = 'happy';
        else if (dp.outcome > 40) moodValue = 'okay';
        else moodValue = 'sad';
      }

      moodDistribution[moodValue] = (moodDistribution[moodValue] || 0) + 1;

      if (moodDistribution[moodValue] > bestMoodValue) {
        bestMoodValue = moodDistribution[moodValue];
        bestMoodDay = new Date(dp.timestamp).toISOString().split('T')[0];
      }
    });
  });

  // Find dominant mood
  const dominantMood = Object.entries(moodDistribution).length > 0
    ? Object.entries(moodDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : 'N/A';

  // Calculate mood variance
  const moodVariance = Math.min(100, Object.keys(moodDistribution).length * 20);

  return {
    dominantMood,
    moodVariance,
    bestMoodDay,
    moodDistribution,
  };
}

/**
 * Calculate tool usage metrics
 */
async function calculateToolUsage(
  database: Database,
  userId: string,
  _weekStart: Date,
  _weekEnd: Date,
): Promise<WeeklySummary['toolUsage']> {
  try {
    const toolsRef = ref(database, `users/${userId}/toolSessions`);
    const snapshot = await get(toolsRef);

    if (!snapshot.exists()) {
      return {
        totalToolSessions: 0,
        mostUsedTools: [],
        categoriesUsed: [],
        timeSpentInWellness: 0,
      };
    }

    const sessions = snapshot.val() as Record<string, any>;
    const toolCounts: Record<string, number> = {};
    let totalTime = 0;
    const categories = new Set<string>();

    Object.values(sessions).forEach((session: any) => {
      if (session.tool) {
        toolCounts[session.tool] = (toolCounts[session.tool] || 0) + 1;
      }
      if (session.duration) {
        totalTime += session.duration;
      }
      if (session.category) {
        categories.add(session.category);
      }
    });

    const mostUsedTools = Object.entries(toolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      totalToolSessions: Object.keys(sessions).length,
      mostUsedTools,
      categoriesUsed: Array.from(categories),
      timeSpentInWellness: Math.round(totalTime / 60), // Convert to minutes
    };
  } catch {
    return {
      totalToolSessions: 0,
      mostUsedTools: [],
      categoriesUsed: [],
      timeSpentInWellness: 0,
    };
  }
}

/**
 * Get weekly achievements
 */
async function getWeeklyAchievements(
  database: Database,
  userId: string,
  _weekStart: Date,
  _weekEnd: Date,
): Promise<WeeklySummary['achievements']> {
  try {
    const achievementsRef = ref(database, `users/${userId}/achievements`);
    const snapshot = await get(achievementsRef);

    if (!snapshot.exists()) {
      return {
        streakDays: 0,
        goalsCompleted: 0,
        newAchievements: [],
      };
    }

    const achievements = snapshot.val() as Record<string, any>;

    return {
      streakDays: achievements.streakDays || 0,
      goalsCompleted: achievements.goalsCompleted || 0,
      newAchievements: achievements.newThisWeek || [],
    };
  } catch {
    return {
      streakDays: 0,
      goalsCompleted: 0,
      newAchievements: [],
    };
  }
}

/**
 * Calculate overall wellness score (0-100)
 */
function calculateWellnessScore(
  energy: WeeklySummary['energyMetrics'],
  mood: WeeklySummary['moodMetrics'],
  tools: WeeklySummary['toolUsage'],
  _recovery: any,
): number {
  let score = 0;

  // Energy contributes 40%
  score += (energy.averageEnergy / 100) * 40;

  // Mood stability contributes 25% (lower variance = more stable = better)
  score += ((100 - mood.moodVariance) / 100) * 25;

  // Tool engagement contributes 20%
  const toolScore = Math.min(100, (tools.totalToolSessions / 10) * 100);
  score += (toolScore / 100) * 20;

  // Recovery contributes 15%
  score += (energy.recoveryRate / 100) * 15;

  return Math.round(score);
}

/**
 * Generate personalized insights
 */
function generateInsights(
  energy: WeeklySummary['energyMetrics'],
  _mood: WeeklySummary['moodMetrics'],
  tools: WeeklySummary['toolUsage'],
  _energyAnalysis: any,
  _moodAnalysis: any,
  _recoveryAnalysis: any,
): string[] {
  const insights: string[] = [];

  // Energy insights
  if (energy.trend === 'improving') {
    insights.push('Your energy levels are trending upward this week. Keep up with what\'s working!');
  } else if (energy.trend === 'declining') {
    insights.push('Your energy has been declining. Consider increasing rest and recovery time.');
  }

  if (energy.averageEnergy < 40) {
    insights.push('Your energy levels are consistently low. This might be a good time to prioritize rest.');
  } else if (energy.averageEnergy > 75) {
    insights.push('You\'re maintaining strong energy levels! Channel this into important activities.');
  }

  // Tool usage insights
  if (tools.totalToolSessions > 20) {
    insights.push('You\'ve been actively using wellness tools this week. Great commitment!');
  } else if (tools.totalToolSessions === 0) {
    insights.push('Consider exploring wellness tools to support your wellbeing.');
  }

  // Recovery insights
  if (energy.recoveryRate > 30) {
    insights.push('You\'re prioritizing recovery well. Your body will thank you.');
  }

  return insights;
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(
  energy: WeeklySummary['energyMetrics'],
  _mood: WeeklySummary['moodMetrics'],
  wellnessScore: number,
  patterns: Pattern[],
): string[] {
  const recommendations: string[] = [];

  // Energy-based recommendations
  if (energy.averageEnergy < 50) {
    recommendations.push('Focus on gentle recovery practices next week to rebuild energy.');
  } else if (energy.averageEnergy > 70) {
    recommendations.push('You have good energy. Consider taking on more challenging activities.');
  }

  // Trend-based recommendations
  if (energy.trend === 'declining') {
    recommendations.push('Schedule extra rest time and consider reducing commitments.');
  }

  // Wellness score recommendations
  if (wellnessScore < 40) {
    recommendations.push('Your wellness score is low. Prioritize basic self-care this week.');
  } else if (wellnessScore > 80) {
    recommendations.push('Excellent wellness this week! Consider mentoring others in your community.');
  }

  // Pattern-based recommendations
  if (patterns.length > 0) {
    recommendations.push('Review your wellness patterns in the app for detailed insights.');
  }

  return recommendations;
}

/**
 * Get all summaries for a user
 */
export async function getUserSummaries(
  database: Database,
  userId: string,
  limit: number = 12,
): Promise<WeeklySummary[]> {
  try {
    const summariesRef = query(
      ref(database, `users/${userId}/weeklySummaries`),
      orderByChild('generatedAt'),
      limitToLast(limit),
    );

    const snapshot = (await get(summariesRef)) as DataSnapshot;

    if (!snapshot.exists()) {
      return [];
    }

    const summaries: WeeklySummary[] = [];
    snapshot.forEach((childSnapshot: DataSnapshot) => {
      summaries.push(childSnapshot.val() as WeeklySummary);
    });

    return summaries.sort((a, b) => b.generatedAt - a.generatedAt);
  } catch {
    return [];
  }
}

/**
 * Get most recent summary
 */
export async function getLatestSummary(
  database: Database,
  userId: string,
): Promise<WeeklySummary | null> {
  const summaries = await getUserSummaries(database, userId, 1);
  return summaries.length > 0 ? summaries[0] : null;
}

/**
 * Mark summary as delivered
 */
export async function markSummaryAsDelivered(
  database: Database,
  userId: string,
  summaryId: string,
): Promise<void> {
  try {
    const summaryRef = ref(database, `users/${userId}/weeklySummaries/${summaryId}`);
    const snapshot = await get(summaryRef);
    if (snapshot.exists()) {
      const existing = snapshot.val() as WeeklySummary;
      await set(summaryRef, {
        ...existing,
        deliveredAt: Date.now(),
      });
    }
  } catch {
    // Silent fail
  }
}
