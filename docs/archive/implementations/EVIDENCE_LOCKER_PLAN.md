# Evidence Locker Enhancements Plan

## Goals
- Secure, structured storage of user-uploaded evidence (documents, images, audio, notes) with optional encryption.
- Streamlined bulk operations (multi-select, tag, export, delete).
- Intelligent guidance: surface missing evidence types based on jurisdiction `evidenceFocus` and active claims/appeals.
- Offline-first capture queue with background upload & retry.
- Accessibility: keyboard nav, screen reader labels, large text handling, status announcements.

## Current State (Baseline Assumptions)
- Upload queue key: `evidence:uploadQueue:v1` (referenced in earlier context).
- No centralized model file yet (will add a type `EvidenceItem`).
- Activity logging exists for advocacy; locker events not yet instrumented.

## Phased Approach
### Phase 1: Data & Types
- Add `types/evidence.ts`:
  - `EvidenceItem { id, kind, filename, mime, size, createdAt, updatedAt, status, source, tags[], jurisdictionCodes[], hash?, encrypted? }`
  - `EvidenceKind = 'medical_note' | 'imaging' | 'lab' | 'employment_record' | 'accommodation_request' | 'appeal_letter' | 'symptom_log' | 'audio_note' | 'other'`.
- Create `store/evidence.ts` (zustand or context) with:
  - `items`, `pendingUploads`, `addLocal(fileMeta)`, `markUploaded(id, remoteUrl)`, `failUpload(id, reason)`, `remove(id)`, `bulkTag(ids, tag)`.
  - Persistence via AsyncStorage key `evidence:items:v1`.

### Phase 2: Encryption (Optional Toggle)
- Setting flag: `settings.enableEvidenceEncryption`.
- If enabled:
  - Derive symmetric key using PBKDF2 from user passphrase (never sync passphrase).
  - Use `expo-crypto` / WebCrypto `subtle` for AES-GCM.
  - Store: `encrypted: true`, `iv`, and `cipherHex` instead of raw file content.
  - Hash (SHA-256) original for integrity & dedup detection (`hash`).
- Provide helper: `encryptFile(ArrayBuffer) -> { iv, cipher }`, `decryptFile(item) -> Blob/ArrayBuffer`.
- Key rotation plan (future): re-encrypt on passphrase change.

### Phase 3: Upload Pipeline
- Background worker (interval or triggered) scans `pendingUploads`:
  1. If `encrypted`, upload encrypted blob + metadata flags.
  2. PATCH remote record with hash & mime.
  3. On success: move from `pendingUploads` to `items` with remote reference.
- Retry with exponential backoff stored per item (e.g., `retryCount`).
- Network offline detection halts retries (reuse existing `useNetwork`).

### Phase 4: Smart Guidance
- Derive needed evidence types from `jurisdiction.data.evidenceFocus` + active claim stages (future `claims` store).
- Compute a "coverage score": present types / required types.
- Present banner: "Suggested to add: medical note, accommodation request".
- Add quick-action buttons to create template (e.g., open letter builder) when missing.

### Phase 5: Bulk Operations & Tagging UI
- Multi-select mode toggle.
- Actions bar: Tag, Delete, Export (ZIP), Mark Sensitive (encrypt now if not already).
- Tag suggestions (autocomplete from existing tags + jurisdiction evidenceFocus).
- Accessibility: Announce count of selected items and action completion.

### Phase 6: Export & Sharing
- Local ZIP generation (if feasible) or sequential download fallback.
- Redact sensitive metadata (hash, internal IDs) in exported manifest JSON unless user opts in.
- Provide chain-of-custody manifest: list of hashes + timestamps for legal reliability.

### Phase 7: Activity & Analytics
- Add event types: `evidence.add`, `evidence.encrypt`, `evidence.upload.success`, `evidence.upload.fail`, `evidence.delete`, `evidence.export`.
- Aggregate counts per kind for admin metrics (privacy: only counts, no filenames).

### Phase 8: Future Enhancements
- OCR extraction (server-side) with privacy guardrails.
- Automatic classification (LLM) with on-device summarization fallback.
- Duplicate detection via hash map.
- Notification triggers when critical evidence type still missing near a deadline.

## Data Model Details
```ts
interface EvidenceItem {
  id: string;
  kind: EvidenceKind;
  filename: string;
  mime: string;
  size: number; // bytes
  createdAt: number;
  updatedAt: number;
  status: 'local' | 'queued' | 'uploading' | 'uploaded' | 'error';
  source: 'camera' | 'file' | 'audio' | 'generated';
  tags: string[];
  jurisdictionCodes?: string[]; // e.g., ['ON','FED'] if applicable
  remoteUrl?: string;
  hash?: string; // SHA-256 hex
  encrypted?: boolean;
  iv?: string; // base64
  cipherHex?: string; // hex encoded ciphertext
  errorReason?: string;
  retryCount?: number;
}
```

## Storage & Performance
- Lazy decrypt only when user previews.
- Keep metadata in AsyncStorage; large blobs in FileSystem cache.
- Evict temp decrypted files after inactivity (timer cleanup).

## Security Considerations
- Passphrase never stored; if lost, encrypted items unrecoverable (warn user explicitly).
- Avoid logging raw filenames when encrypted flag true.
- Hashing before encryption for consistent dedup detection.

## A11y Considerations
- All buttons have role + label ("Encrypt evidence item", not just icon).
- Progress announced: "Uploading 2 of 5 evidence items".
- Color alone not used for status (add text badges: Queued, Encrypted, Error).

## Open Questions
- Remote API contract for encrypted uploads (needs spec doc).
- Maximum file size & compression strategy.
- On-device audio transcription integration timeline.

## Initial Deliverables (MVP Slice)
1. Types + store with local persistence.
2. Add/import + list UI (no encryption yet).
3. Basic upload queue simulation (local delay) to validate status transitions.
4. Smart guidance placeholder using jurisdiction evidenceFocus (static mock until claims store exists).

## Success Metrics
- Time from capture to uploaded (< 10s median small docs on Wi-Fi).
- User adds at least 3 distinct evidence kinds in a session.
- Zero crashes in encryption/decryption path (tracked via Sentry).

---
Future iterations will create a dedicated `EVIDENCE_LOCKER_API.md` for the server contract.
