export type NotificationCategory = 'advocacy' | 'wellness' | 'resources' | 'community' | 'system' | 'evidence' | 'admin';

export interface NotificationTemplate {
  id: string;
  version: number;
  category: NotificationCategory;
  event: string; // domain event name
  channels: { inApp?: boolean; push?: boolean };
  priority: 'low' | 'normal' | 'high';
  throttleSec?: number;
  i18n: { titleKey: string; bodyKey: string };
  a11y?: { auditoryHintKey?: string };
  personalization?: { fields: string[] };
  featureFlag?: string;
  dedupe?: 'event' | 'template' | 'none';
}

export interface NotificationPreferences {
  categories: Record<NotificationCategory, boolean>;
  templates: Record<string, boolean | undefined>;
  channels: { push: boolean; inApp: boolean };
  quietHours?: { start: string; end: string; timezone: string };
  lastUpdated: number;
  version: number;
}

export interface DeliveredNotification {
  id: string;
  templateId: string;
  createdAt: number;
  read: boolean;
  title: string;
  body: string;
  payloadHash: string;
  event: string;
  channel: 'inApp' | 'push';
}

export interface TemplateIndex { [event: string]: string[]; }

export interface NotificationState {
  inbox: DeliveredNotification[];
  prefs: NotificationPreferences;
  lastSent: Record<string, number>; // templateId -> timestamp
}

export const DEFAULT_NOTIFICATION_PREFERENCES = (): NotificationPreferences => ({
  categories: {
    advocacy: true,
    wellness: true,
    resources: true,
    community: false,
    system: false,
    evidence: true,
    admin: false,
  },
  templates: {},
  channels: { push: true, inApp: true },
  lastUpdated: Date.now(),
  version: 1,
});
