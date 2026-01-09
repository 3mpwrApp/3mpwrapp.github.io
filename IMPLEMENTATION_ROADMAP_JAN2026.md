# 🚀 3mpwr Migration & Scale Roadmap
**Date:** January 9, 2026  
**Status:** Ready for Execution  
**Target Timeline:** 24 Months  

---

## 📋 EXECUTIVE SUMMARY

**Current State (Jan 2026):**
- ✅ Phase 1-2 Complete: Core app fully functional, 953/959 tests passing
- ✅ 0 Critical Issues: Production-ready code quality
- ✅ Firebase Backend: Costs currently ~$400/month (estimated)

**Decision Gates (Next 12 Months):**
1. **Trigger: Firebase costs exceed $500/month** → Initiate Supabase migration
2. **Trigger: User base reaches 15K+** → Start infrastructure scaling
3. **Trigger: Collective evidence reaches 50K+ submissions** → Implement server-side aggregation

**Recommended Path Forward:**
1. Monitor Firebase costs quarterly
2. Prepare Supabase infrastructure (design & testing)
3. Execute migration when cost threshold exceeded
4. Scale to 50K+ users over next 18-24 months
5. Implement Phase 3 server-side features after scale stabilizes

---

## 🎯 PHASE ROADMAP (24-Month Timeline)

### **PHASE 0: Current State (Jan 2026 - Mar 2026)**

**Objective:** Stabilize, monitor, prepare for scale

**Activities:**
- [ ] Monitor Firebase costs monthly (set alerts at $400/month)
- [ ] Validate production performance (latency, error rates)
- [ ] Gather user feedback on features
- [ ] Begin PostgreSQL schema design (parallel work)
- [ ] Set up Supabase sandbox environment (cost: $0)
- [ ] Document existing Firestore collections for migration

**Deliverables:**
- Monthly cost report (Firebase usage analysis)
- Production performance baseline
- PostgreSQL schema design (draft)
- Supabase project setup

**Resources:** 1 engineer (part-time), 1 DevOps (part-time)  
**Success Criteria:**
- Costs tracking <$500/month
- App stability: 99.9% uptime
- User engagement: >80% DAU retention

---

### **PHASE 1: Cost Optimization (Mar 2026 - Jun 2026)**

**Objective:** Extend Firebase runway while preparing for migration

**Activities:**

#### 1A. Implement Aggressive Caching
```typescript
// Reduce Firestore reads by 70% through caching
- Local cache: First 7 days of data (AsyncStorage)
- Memory cache: Campaign details (30-min TTL)
- Redis cache: (After migration) Collective patterns (6-hour TTL)

Estimated savings: 50-60% of read operations
Cost impact: -$150-200/month
```

#### 1B. Batch Write Operations
```typescript
// Reduce Firestore writes by 50% through batching
- Collect updates every 5 seconds
- Batch up to 50 write operations per batch
- Queue failed writes for retry

Estimated savings: 40-50% of write operations
Cost impact: -$30-50/month
```

#### 1C. Implement Data Archival
```typescript
// Archive old evidence to reduce storage costs
- Keep only 6 months of data hot
- Archive older evidence to compressed storage
- Implement "archive" table for historical queries

Estimated savings: 30-40% of storage costs
Cost impact: -$15-25/month
```

**Deliverables:**
- [ ] Caching service with TTL management
- [ ] Batch write queue with retry logic
- [ ] Data archival system
- [ ] Cost analysis (before/after)

**Resources:** 2 engineers, 2 weeks

**Expected Outcome:** Firebase costs reduced to $200-300/month

---

### **PHASE 2: Migration Preparation (Ongoing - Before Trigger)**

**Objective:** Ready infrastructure for Supabase migration

**Activities:**

#### 2A. Schema Design & Validation
```sql
-- Complete PostgreSQL schema design
campaigns
├─ id, title, summary, target
├─ goal_count, progress_count, status
├─ contact_email, created_at, updated_at
├─ INDEXES: status, created_at, created_by

events
├─ id, campaign_id, title, description
├─ date, location, event_type, status
├─ attendee_count, created_at
├─ INDEXES: campaign_id, date, status

evidence_submissions
├─ id, user_id, campaign_id
├─ text, themes[], insurance_type
├─ denial_reason, timeline_days
├─ created_at, updated_at
├─ INDEXES: themes (GIN), user_id, campaign_id

users
├─ id, email, display_name, location
├─ language, accessibility_prefs
├─ created_at, updated_at
├─ INDEXES: email, created_at

-- Similar for: community, messages, resources, wellness, advocacy

-- RLS policies for multi-tenant safety
```

