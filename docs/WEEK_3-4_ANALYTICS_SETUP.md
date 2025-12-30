# Week 3-4: Analytics Setup for Phase 2

**Timeline**: January 5-18, 2026
**Goal**: Measure Phase 2 evidence-first design impact
**Owner**: Development Team

---

## Overview

This document outlines the analytics setup needed to measure Phase 2 success metrics and inform future product decisions.

---

## Metrics Framework

### Category 1: Evidence Collection Metrics

| Metric | Definition | Target | Measurement | Priority |
|--------|------------|--------|-------------|----------|
| **Time to First Evidence** | Time from app install to first evidence save | <2 minutes | Firebase timestamp delta | P0 |
| **Evidence Count per User** | Average number of evidence notes per user | 5+ notes | Firestore query | P0 |
| **Evidence Retention Rate** | % of users who return to add more evidence | 60%+ | Weekly cohort analysis | P1 |
| **Evidence Completion Rate** | % of started evidence notes that are saved | 80%+ | Event tracking | P2 |

### Category 2: Collective Evidence Metrics

| Metric | Definition | Target | Measurement | Priority |
|--------|------------|--------|-------------|----------|
| **Opt-In Rate** | % of eligible users who opt in | 40%+ | AsyncStorage → Analytics | P0 |
| **Opt-In Trigger Accuracy** | % of opt-in banners shown at exactly 3 evidence | 95%+ | Event tracking | P1 |
| **Contribution Count** | Total contributions from opted-in users | 100+ in 30 days | Firestore count | P0 |
| **Opt-Out Rate** | % of opted-in users who opt out | <10% | Event tracking | P2 |
| **Dashboard Engagement** | % of opted-in users who view dashboard | 70%+ | Page view tracking | P1 |

### Category 3: Home Screen Engagement

| Metric | Definition | Target | Measurement | Priority |
|--------|------------|--------|-------------|----------|
| **Hero CTA Click-Through Rate** | % of home screen views that click hero CTA | 80%+ | Event tracking | P0 |
| **Evidence Timeline Interaction** | % of users who tap evidence timeline widget | 50%+ | Event tracking | P1 |
| **Next Best Action CTR** | % of users who click next best action card | 60%+ | Event tracking | P1 |
| **Quick Action Usage** | Distribution of quick action button clicks | - | Event tracking | P2 |

### Category 4: Pattern Detection Performance

| Metric | Definition | Target | Measurement | Priority |
|--------|------------|--------|-------------|----------|
| **Users Above Threshold** | Number of users contributing when 50+ total | 50+ users | AsyncStorage query | P0 |
| **Patterns Detected** | Number of unique patterns detected | 3-5 initially | Algorithm output | P0 |
| **Pattern Accuracy** | % of patterns that are actionable/meaningful | >90% | Manual review | P1 |
| **Pattern Card Engagement** | Average time spent on pattern cards | 30+ seconds | Time tracking | P2 |

---

## Implementation Plan

### Phase 1: Event Tracking Setup (Week 3, Days 1-3)

**Files to Modify**:

1. **`app/(tabs)/index.tsx`** - Home Screen Events
```typescript
import analytics from '@react-native-firebase/analytics';

// Track hero CTA clicks
const handleHeroCTAPress = async () => {
  await analytics().logEvent('evidence_hero_cta_click', {
    screen: 'home',
    evidence_count: evidenceCount,
    user_type: evidenceCount === 0 ? 'new' : 'returning'
  });
  router.push('/(tabs)/advocacy/evidence-locker');
};

// Track evidence timeline interactions
const handleViewAllEvidence = async () => {
  await analytics().logEvent('evidence_timeline_view_all', {
    evidence_count: evidenceCount,
    recent_evidence_count: recentEvidence.length
  });
  router.push('/(tabs)/advocacy/evidence-locker');
};

// Track next best action clicks
const handleNextActionPress = async (action: string) => {
  await analytics().logEvent('next_best_action_click', {
    action_type: action,
    evidence_count: evidenceCount
  });
};
```

