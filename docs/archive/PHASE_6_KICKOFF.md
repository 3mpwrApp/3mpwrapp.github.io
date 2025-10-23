# Phase 6: Disability Wizard Enhancements - Kickoff

**Phase 5.5 Status:** ✅ Production Deployed (4fa8350)
**Phase 6 Start:** October 16, 2025
**Target Completion:** TBD (iterative approach)

## Executive Summary

Phase 6 extends the Disability Wizard with ML-driven personalization, profile management, and proactive engagement features. Users can now fine-tune their profiles, receive smarter suggestions with feedback loops, and get predictive recommendations based on behavior patterns.

---

## Phase 6 Requirements (8 Features)

### 1. **Profile Editing in Settings**
**Purpose:** Allow users to update their disability profile, energy patterns, and preferences after onboarding.

**Requirements:**
- Screen: `app/(tabs)/settings/profile-editor.tsx` (new)
- Allow editing of:
  - User role (from Phase 5.5)
  - Disability categories (checkboxes, multi-select)
  - Energy patterns (morning/afternoon/evening preferences)
  - Language preference
  - Notification settings
- Persist changes to Firestore (`users/{uid}/profile`)
- Validation: Prevent empty selections, validate against schema
- UX: Show "unsaved changes" warning, undo/revert buttons
- Integration: Update auth context and Redux state on save
- Accessibility: Full keyboard navigation, screen reader support

**Key Files (to create/modify):**
- `app/(tabs)/settings/profile-editor.tsx` (NEW)
- `app/(tabs)/settings/index.tsx` (add profile editor link)
- `services/firestore.ts` (add profile update methods)
- `store/auth.tsx` (add profile update actions)
- `types/index.ts` (add ProfileEditorState type)

**Dependencies:**
- Firestore write rules (already in place from Phase 5.5)
- Auth context (Phase 5.5)
- Theme colors (Phase 5.5)

---

### 2. **Suggestion Feedback System**
**Purpose:** Collect user feedback on AI suggestions to improve recommendations and power ML retraining.

**Requirements:**
- Inline feedback UI: Thumbs up/down on suggestions (global assistant)
- Detailed feedback modal:
  - Reason selection (helpful, not relevant, misleading, other)
  - Optional comment field
  - Confirmation toast
- Store feedback:
  - Firestore: `users/{uid}/feedback/{feedbackId}` with timestamp, suggestion ID, reason, comment
  - Analytics event: `feedback_provided` with feedback type and reason
- Display: Show "Thank you for feedback" message for 2 seconds
- Integration: Attach feedback to suggestion metadata for analytics

**Key Files (to create/modify):**
- `components/SuggestionFeedbackButton.tsx` (NEW)
- `components/FeedbackModal.tsx` (NEW)
- `services/firestore.ts` (add feedback storage methods)
- `utils/analytics.ts` (add feedback event)
- `app/(tabs)/community/` or `assistant/` (integrate buttons)

**Dependencies:**
- Analytics system (Phase 5.5)
- Firestore integration (Phase 5.5)
- Suggestion rendering (existing in assistant hub)

---

### 3. **Expanded Wizard Tools Registry**
**Purpose:** Extend tool discovery with new tool types for Phase 6 features (predictive, adaptive, ML-enhanced).

**Requirements:**
- New tool categories:
  - `predictive` - ML-powered forecasting tools
  - `adaptive` - Tools that learn from user behavior
  - `ml-enhanced` - Tools with ML improvements
  - `energy-aware` - Tools that respond to energy levels
- Add metadata to tools:
  - `requiresFeedback` (bool) - whether tool needs user feedback to improve
  - `mlModels` (string[]) - which ML models power the tool
  - `energyOptimal` (enum: 'low' | 'medium' | 'high') - best energy level for tool
- Update tool filtering:
  - Add `toolType` filter to discovery
  - Show tool type badges in UI
- Documentation:
  - Update `TOOL_REGISTRY.md` with new categories
  - Add schema validation for new metadata

**Key Files (to create/modify):**
- `services/toolRegistry.ts` (update schema and add new categories)
- `data/tools.ts` (add new tools with metadata)
- `components/ToolCard.tsx` (show tool type badges)
- `types/index.ts` (update Tool interface)
- `TOOL_REGISTRY.md` (document new types)

