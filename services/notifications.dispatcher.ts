import { useNotifications } from '../store/notifications';
import type { DeliveredNotification, NotificationPreferences } from '../types/notifications';

import { logEvent } from './analytics';
import { ensureNotificationPermission, scheduleLocal } from './notifications';
import { getNotificationTemplate, getTemplatesForEvent } from './notifications.templates';

export interface DispatchOptions {
  force?: boolean;
  now?: Date;
}

const QUIET_HOURS_START = 22;
const QUIET_HOURS_END = 7;
const DEFAULT_THROTTLE_SECONDS = 300;

function buildDedupeKey(templateId: string, payload?: any) {
  if (!payload || typeof payload !== 'object') return templateId;
  const keys = Object.keys(payload).sort().slice(0, 3);
  const parts = keys.map(k => `${k}:${JSON.stringify(payload[k])}`);
  return `${templateId}|${parts.join('|')}`;
}

function inQuietHours(d: Date) {
  const h = d.getHours();
  if (QUIET_HOURS_START > QUIET_HOURS_END) {
    return h >= QUIET_HOURS_START || h < QUIET_HOURS_END;
  }
  return h >= QUIET_HOURS_START && h < QUIET_HOURS_END;
}

export interface DomainNotificationEvent {
  event: string;
  templateId?: string;
  payload?: Record<string, any>;
}

export function useNotificationDispatcher() {
  const { prefs, lastSent, setLastSent, add } = useNotifications();

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

      const last = lastSent[templateId];
      const throttleWindow = tpl.throttleSec ?? DEFAULT_THROTTLE_SECONDS;
      if (!options.force && last) {
        const diffSec = (now.getTime() - last) / 1000;
        if (diffSec < throttleWindow) continue;
      }

      const dedupeKey = buildDedupeKey(templateId, evt.payload);

      const suppressPush = !options.force && inQuietHours(now);
      let scheduledPush = false;
      const allowPush = tpl.channels.push && !suppressPush && prefs.channels.push;
      if (allowPush) {
        try {
          const granted = await ensureNotificationPermission();
          if (granted) {
            const title = tpl.i18n.titleKey; // placeholder until i18n resolution integrated
            const body = tpl.i18n.bodyKey;
            const res = await scheduleLocal(title, body);
            if (res) scheduledPush = true;
          }
        } catch {}
      }

      const title = tpl.i18n.titleKey;
      const body = tpl.i18n.bodyKey;
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

      add([delivered]);
      setLastSent(templateId, now.getTime());

      logEvent?.('notification.delivered', {
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
    }
  }

  return { dispatchDomainEvent };
}

function isTemplateAllowedByPrefs(category: string, prefs: NotificationPreferences): boolean {
  return prefs.categories[category as keyof NotificationPreferences['categories']] !== false;
}

export default useNotificationDispatcher;