2. **`components/CollectiveEvidenceOptIn.tsx`** - Opt-In Events
```typescript
import analytics from '@react-native-firebase/analytics';

// Track opt-in banner shown
useEffect(() => {
  analytics().logEvent('collective_opt_in_banner_shown', {
    evidence_count: evidenceCount,
    trigger_reason: evidenceCount >= 3 ? 'threshold_met' : 'manual'
  });
}, [evidenceCount]);

// Track opt-in button clicks
const handleOptIn = async () => {
  await analytics().logEvent('collective_opt_in_accepted', {
    evidence_count: evidenceCount,
    source: 'banner'
  });
  await optIn();
  onOptIn();
};

// Track "Learn More" clicks
const handleLearnMore = () => {
  analytics().logEvent('collective_opt_in_learn_more', {
    evidence_count: evidenceCount
  });
  setShowPrivacyModal(true);
};

// Track "Not Now" clicks
const handleNotNow = () => {
  analytics().logEvent('collective_opt_in_declined', {
    evidence_count: evidenceCount,
    reason: 'not_now'
  });
  onDismiss();
};
```

3. **`app/(tabs)/community/collective-evidence.tsx`** - Dashboard Events
```typescript
import analytics from '@react-native-firebase/analytics';

// Track dashboard views
useEffect(() => {
  analytics().logEvent('collective_dashboard_view', {
    opted_in: userStats?.optedIn || false,
    contribution_count: userStats?.contributionCount || 0,
    patterns_available: insights?.patterns.length || 0
  });
}, [userStats, insights]);

// Track pattern card clicks
const handlePatternPress = useCallback((pattern: DetectedPattern) => {
  analytics().logEvent('collective_pattern_view', {
    pattern_type: pattern.type,
    frequency: pattern.frequency,
    user_count: pattern.userCount
  });
}, []);

// Track opt-out clicks
const handleOptOut = useCallback(async () => {
  await analytics().logEvent('collective_opt_out', {
    contribution_count: userStats?.contributionCount || 0,
    days_opted_in: userStats?.lastContribution
      ? Math.floor((Date.now() - userStats.lastContribution) / 86400000)
      : 0
  });
  await optOut();
  router.back();
}, [userStats, router]);
```

4. **`services/collectiveEvidence.ts`** - Contribution Events
```typescript
import analytics from '@react-native-firebase/analytics';

export async function contributeEvidence(evidenceText: string): Promise<void> {
  // ... existing PII removal logic ...

  await analytics().logEvent('collective_contribution_submitted', {
    themes_count: contribution.themes.length,
    has_denial_reason: !!contribution.denialReason,
    has_timeline: !!contribution.timelineDelayDays,
    region: contribution.region
  });

  // ... save contribution ...
}
```

### Phase 2: Custom Dashboards (Week 3, Days 4-5)

**Create Admin Analytics Dashboard**:

File: `app/(tabs)/settings/admin-analytics.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import analytics from '@react-native-firebase/analytics';
import { getCollectiveInsights, getUserContributionStats } from '../../../services/collectiveEvidence';

export default function AdminAnalyticsScreen() {
  const [evidenceMetrics, setEvidenceMetrics] = useState(null);
  const [collectiveMetrics, setCollectiveMetrics] = useState(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    // Load from Firestore/AsyncStorage
    // Calculate aggregates
    // Display in cards
  };

  return (
    <ScrollView>
      {/* Evidence Collection Metrics */}
      <MetricCard title="Evidence Collection">
        <Metric label="Avg Evidence per User" value="5.2" target="5+" />
        <Metric label="Time to First Evidence" value="1:45" target="<2:00" />
        <Metric label="Retention Rate" value="67%" target="60%" />
      </MetricCard>

      {/* Collective Evidence Metrics */}
      <MetricCard title="Collective Evidence">
        <Metric label="Opt-In Rate" value="42%" target="40%" />
        <Metric label="Total Contributions" value="127" target="100" />
        <Metric label="Users Above Threshold" value="52" target="50" />
      </MetricCard>

      {/* Home Screen Metrics */}
      <MetricCard title="Home Screen">
        <Metric label="Hero CTA Click Rate" value="83%" target="80%" />
        <Metric label="Timeline Interaction" value="54%" target="50%" />
        <Metric label="Next Action CTR" value="61%" target="60%" />
      </MetricCard>
    </ScrollView>
  );
}
```

