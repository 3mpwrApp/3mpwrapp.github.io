# Admin Documentation

## Overview

The 3mpwr App includes comprehensive admin functionality for managing users, content, and platform operations. Admin access is controlled via Firebase custom claims and protected by the `AdminGuard` component.

## Table of Contents

- [Admin Setup](#admin-setup)
- [Admin Panel Features](#admin-panel-features)
- [Admin Scripts](#admin-scripts)
- [BYOC Mode Limitations](#byoc-mode-limitations)
- [Security & Permissions](#security--permissions)
- [Troubleshooting](#troubleshooting)

---

## Admin Setup

### Prerequisites

- Firebase project configured
- Firebase Admin SDK installed (`firebase-admin` package)
- Service account JSON for Firebase Admin SDK

### Getting Service Account JSON

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `firebase/serviceAccount.json` (or any location)
4. **Never commit this file to version control** (already in `.gitignore`)

### Granting Admin Access

#### Method 1: Using npm script (Recommended)

```bash
# Grant admin access
npm run admin:set -- <user-uid>

# Revoke admin access
npm run admin:set -- <user-uid> false
```

#### Method 2: Using Firebase Admin SDK directly

```javascript
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(require('./firebase/serviceAccount.json'))
});

await admin.auth().setCustomUserClaims(uid, { admin: true });
```

### Refreshing Admin Status in App

After granting admin access:

1. Open the app
2. Navigate to **Settings**
3. Scroll to **Admin** section
4. Tap **"Refresh admin status"**
5. The **"Admin Panel"** button should now appear

---

## Admin Panel Features

Access the admin panel via **Settings → Admin Panel** (only visible to admin users).

### Dashboard Metrics

- **User Count**: Total registered users
- **Campaign Count**: Total active campaigns
- **Resource Count**: Total resources in database
- **Activity Metrics**: Real-time event tracking (last 24h and total)

### Admin Audit Log

- View all admin actions with timestamps
- Filter by action type
- Export audit logs
- Includes: actor UID, action type, target resource, details

### Activity Feed

- Live stream of app events
- Event types: logins, registrations, feature usage, broadcasts
- Filterable by event type
- Last 24 hours vs all-time stats

### Broadcast Announcements

Send platform-wide announcements to all users:

1. Enter broadcast title (required)
2. Add optional body text
3. Click "Send" to broadcast to all users
4. Appears in user notifications/activity feed

### FAQ Editor

- Create, edit, and delete FAQs
- Localization support (per-language FAQs)
- Tags for categorization
- Real-time updates across all clients

### User Management

#### User Lookup
- Search users by email
- View user profile (UID, email, display name, status)
- Quick actions:
  - **Ban/Unban**: Disable user account
  - **Verify/Unverify**: Mark account as verified

#### User List
- Load users in batches (20 at a time)
- Pagination controls
- Sort by email, name, or ID
- Filter by verified status or banned status

### Moderation Tools

#### Content Flags
- View all flagged content
- Flag types: mutual aid posts, ratings, comments
- Actions:
  - **Resolve**: Mark flag as reviewed (keeps content)
  - **Delete Item**: Remove flagged content and resolve flag
- Bulk operations:
  - Select multiple flags
  - Resolve selected
  - Delete selected items

#### Content Review Panel
- Review pending content
- Approve or reject user submissions
- Multi-stage approval workflow

---

## Admin Scripts

All admin scripts require the Firebase service account JSON. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable or place the file at `firebase/serviceAccount.json`.

### Available Scripts

#### 1. Set Admin Claim

```bash
# Grant admin to user
npm run admin:set -- <uid>

# Revoke admin from user
npm run admin:set -- <uid> false
```

**Usage Example:**
```bash
npm run admin:set -- abc123xyz true
```

#### 2. List Users

Export all Firebase Auth users to JSON or CSV.

```bash
# Export as JSON (default)
npm run admin:users

# Export as CSV
npm run admin:users -- --format csv

# Save to file
npm run admin:users -- --format csv > users.csv
```

**Output Fields:**
- UID
- Email
- Display Name
- Email Verified
- Creation Date
- Last Sign In
- Provider Data

#### 3. Send FCM Notifications

Send Firebase Cloud Messaging notifications to users or topics.

```bash
# Send to specific token
npm run admin:fcm -- --token <fcm-token> --title "Hello" --body "Test message"

# Send to topic
npm run admin:fcm -- --topic all_users --title "Announcement" --body "New feature released!"

# With data payload
npm run admin:fcm -- --token <token> --title "Alert" --body "Message" --data '{"type":"campaign","id":"123"}'
```

**Options:**
- `--token <token>`: Send to specific device
- `--topic <topic>`: Send to all subscribers of topic
- `--title <title>`: Notification title
- `--body <body>`: Notification body
- `--data <json>`: Additional data payload

#### 4. Export Firestore Collection

Export any Firestore collection to JSON.

```bash
# Export entire collection
npm run admin:export -- --collection users

# Export with limit
npm run admin:export -- --collection campaigns --limit 100

# Save to file
npm run admin:export -- --collection resources > resources.json

# Pretty print
npm run admin:export -- --collection users --pretty
```

**Options:**
- `--collection <name>`: Collection to export (required)
- `--limit <number>`: Max documents to export
- `--pretty`: Format JSON with indentation
- `--orderBy <field>`: Sort by field
- `--where <field> <op> <value>`: Filter results

---

## BYOC Mode Limitations

When running in **Hybrid BYOC** or **Strict BYOC** mode, admin functionality is limited because Firestore is disabled.

### Available in BYOC Mode:
- ✅ Activity metrics (local events only)
- ✅ Broadcast announcements (via local activity log)
- ✅ Admin audit log (if using alternative storage)

### Unavailable in BYOC Mode:
- ❌ User lookup and management (requires Firestore)
- ❌ Content moderation (flags stored in Firestore)
- ❌ FAQ editor (FAQs stored in Firestore)
- ❌ User/campaign/resource counts
- ❌ Firestore-based features

### BYOC Mode Indicator

When in BYOC mode, the admin panel displays a warning banner:

```
⚠️ BYOC Mode Active
Admin features requiring Firestore are disabled in Hybrid/Strict BYOC mode.
Only activity logs and broadcast tools are available.
Switch to default mode for full admin access.
```

### Switching Modes

To enable full admin features:

1. Change `.env`: Remove `EXPO_PUBLIC_DATA_POLICY` or set to `default`
2. Restart dev server
3. Firestore-dependent admin features will be enabled

---

## Security & Permissions

### Firebase Admin Custom Claim

Admin access is controlled via the `admin` custom claim in Firebase Auth:

```javascript
// User token includes:
{
  "admin": true,
  "uid": "abc123",
  "email": "admin@example.com"
}
```

### Firestore Security Rules

Admin-only collections are protected in `firebase/firestore.rules`:

```javascript
// Admin audit log
match /admin_audit/{doc} {
  allow read, write: if request.auth != null && request.auth.token.admin == true;
}

// User management
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && (
    request.auth.uid == userId ||
    request.auth.token.admin == true
  );
}
```

### AdminGuard Component

All admin screens are wrapped with `<AdminGuard>`:

```tsx
<AdminGuard>
  <AdminPanel />
</AdminGuard>
```

**AdminGuard Props:**
- `children`: Content to show if user is admin
- `redirectTo`: Redirect non-admin users to this route
- `fallback`: Custom UI for non-admin users
- `silent`: If true, render nothing for non-admin (no message)

**Behavior:**
- Shows loading state while checking auth
- Redirects or shows fallback if user is not admin
- Renders children only if `isAdmin === true`

### Route Protection

Admin routes are hidden from navigation:

```tsx
// app/(tabs)/_layout.tsx
<Tabs.Screen name="admin" options={{ href: null }} />
```

Admin panel is only accessible via:
- Direct navigation: `router.push('/(tabs)/admin')`
- Settings link (only visible to admin users)

---

## Troubleshooting

### "Admin Only" Message When Accessing Admin Panel

**Cause:** User doesn't have `admin: true` custom claim.

**Solution:**
1. Run `npm run admin:set -- <your-uid>` to grant admin
2. In app: Settings → Admin → "Refresh admin status"
3. Check Firebase Console → Authentication → Users → Select user → Custom claims

### "Service account JSON not found" Error

**Cause:** Admin scripts can't find Firebase service account credentials.

**Solution:**
1. Download service account JSON from Firebase Console
2. Either:
   - Place at `firebase/serviceAccount.json`
   - Set `GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json`

### Admin Panel Shows BYOC Warning

**Cause:** App is running in Hybrid or Strict BYOC mode.

**Solution:**
- If you need full admin features, switch to default mode
- Remove `EXPO_PUBLIC_DATA_POLICY` from `.env`
- Or set `EXPO_PUBLIC_DATA_POLICY=default`
- Restart dev server

### User Counts Show "-" Instead of Numbers

**Possible Causes:**
1. BYOC mode is active
2. Firestore rules deny access
3. Collections don't exist yet

**Solution:**
1. Check `.env` for BYOC mode
2. Verify Firestore rules allow admin read access
3. Create at least one document in each collection to initialize

### Admin Scripts Return "Permission Denied"

**Cause:** Service account doesn't have necessary permissions.

**Solution:**
1. Verify service account is from correct Firebase project
2. Check Firebase Console → IAM & Admin → Service Accounts
3. Ensure service account has "Firebase Admin SDK Administrator" role

### Cannot Send Broadcasts

**Cause:** Activity log service not initialized or Firestore unavailable.

**Solution:**
1. Check if `services/activity.ts` is working
2. Verify Firestore connection
3. Check browser console for errors
4. Ensure user has admin claim

---

## Best Practices

### Admin Access Management

1. **Minimize Admin Users**: Only grant admin to trusted individuals
2. **Use Audit Logs**: Review admin actions regularly
3. **Rotate Service Accounts**: Regenerate service account JSON periodically
4. **Monitor Custom Claims**: Track who has admin access via Firebase Console

### Content Moderation

1. **Review Flags Promptly**: Check moderation queue daily
2. **Document Decisions**: Add notes when resolving flags
3. **Consistent Policies**: Apply content policies uniformly
4. **Appeal Process**: Have a process for users to appeal moderation decisions

### Data Management

1. **Regular Exports**: Backup critical data regularly
2. **Test Scripts**: Test admin scripts in staging before production
3. **Pagination**: Use pagination for large datasets
4. **Rate Limiting**: Be mindful of Firebase quotas when bulk operations

### Security

1. **Never Commit Secrets**: Keep service account JSON out of version control
2. **Limit Admin Functions**: Don't expose admin features to client unless necessary
3. **Audit Trail**: All admin actions should be logged to `admin_audit` collection
4. **Two-Factor Auth**: Enable 2FA for admin accounts

---

## Related Documentation

- [Security Overview](./SECURITY_COMPLETE.md)
- [Data Policy & BYOC](./BYOC_POLICY.md)
- [Hybrid BYOC Mode](./HYBRID_BYOC_MODE.md)
- [Firebase Rules](../firebase/firestore.rules)
- [Admin Scripts](../scripts/)

---

## Support

For admin-related questions or issues:

1. Check this documentation first
2. Review Firebase Console logs
3. Check `services/adminAudit.ts` for audit trail
4. See [CONTRIBUTING.md](./CONTRIBUTING.md) for bug reports

---

**Last Updated:** December 12, 2025
**Version:** 1.0.0
