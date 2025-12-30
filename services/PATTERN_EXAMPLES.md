# Pattern Detection Examples - Week 3-4 Enhancements

This document provides example outputs from the enhanced pattern detection algorithm, showing how the new enriched data structure provides actionable insights.

---

## Example 1: Denial Reason Pattern (Urgent Severity)

```typescript
{
  id: "denial_not_medically_necessary",
  type: "denial_reason",
  title: "Common Denial Reason",
  insight: "Not medically necessary",
  statistic: "82% of claims denied for this reason",

  // Metrics
  userCount: 156,
  frequency: 247,
  denialRate: 82,
  score: 94,

  // Analysis
  trending: "up",
  severity: "urgent",

  // Context
  regions: ["US West", "US Midwest", "US Southeast", "Central Canada"],
  conditions: [
    "Fibromyalgia",
    "Chronic Pain",
    "PTSD",
    "Chronic Fatigue Syndrome"
  ],

  solidarityMessage: "You're not alone: 156 users experienced similar denials",

  metadata: {
    reason: "Not medically necessary",
    count: 247,
    percentage: 82,
    isEmerging: false,
    timeToDecisionDays: 52
  }
}
```

**Why This Matters:**
- 82% denial rate = urgent severity
- Trending up = getting worse
- 4 geographic regions = widespread issue
- 4 conditions affected = systemic problem
- 52-day average delay = prolonged suffering
- Score 94/100 = top priority for advocacy

---

## Example 2: Insurance Company Pattern (High Severity)

```typescript
{
  id: "insurer_pattern_insurer_bluecross",
  type: "insurance_pattern",
  title: "Bluecross Patterns",
  insight: "134 reports involving this insurer",
  statistic: "68% denial rate",

  // Metrics
  userCount: 89,
  frequency: 134,
  denialRate: 68,
  score: 81,

  // Analysis
  trending: "stable",
  severity: "high",

  // Context
  regions: ["US Northeast", "US Southeast", "US Midwest"],
  conditions: [
    "Rheumatoid Arthritis",
    "Psoriasis",
    "Multiple Sclerosis",
    "Inflammatory Bowel Disease"
  ],

  solidarityMessage: "134 users reported experiences with this insurer",

  metadata: {
    insurer: "bluecross",
    count: 134,
    isEmerging: false,
    timeToDecisionDays: 38
  }
}
```

**Why This Matters:**
- 68% denial rate for specific insurer
- Affects autoimmune conditions disproportionately
- 3-region pattern = regional policy issue
- Stable trend = ongoing systematic problem
- Can fuel insurer-specific advocacy campaigns

---

## Example 3: Medication Access Pattern (High Severity, Emerging)

```typescript
{
  id: "medication_pattern_medication_biologic",
  type: "insurance_pattern",
  title: "Biologic Medications Access Issues",
  insight: "97 reports about biologic medications",
  statistic: "74% denial rate for this medication type",

  // Metrics
  userCount: 71,
  frequency: 97,
  denialRate: 74,
  score: 88,

  // Analysis
  trending: "up",
  severity: "high",

  // Context
  regions: ["US West", "US Northeast", "Central Canada"],
  conditions: [
    "Rheumatoid Arthritis",
    "Psoriasis",
    "Inflammatory Bowel Disease",
    "Psoriatic Arthritis"
  ],

  solidarityMessage: "97 users reported similar medication access challenges",

  metadata: {
    medication_type: "Biologic Medications",
    count: 97,
    isEmerging: true,  // NEW PATTERN!
    timeToDecisionDays: 61
  }
}
```

**Why This Matters:**
- 74% denial rate for expensive biologics
- EMERGING pattern (>70% contributions in last 30 days)
- Trending up = rapidly worsening
- 61-day average delay = severe treatment gap
- Affects multiple autoimmune conditions
- High score despite lower frequency = immediate priority

---

## Example 4: Condition-Specific Pattern (High Severity)

```typescript
{
  id: "condition_fibromyalgia",
  type: "condition_pattern",
  title: "Fibromyalgia Claims",
  insight: "73% denial rate for Fibromyalgia",
  statistic: "89 of 122 claims denied",

  // Metrics
  userCount: 84,
  frequency: 122,
  denialRate: 73,
  score: 86,

  // Analysis
  trending: "up",
  severity: "high",

  // Context
  regions: ["US West", "US Midwest", "US Southeast", "Central Canada", "UK England"],
  conditions: ["Fibromyalgia"],

  solidarityMessage: "122 users with Fibromyalgia shared their experience",

  metadata: {
    condition: "Fibromyalgia",
    denials: 89,
    total: 122,
    percentage: 73,
    isEmerging: false,
    timeToDecisionDays: 49
  }
}
```

