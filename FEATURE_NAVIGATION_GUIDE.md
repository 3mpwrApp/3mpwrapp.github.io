# 🗺️ Feature Navigation Guide

## Quick Access Map for All 8 Standout Features

---

## 🏠 Features on Home Screen

### 1. Celebrations 🎉
- **Type:** Automatic toast overlay
- **Trigger:** Appears automatically when achievements are unlocked
- **Actions:**
  - First letter → "You're an Advocate!" celebration
  - 5 letters → "Advocacy Champion!" celebration
  - 10 letters → "Advocacy Leader!" celebration
  - First evidence upload → "Evidence Secured!" celebration
  - Mood streaks, community posts, and more

### 2. AI Co-Pilot Suggestions 🤖
- **Type:** Banner cards below header
- **Appears:** When behavior patterns suggest helpful actions
- **Suggestion Types:**
  - Mood log reminders
  - Pacing break suggestions
  - Evidence capture prompts
  - Appeal deadline alerts
  - Community check-in nudges
  - Wellness tips
- **Actions:** Open, Snooze, Dismiss, Why?

---

## 📱 Bottom Tab Navigation

### Wellness Tab 💚
```
Wellness (Bottom Tab #2)
└── Spoon Marketplace ⚡
    • Energy trading community
    • Request/offer energy "spoons"
    • Balance tracking
    • Reputation system
```

### Resources Tab 📚
```
Resources (Bottom Tab #3)
└── Medical Gaslighting Detector 🩺
    • Privacy-first pattern detection
    • Analyze medical notes for dismissive language
    • Severity scoring
    • Evidence documentation
```

### Advocacy Tab ⚖️
```
Advocacy (Bottom Tab #4)
├── Coaching Section
│   ├── Self-Advocacy Coach
│   └── Negotiation Coach 🤝
│       • Step-by-step accommodation negotiation
│       • Session management
│       • Red flag tracking
│       • Script suggestions
│
└── Accountability Coach 💪
    • AI-powered accountability planning
    • Violation detection
    • Letter drafting assistance
```

---

## ⚙️ Settings Menu

### Impact Dashboard 📊
```
Settings (outside tabs)
└── Impact Dashboard
    • Gamified advocacy impact scoring
    • Level progression (Newcomer → Champion)
    • Achievement tracking
    • Visual metrics and graphs
```

**How to Access:**
1. Tap profile/settings icon (top right on most screens)
2. Scroll to "Impact Dashboard"
3. Tap to view your advocacy metrics

---

## 🎤 Global Components (Available Everywhere)

### Voice-First Interface 🎤
```
Floating Button (appears on most screens)
└── Voice Control
    • Hands-free navigation
    • Speech recognition
    • Voice commands
    • Accessibility-first

Dedicated Screen: /voice-help
└── Voice Help & Commands
    • Command reference
    • Tutorial
    • Settings
```

**How to Use:**
- Look for floating microphone button on screen
- Tap to activate voice control
- Speak your command
- See `/voice-help` for full command list

---

## 🎯 Feature Comparison Table

| Feature | Access Method | Tab/Location | Type |
|---------|---------------|--------------|------|
| 🎉 Celebrations | Automatic | Global (toast) | Reactive |
| 🤖 AI Co-Pilot | Auto-display | Home screen | Proactive |
| ⚡ Spoon Marketplace | Navigation | Wellness tab | Feature |
| 🩺 Medical Gaslighting | Navigation | Resources tab | Tool |
| 💪 Accountability Coach | Navigation | Advocacy tab | Coach |
| 🤝 Negotiation Coach | Navigation | Advocacy → Coaching | Coach |
| 📊 Impact Dashboard | Navigation | Settings | Dashboard |
| 🎤 Voice-First | Floating button | Global | Interface |

---

## 🔍 Quick Search Tips