#### 2B. Load Testing Framework
```
Test scenarios:
├─ 1,000 concurrent users (query patterns)
├─ 100,000 writes/minute (batch ingestion)
├─ Real-time subscriptions (50+ listeners)
├─ Large result sets (pagination)

Compare: Firebase vs Supabase latency
Target: <500ms p95 response time
```

#### 2C. Migration Script Development
```typescript
// services/migration/firestore-to-postgres.ts
export async function migrateCollections() {
  // 1. Export Firestore collections to JSON
  // 2. Transform data to PostgreSQL schema
  // 3. Load into Supabase
  // 4. Validate data integrity (row counts, checksums)
  // 5. Create rollback snapshot
}

// services/migration/dual-write.ts
export async function dualWrite(
  collection: string,
  data: any,
  operation: 'set' | 'update' | 'delete'
) {
  // Write to BOTH Firebase and Supabase for verification
  // Compare results before committing to primary
  // Log discrepancies for debugging
}
```

**Deliverables:**
- [ ] Complete PostgreSQL schema (tested)
- [ ] Load testing environment
- [ ] Data migration scripts (tested)
- [ ] Dual-write framework
- [ ] Rollback procedures

**Resources:** 1 architect, 1 DBA, 2 engineers  
**Timeline:** 4-6 weeks (before migration needed)

---

### **PHASE 3: Supabase Migration (Triggered at $500+/month)**

**Timeline:** 8-12 weeks after trigger

**Week 1-2: Pre-Migration**
- [ ] Set up Supabase production instance
- [ ] Create full Firestore backup
- [ ] Load test PostgreSQL database
- [ ] Validate migration scripts

**Week 3-6: Data Migration**
- [ ] Export Firestore collections
- [ ] Transform and load into PostgreSQL
- [ ] Validate data integrity
- [ ] Set up dual-write for verification
- [ ] Keep Firebase running in parallel

**Week 7-10: Application Updates**
- [ ] Update `services/firestore.ts` → `services/supabase.ts`
- [ ] Replace all query functions
- [ ] Update real-time subscriptions
- [ ] Test authentication flow
- [ ] Verify all components work

**Week 11-12: Testing & Cutover**
- [ ] Full E2E testing (all user flows)
- [ ] Load testing (1000+ concurrent users)
- [ ] Gradual rollout: 10% → 25% → 50% → 100%
- [ ] 24/7 monitoring (48 hours per stage)

**Success Metrics:**
- ✅ 0 data loss
- ✅ <500ms p95 query latency
- ✅ Real-time subscriptions working
- ✅ User experience unchanged
- ✅ Cost reduced 60-80%

**Estimated Cost:** $2,000-5,000 (development)

---

### **PHASE 4: Post-Migration Optimization (Months 4-6 after cutover)**

**Activities:**
- [ ] Remove Firebase resources (save 100%)
- [ ] Optimize PostgreSQL indexes (2-5% query improvement)
- [ ] Implement Redis caching for patterns (6-hour cache)
- [ ] Set up comprehensive monitoring (Sentry, PostHog)
- [ ] Document Supabase operations procedures

**Outcome:**
- Supabase fully operational
- Firebase completely decommissioned
- Cost: $26-200/month (down from $500+)
- Annual savings: $3,600-5,640

---

### **PHASE 5: Server-Side Aggregation (Months 9-15)**

**Objective:** Implement collective evidence server processing

**Prerequisites:**
- ✅ Supabase migration complete
- ✅ 50K+ evidence submissions
- ✅ Real-time performance validated

**Activities:**

#### 5A. PII Removal System (Weeks 1-3)
```typescript
// Enhance anonymizeEvidence() function
- Remove names (Dr. Smith, Mr. Jones)
- Remove dates (MM/DD/YYYY)
- Remove addresses (123 Main St)
- Remove phone numbers
- Remove emails
- Remove ZIP codes
- Remove SSNs
- Remove claim/policy IDs

Target: >99% PII removal rate
Test: 1,000+ evidence samples
```

#### 5B. Pattern Detection Service (Weeks 4-6)
```sql
-- Server-side pattern recalculation (every 6 hours)
-- Input: 50K+ anonymized contributions
-- Output: Top 50 patterns with real user counts
-- Performance: <300 seconds per recalculation
-- Caching: Redis (6-hour TTL)
```

#### 5C. API Endpoints (Weeks 7-8)
```
POST /api/v1/collective-evidence/contribute
GET /api/v1/collective-evidence/patterns
POST /api/v1/collective-evidence/opt-out
GET /api/v1/collective-evidence/insights
```