**Why This Matters:**
- 73% denial rate for specific condition
- 5 geographic regions = international issue
- Trending up = worsening problem
- Validates fibromyalgia patients' experiences
- Can fuel condition-specific advocacy
- Shows systemic bias against fibromyalgia

---

## Example 5: Timeline Delay Pattern (Medium Severity)

```typescript
{
  id: "delay_medicare",
  type: "timeline_delay",
  title: "Medicare Timeline Delays",
  insight: "Average 67 days from submission to decision",
  statistic: "Medicare claims: 67 days average",

  // Metrics
  userCount: 103,
  frequency: 78,
  denialRate: 45,
  score: 72,

  // Analysis
  trending: "stable",
  severity: "medium",

  // Context
  regions: ["US Southeast", "US Southwest", "US Midwest"],
  conditions: [
    "Diabetes",
    "Cancer",
    "Chronic Pain",
    "Parkinson's Disease"
  ],

  solidarityMessage: "78 users reported similar delays",

  metadata: {
    insurance: "Medicare",
    avgDelay: 67,
    count: 78,
    isEmerging: false,
    timeToDecisionDays: 67
  }
}
```

**Why This Matters:**
- 67-day average delay = 2+ months waiting
- 45% denial rate after long wait
- Affects elderly/disabled (Medicare) population
- 4 chronic conditions = prolonged suffering
- Medium severity but high impact on vulnerable

---

## Example 6: Missing Documentation Pattern (Medium Severity)

```typescript
{
  id: "missing_medical_records",
  type: "missing_docs",
  title: "Common Documentation Request",
  insight: "Medical records",
  statistic: "Requested in 42% of cases",

  // Metrics
  userCount: 127,
  frequency: 156,
  denialRate: 38,
  score: 65,

  // Analysis
  trending: "stable",
  severity: "medium",

  // Context
  regions: ["US West", "US Northeast", "US Midwest", "Central Canada"],
  conditions: [
    "Chronic Pain",
    "Fibromyalgia",
    "PTSD",
    "Rheumatoid Arthritis",
    "Anxiety"
  ],

  solidarityMessage: "156 users asked for this documentation",

  metadata: {
    doc: "Medical records",
    count: 156,
    percentage: 42,
    isEmerging: false,
    timeToDecisionDays: 34
  }
}
```

**Why This Matters:**
- Most commonly requested documentation
- 38% still get denied after providing records
- Affects 5 different conditions
- Can create "documentation checklist" resource
- Helps users prepare complete submissions

---

## Example 7: Geographic Trend Pattern (Low Severity)

```typescript
{
  id: "region_us_west",
  type: "geographic_trend",
  title: "US West Activity",
  insight: "243 contributions from US West",
  statistic: "34% of total contributions",

  // Metrics
  userCount: 178,
  frequency: 243,
  denialRate: 52,
  score: 58,

  // Analysis
  trending: "up",
  severity: "medium",

  // Context
  regions: ["US West"],
  conditions: [
    "Chronic Pain",
    "Fibromyalgia",
    "PTSD",
    "Anxiety",
    "Depression",
    "Rheumatoid Arthritis"
  ],

  solidarityMessage: "243 users in US West contributed",

  metadata: {
    region: "US West",
    count: 243,
    percentage: 34,
    isEmerging: false,
    timeToDecisionDays: 44
  }
}
```

**Why This Matters:**
- 52% denial rate in region
- Trending up = regional worsening
- 6 conditions = diverse patient population
- Can connect users with regional advocacy
- Identifies state-level policy opportunities

---

## Example 8: Emerging Pattern Alert (Urgent)

```typescript
{
  id: "denial_step_therapy",
  type: "denial_reason",
  title: "Common Denial Reason",
  insight: "Step therapy requirement",
  statistic: "86% of claims denied for this reason",

  // Metrics
  userCount: 64,
  frequency: 48,
  denialRate: 86,
  score: 91,

  // Analysis
  trending: "up",
  severity: "urgent",

  // Context
  regions: ["US West", "US Northeast"],
  conditions: [
    "Rheumatoid Arthritis",
    "Psoriasis",
    "Inflammatory Bowel Disease"
  ],

  solidarityMessage: "You're not alone: 64 users experienced similar denials",

  metadata: {
    reason: "Step therapy requirement",
    count: 48,
    percentage: 86,
    isEmerging: true,  // ⚠️ NEW PATTERN - LAST 30 DAYS
    timeToDecisionDays: 71
  }
}
```

