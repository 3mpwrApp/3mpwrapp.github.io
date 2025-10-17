/**
 * Smart Notifications Service (Phase 6.6)
 *
 * Intelligently schedules push notifications based on:
 * - User's predicted energy levels (from energyPrediction service)
 * - User's quiet hours preferences
 * - Notification type and priority
 * - Time zone and local user patterns
 *
 * Algorithm:
 * 1. Check if notification should be sent immediately (high priority)
 * 2. Predict user energy at each hour in next 24 hours
 * 3. Find optimal window (high energy + outside quiet hours)
 * 4. Calculate confidence that user will see notification
 * 5. Schedule for optimal time, fallback if no good window found
 */

import type { Database, DataSnapshot } from 'firebase/database';
import { get, limitToLast, orderByChild, query, ref, set } from 'firebase/database';

import type { EnergyForecast } from './energyPrediction';
import { generateEnergyForecast } from './energyPrediction';
import { getUserPatterns } from './patternLearning';

/**
 * Notification priority levels
 * - HIGH: Urgent (medication reminders, safety alerts)
 * - MEDIUM: Important but not urgent (achievement, new resource)
 * - LOW: Convenience (tips, suggestions)
 */
export enum NotificationPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Notification type classifications
 * Used to determine content and handling rules
 */
export enum NotificationType {
  MEDICATION_REMINDER = 'medication_reminder',
  ACHIEVEMENT = 'achievement',
  RESOURCE_UPDATE = 'resource_update',
  TOOL_SUGGESTION = 'tool_suggestion',
  ADVOCACY_UPDATE = 'advocacy_update',
  COMMUNITY_MESSAGE = 'community_message',
  WELLNESS_CHECK = 'wellness_check',
  ENERGY_ALERT = 'energy_alert',
}

/**
 * Quiet hours configuration for user
 */
export interface QuietHoursConfig {
  enabled: boolean;
  startHour: number; // 0-23, local time
  endHour: number; // 0-23, local time
  timezone?: string;
  allowHighPriority: boolean; // If true, HIGH priority can override quiet hours
}

/**
 * Smart notification scheduling parameters
 */
export interface SmartNotificationRequest {
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  sound?: string;
  scheduleImmediately?: boolean; // If true, send immediately regardless of energy
}

/**
 * Scheduled notification metadata
 */
export interface ScheduledNotification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  sound?: string;
  scheduledTime: number; // Unix timestamp
  predictedEnergy: number; // 0-100
  confidence: number; // 0-100, confidence user will see notification
  reason: string; // Why this time was chosen
  createdAt: number;
  sentAt?: number;
  sentSuccessfully?: boolean;
}

/**
 * Optimal send time result from analysis
 */
export interface OptimalSendTime {
  unixTimestamp: number;
  hoursFromNow: number;
  predictedEnergy: number;
  confidence: number;
  reason: string;
  withinQuietHours: boolean;
}

/**
 * Get user's quiet hours configuration
 */
export async function getQuietHoursConfig(
  database: Database,
  userId: string,
): Promise<QuietHoursConfig> {
  try {
    const configRef = ref(database, `users/${userId}/settings/quietHours`);
    const snapshot = await get(configRef);

    if (snapshot.exists()) {
      return snapshot.val() as QuietHoursConfig;
    }

    // Return default quiet hours (10pm - 8am)
    return {
      enabled: true,
      startHour: 22,
      endHour: 8,
      timezone: 'UTC',
      allowHighPriority: true,
    };
  } catch {
    // Fallback to default on error
    return {
      enabled: true,
      startHour: 22,
      endHour: 8,
      timezone: 'UTC',
      allowHighPriority: true,
    };
  }
}

/**
 * Check if a given hour (0-23) falls within quiet hours
 */
function isWithinQuietHours(hour: number, config: QuietHoursConfig): boolean {
  if (!config.enabled) {
    return false;
  }

  if (config.startHour < config.endHour) {
    // Normal case: 9am-5pm (start < end)
    return hour >= config.startHour && hour < config.endHour;
  }

  // Wrap case: 10pm-8am (start > end, crosses midnight)
  return hour >= config.startHour || hour < config.endHour;
}

/**
 * Calculate notification send confidence score (0-100)
 *
 * Factors:
 * - Energy level (primary): Higher energy = more likely to see notification
 * - Time: Daytime hours weighted higher than night
 * - Quiet hours violation: Reduces confidence unless high priority
 */
