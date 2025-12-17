/**
 * Discord Notifications Service
 * 
 * Sends automated notifications to the 3mpwrApp Discord server via webhook.
 * Used for events, campaigns, user activity, and system alerts.
 */

import Constants from 'expo-constants';

import { sendWebhookMessage } from './discord';

// Discord embed colors (decimal values)
const COLORS = {
  success: 0x22c55e,    // Green
  info: 0x3b82f6,       // Blue
  warning: 0xf59e0b,    // Amber
  error: 0xef4444,      // Red
  purple: 0x8b5cf6,     // Purple (brand)
  pink: 0xec4899,       // Pink
};

/**
 * Get Discord webhook URL at runtime (handles EAS builds correctly)
 * Uses Constants.expoConfig.extra which is properly bundled in EAS builds
 */
function getDiscordWebhookUrl(): string {
  // Try Constants.expoConfig.extra first (works in EAS builds)
  const fromExtra = Constants.expoConfig?.extra?.EXPO_PUBLIC_DISCORD_WEBHOOK_URL;
  if (fromExtra) return fromExtra;
  
  // Fallback to process.env (works in development)
  return process.env.EXPO_PUBLIC_DISCORD_WEBHOOK_URL || '';
}

/**
 * Check if notifications are configured
 */
export function isDiscordNotificationsEnabled(): boolean {
  return !!getDiscordWebhookUrl();
}

/**
 * Notify Discord when a new event is created
 */
export async function notifyNewEvent(event: {
  title: string;
  date: string;
  location?: string;
  description?: string;
  type?: string;
}): Promise<boolean> {
  const webhookUrl = getDiscordWebhookUrl(); if (!webhookUrl) return false;

  return sendWebhookMessage(webhookUrl, '', {
    username: '3mpwrApp Events',
    embeds: [{
      title: '📅 New Event Created',
      description: event.title,
      color: COLORS.info,
      fields: [
        { name: '📆 Date', value: event.date, inline: true },
        ...(event.location ? [{ name: '📍 Location', value: event.location, inline: true }] : []),
        ...(event.type ? [{ name: '🏷️ Type', value: event.type, inline: true }] : []),
        ...(event.description ? [{ name: '📝 Details', value: event.description.substring(0, 200) + (event.description.length > 200 ? '...' : '') }] : []),
      ],
    }],
  });
}

/**
 * Notify Discord when a new campaign is launched
 */
export async function notifyNewCampaign(campaign: {
  title: string;
  description?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}): Promise<boolean> {
  const webhookUrl = getDiscordWebhookUrl(); if (!webhookUrl) return false;

  return sendWebhookMessage(webhookUrl, '', {
    username: '3mpwrApp Campaigns',
    embeds: [{
      title: '🎯 New Campaign Launched!',
      description: campaign.title,
      color: COLORS.purple,
      fields: [
        ...(campaign.goal ? [{ name: '🎯 Goal', value: campaign.goal }] : []),
        ...(campaign.startDate ? [{ name: '📆 Start', value: campaign.startDate, inline: true }] : []),
        ...(campaign.endDate ? [{ name: '🏁 End', value: campaign.endDate, inline: true }] : []),
        ...(campaign.description ? [{ name: '📝 About', value: campaign.description.substring(0, 300) + (campaign.description.length > 300 ? '...' : '') }] : []),
      ],
    }],
  });
}

/**
 * Notify Discord when beta feedback is submitted
 */
export async function notifyBetaFeedback(feedback: {
  type: 'bug' | 'feature' | 'general' | 'praise';
  message: string;
  screen?: string;
  userId?: string;
}): Promise<boolean> {
  const webhookUrl = getDiscordWebhookUrl(); if (!webhookUrl) return false;

  const typeEmoji = {
    bug: '🐛',
    feature: '💡',
    general: '💬',
    praise: '🎉',
  };

  const typeColors = {
    bug: COLORS.error,
    feature: COLORS.info,
    general: COLORS.purple,
    praise: COLORS.success,
  };

  return sendWebhookMessage(webhookUrl, '', {
    username: '3mpwrApp Feedback',
    embeds: [{
      title: `${typeEmoji[feedback.type]} Beta Feedback: ${feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}`,
      description: feedback.message.substring(0, 500) + (feedback.message.length > 500 ? '...' : ''),
      color: typeColors[feedback.type],
      fields: [
        ...(feedback.screen ? [{ name: '📱 Screen', value: feedback.screen, inline: true }] : []),
        { name: '🔖 Type', value: feedback.type, inline: true },
      ],
    }],
  });
}