**Why This Matters:**
- EMERGING pattern = new systematic issue
- 86% denial rate = urgent severity
- Trending up = rapidly accelerating
- 71-day delay = patients forced to fail on cheaper drugs first
- Lower frequency (48) but URGENT because:
  - Very recent pattern
  - Extremely high denial rate
  - Affects biologics/expensive treatments
- Requires immediate advocacy attention

---

## Pattern Priority Ranking

Based on the enhanced scoring algorithm, patterns would be displayed in this order:

1. **Score 94** - "Not medically necessary" denials (Urgent, Up, 4 regions)
2. **Score 91** - Step therapy denials (Urgent, Up, Emerging)
3. **Score 88** - Biologic medication access (High, Up, Emerging)
4. **Score 86** - Fibromyalgia denials (High, Up, 5 regions)
5. **Score 81** - Blue Cross patterns (High, Stable, 3 regions)
6. **Score 72** - Medicare delays (Medium, Stable, 4 regions)
7. **Score 65** - Missing medical records (Medium, Stable, 4 regions)
8. **Score 58** - US West geographic trend (Medium, Up, 1 region)

---

## UI Display Recommendations

### Urgent Severity Badge
```
🔴 URGENT | Trending ↑ | 82% denial rate | NEW PATTERN
```

### High Severity Badge
```
🟠 HIGH | Trending ↑ | 68% denial rate
```

### Medium Severity Badge
```
🟡 MEDIUM | Stable | 45% denial rate
```

### Pattern Card Layout
```
┌─────────────────────────────────────────────┐
│ 🔴 URGENT                        Score: 94  │
│ Common Denial Reason - Trending ↑           │
│                                             │
│ Not medically necessary                     │
│ 82% of claims denied for this reason        │
│                                             │
│ 📊 156 users • 247 reports • 52 days avg   │
│ 📍 US West, Midwest, Southeast, Canada     │
│ 🏥 Fibromyalgia, Chronic Pain, PTSD        │
│                                             │
│ You're not alone: 156 users experienced    │
│ similar denials                            │
│                                             │
│ [ View Details ] [ Join Campaign ]         │
└─────────────────────────────────────────────┘
```

---

## Actionable Insights

The enhanced pattern data enables:

1. **User Education** - "Fibromyalgia claims have 73% denial rate - here's how to strengthen your case"

2. **Advocacy Campaigns** - "82% of 'not medically necessary' denials trending up - sign petition"

3. **Geographic Organizing** - "Connect with 243 users in US West facing similar issues"

4. **Condition-Specific Support** - "Rheumatoid arthritis patients: 68% biologic denial rate - appeal templates available"

5. **Insurer Accountability** - "Blue Cross 68% denial rate - join campaign for policy change"

6. **Emerging Issue Alerts** - "🚨 NEW: Step therapy denials up 86% in last 30 days"

7. **Documentation Guidance** - "Medical records requested in 42% of cases - here's what to include"

8. **Timeline Expectations** - "Medicare claims average 67 days - plan accordingly"

---

## Privacy Verification

All examples maintain privacy safeguards:
- ✅ No user IDs or personal information
- ✅ Region-level geography only (never city/address)
- ✅ Estimated user counts (will be actual in Phase 3)
- ✅ Relative timeframes ("last 30 days" not specific dates)
- ✅ Only shown when 50+ user threshold met
- ✅ All PII stripped from insights

---

## Testing Checklist

- [ ] Verify urgent patterns score highest
- [ ] Confirm emerging patterns flagged correctly
- [ ] Check trending calculation (up/down/stable)
- [ ] Validate severity levels (low/medium/high/urgent)
- [ ] Test geographic clustering (regions array)
- [ ] Verify condition cross-referencing (conditions array)
- [ ] Check denial rate calculations
- [ ] Validate time-to-decision averages
- [ ] Ensure privacy thresholds enforced (50+ users)
- [ ] Test pattern sorting (by score, then frequency)

---

These examples demonstrate how the enhanced pattern detection provides actionable, privacy-preserving insights that empower users and fuel advocacy efforts.
