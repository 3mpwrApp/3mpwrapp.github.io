# Admin Audit System

Purpose: Record privileged, admin-only actions for accountability and export.

Collection

- Firestore collection: `admin_audit`
- Document shape (`types/adminAudit.ts`):
  - id: string (doc id when fetched)
  - ts: number (epoch ms)
  - actorUid: string | null (admin UID when available)
  - action: string (e.g., `faq.create`, `faq.update`, `broadcast.send`)
  - target: string | null (resource id/path)
  - details: object | null (small, non-sensitive payload; avoid PII)
  - client: { platform?: string; version?: string } | null

Client APIs

- `writeAdminAudit(evt)`: Best-effort write; safe no-op if Firebase is not initialized (tests/web).
- `subscribeAdminAudit(cb, { limit })`: Live subscription ordered by `ts` desc.
- `listAdminAudit({ limit })`: One-shot fetch for export (defaults to 1000).

Where its used

- Admin Panel (`app/(tabs)/admin/index.tsx`):
  - Shows latest audit entries (top card)
  - Export CSV button for up to 1000 recent entries

Export format

- CSV columns: `ts, actorUid, action, target, details, client_platform, client_version`
- Timestamps use ISO UTC in CSV for easy import into spreadsheets.
- File path: Expo cache directory; share sheet invoked when available.

Data minimization

- Do not store raw PII (e.g., full names, emails) in `details`.
- Prefer stable identifiers (UIDs, document ids) in `target`.
- Keep `details` short: keys like `count`, `reason`, `fromStatus`, `toStatus`.

Retention guidance

- Recommended: 90 days rolling retention (enforced server-side by rules/cron) unless policy requires longer.
- For incidents, export to JSON/CSV and store securely per incident response process.

Rules & Access

- Only admins should be allowed to write/read `admin_audit`.
- Enforce in `firebase/firestore.rules` with a custom admin claim.

Testing notes

- Client write is a no-op when Firebase is not initialized; unit tests should not depend on writes.
- Admin Panel uses subscription + mock Firestore in tests.

Future

- Add filters in Admin Panel (by action, date range).
- Add JSON export.
- Optional server-side export-to-cloud storage with encryption at rest.
