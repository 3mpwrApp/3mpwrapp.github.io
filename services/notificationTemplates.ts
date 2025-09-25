export type NotificationTemplateId =
  | 'broadcast.generic'
  | 'petition.signed'
  | 'resource.viewed'
  | 'faq.created'
  // Wellness / mood
  | 'mood.nudge.evening'
  | 'mood.streak.milestone'
  // Evidence locker / reminders
  | 'evidence.reminder.daily'
  | 'evidence.upload.failed'
  // Accountability / advocacy
  | 'accountability.case.created'
  | 'accountability.case.updated'
  | 'accountability.deadline.upcoming';

interface TemplateDef {
  id: NotificationTemplateId;
  titleKey: string; // i18n key
  bodyKey?: string; // i18n key
  // list of variable placeholders supported in body/title, e.g. ['name','count']
  vars?: string[];
  importance?: 'info' | 'warn' | 'critical';
}

const templates: TemplateDef[] = [
  { id: 'broadcast.generic', titleKey: 'notify.broadcast.title', bodyKey: 'notify.broadcast.body', vars: ['title','body'], importance: 'info' },
  { id: 'petition.signed', titleKey: 'notify.petition.signed.title', bodyKey: 'notify.petition.signed.body', vars: ['petition'], importance: 'info' },
  { id: 'resource.viewed', titleKey: 'notify.resource.viewed.title', bodyKey: 'notify.resource.viewed.body', vars: ['resource'], importance: 'info' },
  { id: 'faq.created', titleKey: 'notify.faq.created.title', bodyKey: 'notify.faq.created.body', vars: ['question'], importance: 'info' },
  // Mood / wellness
  { id: 'mood.nudge.evening', titleKey: 'notify.mood.nudge.evening.title', bodyKey: 'notify.mood.nudge.evening.body', vars: ['streak'], importance: 'info' },
  { id: 'mood.streak.milestone', titleKey: 'notify.mood.streak.milestone.title', bodyKey: 'notify.mood.streak.milestone.body', vars: ['streak'], importance: 'info' },
  // Evidence reminders
  { id: 'evidence.reminder.daily', titleKey: 'notify.evidence.reminder.daily.title', bodyKey: 'notify.evidence.reminder.daily.body', vars: ['count'], importance: 'info' },
  { id: 'evidence.upload.failed', titleKey: 'notify.evidence.upload.failed.title', bodyKey: 'notify.evidence.upload.failed.body', vars: ['queued'], importance: 'warn' },
  // Accountability
  { id: 'accountability.case.created', titleKey: 'notify.accountability.case.created.title', bodyKey: 'notify.accountability.case.created.body', vars: ['case'], importance: 'info' },
  { id: 'accountability.case.updated', titleKey: 'notify.accountability.case.updated.title', bodyKey: 'notify.accountability.case.updated.body', vars: ['case'], importance: 'info' },
  { id: 'accountability.deadline.upcoming', titleKey: 'notify.accountability.deadline.upcoming.title', bodyKey: 'notify.accountability.deadline.upcoming.body', vars: ['case','days'], importance: 'warn' },
];

export function listTemplates() { return templates; }
export function getTemplate(id: NotificationTemplateId) { return templates.find(t=>t.id===id) || null; }

export function renderTemplate(id: NotificationTemplateId, t: (k:string, def?:string)=>string, vars: Record<string,string> = {}) {
  const tpl = getTemplate(id); if(!tpl) return { title: id, body: '' };
  const sub = (s: string) => s.replace(/\{(\w+)\}/g, (_,v)=> vars[v] ?? `{${v}}`);
  const title = sub(t(tpl.titleKey, tpl.titleKey));
  const body = tpl.bodyKey ? sub(t(tpl.bodyKey, tpl.bodyKey)) : '';
  return { title, body, importance: tpl.importance };
}
