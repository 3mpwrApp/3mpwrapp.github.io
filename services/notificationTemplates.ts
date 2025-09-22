export type NotificationTemplateId =
  | 'broadcast.generic'
  | 'petition.signed'
  | 'resource.viewed'
  | 'faq.created';

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
