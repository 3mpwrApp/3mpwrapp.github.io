// Parameter schemas for analytics events. Each event maps to a dictionary of parameter specs.
import { ANALYTICS_EVENTS } from './analyticsEvents';
// These are used for runtime dev validation and optional redaction of sensitive fields.

export type ParamType = 'string' | 'number' | 'boolean';
export interface ParamSpec {
  type: ParamType;
  required?: boolean; // If true, warn when missing.
  sensitive?: boolean; // If true, value is redacted before emission.
  classification?: 'pii' | 'secret' | 'token' | 'other';
}
export type EventSchema = Record<string, ParamSpec>;

// Raw names for convenience
const E = ANALYTICS_EVENTS;

export const ANALYTICS_EVENT_SCHEMAS: Record<string, EventSchema> = {
  [E.CAMPAIGN_CREATE]: { id: { type: 'string', required: true } },
  [E.CAMPAIGN_JOIN]:   { id: { type: 'string', required: true } },
  [E.CAMPAIGN_LEAVE]:  { id: { type: 'string', required: true } },
  [E.CAMPAIGN_SHARE]:  { id: { type: 'string', required: true } },
  [E.ADVOCACY_COLLECTIVE_SUBMIT]: { type: { type: 'string', required: true } },
  [E.ADVOCACY_ASK_SUBMITTED]: { channelId: { type: 'string', required: true } },
  [E.ADVOCACY_WORLD_VIEW]: { kind: { type: 'string', required: true } },
  [E.ADVOCACY_FINDER_SEARCH]: {
    query: { type: 'string' },
    issue: { type: 'string' },
    province: { type: 'string' },
    proBono: { type: 'boolean' },
    savedOnly: { type: 'boolean' },
    mode: { type: 'string' },
    total: { type: 'number' },
  },
  [E.ADVOCACY_FINDER_OPEN_WEBSITE]: { id: { type: 'string', required: true } },
  [E.ADVOCACY_FINDER_EMAIL]: { id: { type: 'string', required: true } },
  [E.ADVOCACY_FINDER_OPEN_MAP]: { id: { type: 'string', required: true } },
  [E.ADVOCACY_FINDER_SAVE_TOGGLE]: { id: { type: 'string', required: true }, next: { type: 'boolean', required: true } },

  [E.BOOKMARK_ADD]: { route: { type: 'string', required: true }, has_tKey: { type: 'boolean' } },
  [E.BOOKMARK_REMOVE]: { route: { type: 'string', required: true } },
  [E.BOOKMARK_CLEAR_ALL]: { count: { type: 'number', required: true } },

  [E.TRACKER_ADD_ENTRY]: { kind: { type: 'string', required: true } },
  [E.TRACKER_SHARE]: { kind: { type: 'string', required: true } },

  [E.LETTER_INSERT_FROM_TRACKERS]: { type: { type: 'string', required: true } },

  [E.PODCAST_SHARE]: { id: { type: 'string', required: true } },

  [E.ACCOUNT_DELETE]: { method: { type: 'string', required: true } },
  [E.ACCOUNT_DELETE_FAILED]: { code: { type: 'string', required: true }, message: { type: 'string', sensitive: true, classification: 'secret' } },

  [E.ENERGY_SET_DAILY]: { value: { type: 'number', required: true } },
  [E.ENERGY_SPEND]: { label: { type: 'string', required: true }, cost: { type: 'number', required: true } },
  [E.ENERGY_RESET_DAY]: {},

  [E.WELLNESS_OPPOSITE_NEXT_STEP]: { step: { type: 'number', required: true } },

  [E.NOTIFICATION_DELIVERED]: {
    templateId: { type: 'string', required: true },
    templateVersion: { type: 'number', required: true },
    event: { type: 'string', required: true },
    channel: { type: 'string', required: true },
    category: { type: 'string', required: true },
    quiet: { type: 'boolean' },
    throttle: { type: 'number' },
    cat_enabled: { type: 'number' },
    push_enabled: { type: 'boolean' },
  },
  [E.NOTIFICATION_QUIET_SUPPRESSED]: {
    templateId: { type: 'string', required: true },
    event: { type: 'string', required: true },
    start_h: { type: 'number', required: true },
    end_h: { type: 'number', required: true },
  },
  [E.ASSISTANT_QUICK_PROMPT]: { label: { type: 'string', required: true } },
  [E.ASSISTANT_RECENTS_CLEAR]: { count: { type: 'number', required: true } },
  // Assistant Hub search UI
  [E.ASSISTANT_SEARCH_OPEN]: {
    q: { type: 'string', sensitive: true, classification: 'pii' },
    target: { type: 'string' },
  },
  [E.EVENTS_EXPORT_ICS]: { id: { type: 'string', required: true } },
  [E.EVENTS_EXPORT_CSV]: { id: { type: 'string', required: true } },
  [E.EVENTS_SUBSCRIBE_CALENDAR]: { source: { type: 'string' } },
  [E.EVENTS_CREATE]: { id: { type: 'string', required: true }, synced: { type: 'boolean', required: true } },
  [E.EVENTS_DELETE]: { id: { type: 'string', required: true }, synced: { type: 'boolean', required: true } },
  [E.EVENTS_SHARE]: { id: { type: 'string', required: true } },
  [E.EVENTS_ADD_TO_CALENDAR]: { id: { type: 'string', required: true } },
  [E.EVIDENCE_EXPORT_ENCRYPTED]: { count: { type: 'number', required: true } },
  [E.EVIDENCE_IMPORT_ENCRYPTED]: { count: { type: 'number', required: true } },
  [E.EVIDENCE_SAVE_SINGLE]: { hasFiles: { type: 'boolean', required: true } },
  [E.EVIDENCE_SAVE_BULK]: { notes: { type: 'number', required: true }, files: { type: 'number', required: true } },
  [E.EVIDENCE_QUEUE_ENQUEUED]: { count: { type: 'number', required: true } },
  [E.EVIDENCE_QUEUE_PROCESSED]: { total: { type: 'number', required: true } },
  [E.JURISDICTION_CHANGED]: { jurisdiction: { type: 'string', required: true } },
  [E.JURISDICTION_DEADLINE_CALCULATED]: { type: { type: 'string', required: true }, daysRemaining: { type: 'number', required: true } },
  [E.JURISDICTION_FORM_HELPER_USED]: { situationType: { type: 'string', required: true } },
  [E.ASSISTANT_DISABILITY_WIZARD_CTA]: { step: { type: 'string', required: true } },
  [E.LETTER_WIZARD_INSERT_TRACKERS]: { letterType: { type: 'string', required: true } },
  [E.LETTER_WIZARD_SAVE]: { letterType: { type: 'string', required: true }, isUpdate: { type: 'boolean', required: true } },
  [E.LETTER_WIZARD_LOAD]: { letterType: { type: 'string', required: true } },
  [E.LETTER_WIZARD_DELETE]: {},
};