#### 5D. Client Updates (Weeks 9-10)
```typescript
// Update Evidence Locker screen
- Add "Share with collective" toggle
- Show real user counts (not estimated)
- Real-time pattern updates (refresh every 1 minute)
- Opt-out mechanism
```

**Resources:** 2-3 engineers, 6 weeks

**Cost:** $3,000-5,000 (development)  
**Infrastructure Cost:** +$50-100/month (Redis, processing)

---

### **PHASE 6: Scale to 100K Users (Months 16-24)**

**Objective:** Support 100,000+ concurrent users

**Activities:**

#### 6A. Database Scaling
```
Monitoring:
├─ Query latency (p95 < 500ms)
├─ Connection pool health
├─ Storage growth rate
├─ CPU/memory utilization

Scaling actions:
├─ Upgrade Supabase compute tier
├─ Add read replicas (for analytics)
├─ Implement query result pagination
├─ Archive old data (>12 months)
```

#### 6B. API Optimization
```
Caching strategy:
├─ HTTP caching headers (30 min for static data)
├─ Redis caching (1 hour for patterns)
├─ Client-side caching (AsyncStorage)

Rate limiting:
├─ 100 requests/minute per user
├─ 1,000 contributions/day per user
├─ 100 API calls/minute per app
```

#### 6C. Monitoring & Alerting
```
Metrics to track:
├─ Error rate (alert if >0.1%)
├─ Query latency (alert if p95 >1s)
├─ Database growth (alert if >500GB)
├─ API response time (alert if >2s)
├─ User satisfaction (NPS, retention)

Tools:
├─ Sentry (error tracking)
├─ PostHog (product analytics)
├─ Datadog (infrastructure monitoring)
├─ PostgreSQL (database monitoring)
```

**Resources:** 1 DevOps, 2 engineers (part-time)  
**Timeline:** 6-9 months

---

## 💰 FINANCIAL IMPACT TIMELINE

```
MONTHS 1-3 (Phase 0: Monitoring)
├─ Firebase: $400/month
├─ Monitoring tools: $50/month
├─ Dev costs: $0
└─ Total: $1,350/quarter

MONTHS 4-6 (Phase 1: Optimization)
├─ Firebase: $300/month (optimized)
├─ Optimization dev: $8,000 (one-time)
├─ Monitoring: $50/month
└─ Total: $9,250/quarter

MONTHS 7-12 (Phase 2: Preparation, then Migration)
├─ Firebase (if not migrated): $300/month
├─ Supabase (if migrated): $100/month
├─ Migration dev: $15,000 (one-time)
├─ Infrastructure: $0-100/month
└─ Total: $15,500-16,000/quarter

MONTHS 13-18 (Phase 4: Optimization + Phase 5 Start)
├─ Supabase: $100-150/month
├─ Phase 5 dev: $12,000 (one-time)
├─ Monitoring: $100/month
└─ Total: $12,400/quarter

MONTHS 19-24 (Phase 5-6: Server Features + Scale)
├─ Supabase: $150-200/month
├─ Redis: $50-100/month
├─ Phase 6 ops: $3,000/quarter (ongoing)
└─ Total: $3,500-4,000/quarter

YEAR 1 TOTAL: ~$41,000
YEAR 2 TOTAL: ~$8,000
```

**ROI Analysis:**

```
If Firebase costs continue without migration:
Year 1: $5,000/month = $60,000
Year 2: $8,000/month = $96,000
TOTAL: $156,000 over 2 years

With migration:
Year 1: $41,000 (includes dev costs)
Year 2: $8,000 (supabase only)
TOTAL: $49,000 over 2 years

SAVINGS: $107,000 (69% reduction)
```

---

## 🚨 RISK MATRIX

### **Critical Risks**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Firebase cost increase >100% | Medium (30%) | High | Migrate early if costs spike |
| Data loss during migration | Low (5%) | Critical | Full backup, dry-run test, rollback ready |
| User experience degradation | Low (10%) | High | Gradual rollout (10→50→100%), monitoring |
| Authentication system breaks | Low (5%) | Critical | Dual-auth during transition, extensive testing |
| Real-time feature latency issues | Medium (25%) | Medium | Load test before cutover, fallback to polling |
| PostgreSQL query performance | Low (10%) | Medium | Query optimization, indexing, cache layer |

### **Medium Risks**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Scope creep (adding features during migration) | High (60%) | Medium | Strict scope freeze, separate feature branch |
| Team knowledge gaps (PostgreSQL, DevOps) | Medium (40%) | Medium | Training, documentation, external help |
| Third-party service integration issues | Low (15%) | Low | Mock APIs, integration testing, fallbacks |
| Regulatory compliance changes | Low (10%) | Medium | Monitor GDPR/CCPA, implement PIPL if needed |

