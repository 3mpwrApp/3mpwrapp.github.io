# Wellness Features Overview

**Last Updated**: November 4, 2025  
**Version**: 1.0.0-rc.2

This app ships a comprehensive set of lightweight, evidence-informed wellness tools aimed at accessibility and pacing. All data stays on-device unless exported. **NEW**: Enhanced with AI pattern detection, energy forecasting, and cross-feature integration.

## 🧠 AI-Enhanced Wellness Tools (NEW - Nov 2025)

### Mood Tracker 2.0 with AI Pattern Detection
**Location**: `app/(tabs)/wellness.mood.tsx`

- **AI Pattern Recognition**: Automatically detects mood trends (improving, declining, stable, volatile)
- **External Factor Tracking**: 
  - Sleep hours (numeric input)
  - Weather conditions (sunny, cloudy, rainy, snowy, stormy)
  - Exercise minutes
  - Social interactions (0-5 scale)
- **Trigger Identification**: AI correlates external factors with mood changes
- **Context-Aware Coping Strategies**: Personalized suggestions based on mood score:
  - Score ≤-1: Deep breathing, grounding exercises, crisis resources, DBT skills
  - Score 0: Pacing partner, self-care library, mindfulness techniques
  - Score ≥1: Social connection, advocacy hub, gentle exercise, gratitude practices
- **Gamification**: 
  - Streak tracking for consistent logging
  - Volatility analysis and stability patterns
  - 24-hour mood delta tracking
- **Insights Toggle**: View comprehensive insights after 3+ entries
- **Feature Recommendations**: Contextual suggestions displayed after mood selection
- **Full i18n Support**: All strings translatable via `locales/*/common.json` under `mood.*`

### Pacing Partner with AI Energy Forecasting
**Location**: `app/(tabs)/wellness/pacing-partner.tsx`

- **Smart Energy Forecasting**: 
  - Predicts energy by hour (8am, 12pm, 5pm, 8pm)
  - Based on 7+ days of activity history
  - Uses weighted pattern analysis
- **Adaptive Pacing Suggestions**: 
  - Real-time adjustments when logging high fatigue (>7) or pain (>7)
  - Immediate rest recommendations
  - Gentle stretching and breathing exercises
- **Body-Mind Sync Analysis**: 
  - Correlates recent mood entries with activity patterns
  - "Aligned" status: Activity and mood in harmony
  - "Misaligned" warnings: Suggests gentler activities
- **Compassion Mode**: 
  - Empathetic validation messages
  - "Your body is asking for rest - that's wisdom, not weakness"
  - Reduces guilt around rest days
- **Achievement System**: 
  - Consistent pacing (5+ days/week logged)
  - Balanced weeks (activities + rest days)
  - Rest days honored (intentional rest tracking)
- **Alert System**: 
  - Info/Warning/Critical severity levels
  - Color-coded alerts (themed with palette tokens)
  - Actionable suggestions for each alert level
- **CSV Export**: Export all pacing data with full accessibility support

## 🎯 Original Wellness Tools

### Ambience Sync AI
**Location**: `app/(tabs)/wellness/ambience.tsx`

Suggests in-app ambience based on mood trends

### Dream Tracker & Interpreter
**Location**: `app/(tabs)/wellness/dreams.tsx`

Log dreams and view symbolic interpretations

### Resilience Points
**Location**: `app/(tabs)/wellness/resilience.tsx`

Track micro-wins across therapeutic skills

### DBT Skill Matcher
**Location**: `app/(tabs)/wellness/dbt.tsx`

Suggests skills by current emotion

### Opposite Action Companion
**Location**: `app/(tabs)/wellness/opposite-action.tsx`

Stepper for opposite-action practice

### Radical Acceptance Guide
**Location**: `app/(tabs)/wellness/radical-acceptance.tsx`

3 concise reminders to reduce suffering

### CBT Virtual Coach
**Location**: `app/(tabs)/wellness/cbt-mini-games.tsx`

Generate balanced reframes from thoughts/evidence

### Sleep Reframe
**Location**: `app/(tabs)/wellness/sleep-reframe.tsx`

