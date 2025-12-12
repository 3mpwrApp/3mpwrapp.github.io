# Power Tools Architecture

## Overview

This document outlines the consolidation of 120+ individual feature screens into **12 unified Power Tools** (4 per main tab). Each Power Tool is a tabbed interface that combines related features, reducing navigation complexity while maintaining full functionality.

## Philosophy

**Before:** 60+ screens in Wellness, 27 screens in Advocacy, 35+ screens in Resources
**After:** 4 Power Tools per tab = 12 total entry points

Each Power Tool:
- Has **3-5 tabs** internally for related sub-features
- Maintains **all existing functionality** (no feature removal)
- Uses **progressive disclosure** (Simple → Standard → Power User complexity)
- Is **accessible-first** with proper screen reader support
- Supports **offline functionality** where applicable

---

## 🧘 Wellness Tab → 4 Power Tools

### 1. **🔋 Energy Command Center**
*Merges: 15 energy/tracking features*

| Internal Tab | Features Merged |
|-------------|-----------------|
| **Dashboard** | Energy Hub, Spoon Economist, Energy Coins, Energy-Aware UI |
| **Mood** | Mood Tracker (from Health Tracker), Daily Planner |
| **Sleep** | Sleep Energy Tracker, Sleep Reframe, Circadian DJ |
| **Pacing** | Pacing Partner, Work Balance AI, Micro-Movement |
| **Forecast** | Pain Forecast, Symptom Symphony |

**Complexity:**
- Simple: Dashboard + basic mood logging
- Standard: + Pacing, Sleep
- Power: + Forecast, Coins, all advanced features

---

### 2. **🧠 Mental Wellness Toolkit**
*Merges: 18 mental health features*

| Internal Tab | Features Merged |
|-------------|-----------------|
| **Quick Relief** | Distress Tolerance, Grounding (AI Grounding), Emotional First Aid |
| **CBT** | CBT Coach, CBT Mini Games, Belief Meter |
| **DBT** | DBT Skills, Opposite Action, Radical Acceptance, Distress Tolerance |
| **Meditation** | Adaptive Meditation, Ambience, AI Companion |
| **Reflect** | Reflections Calendar, Dreams, Acceptance & Function |

**Complexity:**
- Simple: Quick Relief only
- Standard: + CBT, Meditation basics
- Power: + DBT, Dreams, full toolkit

---

### 3. **💪 Movement & Rehab Hub**
*Merges: 10 physical wellness features*

| Internal Tab | Features Merged |
|-------------|-----------------|
| **Exercise** | Exercise Hub, Exercise Favorites |
| **Rehab** | Movement Rehab Hub, Rehab Games |
| **Adaptive** | Micro-Movement, Functional Capacity |
| **Recovery** | Grief Support, Resilience |

**Complexity:**
- Simple: Basic exercises
- Standard: + Rehab, Adaptive
- Power: + Games, Capacity Wizard

---

### 4. **📊 Health Tracker Pro**
*Merges: 12 tracking/monitoring features*

| Internal Tab | Features Merged |
|-------------|-----------------|
| **Symptoms** | Symptom Tracker, Chronic Tracker, Trigger Detector |
| **Body** | Health Tracker, Cognitive Scanner |
| **Environment** | Environmental Adaptation, Sensory Overload |
| **Nutrition** | Nutrition Guides, Harm Reduction |
| **Self-Care** | Self-Care Library |

**Complexity:**
- Simple: Basic symptom log
- Standard: + Body, Environment
- Power: + Nutrition, full library

---

## ⚖️ Advocacy Tab → 4 Power Tools

### 1. **🤖 AI Advocacy Suite**
*Merges: 8 AI-powered features*

| Internal Tab | Features Merged |
|-------------|-----------------|
| **Translator** | AI Advocate Translator |
| **Interpreter** | AI Case Interpreter |
| **Navigator** | AI Gov Navigator |
| **Assistant** | AI Assistant, Ask feature |
| **Command** | AI Command Center (existing hub) |

**Complexity:**
- Simple: Translator only
- Standard: + Interpreter, Navigator
- Power: + All AI tools

---

### 2. **📁 Evidence Command Center**
*Merges: 6 documentation features*

| Internal Tab | Features Merged |
|-------------|-----------------|
| **Locker** | Evidence Manager, Evidence Vault |
| **Timeline** | Case Timeline |
| **Voice** | Voice Notes |
| **Checklist** | Evidence Checklist |

**Complexity:**
- Simple: Locker only
- Standard: + Timeline, Voice
- Power: + Checklist, advanced features

---

### 3. **⚖️ Legal Action Hub**
*Merges: 10 legal/accountability features*

