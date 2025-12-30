# Phase 3 Planning - Server-Side Aggregation & Scale

**Status**: Planning
**Timeline**: TBD (user decides scheduling)
**Prerequisites**: Phase 2 complete ✅, Week 3-4 analytics complete ✅

---

## Phase 3 Overview

Phase 3 transitions EmpowrApp from a local-only collective evidence system to a server-aggregated platform capable of supporting 10,000+ users while maintaining strict privacy safeguards and building competitive moat through collective evidence dataset.

**Core Goals:**
1. **Server-Side Aggregation** - Centralized pattern detection with real user counts
2. **PII Removal Implementation** - >99% PII removal rate before server upload
3. **Scale Infrastructure** - Support 10,000+ concurrent users
4. **Indigenous Community Consultation** - Ethical data practices and community input
5. **Open-Source Security Modules** - Share privacy-preserving tech
6. **Platform APIs** - Enable integrations with advocacy orgs and researchers

---

## 1. Server-Side Aggregation

### Current State (Phase 2)
- Evidence stored locally only (AsyncStorage, encrypted)
- Pattern detection runs on user's device
- Estimated user counts (not real counts)
- No cross-user validation
- 50-user minimum threshold enforced locally

### Target State (Phase 3)
- Evidence anonymized and uploaded to server
- Pattern detection on server with real user counts
- Cross-user validation and pattern verification
- Server-enforced privacy thresholds
- Real-time pattern updates

### Implementation Steps

#### 1.1 PII Removal Service
**File**: `services/collectiveEvidence.ts`

**Enhance anonymizeEvidence() function**:
```typescript
export function anonymizeEvidence(
  evidence: EvidenceLocalNote,
  userLocation?: string
): AnonymousContribution & { sanitizedText: string } {
  // Current: Extracts themes, doesn't modify text
  // Phase 3: Add actual PII removal

  let sanitizedText = evidence.text;

  // 1. Remove names (Dr. Smith, Mr. Jones, Ms. Brown, etc.)
  sanitizedText = sanitizedText.replace(/\b(Dr\.?|Mr\.?|Ms\.?|Mrs\.?)\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*/g, '[NAME REMOVED]');

  // 2. Remove exact dates (MM/DD/YYYY, Month DD, YYYY)
  sanitizedText = sanitizedText.replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, '[DATE REMOVED]');
  sanitizedText = sanitizedText.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi, '[DATE REMOVED]');

  // 3. Remove addresses (123 Main St, etc.)
  sanitizedText = sanitizedText.replace(/\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct)\b/gi, '[ADDRESS REMOVED]');

  // 4. Remove phone numbers (all formats)
  sanitizedText = sanitizedText.replace(/\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE REMOVED]');

  // 5. Remove emails
  sanitizedText = sanitizedText.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL REMOVED]');

  // 6. Remove ZIP codes
  sanitizedText = sanitizedText.replace(/\b\d{5}(-\d{4})?\b/g, '[ZIP REMOVED]');

  // 7. Remove city, state patterns
  sanitizedText = sanitizedText.replace(/\b[A-Z][a-z]+,\s*[A-Z]{2}\b/g, '[LOCATION REMOVED]');

  // 8. Remove SSN patterns
  sanitizedText = sanitizedText.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN REMOVED]');

  // 9. Remove claim IDs, policy numbers
  sanitizedText = sanitizedText.replace(/\b(Claim|Policy|Member|Patient|Case|Record|Account|Authorization)\s*(#|Number|ID|No\.?)?\s*:?\s*[A-Z0-9-]+\b/gi, '[ID REMOVED]');

  // Return both structured data AND sanitized text
  return {
    ...existingStructuredData,
    sanitizedText, // New field for server upload
  };
}
```

**Validation**:
- Run existing test suite (services/__tests__/collectiveEvidence.test.ts)
- Target: >99% PII removal rate
- Performance: <100ms per anonymization

#### 1.2 Server API Endpoints
**New file**: `server/routes/collective-evidence.ts`

```typescript
POST /api/v1/collective-evidence/contribute
- Accepts: AnonymousContribution (with sanitizedText)
- Validates: PII removal (rejects if PII detected)
- Defense-in-depth: Server-side PII scrubbing
- Stores: In PostgreSQL database
- Returns: Contribution ID

GET /api/v1/collective-evidence/patterns
- Returns: DetectedPattern[] (50+ user threshold enforced)
- Includes: Real user counts, cross-validated patterns
- Caching: Redis for performance

POST /api/v1/collective-evidence/opt-out
- Accepts: User ID
- Action: Delete all contributions by user
- Returns: Confirmation

GET /api/v1/collective-evidence/insights
- Returns: CollectiveInsights with real-time data
- Aggregated: Across all users (privacy-preserving)
```