function calculateConfidence(
  energyLevel: number,
  hour: number,
  withinQuietHours: boolean,
  priority: NotificationPriority,
): number {
  let score = 0;

  // Energy level: 40% of score (0-40)
  score += (energyLevel / 100) * 40;

  // Time of day: 30% of score (0-30)
  // 8am-8pm = full score, 8pm-11pm = 75%, 11pm-8am = 20%
  const timeScore = (() => {
    if (hour >= 8 && hour < 20) {
      return 30; // Peak hours
    }
    if (hour >= 20 && hour < 23) {
      return 22.5; // Evening (75%)
    }
    return 6; // Night (20%)
  })();
  score += timeScore;

  // Quiet hours penalty: 30% (can reduce score by 0-30)
  if (withinQuietHours) {
    if (priority === NotificationPriority.HIGH) {
      // High priority overrides quiet hours, full score
      score += 30;
    } else if (priority === NotificationPriority.MEDIUM) {
      // Medium gets 50% penalty
      score += 15;
    }
    // LOW priority gets no points for quiet hours
  } else {
    score += 30; // Full score if outside quiet hours
  }

  return Math.min(100, Math.round(score));
}

/**
 * Analyze energy forecast and find optimal send time
 */
async function findOptimalSendTime(
  _userId: string,
  forecast: EnergyForecast,
  priority: NotificationPriority,
  quietHours: QuietHoursConfig,
  maxHoursFromNow: number = 24,
): Promise<OptimalSendTime> {
  const now = new Date();
  const currentHour = now.getHours();
  let bestTime: OptimalSendTime | null = null;

  // Analyze each hour in forecast (up to maxHoursFromNow)
  for (let i = 0; i < Math.min(forecast.predictions.length, maxHoursFromNow); i++) {
    const prediction = forecast.predictions[i];
    const targetDate = new Date(now.getTime() + i * 60 * 60 * 1000);
    const targetHour = targetDate.getHours();
    const withinQuiet = isWithinQuietHours(targetHour, quietHours);

    // Skip if within quiet hours and priority doesn't override
    if (withinQuiet && priority !== NotificationPriority.HIGH) {
      continue;
    }

    const confidence = calculateConfidence(
      prediction.level,
      targetHour,
      withinQuiet,
      priority,
    );

    const reason = (() => {
      if (withinQuiet && priority === NotificationPriority.HIGH) {
        return 'High priority override of quiet hours';
      }
      if (prediction.level > 70) {
        return 'High energy predicted';
      }
      if (prediction.level > 50) {
        return 'Moderate energy expected';
      }
      return 'Outside quiet hours';
    })();

    // Update best time if this is better
    if (!bestTime || confidence > bestTime.confidence) {
      bestTime = {
        unixTimestamp: targetDate.getTime(),
        hoursFromNow: i,
        predictedEnergy: prediction.level,
        confidence,
        reason,
        withinQuietHours: withinQuiet,
      };
    }
  }

  // Fallback: if no good time found (unlikely), use immediate
  if (!bestTime) {
    const firstPrediction = forecast.predictions[0]?.level ?? 50;
    return {
      unixTimestamp: now.getTime(),
      hoursFromNow: 0,
      predictedEnergy: firstPrediction,
      confidence: 50,
      reason: 'No optimal window found, sending immediately',
      withinQuietHours: isWithinQuietHours(currentHour, quietHours),
    };
  }

  return bestTime;
}

/**
 * Schedule a smart notification
 *
 * Process:
 * 1. Get user's energy forecast
 * 2. Get user's quiet hours preferences
 * 3. Analyze forecast to find best send time
 * 4. Store scheduled notification in database
 * 5. Return scheduling result
 */
