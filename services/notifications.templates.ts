import type { NotificationTemplate } from "../types/notifications";

// Initial template registry. Additional templates can be appended here.
// NOTE: i18n keys must exist (add stubs in en/common.json subsequently).

const templates: NotificationTemplate[] = [
  {
    id: "coach-result-ready",
    version: 1,
    category: "advocacy",
    event: "coach.generate.completed",
    channels: { inApp: true, push: true },
    priority: "normal",
    throttleSec: 120,
    i18n: { titleKey: "notify.coach.result.title", bodyKey: "notify.coach.result.body" },
    personalization: { fields: ["jurisdictionName", "coachTopic"] },
    dedupe: "event",
  },
  {
    id: "evidence-reminder-weekly",
    version: 1,
    category: "evidence",
    event: "evidence.checkin.cron",
    channels: { inApp: true, push: true },
    priority: "low",
    throttleSec: 3600, // at most once an hour if cron misfires
    i18n: { titleKey: "notify.evidence.reminder.title", bodyKey: "notify.evidence.reminder.body" },
    personalization: { fields: ["evidenceFocusCount"] },
    dedupe: "template",
  },
  {
    id: "resource-bookmark-confirm",
    version: 1,
    category: "resources",
    event: "resource.bookmark.add",
    channels: { inApp: true, push: false },
    priority: "low",
    throttleSec: 30,
    i18n: { titleKey: "notify.resource.bookmark.title", bodyKey: "notify.resource.bookmark.body" },
    personalization: { fields: ["resourceTitle"] },
    dedupe: "event",
  },
  {
    id: "system-changelog",
    version: 1,
    category: "system",
    event: "system.release.notes",
    channels: { inApp: true, push: true },
    priority: "normal",
    throttleSec: 600,
    i18n: { titleKey: "notify.system.changelog.title", bodyKey: "notify.system.changelog.body" },
    dedupe: "template",
  },
  {
    id: "coach-inactivity-reminder",
    version: 1,
    category: "advocacy",
    event: "coach.reminder",
    channels: { inApp: true, push: true },
    priority: "low",
    throttleSec: 3600, // avoid spamming
    i18n: { titleKey: "notify.coach.reminder.title", bodyKey: "notify.coach.reminder.body" },
    personalization: { fields: ["idleHours"] },
    dedupe: "event",
  },
  {
    id: "community-comment-added",
    version: 1,
    category: "community",
    event: "community.comment.added",
    channels: { inApp: true, push: true },
    priority: "normal",
    throttleSec: 60,
    i18n: { titleKey: "notify.community.comment.title", bodyKey: "notify.community.comment.body" },
    personalization: { fields: ["threadTitle", "snippet"] },
    dedupe: "event",
  },
];

// Build index (event -> templateIds)
const index: Record<string, string[]> = templates.reduce((acc, t) => {
  (acc[t.event] ||= []).push(t.id);
  return acc;
}, {} as Record<string, string[]>);

export function listNotificationTemplates(): NotificationTemplate[] {
  return templates.slice();
}

export function getNotificationTemplate(id: string): NotificationTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesForEvent(event: string): NotificationTemplate[] {
  const ids = index[event] || [];
  return ids.map((id) => getNotificationTemplate(id)!).filter(Boolean);
}