#### 1.3 Database Schema
**Database**: PostgreSQL (Supabase recommended)

```sql
-- Anonymous contributions table
CREATE TABLE collective_evidence_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- For opt-out only, never shown in patterns
  sanitized_text TEXT NOT NULL, -- PII-removed text
  days_ago INTEGER NOT NULL,
  themes TEXT[] NOT NULL,
  region TEXT,
  insurance_type TEXT,
  condition_category TEXT,
  denial_reason TEXT,
  timeline_delay_days INTEGER,
  missing_docs TEXT[],
  contributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Indexes
  INDEX idx_themes USING GIN (themes),
  INDEX idx_region (region),
  INDEX idx_insurance (insurance_type),
  INDEX idx_condition (condition_category),
  INDEX idx_denial_reason (denial_reason),
  INDEX idx_contributed_at (contributed_at)
);

-- Pattern cache table (updated every 6 hours)
CREATE TABLE collective_evidence_patterns (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  insight TEXT NOT NULL,
  statistic TEXT NOT NULL,
  user_count INTEGER NOT NULL,
  frequency INTEGER NOT NULL,
  denial_rate NUMERIC NOT NULL,
  score INTEGER NOT NULL,
  trending TEXT NOT NULL, -- 'up', 'down', 'stable'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'urgent'
  regions TEXT[] NOT NULL,
  conditions TEXT[] NOT NULL,
  solidarity_message TEXT NOT NULL,
  action_label TEXT,
  action_link TEXT,
  metadata JSONB,
  calculated_at TIMESTAMPTZ NOT NULL,

  INDEX idx_score (score DESC),
  INDEX idx_severity (severity),
  INDEX idx_trending (trending)
);

-- User opt-in/opt-out tracking
CREATE TABLE collective_evidence_users (
  user_id UUID PRIMARY KEY,
  opted_in BOOLEAN NOT NULL DEFAULT FALSE,
  opted_in_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  contribution_count INTEGER NOT NULL DEFAULT 0,
  last_contribution_at TIMESTAMPTZ
);

-- RLS (Row-Level Security) policies
ALTER TABLE collective_evidence_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_evidence_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_evidence_users ENABLE ROW LEVEL SECURITY;

-- Only allow users to delete their own contributions (opt-out)
CREATE POLICY "Users can delete their own contributions"
  ON collective_evidence_contributions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Everyone can read patterns (public data)
CREATE POLICY "Anyone can read patterns"
  ON collective_evidence_patterns
  FOR SELECT
  USING (true);

-- Users can only see their own opt-in status
CREATE POLICY "Users can see own opt-in status"
  ON collective_evidence_users
  FOR SELECT
  USING (auth.uid() = user_id);
```

#### 1.4 Pattern Detection Service (Server-Side)
**New file**: `server/services/patternDetection.ts`

```typescript
import { detectPatterns } from '../../services/collectiveEvidence';

export async function recalculatePatterns() {
  // Run every 6 hours via cron job

  // 1. Fetch all contributions from database
  const contributions = await db.select('*').from('collective_evidence_contributions');

  // 2. Run pattern detection (existing algorithm)
  const patterns = detectPatterns(contributions);

  // 3. Filter patterns below 50-user threshold
  const validPatterns = patterns.filter(p => p.userCount >= 50);

  // 4. Update pattern cache table
  await db.transaction(async (trx) => {
    await trx.delete().from('collective_evidence_patterns');
    await trx.insert(validPatterns).into('collective_evidence_patterns');
  });

  // 5. Log analytics
  await analytics.logEvent('patterns_recalculated', {
    total_patterns: validPatterns.length,
    total_contributions: contributions.length,
    calculated_at: new Date().toISOString(),
  });
}
```

#### 1.5 Client Updates
**File**: `services/collectiveEvidence.ts`

```typescript
// Upload contribution to server (Phase 3)
export async function submitContribution(evidence: EvidenceLocalNote, userLocation?: string): Promise<void> {
  // 1. Anonymize evidence (with PII removal)
  const contribution = anonymizeEvidence(evidence, userLocation);

  // 2. Upload to server
  const response = await fetch('/api/v1/collective-evidence/contribute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contribution),
  });

  if (!response.ok) {
    throw new Error('Failed to submit contribution');
  }

  // 3. Store contribution ID locally (for potential deletion)
  const { id } = await response.json();
  await AsyncStorage.setItem(`contribution:${evidence.id}`, id);

  // 4. Log analytics
  await analytics().logEvent('collective_contribution_submitted', {
    themes: contribution.themes,
    region: contribution.region,
    insurance_type: contribution.insuranceType,
  });
}

// Fetch patterns from server (Phase 3)
export async function fetchCollectiveInsights(): Promise<CollectiveInsights> {
  const response = await fetch('/api/v1/collective-evidence/patterns');

  if (!response.ok) {
    throw new Error('Failed to fetch patterns');
  }

  return await response.json();
}
```

