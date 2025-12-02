# 3mpwr App - Recommended Folder Structure

## Overview
This document defines the canonical folder and file structure for the 3mpwr app. This structure ensures consistency, maintainability, and scalability.

## Core Principles
1. **Separation of Concerns**: Each folder has a single, clear responsibility
2. **Naming Conventions**: 
   - Components/Screens: `PascalCase.tsx`
   - Hooks: `useCamelCase.ts`
   - Utils/Helpers: `camelCase.ts`
   - Constants: `SCREAMING_SNAKE_CASE.ts`
   - Types: `PascalCase.ts` or `types.ts`
3. **Modularity**: Features are self-contained where possible
4. **Scalability**: Structure supports growth without reorganization

---

## Folder Structure

```
empowrapp-new/
│
├── app/                          # Expo Router file-based routing (KEEP AS-IS)
│   ├── (auth)/                   # Auth-related screens
│   ├── (tabs)/                   # Main tab navigation screens
│   ├── (onboarding)/             # Onboarding flow screens
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry point
│
├── components/                   # Reusable UI components (PascalCase)
│   ├── A11yPressable.tsx         # Accessibility-enhanced button
│   ├── ThemedHeader.tsx          # App header component
│   ├── ThemedFooter.tsx          # App footer component
│   ├── ErrorBoundary.tsx         # Error boundary wrapper
│   ├── badges/                   # Component sub-modules (grouped by feature)
│   │   └── UserBadge.tsx
│   └── ...
│
├── hooks/                        # Custom React hooks (useCamelCase)
│   ├── useA11y.ts                # Accessibility hook
│   ├── useAuth.ts                # Authentication hook
│   ├── useWhatsNewBadge.ts       # Badge logic hook
│   └── ...
│
├── context/                      # React Context providers
│   ├── AuthContext.tsx           # Authentication context
│   ├── DyslexiaContext.tsx       # Dyslexia support context
│   ├── CognitiveAccessibilityContext.tsx
│   └── ...
│
├── store/                        # Global state management (Zustand/custom)
│   ├── auth.tsx                  # Auth store
│   ├── settings.tsx              # Settings store
│   ├── notifications.tsx         # Notifications store
│   └── ...
│
├── services/                     # Business logic & API calls (camelCase)
│   ├── notifications.ts          # Notification service
│   ├── telemetry.ts              # Analytics/Sentry
│   ├── disabilityWizard.ts       # Disability wizard logic
│   ├── security/                 # Security module
│   │   ├── index.ts
│   │   └── encryption.ts
│   └── ...
│
├── utils/                        # Helper functions (camelCase)
│   ├── logger.ts                 # Logging utility
│   ├── announce.ts               # Accessibility announcements
│   ├── toast.ts                  # Toast notifications
│   └── ...
│
├── constants/                    # App-wide constants (SCREAMING_SNAKE_CASE)
│   ├── a11y.ts                   # Accessibility constants
│   ├── Colors.ts                 # Color definitions (legacy)
│   └── ...
│
├── theme/                        # Theme/styling system
│   ├── colors.ts                 # Color palette
│   ├── typography.ts             # Typography scales
│   └── usePalette.ts             # Theme hooks
│
├── types/                        # TypeScript type definitions
│   ├── phase2.ts                 # Phase 2 types
│   ├── index.ts                  # Exported types
│   └── ...
│
├── i18n/                         # Internationalization
│   ├── index.tsx                 # i18n setup
│   └── ...
│
├── locales/                      # Translation files
│   ├── en/
│   │   └── common.json
│   ├── es/
│   └── fr/
│
├── data/                         # Static/mock data
│   ├── whatsnew.ts               # What's new content
│   ├── jurisdictions.ts          # Jurisdiction data
│   └── ...
│
├── assets/                       # Static assets
│   ├── images/                   # Images
│   │   ├── icon.png
│   │   └── splash.png
│   ├── fonts/                    # Custom fonts
│   └── ...
│
├── firebase/                     # Firebase configuration
│   ├── config.ts                 # Firebase setup
│   └── firestore.rules           # Firestore rules
│
├── scripts/                      # Build/dev scripts (kebab-case.js/mjs)
│   ├── validate-structure.mjs    # Structure validation
│   ├── check-analytics-imports.mjs
│   └── ...
│
├── __tests__/                    # Test files (mirror src structure)
│   ├── home.analytics.test.tsx
│   └── ...
│
├── __mocks__/                    # Jest mocks
│
├── docs/                         # Documentation
│   ├── RECOMMENDED_STRUCTURE.md  # This file
│   ├── API.md
│   └── ...
│
├── .github/                      # GitHub config
│   ├── workflows/                # CI/CD workflows
│   │   └── validate-structure.yml
│   └── copilot-instructions.md
│
├── .husky/                       # Git hooks
│   ├── pre-commit
│   └── pre-push
│
├── config/                       # DEPRECATED - Use top-level config files
└── security/                     # DEPRECATED - Moved to services/security/

```

