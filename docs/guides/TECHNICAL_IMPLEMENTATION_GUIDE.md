# 🔧 TECHNICAL IMPLEMENTATION GUIDE: Firebase → Supabase
**Date:** January 9, 2026  
**Audience:** Engineers & DevOps  
**Purpose:** Step-by-step guide for migration execution  

---

## 📑 TABLE OF CONTENTS

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [PostgreSQL Schema Design](#postgresql-schema-design)
3. [Data Migration Scripts](#data-migration-scripts)
4. [Service Layer Refactoring](#service-layer-refactoring)
5. [Component Updates](#component-updates)
6. [Testing Strategy](#testing-strategy)
7. [Deployment & Cutover](#deployment--cutover)
8. [Rollback Procedures](#rollback-procedures)

---

## PRE-MIGRATION CHECKLIST

### 1. Firestore Data Audit

**Document current schema:**
```bash
# Export all Firestore collections
firebase firestore:delete --path collections > firestore_schema.json

# Count documents in each collection
firebase firestore:query collections --all > firestore_counts.json
```

**Collections to export:**
```
├─ users (authentication data)
├─ campaigns (advocacy campaigns)
├─ events (campaign events)
├─ community (chat messages, threads)
├─ evidence (local evidence submissions)
├─ resources (wellness resources, advocacy materials)
├─ wellness (user wellness data)
├─ advocacy (user advocacy history)
├─ analytics (event tracking)
├─ settings (user settings, preferences)
└─ metadata (app configuration, feature flags)
```

### 2. Backup & Safety

```bash
# Full Firestore backup
firebase firestore:backup

# Export to JSON (before migration)
gsutil -m cp -r gs://empowrapp-backup/** ./backups/

# Verify backup integrity
md5sum -c backup_checksums.txt
```

### 3. Environment Setup

```bash
# Create Supabase project
supabase projects create --name empowrapp-migration

# Get connection details
supabase projects show --name empowrapp-migration

# Connection string format:
# postgresql://user:password@db.project.supabase.co:5432/postgres
```

### 4. Pre-Migration Testing

```bash
# Test PostgreSQL connection
psql "postgresql://user:password@db.project.supabase.co:5432/postgres"

# Load initial schema
psql -U postgres -d postgres -f schema.sql

# Test data loading (small sample)
node scripts/migration/migrate-collections.js --dry-run --limit=100
```

---

## POSTGRESQL SCHEMA DESIGN

### 1. Core Tables

#### `users` Table
```sql
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_confirmed_at TIMESTAMP,
  phone TEXT,
  phone_confirmed_at TIMESTAMP,
  encrypted_password TEXT,
  email_change TEXT,
  email_change_token_new TEXT,
  email_change_sent_at TIMESTAMP,
  last_sign_in_at TIMESTAMP,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Index for lookups
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_created_at ON auth.users(created_at DESC);
```

#### `public.users` Table (Custom Data)
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  language TEXT DEFAULT 'en',
  accessibility_prefs JSONB DEFAULT '{}',
  is_admin BOOLEAN DEFAULT FALSE,
  is_moderator BOOLEAN DEFAULT FALSE,
  is_advocate BOOLEAN DEFAULT FALSE,
  notification_settings JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_display_name ON public.users(display_name);
CREATE INDEX idx_users_is_admin ON public.users(is_admin) WHERE is_admin = TRUE;
CREATE INDEX idx_users_is_advocate ON public.users(is_advocate) WHERE is_advocate = TRUE;
```

#### `campaigns` Table
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  image_url TEXT,
  target TEXT NOT NULL, -- Who this campaign targets
  goal_count INTEGER NOT NULL, -- Target number of participants
  progress_count INTEGER DEFAULT 0, -- Current participants
  status TEXT DEFAULT 'active', -- 'active', 'draft', 'completed', 'archived'
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id),
  updated_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_campaigns_progress ON campaigns((progress_count::float / NULLIF(goal_count, 0))) DESC;

-- Full-text search
CREATE INDEX idx_campaigns_search ON campaigns USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(summary, ''))
);
```

#### `events` Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'workshop', 'town-hall', 'training', 'action'
  location TEXT,
  virtual_url TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in-progress', 'completed', 'cancelled'
  max_attendees INTEGER,
  attendee_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_campaign ON events(campaign_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_status ON events(status);
```

#### `evidence_submissions` Table
```sql
CREATE TABLE evidence_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  themes TEXT[] NOT NULL DEFAULT '{}', -- Tags: denial, delay, missing-docs, etc.
  
  -- Insurance/Healthcare Context
  insurance_type TEXT, -- 'private', 'medicaid', 'medicare', 'none'
  insurance_company TEXT,
  denial_reason TEXT, -- 'experimental', 'not-medically-necessary', 'out-of-network'
  
  -- Condition Context
  condition_category TEXT, -- 'chronic', 'mental-health', 'disability', 'rare-disease'
  condition_name TEXT,
  
  -- Timeline Context
  timeline_days INTEGER, -- Days between event and resolution
  is_resolved BOOLEAN DEFAULT FALSE,
  resolution_type TEXT, -- 'approved', 'appealed', 'legal-action', 'accepted-denial'
  
  -- Privacy & Sharing
  is_public BOOLEAN DEFAULT FALSE, -- Can be included in collective patterns?
  is_anonymized BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  attachment_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'published'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for pattern detection
CREATE INDEX idx_evidence_user ON evidence_submissions(user_id);
CREATE INDEX idx_evidence_campaign ON evidence_submissions(campaign_id);
CREATE INDEX idx_evidence_themes ON evidence_submissions USING GIN (themes);
CREATE INDEX idx_evidence_insurance ON evidence_submissions(insurance_type);
CREATE INDEX idx_evidence_condition ON evidence_submissions(condition_category);
CREATE INDEX idx_evidence_denial_reason ON evidence_submissions(denial_reason);
CREATE INDEX idx_evidence_is_public ON evidence_submissions(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_evidence_created_at ON evidence_submissions(created_at DESC);

-- Full-text search
CREATE INDEX idx_evidence_search ON evidence_submissions USING GIN (
  to_tsvector('english', title || ' ' || content)
);
```

#### `collective_evidence_patterns` Table
```sql
CREATE TABLE collective_evidence_patterns (
  id TEXT PRIMARY KEY, -- UUID, unique identifier
  type TEXT NOT NULL, -- 'insurance-denial', 'delay', 'missing-docs'
  title TEXT NOT NULL,
  insight TEXT NOT NULL, -- Human-readable description
  statistic TEXT NOT NULL, -- "95% of users in [region]"
  
  -- Quantitative Data
  user_count INTEGER NOT NULL, -- Actual count (50+ minimum threshold)
  total_submissions INTEGER NOT NULL,
  frequency NUMERIC, -- Percentage of submissions
  denial_rate NUMERIC,
  average_timeline_days NUMERIC,
  
  -- Trending & Severity
  trending TEXT DEFAULT 'stable', -- 'up', 'down', 'stable'
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  score INTEGER NOT NULL, -- 0-100 priority score
  
  -- Demographic Information
  regions TEXT[] NOT NULL DEFAULT '{}',
  conditions TEXT[] NOT NULL DEFAULT '{}',
  insurance_types TEXT[] NOT NULL DEFAULT '{}',
  
  -- Actionability
  solidarity_message TEXT,
  action_label TEXT, -- "Join campaign", "Contact advocate"
  action_link TEXT,
  resources TEXT[] DEFAULT '{}', -- Links to advocacy resources
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  calculated_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL, -- 6 hours from calculation
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_patterns_score ON collective_evidence_patterns(score DESC);
CREATE INDEX idx_patterns_severity ON collective_evidence_patterns(severity);
CREATE INDEX idx_patterns_trending ON collective_evidence_patterns(trending);
CREATE INDEX idx_patterns_expires_at ON collective_evidence_patterns(expires_at);
CREATE INDEX idx_patterns_regions ON collective_evidence_patterns USING GIN (regions);
CREATE INDEX idx_patterns_conditions ON collective_evidence_patterns USING GIN (conditions);
```

### 2. Community Tables

```sql
CREATE TABLE community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE community_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id),
  is_locked BOOLEAN DEFAULT FALSE,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_thread ON community_messages(thread_id);
CREATE INDEX idx_messages_user ON community_messages(user_id);
CREATE INDEX idx_threads_campaign ON community_threads(campaign_id);
CREATE INDEX idx_threads_created_at ON community_threads(created_at DESC);
```

### 3. Row-Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_evidence_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_threads ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update own data
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Everyone can read public campaigns
CREATE POLICY "Public campaigns visible"
  ON campaigns FOR SELECT
  USING (status = 'active' OR auth.uid() = created_by);

-- Users can only see their own evidence
CREATE POLICY "Users can view own evidence"
  ON evidence_submissions FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

-- Everyone can read patterns
CREATE POLICY "Patterns are public"
  ON collective_evidence_patterns FOR SELECT
  USING (true);

-- Users can delete their own evidence (for opt-out)
CREATE POLICY "Users can delete own evidence"
  ON evidence_submissions FOR DELETE
  USING (auth.uid() = user_id);
```

---

## DATA MIGRATION SCRIPTS

### 1. Export Firestore Data

**File:** `scripts/migration/export-firestore.js`

```javascript
const admin = require('firebase-admin');
const fs = require('fs');

admin.initializeApp();
const db = admin.firestore();

async function exportCollection(collectionName) {
  console.log(`Exporting ${collectionName}...`);
  
  const docs = await db.collection(collectionName).get();
  const data = [];
  
  docs.forEach(doc => {
    data.push({
      id: doc.id,
      ...doc.data(),
      _firestore_timestamp: doc.createTime
    });
  });
  
  fs.writeFileSync(
    `./backups/${collectionName}.json`,
    JSON.stringify(data, null, 2)
  );
  
  console.log(`✓ Exported ${data.length} documents from ${collectionName}`);
  return data;
}

async function main() {
  const collections = [
    'users',
    'campaigns',
    'events',
    'evidence_submissions',
    'community_messages',
    'resources',
    'wellness',
    'advocacy'
  ];
  
  for (const collection of collections) {
    try {
      await exportCollection(collection);
    } catch (error) {
      console.error(`✗ Error exporting ${collection}:`, error);
    }
  }
  
  console.log('✓ Export complete!');
}

main();
```

### 2. Transform & Load Data

**File:** `scripts/migration/migrate-data.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function transformAndLoadUsers(firebaseUsers) {
  console.log('Transforming and loading users...');
  
  const users = firebaseUsers.map(doc => ({
    id: doc.id,
    display_name: doc.displayName,
    avatar_url: doc.avatarUrl,
    bio: doc.bio,
    location: doc.location,
    language: doc.language || 'en',
    accessibility_prefs: doc.a11yPrefs || {},
    is_admin: doc.isAdmin || false,
    is_advocate: doc.isAdvocate || false,
    created_at: doc.createdAt?.toISOString(),
    updated_at: doc.updatedAt?.toISOString(),
  }));
  
  // Insert in batches of 1000
  for (let i = 0; i < users.length; i += 1000) {
    const batch = users.slice(i, i + 1000);
    const { error } = await supabase
      .from('users')
      .insert(batch, { returning: 'minimal' });
    
    if (error) {
      console.error('✗ Error loading users batch:', error);
    } else {
      console.log(`✓ Loaded ${batch.length} users`);
    }
  }
}

async function transformAndLoadCampaigns(firebaseCampaigns) {
  console.log('Transforming and loading campaigns...');
  
  const campaigns = firebaseCampaigns.map(doc => ({
    id: doc.id,
    title: doc.title,
    summary: doc.summary,
    target: doc.target,
    goal_count: doc.goalCount,
    progress_count: doc.progressCount || 0,
    status: doc.status || 'active',
    contact_email: doc.contactEmail,
    created_by: doc.createdBy,
    created_at: doc.createdAt?.toISOString(),
    updated_at: doc.updatedAt?.toISOString(),
  }));
  
  for (let i = 0; i < campaigns.length; i += 1000) {
    const batch = campaigns.slice(i, i + 1000);
    const { error } = await supabase
      .from('campaigns')
      .insert(batch, { returning: 'minimal' });
    
    if (error) {
      console.error('✗ Error loading campaigns batch:', error);
    } else {
      console.log(`✓ Loaded ${batch.length} campaigns`);
    }
  }
}

async function main() {
  try {
    // Load exported JSON files
    const users = JSON.parse(fs.readFileSync('./backups/users.json', 'utf8'));
    const campaigns = JSON.parse(fs.readFileSync('./backups/campaigns.json', 'utf8'));
    
    // Transform and load
    await transformAndLoadUsers(users);
    await transformAndLoadCampaigns(campaigns);
    
    console.log('✓ Data migration complete!');
  } catch (error) {
    console.error('✗ Migration failed:', error);
  }
}

main();
```

### 3. Validation Script

```javascript
async function validateMigration() {
  console.log('Validating migration...');
  
  // Get counts from both databases
  const firebaseUsers = await firebase.firestore()
    .collection('users')
    .get();
  
  const { data: postgresUsers, error } = await supabase
    .from('users')
    .select('id');
  
  console.log(`Firebase users: ${firebaseUsers.size}`);
  console.log(`PostgreSQL users: ${postgresUsers.length}`);
  
  if (firebaseUsers.size === postgresUsers.length) {
    console.log('✓ User count matches!');
  } else {
    console.log('✗ User count mismatch!');
  }
  
  // Spot-check: Verify sample records
  const sampleUserId = firebaseUsers.docs[0]?.id;
  const firebaseData = firebaseUsers.docs[0]?.data();
  
  const { data: postgresData } = await supabase
    .from('users')
    .select('*')
    .eq('id', sampleUserId)
    .single();
  
  console.log('Sample Firebase user:', firebaseData);
  console.log('Sample PostgreSQL user:', postgresData);
}
```

---

## SERVICE LAYER REFACTORING

### 1. Create New Supabase Service

**File:** `services/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// User queries
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUser(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Campaign queries
export async function getCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getCampaignById(campaignId: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createCampaign(campaign: any) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert([campaign])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Real-time subscriptions
export function subscribeToCampaigns(callback: (campaigns: any[]) => void) {
  const subscription = supabase
    .from('campaigns')
    .on('*', (payload) => {
      console.log('Campaign update:', payload);
      callback(payload.new || []);
    })
    .subscribe();
  
  // Return unsubscribe function
  return () => subscription.unsubscribe();
}

// Evidence queries
export async function submitEvidence(evidence: any) {
  const { data, error } = await supabase
    .from('evidence_submissions')
    .insert([evidence])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserEvidence(userId: string) {
  const { data, error } = await supabase
    .from('evidence_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Pattern queries (Server-side aggregation - Phase 3)
export async function getCollectivePatterns() {
  const { data, error } = await supabase
    .from('collective_evidence_patterns')
    .select('*')
    .order('score', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data;
}

// Error handling
export function handleSupabaseError(error: any) {
  if (error.code === 'PGRST116') {
    // Not found error
    return new Error('Resource not found');
  }
  
  if (error.code === '23505') {
    // Unique constraint violation
    return new Error('Resource already exists');
  }
  
  if (error.code === '42P01') {
    // Undefined table
    return new Error('Database schema error');
  }
  
  return error;
}
```

### 2. Migration Path (Dual Write)

During transition, implement dual writes:

```typescript
// services/migration/dualWrite.ts

export async function dualWrite(
  operation: 'create' | 'update' | 'delete',
  collection: string,
  data: any
) {
  let firebaseResult, supabaseResult, firebaseError, supabaseError;
  
  // Write to Firebase (current)
  try {
    firebaseResult = await firebaseWrite(operation, collection, data);
  } catch (error) {
    firebaseError = error;
  }
  
  // Write to Supabase (future)
  try {
    supabaseResult = await supabaseWrite(operation, collection, data);
  } catch (error) {
    supabaseError = error;
  }
  
  // Both should succeed
  if (firebaseError || supabaseError) {
    console.warn('Dual write mismatch:', {
      operation,
      collection,
      firebaseError,
      supabaseError
    });
  }
  
  // Return Firebase result (primary source of truth during migration)
  if (firebaseError) throw firebaseError;
  return firebaseResult;
}
```

---

## COMPONENT UPDATES

### 1. Update useEffect Hooks

**Before (Firebase):**
```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'campaigns'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    ),
    (snapshot) => {
      const campaigns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCampaigns(campaigns);
    }
  );
  
  return () => unsubscribe();
}, []);
```

**After (Supabase):**
```typescript
useEffect(() => {
  // Fetch initial data
  async function fetchCampaigns() {
    try {
      const data = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      setCampaigns(data);
    } catch (error) {
      handleError(error);
    }
  }
  
  fetchCampaigns();
  
  // Subscribe to real-time updates
  const subscription = supabase
    .from('campaigns')
    .on('*', (payload) => {
      if (payload.eventType === 'INSERT') {
        setCampaigns(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setCampaigns(prev => 
          prev.map(c => c.id === payload.new.id ? payload.new : c)
        );
      } else if (payload.eventType === 'DELETE') {
        setCampaigns(prev => prev.filter(c => c.id !== payload.old.id));
      }
    })
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 2. Update Data Mutations

**Before (Firebase):**
```typescript
async function updateCampaign(campaignId: string, updates: any) {
  await updateDoc(doc(db, 'campaigns', campaignId), updates);
}
```

**After (Supabase):**
```typescript
async function updateCampaign(campaignId: string, updates: any) {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

---

## TESTING STRATEGY

### 1. Unit Tests

```typescript
// services/__tests__/supabase.test.ts

describe('Supabase Service', () => {
  describe('getCampaigns', () => {
    it('should fetch active campaigns', async () => {
      const campaigns = await getCampaigns();
      expect(campaigns).toBeDefined();
      expect(Array.isArray(campaigns)).toBe(true);
      expect(campaigns.every(c => c.status === 'active')).toBe(true);
    });
    
    it('should handle database errors', async () => {
      // Mock database error
      jest.spyOn(supabase, 'from').mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              data: null,
              error: { code: 'CONNECTION_ERROR' }
            })
          })
        })
      }));
      
      await expect(getCampaigns()).rejects.toThrow();
    });
  });
  
  describe('updateCampaign', () => {
    it('should update campaign', async () => {
      const campaign = await updateCampaign('test-id', {
        title: 'Updated'
      });
      expect(campaign.title).toBe('Updated');
    });
  });
});
```

### 2. Integration Tests

```typescript
// __tests__/integration/campaigns.test.ts

describe('Campaign Integration', () => {
  it('should create and retrieve campaign', async () => {
    const campaign = await createCampaign({
      title: 'Test Campaign',
      target: 'Healthcare Reform',
      goalCount: 100
    });
    
    const retrieved = await getCampaignById(campaign.id);
    expect(retrieved.id).toBe(campaign.id);
    expect(retrieved.title).toBe('Test Campaign');
  });
  
  it('should update campaign and see changes in real-time', (done) => {
    let updateReceived = false;
    
    const unsubscribe = subscribeToCampaigns((campaigns) => {
      if (updateReceived) {
        expect(campaigns.length).toBeGreaterThan(0);
        unsubscribe();
        done();
      }
    });
    
    updateCampaign('test-id', { title: 'Updated' });
    updateReceived = true;
  });
});
```

### 3. Migration Validation Tests

```typescript
// scripts/migration/__tests__/validate.test.ts

describe('Migration Validation', () => {
  it('should have matching user counts', async () => {
    const firebaseCount = await countFirebaseUsers();
    const postgresCount = await countPostgresUsers();
    expect(postgresCount).toBe(firebaseCount);
  });
  
  it('should have matching campaign data', async () => {
    const firebaseCampaigns = await getFirebaseCampaigns();
    const postgresCampaigns = await getPostgresCampaigns();
    
    firebaseCampaigns.forEach(fbCampaign => {
      const pgCampaign = postgresCampaigns.find(c => c.id === fbCampaign.id);
      expect(pgCampaign).toBeDefined();
      expect(pgCampaign.title).toBe(fbCampaign.title);
    });
  });
});
```

---

## DEPLOYMENT & CUTOVER

### 1. Pre-Cutover Checklist

```bash
# 1. Verify data migration
npm run scripts:validate-migration

# 2. Run all tests
npm test

# 3. Run linting
npm run lint

# 4. Load test (1000 concurrent users)
npm run load-test:1000

# 5. Final backup
firebase firestore:backup

# 6. Verify Supabase data
psql -c "SELECT COUNT(*) as user_count FROM users;"
psql -c "SELECT COUNT(*) as campaign_count FROM campaigns;"

# 7. Deploy updated application
eas update --channel production
```

### 2. Gradual Rollout

**Stage 1: 10% of users (4 hours)**
```bash
# Release to 10% via feature flag
FEATURE_FLAGS={
  "use_supabase": {
    "enabled": true,
    "percentage": 10  # Only 10% of users
  }
}

npm run deploy:production
npm run monitor:errors --duration 4h
```

**Check: Error rate < 0.1%**

**Stage 2: 25% of users (4 hours)**
```bash
# Expand to 25%
FEATURE_FLAGS={
  "use_supabase": {
    "enabled": true,
    "percentage": 25
  }
}

npm run deploy:production
npm run monitor:errors --duration 4h
```

**Stage 3: 50% of users (8 hours)**
```bash
FEATURE_FLAGS={
  "use_supabase": {
    "enabled": true,
    "percentage": 50
  }
}

npm run deploy:production
npm run monitor:errors --duration 8h
```

**Stage 4: 100% of users (complete migration)**
```bash
FEATURE_FLAGS={
  "use_supabase": {
    "enabled": true,
    "percentage": 100
  }
}

npm run deploy:production
npm run monitor:errors --duration 24h
```

---

## ROLLBACK PROCEDURES

### 1. Quick Rollback (If Errors <24 hours)

```bash
# 1. Check error rate
npm run monitor:errors --summary

# 2. If error rate > 1%, rollback
git revert HEAD
eas update --channel production

# 3. Notify users
send_notification({
  title: "Service Update",
  message: "We've temporarily rolled back to our previous database. Services are operating normally.",
  duration: 1  // hours
})

# 4. Post-mortem
create_incident_report({
  trigger: "High error rate",
  duration: "30 minutes",
  impact: "5000 users",
  resolution: "Rolled back to Firebase"
})
```

### 2. Data Recovery (If Data Loss)

```bash
# 1. Stop all writes
supabase connection-string:set --maintenance

# 2. Restore from backup
firebase firestore:restore gs://backup-bucket/latest

# 3. Verify restoration
npm run scripts:validate-migration

# 4. Resume normal operation
supabase connection-string:unset --maintenance
```

---

## MONITORING & ALERTING

### Sentry Configuration

```typescript
// sentry.init.ts
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.1,
  
  integrations: [
    new Sentry.Native.Replay({
      maskAllText: true,
      maskAllImages: true
    })
  ]
});

// Capture migration-specific errors
export function captureMigrationError(error: any, context: any) {
  Sentry.captureException(error, {
    tags: {
      context: 'migration',
      phase: context.phase,
      database: context.database  // 'firebase' or 'supabase'
    }
  });
}
```

### PostHog Analytics

```typescript
// Track migration metrics
posthog.capture('database_query', {
  database: 'supabase',
  query_type: 'select',
  collection: 'campaigns',
  duration_ms: 245,
  error: null
});

// Track errors
posthog.capture('migration_error', {
  error_type: 'connection_timeout',
  database: 'supabase',
  retry_count: 3,
  resolved: true
});
```

---

## SUCCESS CHECKLIST

- [ ] All data migrated (row count matches)
- [ ] Zero data corruption (checksums validated)
- [ ] All tests passing (953+/959)
- [ ] Query latency < 500ms p95
- [ ] Error rate < 0.05%
- [ ] Real-time subscriptions working
- [ ] All user features working
- [ ] Gradual rollout complete (100% at 0.01% error rate)
- [ ] Firebase resources decommissioned
- [ ] Documentation updated
- [ ] Team trained on new infrastructure

---

**Version:** 1.0  
**Last Updated:** January 9, 2026  
**Owner:** Engineering Lead