---

## 📊 SUCCESS METRICS

### **Phase 0-1 (Months 1-6)**
- [ ] Firebase costs < $400/month (baseline)
- [ ] App uptime > 99.9%
- [ ] User satisfaction NPS > 50
- [ ] Test pass rate > 95%

### **Phase 2-3 (Months 7-12)**
- [ ] Migration completed on time (<12 weeks)
- [ ] Zero data loss during migration
- [ ] User experience unchanged (no complaints >0.1%)
- [ ] Supabase costs < $150/month
- [ ] Query latency p95 < 500ms

### **Phase 4-5 (Months 13-18)**
- [ ] Pattern detection >99% PII removal rate
- [ ] Server aggregation <300 seconds per cycle
- [ ] User opt-in rate > 60% for collective features
- [ ] Real user count validation > 95% accuracy

### **Phase 6 (Months 19-24)**
- [ ] Support 100K+ concurrent users
- [ ] Error rate < 0.05%
- [ ] Query latency p95 < 300ms at scale
- [ ] Cost per user < $0.02/month

---

## 🎬 EXECUTION PLAYBOOK

### **Decision Gate: Firebase Costs Exceed $500/month**

**Trigger Check (Monthly):**
```
1. Review Firebase billing dashboard
2. If monthly bill > $500 for 2+ consecutive months:
   → Activate PHASE 3 Migration Playbook
   → Schedule kickoff meeting with team
   → Allocate resources (2-3 engineers, 1 DevOps)
   → Plan 8-12 week timeline
```

**Migration Kickoff (Week 1):**
- [ ] Executive approval (cost/benefit review)
- [ ] Resource allocation confirmed
- [ ] Timeline set (target: 8-12 weeks)
- [ ] Communication plan (team, users, stakeholders)

**Execution (Weeks 2-12):**
- [ ] Follow PHASE 3 timeline
- [ ] Weekly status updates
- [ ] Risk reviews every 2 weeks
- [ ] Stakeholder communication every week

**Cutover (Week 13):**
- [ ] Final validation (all tests passing)
- [ ] Gradual rollout (10% → 25% → 50% → 100%)
- [ ] 24/7 monitoring
- [ ] Incident response team on-call

**Post-Migration (Weeks 14-16):**
- [ ] Remove Firebase resources
- [ ] Decommission old infrastructure
- [ ] Update documentation
- [ ] Conduct post-mortem
- [ ] Archive old data

---

## 📞 STAKEHOLDER COMMUNICATION

### **Team (Engineers, DevOps)**
- Weekly syncs (status, blockers, risks)
- Daily standups during Phase 3
- Post-incident reviews

### **Leadership (CEO, Product)**
- Monthly business reviews
- Quarterly cost projections
- Annual ROI analysis

### **Users**
- Pre-announcement (2 weeks before cutover)
- Cutover notification (real-time)
- Post-cutover confirmation email
- Support channel monitoring

---

## 🔄 NEXT STEPS (Immediate: Jan 2026)

### **This Month:**
1. [ ] Review this roadmap with team
2. [ ] Set up monthly Firebase cost monitoring
3. [ ] Begin PostgreSQL schema design
4. [ ] Create Supabase sandbox environment

### **Next Quarter:**
1. [ ] Implement caching optimizations (Phase 1A)
2. [ ] Implement batch writes (Phase 1B)
3. [ ] Begin load testing framework setup
4. [ ] Review schema design with DBA

### **If Firebase Costs Exceed $500/month:**
1. [ ] Activate PHASE 3 Migration Playbook
2. [ ] Schedule kickoff meeting
3. [ ] Begin data export and validation
4. [ ] Start application updates

---

## 📚 REFERENCE DOCUMENTS

**Related Documents:**
- [FIREBASE_TO_SUPABASE_MIGRATION_ANALYSIS.md](./FIREBASE_TO_SUPABASE_MIGRATION_ANALYSIS.md) - Detailed cost/benefit analysis
- [docs/PHASE_3_PLANNING.md](./docs/PHASE_3_PLANNING.md) - Server-side aggregation details

**External Resources:**
- Supabase Migration Guide: https://supabase.com/docs/guides/migrations
- PostgreSQL Best Practices: https://www.postgresql.org/docs/
- Expo Router Navigation: https://expo.dev/routing/introduction

---

**Version:** 1.0  
**Last Updated:** January 9, 2026  
**Next Review:** March 2026 (cost check + progress update)  
**Owner:** Engineering Lead + Product Manager