**Dependencies:**
- Existing tool registry (Phase 5.5)
- Type definitions (Phase 5.5)

---

### 4. **ML Pattern Learning Foundation**
**Purpose:** Build infrastructure to track and analyze user behavior patterns for ML predictions.

**Requirements:**
- Pattern tracking data structure:
  - Activity type (mood check, tool use, resource view, etc.)
  - Time of day (hour, day of week)
  - Duration (seconds spent)
  - Outcome/result (positive, neutral, negative)
  - Energy level before/after
- Firestore schema: `users/{uid}/patterns/{patternId}`
  - Auto-generate pattern IDs with timestamps
  - Include context: tool ID, activity type, metadata
- Local pattern analysis:
  - Hook: `usePatternAnalysis(hours?: number)` - analyze last N hours
  - Calculate pattern frequency, success rate, energy impact
  - Return top patterns and trending patterns
- Pattern validation:
  - Ensure data quality before storing
  - Dedup similar patterns
  - TTL: Keep 90 days of pattern data

**Key Files (to create/modify):**
- `services/patternLearning.ts` (NEW - core pattern logic)
- `hooks/usePatternAnalysis.ts` (NEW - React hook for pattern queries)
- `types/index.ts` (add Pattern, PatternAnalysis types)
- `services/firestore.ts` (add pattern storage methods)
- `scripts/ml-pattern-validate.js` (NEW - validation script)

**Dependencies:**
- Firestore (Phase 5.5)
- Mood/Energy store (existing)
- Analytics events (Phase 5.5)

---

### 5. **Predictive Energy Level Detection**
**Purpose:** Use historical data and ML patterns to forecast future energy levels and suggest activities.

**Requirements:**
- Prediction algorithm:
  - Input: Historical mood/energy data (7-30 days), time of day, day of week, patterns
  - Output: Predicted energy level (0-100) for next 2-4 hours with confidence score (%)
  - Use moving average + pattern matching (heuristic ML)
- Predictions:
  - Generate predictions every 4 hours
  - Store in `users/{uid}/predictions/{predictionId}`
  - Include timestamp, predicted level, confidence, reasoning
- Proactive suggestions:
  - When low energy predicted: suggest rest, mindfulness, low-effort tools
  - When high energy predicted: suggest productive tasks, new tools
  - Show prediction in dashboard widget
- API endpoint:
  - Hook: `usePredictedEnergy()` - get current + next 3 predictions
  - Show confidence score as "High", "Medium", "Low"

**Key Files (to create/modify):**
- `services/energyPrediction.ts` (NEW - prediction engine)
- `hooks/usePredictedEnergy.ts` (NEW - prediction hook)
- `components/EnergyForecast.tsx` (NEW - UI widget)
- `types/index.ts` (add Prediction type)
- `services/firestore.ts` (add prediction storage)

**Dependencies:**
- Pattern learning (Feature 4)
- Mood/Energy store (existing)
- Firestore (Phase 5.5)

---

### 6. **Smart Push Notifications**
**Purpose:** Deliver notifications at optimal times based on predicted energy and user preferences.

**Requirements:**
- Notification scheduling:
  - Integrate with energy prediction (Feature 5)
  - Find "best time" in next 24 hours (when energy likely high)
  - Respect quiet hours and user preferences
  - Backoff: Wait if energy low, try again later
- Notification types:
  - Suggestion delivery (best time based on energy)
  - Daily check-in (high energy time)
  - Reminder for incomplete tasks (during high-energy windows)
  - Pattern insights (weekly, at preferred time)
- Analytics:
  - Track notification timing accuracy
  - Log engagement by time sent
  - Measure engagement diff (smart timing vs. random)
- User preferences:
  - Can disable smart scheduling (fallback to random)
  - Can set quiet hours (8pm-8am default)
  - Can specify preferred notification times

**Key Files (to create/modify):**
- `services/smartNotifications.ts` (NEW - scheduling engine)
- `services/notifications.ts` (update to use smart scheduling)
- `components/NotificationPreferences.tsx` (add smart scheduling controls)
- `types/index.ts` (add NotificationSchedule type)
- `store/notifications.ts` (add smart scheduling state)