| Internal Tab | Features Merged |
|-------------|-----------------|
| **Accountability** | Accountability Hub, Accountability Cases, Coach, Network |
| **Legal** | Lawyer Finder, Collective Legal, Legal DNA |
| **Automation** | Legal Automation, Justice as a Service |
| **Policy** | Policy Simple |

**Complexity:**
- Simple: Find a lawyer
- Standard: + Accountability basics
- Power: + Automation, DNA, Collective

---

### 4. **🤝 Ally & Support Network**
*Merges: 4 support/network features*

| Internal Tab | Features Merged |
|-------------|-----------------|
| **Directory** | Support Directory |
| **Allies** | Ally Hub |
| **Self-Coach** | Self-Advocacy Coach |
| **Ratings** | Ratings (provider reviews) |
| **World** | World Map (global advocacy) |

**Complexity:**
- Simple: Directory only
- Standard: + Self-Coach
- Power: + Allies, Ratings, World Map

---

## 📚 Resources Tab → 4 Power Tools

### 1. **📝 Document Factory**
*Merges: 8 letter/document features*

| Internal Tab | Features Merged |
|-------------|-----------------|
| **Letters** | Letter Factory, Letters (templates) |
| **Appeals** | Appeal Coach, Appeal Command Center |
| **Accommodation** | Accommodation Request Builder |
| **Templates** | All template galleries |

**Complexity:**
- Simple: Top 3 letter templates
- Standard: + Appeals, Accommodation
- Power: + All templates, advanced factory

---

### 2. **📅 Case Tracker Pro**
*Merges: 10 tracking/deadline features*

| Internal Tab | Features Merged |
|-------------|-----------------|
| **Deadlines** | Deadlines, Deadlines List |
| **Master Hub** | Master Tracker Hub |
| **Denial** | Denial Decoder |
| **Claims** | Claims Navigator |
| **RTW** | RTW Planner |

**Complexity:**
- Simple: Deadlines only
- Standard: + Master Hub, Denial
- Power: + Claims, RTW, Simulators

---

### 3. **🏥 Health Management Hub**
*Merges: 8 health management features*

| Internal Tab | Features Merged |
|-------------|-----------------|
| **Meds** | Meds Tracker |
| **Doctor** | Doctor Visit Prep |
| **Chronic** | Chronic Tracker |
| **Rehab** | Rehab Tracker |
| **Body** | Body Mechanics Advisor |

**Complexity:**
- Simple: Meds tracker
- Standard: + Doctor prep
- Power: + All trackers, Body advisor

---

### 4. **📖 Knowledge Base**
*Merges: 10 information features*

| Internal Tab | Features Merged |
|-------------|-----------------|
| **Rights** | Rights Checker, Rights Explainer, Rights Benefits Calculator |
| **Tech** | Adaptive Tech Library |
| **Myths** | Myth Busting Hub |
| **Tools** | AI Decision Simplifier, Allyship Playbook |
| **Emergency** | Emergency Wallet Card, Solidarity Toolkit |

**Complexity:**
- Simple: Rights basics
- Standard: + Tech, Decision Simplifier
- Power: + All tools, Simulators

---

## Implementation Strategy

### Phase 1: Component Architecture (This PR)
1. Create `PowerTool` base component with tabbed interface
2. Create individual Power Tool wrappers per tab
3. Update tab indexes to show Power Tools instead of individual screens

### Phase 2: Migration
1. Move existing screen logic into Power Tool tabs
2. Maintain backward-compatible routes (redirects)
3. Update navigation throughout app

### Phase 3: Cleanup
1. Archive original individual screens
2. Update tests
3. Update documentation

---

## Technical Implementation

```tsx
// components/PowerTool.tsx - Base component
interface PowerToolProps {
  title: string;
  icon: string;
  tabs: PowerToolTab[];
  complexityLevel: ComplexityMode;
}

interface PowerToolTab {
  id: string;
  label: string;
  icon: string;
  complexity: 'simple' | 'standard' | 'power_user';
  component: React.ComponentType;
}
```

---

## Benefits

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Entry points | 120+ | 12 | **90% reduction** |
| Navigation depth | 3-4 levels | 2 levels | **50% reduction** |
| Cognitive load | High | Low | **Significant** |
| Discoverability | Poor | Excellent | **Features findable** |
| Accessibility | Good | Excellent | **Unified patterns** |

---

## Complexity Mode Integration

| Mode | Power Tools Visible | Internal Tabs Visible |
|------|--------------------|-----------------------|
| Simple | 4 per tab | 1-2 tabs each |
| Standard | 4 per tab | 2-4 tabs each |
| Power User | 4 per tab | All tabs |

---

## Migration Notes

- All existing routes remain functional via redirects
- Individual screens become internal tabs within Power Tools
- No feature removal - only reorganization
- Analytics updated to track Power Tool usage

---

*Created: December 2025*
*Status: Planning*
