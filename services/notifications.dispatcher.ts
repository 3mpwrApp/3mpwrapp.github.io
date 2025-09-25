import { useTranslation } from '../i18n';
import { useNotifications } from '../store/notifications';
import type { DeliveredNotification, NotificationPreferences } from '../types/notifications';

import { ensureNotificationPermission, scheduleLocal } from './notifications';
import { getNotificationTemplate, getTemplatesForEvent } from './notifications.templates';

export interface DispatchOptions {
  force?: boolean;
  now?: Date;
}

// Fallback defaults if user has not configured quiet hours in settings yet
const FALLBACK_QUIET_START = 22;
const FALLBACK_QUIET_END = 7;
const DEFAULT_THROTTLE_SECONDS = 300;

function buildDedupeKey(templateId: string, payload?: any) {
  if (!payload || typeof payload !== 'object') return templateId;
  const keys = Object.keys(payload).sort().slice(0, 3);
  const parts = keys.map(k => `${k}:${JSON.stringify(payload[k])}`);
  return `${templateId}|${parts.join('|')}`;
}

function parseHour(str?: string, fallback?: number) {
  if (!str) return fallback ?? 0;
  const m = /^(\d{1,2}):(\d{2})$/.exec(str.trim());
  if (!m) return fallback ?? 0;
  const h = Math.min(23, Math.max(0, parseInt(m[1],10)));
  return h;
}

function inQuietHours(d: Date, startH: number, endH: number) {
  const h = d.getHours();
  if (startH === endH) return false; // degenerate (disabled style)
  if (startH > endH) {
    return h >= startH || h < endH; // overnight span
  }
  return h >= startH && h < endH;
}

export interface DomainNotificationEvent {
  event: string;
  templateId?: string;
  payload?: Record<string, any>;
}

// Runtime in-memory mirror of lastSent to ensure immediate throttle enforcement between rapid sequential dispatches in the same tick/test.
const runtimeLastSent: Record<string, number> = {};

export function useNotificationDispatcher() {
  const { prefs, lastSent, setLastSent, add } = useNotifications();
  const { t } = useTranslation();

  async function dispatchDomainEvent(evt: DomainNotificationEvent, options: DispatchOptions = {}) {
    const now = options.now ?? new Date();
    const templates = evt.templateId
      ? [getNotificationTemplate(evt.templateId)].filter(Boolean)
      : getTemplatesForEvent(evt.event) || [];

    if (!templates.length) return;

    for (const tpl of templates) {
      if (!tpl) continue;
      const templateId = tpl.id;

      if (!options.force) {
        if (!isTemplateAllowedByPrefs(tpl.category, prefs)) continue;
      }

      const last = runtimeLastSent[templateId] ?? lastSent[templateId];
      const throttleWindow = tpl.throttleSec ?? DEFAULT_THROTTLE_SECONDS;
      if (!options.force && last) {
        const diffSec = (now.getTime() - last) / 1000;
        if (diffSec < throttleWindow) continue;
      }

      const dedupeKey = buildDedupeKey(templateId, evt.payload);

  // Derive quiet hours from settings (if enabled)
  const qEnabled = (prefs as any).quietHoursEnabled !== false; // default enabled
  const qStart = parseHour((prefs as any).quietHoursStart, FALLBACK_QUIET_START);
  const qEnd = parseHour((prefs as any).quietHoursEnd, FALLBACK_QUIET_END);
  const suppressPush = !options.force && qEnabled && inQuietHours(now, qStart, qEnd);
      let scheduledPush = false;
      const allowPush = tpl.channels.push && !suppressPush && prefs.channels.push;
      if (allowPush) {
        try {
          const granted = await ensureNotificationPermission();
          if (granted) {
            const title = t(tpl.i18n.titleKey, tpl.i18n.titleKey, evt.payload as any);
            const body = t(tpl.i18n.bodyKey, tpl.i18n.bodyKey, evt.payload as any);
            const res = await scheduleLocal(title, body);
            if (res) scheduledPush = true;
          }
        } catch {}
      }

      const title = t(tpl.i18n.titleKey, tpl.i18n.titleKey, evt.payload as any);
      const body = t(tpl.i18n.bodyKey, tpl.i18n.bodyKey, evt.payload as any);
      const payloadHash = dedupeKey; // simple stand-in hash
      const delivered: DeliveredNotification = {
        id: `${templateId}:${now.getTime()}`,
        templateId,
        createdAt: now.getTime(),
        read: false,
        title,
        body,
        payloadHash,
        event: evt.event,
        channel: scheduledPush ? 'push' : 'inApp',
      };

  // Record throttle timestamp early (before async permission scheduling) & update state + runtime cache
  runtimeLastSent[templateId] = now.getTime();
  setLastSent(templateId, now.getTime());
  add([delivered]);

  const { trackEvent } = await import('./analyticsClient');
  trackEvent('notification.delivered', {
        templateId,
        templateVersion: tpl.version,
        event: evt.event,
        channel: delivered.channel,
        category: tpl.category,
        quiet: suppressPush,
        throttle: tpl.throttleSec ?? DEFAULT_THROTTLE_SECONDS,
        cat_enabled: Object.entries(prefs.categories).filter(([,v])=>v).length,
        push_enabled: prefs.channels.push,
      });
      if (suppressPush) {
        trackEvent('notification.quiet_suppressed', {
          templateId,
          event: evt.event,
          start_h: qStart,
          end_h: qEnd,
        });
      }
    }
  }

  return { dispatchDomainEvent };
}

function isTemplateAllowedByPrefs(category: string, prefs: NotificationPreferences): boolean {
  return prefs.categories[category as keyof NotificationPreferences['categories']] !== false;
}

export default useNotificationDispatcher;