**Dependencies:**
- Energy prediction (Feature 5)
- Notifications system (Phase 5.5)
- Push notifications (existing Expo setup)

---

### 7. **Weekly Summaries Feature**
**Purpose:** Compile personalized weekly insights and achievements to keep users engaged.

**Requirements:**
- Weekly summary report (every Monday, customizable day):
  - Mood trends (chart: daily avg mood, best/worst days)
  - Energy patterns (which times most productive)
  - Tool usage (top tools, tools tried)
  - Achievements (streaks, milestones, badges)
  - Insights & recommendations (ML-generated based on patterns)
- Generation:
  - Run Sunday 9pm UTC (batch job or client-side)
  - Store in `users/{uid}/summaries/{weekId}`
  - Include week date range, metrics, insights
- Delivery:
  - Send push notification Monday 10am
  - Email optional (user preference)
  - In-app notifications hub
- Shareability:
  - "Share summary" button → generates shareable link
  - Link shows anonymized summary (no personal data)
  - Export to PDF option

**Key Files (to create/modify):**
- `services/weeklySummary.ts` (NEW - summary generation)
- `components/WeeklySummaryCard.tsx` (NEW - display component)
- `app/(tabs)/home/summaries.tsx` (NEW - summaries history)
- `scripts/generate-weekly-summaries.mjs` (NEW - scheduled job)
- `types/index.ts` (add WeeklySummary, SummaryMetrics types)

**Dependencies:**
- Pattern learning (Feature 4)
- Analytics system (Phase 5.5)
- Firestore (Phase 5.5)
- Notifications (Feature 6)

---

### 8. **ML Model Versioning & Retraining Foundation**
**Purpose:** Support multiple ML model versions and enable model retraining with feedback.

**Requirements:**
- Model versioning:
  - Track active model versions (v1.0, v1.1, etc.)
  - Store model config in Firestore (weights, thresholds, feature sets)
  - Support A/B testing: 80% users on v1.0, 20% on v1.1
- Feedback integration:
  - Collect feedback (Feature 2) and pattern correctness
  - Aggregate feedback weekly for analysis
  - Measure model accuracy (prediction vs. actual)
- Retraining pipeline (MVP):
  - Script to analyze feedback and calculate new thresholds
  - Manual process initially (no auto-retraining)
  - Document process for future automation
- Monitoring:
  - Track model performance metrics
  - Alert if accuracy drops below threshold
  - Log all prediction errors for analysis

**Key Files (to create/modify):**
- `services/mlModels.ts` (NEW - model management)
- `scripts/ml-feedback-analysis.mjs` (NEW - retraining analysis)
- `docs/ML_MODELS.md` (NEW - documentation)
- `types/index.ts` (add MLModel, ModelVersion types)

**Dependencies:**
- Pattern learning (Feature 4)
- Suggestion feedback (Feature 2)
- Firestore (Phase 5.5)

---

## Integration Checklist

- [ ] All Phase 5.5 components imported/accessible
- [ ] Firestore rules updated for new collections (patterns, predictions, summaries, feedback)
- [ ] Auth context maintains profile state
- [ ] Analytics events registered for all Phase 6 actions
- [ ] i18n strings added for new UI (profile editor, feedback, widgets)
- [ ] Accessibility audit passed for new components
- [ ] TypeScript strict mode: 0 errors
- [ ] ESLint: max-warnings=0
- [ ] Tests: 300+ passing
- [ ] Bundle size: < 3.0MB hard cap

---

## Development Workflow

1. **Setup:** Create Phase 6 branch (if not already working on main)
2. **Iterate:** Implement features 1-8 in order, test each
3. **Validation:** Run full pre-push checks after each feature group
4. **Deployment:** Final commit and push when all features complete

---

## Success Criteria

- ✅ 8 features fully implemented and tested
- ✅ All pre-push validations passing
- ✅ 306+ tests passing (no regressions from Phase 5.5)
- ✅ Firestore rules updated and deployed
- ✅ i18n coverage for all UI strings
- ✅ Production deployment successful
- ✅ Analytics events properly logged

---

## Next Steps

Ready to start with **Feature 1: Profile Editing**?

Command to begin:
```bash
npm start  # or expo start
```

Let's build Phase 6! 🚀