export interface ValidationResult {
  sanitized: Record<string, any> | undefined;
  warnings: string[];
}

export function validateAndRedactEvent(name: string, params?: Record<string, any>): ValidationResult {
  if (!params) return { sanitized: params, warnings: [] };
  const schema = ANALYTICS_EVENT_SCHEMAS[name];
  if (!schema) {
    return { sanitized: { ...params }, warnings: [`No schema for event ${name}`] };
  }
  const warnings: string[] = [];
  const sanitized: Record<string, any> = {};

  // Check required & type
  for (const [key, spec] of Object.entries(schema)) {
    const v = (params as any)[key];
    if (v == null) {
      if (spec.required) warnings.push(`Missing required param '${key}' for event '${name}'`);
      continue;
    }
    if (typeof v !== spec.type) {
      warnings.push(`Param '${key}' for event '${name}' expected type ${spec.type} but got ${typeof v}`);
      continue;
    }
    sanitized[key] = spec.sensitive ? '[redacted]' : v;
  }

  // Warn on unknown keys
  for (const key of Object.keys(params)) {
    if (!schema[key]) warnings.push(`Unexpected param '${key}' on event '${name}'`);
    else if (!(key in sanitized)) {
      // Was type mismatch; skip copying original
    }
  }
  return { sanitized: Object.keys(sanitized).length ? sanitized : undefined, warnings };
}

// Utility to ensure every registry event has a schema (empty allowed)
export function eventsMissingSchemas(): string[] {
  const names = Object.values(ANALYTICS_EVENTS) as string[];
  return names.filter((n: string) => !(n in ANALYTICS_EVENT_SCHEMAS));
}

export function getSensitiveFields(): Record<string,string[]> {
  const map: Record<string,string[]> = {};
  for (const [event, schema] of Object.entries(ANALYTICS_EVENT_SCHEMAS)) {
    const sens = Object.entries(schema).filter(([,v])=>v.sensitive).map(([k])=>k);
    if (sens.length) map[event] = sens;
  }
  return map;
}

// Detailed sensitive metadata (includes classification if present)
export function getSensitiveFieldMeta(): Record<string,{ field: string; classification?: string }[]> {
  const out: Record<string,{ field: string; classification?: string }[]> = {};
  for (const [event, schema] of Object.entries(ANALYTICS_EVENT_SCHEMAS)) {
    const rows = Object.entries(schema)
      .filter(([, spec]) => spec.sensitive)
      .map(([field, spec]) => ({ field, classification: spec.classification }));
    if (rows.length) out[event] = rows;
  }
  return out;
}
