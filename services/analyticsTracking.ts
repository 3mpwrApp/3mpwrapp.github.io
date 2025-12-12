/**
 * Core Analytics Events for Success Measurement
 * 
 * Defines all tracked events with their properties for:
 * - User engagement
 * - Feature adoption
 * - Conversion funnels
 * - Retention metrics
 */

import { logEvent } from './analytics';

// ============================================
// ONBOARDING FUNNEL
// ============================================

export const trackOnboardingStarted = () => 
  logEvent('onboarding_started', { timestamp: Date.now() });

export const trackOnboardingStepCompleted = (step: number, stepName: string) =>
  logEvent('onboarding_step_completed', { step, stepName });

export const trackOnboardingCompleted = (durationMs: number) =>
  logEvent('onboarding_completed', { durationMs, completedAt: Date.now() });

export const trackOnboardingSkipped = (atStep: number) =>
  logEvent('onboarding_skipped', { atStep });

// ============================================
// AUTHENTICATION
// ============================================

export const trackSignIn = (method: 'google' | 'guest' | 'email') =>
  logEvent('sign_in', { method });

export const trackSignOut = () =>
  logEvent('sign_out', {});

export const trackGuestConversion = () =>
  logEvent('guest_to_account', { convertedAt: Date.now() });

// ============================================
// FEATURE ENGAGEMENT
// ============================================

export const trackFeatureOpened = (featureId: string, source: 'tab' | 'search' | 'deeplink' | 'notification') =>
  logEvent('feature_opened', { featureId, source });

export const trackFeatureActionCompleted = (featureId: string, action: string) =>
  logEvent('feature_action', { featureId, action });

export const trackPowerToolOpened = (toolId: string, tabId?: string) =>
  logEvent('power_tool_opened', { toolId, tabId });

export const trackPowerToolTabSwitched = (toolId: string, fromTab: string, toTab: string) =>
  logEvent('power_tool_tab_switched', { toolId, fromTab, toTab });

// ============================================
// WELLNESS TRACKING
// ============================================

export const trackMoodLogged = (mood: number, hasNote: boolean) =>
  logEvent('mood_logged', { mood, hasNote });

export const trackEnergyLogged = (energy: number) =>
  logEvent('energy_logged', { energy });

export const trackSymptomLogged = (symptomType: string, severity: number) =>
  logEvent('symptom_logged', { symptomType, severity });

export const trackMedicationTaken = (medId: string) =>
  logEvent('medication_taken', { medId });

export const trackWellnessStreakMilestone = (days: number) =>
  logEvent('wellness_streak', { days });

// ============================================
// ADVOCACY FEATURES
// ============================================

export const trackTranslatorUsed = (inputLength: number, outputGenerated: boolean) =>
  logEvent('translator_used', { inputLength, outputGenerated });

export const trackLetterGenerated = (letterType: string, wordCount: number) =>
  logEvent('letter_generated', { letterType, wordCount });

export const trackEvidenceUploaded = (fileType: string, fileSize: number) =>
  logEvent('evidence_uploaded', { fileType, fileSize });

export const trackDeadlineCreated = (daysUntilDue: number) =>
  logEvent('deadline_created', { daysUntilDue });

export const trackDeadlineCompleted = (wasOnTime: boolean) =>
  logEvent('deadline_completed', { wasOnTime });

// ============================================
// COMMUNITY ENGAGEMENT
// ============================================

export const trackThreadCreated = (category: string) =>
  logEvent('thread_created', { category });

export const trackThreadReplied = (threadId: string) =>
  logEvent('thread_replied', { threadId });

export const trackStoryShared = () =>
  logEvent('story_shared', {});

export const trackCampaignJoined = (campaignId: string) =>
  logEvent('campaign_joined', { campaignId });

// ============================================
// RETENTION & ENGAGEMENT
// ============================================

export const trackSessionStarted = (isFirstToday: boolean, daysSinceLastSession: number) =>
  logEvent('session_started', { isFirstToday, daysSinceLastSession });

export const trackSessionEnded = (durationMs: number, screensVisited: number) =>
  logEvent('session_ended', { durationMs, screensVisited });

export const trackDailyActive = () =>
  logEvent('daily_active', { date: new Date().toISOString().split('T')[0] });

export const trackWeeklyActive = () =>
  logEvent('weekly_active', { week: getWeekNumber() });

export const trackReturningUser = (daysSinceLastVisit: number) =>
  logEvent('returning_user', { daysSinceLastVisit });

// ============================================
// REFERRAL & VIRAL
// ============================================

export const trackReferralCodeShared = (method: 'copy' | 'share' | 'qr') =>
  logEvent('referral_shared', { method });

export const trackReferralCodeApplied = (code: string) =>
  logEvent('referral_applied', { code });

export const trackReferralConversion = () =>
  logEvent('referral_conversion', {});

// ============================================
// NOTIFICATIONS
// ============================================

export const trackNotificationSent = (category: string, type: string) =>
  logEvent('notification_sent', { category, type });

export const trackNotificationOpened = (category: string, type: string) =>
  logEvent('notification_opened', { category, type });

export const trackNotificationDismissed = (category: string) =>
  logEvent('notification_dismissed', { category });

export const trackPushTokenRegistered = (platform: string) =>
  logEvent('push_token_registered', { platform });

// ============================================
// SETTINGS & PREFERENCES
// ============================================

export const trackComplexityModeChanged = (from: string, to: string) =>
  logEvent('complexity_mode_changed', { from, to });

export const trackAccessibilitySettingChanged = (setting: string, value: boolean | string) =>
  logEvent('accessibility_setting', { setting, value: String(value) });

export const trackLanguageChanged = (from: string, to: string) =>
  logEvent('language_changed', { from, to });

// ============================================
// ERRORS & ISSUES
// ============================================

export const trackError = (errorType: string, errorMessage: string, screen?: string) =>
  logEvent('app_error', { errorType, errorMessage, screen });

export const trackCrashRecovery = () =>
  logEvent('crash_recovery', {});

// ============================================
// NPS & FEEDBACK
// ============================================

export const trackNPSSurveyShown = () =>
  logEvent('nps_survey_shown', {});

export const trackNPSSurveyCompleted = (score: number, hasComment: boolean) =>
  logEvent('nps_survey_completed', { score, hasComment });

export const trackNPSSurveyDismissed = () =>
  logEvent('nps_survey_dismissed', {});

export const trackFeedbackSubmitted = (category: string) =>
  logEvent('feedback_submitted', { category });

// ============================================
// HELPER FUNCTIONS
// ============================================

function getWeekNumber(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNum = Math.ceil(diff / oneWeek);
  return `${now.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

// ============================================
// KEY METRICS DEFINITIONS
// ============================================

/**
 * North Star Metrics:
 * 1. Weekly Active Users (WAU)
 * 2. Advocacy Actions per User (letters, evidence, deadlines)
 * 3. Wellness Engagement Rate (mood/energy logs)
 * 
 * Retention Metrics:
 * - Day 1 Retention: Users who return within 24 hours
 * - Day 7 Retention: Users who return within 7 days
 * - Day 30 Retention: Users who return within 30 days
 * 
 * Engagement Metrics:
 * - Session Duration
 * - Features per Session
 * - Completion Rates (onboarding, letters, etc.)
 * 
 * Viral Metrics:
 * - Referral Rate: % users who share referral code
 * - Conversion Rate: % referrals who become active users
 * - K-Factor: Referrals * Conversion Rate
 */
