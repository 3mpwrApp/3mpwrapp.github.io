# Push Notification Strategy

## Overview

Push notifications are critical for user engagement and retention, but must be used thoughtfully for users with disabilities who may experience sensory overload or cognitive fatigue.

## Core Principles

### 1. Respect User Energy & Attention
- Never send notifications during user's "low energy" periods (if tracked)
- Limit to essential notifications by default
- Provide granular controls for each notification type

### 2. Accessibility First
- All notifications must be screen-reader friendly
- Avoid emoji-only notifications
- Keep text concise (under 50 characters ideal)

### 3. User Control
- Easy one-tap mute for 24 hours
- Per-category opt-out
- Quiet hours (default: 10pm - 8am)

---

## Notification Categories

### 🔴 Critical (Always On by Default)
- **Deadline Reminders**: "Appeal due in 24 hours"
- **Appointment Reminders**: "Dr. Smith tomorrow at 10am"
- **Safety Alerts**: App security updates

### 🟡 Important (On by Default, Easy to Disable)
- **Mood Check-ins**: "Evening check-in: How are you feeling?"
- **Medication Reminders**: "Time for evening meds"
- **Pacing Alerts**: "You've been active for 2 hours - consider a break"

### 🟢 Optional (Off by Default)
- **Community Updates**: "New post in your group"
- **Feature Announcements**: "New: Evidence Locker improvements"
- **Engagement Nudges**: "You haven't logged in 3 days"

### ⚪ Never Send
- Marketing/promotional content
- "You're missing out" guilt-trip messages
- Generic "Come back" notifications

---

## Timing Strategy

### Smart Scheduling
```
Morning (8-10am):   Daily planning reminders, medication
Midday (12-2pm):    Energy check-ins, pacing reminders
Evening (6-8pm):    Mood check-ins, wind-down prompts
Night (10pm+):      SILENT unless critical
```

### Frequency Limits
- Max 3 notifications per day (non-critical)
- Max 1 notification per hour
- No back-to-back notifications within 15 minutes

### Energy-Aware Notifications
If user has logged low energy/mood:
- Reduce notification frequency by 50%
- Skip engagement nudges entirely
- Only send support-focused messages

---

## Message Templates

### Deadline Reminders
```
Title: ⏰ Deadline Tomorrow
Body: Your [type] deadline is in 24 hours. Tap to review.

Title: 🚨 Deadline Today
Body: [Deadline name] is due today. You've got this!
```

### Wellness Check-ins
```
Title: Evening Check-in
Body: How was your day? Log your mood in 30 seconds.

Title: Energy Reminder
Body: You've been going for a while. Consider a 10-min break.
```

### Positive Reinforcement
```
Title: 🎉 Streak Milestone
Body: 7 days of mood tracking! Your consistency is powerful.

Title: Progress Update
Body: You've completed 3 advocacy tasks this week. Great work!
```

### Supportive Messages (Low Energy Days)
```
Title: We're Here
Body: Noticed you've had a tough week. No pressure - just checking in.

Title: Self-Care Reminder
Body: It's okay to rest. Your wellbeing comes first. 💙
```

---

## Technical Implementation

### Services Used
- `services/notifications.ts` - Core notification handling
- `services/notificationPreferences.ts` - User preferences
- `services/smartNotifications.ts` - Intelligent timing
- `services/expoPush.ts` - Expo push token management

### Key Functions
```typescript
// Send notification with smart timing
await sendSmartNotification({
  type: 'deadline_reminder',
  title: 'Deadline Tomorrow',
  body: 'Your appeal is due in 24 hours',
  data: { screen: 'deadlines', id: '123' },
});

// Check if user should receive notification now
const shouldSend = await shouldDeliverNotification({
  category: 'wellness',
  urgency: 'normal',
});

// Update user preferences
await updateNotificationPreferences({
  deadlines: true,
  wellness: true,
  community: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
});
```

---

## A/B Testing Ideas

1. **Emoji vs No Emoji**: Test if emojis improve open rates
2. **Personalized vs Generic**: "Hi \[Name\]" vs standard greeting
3. **Time of Day**: Morning vs evening for wellness reminders
4. **Message Tone**: Supportive vs actionable language

---

## Metrics to Track

### Engagement
- Open rate per category
- Time to open
- Action completion after notification

### User Satisfaction
- Opt-out rates by category
- Mute frequency
- NPS correlation with notification frequency

### Retention
- 7-day retention by notification cohort
- Re-engagement success rate

---

## Anti-Patterns to Avoid

❌ "You haven't opened the app in 3 days!"
❌ "Your friends are waiting for you"
❌ "Don't miss out on new features!"
❌ Multiple notifications for same event
❌ Notifications that require immediate action
❌ Guilt-inducing language
❌ Notifications during quiet hours (except critical)

---

## Accessibility Considerations

### Screen Reader Compatibility
- Use descriptive, complete sentences
- Avoid special characters that read poorly
- Include context in the notification body

### Cognitive Load
- One clear action per notification
- Avoid time pressure language
- Provide easy dismiss/snooze options

### Sensory Considerations
- Allow haptic-only notifications
- Support silent notification mode
- Respect system accessibility settings

---

## Implementation Checklist

- [ ] Default preferences configured
- [ ] Quiet hours implemented
- [ ] Per-category opt-out UI
- [ ] Smart timing algorithm active
- [ ] Energy-aware scheduling
- [ ] Analytics tracking
- [ ] A/B test framework integration
- [ ] Accessibility audit complete