---

## 2. Scale Infrastructure

### Target Metrics
- **Users**: 10,000+ concurrent users
- **Contributions**: 100,000+ evidence submissions
- **Pattern Recalculation**: Every 6 hours (acceptable latency)
- **API Response Time**: <500ms p95
- **Database Queries**: <100ms p95

### Infrastructure Stack

#### 2.1 Backend
- **Framework**: Node.js + Express (or Next.js API routes)
- **Database**: PostgreSQL (Supabase for managed service)
- **Caching**: Redis (for pattern cache)
- **File Storage**: Supabase Storage (for future attachments)
- **Authentication**: Supabase Auth (existing)

#### 2.2 Deployment
- **Backend**: Render.com or Railway.app (serverless autoscaling)
- **Database**: Supabase (managed PostgreSQL with automatic backups)
- **CDN**: Cloudflare (for API caching and DDoS protection)
- **Monitoring**: Sentry (error tracking), Posthog (analytics)

#### 2.3 Performance Optimizations
- **Pattern Cache**: Redis cache with 6-hour TTL
- **Database Indexes**: On themes, region, insurance_type, condition_category
- **Connection Pooling**: PgBouncer for database connections
- **Rate Limiting**: 100 contributions per user per day
- **Pagination**: Limit pattern results to top 50 by score

---

## 3. Indigenous Community Consultation

### Goal
Ensure collective evidence system respects Indigenous data sovereignty and community values through meaningful consultation.

### Consultation Process

#### 3.1 Phase 1: Outreach (Month 1)
- Identify Indigenous health advocacy organizations (e.g., National Indian Health Board, First Nations Health Authority)
- Draft consultation proposal with clear objectives
- Request meetings with community leaders and elders
- Offer honorariums for time and expertise

#### 3.2 Phase 2: Listening Sessions (Months 2-3)
- Host 3-5 virtual listening sessions with Indigenous communities
- Topics:
  - Data sovereignty concerns
  - Community control over data
  - Appropriate use of collective evidence
  - Privacy expectations and cultural considerations
  - Benefit-sharing models

#### 3.3 Phase 3: Integration (Months 4-5)
- Incorporate feedback into system design:
  - Option for Indigenous users to flag contributions as community data
  - Community-level opt-in (tribal leadership approval)
  - Data return mechanisms (communities can request their aggregate data)
  - Indigenous-specific pattern detection (opt-in, community-controlled)
  - Cultural safety in language and messaging

#### 3.4 Phase 4: Ongoing Partnership (Ongoing)
- Establish Indigenous Advisory Board (5-7 members)
- Quarterly check-ins on system usage and concerns
- Annual data sovereignty audits
- Co-design future features with community input

### Resources
- **Budget**: $50,000-$100,000 for honorariums, travel, consulting
- **Timeline**: 6-12 months for initial consultation
- **Partners**: National Indian Health Board, First Nations Health Authority, Indigenous health advocates

---

## 4. Open-Source Security Modules

### Goal
Share privacy-preserving technology with broader health tech community while building reputation and trust.

### Modules to Open-Source

#### 4.1 PII Removal Library
**Repository**: `empowrapp/pii-removal-js`

**Features**:
- >99% PII removal rate for health evidence text
- Supports names, dates, addresses, phone, email, SSN, medical IDs
- Configurable removal strategies (replace vs. redact)
- TypeScript support
- Comprehensive test suite (100+ test cases)
- Performance: <100ms per document

**License**: MIT License (permissive, allows commercial use)

**Documentation**:
- README with quick start guide
- API reference
- Privacy guarantees and limitations
- Integration examples (React Native, Node.js, browser)

#### 4.2 Privacy-Preserving Pattern Detection
**Repository**: `empowrapp/privacy-patterns`

**Features**:
- Minimum threshold enforcement (50+ users)
- Differential privacy techniques
- Geographic aggregation (region-level only)
- Temporal aggregation (relative time)
- Anonymous contribution tracking

**License**: AGPL-3.0 (copyleft, requires sharing modifications)

**Use Cases**:
- Health advocacy platforms
- Research institutions
- Patient support networks
- Legal aid organizations

