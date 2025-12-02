# Accessibility Walkthrough & Quick Start

Last Updated: 2025-10-14
Status Coverage: Cognitive (core live), Dyslexia (core ready), Motor (planned), Community Safety (planned), Cultural Protection (planned), Indigenous Calendar (planned), Performance Monitoring (planned)

---
## 1. What This Document Provides
A practical, task-focused companion to `ACCESSIBILITY_MASTER_ROADMAP.md` showing:
- What you can use TODAY
- How to enable each feature (step-by-step)
- Recommended configurations by need
- What is coming next and expected timelines
- Feedback channels

---
## 2. Currently Available Features (LIVE NOW)
### 2.1 Cognitive Accessibility Mode (Phase 1.1)
Purpose: Reduce cognitive load, support executive function, prevent task loss.

Enable Steps:
1. Open the app → tap the gear icon (Settings)
2. Go to Cognitive Accessibility
3. Select a Mode:
   - Standard (baseline, minimal interventions)
   - Simplified (max 5 actionable items per view)
   - Minimal (max 3 items, strongest guidance)
4. (Optional) Toggle: Auto-Save Interval, Breadcrumbs, Progress Display
5. Tap Enable (if not already active)

UI Indicators:
- Progress bar at top on multi-step flows
- Breadcrumbs path (e.g., Home › Resources › Letter Wizard)
- Complexity Badge (⚡ Quick / 📋 Medium / 🧪 Complex)
- Auto-save indicator pulses when saving
- "Back to where I was" pill appears after navigation away

Recommended Mode Matrix:
| Need | Recommended | Notes |
|------|-------------|-------|
| ADHD (focus drift) | Simplified | Limits branching and options |
| Autism (predictability) | Simplified | Breadcrumbs + progress reduce uncertainty |
| Memory challenges | Minimal | Aggressive auto-save + resume state |
| Overwhelm/anxiety | Minimal | Fewer decision points |

Power Tips:
- Use Minimal mode when drafting long letters—almost impossible to lose progress.
- Switch to Standard temporarily for bulk browsing, then back to Simplified to continue structured tasks.

Planned Enhancements (Integration Remaining 60%):
- Community thread memory, Wellness feature step bundling, Resource pagination simplification.

### 2.2 Dyslexia Support (Phase 1.2 Core)
Status: Core infrastructure + Settings UI + initial integration COMPLETE (85%). Global adoption & advanced reading aids in progress.

Current Activation:
Use the Settings → Dyslexia screen to configure fonts, spacing, overlays, and presets. Wrap any remaining high-density text blocks with `<DyslexiaText>` during phased migration.

Code Example:
```tsx
import { DyslexiaText } from '../components/DyslexiaText';

export function ArticleParagraph({ children }) {
  return <DyslexiaText variant="body">{children}</DyslexiaText>;
}
```

Available Configuration (programmatic via context):
- Fonts: OpenDyslexic, Lexend, Comic Sans, Arial, System
- LetterSpacing: 0 → 0.2em
- LineHeight: 1.2 → 2.0 multiplier
- Overlays: Cream, Aqua, Rose, Peach, Yellow, Blue, Green, Mint
- Presets: Standard, Recommended, HighContrast, DarkMode

Reading Comfort Recommendations:
| Symptom | Try These Adjustments |
|---------|-----------------------|
| Letter flipping / rotation | OpenDyslexic + 0.1em spacing |
| Word merging | Lexend + 0.15em spacing + 1.6 line height |
| Visual stress / glare | Overlay: Cream or Aqua + DarkMode preset |
| Tracking difficulty | Increase spacing + enable reading ruler (coming) |

Remaining (15%):
- App-wide `<DyslexiaText>` adoption (policy simplifier, AI translator outputs, resource articles)
- Reading ruler + word highlight follow mode
- Overlay runtime container + performance validation
- User testing & fine-tuning letter-spacing defaults
- i18n key additions for new advanced toggles

---
## 3. Near-Term Planned Features (Design Locked)
### 3.1 Motor Accessibility (Phase 1.3)
Features (7): Dwell-click, Sticky Keys, Voice Commands, One-Handed Mode, Increased Touch Targets, Gesture Simplification, Tremor Compensation.

Status: Full plan documented (`PHASE_1.3_MOTOR_DISABILITIES_PLAN.md`), implementation pending.
Focus Order (Initial Sprint): Touch Target scaling → Dwell-click → Sticky Keys → Voice Commands (foundation).

Success Metrics: 60% reduction in accidental taps in testing; 30% productivity gain for tremor users.

### 3.2 Community Safety (Phase 1.4)
Core Modules: Content Warnings, Sentiment Analysis, Safe Word Protocol, Reporting & Moderation Dashboard.
Trust Principles: Non-punitive first alerts, transparent moderation logs, trauma-informed prompts.