Gentle tips and routines for sleep

### Pain Forecast
**Location**: `app/(tabs)/wellness/` (integration with pacing)

7-day trend summary with simple pacing suggestions

### Micro-Movement Coach
**Location**: `app/(tabs)/wellness/micro-movement.tsx`

Chair-friendly movement prompts

### Energy Coins
**Location**: `store/energyCoins.tsx`

Daily energy budgeting with spend/reset

### Distress Tolerance (TIPP)
**Location**: `app/(tabs)/wellness/distress-tolerance.tsx`

Temperature, Intense (gentle) exercise, Paced breathing, Progressive relax

### Belief Strength Meter
**Location**: `app/(tabs)/wellness/belief-meter.tsx`

Track belief intensity pre/post reframe

### CBT Mini-Games
**Location**: `app/(tabs)/wellness/cbt-mini-games.tsx`

Grounding games to shift attention

### Trigger Detector
**Location**: Integrated with mood insights

Naive correlation suggestions from recent logs

### Harm Reduction Guide
**Location**: `app/(tabs)/wellness/` (under development)

Safety planning and de-escalation tips

### Acceptance & Function Tracker
**Location**: `app/(tabs)/wellness/radical-acceptance.tsx`

Track acceptance/function over time

## 🔗 Cross-Feature Integration (NEW)

**Service**: `services/feature-integration.ts`

### 5 Smart Recommendation Engines:

1. **Mood-Based Recommendations**: 
   - Low mood (≤-1) → DBT skills, distress tolerance, crisis resources, grief support
   - Neutral (0) → Pacing partner, self-care library
   - Good mood (≥1) → Community, advocacy hub, gentle exercise

2. **Energy-Based Recommendations**: 
   - Low energy → Pacing partner, meditation, ambience, rest
   - Medium energy → Micro-movement, browse resources
   - High energy → Adaptive exercise, advocacy tools, community

3. **Wellness Flow Mapping**: 
   - DBT → Distress tolerance, Mood tracker
   - Mood → Insights, Pacing partner
   - Pacing → Micro-movement, Mood tracker
   - Meditation → Ambience, Sleep reframe

4. **Advocacy Context Recommendations**: 
   - In disagreement → Evidence locker, letter wizard, lawyer finder
   - Has evidence → Create appeal letter
   - Always → Community support

5. **Tool Completion Suggestions**: 
   - Contextual "what's next" based on current tool usage

### FeatureRecommendations Component
**Location**: `components/FeatureRecommendations.tsx`

- Horizontal scrolling recommendation cards
- Priority badges (high/medium/low)
- Expand/collapse for more suggestions
- Tap-to-navigate with expo-router
- Full accessibility (WCAG AAA compliant)

## 🎡 Daily Feature Rotation

**Service**: `services/personalization.ts`

- **26 Beta Tools** rotating daily
- **Day-of-Year Algorithm** ensures each tool gets spotlight every 26 days
- **Featured Tool Boost**: +1.5 score bonus
- **Proximity Bonuses**: Nearby tools get +0.4/distance boost
- **Maintains User Preferences**: Feedback and usage patterns still influence ranking

## 📅 Awareness Integration

**Data**: `data/disability-observances.ts`

- **30+ Observances** including Indigenous and global health days
- **Dynamic Generation** by year
- **Rich Descriptions** for education and awareness
- **Calendar Sync** via Cloudflare Workers (webcal:// subscription)

## 🧪 Testing

Examples:
- `__tests__/painForecast.test.ts`
- `__tests__/energyCoins.store.test.tsx`
- `__tests__/mood.insights.test.ts` (NEW)
- `__tests__/wellness.pacing-partner.smoke.test.tsx` (UPDATED)

**All 315 tests passing, 109 suites**

## 🌐 Navigation

Open the **Wellness tab**, then choose a tool. All strings are translatable via `locales/*/common.json` under `wellness.*`.

## 🔒 Privacy

All wellness data stays on-device unless you explicitly export it. No cloud sync required. Full data ownership and control.