#### 4.3 Release Strategy
1. **Month 1**: Announce intent to open-source on blog/Twitter
2. **Month 2**: Prepare repositories (documentation, examples, CI/CD)
3. **Month 3**: Public release with blog post and outreach to health tech community
4. **Ongoing**: Maintain repositories, accept contributions, provide support

---

## 5. Platform APIs

### Goal
Enable integrations with advocacy organizations, researchers, and legal aid groups.

### API Categories

#### 5.1 Public Pattern API
**Endpoint**: `GET /api/v1/public/patterns`

**Purpose**: Allow advocacy orgs to display collective evidence patterns on their websites

**Access**: Public (rate-limited to 100 req/hour)

**Response**:
```json
{
  "patterns": [
    {
      "id": "denial_insufficient_evidence",
      "title": "Common Denial Reason",
      "insight": "Insufficient medical evidence",
      "statistic": "67% of fibromyalgia claims denied for this reason",
      "userCount": 847,
      "severity": "high",
      "trending": "up"
    }
  ],
  "lastUpdated": "2025-01-15T10:00:00Z"
}
```

#### 5.2 Research API (Authenticated)
**Endpoint**: `GET /api/v1/research/aggregate-insights`

**Purpose**: Provide aggregate data to academic researchers

**Access**: Requires API key + IRB approval verification

**Features**:
- Aggregate statistics only (no individual contributions)
- Requires data use agreement
- Audit trail of all data access
- Annual review of research use

#### 5.3 Advocacy Campaign Integration
**Endpoint**: `POST /api/v1/campaigns/link-pattern`

**Purpose**: Link urgent patterns to advocacy campaigns

**Access**: Authenticated EmpowrApp users + campaign organizers

**Example**:
```json
{
  "patternId": "denial_insufficient_evidence",
  "campaignId": "fibromyalgia-awareness-2025",
  "actionUrl": "https://empowrapp.org/campaigns/fibromyalgia-awareness",
  "actionLabel": "Join Campaign"
}
```

**Result**: Pattern shows "Join Campaign" button in app linking to advocacy campaign

#### 5.4 Legal Aid Integration
**Endpoint**: `GET /api/v1/legal/pattern-evidence`

**Purpose**: Provide anonymized pattern evidence to legal aid organizations for class action lawsuits

**Access**: Requires legal partnership agreement

**Use Case**: "847 users reported denials for insufficient evidence - potential class action against insurer X"

---

## 6. Implementation Roadmap

### Month 1: PII Removal & Testing
- [ ] Implement PII removal in anonymizeEvidence()
- [ ] Run test suite and achieve >99% removal rate
- [ ] Add server-side PII validation
- [ ] Security audit of PII removal

### Month 2: Server Infrastructure
- [ ] Set up PostgreSQL database (Supabase)
- [ ] Implement API endpoints (/contribute, /patterns, /opt-out)
- [ ] Set up Redis cache for patterns
- [ ] Deploy backend to Render/Railway

### Month 3: Pattern Detection Server-Side
- [ ] Migrate pattern detection to server
- [ ] Set up cron job for pattern recalculation (every 6 hours)
- [ ] Implement real user counting
- [ ] Add cross-user validation

### Month 4: Client Updates & Testing
- [ ] Update mobile app to use server APIs
- [ ] Add contribution upload on evidence save
- [ ] Fetch patterns from server instead of local calculation
- [ ] End-to-end testing with 100+ test users

### Month 5: Indigenous Community Consultation
- [ ] Outreach to Indigenous health organizations
- [ ] Schedule listening sessions
- [ ] Draft consultation proposal
- [ ] Begin feedback integration

### Month 6: Open-Source Release
- [ ] Prepare PII removal library for open-source
- [ ] Prepare privacy-patterns library for open-source
- [ ] Write documentation and examples
- [ ] Public release announcement

### Month 7: Platform APIs
- [ ] Implement public pattern API
- [ ] Implement research API with authentication
- [ ] Create API documentation portal
- [ ] Onboard first API partners (advocacy orgs)

### Month 8-12: Scale & Refinement
- [ ] Monitor performance and scale infrastructure
- [ ] Continue Indigenous community consultation
- [ ] Support open-source libraries
- [ ] Expand API partnerships
- [ ] Launch advocacy campaign integrations

---

## 7. Success Metrics

### Technical Metrics
- **PII Removal Rate**: >99% (verified by test suite)
- **API Response Time**: <500ms p95
- **Database Query Time**: <100ms p95
- **Pattern Recalculation**: <5 minutes for 100,000 contributions
- **Uptime**: 99.9% (less than 8.76 hours downtime per year)

