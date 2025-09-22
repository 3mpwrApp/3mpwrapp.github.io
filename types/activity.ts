export const ACTIVITY_COLLECTION = 'activity_events';

// Core event types; extend conservatively to keep feed coherent.
export type ActivityEventType =
  | 'bookmark.add'
  | 'bookmark.remove'
  | 'petition.sign'
  | 'resource.view'
  | 'broadcast'
  | 'admin.note'
  | 'feature.use'
  | 'a11y.toggle'
  | 'error.report'
  | 'faq.create'
  | 'faq.update'
  | 'faq.delete';

export interface BaseActivityEvent<T extends ActivityEventType = ActivityEventType, P = any> {
  id?: string; // Firestore doc id when fetched
  type: T;
  ts: number; // epoch ms
  userId?: string; // optional (system events/broadcast may omit)
  payload?: P; // structured data (resourceId, petitionId, etc.)
  // Denormalized / convenience fields for feed rendering (optional)
  summaryKey?: string; // i18n key for summary line
  metadata?: Record<string, any>;
}

// Convenience discriminated examples
export interface BookmarkAddEvent extends BaseActivityEvent<'bookmark.add',{ targetId: string; category?: string; }> {}
export interface BookmarkRemoveEvent extends BaseActivityEvent<'bookmark.remove',{ targetId: string; }> {}
export interface PetitionSignEvent extends BaseActivityEvent<'petition.sign',{ petitionId: string; }> {}
export interface ResourceViewEvent extends BaseActivityEvent<'resource.view',{ resourceId: string; category?: string; }> {}
export interface BroadcastEvent extends BaseActivityEvent<'broadcast',{ title: string; body?: string; importance?: 'info'|'warn'|'critical'; }> {}
export interface A11yToggleEvent extends BaseActivityEvent<'a11y.toggle',{ feature: string; enabled: boolean; }> {}
export interface FaqCreateEvent extends BaseActivityEvent<'faq.create',{ id: string; q: string; }> {}
export interface FaqUpdateEvent extends BaseActivityEvent<'faq.update',{ id: string; q?: string; a?: string; }> {}
export interface FaqDeleteEvent extends BaseActivityEvent<'faq.delete',{ id: string; }> {}

export type AnyActivityEvent =
  | BookmarkAddEvent
  | BookmarkRemoveEvent
  | PetitionSignEvent
  | ResourceViewEvent
  | BroadcastEvent
  | A11yToggleEvent
  | FaqCreateEvent
  | FaqUpdateEvent
  | FaqDeleteEvent
  | BaseActivityEvent; // fallback
