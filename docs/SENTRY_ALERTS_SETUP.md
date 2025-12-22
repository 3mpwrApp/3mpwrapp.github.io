# Sentry Performance Alerts Setup Guide

## Overview

This guide shows you how to set up performance alerts in Sentry to proactively monitor your app's health and get notified when performance degrades.

## Prerequisites

- Sentry account with Performance Monitoring enabled
- Your EmpowrApp integrated with Sentry (✅ Already done!)
- Access to Sentry project settings

## Alert Types Available

### 1. Performance Alerts
Monitor transaction performance and get alerted on degradation

### 2. Error Rate Alerts
Track error rates and spikes

### 3. Session Quality Alerts
Monitor crash-free sessions

### 4. Custom Metric Alerts
Track custom measurements (queue sizes, upload counts, etc.)

## Setting Up Alerts in Sentry Dashboard

### Step 1: Navigate to Alerts

1. Log into [Sentry.io](https://sentry.io)
2. Select your EmpowrApp project
3. Click **Alerts** in the left sidebar
4. Click **Create Alert**

### Step 2: Choose Alert Type

Select **Performance** for performance monitoring alerts.

## Recommended Alerts for EmpowrApp

### Alert 1: Slow Evidence Queue Processing

**Purpose**: Get notified when evidence upload queue takes too long

**Configuration**:
```
Alert Type: Performance
Metric: Transaction Duration (p95)
Transaction: process_evidence_queue
Threshold: > 5000ms (5 seconds)
Time Window: 10 minutes
Environment: production
```

**Setup**:
1. Create Alert → Performance
2. Select metric: **Transaction Duration**
3. Choose aggregation: **95th percentile (p95)**
4. Filter by transaction: `transaction:process_evidence_queue`
5. Set threshold: `is above 5000ms`
6. Set time window: `for at least 10 minutes`
7. Environment: `production`
8. Name: "Slow Evidence Queue Processing"

### Alert 2: High API Failure Rate - Campaigns

**Purpose**: Get notified when campaigns API calls are failing

**Configuration**:
```
Alert Type: Performance
Metric: Failure Rate
Transaction: fetch_campaigns
Threshold: > 10%
Time Window: 5 minutes
Environment: production
```

**Setup**:
1. Create Alert → Performance
2. Select metric: **Failure Rate**
3. Filter by transaction: `transaction:fetch_campaigns`
4. Set threshold: `is above 10%`
5. Set time window: `for at least 5 minutes`
6. Environment: `production`
7. Name: "High Campaigns API Failure Rate"

### Alert 3: Authentication Performance Degradation

**Purpose**: Track slow login/authentication

**Configuration**:
```
Alert Type: Performance
Metric: Transaction Duration (p75)
Transaction: guest_signin OR refresh_claims OR user_signout
Threshold: > 3000ms
Time Window: 15 minutes
Environment: production
```

**Setup**:
1. Create Alert → Performance
2. Select metric: **Transaction Duration**
3. Choose aggregation: **75th percentile (p75)**
4. Filter by transaction: `transaction:guest_signin OR transaction:refresh_claims`
5. Set threshold: `is above 3000ms`
6. Set time window: `for at least 15 minutes`
7. Environment: `production`
8. Name: "Slow Authentication Operations"

### Alert 4: Data Fetch Performance Issues

**Purpose**: Monitor resource/podcast/campaign fetching

**Configuration**:
```
Alert Type: Performance
Metric: Transaction Duration (p95)
Transaction: fetch_podcasts OR fetch_resources OR fetch_campaigns
Threshold: > 2000ms
Time Window: 10 minutes
Tag: feature:podcasts OR feature:resources OR feature:campaigns
```

**Setup**:
1. Create Alert → Performance
2. Select metric: **Transaction Duration**
3. Choose aggregation: **95th percentile (p95)**
4. Filter by transaction: `transaction:fetch_*`
5. Add tag filter: `feature:podcasts OR feature:resources OR feature:campaigns`
6. Set threshold: `is above 2000ms`
7. Set time window: `for at least 10 minutes`
8. Environment: `production`
9. Name: "Slow Data Fetching"

### Alert 5: High Error Rate Across App

**Purpose**: General error monitoring

**Configuration**:
```
Alert Type: Issues
Metric: Event Frequency
All Events: Yes
Threshold: > 100 events
Time Window: 1 hour
Environment: production
```

**Setup**:
1. Create Alert → Issues
2. Select: **When the issue is seen more than**
3. Set threshold: `100 times in 1 hour`
4. Environment: `production`
5. Name: "High Error Rate"

### Alert 6: Critical Feature Errors

**Purpose**: Monitor specific features for errors

**Configuration**:
```
Alert Type: Issues
Metric: Event Frequency
Tag Filter: feature:evidence OR feature:advocacy
Threshold: > 10 events
Time Window: 15 minutes
Level: error OR fatal
Environment: production
```

**Setup**:
1. Create Alert → Issues
2. Select: **When the issue is seen more than**
3. Set threshold: `10 times in 15 minutes`
4. Add filter: `feature:evidence OR feature:advocacy`
5. Add filter: `level:error OR level:fatal`
6. Environment: `production`
7. Name: "Critical Feature Errors (Evidence/Advocacy)"

### Alert 7: Crash Rate Alert

**Purpose**: Monitor app stability

**Configuration**:
```
Alert Type: Crash Free Sessions
Metric: Crash Free Session Rate
Threshold: < 99%
Time Window: 1 hour
Environment: production
```

**Setup**:
1. Create Alert → Crash Free Sessions
2. Set threshold: `is below 99%`
3. Set time window: `for at least 1 hour`
4. Environment: `production`
5. Name: "Low Crash-Free Session Rate"

## Alert Configuration Tips

### Thresholds

**Start Conservative, Then Adjust**:
- Begin with higher thresholds to avoid alert fatigue
- Monitor for 1-2 weeks
- Adjust based on actual performance data

**Recommended Starting Thresholds**:
- P95 duration: 2-5 seconds (adjust per transaction)
- Failure rate: 10-20%
- Error count: 50-100 per hour
- Crash-free sessions: 98-99%

### Time Windows

**Balance Sensitivity vs Noise**:
- Shorter windows (5-10 min): For critical operations
- Medium windows (15-30 min): For general monitoring
- Longer windows (1 hour+): For trends and stability

### Notification Channels

**Options**:
- Email (default)
- Slack integration
- PagerDuty for critical alerts
- Webhook for custom integrations

**Setup Slack Integration**:
1. Go to **Settings** → **Integrations**
2. Find **Slack** and click **Add Installation**
3. Authorize Sentry in your Slack workspace
4. In alert rules, select Slack channel for notifications

## Alert Actions

### When You Receive an Alert

1. **Acknowledge** the alert in Sentry
2. **Investigate** using Sentry Performance tab
   - View the specific transaction
   - Check span breakdown
   - Look at breadcrumbs for context
3. **Correlate** with deployment times
   - Did this start after a recent deploy?
   - Check release version in Sentry
4. **Fix** the underlying issue
5. **Monitor** to verify fix worked
6. **Adjust threshold** if needed

## Advanced Alert Configurations

### Alert Conditions with Multiple Filters

Combine multiple conditions for precise alerts:

```
Transaction: process_evidence_queue
AND feature:evidence
AND environment:production
AND duration > 5000ms
```

### Comparison Alerts

Alert on changes compared to previous period:

```
Alert when: p95 duration increases by 50% compared to previous day
```

### Tag-Based Routing

Route alerts based on tags:

```
feature:evidence → #evidence-team channel
feature:advocacy → #advocacy-team channel
feature:auth → #security-team channel
```

## Testing Your Alerts

### Manual Testing

1. **Trigger slow operations** in dev/staging
2. **Check alert fires** within expected time window
3. **Verify notifications** arrive via configured channels
4. **Test muting/snoozing** functionality

### Sample Test Code

Add to your app temporarily:

```typescript
import { startTransaction } from '@/services/sentryLabeling';

// Simulate slow operation
const transaction = startTransaction('test_slow_operation', 'task');
await new Promise(resolve => setTimeout(resolve, 6000)); // 6 seconds
transaction?.finish();
```

## Alert Management Best Practices

### 1. Avoid Alert Fatigue

- Don't set too many alerts
- Use appropriate thresholds
- Mute during known maintenance windows
- Set up alert ownership

### 2. Review Regularly

- Weekly: Review triggered alerts
- Monthly: Adjust thresholds based on data
- Quarterly: Add/remove alerts based on priorities

### 3. Document Alert Playbooks

For each alert, document:
- What it means
- How to investigate
- Common fixes
- Who to escalate to

### 4. Use Alert Ownership

Assign alerts to specific teams or individuals for faster response.

## Sentry Alert API (Optional)

For programmatic alert management, use Sentry API:

```bash
# List alerts
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://sentry.io/api/0/organizations/YOUR_ORG/alert-rules/

# Create alert via API
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Alert","conditions":[...]}' \
  https://sentry.io/api/0/projects/YOUR_ORG/YOUR_PROJECT/alert-rules/
```

## Monitoring Your Alerts

### Alert Dashboard

Create a dashboard showing:
- Alert frequency
- Mean time to acknowledge
- Mean time to resolve
- Alert accuracy (false positive rate)

### Alert Metrics

Track over time:
- Number of alerts triggered
- Alert response times
- Resolution times
- Alert effectiveness

## Summary: Quick Start Checklist

For immediate value, set up these 3 essential alerts:

- [ ] **Slow Evidence Queue** (process_evidence_queue > 5s)
- [ ] **High Error Rate** (> 100 errors/hour)
- [ ] **Low Crash-Free Sessions** (< 99%)

**Time to setup**: ~15 minutes
**Expected value**: Immediate visibility into critical issues

## Next Steps

1. **Set up initial alerts** (use 3 essential alerts above)
2. **Configure Slack notifications** for team visibility
3. **Monitor for 1 week** and adjust thresholds
4. **Add more alerts** based on your priorities
5. **Document playbooks** for each alert type

## Resources

- [Sentry Alerts Documentation](https://docs.sentry.io/product/alerts/)
- [Performance Monitoring Alerts](https://docs.sentry.io/product/alerts/alert-types/#performance-alerts)
- [Slack Integration Guide](https://docs.sentry.io/product/integrations/notification-incidents/slack/)

---

**Alerts are now ready to configure!** Start with the 3 essential alerts and expand based on your needs.
