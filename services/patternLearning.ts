/**
 * ML Pattern Learning Service
 * Tracks and analyzes user behavior patterns for predictive recommendations
 * 
 * Pattern Types:
 * - Activity patterns: When users do activities and outcomes
 * - Energy patterns: Energy levels at different times
 * - Mood patterns: Emotional trends and cycles
 * - Recovery patterns: What helps users recover
 */

import {
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
} from 'firebase/firestore';

import { db } from '../firebase/config';

export type PatternType = 'activity' | 'energy' | 'mood' | 'recovery' | 'engagement';

export interface PatternDataPoint {
  /** Unique identifier */
  id: string;
  
  /** Type of pattern */
  type: PatternType;
  
  /** When this pattern was recorded */
  timestamp: number; // milliseconds
  
  /** Hour of day (0-23) */
  hourOfDay: number;
  
  /** Day of week (0-6, 0 = Sunday) */
  dayOfWeek: number;
  
  /** Activity or context identifier */
  activity?: string;
  
  /** Outcome or result (0-100 scale) */
  outcome?: number;
  
  /** Energy level before (0-100) */
  energyBefore?: number;
  
  /** Energy level after (0-100) */
  energyAfter?: number;
  
  /** Mood before (-100 to 100) */
  moodBefore?: number;
  
  /** Mood after (-100 to 100) */
  moodAfter?: number;
  
  /** Duration in minutes */
  durationMinutes?: number;
  
  /** User notes or feedback */
  notes?: string;
  
  /** Confidence score (0-100) */
  confidence: number;
  
  /** Tags for categorization */
  tags?: string[];
}

export interface Pattern {
  /** Unique pattern identifier */
  id: string;
  
  /** User UID */
  userId: string;
  
  /** Pattern type */
  type: PatternType;
  
  /** Pattern name/description */
  name: string;
  
  /** When pattern was created */
  createdAt: number;
  
  /** Last time pattern was updated */
  updatedAt: number;
  
  /** Data points for this pattern */
  dataPoints: PatternDataPoint[];
  
  /** Pattern confidence (0-100, based on data count) */
  confidence: number;
  
  /** Pattern strength/prevalence (0-100) */
  strength: number;
  
  /** Time windows when pattern is strongest */
  peakTimes: { hour: number; confidence: number }[];
  
  /** Related activities or triggers */
  triggers?: string[];
  
  /** Associated outcomes */
  outcomes?: { activity: string; averageOutcome: number }[];
  
  /** Metadata */
  metadata: {
    dataPointCount: number;
    dateRange: { start: number; end: number };
    lastOccurrence?: number;
  };
}

export interface PatternAnalysis {
  /** Overall pattern strength (0-100) */
  strength: number;
  
  /** Recommended actions based on pattern */
  recommendations: string[];
  
  /** When pattern is most likely to occur */
  bestTimes: { hour: number; confidence: number }[];
  
  /** When pattern is least likely */
  worstTimes: { hour: number; confidence: number }[];
  
  /** Correlation with other patterns */
  correlations: { pattern: string; correlation: number }[];
  
  /** Actionable insights */
  insights: string[];
  
  /** Prediction confidence (0-100) */
  predictionConfidence: number;
}

/**
 * Record a new data point for pattern learning
 */
