export type NotificationCategory = 'advocacy' | 'wellness' | 'resources' | 'community' | 'system' | 'evidence' | 'admin' | 'whatsnew';

export type NotificationFrequency = 'realtime' | 'daily' | 'weekly' | 'monthly' | 'never';

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

export interface CategoryFrequencySettings {
  enabled: boolean;
  frequency: NotificationFrequency;
  lastSent?: number; // timestamp of last notification sent for this category
}

export interface NotificationPreferences {
  categories: Record<NotificationCategory, boolean>;
  categoryFrequencies: Record<NotificationCategory, CategoryFrequencySettings>;
  templates: Record<string, boolean | undefined>;
  channels: { push: boolean; inApp: boolean };
  quietHours?: { start: string; end: string; timezone: string };
  defaultFrequency: NotificationFrequency;
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
  // Optional deep-link support: route and arbitrary params
  route?: string;
  routeParams?: Record<string, any>;
}

export interface TemplateIndex { [event: string]: string[]; }

export interface NotificationState {
  inbox: DeliveredNotification[];
  prefs: NotificationPreferences;
  lastSent: Record<string, number>; // templateId -> timestamp
}

export const DEFAULT_CATEGORY_FREQUENCIES: Record<NotificationCategory, CategoryFrequencySettings> = {
  advocacy: { enabled: true, frequency: 'daily' },
  wellness: { enabled: true, frequency: 'daily' },
  resources: { enabled: true, frequency: 'weekly' },
  community: { enabled: false, frequency: 'realtime' },
  system: { enabled: false, frequency: 'realtime' },
  evidence: { enabled: true, frequency: 'realtime' },
  admin: { enabled: false, frequency: 'weekly' },
  whatsnew: { enabled: true, frequency: 'weekly' },
};

export const DEFAULT_NOTIFICATION_PREFERENCES = (): NotificationPreferences => ({
  categories: {
    advocacy: true,
    wellness: true,
    resources: true,
    community: false,
    system: false,
    evidence: true,
    admin: false,
    whatsnew: true,
  },
  categoryFrequencies: { ...DEFAULT_CATEGORY_FREQUENCIES },
  templates: {},
  channels: { push: true, inApp: true },
  defaultFrequency: 'daily',
  lastUpdated: Date.now(),
  version: 2,
});
