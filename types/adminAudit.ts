// Admin Audit Log types
// Records privileged actions performed by administrators for accountability.

export const ADMIN_AUDIT_COLLECTION = 'admin_audit';

export interface AdminAuditEvent {
  id?: string; // Firestore doc id when fetched
  ts: number; // epoch ms
  actorUid: string | null; // admin user who performed the action (if available)
  action: string; // e.g., 'faq.create', 'faq.update', 'broadcast.send'
  target?: string | null; // optional resource id or path
  details?: Record<string, any> | null; // small, non-sensitive payload; avoid PII
  client?: {
    platform?: string;
    version?: string;
  } | null;
}