export async function recordPatternDataPoint(
  userId: string,
  dataPoint: Omit<PatternDataPoint, 'id'>
): Promise<void> {
  try {
    const patternId = `${dataPoint.type}_${dataPoint.hourOfDay}_${dataPoint.dayOfWeek}`;
    const patternRef = doc(db, `users/${userId}/patterns/${patternId}`);
    const pointId = `${dataPoint.timestamp}`;
    
    // Get or create pattern
    const snapshot = await getDoc(patternRef);
    const now = Date.now();
    
    if (snapshot.exists()) {
      // Update existing pattern
      const pattern = snapshot.data() as Pattern;
      const newStrength = calculatePatternStrength(pattern.dataPoints.length + 1);
      
      await updateDoc(patternRef, {
        dataPoints: arrayUnion({ ...dataPoint, id: pointId }),
        updatedAt: now,
        strength: newStrength,
        confidence: Math.min(100, pattern.confidence + 5),
        'metadata.dataPointCount': (pattern.metadata.dataPointCount || 0) + 1,
        'metadata.lastOccurrence': now,
      });
    } else {
      // Create new pattern
      const newPattern: Pattern = {
        id: patternId,
        userId,
        type: dataPoint.type,
        name: generatePatternName(dataPoint.type, dataPoint.hourOfDay),
        createdAt: now,
        updatedAt: now,
        dataPoints: [{ ...dataPoint, id: pointId }],
        confidence: 10,
        strength: 10,
        peakTimes: [{ hour: dataPoint.hourOfDay, confidence: 50 }],
        metadata: {
          dataPointCount: 1,
          dateRange: { start: dataPoint.timestamp, end: dataPoint.timestamp },
          lastOccurrence: now,
        },
      };
      
      await setDoc(patternRef, newPattern);
    }
  } catch (error) {
    logError('PatternLearning', 'Error recording pattern data point', error);
    throw error;
  }
}

/**
 * Get all patterns for a user
 */
export async function getUserPatterns(userId: string, type?: PatternType): Promise<Pattern[]> {
  try {
    const patternsRef = collection(db, `users/${userId}/patterns`);

    // Get all documents
    const snapshot = await getDocs(patternsRef);
    const patterns = snapshot.docs.map(doc => doc.data() as Pattern);

    // Filter by type if provided
    if (type) {
      return patterns.filter(p => p.type === type);
    }

    return patterns;
  } catch (error) {
    logError('PatternLearning', 'Error fetching user patterns', error);
    return [];
  }
}

/**
 * Get pattern by ID
 */
export async function getPattern(userId: string, patternId: string): Promise<Pattern | null> {
  try {
    const patternRef = doc(db, `users/${userId}/patterns/${patternId}`);
    const snapshot = await getDoc(patternRef);
    
    if (snapshot.exists()) {
      return snapshot.data() as Pattern;
    }
    
    return null;
  } catch (error) {
    logError('PatternLearning', 'Error fetching pattern', error);
    return null;
  }
}

/**
 * Analyze a pattern to generate insights
 */
export function analyzePattern(pattern: Pattern): PatternAnalysis {
  const peakHours = getPeakHours(pattern.dataPoints);
  const worstHours = getWorstHours(pattern.dataPoints);
  const recommendations = generateRecommendations(pattern);
  const insights = generateInsights(pattern);
  
  return {
    strength: pattern.strength,
    recommendations,
    bestTimes: peakHours.map(h => ({ hour: h, confidence: 70 })),
    worstTimes: worstHours.map(h => ({ hour: h, confidence: 70 })),
    correlations: [], // TODO: Implement correlations
    insights,
    predictionConfidence: pattern.confidence,
  };
}

/**
 * Get peak hours for a pattern (when it's most likely to occur)
 */
function getPeakHours(dataPoints: PatternDataPoint[]): number[] {
  const hourCounts: { [key: number]: number } = {};
  
  dataPoints.forEach(point => {
    hourCounts[point.hourOfDay] = (hourCounts[point.hourOfDay] || 0) + 1;
  });
  
  // Return hours with most occurrences
  return Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));
}

/**
 * Get worst hours for a pattern
 */