### 3.3 Cultural Data Protection (Phase 1.5)
OCAP Pillars: Ownership, Control, Access, Possession enforced via encryption + permission workflows.
Requires: Elder consultation sign-off before implementation.

### 3.4 Indigenous Calendar (Phase 2.1)
Dual Calendar (Gregorian + Traditional), Moon Phases, Ceremonial Reminders.
Dependency: Cultural protection groundwork to avoid protocol breaches.

### 3.5 Performance Monitoring (Phase 1.6)
Metrics: Screen TTI, render spans >16ms, network latency, memory deltas.
Output: In-app dashboard + JSON export for audits.

---
## 4. Feedback & Participation
How to Provide Feedback:
- In-App: Settings → About → Feedback
- Email: accessibility@3mpwr.app
- Community: #accessibility channel (planned)
- Testing Cohorts: Sign-up prompt coming to Settings → Cognitive Accessibility

Priority Handling:
1. Data safety or cultural protocol issues
2. Blocking accessibility regression
3. Configuration not persisting
4. Cosmetic visual refinements

---
## 5. Troubleshooting Quick Reference
| Issue | Possible Cause | Resolution |
|-------|----------------|-----------|
| Cognitive mode not showing progress bar | Screen not registered as multi-step | Confirm component wrapped with ProgressProvider |
| Auto-save not triggering | Mode set to Standard | Switch to Simplified/Minimal or lower interval |
| Dyslexia font not applying | Component not using DyslexiaText | Replace `<Text>` with `<DyslexiaText>` |
| Overlay missing | Overlay not yet globally injected | Pending settings screen rollout |
| Large spacing looks uneven | Mixed manual styles + context styles | Consolidate styles; avoid fixed lineHeight with multiplier |

---
## 6. Roadmap Snapshot (At a Glance)
| Phase | State | % | ETA | Notes |
|-------|-------|----|-----|-------|
| 1.1 Cognitive | Core live | 40% integration | Ongoing | Rolling screen adoption |
| 1.2 Dyslexia | Core+UI live | 85% | +10 days | Global wrap + ruler/overlay |
| 1.3 Motor | Planned | 0% | +6 weeks start | Start after dyslexia UI |
| 1.4 Safety | Planned | 0% | +10 weeks | Parallel with motor mid-phase |
| 1.5 Cultural | Planned | 0% | +14 weeks | Requires consultation |
| 2.1 Calendar | Planned | 0% | +16 weeks | Depends on 1.5 groundwork |
| 1.6 Performance | Planned | 0% | +12 weeks | Can parallel earlier if resourced |

---
## 7. Developer Integration Checklist
### Cognitive Components
- [ ] Wrap complex multi-step flows in `<SimplifiedView>`
- [ ] Add `<ComplexityBadge>` with estimated minutes & steps
- [ ] Add `<Breadcrumbs />` for nested navigations
- [ ] Invoke `useAutoSave` for form states > 5 fields
- [ ] Provide `onRestoreLastLocation` where navigation memory is beneficial

### Dyslexia Components
- [ ] Replace high-density `<Text>` usage with `<DyslexiaText>`
- [ ] Avoid inline letterSpacing when context provides it
- [ ] Test high-contrast + overlay combinations for legibility
- [ ] Prepare font preloading (OpenDyslexic, Lexend)

### Future Hooks Prep
- [ ] Centralize Pressable usage for touch target scaling
- [ ] Abstract gesture handlers for future simplification
- [ ] Tag any time-sensitive community content for future warnings

---
## 8. Measuring Success
KPIs (Initial Targets):
- 25% users enable a cognitive mode within 60 days
- 15% adopt at least one dyslexia preference
- 8% motor feature adoption post-release
- 50% of safety-flagged content receives mod review < 24h
- 40% reduction in user-reported “lost progress” events

Instrumentation Plan (Planned):
- Non-identifying event counters (local aggregate, optional opt-in sync)
- On-device only; no personal text payload collection

---
## 9. Change Log (Accessibility Scope)
- 2025-10-13: Added master roadmap + remaining phases summary
- 2025-10-14: Created dedicated Accessibility Walkthrough (this file)

---
## 10. Related Documents
- `ACCESSIBILITY_MASTER_ROADMAP.md`
- `PHASE_1.1_INTEGRATION_PROGRESS.md`
- `PHASE_1.2_DYSLEXIA_SUMMARY.md`
- `PHASE_1.3_MOTOR_DISABILITIES_PLAN.md`
- `REMAINING_PHASES_SUMMARY.md`

---
**Prepared By:** 3mpwr Accessibility Engineering

Feedback welcome. This document will iterate as new phases go live.
