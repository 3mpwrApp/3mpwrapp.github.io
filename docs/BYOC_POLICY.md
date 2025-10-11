---
title: Bring Your Own Cloud (BYOC) — Strict Mode
description: 100% user‑owned storage — technical architecture and verification
lastUpdated: 2025-10-10
---

# BYOC Strict Mode

Goal: Ensure user data belongs 100% to the user. The app and servers do not store or retain user data; all persistence happens only on the user’s own connected storage (e.g., WebDAV/Nextcloud).

## How it works

- App flag: Set EXPO_PUBLIC_DATA_POLICY=strict_byoc
- Runtime guard: services/dataPolicy.ts exports isStrictBYOC(). When true:
  - firebase/config.ts exports null auth/db/storage and never initializes Firebase.
  - services/firestore.ts returns null DB; all writes become no‑ops.
  - services/storageProviders.ts routes all saves/loads to the user’s BYOC provider if configured; otherwise Ephemeral provider (no persistence).
  - Settings → Privacy shows a BYOC section to connect a WebDAV endpoint (session‑only credentials) and test connectivity.

## Storage providers

- WebDAV (user‑owned): PUT/GET/DELETE to user endpoint using Basic Auth (optional). Credentials are session‑only, never persisted.
- Ephemeral (fallback): returns success without storing. Used when strict mode is on but no BYOC is configured.

## Permissions & privacy controls

- No app/server writes: Firebase and any app‑owned storage are not initialized in strict mode.
- BYOC credentials: Not saved to AsyncStorage; exist only in memory for the session.
- Connect/Test/Clear: Users can test their endpoint and clear the session in Settings.

## Verify technically

1) Build with EXPO_PUBLIC_DATA_POLICY=strict_byoc
2) Inspect runtime:
   - require('firebase/config').db === null
   - Any function in services/firestore.ts returns false/[] via getDB() === null
3) Attempt community/campaign writes: they no‑op.
4) Evidence Locker (and any save path) calls getActiveStorage(): ensure provider id is 'webdav' after connecting, or 'ephemeral' otherwise.
5) Network logs: confirm only calls to the BYOC endpoint appear when saving, nothing to Firebase.

## Threats & mitigations

- Accidental cloud init: Guarded centrally by isStrictBYOC().
- Credential leakage: Session‑only, no persistence. Avoid logging.
- Transport: Encourage HTTPS endpoints; reject http in production builds.
- Denial of service: Ephemeral fallback prevents data loss if endpoint unavailable.

## Migration notes

- Screens using Firestore must handle null DB (already returned by getDB()).
- Future: add user‑selectable providers (S3 compatible, Web3 storage) via the same interface.
