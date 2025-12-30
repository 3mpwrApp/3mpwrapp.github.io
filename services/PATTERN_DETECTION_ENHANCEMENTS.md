# Pattern Detection Algorithm Enhancements - Week 3-4

This document summarizes the refinements made to the pattern detection algorithm in `services/collectiveEvidence.ts` based on Week 3-4 requirements.

## Overview

The pattern detection algorithm has been significantly enhanced to provide more actionable insights while maintaining strict privacy safeguards (50+ user threshold, PII removal, region-level geographic data only).

---

## 1. Enhanced Theme Extraction

### Medical Terminology Detection
Added comprehensive detection for:

**Chronic Pain Conditions:**
- Fibromyalgia
- Chronic pain (general)
- Arthritis (rheumatoid, osteoarthritis)
- Back pain / spinal issues
- Joint pain

**Mental Health Conditions:**
- Depression (MDD)
- Anxiety (GAD, panic disorder)
- PTSD
- Bipolar disorder
- OCD

**Autoimmune Conditions:**
- Lupus (SLE)
- Multiple Sclerosis (MS)
- Inflammatory Bowel Disease (Crohn's, colitis)
- Psoriasis
- Rheumatoid Arthritis

**Neurological Conditions:**
- Migraine
- Epilepsy
- Parkinson's disease
- Neuropathy

**Other Categories:**
- Neurodevelopmental (Autism, ADHD)
- Chronic illness (Chronic Fatigue Syndrome, Long COVID)
- Endocrine (Diabetes)
- Oncology (Cancer)

### Insurance Company Pattern Detection
Tracks patterns for major insurers (anonymized):
- UnitedHealthcare / UHC
- Blue Cross Blue Shield / BCBS / Anthem
- Aetna
- Cigna
- Humana
- Kaiser
- Other major insurers (Molina, Centene, WellCare)

### Medication Detection
Identifies mentions of:

**Biologics:**
- Humira (adalimumab)
- Enbrel (etanercept)
- Remicade (infliximab)
- Stelara (ustekinumab)
- Cosentyx (secukinumab)
- Skyrizi (risankizumab)
- General biologic therapy

**Other Medication Classes:**
- Opioids (morphine, oxycodone, hydrocodone, fentanyl, tramadol)
- Antidepressants (SSRIs, SNRIs - Lexapro, Prozac, Zoloft, Wellbutrin)
- Stimulants (Adderall, Ritalin, Vyvanse, Concerta)

### Procedure Type Detection
- Prior authorization / pre-authorization
- Appeals
- External / independent review
- Resubmission
- Peer review / medical review

---

## 2. Advanced Pattern Scoring Algorithm

The scoring system has been redesigned to weight patterns by multiple factors:

### Scoring Components (0-100 points total)

1. **Frequency Score (0-25 points)**
   - Based on pattern frequency relative to total contributions
   - Higher frequency = more users affected

2. **User Count Score (0-20 points)**
   - More users contributing = higher importance
   - Normalized against minimum threshold (50 users)

3. **Recency/Trending Score (0-15 points)**
   - Recent contributions (last 30 days) score higher
   - +5 bonus for patterns trending upward
   - Helps identify emerging issues

4. **Denial Rate Score (0-20 points)**
   - Higher denial rate = more severe problem
   - Directly reflects treatment access barriers

5. **Severity Level Score (0-15 points)**
   - Urgent: 15 points (>80% denial rate)
   - High: 10 points (>60% denial rate)
   - Medium: 5 points (>30% denial rate)
   - Low: 2 points

6. **Pattern Type Score (0-10 points)**
   - Denial reasons / Condition patterns: 10 points (most actionable)
   - Insurance patterns: 8 points (high value)
   - Timeline delays: 7 points (moderately actionable)
   - Missing docs: 5 points (useful)
   - Geographic trends: 4 points (informational)

7. **Geographic Spread Bonus (0-5 points)**
   - Patterns affecting multiple regions = broader impact
   - Up to 5 points based on number of regions

---

## 3. Enriched Pattern Data Structure

### Updated `DetectedPattern` Interface

```typescript
interface DetectedPattern {
  // Core identifiers
  id: string;
  type: 'denial_reason' | 'timeline_delay' | 'missing_docs' |
        'insurance_pattern' | 'condition_pattern' | 'geographic_trend';

  // Display fields
  title: string;
  insight: string;
  statistic: string;
  solidarityMessage: string;

  // Metrics
  frequency: number;           // Number of occurrences
  userCount: number;           // Users contributing to pattern
  denialRate: number;          // NEW: 0-100 percentage
  score: number;               // 0-100 importance score

  // Analysis
  trending: 'up' | 'down' | 'stable';  // NEW: Pattern direction
  severity: 'low' | 'medium' | 'high' | 'urgent';  // NEW: Severity level

  // Context
  regions: string[];           // NEW: Geographic areas affected
  conditions: string[];        // NEW: Associated medical conditions

  // Additional data
  metadata: {
    isEmerging?: boolean;      // NEW: Pattern new in last 30 days
    timeToDecisionDays?: number;  // NEW: Avg time to decision
    // ... pattern-specific fields
  };
}
```

### Key Enhancements

**denialRate (0-100):**
- Percentage of contributions with denials for this pattern
- Helps identify most problematic barriers

**trending ('up' | 'down' | 'stable'):**
- Compares last 30 days to previous 30 days
- Threshold: >20% change = trending
- Identifies emerging or declining issues

**severity ('low' | 'medium' | 'high' | 'urgent'):**
- Urgent: >80% denial rate OR >500 users with >50% denial rate
- High: >60% denial rate OR >200 users with >40% denial rate
- Medium: >30% denial rate OR >100 users
- Low: Everything else

**regions (string[]):**
- Geographic areas where pattern appears
- Region-level only (never city/address)
- Helps identify geographic clustering

**conditions (string[]):**
- Medical conditions associated with pattern
- Enables cross-referencing (e.g., "fibromyalgia + Blue Cross")

**metadata.isEmerging:**
- True if >70% of contributions are from last 30 days
- Helps surface new systemic issues quickly

**metadata.timeToDecisionDays:**
- Average time from submission to decision
- Helps quantify delays

---

## 4. New Pattern Types

### 6. Insurance Company Patterns
Detects insurer-specific trends:
- Denial rates by insurer
- Geographic distribution
- Affected conditions
- Trending direction

Example:
```
Title: "UnitedHealthcare Patterns"
Insight: "87 reports involving this insurer"
Statistic: "68% denial rate"
Severity: High
Trending: Up
Regions: ["US West", "US Midwest", "US Northeast"]
Conditions: ["Fibromyalgia", "PTSD", "Chronic Pain"]
```

### 7. Medication Access Patterns
Tracks medication-specific issues:
- Biologic medications
- Opioid medications
- Antidepressants
- Stimulant medications

Example:
```
Title: "Biologic Medications Access Issues"
Insight: "134 reports about biologic medications"
Statistic: "72% denial rate for this medication type"
Severity: High
Trending: Up
Conditions: ["Rheumatoid Arthritis", "Psoriasis", "IBD"]
```

---

## 5. Pattern Trending Analysis

### Methodology

**Data Windows:**
- Recent period: Last 30 days
- Historical period: 30-60 days ago

**Calculation:**
```typescript
percentageChange = ((recentCount - historicalCount) / historicalCount) * 100

if (percentageChange > 20) → 'up'
if (percentageChange < -20) → 'down'
else → 'stable'
```

**Minimum Data Requirement:**
- Needs at least 3 contributions in either period
- Otherwise defaults to 'stable'

### Emerging Pattern Detection

A pattern is "emerging" if:
- >70% of contributions are from last 30 days
- Indicates new systemic issue requiring attention

---

## 6. Severity Calculation

### Algorithm

```typescript
function calculateSeverity(denialRate, frequency, userCount) {
  // Urgent: >80% denial OR >500 users with >50% denial
  if (denialRate > 80 || (userCount > 500 && denialRate > 50)) {
    return 'urgent';
  }

  // High: >60% denial OR >200 users with >40% denial
  if (denialRate > 60 || (userCount > 200 && denialRate > 40)) {
    return 'high';
  }

  // Medium: >30% denial OR >100 users with substantial frequency
  if (denialRate > 30 || (userCount > 100 && frequency > 20)) {
    return 'medium';
  }

  // Low: everything else
  return 'low';
}
```

### Use Cases

**Urgent patterns:**
- Require immediate attention
- Flag for advocacy campaigns
- Potential regulatory action

**High severity:**
- Significant treatment access barriers
- Prioritize in UI
- Target for appeals support

**Medium severity:**
- Notable patterns worth monitoring
- Include in insights dashboard

**Low severity:**
- Informational patterns
- May still surface if other factors (trending, etc.) are notable

---

## 7. Geographic and Condition Cross-Referencing

### Region Extraction
Each pattern now includes affected regions:
- Enables "fibromyalgia denials in US Northeast" insights
- Identifies geographic clustering
- Helps local advocacy groups

### Condition Association
Each pattern links to related conditions:
- Shows which conditions face specific barriers
- Enables targeted resources
- Builds condition-specific advocacy

### Example Cross-Referenced Pattern

```typescript
{
  id: "denial_insufficient_evidence",
  type: "denial_reason",
  title: "Common Denial Reason",
  insight: "Insufficient medical evidence",
  denialRate: 67,
  severity: "high",
  trending: "up",
  regions: ["US West", "US Midwest", "Central Canada"],
  conditions: ["Fibromyalgia", "PTSD", "Chronic Fatigue Syndrome"],
  metadata: {
    isEmerging: false,
    timeToDecisionDays: 47
  }
}
```

This tells users:
- 67% denial rate for this reason
- Trending upward (getting worse)
- Affects 3 geographic regions
- Common for fibromyalgia, PTSD, and CFS
- Average 47-day decision time

---

## Privacy Safeguards Maintained

All enhancements preserve existing privacy protections:

1. **50-user minimum threshold** - Never show patterns with <50 estimated users
2. **PII removal** - All names, addresses, dates stripped
3. **Region-level geography** - Never city/address, only broad regions
4. **Relative timestamps** - "days ago" not absolute dates
5. **User opt-out** - Can withdraw anytime
6. **Anonymous contributions** - No user IDs in patterns
7. **Local-first** - Phase 2 stores locally, server aggregation in Phase 3

---

## Implementation Notes

### All Pattern Types Now Include

Every pattern detection block now calculates:
- `trending` - Up/down/stable
- `denialRate` - 0-100 percentage
- `severity` - Low/medium/high/urgent
- `regions` - Geographic areas
- `conditions` - Associated conditions
- `metadata.isEmerging` - New pattern flag
- `metadata.timeToDecisionDays` - Avg delay

### Helper Functions Added

1. `calculateSeverity()` - Determines severity level
2. `extractRegions()` - Collects regions for pattern
3. `extractConditions()` - Collects conditions for pattern
4. `calculateDenialRate()` - Computes denial percentage
5. `isEmergingPattern()` - Detects new patterns
6. `calculateAvgTimeToDecision()` - Avg timeline delay

### Pattern Scoring Enhanced

The `scorePattern()` function now considers:
- Denial rate (0-20 points)
- Severity level (0-15 points)
- Trending direction (+5 for 'up')
- Geographic spread (0-5 points)
- All previous factors (frequency, user count, recency, type)

---

## Testing Recommendations

1. **Test with synthetic data** covering:
   - Multiple conditions (fibromyalgia, PTSD, etc.)
   - Multiple insurers (BCBS, Aetna, etc.)
   - Multiple medications (Humira, opioids, etc.)
   - Geographic diversity (US West, Central Canada, etc.)
   - Time range (recent + historical for trending)

2. **Verify privacy thresholds:**
   - Confirm no patterns shown below 50 users
   - Check PII removal
   - Verify region-level geographic data

3. **Validate scoring:**
   - Urgent severity patterns score highest
   - Trending up patterns get bonus
   - Multi-region patterns score higher

4. **Check emerging pattern detection:**
   - New patterns (>70% last 30 days) flagged
   - Older stable patterns not flagged

---

## Next Steps (Phase 3)

When moving to server-side aggregation:

1. **Add actual user counting** (replace estimated users)
2. **Cross-user pattern validation** (verify patterns across real user IDs)
3. **Server-side caching** (reduce client-side computation)
4. **Real-time pattern updates** (as new contributions arrive)
5. **Pattern notifications** (alert users to relevant new patterns)
6. **Advocacy campaign integration** (link urgent patterns to campaigns)

---

## File Modified

- `d:\1-EmpowrApp\empowrapp-new\empowrapp-new\services\collectiveEvidence.ts`

All changes maintain backward compatibility with existing Phase 2 implementation.
