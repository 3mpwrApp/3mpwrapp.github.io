# Firestore Event Deduplication

## Overview

This script identifies and removes duplicate events from Firestore based on normalized title + date + location.

## Prerequisites

You need a Firebase Admin SDK service account JSON file. This is **different** from `google-services.json` (which is for Android clients).

### Get Your Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `empowrapp`
3. Click Settings (⚙️) → Project Settings
4. Navigate to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. Save it as `service-account.json` in the project root (it's gitignored)

## Usage

### Dry Run (Recommended First)

Check for duplicates without making changes:

```bash
# Check production collection
node scripts/firestore-dedupe-events.mjs --dry-run --env=production

# Check preview collection
node scripts/firestore-dedupe-events.mjs --dry-run --env=preview
```

### Live Run (Actually Delete Duplicates)

**⚠️ WARNING**: This will permanently delete duplicate events from Firestore!

```bash
# Set service account path
$env:GOOGLE_APPLICATION_CREDENTIALS="service-account.json"

# Run dedupe on production
node scripts/firestore-dedupe-events.mjs --env=production

# Or on preview
node scripts/firestore-dedupe-events.mjs --env=preview
```

The script will:
1. Fetch all events from the specified collection
2. Group by normalized title + date (YYYY-MM-DD) + location
3. Keep the event with the most complete data (most fields, longest description)
4. Delete all other duplicates in each group
5. Wait 5 seconds before deletion (press Ctrl+C to cancel)

## How Deduplication Works

### Grouping Key

Events are considered duplicates if they match on:
- **Title**: Case-insensitive, whitespace normalized
  - Example: "World  Braille  Day" === "world braille day"
- **Date**: YYYY-MM-DD format (ignores time)
  - Example: "2025-01-04T00:00:00Z" === "2025-01-04T12:30:00Z"
- **Location**: Case-insensitive, whitespace normalized
  - Example: "Canada  " === "canada"

### Canonical Selection

When duplicates are found, the script keeps the event with:
1. Most populated fields (non-null, non-empty values)
2. Longest description
3. Lexicographically first document ID (tie-breaker)

All other duplicates in the group are deleted.

## Output Example

```
═══════════════════════════════════════════════════════════════
🔧 Firestore Event Deduplication Script
═══════════════════════════════════════════════════════════════

Environment: production
Collection: events_production
Mode: 🔍 DRY RUN (no changes)

✓ Loaded credentials from: service-account.json
✓ Connected to Firestore

📥 Fetching events from Firestore...

✓ Fetched 44 events

🔍 Analyzing for duplicates...

⚠️  Found 3 duplicate group(s):

─────────────────────────────────────────────────────────────────
📌 Duplicate Group (2 instances):
   Title: World Braille Day
   Date: 2025-01-04
   Location: Canada

   ✓ Keeping: J3x25vvZjj7RhWiedREb
     Fields: 12
     Description length: 78 chars

   ✗ Deleting: C6pf6823eHWc8zCrgpCS
     Fields: 11
     Description length: 42 chars

─────────────────────────────────────────────────────────────────

📊 Summary:
   Total events: 44
   Duplicate groups: 3
   Events to delete: 9
   Events after cleanup: 35

🔍 DRY RUN MODE - No changes made to Firestore.
   Run without --dry-run to apply these changes.
```

## Safety Features

- **Dry run by default**: Add `--dry-run` flag to preview changes
- **5-second countdown**: Press Ctrl+C to cancel before deletion
- **Batch operations**: Uses Firestore batch writes for safety
- **Detailed logging**: Shows exactly what will be kept/deleted
- **Service account required**: Prevents accidental runs without proper auth

## After Cleanup

1. **Redeploy Cloudflare Worker** to clear cache:
   ```bash
   npx wrangler deploy --config server/wrangler.toml
   ```

2. **Update static fallback**:
   ```powershell
   $obj = (Invoke-WebRequest -Uri 'https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events?limit=1000' -UseBasicParsing).Content | ConvertFrom-Json
   $obj.events | ConvertTo-Json -Depth 10 | Out-File -FilePath public\api\events.json -Encoding utf8
   ```

3. **Verify results**:
   ```bash
   # Check event count
   node scripts/firestore-dedupe-events.mjs --dry-run --env=production
   
   # Should show: "No duplicates found!"
   ```

## Troubleshooting

### "Service account object must contain project_id"

You're using the wrong JSON file. Make sure you downloaded the **Service Account Key** from Firebase Console, not `google-services.json` (which is for Android).

### "GOOGLE_APPLICATION_CREDENTIALS not set"

Either:
- Set environment variable: `$env:GOOGLE_APPLICATION_CREDENTIALS="service-account.json"`
- Or place `google-services.json` in project root (but use proper service account JSON)

### "Permission denied"

Your service account needs Firestore read/write permissions. Check Firebase Console → IAM & Admin.

## Notes

- This script is **idempotent**: safe to run multiple times
- Duplicates are determined by normalized data, not document IDs
- The Worker already dedupes at runtime, but this cleans the source
- Recommended to run on preview first, then production