/**
 * Notify Discord when a new user signs up (privacy-conscious)
 */
export async function notifyNewUser(options?: {
  isGuest?: boolean;
  source?: string;
}): Promise<boolean> {
  const webhookUrl = getDiscordWebhookUrl(); if (!webhookUrl) return false;

  const userType = options?.isGuest ? 'Guest User' : 'Registered User';
  
  return sendWebhookMessage(webhookUrl, '', {
    username: '3mpwrApp',
    embeds: [{
      title: '👋 New User Joined!',
      description: `A new ${userType.toLowerCase()} has joined the 3mpwrApp community!`,
      color: COLORS.success,
      fields: [
        { name: '👤 Type', value: userType, inline: true },
        ...(options?.source ? [{ name: '📲 Source', value: options.source, inline: true }] : []),
      ],
    }],
  });
}

/**
 * Notify Discord when an app update is released
 */
export async function notifyAppUpdate(update: {
  version: string;
  channel: 'production' | 'preview' | 'development';
  changes?: string[];
}): Promise<boolean> {
  const webhookUrl = getDiscordWebhookUrl(); if (!webhookUrl) return false;

  const channelEmoji = {
    production: '🚀',
    preview: '🧪',
    development: '🔧',
  };

  return sendWebhookMessage(webhookUrl, '', {
    username: '3mpwrApp Updates',
    embeds: [{
      title: `${channelEmoji[update.channel]} App Update: v${update.version}`,
      description: `New update released to **${update.channel}** channel!`,
      color: update.channel === 'production' ? COLORS.success : COLORS.info,
      fields: [
        { name: '📦 Version', value: update.version, inline: true },
        { name: '📡 Channel', value: update.channel, inline: true },
        ...(update.changes?.length ? [{ 
          name: '📝 Changes', 
          value: update.changes.slice(0, 5).map(c => `• ${c}`).join('\n') + (update.changes.length > 5 ? `\n... and ${update.changes.length - 5} more` : '')
        }] : []),
      ],
    }],
  });
}

/**
 * Notify Discord when an error occurs (backup to Sentry)
 */
export async function notifyError(error: {
  title: string;
  message: string;
  stack?: string;
  screen?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}): Promise<boolean> {
  const webhookUrl = getDiscordWebhookUrl(); if (!webhookUrl) return false;

  const severityEmoji = {
    low: '⚠️',
    medium: '🔶',
    high: '🔴',
    critical: '🚨',
  };

  const severity = error.severity || 'medium';

  return sendWebhookMessage(webhookUrl, '', {
    username: '3mpwrApp Alerts',
    embeds: [{
      title: `${severityEmoji[severity]} Error: ${error.title}`,
      description: error.message.substring(0, 300),
      color: severity === 'critical' ? COLORS.error : COLORS.warning,
      fields: [
        { name: '⚡ Severity', value: severity.toUpperCase(), inline: true },
        ...(error.screen ? [{ name: '📱 Screen', value: error.screen, inline: true }] : []),
        ...(error.stack ? [{ name: '📋 Stack', value: '```' + error.stack.substring(0, 500) + '```' }] : []),
      ],
    }],
  });
}

/**
 * Notify Discord of a community milestone
 */
export async function notifyMilestone(milestone: {
  title: string;
  description: string;
  metric?: string;
  value?: number;
}): Promise<boolean> {
  const webhookUrl = getDiscordWebhookUrl(); if (!webhookUrl) return false;

  return sendWebhookMessage(webhookUrl, '', {
    username: '3mpwrApp',
    embeds: [{
      title: `🎉 ${milestone.title}`,
      description: milestone.description,
      color: COLORS.pink,
      fields: [
        ...(milestone.metric && milestone.value ? [{ 
          name: milestone.metric, 
          value: milestone.value.toLocaleString(), 
          inline: true 
        }] : []),
      ],
    }],
  });
}

/**
 * Send a custom notification to Discord
 */
export async function notifyCustom(options: {
  title: string;
  description: string;
  color?: 'success' | 'info' | 'warning' | 'error' | 'purple' | 'pink';
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  username?: string;
}): Promise<boolean> {
  const webhookUrl = getDiscordWebhookUrl(); if (!webhookUrl) return false;

  return sendWebhookMessage(webhookUrl, '', {
    username: options.username || '3mpwrApp',
    embeds: [{
      title: options.title,
      description: options.description,
      color: COLORS[options.color || 'purple'],
      fields: options.fields,
    }],
  });
}
