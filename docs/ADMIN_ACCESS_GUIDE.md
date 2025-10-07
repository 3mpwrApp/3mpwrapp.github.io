# Admin Access Guide

This app uses a Firebase custom claim `admin=true` to gate admin-only features both in the client and in Firestore security rules.

## Granting Admin
1. Ensure you have a Firebase service account JSON available locally.
2. Set env `GOOGLE_APPLICATION_CREDENTIALS` or place the file at `firebase/serviceAccount.json`.
3. Run:
   - `npm run admin:set -- <your-uid>`
4. In the app (Settings → Admin), tap "Refresh admin status".

## Revoking Admin
- `npm run admin:set -- <uid> false`

## Client Guarding
- Wrap admin-only screens/components with `components/AdminGuard.tsx`.
- Settings tab shows an Admin section only if `isAdmin` is true.

## Firestore Rules
- See `firebase/firestore.rules`.
- Admin-only writes on: `/admin/*`, moderation deletes, FAQs, campaign rooms, etc.

## Operational Tips
- Keep the list of admins small and rotate credentials.
- Use `npm run admin:users` to audit current users.
- Use `npm run admin:export` to export collections for offline review.

## Future (Optional)
- Add audit log for admin actions (Firestore collection `admin_audit` with retention).
- Add in-app Admin Metrics screen (counts, last activity) gated by AdminGuard.