function getWorstHours(dataPoints: PatternDataPoint[]): number[] {
  const hourOutcomes: { [key: number]: number[] } = {};
  
  dataPoints.forEach(point => {
    if (point.outcome) {
      if (!hourOutcomes[point.hourOfDay]) {
        hourOutcomes[point.hourOfDay] = [];
      }
      hourOutcomes[point.hourOfDay].push(point.outcome);
    }
  });
  
  // Return hours with lowest average outcomes
  const avgOutcomes = Object.entries(hourOutcomes)
    .map(([hour, outcomes]) => ({
      hour: parseInt(hour),
      avg: outcomes.reduce((a, b) => a + b, 0) / outcomes.length,
    }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3);
  
  return avgOutcomes.map(h => h.hour);
}

/**
 * Calculate pattern strength based on data point count
 * Uses logarithmic scale: 10 points = 50, 100 points = 75, 1000 points = 100
 */
function calculatePatternStrength(pointCount: number): number {
  if (pointCount < 2) return 10;
  const strength = Math.min(100, 10 + Math.log10(pointCount) * 15);
  return Math.round(strength);
}

/**
 * Generate pattern name based on type and time
 */
function generatePatternName(type: PatternType, hour: number): string {
  const timeOfDay = getTimeOfDay(hour);
  const typeNames: { [key in PatternType]: string } = {
    activity: `${timeOfDay} Activity Pattern`,
    energy: `${timeOfDay} Energy Pattern`,
    mood: `${timeOfDay} Mood Pattern`,
    recovery: `${timeOfDay} Recovery Pattern`,
    engagement: `${timeOfDay} Engagement Pattern`,
  };
  return typeNames[type];
}

/**
 * Get time of day description
 */
function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

/**
 * Generate recommendations based on pattern
 */
function generateRecommendations(pattern: Pattern): string[] {
  const recommendations: string[] = [];
  
  if (pattern.strength > 70) {
    recommendations.push(`This is a strong pattern. Consider planning your day around it.`);
  }
  
  if (pattern.type === 'energy' && pattern.dataPoints.length > 5) {
    const avgEnergyDrop = calculateAverageEnergyChange(pattern.dataPoints);
    if (avgEnergyDrop < -10) {
      recommendations.push('Your energy tends to drop at this time. Consider a break or activity change.');
    }
  }
  
  if (pattern.outcomes) {
    const bestOutcome = pattern.outcomes.reduce((best, current) =>
      current.averageOutcome > best.averageOutcome ? current : best
    );
    recommendations.push(`${bestOutcome.activity} tends to have the best outcomes for you.`);
  }
  
  return recommendations;
}

/**
 * Generate insights from pattern
 */
function generateInsights(pattern: Pattern): string[] {
  const insights: string[] = [];
  
  if (pattern.dataPoints.length >= 10) {
    insights.push(`Based on ${pattern.dataPoints.length} recorded instances`);
  }
  
  const dayDistribution = getDayDistribution(pattern.dataPoints);
  const mostCommonDay = Object.entries(dayDistribution)
    .sort(([, a], [, b]) => b - a)[0];
  
  if (mostCommonDay) {
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(mostCommonDay[0])];
    insights.push(`Most common on ${dayName}s`);
  }
  
  return insights;
}

/**
 * Calculate average energy change from data points
 */
function calculateAverageEnergyChange(dataPoints: PatternDataPoint[]): number {
  let totalChange = 0;
  let count = 0;
  
  dataPoints.forEach(point => {
    if (point.energyBefore !== undefined && point.energyAfter !== undefined) {
      totalChange += point.energyAfter - point.energyBefore;
      count++;
    }
  });
  
  return count > 0 ? totalChange / count : 0;
}

/**
 * Get distribution of pattern occurrences by day of week
 */
function getDayDistribution(dataPoints: PatternDataPoint[]): { [key: number]: number } {
  const distribution: { [key: number]: number } = {};
  
  dataPoints.forEach(point => {
    distribution[point.dayOfWeek] = (distribution[point.dayOfWeek] || 0) + 1;
  });
  
  return distribution;
}

/**
 * Delete a pattern
 */
export async function deletePattern(_userId: string, _patternId: string): Promise<void> {
  try {
    // TODO: Implement Firestore deletion
    // const patternRef = doc(db, `users/${userId}/patterns/${patternId}`);
    // await deleteDoc(patternRef);
  } catch (error) {
    logError('PatternLearning', 'Error deleting pattern', error);
    throw error;
  }
}

export default {
  recordPatternDataPoint,
  getUserPatterns,
  getPattern,
  analyzePattern,
  deletePattern,
};
