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
  [E.AI_COMMAND_CENTER_USED]: { mode: { type: 'string', required: true }, jurisdiction: { type: 'string', required: true } },
  [E.QUICK_LOG_USED]: { type: { type: 'string', required: true } },
  [E.ERROR_DISPLAYED]: { code: { type: 'string', required: true }, message: { type: 'string', sensitive: true, classification: 'other' }, originalError: { type: 'string', sensitive: true, classification: 'other' } },
  [E.EVENTS_SUBMIT_TO_3MPWR]: { id: { type: 'string', required: true } },
  [E.CAMPAIGN_SUBMIT_TO_3MPWR]: { id: { type: 'string', required: true } },
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

  // Beta analytics events
  [E.BETA_SESSION_START]: {},
  [E.BETA_SESSION_END]: { duration: { type: 'number' } },
  [E.BETA_FEEDBACK_BANNER_SHOWN]: {},
  [E.BETA_FEEDBACK_BANNER_DISMISSED]: {},
  [E.BETA_FEEDBACK_INITIATED]: { source: { type: 'string' } },
  [E.BETA_DISCORD_OPENED]: {},
  [E.BETA_NPS_SURVEY_SHOWN]: {},
  [E.BETA_NPS_SCORE_SELECTED]: { score: { type: 'number' } },
  [E.BETA_NPS_SURVEY_COMPLETED]: { score: { type: 'number' }, feedback: { type: 'string', sensitive: true, classification: 'pii' } },
  [E.BETA_NPS_SURVEY_DISMISSED]: {},
  [E.BETA_DONATION_BUTTON_SHOWN]: {},
  [E.BETA_DONATION_BUTTON_PRESSED]: {},
  [E.BETA_QUICK_ONBOARDING_STARTED]: {},
  [E.BETA_QUICK_ONBOARDING_COMPLETED]: {},
  [E.BETA_FEATURE_FIRST_USE]: { feature: { type: 'string' } },
  [E.BETA_TAB_VISIT]: { tab: { type: 'string' } },
  [E.BETA_COMPLEXITY_MODE_CHANGED]: { mode: { type: 'string' } },
  [E.BETA_ERROR_ENCOUNTERED]: { error: { type: 'string' }, screen: { type: 'string' } },
  [E.BETA_CRASH_RECOVERED]: {},
  [E.BETA_ACCESSIBILITY_FEATURE_ENABLED]: { feature: { type: 'string' } },
  [E.BETA_TOOL_USAGE]: { tool: { type: 'string' } },
  [E.BETA_SESSION_DURATION]: { duration: { type: 'number' } },

  // New events added for analytics coverage
  [E.ADAPTIVE_CAPACITY_OPEN]: {},
  [E.ADAPTIVE_MICRO_START]: {},
  [E.AI_ASSISTANT_QUESTION_ASKED]: { question: { type: 'string', sensitive: true, classification: 'pii' } },
  [E.AI_TRANSLATOR_QUICK_TRANSLATE]: {},
  [E.ALLIES_RESOURCE_VIEW]: { resourceId: { type: 'string' } },
  [E.ALLIES_TYPE_SELECT]: { type: { type: 'string' } },
  [E.BETA_DONATION_BUTTON_DISMISSED]: {},
  [E.BETA_DONATION_PLATFORM_SELECTED]: { platform: { type: 'string' } },
  [E.BETA_ONBOARDING_QUICK_DISCLAIMERS_ACCEPTED]: {},
  [E.BETA_ONBOARDING_QUICK_MODE_SELECTED]: { mode: { type: 'string' } },
  [E.BETA_DISCORD_OPENED_V2]: {},
  [E.BETA_FEEDBACK_BANNER_DISMISSED_V2]: {},
  [E.BETA_FEEDBACK_INITIATED_V2]: {},
  [E.BODY_AREA_VIEW]: { area: { type: 'string' } },
  [E.BODY_COGNITIVE_OPEN]: {},
  [E.BODY_TOOL_OPEN]: { tool: { type: 'string' } },
  [E.BODY_TRACKER_OPEN]: {},
  // Onboarding funnel events
  [E.ONBOARDING_APP_FIRST_OPENED]: { sessionId: { type: 'string', required: true }, timestamp: { type: 'string', required: true } },
  [E.ONBOARDING_FIRST_VALUE_ACTION]: {
    sessionId: { type: 'string', required: true },
    timestamp: { type: 'string', required: true },
    actionType: { type: 'string', required: true },
    timeToValueMs: { type: 'number' },
  },
  [E.ONBOARDING_LEGAL_BANNER_SHOWN]: {
    sessionId: { type: 'string', required: true },
    timestamp: { type: 'string', required: true },
    timeSinceValueMs: { type: 'number' },
  },
  [E.ONBOARDING_LEGAL_TERMS_ACCEPTED]: {
    sessionId: { type: 'string', required: true },
    timestamp: { type: 'string', required: true },
    timeToAcceptMs: { type: 'number' },
  },
  [E.ONBOARDING_LEGAL_BANNER_DISMISSED]: {
    sessionId: { type: 'string', required: true },
    timestamp: { type: 'string', required: true },
    timeToDismissMs: { type: 'number' },
  },
  [E.ONBOARDING_CONVERSION_COMPLETED]: {
    sessionId: { type: 'string', required: true },
    timestamp: { type: 'string', required: true },
    totalTimeMs: { type: 'number' },
    valueActionType: { type: 'string', required: true },
  },
  [E.CHRONIC_CONDITION_ADD]: { condition: { type: 'string' } },
  [E.CHRONIC_CONDITION_SELECT]: { condition: { type: 'string' } },
  [E.CHRONIC_TOOL_OPEN]: { tool: { type: 'string' } },
  [E.CLAIMS_TOOL_OPEN]: { tool: { type: 'string' } },
  [E.CLAIMS_TYPE_SELECT]: { type: { type: 'string' } },
  [E.COACH_LESSON_START]: { lesson: { type: 'string' } },
  [E.COACH_MODULE_OPEN]: { module: { type: 'string' } },
  [E.DEADLINES_ADD]: {},
  [E.DEADLINES_OPEN]: {},
  [E.DENIAL_ANALYZE_START]: {},
  [E.DENIAL_REASON_VIEW]: { reason: { type: 'string' } },
  [E.DOCTOR_APPT_VIEW]: {},
  [E.DOCTOR_PREP_TOOL]: {},
  [E.DOCUMENT_TEMPLATE_SELECTED]: { template: { type: 'string' } },
  [E.EMERGENCY_CONTACT_FIND]: {},
  [E.EMERGENCY_RESOURCE_OPEN]: { resource: { type: 'string' } },
  [E.ENERGY_UPDATED]: { value: { type: 'number' } },
  [E.ENVIRONMENT_FACTOR_OPEN]: { factor: { type: 'string' } },
  [E.ENVIRONMENT_SENSORY_OPEN]: {},
  [E.EVIDENCE_ADD]: {},
  [E.EVIDENCE_CHECKLIST_TOGGLE]: { item: { type: 'string' } },
  [E.EVIDENCE_FILE_OPEN]: {},
  [E.EVIDENCE_TIMELINE_ADD]: {},
  [E.EVIDENCE_TIMELINE_EVENT]: { event: { type: 'string' } },
  [E.EVIDENCE_VOICE_PLAY]: {},
  [E.EVIDENCE_VOICE_TOGGLE]: {},
  [E.LEGAL_ACTION]: { action: { type: 'string' } },
  [E.LEGAL_AUTOMATION_TOOL]: { tool: { type: 'string' } },
  [E.LEGAL_CASE_OPEN]: {},
  [E.LEGAL_COACH_ACTION]: { action: { type: 'string', required: true } },
  [E.LEGAL_COACH_SCRIPT]: { script: { type: 'string', required: true } },
  [E.LEGAL_TRACK_ACTION]: { action: { type: 'string', required: true } },
  [E.LEGAL_TRACK_CASE_OPEN]: { id: { type: 'string', required: true } },
  [E.LEGAL_JAAS_SERVICE]: { service: { type: 'string' } },
  [E.LEGAL_MATCH_VIEW]: {},
  [E.LEGAL_RESOURCE]: { resource: { type: 'string' } },
  [E.MASTER_CASE_OPEN]: {},
  [E.MEDS_TOGGLE]: { enabled: { type: 'boolean' } },
  [E.MOOD_LOGGED]: { mood: { type: 'string' } },
  [E.MOVEMENT_CATEGORY_SELECT]: { category: { type: 'string' } },
  [E.MOVEMENT_EXERCISE_START]: { exercise: { type: 'string' } },
  [E.MYTHS_CATEGORY_BROWSE]: { category: { type: 'string' } },
  [E.NPS_SCORE_SELECTED]: { score: { type: 'number' } },
  [E.NPS_SURVEY_COMPLETED]: { score: { type: 'number' } },
  [E.NPS_SURVEY_DISMISSED]: {},
  [E.NPS_SURVEY_MANUAL_TRIGGER]: {},
  [E.NPS_SURVEY_SHOWN]: {},
  [E.NUTRITION_GUIDE_OPEN]: { guide: { type: 'string' } },
  [E.NUTRITION_HARM_OPEN]: {},
  [E.POLICY_ACTION]: { action: { type: 'string' } },
  [E.POLICY_AREA]: { area: { type: 'string' } },
  [E.RATINGS_ADD_START]: {},
  [E.RATINGS_CATEGORY_SELECT]: { category: { type: 'string' } },
  [E.RATINGS_REVIEW_VIEW]: {},
  [E.RECOVERY_TOOL_OPEN]: { tool: { type: 'string' } },
  [E.REHAB_GAME_START]: { game: { type: 'string' } },
  [E.REHAB_PROGRAM_OPEN]: { program: { type: 'string' } },
  [E.REHAB_PROGRAM_START]: { program: { type: 'string' } },
  [E.RIGHTS_CATEGORY_BROWSE]: { category: { type: 'string' } },
  [E.RIGHTS_FEATURED_VIEW]: {},
  [E.RTW_RESOURCE_OPEN]: { resource: { type: 'string' } },
  [E.RTW_STAGE_OPEN]: { stage: { type: 'string' } },
  [E.SELFCARE_CHECKLIST_TOGGLE]: { item: { type: 'string' } },
  [E.SELFCARE_LIBRARY_OPEN]: {},
  [E.SUPPORT_CATEGORY_SELECT]: { category: { type: 'string' } },
  [E.SUPPORT_RESOURCE_VIEW]: { resource: { type: 'string' } },
  [E.SYMPTOMS_INDIVIDUAL_OPEN]: { symptom: { type: 'string' } },
  [E.SYMPTOMS_QUICK_SEVERITY]: { severity: { type: 'number' } },
  [E.TECH_CATEGORY_BROWSE]: { category: { type: 'string' } },
  [E.TECH_TOOL_FEATURED]: { tool: { type: 'string' } },
  [E.TOOLS_ADVANCED_OPEN]: { tool: { type: 'string' } },
  [E.TOOLS_POWER_OPEN]: { tool: { type: 'string' } },
  [E.WORLD_CAMPAIGN_VIEW]: { campaign: { type: 'string' } },
  [E.WORLD_MAP_OPEN]: {},
  [E.WORLD_REGION_SELECT]: { region: { type: 'string' } },
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
