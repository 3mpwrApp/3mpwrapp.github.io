# Firebase CLI Commands - Copy & Paste Ready

## ✅ CREATE ALL INDEXES AT ONCE (RECOMMENDED)

```bash
firebase firestore:indexes:create --collection campaigns --field active --field createdAt --direction descending && firebase firestore:indexes:create --collection events_production --field province --field startDate --direction descending && firebase firestore:indexes:create --collection events_preview --field province --field startDate --direction descending && firebase firestore:indexes:create --collection threads --field channel --field createdAt --direction descending
```

**Single line (copy-paste as one command):**
```
firebase firestore:indexes:create --collection campaigns --field active --field createdAt --direction descending && firebase firestore:indexes:create --collection events_production --field province --field startDate --direction descending && firebase firestore:indexes:create --collection events_preview --field province --field startDate --direction descending && firebase firestore:indexes:create --collection threads --field channel --field createdAt --direction descending
```

---

## 🔄 CREATE INDIVIDUAL INDEXES

### Campaign Index (Active + CreatedAt)
```bash
firebase firestore:indexes:create --collection campaigns --field active --field createdAt --direction descending
```

### Events Production Index (Province + StartDate)
```bash
firebase firestore:indexes:create --collection events_production --field province --field startDate --direction descending
```

### Events Preview Index (Province + StartDate)
```bash
firebase firestore:indexes:create --collection events_preview --field province --field startDate --direction descending
```

### Community Threads Index (Channel + CreatedAt)
```bash
firebase firestore:indexes:create --collection threads --field channel --field createdAt --direction descending
```

---

## 📋 VERIFICATION & MONITORING

### List all indexes and their status
```bash
firebase firestore:indexes:list
```

### Monitor specific database
```bash
firebase firestore:indexes:list --database=(default)
```

### Check index creation status (if you know the index ID)
```bash
firebase firestore:indexes:describe <INDEX_ID>
```

---

## 🗑️ DELETE AN INDEX (IF NEEDED)

```bash
firebase firestore:indexes:delete --index=<INDEX_ID>
```

---

## 🔧 DEPLOY FIRESTORE RULES (AFTER INDEXES ARE CREATED)

Once indexes are "Enabled" in Firebase Console, deploy rules:
```bash
npm run rules:deploy
```

Or manually:
```bash
firebase deploy --only firestore:rules
```

---

## 🔐 LOGIN & PROJECT SETUP

If not already authenticated:
```bash
firebase login
```

Set active Firebase project:
```bash
firebase use <PROJECT_ID>
```

Check current project:
```bash
firebase projects:list
```

---

## ⏱️ WHAT TO EXPECT

1. **Run commands** - Takes ~10 seconds
2. **Indexes created** - Shows "Index created successfully"
3. **Status building** - Takes 5-10 minutes to become "Enabled"
4. **Monitor progress** - Run `firebase firestore:indexes:list` to check

---

## 🐛 TROUBLESHOOTING

### Error: "Permission denied"
- Solution: Run `firebase login` first
- Or check Firebase Console permissions

### Error: "Invalid project ID"
- Solution: Set project with `firebase use <PROJECT_ID>`
- Or check `.firebaserc` file

### Index not appearing
- Solution: Wait 5-10 minutes and run list command again
- Or check Firebase Console: Firestore > Indexes

### "No matching index found" at runtime
- Solution: Verify index is "Enabled" in Firebase Console
- New indexes take time to propagate

---

## 📊 MONITOR FIRESTORE COSTS

After indexes are created, monitor query costs:

```bash
# View usage stats (in Firebase Console)
# Go to: Firestore > Usage > Read/Write/Delete operations
```

Expected improvement:
- ✅ Before: High read count (duplicates, no pagination)
- ✅ After: 40-60% reduction with pagination + caching

---

## 🎯 QUICK REFERENCE

| Command | Purpose |
|---------|---------|
| `firebase firestore:indexes:list` | Check all indexes |
| `firebase firestore:indexes:create ...` | Create new index |
| `firebase firestore:indexes:describe <ID>` | Check index status |
| `firebase firestore:indexes:delete <ID>` | Delete index |
| `npm run rules:deploy` | Deploy security rules |
| `firebase login` | Login to Firebase |
| `firebase use <PROJECT>` | Switch project |

---

## ✅ FINAL CHECKLIST

- [ ] Authenticate with Firebase: `firebase login`
- [ ] Set project: `firebase use <YOUR_PROJECT_ID>`
- [ ] Run all index commands (copy-paste batch command above)
- [ ] Verify indexes: `firebase firestore:indexes:list`
- [ ] Wait for "Enabled" status (5-10 minutes)
- [ ] Deploy rules: `npm run rules:deploy` (optional, rules are already updated)
- [ ] Update code with new hooks
- [ ] Test in app: Run `getListenerStats()` to verify cleanup
- [ ] Deploy to production

---

## 📝 REFERENCE

- Firebase CLI Docs: https://firebase.google.com/docs/cli
- Firestore Indexes: https://firebase.google.com/docs/firestore/query-data/indexing
- Composite Indexes: https://firebase.google.com/docs/firestore/query-data/index-overview