### To Find Features:
1. **Search bar on each tab** - Search by name or keyword
2. **Advocacy hub search** - `"negotiation"` finds Negotiation Coach
3. **Settings search** - `"impact"` finds Impact Dashboard
4. **Resource search** - `"gaslighting"` finds Medical Gaslighting Detector

---

## 📲 Deep Links (for future reference)

```typescript
// Direct navigation paths
/(tabs)/wellness/spoon-marketplace
/(tabs)/resources/medical-gaslighting-detector
/(tabs)/advocacy/accountability-coach
/(tabs)/advocacy/negotiation-coach  // Note: outside (tabs) folder
/(tabs)/settings/impact-dashboard
/voice-help
```

---

## 🎓 User Journey Examples

### Scenario 1: First-Time Letter Writer
1. Open **Resources** → Letter Templates
2. Select template and fill form
3. Generate letter → **🎉 Celebration appears!** "You're an Advocate!"
4. Check **Settings** → Impact Dashboard to see your score increase

### Scenario 2: Workplace Accommodation Request
1. Open **Advocacy** tab
2. Tap **Negotiation Coach** (in Coaching section)
3. Start new session
4. Follow step-by-step guidance
5. Generate scripts and track red flags

### Scenario 3: Energy Management
1. Open **Wellness** tab
2. Tap **Spoon Marketplace**
3. Create request: "Need help with groceries this week"
4. Browse offers from community
5. Accept offer and track balance

### Scenario 4: Medical Documentation
1. Open **Resources** tab
2. Tap **Medical Gaslighting Detector**
3. Paste or type medical notes
4. Review severity score and patterns
5. Save evidence for future reference

### Scenario 5: Daily Check-In
1. Open **Home** screen
2. See **AI Co-Pilot suggestion**: "Haven't logged mood in 3 days"
3. Tap "Open" → Navigate to mood tracker
4. Complete mood entry
5. Get **🎉 Celebration** for streak milestone

---

## 🎨 Visual Cues

### Celebrations
- **Appearance:** Full-screen overlay with confetti
- **Colors:** Dynamic based on achievement type (streak=orange, milestone=gold, first-time=teal)
- **Duration:** Auto-dismiss after 3 seconds
- **Haptics:** Success vibration pattern

### AI Co-Pilot
- **Appearance:** Card with colored left border
- **Icons:** Context-specific (calendar, heart, document, etc.)
- **Priority Badge:** Red "Important" tag for high-priority suggestions
- **Layout:** Icon + message + action buttons

### Voice Button
- **Appearance:** Floating circular button (bottom-right on most screens)
- **Icon:** Microphone
- **Color:** Primary theme color
- **Animation:** Pulse effect when active

---

## 🆘 Troubleshooting

### "I can't find Negotiation Coach"
1. Go to **Advocacy** tab (bottom navigation)
2. Scroll down to **Coaching** section header
3. Should see both "Self-Advocacy Coach" and "Negotiation Coach"
4. Tap "Negotiation Coach" to open

### "Celebrations aren't appearing"
1. Ensure you've completed trigger actions (e.g., saved a letter)
2. Check home screen after action completion
3. Celebrations auto-dismiss after 3 seconds
4. May need to wait 30 seconds for check cycle

### "AI suggestions not showing"
1. Open home screen and wait a moment for load
2. Requires behavior data to generate suggestions
3. Use the app for a few days to build patterns
4. Check SafeOptionalComponent isn't hiding due to error

### "Voice button not visible"
1. Check screen - some screens hide floating buttons for space
2. Navigate to `/voice-help` directly from menu
3. Voice control may be disabled in settings

---

## 📚 Related Documentation

- `STANDOUT_FEATURES_INTEGRATION_COMPLETE.md` - Technical integration details
- `README.md` - Full app documentation
- `ACCESSIBILITY_ACHIEVEMENT_WCAG_AAA_COMPLETE.md` - Accessibility features
- Localization files in `locales/en/common.json`

---

**All 8 features are now accessible and ready to use!** 🎉
