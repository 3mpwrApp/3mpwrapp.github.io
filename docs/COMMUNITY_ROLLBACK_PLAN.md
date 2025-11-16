# Community Performance Optimization - Rollback Plan

## Quick Rollback Script

If the community performance optimization causes issues in production, follow these steps to roll back:

### PowerShell Rollback Commands

```powershell
# Navigate to project root
cd d:\1-EmpowrApp\empowrapp-new\empowrapp-new

# Create a backup branch first
git checkout -b rollback-community-optimization-backup
git add .
git commit -m "Backup before rolling back community optimization"

# Revert the key changes
git checkout main

# Option 1: Revert specific commits (if you committed the changes)
# Find the commit hash of the community optimization
git log --oneline --grep="Community" -n 5
# Then revert (replace COMMIT_HASH with actual hash)
# git revert COMMIT_HASH
```

### Manual Rollback Steps

#### 1. app/_layout.tsx
Remove these changes:

**Remove import:**
```typescript
// REMOVE these lines:
import { useCommunity } from "../store/community";
import { channels } from "../data/community";
```

**Remove CommunityProvider wrapper:**
```typescript
// REMOVE this line (around line 156):
<CommunityProvider>

// REMOVE this line (around line 207):
</CommunityProvider>
```

**Remove CommunityPreload component:**
```typescript
// REMOVE these lines (around line 170):
<CommunityPreload />

// REMOVE entire function definition (around line 277):
function CommunityPreload() {
  const { seed } = useCommunity();
  // ... entire function
}
```

#### 2. store/community.tsx
Revert cache key and TTL:

```typescript
// CHANGE:
const KEY = "empowr.community.v2";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// BACK TO:
const KEY = "empowr.community.v1";
// Remove CACHE_TTL_MS constant
```

**Simplify cache loading:**
```typescript
// REPLACE the complex useEffect with cache checking:
React.useEffect(() => {
  (async () => {
    if (!AsyncStorage) return;
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) setState(JSON.parse(raw));
    flushQueue();
  })();
}, []);
```

**Remove lastUpdated from State type:**
```typescript
// CHANGE:
type State = {
  channels: CommunityChannel[];
  threads: CommunityThread[];
  comments: CommunityComment[];
  lastUpdated?: number;
};

// BACK TO:
type State = {
  channels: CommunityChannel[];
  threads: CommunityThread[];
  comments: CommunityComment[];
};
```

**Remove lastUpdated from DEFAULT_STATE:**
```typescript
// CHANGE:
const DEFAULT_STATE: State = { channels: [], threads: [], comments: [], lastUpdated: 0 };

// BACK TO:
const DEFAULT_STATE: State = { channels: [], threads: [], comments: [] };
```

**Remove lastUpdated from setState calls** (5 locations):
- Line ~98: Firestore threads snapshot
- Line ~110: Firestore comments snapshot  
- Line ~195: seed function
- Line ~220: createThread
- Line ~235: addComment

#### 3. data/community.ts
Restore full channel list:

**Replace channels array with full 23 channels:**
```typescript
export const channels: CommunityChannel[] = [
  // All 13 provinces/territories
  { id: "ch_on", type: "province", slug: "on", title: "Ontario" },
  { id: "ch_qc", type: "province", slug: "qc", title: "Québec" },
  { id: "ch_bc", type: "province", slug: "bc", title: "British Columbia" },
  { id: "ch_ab", type: "province", slug: "ab", title: "Alberta" },
  { id: "ch_mb", type: "province", slug: "mb", title: "Manitoba" },
  { id: "ch_sk", type: "province", slug: "sk", title: "Saskatchewan" },
  { id: "ch_ns", type: "province", slug: "ns", title: "Nova Scotia" },
  { id: "ch_nb", type: "province", slug: "nb", title: "New Brunswick" },
  { id: "ch_nl", type: "province", slug: "nl", title: "Newfoundland and Labrador" },
  { id: "ch_pe", type: "province", slug: "pe", title: "Prince Edward Island" },
  { id: "ch_nt", type: "province", slug: "nt", title: "Northwest Territories" },
  { id: "ch_yt", type: "province", slug: "yt", title: "Yukon" },
  { id: "ch_nu", type: "province", slug: "nu", title: "Nunavut" },

  // All 10 topics
  { id: "ch_topic_benefits", type: "topic", slug: "topic-benefits", title: "Benefits" },
  { id: "ch_topic_workplace", type: "topic", slug: "topic-workplace", title: "Workplace" },
  { id: "ch_topic_education", type: "topic", slug: "topic-education", title: "Education" },
  { id: "ch_topic_health", type: "topic", slug: "topic-health", title: "Health" },
  { id: "ch_topic_legal", type: "topic", slug: "topic-legal", title: "Legal" },
  { id: "ch_topic_housing", type: "topic", slug: "topic-housing", title: "Housing" },
  { id: "ch_topic_transport", type: "topic", slug: "topic-transport", title: "Transportation" },
  { id: "ch_topic_family", type: "topic", slug: "topic-family", title: "Family" },
  { id: "ch_topic_mental", type: "topic", slug: "topic-mental", title: "Mental Health" },
  { id: "ch_topic_ask", type: "topic", slug: "topic-ask-advocate", title: "Ask an Advocate" },
];
```