### Phase 3: User Timing Metrics (Week 4, Days 1-2)

**Measure Time to First Evidence**:

```typescript
// In app/_layout.tsx or app/(tabs)/_layout.tsx
import analytics from '@react-native-firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

useEffect(() => {
  const trackInstallTime = async () => {
    const installTime = await AsyncStorage.getItem('app_install_time');
    if (!installTime) {
      await AsyncStorage.setItem('app_install_time', Date.now().toString());
    }
  };
  trackInstallTime();
}, []);

// In evidence save function
const saveEvidence = async (evidenceText: string) => {
  const installTime = await AsyncStorage.getItem('app_install_time');
  const firstEvidenceSaved = await AsyncStorage.getItem('first_evidence_saved');

  if (!firstEvidenceSaved && installTime) {
    const timeToFirstEvidence = Date.now() - parseInt(installTime);
    await analytics().logEvent('time_to_first_evidence', {
      seconds: Math.floor(timeToFirstEvidence / 1000),
      minutes: Math.floor(timeToFirstEvidence / 60000)
    });
    await AsyncStorage.setItem('first_evidence_saved', 'true');
  }

  // ... save evidence logic ...
};
```

### Phase 4: A/B Testing Setup (Week 4, Days 3-5) - OPTIONAL

**Use Firebase Remote Config**:

```typescript
import remoteConfig from '@react-native-firebase/remote-config';

// In app/(tabs)/index.tsx
const [showEvidenceFirstDesign, setShowEvidenceFirstDesign] = useState(true);

useEffect(() => {
  const loadRemoteConfig = async () => {
    await remoteConfig().setDefaults({
      show_evidence_first_design: true
    });

    await remoteConfig().fetchAndActivate();
    const value = remoteConfig().getValue('show_evidence_first_design');
    setShowEvidenceFirstDesign(value.asBoolean());
  };

  loadRemoteConfig();
}, []);

return (
  <View>
    {showEvidenceFirstDesign ? (
      <EvidenceFirstHomeScreen />
    ) : (
      <OriginalHomeScreen />
    )}
  </View>
);
```

---

## Data Collection & Privacy

### Privacy Compliance

All analytics follow these principles:
- ✅ No PII collected (no names, emails, addresses)
- ✅ Device IDs anonymized
- ✅ User can opt out of analytics in Settings
- ✅ Data retention: 90 days (Firebase default)
- ✅ GDPR compliant (Firebase Analytics is certified)

### Data Access

- **Development Team**: Full access to aggregated metrics
- **Founder**: Dashboard view only
- **Third Parties**: No access

### Data Retention

- **Event Data**: 90 days (Firebase Analytics)
- **User Properties**: Until user deletion
- **Aggregated Reports**: Indefinite (no PII)

---

## Success Criteria

**Week 3 End**:
- ✅ All events tracking correctly
- ✅ Admin dashboard shows real-time metrics
- ✅ Time to first evidence measured
- ✅ Opt-in rate baseline established

**Week 4 End**:
- ✅ 30-day retention cohort tracked
- ✅ Pattern detection metrics showing
- ✅ A/B test running (if applicable)
- ✅ Actionable insights for Week 5+

---

## Monitoring & Alerts

**Set up alerts for**:
- Opt-in rate drops below 30%
- Time to first evidence exceeds 3 minutes
- Hero CTA click rate drops below 70%
- Opt-out rate exceeds 15%

**Tools**:
- Firebase Analytics console
- Admin dashboard in-app
- Weekly Slack reports (if integrated)

---

## Next Steps (After Week 4)

1. **Analyze Results**:
   - Compare Phase 2 metrics to pre-Phase 2 baseline
   - Identify bottlenecks in evidence collection flow
   - Review pattern detection accuracy

2. **Iterate**:
   - Adjust hero CTA based on click data
   - Refine opt-in banner timing/messaging
   - Improve pattern detection algorithm

3. **Report**:
   - Create Phase 2 impact report
   - Share with stakeholders
   - Plan Phase 3 improvements

---

**End of Analytics Setup Plan**
