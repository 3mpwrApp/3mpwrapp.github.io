# Data Governance, Threat Model & Privacy

## Purpose
Define how user data is classified, stored, accessed, retained, and protected to meet privacy-by-design expectations and facilitate future compliance (PIPEDA / GDPR alignment).

## Data Domains
| Domain | Examples | Sensitivity | Storage Layer |
|--------|----------|-------------|---------------|
| Auth | user id, guest flag | Medium | AsyncStorage / SecureStore (future) |
| Jurisdiction Context | selected province | Low | AsyncStorage |
| Resources | static catalog metadata | Low | Bundled / memory |
| Evidence Locker (planned) | documents, notes, images | High | Encrypted local (device) + optional sync (future) |
| AI Coaching | prompts, generated steps | Medium | Ephemeral (not persisted) except activity logs |
| Notifications | delivery records | Low | AsyncStorage |
| Activity / Analytics | event name, timestamp, route | Low | Memory / remote (future) |
| Preferences | notification, a11y toggles, language | Low | AsyncStorage |
| Community (future) | messages, presence | High | Firestore |

## Classification Levels
| Level | Definition | Handling Rules |
|-------|------------|----------------|
| Public | Non-user-specific, safe to expose | No restriction |
| Internal | Generic usage metadata | Pseudonymize user id when exporting |
| Sensitive | Could identify or harm user if leaked | Encrypt at rest, strict access |
| Highly Sensitive | Legal/medical/financial personal artifacts | Local encryption only; explicit consent for sync |

## Storage Principles
- Minimize: store only what is necessary for feature function
- Local-first: default to device storage; cloud sync optional
- Segregate: separate sensitive from low-sensitivity keys
- Encrypt: apply content encryption for evidence (future `crypto.subtle` + key derivation)

## Access Controls (Planned)
| Layer | Mechanism |
|-------|----------|
| App runtime | TypeScript types + context boundaries |
| Sync service (future) | Token-scoped rules per Firestore rules / API gateway |
| Admin tools | Role-based gating + anonymized views |

## Data Flow (High Level)
User Interaction -> UI State -> Domain Store (context) -> Optional Persist (AsyncStorage) -> Derived Events (analytics/notifications) -> Render.
Sensitive flows (evidence) will add: Encryption -> Persist -> Decrypt on access.

## Retention & Pruning
| Data | Retention | Pruning Trigger |
|------|-----------|-----------------|
| Notifications | 100 most recent | FIFO removal |
| Activity events (local) | Session only | App restart |
| Usage buffer | 200 most recent | Manual sweep or auto-cap |
| Temp evidence exports | 7 days | Auto sweep |
| Evidence (future) | User-managed | Manual delete / retention policy (TBD) |
| Coach prompts | Not persisted | N/A |

## Privacy Controls (User Facing)
- Terms & Privacy gate acceptance (existing `TermsGate` / `PrivacyGate`)
- Clear toggle to disable notifications
- Opt-out of analytics mirrors telemetry consent
- Cloud Features toggle gates any remote writes (chat, tokens)
- Data management: Export/Import backup, Clear All Data, Prune Old Cache

## Threat Model (High-level)
- Adversaries:
	- Lost/stolen device with unlocked app
	- Malicious app reading shared storage
	- Network attacker observing traffic
	- Rogue admin on backend (if cloud features enabled)
- Assets:
	- Evidence notes/files, wellness reflections, personal preferences
	- Notification schedule/inbox (low sensitivity)
	- Usage buffer (local-only)
- Trust assumptions:
	- Device OS sandboxing; AsyncStorage scoped per app
	- Transport uses HTTPS/TLS for any cloud calls
	- No third-party SDKs exfiltrating PII by default
- Controls (current):
	- Local-first storage, explicit consent for any cloud use
	- Optional passcode lock and auto-lock timeout
	- No telemetry without consent; analytics disabled natively
	- Evidence queue encrypted at rest (best-effort) and pruned
	- Retention sweep for temp exports and usage buffer
- Gaps and mitigations (roadmap):
	- Encrypt evidence with user-derived key; secure key storage (SecureStore)
	- Per-record end-to-end encryption for any optional sync
	- Harden backup export format with encryption + checksum
	- Expand unit tests for data migrations and retention

## Security Roadmap (Phased)
1. Device security
	 - Enforce strong passcode UX and inactivity lock options
	 - Optional biometric unlock (if available)
2. Storage encryption
	 - Evidence content encryption (Argon2id KDF + AES-GCM)
	 - Encrypt critical keys (device key, notes) with SecureStore
3. Sync hardening (optional features only)
	 - Client-side encrypted blobs; zero-knowledge server
	 - Fine-grained consent: per-feature (chat, tokens)
4. Observability with privacy
	 - Local-first logging; aggregated, non-PII metrics if enabled
	 - Red-team scenarios; add chaos tests for data loss/leak

## Compliance Alignment (Non-regulated baseline)
- GDPR/PIPEDA principles
	- Lawfulness/consent: Explicit toggles for telemetry and cloud features
	- Data minimization: Local-only defaults, narrow schemas, retention caps
	- Integrity/confidentiality: HTTPS, sandboxing, planned encryption-at-rest
	- Access/portability: Export backup, planned per-domain exports
	- Erasure: Clear All Data wipes local keys; planned remote erasure scope if used
- Out of scope (not a medical app): HIPAA/PHIPA; no claim of compliance

## Operational Playbooks
- Incident response: disable cloud features globally via env; communicate in About banner and Notifications
- Backup/restore: user-managed exports only; no server backups of user content
- Key rotation: when encryption lands, support re-encrypt on upgrade
- Future: export evidence & delete account workflow

## Logging & Audit
- Activity events stored locally (extend to remote with hashed user id)
- Admin viewing of sensitive aggregates must avoid row-level exposure

## Data Quality
- Schema version fields for persisted objects (`notifications:prefs:v1`, evidence queue)
- Migration functions on load; maintain test coverage for migration logic

## Security Roadmap
1. Implement evidence encryption key derivation (Argon2id + device salt)
2. Add tamper detection (HMAC or checksum) for evidence metadata
3. Introduce remote sync opt-in with per-record encrypted blobs
4. Add anomaly detection (sudden jurisdiction switches, flood events)

## Compliance Alignment (Future)
| Area | Action |
|------|--------|
| Consent | Explicit opt-in for sync, push notifications |
| Access | User export (JSON + attachments) |
| Erasure | Full wipe of all persisted keys & blobs |
| Data Minimization | Quarterly review of stored keys |

## Open Questions
- Do we log AI prompt content for improvement? (Default: no, count only)
- Do we need per-field encryption (structured)? (Maybe Phase 2)

## Acceptance Criteria (Initial)
- Classification documented for all current domains
- Retention policies stated
- Roadmap items tracked in evidence plan & pruning plan

---
Prepared: 2025-09-22

Updated: 2025-10-10
