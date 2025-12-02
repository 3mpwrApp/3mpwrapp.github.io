# Documentation Consolidation Plan
**Date:** December 2, 2025  
**Status:** In Progress

---

## 📋 Overview

The `/docs` folder has grown to 250+ files. This document outlines the plan to consolidate them into manageable categories.

---

## 🎯 Target Structure

```
docs/
├── README.md                           # Index of all documentation
├── MASTER_BACKEND_MANUAL.md           # ✅ Created - All technical/admin/legal/financial
├── DEMO_PRESENTATION_WALKTHROUGH.md   # ✅ Created - Presenter's demo guide
├── user-guide.md                       # Keep - User-facing documentation
├── quick-tour.md                       # Keep - Quick intro for new users
├── CONTRIBUTING.md                     # Keep - Contributor guidelines
├── CHANGELOG.md                        # Keep - Version history
├── ROADMAP.md                          # Keep - Feature roadmap
│
├── legal/                              # Keep - Legal documents
│   ├── MISSION_STATEMENT.md
│   ├── IP_ASSIGNMENT_AGREEMENT.md
│   └── (Terms & Privacy in release-prep)
│
├── beta/                               # Keep - Beta testing materials
│   └── (existing files)
│
├── release-prep/                       # Keep - Store listing materials
│   └── (existing files)
│
├── store-listing/                      # Keep - App store assets
│   └── (existing files)
│
├── website/                            # Keep - Website documentation
│   └── (existing files)
│
└── archive/                            # Move old/completed docs here
    ├── implementation/                 # Completed implementation docs
    ├── fixes/                          # Bug fix documentation
    ├── sessions/                       # Session summaries
    ├── phases/                         # Phase completion docs
    ├── setup/                          # One-time setup guides
    └── legacy/                         # Old documentation
```

---

## 📂 Files to Archive

### Implementation Completed (→ archive/implementation/)
- ACTION_PLAN.md
- ACTION_SUMMARY_NOV9.md
- IMPLEMENTATION_*.md (all)
- ENHANCEMENT_*.md (all)
- FEATURE_*.md (all)
- STANDOUT_FEATURES_*.md

### Bug Fixes Completed (→ archive/fixes/)
- *_FIX*.md (all)
- CRITICAL_*.md (all)
- CAMPAIGNS_CRASH_*.md
- GAP_PROPERTY_*.md
- DEPRECATION_*.md

### Session Summaries (→ archive/sessions/)
- SESSION_SUMMARY_*.md (all)
- TASKS_COMPLETE_*.md
- WORK_COMPLETION_*.md

### Phase Documents (→ archive/phases/)
- PHASE*.md (all)
- P1_*.md, P2_*.md, etc.

### Setup Completed (→ archive/setup/)
- ANDROID_EMULATOR_SETUP.md
- FIREBASE_*_SETUP.md (all)
- GOOGLE_OAUTH_*.md (all)
- EXPO_GOOGLE_SIGNIN_SETUP.md
- PUSH_NOTIFICATIONS_SETUP.md
- CALENDAR_*_SETUP.md

### Legacy/Superseded (→ archive/legacy/)
- Duplicate documents
- Old quick references
- Superseded guides

---

## 📁 Files to Keep in Root

### Primary Documentation
| File | Purpose |
|------|---------|
| README.md | Documentation index |
| MASTER_BACKEND_MANUAL.md | Consolidated backend/ops manual |
| DEMO_PRESENTATION_WALKTHROUGH.md | Demo guide for presentations |
| user-guide.md | Complete user documentation |
| quick-tour.md | 2-page orientation |
| CONTRIBUTING.md | How to contribute |
| CHANGELOG.md | Version history |
| ROADMAP.md | Feature roadmap |

### Reference Guides
| File | Purpose |
|------|---------|
| ADMIN.md | Admin operations (keep for quick reference) |
| SECURITY_ARCHITECTURE.md | Security documentation |
| DATA_GOVERNANCE.md | Data handling policies |
| BYOC_POLICY.md | BYOC mode documentation |
| TRANSLATION_GUIDE.md | i18n instructions |

### Active Development
| File | Purpose |
|------|---------|
| UNFINISHED_WORK.md | Current task tracking |
| UNFINISHED_WORK.json | Machine-readable tasks |

---

## 🔄 Consolidation Mapping

### Multiple Files → Single Document

**Accessibility Docs → ACCESSIBILITY_GUIDE.md**
- A11Y_NOTES.md
- ACCESSIBILITY_AUDIT_*.md
- ACCESSIBILITY_CHECKLIST.md
- ACCESSIBILITY_WALKTHROUGH.md
- COGNITIVE_ACCESSIBILITY_*.md
- WCAG_*.md (all)

**Events Docs → EVENTS_GUIDE.md**
- EVENTS_*.md (all - ~15 files)
- EVENT_SYNC_*.md (all)
- CALENDAR_*.md (all)

**Campaigns Docs → CAMPAIGNS_GUIDE.md**
- CAMPAIGNS_*.md (all)
- REAL_TIME_CAMPAIGNS_*.md

**Wellness Docs → WELLNESS_GUIDE.md**
- WELLNESS_*.md (all)
- energy-hub-*.md (all)

**Community Docs → COMMUNITY_GUIDE.md**
- COMMUNITY_*.md (all)

**Deployment Docs → DEPLOYMENT_GUIDE.md**
- DEPLOYMENT_*.md (all)
- BUILD_SUMMARY.md
- LAUNCH_*.md (all)
- README_DEPLOYMENT.md

**Testing Docs → TESTING_GUIDE.md**
- TESTING_*.md (all)
- QUICK_TEST_GUIDE.md
- test-*.md (all)

---

## ⚡ Quick Consolidation Commands

```powershell
# Create archive directories
New-Item -ItemType Directory -Path "docs/archive/implementation" -Force
New-Item -ItemType Directory -Path "docs/archive/fixes" -Force
New-Item -ItemType Directory -Path "docs/archive/sessions" -Force
New-Item -ItemType Directory -Path "docs/archive/phases" -Force
New-Item -ItemType Directory -Path "docs/archive/setup" -Force
New-Item -ItemType Directory -Path "docs/archive/legacy" -Force

# Move session summaries
Move-Item -Path "docs/SESSION_SUMMARY_*.md" -Destination "docs/archive/sessions/"

# Move phase docs
Move-Item -Path "docs/PHASE*.md" -Destination "docs/archive/phases/"

# Move fix docs
Get-ChildItem -Path "docs" -Filter "*FIX*.md" | Move-Item -Destination "docs/archive/fixes/"

# Move setup docs (manually review list first)
```

---

## ✅ Completed Actions

1. ✅ Created `MASTER_BACKEND_MANUAL.md` - Consolidates:
   - Technical architecture
   - Infrastructure & services
   - Admin operations
   - Security framework
   - Data governance
   - Legal & compliance
   - Financial overview
   - Roadmap

2. ✅ Created `DEMO_PRESENTATION_WALKTHROUGH.md` - Contains:
   - 15-minute demo script
   - 30-minute extended version
   - Feature highlights
   - FAQ responses
   - Presenter tips

---

## 🔜 Next Steps

1. [ ] Review and approve consolidation plan
2. [ ] Run archive commands
3. [ ] Create consolidated topic guides
4. [ ] Update docs/README.md with new structure
5. [ ] Verify all links still work
6. [ ] Delete truly redundant files

---

## 📊 Impact

**Before:** 250+ files in docs/  
**After:** ~50 active files + organized archive

**Benefits:**
- Faster navigation
- Less confusion for contributors
- Single source of truth per topic
- Historical docs preserved in archive