export async function scheduleSmartNotification(
  database: Database,
  request: SmartNotificationRequest,
): Promise<ScheduledNotification> {
  const { userId, type, priority, title, body, data, imageUrl, sound, scheduleImmediately } = request;

  // Get patterns and energy history to generate forecast
  const patterns = await getUserPatterns(userId);
  
  // For now, use a reasonable default current energy (would normally come from real-time tracking)
  const currentEnergy = 50;
  const energyHistory: { timestamp: number; level: number }[] = [];

  // Generate energy forecast
  const forecast = generateEnergyForecast(currentEnergy, energyHistory, patterns, 24);

  // Get quiet hours config
  const quietHours = await getQuietHoursConfig(database, userId);

  // Find optimal send time
  let optimalTime: OptimalSendTime;

  if (scheduleImmediately || priority === NotificationPriority.HIGH) {
    // Send immediately for urgent notifications
    const firstPrediction = forecast.predictions[0]?.level ?? 50;
    optimalTime = {
      unixTimestamp: Date.now(),
      hoursFromNow: 0,
      predictedEnergy: firstPrediction,
      confidence: 100,
      reason: 'High priority - sent immediately',
      withinQuietHours: isWithinQuietHours(new Date().getHours(), quietHours),
    };
  } else {
    optimalTime = await findOptimalSendTime(userId, forecast, priority, quietHours);
  }

  // Create scheduled notification object
  const notification: ScheduledNotification = {
    id: `notif_${userId}_${Date.now()}`,
    userId,
    type,
    priority,
    title,
    body,
    data,
    imageUrl,
    sound,
    scheduledTime: optimalTime.unixTimestamp,
    predictedEnergy: optimalTime.predictedEnergy,
    confidence: optimalTime.confidence,
    reason: optimalTime.reason,
    createdAt: Date.now(),
  };

  // Store in database
  try {
    const notifRef = ref(database, `users/${userId}/scheduledNotifications/${notification.id}`);
    await set(notifRef, notification);
  } catch {
    // Log but don't fail - notification is created even if storage fails
  }

  return notification;
}

/**
 * Get all scheduled notifications for a user
 */
export async function getScheduledNotifications(
  database: Database,
  userId: string,
  limit: number = 50,
): Promise<ScheduledNotification[]> {
  try {
    const notificationsRef = query(
      ref(database, `users/${userId}/scheduledNotifications`),
      orderByChild('createdAt'),
      limitToLast(limit),
    );

    const snapshot = (await get(notificationsRef)) as DataSnapshot;

    if (!snapshot.exists()) {
      return [];
    }

    const notifications: ScheduledNotification[] = [];
    snapshot.forEach((childSnapshot: DataSnapshot) => {
      notifications.push(childSnapshot.val() as ScheduledNotification);
    });

    // Sort by scheduled time (newest first)
    return notifications.sort((a, b) => b.scheduledTime - a.scheduledTime);
  } catch {
    return [];
  }
}

/**
 * Get pending notifications (not yet sent)
 */
export async function getPendingNotifications(
  database: Database,
  userId: string,
): Promise<ScheduledNotification[]> {
  const scheduled = await getScheduledNotifications(database, userId);
  const now = Date.now();

  return scheduled.filter(
    (notif) => notif.scheduledTime <= now && !notif.sentSuccessfully,
  );
}

/**
 * Mark notification as sent
 */
export async function markNotificationAsSent(
  database: Database,
  userId: string,
  notificationId: string,
  success: boolean = true,
): Promise<void> {
  try {
    const notifRef = ref(database, `users/${userId}/scheduledNotifications/${notificationId}`);
    // Get existing notification first
    const snapshot = await get(notifRef);
    if (snapshot.exists()) {
      const existing = snapshot.val() as ScheduledNotification;
      // Update with sent information
      await set(notifRef, {
        ...existing,
        sentAt: Date.now(),
        sentSuccessfully: success,
      });
    }
  } catch {
    // Silently fail
  }
}

/**
 * Calculate statistics about notification sending for a user
 */
export async function getNotificationStatistics(
  database: Database,
  userId: string,
  days: number = 7,
): Promise<{
  totalScheduled: number;
  totalSent: number;
  sendRate: number; // 0-100
  averageConfidence: number; // 0-100
  bestTimeWindow: string; // e.g., "2pm-4pm"
}> {
  const allNotifications = await getScheduledNotifications(database, userId, 500);
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

  const recentNotifs = allNotifications.filter((n) => n.createdAt >= cutoffTime);
  const sentNotifs = recentNotifs.filter((n) => n.sentSuccessfully);

  let bestHour = 0;
  let bestCount = 0;
  const hourCounts: Record<number, number> = {};

  sentNotifs.forEach((notif) => {
    const hour = new Date(notif.sentAt || 0).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;

    if (hourCounts[hour] > bestCount) {
      bestCount = hourCounts[hour];
      bestHour = hour;
    }
  });

  const averageConfidence = recentNotifs.length > 0
    ? Math.round(
        recentNotifs.reduce((sum, n) => sum + n.confidence, 0) / recentNotifs.length,
      )
    : 0;

  return {
    totalScheduled: recentNotifs.length,
    totalSent: sentNotifs.length,
    sendRate: recentNotifs.length > 0 ? Math.round((sentNotifs.length / recentNotifs.length) * 100) : 0,
    averageConfidence,
    bestTimeWindow: `${bestHour}:00-${(bestHour + 1) % 24}:00`,
  };
}