### User Metrics
- **Contributions**: 10,000+ evidence submissions
- **Active Users**: 5,000+ users opted into collective evidence
- **Pattern Quality**: 50+ high-quality patterns with 50+ user threshold
- **Opt-Out Rate**: <5% (indicates user trust)

### Community Metrics
- **Indigenous Consultation**: 3-5 listening sessions completed
- **Advisory Board**: 5-7 Indigenous community members participating
- **Feedback Integration**: 80%+ of actionable feedback implemented

### Open-Source Metrics
- **GitHub Stars**: 100+ stars on PII removal library
- **Downloads**: 1,000+ npm downloads per month
- **Contributors**: 5+ external contributors
- **Issues Resolved**: 90%+ issue resolution rate

### API Metrics
- **API Partners**: 5+ advocacy organizations using pattern API
- **Research Partnerships**: 2-3 academic research projects
- **Campaign Integrations**: 3+ advocacy campaigns linked to patterns

---

## 8. Budget Estimate

### Infrastructure Costs
- **Supabase (PostgreSQL + Auth)**: $25/month (Pro plan for 10k users)
- **Render/Railway (Backend)**: $50/month (autoscaling)
- **Redis Cloud**: $10/month (for pattern cache)
- **Cloudflare**: $0/month (free tier for CDN)
- **Monitoring (Sentry + Posthog)**: $50/month
- **Total Infrastructure**: ~$135/month = **$1,620/year**

### Development Costs
- **Backend Development**: 200 hours @ $100/hour = $20,000
- **Mobile App Updates**: 100 hours @ $100/hour = $10,000
- **Testing & QA**: 50 hours @ $80/hour = $4,000
- **Security Audit**: $5,000 (third-party audit)
- **Total Development**: **$39,000**

### Community Consultation
- **Indigenous Consultation**: $50,000-$100,000 (honorariums, travel, consulting)
- **Advisory Board**: $20,000/year (honorariums for quarterly meetings)
- **Total Community**: **$70,000-$120,000**

### Open-Source & API
- **Documentation**: 40 hours @ $80/hour = $3,200
- **Community Support**: 20 hours/month @ $80/hour = $19,200/year
- **Total Open-Source**: **$22,400/year**

### Total Phase 3 Budget
- **Year 1**: $133,020 - $183,020
- **Year 2+**: $43,220/year (ongoing maintenance + community)

---

## 9. Risk Analysis

### Technical Risks
- **PII Leakage**: Mitigation → Comprehensive testing, server-side validation, security audit
- **Scale Issues**: Mitigation → Redis caching, database indexing, load testing before launch
- **Data Breach**: Mitigation → Encryption at rest, row-level security, regular security audits

### Community Risks
- **Indigenous Data Sovereignty Concerns**: Mitigation → Meaningful consultation, community control, data return mechanisms
- **User Trust**: Mitigation → Transparency in privacy policy, open-source PII removal, clear opt-out process
- **Opt-Out Wave**: Mitigation → User education, show value of collective evidence, easy opt-out

### Legal Risks
- **GDPR/PIPEDA Compliance**: Mitigation → Legal review, data processing agreements, right to deletion
- **HIPAA Concerns**: Mitigation → PII removal ensures no PHI is stored, legal counsel review
- **Class Action Liability**: Mitigation → Anonymous data prevents attribution to specific insurers in litigation

### Financial Risks
- **Infrastructure Costs**: Mitigation → Start with scalable cloud services, monitor usage, optimize queries
- **Consultation Budget Overruns**: Mitigation → Set clear budget caps, prioritize essential listening sessions

---

## 10. Next Steps (Immediate)

1. **Review Planning Document** with user to confirm priorities and timeline
2. **Secure Funding** for Phase 3 (estimate $133k-$183k Year 1)
3. **Hire Backend Developer** (or allocate internal resources)
4. **Begin Indigenous Outreach** (longest lead time - 6-12 months)
5. **Set up Development Environment** (Supabase project, backend repo)
6. **Implement PII Removal** (highest priority for privacy guarantee)

---

## Conclusion

Phase 3 represents a significant leap from local-only collective evidence to a server-aggregated platform that can drive systemic change in healthcare access. By prioritizing privacy (>99% PII removal), community consultation (Indigenous data sovereignty), and open-source sharing (PII removal library), EmpowrApp can build both competitive moat and community trust.

The roadmap is ambitious but achievable over 12 months with appropriate resources. The key to success is maintaining the privacy-first principles established in Phase 2 while scaling to serve thousands of users and amplify their collective voice.