**Remove additionalChannels export:**
```typescript
// REMOVE entire export:
export const additionalChannels: CommunityChannel[] = [ ... ];
```

**Restore seed data:**
```typescript
export const seedThreads: CommunityThread[] = [
  {
    id: "t1",
    channelId: "ch_on",
    title: "WSIB help in Toronto?",
    author: "Alex",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "t2",
    channelId: "ch_topic_workplace",
    title: "Accommodation tips",
    author: "Sam",
    createdAt: Date.now() - 7200000,
  },
];

export const seedComments: CommunityComment[] = [
  {
    id: "c1",
    threadId: "t1",
    author: "Priya",
    content: "Community clinic on Dundas can assist.",
    createdAt: Date.now() - 86000000,
  },
  {
    id: "c2",
    threadId: "t2",
    author: null,
    content: "Talk to HR early; document everything.",
    createdAt: Date.now() - 7100000,
  },
];
```

#### 4. Delete new test file (optional)
```powershell
Remove-Item __tests__\community.preload.test.tsx
```

#### 5. Delete documentation (optional)
```powershell
Remove-Item COMMUNITY_PERFORMANCE_OPTIMIZATION.md
Remove-Item COMMUNITY_ROLLBACK_PLAN.md
```

### Verification Steps

After rollback:

1. **Clear app data:**
   ```powershell
   # For Android
   adb shell pm clear com.yourapp.packagename
   
   # For iOS (reset simulator)
   xcrun simctl erase all
   ```

2. **Clear AsyncStorage key manually:**
   The app may have cached data with v2 key. Clear it programmatically or via dev tools.

3. **Run tests:**
   ```powershell
   npm test
   ```

4. **Run lint:**
   ```powershell
   npm run lint
   ```

5. **Build and test:**
   ```powershell
   npx expo start --clear
   ```

6. **Verify Community tab:**
   - Navigate to Community
   - Verify all 23 channels load
   - Check that threads and comments appear
   - Confirm no console errors

### Quick Test Checklist

- [ ] App starts without errors
- [ ] Community tab loads (may be slower)
- [ ] All 23 channels visible
- [ ] Can navigate to province channels
- [ ] Can navigate to topic channels
- [ ] Can create new threads
- [ ] Can add comments
- [ ] Offline mode works
- [ ] No console errors
- [ ] Tests pass
- [ ] Lint passes

### Emergency Hotfix

If you need to deploy immediately without full rollback:

**Quick disable pre-loading only:**

In `app/_layout.tsx`, comment out the CommunityPreload call:
```typescript
{/* <CommunityPreload /> */}
```

This disables pre-loading but keeps other optimizations (cache versioning, lazy loading infrastructure).

### Restore from Git

If you have a clean commit history:

```powershell
# Find the commit before optimization
git log --oneline -n 20

# Reset to that commit (replace COMMIT_HASH)
git reset --hard COMMIT_HASH

# Force push if already deployed (use with caution!)
# git push origin main --force
```

### Support

If issues persist after rollback:
1. Check console logs for AsyncStorage errors
2. Verify Firestore connection
3. Test with fresh app install
4. Clear all caches (npm, metro, expo)

```powershell
npm run metro:clear
npx expo start --clear
```

---

**Last Updated:** October 25, 2025
**Optimization Commit:** TBD (fill in after committing)
**Contact:** Development team
