import * as real from '../../services/notificationsTemplates';

// Allow tests to extend the registry with ephemeral templates
let extra: ReturnType<typeof real.listNotificationTemplates> = [];

export function __setTemplates(t: typeof extra) { extra = t; }

export function listNotificationTemplates() {
  return [...real.listNotificationTemplates(), ...extra];
}

export function getNotificationTemplate(id: string) {
  return listNotificationTemplates().find(t => t.id === id);
}

export function getTemplatesForEvent(event: string) {
  return listNotificationTemplates().filter(t => t.event === event);
}