---

## Naming Conventions

### Files
- **Components**: `PascalCase.tsx` (e.g., `ThemedHeader.tsx`)
- **Screens**: `PascalCase.tsx` (e.g., `LoginScreen.tsx`)
- **Hooks**: `useCamelCase.ts` (e.g., `useAuth.ts`)
- **Utils**: `camelCase.ts` (e.g., `logger.ts`)
- **Services**: `camelCase.ts` (e.g., `notifications.ts`)
- **Constants**: `SCREAMING_SNAKE_CASE.ts` or `PascalCase.ts`
- **Types**: `PascalCase.ts` or `types.ts`
- **Scripts**: `kebab-case.js/mjs` (e.g., `validate-structure.mjs`)
- **Tests**: `*.test.tsx` or `*.spec.tsx`

### Folders
- **Features**: `camelCase/` or `kebab-case/`
- **Component Groups**: `camelCase/`
- **Route Groups**: `(groupName)/` (Expo Router convention)

---

## Anti-Patterns to Avoid

### ❌ Don't:
1. Mix concerns (e.g., components in services/)
2. Deep nesting (max 3-4 levels)
3. Generic names (e.g., `helpers/`, `misc/`)
4. Duplicate functionality across folders
5. Store configuration in multiple places
6. Put business logic in components
7. Mix PascalCase and camelCase inconsistently

### ✅ Do:
1. Group related files by feature
2. Keep components pure and reusable
3. Extract business logic to services
4. Use clear, descriptive names
5. Follow established conventions
6. Document deviations in README
7. Keep flat structures where possible

---

## Migration Guide

### Files to Move/Rename:
```
# Move deprecated security folder
security/ → services/security/

# Move config files to root or remove if unused
config/ → (evaluate and relocate)

# Consolidate documentation
*.md (root) → docs/ (except README, LICENSE)

# Clean up temporary files
temp-fix.txt → DELETE
missing-keys.txt → DELETE or docs/
tsc_*.txt → .gitignore (build artifacts)
```

### Cleanup Recommendations:
1. **Documentation**: Move all phase reports to `docs/archive/`
2. **Build Artifacts**: Add to `.gitignore`: `tsc_*.txt`, `i18n-*.csv`
3. **Deprecated**: Remove or archive `config/` and `security/` if migrated
4. **Tests**: Ensure `__tests__/` mirrors `app/` structure

---

## Validation

Use the provided `scripts/validate-structure.mjs` to check compliance:

```bash
npm run validate:structure
```

This will:
- ✅ Check naming conventions
- ✅ Detect misplaced files
- ✅ Suggest corrections
- ✅ Generate structure report

---

## CI/CD Integration

The structure is validated automatically on:
- **Pre-commit**: Via Husky hook
- **Pre-push**: Via Husky hook
- **CI**: Via GitHub Actions on PR/push

---

## Questions?

See `docs/DOCUMENTATION_INDEX.md` for more information or contact the development team.
